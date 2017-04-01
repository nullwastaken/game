
"use strict";
(function(){ //}	Client only
var Equip, Actor, Achievement, Main, ItemModel, Material;
global.onReady(function(){
	Equip = rootRequire('server','Equip'); Actor = rootRequire('shared','Actor'); Achievement = rootRequire('shared','Achievement'); Main = rootRequire('shared','Main'); ItemModel = rootRequire('shared','ItemModel'); Material = rootRequire('server','Material');
	global.onLoop(Shop.loop);
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.shopBuy,Command.KEY,[ //{
		Command.Param('string','Shop Id',false),
		Command.Param('string','Element Id',false),
		Command.Param('number','Amount',true),
	],Shop.buy.onCommand); //}
	Command.create(CST.COMMAND.materialSalvage,Command.KEY,[ //{
		Command.Param('string','Material Id',false),
		Command.Param('number','Amount.',true),
	],Shop.sellMaterial); //}
	
},null,'Shop',['Material'],function(){
	Shop.init();
});
var Shop = exports.Shop = function(extra){
	this.id = Math.randomId();
	this.elementList = [];	//Shop.Element[]
	this.refreshTime = Date.now();
	Tk.fillExtra(this,extra);
};

var LIST = Shop.LIST = {};
var FRAME_COUNT = 0;
var REFRESH = 25*60*60; //every hour
var COST_BASE = 10;
var ELEMENT_TYPE = [CST.ITEM.equip,CST.ITEM.material,CST.ITEM.misc];

Shop.create = function(id,elementList){
	var s = new Shop({
		id:id,
		elementList:elementList,	
	});
	LIST[s.id] = s;
	return s;
}

Shop.generateElementList = function(){	//return list
	var list = [];
	
	list.push(Shop.Element.Material('metal-0'));
	list.push(Shop.Element.Material('bone-0'));
	list.push(Shop.Element.Material('wood-0'));
	list.push(Shop.Element.Material('sapphire-0'));
	list.push(Shop.Element.Material('ruby-0'));
	list.push(Shop.Element.Material('topaz-0'));
	
	for(var i = 0 ; i < 9; i++){
		list.push(Shop.Element.randomlyGenerateEquip());
	}
	list.push(Shop.Element.randomlyGenerateEquip(4));
	
	return list;
}

Shop.init = function(){
	Shop.create('general',Shop.generateElementList());
}

Shop.loop = function(){
	FRAME_COUNT++;
	if(FRAME_COUNT % REFRESH !== 0)	
		return;
	for(var i in LIST){
		Shop.refreshStock(Shop.get(i));
	}
}

Shop.refreshStock = function(s){
	s.elementList = Shop.generateElementList();
	s.refreshTime = Date.now();
}


Shop.get = function(id){
	return LIST[id];
}

Shop.Element = function(elementType,icon,name,description,costList,extra){
	if(!ELEMENT_TYPE.$contains(elementType))
		return ERROR(3,'invalid elementType',elementType);
	var e = {
		elementType:elementType,
		id:Math.randomId(),
		icon:icon || '',
		name:name || '',
		description:description || '',
		costList:costList || ERROR(3,'no costList',costList,name),	//{id:amount}
		color:'',
		//equip only
		type:null,
		piece:null,
		boostAmount:null,
		//not-equip
		itemId:null,
	}
	for(var i in extra){
		if(e[i] === undefined)
			ERROR(3,'invalid extra',i);
		e[i] = extra[i];
	}
	return e;	
}

Shop.Element.Equip = function(pieceType,boostAmount,name,costList){
	var color = Equip.Color({maxBoostAmount:boostAmount});
	color = CST.color[color];
	var equip = {
		piece:pieceType.piece,
		type:pieceType.type,
		boostAmount:boostAmount,
		color:color,		
	}
	var icon = Equip.Icon(equip);
	var description = boostAmount + ' Random Boost' + (boostAmount >=2 ? 's' : '');

	return Shop.Element('equip',icon,name,description,costList,equip);
}

Shop.Element.randomlyGenerateEquip = function(boostAmount){
	boostAmount = boostAmount === undefined ? Shop.Element.generateBoostAmount() : boostAmount;	
	var pieceType = Equip.PieceType();
	var name = Equip.Name(pieceType,new Array(boostAmount));
	var costList = Shop.Element.generateEquipCost(pieceType,boostAmount);

	return Shop.Element.Equip(pieceType,boostAmount,name,costList);
}

Shop.Element.generateBoostAmount = function(){
	var r = Math.random();
	if(r < 1/64)
		return 5;
	if(r < 1/16)
		return 4;
	if(r < 1/2)
		return 3;
	return 2;
}

Shop.Element.generateEquipCost = function(pieceType,boostAmount){
	if(pieceType === undefined || boostAmount === undefined)
		return ERROR(3,'boostAmount and pieceType should be defined at this point');
	
	var costRatio = Equip.getPieceTypeToCostRatio(pieceType.piece,pieceType.type);
	var costList = {};
	for(var i in costRatio){
		costRatio[i] *= COST_BASE;
		if(boostAmount === 3)
			costRatio[i] *= 1.5;
		else if(boostAmount === 4)
			costRatio[i] *= 2;
		else if(boostAmount >= 5)
			costRatio[i] *= 3;
		costRatio[i] = Math.ceil(costRatio[i]);
		
		costList[Material.getId(i)] = costRatio[i];			
	}
	return costList;	
}

Shop.Element.Item = function(itemId,costList){
	var item = ItemModel.get(itemId);
	if(!item)
		return ERROR(3,'item doesnt exist',itemId);
	return Shop.Element(CST.ITEM.misc,item.icon,item.name,item.description,costList,{
		itemId:itemId
	});
}

Shop.Element.Material = function(matId){
	var mat = Material.get(matId);
	var buyGoldValue = Material.get(matId).buyGoldValue;
	
	var costList = {};
	costList[CST.ITEM_GOLD] = buyGoldValue;
	return Shop.Element(CST.ITEM.material,mat.icon,mat.name,mat.description,costList,{
		itemId:mat.id
	});
}

Shop.Element.onBuyGetId = function(element,lvl){
	if(element.itemId)
		return element.itemId;
	
	var maxBoostAmount = element.boostAmount;
	var visibleBoostAmount = Math.min(3,maxBoostAmount);
	
	var e = Equip.createFromBasicInfo(element.piece,element.type,element.name,lvl,maxBoostAmount,visibleBoostAmount);
	return e.id;
}

//ts("Shop.buy(key,'general',Shop.LIST.general.elementList[0].id)")
Shop.buy = function(key,shopId,elementId,displayMessage){
	var s = Shop.get(shopId);
	if(!s)
		return Main.addMessage(key,'ERROR: No shop with that id.');
	var element = null;
	for(var i = 0 ; i < s.elementList.length; i++)
		if(s.elementList[i].id === elementId){
			element = s.elementList[i];
			break;
		}
	var main = Main.get(key);
	if(!element)
		return Main.addMessage(main,'ERROR: No element with that id.');
		
	var lvl = Actor.getLevel(Main.getAct(main));
	
	if(!Main.haveItem(main,element.costList)){
		if(displayMessage)
			Main.addPopup(main,'You don\'t have the resources to buy that item.');
		return;
	}
	
	Main.removeItem(main,element.costList);
	var itemId = Shop.Element.onBuyGetId(element,lvl);
	Main.addItem(main,itemId,1);
	if(displayMessage)
		Main.addMessage(main,'You bought ' + element.name + '.');

	Achievement.onShopBuy(main);
}

Shop.buy.onCommand = function(key,shopId,elementId,amount){
	if(!Actor.isInTownMap(Actor.get(key)))	//BAD...
		return Main.addMessage(Main.get(key),'You need to be in town to use shops.');
	amount = amount || 1;
	Shop.buy(key,shopId,elementId,true);
	
	for(var i = 1 ; i < amount; i++)
		Shop.buy(key,shopId,elementId,false);
}


Shop.compressClient = function(shop){
	return shop;	
}

Shop.sellMaterial = function(key,id,amount){
	var main = Main.get(key);
	if(!Actor.isInTownMap(Actor.get(key)))
		return Main.addMessage(main,'You need to be in town to use shops.');
	
	amount = amount || 1;
	amount = Math.floor(amount);
	
	var mat = Material.get(id);
	if(!mat)
		return Main.addMessage(main,'Invalid material id ' + id);

	amount = Math.min(amount,Main.getItemAmount(main,id));	
	if(amount === 0)
		return Main.addMessage(main,'You don\'t have that material.');
	var gold = mat.sellGoldValue;
	
	Main.removeItem(main,id,amount);
	Main.addItem(main,'Qsystem-gold',gold*amount);
	Main.addMessage(main,'You received ' + (gold*amount) + " gold.");
	
}

})();














