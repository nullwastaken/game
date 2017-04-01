
/*jshint -W018*/
"use strict";
(function(){ //}
var Combat, Actor, MapModel, Input;
global.onReady(function(){
	Combat = rootRequire('server','Combat'); Actor = rootRequire('shared','Actor'); MapModel = rootRequire('server','MapModel');
	Input = rootRequire('server','Input',true);
	global.onLoop(Collision.loop);
});
var Collision = exports.Collision = {};

/*
rect: [minx,maxx,miny, maxy]
pt: {x:12.3,y:13.23}	//real position
pos: {x:1,y:23}			//grid position
*/

var MAP_MOD = {};	//all bullets share the same mapMod
var FRAME_COUNT = 0;

Collision.testRectRect = function(rect1,rect2){
	return rect1.x <= rect2.x+rect2.width 
		&& rect2.x <= rect1.x+rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height;
}

Collision.testPtRect = function(pt,rect){
	return pt.x >= rect.x
		&& pt.y >= rect.y
		&& pt.x <= rect.x+rect.width 
		&& pt.y <= rect.y+rect.height;
}

Collision.testPtRect.fast = function(pt,rectx,recty,rectwidth,rectheight){
	return pt.x >= rectx
		&& pt.y >= recty
		&& pt.x <= rectx+rectwidth 
		&& pt.y <= recty+rectheight;
}

Collision.testPtRRect = function(pt,rectangle){	//Collision Pt and Rotated Rect
	var c = Math.cos(-rectangle.angle*Math.PI/180);
	var s = Math.sin(-rectangle.angle*Math.PI/180);
	
	// UNrotate the point depending on the rotation of the rectangle
	var rotatedX = rectangle.x + c * (pt.x - rectangle.x) - s * (pt.y - rectangle.y);
	var rotatedY = rectangle.y + s * (pt.x - rectangle.x) + c * (pt.y - rectangle.y);
	
	// perform a normal check if the new point is inside the 
	// bounds of the UNrotated rectangle
	var leftX = rectangle.x;
	var rightX = rectangle.x + rectangle.width;
	var topY = rectangle.y;
	var bottomY = rectangle.y + rectangle.height;
	
	var res = leftX <= rotatedX && rotatedX <= rightX &&
			topY <= rotatedY && rotatedY <= bottomY;
	return res;
}

Collision.getDistancePtPt = function(pt1,pt2){
	return Tk.getDistancePtPt(pt1,pt2);
}

Collision.getAnglePtPt = function(pt1,pt2){	//pt1 looking towards pt2
	return Tk.getAnglePtPt(pt1,pt2);
}

Collision.testPosGrid = function(pos,grid){	
	return Collision.testXYMap(pos.x,pos.y,grid);
}

Collision.testXYMap = function(x,y,grid){ //return true if collision
	return !grid[y] || !+grid[y][x];
}

Collision.getPos = function(pt){
	return CST.pt(Math.floor(pt.x/32),Math.floor(pt.y/32));
}

Collision.ptToPos = function(x){
	return Math.floor(x/32);
}

Collision.getTileValue = function(pos,map,type){
	var grid = MapModel.get(map).grid[type];
	if(!grid[pos.y]) return null;
	return grid[pos.y][pos.x];		//return 01234
}

Collision.getPath = function(pos1,pos2){	//straight forward path (linear)
	var array = [];
	for(var i = 0 ; i < 1000 && (pos1.x !== pos2.x || pos1.y !== pos2.y); i++){
		if(pos1.x < pos2.x) pos1.x++;
		else if(pos1.x > pos2.x) pos1.x--;
		
		array.push({x:pos1.x,y:pos1.y});
		
		if(pos1.y < pos2.y) pos1.y++;
		else if(pos1.y > pos2.y) pos1.y--;
		
		array.push({x:pos1.x,y:pos1.y});
	}
	return array;
}

Collision.getHitBox = function(act,vx,vy){
	vx = vx || 0;
	vy = vy || 0;
	return {
		x:vx + act.x + act.sprite.hitBox.left.x,
		width:act.sprite.hitBox.right.x - act.sprite.hitBox.left.x,
		y:vy + act.y + act.sprite.hitBox.up.y,
		height:act.sprite.hitBox.down.y - act.sprite.hitBox.up.y,
	}
}

Collision.getBumperBox = function(act,vx,vy){
	vx = vx || 0;
	vy = vy || 0;
	return {
		x:vx + act.x + act.sprite.bumperBox.left.x,
		width:act.sprite.bumperBox.right.x - act.sprite.bumperBox.left.x,
		y:vy + act.y + act.sprite.bumperBox.up.y,
		height:act.sprite.bumperBox.down.y - act.sprite.bumperBox.up.y,
	}
}

Collision.testMouseRect = function(key,rect){	//client only
	return Collision.testPtRect(Input.getMouse(true),rect);
}

Collision.testBulletActor = function(b,act){
	if(!act) 
		return false;	//test target exist
	if(!Collision.testPtRect(b,Collision.getHitBox(act))) 
		return false;	//test if nearby
	if(!Combat.testCanDamage(b,act)) 
		return false;	//exist if can attack this type of player
	return true;
}

Collision.testBulletMap = function(bullet){
	if(bullet.ghost) 
		return false;
	var grid = MapModel.getFast(bullet.mapModel).grid['bullet'];
		
	var x = Math.floor(bullet.x/32);
	var y = Math.floor(bullet.y/32);
	return Collision.testXYMap(x,y,grid) 
		|| +MAP_MOD[bullet.map + '-' + x + '-' + y];
}

Collision.testStrikeActor = function(atk,act,bypassTestCanDamage){
	if(!act) return false;	//normal because strike is not in activeList of enemy.
	if(!bypassTestCanDamage && !Combat.testCanDamage(atk,act)) 
		return false;
	
	//Test Center First with Rot Rect
	if(Collision.testPtRRect(act,atk.rotatedRect)) 
		return true;	
	
	//Test 9 Pts
	var hb = Collision.getHitBox(act);
	for(var i = 0 ; i < atk.point.length; i++){
		if(Collision.testPtRect(atk.point[i],hb)) 
			return true;
	}
		
	return false;
}	

Collision.getFarthestStrikePosition = function(strike,target){	//gets farthest position with no collision
	var end = Collision.getPos(target);
	var path = Collision.getPath(Collision.getPos(strike),end);

	var grid = MapModel.get(strike.map).grid['bullet'];
	for(var i = 0; i < path.length; i++){
		if(Collision.testPosGrid(path[i],grid)){
			return {x:path[i].x*32,y:path[i].y*32,collision:true};	
		}
	}

	return target;
}

Collision.getFarthestStrikePosition.client = function(strike,target){	//when input mouse to move
	var end = Collision.getPos(target);
	var path = Collision.getPath(Collision.getPos(strike),end);

	var grid = MapModel.get(strike.map).grid['player'];
	
	if(Collision.testPosGrid(path[0],grid) || Collision.testPosGrid(path[1],grid)){
		return {x:strike.x,y:strike.y,collision:true};
	}
	for(var i = 2; i < path.length; i++){
		if(Collision.testPosGrid(path[i],grid)){
			return {x:path[i-2].x*32,y:path[i-2].y*32,collision:true};	
		}
	}

	return target;
}

Collision.testLineMap = function(map,start,end,what){
	var path = Collision.getPath(Collision.getPos(start),Collision.getPos(end));
	
	for(var i = 0; i < path.length; i++){
		var grid = MapModel.get(map).grid['bullet'];
		if(Collision.testPosGrid(path[i],grid)) 
			return true;	
	}
	return false;
}

Collision.testActorMap = function(x,y,map,act){	
	if(act.ghost) 
		return false;
	if(act.awareNpc){
		if(typeof act.mapMod[x + '-' + y] !== 'undefined') 
			return act.mapMod[x + '-' + y];
	} else if(typeof MAP_MOD[map + '-' + x + '-' + y] !== 'undefined'){
		return +MAP_MOD[map + '-' + x + '-' + y];
	}
	var grid = MapModel.getFast(SERVER ? act.mapModel : act.map).grid;
	return Collision.testXYMap(x,y,grid[act.type || CST.ENTITY.npc]); //BAD || act.map for client 
}

Collision.loop = function(){
	FRAME_COUNT++;
	if(FRAME_COUNT % 25 === 0) 
		Collision.loop.mapMod();
}

Collision.loop.mapMod = function(){ 
	MAP_MOD = {};
	var list = Actor.getBulletCollisionMapModList();
	for(var i = 0; i < list.length; i++)
		MAP_MOD[list[i].map + '-' + list[i].x + '-' + list[i].y] = 1;
	
}


})(); //{

