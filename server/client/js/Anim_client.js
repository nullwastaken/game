//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Sfx = require4('Sfx'), Collision = require4('Collision'), AnimModel = require4('AnimModel'), Actor = require4('Actor');
var Anim = exports.Anim = {};
Anim.create = function(pack){
	var anim = Anim.undoInitPack(pack);
	
	Anim.LIST[anim.id] = anim;

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
	if(typeof anim === 'string') anim = Anim.LIST[anim.id];	//kinda dumb lol..
	delete Anim.LIST[anim.id];
}

Anim.playSfx = function(anim){
	var sfx = AnimModel.get(anim.modelId).sfx;
	if(!sfx) return;
	var dist = Collision.getDistancePtPt(player,anim.target);
	var mod = 1;
	if(dist > 200) mod = 0.75;
	if(dist > 400) mod = 0.5;
	if(dist > 600) mod = 0.25;
	var volume = sfx.volume * mod;
	Sfx.play(sfx.id,volume);
}


Anim.draw = function (ctx,layer){
	for(var i in Anim.LIST){
		var anim = Anim.LIST[i];
		var model = AnimModel.get(anim.modelId);
		if(!model) return ERROR(2,"anim model not found",anim.modelId);
		if(model.layer !== layer) return;
		
		var image = model.img;
		var sizeX = image.width / model.frameX;
		var slotX = anim.slot % model.frameX;
		var slotY = Math.floor(anim.slot / model.frameX);
		var sizeY = image.height / Math.ceil(model.frame / model.frameX);
		var size = model.size*anim.sizeMod;
		var startY = model.startY;
				
		ctx.drawImage(image,
			sizeX*slotX,sizeY*slotY+startY,
			sizeX,sizeY,
			CST.WIDTH2+anim.target.x-player.x-sizeX/2*size,
			CST.HEIGHT2+anim.target.y-player.y-sizeY/2*size,
			sizeX*size,sizeY*size
		);
	}
}

Anim.loop = function(){
	for(var i in Anim.LIST){
		Anim.loop.forEach(Anim.LIST[i]);
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
