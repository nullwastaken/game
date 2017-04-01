
"use strict";
(function(){ //}
var Sfx, LightingEffect, Collision, Img, AnimModel, Actor, ParticleEffect;
global.onReady(function(){
	ParticleEffect = rootRequire('shared','ParticleEffect',true); Sfx = rootRequire('client','Sfx',true); LightingEffect = rootRequire('shared','LightingEffect',true); Collision = rootRequire('shared','Collision',true); Img = rootRequire('client','Img',true); AnimModel = rootRequire('shared','AnimModel',true); Actor = rootRequire('shared','Actor',true);
	global.onLoop(Anim.loop);
});
var Anim = exports.Anim = function(extra){
	this.model = '';
	this.sizeMod = 1;
	this.target = null;	//CST.pt
	this.timer = 0;
	this.slot = 0;
	this.id = Math.randomId();
	this.type = CST.ENTITY.anim;
	this.sfx = 1;
	this.lightingEffect = true;	
	this.angle = 0;
	Tk.fillExtra(this,extra);
};

var DEFAULT_ANIM = 'scratch';

Anim.create = function(pack){
	var anim = Anim.undoInitPack(pack);
	
	LIST[anim.id] = anim;
	
	if(anim.sfx !== 0)
		Anim.playSfx(anim,anim.sfx);
	
	if(anim.lightingEffect)	//BAD also used for lighting effects
		Anim.initParticle(anim);
}

var LIST = Anim.LIST = {};

Anim.undoInitPack = function(compressAnim){	//check Anim.doInitPack
	var a = {
		model:AnimModel.compressManager.uncompress(compressAnim[0]),
		sizeMod:compressAnim[1],
	};
	if(typeof compressAnim[2] === 'string'){
		a.target = Actor.get(compressAnim[2]) || CST.pt(0,0);
		a.sfx = compressAnim[3];
		a.angle = compressAnim[4];
		a.lightingEffect = compressAnim[5];
	} else {
		a.target = CST.pt(compressAnim[2],compressAnim[3]);
		a.sfx = compressAnim[4];
		a.angle = compressAnim[5];
		a.lightingEffect = compressAnim[6];
	}
	
	return new Anim(a);
}

Anim.remove = function(anim){	
	if(typeof anim === 'string') 
		anim = LIST[anim.id];	//kinda dumb lol..
	delete LIST[anim.id];
}

Anim.initParticle = function(anim){
	var model = Anim.getParticleModel(anim);
	if(!model)
		return;
	ParticleEffect.create(function(emitter){
		ParticleEffect.applyModel(emitter,model,anim.sizeMod,anim.target.x,anim.target.y);
		//ParticleEffect.applyModel(emitter,model,anim.sizeMod,anim.target.x,anim.target.y);
	},null,true);
}

Anim.getParticleModel = function(anim){
	return AnimModel.get(anim.model).particleEffect;
}

Anim.playSfx = function(anim,sfxMod){
	var model = AnimModel.get(anim.model);
	if(!model) 
		return ERROR(3,'invalid anim model',anim.model);
	if(!model.sfx) 
		return;
	var dist = Collision.getDistancePtPt(w.player,anim.target);
	var mod = sfxMod;
	if(dist > 600) mod *= 0.25;
	else if(dist > 400) mod *= 0.5;
	else if(dist > 200) mod *= 0.75;
	
	Sfx.play(model.sfx,mod);
}

Anim.draw = function(anim,ctx){
	var model = AnimModel.get(anim.model);
	if(!model) return ERROR(2,"anim model not found",anim.model);
	var image = model.img;
	if(!image){
		model.img = Img.load(model.src);
		return;
	}
	if(!image.complete || !image.naturalWidth) return;

	var sizeX = image.width / model.frameX;
	var slotX = anim.slot % model.frameX;
	var slotY = Math.floor(anim.slot / model.frameX);
	var sizeY = image.height / Math.ceil(model.frame / model.frameX);
	var sizeMod = model.size*anim.sizeMod;
	var startY = model.startY;
	
	var posX = Tk.absToRel.x(anim.target.x);
	var posY = Tk.absToRel.y(anim.target.y);
	
	if(!model.allowRotate || anim.angle === 0){
		ctx.drawImage(image,
			sizeX*slotX,sizeY*slotY+startY,
			sizeX,sizeY,
			posX-sizeX/2*sizeMod,
			posY-sizeY/2*sizeMod,
			sizeX*sizeMod,sizeY*sizeMod
		);
	} else {
		ctx.save();
		ctx.translate(posX,posY);
		ctx.rotate((anim.angle-model.baseRotation)/180*Math.PI);
				
		ctx.drawImage(image,
			sizeX*slotX,sizeY*slotY+startY,
			sizeX,sizeY,
			0-sizeX/2*sizeMod,
			0-sizeY/2*sizeMod,
			sizeX*sizeMod,sizeY*sizeMod
		);
		ctx.restore();
	}
	
	if(anim.lightingEffect && model.lightingEffect && model.lightingEffect[anim.slot])
		LightingEffect.drawEntity(model.lightingEffect[anim.slot],ctx,posX,posY,sizeMod);
	
}

Anim.drawAll = function (ctx,layer){
	for(var i in LIST){
		var anim = LIST[i];
		var model = AnimModel.get(anim.model);
		if(!model) return ERROR(2,"anim model not found",anim.model);
		if(model.layer !== layer) return;
		Anim.draw(anim,ctx);
	}
}

Anim.loop = function(){
	for(var i in LIST){
		Anim.loop.forEach(LIST[i]);
	}
}

Anim.loop.forEach = function (anim){	
	var animFromDb = AnimModel.get(anim.model);
	if(!animFromDb){ 
		ERROR(2,"anim not found",anim.model); 
		animFromDb = AnimModel.get(DEFAULT_ANIM); 
	}
	
	anim.timer += animFromDb.spd;
	
	anim.slot = Math.floor(anim.timer);
	if(anim.slot > animFromDb.frame)
		Anim.remove(anim);
}

})(); //{
