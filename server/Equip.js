
"use strict";
var Message, Stat, Achievement, Metrics, ItemList, Boost, OptionList, Combat, Material, CraftBoost, ItemModel, Main, Actor;
global.onReady(function(initPack){
	Message = rootRequire('shared','Message'); Stat = rootRequire('shared','Stat'); Achievement = rootRequire('shared','Achievement'); Metrics = rootRequire('server','Metrics'); ItemList = rootRequire('shared','ItemList'); Boost = rootRequire('shared','Boost'); OptionList = rootRequire('shared','OptionList'); Combat = rootRequire('server','Combat'); Material = rootRequire('server','Material'); CraftBoost = rootRequire('server','CraftBoost'); ItemModel = rootRequire('shared','ItemModel'); Main = rootRequire('shared','Main'); Actor = rootRequire('shared','Actor');
	db = initPack.db;
	global.onLoop(Equip.loop);
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.equipUnlockBoost,Command.KEY,[ //{
		Command.Param('string','Equip Id',false),
		Command.Param('string','Popup if success',true,{whiteList:['equip','equipPopup']}),
	],Equip.unlockBoost.onCommand); //}

	Command.create(CST.COMMAND.equipRerollStat,Command.KEY,[ //{
		Command.Param('string','Equip Id',false),
		Command.Param('number','Slot',false),
		Command.Param('string','Popup if success',true,{whiteList:['equip','equipPopup']}),
	],Equip.rerollStat.onCommand); //}

	Command.create(CST.COMMAND.equipRerollPower,Command.KEY,[ //{
		Command.Param('string','Equip Id',false),
		Command.Param('string','Popup if success',true,{whiteList:['equip','equipPopup']}),
	],Equip.rerollPower.onCommand); //}

	Command.create(CST.COMMAND.equipTier,Command.KEY,[ //{
		Command.Param('string','Equip Id',false),
		Command.Param('string','Popup if success',true,{whiteList:['equip','equipPopup']}),
	],Equip.increaseTier); //}

	Command.create(CST.COMMAND.equipSalvage,Command.KEY,[ //{
		Command.Param('string','Equip Id',false),
		Command.Param('boolean','Bypass confirm.',true),
	],Equip.salvage); //}

},{db:['equip']});

var Equip = exports.Equip = function(extra){
	this.quest = '';
	this.id = START_ITEM_ID + Math.randomId();
	this.piece = 'helm';	//HCODE
	this.type = 'metal';	//HCODE
	this.name = "Hello Kitty";
	this.icon = '';
	this.lvl = 0;
	this.powerRoll = 0;
	this.def = null;	//Equip.Def
	this.dmg = null;	//Equip.Dmg
	this.tier = 0;
	this.tierCost = 0;	//only for client
	this.boost = [];
	this.creator = '';
	this.rerollStatCount = 0;
	this.accountBound = false;
	this.color = Equip.COLOR.WHITE;
	this.salvagable = false;
	this.maxBoostAmount = 0;
	this.creationDate = Date.now();
	this.upgradable = false;
	this.unlockBoostCost = null;	//Equip.UpgradeCost client only
	this.rerollStatCost = null;	//Equip.UpgradeCost client only
	this.category = 'armor';	//HCODE
	Tk.fillExtra(this,extra);
};
var DB = Equip.DB = {};
var db = null; 	//Equip.init
var START_ITEM_ID = 'E';

var TO_DELETE = {};	//eid:playerKey

var UPGRADE_ITEM_COST_MULT = 5;
var ARMOR_COST = 1;
var GEM_COST = 0.5;
var WEAPON_COST = 1.5;
var FRAME = 0;
var REROLL_COST_MULT = 1.15; // 1.15 =>  10=4, 1.2 => 10=6, 1.12 => 10=3.1, 20 => x9.6  ||||| 1.1 =>>>> 10 => x2.6, 20 => x6.72

var POWER_BASE = 0.9;
var POWER_VAR = 0.2;
var POWER_REROLL_CAP_RATIO = 1/4;


Equip.create = function(quest,id,piece,type,name,lvl,powerRoll,boost,extra,addDb){	//called directly when creating quest equip
	piece = piece || extra.piece;
	type = type || extra.type;
	
	var equip = new Equip({
		quest:quest || '',	//important cuz schema
		piece:piece,
		type:type,
		name:name,
		lvl:lvl,
		boost:boost || [],
		category:CST.isWeapon(piece) ? 'weapon' : 'armor'
	});
	Tk.fillExtra(equip,extra);
	
	equip.color = Equip.Color(equip);
	equip.icon = Equip.Icon(equip);	//after color
	
	powerRoll = powerRoll || extra.powerRoll;
	if(isNaN(powerRoll))
		powerRoll = Equip.generatePowerRoll(equip);	//after color
		
	equip.powerRoll = powerRoll;
	
	equip.def = Equip.getDef(equip);
	equip.dmg = Equip.getDmg(equip);
	
	equip.tierCost = Equip.getTierUpCost(equip);
	equip.unlockBoostCost = Equip.unlockBoost.getCost(equip);
	equip.rerollStatCost = Equip.rerollStat.getCost(equip);
		
	equip.id = id || equip.id;
		
	DB[equip.id] = equip;
	Equip.createItemVersion(equip);
	
	Equip.verifyIntegrity(equip);
	if(addDb !== false) 
		db.equip.upsert({id:equip.id}, Equip.compressDb(Tk.deepClone(equip)), db.err);
	return equip;
}
Equip.createFromModel = function(equip,addDb){
	return Equip.create(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,equip,addDb);
}	

//note: rerollCount only increase if choose new boost/power

Equip.COLOR = {WHITE:'white',BLUE:'blue',ORANGE:'orange',GOLD:'gold'};	//shouldnt be capped

Equip.PIECE_VALUE_MOD = {
	ring:1.5,	
	amulet:2,		
	helm:1.5,	
	body:2,
	weapon:1.5,
};

Equip.PREFIX = ['Awesome','Super','Amazing','Great','Good','Nice','Cool','Legendary','Rare','Epic','Lame'];
Equip.SUFFIX = ['of Strength','of The Lord','of Swiftness','of The Great','of The Coward','of Wisdom','of Courage','of Epicness'];

Equip.get = function(id){
	return DB[id] || null;
}

Equip.verifyIntegrity = function(equip){
	if(isNaN(equip.dmg.main)){
		ERROR(3,'dmg main is NaN', equip.id,equip.name,equip);
		equip.dmg.main = 0;
	}
	if(isNaN(equip.def.main)){
		ERROR(3,'def main is NaN', equip.id,equip.name,equip);
		equip.def.main = 0;
	}	
}


//#######################

Equip.createFromBasicInfo = function(piece,type,name,lvl,maxBoostAmount,visibleBoostAmount){
	var boost = Equip.generateBoost(visibleBoostAmount,piece,type,lvl);
	
	var extra = {
		upgradable:true,
		salvagable:true,
		maxBoostAmount:maxBoostAmount,
	}
	var id = START_ITEM_ID + Math.randomId();
	return Equip.create(undefined,id,piece,type,name,lvl,undefined,boost,extra,true);
}

Equip.randomlyGenerateFromQuestReward = function(act,minBoost,pieceType){	//minBoost and pieceType might be undefined
	return Equip.randomlyGenerate(act.username,pieceType,Actor.getLevel(act),undefined,minBoost);
}

Equip.randomlyGenerate = function(creator,pieceType,lvl,visibleBoost,totalBoost){
	pieceType = pieceType || Equip.PieceType();

	var id = START_ITEM_ID + Math.randomId();
	var piece = pieceType.piece;
	var type = pieceType.type;
	lvl = Equip.Lvl(lvl || 0);
	var maxBoostAmount = typeof totalBoost === 'number' ? totalBoost : Equip.generateMaxBoostAmount();
	var visibleBoostAmount = typeof visibleBoost === 'number' ? visibleBoost : Equip.generateVisibleBoostAmount(maxBoostAmount);
	var boost = Equip.generateBoost(visibleBoostAmount,piece,type,lvl);
	
	var extra = {
		upgradable:true,
		salvagable:true,
		maxBoostAmount:maxBoostAmount,
		creator:creator || '',
	}
	var name = Equip.Name(pieceType,boost);
	
	return Equip.create('',id,piece,type,name,lvl,undefined,boost,extra,true);
};

Equip.PieceType = function(piece,type){
	if(piece && type)
		return {piece:piece,type:type};
	
	if(!piece) piece = CST.equip.piece.concat(['weapon']).$random();	//weapon is 2/6, others are 1/6
	if(piece === 'armor') piece = ['amulet','ring','body','helm'].$random();
	if(piece === 'weapon') return {piece:'weapon',type:CST.equip.weapon.$random()};
	if(piece === 'amulet') return {piece:'amulet',type:CST.equip.amulet.$random()};
	if(piece === 'ring') return {piece:'ring',type:CST.equip.ring.$random()};
	if(piece === 'body') return {piece:'body',type:CST.equip.body.$random()};
	if(piece === 'helm') return {piece:'helm',type:CST.equip.helm.$random()};
	return ERROR(3,'invalid piece',piece);
}

Equip.PieceType.toString = function(pieceType){
	return pieceType.type.$capitalize() + ' ' + pieceType.piece.$capitalize();
}

Equip.generatePowerRoll = function(equip){	//linked with Equip.rerollPower.getReroll
	var r = Math.random();
	if(equip.color === Equip.COLOR.GOLD || equip.color === Equip.COLOR.ORANGE)
		if(r < 0.5)
			r += 0.5;
	return POWER_BASE + r*POWER_VAR;
}

Equip.generateMaxBoostAmount = function(){	//2/3 => 2, 1/3 => 3, 1/9 => 4, 1/27 => 5, 1/81 => 6...
	var amount = Math.random();
	amount = -Math.logBase(3,amount);	//above 1/3 => 0, 1/3 => 1, 1/9 => 2, 1/27 => 3
	amount = Math.floor(amount);
	amount += 2;
	if(amount > 6) amount = 6; //1/128
	return amount;
}
Equip.generateVisibleBoostAmount = function(max){
	return Math.min(max,3);
}

Equip.generateBoost = function(amount,piece,type,lvl){
	if(!amount) 
		return [];
	
	var boost = [];
	for(var i = 0 ; i < amount ; i++)
		boost.push(Equip.generateBoost.one(piece,type,lvl,i));
	return boost;	
}
Equip.generateBoost.one = function(piece,type,lvl,slot){
	if(piece === 'weapon' && slot === 0)
		return CraftBoost.generateBoost('weaponFirstBoost',type,lvl);
	return CraftBoost.generateBoost(piece,type,lvl);	
}

Equip.UpgradeCost = function(array){	//convert array to {}
	var item = {};
	for(var i in array){
		if(!array[i][1]) 
			continue;	//not include if 0
		item[array[i][0]] = array[i][1];
	}
	
	return item;
}

Equip.getPieceTypeToCostRatio = function(piece,type){
	if(!pieceTypeToCostRatio[piece])
		return ERROR(3,'invalid piece',piece,type);
	return Tk.deepClone(pieceTypeToCostRatio[piece][type]) || ERROR(3,'invalid type',piece,type);
}
var pieceTypeToCostRatio = {	//duped in Dialog_shop
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

Equip.Name = function(pieceType,boost){
	boost = boost || [];
	var name = '';
	if(pieceType.piece === 'weapon'){
		name = pieceType.type.$capitalize();
	} else {
		name = pieceType.type.$capitalize() + ' ' + pieceType.piece.$capitalize();
	}
	if(boost.length === 4){
		name = Equip.PREFIX.$random() + ' ' + name
	}
	if(boost.length === 5){
		name = name + ' ' + Equip.SUFFIX.$random();
	}
	if(boost.length >= 6)
		name = Equip.PREFIX.$random() + ' ' + name + ' ' + Equip.SUFFIX.$random();
	return name;
}

Equip.Lvl = function(lvl){
	lvl = lvl || 0;
	var varLvl = Math.ceil(lvl * 0.1) + 2;	//var between lowest and highest lvl
	var r = Math.ceil(Math.random() * varLvl);
	
	var ret = lvl - varLvl + r + 1;	//aka, most of time lower, but can be 1 lvl over
	if(ret < 0)
		return 0;
	return ret;
}
//var a = 10; [Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a),Lvl(a)];

Equip.Boost = function(stat,value,type){
	return Boost.Perm(stat,value,type);
}

//#######################

Equip.Def = Equip.Dmg = function(equip,main){
	if(isNaN(main)){
		ERROR(3,'invalid main power');
		main = 0;
	}
	return {
		main:main,
		ratio:Equip.generateRatio(equip.piece,equip.type)
	};
}

Equip.getDmg = function(equip){  //1.5 is if good element?
	if(equip.piece !== 'weapon')
		return Equip.Dmg(equip,0);
	var main = Combat.getEquipMainDmgDefByLvl(equip.lvl)/Combat.WEAPON_MAIN_MOD * equip.powerRoll * Combat.getTierMod(equip.tier);
	return Equip.Dmg(equip,main);
}

Equip.getDef = function(equip){ //2.25 is average?
	if(equip.piece === 'weapon')
		return Equip.Def(equip,0);
		
	var main = Combat.getEquipMainDmgDefByLvl(equip.lvl)/Combat.ARMOR_MAIN_MOD * equip.powerRoll * Combat.getTierMod(equip.tier);
	return Equip.Def(equip,main);
}

Equip.Icon = function(equip){
	if(!equip.piece || !equip.type || !equip.color){
		ERROR(3,'invalid Equip.Icon',equip);
		return 'body-metal-white';
	}
	return equip.piece + '-' + equip.type + '-' + equip.color;	//Img.getIcon
}

Equip.Color = function(equip){
	if(equip.maxBoostAmount <= 1) return Equip.COLOR.WHITE; 
	if(equip.maxBoostAmount <= 3) return Equip.COLOR.BLUE;  
	if(equip.maxBoostAmount <= 5) return Equip.COLOR.ORANGE;  
	return Equip.COLOR.GOLD;  
}

Equip.compressDb = function(e){
	delete e.unlockBoostCost;
	delete e.rerollStatCost;
	delete e.tierCost;
	delete e.dmg;
	delete e.def;
	
	if(!Equip.getDbSchema()(e))
		ERROR(3,'data not following schema',JSON.stringify(Equip.getDbSchema().errors(e)),e);
	return e;
}

Equip.uncompressDb = function(e){
	if(!Equip.getDbSchema()(e))
		ERROR(3,'data not following schema',JSON.stringify(Equip.getDbSchema().errors(e)),e);
	//check Equip.create for real uncompress	
	return e;
}

var schema;
Equip.getDbSchema = function(){
	schema = schema || require('js-schema')({
		accountBound : Boolean,
        boost : Array.of(CraftBoost.getDbSchema()),
        category : String,
        color : String,
        creator : String,
        icon : String,
        id : String,
        lvl : Number,
        maxBoostAmount : Number,
        name : String,
        piece : String,
        powerRoll : Number,
        quest : String,
        rerollStatCount : Number,
        salvagable : Boolean,
        type : String,
        upgradable : Boolean,
		tier:Number,
		creationDate:Number,
		'*':null
	});
	return schema;
}

Equip.uncompressDbAndAdd = function(e){
	e = Equip.uncompressDb(e);
	if(DB[e.id])	//already there
		return;
	Equip.createFromModel(e,false);
}

Equip.compressClient = function(equip){
	return equip;
}

Equip.generateRatio = function(piece,type){
	//Weapon
	if(type === 'mace') return {melee:1.5,range:1,magic:1,fire:1.5,cold:1,lightning:1};
	else if(type === 'spear') return {melee:1.5,range:1,magic:1,fire:1,cold:1.5,lightning:1};
	else if(type === 'sword') return {melee:1.5,range:1,magic:1,fire:1,cold:1,lightning:1.5};
	else if(type === 'bow') return {melee:1,range:1.5,magic:1,fire:1.5,cold:1,lightning:1};
	else if(type === 'crossbow') return {melee:1,range:1.5,magic:1,fire:1,cold:1.5,lightning:1};
	else if(type === 'boomerang') return {melee:1,range:1.5,magic:1,fire:1,cold:1,lightning:1.5};
	else if(type === 'wand') return {melee:1,range:1,magic:1.5,fire:1.5,cold:1,lightning:1};
	else if(type === 'staff') return {melee:1,range:1,magic:1.5,fire:1,cold:1.5,lightning:1};
	else if(type === 'orb') return {melee:1,range:1,magic:1.5,fire:1,cold:1,lightning:1.5};
	
	//Armor
	var valueStab = Equip.PIECE_VALUE_MOD[piece];
	
	if(type === 'metal') return {melee:valueStab,range:1,magic:1,fire:0,cold:0,lightning:0};
	else if(type === 'wood') return {melee:1,range:valueStab,magic:1,fire:0,cold:0,lightning:0};
	else if(type === 'bone') return {melee:1,range:1,magic:valueStab,fire:0,cold:0,lightning:0};
	
	else if(type === 'ruby') return {melee:0,range:0,magic:0,fire:valueStab,cold:1,lightning:1};
	else if(type === 'sapphire') return {melee:0,range:0,magic:0,fire:1,cold:valueStab,lightning:1};
	else if(type === 'topaz') return {melee:0,range:0,magic:0,fire:1,cold:1,lightning:valueStab};
	
	return ERROR(3,'wrong type or piece',type,piece) || {melee:0,range:0,magic:0,fire:1,cold:1,lightning:1.5}
}

Equip.createItemVersion = function(equip){
	var option = [
		ItemModel.Option(Main.openDialog,'Examine Equip',null,[OptionList.MAIN,'equipPopup',{id:equip.id}]),	//based on Dialog.EquipPopup
		ItemModel.Option(Actor.equip.click,'Wear Equip',null,[OptionList.ACTOR,equip.id]),
	];
	var extra = {type:'equip',drop:0};
	
	if(!equip.salvagable)
		option.push(ItemModel.Option(Equip.destroy,'Destroy','Destroy the equip permanently.',[equip.id]));
	else
		option.push(ItemModel.Option(Equip.salvage,'Salvage','Destroy equip into crafting materials.',[equip.id]));

	//if(equip.upgradable && equip.boost.length < equip.maxBoostAmount)	
	//	option.push(ItemModel.Option(Equip.unlockBoost.onCommand,'Upgrade','Use crafting materials to unlock addition boost.',[equip.id]));
		
	ItemModel.create(equip.quest,equip.id,equip.name,Equip.Icon(equip),option,null,extra);
}

//#########################


Equip.removeFromDb = function(eid){	//main problem is that if server crash and doesnt save, player will lose item
	if(!DB[eid]) return ERROR(3,'equip dont exist',eid);
	if(DB[eid].quest) return;
	delete DB[eid];
	db.equip.remove({id:eid});
}

Equip.removeFromDb.safe = function(eid,playerKey){
	if(!DB[eid]) return ERROR(3,'equip dont exist',eid);
	if(DB[eid].quest) return;
	TO_DELETE[eid] = playerKey;
}

Equip.loop = function(){
	if(FRAME++ % (25*60) !== 0) 
		return;
	
	for(var i in TO_DELETE){
		if(!Actor.get(TO_DELETE[i])){	//aka disconnected
			delete TO_DELETE[i];
			Equip.removeFromDb(i);
		}
	}
}

Equip.salvage = function(key,id,bypassConfirm){
	var main = Main.get(key);
	
	if(!Main.quest.haveCompletedTutorial(main))
		return Message.add(key,'You can\'t salvage while doing the tutorial.'); //BAD
		
	if(!Main.haveItem(main,id)) 
		return;	//normal is double click
	var equip = DB[id];
	if(!equip) 
		return ERROR(3,'no equip');
	if(!equip.salvagable) 
		return Message.add(key,'You can\'t sell the equip.'); //BAD
	
	
	var func = function(){
		Main.removeItem(main,id);
		
		//add item
		var item = Equip.getSalvageGain(equip);
		Main.addItem(main,item);
			
		Message.add(key,'You received: ' + ItemList.stringify(item) + '.');
		
		Achievement.onSalvage(main,id);
		Equip.removeFromDb.safe(id,key);
	}
	if(!bypassConfirm)
		Main.askQuestion(main,func,'Are you sure you want to destroy this equip into crafting materials?','boolean');
	else func();
}

Equip.destroy = function(key,id){
	var main = Main.get(key);
	Main.askQuestion(main,function(){
		Main.removeItem(main,id);
		Equip.removeFromDb.safe(id,key);
	},'Destroy this equip permanently?','boolean');
}

Equip.fetchList = function(list,username,cb){
	db.equip.find({id:{$in:list}},{_id:0},function(err,results){
		if(err) ERROR.err(3,err);
		for(var i = 0 ; i < results.length; i++)	
			Equip.uncompressDbAndAdd(results[i]);
		cb();
	})	
}

Equip.onSignOff = function(inv,bank,equip){
	return;	//eventually, should removeFromRam	
	/*
	// !quest => randomly generated
	for(var i in inv){
		if(Equip.get(i) && !Equip.get(i).quest)	//i[0] === START_ITEM_ID
			Equip.removeFromRAM(i);
	}
	for(var i in bank){
		if(Equip.get(i) && !Equip.get(i).quest)
			Equip.removeFromRAM(i);
	}
	for(var i in equip){
		if(equip[i] && !Equip.get(equip[i]).quest)
			Equip.removeFromRAM(equip[i]);
	}
	*/	
}

Equip.getAllEquipOwned = function(key,onlyEquipped){
	var list = onlyEquipped === true ? [] : ItemList.getAllItemOwned(key);
	var equip = Actor.getEquip(Actor.get(key)).piece;
	
	for(var i in equip)
		if(equip[i])
			list.push(equip[i]);
	
	for(var i = list.length-1; i >= 0; i--){
		if(!Equip.get(list[i]))
			list.splice(i,1);
	}
	return list;
}

Equip.getAllEquipOwned.inventoryOnly = function(key){
	var list = ItemList.getData(Main.get(key).invList);
	var tmp = [];
	for(var i in list){
		if(Equip.get(i))
			tmp.push(i);
	}
	return tmp;
}	

Equip.removeFromRAM = function(id){
	delete DB[id];
	ItemModel.removeFromRAM(id);
}

Equip.getSignInPack = function(key){	//warning, compress everytime needed
	var list = Equip.getAllEquipOwned(key);
	var pack = {};
	for(var i = 0 ; i < list.length; i++){
		pack[list[i]] = Equip.compressClient(Equip.get(list[i]));
	}
	return pack;	
}

//########################

Equip.unlockBoost = function(equip){
	var equip = Tk.deepClone(equip);	//case Qsystem-
	
	equip.quest = '';	//otherwise, start weapon cant be tracked
	equip.id = Math.randomId();
	equip.boost.push(CraftBoost.generateBoost(equip.piece,equip.type,equip.lvl));	//add boost
	//cost updated in Equip.create
	return Equip.createFromModel(equip,true);
}

Equip.unlockBoost.onCommand = function(key,eid,popup){
	var equip = Equip.get(eid);
	if(!equip) return;
	if(!equip.upgradable)
		return Message.addPopup(key,'You can\'t upgrade this equip.');
	if(equip.boost.length >= equip.maxBoostAmount)
		return Message.addPopup(key,'You can not longer upgrade this equip.');
	
	var main = Main.get(key);
	if(!Main.haveItem(main,equip.unlockBoostCost))
		return Message.addPopup(key,'You don\'t have the material required:<br> ' + ItemList.stringify(equip.unlockBoostCost));
	
	
	var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
	var act = Actor.get(key);
	if(Actor.haveEquip(act,eid)){
		weared = true;
		Actor.removeEquip(act,equip.piece);
	}
	
	if(!Main.haveItem(main,eid)) 
		return Message.add(key,'You don\'t have this item.');	//happens if u click fast?
		
	Main.removeItem(main,eid);
	Main.removeItem(main,equip.unlockBoostCost);
	
	var newid = Equip.unlockBoost(equip).id;
	Main.addItem(main,newid);
	Equip.removeFromDb.safe(eid,key);
	
	if(weared)
		Actor.changeEquip(act,newid);
	
	Metrics.onEquipUpgrade(key);
	Achievement.onEquipUpgrade(main,newid);
	Message.add(key,'You upgraded your equip. It now has an additional boost.');	
	Main.playSfx(main,'levelUp');
	if(popup)
		Main.openDialog(main,popup,{id:newid,owning:true});
}

Equip.unlockBoost.getCost = function(equip){
	var unlockCountAlready = Math.max(0,equip.boost.length - 3);		
	
	var costRatio = Equip.getPieceTypeToCostRatio(equip.piece,equip.type);
	
	var mult = Math.max(1,equip.lvl) * Math.pow(UPGRADE_ITEM_COST_MULT,unlockCountAlready);
	
	var itemList = [];
	for(var i in costRatio){
		itemList.push([
			Material.getId(i),
			Math.ceil(mult*costRatio[i])			
		]);
	}	

	return Equip.UpgradeCost(itemList);
}

Equip.increaseTier = function(key,eid,popup){
	var main = Main.get(key);
	var equip = Equip.get(eid);
	if(!equip) return;
	
	if(!equip.upgradable)
		return Message.add(key,'You can\'t upgrade this equip.');

	var currentExp = Actor.getEquipExp(Actor.get(key));
	var cost = Equip.getTierUpCost(equip);
	if(currentExp < cost)
		return Message.add(key,'You don\'t have enough Equip Exp to upgrade that equip.');
	
	var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
	var act = Actor.get(key);
	if(Actor.haveEquip(act,eid)){
		weared = true;
		Actor.removeEquip(act,equip.piece);
	}	
	
	if(!Main.haveItem(main,eid)) 
		return Message.add(key,'You don\'t have this equip.');	//possible cuz no prior verification
			
	var equip = Tk.deepClone(equip);	//case Qsystem-
	equip.tier++;
	equip.def = Equip.getDef(equip);
	equip.dmg = Equip.getDmg(equip);
	equip.tierCost = Equip.getTierUpCost(equip);
	equip.id = Math.randomId();
	
	Actor.removeEquipExp(Actor.get(key),cost);
	Main.removeItem(Main.get(key),eid);
	Equip.removeFromDb.safe(eid,key);
	
	Equip.createFromModel(equip,true);
	Main.addItem(Main.get(key),equip.id);
	
	if(weared)
		Actor.changeEquip(act,equip.id);
		
	Message.add(key,'Your equip is now more powerful.');	
	Main.playSfx(main,'levelUp');
	if(popup)
		Main.openDialog(main,popup,{id:equip.id,owning:true});
}

Equip.getTierUpCost = function(eq){
	var baseCost = (CST.exp[eq.lvl+1] - CST.exp[eq.lvl])/10;
	baseCost *= Math.pow(2,eq.tier);
	return Tk.round(baseCost);
}

Equip.rerollStat = function(equip,slot,newBoost){
	if(!newBoost)
		return ERROR(3,'no newBoost');
	
	var equip = Tk.deepClone(equip);	//case Qsystem-
	
	equip.quest = '';	//otherwise, start weapon cant be tracked
	equip.id = Math.randomId();
	
	equip.rerollStatCount++;
	equip.boost[slot] = newBoost;
	//cost updated in Equip.create
	return Equip.createFromModel(equip,true);
}

Equip.rerollStat.onCommand = function(key,eid,slot,popup){
	var equip = Equip.get(eid);
	if(!equip) 
		return;
	if(!equip.upgradable)
		return Message.addPopup(key,'You can\'t upgrade this equip.');
	
	if(!equip.boost[slot])
		return Message.addPopup(key,'Invalid reroll slot.');
		
	var main = Main.get(key);
	
	var act = Actor.get(key);
	if(!Main.haveItem(main,eid) && !Actor.haveEquip(act,eid))
		return Message.add(key,'You don\'t have this equip.');
	
	if(!Main.haveItem(main,equip.rerollStatCost))
		return Message.addPopup(key,'You don\'t have the material required:<br> ' + ItemList.stringify(equip.rerollStatCost));
	Main.removeItem(main,equip.rerollStatCost);
	
	
	var boostList = [
		Equip.generateBoost.one(equip.piece,equip.type,slot),
		Equip.generateBoost.one(equip.piece,equip.type,slot)	
	];
	
	var first = Stat.getNiceBoostText(boostList[0]);
	var second = Stat.getNiceBoostText(boostList[1]);
	var third = Stat.getNiceBoostText(equip.boost[slot]);
	var optionList = [
		first.stat + ' ' + first.value,
		second.stat + ' ' + second.value,
		'Keep ' + third.stat + ' ' + third.value,
	];
	
	Main.askQuestion(main,function(key,choosenBoostIndex){
		if(choosenBoostIndex !== 0 && choosenBoostIndex !== 1)
			return Main.addMessage(main,'You kept the old equipment boost.');
			
		var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
		if(Actor.haveEquip(act,eid)){
			weared = true;
			Actor.removeEquip(act,equip.piece);
		}
		
		if(!Main.haveItem(main,eid)) 
			return Message.add(key,'You don\'t have this equip.');
		
		Main.removeItem(main,eid);
		
		var newid = Equip.rerollStat(equip,slot,boostList[choosenBoostIndex]).id;
		Main.addItem(main,newid);
		Equip.removeFromDb.safe(eid,key);
		
		if(weared)
			Actor.changeEquip(act,newid);
		
		Metrics.onEquipUpgrade(key);
		Achievement.onEquipUpgrade(main,newid);
		Message.add(key,'You upgraded your equip.');	
		Main.playSfx(main,'levelUp');
		if(popup)
			Main.openDialog(main,popup,{id:newid,owning:true});	
	},'Choose new boost or keep old one.','option',optionList,true);	
}	

Equip.rerollStat.getCost = function(equip){
	var costRatio = Equip.getPieceTypeToCostRatio(equip.piece,equip.type);
	
	var mult = Math.max(CST.CRAFT_MIN_LVL,equip.lvl);
	mult /= 2;
	if(equip.color === Equip.COLOR.WHITE || equip.color === Equip.COLOR.BLUE)
		mult /= 2;
	
	mult *= Math.pow(REROLL_COST_MULT,equip.rerollStatCount);
	
	
	var itemList = [];
	for(var i in costRatio){
		itemList.push([
			Material.getId(i),
			Math.ceil(mult*costRatio[i])			
		]);
	}	

	return Equip.UpgradeCost(itemList);
}

Equip.rerollPower = function(equip,newPower){
	if(isNaN(newPower))
		return ERROR(3,'no newPower');
	
	var equip = Tk.deepClone(equip);	//case Qsystem-
	
	equip.quest = '';	//otherwise, start weapon cant be tracked
	equip.id = Math.randomId();
	
	equip.rerollStatCount++;
	equip.powerRoll = newPower;
	equip.def = Equip.getDef(equip);
	equip.dmg = Equip.getDmg(equip);
	//cost updated in Equip.create
	return Equip.createFromModel(equip,true);
}

Equip.rerollPower.onCommand = function(key,eid,popup){	//cost is same than rerollStat
	var equip = Equip.get(eid);
	if(!equip) 
		return;
	if(!equip.upgradable)
		return Message.addPopup(key,'You can\'t upgrade this equip.');
			
	var main = Main.get(key);
	
	var act = Actor.get(key);
	if(!Main.haveItem(main,eid) && !Actor.haveEquip(act,eid))
		return Message.add(key,'You don\'t have this equip.');
	
	if(!Main.haveItem(main,equip.rerollStatCost))
		return Message.addPopup(key,'You don\'t have the material required:<br> ' + ItemList.stringify(equip.rerollStatCost));
	Main.removeItem(main,equip.rerollStatCost);
	
	
	var powerList = [
		Equip.rerollPower.getReroll(equip.powerRoll),
		Equip.rerollPower.getReroll(equip.powerRoll),
	];
	if(Math.abs(powerList[0] - powerList[1]) < 0.01)
		powerList[1] -= 0.05;	//avoid same caused by cap
	
	var copyEquip = Tk.deepClone(equip);
	copyEquip.powerRoll = powerList[0];
	var first = Equip.getVisiblePower(copyEquip);
	copyEquip.powerRoll = powerList[1];
	var second = Equip.getVisiblePower(copyEquip);
	var third = Equip.getVisiblePower(equip);
	
	var optionList = [
		first + ' Power',
		second + ' Power',
		'Keep ' + third + ' Power',
	];
	
	Main.askQuestion(main,function(key,choosenIndex){
		if(choosenIndex !== 0 && choosenIndex !== 1)
			return Main.addMessage(main,'You kept the old equipment boost.');
			
		var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
		if(Actor.haveEquip(act,eid)){
			weared = true;
			Actor.removeEquip(act,equip.piece);
		}
		
		if(!Main.haveItem(main,eid)) 
			return Message.add(key,'You don\'t have this equip.');
		
		Main.removeItem(main,eid);
		
		var newid = Equip.rerollPower(equip,powerList[choosenIndex]).id;
		Main.addItem(main,newid);
		Equip.removeFromDb.safe(eid,key);
		
		if(weared)
			Actor.changeEquip(act,newid);
		
		Metrics.onEquipUpgrade(key);
		Achievement.onEquipUpgrade(main,newid);
		Message.add(key,'You upgraded your equip.');	
		Main.playSfx(main,'levelUp');
		if(popup)
			Main.openDialog(main,popup,{id:newid,owning:true});	
	},'Choose new power or keep old one.','option',optionList,true);	
}

Equip.rerollPower.getReroll = function(old){
	var tier = (old-POWER_BASE) / POWER_VAR;	//0 => means 0.9, 1 => 1.1
	var newTier = Math.random();
	if(newTier < tier)
		return POWER_BASE + newTier*POWER_VAR;
	
	//cap improvement depending on how close to perfect
	var distPerfectVSTier = 1 - tier;
	var capTier = tier + POWER_REROLL_CAP_RATIO * distPerfectVSTier;
	//tier:0 => 0.25, 0.5 => 0.625, 0.75 => 0.8125
	
	newTier = Math.min(newTier,capTier);
	return POWER_BASE + newTier*POWER_VAR;
}

Equip.getVisiblePower = function(equip){
	var main = equip.piece === 'weapon' ? Equip.getDmg(equip).main : Equip.getDef(equip).main;
	return Combat.getVisiblePower(main,2);
}

Equip.getSalvageGain = function(equip){
	var list = Equip.getPieceTypeToCostRatio(equip.piece,equip.type);
	var ret = {};
	for(var i in list){
		ret[Material.get(i).id] = Math.ceil(list[i] * equip.boost.length);
	}
	return ret;
}



