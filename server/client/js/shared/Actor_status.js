
"use strict";
(function(){ //}
var Boost, Socket, AttackModel;
global.onReady(function(){
	AttackModel = rootRequire('shared','AttackModel');  Boost = rootRequire('shared','Boost'); Socket = rootRequire('private','Socket');
	
	if(!SERVER)
		Socket.on(CST.SOCKET.statusEffect,function(data){
			if(w.player.name)	//BAD aka loaded
				Actor.afflictStatus(w.player,data);
		});
});
var Actor = rootRequire('shared','Actor');


var INTERVAL_STATUS = 3;
var INTERVAL_STATUS_DMG = 9;

Actor.Status = function(){
	return {
		bleed:{time:0,magn:0},				//fixed dmg per frame, fast but short
		knock:{time:0,magn:0,angle:0},	//push
		drain:{time:0,magn:0},				//leech mana
		burn:{time:0,magn:0},				//dmg/frame depending on hp, long but slow
		chill:{time:0,magn:0},				//slower move
		stun:{time:0,magn:0},				//stun, remove attack charge
	};
}

Actor.StatusResist = function(bleed,knock,drain,burn,chill,stun){
	return {
		bleed:bleed || 0,
		knock:knock || 0,
		drain:drain || 0,
		burn:burn || 0,
		chill:chill || 0,
		stun:stun || 0,
	}
}

//#################

Actor.afflictStatus = function(act,b){
	for(var i in CST.element.toStatus){
		var el = CST.element.toStatus[i];
		if(b[el] && b[el].chance >= Math.random()){
			if(el === 'burn') Actor.afflictStatus.burn(act,b);
			else if(el === 'stun') Actor.afflictStatus.stun(act,b);
			else if(el === 'bleed') Actor.afflictStatus.bleed(act,b);
			else if(el === 'chill') Actor.afflictStatus.chill(act,b);
			else if(el === 'drain') Actor.afflictStatus.drain(act,b);
			else if(el === 'knock') Actor.afflictStatus.knock(act,b);
		}
	}	
}
	
Actor.afflictStatus.burn = function(act,b){	
	act.status.burn.time = b.burn.time*(1-act.statusResist.burn); 
	act.status.burn.magn = b.burn.magn*(1-act.statusResist.burn); 
}

Actor.afflictStatus.stun = function(act,b){
	act.status.stun.time = b.stun.time*(1-act.statusResist.stun);
	if(SERVER && Actor.isPlayer(act)){
		var s = Socket.get(act.id);
		s.emit(CST.SOCKET.statusEffect,{stun:b.stun});
		return;
	}
	act.status.stun.magn = b.stun.magn*(1-act.statusResist.stun);
	
	if(Actor.isPlayer(act))
		Actor.setSpdMod(act,'stun',0,act.status.stun.time);
	else
		Actor.addBoost(act,Boost.create('stun','maxSpd',0,act.status.stun.time,CST.BOOST_X)); 
	
	for(var i in act.abilityChange.charge){
		act.abilityChange.charge[i] /= Math.max(act.status.stun.magn,1);
	}
}

Actor.afflictStatus.bleed = function(act,b){
	act.status.bleed.time = b.bleed.time*(1-act.statusResist.bleed)
	act.status.bleed.magn = b.bleed.magn;
	
	Actor.onAfflictBleed(act,b);
}

Actor.afflictStatus.chill = function(act,b){
	act.status.chill.time = b.chill.time*(1-act.statusResist.chill);
	
	if(SERVER && Actor.isPlayer(act)){
		var s = Socket.get(act.id);
		s.emit(CST.SOCKET.statusEffect,{chill:b.chill});
		return;
	}
	
	act.status.chill.magn = (1/b.chill.magn)*(1-act.statusResist.chill);
	Actor.setSpdMod(act,'chill',act.status.chill.magn,act.status.chill.time);
	//Actor.addBoost(act,Boost.create('chill','maxSpd',act.status.chill.magn,act.status.chill.time,CST.BOOST_X));
}

Actor.afflictStatus.knock = function(act,b,overwriteAngle){
	act.status.knock.time = b.knock.time*(1-act.statusResist.knock);
	act.status.knock.magn = b.knock.magn*(1-act.statusResist.knock);
	
	if(SERVER){
		var angle;
		if(overwriteAngle !== undefined)
			angle = overwriteAngle;
		else if(b.type === CST.ENTITY.bullet)
			angle = b.moveAngle;
		else
			angle = Tk.getAnglePtPt(b,act);
		
		if(Actor.isPlayer(act)){
			var s = Socket.get(act.id);
			var knock = Tk.deepClone(b.knock);
			if(knock.magn > act.maxSpd*4){
				knock.magn = Math.max(20,act.maxSpd*4);
				//ERROR(3,'knock magn too high',knock.magn,act.map);
			}
			knock.moveAngle = angle;
			s.emit(CST.SOCKET.statusEffect,{knock:knock});
			return;
		} else {
			act.status.knock.angle = angle;
		}
	}
	
	if(!SERVER){
		act.status.knock.angle = b.knock.moveAngle || 0;
	}
	
	
	//Actor.addBoost(act,Boost.create('knock','acc',0,act.status.knock.time,CST.BOOST_X));
}

Actor.afflictManualKnock = function(act,angle,magn,time){
	var knock = AttackModel.Status(1,magn,time);
	Actor.afflictStatus.knock(act,{knock:knock},angle);
}


Actor.afflictStatus.drain = function(act,b){
	var atker = Actor.get(b.parent); 
	if(!atker) 
		return;
	
	var time = act.status.drain.time = b.drain.time*(1-act.statusResist.drain); 
	var magn = act.status.drain.magn = b.drain.magn*(1-act.statusResist.drain);	
	
	Actor.addBoost(act,Boost.create('drainBad','mana-regen',1/4,time,CST.BOOST_PLUS)); 
	atker.mana = Math.min(atker.manaMax,atker.mana + magn);
	act.mana = Math.max(0,act.mana - magn);
}

//Loop
Actor.status = {};
Actor.status.loop = function(act){
	if(!Actor.testInterval(act,INTERVAL_STATUS)) 
		return;
	
	Actor.status.loop.burn(act);
	Actor.status.loop.bleed(act);
	Actor.status.loop.knock(act);
	Actor.status.loop.stun(act);
	Actor.status.loop.chill(act);
	Actor.status.loop.drain(act);
	
	if(SERVER)
		Actor.status.updateStatusClient(act);
}

Actor.status.updateStatusClient = function(act){
	act.statusClient = '';
	for(var i = 0 ; i < CST.status.list.length; i++)	
		act.statusClient += act.status[CST.status.list[i]].time > 0 ? '1' : '0';
}

Actor.status.loop.stun = function(act){
	if(act.status.stun.time > 0) 
		act.status.stun.time -= INTERVAL_STATUS;
}

Actor.status.loop.chill = function(act){
	if(act.status.chill.time > 0) 
		act.status.chill.time -= INTERVAL_STATUS;
}

Actor.status.loop.drain = function(act){
	if(act.status.drain.time > 0) 
		act.status.drain.time -= INTERVAL_STATUS;
}

Actor.status.loop.knock = function(act){
	var status = act.status.knock;
	if(status.time > 0){
		status.time -= INTERVAL_STATUS;
		act.spdX = Tk.cos(status.angle)*status.magn;
		act.spdY = Tk.sin(status.angle)*status.magn;
	}
}

var BURN_MAX_HP_MOD = 1/3;
Actor.status.loop.burn = function(act){
	var status = act.status.burn;
	if(status.time > 0){
		status.time -= INTERVAL_STATUS;
		var def = Actor.getRawGlobalDef(act); //no lvl scale
		var hp = Math.min(act.hp, act.hpMax*BURN_MAX_HP_MOD);
		var val = -status.magn*hp*INTERVAL_STATUS/def;
		val += Math.random() < 0.25 ? 0 : -1;	//so not always same number
		Actor.addHp(act,val);
		if(Actor.testInterval(act,INTERVAL_STATUS_DMG)) 
			Actor.addHitHistory(act,val*INTERVAL_STATUS_DMG/INTERVAL_STATUS);	
	}
}

Actor.status.loop.bleed = function(act){
	var status = act.status.bleed;
	if(status.time > 0){
		status.time -= INTERVAL_STATUS;
		var def = Actor.getRawGlobalDef(act);	//no lvl scale
		var val = -status.magn*INTERVAL_STATUS/def;
		val += Math.random() < 0.25 ? 0 : -1; //so not always same number
		Actor.addHp(act, val);
		if(Actor.testInterval(act,INTERVAL_STATUS_DMG)) 
			Actor.addHitHistory(act,val*INTERVAL_STATUS_DMG/INTERVAL_STATUS);
	}
}

//Clear
Actor.clearStatus = function(act){
	Actor.clearStatus.burn(act);
	Actor.clearStatus.knock(act);
	Actor.clearStatus.bleed(act);
	Actor.clearStatus.stun(act);
	Actor.clearStatus.chill(act);
	Actor.clearStatus.drain(act);
	Actor.status.updateStatusClient(act);
};

Actor.clearStatus.burn = function(act){ 
	act.status.burn.time = 0; 
} 

Actor.clearStatus.knock = function(act){ 
	act.status.knock.time = 0; 
}

Actor.clearStatus.bleed = function(act){ 
	act.status.bleed.time = 0; 
}

Actor.clearStatus.stun = function(act){ 
	act.status.stun.time = 0;
	Actor.boost.removeById(act,'maxSpd','stun');
}

Actor.clearStatus.chill = function(act){ 
	act.status.chill.time = 0;
	Actor.boost.removeById(act,'maxSpd','chill');
}

Actor.clearStatus.drain = function(act){ 
	act.status.drain.time = 0;
	Actor.boost.removeById(act,'mana-max','drainBad');
}

})();








