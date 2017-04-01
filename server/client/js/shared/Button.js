
"use strict";
(function(){ //}
var OptionList, Collision, Main, Drop, Actor, Dialog, Input, Socket, Sprite;
global.onReady(function(){
	OptionList = rootRequire('shared','OptionList'); Collision = rootRequire('shared','Collision'); Main = rootRequire('shared','Main'); Drop = rootRequire('shared','Drop'); Actor = rootRequire('shared','Actor');
	Dialog = rootRequire('client','Dialog',true); Input = rootRequire('server','Input',true); Socket = rootRequire('private','Socket'); Sprite = rootRequire('shared','Sprite',true);
	Socket.on('click',Button.handleClickServerSide,60*1000/40,0,true,true);
});
var Button = exports.Button = function(extra){
	this.type = '';	
	this.id = '';
	this.preventAbility = false;	//value returned by Button.click
	Tk.fillExtra(this,extra);
};
var TYPE = {
	drop:'drop',
	actor:'actor',
}
Button.create = function(type,id,preventAbility){
	return new Button({
		type:type,
		id:id,
		preventAbility:preventAbility,	
	});
}

Button.Click = function(func,param/*...*/,textIfParamArray){	//used on server side. actor.onclick.left is type Button.Click
	var tmp = [];
	for(var i = 1 ; i < arguments.length; i++) 
		tmp.push(arguments[i]);
	var text = '';
	if(Array.isArray(param)) 
		text = textIfParamArray || '';
	return OptionList.Option(func,tmp,text,'');
}

Button.executeOption = function(option,main){
	OptionList.executeOption(main,option);
}

//left or right click (ex: minesweeper)
//for optionList clicking, check command actorOptionList
Button.handleClickServerSide = function(socket,pack){ //d format: [type,id,side]
	socket.timer = 0;
	var player = Actor.get(socket.key);
	var d = uncompressPack(pack);
	
	if(player.dead)
		return;
	if(!player.activeList[d.id]) 
		return;	//not nearby or not exist
		
	if(d.type === TYPE.actor){
		var act = Actor.get(d.id);
		if(!act || !Actor.testActiveList(player,act)) 
			return;	//possible if client cheat
		if(act.onclick && act.onclick[d.side])
			Button.executeOption(act.onclick[d.side],Main.get(socket.key));
	}
	if(d.type === TYPE.drop){
		var act = Drop.get(d.id);
		if(!act || !Actor.testActiveList(player,act)) 
			return;	//possible if client cheat
		Actor.click.drop(player,d.id);
	}
}

//CLIENT SIDE
Button.onclick = function(side){	//called when clicking
	var optionListActive = Dialog.isActive('optionList');
	
	Dialog.close('optionList');
	Dialog.close('equipPopup');
	
	if(Dialog.isMouseOverDialog()) 
		return true;
	if(Dialog.isMouseOverInventory()) 
		return true;
	
	var btn = Button.getBtnUnderMouse();	
	if(!btn) 
		return false;

	
	//send input to server...
	var pack = compressPack(btn.type,btn.id,side); //Button.handleClickServerSide
	
	if(btn.type === TYPE.actor){
		var act = Actor.get(btn.id);
		if(!act) 
			return false;
		if(side === 'right')
			Button.onclick.displayOptionList(act);
		else if(side === 'left' && !optionListActive){
			Button.onclick.walkTo(act,pack);
		}
	}
	Socket.emit(CST.SOCKET.click,pack);
	Button.CLICKED[btn.id] = true;
	return btn.preventAbility;
}

Button.simulateClick = function(actDrop,side){
	side = side || 'left';	//HCODE
	var t = actDrop.type === CST.ENTITY.drop ? TYPE.drop : TYPE.actor;
	var pack = compressPack(t,actDrop.id,side);
	Socket.emit(CST.SOCKET.click,pack);
	Button.CLICKED[actDrop.id] = true;
}

var uncompressPack = function(pack){
	return {
		type:pack[0],
		id:pack[1],
		side:pack[2],		
	}
}

var compressPack = function(type,id,side){
	return [type,id,side];
}

Button.onclick.displayOptionList = function(act){
	if(!act.optionList)
		return;
	if(w.player.pvpEnabled && act.type === CST.ENTITY.player)	//BAD VERYBAD
		return;
	
	var option =  act.optionList.option;
	if(act.type === CST.ENTITY.player){
		if(act.sprite.name === Actor.SPRITE_DEATH)
			option = act.optionList.option.slice(2,3);
		else
			option = act.optionList.option.slice(0,2);	//hide revive
	}
	Dialog.open('optionList',{
		name:act.optionList.name,
		option:option
	});
}

Button.onclick.walkTo = function(act,pack){
	if(!act.optionList || act.type === CST.ENTITY.player)
		return;
	if(Dialog.isMouseOverDialog())
		return;
	if(Dialog.isMouseOverInventory())
		return;
	if(Dialog.isMouseOverChatOrPm())
		return;
		
	var diffX = act.x - w.player.x;
	var diffY = act.y - w.player.y;
	if(Math.sqrt(diffX * diffX + diffY * diffY) < (act.interactionMaxRange-10))	//okay
		return;
	Input.setTarget(act,function(){
		Socket.emit(CST.SOCKET.click,pack);
	});
}

Button.getBtnUnderMouse = function(){	//client
	var btn = null;
	btn = Button.getBtnUnderMouse.actor(btn);
	btn = Button.getBtnUnderMouse.drop(btn);
	return btn;
}

Button.getBtnUnderMouse.actor = function(btn){
	for(var i in Actor.LIST){
		var act = Actor.LIST[i];
		if(!act || act.dead) 
			continue;
		
		if(Sprite.isMouseOver(act)){
			btn = Button.create(TYPE.actor,act.id,act.preventAbility);
			if(act.type === CST.ENTITY.npc)
				break;
		}
	}	
	return btn;	
}	
	
Button.getBtnUnderMouse.drop = function(btn){
	for(var i in Drop.LIST){
		var drop = Drop.LIST[i];
		
		var vx = Tk.absToRel.x(drop.x);
		var vy = Tk.absToRel.y(drop.y);
		
		if(Collision.testMouseRect(null,CST.rect(vx,vy,Drop.SIZE,Drop.SIZE)))
			btn = Button.create(TYPE.drop,drop.id,false);
	}
	return btn;	
}

Button.CLICKED = {};	//memory leak


})();
//################



