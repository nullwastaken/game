//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require4('Main'), MapModel = require4('MapModel'), Actor = require4('Actor'), Img = require4('Img'), Collision = require4('Collision'), Command = require4('Command');
var Dialog = require3('Dialog');

var getWidthMap = function(){
	return CST.WIDTH/Main.getPref(main,'mapRatio');
}
var getHeightMap = function(){
	return CST.HEIGHT/Main.getPref(main,'mapRatio');
}

Dialog.UI('minimap',{
	position:'absolute',
	top:0,
},Dialog.Refresh(function(html,variable){
	var w = getWidthMap();
	var h = getHeightMap();
	html.css({
		right:0,
		width:w,
		height:h
	});

	var canvas = $('<canvas>')
		.css({
			top:0,
			width:w,
			height:h,
			border:'4px solid #000000',
			background:'rgba(0,0,0,1)',
		})
		.attr({
			width:w,
			height:h,
			id:'minimapCanvas'
		});
	html.append(canvas);
	variable.ctx = canvas[0].getContext('2d');
},function(){
	return "" + Main.getPref(main,'mapRatio') + CST.WIDTH + CST.HEIGHT;
},3,null,function(html,variable){	//loop
	if(main.hudState.minimap === Main.hudState.INVISIBLE){
		html.hide();
	} else {
		html.show();
		Dialog.UI.minimap(variable.ctx);
	}
}));


Dialog.UI.minimap = function (ctx){
	ctx.clearRect(0, 0, CST.WIDTH, CST.HEIGHT);
	Dialog.UI.minimap.map(ctx);
	Dialog.UI.minimap.icon(ctx);
}
Dialog.UI.minimap.ZOOM = 16;	//difference in size between real image and minimap image, idk if x2 factor applies,,,?

Dialog.UI.minimap.map = function(ctx){
	var x = -player.x/Dialog.UI.minimap.ZOOM + CST.WIDTH2/Main.getPref(main,'mapRatio');	
	var y = -player.y/Dialog.UI.minimap.ZOOM + CST.HEIGHT2/Main.getPref(main,'mapRatio');	
	ctx.drawImage(MapModel.getCurrent().img.m, x,y);
}

Dialog.UI.minimap.icon = function(ctx){
	var cx = getWidthMap()/2-2;
	var cy = getHeightMap()/2-2;
	
	//normal icons
	
	
	var list = Actor.drawAll.getMinimapList();
	for(var i = 0 ; i < list.length; i++){
		if(main.questActive && list[i].icon === 'minimapIcon-quest') continue;
		
		var numX = cx+list[i].vx/Dialog.UI.minimap.ZOOM;
		var numY = cy+list[i].vy/Dialog.UI.minimap.ZOOM;
		
		var size = list[i].size;
		Img.drawIcon(ctx,list[i].icon,size,numX-size/2,numY-size/2);
	}
	
	//quest marker
	var qm = Actor.getQuestMarkerMinimap(player);
	for(var i in qm){
		var numX = (cx+qm[i].vx/Dialog.UI.minimap.ZOOM).mm(4,getWidthMap()-4);
		var numY = (cy+qm[i].vy/Dialog.UI.minimap.ZOOM).mm(4,getHeightMap()-4);
		if(numY < 15 && numX >= getWidthMap()-15){	//top right
			numY = 15;
			numX = getWidthMap()-15;
		}
		
		var size = qm[i].size;
		Img.drawIcon(ctx,qm[i].icon,size,numX-size/2,numY-size/2);
	}
	
	
	ctx.fillRect(getWidthMap()/2-2,getHeightMap()/2-2,4,4);	//player icon
}

Dialog.UI.minimap.isMouseOver = function(){
	return Collision.testMouseRect(null,{
		x:CST.WIDTH-getWidthMap(),
		width:getWidthMap(),
		y:0,
		height:getHeightMap(),
	});
}

//#####################

Dialog.UI('minimapBelow',{
	position:'absolute',
	height:25,
	font:'1.2em Kelly Slab',
	color:'white',
	backgroundColor:"rgba(0,0,0,0.5)",
	border:"2px solid black",
	whiteSpace:'nowrap',
},Dialog.Refresh(function(html){
	if(main.hudState.minimap === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	html.css({
		right:0,
		top:getHeightMap(),
		width:getWidthMap(),
	});


	html.append($('<span>')
		.html(' + ')
		.css({cursor:'pointer'})
		.attr('title','Enlarge')
		.click(function(){
			Command.execute('pref',['mapRatio',(Main.getPref(main,'mapRatio') - 1)]);
		})
	);
	html.append($('<span>')
		.html(' - ')
		.css({cursor:'pointer'})
		.attr('title','Minimize')
		.click(function(){
			Command.execute('pref',['mapRatio',(Main.getPref(main,'mapRatio') + 1)]);
		})
	);	
	
	html.append(MapModel.getCurrent().name);	
},function(){
	return '' + Main.getPref(main,'mapRatio') + MapModel.getCurrent().name + main.hudState.minimap + CST.WIDTH + CST.HEIGHT;
},3));

Dialog.UI('hint',{
	position:'absolute',
	height:25,
	color:'white',
	textShadow:'1px 1px 0 #000'
},Dialog.Refresh(function(html){
	if(main.hudState.minimap === Main.hudState.INVISIBLE) return;
	
	html.css({
		right:0,
		top:getHeightMap() + 25,
		width:getWidthMap(),
	});
	var hint = $('<div>')
		.css({
			font:'1.2em Kelly Slab',
			color:'white',
		})
		.attr('id','hintDiv')
		.html(main.questHint);
	Main.hudState.applyHudState('questHint',hint);
	
	html.append(hint);
	
},function(){
	return '' + Main.getPref(main,'mapRatio') + main.questHint + main.hudState.minimap + main.hudState.questHint + CST.WIDTH + CST.HEIGHT;
},3));


Dialog.UI('quitGame',{
	position:'absolute',
	top:0,
	right:0,
	zIndex:Dialog.ZINDEX.HIGH,
},Dialog.Refresh(function(html){
	var el = Img.drawIcon.html('system-close',18,"Shift-Left Click to safely leave the game.",1);
	el.click(function(e){
		if(e.shiftKey)
			Command.execute('logout');
	});
	html.append(el);
	
},null,10000));
	
	
})();



	



















