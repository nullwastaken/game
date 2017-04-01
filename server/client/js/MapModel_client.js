
"use strict";
(function(){ //}
var Img, Dialog, Input, TmxParser, Main;
global.onReady(function(){
	Main = rootRequire('shared','Main',true); TmxParser = rootRequire('shared','TmxParser',true);  Input = rootRequire('client','Input',true); Img = rootRequire('client','Img',true); Dialog = rootRequire('client','Dialog',true);
},null,'MapModel',[],function(pack){
	MapModel.init(pack);
});
var MapModel = exports.MapModel = function(extra){
	this.id = '';
	this.graphicPath = '';
	this.quest = '';
	this.subId = '';
	this.name = '';//init in MapModel.initName using server signInPack
	this.img = MapModel.Img();
	this.grid = null;	//MapModel.Grid
	this.sizeX = 0;
	this.sizeY = 0;
	this.imageLoaded = false;
	this.width = 0;	//in pixel
	this.height = 0;
	this.lightingEffect = true;
	this.worldMapIcon = []; //MapModel.Icon[]	on server
	this.lvl = 0;
	Tk.fillExtra(this,extra);
};

var IMG_W = 640;
var IMG_H = 360;

var SIZEFACT = 2;		//enlarge the map image by this factor
	
MapModel.create = function(quest,name,sizeX,sizeY,grid,extra){
	extra = extra || {};
	var tmp = new MapModel({
		id:quest + '-' + name,
		quest:quest,
		subId:name,
		grid:grid,
		sizeX:sizeX,	//in image count
		sizeY:sizeY,
	});
	Tk.fillExtra(tmp,extra);
	DB[tmp.id] = tmp;
}	
var DB = MapModel.DB = {};
	
MapModel.Img = function(){
	return {
		a:[],
		b:[],
		m:null,
	};
}	

MapModel.getFullPath = function(graphicPath,layer,x,y){
	if(layer === 'm') 
		return graphicPath + 'M.png';
	return graphicPath + layer.$capitalize() + '_(' + x + ',' + y + ')' + '.png';
}


MapModel.getTmxPath = function(map){
	return '/quest/' + map.quest + '/map/' + map.subId + '.tmx';
}

MapModel.initImage = function(map){
	if(map.imageLoaded) 
		return ERROR(3,'already loaded images');
	map.imageLoaded = true;
	map.img = MapModel.Img();
	
	var tracker = Dialog.ProcessBarTracker(100);
	Dialog.open('processBar',tracker,true);
	
	TmxParser.load(MapModel.getTmxPath(map),null,function(tmx){
		TmxParser.fillMapModelImg(tmx,map.img,tracker);
	},tracker);
	
	
	return;
	
}

MapModel.init = function(pack){
	var nameList = pack.map;
	for(var i in nameList){
		nameList[i] = MapModel.uncompressClient(nameList[i]);
		
		if(i === nameList[i].graphic){	//base map
			var sizeX = Math.ceil(nameList[i].width/640/2)-1;	// /2 cuz x2 smaller than real. -1 cuz 0 means 1 map
			var sizeY = Math.ceil(nameList[i].height/360/2)-1;	// /2 cuz x2 smaller than real
			var grid = nameList[i].gridCompressed;
			
			var name = i.split('-');
			MapModel.create(name[0],name[1],sizeX,sizeY,grid,{
				width:nameList[i].width,
				height:nameList[i].height,
				lvl:nameList[i].lvl,
				worldMapIcon:nameList[i].worldMapIcon,
				lightingEffect:nameList[i].lightingEffect,
			});
		}
	}
	
	for(var i in nameList){
		try {
			if(!DB[i]) 
				DB[i] = Tk.deepClone(DB[nameList[i].graphic]);	//case map using graphic of other, that map isnt on client side init
			DB[i].name = nameList[i].name;
			//gridPlayer?
			DB[i].graphicPath = MapModel.generateGraphicPath(nameList[i].graphic);		
		} catch(err){
			ERROR(2,i,'map not found');
		}
	}
}

MapModel.generateGraphicPath = function(graphic){
	var quest = Tk.getSplit0(graphic,'-');
	var name = graphic.split('-')[1];
	return "quest/" + quest + "/map/" + name;
}	

MapModel.getCurrent = function(){
	return DB[w.player.map];
}

MapModel.getWidth = function(map){
	return map.width;
}

MapModel.getHeight = function(map){
	return map.height;
}

MapModel.get = function(id){
	return DB[id];
}
MapModel.getFast = function(id){	//overwrite server version
	return DB[id];
}
MapModel.getZoneDrawOnScreen = function(){	//return zone that isnt black
	if(MapModel.isDoingTransition())
		return CST.rect(0,0,CST.WIDTH,CST.HEIGHT);
	
	var map = MapModel.get(w.player.map);
	var left = Math.max(0,Tk.absToRel.x(0));
	var top = Math.max(0,Tk.absToRel.y(0));
	var right = Math.min(CST.WIDTH,Tk.absToRel.x(map.width));
	var bottom = Math.min(CST.HEIGHT,Tk.absToRel.y(map.height));
	return CST.rect(left,top,right-left,bottom-top);
}

MapModel.draw = function(map,ctx,layer,offX,offY){	
	if(!map.imageLoaded)
		return MapModel.initImage(map);
	
	var offsetX = offX + Tk.absToRel.x(0);	
	var offsetY = offY + Tk.absToRel.y(0);
	
	for(var i = 0; i < map.img[layer].length; i++){
		for(var j = 0; j < map.img[layer][i].length; j++){
			var mapXY = map.img[layer][i][j];
			
			var posX = Math.floor(offsetX + IMG_W*SIZEFACT*i);	//absolute position top left of image
			var posY = Math.floor(offsetY + IMG_H*SIZEFACT*j);	//floor to prevent black line firefox
			
			//problem if map not whole
			var iwResized = Math.min(Math.max(IMG_W,0),mapXY.width);	
			var ihResized = Math.min(Math.max(IMG_H,0),mapXY.height);
			
			if(posX < -iwResized*SIZEFACT || posY < -ihResized*SIZEFACT
				|| posX > CST.WIDTH || posY > CST.HEIGHT){
				continue;	//aka not visible
			}
			if(Main.ScreenEffect.isTrippyActive()){
				ctx.save();
				TRIPPY_ANGLE += 0.00015;
				var vx = posX < 0 ? -posX : 0;
				var vy = posY < 0 ? -posY : 0;
				
				var width = iwResized*SIZEFACT+vx;
				var height = ihResized*SIZEFACT+vy;
				
				ctx.translate(posX+vx+width/2,posY+vy+height/2);
				ctx.rotate(TRIPPY_ANGLE);
				
				ctx.drawImage(mapXY, vx/2,vy/2,iwResized-vy/2,ihResized-vy/2,
					0-width/2,0-height/2,
					width,height
				);
				ctx.restore();
			}
			else
				ctx.drawImage(mapXY, 0,0,iwResized,ihResized,
					posX,posY,
					iwResized*SIZEFACT,
					ihResized*SIZEFACT
				);
			
			//TRIPPY for fun
			
		}
	}
}


var TRIPPY_ANGLE = 0;

MapModel.drawAll = function(ctx,layer){
	MapModel.draw(MapModel.getCurrent(),ctx,layer,0,0);
	
	if(T.active && T.toDraw){
		var otherMap = MapModel.get(T.toDraw.map);
		MapModel.draw(otherMap,ctx,layer,T.toDraw.offsetX,T.toDraw.offsetY);
	}
}

MapModel.getMinimapImg = function(map,cb){
	return map.img.m;
}

var T = {active:false,toDraw:null,interval:null};

//x.MapModel.startTransition({mapModel:'QfirstTown-main',x:w.player.x,y:3200-64})

MapModel.startTransition = function(transition){
	//teleport player right away and set pos for outside of target map so appear in old map at same spot
	//I nput.updateOffset will manage the offset slide transition
	
	var dir = transition.direction;
	if(!dir){
		w.player.map = transition.map;
		w.player.x = transition.x;
		w.player.y = transition.y;
		return;
	}
	if(T.active)	//if 2 transition back-to-back
		clearInterval(T.interval);
	
	w.player.ghost = true;	//BAD
	w.player.move = false;	
	T.active = true;
	Input.DONT_EMIT = true;	//kinda bad...
	
	var oldMap = MapModel.get(w.player.map);
	w.player.map = transition.map;
	
	var targetMap = MapModel.get(transition.map);
	
	if(dir === 'up'){		
		var distAwayFromBorder = w.player.y;
		var newY = targetMap.height + distAwayFromBorder;
		w.player.y = newY;
		T.toDraw = {
			map:oldMap.id,
			offsetX:0,
			offsetY:targetMap.height,			
		}
	}
	if(dir === 'left'){		
		var distAwayFromBorder = w.player.x;
		var newX = targetMap.width + distAwayFromBorder;
		w.player.x = newX;
		T.toDraw = {
			map:oldMap.id,
			offsetX:targetMap.width,
			offsetY:0,			
		}
	}
	if(dir === 'right'){		
		var distAwayFromBorder = oldMap.width - w.player.x;
		var newX = 0 - distAwayFromBorder;
		w.player.x = newX;
		T.toDraw = {
			map:oldMap.id,
			offsetX:-oldMap.width,
			offsetY:0,			
		}
	}
	if(dir === 'down'){		
		var distAwayFromBorder = oldMap.height - w.player.y;
		var newY = 0 - distAwayFromBorder;
		w.player.y = newY;
		T.toDraw = {
			map:oldMap.id,
			offsetX:0,
			offsetY:-oldMap.height,			
		}
	}
	
	var frame = 0;
	T.interval = setInterval(function(){
		frame++;
		if(frame <= 10){
			w.player.x += (transition.x - w.player.x)/10;
			w.player.y += (transition.y - w.player.y)/10;
		}
		if(frame === 10){
			w.player.x = transition.x;
			w.player.y = transition.y;
			w.player.ghost = false;
			w.player.move = true;
			Input.DONT_EMIT = false;
		}
		if(frame === 10+30){	//keep drawing old map for additional 30*40 ms
			clearInterval(T.interval);
			T.active = false;
		}
		
	},40);
}

MapModel.isDoingTransition = function(){
	return T.active;
}









})();














