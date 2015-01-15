//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
if(SERVER) eval('var ReputationGrid;');

(function(){ //}
var DB = null;

ReputationGrid = exports.ReputationGrid = function(base){
	var tmp = {
		width:15,
		height:15,
		base:base,
	};
	DB = tmp;
};
ReputationGrid.useSignInPack = function(signInPack){
	ReputationGrid(signInPack);
}

ReputationGrid.Base = function(array){
	return array;
};
+(function(){
	var s = ReputationGrid.Base.slot = function(stat,value){	
		if(!stat) return {type:'freeby',stat:'mana-max',value:0};	//freeby...
		return {
			stat:stat,
			value:value,
			type:'normal',
		}
	}

	ReputationGrid(ReputationGrid.Base([
		[s("def-cold-+",0.05),s("def-magic-+",0.05),s("mana-regen",0.05),s("summon-amount",0.05),s("weapon-orb",0.05),s("dmg-magic-+",0.05),s("def-fire-+",0.05),s("dmg-magic-+",0.05),s("def-cold-+",0.05),s("hp-regen",0.05),s("knock-magn",0.05),s("strike-maxHit",0.05),s("chill-magn",0.05),s("dmg-cold-+",0.05),s("def-range-+",0.05)],
		[s("bullet-amount",0.05),s("summon-amount",0.05),s("dmg-melee-+",0.05),s("dmg-fire-+",0.05),s("def-melee-+",0.05),s("dmg-melee-+",0.05),s("hp-regen",0.05),s("dmg-range-+",0.05),s("dmg-magic-+",0.05),s("def-fire-+",0.05),s("pickRadius",0.05),s("hp-max",0.05),s("def-melee-+",0.05),s("weapon-boomerang",0.05),s("burn-time",0.05)],
		[s("weapon-staff",0.05),s("Qsystem-player-healSlowCast",0.05),s("stun-magn",0.05),s("mana-max",0.05),s("dmg-cold-+",0.05),s("def-cold-+",0.05),s("acc",0.05),s("leech-chance",0.05),s("def-cold-+",0.05),s("bleed-time",0.05),s("def-lightning-+",0.05),s("strike-size",0.05),s("atkSpd",0.05),s("Qsystem-player-dodgeLife",0.05),s("atkSpd",0.05)],
		
		[s("def-cold-+",0.05),s("dmg-cold-+",0.05),s("def-cold-+",0.05),s("burn-time",0.05),s("Qsystem-player-healCost",0.05),s("def-lightning-+",0.05),s("summon-atk",0.05),s("acc",0.05),s("def-lightning-+",0.05),s("def-lightning-+",0.05),s("dmg-melee-+",0.05),s("maxSpd",0.05),s("def-melee-+",0.05),s("strike-range",0.05),s("dmg-cold-+",0.05)],
		[s("def-range-+",0.05),s("def-melee-+",0.05),s("Qsystem-player-meleeBig",0.05),s("atkSpd",0.05),s("stun-chance",0.05),s("def-lightning-+",0.05),s("leech-chance",0.05),s("dmg-range-+",0.05),s("leech-chance",0.05),s("dmg-lightning-+",0.05),s("dmg-magic-+",0.05),s("weapon-sword",0.05),s("weapon-crossbow",0.05),s("def-range-+",0.05),s("leech-chance",0.05)],
		[s("knock-chance",0.05),s("dmg-melee-+",0.05),s("knock-chance",0.05),s("dmg-range-+",0.05),s("def-range-+",0.05),s("leech-magn",0.05),s("knock-magn",0.05),s("def-melee-+",0.05),s("Qsystem-player-lightningBullet",0.05),s("def-melee-+",0.05),s("knock-time",0.05),s("magicFind-quality",0.05),s("dmg-lightning-+",0.05),s("dmg-lightning-+",0.05),s("summon-amount",0.05)],
		
		[s("dmg-cold-+",0.05),s("def-lightning-+",0.05),s("chill-time",0.05),s("chill-time",0.05),s("knock-time",0.05),s("Qsystem-player-fireBullet",0.05),s(),s(),s(),s("mana-max",0.05),s("def-melee-+",0.05),s("acc",0.05),s("dmg-melee-+",0.05),s("dmg-lightning-+",0.05),s("strike-size",0.05)],
		[s("dmg-melee-+",0.05),s("atkSpd",0.05),s("drain-chance",0.05),s("weapon-boomerang",0.05),s("def-cold-+",0.05),s("drain-magn",0.05),s(),s(),s(),s("dmg-range-+",0.05),s("def-fire-+",0.05),s("def-range-+",0.05),s("def-melee-+",0.05),s("weapon-crossbow",0.05),s("def-magic-+",0.05)],
		[s("drain-time",0.05),s("Qsystem-player-magicBullet",0.05),s("hp-regen",0.05),s("def-fire-+",0.05),s("def-range-+",0.05),s("bleed-chance",0.05),s(),s(),s(),s("def-lightning-+",0.05),s("def-magic-+",0.05),s("Qsystem-player-lightningBomb",0.05),s("hp-max",0.05),s("knock-chance",0.05),s("def-melee-+",0.05)],
		
		[s("hp-regen",0.05),s("burn-time",0.05),s("def-cold-+",0.05),s("weapon-crossbow",0.05),s("def-melee-+",0.05),s("Qsystem-player-coldBullet",0.05),s("def-melee-+",0.05),s("def-range-+",0.05),s("dmg-magic-+",0.05),s("weapon-bow",0.05),s("bullet-spd",0.05),s("def-fire-+",0.05),s("dmg-fire-+",0.05),s("dmg-cold-+",0.05),s("knock-time",0.05)],
		[s("def-magic-+",0.05),s("def-cold-+",0.05),s("def-lightning-+",0.05),s("strike-maxHit",0.05),s("def-melee-+",0.05),s("dmg-melee-+",0.05),s("dmg-cold-+",0.05),s("summon-def",0.05),s("Qsystem-player-magicBomb",0.05),s("bullet-spd",0.05),s("def-lightning-+",0.05),s("weapon-boomerang",0.05),s("knock-time",0.05),s("dmg-magic-+",0.05),s("dmg-cold-+",0.05)],
		[s("strike-maxHit",0.05),s("dmg-lightning-+",0.05),s("leech-magn",0.05),s("Qsystem-player-windKnock",0.05),s("def-melee-+",0.05),s("def-magic-+",0.05),s("dmg-melee-+",0.05),s("knock-time",0.05),s("dmg-cold-+",0.05),s("knock-time",0.05),s("chill-magn",0.05),s("knock-time",0.05),s("Qsystem-player-dodgeFast",0.05),s("dmg-magic-+",0.05),s("dmg-lightning-+",0.05)],
		
		[s("dmg-range-+",0.05),s("Qsystem-player-healFast",0.05),s("drain-chance",0.05),s("def-range-+",0.05),s("bleed-time",0.05),s("knock-chance",0.05),s("strike-maxHit",0.05),s("dmg-melee-+",0.05),s("magicFind-quality",0.05),s("bullet-spd",0.05),s("bullet-spd",0.05),s("dmg-magic-+",0.05),s("hp-regen",0.05),s("def-range-+",0.05),s("dmg-lightning-+",0.05)],
		[s("knock-chance",0.05),s("chill-time",0.05),s("leech-magn",0.05),s("bleed-chance",0.05),s("dmg-melee-+",0.05),s("stun-magn",0.05),s("dmg-melee-+",0.05),s("chill-time",0.05),s("dmg-magic-+",0.05),s("def-melee-+",0.05),s("crit-chance",0.05),s("knock-time",0.05),s("magicFind-quantity",0.05),s("def-melee-+",0.05),s("strike-maxHit",0.05)],
		[s("burn-time",0.05),s("leech-chance",0.05),s("dmg-melee-+",0.05),s("def-cold-+",0.05),s("dmg-cold-+",0.05),s("def-magic-+",0.05),s("def-magic-+",0.05),s("dmg-cold-+",0.05),s("bleed-magn",0.05),s("dmg-magic-+",0.05),s("weapon-sword",0.05),s("def-fire-+",0.05),s("def-melee-+",0.05),s("burn-chance",0.05),s("dmg-range-+",0.05)],
	]));
})();
var randomStat = function(good){
	var good = ["maxSpd","acc","hp-regen","mana-regen","hp-max","mana-max","leech-magn","leech-chance","pickRadius","magicFind-quantity","magicFind-quality","magicFind-rarity","atkSpd","crit-chance","crit-magn","bullet-amount","bullet-spd","strike-range","strike-size","strike-maxHit","burn-time","burn-magn","burn-chance","chill-time","chill-magn","chill-chance","stun-time","stun-magn","stun-chance","bleed-time","bleed-magn","bleed-chance","drain-time","drain-magn","drain-chance","knock-time","knock-magn","knock-chance","def-melee-+","def-melee-*","def-melee-^","def-melee-x","def-range-+","def-range-*","def-range-^","def-range-x","def-magic-+","def-magic-*","def-magic-^","def-magic-x","def-fire-+","def-fire-*","def-fire-^","def-fire-x","def-cold-+","def-cold-*","def-cold-^","def-cold-x","def-lightning-+","def-lightning-*","def-lightning-^","def-lightning-x","dmg-melee-+","dmg-melee-*","dmg-melee-^","dmg-melee-x","dmg-range-+","dmg-range-*","dmg-range-^","dmg-range-x","dmg-magic-+","dmg-magic-*","dmg-magic-^","dmg-magic-x","dmg-fire-+","dmg-fire-*","dmg-fire-^","dmg-fire-x","dmg-cold-+","dmg-cold-*","dmg-cold-^","dmg-cold-x","dmg-lightning-+","dmg-lightning-*","dmg-lightning-^","dmg-lightning-x","weapon-mace","weapon-spear","weapon-sword","weapon-bow","weapon-boomerang","weapon-crossbow","weapon-wand","weapon-staff","weapon-orb","summon-amount","summon-time","summon-atk","summon-def"];
	return good.random();
}

ReputationGrid.getSignInPack = function(){
	return DB.base;
}
ReputationGrid.get = function(){
	return DB;
}

})();





