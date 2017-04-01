
"use strict";
;(function(){ //}
var MapModel;
global.onReady(function(){
	MapModel = rootRequire('server','MapModel');
},null,SERVER ? '' : 'MapGraph',[],function(pack){
	MapGraph.init(pack);
});
var MapGraph = exports.MapGraph = {};

var GRAPH = MapGraph.GRAPH = null;
var SIGN_IN_PACK = {MAP:{},LIST:{}};	//LIST: to retrieve startPoint
var LIST = MapGraph.LIST = null;

//BAD weird constructor...

MapGraph.create = function(startPoint,destinationMap){	//startPoint:{xymap}, destinationMap:string
	if(MapModel.hasFinishedTestSpawn())
		return;
	var startMap = MapGraph.getModel(startPoint.map);
	var endMap = MapGraph.getModel(destinationMap);
	
	SIGN_IN_PACK.MAP[startMap] = SIGN_IN_PACK.MAP[startMap] || {};
	SIGN_IN_PACK.MAP[startMap][endMap] = 1;
	
	var s = Tk.deepClone(startPoint);
	delete s.addon;
	s.map = s.map.replace('@MAIN','');
	SIGN_IN_PACK.LIST[startMap + '-' + endMap] = s;
}

MapGraph.init = function(pack){	//client and server different
	GRAPH = MapGraph.GRAPH = new Graph(pack.mapGraph.MAP);
	LIST = MapGraph.LIST = pack.mapGraph.LIST;
}

MapGraph.getSignInPack = function(){
	return SIGN_IN_PACK;
}

MapGraph.getModel = function(map){
	var index = map.indexOf(CST.MAP.separator);
	return index === -1 ? map : map.slice(0,index);
}

MapGraph.findPath = function(start,goal){	//return map where to go next
	var startMap = MapGraph.getModel(start.map);
	var goalMap = MapGraph.getModel(goal.map);
	
	if(startMap === goalMap)
		return goal;
	
	var sol = GRAPH.findShortestPath(startMap,goalMap);
	if(!sol)
		return null;
	if(sol.length === 0)
		return goal;
		
	return LIST[sol[0] + '-' + sol[1]] || null;
	
	/*if(startMap === 'QfirstTown-main'){
		return LIST['QfirstTown-main'][goalMap] || null;
	} else {
		return LIST[startMap] && LIST[startMap]['QfirstTown-main'] || null;
	}*/
}

//https://github.com/andrewhayward/dijkstra
var Graph = (function (undefined) {
	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    if(Object.prototype.hasOwnProperty.call(obj,key))
				keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u) {
			nodes.push(u);
			//predecessor = predecessors[u];
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Graph;

})();


})(); //{