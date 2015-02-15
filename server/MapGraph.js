//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Map = require2('Map');
var MapGraph = exports.MapGraph = {};
MapGraph.create = function(startPoint,destinationMap){
	var map = Map.getModel(startPoint.map);
	LIST[map] = LIST[map] || {};
	LIST[map][destinationMap] = startPoint;
}

var LIST = MapGraph.LIST = {};

MapGraph.findPath = function(start,goal){
	var startMap = Map.getModel(start.map);
	var goalMap = Map.getModel(goal.map);
	
	if(startMap === goalMap)
		return goal;
	
	if(startMap === 'QfirstTown-main'){
		return LIST['QfirstTown-main'][goalMap] || null;
	} else {
		return LIST[startMap] && LIST[startMap]['QfirstTown-main'] || null;
	}
}





