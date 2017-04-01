
"use strict";
(function(){ //}
var Actor, Achievement, Stat, ReputationConverter, Boost, ReputationGrid;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Achievement = rootRequire('shared','Achievement'); Stat = rootRequire('shared','Stat'); ReputationConverter = rootRequire('shared','ReputationConverter'); Boost = rootRequire('shared','Boost'); ReputationGrid = rootRequire('shared','ReputationGrid');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.reputationAdd,Command.MAIN,[ //{
		Command.Param('number','Page',false,{max:1}),
		Command.Param('number','Y',false,{max:14}),
		Command.Param('number','X',false,{max:14}),
	],Main.reputation.add); //}

	Command.create(CST.COMMAND.reputationClear,Command.MAIN,[ //{
		Command.Param('number','Page',false,{max:1}),
	],Main.reputation.clearGrid.onCommand); //}

	Command.create(CST.COMMAND.reputationRemove,Command.MAIN,[ //{
		Command.Param('number','Page',false,{max:1}),
		Command.Param('number','Y',false,{max:14}),
		Command.Param('number','X',false,{max:14}),
	],Main.reputation.remove); //}

	Command.create(CST.COMMAND.reputationConverterAdd,Command.MAIN,[ //{
		Command.Param('number','Page',false,{max:1}),
		Command.Param('string','Converter Name',false),
	],Main.reputation.addConverter); //}

	Command.create(CST.COMMAND.reputationConverterRemove,Command.MAIN,[ //{
		Command.Param('number','Page',false,{max:1}),
		Command.Param('string','Converter Name',false),
	],Main.reputation.removeConverter); //}

});
var Main = rootRequire('shared','Main');


/*
0 - dont have
1 - have
2 - start with
*/

Main.Reputation = function(){
	return {
		usablePt:0,
		activeGrid:0,		//slot for list
		list:[
			Main.Reputation.list(),	
		]
	}
}

Main.Reputation.list = function(){
	return {
		grid:[
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000222000000',
			'000000222000000',
			'000000222000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
			'000000000000000',
		],
		usedPt:0,
		converter:[],
	};
}

Main.Reputation.compressDb = function(rep){
	return rep;
}
Main.Reputation.uncompressDb = function(rep){
	return rep;
}
Main.Reputation.getDbSchema = function(){
	return {
		usablePt:Number,
		activeGrid:Number,
		list:Array.of({
			grid:Array.of(String),
			usedPt:Number,
			converter:Array.of(String),
			'*':null
		}),
		'*':null
	}
}



Main.reputation = {};

Main.reputation.add = function(main,num,i,j){
	//when player wants to add a reputation
	if(Main.reputation.getUnusedPt(main,num) < 1){
		return Main.error(main,"You don't have any Reputation Points to use. Level up to unlock more.",true);
	}
	if(Main.reputation.getValue(main,num,i,j) !== 0) 
		return Main.error(main,"You already have this reputation.",true);
	if(!Main.reputation.testAdd(Main.reputation.getGrid(main,num),i,j)) 
		return Main.error(main,"You can't choose this reputation boost yet. It is locked.<br>You can only select yellow reputation boosts.",true);
	
	Main.reputation.modify(main,num,i,j,1);
	Main.playSfx(main,'select');
}

Main.reputation.modify = function(main,num,i,j,newvalue){
	var grid = Main.reputation.getGrid(main,num);
	grid[i] = Tk.setString(grid[i],j,'' + newvalue);
	Main.reputation.updatePt(main);
	Main.reputation.updateBoost(main);
	Achievement.onReputationChange(main);
}
Main.reputation.BOOST_NAME = 'Reputation';

Main.reputation.getGrid = function(main,num){
	if(num === undefined) num = main.reputation.activeGrid;
	return main.reputation.list[num].grid;	
}

Main.reputation.get = function(main,num){
	if(num === undefined) num = main.reputation.activeGrid;
	return main.reputation.list[num];	
}

Main.reputation.remove = function(main,num,i,j){
	//maybe system where cost nothing if lvl less than 20
	
	if(Main.reputation.getValue(main,num,i,j) !== 1){
		return Main.error(main,"You don't have this reputation.",true);
	}
	if(!Main.reputation.testRemove(Main.reputation.getGrid(main,num),i,j)){
		return Main.error(main,"You can't remove this reputation because it would create 2 subgroups.",true);
	}
	Main.playSfx(main,'select');
	Main.reputation.modify(main,num,i,j,0);
}

Main.reputation.clearGrid = function(main,num){
	main.reputation.list[num] = Main.Reputation.list();
	Main.reputation.updatePt(main);
	Main.reputation.updateBoost(main);
}
Main.reputation.clearGrid.onCommand = function(main,num){
	Main.askQuestion(main,function(){
		Main.reputation.clearGrid(main,num);
	},'Are you sure you want to clear the grid?','boolean');
}


Main.reputation.getValue = function(mainORgrid,numORi,iORj,j){	//accept grid or main
	if(mainORgrid.username) //BAD, test if main
		return Main.reputation.getValue(Main.reputation.getGrid(mainORgrid,numORi),iORj,j);
	return +mainORgrid[numORi][iORj];
}

Main.reputation.addRemovePt = function(main,num){
	main.reputation.removePt += num || 1;
	Main.reputation.updatePt(main);
}

Main.reputation.testAdd = function(grid,i,j){
	var dbgrid = ReputationGrid.get();
	var n = [Math.max(0,i-1),j];
	var s = [Math.min(dbgrid.height-1,i+1),j];
	var w = [i,Math.max(0,j-1)];
	var e = [i,Math.min(dbgrid.width-1,j+1)];
	var pos = [n,s,w,e];
	
	for(var num = 0; num < pos.length; num++){
		var p = +grid[pos[num][0]][pos[num][1]];
		if(p === ReputationGrid.HAVE || p === ReputationGrid.FREEBY){
			return true;
		}
	}
	return false;	
}

Main.reputation.testRemove = function(grid,yy,xx){
	var dbgrid = ReputationGrid.get();
	if(grid[yy][xx] === ('' + ReputationGrid.FREEBY)) return false;

	var grid = Tk.deepClone(grid);
	grid[yy] = Tk.setString(grid[yy],xx,'' + ReputationGrid.NOT_HAVE);
	
	var listValid = {};
	var listTested = {};	//list where i already checked the pts around and added they to listValid
	var listToTest = {'8-8':1};
	var listNeedToBeValid = {};
	
	for(var i =0; i < grid.length; i++)
		for(var j =0; j < grid[i].length; j++)
			if(+grid[i][j] !== ReputationGrid.NOT_HAVE)
				listNeedToBeValid[i+'-'+j] = 1;
	

	while(Object.keys(listToTest).length){
		for(var i in listToTest){
			var y = +i.slice(0,i.indexOf('-'));
			var x = +i.slice(i.indexOf('-')+1);
			
			var n = [Math.max(0,y-1),x];
			var s = [Math.min(dbgrid.height-1,y+1),x];
			var w = [y,Math.max(0,x-1)];
			var e = [y,Math.min(dbgrid.width-1,x+1)];
			
			var pos = [n,s,w,e];
			
			for(var k in pos){
				var p = +grid[pos[k][0]][pos[k][1]];	
				var str = pos[k][0] + '-' + pos[k][1];
				if(p === ReputationGrid.HAVE || p === ReputationGrid.FREEBY){
					if(!listTested[str])	listToTest[str] = 1;
				}
				listValid[str] = 1;
			}
			
			listTested[i] = 1;
			delete listToTest[i];
		}
	}	
	
	for(var i in listValid){
		delete listNeedToBeValid[i];
	}
	return !Object.keys(listNeedToBeValid).length;
	
	
}

Main.reputation.addConverter = function(main,num,name){
	//test if player has access
	if(!ReputationConverter.get(name)) return;
	if(Main.reputation.get(main,num).converter.$contains(name))	//already contains
		return;
	if(!ReputationConverter.canSelect(main,num,name))  //message sending done inside
		return;	
	Main.reputation.get(main,num).converter.push(name);
	Main.reputation.updateBoost(main);
	Achievement.onReputationChange(main);
	Main.playSfx(main,'select');
	Main.setChange(main,'reputation',main.reputation);
}

Main.reputation.removeConverter = function(main,num,name){
	Main.reputation.get(main,num).converter.$remove(name);
	Main.reputation.updateBoost(main);
	Main.setChange(main,'reputation',main.reputation);
}

Main.reputation.onLevelUp = function(main,lvl){
	Main.reputation.updatePt(main);
	if(ReputationConverter.getGroupViaLevel(lvl))
		Main.addPopup(main,'You have unlocked a new Reputation Converter.');
}
//###############
Main.reputation.updatePt = function(main){
	var mp = main.reputation;
	for(var i = 0 ; i < mp.list.length; i++)
		mp.list[i].usedPt = Main.reputation.getUsedPt(main,i);
		
	mp.usablePt = Main.reputation.getUsablePt(main);
	Main.setChange(main,'reputation',main.reputation);
}

Main.reputation.getUnusedPt = function(main,num){
	return Main.reputation.getUsablePt(main)-Main.reputation.getUsedPt(main,num);
}

Main.reputation.getUsedPt = function(main,num){
	var grid = Main.reputation.getGrid(main,num);
	var used = 0;
	for(var i in grid)
		for(var j = 0; j < grid[i].length;j++)
			if(+grid[i][j] === ReputationGrid.HAVE) 
				used++;
	return used;
}

Main.reputation.getUsablePt = function(main){
	var lvl = Main.reputation.getLvl(main);
	return lvl + 5;
}
Main.reputation.getLvl = function(main){
	return Actor.getLevel(Main.getAct(main));
}

Main.reputation.getConverter = function(main){
	return Main.reputation.get(main).converter;
}
//###############

Main.reputation.getBoost = function(main,grid){	//convert the list of reputation owned by player into actual boost.
	var tmp = [];
	var base = ReputationGrid.getConverted(main).base;
	for(var i = 0 ; i < grid.length ; i++){
		for(var j = 0 ; j < grid[i].length ; j++){
			if(+grid[i][j] !== ReputationGrid.HAVE) continue;
			var slot = base[i][j];
			if(Stat.get(slot.stat).value.base === 0)
				tmp.push(Boost.Perm(slot.stat,slot.value,CST.BOOST_PLUS));	//+ and not *, cuz stat with 0 by default (ex:ability) wont work
			else 
				tmp.push(Boost.Perm(slot.stat,slot.value,CST.BOOST_X));
		}
	}
	return Boost.stackSimilarPerm(tmp);
}

Main.reputation.updateBoost = function(main){
	var grid = Main.reputation.getGrid(main);
	Actor.addPermBoost(Main.getAct(main),Main.reputation.BOOST_NAME,Main.reputation.getBoost(main,grid));
}



Main.reputation.getMostCommonBoostCount = function(main){
	var grid = Main.reputation.getGrid(main);
	var tmp = {};
	var base = ReputationGrid.getConverted(main).base;
	for(var i = 0 ; i < grid.length ; i++){
		for(var j = 0 ; j < grid[i].length ; j++){
			if(+grid[i][j] !== ReputationGrid.HAVE) 
				continue;
			var slot = base[i][j];
			tmp[slot.stat] = tmp[slot.stat] || 0;
			tmp[slot.stat]++;
		}
	}
	var max = 0;
	for(var i in tmp)
		max = Math.max(max,tmp[i]);
	
	return max;
}

})(); //{
