
"use strict";
var Maps, AnimModel, Actor;
global.onReady(function(){
	Maps = rootRequire('server','Maps'); AnimModel = rootRequire('shared','AnimModel'); Actor = rootRequire('shared','Actor');
});
var Anim = exports.Anim = function(extra){
	this.model = '';
	this.sizeMod = '';
	this.sfx = 1;
	this.target = null;	//Anim.Target
	this.id = Math.randomId();
	this.type = CST.ENTITY.anim;
	this.angle = 0;
	this.lightingEffect = true;
	Tk.fillExtra(this,extra);
};
//server only, check below for client Anim
Anim.create = function(base,target,angle){
	if(!AnimModel.get(base.id))
		return ERROR(3,'invalid model',base.id);
	var tmp = new Anim({
		model:base.id,
		sizeMod:base.sizeMod,
		sfx:base.sfx,
		target:target,
		lightingEffect:base.lightingEffect,
		angle:Math.round(angle)
	});
	
	Maps.addToEntityList(Maps.get(Anim.getMap(tmp)),'anim',tmp.id);
	LIST[tmp.id] = tmp;
	return tmp;
}

var LIST = Anim.LIST = {};
Anim.Base = function(id,sizeMod,sfx,lightingEffect){	//for ability and stuff
	if(!AnimModel.get(id))
		return ERROR(3,'invalid model',id);
	
	return {
		id:id,
		sizeMod:sizeMod || 1,
		sfx: sfx === undefined ? 1 : sfx,
		lightingEffect: lightingEffect === undefined ? true : lightingEffect
	};
}

Anim.Target = function(x,y,map,viewedIf){
	if(typeof x === 'string') 
		return {
			type:CST.ANIM_TYPE.id,
			id:x,
		}
		
	return {
		type:CST.ANIM_TYPE.position,
		x:x || 0,
		y:y||0,
		map:map||'',
		viewedIf:viewedIf || CST.VIEWED_IF.always,	
	};	
}

Anim.doInitPack = function(anim){
	var c = [
		AnimModel.compressManager.compress(anim.model),
		anim.sizeMod,
	];
	if(anim.target.type === CST.ANIM_TYPE.id)
		c.push(anim.target.id);
	else {
		c.push(Math.round(anim.target.x));
		c.push(Math.round(anim.target.y));
	}
	c.push(anim.sfx);
	c.push(anim.angle);
	c.push(anim.lightingEffect);
	
	return c;
}

Anim.get = function(id){
	return LIST[id] || null;
}

Anim.remove = function(id){
	Maps.removeFromEntityList(Maps.get(Anim.getMap(LIST[id])),'anim',id);
	delete LIST[id];
}

Anim.getMap = function(anim){
	if(anim.target.type === CST.ANIM_TYPE.id) 
		return Actor.get(anim.target.id).map;
	return anim.target.map;
}	

Anim.removeAll = function(){
	Maps.removeAllAnim();
	LIST = {};
}


