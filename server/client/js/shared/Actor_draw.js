
"use strict";
(function(){ //}
if(SERVER) return;
var Sprite, Main, ParticleEffect, Combat, SpriteModel, Strike, Collision, Img, Pref, QueryDb, Attack, Input;
global.onReady(function(){
	Combat = rootRequire('shared','Combat',true);  ParticleEffect = rootRequire('shared','ParticleEffect',true);  Strike = rootRequire('shared','Strike',true); Sprite = rootRequire('shared','Sprite',true); Main = rootRequire('shared','Main',true); SpriteModel = rootRequire('shared','SpriteModel',true); Collision = rootRequire('shared','Collision',true); Img = rootRequire('client','Img',true); Pref = rootRequire('client','Pref',true); QueryDb = rootRequire('shared','QueryDb',true); Attack = rootRequire('shared','Attack',true); Input = rootRequire('server','Input',true);
});
var Actor = rootRequire('shared','Actor');

Actor.drawAll = function(ctx){
	Actor.drawStrikeZone(w.player,ctx);
	var array = Actor.drawAll.getSortedList();
	var context = null;
	
	var glow = Main.screenEffect.isActorGlowing();
	for(var i = 0 ; i < array.length ; i++){
		var act = array[i];
		
		var myGlow = act === w.player ? Main.screenEffect.isPlayerGlowing() : glow;
		var text = Sprite.draw(ctx,act,myGlow);
		if(text)
			context = {
				text:text,
				entity:act
			};
	}
	
	Actor.drawStatus(ctx); 
	Actor.drawHitHistory(ctx); //after drawStatus
	return context;
}	

Actor.drawAll.getSortedList = function(){
	var drawSortList = [];
	for(var i in Actor.LIST){
		drawSortList.push(Actor.LIST[i]);
	}
	drawSortList.push(w.player);
	drawSortList.sort(function (act,act2){
		return Actor.getSpriteLegY(act)-Actor.getSpriteLegY(act2);
	});	
	return drawSortList;	
}

Actor.getSpriteLegY = function(act){
	var spriteFromDb = SpriteModel.get(Actor.getSpriteName(act));
	var sizeMod = spriteFromDb.size* act.sprite.sizeMod;
	return act.y + (spriteFromDb.legs + spriteFromDb.offsetY)  * sizeMod;
}

Actor.drawChatHead = function(ctx){
	if(!CHAT_HEAD.length)
		return;
	
	ctx.save();
	ctx.shadowColor = 'black';
	ctx.shadowOffsetX = 3;
	ctx.shadowOffsetY = 3;
	ctx.textAlign = 'center';
	ctx.fillStyle = "yellow";
	
	for(var i = 0 ; i < CHAT_HEAD.length; i++){
		var c = CHAT_HEAD[i];
		var x = c.finalX + Tk.absToRel.x(c.act.x);
		if(x < -100 || x > CST.WIDTH + 100)
			continue;
		x = Tk.minmax(x,100,CST.WIDTH - 100);
		
		var y = c.finalY + Tk.absToRel.y(c.act.y);
		if(y < -100 || y > CST.HEIGHT + 100)
			continue;
		y = Tk.minmax(y,0,CST.HEIGHT - 20);
		ctx.fillText(c.text,x,y);
	}
	ctx.restore();
}

var LETTER_LENGTH = 11;	//average of all 26 letter at 20px font
var CHAT_HEAD = [];
var FRAME = 0;
var FREQUENCE = 5;

Actor.updateChatHead = function(){
	if(FRAME++ % FREQUENCE !== 0)
		return;
	
	CHAT_HEAD = [];
	for(var i in Actor.LIST)
		Actor.updateChatHead.forEach(Actor.LIST[i]);
	Actor.updateChatHead.forEach(w.player);
}

Actor.updateChatHead.forEach = function(act){
	if(!act.chatHead)
		return;
	act.chatHead.timer = Math.min(act.chatHead.timer-FREQUENCE,Main.getPref(w.main,'chatHeadTimer')*25);
	if(act.chatHead.timer <= 0){
		act.chatHead = null;
		return;
	}
	if(act.type === CST.ENTITY.player && Main.isIgnoringPlayer(w.main,act.name)) 
		return;
	var text = unescape.html(act.chatHead.text);
	var spriteServer = act.sprite;
	var spriteFromDb = SpriteModel.get(Actor.getSpriteName(act));
	var sizeMod = spriteFromDb.size* spriteServer.sizeMod;
	
	var length = text.length * LETTER_LENGTH;//ctx.length(text); slow
	
	var numX = act.x;	//Tk.absToRel.x applied right before drawing
	var numY = act.y - 35 + spriteFromDb.hpBar*sizeMod;
	
	var rect = CST.rect(numX-length/2,numY,length,20);
	
	var safe = 0;
	var bad;
	do {
		bad = false;
		for(var i = 0; i < CHAT_HEAD.length; i++){
			if(Collision.testRectRect(rect,CHAT_HEAD[i])){
				numY += 10; 
				rect.y += 10;
				bad = true;
				break;
			}
		}
	}while(bad && safe++<10);
	
	CHAT_HEAD.push(rect);
	rect.text = text;
	rect.finalX = numX - act.x; //Tk.absToRel.x(act.x) called after
	rect.finalY = numY - act.y;
	rect.act = act;
}
		
Actor.MAX_HIT_HISTORY = 3;	//Actor.HitHistoryToDraw.loop
Actor.drawStatus = function(ctx){	//hp + status
	ctx.save();
	ctx.lineWidth = 1.5;
	for(var i = 0 ; i < STATUS.length; i++){
		var s = STATUS[i];
		
		ctx.globalAlpha = s.alpha;
		s.finalX = Tk.absToRel.x(s.act.x + s.x);
		s.finalY = Tk.absToRel.y(s.act.y + s.y);
		
		//var offset = 1.5;
		//ctx.fillRect(s.finalX-offset,s.finalY-offset,100+offset*2,4+offset*2);
		
		ctx.fillStyle = s.fillStyle;
		ctx.fillRect(s.finalX,s.finalY,s.length,4);
		ctx.strokeRect(s.finalX,s.finalY,s.length,4);
		
		//status	
		for(var j = 0, count = 0; s.act.statusClient && j < s.act.statusClient.length; j++){	//statusClient = '000000'
			if(s.act.statusClient[j] === '1'){
				var xx = s.finalX + 30*count;
				var yy = s.finalY - 30;
			
				Img.drawIcon(ctx,Img.getIcon('status',CST.status.list[j]),24,xx,yy);
				count++;
			}
		}
	}
	ctx.restore();
}

Actor.drawHitHistory = function(ctx){
	if(!STATUS.length)
		return;
	
	ctx.save();
	ctx.shadowColor = 'black';
	ctx.shadowOffsetX = 3;
	ctx.shadowOffsetY = 3;
	
	for(var i = 0 ; i < STATUS.length; i++){
		var s = STATUS[i];
	
		for(var j = 0 ; j < s.act.hitHistoryToDraw.length && j < Actor.MAX_HIT_HISTORY; j++){
			var xx = s.finalX + 105;	//note: in status part, s.finalX = Tk.absToRel
			var yy = s.finalY + j * 22; 
			
			var style = s.act.hitHistoryToDraw[j].num < 0 ? 'red' : 'green';
			if(ctx.fillStyle !== style)
				ctx.fillStyle = style;
			ctx.fillText(s.act.hitHistoryToDraw[j].num,xx,yy);
		}
	}
	ctx.restore();
}

/*var DRAW_CANVAS = Tk.createSharpCanvas(60,30)[0];
;(function(){
	var ctx = DRAW_CANVAS.getContext('2d');
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.font = '20px Miniset2';
	ctx.shadowColor = 'black';
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.fillStyle = 'red';
	ctx.fillText('-150',0,0);
	
})();*/

var LENGTH_HP = 100;
var STATUS = [];
Actor.updateStatus = function(){	//doesnt care about y-sortedList
	if(FRAME % FREQUENCE !== 0)	//++ done in updateChatHead
		return;
	STATUS = [];
	for(var i in Actor.LIST)
		Actor.updateStatus.forEach(Actor.LIST[i]);
	if(Main.getPref(w.main,'overheadHp'))
		Actor.updateStatus.forEach(w.player);
}
	
Actor.updateStatus.forEach = function(act){	//hp bar
	if(!act.combat || act.hideHpBar || act.hp < 0)
		return;
	
	var spriteFromDb = SpriteModel.get(Actor.getSpriteName(act));

	var length = Math.min(LENGTH_HP,act.hp/act.hpMax*LENGTH_HP);
	
	var color = Combat.testCanDamage.imprecise(w.player,act) ? 'red' : 'green';
	STATUS.push({
		finalX:0,
		finalY:0,
		x:-length/2,
		y:spriteFromDb.hpBar * spriteFromDb.size * act.sprite.sizeMod,
		act:act,
		length:length,
		fillStyle:color,
		alpha:act.sprite.alpha,
	});
}

Actor.drawAll.getMinimapList = function(){	//bad...
	var toReturn = [];
	for(var i in Actor.LIST){
		var m = Actor.LIST[i];
		if(!m.minimapIcon) continue;
		
		var icon = m.minimapIcon;
		if(m.type === CST.ENTITY.player && w.main.social.friendList[m.id]) 
			icon = 'color.purple';
		toReturn.push({
			vx:m.x - w.player.x,
			vy:m.y - w.player.y,
			icon:icon,
			size:Img.getMinimapIconSize(icon),
		});
	}
	return toReturn;
}

Actor.drawStrikeZone = function(act,ctx){
	var strikeTarget = Main.getPref(w.main,'strikeTarget');
	var displayStrike = Main.getPref(w.main,'displayStrike');
	
	if(strikeTarget === Pref.strikeTarget.NONE && !displayStrike)
		return;
	
	if(strikeTarget !== Pref.strikeTarget.NONE){
		for(var i in Actor.LIST)
			Actor.LIST[i].withinStrikeRange = false;
	}
	var list = Actor.getAbility(act);	//[id,id,id]
	for(var j = 0 ; j < list.length; j++){	//max 1 strike
		var ab = QueryDb.get('ability',list[j]);
		if(!(ab && ab.type === CST.ABILITY.attack && ab.param.type === CST.ENTITY.strike))
			continue;

		//x,y mouseX mouseY
		var pos = Attack.getInitPosition(ab.param,w.player);
		
		var fakeStrike = {x:pos.x,y:pos.y,width:ab.param.width,height:ab.param.height,angle:act.angle};	//CST.rectRot
		
		var point = Strike.getPoint(fakeStrike);
		var rotatedRect = Strike.getRotatedRect(fakeStrike,point);
		fakeStrike.rotatedRect = rotatedRect;
		fakeStrike.point = point;
		
		if(strikeTarget !== Pref.strikeTarget.NONE){
			ctx.save();
			for(var i in Actor.LIST){
				var target = Actor.LIST[i];
				if(!target.combat) continue;
				if(Collision.testStrikeActor(fakeStrike,Actor.LIST[i],true))
					target.withinStrikeRange = true;
					
				if(target.withinStrikeRange && strikeTarget === Pref.strikeTarget.RED_RECT){
					var posX = Tk.absToRel.x(target.x);
					var posY = Tk.absToRel.y(target.y);
					var model = SpriteModel.get(Actor.getSpriteName(target));
					var sizeMod = model.size * target.sprite.sizeMod;
					
					var anim = model.anim[target.sprite.anim];
					var sizeOffX = anim.sizeX/2*sizeMod;
					var sizeOffY = anim.sizeY/2*sizeMod;
					
					ctx.fillStyle = 'red';
					ctx.globalAlpha = 0.25;
					ctx.fillRect(posX- sizeOffX,posY- sizeOffY,sizeOffX*2,sizeOffY*2);
					ctx.strokeRect(posX- sizeOffX,posY- sizeOffY,sizeOffX*2,sizeOffY*2);
				}
				if(target.withinStrikeRange && strikeTarget === Pref.strikeTarget.RED_SKIN)
					Actor.setSpriteFilter(target,Actor.SpriteFilter('red',2));
						
			}
			ctx.restore();
		}
		
		//9 dots
		//for(var i in point)	ctx.fillRect(Tk.absToRel.x(point[i].x-5),Tk.absToRel.y(point[i].y-5),10,10);
		
		if(displayStrike && Input.getState('ability')[j]){
			ctx.save();
			var x = Tk.absToRel.x(fakeStrike.x);
			var y = Tk.absToRel.y(fakeStrike.y);
			ctx.translate(x,y);
			ctx.rotate(fakeStrike.angle/180*Math.PI);
			ctx.fillStyle = 'red';
			ctx.globalAlpha = 0.25;
			ctx.strokeStyle = 'black';
			ctx.strokeRect(-fakeStrike.width/2,-fakeStrike.height/2,fakeStrike.width,fakeStrike.height);
			ctx.fillRect(-fakeStrike.width/2,-fakeStrike.height/2,fakeStrike.width,fakeStrike.height);
			ctx.restore();
		}
		
		break;
	}
}


var FADEOUT = 1/16;
Actor.initRemove = function(act){
	act.sprite.fadeoutRate = FADEOUT;
	act.dead = true;
	act.hp = 0;
	if(act.combat){
		ParticleEffect.create(function(emitter){
			ParticleEffect.applyModel(emitter,ParticleEffect.Model('#ff7777',20,3,1,1.2),1,act.x,act.y);
		},null,true);
	}
}

})(); //{





	