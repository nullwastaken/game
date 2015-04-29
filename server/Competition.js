//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Quest = require2('Quest'),Achievement = require2('Achievement'), Actor = require2('Actor'), Material = require2('Material'), OfflineAction = require2('OfflineAction'), Highscore = require2('Highscore'), Main = require2('Main');

var db;

var CURRENT = null;

var Competition = exports.Competition = {};
Competition.create = function(highscore,end){	//rename highscore to category?
	var high = Highscore.get(highscore);
	var quest = Highscore.getQuest(highscore);
	if(!high || !quest) return ERROR(3,'invalid quest or highscore',quest,highscore);
	
	var a = {
		id:Math.randomId(),
		startTime:Date.now(),
		endTime:end || 0,
		name:high.name,
		description:high.description,
		rewardGiven:false,
		score:[],
		order:high.order,
		highscore:highscore || '',
		quest:quest,
		questName:Quest.get(quest).name,
	};
	CURRENT = a;
	return a;
}

Competition.Score = function(username,value,lvl){	//BAD saving lvl here is bad...
	return {
		username:username || '',
		value:value || 0,
		lvl: lvl || 0,
	};
}

Competition.Reward = function(item,exp){
	return {
		item:item || {},
		exp:exp || 0,	
	}
}

Competition.Reward.randomlyGenerate = function(lvl,place){
	var item = {};
	if(place === 0){
		item[Material.getRandom(lvl)] = 20;
		item['competition-1'] = 1;
		return Competition.Reward(item,2000);
	}
	if(place === 1){
		item[Material.getRandom(lvl)] = 16;
		item['competition-any'] = 1;
		return Competition.Reward(item,1600);
	}
	if(place === 2){
		item[Material.getRandom(lvl)] = 12;
		item['competition-any'] = 1;
		return Competition.Reward(item,1200);
	}
	if(place === 3){
		item[Material.getRandom(lvl)] = 8;
		item['competition-any'] = 1;
		return Competition.Reward(item,800);
	}
	if(place === 4){
		item[Material.getRandom(lvl)] = 4;
		item['competition-any'] = 1;
		return Competition.Reward(item,400);
	}
	ERROR(3,'invalid place');
	return Competition.Reward(item,0);
}

Competition.init = function(dbLink,app){
	db = dbLink;
	db.competition.find({rewardGiven:false},{_id:0},function(err,res){
		if(res[0])
			CURRENT = res[0];
		else {
			Competition.generateRandom();
		}
		var comp = Competition.getCurrent();
		var timeDiff = comp.endTime - Date.now();
		setTimeout(function(){
			Competition.end(comp);
		},timeDiff);
	}).sort({endTime:-1}).limit(1);
	
}

Competition.generateRandom = function(){
	Competition.create(Competition.getNext(),Date.now()+CST.WEEK);
}

Competition.save = function(){
	var comp = Competition.getCurrent();
	db.competition.upsert({id:comp.id},comp);
}

Competition.onQuestComplete = function(key,highscoreInfo){
	var comp = Competition.getCurrent();
	if(!comp) return;
	
	for(var j in highscoreInfo){
		if(j !== comp.highscore)
			continue;
		var username = Main.get(key).username;
		var lvl = Actor.getLevel(Actor.get(key));
		
		var alreadyThere = false;
		for(var i = 0 ; i < comp.score.length; i++){
			if(comp.score[i].username === username){
				alreadyThere = true;
				if((comp.order === 'ascending' && highscoreInfo[j].score > comp.score[i].value)
					|| (comp.order === 'descending' && highscoreInfo[j].score < comp.score[i].value)
				){
					comp.score[i].value = highscoreInfo[j].score;
					Competition.updateRank(comp);
					Competition.save();
				}		
			}
		}
		if(alreadyThere === false){
			comp.score.push(Competition.Score(username,highscoreInfo[j].score,lvl));
			Competition.updateRank(comp);
			Competition.save();
		}
		
		Achievement.onCompetitionEntry(Main.get(key),Competition.getRankViaUsername(comp,username));
	}	
}

Competition.removePlayer = function(comp,username){
	for(var i = 0 ; i < comp.score.length; i++){
		if(comp.score[i].username === username){
			comp.score.splice(i,1);
			INFO('Player removed from competition');
			Competition.save();
			return;
		}
	}
	INFO('No player with username ' + username + ' found in competition.');
};

Competition.updateRank = function(comp){
	if(comp.order === 'ascending')
		comp.score.sort(function(a,b){
			return a.value-b.value;
		});
	else 
		comp.score.sort(function(a,b){
			return b.value-a.value;
		});
}

Competition.getRankViaUsername = function(comp,username){
	for(var i = 0 ; i < comp.score.length; i++)
		if(comp.score[i].username === username)
			return i;
	return null;
}

Competition.getCurrent = function(){
	return CURRENT;
}

Competition.getNext = function(){
	var list = [
		'QlureKill-timeEasy',
		'QbaseDefence-remainingpteasy',
		'Qbtt000-speedrun',
		'Qminesweeper-speedrun',
		'QtowerDefence-remainingpteasy',
	];
	return list.$random();
}

Competition.end = function(comp){
	//give reward
	for(var i = 0; i < 5; i++){
		if(comp.score[i]){
			var reward = Competition.Reward.randomlyGenerate(comp.score[i].lvl,i);
		
			OfflineAction.create(comp.score[i].username,'message',OfflineAction.Data.message(
				'Congratulations! You finished #' + (i+1) + ' in the competition! You win ' + reward.exp + ' exp and a bunch of items.'
			));
			OfflineAction.create(comp.score[i].username,'questPopup',OfflineAction.Data.message(
				'Congratulations! You finished #' + (i+1) + ' in the competition! You win ' + reward.exp + ' exp and a bunch of items.'
			));
			OfflineAction.create(comp.score[i].username,'addExp',OfflineAction.Data.addExp(reward.exp,false));
			OfflineAction.create(comp.score[i].username,'addItem',OfflineAction.Data.addItem(reward.item));
		}
	}
	db.competition.update({id:comp.id},{$set:{rewardGiven:true}});
	Competition.generateRandom();
}

Competition.getHomePageContent = function(scoreMaxLength){
	scoreMaxLength = scoreMaxLength || 5;
	
	var cur = Competition.getCurrent();
	var temp = {};
	for(var i in cur){	//only want to compress score
		if(i === 'score')
			temp[i] = cur[i].slice(0,scoreMaxLength);
		else
			temp[i] = cur[i];
	}
	return temp;
}



