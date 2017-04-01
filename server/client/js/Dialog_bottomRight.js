
"use strict";
(function(){ //}
var Main, Message, Sfx, Img, Command, QueryDb, ItemModel, Actor, Game;
global.onReady(function(){
	Main = rootRequire('shared','Main',true); Message = rootRequire('shared','Message',true); Sfx = rootRequire('client','Sfx',true); Img = rootRequire('client','Img',true); Command = rootRequire('shared','Command',true); QueryDb = rootRequire('shared','QueryDb',true); ItemModel = rootRequire('shared','ItemModel',true); Actor = rootRequire('shared','Actor',true); Game = rootRequire('client','Game',true);
});
var Dialog = rootRequire('client','Dialog');

var HEIGHT_BTN = 60;
var INV_WIDTH = 200;

Dialog.getSizeBottomRight = Tk.newCacheManager(function(){
	return {
		width:Dialog.get('inventory').width(),
		height:Dialog.getHeightInv() + HEIGHT_BTN + reputationBarHEIGHT,
	}	
},500);

//Dialog.open('inventory')
Dialog.UI('tabButton','bottomRight',{
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
	Main.hudState.clearInterval(['tab-equip','tab-ability','tab-contribution','tab-quest','tab-reputation','tab-highscore','tab-friend','tab-feedback','tab-homeTele','tab-setting']);
	if(w.main.hudState.tab === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	var helper = function(what){
		Dialog.closeBigWindow();
		Dialog.open(what);
		Dialog.playSfx('select');
	}
	var array = [
		[
			Main.hudState.applyHudState('tab-equip',Img.drawIcon.html('tab-equip',24,'Equip Window (E)').click(function(){
				helper('equip');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-ability',Img.drawIcon.html('tab-ability',24,'Ability Window (B)').click(function(){
				helper('ability');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-quest',Img.drawIcon.html('tab-quest',24,'Quest Window (Q)').click(function(){
				helper('questList');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-sideQuest',Img.drawIcon.html('tab-sideQuest',24,'Side Quest Window (N)').click(function(){
				helper('sideQuest');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-achievement',Img.drawIcon.html('tab-achievement',24,'Achievement Window (V)').click(function(){
				helper('achievement');
			}).css({cursor:'pointer'})),
		],
		[
			Main.hudState.applyHudState('tab-reputation',Img.drawIcon.html('tab-reputation',24,'Reputation Grid (R)').click(function(){
				helper('reputation');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-worldMap',Img.drawIcon.html('tab-worldMap',24,'World Map (M)').click(function(){
				helper('worldMap');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-contribution',Img.drawIcon.html('tab-contribution',24,'Contribution Window (C)').click(function(){
				helper('contribution');
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-homeTele',Img.drawIcon.html('minimapIcon-door',24,'Teleport to Town').click(function(){
				Dialog.playSfx('select');
				Command.execute(CST.COMMAND.homeTele,[]);
			}).css({cursor:'pointer'})),
			Main.hudState.applyHudState('tab-setting',Img.drawIcon.html('tab-pref',24,'Settings (X)').click(function(){
				helper('setting');
			}).css({cursor:'pointer'}))
		],
	];	
	
	var table = Tk.arrayToTable(array,false,false,false,'4px 1px');
	table.addClass('center');
	html.append(table);
},function(){
	return Tk.stringify(w.main.hudState);
}));

//##################

var helperLeft = function(i){
	return function(e){
		if(Dialog.isActive('bank')){ 
			if(!e.shiftKey) 
				Command.execute(CST.COMMAND.transferInvBank,[i,1]);
			else 
				Command.execute(CST.COMMAND.transferInvBank,[i,100]);
			return;
		}
		if(Dialog.isActive('trade')){
			if(!e.shiftKey) 
				Command.execute(CST.COMMAND.transferInvTrade,[i,1]);
			else 
				Command.execute(CST.COMMAND.transferInvTrade,[i,100]);
			return;
		}
		if(Dialog.isActive('shop')){
			if(!e.shiftKey) 
				Dialog.shop.setDetailSell(i);
			return;
		}
		if(!e.shiftKey) 
			Command.execute(CST.COMMAND.useItem,[i,0]);	//first slot
		else
			ItemModel.displayInChat(i,Main.getItemAmount(w.main,i));
	}
}
var helperRight = function(i){
	return function(e){
		if(Dialog.isActive('bank')){ 
			if(!e.shiftKey) Dialog.displayEquipIfEquip(i);
			else Command.execute(CST.COMMAND.transferInvBank,[i,99999999999]);
			return;
		} 
		if(Dialog.isActive('trade')){
			if(!e.shiftKey) Dialog.displayEquipIfEquip(i);
			else Command.execute(CST.COMMAND.transferInvTrade,[i,99999999999]);
			return;
		}
		if(Dialog.isActive('shop')){
			if(!e.shiftKey) Dialog.displayEquipIfEquip(i);
			else Dialog.shop.sell(i);	//direct
			return;
		}
		
		var item = QueryDb.get('item',i);
		if(!item) 
			return ERROR(3,'item should be loaded...',i);
		if(!e.shiftKey) 
			Dialog.open('optionList',item);
		else 
			ItemModel.displayInChat(i);
	}
}

var getItemArray = function(shop){
	if(!shop){
		var ret = [];
		for(var i in w.main.invList.data){
			if(isQuestItem(i))
				ret.push(i);
		}
		if(ret.length)
			ret.push(null);
		for(var i in w.main.invList.data){
			if(!isQuestItem(i))
				ret.push(i);
		}
		return ret;
	}
	//if shop
	for(var i in w.main.invList.data){
		var ret = [];
		if(w.main.invList.data[CST.ITEM_GOLD])
			ret.push(CST.ITEM_GOLD);
			
		for(var i in w.main.invList.data){
			var item = QueryDb.get('item',i,refresh);
			if(item && item.type === CST.ITEM.material)
				ret.push(i);
		}
		for(var i in w.main.invList.data){
			if(Dialog.equipPopup.isItemEquip(i,refresh)){
				var equip = QueryDb.get('equip',i,refresh);
				if(equip && equip.salvagable)
					ret.push(i);
			}
		}
		if(ret.length)
			ret.push(null);
		return ret;
	}
	return [];
}

Dialog.getHeightInv = function(){
	var count = w.main.invList.data.$keys().length;
	if(count <= 12 || CST.HEIGHT < 600) 
		return 120;
	if(count <= 16 || CST.HEIGHT < 720) 
		return 160;
	return 200;
}

var refresh = function(){
	Dialog.refresh('inventory');
};

Dialog.UI('inventory','bottomRight',{
	position:'absolute',
	right:0,
	width:INV_WIDTH,
	background:'rgba(0,0,0,0.2)',
	padding:'0px 0px',
	border:'1px solid black',
},Dialog.Refresh(function(html,variable,param){
	var full = $('<div>');
	
	var width = INV_WIDTH-10; //BAD.. but if 200, 2nd table goes down cuz wrap
	
	var tmp = convertItemListToArrayCreate(4);
	var array2d = tmp[0];
	variable.imgList = tmp[1];
	
	variable.table = Tk.arrayToTable(array2d,false,false,false,'10px 10px');
	variable.table.addClass('inline').css({
		margin:'0px 0px',
		padding:'0px 0px',
		width:width,
		overflowY:"scroll",
		position:'relative',
		left:'5px',
	});
	full.append(variable.table);	
	html.append(full);
		
	var stateArray = [];
	for(var i = 0; i < 30; i++)
		stateArray.push('');
	
	variable.state = Tk.deepClone(stateArray);
	
	variable.oldHeightInv = null; //important because MUST variable.oldHeightInv !== Dialog.getHeightInv() when re-create
	
	return true;	//call refresh
},function(){
	return Tk.stringify(w.main.invList.data) + Dialog.isActive('shop') + w.main.questActive + w.main.hudState.inventory + Dialog.getHeightInv();
},15,function(html,variable,param){
	//Main.hudState.applyHudState('inventory',full);	//idk if good
	//Main.hudState.clearInterval(['inventory']);
	
	var debugTutorial = w.main.questActive === CST.Qtutorial && !Game.isOnRainingChainCom();
	if(w.main.hudState.inventory === Main.hudState.INVISIBLE && !debugTutorial){
		if(variable.visible !== false){
			variable.visible = false;
			html.hide();
		}
		return null;
	}
	if(variable.visible !== true){
		variable.visible = true;
		html.show();
	}
		
	var hgt = Dialog.getHeightInv();
	if(variable.oldHeightInv !== hgt){
		variable.oldHeightInv = hgt;
		
		html.css({
			bottom:HEIGHT_BTN,
			height:hgt,
		});
		
		variable.table.css({height:hgt,overflowY:"scroll"});
		variable.table.parent().css({height:hgt});
		
	}
	var isShop = Dialog.isActive('shop');
	var keys = getItemArray(isShop);
	for(var i = 0; i < variable.imgList.length; i++){
		var id = keys[i];
		var amount = w.main.invList.data[id];	//may be NaN if out of range
		var state = id ? (id + amount) : '';
		
		
		if(variable.state[i] !== state){
			if(id){
				var item = QueryDb.get('item',id,refresh);
				if(!item) 
					continue;
				if(Dialog.equipPopup.isItemEquip(id)){	//BAD, used cuz otherwise, border now always good..
					var equip = QueryDb.get('equip',id,refresh);
					if(!equip)
						continue;
				}
				var itemHtml = Img.redrawItem(variable.imgList[i],item.id,amount,null,1)
					.unbind('click')
					.click(helperLeft(id))
					.unbind('contextmenu')
					.bind('contextmenu',helperRight(id));
					
				
				var canvas = itemHtml.find('canvas');
				canvas.tooltip(Tk.getTooltipOptions({	//BAD, needed cuz if mouse over it already, fucks everything...
					content:item.name,
				}));
				variable.imgList[i].show();
			} else {
				variable.imgList[i].hide();
			}
			variable.state[i] = state;	//after QueryDb.get(			
		}		
	}
}));

/*var isSellable = function(id){
	var item = QueryDb.get('item',id);
	return item && (item.type === CST.ITEM.equip || item.type === CST.ITEM.material);
}*/

var isQuestItem = function(id){
	return id[0] === 'Q' && !id.$contains('Qsystem-',true);
	//return main.questActive && id.$contains(main.questActive);
}

var MAX_AMOUNT = 50;
var SIZE = 32 - 2;	//2 for border;
var convertItemListToArrayCreate = function(amountPerRow){
	var array2d = [[]];
	var arrayPosition = 0;
	
	var array1d = [];
	
	for(var i = 0 ; i < MAX_AMOUNT; i++){	
		if(array2d[arrayPosition].length >= amountPerRow){
			arrayPosition++;
			array2d.push([]);
		}
		var item = Img.drawItem(null,SIZE);
		item.css({cursor:'pointer'});
		item.hide();
		array2d[arrayPosition].push(item);
		array1d.push(item);
	}
	return [array2d,array1d];
}

var WHITE_BAR_BIG;
var WHITE_BAR;
var LVLUP_BTN;
var reputationBarHEIGHT = 40;

var ENOUGH_EXP_LVLUP = false;

Dialog.UI('reputationBar','bottomRight',{
	position:'absolute',
	right:0,
	width:INV_WIDTH,
	height:reputationBarHEIGHT,
	padding:'2px 0px',
	backgroundColor:'rgba(0,0,0,0.5)',
	border:'1px solid black',
	color:'white',
},Dialog.Refresh(function(html,variable,param){
	if(w.main.hudState.aboveInventory === Main.hudState.INVISIBLE){
		if(variable.visible !== false){
			variable.visible = false;
			html.hide();
		}
		return null;
	}
	
	html.css({bottom:Dialog.getHeightInv()+HEIGHT_BTN});
	html.addClass('shadow');
	
	if(variable.visible !== true){
		variable.visible = true;
		html.show();
	}
	html.html('');
	
	var rawexp = Tk.round(Actor.getExp(w.player),0);
	var exp = Tk.abbreviateNumber(rawexp);
	var rawLvlUpCost = Actor.getLevelUpCost(w.player);
	var lvlUpCost = Tk.abbreviateNumber(rawLvlUpCost);	
	var enoughGEM = Actor.getGEM(w.player) >= Actor.getLevelUpGEM(w.player);
	var canLvlUp = rawexp >= rawLvlUpCost && enoughGEM;
	
	var pct = Tk.round(Math.min(100,rawexp / rawLvlUpCost * 100),0) + '%';
	var title = exp + '/' + lvlUpCost + ' Exp (' + pct + ')';
		
	WHITE_BAR_BIG = WHITE_BAR_BIG || $("<div>")
		.css({background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'3px',padding:'2px 0px'});
		
	WHITE_BAR = WHITE_BAR || $("<div>")
		.css({pointerEvents:'none',backgroundColor:'#FFFFFF',height:'8px',borderRadius:'2px'});
		
	WHITE_BAR_BIG.attr({title:title});
	WHITE_BAR.css({width:pct});
	WHITE_BAR.css({backgroundColor:canLvlUp ? CST.color.gold : '#FFFFFF'});

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
	
	var tit = 'Lvl Up Cost: ' + lvlUpCost + ' Exp';
	if(!enoughGEM)
		tit += ' and GEM at least x' + Tk.round(Actor.getLevelUpGEM(w.player),2,true);
	LVLUP_BTN.attr('title',tit);
	
	LVLUP_BTN.click(function(){	//BAD, no clue why need to add everything refreshed
		Command.execute(CST.COMMAND.lvlUp,[]);
	})
	
	if(canLvlUp){
		if(!ENOUGH_EXP_LVLUP){
			ENOUGH_EXP_LVLUP = true;
			if(Date.now() - Game.getStartTime() > 5000)
				Sfx.play('levelUp');
			Message.add(null,'<span style="color:' + CST.color.gold + '">You have enough experience to level up.</span>');
		}
		if(!variable.stopFlash)
			variable.stopFlash = Tk.flashDOM(LVLUP_BTN,5000);
	} else {
		ENOUGH_EXP_LVLUP = false;
		if(variable.stopFlash){
			variable.stopFlash();
			variable.stopFlash = null;
		}
	}	
	
	html.append(LVLUP_BTN);
	
	html.append($('<span>')
		.html(' Lvl: ' + Actor.getLevel(w.player) + ', ')
	);
	
	var questCount = Main.getCompletedQuestCount(w.main);
	
	html.append($('<span>')
		.attr('title','Global Exp Modifier for completing ' + questCount + ' quest(s)')
		.html('GEM: x' + Tk.round(Actor.getGEM(w.player),2,true))
	);
	
	
},function(){
	return '' + w.main.hudState.aboveInventory + w.player.skill.exp + Dialog.getHeightInv();
}));


})();



