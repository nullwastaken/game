//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require4('Main'), Img = require4('Img'), Command = require4('Command'), Collision = require4('Collision'), QueryDb = require4('QueryDb'), ItemModel = require4('ItemModel'), Actor = require4('Actor');
var Dialog = require3('Dialog');

var HEIGHT_BTN = 60;
var HEIGHT_INV = 110;
var HEIGHT_BAR = 110;

//Dialog.open('inventory')
Dialog.UI('tabButton',{
	position:'absolute',
	left:CST.WIDTH-200,
	top:CST.HEIGHT-HEIGHT_BTN,
	width:200,
	height:HEIGHT_BTN,
	background:'rgba(0,0,0,0.2)',
	padding:'2px 2px',
	overflowY:"hidden",
	border:'1px solid black',
},Dialog.Refresh(function(html){
	Main.hudState.clearInterval(['tab-equip','tab-ability','tab-stat','tab-quest','tab-reputation','tab-highscore','tab-friend','tab-feedback','tab-homeTele','tab-setting']);
	if(main.hudState.tab === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	var array = [
		[
			Main.hudState.applyHudState('tab-equip',Img.drawIcon.html('tab.equip',24,'Open Equip Window').click(function(){
				Dialog.open('equip');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-ability',Img.drawIcon.html('tab.ability',24,'Open Ability Window').click(function(){
				Dialog.open('ability');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-stat',Img.drawIcon.html('attackMelee.slash',24,'Open Stat Window').click(function(){
				Dialog.open('stat');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-quest',Img.drawIcon.html('tab.quest',24,'Open Quest List Window').click(function(){
				Dialog.open('questList');
			}).css({cursor:'pointer'})),
			
		],
		[
			Main.hudState.applyHudState('tab-reputation',Img.drawIcon.html('tab.reputation',24,'Open Reputation Grid').click(function(){
				Dialog.open('reputation');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-highscore',Img.drawIcon.html('tab.quest',24,'Open Highscore Window').click(function(){
				Dialog.open('highscore');
			}).css({cursor:'pointer'})),
			/*Main.hudState.applyHudState('tab-friend',Img.drawIcon.html('tab.friend',24,'Open Friend List').click(function(){
				Dialog.open('friend');
			}).css({cursor:'pointer'})),*/
			/*Main.hudState.applyHudState('tab-feedback',Img.drawIcon.html('system.flag',24,'Leave Feedback').click(function(){
				Message.addPopup(main.id,'Click the Display/Hide Comments button below the game box.');
			}).css({cursor:'pointer'})),*/
			Main.hudState.applyHudState('tab-homeTele',Img.drawIcon.html('minimapIcon.door',24,'Teleport to Town').click(function(){
				Command.execute('hometele',[]);
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-setting',Img.drawIcon.html('tab.pref',24,'Settings').click(function(){
				Dialog.open('setting');
			}).css({cursor:'pointer'}))
		],
	];	
	
	var table = Tk.arrayToTable(array,false,false,false,'4px 1px');
	table.addClass('center');
	html.append(table);
},function(){
	return Tk.stringify(main.hudState);
}));

//##################

var helperLeft = function(i){
	return function(e){
		if(Dialog.isActive('bank')){ 
			if(!e.shiftKey) Command.execute('transferInvBank',[i,1]);
			else Command.execute('transferInvBank',[i,Main.getPref(main,'bankTransferAmount')]);
		} else if(Dialog.isActive('trade')){
			if(!e.shiftKey) Command.execute('transferInvTrade',[i,1]);
			else Command.execute('transferInvTrade',[i,Main.getPref(main,'bankTransferAmount')]);
		} else {
			if(!e.shiftKey) Command.execute('useItem',[i,0]);	//first slot		
		}		
	}
}
var helperRight = function(i){
	return function(e){
		if(Dialog.isActive('bank')){ 
			if(!e.shiftKey) Command.execute('transferInvBank',[i,25]);
			else Command.execute('transferInvBank',[i,99999999999]);
		} else if(Dialog.isActive('trade')){ //TRADE
			if(!e.shiftKey) Command.execute('transferInvTrade',[i,25]);
			else Command.execute('transferInvTrade',[i,99999999999]);
		} else {
			var item = QueryDb.get('item',i);
			if(!item) return ERROR(3,'item should be loaded...',i);
			if(!e.shiftKey) Dialog.open('optionList',item);
			else ItemModel.displayInChat(item);
		}	
	}
}

var getNonQuestItem = function(){
	var ret = {};
	for(var i in main.invList.data)
		if(!main.questActive ||  !i.$contains(main.questActive))
			ret[i] = main.invList.data[i];
	return ret;
}
var getQuestItem = function(){
	var ret = {};
	for(var i in main.invList.data)
		if(main.questActive && i.$contains(main.questActive))
			ret[i] = main.invList.data[i];
	return ret;
}

Dialog.UI('inventory',{
	position:'absolute',
	left:CST.WIDTH-200,
	top:CST.HEIGHT-HEIGHT_INV-HEIGHT_BTN,
	width:200,	
	height:HEIGHT_INV,
	background:'rgba(0,0,0,0.2)',
	padding:'0px 0px',
	border:'1px solid black',
},Dialog.Refresh(function(html,variable,param){
	var full = $('<div>');
	
	var nonquest = getNonQuestItem();
	var quest = getQuestItem();
	var hideQuest = !main.questActive;
	
	//quest
	var array = convertItemListToArrayCreate(2);
	variable.questItem = array[1];
	array = array[0];
	var table = Tk.arrayToTable(array,false,false,false,'4px');
		
	table.addClass('inline').css({
		margin:'0px 0px 0px 0px',
		padding:'0px 0px 0px 0px',
		width:90,
		overflowY:"scroll",
		overflowX:"hidden",
		height:HEIGHT_INV,
	});
	if(!hideQuest)
		full.append(table);
	
	//nonquest
	var amountPerRow = hideQuest ? 4 : 2;
	var width = hideQuest ? 190 : 95; //BAD.. but if 200, 2nd table goes down cuz wrap
	
	var array = convertItemListToArrayCreate(amountPerRow);
	variable.nonQuestItem = array[1];
	array = array[0];
	
	var table = Tk.arrayToTable(array,false,false,false,'4px');
	table.addClass('inline').css({
		margin:'0px 0px 0px 0px',
		padding:'0px 0px 0px 0px',
		width:width,
		overflowY:"scroll",
		overflowX:"hidden",
		height:HEIGHT_INV,
	});
	full.append(table);
	
	html.append(full);
		
	var stateArray = [];
	for(var i = 0; i < 20; i++)
		stateArray.push('');
	
	variable.questState = stateArray;
	variable.nonQuestState = Tk.deepClone(stateArray);
	
	return true;	//call refresh
},function(){
	return Tk.stringify(main.invList.data) + Dialog.isActive('bank') + main.questActive + main.hudState.inventory + Dialog.isActive('trade');
},15,function(html,variable,param){
	//Main.hudState.applyHudState('inventory',full);	//idk if good
	//Main.hudState.clearInterval(['inventory']);
	if(main.hudState.inventory === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	if(variable.oldQuestActive !== main.questActive){
		variable.oldQuestActive = main.questActive;
		return true;	//true;	//call create
	}

	var keys = getNonQuestItem().$keys();
	for(var i = 0; i < variable.nonQuestItem.length; i++){
		var id = keys[i];
		var amount = main.invList.data[id];	//may be NaN if out of range
		var state = id ? (id + amount) : '';
		if(variable.nonQuestState[i] !== state){
			if(id){
				var item = QueryDb.get('item',id,function(){
					Dialog.refresh('inventory');
				});
				if(!item) continue;
				var itemHtml = Img.redrawItem(variable.nonQuestItem[i],item.icon,amount)
					.unbind('click')
					.click(helperLeft(id))
					.unbind('contextmenu')
					.bind('contextmenu',helperRight(id))
				itemHtml.find('canvas').attr('title',item.name);//	.attr('title',item.name);
				variable.nonQuestItem[i].show();
			} else {
				variable.nonQuestItem[i].hide();
			}
			variable.nonQuestState[i] = state;	//after QueryDb.get(
			
		}		
	}
	//exports.Img.redrawItem(exports.Dialog.LIST.inventory.variable.nonQuestItem[0],'metal.metal',10)
	var keys = getQuestItem().$keys();
	for(var i = 0; i < variable.questItem.length; i++){
		var id = keys[i];
		var amount = main.invList.data[id];	//may be NaN if out of range
		var state = id ? (id + amount) : '';
		if(variable.questState[i] !== state){
			
			if(id){
				var item = QueryDb.get('item',id,function(){
					Dialog.refresh('inventory');
				});
				if(!item) continue;
				var itemHtml = Img.redrawItem(variable.questItem[i],item.icon,amount)
					.unbind('click')
					.click(helperLeft(id))
					.unbind('contextmenu')
					.bind('contextmenu',helperRight(id));
				
				itemHtml.children()[0].title = item.name;//	.attr('title',item.name);
					
				variable.questItem[i].show();
			} else {
				variable.questItem[i].hide();
			}
			variable.questState[i] = state; //after Query
			
		}		
	}

}));

Dialog.isMouseOverInventory = function(){
	return Collision.testMouseRect(key,{
		x:CST.WIDTH-200,
		width:250,
		y:CST.HEIGHT-HEIGHT_INV-HEIGHT_BTN,
		height:HEIGHT_INV+HEIGHT_BTN
	}); 
}




var MAX_AMOUNT = 50;
var convertItemListToArrayCreate = function(amountPerRow){
	var array = [[]];
	var arrayPosition = 0;
	
	var toSaveArray = [];
	
	for(var i = 0 ; i < MAX_AMOUNT; i++){	
		if(array[arrayPosition].length >= amountPerRow){
			arrayPosition++;
			array.push([]);
		}
		var item = Img.drawItem(null,32);
		item.hide();
		array[arrayPosition].push(item);
		toSaveArray.push(item);
	}
	return [array,toSaveArray];
}



Dialog.UI('reputationBar',{
	position:'absolute',
	left:CST.WIDTH-200,
	top:CST.HEIGHT-HEIGHT_INV-HEIGHT_BTN-20,
	width:200,
	height:20,
	padding:'0px 0px',
	backgroundColor:'rgba(0,0,0,0.5)',
	color:'white',
},Dialog.Refresh(function(html,variable,param){
	if(main.hudState.aboveInventory === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	
	html.show();
	html.html('');
	var questCount = 0;
	for(var i in main.quest) if(main.quest[i]._complete) questCount++;
	
	html.append($('<span>')
		.attr('title','Global Exp Modifier for completing ' + questCount + ' quest(s)')
		.html('GEM: x' + Tk.round(Actor.getGEM(player),2,true))
	);
	
	var rawexp = Tk.round(Actor.getExp(player),0);
	var exp = rawexp;
	if(exp > 10000000)
		exp = Tk.round(exp/1000000,0) + 'M';
	else if(exp > 10000)
		exp = Tk.round(exp/1000,0) + 'K';
	
	
	html.append($('<span>')
		.attr('title',rawexp + ' Exp. Get more by killing monsters, harvesting resource and completing quests.')
		.html(', Exp: ' + exp)
	);
	html.append(' ',$(Img.drawIcon.html('system1.more',18))
		.attr('title','Current Level: ' + player.skill.lvl + '. Level Up Cost: ' + Actor.getLevelUpCost(player) + ' Exp')
		.click(function(){
			Command.execute('lvlup',[]);
		})
		.css({border: rawexp >= Actor.getLevelUpCost(player) ? '2px solid white' : ''})
	);
	
},function(){
	return '' + main.hudState.aboveInventory + player.skill.exp;
}));




})();



