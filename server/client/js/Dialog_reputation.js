
"use strict";
(function(){ //}
var Actor, Command, Main, ReputationGrid, Stat, Img, ReputationConverter;
global.onReady(function(){
	Actor = rootRequire('shared','Actor',true); Command = rootRequire('shared','Command',true); Main = rootRequire('shared','Main',true); ReputationGrid = rootRequire('shared','ReputationGrid',true); Stat = rootRequire('shared','Stat',true); Img = rootRequire('client','Img',true); ReputationConverter = rootRequire('shared','ReputationConverter',true);
});
var Dialog = rootRequire('client','Dialog');

var FIRST_LEVEL_CONVERTER = 3;
Dialog.create('reputation','Reputation Reward',Dialog.Size('auto','auto'),Dialog.Refresh(function(){
	Dialog.reputation.apply(this,arguments);
},function(){
	return Tk.stringify(w.main.reputation);
}));
var GRID = null;
var CANVAS_LIST = [];

//Dialog.open('reputation')
Dialog.reputation = function (html){
	var top = Dialog.reputation.top();
	GRID = Dialog.reputation.grid();
	
	html.append($('<div>')
		.append(top,GRID)
		.css({float:'left'})
	);
	
	if(Actor.getLevel(w.player) >= FIRST_LEVEL_CONVERTER){
		var conv = Dialog.reputation.converter().css({marginLeft:'5px',float:'right'});
		html.append(conv);
	}
}

Dialog.reputation.converterPreview = function(id,mouseout){
	return function(){
		GRID.html('');
		if(!mouseout)
			GRID.append(Dialog.reputation.grid([id]));
		else
			GRID.append(Dialog.reputation.grid());
	}
}

Dialog.reputation.top = function(){
	var usablePt = w.main.reputation.usablePt.r(2);
	var usedPt = w.main.reputation.list[w.main.reputation.activeGrid].usedPt;	//bad
	var unusedPt = (usablePt-usedPt).r(0);
	//var removePt = w.main.reputation.removePt.r(1);
	
	var el = $('<div>');
	el.append($('<span>')
		.attr('title','Currently using ' + usedPt + ' out of ' + usablePt + ' Points. Level-Up to get more points.')
		.css({fontSize:'22px'})
		.html('Points Available: ' + unusedPt)
	);
	/*
	el.append($('<span>')
		.attr('title','Used to remove a boost. Orbs of Removal grant additional Remove Points.')
		.html(' - Remove Pts: ' + removePt)
	);
	*/
	el.append($('<span>')
		.html(' &nbsp;&nbsp;Your Lvl: ' + Actor.getLevel(w.player))
	);	
	el.append($('<button>')
		.addClass('myButtonRed skinny')
		.css({margin:'10px 15px',padding:'2px 10px',position:'absolute',top:'-5px'})
		.html('Remove All')
		.attr('title','Remove all selected boosts')
		.click(function(){
			Dialog.playSfx('select');
			Command.execute(CST.COMMAND.reputationClear,[w.main.reputation.activeGrid]);
		})	
	);
	
	
	
	return el;
}

Dialog.reputation.grid = function(extraConv){
	var iconSize = 24;
	var border = iconSize/3;
	var border2 = border/2;
	var ic = iconSize + border;
	
	var el = $('<div>')
		.css({
			lineHeight:iconSize/2 + 'px',
		});
	
	
	//Draw Stat	
	var gridBase = ReputationGrid.getConverted(w.main,extraConv).base;
	CANVAS_LIST = [];
	
	var array = [];
	
	var helper = function(statId){
		return function(){
			Dialog.playSfx('mouseover');
			for(var i = 0; i < CANVAS_LIST.length; i++){
				if(CANVAS_LIST[i].stat.id === statId)
					CANVAS_LIST[i].canvas.css({border:'4px solid black',width:ic,height:ic});
				else 
					CANVAS_LIST[i].canvas.css({border:'',width:ic,height:ic});
			}
		}
	}

	
	var canvasClick = function(i,j){
		return function(){
			Command.execute(CST.COMMAND.reputationAdd ,[w.main.reputation.activeGrid,i,j]);
		};
	}
	var canvasContextMenu = function(i,j){
		return function(){
			Command.execute(CST.COMMAND.reputationRemove,[w.main.reputation.activeGrid,i,j]);
		};
	}	
	var grid = Main.reputation.getGrid(w.main);
	for(var i = 0 ; i < grid.length ; i++){
		array.push([]);
		for(var j = 0 ; j < grid[i].length ; j++){
			var base = gridBase[i][j];
			var canvas = $('<canvas>').attr({height:ic,width:ic}).css({cursor:'pointer'});
			var ctx = canvas[0].getContext('2d');
			
			var value = Main.reputation.getValue(grid,i,j);
			//Freebies
			if(value === ReputationGrid.FREEBY){
				ctx.fillStyle = 'green';
				ctx.fillRect(0,0,ic,ic);
				array[i][j] = canvas;
				continue;
			}
			
			//tutorial
			if(!Main.quest.haveCompletedTutorial(w.main)){
				if(i <= 2 || i >= grid.length - 3 || j <= 2 || j >= grid[i].length - 3){
					canvas.css({visibility:'hidden'});
				}
			}
			
			var haveIt = value === ReputationGrid.HAVE;
			
			//Border
			var canSelect = Main.reputation.testAdd(grid,i,j);
			ctx.fillStyle = haveIt ? 'green' : (canSelect ? '#FFFF00': 'red');
			ctx.fillRect(0,0,ic,ic);
			
			//Boost
			canvas.click(canvasClick(i,j));
			canvas.bind('contextmenu',canvasContextMenu(i,j));
			
			canvas.mouseover(helper(base.stat));
			
			//#####################
			var stat = Stat.get(base.stat);
			if(!stat) ERROR(3,'no stat',base.stat,base,i,j);
			if(haveIt){
				var str = 'Right Click: Remove ' + stat.name
						+ '<br>' + stat.description;
				//canvas.attr('title',str);
				canvas.tooltip(Tk.getTooltipOptions({
					content:str
				}))
			} else {
				var header = canSelect ? 'Left Click: ' : 'LOCKED: ';
				if(stat.custom) 
					canvas.attr('title',header + stat.description);
				else {
					var str = header + 'Boost ' + stat.name + ' by +' + Tk.round(base.value*100,1) + '%'
						+ '<br>' + stat.description;
					//canvas.attr('title',str);
					canvas.tooltip(Tk.getTooltipOptions({
						content:str
					}))
				}
			}
		
				
			
			if(stat.custom){
				Img.drawIcon(ctx,stat.icon,iconSize,border2,border2);
				ctx.strokeStyle = haveIt ? 'white' : 'blue';
				ctx.lineWidth = 2;
				ctx.strokeRect(border2-2,border2-2,iconSize+4,iconSize+4);
			} else {
				ctx.globalAlpha = haveIt ? 1 : 0.5;
				Img.drawIcon(ctx,stat.icon,iconSize,border2,border2);
			}	
			
			array[i][j] = canvas;
			CANVAS_LIST.push({
				canvas:canvas,
				stat:stat
			});

			
		}
	}
	el.append(Tk.arrayToTable(array,false,false,false,'0px')
		.css({border:'2px solid black'})
	);
	el.append('<br>')

	return el;
}

Dialog.reputation.converter = function(){
	var div = $('<div>');
	div.append($('<h2>')
		.html('Converter')
		.css({textDecoration:'underline'})
	);
	
	var groupList = ReputationConverter.getGroup();
	
	var buttonClick = function(conv,isSelected){
		return function(){
			if(isSelected)
				Command.execute(CST.COMMAND.reputationConverterRemove,[w.main.reputation.activeGrid,conv.id]);
			else
				Command.execute(CST.COMMAND.reputationConverterAdd,[w.main.reputation.activeGrid,conv.id]);
		}
	}
	
	for(var i in groupList){
		var g = groupList[i];
		var el = $('<div>');
		el.append('<h3>Level ' + g.lvl + ':</h3>');
		for(var j in g.list){
			var conv = ReputationConverter.get(g.list[j]);
			if(!conv)
				ERROR(3,'no conv',g.list[j]);
			var isSelected = Main.reputation.get(w.main).converter.$contains(conv.id);
			var button = conv.getButtonAppend()
				.attr('title',conv.description)
				.click(buttonClick(conv,isSelected))
				
			if(isSelected)
				button.css({border:'4px solid red'});
			else {
				button.hover(
					Dialog.reputation.converterPreview(conv.id,false),
					Dialog.reputation.converterPreview(conv.id,true)
				);
			}
			el.append(button);
		}
		div.append(el);
	}
	return div;
}	

})();

