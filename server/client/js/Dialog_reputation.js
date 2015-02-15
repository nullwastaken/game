//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require4('Actor'), Command = require4('Command'), Main = require4('Main'), ReputationGrid = require4('ReputationGrid'), Stat = require4('Stat'), Img = require4('Img'), ReputationConverter = require4('ReputationConverter');
var Dialog = require3('Dialog');

Dialog.create('reputation','Reputation Reward',Dialog.Size(800,600),Dialog.Refresh(function(){
	Dialog.reputation.apply(this,arguments);
},function(){
	return Tk.stringify(main.reputation);
}));
var GRID = null;
var CANVAS_LIST = [];

//Dialog.open('reputation')
Dialog.reputation = function (html){
	var top = Dialog.reputation.top();
	GRID = Dialog.reputation.grid();
	var conv = Dialog.reputation.converter();
	
	html.append($('<div>')
		.append(top,GRID)
		.css({float:'left'})
	);
	html.append(conv.css({float:'right'}));
	
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
	var usablePt = main.reputation.usablePt.r(2);
	var usedPt = main.reputation.list[main.reputation.activeGrid].usedPt;	//bad
	var unusedPt = (usablePt-usedPt).r(0);
	//var removePt = main.reputation.removePt.r(1);
	
	var el = $('<div>');
	el.append($('<span>')
		.attr('title',unusedPt + ' Available Point(s). Level-Up to get more points.')
		.css({fontSize:'30px'})
		.html('Points: ' + usedPt + '/' + usablePt)
	);
	/*
	el.append($('<span>')
		.attr('title','Used to remove a boost. Orbs of Removal grant additional Remove Points.')
		.html(' - Remove Pts: ' + removePt)
	);
	*/
	el.append($('<span>')
		.html(' - Your Lvl: ' + Actor.getLevel(player))
	);	
	el.append($('<button>')
		.addClass('myButtonRed')
		.css({margin:'10px 15px',position:'absolute',top:'-5px'})
		.html('Clear Grid')
		.attr('title','Remove all selected boosts')
		.click(function(){
			Command.execute('win,reputation,clear',[main.reputation.activeGrid]);
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
	
	var grid = Main.reputation.getGrid(main);
	
	//Draw Stat	
	var gridBase = ReputationGrid.getConverted(main,extraConv).base;
	CANVAS_LIST = [];
	
	var array = [];
	
	var helper = function(statId){
		return function(){
			for(var i = 0; i < CANVAS_LIST.length; i++){
				if(showSameCheckbox.prop('checked') && CANVAS_LIST[i].stat.id === statId)
					CANVAS_LIST[i].canvas.css({border:'4px solid black',width:ic,height:ic});
				else 
					CANVAS_LIST[i].canvas.css({border:'',width:ic,height:ic});
			}
		}
	}

	for(var i = 0 ; i < grid.length ; i++){
		array.push([]);
		for(var j = 0 ; j < grid[i].length ; j++){
			var base = gridBase[i][j];
			var canvas = $('<canvas>').attr({height:ic,width:ic});
			var ctx = canvas[0].getContext('2d');
			
			var value = Main.reputation.getValue(grid,i,j);
			//Freebies
			if(value === ReputationGrid.FREEBY){	//TOFIX should only be ===2
				ctx.fillStyle = 'green';
				ctx.fillRect(0,0,ic,ic);
				array[i][j] = canvas;
				continue;
			}
			var haveIt = value === ReputationGrid.HAVE;
			
			//Border
			var canSelect = Main.reputation.testAdd(grid,i,j);
			ctx.fillStyle = haveIt ? 'green' : (canSelect ? '#FFFF00': 'red');
			ctx.fillRect(0,0,ic,ic);
			
			//Boost
			canvas.click((function(i,j){
				return function(){
					Command.execute('win,reputation,add' ,[main.reputation.activeGrid,i,j]);
				};
			})(i,j));
			canvas.bind('contextmenu',(function(i,j){
				return function(){
					Command.execute('win,reputation,remove',[main.reputation.activeGrid,i,j]);
				};
			})(i,j));
			
			canvas.hover(helper(base.stat),function(){});
			
			//#####################
			var stat = Stat.get(base.stat);
			if(haveIt) 
				canvas.attr('title','Right Click: Remove ' + stat.name);
			else {
				var header = canSelect ? 'Left Click: ' : 'LOCKED: ';
				if(stat.custom) 
					canvas.attr('title',header + stat.description);
				else 
					canvas.attr('title',header + 'Boost ' + stat.name + ' by +' + Tk.round(base.value*100,1) + '%');
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
	el.append(Tk.arrayToTable(array,false,false,false,'0px'));
	el.append('<br>')
	var showSameCheckbox = $('<input>')
		.attr('type','checkbox')
		.prop('checked',true)
		.change(helper(''));
	el.append(showSameCheckbox);
	el.append('Highlight Same Node');
	return el;
}





Dialog.reputation.converter = function(){
	var div = $('<div>');
	div.append($('<h2>')
		.html('Converter')
		.css({textDecoration:'underline'})
	);
	
	var groupList = ReputationConverter.getGroup();
	for(var i in groupList){
		var g = groupList[i];
		var el = $('<div>');
		el.append('<h3>Level ' + g.lvl + ':</h3>');
		for(var j in g.list){
			var conv = ReputationConverter.get(g.list[j]);
			var isSelected = Main.reputation.get(main).converter.$contains(conv.id);
			var button = conv.getButtonAppend()
				.attr('title',conv.description)
				.click((function(conv,isSelected){
					return function(){
						if(isSelected)
							Command.execute('win,reputation,converterRemove',[main.reputation.activeGrid,conv.id]);
						else
							Command.execute('win,reputation,converterAdd',[main.reputation.activeGrid,conv.id]);
					}
				})(conv,isSelected))
				
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

