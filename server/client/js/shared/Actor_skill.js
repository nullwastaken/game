
"use strict";
(function(){ //}
var Main;
global.onReady(function(){
	Main = rootRequire('shared','Main');
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.lvlUp,Command.ACTOR,[ //{
	],Actor.levelUp); //}

});
var Actor = rootRequire('shared','Actor');

var LVL_EXPONENTIAL_START = 20;

Actor.Skill = function(exp,lvl,equipExp){
	return {
		exp:exp||0,	
		lvl:lvl || 0,
		equipExp:equipExp||0,
	}
}

Actor.Skill.getDbSchema = function(){
	return {exp:Number,lvl:Number,equipExp:Number}
}

Actor.Skill.compressDb = function(what){
	return what;
}
Actor.Skill.uncompressDb = function(what){
	return Actor.Skill(what.exp,what.lvl,what.equipExp);
}

Actor.SkillPlot = function(quest,type){
	return {
		quest:quest,
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
		
	if(useGEM !== false)
		num *= Actor.getGEM(act);
		
	act.skill.exp += num || 0;
	act.skill.equipExp += num || 0;
	Actor.setChange(act,'skill',act.skill);
}

Actor.removeEquipExp = function(act,num){
	if(typeof num !== 'number' || isNaN(num)) 
		return ERROR(4,'num is not number');
	if(num < 0)
		return ERROR(4,'remove exp must be gte 0',num);
	act.skill.equipExp -= num || 0;
	Actor.setChange(act,'skill',act.skill);
}


Actor.removeExp = function(act,num){
	if(typeof num !== 'number' || isNaN(num)) 
		return ERROR(4,'num is not number');
	if(num < 0)
		return ERROR(4,'remove exp must be gte 0',num);
	act.skill.exp -= num || 0;
	Actor.setChange(act,'skill',act.skill);
}
Actor.getEquipExp = function(act){
	return act.skill.equipExp;
}
Actor.getExp = function(act){
	return act.skill.exp;
}

Actor.getGEM = Tk.newCacheManager(function(act){	//BAD gem is on main
	if(!SERVER)	//on server, updated when quest complete and signin
		Actor.updateGEM(act);
	return Actor.getMain(act).gem;
},SERVER ? -1 : 1000);

Actor.updateGEM = function(act){
	var main = Actor.getMain(act);
	
	var count = 0;
	for(var i in main.quest){
		if(main.quest[i].rewardScore > 1){
			count += Actor.getGEM.scoreToGEM(main.quest[i].rewardScore);
			for(var j in main.quest[i].challengeDone)
				if(main.quest[i].challengeDone[j])
					count += 0.02;
		}
	}
	main.gem =  1 + count;
}

Actor.getGEM.scoreToGEM = function(score){
	if(score === 0) 
		return 0;
	return Math.min(0.04,Math.floor(Math.log10(score))/100 || 0);	
}

Actor.getLevelUpCost = function(act){
	var lvl = Actor.getLevel(act);
	var base = CST.exp[lvl+1] - CST.exp[lvl];
	var mod = 1;
	if(lvl > LVL_EXPONENTIAL_START)
		mod = Math.pow(2,lvl - LVL_EXPONENTIAL_START);
	return base * mod;
}

Actor.getLevelUpGEM = function(act){
	var lvl = Actor.getLevel(act);
	return CST.LVLUP_GEM[lvl + 1];
}

Actor.getLevel = function(act){
	return act.skill.lvl;
}

Actor.levelUp = function(act){
	var main = Actor.getMain(act);
	if(Actor.getExp(act) < Actor.getLevelUpCost(act))
		return Main.error(main,'You don\'t have enough exp to level up.');
		
	if(Actor.getGEM(act) < Actor.getLevelUpGEM(act))
		return Main.error(main,'Your GEM is not high enough to level up.<br>Complete quests and challenges to increase your GEM.');
	
	if(act.skill.lvl >= CST.exp.length - 2)
		return Main.error(main,'You can no longer level up.');
	
	Actor.removeExp(act,Actor.getLevelUpCost(act));
	act.skill.lvl++;
	
	act.context = Actor.getContext(act);
	Main.onLevelUp(main,act.skill.lvl);
}





})(); //{






