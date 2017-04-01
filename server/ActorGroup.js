
"use strict";
var Actor, Maps;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Maps = rootRequire('server','Maps');
	global.onLoop(ActorGroup.loop);
});

var NO_RESPAWN = -10;
var ActorGroup = exports.ActorGroup = function(extra){
	this.id = Math.randomId();
	this.map = '';
	this.list = {};  		//hold enemies
	this.respawn = 0;  		//time before respawn when all monster dead, NO_RESPAWN = remove group when dead
	this.param = [];		//BAD used to revive node appgroup
	Tk.fillExtra(this,extra);
}

ActorGroup.create = function(spot,list,respawn,v){
	var g = new ActorGroup({
		map:spot.map,
		respawn:respawn || NO_RESPAWN,
		param:Tk.deepClone([spot,list,respawn,v]),		
	});
	
	Maps.addToEntityList(Maps.get(spot.map),'group',g.id);
	
	for(var i in list){
		//list[i].extra.group = id;
		for(var j = 0 ; j < list[i].amount; j++){
			var pos = ActorGroup.alterSpot(Tk.deepClone(spot),v);
			var e = Actor.create(list[i].model,list[i].extra);
			e.group = g.id;
			Actor.addToMap(e,pos);
			g.list[e.id] = true;
		}
	}
	
	ActorGroup.addToList(g);
	
	return g.list.$keys();
	
}

var LIST = ActorGroup.LIST = {};

ActorGroup.get = function(id){
	return LIST[id] || null;
}
ActorGroup.addToList = function(g){
	LIST[g.id] = g;
}
ActorGroup.removeFromList = function(id){
	delete LIST[id]; 
}

ActorGroup.removeActorFromGroup = function(act){
	var group = LIST[act.group];
	if(!group) 
		return ERROR(3,'Actor.remove no group',act.name);
	delete group.list[act.id];
}

ActorGroup.alterSpot = function(spot,v){
	if(!v) 
		return spot;
	
	for(var i = 0; i < 100; i++){
		var x = spot.x + Math.randomML() * v;
		var y = spot.y + Math.randomML() * v;
		if(!Actor.isStuck(
			{map:spot.map,mapModel:spot.mapModel,x:spot.x,y:spot.y,type:CST.ENTITY.npc},	//BAD
			{map:spot.map,mapModel:spot.mapModel,x:x,y:y,type:CST.ENTITY.npc})
		){
			return Maps.Spot(x,y,spot.map,spot.mapModel);
		}
	}
	return spot;	//if all 100 tries fail
}

ActorGroup.List = function(model,amount,extra){
	return {
		model:model,
		amount:amount || 1,
		extra:extra||{},
	}
}

ActorGroup.loop = function(){	//static
	for(var i in LIST)
		ActorGroup.loop.forEach(LIST[i]);
}

ActorGroup.loop.forEach = function(g){
	for(var i in g.list){
		var e = Actor.get(i);
		if(!e) delete g.list[i];
	}
	if(!g.list.$isEmpty()) return;
	
	//if no return => all dead
	if(g.respawn === NO_RESPAWN) 
		return ActorGroup.remove(g);

	if(--g.respawn <= 0){
		ActorGroup.create.apply(this,g.param); 	
		ActorGroup.remove(g);
	}

}

ActorGroup.remove = function(g){
	if(typeof g === 'string') g = LIST[g];
	if(!g) return ERROR(3,'no group');
	for(var i in g.list){
		var e = Actor.get(i);
		if(!e){ ERROR(2,'no actor');  continue; }
		Actor.remove(e);
	}
	ActorGroup.removeFromList(g.id);
	Maps.removeFromEntityList(Maps.get(g.map),'group',g.id);
}








