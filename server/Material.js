
"use strict";
var ItemModel, Message, Quest;
global.onReady(function(){
	ItemModel = rootRequire('shared','ItemModel'); Message = rootRequire('shared','Message'); Quest = rootRequire('server','Quest');
	
	
},null,'Material',[],function(){
	Material.init();
});

var DB = {};

var Material = exports.Material = function(extra){
	this.type = '';
	this.id = '';
	this.name = '';
	this.icon = '';
	this.lvl = 0;
	this.decription = 'Crafting Material';
	this.buyGoldValue = 1;
	this.sellGoldValue = 0;
	Tk.fillExtra(this,extra);
};



//sellGoldValue hardcoded in Dialog.shop 
Material.create = function(type,name,icon,lvl,buyGoldValue,sellGoldValue){
	var id = type + '-' + lvl;
	var tmp = new Material({
		type:type,
		id:id,
		name:name,
		icon:icon,
		lvl:lvl,
		buyGoldValue:buyGoldValue,
		sellGoldValue:sellGoldValue,
	});
	ItemModel.create('Qsystem',Quest.addPrefix('Qsystem',id),tmp.name,tmp.icon,[
		ItemModel.Option(Message.add,'Examine',null,['Material used to upgrade equipments or sold in shops in town.']),
	],tmp.decription,{type:CST.ITEM.material});
	
	DB[id] = tmp;
}

Material.get = function(id){
	if(!id)
		return ERROR(3,'id no string',id);
	id = id.replace('Qsystem-','');
	if(!id.$contains('-'))
		id += "-0";
	return DB[id];
}

Material.getId = function(type,lvl){
	return type + '-0';
}

Material.getRandom = function(){
	var random = Material.DROP_RATE.$random();
	return random + '-0';
}

Material.DROP_RATE = {
	metal:1/4,
	wood:1/4,
	bone:1/4,
	ruby:1/12,
	topaz:1/12,
	sapphire:1/12,
};

Material.init = function(){
	Material.create('metal','Metal','metal-metal',0,10,9);
	Material.create('metal','Iron Metal','metal-metal',20,10000,1);
	Material.create('metal','Steel Metal','metal-metal',40,10000,1);
	Material.create('metal','Gold Metal','metal-metal',60,10000,1);
	Material.create('metal','Crystal Metal','metal-metal',80,10000,1);

	Material.create('wood','Wood','wood-wood',0,10,9);
	Material.create('wood','Yellow Wood','wood-wood',20,10000,1);
	Material.create('wood','Blue Wood','wood-wood',40,10000,1);
	Material.create('wood','Grey Wood','wood-wood',60,10000,1);
	Material.create('wood','Dark Wood','wood-wood',80,10000,1);

	Material.create('bone','Bone','bone-bone',0,10,9);
	Material.create('bone','Rabbit Bone','bone-bone',20,10000,1);
	Material.create('bone','Fox Bone','bone-bone',40,10000,1);
	Material.create('bone','Wolf Bone','bone-bone',60,10000,1);
	Material.create('bone','Dragon Bone','bone-bone',80,10000,1);

	Material.create('ruby','Ruby','orb-ruby',0,30,27);
	Material.create('ruby','Flawed Ruby','orb-ruby',20,10000,1);
	Material.create('ruby','Normal Ruby','orb-ruby',40,10000,1);
	Material.create('ruby','Flawless Ruby','orb-ruby',60,10000,1);
	Material.create('ruby','Perfect Ruby','orb-ruby',80,10000,1);

	Material.create('sapphire','Sapphire','orb-sapphire',0,30,27);
	Material.create('sapphire','Flawed Sapphire','orb-sapphire',20,10000,1);
	Material.create('sapphire','Normal Sapphire','orb-sapphire',40,10000,1);
	Material.create('sapphire','Flawless Sapphire','orb-sapphire',60,10000,1);
	Material.create('sapphire','Perfect Sapphire','orb-sapphire',80,10000,1);

	Material.create('topaz','Topaz','orb-topaz',0,30,27);
	Material.create('topaz','Flawed Topaz','orb-topaz',20,10000,1);
	Material.create('topaz','Normal Topaz','orb-topaz',40,10000,1);
	Material.create('topaz','Flawless Topaz','orb-topaz',60,10000,1);
	Material.create('topaz','Perfect Topaz','orb-topaz',80,10000,1);
}




