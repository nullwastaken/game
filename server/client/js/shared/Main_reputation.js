//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require2('Actor'), Stat = require2('Stat'), ReputationConverter = require2('ReputationConverter'), Boost = require2('Boost'), ReputationGrid = require2('ReputationGrid');
var Main = require3('Main');
/*
0 - dont have
1 - have
2 - start with
*/

Main.Reputation = function(){
	return {
		exp:0,
		lvl:0,
		usablePt:0,
		removePt:10,
		activeGrid:0,		//slot for list
		list:[
			Main.Reputation.list(),
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
		freeze:null,
		converter:[],
	};
}

Main.reputation = {};

Main.reputation.add = function(main,num,i,j){
	//when player wants to add a reputation
	if(Main.reputation.getUnusedPt(main,num) < 1) 
		return Main.addMessage(main,"You don't have any Reputation Points to use.");
	if(Main.reputation.getValue(main,num,i,j) !== 0) 
		return Main.addMessage(main,"You already have this reputation.");
	if(!Main.reputation.testAdd(Main.reputation.getGrid(main,num),i,j)) 
		return Main.addMessage(main,"You can't choose this reputation yet.");
	
	Main.reputation.modify(main,num,i,j,1);
}

Main.reputation.modify = function(main,num,i,j,newvalue){
	var grid = Main.reputation.getGrid(main,num);
	grid[i] = grid[i].set(j,'' + newvalue);
	Main.reputation.updatePt(main);
	Main.reputation.updateBoost(main);
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
	
	/*if(main.reputation.removePt < 1) 
		return Main.addMessage(main,"You don't have any Reputation Remove Points to use.");*/
	if(Main.reputation.getValue(main,num,i,j) !== 1) 
		return Main.addMessage(main,"You don't have this reputation.");
	if(!Main.reputation.testRemove(Main.reputation.getGrid(main,num),i,j)) 
		return Main.addMessage(main,"You can't remove this reputation because it would create 2 subgroups.");
	
	Main.reputation.modify(main,num,i,j,0);
	//main.reputation.removePt--;
}

Main.reputation.clearGrid = function(main,num){
	/*if(main.reputation.removePt < 1) 
		return Main.addMessage(main,"You need at least 1 Remove Points to reset the grid.");
	main.reputation.removePt--;*/
	
	main.reputation.list[num] = Main.Reputation.list();
	Main.reputation.updatePt(main);
	Main.reputation.updateBoost(main);
}

Main.reputation.getValue = function(mainORgrid,numORi,iORj,j){	//accept grid or main
	if(mainORgrid.username) return Main.reputation.getValue(Main.reputation.getGrid(mainORgrid,numORi),iORj,j);
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
	grid[yy] = grid[yy].set(xx,('' + ReputationGrid.NOT_HAVE));
	
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

Main.reputation.changeActivePage = function(main,num){
	if(main.reputation.activePage === num) return;
	main.reputation.activePage = num;
	Main.reputation.updateBoost(main);
}
Main.reputation.addConverter = function(main,num,name){
	//test if player has access
	if(!ReputationConverter.get(name)) return;
	if(Main.reputation.get(main,num).converter.$contains(name))	//already contains
		return;
	if(!ReputationConverter.canSelect(main,num,name)) return;	//message sending done inside
	Main.reputation.get(main,num).converter.push(name);
	Main.reputation.updateBoost(main);
	Main.setFlag(main,'reputation');
	
}
Main.reputation.removeConverter = function(main,num,name){
	Main.reputation.get(main,num).converter.$remove(name);
	Main.reputation.updateBoost(main);
	Main.setFlag(main,'reputation');
}
	
/*
Main.reputation.useRemovalOrb = function(main,num){
	num = num || 1;
	Main.removeItem(main,'orb-removal',num);	//bad... should in use use orb removal
	Main.reputation.grantRemovePt(main,num);
}
*/

//###############
Main.reputation.updatePt = function(main){
	var mp = main.reputation;
	for(var i in mp.list)
		mp.list[i].usedPt = Main.reputation.getUsedPt(mp.list[i].grid);
		
	mp.lvl = Main.reputation.getLvl(main);
	mp.usablePt = Main.reputation.getUsablePt(main);
	Main.setFlag(main,'reputation');
}

Main.reputation.getUnusedPt = function(main,num){
	var grid = Main.reputation.getGrid(main,num);
	return Main.reputation.getUsablePt(main)-Main.reputation.getUsedPt(grid);
}

Main.reputation.getUsedPt = function(grid){
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


//###############

Main.reputation.getBoost = function(main,grid){	//convert the list of reputation owned by player into actual boost.
	var tmp = [];
	var base = ReputationGrid.getConverted(main).base;
	for(var i = 0 ; i < grid.length ; i++){
		for(var j = 0 ; j < grid[i].length ; j++){
			if(+grid[i][j] !== ReputationGrid.HAVE) continue;
			var slot = base[i][j];
			if(Stat.get(slot.stat).value.base === 0)
				tmp.push(Boost.Perm(slot.stat,slot.value,'+'));	//+ and not *, cuz stat with 0 by default (ex:ability) wont work
			else 
				tmp.push(Boost.Perm(slot.stat,slot.value,'*'));
		}
	}
	return Boost.stackSimilarPerm(tmp);
}

Main.reputation.updateBoost = function(main){
	var grid = Main.reputation.getGrid(main);
	Actor.permBoost(Main.getAct(main),Main.reputation.BOOST_NAME,Main.reputation.getBoost(main,grid));
}

})(); //{
