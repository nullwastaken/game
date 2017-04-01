
"use strict";
var Actor, Quest, Combat, Collision, Strike, Weather, Main, Strike, Sign, MapModel, Drop, Bullet, Entity, Collision, ActorGroup;
global.onReady(function(){
	Strike = rootRequire('shared','Strike'); Main = rootRequire('shared','Main'); Actor = rootRequire('shared','Actor'); Quest = rootRequire('server','Quest'); Combat = rootRequire('server','Combat'); Collision = rootRequire('shared','Collision'); Weather = rootRequire('server','Weather'); Strike = rootRequire('shared','Strike'); Sign = rootRequire('private','Sign'); MapModel = rootRequire('server','MapModel'); Drop = rootRequire('shared','Drop'); Bullet = rootRequire('shared','Bullet'); Entity = rootRequire('shared','Entity'); Collision = rootRequire('shared','Collision'); ActorGroup = rootRequire('server','ActorGroup');
	global.onLoop(Maps.loop);
});
var Maps = exports.Maps = function(extra){
	this.id = '';
	this.addon = {};	//needed cuz spot custom
	this.model = '';
	this.lvl = 0;
	this.name = '';
	this.version = VERSION_MAIN;
	this.screenEffect = '';
	this.timer = 10000;
	this.creatorKey = '';
	this.loaded = false;
	this.list = Maps.List();		//acts like all but for faster activeList and collisionRect
	this.customLoop = {};	//function()
	this.preventCameraMovement = false;
	Tk.fillExtra(this,extra);
};

var VERSION_MAIN = 'MAIN';
var BANK_DIST = 400;

Maps.TYPE = {
	SOLO:'solo',
	MAIN:'main',
	PARTY:'party',	
}


Maps.create = function(namemodel,version,creatorKey){	//create instance of map. version is usually the player name
	var model = MapModel.get(namemodel);
	if(!model) 
		return ERROR(3,'invalid map model',namemodel);

	var tmp = new Maps({
		creatorKey:creatorKey,
		version:version,
		id:Maps.generateId(namemodel,version),
		addon:Tk.deepClone(model.addon),
		name:model.name,
		model:model.id,
		screenEffect:model.screenEffect,
		preventCameraMovement:model.preventCameraMovement,
		lvl:model.lvl,
		timer:version === VERSION_MAIN ? 1/0 : 5*60*1000/25,
	});
	
	
	for(var i in tmp.addon){ 
		for(var j in tmp.addon[i].spot){
			tmp.addon[i].spot[j].map = tmp.id;
			tmp.addon[i].spot[j].mapModel = namemodel;
			tmp.addon[i].spot[j].addon = i;
			tmp.addon[i].spot.map = tmp.id;
		}
	}
	
	LIST[tmp.id] = tmp;
	
	Maps.load(tmp,creatorKey);
	return tmp;
}

Maps.generateId = function(namemodel,version){
	return namemodel + CST.MAP.separator + version;
}

Maps.List = function(){
	return {
		entity:{},
		teleport:{},
		player:{},
		bullet:{},
		npc:{},
		anim:{},
		actor:{},
		drop:{},
		group:{},
		strike:{},
	}
}

Maps.TRANSITION_SPOT = {x:0,y:0,map:'QfirstTown-transitionMap@MAIN',mapModel:'QfirstTown-transitionMap'};	//BAD cant Actor.Spot cuz undefined...
var FRAME_COUNT = 0;
var LIST = Maps.LIST = {};
var DIST_AUTO_TELEPORT = 50; 

Maps.getModel = function(map){
	var index = map.indexOf(CST.MAP.separator);
	return index === -1 ? map : map.slice(0,index);
}

Maps.getVersion = function(name){
	return name.replace(Maps.getModel(name),"").replace(CST.MAP.separator,"") || VERSION_MAIN;
}

Maps.getInstanceType = function(name){
	if(name.$contains(CST.MAP.separator + VERSION_MAIN)) return Maps.TYPE.MAIN;
	if(name.$contains(CST.MAP.solo)) return Maps.TYPE.SOLO;
	if(name.$contains(CST.MAP.separator)) return Maps.TYPE.PARTY;
	return Maps.TYPE.MAIN;
}

Maps.load = function(map,key){
	var order = Maps.load.getLoadingOrder(map);
	for(var i = 0 ; i < order.length; i++){
		if(map.addon[order[i]].load)
			map.addon[order[i]].load(map.addon[order[i]].spot,key);
	}
	map.loaded = true;
}

Maps.load.getLoadingOrder = function(map){	//only support simple
	var tmp = map.addon.$keys();
	tmp.sort(function(a,b){
		if(a === 'QfirstTown')
			return -1;
		if(b === 'QfirstTown')
			return 1;
		var q1 = Quest.get(a);
		var q2 = Quest.get(b);
		return q1.loadingPrerequisite.length-q2.loadingPrerequisite.length;
	});
	return tmp;
}

Maps.loop = function(){
	FRAME_COUNT++;
	for(var i in LIST)
		Maps.loop.forEach(LIST[i]);
}

Maps.loop.forEach = function(map){
	//Time Out Instance
	if(FRAME_COUNT % Math.floor(10*1000/25) === 0){		//each 10 sec
		if(!map.isTown && map.list.player.$isEmpty()){
			Maps.remove(map);
			return;
		}	
	}
	
	if(FRAME_COUNT % 5 === 0){	//auto teleport
		for(var i in map.list.player){
			var act = Actor.get(i);
			if(act.lastTeleport !== null){
				//var dist = Math.min(Math.abs(act.x - act.lastTeleport.x),Math.abs(act.y - act.lastTeleport.y));	//this allows large regular teleport zone
				if(Collision.getDistancePtPt(act,act.lastTeleport) > DIST_AUTO_TELEPORT*4){
					act.lastTeleport = null;
				}
				continue;
			}
			for(var j in map.list.teleport){
				if(!Actor.get(j)){
					ERROR(3,'teleport not there',j,map.id);
					delete map.list.teleport[j];
				}
				if(Collision.getDistancePtPt(act,Actor.get(j)) < DIST_AUTO_TELEPORT){
					if(act.activeList[j]){
						Actor.click.teleport(act,j);
						act.lastTeleport = Actor.LastTeleport(act.x,act.y);	//to prevent calling multi times if no teleport happens
						if(!Maps.get(map.id))	//aka got removed when removed player
							return;
					}
				}					
			}
		}
	}
	
	
	
	for(var i in map.addon){
		if(map.addon[i].loop && !map.list.player.$isEmpty()){
			map.addon[i].loop(map.addon[i].spot);
		}
	}
	for(var i in map.customLoop){
		map.customLoop[i]();
	}
}
Maps.addCustomLoop = function(map,id,func){
	if(typeof func !== 'function')
		return ERROR(3,'func is no function');
	map.customLoop[id] = func;
}
Maps.removeCustomLoop = function(map,id){
	delete map.customLoop[id];
}
Maps.removeAllCustomLoop = function(map,sqid){
	for(var i in map.customLoop){
		if(i.$contains(sqid,true))
			delete map.customLoop[i];
	}
}
Maps.addAutoTeleport = function(map,eid){
	map.list.teleport[eid] = eid;
}

Maps.leave = function(act,map,loggingout){
	map = map || act.map;
	var oldmap = LIST[map];
	if(!oldmap) 
		return;	//ex: teleport after login
	
	Entity.clear(act);
	
	delete oldmap.list.actor[act.id];
	if(oldmap.list[act.type]) 
		delete oldmap.list[act.type][act.id];
	
	if(act.type === CST.ENTITY.player && loggingout !== true){
		for(var i in oldmap.addon){
			if(oldmap.addon[i].playerLeave)
				oldmap.addon[i].playerLeave(act.id,map,oldmap.addon[i].spot,oldmap.addon[i].variable,oldmap);
		}
		Weather.onPlayerLeave(Actor.getMain(act),oldmap);
		
		if(oldmap.preventCameraMovement)
			Main.setPreventCameraMovement(Actor.getMain(act),false);
	}
	if(!oldmap.isTown && act.type === CST.ENTITY.player && oldmap.list.player.$isEmpty())
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
	Maps.addToEntityList(newmap,act.type,act.id);
	
	Entity.init(act);
	
	if(act.type === CST.ENTITY.player){
		for(var i in newmap.addon){
			if(newmap.addon[i].playerEnter){
				newmap.addon[i].playerEnter(act.id,act.map,newmap.addon[i].spot,newmap.addon[i].variable,newmap);
			}
		}
		if(newmap.preventCameraMovement)
			Main.setPreventCameraMovement(Actor.getMain(act),true);
			
		Combat.onMapEnter(act,newmap);
		Weather.onMapEnter(Actor.getMain(act),newmap);
	}
}

Maps.remove = function(map){
	if(typeof map === 'string') 
		map = LIST[map];
	for(var i in map.list.bullet) 
		Bullet.remove(i);	//need to be first because activeList has npc
	for(var i in map.list.strike) 
		Strike.remove(i);	//need to be first because activeList has npc
	for(var i in map.list.group) 
		ActorGroup.remove(i);
	for(var i in map.list.player){
		ERROR(4,'deleting map and player inside',map.id);   //should not happen
		Actor.teleport.town(Actor.get(i),true);
	}	
	for(var i in map.list.npc) 
		Actor.remove(i);
	for(var i in map.list.drop) 
		Drop.remove(i);
	delete LIST[map.id];
}

Maps.addToEntityList = function(map,type,id){	//BAD list is CST.ENTITY but not really...
	if(map.list.actor.$length() > 1000) 
		return ERROR(3,'too many monster',map.id);
	if(map.list.bullet.$length() > 10000) 
		return ERROR(3,'too many bullet',map.id);
	
	if(type === CST.ENTITY.drop){
		map.list.drop[id] = id;
		map.list.entity[id] = id;
	} else if(type === CST.ENTITY.player){
		map.list.player[id] = id;
		map.list.actor[id] = id;
		map.list.entity[id] = id;
	} else if(type === CST.ENTITY.npc){
		map.list.npc[id] = id;
		map.list.actor[id] = id;
		map.list.entity[id] = id; 
	} else if(type === CST.ENTITY.bullet){
		map.list.bullet[id] = id;
		map.list.entity[id] = id;
	} else if(type === CST.ENTITY.strike){
		map.list.strike[id] = id;
		map.list.entity[id] = id;
	} else if(type === CST.ENTITY.anim){
		map.list.anim[id] = id;
	} else if(type === 'group'){
		map.list.group[id] = id;
	} else
		ERROR(3,'invalid type',type);
		
}

Maps.removeFromEntityList = function(map,list,id){	//actor uses Maps.leave instead
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
	return Tk.deepClone(res);
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

Maps.getActorInMap = function(map,obj){
	if(obj)
		return map.list.actor;
	return Object.keys(map.list.actor);
}

Maps.get = function(id){
	return LIST[id] || null;
}

Maps.isNearBank = function(map,pt){
	for(var i in map.list.npc){
		var act = Actor.get(i);
		if(!act.bank)
			continue;
		if(Collision.getDistancePtPt(pt,act) < BANK_DIST)
			return true;
	}
	return false;
}

Maps.getNearWaypoint = function(map,pt){
	for(var i in map.list.npc){
		var act = Actor.get(i);
		if(!act.waypoint)
			continue;
		if(Collision.getDistancePtPt(pt,act) < BANK_DIST)
			return act;
	}
	return null;
}

Maps.getNearShop = function(map,pt){	//unused
	for(var i in map.list.npc){
		var act = Actor.get(i);
		if(!act.shop)
			continue;
		if(Collision.getDistancePtPt(pt,act) < BANK_DIST)
			return act;
	}
	return null;
}

Maps.Spot = function(x,y,map,mapModel){
	return Actor.Spot(x,y,map,mapModel);
}





