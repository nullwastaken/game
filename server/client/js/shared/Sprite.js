//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var ActiveList = require2('ActiveList'), Actor = require2('Actor'), SpriteModel = require2('SpriteModel');
var Collision = require4('Collision'), Main = require4('Main'), ClientPrediction = require4('ClientPrediction'), Input = require4('Input');

var Sprite = exports.Sprite = {};
Sprite.create = function(name,sizeMod,actorType){
	var model = SpriteModel.get(name);
	if(!model) return ERROR(4,'no model for name',name);
	
	var s = {
    	name:name,
		anim:"walk",		//on SERVER: normally null. change for 1 frame when attack
    	oldAnim:"walk",		//client stuff
		sizeMod:sizeMod || 1,
    	startX: 0,
    	timer: 0,
		alpha:1,
		hitBox:null,	//set later
		bumperBox:null,
		dead: false,			//used to change alpha
		normal:'mace',		//default appearance, contribution reward
	};
	s.name = name;
	s.sizeMod = sizeMod || 1;
	s.anim = s.oldAnim = model.defaultAnim;
	
	if(SERVER || actorType !== 'bullet')	//idk
		Sprite.updateBumper(s);
	
	return s;
};

Sprite.change = function(sprite,info){
    if(!sprite) return ERROR(5,'no act or no sprite');

	if(info.name){
		if(info.name === 'normal')  sprite.name = sprite.normal;
		else sprite.name = info.name;
	}
	sprite.sizeMod = info.sizeMod || sprite.sizeMod;
		
	Sprite.updateBumper(sprite);
}

Sprite.updateBumper = function(sprite){
	//Set the Sprite Bumper Box to fit the sizeMod
	var model = SpriteModel.get(sprite.name.split(',')[0]);
	if(!model) return ERROR(4,'no sprite model',sprite.name);
	
	sprite.hitBox = Sprite.resizeBumper(Tk.deepClone(model.hitBox),sprite.sizeMod * model.size);
	sprite.bumperBox = Sprite.resizeBumper(Tk.deepClone(model.bumperBox),sprite.sizeMod * model.size);
}

Sprite.updateAnim = function (act){	//client side only
	var dsp = SpriteModel.get(Actor.getSpriteName(act));
	if(!dsp) return ERROR(4,"sprite dont exist",act.sprite);
	
	if(act.sprite.animOld !== act.sprite.anim){	//otherwise, animation can be cut if timer for walk is high 
		act.sprite.animOld = act.sprite.anim;
		Sprite.change(act.sprite,{'anim':act.sprite.anim});
	}
	var animFromDb = dsp.anim[act.sprite.anim];	
	if(!animFromDb) return ERROR(4,"sprite anim dont exist",act.sprite);
	
	var mod = 1;
	if(animFromDb.walk){    //if walking, the speed of animation depends on movement speed
		var spd =  Math.max(Math.abs(act.spdX),Math.abs(act.spdY))/2;	//divide by 2, idk why but it works, probably because xy update only send 1/2 times
		mod = Math.abs(spd/act.maxSpd) || 0;
	}
	
	act.sprite.timer += animFromDb.spd * mod;	
	act.sprite.startX = Math.floor(act.sprite.timer);
	if(act.sprite.startX > animFromDb.frame-1){
		Sprite.changeAnim(act.sprite,animFromDb.next);
	}
	if(act.sprite.dead){
		act.sprite.alpha -= act.sprite.dead;
		if(act.sprite.alpha < 0)
			ActiveList.removeAny(act.id);
	}
	
}

Sprite.changeAnim = function(sprite,anim){
	sprite.anim = anim;
	sprite.startX = 0;
	sprite.timer = 0;
}


Sprite.resizeBumper = function(bumperBox,size){
	for(var i in bumperBox)
		for(var j in bumperBox[i])
			bumperBox[i][j] *= size;
	return bumperBox;
}

Sprite.draw = function(ctx,act){	//also does position update calc, client prediction //BAD hardcoded border
	var list = act.sprite.name.split(',');

	var underMouse = false;
	for(var i = 0; i < list.length; i++){
		var model = SpriteModel.get(list[i]);
		
		var image = SpriteModel.getImage(model,act.spriteFilter);
		if(!image) continue;
		
		var animFromDb = model.anim[act.sprite.anim];
		
		var angle = Sprite.getMoveAngle(act);
		var sideAngle = Math.round(angle/(360/animFromDb.dir)) % animFromDb.dir;
		
		var startX = act.sprite.startX * animFromDb.sizeX;
		var startY = animFromDb.startY + model.side[sideAngle] * animFromDb.sizeY;
			
		var sizeMod = model.size * act.sprite.sizeMod;
		
		ctx.globalAlpha = act.sprite.alpha;
		var sizeOffX = animFromDb.sizeX/2*sizeMod;
		var sizeOffY = animFromDb.sizeY/2*sizeMod;
		var offsetX = model.offsetX*sizeMod;
		var offsetY = model.offsetY*sizeMod;
		var posX = (CST.WIDTH2 - player.x) + act.x + offsetX;
		var posY = (CST.HEIGHT2 - player.y) + act.y + offsetY;
		
		if(act.type !== 'bullet' && act !== player){
			if(Collision.testMouseRect(key,{x:posX- sizeOffX,y:posY- sizeOffY,width:sizeOffX*2,height:sizeOffY*2}))
				underMouse = true;
		}
		
		if(!model.canvasRotate){
			if(model.showBorder && (underMouse || act.withinStrikeRange)){	//BAD hardocded...
				var filter = Main.getPref(main,'strikeTarget') === 0 && act.withinStrikeRange ? 'allRed' : 'allBlack';
				var black = SpriteModel.getImage(model,{filter:filter});
				if(!black) continue;
				
				ctx.drawImage(black, 
					startX,Math.floor(startY+1),	//bad way to fix random line on top of player
					animFromDb.sizeX,Math.floor(animFromDb.sizeY-1),
					posX - sizeOffX - 3,posY - sizeOffY - 3,
					animFromDb.sizeX * sizeMod + 6,animFromDb.sizeY * sizeMod + 6
				);
			}
			
			
			ctx.drawImage(image, 
				startX,Math.floor(startY+1),	//bad way to fix random line on top of player
				animFromDb.sizeX,Math.floor(animFromDb.sizeY-1),
				posX - sizeOffX,posY - sizeOffY,
				animFromDb.sizeX * sizeMod,animFromDb.sizeY * sizeMod
			);	
		} else {
			ctx.save();
			ctx.translate(posX,posY);
			ctx.rotate(act.angle/180*Math.PI);
			
			ctx.drawImage(image, 
				startX,startY,
				animFromDb.sizeX,animFromDb.sizeY,
				- sizeOffX,- sizeOffY,
				animFromDb.sizeX * sizeMod,animFromDb.sizeY * sizeMod
			);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
		
		if(Main.getPref(main,'displayMiddleSprite')){
			ctx.fillStyle = 'red';
			ctx.fillRect(CST.WIDTH2 - player.x + act.x -4,CST.HEIGHT2 - player.y + act.y -4,8,8);
			ctx.fillStyle = 'black';
		}
	}
	
	
	if(underMouse && act.context){
		return act.context;
	}
	return '';
}


Sprite.getMoveAngle = function(act){	//moveAngle
	if(ClientPrediction.isActive() && act === player){	//TEMP
		//check Actor.loop.updatePosition.player
		return act.moveAngle;
	}
	
	if(act === player && Input.getState('ability').toString() !== '0,0,0,0,0,0'){	//using ability
		return act.angle;
	}
	if(Math.abs(act.spdY) < 0.1 && Math.abs(act.spdX) < 0.1) 
		return act.angle;
				
	return Tk.atan2(act.spdY*1.2,act.spdX);	//+0.1 otherwise change all the time when moving diagonal
}
})(); //{


