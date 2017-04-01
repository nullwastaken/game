
"use strict";
(function(){ //}
var BISON;
global.onReady(function(){
	BISON = rootRequire('shared','BISON');
});

var MapModel = rootRequire('server','MapModel');

MapModel.Grid = function(rawgrid){
	if(!rawgrid)
		return {raw:[],player:[],npc:[],bullet:[]};
	
	
	var strGrid = Tk.stringify(rawgrid);
	//PRE: 0 => can walk, 1 => cant; 2 => bullet only can walk; 3 => fall close; 4 => fall; 5 => slow
	//POST: 0 => cant walk, 1 => can walk; 3 => fall close 4=> fall; 5 => slow

	var TILE = CST.MAP_TILE;
	var goodgrid = {
		raw:stringToInt(rawgrid,false),
		player:stringToInt(JSON.parse(strGrid
			.$replaceAll(TILE.canWalkPre,'a')
			.$replaceAll(TILE.cantWalkPre,TILE.cantWalk)
			.$replaceAll(TILE.bulletOnly,TILE.cantWalk)
			.$replaceAll(TILE.slow,TILE.canWalk)
			.$replaceAll('a',TILE.canWalk)
		),SERVER),
		npc:stringToInt(JSON.parse(strGrid
			.$replaceAll(TILE.canWalkPre,'a')
			.$replaceAll(TILE.cantWalkPre,TILE.cantWalk)
			.$replaceAll(TILE.bulletOnly,TILE.cantWalk)
			.$replaceAll(TILE.fall,TILE.cantWalk)
			.$replaceAll(TILE.slow,TILE.canWalk)
			.$replaceAll(TILE.fallClose,TILE.canWalk)
			.$replaceAll('a',TILE.canWalk)
		),SERVER),
		bullet:stringToInt(JSON.parse(strGrid
			.$replaceAll(TILE.canWalkPre,'a')
			.$replaceAll(TILE.cantWalkPre,TILE.cantWalk)
			.$replaceAll(TILE.bulletOnly,TILE.canWalk)
			.$replaceAll(TILE.slow,TILE.canWalk)
			.$replaceAll('a',TILE.canWalk)
		),SERVER),
	};
	
	
	return goodgrid;
}

var stringToInt = function(arrayStr,int8){	//duplicate in client
	for(var i = 0 ; i < arrayStr.length; i++){
		arrayStr[i] = arrayStr[i].split('');
		for(var j = 0 ; j < arrayStr[i].length; j++)
			arrayStr[i][j] = +arrayStr[i][j];
		if(int8 && typeof Int8Array !== 'undefined')
			arrayStr[i] = new Int8Array(arrayStr[i]);
	}
	return arrayStr;
}

MapModel.Grid.compress = function(grid){	//uncompress in MapModel_client
	return BISON.encode(grid.raw);
}

MapModel.Grid.uncompress = function(gridCompressed){
	var a = BISON.decode(gridCompressed);
	for(var i = 0 ; i < a.length; i++)
		a[i] = a[i].join('');
	return MapModel.Grid(a);
}

MapModel.compressClient = function(map){
	var m = {
		name:map.name,
		graphic:map.graphic,
		lvl:map.lvl,
		width:map.width,
		height:map.height,
		gridCompressed:MapModel.isDuplicate(map) ? null : MapModel.Grid.compress(map.grid),
		worldMapIcon:map.worldMapIcon,
		lightingEffect:map.lightingEffect,
	};
	return m;
}

MapModel.uncompressClient = function(map){
	//var widthSq = map.width/32;
	//var heightSq = map.height/32;
			
	var m = {
		name:map.name,
		graphic:map.graphic,
		lvl:map.lvl,
		lightingEffect:map.lightingEffect,
		width:map.width,
		height:map.height,
		gridCompressed:map.gridCompressed ? MapModel.Grid.uncompress(map.gridCompressed) : null,
		worldMapIcon:map.worldMapIcon,
	};
	return m;
}





})(); //{