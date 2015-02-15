//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Map = require2('Map'), Actor = require2('Actor');
var Sfx = require4('Sfx');

var Anim = exports.Anim = {}; //server only, check below for client Anim
Anim.create = function(base,target){
	var tmp = {
		modelId:base.id || ERROR(3,'base.id needed'),
		sizeMod:base.sizeMod || 1,
		sfx:base.sfx === undefined ? true : base.sfx,
		target:target,
		id:'a'+Math.randomId(5),
		type:'anim',
	}
	
	Map.addToEntityList(Map.get(Anim.getMap(tmp)),'anim',tmp.id);
	LIST[tmp.id] = tmp;
	return tmp;
}

var LIST = Anim.LIST = {};
Anim.Base = function(id,sizeMod, sfx){	//for ability and stuff
	return {
		id:id,
		sizeMod:sizeMod || 1,
		sfx: sfx === undefined ? true : sfx
	};
}

Anim.Target = function(x,y,map,viewedIf){
	if(typeof x === 'string') 
		return {
			type:'id',
			id:x,
		}
		
	return {
		type:'position',
		x:x || 0,
		y:y||0,
		map:map||'',
		viewedIf:viewedIf||'true',	
	};	
}

Anim.doInitPack = function(anim){
	var c = [
		anim.modelId,
		anim.sizeMod,
	];
	if(anim.target.type === 'id')
		c.push(anim.target.id);
	else 
		c.push(Math.round(anim.target.x));
		c.push(Math.round(anim.target.y));
	
	if(!anim.sfx)
		c.push(0);
		
	return c;
}

Anim.get = function(id){
	return LIST[id] || null;
}
Anim.remove = function(id){
	Map.removeFromEntityList(Map.get(Anim.getMap(LIST[id])),'anim',id);
	delete LIST[id];
}
Anim.getMap = function(anim){
	if(anim.target.type === 'id') 
		return Actor.get(anim.target.id).map;
	return anim.target.map;
}	
Anim.removeAll = function(){
	Map.removeAllAnim();
	LIST = {};
}
