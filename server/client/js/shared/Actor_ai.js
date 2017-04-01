
"use strict";
(function(){ //}
var Combat, Collision;
global.onReady(function(){
	Combat = rootRequire('server','Combat'); Collision = rootRequire('shared','Collision');
});
var Actor = rootRequire('shared','Actor');

var TARGET_TYPE = {
	actor:'actor',
	spot:'spot',
}

Actor.TargetSetting = function(maxAngleChange,periodSub,periodMainActor,periodMainSpot,periodStuck){
	return {
		maxAngleChange: maxAngleChange ||90,
		periodSub: periodSub ||50,				//change where he wants to be relative to main target
		periodMainActor:periodMainActor ||90,	//change main target if real target
		periodMainSpot:periodMainSpot || 12,		//change main target if spot (aka fake target)
		periodStuck: periodStuck ||113,	
		updateMain:true,	//for cutscene
		updateSub:true,
	}
}

Actor.TargetMain = function(targetId,x,y){
	return {
		x:x||0,
		y:y||0,
		targetId:targetId || '',
		type:typeof targetId === 'string' ? TARGET_TYPE.actor : TARGET_TYPE.spot,
	}
}

Actor.TargetSub = function(x,y,callback){
	return {
		x:x||0,
		y:y||0,
		callback:callback || null,	//param:key
		active:true,		//only for player check Input file
	}
}

Actor.MoveRange = function(ideal,max,confort){
	return {
		ideal:100*Tk.nu(ideal,1),                //distance enemy wants to be from target
		confort:25*Tk.nu(confort,1),               
		aggressive:250*Tk.nu(max,1),           //attack player if within this range
		farthest:600*Tk.nu(max,1),             //stop follow player if above this range
	};
}

Actor.ai = {};
Actor.ai.update = function(act){
	Actor.ai.setTarget(act);  		//update Enemy Target
	Actor.ai.updateInput(act); 		//simulate enemy key press depending on target 
}

var UPDATE_ABILITY_INPUT_INTERVAL = 25;
var UPDATE_MOUSE_INPUT_INTERVAL = 5;
Actor.ai.updateInput = function(act){
	if(act.move && act.useUpdateInput)
		Actor.ai.updateInput.move(act);
		
	if(act.type !== CST.ENTITY.npc) return;
	
	if(act.combat && act.frame % UPDATE_ABILITY_INPUT_INTERVAL === 0)
		Actor.ai.updateInput.ability(act);
	
	if(act.frame % UPDATE_MOUSE_INPUT_INTERVAL === 0 && (act.move || act.combat))
		Actor.ai.updateInput.mouse(act);
	
}

Actor.ai.updateInput.mouse = function(act){
	var target = act.combat ? Actor.ai.setTarget.getMainPos(act) : act.targetSub;
	if(!target) return;
	var x = target.x-act.x;
	var y = target.y-act.y;
	act.angle = Tk.atan2(y,x);
	act.mouseX = y;
	act.mouseY = x;
} 

Actor.ai.updateInput.move = function(act){
	//if(tar.cutscene.path.length) 
		//Actor.ai.updateInput.move.cutscene(act);	//set sub as the first position in stuck
	if(act.frame % 2 === 0)
		Actor.ai.updateInput.move.towardSub(act,act.targetSub);
	
}
//success is closer than x2*spd
Actor.ai.updateInput.move.towardSub = function(act,sub){	//sub = where he wants to go
	if(sub.active === false)
		return;
	
	var x = sub.x - act.x;
	var y = sub.y - act.y;
	var diff = Math.sqrt(x*x+y*y);
	
	if(diff < 2*act.maxSpd){
		act.moveInput = Actor.MoveInput();	//aka reset
		if(sub.callback) sub.callback(act.id);
	} else { //too far from loc,
		if(Math.abs(x) > 10){
			act.moveInput.right = x>0; 
			act.moveInput.left = !act.moveInput.right;
		} else {
			act.moveInput.left = act.moveInput.right = false;
		}
		if(Math.abs(y) > 10){
			act.moveInput.down = y>0; 
			act.moveInput.up = !act.moveInput.down;
		} else {
			act.moveInput.up = act.moveInput.down = false;
		}
		
	}
	
}

Actor.ai.updateInput.ability = function(act){
	Actor.ai.resetAbilityChangePress(act);
	if(act.targetMain.type !== 'actor') return;
	var target = Actor.ai.setTarget.getMainPos(act);
	if(!target) return;
	
	var diff = Collision.getDistancePtPt(act,target);
	
	var id;
	if(diff > act.abilityAi.range[1]) 
		id = act.abilityAi.far.$random();
	else if(diff > act.abilityAi.range[0]) 
		id = act.abilityAi.middle.$random();
	else
		id = act.abilityAi.close.$random();

	if(!id || id === CST.IDLE) 
		return;
	
	var ab = Actor.getAbility(act);
	for(var i = 0; i < ab.length; i++){
		if(ab[i] && ab[i].id === id){
			act.abilityChange.press[i] = true;
		}
	}
}

//cutscene[ {x,y,timeLimit,spd,wait,event} ]	
Actor.followPath = function(act,cutscene,callback){
	act.useUpdateInput = true;
	act.targetSetting.updateMain = false;
	act.targetSetting.updateSub = false;

	Actor.followPath.applyNext(act,cutscene,0,function(key){
		Actor.endPath(act);
		if(callback) 
			callback(key);
	});
}

Actor.followPath.applyNext = function(act,fullList,num,callbackIfDone){	//spdMod not applied
	var spot = fullList[num];
	if(!spot) 
		return callbackIfDone(act.id);	//finished
	
	//Actor.addPermBoost(act,'followPath',[Boost.Perm('maxSpd',spot.spdMod,CST.BOOST_XXX)]);	//BAD... for npc screw everything. cant add permboost to npc... cant do !== 1, cuz need overwrite
	
	Actor.followPath.goTo(act,spot,function(key,success){
		if(!success) 
			Actor.teleport(act,Actor.Spot(spot.x,spot.y,act.map,act.mapModel));	//to prevent gettig stuck
		
		Actor.followPath.wait(act,spot.wait,function(){
			Actor.followPath.applyNext(act,fullList,num + 1,callbackIfDone);
		});
		if(spot.event) 
			spot.event(key);
		
	},spot.timeLimit);
}

Actor.followPath.goTo = function(act,spot,callback,timeLimit){	//for cutscene, timeLimit param:key,success
	var wasSuccessFull = false;
	act.targetSub = Actor.TargetSub(spot.x,spot.y,function(key){
		wasSuccessFull = true;
		if(callback) 
			callback(key,true);
	});
	if(timeLimit){
		Actor.setTimeout(act,function(key){
			if(wasSuccessFull) 
				return;	//reached it before timeLimit
			if(callback) 
				callback(key,false);
		},timeLimit,'Actor.followPath.goTo');
	}
}

Actor.followPath.wait = function(act,time,callback){
	if(!time && callback)
		return callback(act.id);	
	Actor.addPreset(act,'onFollowPathWait');
	Actor.setTimeout(act,function(key){
		var act = Actor.get(key);
		Actor.removePreset(act,'onFollowPathWait');
		if(callback) 
			callback(key);
	},time,'Actor.ai.wait');
}

Actor.endPath = function(act){
	act.useUpdateInput = act.type === CST.ENTITY.npc;
	Actor.timeout.remove(act,'Actor.followPath.goTo');	
	Actor.timeout.remove(act,'Actor.ai.wait');
	
	Actor.removePreset(act,'onFollowPathWait');
	
	act.targetSetting.updateMain = true;
	act.targetSetting.updateSub = true;
	//Actor.addPermBoost(act,'followPath');
	Actor.ai.resetSub(act);	//so sub doesnt have callback
}

//###########

Actor.ai.resetSub = function(act){
	act.targetSub = Actor.TargetSub(act.x,act.y);	//for sub doesnt have callback
}

Actor.ai.resetAbilityChangePress = function(act){
	act.abilityChange.press = Actor.AbilityChange.press();
}

Actor.ai.setTarget = function(act){
	if(act.type !== CST.ENTITY.npc) 
		return;
	//Main
	var actorTarget = act.targetMain.type === TARGET_TYPE.actor;
	var period = actorTarget ? act.targetSetting.periodMainActor : act.targetSetting.periodMainSpot;
	var mustChange = actorTarget && Actor.get(act.targetMain.targetId) && !Actor.get(act.targetMain.targetId).combat;
	if(mustChange || (act.targetSetting.updateMain && act.frame % period === 0))
		Actor.ai.setTarget.updateMain(act);
	
	//Sub	
	if(act.targetSetting.updateSub && act.frame % act.targetSetting.periodSub === 0){
		Actor.ai.setTarget.sub(act);
	}

}

Actor.ai.setTarget.getMainPos = function(act){	
	if(act.targetMain.type === TARGET_TYPE.spot) 
		return CST.pt(act.targetMain.x,act.targetMain.y);
	var tar = Actor.get(act.targetMain.targetId);
	if(!tar) 
		return Actor.toSpot(act);	//BAD... might have logged out
	return Actor.toSpot(tar);
}
var CHANCE_STOP_AGGRESION = 0.5;
var TIME_LAST_ATTACK = 5000;
Actor.ai.setTarget.updateMain = function(act){
	if(!act.combat) return;
	var targetList = {}; 
	var playerCount = 0;
	var fullHp = act.hp === act.hpMax;
	
	var now = Date.now();
	
	for (var i in act.activeList){
		var target = Actor.get(i);
		if(!target)  //aka not actor (ex: bullet)
			continue; 	
		if(target.type === CST.ENTITY.player) 
			playerCount++;
		if(!Combat.targetIf(act,target)) 
			continue;
		
		var dist = Collision.getDistancePtPt(act,target);
		var recentAtk = now - target.lastAttack < TIME_LAST_ATTACK;
		
		//if outside farthest => never aggressive
		if(dist > act.moveRange.farthest){
			continue;
		}
		
		if(dist > act.moveRange.aggressive){
			if(!act.aggressive && fullHp && !recentAtk)
				continue;
			var avg = (act.moveRange.aggressive + act.moveRange.farthest)/2;
			
			if(dist > avg && fullHp)	//a peacefully monster will attack player if hes within avg
				continue;
		}
		
		
		//if within aggresive => aggressive always
			
		
		targetList[i] = 1/(dist+100);
	}
	var chosen = targetList.$randomAttribute();
	if(!chosen){
		if(Math.random() < CHANCE_STOP_AGGRESION)
			act.aggressive = false;
		act.targetMain = Actor.TargetMain(null,act.x,act.y);
		Actor.ai.resetAbilityChangePress(act);
	} else {
		act.aggressive = true;
		Actor.addBoost(act,Combat.getEnemyPower(act,playerCount));
		if(act.targetMain.targetId !== chosen){
			act.targetMain = Actor.TargetMain(chosen);
			Actor.ai.updateInput.mouse(act);
			Actor.ai.updateInput.ability(act);
		}
	}
} 
		
Actor.ai.setTarget.sub = function(act){
	var tar = Actor.ai.setTarget.getMainPos(act);
	if(!tar) return;
	
	var rayon = (Math.randomML()*act.moveRange.confort*2)+act.moveRange.ideal;
	
	var count = 0;
	var x;
	var y;
	do {
		var angle = Math.random()*360;	//BAD, idk whats the point of maxAngleChange?
			//(act.angle+180) + Math.randomML()*act.targetSetting.maxAngleChange;	//pick random angle
		x = Tk.cos(angle)*rayon+tar.x;
		y = Tk.sin(angle)*rayon+tar.y;
	} while(Collision.testLineMap(act.map,act,CST.pt(x,y)) && ++count < 100)	//while reachable
	act.targetSub = Actor.TargetSub(x,y);
} 

Actor.isStuck = function(act,maintar){
	if(!maintar) return 0;
	var path = Collision.getPath(Collision.getPos(act),Collision.getPos(maintar));
	for(var i = 0; i < path.length; i++){
		if(Collision.testActorMap(path[i].x,path[i].y,act.map,act)) return 1;	
	}
	return 0;
}


})(); //{




