//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Maps = require2('Maps'), ActiveList = require2('ActiveList'), ItemModel = require2('ItemModel'), Equip = require2('Equip'), Actor = require2('Actor');
var QueryDb = require4('QueryDb'), Img = require4('Img'), Collision = require4('Collision');
var Drop = exports.Drop = {};

var TIMER = 25*60;

Drop.create = function(spot,item,amount,viewedIf,timer){
	var tmp = {
		id:Math.randomId(),
		type:'drop',
		activeList:{},
		viewedIf:viewedIf || 'true',
		x:spot.x || 0,
		y:spot.y || 0,
		map:spot.map || ERROR(3,'no map',spot) || Actor.DEFAULT_SPOT.map,
		item:item || 'bugged-drop',
		amount:amount || 1,
		timer:timer || TIMER,
		color:'',
		change:{},	//for send
	};
	
	if(!ItemModel.get(tmp.item))
		return ERROR(3,'drop with non-existing item',tmp.item);
	if(Equip.get(tmp.item))
		tmp.color = Equip.get(tmp.item).color;
	
	LIST[tmp.id] = tmp;
	ActiveList.addToList(tmp);
	Maps.enter(tmp);
};	
var LIST = Drop.LIST = {};

Drop.get = function(id){
	return LIST[id] || null;
}

Drop.addToList = function(bullet){
	LIST[bullet.id] = bullet;
}
Drop.removeFromList = function(id){
	delete LIST[id]; 
}


Drop.loop = function(){	//static
	for(var i in LIST){ 
		var drop = LIST[i];
		if(--drop.timer <= 0) Drop.remove(drop);
	}
}

Drop.remove = function(drop){
	if(typeof drop === 'string') drop = LIST[drop];
	Maps.leave(drop);
	delete LIST[drop.id];
	ActiveList.removeFromList(drop.id);
}

Drop.doInitPack = function(drop){
	var draw = [
		'drop',
		Math.round(drop.x),
		Math.round(drop.y),
		drop.item,
		drop.color
	];	
	return draw;
}

Drop.undoInitPack = function(obj,id){
	var b = {
		type:'drop',
		id:id,
		toRemove:0,
		x:obj[1],
		y:obj[2],
		item:obj[3],
		color:obj[4],
	};
	return b;
}


Drop.drawAll = function(ctx){	//linked with Button.updateList.drop for size 32
	var context;
	for(var i in LIST){
		var drop = LIST[i];
				
		var numX = Tk.absToRel.x(drop.x);
		var numY = Tk.absToRel.y(drop.y);
		
		var item = QueryDb.get('item',drop.item);
		if(!item) continue;
		Img.drawIcon(ctx,item.icon,32,numX,numY);
		
		if(drop.color){
			ctx.strokeStyle = drop.color;
			ctx.lineWidth = 4;
			ctx.strokeRect(numX,numY,32,32);
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
		}
		
		if(Collision.testMouseRect(null,{x:numX,y:numY,width:32,height:32}))
			context = item.name;
	}
	return context;
}


			
})();


