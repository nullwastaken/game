(function(){ //}
Dialog('reputation','Reputation Reward',Dialog.Size(800,600),Dialog.Refresh(function(){
	Dialog.reputation.apply(this,arguments);
},function(){
	return Tk.stringify(main.reputation);
}));
var GRID = null;

//Dialog.open('reputation')
Dialog.reputation = function (html){
	var top = Dialog.reputation.top();
	var grid = GRID = Dialog.reputation.grid();
	var conv = Dialog.reputation.converter();
	
	html.append($('<div>')
		.append(top,grid)
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
	var removePt = main.reputation.removePt.r(1);
	
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
	for(var i = 0 ; i < grid.length ; i++){
		for(var j = 0 ; j < grid[i].length ; j++){
			var base = gridBase[i][j];
			var canvas = $('<canvas>').attr({height:ic,width:ic});
			var ctx = canvas[0].getContext('2d');
			
			var value = Main.reputation.getValue(grid,i,j);
			//Freebies
			if(value === 2){	//TOFIX should only be ===2
				ctx.fillStyle = 'green';
				ctx.fillRect(0,0,ic,ic);
				el.append(canvas);
				continue;
			}
			
			//Border
			var canSelect = Main.reputation.testAdd(grid,i,j);
			ctx.fillStyle = value === 1 ? 'green' : (canSelect ? '#FFFF00': 'red');
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
			
			//#####################
			var stat = Stat.get(base.stat);
			if(value === 1) 
				canvas.attr('title','Right Click: Remove ' + stat.name);
			else {
				var header = canSelect ? 'Left Click: ' : 'LOCKED: ';
				if(stat.custom) 
					canvas.attr('title',header + stat.description);
				else 
					canvas.attr('title',header + 'Boost ' + stat.name + ' by +' + Tk.round(base.value*100,1) + '%');
			}
				
			
			if(stat.custom){
				Img.drawIcon(ctx,stat.icon,border2,border2,iconSize);
				ctx.strokeStyle = value === 1 ? 'white' : 'blue';
				ctx.lineWidth = 2;
				ctx.strokeRect(border2-2,border2-2,iconSize+4,iconSize+4);
			} else {
				ctx.globalAlpha = value === 1 ? 1 : 0.5;
				Img.drawIcon(ctx,stat.icon,border2,border2,iconSize);
			}	
			
			el.append(canvas);			
		}
		el.append("<br>");
	}
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

