
"use strict";
(function(){ //}
var Main, Waypoint, SideQuest, Collision, QueryDb, MapModel, Img, Command;
global.onReady(function(){
	Main = rootRequire('shared','Main',true); Waypoint = rootRequire('shared','Waypoint',true); SideQuest = rootRequire('shared','SideQuest',true); Collision = rootRequire('shared','Collision',true); QueryDb = rootRequire('shared','QueryDb',true); MapModel = rootRequire('server','MapModel',true); Img = rootRequire('client','Img',true); Command = rootRequire('shared','Command',true);
	worldMapImg.src = 'img/ui/worldMap.png';
});
var Dialog = rootRequire('client','Dialog');


var MINIMAP_SIZE = 160;	//size
//exports.Dialog.open('worldMap');
//exports.Dialog.open('worldMap',{ZOOM:1,OFFSET:{x:0,y:0}});
var ZOOM = 0.8;
var ZOOM_MAX = 3;
var ZOOM_MIN = 0.4;
var OFFSET = {x:-300,y:-450};
var MAX_OFFSET = 5000;

var SPOT_TO_MINIMAP_MOD = 1/16;	//for icon only

var ctx;
var canvas;
var textDiv;
var CURRENT_ICON = null;
var WIDTH = 1200;
var HEIGHT = 1000;
var MOUSE_DOWN = {x:0,y:0,active:false};
var MAPGROUP = Dialog.MAPGROUP = {};	//Dialog.MAPGROUP needed for worldMap img generator
var MAPGROUP_SHOWN = '';
var USING_WAYPOINT = false;

var Icon = function(icon,x,y,description,onclick,sizeMod){
	return {
		icon:icon,
		x:x,
		sizeMod:sizeMod || 1,
		y:y,
		description:description || '',
		onclick:onclick || null,
	}
}
var MyMap = function(map,x,y){
	if(map[0] !== 'Q')
		map = 'QfirstTown-' + map;

	return {
		map:map,
		x:x * MINIMAP_SIZE,
		y:y * MINIMAP_SIZE,
		width:MINIMAP_SIZE,	//not precise
		height:MINIMAP_SIZE,
		iconList:[],
	}
}

var PLAYER_ICON = Icon('worldMap-player',0,0,'Current Position',null,2); //needed reference for textDiv


var worldMapImg = new Image();	//src onReady. needed cuz worldMap.bat


var MapGroup = function(id,name,defaultOffset,map){
	var a = {};
	for(var i = 0 ; i < map.length; i++)
		a[map[i].map] = map[i];
	var m = {
		mapList:a,
		id:id,
		name:name,
		defaultOffset:defaultOffset,	
	}
	MAPGROUP[id] = m;
	if(!MAPGROUP_SHOWN)
		MAPGROUP_SHOWN = id;
	return m;
}


MapGroup('surface','Surface',{x:-300,y:-450},[ //{
	MyMap('wStraightPath',0,5),
	MyMap('wTinyHills',0,6),
	MyMap('wSWHill',0,7),
	MyMap('wBridge',1,7),
	MyMap('wHat',2,7),
	MyMap('wSnake',3,7),
	MyMap('wBump',3,6),
	MyMap('wSplit',4,6),
	MyMap('wEntrance',5,6),
	MyMap('wLake',5,5),
	MyMap('main',6,6),	//bad
	MyMap('north',6.1,4.7), //bad
	MyMap('south',6.1,7.1), //bad
	MyMap('east',7.1,6), //bad
]); //}

var initIconList = function(){	//using MapModel worldMapIcon
	var onclickQuest = function(quest){
		return function(){
			if(Main.quest.haveCompletedTutorial(w.main))
				Dialog.open('quest',quest);
			else
				Main.addMessage(w.main,'Complete the tutorial before checking other quests.');
		}
	}
	var onclickWaypoint = function(id){
		return function(){
			Command.execute(CST.COMMAND.useWaypoint,[id]);
		}
	}
	
	
	
	for(var i in MapModel.DB){
		var m = MapModel.DB[i];
		for(var j = 0 ; j < m.worldMapIcon.length; j++){
			var icon = m.worldMapIcon[j];
			var icon2 = null;
			if(icon.type === 'bank'){
				icon2 = Icon('worldMap-bank',icon.x,icon.y,'Bank',null,1.1);
			}
			else if(icon.type === 'shop'){
				icon2 = Icon('worldMap-shop',icon.x,icon.y,'Shop',null,1.1);
			}
			else if(icon.type === 'quest'){
				var qid = icon.id;
				var q = QueryDb.get('quest',qid);
				if(!q){
					ERROR(3,'no q',qid);	//BAD. happens if not sending everything on sign in
					continue;
				}
				var iconName = CST.ICON.quest;
				var description = 'Quest: ' + q.name;
				
				if(w.main.quest[qid].complete){
					iconName = 'worldMap-questComplete';
					description += ' - <span class="shadow" style="color:#AAFFAA">Completed</span>';
				}
				if(!w.main.quest[qid].canStart){
					iconName = 'worldMap-questLocked';
					description += ' - <span class="shadow" style="color:#FFAAAA">Locked</span>';
				}
				icon2 = Icon(iconName,icon.x,icon.y,description,onclickQuest(qid),1.2);
			}
			else if(icon.type === 'sideQuest'){
				var sid = icon.id;
				var sq = SideQuest.get(sid);
				if(!sq){
					ERROR(3,'no sq',sid);	//BAD. happens if not sending everything on sign in
					continue;
				}
				var iconName = 'worldMap-sideQuest';
				var description = 'Side Quest: ' + sq.name;
				
				if(w.main.sideQuest[sid].complete){
					iconName = 'worldMap-sideQuestComplete';
					description += ' - <span class="shadow" style="color:#AAFFAA">Completed</span>';
				}
				icon2 = Icon(iconName,icon.x,icon.y,description,null,1.2);
			}
			else if(icon.type === 'waypoint'){
				var iconName = CST.ICON.waypoint;
				var description = 'Waypoint';
				var way = Waypoint.get(icon.id);
				if(!Waypoint.testCanUse(way,w.main,w.player)){
					iconName = 'worldMap-waypointLocked';
					description += ' - <span class="shadow" style="color:#FFAAAA">LOCKED</span>';
				}
				
				icon2 = Icon(iconName,icon.x,icon.y,description,onclickWaypoint(icon.id),1.5);
			}
			
			if(icon2)
				for(var k in MAPGROUP){
					if(MAPGROUP[k].mapList[i])	
						MAPGROUP[k].mapList[i].iconList.push(icon2);					
				}
		}
	}
	
}

Dialog.create('worldMap','World Map',Dialog.Size(800,600),Dialog.Refresh(function(html,variable,param){	
	initIconList();
	
	USING_WAYPOINT = param && !!param.waypoint;
	
	html.css({padding:'0px',overflowX:'hidden',overflowY:'hidden'});
	html.dialog({
		maxWidth:WIDTH-50,
		maxHeight:HEIGHT-50,
	});
	
	textDiv = $('<div>')
		.css({
			position:'absolute',top:0,left:0,width:'auto',height:'auto',
			background:'black',
			border:'2px solid white',
			padding:'5px 12px',
			color:'white',
		});
	textDiv.hide();
	
	canvas = Tk.createSharpCanvas(WIDTH,HEIGHT)
		.css({
			background:'rgba(0,0,0,1)',
		});
	canvas.mousedown(function(e){
		MOUSE_DOWN.active = true;
		MOUSE_DOWN.x = e.clientX;
		MOUSE_DOWN.y = e.clientY;		
	});	
	canvas.mousemove(function(e){
		if(MOUSE_DOWN.active){
			OFFSET.x += e.clientX - MOUSE_DOWN.x;
			OFFSET.y += e.clientY - MOUSE_DOWN.y;
			OFFSET.x = Math.max(Math.min(MAX_OFFSET,OFFSET.x),-MAX_OFFSET);
			OFFSET.y = Math.max(Math.min(MAX_OFFSET,OFFSET.y),-MAX_OFFSET);
		}
		
		MOUSE_DOWN.x = e.clientX;
		MOUSE_DOWN.y = e.clientY;	
		
		var icon = getIconUnderMouse(e);
		if(CURRENT_ICON !== icon && JSON.stringify(CURRENT_ICON) !== JSON.stringify(icon)){
			CURRENT_ICON = icon;
			if(icon){
				if(icon.onclick)
					canvas.css({cursor:"pointer"});
				textDiv.html(icon.description);
				textDiv.show();
			} else {
				canvas.css({cursor:"default"});
				textDiv.hide();
			}
		}
	});	
	canvas.mouseup(function(e){
		MOUSE_DOWN.active = false;
	});
	canvas.click(function(e){
		var icon = getIconUnderMouse(e)
		if(icon && icon.onclick){
			Dialog.playSfx('select');
			icon.onclick();
		}
	});
	html.bind('contextmenu',function(e){
		var spot = getSpotUnderMouse(e);
		if(spot && (!exports.Game.isOnRainingChainCom() || w.player.username === 'rc'))
			Command.execute(CST.COMMAND.teleportToSpotAdmin,[spot.x,spot.y,spot.map]);
		//
	});
	
	html.bind('mousewheel',function(e){
		var oldZoom = ZOOM;
		if(event.wheelDeltaY > 0)
			ZOOM *= 1.1;
		else
			ZOOM /= 1.1;
		ZOOM = Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,ZOOM));
		var newZOOM = ZOOM;
		//####
		
		//var centerZoomX = html.parent().width()/2;	//if center middle
		//var centerZoomY = html.parent().height()/2;
		
		var canvasOffset = $(canvas).offset();
		var centerZoomX = MOUSE_DOWN.x - canvasOffset.left;
		var centerZoomY = MOUSE_DOWN.y - canvasOffset.top;
		
		var offX = -((centerZoomX-OFFSET.x)/oldZoom*newZOOM-centerZoomX);
		var offY = -((centerZoomY-OFFSET.y)/oldZoom*newZOOM-centerZoomY);
		
		//goal is that (centerZoomX-OFFSET.x)/ZOOM === (centerZoomY-OFFSET.x)/ZOOM
		//so old and new
		
		OFFSET.x = offX;
		OFFSET.y = offY;
	});
		
	html.append(canvas,textDiv);
	
	ctx = canvas[0].getContext('2d');
	refreshImg();
},function(){
	return "" + OFFSET.x + OFFSET.y + ZOOM + w.player.x + w.player.y + w.player.map;
},1,function(html,variable,param){
	USING_WAYPOINT = param && !!param.waypoint;
	refreshImg();
}));

var getMaps = function(){
	return MAPGROUP[MAPGROUP_SHOWN].mapList;
}

var ICON_DRAWN = [];

var refreshImg = function(){	//big
	ctx.clearRect(0,0,WIDTH,HEIGHT);
	ICON_DRAWN = [];
	var maps = getMaps();
	
	
	
	var img = worldMapImg;
	var x = OFFSET.x;
	var y = OFFSET.y;
	var width = img.width*ZOOM;
	var height = img.height*ZOOM;
	
	ctx.drawImage(img,
		0,0,
		img.width,img.height,
		x,y,width,height
	);
		
		
	/*
	var ref = function(){	
		setTimeout(function(){
			refreshImg();
		},500);
	}
	for(var i in maps){
		var img = MapModel.getMinimapImg(MapModel.get(maps[i].map),ref);
		if(!img){	//not loaded yet
			ref = null;	//prevent multi refresh
			continue;
		}
		
		var x = OFFSET.x + maps[i].x*ZOOM;
		var y = OFFSET.y + maps[i].y*ZOOM;
		var width = img.width*ZOOM;
		var height = img.height*ZOOM;
		
		if(x >= WIDTH || y >= HEIGHT || (x + width < 0) || (y + height < 0))
			continue;	//wont be seen
		ctx.drawImage(img,
			0,0,
			img.width,img.height,
			x,y,width,height
		);
	}
	*/
	var QUEST_MARKER = {};
	for(var i in w.player.questMarker){
		var qm = w.player.questMarker[i];
		QUEST_MARKER[qm.goal.map] = QUEST_MARKER[qm.goal.map] || [];
		QUEST_MARKER[qm.goal.map].push(qm.goal);
	}
	
	for(var i in maps){
		var m = maps[i];
		var mapStartX = OFFSET.x + m.x*ZOOM;
		var mapStartY = OFFSET.y + m.y*ZOOM;
		
		for(var j = 0 ; j < m.iconList.length; j++){
			var icon = m.iconList[j];
			var size = getIconSize(icon);
			var x = mapStartX + icon.x*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
			var y = mapStartY + icon.y*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
			
			if(x >= WIDTH || y >= HEIGHT || (x + size < 0) || (y + size < 0))
				continue;	//wont be seen
			ICON_DRAWN.push({x:x,y:y,map:m.map,icon:icon});
			Img.drawIcon(ctx,icon.icon,size,x,y);
		}
		
		var qmList = QUEST_MARKER[m.map];
		if(qmList){
			for(var j = 0 ; j < qmList.length; j++){
				var icon = Icon(CST.ICON.questMarker,0,0,'Quest Marker',null,1.5);	//wrong xy but need that to get size...
				var size = getIconSize(icon);
				var x = mapStartX + qmList[j].x*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
				var y = mapStartY + qmList[j].y*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
				var icon = Icon(CST.ICON.questMarker,x,y,'Quest Marker',null,1.5);	//good one with right xy
				
				
				if(x >= WIDTH || y >= HEIGHT || (x + size < 0) || (y + size < 0))
					continue;	//wont be seen
				ICON_DRAWN.push({x:x,y:y,map:m.map,icon:icon});	//BAD...
				Img.drawIcon(ctx,CST.ICON.questMarker,size,x,y);
			}
		}
	}
	
	
	
	//player icon
	PLAYER_ICON.x = w.player.x;
	PLAYER_ICON.y = w.player.y;
	var size = getIconSize(PLAYER_ICON);
	var pos = getPlayerPositionToDraw();
	if(pos){
		ICON_DRAWN.push({x:PLAYER_ICON.x,y:PLAYER_ICON.y,map:w.player.map,icon:PLAYER_ICON});
		Img.drawIcon(ctx,PLAYER_ICON.icon,size,pos.x,pos.y);
	}
}

var getPlayerPositionToDraw = function(){	//tutorial hardcoded
	var pIcon = PLAYER_ICON;
	var pMap = w.player.map;
	if(pMap === 'Qtutorial-genetosHouse'){
		pIcon = Tk.deepClone(pIcon);
		pIcon.x = 1200;
		pIcon.y = 820;
		pMap = 'QfirstTown-main';
	}

	var maps = getMaps();
	var m = maps[pMap];	//.mapModel isnt updated
	if(!m)
		return null;
	
	var size = getIconSize(pIcon);
	var mapStartX = OFFSET.x + m.x*ZOOM;
	var mapStartY = OFFSET.y + m.y*ZOOM;
	var x = mapStartX + pIcon.x*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
	var y = mapStartY + pIcon.y*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
	
	if(x >= WIDTH || y >= HEIGHT || (x + size < 0) || (y + size < 0))
		return null;	//wont be seen
	return CST.pt(x,y);
}

var getIconUnderMouse = function(e){
	var canvasOffset = $(canvas).offset();
	var maps = getMaps();
	var mouse = {
		x:e.clientX - canvasOffset.left,
		y:e.clientY - canvasOffset.top,
	};
	var closestIcon = null;
	var closestDistance = 10000;
	
	for(var i in maps){
		var mapStartX = OFFSET.x + maps[i].x*ZOOM;
		var mapStartY = OFFSET.y + maps[i].y*ZOOM;
		
		for(var j = 0 ; j < maps[i].iconList.length; j++){
			var icon = maps[i].iconList[j];
			var size = getIconSize(icon);
			var x = mapStartX + icon.x*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
			var y = mapStartY + icon.y*SPOT_TO_MINIMAP_MOD*ZOOM - size/2;
			
			if(x >= WIDTH || y >= HEIGHT || (x + size < 0) || (y + size < 0))
				continue;	//wont be seen
			
			
			
			var iconRect = {
				x:x,y:y,
				width:size,height:size,			
			};
			if(Collision.testPtRect(mouse,iconRect)){
				var dist = Collision.getDistancePtPt(mouse,iconRect);
				if(closestDistance > dist){
					closestDistance = dist;
					closestIcon = icon;
				}
			}
		}
	}
	//self
	var pos = getPlayerPositionToDraw();
	if(pos){
		var size = getIconSize(PLAYER_ICON);
		var iconRect = {
			x:pos.x,y:pos.y,
			width:size,height:size,			
		};
		if(Collision.testPtRect(mouse,iconRect)){
			var dist = Collision.getDistancePtPt(mouse,iconRect);
			if(closestDistance > dist){
				closestDistance = dist;
				closestIcon = PLAYER_ICON;
			}
		}
	}

	return closestIcon;
}

/*var getMousePositionMapRelative = function(){
	var canvasOffset = $(canvas).offset();
	var mouseX = MOUSE_DOWN.x - canvasOffset.left;
	var mouseY = MOUSE_DOWN.y - canvasOffset.top;
	
	var vx = mouseX-OFFSET.x;
	var vy = mouseY-OFFSET.y;

	return {x:vx/ZOOM,y:vy/ZOOM};
}*/

var getIconSize = function(icon){
	var val = 20 * Math.min(1,Math.max(0.6,ZOOM))  * icon.sizeMod;
	
	if(icon.icon === PLAYER_ICON.icon && ZOOM < 0.8)
		val *= 2;
	if(icon.icon === CST.ICON.waypoint && ZOOM < 0.8)
		val *= 1.5;
	
	
	if(USING_WAYPOINT)
		if(icon.icon === CST.ICON.waypoint || icon.icon === 'worldMap-waypointLocked')
			val *= 1.5;
		else
			val *= 0.5
	return val;
}


var getSpotUnderMouse = function(e){
	var canvasOffset = $(canvas).offset();
	var maps = getMaps();
	var mouse = {
		x:e.clientX - canvasOffset.left,
		y:e.clientY - canvasOffset.top,
	};
	for(var i in maps){
		var m = maps[i];
		var mapStartX = OFFSET.x + m.x*ZOOM;
		var mapStartY = OFFSET.y + m.y*ZOOM;
		var rect = CST.rect(mapStartX,mapStartY,m.width*ZOOM,m.height*ZOOM);
		if(Collision.testPtRect(mouse,rect)){
			var fact = 1 / ZOOM / SPOT_TO_MINIMAP_MOD;
			var x = (mouse.x - mapStartX) * fact;
			var y = (mouse.y - mapStartY) * fact;
			return {x:x,y:y,map:m.map};			
		}
	}
	return null;	
}


})(); //{