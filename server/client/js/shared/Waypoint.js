
"use strict";
;(function(){ //}
var MapModel, Main, Actor;
global.onReady(function(){
	MapModel = rootRequire('server','MapModel'); Main = rootRequire('shared','Main'); Actor = rootRequire('shared','Actor');
});
var Waypoint = exports.Waypoint = {};

var DB = Waypoint.DB = {};	//model

Waypoint.create = function(id,canUse,cantUseMessage){
	if(DB[id])
		return ERROR(3,'id already taken',id);
		
	var a = {
		id:id || '',
		onUse:null,	//set later Waypoint.addInstance
		canUse:canUse || function(){ return true; },	//canUse(main,act) return bool
		cantUseMessage:cantUseMessage || 'You haven\'t unlocked this waypoint yet.'
	};
	
	DB[id] = a;
	return a;
}

Waypoint.testCanUse = function(way,main,act){
	return !!way.canUse(main,act);
}

Waypoint.addInstance = function(model,spot,onUse){
	if(MapModel.hasFinishedTestSpawn())
		return;
	if(typeof onUse !== 'function')
		return ERROR(3,'onUse must be function');
	DB[model].onUse = onUse;
}

Waypoint.use = function(way,act){
	way.onUse(act.id);
	Main.closeDialog(Actor.getMain(act),'worldMap');
}

Waypoint.get = function(id,noError){
	if(DB[id])
		return DB[id];
	if(!noError)
		ERROR(3,'invalid id',id)
	return null;
}



;(function(){ //}
	Waypoint.create('QfirstTown-main',function(main,act){
		return true;
	},'');

	Waypoint.create('QfirstTown-wBridge',function(main,act){
		return Main.haveCompletedAchievement(main,'sideQuestWest5');
	},'This waypoint can be unlocked by completing 5 side quests.');



})(); //{





})(); //{











