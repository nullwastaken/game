//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require2('Main'), Message = require2('Message'), Achievement = require2('Achievement');
var Actor = require3('Actor');
Actor.Skill = function(exp,lvl){
	return {
		exp:exp||0,	
		lvl:lvl || 0,
	}
}

Actor.SkillPlot = function(quest,num,type){
	return {
		quest:quest,
		num:num,
		type:type
	};	
}


//###############

Actor.getCombatLevel = function(act){
	return Actor.getMain(act).reputation.lvl;
}

Actor.addExp = function(act,num,useGEM){
	if(typeof num !== 'number' || isNaN(num)) 
		return ERROR(4,'num is not number');
	
	if(num < 0)
		return ERROR(4,'exp to add is less than 0',num);
		
	if(useGEM !== false){
		num *= Actor.getGEM(act);
	}
	
	
	act.skill.exp += num || 0;
	Actor.setFlag(act,'skill');
}

Actor.removeExp = function(act,num){
	if(typeof num !== 'number' || isNaN(num)) 
		return ERROR(4,'num is not number');
	if(num < 0)
		return ERROR(4,'remove exp must be gte 0',num);
	act.skill.exp -= num || 0;
	Actor.setFlag(act,'skill');
}


Actor.getExp = function(act){
	return act.skill.exp;
}


Actor.getGEM = function(act){
	var main = Actor.getMain(act);
	
	var count = 0;
	for(var i in main.quest){
		if(main.quest[i]._rewardScore > 1){
			count += Actor.getGEM.scoreToGEM(main.quest[i]._rewardScore);
			for(var j in main.quest[i]._challengeDone)
				if(main.quest[i]._challengeDone[j])
					count += 0.02;
		}
	}
	return 1 + count;
}
Actor.getGEM.scoreToGEM = function(score){
	if(score === 0) return 0;
	return Math.floor(Math.log10(score))/100 || 0;	
}

Actor.getLevelUpCost = function(act){
	var lvl = Actor.getLevel(act);
	return CST.exp[lvl+1] - CST.exp[lvl];
}

Actor.getLevel = function(act){
	return act.skill.lvl;
}

Actor.levelUp = function(act){
	if(Actor.getExp(act) < Actor.getLevelUpCost(act)){
		return Message.add(act.id,'You don\'t have enough exp to level up.');
	}
	Actor.removeExp(act,Actor.getLevelUpCost(act));
	act.skill.lvl++;
	
	var str = 'Level up! You are now level ' + act.skill.lvl + '!<br>You gained an additional Reputation Point.<br>';
	str += Message.generateTextLink("exports.Dialog.open(\'reputation\');",'Click here to use it.');
	
	Message.addPopup(act.id,str);
	
	var main = Actor.getMain(act);
	Main.reputation.updatePt(main);
	
	Main.contribution.onLevelUp(main,act.skill.lvl);
	Achievement.onLevelUp(main);
	Main.updateCanStartQuest(main);
}





})(); //{






