//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require4('Main'), Img = require4('Img'), Command = require4('Command'), Collision = require4('Collision'), QueryDb = require4('QueryDb'), ItemModel = require4('ItemModel'), Actor = require4('Actor');
var Dialog = require3('Dialog');

var HEIGHT_BTN = 60;

//Dialog.open('inventory')
Dialog.UI('tabButton',{
	position:'absolute',
	right:0,
	bottom:0,
	width:200,
	height:HEIGHT_BTN,
	background:'rgba(0,0,0,0.2)',
	padding:'2px 2px',
	overflowY:"hidden",
	border:'1px solid black',
},Dialog.Refresh(function(html){
	Main.hudState.clearInterval(['tab-equip','tab-ability','tab-stat','tab-contribution','tab-quest','tab-reputation','tab-highscore','tab-friend','tab-feedback','tab-homeTele','tab-setting']);
	if(main.hudState.tab === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	var array = [
		[
			Main.hudState.applyHudState('tab-equip',Img.drawIcon.html('tab-equip',24,'Open Equip Window').click(function(){
				Dialog.open('equip');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-ability',Img.drawIcon.html('tab-ability',24,'Open Ability Window').click(function(){
				Dialog.open('ability');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-stat',Img.drawIcon.html('attackMelee-slash',24,'Open Stat Window').click(function(){
				Dialog.open('stat');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-quest',Img.drawIcon.html('tab-quest',24,'Open Quest List Window').click(function(){
				Dialog.open('questList');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-achievement',Img.drawIcon.html('plan-scroll',24,'Open Achievement Window').click(function(){
				Dialog.open('achievement');
			}).css({cursor:'pointer'})),
		],
		[
			Main.hudState.applyHudState('tab-reputation',Img.drawIcon.html('tab-reputation',24,'Open Reputation Grid').click(function(){
				Dialog.open('reputation');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-highscore',Img.drawIcon.html('tab-quest',24,'Open Highscore Window').click(function(){
				Dialog.open('highscore');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-contribution',Img.drawIcon.html('system-gold',24,'Open Contribution Window').click(function(){
				Dialog.open('contribution');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-homeTele',Img.drawIcon.html('minimapIcon-door',24,'Teleport to Town').click(function(){
				Command.execute('hometele',[]);
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-setting',Img.drawIcon.html('tab-pref',24,'Settings').click(function(){
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
			else Command.execute('transferInvBank',[i,1000]);
		} else if(Dialog.isActive('trade')){
			if(!e.shiftKey) Command.execute('transferInvTrade',[i,1]);
			else Command.execute('transferInvTrade',[i,1000]);
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

Dialog.getHeightInv = function(){
	if(main.quest) return 120;

	var count = main.invList.data.$keys().length;
	if(count <= 8) return 80;
	if(count <= 12) return 120;
	if(count <= 16) return 160;
	return 200;
}

Dialog.UI('inventory',{
	position:'absolute',
	right:0,
	width:200,
	background:'rgba(0,0,0,0.2)',
	padding:'0px 0px',
	border:'1px solid black',
},Dialog.Refresh(function(html,variable,param){
	var full = $('<div>');
	var hideQuest = !main.questActive;
	
	//quest
	var array = convertItemListToArrayCreate(2);
	variable.questItem = array[1];
	array = array[0];
	var table = Tk.arrayToTable(array,false,false,false,'6px 6px');
		
	table.addClass('inline').css({
		margin:'0px 0px',
		padding:'0px 0px',
		width:95,
		overflowY:"scroll",
		position:'relative',
		left:'5px',
	});
	variable.table0 = table;
	if(!hideQuest)
		full.append(table);
	
	//nonquest
	var amountPerRow = hideQuest ? 4 : 2;
	var width = hideQuest ? 190 : 95; //BAD.. but if 200, 2nd table goes down cuz wrap
	
	var array = convertItemListToArrayCreate(amountPerRow);
	variable.nonQuestItem = array[1];
	array = array[0];
	
	var table = Tk.arrayToTable(array,false,false,false,'6px 6px');
	table.addClass('inline').css({
		margin:'0px 0px',
		padding:'0px 0px',
		width:width,
		overflowY:"scroll",
		position:'relative',
		left:'5px',
	});
	full.append(table);
	variable.table1 = table;
	
	html.append(full);
		
	var stateArray = [];
	for(var i = 0; i < 20; i++)
		stateArray.push('');
	
	variable.questState = stateArray;
	variable.nonQuestState = Tk.deepClone(stateArray);
	
	variable.oldHeightInv = null; //important because MUST variable.oldHeightInv !== Dialog.getHeightInv() when re-create
	
	return true;	//call refresh
},function(){
	return Tk.stringify(main.invList.data) + Dialog.isActive('bank') + main.questActive + main.hudState.inventory + Dialog.isActive('trade') + Dialog.getHeightInv();
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
		return true;	//call create
	}
	
	var hgt = Dialog.getHeightInv();
	if(variable.oldHeightInv !== hgt){
		variable.oldHeightInv = hgt;
		
		html.css({
			bottom:HEIGHT_BTN,
			height:hgt,
		});
		
		variable.table0.css({height:hgt,overflowY:"scroll"});
		variable.table1.css({height:hgt,overflowY:"scroll"});
		variable.table0.parent().css({height:hgt});
		
	}
	var refresh = function(){
		Dialog.refresh('inventory');
	};
	var keys = getNonQuestItem().$keys();
	for(var i = 0; i < variable.nonQuestItem.length; i++){
		var id = keys[i];
		var amount = main.invList.data[id];	//may be NaN if out of range
		var state = id ? (id + amount) : '';
		if(variable.nonQuestState[i] !== state){
			if(id){
				var item = QueryDb.get('item',id,refresh);
				if(!item) continue;
				
				if(Dialog.equipPopup.isItemEquip(id))	//BAD, so quicker when opening equip dialog
					QueryDb.get('equip',id);
				
				
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
				var item = QueryDb.get('item',id,refresh);
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
	return Collision.testMouseRect(null,{
		x:CST.WIDTH-200,
		width:200,
		y:CST.HEIGHT-Dialog.getHeightInv()-HEIGHT_BTN,
		height:Dialog.getHeightInv()+HEIGHT_BTN
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

var WHITE_BAR_BIG;
var WHITE_BAR;
var LVLUP_BTN;

var reputationBarHEIGHT = 40;
Dialog.UI('reputationBar',{
	position:'absolute',
	right:0,
	width:200,
	height:reputationBarHEIGHT,
	padding:'2px 0px',
	backgroundColor:'rgba(0,0,0,0.5)',
	border:'1px solid black',
	color:'white',
},Dialog.Refresh(function(html,variable,param){
	if(main.hudState.aboveInventory === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	
	html.css({bottom:Dialog.getHeightInv()+HEIGHT_BTN});
	
	html.show();
	html.html('');
	
	var rawexp = Tk.round(Actor.getExp(player),0);
	var exp = Tk.abbreviateNumber(rawexp);
	var rawLvlUpCost = Actor.getLevelUpCost(player);
	var lvlUpCost = Tk.abbreviateNumber(rawLvlUpCost);	
	
	var pct = Tk.round(Math.min(100,rawexp / rawLvlUpCost * 100),0) + '%';
	var title = exp + '/' + lvlUpCost + ' Exp (' + pct + ')';
		
	WHITE_BAR_BIG = WHITE_BAR_BIG || $("<div>")
		.css({background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'3px',padding:'2px 0px'});
		
	WHITE_BAR = WHITE_BAR || $("<div>")
		.css({pointerEvents:'none',backgroundColor:'#FFFFFF',height:'8px',borderRadius:'2px'});
		
	WHITE_BAR_BIG.attr({title:title});
	WHITE_BAR.css({width:pct});
	WHITE_BAR.css({backgroundColor:rawexp >= rawLvlUpCost ? CST.color.gold : '#FFFFFF'});

	WHITE_BAR_BIG.append(WHITE_BAR);
	html.append(WHITE_BAR_BIG);
		
	//make it flash	
	LVLUP_BTN = LVLUP_BTN || $("<button>")
		.html("Lvl Up")
		.addClass("myButton skinny")
		.css({
			verticalAlign:'bottom',
			background:'rgba(0,0,0,0.01)',
			textShadow:'0px 0px',
			border:'2px solid black',
			color:'white',
		});
		
	LVLUP_BTN.attr('title','Lvl Up Cost: ' + lvlUpCost + ' Exp');
	
	LVLUP_BTN.click(function(){	//BAD, no clue why need to add everything refreshed
		Command.execute('lvlup',[]);
	})
	
	if(rawexp >= rawLvlUpCost){
		if(!variable.stopFlash)
			variable.stopFlash = Tk.flashDOM(LVLUP_BTN);
	} else {
		if(variable.stopFlash){
			variable.stopFlash();
			variable.stopFlash = null;
		}
	}	
	
	html.append(LVLUP_BTN);
	
	html.append($('<span>')
		.html(' Lvl: ' + Actor.getLevel(player) + ', ')
	);
	
	var questCount = Main.getCompletedQuestCount(main);
	
	html.append($('<span>')
		.attr('title','Global Exp Modifier for completing ' + questCount + ' quest(s)')
		.html('GEM: x' + Tk.round(Actor.getGEM(player),2,true))
	);
	
	
	
	
	
	
},function(){
	return '' + main.hudState.aboveInventory + player.skill.exp + Dialog.getHeightInv();
}));

})();



