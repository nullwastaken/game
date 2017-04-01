
"use strict";
(function(){ //}
var Actor, Challenge, Metrics, Achievement, Competition, Party, Debug, Main, Highscore, Quest, Dialog, ItemList, QueryDb;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Challenge = rootRequire('server','Challenge'); Metrics = rootRequire('server','Metrics'); Achievement = rootRequire('shared','Achievement'); Competition = rootRequire('server','Competition'); Party = rootRequire('server','Party'); Debug = rootRequire('server','Debug'); Main = rootRequire('shared','Main'); Highscore = rootRequire('server','Highscore'); Quest = rootRequire('server','Quest');
	Dialog = rootRequire('client','Dialog',true); ItemList = rootRequire('shared','ItemList',true); QueryDb = rootRequire('shared','QueryDb',true);

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.questStart,Command.MAIN,[ //{
		Command.Param('string','Quest Id',false),
	],Main.startQuest); //}
	Command.create(CST.COMMAND.questAbandon,Command.MAIN,[ //{
		Command.Param('string','Quest Id',false),
	],Main.abandonQuest.onCommand); //}
});
var Main = rootRequire('shared','Main');


var MAX_COMPLETED_TODAY = 5; //BAD, duplicate in Quest_status
var _SCORE = '-_score';	//BAD
var SCORE_BASE = 50;	//DUPLICATE Dialog_quest
var CHANCE_TELE_TOWN = 1/100;

//## STARTED ##################

Main.startQuest = function(main,qid){	//on click
	var mq = main.quest[qid];
	if(!mq) 
		return Main.addMessage(main,'Wrong Input.');
	
	if(main.questActive){
		return Main.error(main,'You can only have 1 active quest at once. Finish or abandon the quest "' + Quest.get(main.questActive).name + '" before starting a new one.',true);
	}
	var q = Quest.get(qid);
	if(q.disabled)
		return Main.error(main,'This quest is temporarily disabled.');
	
	var size = Party.getSize(Main.getParty(main));
	if(size > q.maxPartySize){
		return Main.error(main,'Maximum party size: ' + q.maxPartySize + '.',true);
	}
	if(mq.challenge){
		var c = Challenge.get(mq.challenge);
		if(size > c.maxPartySize){
			return Main.error(main,'Maximum party size with challenge "' + c.name + '": ' + c.maxPartySize + '.',true);
		}
	}
	
	if(!Main.isAdmin(main.id) && !mq.canStart){
		return Main.error(main,q.requirement.canStartText,true);
	}
	Party.forEach(Main.getParty(main),function(key2){
		var main2 = Main.get(key2);
		main2.quest[qid].challenge = mq.challenge;	//copy challenge of leader
		Main.setChange(main2,'quest,' + qid,main2.quest[qid]);
		Quest.addQuestVar(q,main2);
		Main.startQuest.action(main2,qid);
	});
	Quest.onStart(q,main);
	Main.playSfx(main,'select');
	return true;
}

Main.startQuest.action = function(main,qid){
	var mq = main.quest[qid];
	mq.started = true;
	mq.startTime = Date.now();
	main.questActive = qid;
	
	var act = Main.getAct(main);
	Actor.removeAllQuestMarker(act);
	Party.setQuest(Main.getParty(main),qid);
	Debug.onStartQuest(main.id,qid);
	Actor.removePreset(act,'pvpCommand');
	Actor.fullyRegen(act);
	Main.closeDialogAll(main);
	Main.setChange(main,'questActive',main.questActive);
	Main.updateQuestHint(main);
}

//## COMPLETE ##################

Main.completeQuest = function(main){
	var qid = main.questActive;
	if(!qid) return ERROR(3,'no active quest');
	var mq = main.quest[qid];
	var q = Quest.get(qid);
	
	var firstTimeCompleted = mq.complete === 0;
	mq.complete++;
	mq.completeToday++;
	mq.completeTime = Date.now();
	Main.setChange(main,'quest,' + qid,mq);
	//Main.displayQuestFeedback(main,qid,false);
		
	q.event._complete(main.id);
	
	var chalSuccess = Quest.getChallengeSuccess(q,main,mq);
	var grantedCP = Main.contribution.onQuestComplete(main,q.name,chalSuccess);
	var dailyTaskSucess = Main.verifyDailyTask(main,q,chalSuccess);
	
	var scoreMod = Quest.getScoreMod(q,main);
	var reward = Quest.getReward(q,chalSuccess,scoreMod,firstTimeCompleted,main.id,mq.completeToday);
	Main.quest.applyReward(main,reward,mq,q);
	
	var highscoreInfo = Highscore.setNewScore(q,main,mq);	//after reward
	Competition.onQuestComplete(main.id,highscoreInfo);
	Main.completeQuest.updateGlobalHighscore(main);
	
	Main.questCompleteDialog(main,Tk.deepClone(mq),q,chalSuccess,dailyTaskSucess,reward,scoreMod,grantedCP,highscoreInfo);
	//Tk.deepClone needed cuz asyn highscore and updateCycle change mq
	
	Main.resetQuest(main);
	Achievement.onQuestComplete(main,q.id,Party.getSize(Main.getParty(main)));
	Main.updateCanStartQuest(main);
	Metrics.onQuestComplete(main.id,q.id,chalSuccess);
		
	var act = Main.getAct(main);
	if(q.id !== CST.QTUTORIAL && Math.random() < CHANCE_TELE_TOWN)
		Actor.teleport.town(act);
	
	if(act.combat){
		Actor.addPreset(act,'onQuestReward');
		Actor.setTimeout(act,function(){
			Actor.removePreset(act,'onQuestReward');
			Actor.addPresetUntilMove(act,'onQuestReward',75);	//after teleport
		},25*5);
	}
		
}

Main.completeQuest.updateGlobalHighscore = function(main){	//cant be triggered normally
	for(var i in Quest.DB){
		var q = Quest.get(i);
		if(!q.globalHighscore)
			continue;
		Highscore.setNewScore(q,main,main.quest[i]);
	}
}

Main.quest.resetCompleteToday = function(main){
	for(var i in main.quest){
		main.quest[i].completeToday = 0;
	}
}


Main.quest.applyReward = function(main,reward,mq){
	Main.addItem(main,reward.item);
	var act = Main.getAct(main);
	Actor.addExp(Main.getAct(main),reward.exp);
	
	mq.rewardScore += reward.score; 
	Actor.updateGEM(act);
	Main.reputation.updatePt(main);
}

Main.quest.haveCompletedMaxDaily = function(main,quest){
	return main.quest[quest].completeToday >= MAX_COMPLETED_TODAY;
}

//## RESET ##################

Main.abandonQuest = function(main){
	if(!main.questActive) 
		return;
	//if(!Party.isLeader(main.id)) return Main.addMessage(main,"Only the leader can abandon a quest.");
	Party.forEach(Main.getParty(main),function(key2){
		Main.abandonQuest.action(Main.get(key2));
	});
}

Main.abandonQuest.onCommand = function(main,qid){
	if(qid === CST.QTUTORIAL)
		return Main.addPopup(main,'You can\'t abandon the tutorial.<br>Finish it then you will be able to start other quests.');
	if(main.quest[qid] && Date.now() - main.quest[qid].startTime > CST.MIN)
		Main.displayQuestFeedback(main,qid,true,main.questHint);
			
	Main.abandonQuest(main);
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
	Main.setChange(main,'questActive',main.questActive);
	if(!abandon){
		if(q.zone)
			Main.KillCount.reset(main,q.zone,mq.completeToday);
		mq.skillPlot = false;
	}
	
	Quest.onReset(q,main);
	Party.setQuest(Main.getParty(main),null);
	Main.updateQuestHint(main,qid);
}



Main.questCompleteDialog = function(main,mq,q,chalSuccess,dailytaskSuccess,reward,scoreMod,grantedCP,highscoreInfo){
	if(!q.showWindowComplete) return;
	
	Quest.canRate(main.username,q.id,function(res){
		var tmp = {	//window quest complete will be send to client
			quest:q.id,
			scoreModInfo:q.scoreModInfo,
			scoreBase:q.reward.score,
			questFeedback:Main.QuestFeedbackParam(q.id,false,res,null,true),
			chalSuccess:chalSuccess,
			dailytaskSuccess:dailytaskSuccess,
			reward:reward,
			scoreMod:scoreMod,
			grantedCP:grantedCP,
			highscoreScore:{},	//info about score and rank
			highscoreInfo:highscoreInfo, //info about score and if better than b4
			completeToday:mq.completeToday,
			complete:mq.complete,
			rewardScore:mq.rewardScore,
			challengeDone:mq.challengeDone,
			
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
			Highscore.fetchScore(i,main.username,main.name,helper(i));
		}
			
	});
}

var getQuestScoreHighscore = function(id){
	return id + _SCORE;
}

Main.quest.init = function(){ //}
	Dialog.create('questComplete','Quest Complete!',Dialog.Size(500,550),Dialog.Refresh(function(html,variable,param){ //Main.questCompleteDialog
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
		
		var feedback = $('<div>').css({textAlign:'left',marginBottom:'10px'});
		Dialog.QuestFeedback(feedback,null,param.questFeedback);
		
		html.append(feedback);
		
		var chalDone = param.chalSuccess && param.chalSuccess.success;

		//Score
		var div = $('<div>');
		div.append($('<span>Reward: </span><br>')
			.css({fontSize:'1.4em'})
		);
		
		var title = param.scoreBase * SCORE_BASE + ' (Base)';
		if(param.scoreMod !== 1)
			title += ' x' + param.scoreMod.r(2) + ' (Performance)';
		if(chalDone)
			title += ' x2 (Challenge)';
		
		div.append($('<span>')
			.html('Score: ' + param.reward.score.r(0) + '<br>' )
			.attr('title',title)
			.css({marginLeft:'20px'})
		);
		
		var chalTitle = chalDone ? ' x2 Challenge' : '';
		div.append($('<span>')
			.attr('title',param.completeToday >= MAX_COMPLETED_TODAY ? 'No Exp because completed ' + MAX_COMPLETED_TODAY + '+ times today.' : chalTitle)
			.html('Exp: +' + param.reward.exp.r(0) + ' exp <span style="font-size:0.7em">(x' + Actor.getGEM(w.player).r(2) + ')</span><br>' )
			.css({marginLeft:'20px'})
		);
				
		div.append($('<span>')
			.attr('title',param.completeToday >= MAX_COMPLETED_TODAY ? 'No Item because completed ' + MAX_COMPLETED_TODAY + '+ times today.' : chalTitle)
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
		
		
		var span = Dialog.getCumulativeScoreSpan(w.main.quest[q.id]);
		div.append(span.css({marginLeft:'20px'}),'<br>');		
		
		html.append(div);
		html.append('<br>');
		
		var helperNewBest = function(text,color){
			return $('<strong>').html(text).addClass('shadow').css({marginLeft:'10px',color:color || '#00DD00'});
		}
		
		//Challenge
		if(param.chalSuccess){	
			var chalDiv = $('<div>')
				.append($('<span>Challenge: </span>').css({fontSize:'1.4em'}));
			if(param.chalSuccess.success)
				chalDiv.append(helperNewBest('SUCCESS').css({fontSize:'1.2em'}))
			else
				chalDiv.append(helperNewBest('FAILURE','#EE0000').css({fontSize:'1.2em'}));
				
			//
			html.append(chalDiv);	
		
		}
		
	
		//Highscore
		var contentHighscore = $('<div>');
		var helper = function(i){
			return function(){
				Dialog.open('highscore',i);
			}
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















