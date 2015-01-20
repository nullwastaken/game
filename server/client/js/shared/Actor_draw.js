Actor.drawAll = function (ctx){
	Actor.drawStrikeZone(player,ctx);
	var array = Actor.drawAll.getSortedList();
	var context = null;
	for(var i = 0 ; i < array.length ; i++){
		var act = array[i];
		context = Sprite.draw(ctx,act) || context;
		if(act.combat && (Main.getPref(main,'overheadHp') || act !== player)){
			Actor.drawStatus(act,ctx); 
		}
	}
	
	return context;
}	

Actor.drawAll.getSortedList = function(){
	var drawSortList = [];
	for(var i in Actor.LIST){
		drawSortList.push(Actor.LIST[i]);
	}
	drawSortList.push(player);
	drawSortList.sort(function (act,mort1){
		var spriteFromDb = SpriteModel.get(Actor.getSpriteName(act));
		var sizeMod = spriteFromDb.size* act.sprite.sizeMod;
		var y0 = act.y + spriteFromDb.legs * sizeMod
		
		var spriteFromDb1 = SpriteModel.get(Actor.getSpriteName(mort1));
		var sizeMod1 = spriteFromDb1.size* mort1.sprite.sizeMod;
		var y1 = mort1.y + spriteFromDb1.legs * sizeMod1
		
		return y0-y1;	
	});	
	return drawSortList;	
}

Actor.drawChatHead = function(ctx){
	Actor.drawChatHead.list = {};
	for(var i in Actor.LIST){
		Actor.drawChatHead.func(Actor.LIST[i],ctx);		
	}
	Actor.drawChatHead.func(player,ctx);
}	
Actor.drawChatHead.func = function(act,ctx){
	if(!act.chatHead) return;
		
	var spriteServer = act.sprite;
	var spriteFromDb = SpriteModel.get(Actor.getSpriteName(act));
	var sizeMod = spriteFromDb.size* spriteServer.sizeMod;
	
	var numX = CST.WIDTH2+act.x-player.x;
	var numY = CST.HEIGHT2+act.y-player.y - 35 + spriteFromDb.hpBar*sizeMod;;
	
	ctx.setFont(20);
	var length = ctx.length(act.chatHead.text);
	var rect = {x:numX-length/2,width:length,y:numY,height:20};
	
	var safe = 0;
	do {
		bad = false;
		for(var i in Actor.drawChatHead.list){
			if(Collision.testRectRect(rect,Actor.drawChatHead.list[i])){
				numY += 10; 
				rect.y += 10;
				bad = true;
				break;
			}
		}
	}while(bad && safe++<1000)
	Actor.drawChatHead.list[act.id] = rect;
	ctx.fillStyle="black";
	ctx.globalAlpha = 0.7;
	ctx.roundRect(numX-5-length/2,numY-2,length+5,24);
	ctx.globalAlpha = 1;
	ctx.textAlign = 'center';
	ctx.fillText(act.chatHead.text,numX,numY);
	ctx.fillStyle="yellow";
	ctx.fillText(act.chatHead.text,numX-1,numY-1);
	ctx.textAlign = 'left';
	ctx.fillStyle="black";
	ctx.setFont(18);

}
Actor.drawChatHead.list = {
	//playername:rect,
};

Actor.getSpriteName = function(act){
	return act.sprite.name.split(',')[0];
}

Actor.drawStatus = function(act,ctx){	//hp + status
	if(act.hpMax <= 5) return; //QUICKFIX for targets
		
	var spriteServer = act.sprite;
	var spriteFromDb = SpriteModel.get(Actor.getSpriteName(act));
	var animFromDb = spriteFromDb.anim[spriteServer.anim];

	var sizeMod = spriteFromDb.size* spriteServer.sizeMod;
	var numX = CST.WIDTH2+act.x-player.x-50;
	var numY = CST.HEIGHT2+act.y-player.y + spriteFromDb.hpBar*sizeMod;

	//hp
	if(act.hp <= 0) return;
	ctx.globalAlpha = spriteServer.alpha;
	ctx.strokeStyle = "black";
	ctx.roundRect(numX,numY,100,5);
	ctx.fillStyle = act.type === 'npc' ? 'red' : 'green';
	var hp = Math.min(act.hp,act.hpMax);
	ctx.roundRect(numX,numY,Math.max(hp/act.hpMax*100,0),5,1);	
	ctx.fillStyle="black";
	
	//################
	
	for(var i = 0, count = 0; act.statusClient && i < act.statusClient.length; i++){	//statusClient = '000000'
		var x = numX + 30*count;
		var y = numY - 30;
		
		if(act.statusClient[i] == '1'){
			Img.drawIcon(ctx,'status.' + CST.status.list[i],x,y,24);
			count++;
		}
	}
	ctx.globalAlpha = 1;
}

Actor.drawAll.getMinimapList = function(){	//bad...
	var toReturn = [];
	for(var i in Actor.LIST){
		var m = Actor.LIST[i];
		if(!m.minimapIcon) continue;
		
		var icon = m.minimapIcon;
		if(m.type === 'player' && main.social.friendList[m.id]) 
			icon = 'color.purple';
		toReturn.push({
			vx:m.x - player.x,
			vy:m.y - player.y,
			icon:icon,
			size:Img.getMinimapIconSize(icon),
		});
	}
	return toReturn;
}

Actor.drawStrikeZone = function(act,ctx){
	
	var list = Actor.getAbility(act);	//[id,id,id]
	var strikeTarget = Main.getPref(main,'strikeTarget');
	var displayStrike = Main.getPref(main,'displayStrike');
	if(strikeTarget !== Pref.strikeTarget.NONE){
		for(var i in Actor.LIST)
			Actor.LIST[i].withinStrikeRange = false;
	}
	
	for(var j in list){
		var ab = QueryDb.get('ability',list[j]);
		if(!(ab && ab.type === 'attack' && ab.param.type === 'strike'))
			continue;

		//x,y mouseX mouseY
		var pos = Attack.getInitPosition(ab.param,player);
		
		var fakeStrike = {x:pos.x,y:pos.y,width:ab.param.width,height:ab.param.height,angle:act.angle};
		
		var point = Attack.Strike.getPoint(fakeStrike);
		var rotatedRect = Attack.Strike.getRotatedRect(fakeStrike,point);
		fakeStrike.rotatedRect = rotatedRect;
		fakeStrike.point = point;
		
		//9 dots
		//for(var i in point)	ctx.fillRect(point[i].x-5-act.x+CST.WIDTH2,point[i].y-5-act.y+CST.HEIGHT2,10,10);
		
		if(displayStrike && Input.state.ability[j]){
			ctx.save();
			var x = fakeStrike.x-act.x+CST.WIDTH2;
			var y = fakeStrike.y-act.y+CST.HEIGHT2;
			ctx.translate(x,y);
			ctx.rotate(fakeStrike.angle/180*Math.PI);
			ctx.fillStyle = 'red';
			ctx.globalAlpha = 0.25;
			ctx.strokeStyle = 'black';
			ctx.strokeRect(-fakeStrike.width/2,-fakeStrike.height/2,fakeStrike.width,fakeStrike.height);
			ctx.fillRect(-fakeStrike.width/2,-fakeStrike.height/2,fakeStrike.width,fakeStrike.height);
			ctx.restore();
		}
		if(strikeTarget !== Pref.strikeTarget.NONE){
			ctx.save();
			for(var i in Actor.LIST){
				var target = Actor.LIST[i];
				if(!target.combat) continue;
				if(Collision.strikeActor.collision(fakeStrike,Actor.LIST[i]))
					target.withinStrikeRange = true;
					
				if(target.withinStrikeRange && strikeTarget === Pref.strikeTarget.RED_RECT){
					var posX = target.x - player.x + CST.WIDTH2;
					var posY = target.y - player.y + CST.HEIGHT2;
					var model = SpriteModel.get(target.sprite.name.split(',')[0]);
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
	}
}










	