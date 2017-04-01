
"use strict";
(function(){ //}
var OptionList, IconModel, ItemList, Message, Main;
global.onReady(function(){
	OptionList = rootRequire('shared','OptionList'); IconModel = rootRequire('shared','IconModel'); ItemList = rootRequire('shared','ItemList'); Message = rootRequire('shared','Message'); Main = rootRequire('shared','Main');
});
var ItemModel = exports.ItemModel = function(extra){
	this.id = '';
	this.name = '';
	this.icon = '';
	this.description = '';
	this.trade = true;
	this.drop = true;
	this.destroy = false;
	this.adminOnly = false;
	this.bank = true;
	this.option = [];
	this.type = CST.ITEM.misc;
	this.quest = '';	
	Tk.fillExtra(this,extra);
};

ItemModel.create = function(quest,id,name,icon,option,description,extra){	//implements OptionList
	if(!id || DB[id]) 
		return ERROR(2,'no item id or already used id',id);
	
	var tmp = new ItemModel({
		id:id,
		name:name,
		icon:icon,
		description:description || name,
		option:option,
		quest:quest,
	});
	Tk.fillExtra(tmp,extra);
	
	if(tmp.destroy && (!tmp.option[tmp.option.length-1] || tmp.option[tmp.option.length-1].name !== 'Destroy')) 	//BAD
		tmp.option.push(ItemModel.Option(Main.destroyInv,'Destroy',null,[OptionList.MAIN,tmp.id]));
	else if(tmp.drop && (!tmp.option[tmp.option.length-1] || tmp.option[tmp.option.length-1].name !== 'Drop'))	//BAD
		tmp.option.push(ItemModel.Option(Main.dropInv,'Drop',null,[OptionList.MAIN,tmp.id]));
	DB[tmp.id] = tmp;
	
	IconModel.testIntegrity(tmp.icon);

	return tmp;
}

var DB = ItemModel.DB = {};

ItemModel.Option = function(func,name,description,param){
	return OptionList.Option(func,param,name,description);
}	

ItemModel.get = function(id,noError){
	return DB[ItemModel.getId(id,noError)] || null;
}

ItemModel.getId = function(id,noError){
	if(DB[id]) 
		return id;
	id = 'Qsystem-' + id;
	if(DB[id]) 
		return id;
	if(!noError) 
		ERROR(4,'invalid id',id);
	return;
}
if(!SERVER)
	ItemModel.getId = function(id){
		if(id[0] === 'Q') return id;
		return 'Qsystem-' + id;
	}



ItemModel.displayInChat = function(id,amount){	//client
	if(!amount || amount <= 1)
		Message.add(null,Message.Input('[[' + id + ']]',true));
	return Message.add(null,Message.Input('[[' + id + ']]x' + amount + ',',true));
}

ItemModel.compressClient = function(item){
	return item;
}

ItemModel.uncompressClient = function(item){
	return OptionList.uncompressClient(item,CST.COMMAND.useItem,item.id);	
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
