
"use strict";
(function(){ //}

var Challenge, Message, Main, Quest;
global.onReady(function(){
	Challenge = rootRequire('server','Challenge'); Message = rootRequire('shared','Message'); Main = rootRequire('shared','Main'); Quest = rootRequire('server','Quest');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.questSetChallenge,Command.MAIN,[ //{
		Command.Param('string','Challenge Id',false),
	],Main.setChallenge); //}
});
var Main = rootRequire('shared','Main');


//check QuestVar.verifyIntegrity for custom quest variable
Main.Quest = function(dbData){
	if(!SERVER) 
		return {};
		
	var tmp = {};
	dbData = dbData || {};	//assume dbData is already integrity tested
	var list = Quest.getDefaultVariable();
	for(var i in list){
		tmp[i] = dbData[i] || list[i];
	}
	return tmp;	
}
Main.Quest.Part = function(quest){
	return {
		complete:0,
		completeToday:0,
		completeTime:0,
		rewardScore:0,
		started:false,
		startTime:0,
		challenge:'',
		challengeDone:Quest.getChallengeList(quest),
		highscore:Quest.getHighscoreList(quest),
		skillPlot:false,
		permData:null,
		canStart:true,
	};
}

Main.Quest.compressDb = function(mq,main,qid){
	if(!mq.started && !mq.skillPlot) 
		return null;
		
	mq.username = main.username;
	mq.quest = qid;
	
	var chalDone = [];
	for(var i in mq.challengeDone)
		chalDone.push({id:i,complete:!!mq.challengeDone[i]});
	mq.challengeDone = chalDone;
	
	var highscore = [];
	for(var i in mq.highscore)
		highscore.push({id:i,value:mq.highscore[i]});
	mq.highscore = highscore;
	
	delete mq.canStart;
	delete mq.permData;
	
	if(!Main.Quest.getDbSchema()(mq))
		ERROR(3,'data not following schema',JSON.stringify(Main.Quest.getDbSchema().errors(mq)),mq);
	
	return mq;
}

Main.Quest.uncompressDb = function(mq){ //mq= main.quest[i]
	if(!Main.Quest.getDbSchema()(mq))
		ERROR(3,'data not following schema',JSON.stringify(Main.Quest.getDbSchema().errors(mq)),mq);
	
	var q = Quest.get(mq.quest);
	if(!q || !q.inMain)
		return null;	//invalid
	
	mq.canStart = true;
	delete mq.username;
	delete mq.quest;
	mq.permData = null;
	
	//challenge integrity
	var newChalDone = Quest.getChallengeList(q);
	
	for(var i = 0; i < mq.challengeDone.length; i++){
		if(newChalDone[mq.challengeDone[i].id] !== undefined)
			newChalDone[mq.challengeDone[i].id] = mq.challengeDone[i].complete;
	}
		
	mq.challengeDone = newChalDone;
	
	if(!newChalDone[mq.challenge])	//if challenge not longer exist
		mq.challenge = '';
		
	
	//highscore integrity
	var newHigh = Quest.getHighscoreList(q);
	
	for(var i = 0; i < mq.challengeDone.length; i++){
		if(newHigh[mq.highscore[i].id] !== undefined)
			newHigh[mq.highscore[i].id] = mq.highscore[i].value;
	}
	
	mq.highscore = newHigh;
	
	
	return mq;
}

var schema;
Main.Quest.getDbSchema = function(){
	schema = schema || require('js-schema')({
		challenge : String,
        complete:Number,
		completeTime:Number,
		completeToday:Number,
		quest:String,
		challengeDone : Array.of({id:String,complete:Boolean}),
        highscore : Array.of({id:String,value:[Number,null]}),
        rewardScore : Number,
        skillPlot : Boolean,
        started : Boolean,
		startTime:Number,
        username : String,
		'*':null,
	});
	return schema;	
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
	return Tk.objectToArray(killCount,'id','count');
}

Main.KillCount.uncompressDb = function(killCount){
	killCount = Tk.arrayToObject(killCount,'id','count');
	return Main.KillCount(killCount);
}
Main.KillCount.getDbSchema = function(){	//be careful, schema is already defined
	return Array.of({
		id:String,
		count:Number,
		'*':null
	})
}

Main.KillCount.reset = function(main,zone,completeToday){
	main.killCount[zone] = completeToday <= 3 ? 0 : completeToday * completeToday - 9;
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
Main.quest.haveCompletedTutorial = function(main){
	return Main.haveCompletedQuest(main,CST.QTUTORIAL);
}

Main.quest.onDeath = function(main,killer,partyDead){
	if(!main.questActive) 
		return;
	return Quest.get(main.questActive).event._death(main.id,killer,partyDead);	
}

Main.updateQuestHint = function(main){
	var old = main.questHint;
	main.questHint = main.questActive ? 
		Quest.get(main.questActive).event._hint(main.id) || 'No hint.'
		: '';
	if(old !== main.questHint)
		Main.setChange(main,'questHint',main.questHint);
}

Main.setQuestPermData = function(main,qid,data){
	main.quest[qid].permData = data;
}

Main.getQuestPermData = function(main,qid,data){
	return main.quest[qid].permData;
}

Main.getQuestActive = function(main){
	return main.questActive || null;
}

Main.haveCompletedQuest = function(main,quest){
	return main.quest[quest].complete;
}

Main.getCompletedQuestCount = function(main){
	var questCount = 0;
	for(var i in main.quest) 
		if(Main.haveCompletedQuest(main,i) && i !== CST.QTUTORIAL)
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
				Main.setChange(main,'quest,'+i,main.quest[i]);
			}
		}
	}
}

Main.setChallenge = function(main,qid,id){
	var mq = main.quest[qid];
	if(!mq) 
		return;
	
	if(!id){
		main.quest[qid].challenge = '';
		Main.addMessage(main,'Challenge turned off.');
		Main.playSfx(main,'select');
		Main.setChange(main,'quest,' + qid,main.quest[qid]);
		return;
	}
	var chal = Challenge.get(id);
	if(!chal || chal.quest !== qid) 
		return;
	
	if(main.questActive){
		return Main.error(main,'You have already started this quest. You can\'t change challenges anymore.');
	}
	if(!Main.haveCompletedQuest(main,qid)){
		return Main.error(main,'You need to complete this quest at least once before trying challenges.');
	}
	
	mq.challenge = id;
	Main.addMessage(main,'Challenge ' + chal.name + ' turned on.');
	Main.playSfx(main,'select');
	Main.setChange(main,'quest,' + qid,main.quest[qid]);
}
//###################

})(); //{













