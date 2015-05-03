//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require2('Main'), Achievement = require2('Achievement'), MapModel = require2('MapModel'), ActiveList = require2('ActiveList'), Maps = require2('Maps'), Message = require2('Message');
var Actor = require3('Actor');

Actor.RespawnLoc = function(recent,safe){
	return {
		recent:recent || Tk.deepClone(Actor.DEFAULT_SPOT),
		safe:safe || Tk.deepClone(Actor.DEFAULT_SPOT),
	};
}

Actor.RespawnLoc.compressDb = function(respawnLoc){
	respawnLoc.recent.x = Math.round(respawnLoc.recent.x);
	respawnLoc.recent.y = Math.round(respawnLoc.recent.y);
	respawnLoc.safe.x = Math.round(respawnLoc.safe.x);
	respawnLoc.safe.y = Math.round(respawnLoc.safe.y);
	return respawnLoc;
}

Actor.RespawnLoc.uncompressDb = function(respawnLoc){	//add verify
	if(!Actor.RespawnLoc.testIntegrity(respawnLoc)) 
		return Actor.RespawnLoc();
	return respawnLoc;
}

Actor.RespawnLoc.testIntegrity = function(respawnLoc){
	if(!MapModel.get(respawnLoc.safe.map) || !MapModel.get(respawnLoc.recent.map)){
		ERROR(3,'invalid map respawnLoc',respawnLoc);
		return false;
	}
	return true;
}
	
	
Actor.Spot = function(x,y,map){
	return {
		x:x !== undefined ? x : Actor.DEFAULT_SPOT.x,
		y:y !== undefined ? y : Actor.DEFAULT_SPOT.y,
		map:map||Actor.DEFAULT_SPOT.map,	
	}
}

//#####################

Actor.setRespawn = function(act,spot,isSafe){
	spot = Tk.deepClone(spot);
	spot.map = Actor.teleport.getMapName(act,spot.map);
	
	act.respawnLoc.recent = spot;
	
	var type = Maps.getInstanceType(spot.map);
	if(isSafe || type === 'public') act.respawnLoc.safe = Tk.deepClone(spot);
}

Actor.setRespawn.town = function(act){
	Actor.setRespawn(act,Actor.setRespawn.town.SPOT,true);
}

Actor.setRespawn.town.SPOT = {x:40*32,y:70*32,map:'QfirstTown-main@MAIN'};
	
Actor.getRespawnSpot = function(act){
	var recentmap = Actor.teleport.getMapName(act,act.respawnLoc.recent.map);
	if(Maps.get(recentmap)) return act.respawnLoc.recent;
	return act.respawnLoc.safe;
}
	
Actor.getPartyName = function(act){
	return Main.get(act.id).party.id;
}

//############################

Actor.teleport = function(act,spot,force){
	try {
		return Actor.teleport.main(act,spot,force);
	} catch(err){  ERROR.err(3,err);}
}

Actor.teleport.main = function(act,spot,force){
	act.x = spot.x;
	act.y = spot.y;
	var map = force ? spot.map : Actor.teleport.getMapName(act,spot.map);	//allow admin to go in solo instance
	
	act.mapModel = Maps.getModel(map);
	
	if(act.map === map){ 			//regular teleport
		ActiveList.update(act);
		return; 
	}
	if(!Maps.get(map)) //test if need to create instance
		Maps.create(Maps.getModel(map),Maps.getVersion(map),act.id); 

	Maps.leave(act); 
	act.map = map;
	Maps.enter(act);
	ActiveList.update(act);
	Actor.questMarker.update(act);
	Achievement.onTeleport(Actor.getMain(act),spot);
}


Actor.teleport.getMapName = function(act,map){
	if(!map) return act.map;
	if(map.$contains("@MAIN"))	return map + '@MAIN'; 				//main instance
	if(!map.$contains("@"))	return map + '@MAIN'; 				//main instance
	if(map.$contains("@@"))	return map.split('@@')[0] + '@@' + act.username; 				//alone instance
	//after @@
	if(map.$contains("@")) return map.split('@')[0] + '@' + Actor.getPartyName(act);	//party instance
	return map;
}

Actor.teleport.town = function(act,respawntoo,force){
	if(force === false && !Main.quest.haveDoneTutorial(Actor.getMain(act))) 
		return Message.add(act.id,'You need to complete the tutorial to do that.');
	Actor.teleport(act,Actor.setRespawn.town.SPOT);
	if(respawntoo) Actor.setRespawn.town(act);
	return true;
}

Actor.teleport.fromQuest = function(act,spot,newmap,deleteold){
	var oldmap = act.map;
	if(newmap){
		var targetMap = Actor.teleport.getMapName(act,spot.map);
		var targetMapObject = Maps.get(targetMap);
		if(targetMapObject){
			if(oldmap === targetMap){
				var playerList = Maps.getPlayerInMap(targetMapObject);
				for(var i = 0 ; i < playerList.length; i++)
					Actor.teleport(Actor.get(playerList[i]),Maps.TRANSITION_SPOT,true); //if player in map, teleport out before delete
				Maps.remove(targetMapObject);
			}
		}
	}
	Actor.teleport(act,spot);
	//if newmap && targetMapObject, s.teleport will teleport the other ppl correctly
	
	var oldmapObject = Maps.get(oldmap);
	if(deleteold !== false && oldmapObject && oldmapObject.list.player.$isEmpty())
		Maps.remove(oldmapObject);
}
	
Actor.isNearBank = function(act){
	return Maps.isNearBank(Maps.get(act.map),act);
}	

})(); //{

















