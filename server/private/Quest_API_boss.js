
"use strict";
(function(){ //} 
var Actor, ActorModel, Ability, Boss;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); ActorModel = rootRequire('shared','ActorModel'); Ability = rootRequire('server','Ability'); Boss = rootRequire('server','Boss');
});


exports.newQuest_boss = function(s,Q,Qid,parseActorExtra,modelFormat,parseEvent){ //}
	var b = s.boss = {};
	b.useAbility = function(boss,name,extra){
		var ab = Ability.get(Qid(name)) || Ability.get('Qsystem-' + name) || ERROR(3,'no ability,name');
		if(typeof extra === 'number') 
			extra = {angle:extra};
		Boss.useAbility(Actor.get(boss).boss,ab,extra);
	}
	b.getSummonCount = function(boss,name){
		if(ActorModel.get(Qid(name))) name = Qid(name);	
		else name = 'Qsystem-' + name;
		return Boss.getSummon(Actor.get(boss).boss,name).length;
	}
	b.set = function(boss,attr,value){
		if(attr.$contains('_',true)) return ERROR(2,'cant modify internal values');
		if(!Actor.get(boss)) return ERROR(2,'act dont exist');
		Actor.get(boss).boss.variable[attr] = value;
		return value;
	}
	b.add = function(boss,attr,value){
		if(attr.$contains('_',true)) return ERROR(2,'cant modify internal values');
		if(!Actor.get(boss)) return ERROR(2,'act dont exist');
		return Actor.get(boss).boss.variable[attr] += value;
	}
	b.get = function(boss,attr){
		if(!Actor.get(boss)) return ERROR(2,'act dont exist');
		return Actor.get(boss).boss.variable[attr];
	}
	b.attackOff = function(boss,time){
		if(!Actor.get(boss)) return ERROR(2,'act dont exist');
		if(isNaN(time)) return ERROR(3,'NaN',time);
		Actor.get(boss).boss.variable._noattack = time;
	}
	b.isInCombat = function(boss){
		return Actor.get(boss).combat;
	}
	b.getRandomTarget = function(boss){
		return Boss.getRandomTarget(Actor.get(boss).boss);
	}
	b.getRandomTargetAngle = function(boss){
		return Boss.getRandomTargetAngle(Actor.get(boss).boss);
	}
	b.getDistance = function(boss){	//choose random target
		var target = b.getRandomTarget(boss);
		if(!target) return 0;
		return s.getDistance(boss,target);
	}
	
	b.addMinion = function(boss,eid){
		Boss.addMinion(Actor.get(boss).boss,eid);
	}
	b.getMinion = function(boss){	
		return Boss.getMinion(Actor.get(boss).boss);
	}
	b.getMinionCount = function(boss){	
		return Boss.getMinion(Actor.get(boss).boss).$length();
	}
	
	b.changePhase = function(boss,phase,triggerTransition){
		Boss.changePhase(Actor.get(boss).boss,phase,triggerTransition);
	}
	return b;
}

})(); //{


