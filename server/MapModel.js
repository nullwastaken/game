//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Map = require2('Map');
var astar = require('astar');

var TEMP_ADDON = {};	//when trying to add addon to not-yet loaded map
var TEMP_GRID = {};		//graphic:whoNeeds

var SIGN_IN_PACK = {};


var MapModel = exports.MapModel = {};

MapModel.create = function(Q,mapId,map,addon){
	var m = {
		id:Q + '-' + mapId,
		addon:{},
		name:map.name || "No Name Map",
		tileset : 'v1.1',
		grid:MapModel.Grid([[]]),
		lvl:0,
		fall:null,
		isTown:map.isTown,
		width:0,
		height:0,
		graphic:'',	//if use same graphic than other map
	};
	m.graphic = map.graphic || m.id;
	DB[m.id] = m;
	MapModel.MapAddon(m.id,Q,addon);	//MapAddon will add to m.addon
	if(TEMP_ADDON[m.id])	//could be done at the end for all maps
		for(var i in TEMP_ADDON[m.id]) 
			DB[m.id].addon[i] = TEMP_ADDON[m.id][i];
	if(!MapModel.isDuplicate(m)){	//map made for this quest
		MapModel.setGrid(m,MapModel.Grid(map.grid));
		for(var i in TEMP_GRID[m.graphic])	//give grid to those who needed
			MapModel.setGrid(MapModel.get(i),m.grid);
	} else {
		var model = MapModel.get(m.graphic);
		if(model) 
			MapModel.setGrid(m,model.grid);	//model already loaded
		else {
			TEMP_GRID[m.graphic] = TEMP_GRID[m.graphic] || {};	//add in temp list
			TEMP_GRID[m.graphic][m.id] = 1;
		}
	}
	
	SIGN_IN_PACK[m.id] = MapModel.compressClient(m);
	
	return m.id;
}
var DB = MapModel.DB = {};

MapModel.setGrid = function(map,grid){
	map.grid = grid;
	map.height = grid.player.length*32;
	map.width = grid.player[0] ? grid.player[0].length*32 : 0;
}

MapModel.isDuplicate = function(m){
	return m.graphic !== m.id;
}

MapModel.Grid = function(rawgrid){
	var astargrid = [];	//for astar
	for(var i = 0 ; i < rawgrid.length; i++){	
		astargrid[i] = [];
		for(var j = 0 ; j < rawgrid[i].length; j++){
			astargrid[i][j] = +!+rawgrid[i][j];	//opposite
		}
	}
		
	var strGrid = Tk.stringify(rawgrid);
	//PRE: 0 => can walk, 1 => cant; 2 => bullet only can walk; 3 => fall close; 4 => fall
	//POST: 0 => cant walk, 1 => can walk; 3 => fall close 4=> fall
	
	var goodgrid = {
		astar:new astar.Graph(astargrid),
		player:JSON.parse(strGrid.replaceAll('0','a').replaceAll('1','0').replaceAll('2','0').replaceAll('a','1')),
		npc:JSON.parse(strGrid.replaceAll('0','a').replaceAll('1','0').replaceAll('2','0').replaceAll('a','1').replaceAll('4','0')),
		bullet:JSON.parse(strGrid.replaceAll('0','a').replaceAll('1','0').replaceAll('2','1').replaceAll('a','1')),	
	};
	
	
	return goodgrid;
}

MapModel.MapAddon = exports.MapAddon = function(mapid,addonid,extra){	//addonid is normally questId
	var a = {
		id:addonid,
		load:null,
		loop:null,
		playerEnter:null,
		playerLeave:null,
		spot:{},	//if path, "colornum" is key ex:blue0
		variable:{},
	};
	extra = extra || {};
	for(var i in extra) 
		a[i] = extra[i];
	for(var i in a.spot){
		a.spot[i].map = mapid;	//will be overwrite for exact map. used for questMarker tho
	}
	
	if(DB[mapid])	
		DB[mapid].addon[addonid] = a;
	else {
		TEMP_ADDON[mapid] = TEMP_ADDON[mapid] || {};
		TEMP_ADDON[mapid][addonid] = a;
	}
	return a;
}

MapModel.getSignInPack = function(){
	return SIGN_IN_PACK;
}
MapModel.compressClient = function(map){
	var m = {
		name:map.name,
		graphic:map.graphic,
		width:map.width,
		height:map.height,
		gridPlayer:MapModel.isDuplicate(map) ? 0 : MapModel.Grid.compress(map.grid),
	};
	return m;
}
//MapModel.uncompressClient is in MapModel_client
MapModel.get = function(name){
	return DB[Map.getModel(name)] || null;
}




MapModel.Path = function(id,list){
	return {
		id:id,
		list:list,	
	}
}
MapModel.Path.Spot = function(mapmodel,quest,rawPathSpot){
	var spot = mapmodel.addon[quest].spot[rawPathSpot.letter];
	if(!spot) return ERROR(3,'no path found for',rawPathSpot.letter,mapmodel.addon[quest].spot);
	return {
		x:spot.x,
		y:spot.y,
		wait:rawPathSpot.wait,
		event:rawPathSpot.event,
		spdMod:rawPathSpot.spdMod,
		timeLimit:rawPathSpot.timeLimit,	
	}
}

MapModel.Path.Spot.raw = function(letter,wait,event,spdMod,timeLimit){
	return {
		letter:letter||"",
		wait:wait||0,
		event:event || null,
		spdMod:spdMod||1,
		timeLimit:timeLimit || 30*25,	
	}
}


MapModel.Grid.compress = function(grid){	//uncompress in MapModel_client
	var oneD = grid.player.join('');
	oneD = oneD.replaceAll('2','1').replaceAll('3','1').replaceAll('4','1');
	return Tk.baseConverter.toAscii(oneD);	
}















