var Equip, Actor, Main;
global.onReady(function(){
	Equip = rootRequire('server','Equip'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main');
});

var s = loadAPI('v1.0','Qsystem',{
	dailyTask:false,
	showInTab:false,
	showWindowComplete:false,
	inMain:false,
	alwaysActive:true,
	admin:true,
	completable:false,
});
var m = s.map; var b = s.boss; var g;

var MAXTIMER = 18;
var WEAPON_REQ_RANGE = ['bow','crossbow','boomerang'];
var WEAPON_REQ_MAGIC = ['orb','staff','wand'];
var WEAPON_REQ_MELEE = ['mace','sword','spear'];

//{ Preset
s.newPreset('onDialogue',null,null,false,false,true,true);
s.newPreset('onRespawn',null,null,false,false,true,true);
s.newPreset('onSignIn',null,null,false,false,true,true);
s.newPreset('onQuestReward',null,null,false,false,true,true);
s.newPreset('onQuestWindow',null,null,false,false,true,true);	//when clicking npc
s.newPreset('onFollowPathWait',null,null,false,false,false,false,true);
s.newPreset('pvpCommand',null,null,false,true,false,false,false);
//}

//{ General Item
s.newItem('bugged-drop','I AM ERR0R','system-square');
s.newItem('test','Test','system-square');

s.newItem('orb-removal','Orb of Removal','orb-removal',[
	s.newItem.option(function(key){
		return;
		Main.reputation.addRemovePt(Main.get(key),1);
		Main.removeItem(Main.get(key),'Qsystem-orb-removal',1);
	},"Use","Get a Reputation Remove Point.")
],null,{destroy:true,trade:true});

s.newItem('competition-1','Gold Medal','orb-boost',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),'Medal for finishing first place in a weekly competition.');
	},"Examine","")
],'Medal for finishing first in competition.',{destroy:true,trade:false});

s.newItem('competition-any','Medal','orb-boost',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),'Medal for participating in a weekly competition.');
	},"Examine","")
],'Medal for participating in a competition.',{destroy:true,trade:false});

s.newItem('equipBox','Equip Box','defensive-magicFind',[
	s.newItem.option(function(key){
		var main = Main.get(key);
		
		var choice = [
			Equip.PieceType('weapon'),
			Math.random() < 0.5 ? Equip.PieceType('body') : Equip.PieceType('helm'),
			Math.random() < 0.5 ? Equip.PieceType('ring') : Equip.PieceType('amulet'),			
		];
		var boost = [Math.floor(2+Math.random()*2),Math.floor(2+Math.random()*3),Math.floor(2+Math.random()*3)];
		var optionList = [
			Equip.PieceType.toString(choice[0]) + '<br>(' + boost[0] + ' Boosts)',
			Equip.PieceType.toString(choice[1]) + '<br>(' + boost[1] + ' Boosts)',
			Equip.PieceType.toString(choice[2]) + '<br>(' + boost[2] + ' Boosts)',			
		];
		
		s.removeItem(key,'equipBox');
		
		var askQuestion = function(){
			s.displayQuestion(key,'Choose an equipment below.',function(key,slot){
				if(!optionList[slot]){
					askQuestion();
					return s.message(key,'Invalid slot.');
				}
				s.addItem.permanently(key,Equip.randomlyGenerateFromQuestReward(Actor.get(key),boost[slot],choice[slot]).id);
				s.message(key,'You received a ' + Equip.PieceType.toString(choice[slot]) + '.');
			},'option',optionList,true);	
		}
		askQuestion();
		
	},"Open","")
],'Contains an equipment.',{destroy:true});




s.newItem('gold','Gold','system-gold',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),'Can be traded in shops for materials.');
	},"Examine","")
],'Can be traded for materials.',{trade:true});
	

s.newItem('orb-rerollRandom','Reroll Orb','orb-boost',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a equipment to change the stat of one of its boost at random.");
	},"Examine","")
],null,{trade:true});

s.newItem('orb-rerollOne','Reroll Orb','orb-boost',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a equipment to reroll a stat. No additional cost.");
	},"Examine",""),
],null,{trade:true});

s.newItem('orb-rerollValueRandom','Numeric Orb','orb-removal',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a equipment to change the numeric value of one of its boost at random.");
	},"Examine",""),
],null,{trade:true});

s.newItem('orb-rerollValueOne','Super Numeric Orb','orb-removal',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a equipment to change the numeric value of one of its boost of your choosing.");
	},"Examine",""),
],null,{trade:true});

s.newItem('orb-element','Elemental Orb','orb-water',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a weapon to change the boosted elements associated with it.");
	},"Examine",""),
],null,{trade:true});

s.newItem('orb-power','Reforge Orb','orb-boost',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a equip to change its power to a new random value.");
	},"Examine",""),
],null,{trade:true});

s.newItem('orb-rare','Rare Orb','orb-upgrade',[
	s.newItem.option(function(key){
		Main.addMessage(Main.get(key),"Coming soon. Used on a equip to add an additional locked boost.");
	},"Examine",""),
],null,{trade:true});
	
//}

//{ Equip
s.newEquip('unarmed','weapon','mace','Mace',0.8);
s.newEquip('start-body','body','wood','Body',1,[ //{
	s.newEquip.boost('hp-regen',0.05,'*'),
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});
s.newEquip('start-helm','helm','metal','Helm',1,[ //{
	s.newEquip.boost('def-melee',0.05,'+'),
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});
s.newEquip('start-amulet','amulet','ruby','Amulet',1,[ //{
	s.newEquip.boost('maxSpd',0.05,'*'),
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});
s.newEquip('start-ring','ring','sapphire','Ring',1,[ //{
	s.newEquip.boost('atkSpd',0.05,'*'),
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});
s.newEquip('start-weapon','weapon','mace','Mace',1,[ //{
	s.newEquip.boost('dmg-melee',0.15,'+'),
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});

s.newEquip('start-bow','weapon','bow','Bow',1,[ //{
	s.newEquip.boost('dmg-range',0.15,'+'),
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});
s.newEquip('start-staff','weapon','staff','Staff',1,[
	s.newEquip.boost('dmg-magic',0.15,'+'),	
],{ //}
	upgradable:true,
	salvagable:true,
	maxBoostAmount:2,
});

//{ Ability

s.newAbility('boost','boost',{},{});
s.newAbility('attack','attack',{},{type:'bullet'});
s.newAbility('idle','idle',{},{});
s.newAbility('summon','summon',{},{model:s.newAbility.model("bat"),});
s.newAbility('event','event',{},{});
s.newAbility('heal','heal',{},{});


//normal
s.newAbility('start-melee','attack',{
	name:'Strike',icon:'attackMelee-cube',
	description:'Regular Melee Strike',
	periodOwn:10,periodGlobal:10,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MELEE,
},{
	type:"strike",width:75,height:75,delay:0,
	initPosition:s.newAbility.initPosition(0,75),
	preDelayAnim:s.newAbility.anim("slashMelee",1,0),
	hitAnim:s.newAbility.anim("slashMelee",0.01),	//for sfx
	dmg:s.newAbility.dmg(500,'melee'),
	knock:s.newAbility.status(1,2,0.1),
	
	//damageOverTime:s.newAbility.damageOverTime(10000,25),
	
});
s.newAbility('start-bullet','attack',{
	name:'Basic Bullet',icon:'offensive-bullet',
	description:'Shoot 3 rocks.',
	periodOwn:10,periodGlobal:10,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_RANGE,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	amount:3,angleRange:5,
	sprite:s.newAbility.sprite("rock",0.7),
	hitAnim:s.newAbility.anim("arrowHit",0.5),
	dmg:s.newAbility.dmg(100,'range'),	
});
s.newAbility('player-magicBullet','attack',{
	name:'Arcane Bullet',icon:'attackMagic-ball',
	description:'Powerful magic spell with increased chance to drain mana.',
	periodOwn:12,periodGlobal:12,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MAGIC,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("shadowball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(300,'magic'),
	drain:s.newAbility.status(0.25,1,1),
});
s.newAbility('player-fireBullet','attack',{
	name:'Fire Ball',icon:'attackMagic-meteor',
	description:'Shoot a single fireball that explodes upon hit.',
	periodOwn:20,periodGlobal:20,
	weaponReq:WEAPON_REQ_MAGIC,
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("fireball",1),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(400,'fire'),
	onHit:s.newAbility.onHit(1,{
		type:"strike",width:200,height:200,delay:0,
		preDelayAnim:s.newAbility.anim("fireBomb2",1),
		dmg:s.newAbility.dmg(100,'fire'),
	}),
});
s.newAbility('player-fireBullet-melee','attack',{
	name:'Exploding Flame Weapon',icon:'attackMagic-meteor',
	description:'Throw your weapon in fire which explodes on contact.',
	periodOwn:20,periodGlobal:20,
	weaponReq:WEAPON_REQ_MELEE,
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	spd:s.newAbility.spd(0.6),
	sprite:s.newAbility.sprite("weapon-fire",1.2),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(450,'fire'),
	onHit:s.newAbility.onHit(1,{
		type:"strike",width:200,height:200,delay:0,
		preDelayAnim:s.newAbility.anim("fireBomb2",1),
		dmg:s.newAbility.dmg(120,'fire'),
	}),
});
s.newAbility('player-fireBullet-range','attack',{
	name:'Explosive Arrow',icon:'attackMagic-meteor',
	description:'Shoot an explosive fire arrow.',
	periodOwn:20,periodGlobal:20,
	weaponReq:WEAPON_REQ_RANGE,
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("arrow-fire",1.5),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(400,'fire'),
	onHit:s.newAbility.onHit(1,{
		type:"strike",width:200,height:200,delay:0,
		preDelayAnim:s.newAbility.anim("fireBomb2",1),
		dmg:s.newAbility.dmg(100,'fire'),
	}),
});
s.newAbility('player-coldBullet','attack',{
	name:'Ice Shards',icon:'attackMagic-crystal',
	description:'Shoot multiple ice shards.',
	periodOwn:20,periodGlobal:20,
	weaponReq:WEAPON_REQ_MAGIC,
	usableByPlayer:true,
},{
	type:"bullet",angleRange:5,amount:2,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(300,'cold'),
});
s.newAbility('player-coldBullet-melee','attack',{
	name:'Chilling Weapon Throw',icon:'attackMagic-crystal',
	description:'Throw chilling weapons at your enemies.',
	periodOwn:20,periodGlobal:20,
	weaponReq:WEAPON_REQ_MELEE,
	usableByPlayer:true,
},{
	type:"bullet",angleRange:10,amount:2,
	maxTimer:MAXTIMER,
	spd:s.newAbility.spd(0.6),
	sprite:s.newAbility.sprite("weapon-cold",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(350,'cold'),
});
s.newAbility('player-coldBullet-range','attack',{
	name:'Chilling Arrows',icon:'attackMagic-crystal',
	description:'Shoot 2 ice arrows.',
	periodOwn:20,periodGlobal:20,
	weaponReq:WEAPON_REQ_RANGE,
	usableByPlayer:true,
},{
	type:"bullet",angleRange:5,amount:2,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("arrow-cold",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(300,'cold'),
});
s.newAbility('player-lightningBullet','attack',{
	name:'Lightning Bullet',icon:'attackMagic-static',
	description:'Shoot piercing lightning balls at the speed of light.',
	periodOwn:3,periodGlobal:3,
	weaponReq:WEAPON_REQ_MAGIC,
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("lightningball",0.7),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'lightning'),
});
s.newAbility('player-lightningBullet-melee','attack',{ 
	name:'Electric Weapon Throw',icon:'attackMagic-static',
	description:'Throw an electric weapon at your enemies.',
	periodOwn:5,periodGlobal:5,
	weaponReq:WEAPON_REQ_MELEE,
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	spd:s.newAbility.spd(0.5),
	sprite:s.newAbility.sprite("weapon-lightning",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(300,'lightning'),
});
s.newAbility('player-lightningBullet-range','attack',{
	name:'Lightning Arrows',icon:'attackMagic-static',
	description:'Shoot lightning arrows at the speed of light.',
	periodOwn:3,periodGlobal:3,
	weaponReq:WEAPON_REQ_RANGE,
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("arrow-lightning",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'lightning'),
});

//special
s.newAbility('player-meleeBig','attack',{
	name:'Bleeding Blow',icon:'attackMelee-cube',
	description:'Powerful Melee Strike with increased bleed chance. Cost life.',
	periodOwn:20,periodGlobal:20,costHp:100,
	weaponReq:WEAPON_REQ_MELEE,
},{
	type:"strike",width:80,height:80,delay:0,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("slashMelee",1),
	hitAnim:s.newAbility.anim("strikeHit",0.2),
	dmg:s.newAbility.dmg(700,'melee'),
	knock:s.newAbility.status(1,2,0.1),
	bleed:s.newAbility.status(0.25,1,1),
});
s.newAbility('player-windKnock','attack',{
	name:'Tornado',icon:'attackRange-steady',
	description:'Defensive tornado that pushes enemies away.',
	periodOwn:20,periodGlobal:20,costMana:50,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_RANGE,
},{
	type:"bullet",angleRange:30,amount:3,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("tornado",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(200,'range'),
	knock:s.newAbility.status(1,1.5,1.5),
});
s.newAbility('player-magicBomb','attack',{
	name:'Arcane Explosion',icon:'attackMagic-ball',
	description:'Explosive spell that can leech life.',
	periodOwn:40,periodGlobal:20,costMana:75,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MAGIC,
},{
	type:"strike",width:200,height:200,delay:4,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("magicBomb",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(1200,'magic'),
	leech:s.newAbility.status(0.25,1,1),
});
s.newAbility('start-fireball','attack',{
	name:'Fireball Boom',icon:'attackMagic-meteor',
	description:'Shoot multiple fireballs.',
	periodOwn:20,periodGlobal:20,costMana:50,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MAGIC,
},{
	type:"bullet",angleRange:35,amount:7,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("fireball",1.2),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
});
s.newAbility('start-fireball-melee','attack',{
	name:'Throw Burning Weapons',icon:'attackMagic-meteor',
	description:'Throw multiple flame weapons.',
	periodOwn:20,periodGlobal:20,costMana:50,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MELEE,
},{
	type:"bullet",angleRange:35,amount:7,
	maxTimer:MAXTIMER,
	spd:s.newAbility.spd(0.5),
	sprite:s.newAbility.sprite("weapon-fire",1),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(175,'fire'),
});
s.newAbility('start-fireball-range','attack',{
	name:'Split Fire Arrows',icon:'attackMagic-meteor',
	description:'Throw multiple fire arrows.',
	periodOwn:20,periodGlobal:20,costMana:50,
	weaponReq:WEAPON_REQ_RANGE,
	usableByPlayer:true,
},{
	type:"bullet",angleRange:35,amount:7,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("arrow-fire",1),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
});
s.newAbility('start-freeze','attack',{
	name:'Freeze Bullet',icon:'attackMagic-crystal',
	description:'Defensive spell that feezes enemies.',
	periodOwn:25,periodGlobal:20,costMana:40,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MAGIC,
},{
	type:"bullet",angleRange:25,amount:5,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(200,'cold'),
	chill:s.newAbility.status(0.5,4,1),
});
s.newAbility('start-freeze-melee','attack',{
	name:'Throw Frozen Weapons',icon:'attackMagic-crystal',
	description:'Throw frozen weapons at your enemies.',
	periodOwn:25,periodGlobal:20,costMana:40,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MELEE,
},{
	type:"bullet",angleRange:25,amount:5,
	maxTimer:MAXTIMER,
	spd:s.newAbility.spd(0.5),
	sprite:s.newAbility.sprite("weapon-cold",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(225,'cold'),
	chill:s.newAbility.status(0.5,4,1),
});
s.newAbility('start-freeze-range','attack',{
	name:'Split Ice Arrows',icon:'attackMagic-crystal',
	description:'Shoot multiple ice arrows.',
	periodOwn:25,periodGlobal:20,costMana:40,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_RANGE,
},{
	type:"bullet",angleRange:25,amount:5,
	maxTimer:MAXTIMER,
	sprite:s.newAbility.sprite("arrow-cold",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(200,'cold'),
	chill:s.newAbility.status(0.5,4,1),
});
s.newAbility('player-lightningBomb','attack',{
	name:'Lightning Explosion',icon:'attackMagic-static',
	description:'Explodes in all directions, piercing through enemies.',
	periodOwn:30,periodGlobal:20,costMana:75,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MAGIC,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(100,150),
	preDelayAnim:s.newAbility.anim("lightningBomb",1),
	dmg:s.newAbility.dmg(400,'lightning'),
	onDamagePhase:s.newAbility.onDamagePhase(1,{
		type:"bullet",angleRange:360,amount:10,
		maxTimer:MAXTIMER/2,
		spd:s.newAbility.spd(0.5),
		sprite:s.newAbility.sprite("lightningball",1.2),
		hitAnim:s.newAbility.anim("lightningHit",0.5),
		dmg:s.newAbility.dmg(100,'lightning'),
		pierce:s.newAbility.pierce(1,0.5,5),
	}),
});
s.newAbility('player-lightningBomb-melee','attack',{
	name:'Lightning Boom',icon:'attackMagic-static',
	description:'Create an electric explosion which also throws lightning weapons in all directions.',
	periodOwn:30,periodGlobal:20,costMana:75,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MELEE,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(50,100),
	preDelayAnim:s.newAbility.anim("lightningBomb",1),
	dmg:s.newAbility.dmg(400,'lightning'),
	onDamagePhase:s.newAbility.onDamagePhase(1,{
		type:"bullet",angleRange:360,amount:10,
		sprite:s.newAbility.sprite("weapon-lightning",1.2),
		maxTimer:MAXTIMER,
		spd:s.newAbility.spd(0.3),
		hitAnim:s.newAbility.anim("lightningHit",0.5),
		dmg:s.newAbility.dmg(120,'lightning'),
		pierce:s.newAbility.pierce(1,0.5,5),
	}),
});
s.newAbility('player-lightningBomb-range','attack',{
	name:'Electric Arrow Whirlwind',icon:'attackMagic-static',
	description:'Create an electric explosion which also shoots lightning arrows in all directions.',
	periodOwn:30,periodGlobal:20,costMana:75,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_RANGE,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(100,150),
	preDelayAnim:s.newAbility.anim("lightningBomb",1),
	dmg:s.newAbility.dmg(400,'lightning'),
	onDamagePhase:s.newAbility.onDamagePhase(1,{
		type:"bullet",angleRange:360,amount:10,
		maxTimer:MAXTIMER/2,
		spd:s.newAbility.spd(0.5),
		sprite:s.newAbility.sprite("arrow-lightning",1.2),
		hitAnim:s.newAbility.anim("lightningHit",0.5),
		dmg:s.newAbility.dmg(100,'lightning'),
		pierce:s.newAbility.pierce(1,0.5,5),
	}),
});
s.newAbility('player-meleeChain','attack',{
	name:'Chain',icon:'attackMelee-slice',
	description:'Throw a chain that attracts enemies to you.',
	periodOwn:20,periodGlobal:8,
	usableByPlayer:true,
	weaponReq:WEAPON_REQ_MELEE,
},{
	type:"bullet",
	sprite:s.newAbility.sprite('dart',1),
	dmg:s.newAbility.dmg(400,'melee'),
	hitAnim:s.newAbility.anim("arrowHit",0.5),
	knock:s.newAbility.status(1,-1.5,1.5),
});

//heal
s.newAbility('start-heal','heal',{
	name:'Heal',
	description:'Standard healing.',
	periodOwn:250,periodGlobal:15,costMana:30,
	bypassGlobalCooldown:true,
	usableByPlayer:true,
},{
	hp:800,
});
s.newAbility('player-healFast','heal',{
	name:'Fast Regen',
	description:'Faster but less powerful healing.',
	periodOwn:100,periodGlobal:15,costMana:30,
	bypassGlobalCooldown:true,
	usableByPlayer:true,
},{
	hp:400,
});
s.newAbility('player-healCost','heal',{
	name:'Expensive Regen',
	description:'Mana-expensive but great healing.',
	periodOwn:150,periodGlobal:15,costMana:90,
	bypassGlobalCooldown:true,
	usableByPlayer:true,
},{
	hp:1200,
});
s.newAbility('player-healSlowCast','heal',{
	name:'Slow Cast Regen',
	description:'Slow to cast but free healing.',
	periodOwn:200,periodGlobal:25,costMana:0,
	bypassGlobalCooldown:true,
	usableByPlayer:true,
},{
	hp:800,
});
s.newAbility('player-healTornado','heal',{
	name:'Regen Tornado',
	description:'Heals you and pushes monsters away.',
	periodOwn:150,periodGlobal:15,costMana:30,
	bypassGlobalCooldown:true,
	weaponReq:['mace','sword','spear'],
	triggerAbility:s.newAbility.triggerAbility(['healTornadoPush']),
	usableByPlayer:true,
},{
	hp:800,
});
s.newAbility('healTornadoPush','attack',{	//not triggered directly
	name:'Repel',icon:'attackMelee-slice',
	description:'Repel all monsters near you.',
	periodOwn:20,periodGlobal:8,
},{
	type:"strike",width:100,height:100,
	initPosition:s.newAbility.initPosition(0,0),
	preDelayAnim:s.newAbility.anim("rangeBomb",0.7,0),
	dmg:s.newAbility.dmg(1,'melee'),
	knock:s.newAbility.status(1,1.5,1.5),
});

//weapon-specific
s.newAbility('player-boomerang','attack',{
	name:'Boomerang',icon:'weapon-boomerang',
	periodOwn:15,periodGlobal:15,
	description:"Shoot a boomerang that comes back that you.",
	weaponReq:['boomerang'],
	usableByPlayer:true,
},{
	type:"bullet",
	maxTimer:250,
	
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(300,'range'),
	boomerang:s.newAbility.boomerang(1,0.7,1,1),
	pierce:s.newAbility.pierce(1,0.8,5),
});
s.newAbility('player-paraboleArrow','attack',{
	name:'Parabole Shot',icon:'weapon-bow',
	periodOwn:20,periodGlobal:20,
	description:"Shoot 4 parabolic arrows.",
	weaponReq:['bow'],
	usableByPlayer:true,
},{
	type:"bullet",amount:4,
	sprite:s.newAbility.sprite('arrow',1),
	dmg:s.newAbility.dmg(125,'range'),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	parabole:s.newAbility.parabole(0.3,1,1,0.25),
});
s.newAbility('player-pierceArrow','attack',{
	name:'Piercing Arrows',icon:'weapon-crossbow',
	description:"Shoot fast piercing arrows.",
	periodOwn:5,periodGlobal:5,
	weaponReq:['crossbow'],
	usableByPlayer:true,
},{
	type:"bullet",amount:1,
	sprite:s.newAbility.sprite('arrow',1),
	dmg:s.newAbility.dmg(125,'range'),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	pierce:s.newAbility.pierce(1,0.5,5),
});
s.newAbility('player-coldBomb','attack',{
	name:'Cold Explosion',icon:'attackMagic-crystal',
	description:"Create a powerful explosion of ice.",
	periodOwn:20,periodGlobal:20,costMana:10,
	weaponReq:['staff'],
	usableByPlayer:true,
},{
	type:"strike",width:50,height:50,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	preDelayAnim:s.newAbility.anim("coldBomb",0.6),
	dmg:s.newAbility.dmg(550,'cold'),
});	
s.newAbility('player-lightWave','attack',{
	name:'Light Wave',icon:'system1-less',
	description:"Shoot 2 waves of light.",
	periodOwn:12,periodGlobal:12,
	weaponReq:['orb'],
	usableByPlayer:true,
},{
	type:"bullet",amount:2,
	sprite:s.newAbility.sprite('lightningball',1),
	dmg:s.newAbility.dmg(180,'lightning'),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	sin:s.newAbility.sin(1,1.5),
});
s.newAbility('player-fireBomb','attack',{
	name:'Fire Explosion',icon:'attackMagic-fire',
	description:'Explodes in all directions, piercing through enemies.',
	periodOwn:25,periodGlobal:25,costMana:10,
	weaponReq:['wand'],
	usableByPlayer:true,
},{
	type:"strike",width:50,height:50,delay:5,
	initPosition:s.newAbility.initPosition(100,150),
	preDelayAnim:s.newAbility.anim("fireBomb2",1),
	dmg:s.newAbility.dmg(300,'fire'),
	onDamagePhase:s.newAbility.onDamagePhase(1,{
		type:"bullet",angleRange:360,amount:10,
		maxTimer:MAXTIMER/2,
		spd:s.newAbility.spd(0.5),
		sprite:s.newAbility.sprite("fireball",0.8),
		hitAnim:s.newAbility.anim("fireHit",0.5),
		dmg:s.newAbility.dmg(40,'fire'),
		pierce:s.newAbility.pierce(1,0.5,5),
	}),
});
s.newAbility('player-whirlwind','attack',{
	name:'Whirlwind',icon:'attackMelee-slice',
	description:'Deadly sword whirlwind that generates lightning balls.',
	periodOwn:20,periodGlobal:20,costMana:10,
	weaponReq:['sword'],
	usableByPlayer:true,	
},{
	type:"strike",width:100,height:100,
	initPosition:s.newAbility.initPosition(0,0),
	preDelayAnim:s.newAbility.anim("rangeBomb",0.7,0),
	dmg:s.newAbility.dmg(200,'melee'),
	onDamagePhase:s.newAbility.onDamagePhase(1,{
		type:"bullet",angleRange:360,amount:5,
		sprite:s.newAbility.sprite("lightningball",0.5),
		hitAnim:s.newAbility.anim("lightningHit",0.5),
		dmg:s.newAbility.dmg(50,'lightning'),
		stun:s.newAbility.status(0.25,1,1),
		spd:s.newAbility.spd(0.5),
	}),
});
s.newAbility('player-fireStrike','attack',{
	name:'Fire Strike',icon:'attackMelee-fierce',
	description:'A strike with high chance of burning and bleeding enemies.',
	periodOwn:20,periodGlobal:20,costMana:10,
	weaponReq:['mace'],	
	usableByPlayer:true,
},{
	type:"strike",width:50,height:50,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("slashFire",0.5),
	hitAnim:s.newAbility.anim("slashFire",0.25,0),
	dmg:s.newAbility.dmg(300,'fire'),
	bleed:s.newAbility.status(0.5,5,1),
	stun:s.newAbility.status(0.5,2,1),
});
s.newAbility('player-coldStrike','attack',{
	name:'Chilling Strike',icon:'weapon-spear',
	description:'A strike with high chance of chilling and pushing back enemies.',
	periodOwn:20,periodGlobal:20,costMana:10,
	weaponReq:['spear'],
	usableByPlayer:true,
},{
	type:"strike",width:50,height:50,
	initPosition:s.newAbility.initPosition(50,150),
	preDelayAnim:s.newAbility.anim("slashCold",0.5),
	hitAnim:s.newAbility.anim("slashCold",0.25,0),
	dmg:s.newAbility.dmg(300,'cold'),
	knock:s.newAbility.status(0.5,1,1),
	chill:s.newAbility.status(0.5,0.5,1),
});


s.newAbility('superNiceLooking','attack',{
	name:'Basic Bullet',icon:'attackRange-steady',
	description:'Very fast arrow shooting.',
	periodOwn:10,periodGlobal:10,
},{
	type:"bullet",
	amount:1,angleRange:5,
	sprite:s.newAbility.sprite("fireball",1.5),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(300,'fire'),
	spd:s.newAbility.spd(0.1),
	onMove:s.newAbility.onMove(2,3,{
		sprite:s.newAbility.sprite("fireball",1),
		type:"bullet",
		amount:8,
		spd:s.newAbility.spd(0.5),
		angleRange:360,	
		dmg:s.newAbility.dmg(300,'fire'),
	}),
});


//MONSTER
s.newAbility('meleeBullet','attack',{
	name:'Bone Throw',icon:'weapon-boomerang',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
});
s.newAbility('rangeBullet','attack',{
	name:'Rock Throw',icon:'offensive-bullet',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("rock",0.8),
	hitAnim:s.newAbility.anim("earthBomb",0.4),
	dmg:s.newAbility.dmg(150,'range'),
});
s.newAbility('magicBullet','attack',{
	name:'Arcane Bullet',icon:'resource-dodge',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("shadowball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'magic'),
});
s.newAbility('fireBullet','attack',{
	name:'Fire Bullet',icon:'attackMagic-fireball',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("fireball",1.2),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
});
s.newAbility('coldBullet','attack',{
	name:'Cold Bullet',icon:'attackMagic-crystal',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(150,'cold'),
});
s.newAbility('lightningBullet','attack',{
	name:'Lightning Bullet',icon:'attackMagic-static',
	periodOwn:25,periodGlobal:25,
	//spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("lightningball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'lightning'),
});
		
s.newAbility('meleeBomb','attack',{
	name:'Ground Break',icon:'system1-less',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	dmg:s.newAbility.dmg(250,'melee'),
});
s.newAbility('rangeBomb','attack',{
	name:'Tornado',icon:'misc-desync',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("rangeBomb",1),
	dmg:s.newAbility.dmg(250,'range'),
});
s.newAbility('magicBomb','attack',{
	name:'Arcane Explosion',icon:'attackMagic-fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("magicBomb",1),
	dmg:s.newAbility.dmg(250,'magic'),
});
s.newAbility('fireBomb','attack',{
	name:'Fire Explosion',icon:'attackMagic-fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("fireBomb2",0.6),
	dmg:s.newAbility.dmg(250,'fire'),
});
s.newAbility('coldBomb','attack',{
	name:'Cold Explosion',icon:'attackMagic-crystal',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("coldBomb",1),
	dmg:s.newAbility.dmg(250,'cold'),
});	
s.newAbility('lightningBomb','attack',{
	name:'Lightning Explosion',icon:'attackMagic-static',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"strike",width:100,height:100,delay:5,
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim("lightningBomb",1),
	dmg:s.newAbility.dmg(250,'lightning'),
});	
	
s.newAbility('fireNova','attack',{
	name:'Fire Nova',icon:'attackMagic-fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('blue',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("fireball",1),
	hitAnim:s.newAbility.anim("fireHit",0.5),
	dmg:s.newAbility.dmg(150,'fire'),
	spd:s.newAbility.spd(0.5),
	onMove:s.newAbility.onMove(1,3,{
		type:"bullet",
		sprite:s.newAbility.sprite("fireball",0.5),
		hitAnim:s.newAbility.anim("fireHit",0.3),
		dmg:s.newAbility.dmg(25,'fire'),
	}),
});
s.newAbility('coldNova','attack',{
	name:'Cold Nova',icon:'attackMagic-crystal',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('blue',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("iceshard",1),
	hitAnim:s.newAbility.anim("coldHit",0.5),
	dmg:s.newAbility.dmg(150,'cold'),
	spd:s.newAbility.spd(0.5),
	maxTimer:80,
	onMove:s.newAbility.onMove(4,3,{
		type:"bullet",angleRange:360,amount:4,
		sprite:s.newAbility.sprite("iceshard",0.5),
		hitAnim:s.newAbility.anim("coldHit",0.3),
		dmg:s.newAbility.dmg(25,'cold'),
		maxTimer:10,
	}),
});
s.newAbility('lightningNova','attack',{
	name:'Lightning Nova',icon:'attackMagic-fireball',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('blue',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("lightningball",1),
	hitAnim:s.newAbility.anim("lightningHit",0.5),
	dmg:s.newAbility.dmg(150,'lightning'),
	maxTimer:80,
	onMove:s.newAbility.onMove(6,0,{
		type:"strike",width:150,height:150,delay:0,
		initPosition:s.newAbility.initPosition(0,0),
		postDelayAnim:s.newAbility.anim("lightningHit",0.5,0),
		hitAnim:s.newAbility.anim("lightningHit",0.25,0.2),
		dmg:s.newAbility.dmg(200,'lightning'),
	}),
});

s.newAbility('scratch','attack',{
	name:'Scratch',icon:'attackMelee-scar',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('red',5),delay:10,
},{
	type:"strike",width:100,height:100,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("scratch",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
});
s.newAbility('scratchBig','attack',{
	name:'Multi Scratch',icon:'attackMelee-scar',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('red',5),delay:10,
},{
	type:"strike",width:100,height:100,
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim("scratch",0.5),
	hitAnim:s.newAbility.anim("strikeHit",0.25),
	dmg:s.newAbility.dmg(200,'melee'),
});	
s.newAbility('arrowBullet','attack',{
	name:'Arrow',icon:'element-range',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("arrow",1),
	hitAnim:s.newAbility.anim("arrowHit",0.5),
	dmg:s.newAbility.dmg(150,'range'),
});
s.newAbility('dart','attack',{
	name:'Dart',icon:'attackRange-head',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("dart",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'range'),
});	
s.newAbility('windBullet','attack',{
	name:'Wind',icon:'attackRange-head',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	sprite:s.newAbility.sprite("tornado",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'range'),
});

s.newAbility('bind','attack',{
	name:'Binding',icon:'curse-stumble',
	periodOwn:50,periodGlobal:50,
	spriteFilter:s.newAbility.spriteFilter('red',5),delay:10,
},{
	type:"strike",width:50,height:50,delay:5,
	initPosition:s.newAbility.initPosition(0,100),
	preDelayAnim:s.newAbility.anim("bind",1),
	hitAnim:s.newAbility.anim("bind",0.25),
	dmg:s.newAbility.dmg(150,'cold'),
	chill:s.newAbility.status(1,1,1),
});
s.newAbility('mine','attack',{
	name:'Mine',icon:'attackRange-head',
	periodOwn:25,periodGlobal:25,
},{
	type:"bullet",
	spd:s.newAbility.spd(0),
	maxTimer:250,
	sprite:s.newAbility.sprite("dart",1),
	hitAnim:s.newAbility.anim("cursePink",0.5),
	dmg:s.newAbility.dmg(150,'magic'),
});
s.newAbility('boomerang','attack',{
	name:'Boomerang',icon:'weapon-boomerang',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	maxTimer:250,
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
	boomerang:s.newAbility.boomerang(1,1,1,1),
	pierce:s.newAbility.pierce(1,0.8,5),
});
s.newAbility('boneBoomerang','attack',{
	name:'Bone Boomerang',icon:'attackMagic-fireball',
	periodOwn:25,periodGlobal:25,
	spriteFilter:s.newAbility.spriteFilter('green',5),delay:5,
},{
	type:"bullet",
	maxTimer:250,
	sprite:s.newAbility.sprite("bone",1),
	hitAnim:s.newAbility.anim("strikeHit",0.5),
	dmg:s.newAbility.dmg(150,'melee'),
	boomerang:s.newAbility.boomerang(1,1,1,1),
	pierce:s.newAbility.pierce(1,0.8,5),
});

s.newAbility('healModel','heal',{
	name:'Regen',
	description:'Standard healing.',
	periodOwn:250,periodGlobal:50,
},{
	hp:800,
});
s.newAbility('healZone','attack',{
	name:'Heal Zone',icon:'heal-plus',
	periodOwn:50,periodGlobal:15,
},{
	type:"strike",width:400,height:400,delay:0,
	initPosition:s.newAbility.initPosition(0,0),
	postDelayAnim:s.newAbility.anim("boostRed",1),
	dmg:s.newAbility.dmg(0,'lightning'),
	damageIfMod:true,
	onHitHeal:s.newAbility.onHitHeal(200),
});



//}

//{ NPC needs to be after s.newAbility so can use their templates

s.newNpc("bat",{
	name:"Bat",
	sprite:s.newNpc.sprite("bat"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			leech:s.newAbility.status(0.25,25,1),
			hitAnim:s.newAbility.anim('cursePink',1),
		}),[0.2,0,0]),
		s.newNpc.abilityAi.ability('scratch',[0.4,0,0]),
		s.newNpc.abilityAi.ability('lightningBullet',[0.4,0.4,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'boost',{},{
			boost:[
				s.newBoost('leech-chance',1000,50,'+'),
				s.newBoost('crit-chance',1000,50,'+'),
			],
		}),[0,0.1,0.2]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.4,1]),
	]),
	mastery:s.newNpc.mastery([2,1,1,1,0.5,1]),
	maxSpd:s.newNpc.maxSpd(1.2),
	moveRange:s.newNpc.moveRange(0.5,1),	
});
s.newNpc("bee",{
	name:"Bee",
	sprite:s.newNpc.sprite("bee"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('scratch',[0.2,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			dmg:s.newAbility.dmg(400,'melee'),delay:10,
		}),[0,0,0]),	//onDeath
		s.newNpc.abilityAi.ability(s.newAbility(null,'dart',{},{
			burn:s.newAbility.status(0.5,1,1),
		}),[0,0.2,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.4,1]),
	]),
	mastery:s.newNpc.mastery([1,1,2,0.5,1,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("mosquito",{
	name:"Mosquito",
	sprite:s.newNpc.sprite("mosquito"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'dart',{},{
			knock:s.newAbility.status(0.25,1,1),
		}),[1,0.2,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'lightningBullet',{},{
			amount:3,angleRange:30,
			knock:s.newAbility.status(0.25,1,1),
			sin:s.newAbility.sin(1,1),
		}),[1,0.2,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.2,0.2]),		
	]),
	mastery:s.newNpc.mastery([1,1,1,1,2,0.5]),
	maxSpd:s.newNpc.maxSpd(1.2),
	moveRange:s.newNpc.moveRange(2.5,1.5),
});
s.newNpc("mushroom",{
	name:"Mushroom",
	sprite:s.newNpc.sprite("mushroom"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			spd:s.newAbility.spd(0.01),
			maxTimer:250,
			stun:s.newAbility.status(1,1,1),
			dmg:s.newAbility.dmg(200,'magic'),
			sprite:s.newAbility.sprite('spore',1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			stun:s.newAbility.status(0.5,1,1),
			sprite:s.newAbility.sprite('spore',1),
			angleRange:360,amount:5,
		}),[0.5,0.3,0.3]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.2,0.2]),	
	]),
	mastery:s.newNpc.mastery([1,1,2,0.5,1,1]),
	maxSpd:s.newNpc.maxSpd(1.5),
	moveRange:s.newNpc.moveRange(1,1),
});
s.newNpc("larva",{
	name:"Larva",
	sprite:s.newNpc.sprite("larva"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			initPosition:s.newAbility.initPosition(0,50),
			dmg:s.newAbility.dmg(500,'fire'),
		}),[0.1,0.1,0.1]),
		s.newNpc.abilityAi.ability('idle',[0.9,0.9,0.9]),	
	]),
	mastery:s.newNpc.mastery([1,1,1,1,1,1]),
	maxSpd:s.newNpc.maxSpd(0.5),
	hp:10,
	moveRange:s.newNpc.moveRange(0.1,1),
});
s.newNpc("plant",{
	name:"Plant",
	sprite:s.newNpc.sprite("plant"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			dmg:s.newAbility.dmg(300,'melee'),
			bleed:s.newAbility.status(1,1,1),
		}),[0.2,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'dart',{},{
			amount:5,angleRange:25,
			dmg:s.newAbility.dmg(100,'range'),
			bleed:s.newAbility.status(0.2,1,1),
			chill:s.newAbility.status(0.4,1,1),
			parabole:s.newAbility.parabole(1,1,1,1),
			curse:s.newAbility.curse(1,[
				s.newBoost('globalDmg',0.5,50),
			]),
		}),[0.4,0.2,0.2]),
		s.newNpc.abilityAi.ability('idle',[0.2,0.2,0.2]),	
	]),
	mastery:s.newNpc.mastery([1,1,2,0.5,1,1]),
	maxSpd:s.newNpc.maxSpd(0.5),
	moveRange:s.newNpc.moveRange(0.1,1),
});
s.newNpc("slime",{
	name:"Slime",
	sprite:s.newNpc.sprite("slime"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'summon',{},{
			maxChild:5,
			time:20*25,
			distance:500,
			model:s.newAbility.model("slime-child"),
			amount:1,
		}),[0.4,0.4,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(100,'cold'),
			chill:s.newAbility.status(0.2,1,1),
			amount:5,angleRange:25,
		}),[0.2,0.4,0.4]),
		s.newNpc.abilityAi.ability('healZone',[0.1,0.1,0.2]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.2,0.2]),	
	]),
	mastery:s.newNpc.mastery([1,1,0.5,2,1,1]),
	moveRange:s.newNpc.moveRange(1,1),	
}); 
s.newNpc("slime-child",{
	name:"Slime Minion",
	sprite:s.newNpc.sprite("slime",0.5),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(25,'cold'),
			sprite:s.newAbility.sprite('iceshard',0.7),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability('idle',[0.2,0.2,0.2]),
	]),
	mastery:s.newNpc.mastery([1,1,0.5,2,1,1]),
	hp:100,
	moveRange:s.newNpc.moveRange(0.1,1),
});
s.newNpc("snake",{
	name:"Snake",
	sprite:s.newNpc.sprite("snake"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(10,'cold'),
			chill:s.newAbility.status(1,1,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBullet',{},{
			dmg:s.newAbility.dmg(10,'fire'),
			burn:s.newAbility.status(1,5,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'lightningBullet',{},{
			dmg:s.newAbility.dmg(10,'lightning'),
			stun:s.newAbility.status(1,1,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'meleeBullet',{},{
			dmg:s.newAbility.dmg(10,'melee'),
			bleed:s.newAbility.status(1,5,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			dmg:s.newAbility.dmg(10,'magic'),
			drain:s.newAbility.status(1,5,1),
		}),[1,1,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			dmg:s.newAbility.dmg(10,'range'),
			knock:s.newAbility.status(1,1,1),
		}),[4,1,1]),
		s.newNpc.abilityAi.ability('idle',[4,4,4]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("goblin-melee",{
	name:"Goblin Warrior",
	sprite:s.newNpc.sprite("goblin"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			postDelayAnim:s.newAbility.anim("slashMelee",0.5),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			bleed:s.newAbility.status(1,2,1),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			stun:s.newAbility.status(0.25,1,1),
		}),[0,0,1]),
		s.newNpc.abilityAi.ability('idle',[0.1,0.1,0.1]),
	]),
	mastery:s.newNpc.mastery([1,2,0.5,1,1,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("goblin-range",{
	name:"Goblin Ranger",
	sprite:s.newNpc.sprite("goblin"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'arrowBullet',{},{
			angleRange:10,amount:3,aim:25,
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			knock:s.newAbility.status(1,2,1),
		}),[0,0,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			amount:5,angleRange:45,
			parabole:s.newAbility.parabole(1,1,1,1),
		}),[0,0,1]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("goblin-magic",{
	name:"Goblin Mage",
	sprite:s.newNpc.sprite("goblin"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			burn:s.newAbility.status(1,1,1),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('healZone',[0.2,0.2,0.2]),
		s.newNpc.abilityAi.ability('coldNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			burn:s.newAbility.status(1,1,1),
			dmg:s.newAbility.dmg(150,'lightning'),
			postDelayAnim:s.newAbility.anim('slashLightning'),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([2,0.5,1,1,1,1]),
	moveRange:s.newNpc.moveRange(2.5,1),
});
s.newNpc("orc-melee",{
	name:"Orc Warrior",
	sprite:s.newNpc.sprite("orc-melee"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			postDelayAnim:s.newAbility.anim("slashMelee",0.5),
		}),[1,0.5,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			bleed:s.newAbility.status(1,2,1),
		}),[1,0.5,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'boost',{},{
			boost:[
				s.newBoost('bleed-chance',1000,100,'+'),
				s.newBoost('atkSpd',3,100),
			],
		}),[0.2,0.4,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			amount:3,angleRange:30,
		}),[0.5,0.5,1]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,2,0.5,1,1,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("orc-range",{
	name:"Orc Ranger",
	sprite:s.newNpc.sprite("orc-range"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'arrowBullet',{},{
			sprite:s.newAbility.sprite("arrow",1),
			amount:3,angleRange:30,
			pierce:s.newAbility.pierce(1,0.8,5),
			dmg:s.newAbility.dmg(200,'range'),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			stun:s.newAbility.status(1,2,1),
			postDelayAnim:s.newAbility.anim('slashLightning',0.8),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'arrowBullet',{periodOwn:10,periodGlobal:10},{
			amount:5,angleRange:45,
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
}); 
s.newNpc("orc-magic",{
	name:"Orc Mage",
	sprite:s.newNpc.sprite("orc-magic"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBomb',{},{
			chill:s.newAbility.status(1,1,1),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('healZone',[0.2,0.2,0.2]),
		s.newNpc.abilityAi.ability('lightningNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			burn:s.newAbility.status(0.5,1,1),
			postDelayAnim:s.newAbility.anim('slashFire',0.8),
			dmg:s.newAbility.dmg(150,'fire'),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
	mastery:s.newNpc.mastery([2,0.5,1,1,1,1]),
	moveRange:s.newNpc.moveRange(2.5,1),
});
s.newNpc("smallWorm",{
	name:"Worm",
	sprite:s.newNpc.sprite("smallWorm"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('lightningBomb',[0.5,0.5,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			stun:s.newAbility.status(1,1,1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability('lightningBullet',[1,1,1]),
		s.newNpc.abilityAi.ability('lightningNova',[0,0.4,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,1,1,0.5,2]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("ghost",{
	name:"Ghost",
	sprite:s.newNpc.sprite("ghost"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			curse:s.newAbility.curse(0.25,1,[
				s.newBoost('globalDmg',0.1,50),
			]),
		}),[0.5,0.5,1]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBomb',{},{
			curse:s.newAbility.curse(0.25,1,[
				s.newBoost('globalDef',0.1,50),
			]),
			drain:s.newAbility.status(1,1,1),
		}),[0.3,0.5,0.5]),
		s.newNpc.abilityAi.ability('lightningBullet',[1,1,1]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([2,1,1,1,0.5,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});
s.newNpc("eyeball",{
	name:"Eyeball",
	sprite:s.newNpc.sprite("eyeball"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBullet',{},{
			drain:s.newAbility.status(1,1,1),
			curse:s.newAbility.curse(0.25,[
				s.newBoost('hp-regen',0.5,250),
				s.newBoost('mana-regen',0.5,250),
			]),
		}),[0.5,0.5,0.5]),
		
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBomb',{},{
			aim:25,
			dmg:s.newAbility.dmg(0,'magic'),
			onDamagePhase:s.newAbility.onDamagePhase(1,{
				type:"bullet",angleRange:360,amount:5,
				sprite:s.newAbility.sprite('shadowball',0.8),
				hitAnim:s.newAbility.anim('magicHit',0.5),
				dmg:s.newAbility.dmg(125,'magic'),
			}),
		}),[0.8,0.8,0.8]),
		s.newNpc.abilityAi.ability('coldBullet',[0.1,0.3,0.3]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
		
	]),
	mastery:s.newNpc.mastery([2,1,1,1,1,0.5]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("skeleton",{
	name:"Skeleton",
	sprite:s.newNpc.sprite("skeleton"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'boneBoomerang',{},{
			amount:3,angleRange:30,
		}),[0.1,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'boneBoomerang',{},{
			sprite:s.newAbility.sprite('bone',1.5),
			knock:s.newAbility.status(1,1,1),
			dmg:s.newAbility.dmg(200,'melee'),
		}),[0.1,0.8,0.8]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			knock:s.newAbility.status(0.25,2,1),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,2,1,0.5,1,1]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("spirit",{
	name:"Spirit",
	sprite:s.newNpc.sprite("spirit"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			aim:20,
			onDamagePhase:s.newAbility.onDamagePhase(1,{
				type:"bullet",angleRange:360,amount:8,
				sprite:s.newAbility.sprite('fireball',0.8),
				hitAnim:s.newAbility.anim('fireHit',0.5),
				dmg:s.newAbility.dmg(20,'fire'),
			}),
			
		}),[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBullet',{},{
			amount:3,angleRange:45,
			burn:s.newAbility.status(1,1,1),
		}),[0.4,0.8,0.8]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBomb',{},{
			aim:20,
			onDamagePhase:s.newAbility.onDamagePhase(1,{
				type:'strike',
				preDelayAnim:s.newAbility.anim('cursePink',0.5),
				dmg:s.newAbility.dmg(10,'fire'),
				curse:s.newAbility.curse(1,[
					s.newBoost('def-fire-mod',0.5,150),
				]),
			}),
		}),[0.3,0.3,0.3]),
		s.newNpc.abilityAi.ability('fireNova',[0,0.4,0.4]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,1,2,1,0.5]),
	moveRange:s.newNpc.moveRange(2,1),
});
s.newNpc("pumpking",{
	name:"Pumpking",
	sprite:s.newNpc.sprite("pumpking"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('fireNova',[0,0.4,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'fireBullet',{},{
			amount:7,angleRange:360,
			burn:s.newAbility.status(1,2,1),
		}),[0.4,0.8,0.8]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			dmg:s.newAbility.dmg(150,'fire'),
			postDelayAnim:s.newAbility.anim('slashFire',1),
		}),[0.4,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,0.5,2,1,1]),
	moveRange:s.newNpc.moveRange(2,1),
});

/*s.newNpc("taurus",{
	name:"Taurus",
	maxSpd:s.newNpc.maxSpd(0.6),
	sprite:s.newNpc.sprite("taurus",1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'rangeBullet',{},{
			amount:7,angleRange:160,
			bleed:s.newAbility.status(0.5,1,1),
		}),[0,0.4,0.4]),		
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			postDelayAnim:s.newAbility.anim('scratch',1.5),
			dmg:s.newAbility.dmg(200,'melee'),
			onDamagePhase:s.newAbility.onDamagePhase(0.5,{
				type:"bullet",angleRange:360,amount:8,
				sprite:s.newAbility.sprite('rock',0.8),
				hitAnim:s.newAbility.anim('earthHit',0.5),
				dmg:s.newAbility.dmg(25,'melee'),			
			}),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([2,1,1,1,1,0.5]),
	moveRange:s.newNpc.moveRange(0.5,1),
});*/
s.newNpc("werewolf",{
	name:"Mummy",
	maxSpd:s.newNpc.maxSpd(0.6),
	sprite:s.newNpc.sprite("werewolf",1),
	hpRegen:3,
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{
			spriteFilter:s.newAbility.spriteFilter('red',5),
			delay:5,
		},{
			leech:s.newAbility.status(1,1,1),
			postDelayAnim:s.newAbility.anim('cursePink',1),
		}),[1,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{
			spriteFilter:s.newAbility.spriteFilter('blue',5),
			delay:5,
		},{
			chill:s.newAbility.status(1,1,1),
			postDelayAnim:s.newAbility.anim('slashCold',1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability('coldNova',[0,0.2,0.4]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'magicBomb',{
			spriteFilter:s.newAbility.spriteFilter('green',5),
			delay:5,
		},{
			dmg:s.newAbility.dmg(150,'magic'),
			chill:s.newAbility.status(1,1,1),
			curse:s.newAbility.curse(0.75,[
				s.newBoost('globalDmg',0.5,50),		
			]),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([1,1,1,0.5,2,1]),
	moveRange:s.newNpc.moveRange(0.5,1),
});
s.newNpc("bigWorm",{ 
	name:"Worm",
	sprite:s.newNpc.sprite("bigWorm",1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('rangeBomb',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratch',{},{
			knock:s.newAbility.status(1,1,1),
			postDelayAnim:s.newAbility.anim('earthHit',1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'windBullet',{},{
			knock:s.newAbility.status(0.5,1,1),
			amount:5,angleRange:45,
			sin:s.newAbility.sin(1,1),
		}),[0,0.5,0.5]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),
	]),
	mastery:s.newNpc.mastery([2,0.5,1,1,1,1]),
	moveRange:s.newNpc.moveRange(2.5,1),
});
s.newNpc("dragon",{
	name:"Dragon",
	sprite:s.newNpc.sprite("dragon",0.8),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'windBullet',{},{
			angleRange:360,amount:9,
		}),[1,0.5,0.5]),
		s.newNpc.abilityAi.ability('fireNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability('coldNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability('lightningNova',[0.5,0.5,0.5]),
		s.newNpc.abilityAi.ability(s.newAbility(null,'scratchBig',{},{
			bleed:s.newAbility.status(1,1,1),
		}),[0.5,0,0]),
		s.newNpc.abilityAi.ability('idle',[0.5,0.5,0.5]),		
	]),
	mastery:s.newNpc.mastery([1,1,1,2,1,0.5],[1.5,1.5,1.5,1.5,1.5,1.5]),
	hp:2000,
	moveRange:s.newNpc.moveRange(2.5,1),
});

s.newNpc("debug",{
	name:"Snake",
	sprite:s.newNpc.sprite("snake"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability(s.newAbility(null,'coldBullet',{},{
			dmg:s.newAbility.dmg(1000,'cold'),
			knock:s.newAbility.status(1,2,1),
		}),[1,1,1]),
	]),
	mastery:s.newNpc.mastery([0.5,1,2,1,1,1]),
	moveRange:s.newNpc.moveRange(1.5,1),
});

//#################

s.newNpc("npc",{
	name:"Ringo",
	sprite:s.newNpc.sprite("villagerMale-0"),
	nevercombat:true,
	angle:90,
	targetSetting:s.newNpc.targetSetting(null,25*4),
	moveRange:s.newNpc.moveRange(3,1,3),
	maxSpd:s.newNpc.maxSpd(0.35),
	minimapIcon:'color-green',
});
s.newNpc("npc-playerLike",{
	name:"Ringo",
	sprite:s.newNpc.sprite("villagerMale-0"),
	damageIf:s.newNpc.damageIf('never'),
	maxSpd:s.newNpc.maxSpd(0.35),
	targetSetting:s.newNpc.targetSetting(null,25*4),
	moveRange:s.newNpc.moveRange(3,1,3),
	combatType:'player',
	awareNpc:true,
	angle:90,
	minimapIcon:'color-green',
});

s.newNpc("genericEnemy",{
	name:"Enemy",
	sprite:s.newNpc.sprite("bat"),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('idle',[1,1,1]),
	]),
});

s.newNpc("loot-chestOff",{
	name:"Chest",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("loot-chestOff",1),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("loot-chestOn",{
	name:"Chest",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("loot-chestOn",1),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("loot-flowerOff",{
	name:"Flower",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("loot-flowerOff"),
	nevercombat:true,
	nevermove:true,
});
s.newNpc("loot-flowerOn",{
	name:"Flower",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("loot-flowerOn"),
	nevercombat:true,
	nevermove:true,
});
s.newNpc("toggle-boxOff",{
	name:"Lever",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("toggle-boxOff"),
	nevercombat:true,
	nevermove:true,
	interactionMaxRange:s.newNpc.interactionMaxRange('close'),
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("toggle-boxOn",{
	name:"Lever",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("toggle-boxOn"),
	nevercombat:true,
	nevermove:true,
	interactionMaxRange:s.newNpc.interactionMaxRange('close'),
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});

s.newNpc("waypoint",{
	name:"Waypoint",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("waypoint",2),
	nevercombat:true,
	nevermove:true,
}); 
s.newNpc("target",{
	name:"Target",
	sprite:s.newNpc.sprite("system-target"),
	bounceDmgMod:0,
	nevermove:true,
	hp:1,
}); 
s.newNpc("system-sign",{
	name:"Sign",
	sprite:s.newNpc.sprite("system-sign"),
	minimapIcon:'color-orange',
	nevermove:true,
	nevercombat:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("system-bank",{
	name:"Private Stash",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("loot-chestOff",1),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	bank:true,
});
s.newNpc("fakeDrop",{
	name:"Item",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("drop-chest",1),
	nevercombat:true,
	nevermove:true,
});

s.newNpc("pushable-rock2x2",{
	name:"Block",
	minimapIcon:'',
	sprite:s.newNpc.sprite("pushable-rock2x2"),
	nevercombat:true,
	useUpdateInput:0,
	move:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16),
	interactionMaxRange:s.newNpc.interactionMaxRange('close'),
	bounce:0,
});
s.newNpc("pushable-rock2x2-loose",{
	name:"Block",
	minimapIcon:'',
	sprite:s.newNpc.sprite("pushable-rock2x2"),
	nevercombat:true,
	useUpdateInput:0,
	move:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16,null,false,true),
	bounce:0,
});
s.newNpc("pushable-bridgeH",{
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeH"),
	nevercombat:true,
	useUpdateInput:0,
	move:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16),
	interactionMaxRange:s.newNpc.interactionMaxRange('close'),
	bounce:0,
});
s.newNpc("pushable-bridgeV",{ 
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeV"),
	nevercombat:true,
	useUpdateInput:0,
	move:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
	pushable:s.newNpc.pushable(4,16),
	interactionMaxRange:s.newNpc.interactionMaxRange('close'),
	bounce:0,
});
s.newNpc("block-template",{	//used for quest when want change sprite
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("invisible"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});
s.newNpc("block-rock2x2",{ 
	name:"Block",
	minimapIcon:'',
	sprite:s.newNpc.sprite("pushable-rock2x2"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),1),
});

s.newNpc("block-spike",{
	name:"Spike",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-spike"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});
s.newNpc("block-invisible",{
	name:"Spike",
	minimapIcon:'',
	sprite:s.newNpc.sprite("invisible"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});
s.newNpc("block-bridgeH",{
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeH"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),0),
});
s.newNpc("block-bridgeV",{
	name:"",
	minimapIcon:'',
	sprite:s.newNpc.sprite("block-bridgeV"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(2,2),0),
});

s.newNpc("tree-red",{
	name:"Red Tree",
	minimapIcon:'minimapIcon-tree',
	sprite:s.newNpc.sprite("tree-red"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(3,2,0,1),1),
});
s.newNpc("tree-down",{
	name:"Cut Tree",
	minimapIcon:'minimapIcon-tree',
	sprite:s.newNpc.sprite("tree-down"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(3,2,0,1),1),	//1 cuz offset...
});
s.newNpc("rock-bronze",{
	name:"Bronze Rock",
	minimapIcon:'minimapIcon-rock',
	sprite:s.newNpc.sprite("rock-bronze"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(3,2),1),
});
s.newNpc("rock-down",{
	name:"Empty Rock",
	minimapIcon:'minimapIcon-rock',
	sprite:s.newNpc.sprite("rock-down"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(3,2),1),
});
s.newNpc("hunt-squirrel",{
	name:"Squirrel",
	minimapIcon:'minimapIcon-trap',
	sprite:s.newNpc.sprite("hunt-squirrel"),
	nevercombat:true,
	maxSpd:s.newNpc.maxSpd(0.5),
});
s.newNpc("hunt-down",{
	name:"Creature Grave",
	minimapIcon:'minimapIcon-trap',
	sprite:s.newNpc.sprite("hunt-down"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(1,1),1),
});

s.newNpc("teleport-door",{
	name:"Door",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("teleport-door"),
	nevercombat:true,
	nevermove:true,
});
s.newNpc("teleport-zone",{  
	name:"Map Transition",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("teleport-zone",1.5),
	nevercombat:true,
	nevermove:true,
});
s.newNpc("teleport-zoneLight",{  
	name:"Map Transition",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("teleport-zoneLight",1.5),
	nevercombat:true,
	nevermove:true,
});
s.newNpc("teleport-underground",{
	name:"Underground",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("teleport-underground"),
	nevercombat:true,
	nevermove:true,
}); 
s.newNpc("teleport-well",{
	name:"Well",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("teleport-well"),
	nevercombat:true,
	nevermove:true,
	block:s.newNpc.block(s.newNpc.block.size(3,3),1),
});
s.newNpc("teleport-cave",{
	name:"Cave",
	minimapIcon:'color-orange',
	sprite:s.newNpc.sprite("teleport-cave"),
	nevercombat:true,
	nevermove:true,
});
//}

s.exports(exports);

