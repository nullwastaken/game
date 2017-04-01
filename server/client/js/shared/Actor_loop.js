
"use strict";
(function(){ //}
var Boss, Main, Entity, Collision, Sprite, MapModel, Game, Receive, Combat, QueryDb, ParticleEffect;
global.onReady(function(){
	Boss = rootRequire('server','Boss'); Main = rootRequire('shared','Main'); Entity = rootRequire('shared','Entity'); Collision = rootRequire('shared','Collision'); Sprite = rootRequire('shared','Sprite');
	ParticleEffect = rootRequire('server','ParticleEffect',true); MapModel = rootRequire('server','MapModel',true); Game = rootRequire('client','Game',true); Receive = rootRequire('client','Receive',true); Combat = rootRequire('server','Combat',true); QueryDb = rootRequire('shared','QueryDb',true);
	global.onLoop(Actor.loop);
	
	Actor.onChange(CST.CHANGE.onHit,Actor.onHitClient);
});
var Actor = rootRequire('shared','Actor');

var MAX_DIFF_MOVE_OUTSYNC = 10;
var INTERVAL_SUMMON = 5;
var INTERVAL_BOUNCE = 5;
    
Actor.loop = function(){	//server, for client check below
	Actor.loop.FRAME_COUNT++;
	for(var i in Actor.LIST)   
	    Actor.loop.forEach(Actor.LIST[i]);
	//Actor.setChangeAll in Send
}

Actor.onHitClient = function(act,data){
	if(act !== w.player)
		return ERROR(3,'onHit not on self');
	Main.screenEffect.drawLowLife.set(10,0.5);
	Main.addScreenEffect(Actor.getMain(act),Main.ScreenEffect.shake('stagger',null,null,2.5));
	ParticleEffect.create(function(emitter){
		ParticleEffect.applyModel(emitter,ParticleEffect.Model('#ff7777',10,1,1,1),1,act.x,act.y);
	},null,true);
}

Actor.loop.forEach = function(act){
	if(Actor.testInterval(act,5)) 
		Actor.updateActive(act);
	
	if(!act.active) 
		return;
	act.frame++;
	
	Actor.timeout.loop(act);
	
	if(act.dead) 
		return;	
	var isPlayer = act.type === CST.ENTITY.player;
	
	if(act.awareNpc){
		if(Actor.testInterval(act,25))
			Actor.activeList.update(act);
		if(Actor.testInterval(act,10)) 
			Actor.updateMapMod(act);
	}
		
	if(act.combat){
		if(act.hp <= 0 && !act.cantDie) 
			return Actor.die(act);
		if(act.boss) 
			Boss.loop(act.boss);
		Actor.ability.loop(act);
		Actor.resource.loop(act);    
		Actor.status.loop(act);
		act.staggerTimer--;
		Actor.summon.loop(act);
		Actor.attackReceived.loop(act); 	//used to remove attackReceived if too long
	}
	if(act.combat || isPlayer){	//cuz in town no combat...
		Actor.boost.loop(act);
	}
	if(isPlayer)
		Actor.bounce.loop(act);
		
	if(act.combat || act.move)
		Actor.ai.update(act);
	
	if(act.move && !isPlayer)
		Actor.move(act);  	//include pushable
}
Actor.loop.FRAME_COUNT = 0;

Actor.activeList = {};
Actor.activeList.update = function(act){
	Entity.updateActiveList(act);
}
Actor.updateActive = function(act){
	act.active = act.alwaysActive || !act.activeList.$isEmpty();	//need to be false for Send ?
}

Actor.timeout = {};
Actor.timeout.loop = function(act){
	for(var i in act.timeout){
		if(--act.timeout[i].timer < 0){
			if(!Actor.isOnline(act))
				return ERROR(3,'timeout actor but not online',act.username);
			var func = act.timeout[i].func;
			delete act.timeout[i];	//delete b4 so interval works
			Actor.timeout.loop.main(act,func);	
		}	
	}
}
Actor.timeout.loop.main = function(act,func){
	try {
		func(act.id);
	}catch(err){ 
		ERROR.err(3,err); 
	}
}

Actor.setTimeout = function(act,cb,time,name){
	if(typeof cb !== 'function') 
		return ERROR(3,'no a function',cb);
	if(time <= 0)
		return cb(act.id);
	
	name = name || Math.randomId();
	act.timeout[name] = Actor.Timeout(time,cb);
}
Actor.setInterval = function(act,cb,interval,name){
	Actor.setTimeout(act,function(){
		var res = cb(act.id);
		if(res === true)
			Actor.setInterval(act,cb,interval,name);
	},interval,name);
}

Actor.Timeout = function(time,func){
	return {timer:time,func:func};
}	

Actor.timeout.remove = function(act,name){
	delete act.timeout[name];
}	

Actor.summon = {};	//Combat.summon should be in more relation with that	Actor.summon.addChild
Actor.summon.loop = function(act){
	if(!Actor.testInterval(act,INTERVAL_SUMMON)) 
		return;
	
	//(assume act is child)
    if(act.summoned){
		var fat = Actor.get(act.summoned.parent);
		if(!fat || fat.dead) 
			return Actor.die(act);	//remove if parent dead
	    
	    //if too far, teleport near master
		if(Collision.getDistancePtPt(act,fat) >= act.summoned.distance){
			act.x = fat.x + Math.randomML()*5;
			act.y = fat.y + Math.randomML()*5;
			Actor.ai.resetSub(act);
		}	
		if(act.map !== fat.map)
			Actor.die(act);
		
		
		act.summoned.time -= INTERVAL_SUMMON;
		if(act.summoned.time < 0){
			Actor.remove(act);
		}
	}
}

var LAST_BOUNCE_INTERVAL = 35;
var BOUNCE_RANGE = 60;
var BOUNCE_MAGN = 15;
var BOUNCE_TIME = 5;
var BOUNCE_DMG = 50;
var OLD_MAP = '';

Actor.bounce = {};
Actor.bounce.loop = function(act){
	if(!Actor.testInterval(act,INTERVAL_BOUNCE)) 
		return;
	
	if(act.frame - act.lastBounce < LAST_BOUNCE_INTERVAL)
		return;
	
	if(!act.combat)
		return;
	
	for(var i in act.activeList){
		var e = Actor.get(i);
		if(!e || e.type !== CST.ENTITY.npc || !e.combat || !e.bounceDmgMod)
			continue;
		if(Collision.getDistancePtPt(e,act) > BOUNCE_RANGE)
			continue;
		var angle = Collision.getAnglePtPt(e,act);
		
		act.lastBounce = act.frame;
		Actor.addHp(act,-BOUNCE_DMG*e.bounceDmgMod,true);
		Actor.afflictManualKnock(act,angle,BOUNCE_MAGN,BOUNCE_TIME);
		Actor.playSfx(act,'strikeHit');
		Actor.setPrivateChange(act,CST.CHANGE.onHit,true);
		return;
	}
	

}

Actor.summon.removeFromParentList = function(act){	
	var parent = Actor.get(act.summoned.parent);
	if(parent && parent.summon[act.summoned.name]) 
		delete parent.summon[act.summoned.name].child[act.id];
}

Actor.attackReceived = {};
Actor.attackReceived.loop = function(act){
	if(!Actor.testInterval(act,25)) return;
	for(var i in act.attackReceived){
		act.attackReceived[i] -= 25;		//per second. doesnt depend on dmg, set at 500 on hit
		if(act.attackReceived[i] <= 0){
			delete act.attackReceived[i];
		}
	}
}

Actor.testInterval = function(act,num){
	return act.frame % num === 0;
}

Actor.testInterval.getStatic = function(){	//required cuz goal of testing xya every 2 frames is to not send package every frame...
	return Actor.loop.FRAME_COUNT;
}


if(!SERVER){ //}
	var LAST_ATTACK_PENALTY = 0;
	Actor.loop = function(){
		for(var i in Actor.LIST)
			Actor.loop.forEach(Actor.LIST[i]);
		Actor.loop.player(w.player);
		
		Actor.updateStatus();
		Actor.updateChatHead();
	}
	
	Actor.loop.forEach = function(act){
		if(act !== w.player)
			Actor.loop.updatePosition(act);

		Actor.HitHistoryToDraw.loop(act);
		Sprite.updateAnim(act);
		Sprite.updateFadeout(act);
		
		if(act.spriteFilter && --act.spriteFilter.time < 0)
			act.spriteFilter = null;
		Actor.loop.updateStatusSpriteFilter(act);
		Actor.updateStagger(act);
		
	}	
	
	Actor.loop.player = function(act){
		act.frame++;
		if(Actor.testInterval(act,10)) 
			Actor.updateMapMod(act);
		Actor.SpdMod.loop(act);	
		Actor.loop.applyAttackMovePenalty(act);
		Actor.status.loop(act);
		
		var spdMod = Tk.getFrameSpdMod('movePlayer');
		
		if(act.move){
			Actor.move(act,spdMod);
			Actor.move.updateAimPenalty(act);
		} else
			act.spdX = act.spdY = 0;			
		Actor.loop.forEach(act);		
		
		if(OLD_MAP !== act.map){
			OLD_MAP = act.map;
			Actor.questMarker.update(act);
		}
		
		if(Collision.getTileValue(Collision.getPos(CST.pt(act.x,Actor.getSpriteLegY(act))),act.map,'raw') === +CST.MAP_TILE.slow)
			Actor.setSpdMod(act,'mapSlowTile',0.5,2);
		
		if(Game.getBotWatch()){
			act.x = (act.x + act.serverX)/2;
			act.y = (act.y + act.serverY)/2;
		}
		if(act.frame % 100 === 0){
			var equip = Actor.getEquip(act);
			for(var i in equip.piece){	//so sure loaded for equip win
				if(equip.piece[i]){
					QueryDb.get('item',equip.piece[i]);
					QueryDb.get('equip',equip.piece[i]);
				}
			}
		}
	}
		
	Actor.loop.updateStatusSpriteFilter = function(act){
		if(act.statusClient[0] === '1' || act.statusClient[3] === '1')	//bleed burn
			act.spriteFilter = Actor.SpriteFilter('red',3);
		else if(act.statusClient[1] === '1' || act.statusClient[4] === '1')	//knock chill
			act.spriteFilter = Actor.SpriteFilter('blue',3);
		else if(act.statusClient[2] === '1' || act.statusClient[5] === '1')	//drain stun
			act.spriteFilter = Actor.SpriteFilter('green',3);
	}
	
	Actor.loop.applyAttackMovePenalty = function(act){
		if(--LAST_ATTACK_PENALTY >= 0)
			return;
		var input = Actor.getAbilityPress(act);
		var ab = Actor.getAbility(act);
		for(var i = 0 ; i < input.length; i++){
			if(!input[i]) continue;
			if(!ab[i]) continue;
			var a = QueryDb.get('ability',ab[i]);
			if(!a) continue;
			if(a.type !== CST.ABILITY.attack)
				continue;
			LAST_ATTACK_PENALTY = a.periodOwn;
			Actor.onAttack(act);
		}
	}
	
	Actor.loop.updatePosition = function(act){	//for npc
		if(act.pushable || act.block){
			act.x = (act.x + act.serverX)/2;
			act.y = (act.y + act.serverY)/2;
			return;
		}
		
		
		if(Receive.getFrameTilLastUpdate() > 3){
			act.serverX += act.spdX / 2;
			act.serverY += act.spdY / 2;
			act.outOfSyncCount += 1/2;
		}
		
		var diffX = act.serverX - act.x;
		var diffY = act.serverY - act.y;
		
		var MAX_DIFF_MOVE = act.outOfSyncCount > 0 ? MAX_DIFF_MOVE_OUTSYNC : 1000;
		
		//var goalX = (act.serverX + act.x)/2;
		//var goalY = (act.serverX + act.x)/2;
		while(Math.abs(diffX) > MAX_DIFF_MOVE)
			diffX /= 1.1;
		act.x = act.x + diffX / 2;	//divide by 2 cuz send every 2 frame
		
		while(Math.abs(diffY) > MAX_DIFF_MOVE)
			diffY /= 1.1;
		act.y = act.y + diffY / 2;	//divide by 2 cuz send every 2 frame
		
		//act.y = (act.serverY + act.y)/2;
		
		if(Receive.getFrameTilLastUpdate() === 0){
			if(act.outOfSyncCount > 0)
				act.outOfSyncCount--;
			act.spdX = diffX / 2;	//cuz data sent every 2 frames...
			act.spdY = diffY / 2;
		}
		
	}

	Actor.kill = function(){}	//TEMP BAD
	
	/*
	variable = amount of frame til last server update
		if amount > 3
			act.serverX += spdX
	
	
	if no update from server for a while
		assume npc moves at same speed than b4
	
	
	
	*/

	
	
	
	

}
})(); //{

