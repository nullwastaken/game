
"use strict";
var Main, ItemModel, QuestVar, Equip, Actor, Challenge, Material;
global.onReady(function(){
	Main = rootRequire('shared','Main'); ItemModel = rootRequire('shared','ItemModel'); QuestVar = rootRequire('server','QuestVar'); Equip = rootRequire('server','Equip'); Actor = rootRequire('shared','Actor'); Challenge = rootRequire('server','Challenge'); Material = rootRequire('server','Material');
});
var Quest = rootRequire('server','Quest');


var CHANCE_EQUIP = 0.05;
var CHANCE_MAT = 5;	//check Dialog_quest
var MAX_INV = 25;
var BASE_EXP = 150; //check Dialog_quest
var CHALLENGE_SUCCESS = 2;
var MAX_COMPLETED_TODAY = 5; //BAD, duplicate in Main_quest_status
var SCORE_BASE = 50;	//dupe Dialog_quest
var FIRST_TIME_SCORE = 100;
var FIRST_TIME_EXP = 500;
var CHANCE_EQUIP_RARE_FIRSTIME = 0.5;

//## START ##################
Quest.onStart = function(quest,main){
	quest.event._start(main.id);
}

Quest.addQuestVar = function(quest,main){
	QuestVar.addToList(QuestVar.create(quest.id,main));
}	

Quest.onSignIn = function(main,questVar,account){
	setTimeout(function(){
		if(!Main.get(main.id))
			return;
		
		if(!Main.quest.haveCompletedTutorial(main) && !main.questActive)
			Main.startQuest(main,CST.QTUTORIAL);
		
		Quest.removeSideQuestItem(main);
		
		if(questVar){
			var q = Quest.get(questVar.quest);
			q.event._signIn(main.id);	//after preset cuz
			
			//QuestVar.addToList done in QuestVar.onSignIn
			if(main.questActive) 	//cuz signIn can failQuest
				Main.updateQuestHint(main);			
		}
	},1000);
}


Quest.removeSideQuestItem = function(main){
	for(var i in main.invList.data){
		var q = ItemModel.get(i).quest;
		if(q && Quest.get(q).sideQuestAllowed)
			Main.removeItem(main,i,100000);		
	}
}

//## COMPLETE ##################

var QuestReward = function(score,item,exp){
	return {
		score:score || 0,
		item:item || {},
		exp:exp,	
	}
}

Quest.getScoreMod = function(q,main){
	return q.event._getScoreMod(main.id) || 0;
}

Quest.getReward = function(q,chalSuccess,scoreMod,firstTimeCompleted,key,completeToday){
	var chalMod = 1;
	
	if(chalSuccess && chalSuccess.success)
		chalMod = CHALLENGE_SUCCESS;
	
	var finalScore = SCORE_BASE * q.reward.score * scoreMod * chalMod;

	if(firstTimeCompleted && finalScore !== 0) 
		finalScore += FIRST_TIME_SCORE;
	
	var todayMod = completeToday >= MAX_COMPLETED_TODAY ? 0 : 1;
	var firstTimeBonus = firstTimeCompleted ? FIRST_TIME_EXP : 0;
	
	
	return QuestReward(
		finalScore,
		Quest.getReward.item(q,chalMod * todayMod,firstTimeCompleted,key),
		BASE_EXP * q.reward.completion * chalMod * todayMod + firstTimeBonus
	);
}

Quest.getReward.item = function(q,mod,firstTimeCompleted,key){
	var main = Main.get(key);
	
	if(Main.getInventorySlotUsed(main) > MAX_INV){
		Main.addMessage(main,'Because you have more than ' + MAX_INV + ' items in your inventory, this quest gave you no item reward.');	
		return {};
	}
	mod *= q.reward.completion;
	
	var act = Actor.get(key);
	var item = {};
	var num = Math.roundRandom(mod*CHANCE_MAT); 
	if(num !== 0) 
		item[Material.getRandom()] = num;
	if(firstTimeCompleted && q.id !== CST.QTUTORIAL){
		var num = Math.random() < CHANCE_EQUIP_RARE_FIRSTIME ? 4 : 2;
		item[Equip.randomlyGenerateFromQuestReward(act,num).id] = 1;
	} else if(Math.random() / mod < CHANCE_EQUIP){	//unsued atm cuz = 0
		item[Equip.randomlyGenerateFromQuestReward(act).id] = 1;
	}
	
	return item;
}


//## RESET ##################

Quest.onAbandon = function(q,main){
	q.event._abandon(main.id);
}

Quest.getChallengeSuccess = function(q,main,mq){	//null:non-active
	if(!mq.challenge)
		return null;
	var c = Challenge.get(mq.challenge);
	var tmp = {
		id:mq.challenge,
		name:c.name,
		success:true,	
	};		
	if(Challenge.testSuccess(c,main.id)){	
		mq.challengeDone[mq.challenge] = true;
		tmp.success = true;
	} else {
		tmp.success = false;
	}
	return tmp;
}

Quest.onReset = function(q,main){	//undo what the quest could have done
	var key = main.id;
	var act = Main.getAct(main);
	
	QuestVar.removeFromList(q.id,main);
	QuestVar.removeFromDb(q.id,main);
	
	var s = q.s;
	for(var i in q.item)	
		s.removeItem(key,i,CST.BIG_INT);
	for(var i in q.equip) 
		s.removeItem(key,i,CST.BIG_INT);
		
	Quest.onReset.removeTimeout(act,q.id);
		
	for(var i in main.chrono){
		if(i.$contains(q.id,true)) 
			Main.chrono.stop(main,i);
	}
	for(var i in act.permBoost){
		if(i.$contains(q.id,true)) 
			Actor.addPermBoost(act,i);
	}
	for(var i in act.preset){
		if(i.$contains(q.id,true)) 
			Actor.removePreset(act,i);
	}	
	for(var i in q.ability)	
		Actor.removeAbility(act,i);	
	
	Main.reputation.updateBoost(main);
	Actor.boost.removeAll(act,q.id);
	
	if(q.id !== CST.QTUTORIAL && s.isInQuestMap(key)){	
		s.teleportTown(key);
	}
	
	s.enableAttack(key,true);
	s.enablePvp(key,false);
	s.enableMove(key,true);
	s.restoreHUD(key);
	Main.dialogue.end(main);
	Actor.setCombatContext(act,'ability','normal');
	Actor.setCombatContext(act,'equip','normal');
	Actor.changeSprite(act,{name:CST.SPRITE_NORMAL,sizeMod:1});
	Actor.removeAllQuestMarker(act);
	Main.closeDialog(main,'permPopup');
	Main.removeScreenEffect(main,{quest:q.id});	//BAD
	
	if(act.dead){
		Actor.setTimeout(act,function(){	//cant be instant cuz called within die function
			Actor.revivePlayer(act);
		},25);
	}
	
}
Quest.onReset.removeTimeout = function(act,quest){
	for(var i in act.timeout){
		if(i.$contains(quest,true)) 
			Actor.timeout.remove(act,i);
	}
}

//############

Quest.getRandomDaily = function(){
	var quest;
	do {
		quest = Quest.DB.$randomAttribute();
	} while(!Quest.DB[quest].dailyTask)	//?
	return Quest.DB[quest] || null;
}

Quest.addPrefix = function(Q,name){
	if(name.$contains(Q + '-',true)) 
		return name;
	return Q + '-' + name;
}

//#########





