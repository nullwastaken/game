
"use strict";
(function(){ //}
var Maps, Entity, ItemModel, Actor, Collision, Equip, QueryDb, Img, Collision, Button;
global.onReady(function(){
	Collision = rootRequire('shared','Collision'); Actor = rootRequire('shared','Actor'); Maps = rootRequire('server','Maps'); Entity = rootRequire('shared','Entity'); ItemModel = rootRequire('shared','ItemModel'); Equip = rootRequire('server','Equip');
	Button = rootRequire('shared','Button',true); QueryDb = rootRequire('shared','QueryDb',true); Img = rootRequire('client','Img',true);
	
	Entity.onPackReceived(Entity.TYPE.drop,Drop.createFromInitPack);
	global.onLoop(Drop.loop);
});
var Drop = exports.Drop = function(extra){
	Entity.call(this);
	this.type = CST.ENTITY.drop;
	this.item = '';
	this.amount = 1;
	this.timer = TIMER;
	this.frame = 0;
	this.color = '';	//only for sfx
	this.autoPick = true;
	
	this.alpha = 1; //client
	this.beingRemoved = false; //client
	this.beingRemovedTimer = false; //client
	Tk.fillExtra(this,extra);
};

var TIME_BEFORE_AUTOPICK = 15;
var TIMER = 25*60;
var BEING_REMOVED_TIMER = 25;
Drop.SIZE = 32;
var LIST = Drop.LIST = {};
Drop.CLICKED = {};	//id:bool

Drop.create = function(spot,item,amount,viewedIf,autoPick,timer){
	var tmp = new Drop({
		viewedIf:viewedIf,
		x:spot.x,
		y:spot.y,
		map:spot.map,
		item:item,
		amount:amount,
		autoPick:autoPick,
		timer:timer,
	});
	
	if(!ItemModel.get(tmp.item))
		return ERROR(3,'drop with non-existing item',tmp.item);
	if(Equip.get(tmp.item))
		tmp.color = Equip.get(tmp.item).color;
	
	LIST[tmp.id] = tmp;
	Entity.addToList(tmp);
	Maps.enter(tmp);
};	

Drop.get = function(id){
	return LIST[id] || null;
}

Drop.addToList = function(bullet){
	LIST[bullet.id] = bullet;
}

Drop.removeFromList = function(id){
	delete LIST[id]; 
}

Drop.loop = SERVER ? function(){
	for(var i in LIST){
		var drop = LIST[i];
		if(++drop.frame > drop.timer) 
			Drop.remove(drop);
	}
} : function(){
	for(var i in LIST){
		var drop = LIST[i];
		if(drop.beingRemoved){
			if(++drop.beingRemovedTimer > BEING_REMOVED_TIMER)
				Drop.remove(drop);
			else {
				drop.alpha = 1-drop.beingRemovedTimer/BEING_REMOVED_TIMER;
				Drop.dragTowardsPlayer(drop);
			}
		} else if(++drop.frame > drop.timer) 
			Drop.remove(drop);
	}
	for(var i in LIST)
		Drop.testAutoPick(LIST[i]);
}

Drop.testAutoPick = function(d){
	if(d.beingRemoved || !d.autoPick || d.frame < TIME_BEFORE_AUTOPICK)
		return;
	if(Button.CLICKED[d.id])	//already clicked
		return;
	if(Collision.getDistancePtPt(d,w.player) > w.player.pickRadius/2)
		return;
	Button.simulateClick(d);
}

Drop.initRemove = function(d){
	if(Button.CLICKED[d.id])
		d.beingRemoved = true;
	else
		Drop.remove(d);
}

Drop.remove = function(d){
	if(typeof d === 'string') 
		d = LIST[d];
	if(SERVER)
		Maps.leave(d);
	Drop.removeFromList(d.id);
	Entity.removeFromList(d.id);
}

Drop.doInitPack = function(d){
	var draw = [
		Entity.TYPE.drop,
		Math.round(d.x),
		Math.round(d.y),
		d.item,
		d.color,
		d.autoPick
	];	
	return draw;
}

Drop.undoInitPack = function(obj,id){
	var d = new Drop({
		id:id,
		x:obj[1],
		y:obj[2],
		map:w.player.map,
		mapModel:w.player.map,
		item:obj[3],
		color:obj[4],
		autoPick:obj[5],
	});
	return d;
}

Drop.createFromInitPack = function(obj,id){
	var d = Drop.undoInitPack(obj,id);
	Drop.addToList(d);	
	Entity.addToList(d);
}
	
Drop.drawAll = function(ctx){
	var context = null;
	ctx.save();
	ctx.lineWidth = 3;
	
	
	for(var i in LIST){
		var d = LIST[i];
				
		var numX = Tk.absToRel.x(d.x);
		var numY = Tk.absToRel.y(d.y);
		
		var item = QueryDb.get('item',d.item);
		if(!item) 
			continue;
		ctx.globalAlpha = d.alpha;
		Img.drawIcon(ctx,item.icon,Drop.SIZE,numX,numY);
		
		var dist = f(d.frame % 24);
		if(!d.beingRemoved)
			ctx.strokeRect(numX-dist,numY-dist,Drop.SIZE+dist*2,Drop.SIZE+dist*2);
		
		if(Collision.testMouseRect(null,CST.rect(numX,numY,Drop.SIZE,Drop.SIZE)))
			context = {
				text:item.name,
				entity:d
			}
	}
	ctx.restore();
	return context;
}
var f = function(x){
	return 1.5 + x * (x-24) / (24/2*24/2) * -2.5;
}

Drop.dragTowardsPlayer = function(d){
	var p = w.player;
	var fact = 5 * (1 - d.beingRemovedTimer/BEING_REMOVED_TIMER);
	if(fact < 1)
		fact = 1;
	d.x += (p.x-d.x)/fact;
	d.y += (p.y-d.y)/fact;
	if(Tk.getDistancePtPt(p,d) < 8)
		d.beingRemovedTimer = BEING_REMOVED_TIMER
}
			
})();


