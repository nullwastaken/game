//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){//}
var LightingEffect = require2('LightingEffect');

var AnimModel = exports.AnimModel = {};
AnimModel.create = function(id,frame,sfx,spd,layer,extra){
	var tmp = {
		id:id,
		src:'img/anim/' + id + '.png',	
		frame:frame || 10,
		frameX:Math.min(frame,5) || 10,
		spd:spd || 1,
		layer:layer || 'a',
		sfx:sfx || null,	//Sfx.Base {id:'asd',volume:0.5}
		size:4,
		startY:0,
		lightingEffect:[],	//[LightingEffect]
		img:null,	//client side
	};
	for(var i in extra){
		if(tmp[i] === undefined) ERROR(4,'prop not in constructor',i);
		tmp[i] = extra[i];
	}
	if(typeof tmp.spd !== 'number') return ERROR(3,'spd not number');
	if(typeof tmp.layer !== 'string') return ERROR(3,'layer not string');
	if(typeof tmp.frame !== 'number') return ERROR(3,'frame not number');
	
	
	DB[id] = tmp;
	
	
	return tmp;
};
var DB = AnimModel.DB = {};

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
	AnimModel.create('strikeHit',3,AnimModel.Sfx('strikeHit',0.5));
	AnimModel.create('arrowHit',3,AnimModel.Sfx('arrowHit',0.5));
	
	AnimModel.create('bind',16,AnimModel.Sfx('bind',0.5),1,'b');
	AnimModel.create('heal',13,AnimModel.Sfx('heal',0.5),1,'b');
	AnimModel.create('boostPink',16,AnimModel.Sfx('boost',0.5),1,'b');
	AnimModel.create('boostRed',16,AnimModel.Sfx('boost',0.5),1,'b',{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,80,80,0.05)'),
			LightingEffect.Color(1,'rgba(255,80,80,0)'),
		],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.25,0.05])
	});
	AnimModel.create('cursePink',14,AnimModel.Sfx('curse',0.5),1,'b');
	AnimModel.create('earthHit',7,AnimModel.Sfx('earthHit',0.5));
	AnimModel.create('earthBomb',7,AnimModel.Sfx('earthBomb',0.5));
	
	AnimModel.create('rangeBomb',10,AnimModel.Sfx('rangeBomb',1),0.5,'a');
	AnimModel.create('magicBomb',9,AnimModel.Sfx('magicBomb',1),0.5,null,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,80,255,0.15)'),
			LightingEffect.Color(1,'rgba(255,80,255,0)'),
		],[1,1,1,1,1,0.75,0.5,0.25,0.15])
	});
	AnimModel.create('magicHit',9,AnimModel.Sfx('magicHit',1));
	AnimModel.create('fireBomb2',6,AnimModel.Sfx('fireBomb2',0.25),0.4,null,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,80,80,0.15)'),
			LightingEffect.Color(1,'rgba(255,80,80,0)'),
		],[0.25,1,1,1,0.75,0.25])
	});
	AnimModel.create('fireHit',12,AnimModel.Sfx('fireHit',0.25));
	AnimModel.create('coldBomb',10,AnimModel.Sfx('coldBomb',1),0.4,null,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(80,80,255,0.25)'),
			LightingEffect.Color(1,'rgba(80,80,255,0)'),
		],[0,0,0,0,0,0.75,1,1,1,0.5])
	});
	AnimModel.create('coldHit',16,AnimModel.Sfx('coldHit',0.5));
	AnimModel.create('lightningBomb',12,AnimModel.Sfx('lightningBomb',1),null,null,{
		lightingEffect:AnimModel.LightingEffect(5,50,[
			LightingEffect.Color(0,'rgba(255,255,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,255,122,0)'),
			
		],[0,0.5,0.3,0.1,0.3,0.5,0.3,0.5,0.5,0.7,1,1])
	});
	AnimModel.create('lightningHit',6,AnimModel.Sfx('lightningHit',0.5));
	AnimModel.create('scratch',6,AnimModel.Sfx('scratch',0.2));
	AnimModel.create('slashCold',13,AnimModel.Sfx('slashCold',0.2));
	AnimModel.create('slashFire',15,AnimModel.Sfx('slashFire',0.5));
	AnimModel.create('slashLightning',14,AnimModel.Sfx('slashLightning',0.5));
	AnimModel.create('slashMelee',6,AnimModel.Sfx('slashMelee',0.25));
	
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


