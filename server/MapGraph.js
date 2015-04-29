//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Maps = require2('Maps');
var MapGraph = exports.MapGraph = {};
MapGraph.create = function(startPoint,destinationMap){
	var map = Maps.getModel(startPoint.map);
	LIST[map] = LIST[map] || {};
	LIST[map][destinationMap] = startPoint;
}

var LIST = MapGraph.LIST = {};

MapGraph.findPath = function(start,goal){
	var startMap = Maps.getModel(start.map);
	var goalMap = Maps.getModel(goal.map);
	
	if(startMap === goalMap)
		return goal;
	
	if(startMap === 'QfirstTown-main'){
		return LIST['QfirstTown-main'][goalMap] || null;
	} else {
		return LIST[startMap] && LIST[startMap]['QfirstTown-main'] || null;
	}
}





