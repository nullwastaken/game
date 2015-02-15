//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){  //}
var Actor = require2('Actor'), Equip = require2('Equip'), Boost = require2('Boost');
var QueryDb = require4('QueryDb');
var Combat = require3('Combat');

Combat.applyAttackMod = function(player,atk){
	atk = Combat.applyAttackMod.bonus(player.bonus,atk);
	atk = Combat.applyAttackMod.weapon(Actor.getWeapon(player),atk);
	atk = Combat.applyAttackMod.player(player,atk);
	return atk;
}
Combat.applyAttackMod.bonus = function(bon,atk){
	var bon = Tk.useTemplate(Actor.Bonus(),bon,0);
	
	//Status Effect
	for(var i in CST.status.list){
		var status = CST.status.list[i];
		if(!atk[status]) continue;
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
	
	if(atk.type === 'bullet'){
		atk.amount *= bon.bullet.amount; atk.amount = Math.roundRandom(atk.amount);
		atk.spd *= bon.bullet.spd;
	}
	if(atk.type === 'strike'){
		atk.width *= bon.strike.size; 
		atk.height *= bon.strike.size; 
		atk.maxHit *= bon.strike.maxHit; atk.maxHit = Math.roundRandom(atk.maxHit);
		atk.initPosition.maxRange *= bon.strike.range; 
	}
	return atk;
}

Combat.applyAttackMod.player = function(player,atk){
	atk.dmg.main *= player.globalDmg;
	
	for(var i in atk.dmg.ratio){ 
		atk.dmg.ratio[i] *= player.mastery.dmg[i].sum * player.mastery.dmg[i].mod;
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

Combat.MIN_EQUIP_DEF = 0.5;	//if naked, only apply on player
Combat.WEAPON_MAIN_MOD = 1.5;
Combat.ARMOR_MAIN_MOD = 2.25;

Combat.getMasteryExpMod = function(mastery){
	return Math.log10(mastery + 100) * 0.1 + 0.8;	//1.1 at 900, 1.2 at 9900, 1.3 at 99900
}
Combat.getMainDmgDefByLvl = function(lvl){	//in average, has 1.25 * main. in def cuz of ratio
	return 1 + 0.01*lvl;				//but ok cuz weapon boost by 1.5 certain attack
}

Combat.getEnemyPower = function(act,num){
	if(num === 1) return [];
	var dmg = 1 + Math.sqrt(num-1) * 0.25;	//1=1,	2=1.25,	3:1.35,		5:	1.5		10: 1.75
	var def = 1 + Math.sqrt(num-1) * 0.50;	//1=1,	2=1.5,	3:1.70,		5:  2		10: 2.5
	return [
		Boost.create('enemypower','globalDmg',dmg || 1,60*1000,"***"),
		Boost.create('enemypower','globalDef',def || 1,60*1000,"***"),
	];
}

Combat.getVisiblePower = function(main){
	return (Math.pow(main*Combat.WEAPON_MAIN_MOD,10)*100).r(0) + 10;
}

})(); //{


