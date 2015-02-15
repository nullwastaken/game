//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Collision = require4('Collision');
var Dialog = exports.Dialog = {};
Dialog.create = function(id,title,size,refresh,variable,notDialog){
	var html = $('<div>')
		.attr('title',title||'')
		
	if(!notDialog)
		html.dialog({
			autoOpen: false,
			width:size.width, 
			height:size.height,
			close: function( event, ui ) {
				Dialog.close(id);
			},
		});
	
	LIST[id] = {
		html:html,
		parentDiv:'#gameDiv',
		refresh:refresh || Dialog.Refresh(),
		variable:variable || {},
		param:null,
		isDialog:!notDialog,
	}	
	if(id !== 'stage')
		html.css({zIndex:Dialog.ZINDEX.NORMAL});
	
	return html;
}
var LIST = Dialog.LIST = {};
var ACTIVE = Dialog.ACTIVE = {};
var FRAME_COUNT = 0;
var $gameDiv;	//init
var FREQUENCY = {};
var LEFT_CLICK_MOVE_EXCEPTION = ['stage','pm','chat'];


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

Dialog.open = function(name,param){
	FREQUENCY[name] = FREQUENCY[name] || 0;
	FREQUENCY[name]++;
	var dialog = LIST[name];
	dialog.param = param || null;
	dialog.html.html('');	//reset
	
	var ret = dialog.refresh.create(dialog.html,dialog.variable,dialog.param);
	
	if(ret === false) 
		return Dialog.close(name);
	if(ret === true)
		ret = Dialog.refresh(name,param);
	
	
	dialog.param = ret || dialog.param;
	
	dialog.refresh.oldValue = dialog.refresh.getOld(dialog.html,dialog.variable,dialog.param);
	
	if(dialog.isDialog){
		dialog.html.dialog('open');
		$('.toolTipDetails').remove();
	} else {
		$(dialog.parentDiv).append(dialog.html);
		if(ret !== null)
			dialog.html.show();
	}
	
	ACTIVE[name] = true;
}

Dialog.close = function(name){
	if(!ACTIVE[name]) return;
	var dialog = LIST[name];
	if(dialog.isDialog)
		dialog.html.dialog('close');
	else dialog.html.hide();
	dialog.refresh.close();
	delete ACTIVE[name];
}

Dialog.closeAll = function(){
	var alreadyAllClosed = true;
	for(var i in LIST){
		if(LIST[i].isDialog){
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


Dialog.refresh = function(name,param){
	var dia = LIST[name];
	if(dia.refresh.create === dia.refresh.update)
		Dialog.open(name,param);
	else {
		var ret = dia.refresh.update(dia.html,dia.variable,param);
		if(ret === false)
			Dialog.close(name);
		if(ret === true)
			Dialog.open(name,param);
		return ret;
	}
}

Dialog.get = function(name){
	return LIST[name].html;
}

Dialog.init = function(){
	$gameDiv = $('#gameDiv');
	for(var i in LIST){
		if(!LIST[i].isDialog)
			Dialog.open(i);
	}
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
/*
Dialog.isMouseOverOptionList = function(){	//BAD but working good
	var offX = $gameDiv[0].offsetLeft - window.pageXOffset;
	var offY = $gameDiv[0].offsetTop - window.pageYOffset;
	
	for(var i in ACTIVE){
		if(!LIST[i].isDialog) continue;
		var html = LIST[i].html.parent();
		var rect = html[0].getBoundingClientRect();
		var rect2 = {width:rect.width,height:rect.height,x:rect.left-offX,y:rect.top-offY};
		
		if(Collision.testMouseRect(key,rect2))
			return true;		
	}
	return false;
	//document.querySelectorAll( ":hover" );
}
*/
Dialog.isMouseOverDialog = function(){	//BAD but working good
	var offX = $gameDiv[0].offsetLeft - window.pageXOffset;
	var offY = $gameDiv[0].offsetTop - window.pageYOffset;
	
	for(var i in ACTIVE){
		if(LEFT_CLICK_MOVE_EXCEPTION.$contains(i)) 
			continue;
		var html = LIST[i].isDialog ? LIST[i].html.parent() : LIST[i].html;	//if Dialog, take whole jqueryui
		var rect = html[0].getBoundingClientRect();
		var rect2 = {width:rect.width,height:rect.height,x:rect.left-offX,y:rect.top-offY};
		
		if(Collision.testMouseRect(key,rect2)){
			return true;
		}
	}
	return false;
	//document.querySelectorAll( ":hover" );
}

Dialog.ZINDEX = {
	LOW:0,
	NORMAL:10,
	jqueryDialog:50,	//Check css.css		.ui-dialog { z-index: 50 !important ;}
	HIGH:100,
}


})();