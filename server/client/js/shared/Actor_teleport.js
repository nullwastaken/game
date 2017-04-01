
"use strict";
(function(){ //}
var Main, Achievement, MapModel, Entity, Maps, Message;
global.onReady(function(){
	Main = rootRequire('shared','Main'); Achievement = rootRequire('shared','Achievement'); MapModel = rootRequire('server','MapModel'); Entity = rootRequire('shared','Entity'); Maps = rootRequire('server','Maps'); Message = rootRequire('shared','Message');
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.homeTele,Command.ACTOR,[ //{
	],Actor.teleport.onTownCommand); //}
	
	Command.create(CST.COMMAND.teleportTo,Command.ACTOR,[ //{
		Command.Param('string','Username',false),
		Command.Param('boolean','Bypass Confirmation',true),
	],Actor.teleport.joinPlayer); //}
	
});
var Actor = rootRequire('shared','Actor');

Actor.TOWN_SPOT = Actor.Spot(1250,1800,'QfirstTown-main@MAIN','QfirstTown-main');
Actor.TUTORIAL_SPOT = Actor.Spot(352,336,'Qtutorial-intro@@','Qtutorial-intro');

Actor.getTutorialStartSpot = function(act){
	var spot = Tk.deepClone(Actor.TUTORIAL_SPOT);
	spot.map += act.username;
	return spot;
}
	
Actor.RespawnLoc = function(recent,safe){
	return {
		recent:recent || Tk.deepClone(Actor.TOWN_SPOT),
		safe:safe || Tk.deepClone(Actor.TOWN_SPOT),
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

Actor.RespawnLoc.getDbSchema = function(){
	return {
		recent:{x:Number,y:Number,map:String,mapModel:String},
		safe:{x:Number,y:Number,map:String,mapModel:String},
	}
};

Actor.RespawnLoc.testIntegrity = function(respawnLoc){
	if(!MapModel.get(respawnLoc.safe.mapModel) || !MapModel.get(respawnLoc.recent.mapModel)){
		ERROR(3,'invalid map respawnLoc',respawnLoc);
		return false;
	}
	return true;
}

Actor.LastTeleport = function(x,y){
	return CST.pt(x,y);
}	

//#####################

Actor.setRespawn = function(act,spot,isSafe){
	//spot can be another player so no deepclone
	var spot2 = Actor.Spot(spot.x,spot.y,Actor.teleport.getMapName(act,spot.map),spot.mapModel);
	
	act.respawnLoc.recent = spot2;
	
	var type = Maps.getInstanceType(spot2.map);
	if(isSafe || type === Maps.TYPE.MAIN) 
		act.respawnLoc.safe = Tk.deepClone(spot2);
}

Actor.setRespawn.town = function(act){
	Actor.setRespawn(act,Actor.TOWN_SPOT,true);
}

Actor.getRespawnSpot = function(act){
	var recentmap = Actor.teleport.getMapName(act,act.respawnLoc.recent.map);
	if(Maps.get(recentmap)) 
		return act.respawnLoc.recent;
	return act.respawnLoc.safe;
}
	
Actor.getPartyName = function(act){
	return Main.get(act.id).party.id;
}

//############################
Actor.setXY = function(act,x,y,flag){
	act.x = x;
	act.y = y;
	Actor.bumper.update(act);
	if(flag !== false){
		Actor.setChange(act,'x',act.x);
		Actor.setChange(act,'y',act.y);
	}
}

Actor.teleport = function(act,spot,forceInstance,transitionType){	//DONT CALL DIRECTLY, use Actor.teleport.fromQuest for normal stuff
	if(!act)
		return ERROR(3,'no actor');
	if(!Actor.isPlayer(act)){
		act.x = spot.x;
		act.y = spot.y;
		return;
	}
	
	Actor.setPrivateChange(act,'transitionMap',{ //HCODE
		x:spot.x,
		y:spot.y,
		map:spot.mapModel,
		type:transitionType,
		direction:Actor.teleport.getDirection(act,spot)
	}); 
	
	Actor.setXY(act,spot.x,spot.y);
	act.lastTeleport = Actor.LastTeleport(spot.x,spot.y);
	var map = forceInstance ? spot.map : Actor.teleport.getMapName(act,spot.map);	//allow admin to go in solo instance
	
	act.mapModel = Maps.getModel(map);
	
	if(act.map === map){ 			//regular teleport
		Entity.updateActiveList(act);
		return; 
	}
	if(!Maps.get(map)) //test if need to create instance
		Maps.create(Maps.getModel(map),Maps.getVersion(map),act.id);

	Maps.leave(act); 
	act.map = map;
	
	Maps.enter(act);
	Entity.updateActiveList(act);
	Achievement.onTeleport(Actor.getMain(act),spot);
	Main.setSideQuestHint(Actor.getMain(act),null);	//kinda bad...
}

Actor.teleport.getDirection = function(act,spot){
	var diffX = Math.abs(spot.x - act.x);
	var diffY = Math.abs(spot.y - act.y);
	
	if(diffX < diffY){	//vertical
		if(act.y < 300)
			return 'up';
		return 'down';
	} else {	//horiz
		if(act.x < 300)
			return 'left';
		return 'right';
	}
	return null;
}

Actor.teleport.getMapName = function(act,map){
	if(!map) return act.map;
	var atMain = CST.MAP.separator + CST.MAP.MAIN;
	if(map.$contains(atMain))	
		return map; 				//main instance
	if(!map.$contains(CST.MAP.separator))	
		return map + atMain; 				//main instance
	if(map.$contains(CST.MAP.solo))
		return Tk.getSplit0(map,CST.MAP.solo) + CST.MAP.solo + act.username; 				//alone instance
	//after @@
	if(map.$contains(CST.MAP.separator)) 
		return Tk.getSplit0(map,CST.MAP.separator) + CST.MAP.separator + Actor.getPartyName(act);	//party instance
	return map;
}

Actor.teleport.town = function(act,force){
	if(force === false && !Main.quest.haveCompletedTutorial(Actor.getMain(act))) 
		return Message.add(act.id,'You need to complete the tutorial to do that.');
	Actor.teleport(act,Actor.TOWN_SPOT);
	Actor.revivePlayer(act);
	Actor.setRespawn.town(act);
	return true;
}

Actor.teleport.fromQuest = function(act,spot,newmap,deleteold,transitionType){
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
	Actor.teleport(act,spot,false,transitionType);	
	
	//if newmap && targetMapObject, s.teleport will teleport the other ppl correctly
	
	var oldmapObject = Maps.get(oldmap);
	if(deleteold !== false && oldmapObject && oldmapObject.list.player.$isEmpty())
		Maps.remove(oldmapObject);
}

Actor.isNearBank = function(act){
	return Maps.isNearBank(Maps.get(act.map),act);
}	

Actor.addToMap = function(act,spot,force){	//act=[Actor]
	if(!force && !Actor.addToMap.test(act,spot)) 
		return;
	
	act.map = spot.map;
	act.mapModel = Maps.getModel(spot.map);
	
	act.x = spot.x;
	act.y = spot.y;
	act.lastTeleport = Actor.LastTeleport(spot.x,spot.y);
	act.targetMain = Actor.TargetMain(null,spot.x,spot.y);	
	act.targetSub =  Actor.TargetSub(spot.x,spot.y);	
	
	Actor.addToList(act);
	Entity.addToList(act);
	Maps.enter(act,force);
	
	if(act.pushable || act.block) 
		Actor.stickToGrid(act);
	Actor.verifyBlockPosition(act);

	return act;
}

Actor.addToMap.test = function(act,spot){
	if(!Maps.get(spot.map)) 
		return ERROR(3,'map dont exist?',spot.map);
	return true;
}

Actor.isInTownMap = function(act){
	return MapModel.get(Maps.get(act.map).model).isTown;
}

Actor.teleport.onTownCommand = function(act){
	var main = Actor.getMain(act);
	var str = Main.getQuestActive(main) 
		? 'Are you sure you want to abandon active quest and teleport to town?'
		: 'Teleport to town?';
	Main.askQuestion(main,function(){
		if(Actor.teleport.town(act,false) !== true) 
			return;
		Main.abandonQuest(main);
		Message.add(act.id,'You were teleported to town.');		
	},str,'boolean');
}

Actor.teleport.joinPlayer = function(act,name,bypass){
	if(act.dead)
		return Message.add(key,'You can\'t teleport while dead.');
	
	var key = act.id;
	var func = function(){
		var main = Main.get(key);
		if(!Main.quest.haveCompletedTutorial(main))
			return Message.add(key,'You need to finished the tutorial first.');
		if(main.questActive)
			return Message.add(key,'You can\'t teleport to another player while doing a quest.');
		
		if(act.pvpEnabled)
			return Message.add(key,'You can\'t teleport to another player while having PvP on.');
		var other = Actor.getViaName(name);
		if(!other)
			return Message.add(key,'The player ' + name + ' is not online.');
		if(other.pvpEnabled)
			return Message.add(key,'You can\'t teleport to another player who has PvP on.');
		if(Actor.getMain(other).questActive)
			return Message.add(key,'The player ' + name + ' is currently doing a quest. You can\'t teleport to him.');
		
		Actor.teleport(act,other);
		Actor.setRespawn(act,other);
		Message.add(other.id,'The player ' + main.name + ' teleported to your location.');
		Message.add(key,'You successfully teleported to ' + name + '.');
	};
	if(bypass)
		func();
	else 
		Main.askQuestion(Main.get(key),function(){
			func();	//recursive
		},'Are you sure you want to teleport to "' + name + '"?','boolean');
	
}

})(); //{

















