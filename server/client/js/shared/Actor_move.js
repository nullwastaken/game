
"use strict";
(function(){ //}
var Collision, MapModel, Sign;
global.onReady(function(){
	Collision = rootRequire('shared','Collision'); Sign = rootRequire('private','Sign');
	MapModel = rootRequire('server','MapModel',true);
});
var Actor = rootRequire('shared','Actor');


var DESYNC_DIST = 200;
var FALL_ARRAY = [[1,0,0],[0,1,90],[-1,0,180],[0,-1,270],[1,1,45],[-1,1,135],[-1,1,225],[1,-1,315],];

Actor.Bumper = Actor.MoveInput = function(){
	return {
		right:false,
		left:false,
		down:false,
		up:false,
	}
}
Actor.bumper = {};
Actor.bumper.update = function(act){	//HOTSPOT
	if(act.ghost){
		Actor.bumper.update.ghost(act);
		return;
	}
	
	if(Actor.testInterval(act,3) || act.type === CST.ENTITY.player){
		Actor.bumper.update.regular(act);
		return;
	}
	
	Actor.bumper.update.cheap(act);
}
Actor.bumper.update.ghost = function(act){
	for(var i in act.bumper)
		act.bumper[i] = false;
}
Actor.bumper.update.regular = function(act){
	for(var i in act.bumper){
		act.bumper[i] = Collision.testActorMap(
			Math.floor((act.x + act.sprite.bumperBox[i].x)/32),
			Math.floor((act.y + act.sprite.bumperBox[i].y)/32),
			act.map,
			act
		);
	}
}

Actor.bumper.update.cheap = function(act){
	//for npc, update every 3 frames or if spd more than 7
	//HCODE for efficiency, should use Collision.ptToPos
	if(act.spdX > 7) 
		act.bumper.right = Collision.testActorMap(Math.floor((act.x + act.sprite.bumperBox.right.x)/32),Math.floor((act.y + act.sprite.bumperBox.right.y)/32),act.map,act);
	else if(act.spdX < -7) 
		act.bumper.left = Collision.testActorMap(Math.floor((act.x + act.sprite.bumperBox.left.x)/32),Math.floor((act.y + act.sprite.bumperBox.left.y)/32),act.map,act);
	if(act.spdY > 7) 
		act.bumper.down = Collision.testActorMap(Math.floor((act.x + act.sprite.bumperBox.down.x)/32),Math.floor((act.y + act.sprite.bumperBox.down.y)/32),act.map,act);
	else if(act.spdY < -7) 
		act.bumper.up = Collision.testActorMap(Math.floor((act.x + act.sprite.bumperBox.up.x)/32),Math.floor((act.y + act.sprite.bumperBox.up.y)/32),act.map,act);	
}	

Actor.bumper.getUpdated = function(act,x,y){
	if(act.ghost){
		return Actor.Bumper();
	}
	var ret = {};
	for(var i in act.bumper)
		ret[i] = Collision.testActorMap(
			Math.floor(((x || act.x)+ act.sprite.bumperBox[i].x)/32),
			Math.floor(((y || act.y) + act.sprite.bumperBox[i].y)/32),
			act.map,
			act
		);
	return ret;
}

Actor.bumper.testStuck = function(act,kill){	//quick fix if manage to past thru wall
	if(Actor.isAdmin(act))
		return;
	if(kill)
		act.bumper = Actor.bumper.getUpdated(act);
	for(var i in act.bumper)
		if(!act.bumper[i]) 
			return;
	if(kill)
		Actor.kill(act);
	else
		Actor.setTimeout(act,function(){	//3 sec to get unstuck
			Actor.kill(act,true);
		},25*3,'onStuck');
}

Actor.moveBy = function(act,x,y){
	if(Math.abs(x) > 25 || Math.abs(y) > 25) 
		return ERROR(3,'this is only meant for small variation. use Actor.afflictManualKnock instead');
	if(!act.bumper.right && x > 0)
		act.x += x;
	if(!act.bumper.left && x < 0)
		act.x += x;
	if(!act.bumper.down && y > 0)	
		act.y += y;
	if(!act.bumper.up && y < 0)	
		act.y += y;
}

Actor.fall = function(act){	//default fall
	var map = MapModel.get(act.map);
	if(map.fall) 
		map.fall(act.id);
	else 
		Actor.kill(act);
}

Actor.move = function(act,spdMod){	//if shaking, cuz add acc vs not adding acc is too big
	spdMod = spdMod === undefined ? 1 : spdMod;
	
	if(act.pushable) 
		return Actor.pushable.update(act);
	Actor.bumper.update(act);   //test if collision with map    
		
	if(act.bumper.right)
		act.spdX = act.bumper.left ? 0 : -Math.abs(act.spdX*0.5)*act.bounce - act.bounce;	//0 if blocked right and left
	else if(act.bumper.left)
		act.spdX = Math.abs(act.spdX*0.5)*act.bounce + act.bounce;
	if(act.bumper.down)
		act.spdY = act.bumper.up ? 0 : -Math.abs(act.spdY*0.5)*act.bounce - act.bounce;
	else if(act.bumper.up)
		act.spdY = Math.abs(act.spdY*0.5)*act.bounce + act.bounce; 
	
	if(Actor.canAccelerate(act)){
		if(act.moveInput.right && !act.bumper.right && act.spdX < act.maxSpd)
			act.spdX = Math.min(act.maxSpd,act.spdX + act.acc);
		else if(act.moveInput.left && !act.bumper.left && act.spdX > -act.maxSpd)
			act.spdX = Math.max(-act.maxSpd,act.spdX - act.acc);

		if(act.moveInput.down && !act.bumper.down && act.spdY < act.maxSpd)
			act.spdY = Math.min(act.maxSpd,act.spdY + act.acc);
		else if(act.moveInput.up && !act.bumper.up && act.spdY > -act.maxSpd)
			act.spdY = Math.max(-act.maxSpd,act.spdY - act.acc);
	}
	
	//Friction + Min Spd
	if (Math.abs(act.spdX) < 0.1)
		act.spdX = 0;
	if (Math.abs(act.spdY) < 0.1)
		act.spdY = 0;
	act.moveAngle = Tk.atan2(act.spdY,act.spdX);
	
	spdMod *= Actor.getSpdMod(act);
	var dist = Math.abs(act.spdY) + Math.abs(act.spdX);
	var amount = Math.ceil(dist/31);
	if(amount < 2){
		act.x += act.spdX * spdMod;
		act.y += act.spdY * spdMod;
	} else {    //aka could pass thru walls => move step by step and test bumper every time
		for(var i = 0 ; i < amount && !act.bumper.right && !act.bumper.down && !act.bumper.left && !act.bumper.up; i++){
			act.x += act.spdX/amount * spdMod;
			act.y += act.spdY/amount * spdMod;
			Actor.bumper.update(act);
		} 
	} 
	act.spdX *= act.friction;
	act.spdY *= act.friction;
	
	if(act.type === CST.ENTITY.player && Actor.testInterval(act,3))	//TEMP BAD
		Actor.move.testFall(act);
	
}

Actor.getSpdMod = function(act){
	var mul = 1;
	for(var i in act.spdMod)
		mul *= act.spdMod[i].time > 0 ? act.spdMod[i].value : 1;
	return mul; 
}

Actor.SpdMod = function(){
	return {
		chill:{value:1,time:0},
		aimWhileAttacking:{value:1,time:0},
		stun:{value:1,time:0},
		attack:{value:1,time:0},
		mapSlowTile:{value:1,time:0},
	}
}

Actor.setSpdMod = function(act,what,value,time){	//same as Actor.boost but for client...
	act.spdMod[what].value = value;
	act.spdMod[what].time = time;	
}

Actor.SpdMod.loop = function(act){
	for(var i in act.spdMod)
		act.spdMod[i].time--;
}

Actor.canAccelerate = function(act){
	return act.status.knock.time <= 0;
}	

Actor.move.updateAimPenalty = function (act){
	if(!Actor.isPressingAbility(act)){
		Actor.setSpdMod(act,'aimWhileAttacking',1,0);
		return;	
	}
	//penalty if looking and moving in opposite direction
	var diffAim = Math.abs(act.angle - act.moveAngle);
	if (diffAim > 180)
		diffAim = 360 - diffAim;
		
	var val;	
	if(diffAim > 135) val = 0.3;
	else if(diffAim > 90) val = 0.4;
	else if(diffAim > 45) val = 0.5;
	else val = 0.6;
	
	Actor.setSpdMod(act,'aimWhileAttacking',val,8);
	
	//Actor.addBoost(act,Boost.create('Aim','maxSpd',Math.pow(1-diffAim/360,1.5),4,"*"));
}

Actor.move.testFall = function(act){
	if(!SERVER) 
		return;
	var xy = CST.pt(act.x +act.sprite.bumperBox.down.x,act.y + act.sprite.bumperBox.right.y);	//center of bumper
	xy = Collision.getPos(xy);
	var value = Collision.getTileValue(xy,act.map,act.type);
	
	if(value === CST.MAP_TILE.fall)
		Actor.fall(act);
	if(value === CST.MAP_TILE.fallClose){ 
		var list = FALL_ARRAY;	
		for(var i in list){
			if(Collision.getTileValue(CST.pt(xy.x+list[i][0],xy.y+list[i][1]),act.map,act.type) === CST.MAP_TILE.fall){
				Actor.movePush(act,list[i][2],5,5);
				break;
			}
		}
	}
}


//#################################

var LAST_POS_UPDATE = {};	//memory leak
var CHEATING_COUNT = {}; //memory leak
global.cheating = null;

var getMaxSpdMod = function(act,timestamp){
	if(!timestamp){
		if(global.cheating !== null)
			global.cheating += 'no timestamp';
		return;
	}
	if(!LAST_POS_UPDATE[act.id]){
		LAST_POS_UPDATE[act.id] = timestamp || 1;
		return 1;
	}
	var now = Date.now();
	
	if(timestamp > now + 5000){
		if(global.cheating !== null)
			global.cheating += LAST_POS_UPDATE[act.id] + ',' + timestamp + ' now + 1000';
		return null;
	}
	if(timestamp < now-30000){
		if(global.cheating !== null)
			global.cheating += now  + ',' + timestamp + ' now - 30000';
		return null;
	}
	if(LAST_POS_UPDATE[act.id] > timestamp){	//must NO update LAST_POS_UPDATE, otherwise can cheat
		return 1;
	}
	
	var vt = timestamp - LAST_POS_UPDATE[act.id];
	LAST_POS_UPDATE[act.id] = timestamp;
	var diff = vt / CST.MSPF;
	if(diff < 0.1){
		if(global.cheating !== null)
			global.cheating += vt  + ' WAY too fast';
		return null;
	}
	diff = Tk.minmax(diff,0.1,2);	//0.1 cuz
	
	return diff;	
}
var verifyCheating = function(act,slowComputerAdjust){
	CHEATING_COUNT[act.id] = CHEATING_COUNT[act.id] || 0;
	
	if(CHEATING_COUNT[act.id] > 0)
		CHEATING_COUNT[act.id] -= 0.001;
	
	if(slowComputerAdjust === null){	//aka cheating
		if(CHEATING_COUNT[act.id]++ > 100){
			//Sign.off(act.id,'The system detected that you are moving unusually faster than you should.');
			ERROR(3,'cheating onPositionInput',act.name);
			CHEATING_COUNT[act.id] = -10000000000;	//TEMP IMPORTANT
		}
	}
}

global.sendInput = '';

Actor.onPositionInput = function(act,clientX,clientY,usedTeleport,timestamp){	//Input received
	if(usedTeleport && Actor.isAdmin(act)){
		act.x = clientX;
		act.y = clientY;
		return;
	}
	if(!act.move)
		return;
	
	
	
	var slowComputerAdjust = getMaxSpdMod(act,timestamp);
	verifyCheating(act,slowComputerAdjust);
	slowComputerAdjust = slowComputerAdjust || 1;
	
	var max = act.maxSpd*1.2*slowComputerAdjust;	//20% loose
	
	max = Math.min(31,max);
	
	
	var diffX = clientX - act.x;
	var diffY = clientY - act.y;
	
	var cappedDX = diffX;
	var cappedDY = diffY;
	
	if(cappedDX < -max) 
		cappedDX = -max;
	else if(cappedDX > max) 
		cappedDX = max;
	if(cappedDY < -max) 
		cappedDY = -max;
	else if(cappedDY > max) 
		cappedDY = max;
	
	var accepted = true;
	if(Math.abs(diffX) > DESYNC_DIST || Math.abs(diffY) > DESYNC_DIST){
		accepted = false;
		Actor.setXY(act,act.x,act.y);
	} else {
		var newX = act.x + cappedDX;
		var newY = act.y + cappedDY;
		
		if(!((act.bumper.right && diffX > 0) || (act.bumper.left && diffX < 0))){
			act.x = newX;			
		}
		if(!((act.bumper.down && diffY > 0) || (act.bumper.up && diffY < 0))){
			act.y = newY;			
		}
		act.bumper = Actor.bumper.getUpdated(act);	//BAD
		Actor.bumper.testStuck(act);
	}
	
	
	if(global.sendInput && act.name === global.sendInput)
		Actor.addMessage(act,'max=' + Math.floor(max) + ',sentY=' + Math.floor(clientY) + ',dY=' + Math.floor(diffY) + ',good=' + (+accepted));
	
	
	
}








Actor.pushable = {};
Actor.pushable.update = function(act){
	if(act.pushable.timer-- <= 0) return;
	act.x += Tk.cos(act.pushable.angle) * act.pushable.magn;
	act.y += Tk.sin(act.pushable.angle) * act.pushable.magn;
}

Actor.updateMapMod = function(act){
	act.mapMod = {};
	var list = Actor.getActiveList(act);
	
	for(var i in list){
		var actBlock = Actor.get(i);
		if(!actBlock || !actBlock.block) continue;	//normal no act cuz idk if actor
		var b = actBlock.block;
		if(!b.impactPlayer && act.type === CST.ENTITY.player) continue;
		if(!b.impactNpc && act.type === CST.ENTITY.npc) continue;
		
		var pos = Collision.getPos(actBlock);
		
		for(var j = 0; j < b.size.width; j++){
			var x = pos.x + b.size.x + j;
			for(var k = 0; k < b.size.height; k++){
				var y = pos.y + b.size.y + k;
				act.mapMod[x + '-' + y] = b.value;
			}
		}
	}
};
Actor.getActiveList = function(act){
	return SERVER ? act.activeList : Actor.LIST;
}


Actor.getBulletCollisionMapModList = function(){	//note: Collision MAP_MOD also impact npc with no awareNpc...
	var toReturn = [];
	for(var i in Actor.LIST){
		var act = Actor.LIST[i];
		if(!act || !act.block || (!act.block.impactNpc && !act.block.impactBullet)) 
			continue;
		
		var b = act.block;
		var pos = Collision.getPos({
			x:act.x-1,
			y:act.y-1
		});
			
		for(var j = 0; j < b.size.width; j++){
			var x = pos.x + b.size.x + j;
			for(var k = 0; k < b.size.height; k++){
				var y = pos.y + b.size.y + k;
				toReturn.push({map:act.map,x:x,y:y});
			}
		}
	}
	return toReturn;
}


Actor.getDistance = function(act,act2){
	return Collision.getDistancePtPt(act,act2);
}

})(); //{




