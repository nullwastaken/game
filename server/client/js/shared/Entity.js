
"use strict";
(function(){ //}
var Actor, Bullet, Strike, Sign, Maps, Drop, Collision;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Bullet = rootRequire('shared','Bullet'); Strike = rootRequire('shared','Strike'); Sign = rootRequire('private','Sign'); Maps = rootRequire('server','Maps'); Drop = rootRequire('shared','Drop'); Collision = rootRequire('shared','Collision');
});
var DEFAULT_MAP = 'QfirstTown-main';
var Entity = exports.Entity = function(extra){
	this.x = 0;
	this.y = 0;
	this.map = DEFAULT_MAP;
	this.mapModel = DEFAULT_MAP;
	this.id = Math.randomId();
	this.type = '';
	this.activeList = {};
	this.change = {};	//unused by bullet
	this.viewedIf = CST.VIEWED_IF.always;
	this.toRemoveTimer = 0;
	this.isActor = false;
	Tk.fillExtra(this,extra);
}

//activelist used: boss, target, mapMod, chat, button, send
//bullet: Collision.bulletActor, 

var LIST = Entity.LIST = {};
var WIDTH_VIEW = CST.WIDTH*2;
var HEIGHT_VIEW = CST.HEIGHT*2;

Entity.onPackReceived = Tk.newPubSub(true);

Entity.TYPE = {drop:1,actor:2,bullet:3,strike:4};

Entity.create = function(pack,id,timeDiff){
	var type = pack[0];
	return Entity.onPackReceived.pub(type,pack,id,timeDiff);
}

Entity.testViewed = function(act,obj){
	try{
		return Entity.testViewed.main(act,obj);
	} catch(err){ 
		ERROR.err(3,err); 
		return false;
	}
}

Entity.testViewed.main = function(act,obj){
	//Test used to know if obj should be in activeList of act.
	//optimization: test only once for each pair. ex: act.activeListAlreadyTest
	if(!obj)
		return false;
	if(act.id === obj.id)
		return false;
	if(!obj.viewedIf || !act.viewedIf)
		return false;
	if(obj.viewedIf === CST.VIEWED_IF.never || act.viewedIf === CST.VIEWED_IF.never)
		return false;
	if(act.map !== obj.map)
		return false;
	if((obj.dead || act.dead) && act.type !== CST.ENTITY.player && obj.type !== CST.ENTITY.player)
		return false;
		
	if(typeof obj.viewedIf === 'function')
		if(!act.isActor || !obj.viewedIf(act.id,obj.id))
			return false; 
	if(typeof act.viewedIf === 'function')
		if(!obj.isActor || !act.viewedIf(obj.id,act.id))
			return false;
	if(typeof obj.viewedIf === 'object' && obj.viewedIf.indexOf(act.id) === -1)
		return false;
	if(typeof act.viewedIf === 'object' && act.viewedIf.indexOf(obj.id) === -1)
		return false;
	
	return Collision.testPtRect.fast(obj,act.x-WIDTH_VIEW/2,act.y-HEIGHT_VIEW/2,WIDTH_VIEW,HEIGHT_VIEW);
}

Entity.updateActiveList = function(act){	//called by npc in loop
	var tested = {};
	//Test Already in List if they deserve to stay
	for(var j in act.activeList){
		tested[j] = 1;
		if(!Entity.testViewed(act,LIST[j])){
			delete LIST[j].activeList[act.id];
			delete act.activeList[j];
			
			if(act.type === CST.ENTITY.player)
				act.removeList.push(j);
		}
	}
	
	//Add New Boys
	var map = Maps.get(act.map);
	for(var j in map.list.entity){
		if(tested[j]) continue;	//no need to test again

		if(Entity.testViewed(act,LIST[j])){
			act.activeList[j] = Entity.NEVER_SEEN;			//for player, if 1:need init, if 2:just update
			LIST[j].activeList[act.id] = Entity.NEVER_SEEN;	
		}
	}
}

Entity.init = function(act){	//when Maps.enter
	var map = Maps.get(act.map);
	if(!map) return ERROR(3,'no map');
	if(act.type === CST.ENTITY.bullet){
		for(var j in map.list.actor){	//attack only need to check actor
			if(Entity.testViewed(act,LIST[j])){
				act.activeList[j] = Entity.NEVER_SEEN;				//needs to be there for collision detect
				if(LIST[j].type === CST.ENTITY.player) 
					LIST[j].activeList[act.id] = Entity.NEVER_SEEN;	//only players should be aware of bullets. otherwise, enemy becomes active
				//for player, if 1:need init, if 2:just update
			}
		}
		return;
	}
	if(act.type === CST.ENTITY.player || act.awareNpc){
		for(var j in map.list.entity){
			if(Entity.testViewed(act,LIST[j])){
				act.activeList[j] = Entity.NEVER_SEEN;
				LIST[j].activeList[act.id] = Entity.NEVER_SEEN;	
			}
		}
		return;
		//bug: if both player tele same time, player is in both add and remove list. fixed in Receive.js	
	}	
	if(act.type === CST.ENTITY.npc){	
		for(var j in map.list.actor){	//only check for player nearby
			if(!LIST[j]){
				ERROR(2,'actor is in map list but not in LIST');
				delete map.list.actor[j];
				continue;
			}	
			
			if(LIST[j].type === CST.ENTITY.player && Entity.testViewed(act,LIST[j])){
				act.activeList[j] = Entity.NEVER_SEEN;
				LIST[j].activeList[act.id] = Entity.NEVER_SEEN;	
			}
		}
		return;
	}	
}

Entity.clear = function(act){	//called when living forever
	if(!SERVER) return;
	if(!act) return ERROR(2,'actor dont exist');
		
	for(var i in act.activeList){
		var viewer = LIST[i];
		if(!viewer) continue; 	//normal for npc because when npc dies, he cant tell the bullet cuz not in activeList
		//add yourself in removeList of others
		if(Actor.isPlayer(viewer)) 
			viewer.removeList.push(act.id);
        
		//add them to your list
		if(Actor.isPlayer(act)) 
			act.removeList.push(viewer.id);
		
		delete viewer.activeList[act.id];
	}
	
	act.activeList = {};	
}

Entity.removeAny = function(act){
	if(typeof act === 'string') 
		act = LIST[act];
	if(!act) 
		return SERVER && ERROR(2,'actor dont exist');	//on client, normal for bullets
	if(act.type === CST.ENTITY.bullet) 
		Bullet.remove(act);
	else if(act.type === CST.ENTITY.npc) 
		Actor.remove(act);
	else if(act.type === CST.ENTITY.player){
		if(SERVER)
			Sign.off(act.id);
		else 
			Actor.remove(act);
	}
	else if(act.type === CST.ENTITY.drop) 
		Drop.remove(act);
	else if(act.type === CST.ENTITY.strike) 
		Strike.remove(act);
}
Entity.initRemove = function(e){
	if(e.type === CST.ENTITY.bullet)
		Bullet.initRemove(e);
	else if(e.isActor)
		Actor.initRemove(e);
	else if(e.type === CST.ENTITY.drop)
		Drop.initRemove(e);
	else
		Entity.removeAny(e);
}


Entity.NEVER_SEEN = 1;
Entity.SEEN = 2;

Entity.get = function(id){
	return Entity.LIST[id] || null;
}

Entity.addToList = function(bullet){
	Entity.LIST[bullet.id] = bullet;
}
Entity.removeFromList = function(id){
	delete Entity.LIST[id]; 
}

var TIME_REMOVE_INACTIVE = 250;	//must be greater than 200 cuz LOOP100 Send
Entity.removeInactive = function(){ //client
	for(var i in LIST){
		var act = LIST[i];
		var TIME = act.type === CST.ENTITY.bullet ? TIME_REMOVE_INACTIVE : TIME_REMOVE_INACTIVE/2;
		//if(act.map !== w.player.map)	//NOT WORKING
		//	TIME /= 4;		
		if(act.isActor && act.dummy)
			continue;
		if(++act.toRemoveTimer > TIME)
			Entity.removeAny(i);
	}
}
})();


