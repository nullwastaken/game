//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Main = require2('Main'), Quest = require2('Quest');

var Challenge = exports.Challenge = {};
Challenge.create = function(quest,id,name,desc,bonus,testSuccess){
	var tmp = {
		quest:quest,
		id:id,
		name:name || 'name',
		description:desc || 'description',
		testSuccess:testSuccess || function(){ return true; },
		bonus:Challenge.Bonus(bonus || 2),
	};
	DB[id] = tmp;
	return tmp;
}

var DB = Challenge.DB = {};

Challenge.compressClient = function(info){
	return {
		name:info.name,
		description:info.description,
		bonus:info.bonus,
	};
}



Challenge.Bonus = function(bonus,perm,failure){
	bonus = bonus || 2;
	return {
		success:typeof bonus === 'object' ? bonus : Quest.RewardInfo(bonus,(bonus-1)/2+1,(bonus-1)/5+1),
		perm:perm || Quest.RewardInfo(1.5,1.25,1.1),
		failure:failure || Quest.RewardInfo(1,1,1),
	};
}

Challenge.get = function(challenge){
	return DB[challenge];
}

//##############

Challenge.toggle = function(challenge,main){	//when a player click on a quest bonus
	if(!challenge) return;
	var qid = challenge.quest;
	var challengeId = challenge.id;
	var mq = main.quest[qid];
	if(!Challenge.toggle.test(challenge,main,mq._challenge[challengeId])) return false;
	mq._challenge[challengeId] = !mq._challenge[challengeId];
	
	if(mq._challenge[challengeId]){
		Main.addMessage(main,'Challenge Turned On.');
		for(var i in mq._challenge) if(i !== challengeId) mq._challenge[i] = false;	//turn off others
	}	else 	Main.addMessage(main,'Challenge Turned Off.');
	
	Main.quest.updateChallengeBonus(main,qid);
	Main.setFlag(main,'quest',qid);
}

Challenge.toggle.test = function(challenge,main,currentValue){
	if(!challenge) return false;
	if(currentValue) return true; //no req to disable challenge
	if(main.questActive) 
		return Main.addMessage(main,'You have already started this quest. You can\'t change challenges anymore.') || false;
	
	if(!main.quest[challenge.quest]._complete)
		return Main.addMessage(main,'You need to complete this quest at least once before trying challenges.') || false;
	
	/*
	var party = Main.getParty(main);
	if(!Party.getForEach(party,function(key){
		return !!Main.get(key).quest[challenge.quest]._complete;
	})){
		if(Party.getSize(party) === 1) Main.addMessage(main,'You need to complete this quest at least once before trying challenges.');
		else Main.addMessage(main,'Someone in your party haven\'t completed the quest once and therefore, you can\'t activate a challenge.');
		return false;
	}
	*/
	
	return true;
}


Challenge.testSuccess = function(challenge,key){
	var res = challenge.testSuccess(key); 
	return res !== false;
}	






