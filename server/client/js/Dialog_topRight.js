
"use strict";
(function(){ //}
var Main, SideQuest, Message, QueryDb, MapModel, Actor, Img, Command, Pref;
global.onReady(function(){
	Pref = rootRequire('client','Pref',true); Main = rootRequire('shared','Main',true); SideQuest = rootRequire('shared','SideQuest',true); Message = rootRequire('shared','Message',true); QueryDb = rootRequire('shared','QueryDb',true); MapModel = rootRequire('server','MapModel',true); Actor = rootRequire('shared','Actor',true); Img = rootRequire('client','Img',true); Command = rootRequire('shared','Command',true);
});
var Dialog = rootRequire('client','Dialog');


var getWidthMap = function(){
	return CST.WIDTH/Main.getPref(w.main,'mapRatio');
}
var getHeightMap = function(){
	return CST.HEIGHT/Main.getPref(w.main,'mapRatio');
}
var getMinimapNameHeight = function(){
	return w.main.hudState.minimapName === Main.hudState.INVISIBLE ? 0 : 25;
}


Dialog.getSizeTopRight = Tk.newCacheManager(function(){
	return {
		width:getWidthMap(),
		height:getHeightMap(),
	}	
},500);
	
Dialog.UI('minimap','topRight',{
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

	var canvas = Tk.createSharpCanvas(w,h)
		.css({
			top:0,
			border:'4px solid #000000',
			background:'rgba(0,0,0,1)',
		})
		.attr({
			id:'minimapCanvas'
		});
	html.append(canvas);
	variable.ctx = canvas[0].getContext('2d');
},function(){
	return "" + Main.getPref(w.main,'mapRatio') + CST.WIDTH + CST.HEIGHT;
},5,null,function(html,variable){	//loop
	if(w.main.hudState.minimap === Main.hudState.INVISIBLE){
		if(variable.visible !== false){
			variable.visible = false;
			html.hide();
		}
	} else {
		if(variable.visible !== true){
			variable.visible = true;
			html.show();
		}
		Dialog.UI.minimap(variable.ctx);
	}
}));

var ZOOM = 16;	//difference in size between real image and minimap image, idk if x2 factor applies,,,?
Dialog.UI.minimap = function (ctx){
	ctx.clearRect(0, 0, CST.WIDTH, CST.HEIGHT);
	Dialog.UI.minimap.map(ctx);
	Dialog.UI.minimap.icon(ctx);
}

Dialog.UI.minimap.map = function(ctx){
	var x = -w.player.x/ZOOM + CST.WIDTH2/Main.getPref(w.main,'mapRatio');	
	var y = -w.player.y/ZOOM + CST.HEIGHT2/Main.getPref(w.main,'mapRatio');	
	var img = MapModel.getMinimapImg(MapModel.getCurrent());
	if(img)
		ctx.drawImage(img,x,y);
}

Dialog.UI.minimap.icon = function(ctx){
	var width = getWidthMap();
	var height = getHeightMap();
	var cx = width/2-2;
	var cy = height/2-2;
	
	//normal icons
	
	
	var list = Actor.drawAll.getMinimapList();
	for(var i = 0 ; i < list.length; i++){
		if(w.main.questActive && list[i].icon === CST.ICON.quest) 
			continue;
		
		var numX = cx+list[i].vx/ZOOM;
		var numY = cy+list[i].vy/ZOOM;
		
		var size = list[i].size;
		Img.drawIcon(ctx,list[i].icon,size,numX-size/2,numY-size/2);
	}
	
	//quest marker
	var qm = Actor.getQuestMarkerMinimap(w.player);
	for(var i in qm){
		var numX = Math.min(Math.max(cx+qm[i].vx/ZOOM,4),width-4);
		var numY = Math.min(Math.max(cy+qm[i].vy/ZOOM,4),height-4);
		
		if(numX >= width-16 && numY < 16){ //top right
			if(numX >= width-16)
				numX = width-16;
			if(numY < 16)
				numY = 16;
		}
			
		if(numX >= width-10)
			numX = width-10;
		if(numX < 10)
			numX = 10;
		if(numY >= height-10)
			numY = height-10;
		if(numY < 10)
			numY = 10;
				
		var size = qm[i].size;
		Img.drawIcon(ctx,qm[i].icon,size,numX-size/2,numY-size/2);
	}
	
	//player icon	
	ctx.fillStyle = 'black';
	ctx.fillRect(width/2-4,height/2-4,8,8);
	ctx.fillStyle = 'white';
	ctx.fillRect(width/2-3,height/2-3,6,6);
}

//#####################

Dialog.UI('minimapName','topRight',{
	position:'absolute',
	height:20,
	fontSize:'0.9em',
	color:'white',
	backgroundColor:"rgba(0,0,0,0.5)",
	border:"2px solid black",
	whiteSpace:'nowrap',
},Dialog.Refresh(function(html){
	if(w.main.hudState.minimapName === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	html.addClass('shadow15');
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
			Dialog.playSfx('select');
			var val = Main.getPref(w.main,'mapRatio') - 1;
			Pref.set('mapRatio',val);
		})
	);
	html.append($('<span>')
		.html(' - ')
		.css({cursor:'pointer'})
		.attr('title','Minimize')
		.click(function(){
			Dialog.playSfx('select');
			var val = Main.getPref(w.main,'mapRatio') + 1;
			Pref.set('mapRatio',val);
		})
	);	
	var map = MapModel.getCurrent();
	var name = map.name + (map.lvl !== 0 ? ' Lv ' + map.lvl : '');
	html.append(name);	
},function(){
	return '' + Main.getPref(w.main,'mapRatio') + MapModel.getCurrent().name + w.main.hudState.minimapName + CST.WIDTH + CST.HEIGHT;
},3));

Dialog.UI('hint','topRight',{
	position:'absolute',
	color:'white',
	fontSize:'1.2em',
},Dialog.Refresh(function(html){
	if(w.main.hudState.questHint === Main.hudState.INVISIBLE) 
		return;
	
	html.html('');
	if(!w.main.questActive && !w.main.sideQuestHint)
		return;
	
	html.css({
		right:0,
		top:getHeightMap() + getMinimapNameHeight() + (CST.HEIGHT < 650 ? 20 : 50),
		width:'200px',
	});
	
	var hintDiv = $('<div>')
		.addClass('shadow15');
	html.append(hintDiv);
	
	//quest
	if(w.main.questActive){
		var questName = QueryDb.getQuestName(w.main.questActive);
		
		var abandon = w.main.questActive === 'Qtutorial' ? '' : $('<div>')
			.attr('title','Abandon quest.')
			.css({cursor:'pointer',display:'inline-block',paddingLeft:'4px',paddingRight:'4px',border:'1px solid orange'})
			.html('X')
			.click(function(){
				Main.askQuestion(w.main,function(key){	
					Command.execute(CST.COMMAND.questAbandon,[w.main.questActive]);
				},'Abandon the quest?','boolean');
			});
		
		hintDiv.append($('<div>')
			.append(abandon,' ',questName,'<br>')
			.css({fontSize:'1.2em',color:'orange',whiteSpace:'nowrap'})
		);
		hintDiv.append($('<div>')
			.html(Message.receive.parseInput(w.main.questHint))
			.css({marginLeft:'10px'})
		);
	}
	if(w.main.sideQuestHint){
		if(w.main.questActive){
			hintDiv.css({fontSize:'0.9em'})
				.append('<br>');
		}
		
		var sqName = SideQuest.get(w.main.sideQuestHint.model).name;
		hintDiv.append($('<div>')
			.html(sqName + '<br>')
			.css({fontSize:'1.2em',color:'orange'})
		);
		hintDiv.append($('<div>')
			.html(Message.receive.parseInput(w.main.sideQuestHint.hint))
			.css({marginLeft:'10px'})
		);
	
	}
	Main.hudState.applyHudState('questHint',hintDiv);
	
},function(){
	return '' + Main.getPref(w.main,'mapRatio') + w.main.questActive + JSON.stringify(w.main.sideQuestHint) + w.main.questHint + w.main.hudState.questHint + w.main.hudState.minimapName + CST.WIDTH + CST.HEIGHT;
},3));


/*
exports.Dialog.open('hintMouseOver',{
	mouseover:'<img src="/img/tutorial/hint.png" width="150px"><br><div>Hello!</div>',
	normal:'<img src="/img/tutorial/hint.png" width="300px">'
});
*/
/*
Dialog.UI('hintMouseOver','topRight',{
	position:'absolute',
	color:'white',
	textShadow:'1px 1px 0 #000'
},Dialog.Refresh(function(html,variable,param){
	if(!param) 
		return false;
	
	html.css({
		right:0,
		top:getHeightMap() + getMinimapNameHeight() + 100,	//100 for hint, bad...
		width:getWidthMap(),
	});
	var mouseover = $('<div>')
		.css({border:'2px solid black',padding:'4px'})
		.html(param.mouseover)
		.hover(function(){
			html.html(mouseover);
		},function(){
			html.html(normal);
		});
		
	var normal = $('<div>')
		.css({border:'2px solid black'})
		.html(param.normal)
		.hover(function(){
			html.html(mouseover);
		},function(){
			html.html(normal);
		});
	
	html.html(normal);
	
},function(){
	return '' + Main.getPref(w.main,'mapRatio') + w.main.questHint + w.main.hudState.minimapName + CST.WIDTH + CST.HEIGHT;
},3));
*/
Dialog.UI('quitGame',null,{
	position:'absolute',
	top:2,
	right:2,
},Dialog.Refresh(function(html){
	var el = Img.drawIcon.html('system-close',18,"Shift-Left click to safely leave the game.",1)
		.css({cursor:'pointer'})
		.click(function(e){
			if(e.shiftKey)
				Command.execute(CST.COMMAND.signOff);
		});
	html.append(el);
	
},null,10000));
	

})();



	



















