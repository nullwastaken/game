
"use strict";
(function(){//}
var LightingEffect,ParticleEffect;
global.onReady(function(){
	ParticleEffect = rootRequire('shared','ParticleEffect'); LightingEffect = rootRequire('shared','LightingEffect'); 
},null,'AnimModel',[],function(){
	AnimModel.init();
});
var AnimModel = exports.AnimModel = function(extra){
	this.id = '';
	this.src = '';
	this.frame = 10;
	this.frameX = 10;
	this.spd = 1;
	this.layer = CST.LAYER.above;
	this.sfx = null; //AnimModel.Sfx
	this.size = 4; 
	this.startY = 0;
	this.lightingEffect = [];	//LightingEffect[]
	this.particleEffect = null;	//ParticleEffect.Model
	this.img = null;	//Image
	this.allowRotate = false;
	this.baseRotation = 0;
	Tk.fillExtra(this,extra);
};

AnimModel.create = function(id,frame,sfx,spd,layer,extra){
	var tmp = new AnimModel({
		id:id,
		src:'img/anim/' + id + '.png',	
		frame:frame,
		frameX:Math.min(frame,5),
		spd:spd,
		layer:layer,
		sfx:sfx,
	});
	Tk.fillExtra(tmp,extra);
	
	if(typeof tmp.spd !== 'number') return ERROR(3,'spd not number');
	if(typeof tmp.layer !== 'string') return ERROR(3,'layer not string');
	if(typeof tmp.frame !== 'number') return ERROR(3,'frame not number');
	
	DB[id] = tmp;
	
	AnimModel.compressManager.add(id);
	
	return tmp;
};
var DB = AnimModel.DB = {};

AnimModel.compressManager = Tk.newCompressManager();

AnimModel.Sfx = function(id,volume){
	return {
		id:id,
		volume:volume || 1,
	}
}

AnimModel.get = function(id){
	return DB[id] || null;
}

AnimModel.init = function(){
	var u = global.undefined;	//kinda bad...
	AnimModel.create('strikeHit',3,AnimModel.Sfx('strikeHit',0.5),u,u,{
		particleEffect:ParticleEffect.Model('#FFFF99',5,2)
	});
	AnimModel.create('arrowHit',3,AnimModel.Sfx('arrowHit',0.5),u,u,{
		particleEffect:ParticleEffect.Model('#FFFF99',5,2)
	});
	
	AnimModel.create('bind',16,AnimModel.Sfx('bind',0.5),1,CST.LAYER.below,{
		particleEffect:ParticleEffect.Model('#FFFF99',5)
	});
	AnimModel.create('heal',13,AnimModel.Sfx('heal',0.5),1,CST.LAYER.below,{
		particleEffect:ParticleEffect.Model('#ff7777',10)
	});
	AnimModel.create('boostPink',16,AnimModel.Sfx('boost',0.5),1,CST.LAYER.below,{
		particleEffect:ParticleEffect.Model('#FF00FF',5)
	});
	AnimModel.create('boostRed',16,AnimModel.Sfx('boost',0.5),1,CST.LAYER.below,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,80,80,0.05)'),
			LightingEffect.Color(1,'rgba(255,80,80,0)'),
		],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.25,0.05]),
		particleEffect:ParticleEffect.Model('#ff7777',10),
	});
	AnimModel.create('cursePink',14,AnimModel.Sfx('curse',0.5),1,CST.LAYER.below,{
		particleEffect:ParticleEffect.Model('#FF00FF',10)
	});
	AnimModel.create('earthHit',7,AnimModel.Sfx('earthHit',0.5),u,u,{
		particleEffect:ParticleEffect.Model('#FF00FF',10)
	});
	AnimModel.create('earthBomb',7,AnimModel.Sfx('earthBomb',0.5),u,u,{
		particleEffect:ParticleEffect.Model('#FF00FF',10)
	});
	
	AnimModel.create('rangeBomb',10,AnimModel.Sfx('rangeBomb',1),0.5,u,{
		particleEffect:ParticleEffect.Model('#DDDDDD',5)
	});
	AnimModel.create('magicBomb',9,AnimModel.Sfx('magicBomb',1),0.5,u,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,80,255,0.15)'),
			LightingEffect.Color(1,'rgba(255,80,255,0)'),
		],[1,1,1,1,1,0.75,0.5,0.25,0.15]),
		particleEffect:ParticleEffect.Model('#FF77FF',10,2,1,2)
	});
	AnimModel.create('magicHit',9,AnimModel.Sfx('magicHit',1),u,u,{
		//particleEffect:ParticleEffect.Model('#FF77FF',10)
	});
	AnimModel.create('fireBomb2',6,AnimModel.Sfx('fireBomb2',0.15),0.4,u,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,80,80,0.15)'),
			LightingEffect.Color(1,'rgba(255,80,80,0)'),
		],[0.25,1,1,1,0.75,0.25]),
		particleEffect:ParticleEffect.Model('#FF7777',10,2,1,2)
	});
	AnimModel.create('fireHit',12,AnimModel.Sfx('fireHit',0.25),u,u,{
		//particleEffect:ParticleEffect.Model('#FF7777',10)
	});
	AnimModel.create('coldBomb',10,AnimModel.Sfx('coldBomb',1),0.4,u,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(80,80,255,0.25)'),
			LightingEffect.Color(1,'rgba(80,80,255,0)'),
		],[0,0,0,0,0,0.75,1,1,1,0.5]),		
		particleEffect:ParticleEffect.Model('#7777FF',10,2,1,2)
	});
	AnimModel.create('coldHit',16,AnimModel.Sfx('coldHit',0.5),u,u,{
		//particleEffect:ParticleEffect.Model('#7777FF')
	});
	AnimModel.create('lightningBomb',12,AnimModel.Sfx('lightningBomb',1),u,u,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,255,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,255,122,0)'),
			
		],[0,0.5,0.3,0.1,0.3,0.5,0.3,0.5,0.5,0.7,1,1]),
		particleEffect:ParticleEffect.Model('#FFFF77',10,2,1,2)
	});
	AnimModel.create('lightningHit',6,AnimModel.Sfx('lightningHit',0.5),u,u,{
		//particleEffect:ParticleEffect.Model('#FFFF77')
	});
	AnimModel.create('scratch',6,AnimModel.Sfx('scratch',0.2),u,u,{
		particleEffect:ParticleEffect.Model('#FFFFEE',5,2,1,1)
	});
	AnimModel.create('slashCold',13,AnimModel.Sfx('slashCold',0.2),u,u,{
		allowRotate:true,
		baseRotation:40
	});
	AnimModel.create('slashFire',15,AnimModel.Sfx('slashFire',0.5),u,u,{
		allowRotate:true,
		baseRotation:40
	});
	AnimModel.create('slashLightning',14,AnimModel.Sfx('slashLightning',0.5),u,u,{
		allowRotate:true,
		baseRotation:40
	});
	AnimModel.create('slashMelee',5,AnimModel.Sfx('slashMelee',0.25),u,u,{
		particleEffect:ParticleEffect.Model('#FFFFEE',5,2,1,1),
		allowRotate:true,
		baseRotation:40	//lower means turn clockwise
	});
	
	AnimModel.create('rightClick',3,u,0.03,u,{size:1});
	AnimModel.create('leftClick',3,u,0.03,u,{size:1});
	
}

//AnimModel.LightingEffect(10,20,'red',[0,0,0,0,0.5,0.7,1,0.7,0.5]);

AnimModel.LightingEffect = function(radiusInsideBase,radiusOutsideBase,color,sizeModList){	//color is [LightingEffect.Color]
	var list = [];
	for(var i = 0 ; i < sizeModList.length; i++){
		if(sizeModList[i] === 0)
			list.push(null);
		else
			list.push(LightingEffect.create(radiusInsideBase*sizeModList[i],radiusOutsideBase*sizeModList[i],color));
	}
	return list;
}


})();


