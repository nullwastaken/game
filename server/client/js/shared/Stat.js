//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}

//assumes 'Qsystem-player-' is in front of custom ability

var Stat = exports.Stat = {};
Stat.create = function(id,name,description,icon,path,value,playerOnly,customFunc,customVisible){
	if(DB[id]) return ERROR('id already taken');
	DB[id] = {
		id:id || ERROR(2,'id needed'),
		name:name || '',
		description:description || '',
		icon:icon || '',
		path:path || ERROR(2,'path needed'),
		value:value || Stat.Value(),
		playerOnly:playerOnly || false, //if not playerOnly : cant be boosted with equip/curse for non player
		custom:!!customFunc,
		customFunc:customFunc || null,
		customVisible:!!customVisible	//for custom, if appear in Custom:... in stat window
	}
}
var DB = Stat.DB = {};

Stat.get = function(id){
	return DB[id] || null;
}

Stat.Value = function(info){
	info = info || {};
	return {
		base:info.base || 0,
		min:info.min || 0,
		max:info.max || 100000,
	}
}

Stat.actorBonus = null;	

Stat.actorStatCustom = null;

Stat.actorBoostList = null;

Stat.setValue = function(act,stat,value){
	var path = DB[stat].path;
	Tk.viaArray.set(act,path,value);
}

Stat.getValue = function(act,stat){
	var path = DB[stat].path;
	return Tk.viaArray.get(act,path);
}
	
//################
	
var initStat = function(){	//global in client...
	Stat.create('maxSpd','Max Speed','Movement Speed.','defensive.speed',["maxSpd"],Stat.Value({
		base:CST.PLAYERSPD,
	}),false);
	Stat.create('acc','Acceleration','Movement Acceleration.','defensive.speed',["acc"],Stat.Value({
		base:12,
	}),false);
	Stat.create('friction','Friction','Movement Friction','defensive.speed',["friction"],Stat.Value({
		base:0.5,max:1,
	}),true);
	Stat.create('aim','Aim','How precise your attacks are. Only affect direction. (Still same chance to deal damage.)','element.range',["aim"],Stat.Value({}),false);
	Stat.create('hp-regen','Regen Life','Life Regeneration per frame.','resource.hp',["hpRegen"],Stat.Value({
		base:1,
	}),false);
	Stat.create('mana-regen','Regen Mana','Mana Regeneration per frame.','resource.mana',["manaRegen"],Stat.Value({
		base:0.4,
	}),false);
	Stat.create('hp-max','Max Life','Maximum Life Points.','resource.hp',["hpMax"],Stat.Value({
		base:1000,
	}),false);
	Stat.create('mana-max','Max Mana','Maximum Mana Points.','resource.mana',["manaMax"],Stat.Value({
		base:100,
	}),false);
	Stat.create('leech-magn','Leech Life Magn.','Affect %Life recovered if the Life Leech is successful. Leech is not affected by damage dealt.','attackRange.bleed',["bonus","leech","magn"],Stat.Value({
		base:0.01,
	}),false);
	Stat.create('leech-chance','Leech Life Chance','Affect Chance to Life Leech when hitting an enemy.','attackRange.bleed',["bonus","leech","chance"],Stat.Value({}),false);
	Stat.create('pickRadius','Pick Radius','Maximum distance that you can still pick items on the ground.','defensive.pickup',["pickRadius"],Stat.Value({
		base:250,min:5,
	}),true);
	Stat.create('magicFind-quantity','Item Quantity','Chance to receive more drops from enemies. Quantity impacts chance that an enemy will drop something.','defensive.magicFind',["magicFind","quantity"],Stat.Value({}),true);
	Stat.create('magicFind-quality','Item Quality','Chance to receive higher quality equip from enemies. Quality impacts chance to roll top-bracket stats.','defensive.magicFind',["magicFind","quality"],Stat.Value({}),true);
	Stat.create('magicFind-rarity','Item Rarity','Chance to receive higher rarity equip from enemies. Rarity impacts amount of hidden boost of equips.','defensive.magicFind',["magicFind","rarity"],Stat.Value({}),true);
	Stat.create('atkSpd','Atk Speed','Affect how fast your character can use abilities.','offensive.atkSpd',["atkSpd"],Stat.Value({
		base:1,
	}),false);
	Stat.create('crit-chance','Crit Chance','Affect chance to do a Critical Hit.','offensive.strike',["bonus","crit","chance"],Stat.Value({
		base:0.05,
	}),false);
	Stat.create('crit-magn','Crit Magn','Affect Additional Damage when doing a Critical Hit.','offensive.strike',["bonus","crit","magn"],Stat.Value({
		base:1.5,
	}),false);
	Stat.create('bullet-amount','Proj. Amount','Shoot x times additional bullets.  If amount is not whole, it is rounded up or down randomly.','offensive.bullet',["bonus","bullet","amount"],Stat.Value({
		base:1,
	}),false);
	Stat.create('bullet-spd','Proj. Spd','Affect speed at which your bullet travels.','offensive.bullet',["bonus","bullet","spd"],Stat.Value({
		base:1,
	}),false);
	Stat.create('strike-range','Strike Range','Affect the minimum and maximum distance where you can strike.','offensive.strike',["bonus","strike","range"],Stat.Value({
		base:1,
	}),true);
	Stat.create('strike-size','AoE Size','Affect the width and height of your strike.','offensive.strike',["bonus","strike","size"],Stat.Value({
		base:1,
	}),true);
	Stat.create('strike-maxHit','AoE Max Target','Affect the maximum amount of target that can be hit by the same strike.','offensive.strike',["bonus","strike","maxHit"],Stat.Value({
		base:1,
	}),true);
	Stat.create('burn-time','Burn Time','Affect Burn Duration.','status.burn',["bonus","burn","time"],Stat.Value({
		base:100,
	}),false);
	Stat.create('burn-magn','Burn Magn','Affect damage dealt to a burnt enemy.','status.burn',["bonus","burn","magn"],Stat.Value({
		base:0.005,
	}),false);
	Stat.create('burn-chance','Burn Chance','Affect chance to burn enemy.','status.burn',["bonus","burn","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('chill-time','Chill Time','Affect Chill Duration.','status.chill',["bonus","chill","time"],Stat.Value({
		base:50,
	}),false);
	Stat.create('chill-magn','Chill Magn','Affect how much speed and attack speed with be reduced.','status.chill',["bonus","chill","magn"],Stat.Value({
		base:2,
	}),false);
	Stat.create('chill-chance','Chill Chance','Affect chance to chill enemy.','status.chill',["bonus","chill","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('stun-time','Stun Time','Affect Stun Duration.','status.stun',["bonus","stun","time"],Stat.Value({
		base:10,
	}),false);
	Stat.create('stun-magn','Stun Magn','Affect how reduced the sight of view of stund enemy is.','status.stun',["bonus","stun","magn"],Stat.Value({
		base:2,
	}),false);
	Stat.create('stun-chance','Stun Chance','Affect chance to stun enemy.','status.stun',["bonus","stun","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('bleed-time','Bleed Time','Affect Bleed Duration.','status.bleed',["bonus","bleed","time"],Stat.Value({
		base:25,
	}),false);
	Stat.create('bleed-magn','Bleed Magn','Affect damage dealt by bleeding enemy.','status.bleed',["bonus","bleed","magn"],Stat.Value({
		base:4,
	}),false);
	Stat.create('bleed-chance','Bleed Chance','Affect chance to bleed enemy.','status.bleed',["bonus","bleed","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('drain-time','Drain Time','USELESS. Affect how long the enemy will be drained.','status.drain',["bonus","drain","time"],Stat.Value({
		base:100,
	}),false);
	Stat.create('drain-magn','Drain Magn','Affect how much mana is drained from enemy.','status.drain',["bonus","drain","magn"],Stat.Value({
		base:25,
	}),false);
	Stat.create('drain-chance','Drain Chance','Affect chance to drain enemy.','status.drain',["bonus","drain","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('knock-time','Knock Time','Affect how long the enemy will be pushed back.','status.knock',["bonus","knock","time"],Stat.Value({
		base:15,
	}),false);
	Stat.create('knock-magn','Knock Magn','Affect how far away the enemy will be pushed.','status.knock',["bonus","knock","magn"],Stat.Value({
		base:10,
	}),false);
	Stat.create('knock-chance','Knock Chance','Affect chance to push enemy with your attack.','status.knock',["bonus","knock","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('resist-burn','Burn Resist','','status.burn',["statusResist","burn"],Stat.Value({}),false);
	Stat.create('resist-chill','Chill Resist','','status.chill',["statusResist","chill"],Stat.Value({}),false);
	Stat.create('resist-drain','Drain Resist','','status.drain',["statusResist","drain"],Stat.Value({}),false);
	Stat.create('resist-stun','Stun Resist','','status.stun',["statusResist","stun"],Stat.Value({}),false);
	Stat.create('resist-knock','Knock Resist','','status.knock',["statusResist","knock"],Stat.Value({}),false);
	Stat.create('resist-bleed','Bleed Resist','','status.bleed',["statusResist","bleed"],Stat.Value({}),false);
	
	
	
	for(var i in {def:1,dmg:1}){
		for(var j in CST.element.list){
			var el = CST.element.list[j];
			for(var k in {'+':1,'*':1,'^':1,'x':1,'mod':1}){
				var id = i + '-' + el + '-' + k;
				
				var name = k === '+'
					? el.capitalize() + ' ' + i.capitalize()
					: i.capitalize() + '-' + el.capitalize() + '-' + k;
			
				var description = i === 'def'
					? 'Reduce ' + el.capitalize() + ' Damage Taken'
					: 'Increase ' + el.capitalize() + ' Damage Dealt';
								
				var icon = 'element.' + el;
				var path = ["mastery",i,el,k];
				var value = {base:k === '+' ? 0 : 1};
				var playerOnly = k !== 'mod';
				Stat.create(id,name,description,icon,path,Stat.Value(value),playerOnly);
			}		
		}
	}
	
	for(var i in CST.equip.weapon){
		var w = CST.equip.weapon[i];
		Stat.create('weapon-' + w,'Dmg ' + w.capitalize(),'Increase Damage Dealt with ' + w.capitalize(),'weapon.' + w,["bonus","weapon",w],Stat.Value({}),true);
	}
		
	Stat.create('globalDef','Main Defense','Reduce Damage Taken from all elements.','blessing.multi',["globalDef"],Stat.Value({
		base:1,
	}),false);
	Stat.create('globalDmg','Main Damage','Increase Damage Dealt for all elements.','element.melee2',["globalDmg"],Stat.Value({
		base:1,
	}),false);
	Stat.create('summon-amount','Summon Amount','Affect how many summons you can have at once.','summon.wolf',["bonus","summon","amount"],Stat.Value({
		base:1,
	}),true);
	Stat.create('summon-time','Summon Time','Affect how long your summons last.','summon.wolf',["bonus","summon","time"],Stat.Value({
		base:1,
	}),true);
	Stat.create('summon-atk','Summon Atk','Affect the overall damage of your summons.','summon.wolf',["bonus","summon","atk"],Stat.Value({
		base:1,
	}),true);
	Stat.create('summon-def','Summon Def','Affect the overall defence of your summons.','summon.wolf',["bonus","summon","def"],Stat.Value({
		base:1,
	}),true);
	
	/*	//TEMP
	//custom
	var list = [
		['meleeBig','Bleeding Blood','attackMelee.cube'],
		['windKnock','Wind','attackRange.steady'],
		['magicBullet','Magic Bullet','attackMagic.ball'],
		['magicBomb','Magic Explosion','attackMagic.ball'],
		['fireBullet','Fire Ball','attackMagic.meteor'],
		['coldBullet','Ice Shards','attackMagic.crystal'],
		['lightningBullet','Lightning Bullet','attackMagic.static'],
		['lightningBomb','Lightning Explosion','attackMagic.static'],
		['heal','Regen','heal.plus'],
		['healFast','Fast Regen','heal.plus'],
		['healCost','Expensive Regen','heal.plus'],
		['healSlowCast','Slow Cast Regen','heal.plus'],
		['dodgeFast','Fast Dodge','blessing.spike'],
		['dodgeLife','Life Dodge','blessing.spike'],
	];
	for(var i in list){
		var s = list[i];
		var id = 'Qsystem-player-' + s[0];	//ability id
		Stat.create(id,s[1],'Grant ability ' + s[1],s[2],
			['bonus','statCustom',id],Stat.Value({base:0}),true,funcGenerator(id),false);
	}
	*/
	initStat.actorBonus();
	initStat.actorBoostList();
};

initStat.actorBoostList = function(){
	//generate boost list attribute for Actor
	var p = {};
	var e = {};
	
	for(var i in DB){
		var s = DB[i];
		var b = {
			name:{},	//rename to list
			base:s.value.base,
			permBase:s.value.base,
			min:s.value.min,
			max:s.value.max,
		};
		p[i] = b;
		if(!s.playerOnly)
			e[i] = b;
	}
	
	Stat.actorBoostList = new Function('type', 'return type === "player" ? ' + Tk.stringify(p) + ' : ' + Tk.stringify(e));
}
	
	
initStat.actorBonus = function(){
	//generate bonus attribute for Actor
	var info = {};
	
	for(var i in DB){
		if(DB[i].path[0] === 'bonus'){
			var a = DB[i].path;
			var base = DB[i].value.base;
			
			info[a[1]] = info[a[1]] || {};	//always format ['bonus','category','precise']
			info[a[1]][a[2]] = base;
		}
	}
	Stat.actorBonus = new Function('return ' + Tk.stringify(info));
}
	
var funcGenerator = function(name){ //for custom ability
	return function(pb,value,act){
		if(!SERVER) return;
		if(act.combatContext.ability !== 'normal') return;
		if(value && !Actor.getAbilityList(act)[name]){
			Actor.addAbility(act,name);			
		}
		if(!value && Actor.getAbilityList(act)[name]){
			Actor.removeAbility(act,name);		
		}
	}
}




initStat();




})();
var Actor = require3('Actor');

