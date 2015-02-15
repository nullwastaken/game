//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Main = require2('Main'), QuestVar = require2('QuestVar'), Equip = require2('Equip'), Actor = require2('Actor'), Challenge = require2('Challenge'), Material = require2('Material');
var Quest = require3('Quest');
var CHANCE_EQUIP = 1;
var CHANCE_MAT = 3;
var MAX_INV = 25;

//## START ##################
Quest.onStart = function(quest,main){
	quest.event._start(main.id);
}

Quest.addQuestVar = function(quest,main){
	QuestVar.addToList(QuestVar.create(quest.id,main));
}	

Quest.onSignIn = function(main,questVar,account){
	if(account.lastSignIn === null)
		return setTimeout(function(){
			if(!Main.get(main.id)) return;
			Main.startQuest(main,'Qtutorial');
		},1000);
		
	if(questVar){
		var q = Quest.get(questVar.quest);
		q.event._signIn(main.id);	//after preset cuz
		if(!main.questActive) return;	//cuz signIn can failQuest
		//QuestVar.addToList done in QuestVar.onSignIn
		
		Main.updateQuestHint(main);
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
Quest.getReward = function(q,bonus,scoreMod,firstTimeCompleted,key){
	var finalScore = q.reward.reputation.mod * bonus.score * scoreMod;
	if(firstTimeCompleted) 
		finalScore += Quest.getFirstTimeBonus(q.reward.reputation);
	
	return QuestReward(
		finalScore,
		Quest.getReward.item(q,bonus.item,key),
		100 * bonus.exp*q.reward.exp
	);
}

Quest.getReward.item = function(q,mod,key){
	var main = Main.get(key);
	
	if(main.invList.data.$length() > MAX_INV){	//TEMP
		Main.addMessage(main,'Because you have more than ' + MAX_INV + ' items in your inventory, this quest gave you no item reward.');	
		return {};
	}
	mod *= q.reward.item;
	
	var act = Actor.get(key);
	var item = {};
	var num = Math.roundRandom(mod*CHANCE_MAT); 
	if(num !== 0) 
		item[Material.getRandom(Actor.getLevel(act))] = num;
	if(Math.random() / mod < CHANCE_EQUIP){
		item[Equip.randomlyGenerateFromQuestReward(act).id] = 1;
	}
	for(var i in q.reward.ability){
		if(Actor.getAbilityList(act,'normal')[i]) continue;
		if(Main.haveItem(Actor.getMain(act),i)) continue;
		if(Math.random() < q.reward.ability[i]){
			item[i] = 1;	//assume ability id === scroll id
		}
	}
	
	return item;
}

Quest.scoreToReputationPoint = function(score,reputation){
	score = Math.max(score,1);	//other pp could be <0
	return Math.min(Math.log10(score)/4,1) * reputation.max;
}

Quest.getFirstTimeBonus = function(reputation){
	return Math.pow(10,4*reputation.min/reputation.max);	//normally 100
}

//## RESET ##################

Quest.onAbandon = function(q,main){
	q.event._abandon(main.id);
}

Quest.getChallengeSuccess = function(q,main,mq){	//null:non-active
	var tmp = {};
	for(var i in mq._challenge){
		tmp[i] = null;
		if(!mq._challenge[i]) continue;
		if(Challenge.testSuccess(Challenge.get(i),main.id)){	
			mq._challengeDone[i] = 1;
			tmp[i] = true;
			Main.quest.updateChallengeDoneBonus(main,q.id);
		} else {
			tmp[i] = false;
		}
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
		s.removeItem(key,i,CST.bigInt);
	for(var i in q.equip) 
		s.removeItem(key,i,CST.bigInt);
		
	for(var i in act.timeout){
		if(i.$contains(q.id,true)) 
			Actor.timeout.remove(act,i);
	}
	for(var i in main.chrono){
		if(i.$contains(q.id,true)) 
			Main.chrono.stop(main,i);
	}
	for(var i in act.permBoost){
		if(i.$contains(q.id,true)) 
			Actor.permBoost(act,i);
	}
	for(var i in act.preset){
		if(i.$contains(q.id,true)) 
			Actor.removePreset(act,i,s);
	}	
	for(var i in q.ability)	
		Actor.removeAbility(act,i);	
	
	Main.reputation.updateBoost(main);
	Actor.boost.removeAll(act,q.id);
	
	if(q.id !== 'Qtutorial' && s.isInQuestMap(key))	//BAD
		s.teleportTown(key);
	
	s.enableAttack(key,true);
	s.enablePvp(key,false);
	s.enableMove(key,true);
	s.restoreHUD(key);
	//Main.dialogue.end(main);
	Actor.setCombatContext(act,'ability','normal');
	Actor.setCombatContext(act,'equip','normal');
	Actor.changeSprite(act,{name:'normal',sizeMod:1});
	Actor.removeAllQuestMarker(act);
	Main.closeDialog(main,'permPopup');
	Main.screenEffect.remove(main,Main.screenEffect.REMOVE_ALL);
	
}

//############

Quest.getRandomDaily = function(){
	var quest;
	do quest = Quest.DB.$randomAttribute();
	while(!Quest.DB[quest].dailyTask)
	return Quest.DB[quest];
}

Quest.addPrefix = function(Q,name){
	if(name.$contains(Q + '-',true)) return name;
	else return Q + '-' + name;
}

//#########





