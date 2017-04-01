
"use strict";
(function(){  //}
var Actor, Equip, Boost, QueryDb;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Equip = rootRequire('server','Equip'); Boost = rootRequire('shared','Boost');
	QueryDb = rootRequire('shared','QueryDb',true);
});
var Combat = rootRequire('server','Combat');
if(!SERVER)	//BAD...
	Combat = exports.Combat = {};

Combat.MONSTER_SCALING_LVL = 0.055;	//0.05 for equip, 0.005 for reputation
var EQUIP_SCALING = 0.05;

Combat.applyAttackMod = function(player,atk){
	atk = Combat.applyAttackMod.bonus(player.bonus,atk);
	atk = Combat.applyAttackMod.weapon(Actor.getWeapon(player),atk);
	atk = Combat.applyAttackMod.player(player,atk);
	return atk;
}

Combat.applyAttackMod.bonus = function(bon,atk){
	//Status Effect
	for(var i = 0 ; i < CST.status.list.length; i++){
		var status = CST.status.list[i];
		if(!atk[status]) 
			continue;
		atk[status].magn *= bon[status].magn;
		atk[status].chance *= bon[status].chance;
		atk[status].time *= bon[status].time;
	}
	if(atk.leech){
		atk.leech.chance *= bon.leech.chance;
		atk.leech.magn *= bon.leech.magn;
	}
	if(atk.crit){
		atk.crit.magn *= bon.crit.magn; 
		atk.crit.chance *= bon.crit.chance;
	}
	
	if(atk.type === CST.ENTITY.bullet){
		atk.amount *= bon.bullet.amount; //BAD
		atk.amount = Math.roundRandom(atk.amount);
		atk.spd *= bon.bullet.spd;
	}
	if(atk.type === CST.ENTITY.strike){
		atk.width *= bon.strike.size; 
		atk.height *= bon.strike.size; 
		atk.maxHit *= bon.strike.maxHit; atk.maxHit = Math.roundRandom(atk.maxHit);
		atk.initPosition.max += bon.strike.range-100; 	//BAD += instead of *=
	}
	return atk;
}

Combat.applyAttackMod.player = function(player,atk){
	atk.dmg.main *= player.globalDmg;
	
	for(var i in atk.dmg.ratio){ 
		atk.dmg.ratio[i] *= Actor.getMasteryValue(player,'dmg',i,true);
	}
	return atk;
}

Combat.applyAttackMod.weapon = function(weaponid,atk){
	var weapon;
	if(SERVER) weapon = Equip.get(weaponid) || Equip.get(CST.UNARMED);
	if(!SERVER) weapon = QueryDb.get('equip',weaponid) || {main:1,ratio:CST.element.template(1)};
	
	atk.dmg.main *= weapon.dmg.main;
	for(var i in atk.dmg.ratio){ 
		atk.dmg.ratio[i] *= weapon.dmg.ratio[i];	//if good element, x1.5
	}
	return	atk;
}

Combat.MIN_EQUIP_DEF = 1;	//if naked, only apply on player
Combat.WEAPON_MAIN_MOD = 1.5;
Combat.ARMOR_MAIN_MOD = 2.25;

Combat.getEquipMainDmgDefByLvl = function(lvl){	//in average, has 1.25 * main. in def cuz of ratio
	if(isNaN(lvl))
		ERROR(2,'lvl isNaN',lvl);
	lvl = lvl || 0;
	return 1 + EQUIP_SCALING*lvl;				//but ok cuz weapon boost by 1.5 certain attack
}

Combat.getTierMod = function(tier){
	if(isNaN(tier))
		ERROR(2,'tier isNaN',tier);
	tier = tier || 0;
	return 1 + tier * 0.05;
}

Combat.getEnemyPower = function(act,num){	//depends on player amount
	if(num === 1) return [];
	var dmg = 1 + Math.sqrt(num-1) * 0.25;	//1=1,	2=1.25,	3:1.35,		5:	1.5		10: 1.75
	var def = 1 + Math.sqrt(num-1) * 0.50;	//1=1,	2=1.5,	3:1.70,		5:  2		10: 2.5
	return [
		Boost.create('enemypower','globalDmg',dmg || 1,60*1000,CST.BOOST_XXX),
		Boost.create('enemypower','globalDef',def || 1,60*1000,CST.BOOST_XXX),
	];
}

Combat.getVisiblePower = function(main,round){
	round = round || 0;
	return Tk.round(Math.pow(main + 1,4) * 10,round);
}

Combat.getPlayerLevelNerf = function(playerLvl,mapLvl){ //depends on player lvl
	if(mapLvl >= playerLvl) 
		return [
			Boost.Perm('globalDmg',1,CST.BOOST_XXX),
			Boost.Perm('globalDef',1,CST.BOOST_XXX),
		];
	var diff = playerLvl - mapLvl;
	if(isNaN(diff)){
		ERROR(3,'invalid playerLvl or mapLvl',playerLvl,mapLvl);
		return [];
	}
	diff *= Combat.MONSTER_SCALING_LVL;
	//0 => 0, 10 => 15, 20 => 30, 30 => 45, 40 => 60,
	
	return [
		Boost.Perm('globalDmg',1 / (1 + diff),CST.BOOST_XXX),	//lvl diff = 50 => 66% dmg
		Boost.Perm('globalDef',1 / (1 + diff),CST.BOOST_XXX),
	];
}

Combat.onMapEnter = function(act,map){
	var pLvl = Actor.getLevel(act);
	Actor.addPermBoost(act,'playerNerf',Combat.getPlayerLevelNerf(pLvl,map.lvl));
	if(pLvl < map.lvl - 10)
		Actor.addMessage(act,'Warning: Monsters in this area are far above your level.');
}

Combat.applyLvlScaling = function(act){
	var scale = Combat.getLvlScaling(act);
	act.globalDef *= scale;
	act.globalDmg *= scale;
}
Combat.getLvlScaling = function(act){
	return 1 + act.lvl*Combat.MONSTER_SCALING_LVL;
}


Combat.testCanDamage = function(atk,def){
	if(!atk.combat || !def.combat) return;
	var parent = Actor.get(atk.parent);
	if(!parent) 
		return;// ERROR(3,'no atk.parent');	//not sure if normal, shoot bullet and parent dies
	
	var normal = Combat.damageIf(atk,def); //apply damageIf logic
	
	//apply damagedIf logic
	if(def.damagedIf === CST.DAMAGE_IF.never) 
		return false;
	if(normal && def.damagedIf !== CST.DAMAGE_IF.always){
		if(Array.isArray(def.damagedIf)) normal = def.damagedIf.$contains(atk.parent);
		if(def.damagedIf === CST.DAMAGE_IF.player) 
			normal = parent.type === CST.ENTITY.player;
		if(def.damagedIf === CST.DAMAGE_IF.npc) 
			normal = parent.type === CST.ENTITY.npc;
		if(typeof def.damagedIf === 'function') 
			normal = def.damagedIf(parent);
	}
	return (!atk.damageIfMod && normal) || (atk.damageIfMod && !normal); 
}
Combat.testCanDamage.imprecise = function(player,def){
	if(player === def)
		return false;
	if(def.type === CST.ENTITY.player)
		return def.pvpEnabled;
	
	return def.combatType === CST.ENTITY.npc;
}



//TargetIf damageIf
Combat.targetIf = function(atk,def){
	if(!Combat.targetIf.global(atk,def)) return false;

	if(typeof atk.targetIf === 'function'){
		return atk.targetIf(def.id,atk.id);	//need id cuz changeable by quest, try catch?
	} else {
		return Combat.targetIf.list[atk.targetIf](def,atk);
	}
};

Combat.damageIf = function(atk,def){	//could be optimized
	if(!Combat.damageIf.global(atk,def)) 
		return false;
	
	if(typeof atk.damageIf === 'function'){
		return atk.damageIf(def.id,atk.id);	//need id cuz changeable by quest, try catch?
	} else {
		return Combat.damageIf.list[atk.damageIf](def,atk);
	}
	
};

Combat.targetIf.global = Combat.damageIf.global = function(atk,def){
	//Used first in every target if test
	return !!(atk && def && atk.id !== def.id 
		&& atk.parent !== def.id 
		&& !def.dead 
		&& def.combat 
		&& (def.combatType === CST.ENTITY.player || def.combatType === CST.ENTITY.npc)
		&& Actor.get(def.id));
	
}
Combat.targetIf.list = Combat.damageIf.list = {};

var addTargetIf = function(id,func){
	Combat.targetIf.list[id] = func;
}

;(function(){ //}
	addTargetIf(CST.DAMAGE_IF.player,function(def,atk){ 
		try {
			if(!def.summoned) return def.combatType === CST.ENTITY.player; 
			
			if(def.summoned.parent === atk.id) return false;
			var hIf = typeof atk.damageIf === 'function' ? atk.damageIf : Combat.damageIf.list[atk.damageIf];
			return hIf(Actor.get(def.summoned.parent),atk);
			
		} catch(err) { ERROR.err(3,err); }
	});

	addTargetIf(CST.DAMAGE_IF.npc,function(def,atk){ 
		try {
			if(!def.summoned) return def.combatType === CST.ENTITY.npc; 
			
			if(def.summoned.parent === atk.id) return false;
			var hIf = typeof atk.damageIf === 'function' ? atk.damageIf : Combat.damageIf.list[atk.damageIf];
			return hIf(Actor.get(def.summoned.parent),atk);
			
		} catch(err) { ERROR.err(3,err); }
	});
	
	addTargetIf(CST.DAMAGE_IF.summoned,function(def,atk){	//unused
		try {
			if(def.id === atk.summoned.parent){ return false; }
			var master = Actor.get(atk.summoned.parent);
			var hIf = typeof master.damageIf === 'function' ? master.damageIf : Combat.damageIf.list[master.damageIf];
			return hIf(def,master);
		} catch(err) { ERROR.err(3,err); } //quickfix
	});
		
	addTargetIf(CST.DAMAGE_IF.always,function(def,atk){ 
		return true 
	});
	
	addTargetIf(CST.DAMAGE_IF.never,function(def,atk){ 
		return false 
	});
	
})(); //{

})(); //{
