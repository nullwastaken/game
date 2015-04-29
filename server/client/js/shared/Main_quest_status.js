//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require2('Actor'), Metrics = require2('Metrics'), Achievement = require2('Achievement'), Competition = require2('Competition'), Party = require2('Party'), Debug = require2('Debug'), Main = require2('Main'), Highscore = require2('Highscore'), Message = require2('Message'), Quest = require2('Quest');
var Dialog = require4('Dialog'), ItemList = require4('ItemList'), QueryDb = require4('QueryDb');
var Main = require3('Main');


var MAX_COMPLETED_TODAY = 5; //BAD, duplicate in Quest_status

//## STARTED ##################

Main.startQuest = function(main,qid){	//on click
	var mq = main.quest[qid];
	if(!mq) 
		return Main.addMessage(main,'Wrong Input.');
	
	if(main.questActive) 
		return Message.addPopup(main.id,'You can only have 1 active quest at once. Finish or abandon the quest "' + Quest.get(main.questActive).name + '" before starting a new one.');
	
	var q = Quest.get(qid);
	
	if(Party.getSize(Main.getParty(main)) > q.maxParty)
		return Message.addPopup(main.id,'Maximum party size: ' + q.maxParty + '.');
	
	if(!mq.canStart)
		return Message.addPopup(main.id,q.requirement.canStartText);
	
	Party.forEach(Main.getParty(main),function(key2){
		var main2 = Main.get(key2);
		main2.quest[qid]._challenge = Tk.deepClone(mq._challenge);	//copy challenge of leader
		Main.setFlag(main2,'quest',qid);
		Quest.addQuestVar(q,main2);
		Main.startQuest.action(main2,qid);
	});
	Quest.onStart(q,main);
	
	return true;
}
Main.startQuest.action = function(main,qid){
	var mq = main.quest[qid];
	mq._started = 1;
	mq._startTime = Date.now();
	main.questActive = qid;
	
	Actor.removeAllQuestMarker(Main.getAct(main));
	Party.setQuest(Main.getParty(main),qid);
	Debug.onStartQuest(main.id,qid);
	Actor.enablePvp(Main.getAct(main),false);
	Actor.fullyRegen(Main.getAct(main));
	Main.closeDialogAll(main);
	Main.setFlag(main,'questActive');
	Main.updateQuestHint(main);
}
//## COMPLETE ##################

Main.completeQuest = function(main){
	var qid = main.questActive;
	if(!qid) return ERROR(3,'no active quest');
	var mq = main.quest[qid];
	var q = Quest.get(qid);
	
	var firstTimeCompleted = mq._complete === 0;
	mq._complete++;
	mq._completeToday++;
	Main.setFlag(main,'quest',qid);
	Main.displayQuestRating(main,qid,false);
		
	q.event._complete(main.id);
	
	var chalSuccess = Quest.getChallengeSuccess(q,main,mq);
	var grantedCP = Main.contribution.onQuestComplete(main,q.name,chalSuccess);
	var dailyTaskSucess = Main.verifyDailyTask(main,q,chalSuccess);
	
	var scoreMod = Quest.getScoreMod(q,main);
	var reward = Quest.getReward(q,chalSuccess,scoreMod,firstTimeCompleted,main.id,mq._completeToday);
	Main.quest.applyReward(main,reward,mq,q);
	
	var highscoreInfo = Highscore.setNewScore(q,main,mq);	//after reward
	Competition.onQuestComplete(main.id,highscoreInfo);
	Main.completeQuest.updateGlobalHighscore(main);
	
	Main.questCompleteDialog(main,Tk.deepClone(mq),q,chalSuccess,dailyTaskSucess,reward,scoreMod,grantedCP,highscoreInfo);
	//Tk.deepClone needed cuz asyn highscore and updateCycle change mq
	
	Main.resetQuest(main);
	Achievement.onQuestComplete(main);
	Main.updateCanStartQuest(main);
	Metrics.onQuestComplete(main.id,q.id,chalSuccess);
	
	if(q.id !== 'Qtutorial' && Math.random() < 1/20)
		Actor.teleport.town(Main.getAct(main));
}
Main.completeQuest.updateGlobalHighscore = function(main){	//cant be triggered normally
	for(var i in Quest.DB){
		var q = Quest.get(i);
		if(!q.globalHighscore)
			continue;
		Highscore.setNewScore(q,main,main.quest[i]);
	}
}

Main.quest.updateQuestDoneToday = function(main){
	for(var i in main.quest){
		main.quest[i]._completeToday = 0;
	}
}


Main.quest.applyReward = function(main,reward,mq){
	Main.addItem(main,reward.item);
	Actor.addExp(Main.getAct(main),reward.exp);
	
	mq._rewardScore += reward.score; 
	
	Main.reputation.updatePt(main);
}

Main.quest.compileBonusVar = function(bonus,includeChallenge){
	var tmp = Quest.RewardInfo(1,1,1);
	for(var i in bonus){
		if(i === 'challenge' && includeChallenge === false) continue;
		for(var j in bonus[i])	// {challenge:{item:1
			tmp[j] *= bonus[i][j];
	}
	return tmp;
}

//## RESET ##################

Main.abandonQuest = function(main){
	if(!main.questActive) return;
	//if(!Party.isLeader(main.id)) return Main.addMessage(main,"Only the leader can abandon a quest.");
	Party.forEach(Main.getParty(main),function(key2){
		Main.abandonQuest.action(Main.get(key2));
	});
}

Main.abandonQuest.action = function(main){
	if(!main.questActive) return;
	var q = Quest.get(main.questActive);
	Quest.onAbandon(q,main);
	Main.resetQuest(main,true);
	Main.addMessage(main,'You failed the quest ' + q.name + '.');
}

Main.resetQuest = function(main,abandon){
	var qid = main.questActive;
	if(!qid) return;
	var q = Quest.get(qid);
	var mq = main.quest[qid];
	
	main.questActive = '';
	Main.setFlag(main,'questActive');
	if(!abandon){
		if(q.zone)
			main.killCount[q.zone] = 0;
		mq._skillPlot = [0,0,0,0,0,0,0,0];
	}
	
	Quest.onReset(q,main);
	Party.setQuest(Main.getParty(main),null);
	Main.updateQuestHint(main,qid);
}

Main.getSimpleQuestBonus = function(main,quest){	//for enemy killed and skilplot
	return Main.quest.compileBonusVar(main.quest[quest]._bonus,false);
}

Main.questCompleteDialog = function(main,mq,q,chalSuccess,dailytaskSuccess,reward,scoreMod,grantedCP,highscoreInfo){
	if(!q.showWindowComplete) return;
	var tmp = {	//window quest complete will be send to client
		quest:q.id,
		scoreModInfo:q.scoreModInfo,
		maxReputationPt:q.reward.reputation.max,
		scoreBase:q.reward.reputation.mod,
		
		chalSuccess:chalSuccess,
		dailytaskSuccess:dailytaskSuccess,
		reward:reward,
		scoreMod:scoreMod,
		grantedCP:grantedCP,
		highscoreScore:{},	//info about score and rank
		highscoreInfo:highscoreInfo, //info about score and if better than b4
		_completeToday:mq._completeToday,
		_complete:mq._complete,
		_rewardScore:mq._rewardScore,
		_challengeDone:mq._challengeDone,
		
	};	
	
	var count = 0;
	var maxcount = 0;
	if(q.highscore.$isEmpty())
		return Main.openDialog(main,'questComplete',tmp);
	
	
	var helper = function(i){
		return function(score){
			tmp.highscoreScore[i] = score;
			if(++count === maxcount){
				if(!Main.get(main.id)) return;	//case player dced
				Main.openDialog(main,'questComplete',tmp);
			}
		}
	}
	for(var i in q.highscore){
		maxcount++;
		Highscore.fetchScore(i,main.username,helper(i));
	}
	
	
}

var _SCORE = '-_score';	//BAD
var getQuestScoreHighscore = function(id){
	return id + _SCORE;
}


Main.quest.init = function(){ //}
	Dialog.create('questComplete','Quest Complete!',Dialog.Size(500,550),Dialog.Refresh(function(html,variable,param){
		var q = QueryDb.get('quest',param.quest,function(){
			Dialog.refresh('questComplete',param);
		});
		if(!q) return false;
		
		if(!param.reward.item.$isEmpty()){
			var item = ItemList.stringify(param.reward.item,function(){
				Dialog.refresh('questComplete',param);
			});
			if(!item) return false;
		}
		
		html.append('<h3 class="u">' + q.name + ' Complete!</h3>');
		
		if(param.dailytaskSuccess) 
			html.append('<h4 class="span">Daily Task Completed!</h4>');
		
		var chalDone = param.chalSuccess && param.chalSuccess.success;

		//Score
		var div = $('<div>');
		div.append($('<span>Reward: </span><br>')
			.css({fontSize:'1.4em'})
		);
		
		var title = param.scoreBase + ' (Base)';
		if(param.scoreMod !== 1)
			title += ' x' + param.scoreMod.r(2) + ' (Performance)';
		if(chalDone)
			title += ' x2 (Challenge)';
		
		div.append($('<span>')
			.html('Score: ' + param.reward.score.r(0) + '<br>' )
			.attr('title',title)
			.css({marginLeft:'20px'})
		);
				
		div.append($('<span>')
			.attr('title',param._completeToday >= MAX_COMPLETED_TODAY ? 'No Exp because completed ' + MAX_COMPLETED_TODAY + '+ times today.' : '')
			.html('Exp: +' + param.reward.exp.r(0) + ' exp<br>' )
			.css({marginLeft:'20px'})
		);
				
		div.append($('<span>')
			.attr('title',param._completeToday >= MAX_COMPLETED_TODAY ? 'No Item because completed ' + MAX_COMPLETED_TODAY + '+ times today.' : '')
			.html('Item: ' + (ItemList.stringify(param.reward.item) || 'None') + '<br>' )
			.css({marginLeft:'20px'})
		);
		
		if(param.grantedCP){
			div.append($('<span>')
				.attr('title','Contribution Points. Use them to unlock cosmetic rewards via the Contribution Window.')
				.html('CP: +1<br>')
				.css({marginLeft:'20px'})
			);
		}
		
		
		var span = Dialog.getCumulativeScoreSpan(main.quest[q.id]);
		div.append(span.css({marginLeft:'20px'}),'<br>');		
		
		html.append(div);
		html.append('<br>');
		
	
		//Highscore
		var contentHighscore = $('<div>');
		var helper = function(i){
			return function(){
				Dialog.open('highscore',i);
			}
		}
		
		var helperNewBest = function(text){
			return $('<strong>').html(text).addClass('shadow').css({marginLeft:'10px',color:'#00DD00'});
		}
		
		
		var array = [];
		var atLeast1NewBest = false;
		for(var i in param.highscoreScore){
			var c = param.highscoreScore[i];
			
			var newBest = false;
			if(i !== getQuestScoreHighscore(q.id)){
				if(param.highscoreInfo[i] && param.highscoreInfo[i].previousBestScore !== param.highscoreInfo[i].score){
					newBest = true;
					atLeast1NewBest = true;
				}
			}
			
			var score = $('<span>')
				.html('Score: ' + (c.value === null ? '---' : c.value));
			
			var end = !newBest ? '' : helperNewBest(CST.STAR);
		
			array.push([
				$('<fakea>')
					.html(QueryDb.getHighscoreName(i))
					.css({color:'black',fontWeight:'bold'})
					.click(helper(i)),
				score,
				'Rank: ' + (c.value === null ? '---' : c.rank),
				end
			]);
		}
		
		html.append($('<div>')
			.append($('<span>Highscore:</span>').css({fontSize:'1.4em'}))
			.append(' ',$('<button>')
				.addClass('myButton skinny')
				.html('Show')
				.click(function(){
					contentHighscore.toggle();
				})
			)
			.append(atLeast1NewBest ? helperNewBest('NEW BEST') : '')
		);
		
		contentHighscore.append(Tk.arrayToTable(array,null,null,null,'8px 2px').css({marginLeft:'5px'}));
		contentHighscore.append('<br>');
		contentHighscore.hide();
		html.append(contentHighscore);
		
		
		
		
	}));
} //{

})(); //{















