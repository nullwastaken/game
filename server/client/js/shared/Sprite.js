
"use strict";
(function(){ //}
var Entity, Actor, Main, SpriteModel, Collision, LightingEffect;
global.onReady(function(){
	Entity = rootRequire('shared','Entity'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); SpriteModel = rootRequire('shared','SpriteModel');
	Collision = rootRequire('shared','Collision',true); LightingEffect = rootRequire('shared','LightingEffect',true);
});
var Sprite = exports.Sprite = function(extra){
	this.name = '';
	this.anim = "walk";	//on SERVER: normally null. change for 1 frame when attac;
	this.oldAnim = "walk";	//client stuf;
	this.sizeMod = 1;
	this.startX =  0;
	this.timer =  0;
	this.alpha = 1;
	this.isNormal = true;
	this.hitBox = null;	//set late;
	this.bumperBox = null;
	this.lightingEffect = true;
	this.fadeoutRate =  false;
	Tk.fillExtra(this,extra);
};

Sprite.create = function(name,sizeMod,lightingEffect,actorType){
	var model = SpriteModel.get(name);
	if(!model)
		ERROR(4,'no model for name',name);
	//115,207,15085
	var s = new Sprite({
    	name:name,
		sizeMod:sizeMod,
		lightingEffect:lightingEffect,
		anim:model.defaultAnim,
		oldAnim:model.defaultAnim,
    });
	
	if(SERVER || actorType !== CST.ENTITY.bullet)	//idk
		Sprite.updateBumper(s);
	
	return s;
};

Sprite.change = function(act,info){
    var sprite = act.sprite;
	if(!sprite) 
		return ERROR(3,'no act or no sprite');

	if(info.name){
		if(info.name === CST.SPRITE_NORMAL){
			sprite.name = Actor.getNormalSprite(act);
			sprite.isNormal = true;
		}
		else {
			sprite.isNormal = false;
			sprite.name = info.name;
		}
		Actor.setChange(act,'sprite,name',sprite.name);
	}
	if(info.sizeMod && sprite.sizeMod !== info.sizeMod){
		sprite.sizeMod = info.sizeMod;
		Actor.setChange(act,'sprite,sizeMod',sprite.sizeMod);
	}		
	if(info.alpha !== undefined){
		Actor.setChange(act,'sprite,alpha',info.alpha);
	}
	Sprite.updateBumper(sprite);
}

Sprite.updateBumper = function(sprite){
	//Set the Sprite Bumper Box to fit the sizeMod
	var model = SpriteModel.get(Tk.getSplit0(sprite.name));
	if(!model) 
		return ERROR(4,'no sprite model',sprite.name);
	
	sprite.hitBox = Sprite.resizeBumper(Tk.deepClone(model.hitBox),sprite.sizeMod * model.size);
	sprite.bumperBox = Sprite.resizeBumper(Tk.deepClone(model.bumperBox),sprite.sizeMod * model.size);
}


Sprite.updateFadeout = function(act){
	if(act.sprite.fadeoutRate){
		act.sprite.alpha -= act.sprite.fadeoutRate;
		if(act.sprite.alpha < 0)
			Entity.removeAny(act.id);
	}
}

Sprite.updateAnim = function (act){	//client side only, doesnt update anim bullet
	var dsp = SpriteModel.get(Actor.getSpriteName(act));
	if(!dsp) 
		return ERROR(4,"sprite dont exist",act.sprite);
		
	if(act.sprite.animOld !== act.sprite.anim){	//otherwise, animation can be cut if timer for walk is high 
		act.sprite.animOld = act.sprite.anim;
		Sprite.changeAnim(act.sprite,act.sprite.anim);
	}
	var animFromDb = dsp.anim[act.sprite.anim];	
	if(!animFromDb) 
		return ERROR(4,"sprite anim dont exist",act.sprite);
	
	if(animFromDb.frame === 1){	//nothing to update
		act.sprite.startX = 0;	//kinda bad... but if change name then startX might not be 0
		act.sprite.timer = 0;
		return;
	}
	
	var mod = 1;
	if(animFromDb.walk && act.maxSpd !== 0){    //if walking, the speed of animation depends on movement speed
		var spd =  Math.max(Math.abs(act.spdX),Math.abs(act.spdY));
		if(act !== w.player)
			spd /= 2;	//divide by 2, idk why but it works, probably because xy update only send 1/2 times
		mod = Math.abs(spd/act.maxSpd) || 0;
	}
	
	act.sprite.timer += animFromDb.spd * mod;
	
	var rt = Math.floor(act.sprite.timer);
	var frameL1 = animFromDb.frame-1;
	
	if(!animFromDb.loopReverse || frameL1 === 0){
		act.sprite.startX = rt;
	} else {
		var slot = rt % (frameL1*2);
		//[0121][0121][0121]
		if(slot > frameL1)	//3 => 1
			slot = 2*frameL1 - slot;
		act.sprite.startX =  slot;
	}
	
	if(act.sprite.startX > frameL1 || act.sprite.startX < 0){	//loopframe include reverse
		Sprite.changeAnim(act.sprite,animFromDb.next);
	}
	
	
}

Sprite.changeAnim = function(sprite,anim){
	sprite.anim = anim;
	sprite.startX = 0;
	sprite.timer = 0;
}

Sprite.resizeBumper = function(bumperBox,size){
	for(var i in bumperBox)
		for(var j in bumperBox[i])
			bumperBox[i][j] *= size;
	return bumperBox;
}

Sprite.isMouseOver = function(act){
	var model = SpriteModel.get(Actor.getSpriteName(act));
	var animFromDb = model.anim[act.sprite.anim];
	
	var sizeMod = model.size * act.sprite.sizeMod;

	var sizeOffX = animFromDb.sizeX/2*sizeMod;
	var sizeOffY = animFromDb.sizeY/2*sizeMod;
	var offsetX = model.offsetX*sizeMod;
	var offsetY = model.offsetY*sizeMod;
	var posX = Tk.absToRel.x(act.x + offsetX);
	var posY = Tk.absToRel.y(act.y + offsetY);
	
	return Collision.testMouseRect(null,CST.rect(posX- sizeOffX,posY- sizeOffY,sizeOffX*2,sizeOffY*2));
}

var CTX_ROTATION = 0;
Sprite.setRotation = function(ctx,wantedRot){
	var diffRot = wantedRot - CTX_ROTATION;
	if(diffRot === 0)
		return;
	ctx.rotate(diffRot);
	CTX_ROTATION = wantedRot;
}

Sprite.draw = function(ctx,act,glow){	//also does position update calc, client prediction //BAD hardcoded border
	var list = act.sprite.name.split(',');

	var underMouse = false;
	for(var i = 0; i < list.length; i++){
		if(Sprite.draw.one(ctx,act,list[i],glow))
			underMouse = true;
	}
	
	if(underMouse && act.context)
		return act.context;
	return '';
}

Sprite.draw.one = function(ctx,act,spriteId,glow){
	var underMouse = false;
	var model = SpriteModel.get(spriteId);
		
	var image = SpriteModel.getImage(model,act.spriteFilter);
	if(!image || !image.naturalWidth) //aka not ready
		return false;
	
	var animFromDb = model.anim[act.sprite.anim];
	
	var angle = Sprite.getMoveAngle(act);
	var sideAngle = Math.round(angle/(360/animFromDb.dir)) % animFromDb.dir;
	
	var startX = act.sprite.startX * animFromDb.sizeX;
	var startY = animFromDb.startY + model.side[sideAngle] * animFromDb.sizeY;
		
	var sizeMod = model.size * act.sprite.sizeMod;
	
	ctx.globalAlpha = act.sprite.alpha;
	var sizeOffX = animFromDb.sizeX/2*sizeMod;
	var sizeOffY = animFromDb.sizeY/2*sizeMod;
	var offsetX = model.offsetX*sizeMod;
	var offsetY = model.offsetY*sizeMod;
	var posX = Tk.absToRel.x(act.x + offsetX);
	var posY = Tk.absToRel.y(act.y + offsetY);
	
	var isBullet = act.type === CST.ENTITY.bullet;
	if(!underMouse && !isBullet && act !== w.player){
		if(Collision.testMouseRect(null,CST.rect(posX- sizeOffX,posY- sizeOffY,sizeOffX*2,sizeOffY*2)))
			underMouse = true;
	}
	
	if(!model.canvasRotate){
		Sprite.setRotation(ctx,0);
		
		//draw black border
		if(model.showBorder && (underMouse || act.withinStrikeRange)){	//BAD hardocded...
			var filter = Main.getPref(w.main,'strikeTarget') === 0 && act.withinStrikeRange ? CST.SPRITE_FILTER.allRed : CST.SPRITE_FILTER.allBlack;
			var black = SpriteModel.getImage(model,{filter:filter});
			if(!black || !black.naturalWidth) 
				return false;
			
			ctx.drawImage(black, 
				startX,startY,
				animFromDb.sizeX,animFromDb.sizeY,
				Math.floor(posX - sizeOffX - 3),Math.floor(posY - sizeOffY - 3),
				Math.floor(animFromDb.sizeX * sizeMod + 6),Math.floor(animFromDb.sizeY * sizeMod + 6)
			);
		}
					
		//draw image
		ctx.drawImage(image, 
			startX,startY,
			animFromDb.sizeX,animFromDb.sizeY,
			Math.floor(posX - sizeOffX),Math.floor(posY - sizeOffY),
			Math.floor(animFromDb.sizeX * sizeMod),Math.floor(animFromDb.sizeY * sizeMod)
		);			
		if(act.sprite.lightingEffect){
			if(glow)	//under npc
				LightingEffect.drawEntity(LightingEffect.getEntityGlow(),ctx,posX,posY,glow);

			//draw light
			if(model.lightingEffect)
				LightingEffect.drawEntity(model.lightingEffect,ctx,posX,posY,sizeMod);
		}
	} else {
		var radAngle = act.angle/180*Math.PI;
		var vx = Tk.rotatePt.x(posX,posY,-radAngle,0,0);
		var vy = Tk.rotatePt.y(posX,posY,-radAngle,0,0);
		Sprite.setRotation(ctx,radAngle);
		
		ctx.drawImage(image, 
			startX,startY,
			animFromDb.sizeX,animFromDb.sizeY,
			Math.floor(vx-sizeOffX),Math.floor(vy-sizeOffY),
			Math.floor(animFromDb.sizeX * sizeMod),Math.floor(animFromDb.sizeY * sizeMod)
		);
		//draw light
		if(act.sprite.lightingEffect && model.lightingEffect)
			LightingEffect.drawEntity(model.lightingEffect,ctx,0,0,sizeMod,posX,posY);
	}
	ctx.globalAlpha = 1;
	
	if(Main.getPref(w.main,'displayMiddleSprite')){
		ctx.fillStyle = 'red';
		ctx.fillRect(Tk.absToRel.x(act.x -4),Tk.absToRel.y(act.y -4),8,8);
		ctx.fillStyle = 'black';
	}
	return underMouse;
}

Sprite.getMoveAngle = function(act){	//moveAngle
	if(!act.isActor)
		return act.angle;

	if(act === w.player && Actor.isPressingAbility(act)){	//using ability
		return act.angle;
	}
	//spd changes in Actor.loop.updatePosition
	if(act.staggerTimer > 0 || (Math.abs(act.spdY) < 0.1 && Math.abs(act.spdX) < 0.1)) 
		return act.angle;
	
	return Tk.atan2(act.spdY*1.2,act.spdX);	//*1.2 otherwise change all the time when moving diagonal
}

Sprite.initGlitch = function(act){	//BAD
	setTimeout(function(){
		var alpha = 1;
		var size = 1;
		var phase = 0;
		var count = 0;
		var name = 'Qtutorial-tree';
		var interval = setInterval(function(){	//BAD VERY BAD
			if(!Actor.get(act.id)){
				return clearInterval(interval);
			}
			if(Math.random() < 0.20)
				return;
			if(phase === 0){
				alpha -= 0.0025;
				if(alpha <= 0.5)
					phase = 1;
			}
			if(phase === 1){
				alpha += 0.010;
				if(alpha >= 1)
					phase = 2;
			}
			if(phase === 2){
				size -= 0.0025;
				if(size <= 0.7)
					phase = 3;
			}
			if(phase === 3){
				size += 0.008;
				name = 'Qtutorial-tree-glitched';
				if(size >= 1){
					name = 'Qtutorial-tree';
					phase = 4;
				}
			}
			if(phase === 4){
				if(count++ >= 25){
					phase = 0;
					count = 0;
				}
			}
			act.sprite.alpha = alpha;
			act.sprite.sizeMod = size;
			act.sprite.name = name;
		},40);
	},Math.random()*5000);
}

})(); //{


