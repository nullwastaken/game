
"use strict";
(function(){ //}
var Command, QueryDb, Img, Collision, Main, ItemList;
global.onReady(function(){
	Command = rootRequire('shared','Command',true); QueryDb = rootRequire('shared','QueryDb',true); Img = rootRequire('client','Img',true); Collision = rootRequire('shared','Collision',true); Main = rootRequire('shared','Main',true); ItemList = rootRequire('shared','ItemList',true);
});
var Dialog = rootRequire('client','Dialog');

var RIGHT_SIDE = null;
var MATERIAL_SELL_GEM = 27;
var MATERIAL_SELL_NONGEM = 9;

var helperBuy = function(shopId,elementId,amount){
	return function(e){
		Command.execute(CST.COMMAND.shopBuy,[shopId,elementId,amount || 1]);
	}
};

var getTable = function(variable,list){
	var array = [[]];
	for(var i = 0 ; i < list.length; i++){
		var element = list[i];
		var row = Math.floor(i / 5);
		var col = i % 5;
		
		var can = canBuy(element);
		var icon = Img.drawIcon.html(element.icon,30,'Buy ' + element.name,can ? 1 : 0.5); 
		icon.click(helperDetailBuy(variable,element));
		icon.css({cursor:'pointer'});
		
		//Img.redrawIcon
		
		variable.iconAndElement.push({
			element:element,
			icon:icon,
		});
		
		array[row] = array[row] || [];
		array[row][col] = icon;
	}
	return Tk.arrayToTable(array,null,null,null,'10px');
}

var canBuy = function(element){
	return Main.haveItem(w.main,element.costList)
}

var helperDetailBuy = function(variable,element){
	return function(e){
		var html = variable.rightSide.html('');
				
		var icon = Img.drawIcon.html(element.icon,30)
			.css({marginRight:'5px'});
		
		html.append(
			icon,
			$('<span>')
				.html(element.name)
				.css({fontSize:'1.5em',color:element.color || ''})
				.addClass('shadow'),
			'<br>'
		);
		
		if(element.description){	//aka equip
			html.append($('<p>')
				.html(element.description + '<br>')
			);
		}
		
		var cost = $('<p>');
		var str = ItemList.stringify(element.costList,function(){
			helperDetailBuy(variable,element)();
		},'<br>');
		
		cost.append('Cost: ' + str + '<br>');
		html.append(cost);
		
		var buy = $('<button>')
			.html('Buy')
			.click(function(){
				helperBuy(variable.shop.id,element.id)();
			});
		var buy25 = $('<button>')
			.html('Buy 25')
			.click(function(){
				helperBuy(variable.shop.id,element.id,25)();
			});
		
		if(element.color)	//BAD, assume color => equip...
			buy25.hide();
		
		variable.detailElement = element;
		variable.buyButton = buy;
		variable.buy25Button = buy25;
		update(null,variable);
		
		html.append(buy);
		html.append(buy25);
	}
};

var update = function(html,variable,param){
	if(param){
		if(param.refreshTime !== variable.shop.refreshTime || param.id !== variable.shop.id){
			variable.shop = param;
			return true;	//require fresh
		}
	}
	if(!variable.x){	//first time opening
		variable.x = w.player.x;
		variable.y = w.player.y
	}
	if(Collision.getDistancePtPt(variable,w.player) > 100){
		delete variable.x;
		delete variable.y;
		return false;
	}
	
	for(var i = 0 ; i < variable.iconAndElement.length; i++){
		var element = variable.iconAndElement[i].element;
		var can = canBuy(element);
		
		Img.redrawIcon(variable.iconAndElement[i].icon,element.icon,null,can ? 1 : 0.5);	
	}
	
	//update button
	if(variable.detailElement){
		if(!canBuy(variable.detailElement)){
			variable.buyButton.addClass('myButtonRed').attr('title','You don\'t have the resource to buy this.');
			variable.buy25Button.addClass('myButtonRed').attr('title','You don\'t have the resource to buy this.');
		} else {
			variable.buyButton.addClass('myButtonGreen').attr('title','');
			variable.buy25Button.addClass('myButtonGreen').attr('title','');
		}
	}
}

Dialog.create('shop','Shop',Dialog.Size(700,500),Dialog.Refresh(function(html,variable,shop){	
	if(!variable.x){	//first time opening
		variable.x = w.player.x;
		variable.y = w.player.y
	}
	html.append('New stock every hour. Click in inventory to sell your items.<br>');
	
	//left side	
	variable.leftSide = $('<div>').css({float: 'left',/*display:'inline-block',*/width:'50%'});
	variable.shop = shop || variable.shop;	// || cuz refresh

	html.append(variable.leftSide);
	
	variable.iconAndElement = [];
	
	var list = {material:[],equip:[],misc:[]};	//based on CST.ITEM
	if(!variable.shop || !variable.shop.elementList)
		ERROR(3,'no shop');
	for(var i = 0 ; i < variable.shop.elementList.length; i++){
		list[variable.shop.elementList[i].elementType].push(variable.shop.elementList[i]);
	}
	
	if(list.equip.length){
		variable.leftSide.append('<h4>Equip:</h4>');
		variable.leftSide.append(getTable(variable,list.equip));
	}
	
	if(list.material.length){
		variable.leftSide.append('<h4>Convert Material:</h4>');
		variable.leftSide.append(getTable(variable,list.material));
	}
	
	if(list.misc.length){
		variable.leftSide.append('<h4>Misc.:</h4>');
		variable.leftSide.append(getTable(variable,list.misc));
	}
	
	//right side
	RIGHT_SIDE = variable.rightSide = $('<div>').css({marginTop:'20px',float: 'left',/*display:'inline-block',*/width:'50%'});
	html.append(variable.rightSide);
},function(html,variable,param){
	return Tk.stringify(w.main.invList.data) + (Collision.getDistancePtPt(variable,w.player) > 100);
},25,update));

Dialog.shop = {};

Dialog.shop.resetDetailSell = function(){
	RIGHT_SIDE.html('');
}

Dialog.shop.setDetailSell = function(id){
	Dialog.shop.resetDetailSell();
	var item = QueryDb.get('item',id);
	if(!item)
		return;
	if(item.type === CST.ITEM.equip)
		Dialog.shop.setDetailSell.equip(id);
	if(item.type === CST.ITEM.material)
		Dialog.shop.setDetailSell.material(id);
}

Dialog.shop.setDetailSell.material = function(id){
	var html = RIGHT_SIDE;
	var item = QueryDb.get('item',id);
	if(!item) return;
	
	var icon = Img.drawIcon.html(item.icon,30)
		.css({marginRight:'5px'});
	html.append(
		icon,
		$('<span>')
			.html(item.name)
			.css({fontSize:'1.5em'})
			.addClass('shadow'),
		'<br>'
	);
		
	var cost = $('<p>');
	var count = getMaterialSellPrice(item);
	cost.append('Sell Price: ' + count + ' Gold<br>');
	html.append(cost);
	
	html.append($('<button>')
		.addClass('myButtonGreen')
		.html('Sell')
		.click(function(){
			Dialog.shop.sellMaterial(item.id);
		})
	);
	html.append($('<button>')
		.addClass('myButtonGreen')
		.html('Sell 25')
		.click(function(){
			Dialog.shop.sellMaterial(item.id,25);
		})
	);
}

Dialog.shop.setDetailSell.equip = function(equipId){
	var html = RIGHT_SIDE;
	var equip = QueryDb.get('equip',equipId);
	if(!equip)
		return;
			
	var icon = Img.drawIcon.html(equip.icon,30)
		.css({marginRight:'5px'});

	html.append(
		icon,
		$('<span>')
			.html(equip.name)
			.css({fontSize:'1.5em',color:equip.color || ''})
			.addClass('shadow'),
		'<br>'
	);
	
	if(equip.description){	//aka equip
		html.append($('<p>')
			.html(equip.description + '<br>')
		);
	}
	
	var cost = $('<p>');
	var count = getEquipSellPrice(equip);
	cost.append('Sell Price: ' + count + '<br>');
	html.append(cost);
	
	var buy = $('<button>')
		.addClass('myButtonGreen')
		.html('Sell')
		.click(function(){
			Dialog.shop.sellEquip(equip.id);
		});
	
	html.append(buy);
	html.append('<br><br>Shift Right Click in inventory to instant sell.');
};

Dialog.shop.sell = function(eid){
	var item = QueryDb.get('item',eid);
	if(!item) 
		return;
	if(item.type === CST.ITEM.equip)
		Dialog.shop.sellEquip(eid);
	if(item.type === CST.ITEM.material)
		Dialog.shop.sellMaterial(eid,100);
		
} 


Dialog.shop.sellEquip = function(elementId){
	Command.execute(CST.COMMAND.equipSalvage,[elementId,true]);
	Dialog.shop.resetDetailSell(null);
};
Dialog.shop.sellMaterial = function(elementId,amount){
	Command.execute(CST.COMMAND.materialSalvage,[elementId,amount || 1]);
	
	if(!Main.haveItem(w.main,elementId,amount))	//aka predict that no more item
		Dialog.shop.resetDetailSell(null);
};

var ARMOR_COST = 1;
var GEM_COST = 0.5;
var WEAPON_COST = 1.5;
var pieceTypeToCostRatio = {	//duped in Equip
	weapon:{
		mace:{metal:WEAPON_COST},
		sword:{metal:WEAPON_COST},
		spear:{metal:WEAPON_COST},
		bow:{wood:WEAPON_COST},
		boomerang:{wood:WEAPON_COST},
		crossbow:{wood:WEAPON_COST},
		staff:{bone:WEAPON_COST},
		wand:{bone:WEAPON_COST},
		orb:{bone:WEAPON_COST},	
	},
	body:{
		metal:{metal:ARMOR_COST},
		wood:{wood:ARMOR_COST},
		bone:{bone:ARMOR_COST},
	},
	helm:{
		metal:{metal:ARMOR_COST},
		wood:{wood:ARMOR_COST},
		bone:{bone:ARMOR_COST},
	},
	amulet:{
		ruby:{ruby:GEM_COST},
		sapphire:{sapphire:GEM_COST},
		topaz:{topaz:GEM_COST},		
	},
	ring:{
		ruby:{ruby:GEM_COST},
		sapphire:{sapphire:GEM_COST},
		topaz:{topaz:GEM_COST},	
	},
};
//equip.sellPrice BAD
var getEquipSellPrice = function(equip){
	var item = Tk.deepClone(pieceTypeToCostRatio[equip.piece][equip.type]);
	var what = item.$keys()[0];
	var amount = Math.ceil(item[item.$keys()[0]] * equip.boost.length);
	return 'x' + amount + ' ' + CST.material[what];	//BAD hardcoded id to name...
}	
var getMaterialSellPrice = function(item){
	if(item.id.$contains('ruby') || item.id.$contains('sapphire') || item.id.$contains('topaz'))
		return MATERIAL_SELL_GEM;
	return MATERIAL_SELL_NONGEM;
}

})(); //{