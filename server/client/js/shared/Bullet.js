
"use strict";
(function(){ //}
var Maps, Sprite, Combat, Entity, Attack, Main, BulletModel, SpriteModel, Actor, Collision, ParticleEffect;
global.onReady(function(){
	SpriteModel = rootRequire('shared','SpriteModel',true); ParticleEffect = rootRequire('shared','ParticleEffect',true); BulletModel = rootRequire('shared','BulletModel'); Main = rootRequire('shared','Main'); Attack = rootRequire('shared','Attack'); Maps = rootRequire('server','Maps'); Sprite = rootRequire('shared','Sprite'); Combat = rootRequire('server','Combat'); Entity = rootRequire('shared','Entity'); Actor = rootRequire('shared','Actor'); Collision = rootRequire('shared','Collision');
	
	Entity.onPackReceived(Entity.TYPE.bullet,Bullet.createFromInitPack);
	global.onLoop(Bullet.loop);
	Attack.onCreate(CST.ENTITY.bullet,Bullet.create);
});
var Bullet = exports.Bullet = function(extra,act,custom){
	BulletModel.call(this);
	Attack.call(this,null,act,custom)
	
	Tk.fillExtra(this,extra);
}

var COMPRESS_NAME = {fireball:1,shadowball:2,tornado:3,iceshard:4,lightningball:5,arrow:6,spore:7,boomerang:8};	//no 0, cuz name ||

var COMPRESS_DAMAGE_IF = {never:0,always:1,player:2,npc:3};
var DECOMPRESS_DAMAGE_IF = ['never','always','player','npc'];

var DECOMPRESS_NAME = ['','fireball','shadowball','tornado','iceshard','lightningball','arrow','spore','boomerang']
var LIST = Bullet.LIST = {};

var SIN_DELAY = 2;

Bullet.create = function(model,act,custom){
	var b = new Bullet(model,act,custom);
	if(b.parabole){
		var diff = Math.pyt(b.mouseX,b.mouseY);
		b.parabole.dist = Math.min(Math.max(diff,b.parabole.min),b.parabole.max);	
		b.parabole.timer *= b.parabole.dist/b.parabole.max;
	}
	if(b.onMove)
		b.angle = Math.random()*360;	//otherwise, circle always the same. moveAngle is same tho
	b.crX = b.x;
	b.crY = b.y;
	
	if(b.sin)
		b.maxTimer += b.num * SIN_DELAY;
	
	Bullet.setNormal(b);
	
	if(b.parent && Actor.isPlayer(b.parent))
		b.sprite.name = Main.contribution.getBullet(Actor.getMain(Actor.get(b.parent)),b.sprite.name);
	
	Bullet.addToList(b);
	Entity.addToList(b);
	Maps.enter(b);
	
	return b;
}

Bullet.remove = function(b){
	if(typeof b === 'string') 
		b = LIST[b];
	if(SERVER)
		Maps.leave(b);
	Entity.removeFromList(b.id);
	Bullet.removeFromList(b.id);
}

Bullet.addToList = function(bullet){
	LIST[bullet.id] = bullet;
}

Bullet.removeFromList = function(id){
	delete LIST[id]; 
}

Bullet.doInitPack = function(obj,player){
	var extra = {};
	if(obj.ghost)
		extra.ghost = obj.ghost;
	if(obj.boomerang){
		extra.boomerang = obj.boomerang;
		extra.parent = obj.parent;
	}
	if(obj.sin){
		extra.sin = obj.sin;
		extra.num = obj.num;
	}
	if(obj.parabole){
		extra.parabole = obj.parabole;
		extra.num = obj.num;
	}
	if(obj.damageIfMod)
		extra.damageIfMod = obj.damageIfMod;
	
	var damageIf = COMPRESS_DAMAGE_IF[obj.damageIf] || 0;
	if(obj.pierce)
		damageIf = 0;
	
	var	draw = [
		Entity.TYPE.bullet,	
		Math.round(obj.x),	//1
		Math.round(obj.y),
		Math.round(obj.moveAngle),	 //3
		COMPRESS_NAME[obj.sprite.name] || obj.sprite.name,
		obj.sprite.sizeMod,	//5
		obj.sprite.lightingEffect,
		obj.spd,//7
		damageIf, 
		obj.parent,//9
	];
	
	if(obj.maxTimer !== CST.BULLET_MAXTIMER)
		draw.push(obj.maxTimer);
	
	if(!extra.$isEmpty())
		draw.push(extra);	
		
	return draw;
}

Bullet.undoInitPack = function(obj,id,timeDiff){
	var frameLate = Math.floor(timeDiff/40);
	
	var spriteName = DECOMPRESS_NAME[obj[4]] || obj[4];
	var b = new Bullet({
		id:id,
		x:obj[1],
		crX:obj[1],
		y:obj[2],
		crY:obj[2],
		map:w.player.map,
		mapModel:w.player.map,
		angle:obj[3],
		crAngle:obj[3],
		moveAngle:obj[3],
		type:CST.ENTITY.bullet,
		sprite:Sprite.create(spriteName,obj[5],obj[6],CST.ENTITY.bullet),
		spd:obj[7],
		damageIf:DECOMPRESS_DAMAGE_IF[obj[8]],
		frameLate:frameLate,
		parent:obj[9],
	});
	if(typeof obj[10] === 'number'){
		b.maxTimer = obj[10];
		Tk.fillExtra(b,obj[11]);
	} else
		Tk.fillExtra(b,obj[10]);	//might be undefined
	
	Bullet.setNormal(b);
	return b;
}

Bullet.createFromInitPack = function(obj,id,timeDiff){
	var b = Bullet.undoInitPack(obj,id,timeDiff);
	Bullet.addToList(b);
	Entity.addToList(b);
	Bullet.initParticle(b);
}

Bullet.initParticle = function(b){
	var model = Bullet.getParticleModel(b);
	if(!model)
		return;
	if(!b.sprite.lightingEffect)
		model = ParticleEffect.Model(model.color,model.quantity/4,model.size,model.frequency,model.life);	//BAD
	
	var alreadyExploded = false;
	ParticleEffect.create(function(emitter){
		ParticleEffect.applyModel(emitter,model,b.sprite.sizeMod,b.x,b.y);
	},function(emitter){
		emitter.p.x = b.x;
		emitter.p.y = b.y;
		var remove = !LIST[b.id];
		if(!alreadyExploded && remove){
			alreadyExploded = true;
			ParticleEffect.create(function(emitter){
				ParticleEffect.applyModel(emitter,ParticleEffect.Model(model.color,10,1,0.01,0.5),b.sprite.sizeMod*1.5,b.x,b.y);
			},null,true);
		}
		
		return remove;
	});
}

Bullet.getParticleModel = function(b){
	return SpriteModel.get(b.sprite.name).particleEffect;
}

Bullet.setNormal = function(b){
	b.normal = !b.sin && !b.parabole && !b.boomerang;
}
//##########################

Bullet.loop = function(){
	for(var i in LIST)
		Bullet.loop.forEach(LIST[i]);
}

Bullet.loop.forEach = function(b,spdMod){
	Bullet.verifyCollision(b);
	Bullet.move(b);
	
	if(b.onMove) 
		Bullet.onMove(b);
	if(++b.timer >= b.maxTimer || b.toRemove || !Actor.get(b.parent))
		Bullet.remove(b);
}

Bullet.onMove = function(b){ //A bullet that shoots other bullets/strikes
	b.angle += b.onMove.rotation;
	if(b.timer % b.onMove.period === 0){
		Combat.attack(b,b.onMove.attack);
	}
}

Bullet.move = function(b,frameAdjust){
	frameAdjust = frameAdjust || 1;
	if(b.normal) 
		return Bullet.move.normal(b,frameAdjust);
	if(b.sin) 
		return Bullet.move.sin(b);
	if(b.parabole) 
		Bullet.move.parabole(b);
	if(b.boomerang) 
		Bullet.move.boomerang(b);
}

Bullet.move.normal = function(b,frameAdjust){
	b.x += b.spd * frameAdjust * Tk.cos(b.moveAngle);
	b.y += b.spd * frameAdjust * Tk.sin(b.moveAngle);
}

Bullet.move.sin = function(b){
	var axeX = Math.max(0,b.timer - SIN_DELAY * b.num);
	var ampMod = (b.num%2)*2-1; // + b.num;
	
	var axeY = ampMod * b.sin.amp * Tk.sin(b.timer*b.sin.freq);
	var numX = b.spd * (axeX*Tk.cos(b.crAngle) - axeY * Tk.sin(b.crAngle));
	var numY = b.spd * (axeX*Tk.sin(b.crAngle) + axeY * Tk.cos(b.crAngle));

	b.x = b.crX + numX;
	b.y = b.crY + numY;
}

Bullet.move.parabole = function(b){
	var axeX = b.parabole.dist*(b.timer/b.parabole.timer);
	
	var a = 1/b.parabole.dist/10 
			* b.parabole.height 
			* ((b.num%2)*2-1) 		//half are opposite
	
	var axeY = 	a * axeX * (axeX-b.parabole.dist);

	var	numX = (axeX*Tk.cos(b.crAngle) - axeY* Tk.sin(b.crAngle));
	var	numY = (axeX*Tk.sin(b.crAngle) + axeY* Tk.cos(b.crAngle));

	b.x = b.crX + numX;
	b.y = b.crY + numY;
	if(b.timer >= b.parabole.timer){ 
		b.toRemove = true; 
	}
}
		
Bullet.move.boomerang = function(b){
	var timeSpdMod = Math.min(2,Math.abs(b.timer - b.boomerang.comeBackTime)/b.boomerang.comeBackTime);
	var spd = b.spd * b.boomerang.spd * timeSpdMod;
	
	if(b.timer < b.boomerang.comeBackTime){
		b.x += Tk.cos(b.moveAngle)*spd;
		b.y += Tk.sin(b.moveAngle)*spd;
	}
	
	if(b.timer >= b.boomerang.comeBackTime){		//AKA come back
		var parent = Actor.get(b.parent);
		if(!parent) return;
	
		spd *= b.boomerang.spdBack;
		
		if(!b.boomerang.comingBack){
			b.boomerang.comingBack = true;
			b.ghost = true;
			b.angle += 180;
			if(b.boomerang.newId){
				b.boomerang.newId = false;
				b.hitId = Math.random();
			}
		}
		
		var diffX = b.x - parent.x;
		var diffY = b.y - parent.y;
	
		var diff = Math.sqrt(diffX*diffX + diffY *diffY);
		
		b.moveAngle = Tk.atan2(diffY,diffX);
		b.angle = b.moveAngle;
		
		b.x -= Tk.cos(b.moveAngle)*spd;
		b.y -= Tk.sin(b.moveAngle)*spd;
		
		if(diff <= spd*2) 
			b.toRemove = true;
	}	
}		
		
Bullet.verifyCollision = function(b){
	for(var i in b.activeList){ 
		var act = Actor.get(i);
		if(Collision.testBulletActor(b,act))
			Combat.onCollision(b,act);
	}
	
	if(Collision.testBulletMap(b))
		b.toRemove = true;
}


var FADEOUT = 1/3;
Bullet.initRemove = function(b){
	b.sprite.fadeoutRate = FADEOUT;
}
	
var TIME_TO_DISAPPEAR = 1;
if(!SERVER){ //}

	Bullet.loop = function(){
		var frameAdjust = 1; //Tk.getFrameSpdMod('moveBullet');
		for(var i in LIST)
			Bullet.loop.forEach(LIST[i],frameAdjust);		
	}
	
	Bullet.loop.forEach = function(b,frameAdjust){
		Bullet.loop.updateBoostedSpd(b);
		
		b.timer += frameAdjust;
		Sprite.updateAnim(b);
		Sprite.updateFadeout(b);
		if(b.sprite.fadeoutRate) 
			return;
		Bullet.move(b,frameAdjust);
		if(Collision.testBulletMap(b))
			b.toRemove = true;
		for(var i in Actor.LIST){
			if(Collision.testBulletActor(b,Actor.LIST[i])){
				Bullet.onCollisionClient(b);
				continue;
			}
		}
		if(Collision.testBulletActor(b,w.player))	//BAD, but better for efficiency
			Bullet.onCollisionClient(b);	
		
		if(b.toRemove || b.timer >= b.maxTimer)
			Bullet.remove(b);
	}
	
	Bullet.loop.updateBoostedSpd = function(b){
		if(b.frameLate <= 0 && b.boostedSpd){
			b.spd /= 1.5;	//2 is the real thing but too fast
			b.boostedSpd = false;
		}
		if(b.frameLate !== 0){
			b.frameLate--;
			if(!b.boostedSpd){
				b.spd *= 1.5;	//2
				b.boostedSpd = true;
			}
		}
	}
	
	Bullet.drawAll = function(ctx){
		for(var i in LIST)
			Sprite.draw(ctx,LIST[i]);
		Sprite.setRotation(ctx,0);
	}
	
	Bullet.onCollisionClient = function(b){ //aka die in 3 frames
		b.timer = Math.max(b.timer,b.maxTimer - TIME_TO_DISAPPEAR);
	}
	
	
	
}


})();
