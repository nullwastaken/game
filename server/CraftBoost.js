
"use strict";
var Boost, Stat;
global.onReady(function(){
	Boost = rootRequire('shared','Boost'); Stat = rootRequire('shared','Stat');
});
var CraftBoost = exports.CraftBoost = {};

var CHANCE_UNIQUE = 4/100;
//BAD weird constructor
CraftBoost.create = function(piece,all,type){
	for(var i in type)
		for(var j in all)
			type[i].push(all[j]);
	DB[piece] = type;
}
var DB = CraftBoost.DB = {};
CraftBoost.generateBoost = function(piece,type,lvl,quality,exclude){
	lvl = lvl || 0;
	exclude = exclude || {};
	quality = quality || 0;
	
	var list = DB[piece] && DB[piece][type];
	if(!list) 
		return ERROR(3,'wrong piece or type',piece,type);
	
	var safety = 0;
	var chosen;
	do {
		var obj = {};	
		for(var i in list) 
			obj[i] = list[i].chance;
		chosen = list[obj.$random()] || null;
	}
	while(exclude[chosen.stat] && safety++ < 10000)
	var tier = Math.pow(Math.random(),1/(quality+1));
	var value = chosen.value * (0.75 + 0.5 *tier);
	
	value *= (0.8 + 0.02 * lvl);
	
	var stat = Stat.get(chosen.stat);
	var type = stat.value.base === 0 ? CST.BOOST_PLUS : CST.BOOST_X;
	
	return Boost.Perm(chosen.stat,value,type);
}

CraftBoost.Type = function(array){	//CraftBoost.Sub[]
	var tmp = [];
	for(var i = 0 ; i < array.length; i++){
		for(var j in array[i].statList){
			tmp.push({
				stat:array[i].statList[j],
				value:array[i].value,
				chance:array[i].chance/array[i].statList.length,
			});
		}
	}
	return tmp;
}

CraftBoost.Sub = function(groupInfo,valueMod,chance){
	return {
		statList:groupInfo.list,
		value:groupInfo.baseValue * (valueMod || 1),
		chance:chance || 1,	
	}
}	

CraftBoost.Stat = function(stat){
	if(!GROUP[stat]) 
		return ERROR('invalid stat',stat);
	return GROUP[stat];
}	

CraftBoost.getDbSchema = function(){	//aka Boost.Perm
	return {
		stat:String,
		value:Number,
		type:String,	
		'*':null
	}
}

//######################

var GROUP = {};
var StatGroup = function(id,baseValue,list){
	if(!list) list = [id];
	GROUP[id] = {
		id:id,
		baseValue:baseValue,
		list:list
	};	
	//create group for each
	for(var i in list)
		if(!GROUP[list[i]]) StatGroup(list[i],baseValue);
};

;(function(){	//StatGroup Init
	StatGroup('dmg',0.01,['dmg-melee','dmg-range','dmg-magic','dmg-fire','dmg-cold','dmg-lightning']);

	//Def
	StatGroup('def',0.01,['def-melee','def-range','def-magic','def-fire','def-cold','def-lightning']);
		
	//Weapon
	StatGroup('weapon',0.01,['weapon-mace','weapon-spear','weapon-sword','weapon-bow','weapon-boomerang','weapon-crossbow','weapon-wand','weapon-staff','weapon-orb']);		
	StatGroup('weapon-melee',0.01,['weapon-mace','weapon-spear','weapon-sword']);
	StatGroup('weapon-range',0.01,['weapon-bow','weapon-boomerang','weapon-crossbow']);
	StatGroup('weapon-magic',0.01,['weapon-wand','weapon-staff','weapon-orb']);
		
	//Status
	StatGroup('status-all',0.05,['burn-magn','burn-chance','burn-time','chill-magn','chill-chance','chill-time','stun-magn','stun-chance','stun-time','bleed-magn','bleed-chance','bleed-time','knock-magn','knock-chance','knock-time','drain-magn','drain-chance','drain-time']);
	StatGroup('status-magn',0.05,['burn-magn','chill-magn','stun-magn','bleed-magn','knock-magn','drain-magn']);
	StatGroup('status-chance',0.05,['burn-chance','chill-chance','stun-chance','bleed-chance','knock-chance','drain-chance']);
	StatGroup('status-time',0.05,['burn-time','chill-time','stun-time','bleed-time','knock-time','drain-time']);
	StatGroup('burn-all',0.05,['burn-magn','burn-chance','burn-time']);
	StatGroup('chill-all',0.05,['chill-magn','chill-chance','chill-time']);
	StatGroup('stun-all',0.05,['stun-magn','stun-chance','stun-time']);
	StatGroup('bleed-all',0.05,['bleed-magn','bleed-chance','bleed-time']);
	StatGroup('knock-all',0.05,['knock-magn','knock-chance','knock-time']);
	StatGroup('drain-all',0.05,['drain-magn','drain-chance','drain-time']);
	StatGroup('summon-all',0.01,['summon-amount','summon-time','summon-atk','summon-def']);
	StatGroup('magicFind-all',0.01,['magicFind-quantity','magicFind-quality','magicFind-rarity']);
	StatGroup('mana-max',0.01);
	StatGroup('mana-regen',0.01);
	StatGroup('atkSpd',0.01);
	StatGroup('crit-chance',0.01);
	StatGroup('crit-magn',0.01);
	StatGroup('leech-magn',0.01);
	StatGroup('leech-chance',0.01);
	StatGroup('strike-range',0.01);
	StatGroup('strike-size',0.01);
	StatGroup('strike-maxHit',0.2);
	StatGroup('pickRadius',0.1);
	StatGroup('hp-max',0.005);
	StatGroup('hp-regen',0.01);
	StatGroup('maxSpd',0.1);
	StatGroup('acc',0.01);
	
	
	StatGroup('coldEquality',1); 
	StatGroup('balanced',1);
	StatGroup('chain',1);
	
	StatGroup('onlyBurn',1);
	StatGroup('coldSuperiority',1);
	StatGroup('noStun',1);
	
	StatGroup('specialMetal',1);
	StatGroup('mediane',1);
	StatGroup('noHelm',1); 
	
	StatGroup('meleeNum1',1); 
	StatGroup('rangeWeapon',1); 
	StatGroup('onlyManaRegen',1);
	
	
	StatGroup('critMania',1);
	StatGroup('statusMania',1);
	StatGroup('noRandom',1);
	StatGroup('lifeToMana',1);
	StatGroup('riskyHp',1);
	StatGroup('leechKing',1);
	StatGroup('lifeForSpd',1);
	StatGroup('longRange',1);
	StatGroup('leechBleed',1);
	
	
	
})();

//######################

var addDefault = function(array){
	var CHANCE = 0.1;
	var VAL = 0.8;
	
	return array.concat([
		CraftBoost.Sub(CraftBoost.Stat('dmg'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('def'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('hp-max'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('hp-regen'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('mana-max'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('mana-regen'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('status-all'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('atkSpd'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('crit-chance'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('crit-magn'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('leech-magn'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('leech-chance'),VAL,CHANCE),
		CraftBoost.Sub(CraftBoost.Stat('atkSpd'),VAL,CHANCE),
	]);
}


CraftBoost.create('weaponFirstBoost',CraftBoost.Type([ //{
		CraftBoost.Sub(CraftBoost.Stat('hp-max'),25,1),
		CraftBoost.Sub(CraftBoost.Stat('mana-regen'),50,1),
		CraftBoost.Sub(CraftBoost.Stat('atkSpd'),25,1),
	]),{
	mace:CraftBoost.Type([ 
		CraftBoost.Sub(CraftBoost.Stat('bleed-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-cold'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-lightning'),50,1/5),
	]),
	spear:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('bleed-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-fire'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-lightning'),50,1/5),
	]),
	sword:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('bleed-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-fire'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-cold'),50,1/5),
	]),
	bow:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('knock-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-cold'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-lightning'),50,1/5),
	]),
	crossbow:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('knock-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-fire'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-lightning'),50,1/5),
	]),
	boomerang:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('knock-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-fire'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-cold'),50,1/5),
	]),
	wand:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('drain-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-cold'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-lightning'),50,1/5),
	]),
	staff:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('drain-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-fire'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-lightning'),50,1/5),
	]),
	orb:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('drain-chance'),30,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-fire'),50,1/5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-cold'),50,1/5),
	])	
}); //}
	
CraftBoost.create('weapon',CraftBoost.Type(addDefault([ //{
		CraftBoost.Sub(CraftBoost.Stat('dmg'),2,1),
	])),{
	mace:CraftBoost.Type([ //brute force / tank
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),10,1),
		CraftBoost.Sub(CraftBoost.Stat('def'),10,1),
		CraftBoost.Sub(CraftBoost.Stat('riskyHp'),1,CHANCE_UNIQUE),
	]),
	spear:CraftBoost.Type([ //aoe
		CraftBoost.Sub(CraftBoost.Stat('strike-size'),5,1),
		CraftBoost.Sub(CraftBoost.Stat('strike-range'),5,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('longRange'),1,CHANCE_UNIQUE),
	]),
	sword:CraftBoost.Type([ //status
		CraftBoost.Sub(CraftBoost.Stat('status-all'),5,4),
		CraftBoost.Sub(CraftBoost.Stat('dmg-melee'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('leechBleed'),1,CHANCE_UNIQUE),
	]),
	bow:CraftBoost.Type([ //amount
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('noRandom'),1,CHANCE_UNIQUE),
	]),
	boomerang:CraftBoost.Type([ //crit
		CraftBoost.Sub(CraftBoost.Stat('crit-chance'),5,1.5),
		CraftBoost.Sub(CraftBoost.Stat('crit-magn'),5,1.5),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('critMania'),1,CHANCE_UNIQUE),
	]),
	crossbow:CraftBoost.Type([ //speed
		CraftBoost.Sub(CraftBoost.Stat('atkSpd'),5,2),
		CraftBoost.Sub(CraftBoost.Stat('dmg-range'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('lifeForSpd'),1,CHANCE_UNIQUE),
	]),
	wand:CraftBoost.Type([ //leech
		CraftBoost.Sub(CraftBoost.Stat('leech-chance'),5,1),
		CraftBoost.Sub(CraftBoost.Stat('leech-magn'),5,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('leechKing'),1,CHANCE_UNIQUE),
	]),
	staff:CraftBoost.Type([ //aoe onHit
		CraftBoost.Sub(CraftBoost.Stat('strike-range'),10,1),
		CraftBoost.Sub(CraftBoost.Stat('strike-size'),10,1),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('lifeToMana'),1,CHANCE_UNIQUE),
	]),
	orb:CraftBoost.Type([ //status
		CraftBoost.Sub(CraftBoost.Stat('status-all'),5,4),
		CraftBoost.Sub(CraftBoost.Stat('dmg-magic'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('statusMania'),1,CHANCE_UNIQUE),
	])
});	//}

CraftBoost.create('amulet',CraftBoost.Type(addDefault([ //{
		CraftBoost.Sub(CraftBoost.Stat('dmg'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('def'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('status-all'),2,1),
	])),{
	ruby:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('burn-all'),2.5,1),
		CraftBoost.Sub(CraftBoost.Stat('burn-chance'),3,1),
		CraftBoost.Sub(CraftBoost.Stat('chain'),1,CHANCE_UNIQUE),
	]),
	sapphire:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('chill-all'),2.5,1),
		CraftBoost.Sub(CraftBoost.Stat('chill-chance'),3,1),
		CraftBoost.Sub(CraftBoost.Stat('coldEquality'),1,CHANCE_UNIQUE),
	]),
	topaz:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('stun-all'),2.5,1),
		CraftBoost.Sub(CraftBoost.Stat('stun-chance'),3,1),	
		CraftBoost.Sub(CraftBoost.Stat('balanced'),1,CHANCE_UNIQUE),
	])	
}); //}`

CraftBoost.create('ring',CraftBoost.Type(addDefault([ //{
		CraftBoost.Sub(CraftBoost.Stat('dmg'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('def'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('status-all'),2,1),
	])),{
	ruby:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('burn-all'),2.5,1),
		CraftBoost.Sub(CraftBoost.Stat('burn-magn'),3,1),
		CraftBoost.Sub(CraftBoost.Stat('burn-time'),3,1),
		CraftBoost.Sub(CraftBoost.Stat('onlyBurn'),1,CHANCE_UNIQUE),
	]),
	sapphire:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('chill-all'),2.5,1),
		CraftBoost.Sub(CraftBoost.Stat('chill-magn'),3,1),
		CraftBoost.Sub(CraftBoost.Stat('chill-time'),3,1),
		CraftBoost.Sub(CraftBoost.Stat('coldSuperiority'),1,CHANCE_UNIQUE),
	]),
	topaz:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('stun-all'),2.5,1),
		CraftBoost.Sub(CraftBoost.Stat('stun-magn'),3,1),	
		CraftBoost.Sub(CraftBoost.Stat('stun-time'),3,1),	
		CraftBoost.Sub(CraftBoost.Stat('noStun'),1,CHANCE_UNIQUE),
	])	
}); //}

CraftBoost.create('helm',CraftBoost.Type(addDefault([ //{
		CraftBoost.Sub(CraftBoost.Stat('dmg'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('def'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('atkSpd'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('pickRadius'),1,1),
	])),{
	metal:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('hp-max'),1.5,1),
		CraftBoost.Sub(CraftBoost.Stat('leech-magn'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('leech-chance'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('meleeNum1'),1,CHANCE_UNIQUE),
	]),
	wood:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('hp-regen'),1.5,1),
		CraftBoost.Sub(CraftBoost.Stat('crit-magn'),1,1),	
		CraftBoost.Sub(CraftBoost.Stat('crit-chance'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('rangeWeapon'),1,CHANCE_UNIQUE),
	]),
	bone:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('mana-max'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('mana-regen'),1.5,1),
		CraftBoost.Sub(CraftBoost.Stat('maxSpd'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('onlyManaRegen'),1,CHANCE_UNIQUE),
	])	
}); //}
	
CraftBoost.create('body',CraftBoost.Type(addDefault([ //{
		CraftBoost.Sub(CraftBoost.Stat('dmg'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('def'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('weapon'),1,1),
	])),{
	metal:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('def-melee'),8,1),
		CraftBoost.Sub(CraftBoost.Stat('weapon-melee'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('strike-range'),1,1),	
		CraftBoost.Sub(CraftBoost.Stat('specialMetal'),1,CHANCE_UNIQUE),
	]),
	wood:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('def-range'),8,1),
		CraftBoost.Sub(CraftBoost.Stat('weapon-range'),2,1),	
		CraftBoost.Sub(CraftBoost.Stat('strike-size'),1,1),
		CraftBoost.Sub(CraftBoost.Stat('mediane'),1,CHANCE_UNIQUE),
	]),
	bone:CraftBoost.Type([
		CraftBoost.Sub(CraftBoost.Stat('def-magic'),8,1),
		CraftBoost.Sub(CraftBoost.Stat('weapon-magic'),2,1),
		CraftBoost.Sub(CraftBoost.Stat('noHelm'),1,CHANCE_UNIQUE),
	])	
}); //}
	
//[base*0.75,base*1.25]

/*
*/


