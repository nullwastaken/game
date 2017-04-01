
"use strict";
(function(){ //}
var Actor;
global.onReady(function(){
	Actor = rootRequire('shared','Actor');
});
var Stat = exports.Stat = function(extra){
	this.id = '';
	this.name = '';
	this.description = '';
	this.icon = '';
	this.path = [];
	this.value = null;	//Stat.Value
	this.playerOnly = false; //if not playerOnly : cant be boosted with equip/curse for non player
	this.custom = false;
	this.customFunc = null;
	Tk.fillExtra(this,extra);
};

//assumes 'Qsystem-player-' is in front of custom ability

Stat.create = function(id,name,description,icon,path,value,playerOnly,customFunc){
	if(DB[id]) return ERROR('id already taken');
	DB[id] = new Stat({
		id:id,
		name:name,
		description:description,
		icon:icon,
		path:path,
		value:value,
		playerOnly:playerOnly, //if not playerOnly : cant be boosted with equip/curse for non player
		custom:!!customFunc,
		customFunc:customFunc,
		//customVisible:!!customVisible	//un used? for custom, if appear in Custom:... in stat window
	});
}
var DB = Stat.DB = {};

var getIcon = function(a,b){	//Img.getIcon
	return a + '-' + b;
}

Stat.get = function(id){
	return DB[id] || ERROR(3,'invalid stat',id);
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
	Stat.create('maxSpd','Max Speed','Movement speed.','defensive-speed',["maxSpd"],Stat.Value({
		base:CST.PLAYERSPD,
	}),false);
	Stat.create('acc','Acceleration','Movement acceleration.','defensive-speed',["acc"],Stat.Value({
		base:12,
	}),false);
	Stat.create('friction','Friction','Movement friction','defensive-speed',["friction"],Stat.Value({
		base:0.5,max:1,
	}),true);
	Stat.create('aim','Aim','How precise your attacks are. Only affect direction.','element-range',["aim"],Stat.Value({}),false);
	Stat.create('hp-regen','Regen Life','Life regeneration per frame.','resource-hp',["hpRegen"],Stat.Value({
		base:1,
	}),false);
	Stat.create('mana-regen','Regen Mana','Mana regeneration per frame.','resource-mana',["manaRegen"],Stat.Value({
		base:0.4,
	}),false);
	Stat.create('hp-max','Max Life','Maximum hitpoints.','resource-hp',["hpMax"],Stat.Value({
		base:1000,
	}),false);
	Stat.create('mana-max','Max Mana','Maximum mana.','resource-mana',["manaMax"],Stat.Value({
		base:100,
	}),false);
	Stat.create('leech-magn','Leech Life Magn.','Affect amount of life recovered when leeching life.','attackRange-bleed',["bonus","leech","magn"],Stat.Value({	}),false);
	Stat.create('leech-chance','Leech Life Chance','Affect chance to steal life when hitting an enemy.','attackRange-bleed',["bonus","leech","chance"],Stat.Value({}),false);
	Stat.create('pickRadius','Pick Radius','Maximum distance that you can still pick items on the ground.','defensive-pickup',["pickRadius"],Stat.Value({
		base:250,min:5,
	}),true);
	Stat.create('magicFind-quantity','Item Quantity','Chance to receive more drops from enemies. Quantity impacts chance that an enemy will drop something.','defensive-magicFind',["magicFind","quantity"],Stat.Value({}),true);
	Stat.create('magicFind-quality','Item Quality','Chance to receive higher quality equip from enemies. Quality impacts chance to roll top-bracket stats.','defensive-magicFind',["magicFind","quality"],Stat.Value({}),true);
	Stat.create('magicFind-rarity','Item Rarity','Chance to receive higher rarity equip from enemies. Rarity impacts amount of locked boost of equips.','defensive-magicFind',["magicFind","rarity"],Stat.Value({}),true);
	Stat.create('atkSpd','Atk Speed','Affect how fast can use abilities.','offensive-atkSpd',["atkSpd"],Stat.Value({
		base:1,
	}),false);
	Stat.create('crit-chance','Crit Chance','Affect chance to do a critical hit which deals more damage.','offensive-strike',["bonus","crit","chance"],Stat.Value({
		base:0.05,
	}),false);
	Stat.create('crit-magn','Crit Magn','Affect additional damage when doing a critical hit.','offensive-strike',["bonus","crit","magn"],Stat.Value({
		base:2,
	}),false);
	Stat.create('bullet-amount','Proj. Amount','Shoot x times additional bullets.  If amount is not whole, it is rounded up or down randomly.','offensive-bullet',["bonus","bullet","amount"],Stat.Value({
		base:1,
	}),false);
	Stat.create('bullet-spd','Proj. Spd','Affect speed at which your bullet travels.','offensive-bullet',["bonus","bullet","spd"],Stat.Value({
		base:1,
	}),false);
	Stat.create('strike-range','Strike Range','Affect the minimum and maximum distance where you can strike.','offensive-strike',["bonus","strike","range"],Stat.Value({
		base:100,	//BAD, check Combat.applyAttackMod.bonus
	}),true);
	Stat.create('strike-size','AoE Size','Affect the width and height of your strike.','offensive-strike',["bonus","strike","size"],Stat.Value({
		base:1,
	}),true);
	Stat.create('strike-maxHit','AoE Max Target','Affect the maximum amount of target that can be hit by the same strike.','offensive-strike',["bonus","strike","maxHit"],Stat.Value({
		base:1,
	}),true);
	Stat.create('burn-time','Burn Time','Affect burn duration.','status-burn',["bonus","burn","time"],Stat.Value({
		base:100,
	}),false);
	Stat.create('burn-magn','Burn Magn','Affect damage dealt to a burnt enemy.','status-burn',["bonus","burn","magn"],Stat.Value({
		base:0.005,
	}),false);
	Stat.create('burn-chance','Burn Chance','Affect chance to burn enemy.','status-burn',["bonus","burn","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('chill-time','Chill Time','Affect chill duration.','status-chill',["bonus","chill","time"],Stat.Value({
		base:50,
	}),false);
	Stat.create('chill-magn','Chill Magn','Affect how much speed and attack speed with be reduced.','status-chill',["bonus","chill","magn"],Stat.Value({
		base:2,
	}),false);
	Stat.create('chill-chance','Chill Chance','Affect chance to slow down enemy.','status-chill',["bonus","chill","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('stun-time','Stun Time','Affect stun recovery duration.','status-stun',["bonus","stun","time"],Stat.Value({
		base:10,
	}),false);
	Stat.create('stun-magn','Stun Magn','Affect how much attack charge enemy will lose when stun.','status-stun',["bonus","stun","magn"],Stat.Value({
		base:2,
	}),false);
	Stat.create('stun-chance','Stun Chance','Affect chance to stun enemy.','status-stun',["bonus","stun","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('bleed-time','Bleed Time','Affect bleed duration.','status-bleed',["bonus","bleed","time"],Stat.Value({
		base:25,
	}),false);
	Stat.create('bleed-magn','Bleed Magn','Affect damage dealt by bleeding an enemy.','status-bleed',["bonus","bleed","magn"],Stat.Value({
		base:4,
	}),false);
	Stat.create('bleed-chance','Bleed Chance','Affect chance to bleed enemy dealing damage over time.','status-bleed',["bonus","bleed","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('drain-time','Drain Time','Affect how long the enemy will be drained.','status-drain',["bonus","drain","time"],Stat.Value({	//USELESS
		base:100,
	}),false);
	Stat.create('drain-magn','Drain Magn','Affect how much mana is drained from enemy.','status-drain',["bonus","drain","magn"],Stat.Value({
		base:25,
	}),false);
	Stat.create('drain-chance','Drain Chance','Affect chance to steal mana from enemy.','status-drain',["bonus","drain","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('knock-time','Knock Time','Affect how long the enemy will be pushed back.','status-knock',["bonus","knock","time"],Stat.Value({
		base:15,
	}),false);
	Stat.create('knock-magn','Knock Magn','Affect how far away the enemy will be pushed.','status-knock',["bonus","knock","magn"],Stat.Value({
		base:10,
	}),false);
	Stat.create('knock-chance','Knock Chance','Affect chance to push enemy with your attack.','status-knock',["bonus","knock","chance"],Stat.Value({
		base:1,
	}),false);
	Stat.create('resist-burn','Burn Resist','','status-burn',["statusResist","burn"],Stat.Value({min:-100}),false);
	Stat.create('resist-chill','Chill Resist','','status-chill',["statusResist","chill"],Stat.Value({min:-100}),false);
	Stat.create('resist-drain','Drain Resist','','status-drain',["statusResist","drain"],Stat.Value({min:-100}),false);
	Stat.create('resist-stun','Stun Resist','','status-stun',["statusResist","stun"],Stat.Value({min:-100}),false);
	Stat.create('resist-knock','Knock Resist','','status-knock',["statusResist","knock"],Stat.Value({min:-100}),false);
	Stat.create('resist-bleed','Bleed Resist','','status-bleed',["statusResist","bleed"],Stat.Value({min:-100}),false);
	
	
	
	for(var i in {def:1,dmg:1}){
		for(var j in CST.element.list){
			var el = CST.element.list[j];
			
			//value
			var name = CST.element.toCaps[el] + ' ' + i.$capitalize(); //Melee Def
			var id = i + '-' + el;	//dmg-melee
			
			var description = i === 'def'
				? 'Reduce ' + el + ' damage taken.'
				: 'Increase ' + el + ' damage dealt.';
			
			var icon = getIcon('element',el);
			var path = ["mastery",i,el,'value'];
			var value = {base:1};
			Stat.create(id,name,description,icon,path,Stat.Value(value),true);
			//Stat.create(id + '-+',name,description,icon,path,Stat.Value(value),true);	//BAD, add legacy support
			
			//mod
			var name = CST.element.toCaps[el] + ' ' + i.$capitalize() + ' Mod'; //Melee Def
			var id = i + '-' + el + '-mod';	//dmg-melee
			
			var description = i === 'def'
				? 'Reduce ' + el + ' damage taken.'
				: 'Increase ' + el + ' damage dealt.';
			
			var icon = getIcon('element',el);
			var path = ["mastery",i,el,'mod'];
			var value = {base:1};
			Stat.create(id,name,description,icon,path,Stat.Value(value),false);
		}
	}
	
	for(var i in CST.equip.weapon){
		var w = CST.equip.weapon[i];
		Stat.create('weapon-' + w,'Dmg ' + w.$capitalize(),'Increase Damage Dealt with ' + w.$capitalize(),getIcon('weapon',w),["bonus","weapon",w],Stat.Value({}),true);
	}
		
	Stat.create('globalDef','Main Defense','Reduce damage taken from all elements.','blessing-reflect',["globalDef"],Stat.Value({
		base:1,
	}),false);
	Stat.create('globalDmg','Main Damage','Increase damage dealt for all elements.','element-melee2',["globalDmg"],Stat.Value({
		base:1,
	}),false);
	Stat.create('summon-amount','Summon Amount','Affect how many summons you can have at once.','summon-wolf',["bonus","summon","amount"],Stat.Value({
		base:1,
	}),true);
	Stat.create('summon-time','Summon Time','Affect how long your summons last.','summon-wolf',["bonus","summon","time"],Stat.Value({
		base:1,
	}),true);
	Stat.create('summon-atk','Summon Atk','Affect the overall damage of your summons.','summon-wolf',["bonus","summon","atk"],Stat.Value({
		base:1,
	}),true);
	Stat.create('summon-def','Summon Def','Affect the overall defence of your summons.','summon-wolf',["bonus","summon","def"],Stat.Value({
		base:1,
	}),true);
	
	/*
	X sword: leech life when bleeding enemy
	X mace: heal spell only works if below 20% hp, x5 hp regen
	X spear: more dmg if far away from monster (up to x1.5)
	wand: always leech life, cant heal ability
	staff: when over 50% hp, u get lose 50 hp/sec, when below 60% hp, u get 25% dmg bonus
	orb: x2 chance to afflict status, x2 less resistant to status
	bow: x1.25 atk spd, cant crit
	crossbow: x1.5 atk spd, -25 hp each shooting
	boomerang: 50% chance to crit, atk spd = 1
-	wood helm: +25% range def if using range weapon
-	bone helm: if not wearing helmet, +25% hp, +25% mana
-	metal helm: if def melee > (def range + def magic) then def range and def magic *= 2
!	wood body: def stats = mediane of def stats
!	metal body: half def melee is applied to magic and range
!	bone body: no longer regen life, mana regen x1.5
!	ruby ring: +200% chance burning, cant trigger other status effect
!	sapphire ring: if cold def is lowest stat, then it comes equal to highest def stat
!	topaz ring: cant be stun
!	ruby amulet: all your defence = the lowest defence, all your defnece are then x1.5
!	sapphire amulet: cold atk = cold def
!	topaz amulet: average dmg and def
	*/
	
	Stat.create('coldEquality','Cold Equality','Your cold damage becomes equal to your cold defence.','element-cold',["bonus","statCustom","coldEquality"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['dmg-cold'].base = list['def-cold'].base;	
	});
	
	Stat.create('balanced','Balanced','Your defence and damage are averaged.','element-cold',["bonus","statCustom","balanced"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		for(var i = 0 ; i < CST.element.list.length; i++){
			var e = CST.element.list[i];
			var avg = (list['dmg-' + e].base + list['def-' + e].base)/2
			list['dmg-' + e].base = list['def-' + e].base = avg;
		}
	});
		
	Stat.create('chain','Chain','All your defence stats become equal to your lowest defence stat multiplied by 1.25.','element-cold',["bonus","statCustom","chain"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		var min = Math.min(
			list['def-melee'].base,
			list['def-range'].base,
			list['def-magic'].base,
			list['def-fire'].base,
			list['def-cold'].base,
			list['def-lightning'].base
		);
		min = (min-1) * 1.25 + 1;
		list['def-melee'].base = 
			list['def-range'].base = 
			list['def-magic'].base = 
			list['def-fire'].base = 
			list['def-cold'].base = 
			list['def-lightning'].base = min;
		
	});
	
	Stat.create('noStun','Unstunable','Cannot be stunned.','element-cold',["bonus","statCustom","noStun"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['resist-stun'].base = 1;	
	});
	
	Stat.create('coldSuperiority','Cold Superiority','If cold defence is your worse defence stat, then it becomes equal to your highest defence stat.','element-cold',["bonus","statCustom","coldSuperiority"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		var val = list['def-cold'].base;
		if(val <= list['def-melee'].base
			&& val <= list['def-range'].base
			&& val <= list['def-magic'].base
			&& val <= list['def-fire'].base
			&& val <= list['def-lightning'].base){
			list['def-cold'].base = Math.max(
				list['def-melee'].base,
				list['def-range'].base,
				list['def-magic'].base,
				list['def-fire'].base,
				list['def-lightning'].base
			);
		}
	});
		
	Stat.create('onlyBurn','Just Burning','x2 more chance to burn enemies. Cannot trigger other status effect.','element-cold',["bonus","statCustom","onlyBurn"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['burn-chance'].base *= 2;
		
		list['bleed-chance'].base = 0;
		list['knock-chance'].base = 0;
		list['drain-chance'].base = 0;
		list['chill-chance'].base = 0;
		list['stun-chance'].base = 0;
		
	});
	
	Stat.create('noHelm','No Helm','If not wearing helm, x1.5 hp and x1.25 mana.','element-cold',["bonus","statCustom","noHelm"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		var equip = Actor.getEquip(act);
		if(!equip.piece.helm){
			list['hp-max'].base *= 1.5;
			list['mana-max'].base *= 1.25;
		}
	});
		
	Stat.create('specialMetal','Special Metal','Half melee defence bonus is also applied on range and magic defences.','element-cold',["bonus","statCustom","specialMetal"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		var toadd = (list['def-melee'].base-1)/2;
		list['def-magic'].base += toadd;
		list['def-range'].base += toadd;		
	});
		
	Stat.create('mediane','Mediane','Defence stats become equal to the mediane of defence stats.','element-cold',["bonus","statCustom","mediane"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		var array = [list['def-melee'].base,list['def-range'].base,list['def-magic'].base];
		array.sort();
		list['def-melee'].base = list['def-range'].base = list['def-magic'].base = array[1];

		var array = [list['def-fire'].base,list['def-cold'].base,list['def-lightning'].base];
		array.sort();
		list['def-fire'].base = list['def-cold'].base = list['def-lightning'].base = array[1];
		
	});
	
	Stat.create('meleeNum1','Melee #1','If your melee defence is greater than your range and magic defences combined,<br>then your range and magic defences are multiplied by 2.','element-cold',["bonus","statCustom","meleeNum1"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		if(list['def-melee'].base-1 > (list['def-range'].base-1+list['def-magic'].base-1)){
			var val = list['def-range'].base;
			list['def-range'].base = (val-1) * 2 + 1;
			
			var val = list['def-magic'].base;
			list['def-magic'].base = (val-1) * 2 + 1;
		}			
	});
	
	Stat.create('rangeWeapon','Range Weapon','If using a range weapon, x1.25 range defence.','element-cold',["bonus","statCustom","rangeWeapon"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		var type = Actor.getWeaponType(act,function(){	//BAD
			Actor.permBoost.update(w.player);
		});
		
		if(type === 'bow' || type === 'crossbow' || type === 'boomerang'){
			var val = list['def-range'].base;
			list['def-range'].base = (val-1)*1.25 + 1;
		}
	});
	
	Stat.create('onlyManaRegen','Mind Over Matter','x1.5 more mana regen. No more life regen.','element-cold',["bonus","statCustom","onlyManaRegen"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['mana-regen'].base *= 1.5;
		list['hp-regen'].base = 0;		
	});
	
	
	//weapon
	Stat.create('critMania','Crit-mania','33% chance to crit. Attack speed is capped at x1.','element-cold',["bonus","statCustom","critMania"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['crit-chance'].base = 0.33;
		list['atkSpd'].base = 1;		
	});
	
	Stat.create('statusMania','Status-mania','x2 more chance to afflict status.<br>Status afflicted to you are x2 stronger.','element-cold',["bonus","statCustom","statusMania"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		
		list['resist-bleed'].base = -1;	
		//not knock cuz would break things...
		list['resist-drain'].base = -1;	
		list['resist-burn'].base = -1;	
		list['resist-chill'].base = -1;	
		list['resist-stun'].base = -1;	
		
		list['bleed-chance'].base *= 2;
		list['knock-chance'].base *= 2;
		list['drain-chance'].base *= 2;
		list['burn-chance'].base *= 2;
		list['chill-chance'].base *= 2;
		list['stun-chance'].base *= 2;
	});
	
	Stat.create('noRandom','No Random','Cannot land critical hits.<br>x1.25 attack speed.','element-cold',["bonus","statCustom","noRandom"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['crit-chance'].base = 0;
		list['atkSpd'].base *= 1.25;
	});
	
	Stat.create('lifeToMana','Life To Mana','25% more mana regen. 25% less life.','element-cold',["bonus","statCustom","lifeToMana"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['hp-max'].base *= 0.75;
		list['mana-regen'].base *= 1.25;
	});
	
	Stat.create('riskyHp','Risky','x3 more hp regen. Can only used Healing spell if at less than 10% hp.','element-cold',["bonus","statCustom","riskyHp"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		//logic done in Actor.canUseHeal
		list['hp-regen'].base *= 3;
	});
	
	Stat.create('leechKing','Leech King','Always leech life. Cannot use Healing Spell.','element-cold',["bonus","statCustom","leechKing"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		//logic done in Actor.canUseHeal
		list['leech-chance'].base = 1;
	});
	
	Stat.create('lifeForSpd','Life For Speed','Attack x1.25 faster. Every attack costs 25 Hp.','element-cold',["bonus","statCustom","lifeForSpd"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		//logic done in Actor.onAttack
		list['atkSpd'].base *= 1.25;
	});
	
	Stat.create('longRange','Long Range','You can hit enemies far away from you with melee.','element-cold',["bonus","statCustom","longRange"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		list['strike-range'].base = 300;
	});
	
	Stat.create('leechBleed','Leech Bleed','100% chance to leech life when you afflict bleeding to an enemy.','element-cold',["bonus","statCustom","leechBleed"],Stat.Value({
		base:0,
	}),true,function(list,value,act){
		//Actor.onAfflictBleed
	});
	
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
	
	Stat.actorBoostList = new Function('type', 'return type === CST.ENTITY.player ? ' + Tk.stringify(p) + ' : ' + Tk.stringify(e));
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
	
/*
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
*/


Stat.getNiceBoostText = function(boost,withHtml){	//{value,stat}
	var stat = Stat.get(boost.stat);
		
	if(!stat.custom){
		var value = '+' + boost.value.r(2);
		if(boost.type === CST.BOOST_X || stat.value.base === 0) 
			value = '+' + (boost.value*100).r(2) + '%';
		
		if(withHtml)
			return {
				stat:$('<span>')
					.html(stat.name)
					.attr('title',stat.description),
				value:value,
			}
		else
			return {
				stat:stat.name,
				value:value,
			}
	} else {
		if(!withHtml)
			return {
				stat:stat.name,
				value:'',
			}
		else
			return {
				stat:$('<strong>')
					.html(stat.name)
					.css({color:'#000000',fontStyle:'italic'})
					.attr('title','')
					.tooltip(Tk.getTooltipOptions({
						content:stat.description
					})),
				value:'',
			}		
	}
}


initStat();




})();

