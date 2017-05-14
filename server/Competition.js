
"use strict";
var Quest, Achievement, Material, OfflineAction, Highscore, Main;
global.onReady(function(initPack){
	Quest = rootRequire('server','Quest'); Achievement = rootRequire('shared','Achievement'); Material = rootRequire('server','Material'); OfflineAction = rootRequire('server','OfflineAction'); Highscore = rootRequire('server','Highscore'); Main = rootRequire('shared','Main');
	db = initPack.db;
	Competition.init();
},{db:['competition']});
var Competition = exports.Competition = function(extra){
	this.id = Math.randomId();
	this.startTime = Date.now();
	this.endTime =  0;
	this.name = '';
	this.description = '';
	this.rewardGiven = false;
	this.score = [];	//Competition.Score[]
	this.order = CST.HIGHSCORE.descending;
	this.highscore = '';
	this.quest = '';
	this.questName = '';
	Tk.fillExtra(this,extra);
};

var db;

var CURRENT = null;

Competition.create = function(highscore,end){	//rename highscore to category?
	var high = Highscore.get(highscore);
	var quest = Highscore.getQuest(highscore);
	if(!high || !quest) 
		return ERROR(3,'invalid quest or highscore',quest,highscore);
	
	var a = new Competition({
		endTime:end,
		name:high.name,
		description:high.description,
		order:high.order,
		highscore:highscore,
		quest:quest,
		questName:Quest.get(quest).name,
	});
	CURRENT = a;
	return a;
}

Competition.Score = function(username,name,value){
	return {
		username:username || '',
		name:name || '',
		value:value || 0,
	};
}

Competition.Reward = function(item,exp){
	return {
		item:item || {},
		exp:exp || 0,	
	}
}

Competition.Reward.randomlyGenerate = function(place){
	var item = {};
	if(place === 0){
		item[Material.getRandom()] = 20;
		item['competition-1'] = 1;
		return Competition.Reward(item,2000);
	}
	if(place === 1){
		item[Material.getRandom()] = 16;
		item['competition-any'] = 1;
		return Competition.Reward(item,1600);
	}
	if(place === 2){
		item[Material.getRandom()] = 12;
		item['competition-any'] = 1;
		return Competition.Reward(item,1200);
	}
	if(place === 3){
		item[Material.getRandom()] = 8;
		item['competition-any'] = 1;
		return Competition.Reward(item,800);
	}
	if(place === 4){
		item[Material.getRandom()] = 4;
		item['competition-any'] = 1;
		return Competition.Reward(item,400);
	}
	ERROR(3,'invalid place');
	return Competition.Reward(item,0);
}

Competition.init = function(){
  return;
	Competition.getCurrentFromDb(db,function(comp){
		if(comp)
			CURRENT = comp;
		else {
			Competition.generateRandom();
			Competition.save();
		}
		var comp = Competition.getCurrent();
		var timeDiff = comp.endTime - Date.now();
		setTimeout(function(){
			Competition.end(comp);
		},timeDiff);
	});
	
}

Competition.getCurrentFromDb = function(db,cb){
	db.competition.find({rewardGiven:false},{_id:0},function(err,res){
		if(err)
			return null;
		if(res[0])
			res[0] = Competition.uncompressDb(res[0]);
		cb(res[0]);
	}).sort({endTime:-1}).limit(1);
}

Competition.generateRandom = function(){
	Competition.create(Competition.getNext(),Date.now()+CST.WEEK);
}

Competition.save = function(){
	var comp = Competition.getCurrent();
	
	comp = Competition.compressDb(Tk.deepClone(comp));
	
	db.competition.upsert({id:comp.id},comp);
}

Competition.onQuestComplete = function(key,highscoreInfo){
	var comp = Competition.getCurrent();
	if(!comp) return;
	
	var username = Main.get(key).username;
	var name = Main.get(key).name;
	
	if(username === 'rc')
		return;
		
	for(var j in highscoreInfo){
		if(j !== comp.highscore)
			continue;
		
		var alreadyThere = false;
		for(var i = 0 ; i < comp.score.length; i++){
			if(comp.score[i].username === username){
				alreadyThere = true;
				if((comp.order === CST.HIGHSCORE.ascending && highscoreInfo[j].score < comp.score[i].value)
					|| (comp.order === CST.HIGHSCORE.descending && highscoreInfo[j].score > comp.score[i].value)
				){
					comp.score[i].value = highscoreInfo[j].score;
					Competition.updateRank(comp);
					Competition.save();
				}		
			}
		}
		if(alreadyThere === false){
			comp.score.push(Competition.Score(username,name,highscoreInfo[j].score));
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
	if(comp.order === CST.HIGHSCORE.ascending)
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
		'Qbtt000-speedrun',
	];
	return list.$random();
}

Competition.end = function(comp){
	//give reward
	for(var i = 0; i < 5; i++){
		if(comp.score[i]){
			var reward = Competition.Reward.randomlyGenerate(i);
		
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

Competition.onSignIn = function(main,firstSignIn){
	if(firstSignIn)
		return;
	var comp = Competition.getCurrent();
	var str = 'Weekly competition: '
		+ '<fakea class="message" onclick="exports.Dialog.open(\'highscore\',\'competition\');" '
		+ 'title="' + comp.description + '">' + comp.questName + '</fakea>.';
	
	if(comp.score[0])
		str += '<br> &nbsp;=> Currently in first place: ' + comp.score[0].name + '.';
	Main.addMessage(main,str);	
}


Competition.compressDb = function(comp){
	if(!Competition.getDbSchema()(comp))
		ERROR(3,'data not following schema',JSON.stringify(Competition.getDbSchema().errors(comp)),comp);
	return comp;
}

Competition.uncompressDb = function(comp){
	if(!Competition.getDbSchema()(comp))
		ERROR(3,'data not following schema',JSON.stringify(Competition.getDbSchema().errors(comp)),comp);
	return comp;
}

var schema;
Competition.getDbSchema = function(){
	schema = schema || require('js-schema')({
		id:String,
		startTime:Number,
		endTime:Number,
		name:String,
		description:String,
		rewardGiven:Boolean,
		score:Array.of({username:String,name:String,value:Number}),
		order:String,
		highscore:String,
		quest:String,
		questName:String,
		'*':null
	});
	return schema;
}


//no dependencies
Competition.getHomePageContent = function(db){
  return;
	if(Date.now() - LAST_UPDATE > 60000){
		LAST_UPDATE = Date.now();
		Competition.getCurrentFromDb(db,function(comp){
			CONTENT = comp;
		});
	}
	return CONTENT;
}
var CONTENT = {};
var LAST_UPDATE = -1;






