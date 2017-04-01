
//final
"use strict";
(function(){ //}
var Collision, Sfx, Command;
global.onReady(function(){
	Collision = rootRequire('shared','Collision',true); Sfx = rootRequire('client','Sfx',true); Command = rootRequire('shared','Command',true);
	global.onLoop(Dialog.loop);
},null,'Dialog',['Actor','QueryDb','Main','Input'],function(){
	Dialog.init();
});

var Dialog = exports.Dialog = function(extra){
	this.html = null;	//HTMLElement
	this.parentDiv = '#gameDiv';
	this.refresh = Dialog.Refresh();
	this.wasCreated = false;
	this.alreadyShown = false;
	this.variable = {};
	this.param = null;	//any
	this.isJDialog = true;
	this.requireInit = true;
	Tk.fillExtra(this,extra);
};

var JQUERY_ALWAYS_ON_TOP = ['question','questPopup'];
var IGNORE_FOR_ALWAYS_ON_TOP = ['permPopup','performance','abilityBar','resourceBar'];
var SEND_dialogOpen = ['worldMap','questList','reputation'];
var NO_SFX_CLOSE = ['questPopup'];

Dialog.create = function(id,title,size,refresh,extra){
	extra = extra || {};
	
	var html = $('<div>')
		.attr('title',title||'')
		
	if(extra.isJDialog !== false){
		html.dialog({
			autoOpen: false,
			width:size.width, 
			height:size.height,
			resizable:size.resizable,
			open:function(){
				html.find('*').blur();	//hax
			},
			close: function() {
				Dialog.close(id);
				$('button').blur();	//hax
				if(!CLOSE_VIA_DIALOG_CLOSE && !NO_SFX_CLOSE.$contains(id))
					Dialog.playSfx('select');
			},
		});
	}
	extra.html = html;
	extra.refresh = refresh;
	
	LIST[id] = new Dialog(extra);
	
	if(id !== 'stage' || id !== 'stageMask')	//BAD
		html.css({zIndex:Dialog.ZINDEX.NORMAL});
	
	if(!LIST[id].isJDialog){
		$(LIST[id].parentDiv).append(html);
		html.hide();
	}
	if(!html.attr('id'))
		html.attr('id','Dialog_debug-' + id);
	
	return html;
}

Dialog.UI = function(id,parentDiv,css,refresh,extra){
	extra = extra || {};
	extra.parentDiv = parentDiv ? '#' + parentDiv : undefined;
	extra.isJDialog = false;
	
	var myDialog = Dialog.create(id,'',null,refresh,extra);

	css = css || {};
	css.zIndex = css.zIndex === undefined ? Dialog.ZINDEX.NORMAL : css.zIndex;
	myDialog.css(css || {});
	return myDialog;
}

var LIST = Dialog.LIST = {};
var ACTIVE = Dialog.ACTIVE = {};
var FRAME_COUNT = 0;
var $gameDiv;	//init
var $topRight;
var $topLeft;
var $bottomRight;
var $bottomLeft;
var isMoved = {
	topRight:false,
	topLeft:false,
	bottomRight:false,
	bottomLeft:false,
}
var CONFORT = 25;
var FREQUENCY = {};
var LEFT_CLICK_MOVE_EXCEPTION = ['stage','stageMask','hint','pm','chat','partyClan','context'];

Dialog.ZINDEX = {};
Dialog.ZINDEX.LOW = 0;
Dialog.ZINDEX.NORMAL = 10;
Dialog.ZINDEX.jqueryDialog = 50;	//Check game.css		.ui-dialog { z-index: 50 !important ;}
Dialog.ZINDEX.HIGH = 105;

var INIT = false;
var BIG_WINDOW = ['ability','equip','worldMap','questList','account','binding','sideQuest','highscore','stat','setting','achievement','reputation','contribution'];
var CLOSE_VIA_DIALOG_CLOSE = false; //for sfx

Dialog.playSfx = function(id,vol){
	Sfx.play(id,vol);
}

Dialog.Size = function(width,height,resizable){
	return {
		width:width || 600,
		height:height || 400,
		resizable:resizable === undefined ? true : resizable
	}
}	

Dialog.Refresh = function(create,getOld,interval,update,loop,close){
	return {
		create:create || CST.func,	//if return value, it will become dialog.param
		getOld:getOld || CST.func,
		interval:interval || 10,
		update: update || create,
		oldValue:undefined,
		loop:loop || CST.func,
		close:close || CST.func
	}
}

Dialog.open = Dialog.refresh = function(name,param,forceCreate){
	if(!INIT && (!LIST[name] || LIST[name].requireInit))
		return;
	var focus = document.activeElement;
	
	if(SEND_dialogOpen.$contains(name))
		Command.execute(CST.COMMAND.dialogOpen,[name]);
		
	FREQUENCY[name] = FREQUENCY[name] || 0;
	FREQUENCY[name]++;
	
	var dia = LIST[name];
	if(!dia) 
		return ERROR(3,'invalid dialog',name);
	dia.param = param || null;
	
	var ret;	//true = call update/create, false = close, null = stay active but not show (for context)	
	if(forceCreate !== false && (forceCreate || !dia.wasCreated || dia.refresh.create === dia.refresh.update)){
		dia.wasCreated = true;
		dia.html.html('');	//reset
		ret = dia.refresh.create(dia.html,dia.variable,dia.param);
		if(ret === true)	//aka want the update
			Dialog.open(name,param,false);
	} else { //only update
		ret = dia.refresh.update(dia.html,dia.variable,dia.param);
		if(ret === true)
			Dialog.open(name,param,true);	//call .create
	}
	if(ret === false) 
		return Dialog.close(name);
	
	if(ret && ret !== true)
		ERROR(3,'invalid ret'); 
	dia.param = ret || dia.param;
	dia.refresh.oldValue = dia.refresh.getOld(dia.html,dia.variable,dia.param);
	
	if(dia.isJDialog){
		dia.html.dialog('open');
		$('.toolTipDetails').remove();
	} else {
		if(ret !== null)	//important for reputation and others
			if(!dia.alreadyShown){
				dia.alreadyShown = true;
				dia.html.show();
			}
	}
	
	ACTIVE[name] = true;
	
	if(!IGNORE_FOR_ALWAYS_ON_TOP.$contains(name)){
		if(w.main.questActive === CST.QTUTORIAL && (name === 'ability' || name === 'equip'))	//BAD
			return;
		for(var i = 0 ; i < JQUERY_ALWAYS_ON_TOP.length; i++)
			if(Dialog.isActive(JQUERY_ALWAYS_ON_TOP[i]))
				Dialog.get(JQUERY_ALWAYS_ON_TOP[i]).dialog('moveToTop');
	}
	if(document.activeElement !== focus)
		$(focus).focus();
}
//setTimeout(function(){ exports.Dialog.open('questPopup',{text:'a'});},1000)

Dialog.quickContextRefresh = function(text){
	var dia = LIST['context'];
	dia.refresh.update(dia.html,dia.variable,text);
}

Dialog.close = function(name){
	if(!ACTIVE[name]) 
		return;
	var dia = LIST[name];
	dia.alreadyShown = false;
	CLOSE_VIA_DIALOG_CLOSE = true;
	if(dia.isJDialog)
		dia.html.dialog('close');
	else 
		dia.html.hide();
	CLOSE_VIA_DIALOG_CLOSE = false;
	dia.refresh.close();
	delete ACTIVE[name];
	
	if(w.main.questActive === CST.QTUTORIAL){	//to call dialogOpen quest event
		Command.execute(CST.COMMAND.dialogClose,[name]);
	}
}

Dialog.closeAll = function(){
	var alreadyAllClosed = true;
	for(var i in LIST){
		if(LIST[i].isJDialog && ACTIVE[i]){
			alreadyAllClosed = false;
			Dialog.close(i);
		}
	}
	return alreadyAllClosed;
}

Dialog.loop = function(){
	FRAME_COUNT++;
	for(var i in ACTIVE){
		Dialog.loop.forEach(i);
	}
}

Dialog.loop.forEach = function(i){	//chrome says faster...
	var dialog = LIST[i];
		
	if(FRAME_COUNT % dialog.refresh.interval !== 0) 
		return;
	var old = dialog.refresh.getOld(dialog.html,dialog.variable,dialog.param);
	
	if(dialog.refresh.oldValue !== old){
		dialog.refresh.oldValue = old;
		Dialog.refresh(i,dialog.param);
	} else {
		dialog.refresh.loop(dialog.html,dialog.variable,dialog.param);	
	}
}

Dialog.get = function(name){
	return LIST[name].html;
}


var OPEN_ON_INIT = ["context", "playerOnline", "tabButton", "inventory", "reputationBar", "chat", "pm", "partyClan", "resourceBar", "abilityBar", "curseClient", "chrono", "minimap", "minimapName", "hint", "quitGame", "stage", "performance", "stageMask"];
Dialog.init = function(){
	$gameDiv = $('#gameDiv');
	$topRight = $('#topRight');
	$topLeft = $('#topLeft');
	$bottomRight = $('#bottomRight');
	$bottomLeft = $('#bottomLeft');
			
	INIT = true;	//before .open()
	for(var i = 0 ; i < OPEN_ON_INIT.length; i++)
		Dialog.open(OPEN_ON_INIT[i]);
	LIST['context'].html.hide();
	LIST['optionList'].html.hide();
	
}

Dialog.isActive = function(name){
	return !!ACTIVE[name];
}

Dialog.isActiveBigWindow = function(){
	for(var i = 0 ; i < BIG_WINDOW.length; i++)
		if(Dialog.isActive(BIG_WINDOW[i]))
			return true;
	return false;
}

Dialog.isMouseOverDialog = Tk.newCacheManager(function(){	//BAD but working good
	var offX = $gameDiv[0].offsetLeft - window.pageXOffset;
	var offY = $gameDiv[0].offsetTop - window.pageYOffset;
	
	for(var i in ACTIVE){
		if(LEFT_CLICK_MOVE_EXCEPTION.$contains(i)) 
			continue;
		var html = LIST[i].isJDialog ? LIST[i].html.parent() : LIST[i].html;	//if Dialog, take whole jqueryui
		var rect = html[0].getBoundingClientRect();
		var rect2 = CST.rect(rect.left-offX,rect.top-offY,rect.width,rect.height);
		
		if(Collision.testMouseRect(null,rect2))
			return true;
	}
	return false;
	//document.querySelectorAll( ":hover" );
},250);

Dialog.isMouseOverInventory = Tk.newCacheManager(function(){
	var size = Dialog.getSizeBottomRight();
	var vx = isMoved.bottomRight ? size.width + CONFORT : 0;
	return Collision.testMouseRect(null,{
		x:CST.WIDTH-size.width-vx,
		width:size.width,
		y:CST.HEIGHT-size.height,
		height:size.height
	}); 
},500);

Dialog.isMouseOverChat = Tk.newCacheManager(function(){
	var size = Dialog.getSizeBottomLeft();
	var vy = isMoved.bottomLeft ? size.height + CONFORT : 0;
	return Collision.testMouseRect(null,{
		x:0,
		width:size.width,
		y:CST.HEIGHT-size.height-vy,
		height:size.height
	});
},500);

Dialog.isMouseOverChatOrPm = Tk.newCacheManager(function(){
	var size = Dialog.getSizeBottomLeft(true);
	var vy = isMoved.bottomLeft ? size.height + CONFORT : 0;
	return Collision.testMouseRect(null,{
		x:0,
		width:size.width,
		y:CST.HEIGHT-size.height-vy,
		height:size.height
	});
},500);

var OFFSET_CALL_COUNT = 0;
Dialog.onOffsetChange = function(x,y){	
	var w = CST.WIDTH2 - CONFORT;
	var h = CST.HEIGHT2 - CONFORT;
	
	var hasOffset = x !== 0 || y !== 0;
	
	if(OFFSET_CALL_COUNT++ % 10 !== 0)	//BAD but good for perf
		return;
	
	
	//topRight
	var size = Dialog.getSizeTopRight();
	if(hasOffset && x > w - size.width && y < -(h - size.height)){
		if(!isMoved.topRight)
			$topRight.animate({top:size.height + CONFORT});
		isMoved.topRight = true;
	} else {
		if(isMoved.topRight)
			$topRight.animate({top:0});
		isMoved.topRight = false;
	}
	//topLeft
	var size = Dialog.getSizeTopLeft();
	if(hasOffset && x < -(w-size.width) && y < -(h - size.height)){
		if(!isMoved.topLeft)
			$topLeft.animate({top:size.height + CONFORT});
		isMoved.topLeft = true;
	} else {
		if(isMoved.topLeft)
			$topLeft.animate({top:0});
		isMoved.topLeft = false;
	}
	
	//bottomLeft
	var size = Dialog.getSizeBottomLeft();
	if(hasOffset && x < -(w-size.width) && y > h - size.height){
		if(!isMoved.bottomLeft)
			$bottomLeft.animate({bottom:size.height + CONFORT});
		isMoved.bottomLeft = true;
	} else {
		if(isMoved.bottomLeft)
			$bottomLeft.animate({bottom:0});
		isMoved.bottomLeft = false;
	}
	//bottomRight
	var size = Dialog.getSizeBottomRight();
	if(hasOffset && x > w - size.width && y > h - size.height){
		if(!isMoved.bottomRight)
			$bottomRight.animate({right:size.width + CONFORT});
		isMoved.bottomRight = true;
	} else {
		if(isMoved.bottomRight)
			$bottomRight.animate({right:0});
		isMoved.bottomRight = false;
	}
}

Dialog.positionPopup = function(html){
	var vx = Tk.round(Math.randomML()*2,2);
	if(vx >= 0) vx = "+" + vx + "%"; 
	else vx = vx + "%";
	
	var vy1 = 10 + Tk.round(Math.randomML()*2,2);
	var vy2 = 30 + Tk.round(Math.randomML()*2,2);
	
	var at = CST.OFFSET.y < CST.HEIGHT/8 
		? "center" + vx + " center+" + vy1 + "%"
		: "center" + vx + " center-" + vy2 + "%"
	html.dialog({
		position: { my: "center top", at: at, of: window }
	});
}	
	
Dialog.closeBigWindow = function(){
	for(var i = 0 ; i < BIG_WINDOW.length; i++)
		Dialog.close(BIG_WINDOW[i]);
}

Dialog.displayEquipIfEquip = function(eid){
	if(Dialog.equipPopup.isItemEquip(eid))
		Dialog.open('equipPopup',Dialog.EquipPopup(eid,false));
}

	
Dialog.getFrequency = function(){
	return FREQUENCY;
}

})();