
/*jshint -W018*/
"use strict";
var Maps, Weather, TmxParser;
global.onReady(function(){
	TmxParser = rootRequire('shared','TmxParser'); Maps = rootRequire('server','Maps'); Weather = rootRequire('server','Weather');
},null,'MapModel',['Quest'],function(){
	MapModel.init();
});
var MapModel = exports.MapModel = function(extra){
	this.id = '';
	this.addon = {};	//MapModel.MapAddon
	this.lvl = 0;
	this.name = "Map";
	this.grid = MapModel.Grid();	
	this.screenEffect = '';
	this.fall = null;	//function(key)
	this.isTown = false;
	this.width = 0;
	this.height = 0;
	this.zone = '';
	this.quest = '';
	this.localId = '';
	this.lightingEffect = true;
	this.preventCameraMovement = false;
	this.worldMapIcon = [];	//BAD MapModel.addWorldMapIcon only handles non-clickable icons
	this.graphic = '';	//if use same graphic than other map
	Tk.fillExtra(this,extra);
};


var INIT_ADDON = {};	//when trying to add addon to not-yet loaded map
var INIT_GRID = {};		//graphic:whoNeeds

var SIGN_IN_PACK = {};

MapModel.create = function(Q,mapId,map,addon){
	var m = new MapModel({
		quest:Q,
		localId:mapId,
		id:Q + '-' + mapId,
		lvl:map.lvl,
		name:map.name,
		screenEffect:map.screenEffect,
		isTown:map.isTown,
		zone:map.zone,
		preventCameraMovement:map.preventCameraMovement,
		lightingEffect:map.lightingEffect,
	});

	m.graphic = map.graphic || m.id;
	DB[m.id] = m;
	MapModel.MapAddon(m.id,Q,addon);	//MapAddon will add to m.addon
	
	
	if(!MapModel.isDuplicate(m)){	//map made for this quest
		MapModel.generateGrid(m);
	} else {	//addon or reused graphic
		INIT_GRID[m.graphic] = INIT_GRID[m.graphic] || {};	//add in temp list
		INIT_GRID[m.graphic][m.id] = true;
	}
	
	
	if(!Weather.SCREEN_EFFECT.$contains(m.screenEffect))
		return ERROR(3,'invalid screenEffect',m.screenEffect);
	
	return m.id;
}


var DB = MapModel.DB = {};

MapModel.setGrid = function(map,grid){	//signinpack
	map.grid = grid;
	map.height = grid.player.length*32;
	map.width = grid.player[0] ? grid.player[0].length*32 : 0;
	
	SIGN_IN_PACK[map.id] = MapModel.compressClient(map);
}

MapModel.isDuplicate = function(m){
	return m.graphic !== m.id;
}

MapModel.getDuplicateListCSharp = function(){
	var str = '';
	for(var i in DB){
		var gSplit = DB[i].graphic.split('-');
		var gPath = gSplit[0] + '/map/' + gSplit[1] + '.tmx';
			
		if(MapModel.isDuplicate(DB[i])){
			var sSplit = DB[i].id.split('-');
			var sPath = sSplit[0] + '/map/' + sSplit[1] + '.tmx';
			
			str += gPath + ',' + sPath + "|";
		}
		for(var j in DB[i].addon){
			if(j !== DB[i].quest){
				var sSplit = j.split('-');
				var sPath = sSplit[0] + '/map/' + DB[i].id + '.tmx';
				
				str += gPath + ',' + sPath + "|";
			}
		}
	}	
	if(str)
		str = str.slice(0,-1);	//remove last ,
	return str;
}

MapModel.MapAddon = exports.MapAddon = function(mapid,addonid,extra){	//addonid is normally questId
	var a = {
		id:addonid,
		load:null,
		loop:null,
		playerEnter:null,
		playerLeave:null,
		spot:{},
		variable:{},
	};
	Tk.fillExtra(a,extra);
	
	a.spot = MapModel.getAddonSpot(mapid,addonid);

	if(a.spot.$isEmpty())
		a.spot.NEEDED_AT_LEAST_ONE = CST.pt(0,0);	//not sure why anymore...
	
	for(var i in a.spot){
		a.spot[i].width = a.spot[i].width || 0;
		a.spot[i].height = a.spot[i].height || 0;
		a.spot[i].map = mapid;	//will be overwrite for exact map. used for questMarker tho
		a.spot[i].mapModel = mapid;
	}
	
	if(DB[mapid])	
		DB[mapid].addon[addonid] = a;
	else {
		INIT_ADDON[mapid] = INIT_ADDON[mapid] || {};
		INIT_ADDON[mapid][addonid] = a;
	}
	return a;
}

MapModel.getSignInPack = function(){
	return SIGN_IN_PACK;
}

MapModel.generateGrid = function(m){
	/*TmxParser.loadServer(MapModel.getGraphicTmxPath(m),function(tmx){
		var rawgrid = TmxParser.generateCollisionGrid(tmx);
		var formattedGrid = MapModel.Grid(rawgrid);
		MapModel.setGrid(m,formattedGrid);

		for(var i in INIT_GRID[m.graphic])	//give grid to those who needed
			MapModel.setGrid(MapModel.get(i),m.grid);
	},true);*/
	
	var tmx = TmxParser.loadServer(MapModel.getGraphicTmxPath(m));
	var rawgrid = TmxParser.generateCollisionGrid(tmx);
	var formattedGrid = MapModel.Grid(rawgrid);
	MapModel.setGrid(m,formattedGrid);
}

MapModel.get = function(name){
	return DB[Maps.getModel(name)] || null;
}

MapModel.getFast = function(name){
	return DB[name];
}

MapModel.getSpot = function(map,addon,spot){
	var res = map.addon[addon] && map.addon[addon].spot[spot];
	if(!res) return ERROR(3,'spot dont exist',map.id,addon,spot);
	return Tk.deepClone(res);
}

var TYPE = ['shop','bank','skillPlot','quest','sideQuest','waypoint'];
var TEST_SPAWN_DONE = false;

MapModel.init = function(){	//used by waypoint and mapgraph, also fills worldMapIcon
	//set grid of dupe
	for(var i in DB){
		for(var j in INIT_GRID[i])	//give grid to those who needed
			MapModel.setGrid(DB[j],DB[i].grid);
	}
	
	//set addon
	for(var i in DB){
		for(var j in INIT_ADDON[i])
			DB[i].addon[j] = INIT_ADDON[i][j];
	}
	
	for(var model in MapModel.DB){
		var v = 'whatever';
		if(!Maps.get(Maps.generateId(model,v)))
			Maps.create(model,v,null);
	}
	TEST_SPAWN_DONE = true;
	
	//SIGN_IN_PACK done when setting grid
	
	setTimeout(function(){
		if(Maps.LIST.$length() > 10)
			ERROR(3,'maps created for mapgraph init should be removed by then',Maps.LIST.$keys());
	},60000);
}

MapModel.getAddonSpot = function(mapid,addonQuest){
	var tmx = TmxParser.loadServer(MapModel.getSpotTmxPath(mapid,addonQuest));
	var spotList = TmxParser.generateSpot(tmx);
	
	return spotList;
}


MapModel.hasFinishedTestSpawn = function(){
	return TEST_SPAWN_DONE;
}

MapModel.getModel = function(id){
	return Maps.getModel(id);
}

MapModel.addWorldMapIcon = function(spot,type,id){
	if(TEST_SPAWN_DONE)
		return;
	var map = MapModel.get(spot.mapModel);
	if(!map)
		return ERROR(3,'invalid spot',spot);
	if(!TYPE.$contains(type))
		return ERROR(3,'invalid type',type);
	map.worldMapIcon.push(MapModel.Icon(type,spot.x,spot.y,id));
}

MapModel.Icon = function(type,x,y,id){
	return {
		type:type,
		x:x,
		y:y,
		id:id || '',
	}
}

MapModel.getGraphicTmxPath = function(map){
	var graphicMap = MapModel.get(map.graphic);
	return require('path').resolve(__dirname, 'quest/' + graphicMap.quest + '/map/' + graphicMap.localId + '.tmx');
}

MapModel.getSpotTmxPath = function(mapid,addonQuest){
	var split = mapid.split('-');
	var mapQuest = split[0];
	var mapLocalId = split[1];
	
	//aka for self
	if(mapQuest === addonQuest)
		return require('path').resolve(__dirname, 'quest/' + mapQuest + '/map/' + mapLocalId + '.tmx');
	
	//for addon
	return require('path').resolve(__dirname, 'quest/' + addonQuest + '/map/' + mapid + '.tmx');
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

MapModel.Path.Spot.quick = function(x,y){
	return {
		x:x,
		y:y,
		wait:0,
		event:null,
		spdMod:1,
		timeLimit:25*30,	
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



