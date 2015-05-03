//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Actor = require2('Actor'), Weather = require2('Weather'), Strike = require2('Strike'), Sign = require2('Sign'), MapModel = require2('MapModel'), Drop = require2('Drop'), Bullet = require2('Bullet'), ActiveList = require2('ActiveList'), Collision = require2('Collision'), ActorGroup = require2('ActorGroup');

var BANK_DIST = 400;
var Maps = exports.Maps = {};
Maps.create = function(namemodel,version,creatorkey){	//create instance of map. version is usually the player name
	var tmp = {
		id:'',
		lvl:0,
		addon:{},	//needed cuz spot custom
		model:'',
		version:'',
		screenEffect:'',
		timer:5*60*1000/25,
		bankSpot:[],
		list:{entity:{},player:{},bullet:{},npc:{},anim:{},actor:{},drop:{},group:{}},		//acts like all but for faster activeList and collisionRect
	};
	tmp.version = version || 'MAIN';
	tmp.id = namemodel + '@' + tmp.version;
	var model = MapModel.get(namemodel);
	if(!model) return ERROR(3,'invalid map model',namemodel);
	tmp.addon = Tk.deepClone(model.addon);
	
	for(var i in tmp.addon){ 
		for(var j in tmp.addon[i].spot){
			tmp.addon[i].spot[j].map = tmp.id;
			tmp.addon[i].spot[j].addon = i;
			tmp.addon[i].spot.map = tmp.id;
		}
	}
	tmp.name = model.name;
	tmp.model = model.id;
	tmp.screenEffect = model.screenEffect;
	tmp.lvl = model.lvl;
	tmp.timer = tmp.version === 'MAIN' ? 1/0 : 5*60*1000/25;
	
	LIST[tmp.id] = tmp;
	
	Maps.load(tmp,creatorkey);
	return tmp;
}

Maps.TRANSITION_SPOT = {x:0,y:0,map:'QfirstTown-transitionMap@MAIN'};

var LIST = Maps.LIST = {};

Maps.getModel = function(name){	//kinda more related to Actor.Spot
	return name.split('@')[0];
}	

Maps.getVersion = function(name){
	return name.replace(Maps.getModel(name),"").replace("@","")	 || 'MAIN';
}

Maps.getInstanceType = function(name){
	if(name.$contains('@MAIN')) return 'public';
	if(name.$contains('@@')) return 'solo';
	if(name.$contains('@')) return 'party';
	return 'public';
}

Maps.load = function(map,key){
	for(var j in map.addon){
		if(map.addon[j].load)
			map.addon[j].load(map.addon[j].spot,key);
	}
}

Maps.loop = function(){	//static
	Maps.loop.FRAME_COUNT++;
	for(var i in LIST)
		Maps.loop.forEach(LIST[i]);
}
Maps.loop.FRAME_COUNT = 0;

Maps.loop.forEach = function(map){
	//Time Out Instance
	if(Maps.loop.FRAME_COUNT % Math.floor(10*1000/25) === 0){		//each 10 sec, incase big bug...
		if(!map.isTown && map.list.player.$isEmpty()){
			Maps.remove(map);
			return;
		}	
	}
	
	for(var j in map.addon){
		if(map.addon[j].loop && !map.list.player.$isEmpty()){
			map.addon[j].loop(map.addon[j].spot);
		}
	}
}

Maps.leave = function(act,map,loggingout){
	map = map || act.map;
	var oldmap = LIST[map];
	if(!oldmap) return;	//ex: teleport after login
	
	ActiveList.clear(act);
	
	delete oldmap.list.actor[act.id];
	if(oldmap.list[act.type]) delete oldmap.list[act.type][act.id];
	
	if(act.type === 'player' && loggingout !== true){
		for(var i in oldmap.addon){
			if(oldmap.addon[i].playerLeave)
				oldmap.addon[i].playerLeave(act.id,map,oldmap.addon[i].spot,oldmap.addon[i].variable,oldmap);
		}
		Weather.onPlayerLeave(Actor.getMain(act),oldmap);
	}
	if(!oldmap.isTown && act.type === 'player' && oldmap.list.player.$isEmpty())
		Maps.remove(map);
	
}

Maps.enter = function(act,force){
	var map = act.map;
	var newmap = LIST[map];
	if(!newmap){
		if(!force) 
			return ERROR(3,'map dont exist',map);
		newmap = Maps.create(Maps.getModel(map),Maps.getVersion(map),act.id);
	}
	Maps.addToEntityList(newmap,act.type,act.id,true);
	
	ActiveList.init(act);
	
	if(act.type === 'player'){
		for(var i in newmap.addon){
			if(newmap.addon[i].playerEnter){
				newmap.addon[i].playerEnter(act.id,act.map,newmap.addon[i].spot,newmap.addon[i].variable,newmap);
			}
		}
		Weather.onPlayerEnter(Actor.getMain(act),newmap);
	}
}

Maps.remove = function(map){
	if(typeof map === 'string') 
		map = LIST[map];
	for(var i in map.list.bullet) 
		Bullet.remove(i);	//need to be first because activeList has npc
	for(var i in map.list.group) 
		ActorGroup.remove(i);
	for(var i in map.list.player){
		ERROR(4,'deleting map and player inside',map.id);   //should not happen
		Actor.teleport.town(Actor.get(i),true,true);
	}	
	for(var i in map.list.npc) 
		Actor.remove(i);
	for(var i in map.list.drop) 
		Drop.remove(i);
	for(var i in map.list.strike) 
		Strike.remove(i);
	delete LIST[map.id];
}

Maps.getCollisionRect = function(id,rect,type,cb){	//ONLY for actor, used in map loop. return array is no cb, else call func foreach
	var array = [];	
	for(var i in LIST[id].list[type]){
		var act = Actor.get(i);
		if(!act){ ERROR(3,'act dont exist',id,i); continue; }
		if(Collision.testPtRect(act,rect))	array.push(i);
	}
	if(!cb) return array;
	for(var i in array)	cb(array[i]);	
}

Maps.addToEntityList = function(map,list,id,includeInEntity){
	if(map.list.actor.$length() > 1000) 
		return ERROR(3,'too many monster',map.id);
	if(map.list.bullet.$length() > 10000) 
		return ERROR(3,'too many bullet',map.id);
	
	map.list[list][id] = id;
	
	if(includeInEntity)	//aka !group !anim
		map.list.entity[id] = id;
		
	if(list === 'player' || list === 'npc')
		map.list.actor[id] = id;
}

Maps.removeFromEntityList = function(map,list,id){
	delete map.list[list][id];
	delete map.list.actor[id];
	delete map.list.entity[id];
}

Maps.removeAllAnim = function(){
	for(var i in LIST){
		LIST[i].list.anim = {};
	}
}

Maps.getSpot = function(map,addon,spot){
	var res = map.addon[addon] && map.addon[addon].spot[spot];
	if(!res) return ERROR(3,'spot dont exist',map.id,addon,spot);
	return res;
}

Maps.getPlayerInMap = function(map){
	//verify list integrety
	for(var i in map.list.player){
		if(!Actor.get(i)){
			Sign.off.onError(i);
			delete map.list.player[i];
		}
	}
	
	return Object.keys(map.list.player);
}
Maps.getNpcInMap = function(map){
	return Object.keys(map.list.npc);
}
Maps.getActorInMap = function(map){
	return Maps.getPlayerInMap(map).concat(Maps.getNpcInMap(map));
}
Maps.get = function(id){
	return LIST[id] || null;
}

Maps.addBankSpot = function(spot){
	var map = Maps.get(spot.map);
	map.bankSpot.push(spot);
}

Maps.isNearBank = function(map,pt){
	for(var i in map.bankSpot){
		if(Collision.getDistancePtPt(pt,map.bankSpot[i]) < BANK_DIST)
			return true;
	}
	return false;
}















