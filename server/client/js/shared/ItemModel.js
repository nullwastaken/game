//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}

var OptionList = require2('OptionList'), ItemList = require2('ItemList'), Message = require2('Message'), Main = require2('Main');

var ItemModel = exports.ItemModel = {};
ItemModel.create = function(quest,id,name,icon,option,description,extra){	//implements OptionList
	if(!id || DB[id]) return ERROR(2,'no item id or already used id',id);
	
	var item = {
		id:id || '',
		name:name || 'buggedItem',
		icon:icon || 'system.square',
		description:description || name || '',
		trade:true, 
		drop:true,
		destroy:false,
		bank:true,
		option:option ||  [],
		type:'item',	//equip or ability
		quest:quest || '',
	};
	extra = extra || {};
	for(var i in extra) item[i] = extra[i];
	
	if(item.drop && (!item.option[item.option.length-1] || item.option[item.option.length-1].name !== 'Drop'))	//BAD
		item.option.push(ItemModel.Option(Main.dropInv,'Drop',null,[OptionList.MAIN,item.id]));
	if(item.destroy && (!item.option[item.option.length-1] || item.option[item.option.length-1].name !== 'Destroy')) 	//BAD
		item.option.push(ItemModel.Option(Main.destroyInv,'Destroy',null,[OptionList.MAIN,item.id]));
	DB[item.id] = item;
	
	return item;
}

var DB = ItemModel.DB = {};

ItemModel.Option = function(func,name,description,param){
	return OptionList.Option(func,param,name,description);
}	

ItemModel.get = function(id,noError){
	return DB[ItemModel.getId(id,noError)] || null;
}

ItemModel.getId = function(id,noError){
	if(DB[id]) return id;
	id = 'Qsystem-' + id;
	if(DB[id]) return id;
	if(!noError) ERROR(4,'invalid id',id);
	return;
}

ItemModel.use = function(item,key,opPos,notDrop){
	var option = item.option[opPos];
	if(!option || !option.func) return;
	
	if(notDrop && (option.name === 'Drop' || option.name === 'Destroy')) return;
	OptionList.executeOption(Main.get(key),option);
}

ItemModel.displayInChat = function(item,key){	//client
	Message.add(key,Message.Input('[[' + item.id + ']]',true));
}

ItemModel.compressClient = function(item){
	return item;
}

ItemModel.uncompressClient = function(item){
	return OptionList.uncompressClient(item,'useItem',item.id);	
}

ItemModel.removeFromRAM = function(id){
	delete DB[id];
}

ItemModel.getSignInPack = function(key){ //warning, compress everytime needed
	var list = ItemList.getAllItemOwned(key);
	var pack = {};
	for(var i = 0 ; i < list.length; i++){
		pack[list[i]] = ItemModel.compressClient(ItemModel.get(list[i]));
	}
	return pack;	
}










})();
