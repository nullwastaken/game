//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Sfx = require4('Sfx'), LightingEffect = require4('LightingEffect'), Collision = require4('Collision'), Img = require4('Img'), AnimModel = require4('AnimModel'), Actor = require4('Actor');
var Anim = exports.Anim = {};
Anim.create = function(pack){
	var anim = Anim.undoInitPack(pack);
	
	LIST[anim.id] = anim;
	
	if(anim.sfx)
		Anim.playSfx(anim);
}

var LIST = Anim.LIST = {};


Anim.undoInitPack = function(compressAnim){	//check Anim.doInitPack
	var a = {
		modelId:compressAnim[0],
		sizeMod:compressAnim[1],
		target:null,
		timer:0,
		slot:0,
		id:'a'+Math.randomId(),
		type:'anim',
		sfx:true
	};
	if(typeof compressAnim[2] === 'string'){
		a.target = compressAnim[2] === player.id ? player : Actor.get(compressAnim[2]) || {x:0,y:0};	//prevent error
		if(compressAnim[3] === 0)
			a.sfx = false;
	} else {
		a.target = {
			x:compressAnim[2],
			y:compressAnim[3],
		}
		if(compressAnim[4] === 0)
			a.sfx = false;
	}
	
	return a;
}

Anim.remove = function(anim){	
	if(typeof anim === 'string') anim = LIST[anim.id];	//kinda dumb lol..
	delete LIST[anim.id];
}


Anim.playSfx = function(anim){
	var model = AnimModel.get(anim.modelId);
	if(!model) 
		return ERROR(3,'invalid anim model',anim.modelId);
	if(!model.sfx) 
		return;
	var dist = Collision.getDistancePtPt(player,anim.target);
	var mod = 1;
	if(dist > 200) mod = 0.75;
	if(dist > 400) mod = 0.5;
	if(dist > 600) mod = 0.25;
	Sfx.play(model.sfx,mod);
}


Anim.draw = function(anim,ctx){
	var model = AnimModel.get(anim.modelId);
	if(!model) return ERROR(2,"anim model not found",anim.modelId);
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
	
	ctx.drawImage(image,
		sizeX*slotX,sizeY*slotY+startY,
		sizeX,sizeY,
		posX-sizeX/2*sizeMod,
		posY-sizeY/2*sizeMod,
		sizeX*sizeMod,sizeY*sizeMod
	);
	
	if(model.lightingEffect && model.lightingEffect[anim.slot])
		LightingEffect.drawEntity(model.lightingEffect[anim.slot],ctx,posX,posY,sizeMod);
	
}

Anim.drawAll = function (ctx,layer){
	for(var i in LIST){
		var anim = LIST[i];
		var model = AnimModel.get(anim.modelId);
		if(!model) return ERROR(2,"anim model not found",anim.modelId);
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
	var animFromDb = AnimModel.get(anim.modelId);
	if(!animFromDb){ ERROR(2,"anim not found",anim.modelId); animFromDb = AnimModel.get('scratch'); }
	
	anim.timer += animFromDb.spd;
	
	anim.slot = Math.floor(anim.timer);
	if(anim.slot > animFromDb.frame){
		Anim.remove(anim);
	}	
}

})(); //{
