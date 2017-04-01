
"use strict";
var Actor, Collision;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Collision = rootRequire('shared','Collision');
});
var Boss = exports.Boss = function(extra){
	this.id = '';
	this.phase = '';
	this.currentPhase = '';
	this.active = true;
	this.variable = {};
	Tk.fillExtra(this,extra);
};
Boss.create = function(id,variable,phase,startingPhase){	//model...
	var tmp = new Boss({	
		id:id,
		phase:phase,
		currentPhase:startingPhase,
		variable:variable,
	});
	
	DB[id] = tmp;
};
var DB = Boss.DB = {};
Boss.Variable = function(list){
	var tmp = {
		_frame:0,		//always increase
		_framePhase:0,	//reset to 0 when change phase
		_hpRatio:1,
		_target:{},		//id:angle
		_minion:{},
		_noattack:0,	//time if above 0 => cant attack
	}	
	for(var i in list){
		if(i.$contains('_',true)) return ERROR(3,'cant have boss variable starting with _');
		tmp[i] = list[i];
	}
	return tmp;
}

Boss.Phase = function(info){
	return {
		loop:info.loop || CST.func,
		frequence:info.frequence || 1,
		transitionTest:info.transitionTest || function(){ return false; },
		transitionIn:info.transitionIn || CST.func,
		transitionOut:info.transitionOut || CST.func,
	};
}

Boss.get = function(name,act){
	var boss = Boss.getClone(name);
	if(!boss) 
		return ERROR(2,'no boss with this name',name);
	boss.parent = act.id;
	return boss;
}
Boss.getClone = function(name){
	return Tk.deepClone(DB[name]);
}

Boss.useAbility = function(boss,ab,extra){
	var v = boss.variable;
	if(v._noattack > 0) return;
	extra = extra || {};
	var act = Boss.getAct(boss);
	if(extra.x !== undefined)
		extra.x += act.x;
	if(extra.y !== undefined)
		extra.y += act.y;
	Actor.useAbility(act,ab,true,extra);
}
Boss.getAct = function(boss){
	return Actor.get(boss.parent);
}

Boss.getSummon = function(boss,name){
	var act = Boss.getAct(boss);
	if(!act.summon[name]) return [];
	var tmp = [];
	for(var i in act.summon[name].child)
		tmp.push(act.summon[name].child[i]);
	return tmp;
}

Boss.loop = function(boss){
	var act = Boss.getAct(boss);
	
	var v = boss.variable;
	v._frame++;
	v._framePhase++;
	if(Actor.testInterval(act,25))	
		Boss.loop.updateTarget(boss);
	Boss.loop.updateTargetAngle(boss);
		
	boss.active = !v._target.$isEmpty();
	if(!boss.active) 
		return;
	
	
	v._noattack--;
	v._angle = act.angle;
	v._hpRatio = act.hp/act.hpMax;
	
	Boss.loop.transition(boss);
}

Boss.loop.transition = function(boss){
	var curPhase = boss.currentPhase;
	var phase = boss.phase[curPhase];
	
	if(phase.transitionTest){
		var res = phase.transitionTest(boss.parent);
		if(res)
			Boss.changePhase(boss,res,true);
	}
	
	boss.phase[boss.currentPhase].loop(boss.parent);
}
Boss.changePhase = function(boss,newPhase,triggerEvent){
	var curPhase = boss.currentPhase;
	boss.currentPhase = newPhase;
	if(triggerEvent !== false){
		if(boss.phase[curPhase].transitionOut)
			boss.phase[curPhase].transitionOut(boss.parent);
		if(boss.phase[newPhase].transitionIn)
			boss.phase[newPhase].transitionIn(boss.parent);
	}
	boss.variable._framePhase = 1;
}

Boss.loop.updateTargetAngle = function(boss){	//TOFIX can only have player target
	var act = Boss.getAct(boss);
	for(var i in boss.variable._target){ 
		if(!Actor.get(i)){ 
			delete boss.variable._target[i]; 
			continue; 
		}
		boss.variable._target[i] = Collision.getAnglePtPt(act,Actor.get(i));
	}
}

Boss.loop.updateTarget = function(boss){	//TOFIX can only have player target
	//Update Boss Target. can have multiple targets unlike regular enemy
	var act = Boss.getAct(boss);
	boss.variable._target = {};
	for(var i in act.activeList){ 
		if(Actor.isPlayer(i)){
			boss.variable._target[i] = Collision.getAnglePtPt(act,Actor.get(i));
		}
	}
}

Boss.getRandomTarget = function(boss){
	for(var i in boss.variable._target)
		return i;
	return null;
}

Boss.getRandomTargetAngle = function(boss){
	for(var i in boss.variable._target)
		return boss.variable._target[i];
	return null;
}

Boss.addMinion = function(boss,minionId){
	boss.variable._minion[minionId] = true;
}

Boss.getMinion = function(boss,minionId){
	Boss.updateMinion(boss);
	return boss.variable._minion;
}

Boss.updateMinion = function(boss){
	for(var i in boss.variable._minion)
		if(!Actor.get(i))
			delete boss.variable._minion[i];
}



