//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var ReputationConverter = require2('ReputationConverter'), Main = require2('Main');
var ReputationGrid = exports.ReputationGrid = {};

ReputationGrid.create = function(base){
	var tmp = {
		width:15,
		height:15,
		base:base,
	};
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
	[s("hp-max",0.03),s("bullet-amount",0.03),s("crit-magn",0.03),s("mana-max",0.03),s("stun-magn",0.03),s("strike-size",0.03),s("dmg-melee-+",0.03),s("dmg-cold-+",0.03),s("dmg-melee-+",0.03),s("bleed-chance",0.03),s("chill-magn",0.03),s("drain-chance",0.03),s("hp-regen",0.03),s("chill-chance",0.03),s("chill-magn",0.03)],
	[s("dmg-magic-+",0.03),s("chill-magn",0.03),s("mana-regen",0.03),s("crit-chance",0.03),s("def-range-+",0.03),s("burn-magn",0.03),s("knock-magn",0.03),s("crit-chance",0.03),s("dmg-range-+",0.03),s("leech-magn",0.03),s("bullet-amount",0.03),s("def-lightning-+",0.03),s("hp-max",0.03),s("burn-chance",0.03),s("def-magic-+",0.03)],
	[s("def-range-+",0.03),s("knock-magn",0.03),s("leech-magn",0.03),s("crit-chance",0.03),s("dmg-fire-+",0.03),s("strike-range",0.03),s("leech-chance",0.03),s("dmg-lightning-+",0.03),s("stun-chance",0.03),s("dmg-fire-+",0.03),s("leech-chance",0.03),s("bullet-amount",0.03),s("dmg-lightning-+",0.03),s("def-fire-+",0.03),s("def-range-+",0.03)],
	[s("hp-max",0.03),s("dmg-lightning-+",0.03),s("dmg-range-+",0.03),s("mana-max",0.03),s("knock-magn",0.03),s("dmg-melee-+",0.03),s("crit-chance",0.03),s("leech-magn",0.03),s("def-range-+",0.03),s("def-lightning-+",0.03),s("dmg-lightning-+",0.03),s("def-melee-+",0.03),s("dmg-cold-+",0.03),s("def-fire-+",0.03),s("knock-chance",0.03)],
	[s("chill-chance",0.03),s("bleed-magn",0.03),s("hp-regen",0.03),s("def-magic-+",0.03),s("chill-chance",0.03),s("def-cold-+",0.03),s("bleed-chance",0.03),s("chill-chance",0.03),s("bleed-chance",0.03),s("crit-magn",0.03),s("knock-chance",0.03),s("chill-magn",0.03),s("mana-max",0.03),s("leech-chance",0.03),s("leech-magn",0.03)],
	[s("knock-magn",0.03),s("stun-magn",0.03),s("stun-magn",0.03),s("crit-magn",0.03),s("def-melee-+",0.03),s("stun-magn",0.03),s("strike-size",0.03),s("crit-magn",0.03),s("def-cold-+",0.03),s("drain-chance",0.03),s("drain-magn",0.03),s("leech-magn",0.03),s("mana-regen",0.03),s("def-cold-+",0.03),s("bleed-magn",0.03)],
	[s("knock-magn",0.03),s("dmg-range-+",0.03),s("atkSpd",0.03),s("def-cold-+",0.03),s("leech-magn",0.03),s("knock-chance",0.03),s("dmg-fire-+",0.03),s("bleed-chance",0.03),s("dmg-fire-+",0.03),s("crit-magn",0.03),s("def-magic-+",0.03),s("strike-size",0.03),s("hp-regen",0.03),s("def-melee-+",0.03),s("hp-regen",0.03)],
	[s("stun-chance",0.03),s("hp-max",0.03),s("dmg-magic-+",0.03),s("stun-magn",0.03),s("def-lightning-+",0.03),s("def-magic-+",0.03),s("strike-range",0.03),s("def-melee-+",0.03),s("dmg-magic-+",0.03),s("bullet-amount",0.03),s("atkSpd",0.03),s("def-magic-+",0.03),s("dmg-cold-+",0.03),s("dmg-fire-+",0.03),s("bleed-magn",0.03)],
	[s("mana-regen",0.03),s("burn-chance",0.03),s("atkSpd",0.03),s("stun-chance",0.03),s("knock-magn",0.03),s("drain-chance",0.03),s("dmg-lightning-+",0.03),s("chill-chance",0.03),s("chill-chance",0.03),s("leech-chance",0.03),s("def-fire-+",0.03),s("def-cold-+",0.03),s("bullet-amount",0.03),s("burn-chance",0.03),s("def-range-+",0.03)],
	[s("dmg-melee-+",0.03),s("bleed-magn",0.03),s("drain-chance",0.03),s("def-melee-+",0.03),s("def-melee-+",0.03),s("dmg-melee-+",0.03),s("drain-magn",0.03),s("strike-range",0.03),s("stun-magn",0.03),s("dmg-fire-+",0.03),s("drain-magn",0.03),s("mana-max",0.03),s("strike-range",0.03),s("hp-regen",0.03),s("def-lightning-+",0.03)],
	[s("knock-chance",0.03),s("mana-regen",0.03),s("mana-max",0.03),s("dmg-magic-+",0.03),s("def-range-+",0.03),s("mana-regen",0.03),s("bullet-amount",0.03),s("mana-max",0.03),s("hp-regen",0.03),s("crit-chance",0.03),s("drain-magn",0.03),s("burn-magn",0.03),s("stun-chance",0.03),s("knock-chance",0.03),s("strike-range",0.03)],
	[s("burn-magn",0.03),s("dmg-cold-+",0.03),s("dmg-cold-+",0.03),s("chill-magn",0.03),s("def-magic-+",0.03),s("burn-magn",0.03),s("dmg-magic-+",0.03),s("stun-chance",0.03),s("drain-magn",0.03),s("dmg-lightning-+",0.03),s("strike-range",0.03),s("burn-magn",0.03),s("bleed-magn",0.03),s("def-cold-+",0.03),s("dmg-range-+",0.03)],
	[s("knock-chance",0.03),s("def-fire-+",0.03),s("def-lightning-+",0.03),s("dmg-range-+",0.03),s("atkSpd",0.03),s("def-fire-+",0.03),s("crit-chance",0.03),s("dmg-melee-+",0.03),s("def-lightning-+",0.03),s("mana-regen",0.03),s("burn-chance",0.03),s("dmg-cold-+",0.03),s("drain-chance",0.03),s("leech-chance",0.03),s("dmg-range-+",0.03)],
	[s("hp-max",0.03),s("bleed-chance",0.03),s("def-melee-+",0.03),s("leech-chance",0.03),s("dmg-cold-+",0.03),s("stun-chance",0.03),s("atkSpd",0.03),s("dmg-magic-+",0.03),s("dmg-melee-+",0.03),s("crit-magn",0.03),s("bleed-chance",0.03),s("dmg-magic-+",0.03),s("def-magic-+",0.03),s("hp-max",0.03),s("dmg-range-+",0.03)],
	[s("def-range-+",0.03),s("burn-chance",0.03),s("def-fire-+",0.03),s("bleed-magn",0.03),s("dmg-lightning-+",0.03),s("strike-size",0.03),s("drain-magn",0.03),s("burn-magn",0.03),s("burn-chance",0.03),s("dmg-fire-+",0.03),s("chill-magn",0.03),s("drain-chance",0.03),s("strike-size",0.03),s("strike-size",0.03),s("atkSpd",0.03)]
]));

/*
ReputationGrid.create(ReputationGrid.Base([
	[s("def-cold-+",0.03),s("def-magic-+",0.03),s("mana-regen",0.03),s("summon-amount",0.03),s("weapon-orb",0.03),s("dmg-magic-+",0.03),s("def-fire-+",0.03),s("dmg-magic-+",0.03),s("def-cold-+",0.03),s("hp-regen",0.03),s("knock-magn",0.03),s("strike-maxHit",0.03),s("chill-magn",0.03),s("dmg-cold-+",0.03),s("def-range-+",0.03)],
	[s("bullet-amount",0.03),s("summon-amount",0.03),s("dmg-melee-+",0.03),s("dmg-fire-+",0.03),s("def-melee-+",0.03),s("dmg-melee-+",0.03),s("hp-regen",0.03),s("dmg-range-+",0.03),s("dmg-magic-+",0.03),s("def-fire-+",0.03),s("pickRadius",0.03),s("hp-max",0.03),s("def-melee-+",0.03),s("weapon-boomerang",0.03),s("burn-time",0.03)],
	[s("weapon-staff",0.03),s("Qsystem-player-healSlowCast",0.03),s("stun-magn",0.03),s("mana-max",0.03),s("dmg-cold-+",0.03),s("def-cold-+",0.03),s("acc",0.03),s("leech-chance",0.03),s("def-cold-+",0.03),s("bleed-time",0.03),s("def-lightning-+",0.03),s("strike-size",0.03),s("atkSpd",0.03),s("Qsystem-player-dodgeLife",0.03),s("atkSpd",0.03)],
	
	[s("def-cold-+",0.03),s("dmg-cold-+",0.03),s("def-cold-+",0.03),s("burn-time",0.03),s("Qsystem-player-healCost",0.03),s("def-lightning-+",0.03),s("summon-atk",0.03),s("acc",0.03),s("def-lightning-+",0.03),s("def-lightning-+",0.03),s("dmg-melee-+",0.03),s("maxSpd",0.03),s("def-melee-+",0.03),s("strike-range",0.03),s("dmg-cold-+",0.03)],
	[s("def-range-+",0.03),s("def-melee-+",0.03),s("Qsystem-player-meleeBig",0.03),s("atkSpd",0.03),s("stun-chance",0.03),s("def-lightning-+",0.03),s("leech-chance",0.03),s("dmg-range-+",0.03),s("leech-chance",0.03),s("dmg-lightning-+",0.03),s("dmg-magic-+",0.03),s("weapon-sword",0.03),s("weapon-crossbow",0.03),s("def-range-+",0.03),s("leech-chance",0.03)],
	[s("knock-chance",0.03),s("dmg-melee-+",0.03),s("knock-chance",0.03),s("dmg-range-+",0.03),s("def-range-+",0.03),s("leech-magn",0.03),s("knock-magn",0.03),s("def-melee-+",0.03),s("Qsystem-player-lightningBullet",0.03),s("def-melee-+",0.03),s("knock-time",0.03),s("magicFind-quality",0.03),s("dmg-lightning-+",0.03),s("dmg-lightning-+",0.03),s("summon-amount",0.03)],
	
	[s("dmg-cold-+",0.03),s("def-lightning-+",0.03),s("chill-time",0.03),s("chill-time",0.03),s("knock-time",0.03),s("Qsystem-player-fireBullet",0.03),s(),s(),s(),s("mana-max",0.03),s("def-melee-+",0.03),s("acc",0.03),s("dmg-melee-+",0.03),s("dmg-lightning-+",0.03),s("strike-size",0.03)],
	[s("dmg-melee-+",0.03),s("atkSpd",0.03),s("drain-chance",0.03),s("weapon-boomerang",0.03),s("def-cold-+",0.03),s("drain-magn",0.03),s(),s(),s(),s("dmg-range-+",0.03),s("def-fire-+",0.03),s("def-range-+",0.03),s("def-melee-+",0.03),s("weapon-crossbow",0.03),s("def-magic-+",0.03)],
	[s("drain-time",0.03),s("Qsystem-player-magicBullet",0.03),s("hp-regen",0.03),s("def-fire-+",0.03),s("def-range-+",0.03),s("bleed-chance",0.03),s(),s(),s(),s("def-lightning-+",0.03),s("def-magic-+",0.03),s("Qsystem-player-lightningBomb",0.03),s("hp-max",0.03),s("knock-chance",0.03),s("def-melee-+",0.03)],
	
	[s("hp-regen",0.03),s("burn-time",0.03),s("def-cold-+",0.03),s("weapon-crossbow",0.03),s("def-melee-+",0.03),s("Qsystem-player-coldBullet",0.03),s("def-melee-+",0.03),s("def-range-+",0.03),s("dmg-magic-+",0.03),s("weapon-bow",0.03),s("bullet-spd",0.03),s("def-fire-+",0.03),s("dmg-fire-+",0.03),s("dmg-cold-+",0.03),s("knock-time",0.03)],
	[s("def-magic-+",0.03),s("def-cold-+",0.03),s("def-lightning-+",0.03),s("strike-maxHit",0.03),s("def-melee-+",0.03),s("dmg-melee-+",0.03),s("dmg-cold-+",0.03),s("summon-def",0.03),s("Qsystem-player-magicBomb",0.03),s("bullet-spd",0.03),s("def-lightning-+",0.03),s("weapon-boomerang",0.03),s("knock-time",0.03),s("dmg-magic-+",0.03),s("dmg-cold-+",0.03)],
	[s("strike-maxHit",0.03),s("dmg-lightning-+",0.03),s("leech-magn",0.03),s("Qsystem-player-windKnock",0.03),s("def-melee-+",0.03),s("def-magic-+",0.03),s("dmg-melee-+",0.03),s("knock-time",0.03),s("dmg-cold-+",0.03),s("knock-time",0.03),s("chill-magn",0.03),s("knock-time",0.03),s("Qsystem-player-dodgeFast",0.03),s("dmg-magic-+",0.03),s("dmg-lightning-+",0.03)],
	
	[s("dmg-range-+",0.03),s("Qsystem-player-healFast",0.03),s("drain-chance",0.03),s("def-range-+",0.03),s("bleed-time",0.03),s("knock-chance",0.03),s("strike-maxHit",0.03),s("dmg-melee-+",0.03),s("magicFind-quality",0.03),s("bullet-spd",0.03),s("bullet-spd",0.03),s("dmg-magic-+",0.03),s("hp-regen",0.03),s("def-range-+",0.03),s("dmg-lightning-+",0.03)],
	[s("knock-chance",0.03),s("chill-time",0.03),s("leech-magn",0.03),s("bleed-chance",0.03),s("dmg-melee-+",0.03),s("stun-magn",0.03),s("dmg-melee-+",0.03),s("chill-time",0.03),s("dmg-magic-+",0.03),s("def-melee-+",0.03),s("crit-chance",0.03),s("knock-time",0.03),s("magicFind-quantity",0.03),s("def-melee-+",0.03),s("strike-maxHit",0.03)],
	[s("burn-time",0.03),s("leech-chance",0.03),s("dmg-melee-+",0.03),s("def-cold-+",0.03),s("dmg-cold-+",0.03),s("def-magic-+",0.03),s("def-magic-+",0.03),s("dmg-cold-+",0.03),s("bleed-magn",0.03),s("dmg-magic-+",0.03),s("weapon-sword",0.03),s("def-fire-+",0.03),s("def-melee-+",0.03),s("burn-chance",0.03),s("dmg-range-+",0.03)],
]));
*/

var randomStat = function(good){
	var good = ["maxSpd","acc","hp-regen","mana-regen","hp-max","mana-max","leech-magn","leech-chance","pickRadius","magicFind-quantity","magicFind-quality","magicFind-rarity","atkSpd","crit-chance","crit-magn","bullet-amount","bullet-spd","strike-range","strike-size","strike-maxHit","burn-time","burn-magn","burn-chance","chill-time","chill-magn","chill-chance","stun-time","stun-magn","stun-chance","bleed-time","bleed-magn","bleed-chance","drain-time","drain-magn","drain-chance","knock-time","knock-magn","knock-chance","def-melee-+","def-melee-*","def-melee-^","def-melee-x","def-range-+","def-range-*","def-range-^","def-range-x","def-magic-+","def-magic-*","def-magic-^","def-magic-x","def-fire-+","def-fire-*","def-fire-^","def-fire-x","def-cold-+","def-cold-*","def-cold-^","def-cold-x","def-lightning-+","def-lightning-*","def-lightning-^","def-lightning-x","dmg-melee-+","dmg-melee-*","dmg-melee-^","dmg-melee-x","dmg-range-+","dmg-range-*","dmg-range-^","dmg-range-x","dmg-magic-+","dmg-magic-*","dmg-magic-^","dmg-magic-x","dmg-fire-+","dmg-fire-*","dmg-fire-^","dmg-fire-x","dmg-cold-+","dmg-cold-*","dmg-cold-^","dmg-cold-x","dmg-lightning-+","dmg-lightning-*","dmg-lightning-^","dmg-lightning-x","weapon-mace","weapon-spear","weapon-sword","weapon-bow","weapon-boomerang","weapon-crossbow","weapon-wand","weapon-staff","weapon-orb","summon-amount","summon-time","summon-atk","summon-def"];
	return good.$random();
}

ReputationGrid.getSignInPack = function(){
	return DB.base;
}
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
		"dmg-melee-+":DMG,
		"dmg-range-+":DMG,
		"dmg-magic-+":DMG,
		"dmg-fire-+":DMG,
		"dmg-cold-+":DMG,
		"dmg-lightning-+":DMG,
		"def-melee-+":DMG,
		"def-range-+":DMG,
		"def-magic-+":DMG,
		"def-fire-+":DMG,
		"def-cold-+":DMG,
		"def-lightning-+":DMG,
		
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
		
		"bullet-amount":SPEC,
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
	var str = JSON.stringify(array);
}











})();










