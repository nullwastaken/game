//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Server = require2('Server'), Message = require2('Message'), Debug = require2('Debug'), Main = require2('Main'), QuestVar = require2('QuestVar'), Quest = require2('Quest');
var Main = require3('Main');
Main.Quest = function(overwrite){
	if(!SERVER) 
		return {};
	var tmp = {};
	overwrite = overwrite || {};
	var list = Quest.getMainVarList();
	for(var i in list){
		tmp[list[i]] = Main.Quest.part(Quest.get(list[i]),overwrite[list[i]]);
	}
	return tmp;	
}
Main.Quest.part = function(quest,overwrite){
	return overwrite || {
		_rewardScore:0,
		_complete:0,
		_completeToday:0,
		_started:0,
		_startTime:0,
		_challenge:Quest.getChallengeList(quest),
		_challengeDone:Quest.getChallengeList(quest),
		_highscore:Quest.getHighscoreList(quest),
		_skillPlot:[0,0,0,0,0,0,0],
		_permData:null,
		canStart:true,
	};
}


Main.Quest.compressDb = function(quest,main,qid){	
	quest.username = main.username;
	quest.quest = qid;
	delete quest.canStart;
	return quest;
}

Main.Quest.uncompressDb = function(quest){ //quest= main.quest[i]
	quest.canStart = true;
	delete quest.username;
	delete quest.quest;
	return quest;
}

Main.Quest.uncompressDb.verifyIntegrity = function(quest){	//WHOLE MAIN.QUEST, quest= main.quest
	//If new or deleted quest
	//check QuestVar.verifyIntegrity for custom quest variable
	var allQuest = QuestVar.getInitVar.all();
	
	for(var i in quest){
		if(!allQuest[i]){ 	//delete quest
			delete quest[i];
		}
	}
	
	for(var i in allQuest){
		var q = Quest.get(i);
		if(!q.inMain) continue;	//not part of
	
		if(!quest[i]){ 	//aka new quest
			quest[i] = Main.Quest.part(q);
			continue; 
		}	
		
		//challenge integrity
		var chal = Quest.getChallengeList(Quest.get(i));
		for(var j in chal){	//add new version challenge
			quest[i]._challengeDone = quest[i]._challengeDone || {};
			quest[i]._challenge = quest[i]._challenge || {};
			if(typeof quest[i]._challengeDone[j] === 'undefined'){	
				quest[i]._challengeDone[j] = 0;
				quest[i]._challenge[j] = 0;
			}
		}
		for(var j in quest[i]._challengeDone){	//removed challenge
			if(typeof chal[j] === 'undefined'){	
				delete quest[i]._challengeDone[j];
				delete quest[i]._challenge[j];
			}
		}
		
		//highscore integrity
		var high = Quest.getHighscoreList(Quest.get(i));
		for(var j in high){	//add new version highscore
			quest[i]._highscore = quest[i]._highscore || {};
			
			if(typeof quest[i]._highscore[j] === 'undefined'){	
				quest[i]._highscore[j] = null;
			}
		}
		for(var j in quest[i]._highscore){	//remove highscore
			if(typeof high[j] === 'undefined'){	
				delete quest[i]._highscore[j];
			}
		}
	}
	return quest;
}

Main.KillCount = function(killCount){
	if(!SERVER)
		return {};
	var tmp = Quest.getMainKillCount();
	for(var i in killCount){
		if(tmp[i] !== undefined)
			tmp[i] = killCount[i];
	}
	return tmp;
}

Main.KillCount.compressDb = function(killCount){	
	return killCount;
}

Main.KillCount.uncompressDb = function(killCount){
	return Main.KillCount(killCount);
}

Main.QuestActive = function(questActive){
	return questActive || '';
}

Main.QuestActive.uncompressDb = function(questActive){
	if(questActive && !Quest.get(questActive)){
		ERROR(3,'invalid questActive',questActive);
		return '';
	}
	return questActive;
}



//#################

Main.quest = {};
Main.quest.haveDoneTutorial = function(main){
	if(Debug.isActive()) return true;
	if(Server.isAdmin(main.id)) return true;
	return !!Main.hasCompletedQuest(main,'Qtutorial');
}

Main.quest.onDeath = function(main,wholePartyDead,killer){
	if(!main.questActive) return false;
	var ret = Quest.get(main.questActive).event._death(main.id,wholePartyDead,killer);
	
	if(!wholePartyDead && ret === true)
		return true;	//aka turn player into grave
	return false;	
}

Main.getQuestVar = function(main,id){
	if(id) return main.quest[id];
	if(main.questActive) return main.quest[main.questActive];
	return main.quest;
}

Main.updateQuestHint = function(main){
	var old = main.questHint;
	main.questHint = main.questActive ? 
		Quest.get(main.questActive).event._hint(main.id) || 'None.'
		: '';
	if(old !== main.questHint)
		Main.setFlag(main,'questHint');
}

Main.setQuestPermData = function(main,qid,data){
	main.quest[qid]._permData = data;
}
Main.getQuestPermData = function(main,qid,data){
	return main.quest[qid]._permData;
}


Main.getQuestActive = function(main){
	return main.questActive || null;
}

Main.hasCompletedQuest = function(main,quest){
	return main.quest[quest]._complete;
}
Main.getCompletedQuestCount = function(main){
	var questCount = 0;
	for(var i in main.quest) 
		if(Main.hasCompletedQuest(main,i))
			questCount++;
	return questCount;
}

Main.updateCanStartQuest = function(main,neverSetFlag){
	for(var i in main.quest){
		var q = Quest.get(i);
		var canStart = q.requirement.canStart(main);
		if(main.quest[i].canStart !== canStart){
			main.quest[i].canStart = canStart;
			if(neverSetFlag !== false){
				var str = 'You have unlocked the quest ';
				str += Message.generateTextLink("exports.Dialog.open('quest','" + i + "');",q.name);
				str += '.';
				Message.addPopup(main.id,str); 
				Main.setFlag(main,'quest',i);
			}
		}
	}
}


//###################

})(); //{













