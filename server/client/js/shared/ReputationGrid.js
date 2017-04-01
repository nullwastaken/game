
"use strict";
(function(){ //}
var ReputationConverter, Main;
global.onReady(function(){
	ReputationConverter = rootRequire('shared','ReputationConverter'); Main = rootRequire('shared','Main');
});
var ReputationGrid = exports.ReputationGrid = function(extra){
	this.width = 15;
	this.height = 15;
	this.base = null;	//ReputationGrid.Base
	Tk.fillExtra(this,extra);
};

ReputationGrid.create = function(base){
	var tmp = new ReputationGrid({
		base:base,
	});
	DB = tmp;
};

var DB = ReputationGrid.DB = null;

ReputationGrid.NOT_HAVE = 0;
ReputationGrid.HAVE = 1;
ReputationGrid.FREEBY = 2;

ReputationGrid.Base = function(array){
	array[6][6] = s();
	array[7][6] = s();
	array[8][6] = s();
	array[6][7] = s();
	array[7][7] = s();
	array[8][7] = s();
	array[6][8] = s();
	array[7][8] = s();
	array[8][8] = s();
	return array;
};

var s = ReputationGrid.Base.slot = function(stat,value){	
	if(!stat) return {type:'freeby',stat:'mana-max',value:0};	//freeby...
	return {
		stat:stat,
		value:value,
		type:'normal',
	}
}

ReputationGrid.create(ReputationGrid.Base([
	[s("hp-max",0.03),s("atkSpd",0.03),s("crit-magn",0.03),s("mana-max",0.03),s("stun-magn",0.03),s("strike-size",0.03),s("crit-magn",0.03),s("dmg-cold",0.03),s("dmg-melee",0.03),s("bleed-chance",0.03),s("chill-magn",0.03),s("drain-chance",0.03),s("hp-regen",0.03),s("chill-chance",0.03),s("chill-magn",0.03)],
	[s("dmg-magic",0.03),s("chill-magn",0.03),s("mana-regen",0.03),s("crit-chance",0.03),s("def-range",0.03),s("burn-magn",0.03),s("knock-magn",0.03),s("crit-chance",0.03),s("dmg-range",0.03),s("leech-magn",0.03),s("atkSpd",0.03),s("def-lightning",0.03),s("hp-max",0.03),s("burn-chance",0.03),s("def-magic",0.03)],
	[s("def-range",0.03),s("knock-magn",0.03),s("leech-magn",0.03),s("crit-chance",0.03),s("dmg-fire",0.03),s("strike-range",0.03),s("leech-chance",0.03),s("dmg-lightning",0.03),s("stun-chance",0.03),s("dmg-fire",0.03),s("leech-chance",0.03),s("atkSpd",0.03),s("dmg-lightning",0.03),s("def-fire",0.03),s("def-range",0.03)],
	[s("hp-max",0.03),s("dmg-lightning",0.03),s("dmg-range",0.03),s("mana-max",0.03),s("knock-magn",0.03),s("dmg-melee",0.03),s("crit-chance",0.03),s("leech-magn",0.03),s("def-range",0.03),s("def-lightning",0.03),s("dmg-lightning",0.03),s("def-melee",0.03),s("dmg-cold",0.03),s("def-fire",0.03),s("knock-chance",0.03)],
	[s("chill-chance",0.03),s("bleed-magn",0.03),s("hp-regen",0.03),s("def-magic",0.03),s("chill-chance",0.03),s("strike-size",0.03),s("bleed-chance",0.03),s("chill-chance",0.03),s("bleed-chance",0.03),s("crit-magn",0.03),s("knock-chance",0.03),s("chill-magn",0.03),s("mana-max",0.03),s("leech-chance",0.03),s("leech-magn",0.03)],
	[s("knock-magn",0.03),s("stun-magn",0.03),s("stun-magn",0.03),s("crit-magn",0.03),s("def-melee",0.03),s("stun-magn",0.03),s("def-cold",0.03),s("dmg-melee",0.03),s("def-cold",0.03),s("drain-chance",0.03),s("drain-magn",0.03),s("leech-magn",0.03),s("mana-regen",0.03),s("def-cold",0.03),s("bleed-magn",0.03)],
	[s("knock-magn",0.03),s("dmg-range",0.03),s("atkSpd",0.03),s("def-cold",0.03),s("leech-magn",0.03),s("dmg-cold",0.03),s("dmg-fire",0.03),s("bleed-chance",0.03),s("dmg-fire",0.03),s("def-magic",0.03),s("crit-magn",0.03),s("strike-size",0.03),s("hp-regen",0.03),s("def-melee",0.03),s("hp-regen",0.03)],
	[s("stun-chance",0.03),s("hp-max",0.03),s("dmg-magic",0.03),s("stun-magn",0.03),s("def-lightning",0.03),s("def-magic",0.03),s("strike-range",0.03),s("def-melee",0.03),s("dmg-magic",0.03),s("atkSpd",0.03),s("atkSpd",0.03),s("def-magic",0.03),s("dmg-cold",0.03),s("dmg-fire",0.03),s("bleed-magn",0.03)],
	[s("mana-regen",0.03),s("burn-chance",0.03),s("atkSpd",0.03),s("stun-chance",0.03),s("knock-magn",0.03),s("def-melee",0.03),s("dmg-lightning",0.03),s("chill-chance",0.03),s("chill-chance",0.03),s("def-fire",0.03),s("leech-chance",0.03),s("def-cold",0.03),s("atkSpd",0.03),s("burn-chance",0.03),s("def-range",0.03)],
	[s("dmg-melee",0.03),s("bleed-magn",0.03),s("drain-chance",0.03),s("def-melee",0.03),s("drain-chance",0.03),s("dmg-melee",0.03),s("atkSpd",0.03),s("dmg-magic",0.03),s("dmg-lightning",0.03),s("dmg-fire",0.03),s("drain-magn",0.03),s("mana-max",0.03),s("strike-range",0.03),s("hp-regen",0.03),s("def-lightning",0.03)],
	[s("knock-chance",0.03),s("mana-regen",0.03),s("mana-max",0.03),s("dmg-magic",0.03),s("def-range",0.03),s("mana-regen",0.03),s("atkSpd",0.03),s("mana-max",0.03),s("hp-regen",0.03),s("crit-chance",0.03),s("drain-magn",0.03),s("burn-magn",0.03),s("stun-chance",0.03),s("knock-chance",0.03),s("strike-range",0.03)],
	[s("burn-magn",0.03),s("dmg-cold",0.03),s("dmg-cold",0.03),s("chill-magn",0.03),s("def-magic",0.03),s("burn-magn",0.03),s("dmg-magic",0.03),s("stun-chance",0.03),s("drain-magn",0.03),s("stun-magn",0.03),s("strike-range",0.03),s("burn-magn",0.03),s("bleed-magn",0.03),s("def-cold",0.03),s("dmg-range",0.03)],
	[s("knock-chance",0.03),s("def-fire",0.03),s("def-lightning",0.03),s("dmg-range",0.03),s("atkSpd",0.03),s("def-fire",0.03),s("crit-chance",0.03),s("dmg-melee",0.03),s("def-lightning",0.03),s("mana-regen",0.03),s("burn-chance",0.03),s("dmg-cold",0.03),s("drain-chance",0.03),s("leech-chance",0.03),s("dmg-range",0.03)],
	[s("hp-max",0.03),s("bleed-chance",0.03),s("def-melee",0.03),s("leech-chance",0.03),s("knock-chance",0.03),s("stun-chance",0.03),s("drain-magn",0.03),s("strike-range",0.03),s("dmg-melee",0.03),s("crit-magn",0.03),s("bleed-chance",0.03),s("dmg-magic",0.03),s("def-magic",0.03),s("hp-max",0.03),s("dmg-range",0.03)],
	[s("def-range",0.03),s("burn-chance",0.03),s("def-fire",0.03),s("bleed-magn",0.03),s("dmg-lightning",0.03),s("strike-size",0.03),s("drain-magn",0.03),s("burn-magn",0.03),s("burn-chance",0.03),s("dmg-fire",0.03),s("chill-magn",0.03),s("drain-chance",0.03),s("strike-size",0.03),s("strike-size",0.03),s("atkSpd",0.03)]
]));


ReputationGrid.get = function(){
	return DB;
}

ReputationGrid.getConverted = function(main,extraConv){
	var conv = Main.reputation.get(main).converter;
	if(extraConv){
		var conv = Tk.deepClone(conv);
		conv = conv.concat(extraConv);
	}
	return ReputationConverter.getConvertedGrid(conv);
}



ReputationGrid.randomlyGenerate = function(){
	var DMG = 10/12;
	var STATUS = 1/22;
	var RESOURCE = 1/4;
	var SPEC = 1/4;
	
	var list = {
		"dmg-melee":DMG,
		"dmg-range":DMG,
		"dmg-magic":DMG,
		"dmg-fire":DMG,
		"dmg-cold":DMG,
		"dmg-lightning":DMG,
		"def-melee":DMG,
		"def-range":DMG,
		"def-magic":DMG,
		"def-fire":DMG,
		"def-cold":DMG,
		"def-lightning":DMG,
		
		//"bleed-time":STATUS,
		"bleed-magn":STATUS,
		"bleed-chance":STATUS,
		//"knock-time":STATUS,
		"knock-magn":STATUS,
		"knock-chance":STATUS,
		//"drain-time":STATUS,
		"drain-magn":STATUS,
		"drain-chance":STATUS,
		//"burn-time":STATUS,
		"burn-magn":STATUS,
		"burn-chance":STATUS,
		//"chill-time":STATUS,
		"chill-magn":STATUS,
		"chill-chance":STATUS,
		//"stun-time":STATUS,
		"stun-magn":STATUS,
		"stun-chance":STATUS,
		"leech-chance":STATUS,
		"leech-magn":STATUS,
		"crit-chance":STATUS,
		"crit-magn":STATUS,
		
		"hp-regen":RESOURCE,
		"hp-max":RESOURCE,
		"mana-regen":RESOURCE,
		"mana-max":RESOURCE,
		
		"atkSpd":SPEC,
		"strike-range":SPEC,
		"strike-size":SPEC,
		
		
	};
	
	var list2 = [];
	for(var i in list)
		list2.push(i);
	while(list2.length < 15*15)
		list2 = list2.concat(list2);
	list2 = list2.slice(0,15*15);
	
	list2.sort(function(){
		return Math.random()-0.5;
	})
	var array = [];
	for(var i = 0 ; i < list2.length; i++){
		var x = Math.floor(i/15);
		var y = i % 15;
		array[x] = array[x] || [];
		array[x][y] = 's("' + list2[i] + '",0.03)';
	}
	return JSON.stringify(array);
}











})();










