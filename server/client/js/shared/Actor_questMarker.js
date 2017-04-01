
"use strict";
(function(){ //}
var MapGraph, Img;
global.onReady(function(){
	MapGraph = rootRequire('shared','MapGraph');
	Img = rootRequire('client','Img',true);
});
var Actor = rootRequire('shared','Actor');


var NO_PATH = -1;

Actor.QuestMarker = function(goal,client){
	goal = goal || {};
	client = client || {};
	var a = {
		client:{	//what appears in client map
			x:client.x || 0,
			y:client.y || 0,
		},
		goal:{
			x:goal.x || 0,
			y:goal.y || 0,
			map:MapGraph.getModel(goal.map || Actor.TOWN_SPOT.map),		
		}	
	}
	return a;
}

Actor.questMarker = {};

Actor.questMarker.update = function(act){
	var toUpdate = false;
	for(var i in act.questMarker){
		var qm = act.questMarker[i];
		qm.client = MapGraph.findPath(act,qm.goal) || CST.pt(NO_PATH,NO_PATH);
		toUpdate = true;
	}	
	if(toUpdate)
		Actor.setChange(act,'questMarker',act.questMarker);	//BAD... should only call if change
}

Actor.addQuestMarker = function(act,id,destination){
	act.questMarker[id] = Actor.QuestMarker(destination);
	Actor.setChange(act,'questMarker',act.questMarker);
}

Actor.removeQuestMarker = function(act,id){
	delete act.questMarker[id]
	Actor.setChange(act,'questMarker',act.questMarker);
}

Actor.removeAllQuestMarker = function(act){
	act.questMarker = {};
	Actor.setChange(act,'questMarker',act.questMarker);
}

Actor.getQuestMarkerMinimap = function(act){	//client side
	var ret = [];
	for(var i in act.questMarker){
		var pos = act.questMarker[i].client;
		if(pos.x === NO_PATH && pos.y === NO_PATH) 
			continue;
		
		var vx = pos.x - act.x;
		var vy = pos.y - act.y;
				
		ret.push({
			vx:vx,
			vy:vy,
			icon:CST.ICON.questMarker,
			size:Img.getMinimapIconSize(CST.ICON.questMarker),
		});
	}
	return ret;
}




})(); //{
