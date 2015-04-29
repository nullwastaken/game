//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Collision = require4('Collision'), Command = require4('Command');
var Dialog = exports.Dialog = {};

Dialog.create = function(id,title,size,refresh,variable,notJDialog){
	var html = $('<div>')
		.attr('title',title||'')
		
	if(!notJDialog){
		html.dialog({
			autoOpen: false,
			width:size.width, 
			height:size.height,
			open:function(){
				html.find('*').blur();	//hax
			},
			close: function() {
				Dialog.close(id);
				$('button').blur();	//hax
			},
		});
	}
	
	LIST[id] = {
		html:html,
		parentDiv:'#gameDiv',
		refresh:refresh || Dialog.Refresh(),
		wasCreated:false,
		variable:variable || {},
		param:null,
		isJDialog:!notJDialog,	//jqueryui
	}	
	if(id !== 'stage' || id !== 'stageMask')	//BAD
		html.css({zIndex:Dialog.ZINDEX.NORMAL});
	
	return html;
}
var LIST = Dialog.LIST = {};
var ACTIVE = Dialog.ACTIVE = {};
var FRAME_COUNT = 0;
var $gameDiv;	//init
var FREQUENCY = {};
var LEFT_CLICK_MOVE_EXCEPTION = ['stage','stageMask','pm','chat','context'];

Dialog.setParent = function(id,parentDiv){
	LIST[id].parentDiv = parentDiv;
}	
Dialog.Size = function(width,height){
	return {
		width:width || 600,
		height:height || 400,
	}
}	

Dialog.Refresh = function(create,getOld,interval,update,loop,close){
	return {
		create:create,	//if return value, it will become dialog.param
		getOld:getOld || CST.func,
		interval:interval || 10,
		update: update || create,
		oldValue:undefined,
		loop:loop || CST.func,
		close:close || CST.func
	}
}

Dialog.getFrequency = function(){
	return FREQUENCY;
}

var EXE_COMMAND_FOR = ['questList','achievement'];
Dialog.open = Dialog.refresh = function(name,param,forceCreate){
	FREQUENCY[name] = FREQUENCY[name] || 0;
	FREQUENCY[name]++;
	var dia = LIST[name];
	dia.param = param || null;
	
	var ret;	//true = call update/create, false = close, null = not show (for context)
	if(forceCreate !== false && (forceCreate || !dia.wasCreated || dia.refresh.create === dia.refresh.update)){
		dia.wasCreated = true;
		dia.html.html('');	//reset
		ret = dia.refresh.create(dia.html,dia.variable,dia.param);
		if(ret === true)
			Dialog.open(name,param,false);
	} else { //custom update
		ret = dia.refresh.update(dia.html,dia.variable,dia.param);
		if(ret === true)
			Dialog.open(name,param,true);	//call .create
	}
	if(ret === false) 
		return Dialog.close(name);
		
	dia.param = ret || dia.param;
	dia.refresh.oldValue = dia.refresh.getOld(dia.html,dia.variable,dia.param);
	
	if(dia.isJDialog){
		dia.html.dialog('open');
		$('.toolTipDetails').remove();
	} else {
		$(dia.parentDiv).append(dia.html);
		if(ret !== null)	//important for reputation and others
			dia.html.show();
	}
	
	ACTIVE[name] = true;
	
	if(main.questActive === 'Qtutorial' && EXE_COMMAND_FOR.$contains(name)){	//to call dialogOpen quest event
		Command.execute('dialogOpen',[name]);
	}
}

Dialog.quickContextRefresh = function(text){
	var dia = LIST['context'];
	dia.refresh.update(dia.html,dia.variable,text);
}

Dialog.close = function(name){
	if(!ACTIVE[name]) return;
	var dialog = LIST[name];
	if(dialog.isJDialog)
		dialog.html.dialog('close');
	else dialog.html.hide();
	dialog.refresh.close();
	delete ACTIVE[name];
}

Dialog.closeAll = function(){
	var alreadyAllClosed = true;
	for(var i in LIST){
		if(LIST[i].isJDialog){
			if(ACTIVE[i]){
				alreadyAllClosed = false;
				Dialog.close(i);
			}
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
		
	if(FRAME_COUNT % dialog.refresh.interval !== 0) return;
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

Dialog.init = function(){
	$gameDiv = $('#gameDiv');
	for(var i in LIST){
		if(!LIST[i].isJDialog)
			Dialog.open(i);
	}
	LIST['context'].html.hide();
}

Dialog.isActive = function(name){
	return !!ACTIVE[name];
}

Dialog.UI = function(id,css,refresh,variable){
	var myDialog = Dialog.create(id,'',null,refresh,variable,true);

	css = css || {};
	css.zIndex = css.zIndex === undefined ? Dialog.ZINDEX.NORMAL : css.zIndex;
	myDialog.css(css || {});
	return myDialog;
}

Dialog.isMouseOverDialog = function(){	//BAD but working good
	var offX = $gameDiv[0].offsetLeft - window.pageXOffset;
	var offY = $gameDiv[0].offsetTop - window.pageYOffset;
	
	for(var i in ACTIVE){
		if(LEFT_CLICK_MOVE_EXCEPTION.$contains(i)) 
			continue;
		var html = LIST[i].isJDialog ? LIST[i].html.parent() : LIST[i].html;	//if Dialog, take whole jqueryui
		var rect = html[0].getBoundingClientRect();
		var rect2 = {width:rect.width,height:rect.height,x:rect.left-offX,y:rect.top-offY};
		
		if(Collision.testMouseRect(null,rect2)){
			return true;
		}
	}
	return false;
	//document.querySelectorAll( ":hover" );
}

Dialog.ZINDEX = {};
Dialog.ZINDEX.LOW = 0;
Dialog.ZINDEX.NORMAL = 10;
Dialog.ZINDEX.jqueryDialog = 50;	//Check game.css		.ui-dialog { z-index: 50 !important ;}
Dialog.ZINDEX.HIGH = 100;



})();