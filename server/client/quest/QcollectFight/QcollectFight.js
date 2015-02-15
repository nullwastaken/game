//02/07/2015 8:43 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QcollectFight',{
	name:"Collect & Fight",
	author:"rc",
	thumbnail:"/quest/QcollectFight/QcollectFight.png",
	description:"In a parallel universe, you're a fire demon harvesting resources to become stronger in preparation for an epic battle.",
	maxParty:4,
	reward:{"ability":{'Qsystem-player-meleeBig':0.5}},
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
wrong name for winner

*/

s.newVariable({
	talkGeff:False,
	dmgLvl:0,
	defLvl:0,
	healLvl:0,
	atkLvl:0,
	timeout:False,
	timeBoss:10000000,
	pvpKillCount:0
});

s.newHighscore('speedrun',"Speedrun","Fastest Boss Kill",'ascending',function(key){
	if(s.getPartySize(key) === 1)
		return s.stopChrono(key,'timerBoss')*40;
});
s.newHighscore('harvester',"Harvester","Most Unused Resources when finishing the quest.",'descending',function(key){
	if(s.getPartySize(key) === 1)
		return s.getItemAmount(key,'resource');
});

s.newChallenge('harvester',"Harvester","Finish the quest with 25 unused resources.",2,function(key){
	return s.haveItem(key,'resource',25);
});
s.newChallenge('minion',"Minion Master","The boss has minions protecting him.",2,function(key){
	return true;
});
s.newChallenge('speedrun',"Speedrun","Kill the boss in less than 1 minute.",2,function(key){
	return s.stopChrono(key,'timerBoss') < 25*60;
});

s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-south','n1','main');
	s.setRespawn(key,'QfirstTown-south','n1','main');
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_signOff',function(key){ //
	s.failQuest(key);
});
s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-south','n1',200))
		s.callEvent('talkGeff',key);
	else s.addQuestMarker(key,'start','QfirstTown-south','n1');
});
s.newEvent('_button',function(key,button){ //
	if(button === 'atk') s.callEvent.one('itemResourceAtk',key);
	else if(button === 'dmg') s.callEvent.one('itemResourceDmg',key);
	else if(button === 'def') s.callEvent.one('itemResourceDef',key);
	else if(button === 'heal') s.callEvent.one('itemResourceHeal',key);
	s.callEvent.one('updatePermPopup',key);
});
s.newEvent('_signIn',function(key,eid){ //
	s.failQuest(key);
});
s.newEvent('_death',function(key,wholePartyDead,killer){ //BAD, only works 1v1
	//collect
	if(!s.get(key,'timeout')){
		if(s.isPlayer(killer)){
			var amount = s.getItemAmount.one(key,'resource');
			s.callEvent.one('addResource',key,-amount);
			s.callEvent.one('addResource',killer,amount + 1);
		}
		return;
	}
	//fight
	var size = s.getPartySize(key);
	if(size === 1){	//aka fighting boss
		return s.failQuest(key);
	} else {
		s.add(key,'pvpKillCount',1);
		if(s.get(key,'pvpKillCount') === size - 1){
			//everybody dead
			s.displayPopup(key,'Player ' + s.getAttr(killer,'name') + ' won!');
			s.setTimeout(key,function(){
				s.completeQuest(key);
			},25*4);
		} else {
			s.enablePvp.one(key,false);
		}
	}
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'talkGeff')) return 'Talk with Geff.';
	if(!s.get(key,'timeout')) return 'Harvest flowers and kill monsters to get resources to strengthen yourself.';
	return 'Kill the boss!';
});
s.newEvent('lootFlower',function(key,eid){ //
	if(s.getDistance(key,eid) > 200)
		return s.message.one(key,'You\'re too far to pick the flower.');
	
	if(s.getTag(eid).harvested !== true){
		s.callEvent.one('addResource',key,1);
		s.setTag(eid,'harvested',true);
		s.killActor(eid); //probably wont work
	}
});
s.newEvent('killEnemy',function(key){ //
	s.callEvent.one('addResource',key,3);
});
s.newEvent('addResource',function(key,num){ //
	if(num >= 1){
		s.addItem.one(key,'resource',num);
		s.callEvent.one('updatePermPopup',key);
	}
	if(num < 0){
		s.removeItem.one(key,'resource',-num);
		s.callEvent.one('updatePermPopup',key);
	}
});	
s.newEvent('itemResourceAtk',function(key){ //
	var lvl = s.get.one(key,'atkLvl');
	if(lvl === 0){
		if(!s.haveItem.one(key,'resource',1)){
			return s.message.one(key,'You need at least 1 resource to upgrade your attack ability.');
		}
		s.removeItem.one(key,'resource',1);
		s.add.one(key,'atkLvl',1);
		s.addAbility.one(key,'atk1',0);
		s.message.one(key,'Your fireballs are now stronger.');
	}
	else if(lvl === 1){
		if(!s.haveItem.one(key,'resource',4)){
			return s.message.one(key,'You need at least 4 resources to upgrade your attack ability.');
		}
		s.removeItem.one(key,'resource',4);
		s.add.one(key,'atkLvl',1);
		s.addAbility.one(key,'atk2',0);
		s.message.one(key,'Your fireballs are now stronger.');
	}
	else if(lvl === 2){
		if(!s.haveItem.one(key,'resource',9)){
			return s.message.one(key,'You need at least 9 resources to upgrade your attack ability.');
		}
		s.removeItem.one(key,'resource',9);
		s.add.one(key,'atkLvl',1);
		s.addAbility.one(key,'atk3',0);
		s.message.one(key,'Your fireballs are now stronger.');
	}
	else if(lvl === 4){
		if(!s.haveItem.one(key,'resource',16)){
			return s.message.one(key,'You need at least 16 resources to upgrade your attack ability.');
		}
		s.removeItem.one(key,'resource',16);
		s.add.one(key,'atkLvl',1);
		s.addAbility.one(key,'atk4',0);
		s.message.one(key,'Your fireballs are now stronger.');
	}
	else
		return s.message.one(key,'Fully upgraded.');
});
s.newEvent('itemResourceDef',function(key){ //
	var lvl = s.get(key,'defLvl');
	if(lvl === 0){
		if(!s.haveItem.one(key,'resource',1)){
			return s.message.one(key,'You need at least 1 resource to upgrade your armor.');
		}
		s.removeItem.one(key,'resource',1);
		s.add.one(key,'defLvl',1);
		s.addEquip.one(key,'def1');
		s.message.one(key,'Your armor has been improved.');
	}
	else if(lvl === 1){
		if(!s.haveItem.one(key,'resource',4)){
			return s.message.one(key,'You need at least 4 resources to upgrade your armor.');
		}
		s.removeItem.one(key,'resource',4);
		s.add.one(key,'defLvl',1);
		s.addEquip.one(key,'def2');
		s.message.one(key,'Your armor has been improved.');
	}
	else if(lvl === 2){
		if(!s.haveItem.one(key,'resource',9)){
			return s.message.one(key,'You need at least 9 resources to upgrade your armor.');
		}
		s.removeItem.one(key,'resource',9);
		s.add.one(key,'defLvl',1);
		s.addEquip.one(key,'def3');
		s.message.one(key,'Your armor has been improved.');
	}
	else if(lvl === 4){
		if(!s.haveItem.one(key,'resource',16)){
			return s.message.one(key,'You need at least 16 resources to upgrade your armor.');
		}
		s.removeItem.one(key,'resource',16);
		s.add.one(key,'defLvl',1);
		s.addEquip.one(key,'def4');
		s.message.one(key,'Your armor has been improved.');
	}
	else
		return s.message.one(key,'Fully upgraded.');
});
s.newEvent('itemResourceDmg',function(key){ //
	var lvl = s.get(key,'dmgLvl');
	if(lvl === 0){
		if(!s.haveItem.one(key,'resource',1)){
			return s.message.one(key,'You need at least 1 resource to upgrade your weapon.');
		}
		s.removeItem.one(key,'resource',1);
		s.add.one(key,'dmgLvl',1);
		s.addEquip.one(key,'dmg1');
		s.message.one(key,'Your weapon has been improved.');
	}
	else if(lvl === 1){
		if(!s.haveItem.one(key,'resource',4)){
			return s.message.one(key,'You need at least 4 resources to upgrade your weapon.');
		}
		s.removeItem.one(key,'resource',4);
		s.add.one(key,'dmgLvl',1);
		s.addEquip.one(key,'dmg2');
		s.message.one(key,'Your weapon has been improved.');
	}
	else if(lvl === 2){
		if(!s.haveItem.one(key,'resource',9)){
			return s.message.one(key,'You need at least 9 resources to upgrade your weapon.');
		}
		s.removeItem.one(key,'resource',9);
		s.add.one(key,'dmgLvl',1);
		s.addEquip.one(key,'dmg3');
		s.message.one(key,'Your weapon has been improved.');
	}
	else if(lvl === 4){
		if(!s.haveItem.one(key,'resource',16)){
			return s.message.one(key,'You need at least 16 resources to upgrade your weapon.');
		}
		s.removeItem.one(key,'resource',16);
		s.add.one(key,'dmgLvl',1);
		s.addEquip.one(key,'dmg4');
		s.message.one(key,'Your weapon has been improved.');
	}
	else
		return s.message.one(key,'Fully upgraded.');
});
s.newEvent('itemResourceHeal',function(key){ //
	var lvl = s.get(key,'healLvl');
	if(lvl === 0){
		if(!s.haveItem.one(key,'resource',1)){
			return s.message.one(key,'You need at least 1 resource to upgrade your healing ability.');
		}
		s.removeItem.one(key,'resource',1);
		s.add.one(key,'healLvl',1);
		s.addAbility.one(key,'heal1',4);
		s.rechargeAbility.one(key);
		s.message.one(key,'Your healing ability has been improved.');
	}
	else if(lvl === 1){
		if(!s.haveItem.one(key,'resource',4)){
			return s.message.one(key,'You need at least 4 resources to upgrade your healing ability.');
		}
		s.removeItem.one(key,'resource',4);
		s.add.one(key,'healLvl',1);
		s.addAbility.one(key,'heal2',4);
		s.rechargeAbility.one(key);
		s.message.one(key,'Your healing ability has been improved.');
	}
	else if(lvl === 2){
		if(!s.haveItem.one(key,'resource',9)){
			return s.message.one(key,'You need at least 9 resources to upgrade your healing ability.');
		}
		s.removeItem.one(key,'resource',9);
		s.add.one(key,'healLvl',1);
		s.addAbility.one(key,'heal3',4);
		s.rechargeAbility.one(key);
		s.message.one(key,'Your healing ability has been improved.');
	}
	else if(lvl === 4){
		if(!s.haveItem.one(key,'resource',16)){
			return s.message.one(key,'You need at least 16 resources to upgrade your healing ability.');
		}
		s.removeItem.one(key,'resource',16);
		s.add.one(key,'healLvl',1);
		s.addAbility.one(key,'heal4',4);
		s.rechargeAbility.one(key);
		s.message.one(key,'Your healing ability has been improved.');
	}
	else 
		return s.message.one(key,'Fully upgraded.');
});
s.newEvent('startGame',function(key){ //
	s.set(key,'talkGeff',true);
	s.removeQuestMarker(key,'start');
	var list = s.getParty(key);
	if(list.length === 1){
		s.setRespawn(key,'main','t1','party');
		s.teleport(key,'main','t1','party');
		s.setTimeout(key,'timeout',25*90*1);
		s.callEvent.one('updatePermPopup',key);
	} else {
		for(var i = 0 ; i < list.length; i++){
			s.setRespawn.one(list[i],'main','t' + (i+1),'party');
			s.teleport.one(list[i],'main','t' + (i+1),'party');
			s.callEvent.one('updatePermPopup',list[i]);
		}
		s.setTimeout(key,'timeoutParty',25*90*1);
	}
	
	s.addTorchEffect(key,"red",1000,"rgba(255,0,0,0.1)",10);
	
	s.setSprite(key,'demon');
	s.usePreset(key,'naked');
	s.startChrono(key,'timer');
	s.displayPopup(key,'Collect resources them use them to improve weapon, armor and abilities before time runs out.');
	
});
s.newEvent('timeout',function(key){ //
	s.teleport(key,'fight','t1','party');
	var eid = s.spawnActor(key,'fight','e1','fireBoss',{
		deathEvent:'killBoss',
	});
	if(s.isChallengeActive(key,'minion')){
		for(var i = 0 ; i < 10; i++){
			s.spawnActor(key,'fight','e1','demon',{
				sprite:s.newNpc.sprite('demon',0.5),
				globalDef:0.1,
				globalDmg:0.1,
			});
		}	
	}
	
	b.set(eid,'bossType','hardcore');
	
	s.stopChrono(key,'timer');
	s.removeChrono(key,'timer');
	s.startChrono(key,'timerBoss',true);
	
	s.addBoost(key,'globalDef',10,25*5);
	s.set(key,'timeout',true);
	s.healActor(key);
});
s.newEvent('timeoutParty',function(key){ //
	var list = s.getParty(key);
	for(var i = 0 ; i < list.length; i++){
		s.teleport.one(list[i],'fight','t' + (i+1),'party');
	}
	s.setRespawn(key,'fight','t5','party');
	s.set(key,'timeout',true);
	s.healParty(key);
});
s.newEvent('killBoss',function(key){ //
	s.completeQuest(key);
});
s.newEvent('talkGeff',function(key){ //
	s.startDialogue(key,'Geff','intro');
});

s.newEvent('updatePermPopup',function(key){ //
	var text = 'Resource Count: ' + s.getItemAmount.one(key,'resource') + '<br>'
		+ 'Fireball Lv ' + s.get.one(key,'atkLvl') + ' ' + s.displayPermPopup.button('atk','Upgrade','Upgrade Fireball Ability') + '<br>'
		+ 'Weapon Lv ' + s.get.one(key,'dmgLvl') + ' ' + s.displayPermPopup.button('dmg','Upgrade','Upgrade Weapon Damage') + '<br>'
		+ 'Armor Lv ' + s.get.one(key,'defLvl') + ' ' + s.displayPermPopup.button('def','Upgrade','Upgrade Armor Defence') + '<br>'
		+ 'Heal Lv ' + s.get.one(key,'healLvl') + ' ' + s.displayPermPopup.button('heal','Upgrade','Upgrade Heal Ability');
		
	s.displayPermPopup.one(key,text,{
		width:'250px',
	});
});

s.newItem('resource',"Resource",'metal.metal',[    //{
],'Used to craft equips.'); //}

s.newEquip('body','body','metal','Body',0.5);
s.newEquip('helm','helm','metal','Helm',0.5);
s.newEquip('ring','ring','ruby','Ring',0.5);
s.newEquip('def0','amulet','ruby','Amulet Lvl 0',0.5);
s.newEquip('def1','amulet','ruby','Amulet Lvl 1',1);
s.newEquip('def2','amulet','ruby','Amulet Lvl 2',2);
s.newEquip('def3','amulet','ruby','Amulet Lvl 3',2.5);
s.newEquip('def4','amulet','ruby','Amulet Lvl 4',3);
s.newEquip('dmg0','weapon','mace','Weapon Lvl 0',0.5);
s.newEquip('dmg1','weapon','mace','Weapon Lvl 1',0.75);
s.newEquip('dmg2','weapon','mace','Weapon Lvl 2',1);
s.newEquip('dmg3','weapon','mace','Weapon Lvl 3',1.25);
s.newEquip('dmg4','weapon','mace','Weapon Lvl 4',1.5);

s.newAbility('atk0','attack',{
	name:"Atk Lvl 0",
	icon:'attackMagic.ball'
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(200,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	burn:s.newAbility.status(0.00001,1,1),
	chill:s.newAbility.status(1,1,1),
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('atk1','attack',{
	name:"Atk Lvl 1",
	icon:'attackMagic.ball',
	periodOwn:10,
	periodGlobal:10
},{
	type:'bullet',
	amount:3,
	angleRange:8,
	dmg:s.newAbility.dmg(75,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	burn:s.newAbility.status(0.00001,1,1),
	chill:s.newAbility.status(1,1,1),
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('atk2','attack',{
	name:"Atk Lvl 2",
	icon:'attackMagic.ball',
	periodOwn:10,
	periodGlobal:10
},{
	type:'bullet',
	amount:3,
	angleRange:8,
	dmg:s.newAbility.dmg(100,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	burn:s.newAbility.status(0.00001,1,1),
	chill:s.newAbility.status(1,1,1),
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('atk3','attack',{
	name:"Atk Lvl 3",
	icon:'attackMagic.ball',
	periodOwn:10,
	periodGlobal:10
},{
	type:'bullet',
	amount:5,
	angleRange:13,
	dmg:s.newAbility.dmg(150,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	burn:s.newAbility.status(0.00001,1,1),
	chill:s.newAbility.status(1,1,1),
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('atk4','attack',{
	name:"Atk Lvl 3",
	icon:'attackMagic.ball',
	periodOwn:10,
	periodGlobal:10
},{
	type:'bullet',
	amount:5,
	angleRange:13,
	dmg:s.newAbility.dmg(175,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	burn:s.newAbility.status(0.00001,1,1),
	chill:s.newAbility.status(1,1,1),
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('heal0','heal',{
	name:"Heal Lvl 0",
	periodOwn:300
},{
		mana:0, hp:500
	
});
s.newAbility('heal1','heal',{
	name:"Heal Lvl 1",
	periodOwn:250
},{
		mana:0, hp:600
	
});
s.newAbility('heal2','heal',{
	name:"Heal Lvl 2",
	periodOwn:200
},{
		mana:0, hp:700
	
});
s.newAbility('heal3','heal',{
	name:"Heal Lvl 3",
	periodOwn:175
},{
		mana:0, hp:800
	
});
s.newAbility('heal4','heal',{
	name:"Heal Lvl 4",
	periodOwn:150
},{
		mana:0, hp:1000
	
});
s.newAbility('fireBomb2','attack',{
	name:"Fire Explosion",
	icon:'attackMagic.fireball',
	periodOwn:50,
	periodGlobal:50
},{
	type:'strike',
	amount:1,
	dmg:s.newAbility.dmg(150,'fire'),
	initPosition:s.newAbility.initPosition(0,200),
	preDelayAnim:s.newAbility.anim('fireBomb2',0.6)
});
s.newAbility('fireSlash','attack',{
	name:"Scratch",
	icon:'attackMelee.scar',
	delay:10
},{
	type:'strike',
	amount:1,
	dmg:s.newAbility.dmg(200,'fire'),
	knock:s.newAbility.status(1,1,1),
	initPosition:s.newAbility.initPosition(0,50),
	width:300,
	height:300,
	postDelayAnim:s.newAbility.anim('slashFire',1)
});

s.newPreset('naked',s.newPreset.ability(['atk0','','','','heal0','']),s.newPreset.equip({body:'body',helm:'helm',weapon:'dmg0',ring:'ring',amulet:'def0'}),False,True,False,False);

s.newDialogue('Geff','Geff','villager-child.0',[ //{ 
	s.newDialogue.node('intro',"Hey, do you believe in parallel universes?",[ 
		s.newDialogue.option("Yes",'intro2',''),
		s.newDialogue.option("No",'intro2','')
	],''),
	s.newDialogue.node('intro2',"Really? I'll let you in on a little secret, I can see all of them, and go to any as I please. In one of them, you're a fire demon searching for resources.",[ 
		s.newDialogue.option("I don't believe you",'dontbelieve',''),
		s.newDialogue.option("Why is he collecting resource?",'why',''),
		s.newDialogue.option("Can you tell me more",'whattodo','')
	],''),
	s.newDialogue.node('dontbelieve',"I knew you would say that. I can also predict the future. Anyway, just listen to what I'm going to tell you, it might save your life.",[ 
		s.newDialogue.option("Okay...",'whattodo','')
	],''),
	s.newDialogue.node('why',"He? I guess you meant why YOU are collecting resources? ",[ 
		s.newDialogue.option("Yeh... So why am I collecting resource?",'whattodo','')
	],''),
	s.newDialogue.node('whattodo',"Like I was saying, you are collecting resources to strengthen your equipment and abilities before the final battle.",[ 
		s.newDialogue.option("That sounds cool.",'teleport','')
	],''),
	s.newDialogue.node('teleport',"I'm glad you like it. Because I'm about to send you in that parallel universe for 1 minute.",[ 
		s.newDialogue.option("Nah, you kidding. I'ts impossible.",'','startGame'),
		s.newDialogue.option("Ok, great.",'','startGame')
	],'')
]); //}

s.newNpc('fireBoss',{
	name:"Fire Boss",
	hp:20000,
	boss:s.newNpc.boss('myBoss'),
	sprite:s.newNpc.sprite('demon',2),
	moveRange:s.newNpc.moveRange(2,10),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('idle',[0.1,0.1,0.1])
	])
});

s.newMap('main',{
	name:"South",
	lvl:0,
	graphic:'QfirstTown-south',
},{
	spot:{e2:{x:1712,y:176},a:{x:1488,y:496},b:{x:1808,y:528},t1:{x:1200,y:592},c:{x:976,y:656},e3:{x:2000,y:752},d:{x:560,y:912},e:{x:2096,y:944},e1:{x:336,y:1232},r:{x:1712,y:1264},f:{x:560,y:1360},g:{x:2064,y:1488},ec:{x:1648,y:1616},e4:{x:1808,y:1712},h:{x:1424,y:1744},eb:{x:2800,y:1744},o:{x:2960,y:1744},t4:{x:1840,y:1808},e5:{x:2416,y:1840},n:{x:1968,y:1904},i:{x:816,y:1936},e7:{x:1040,y:2032},p:{x:2704,y:2096},s:{x:240,y:2192},t3:{x:144,y:2224},j:{x:976,y:2256},e6:{x:1552,y:2352},m:{x:1520,y:2512},e8:{x:720,y:2544},k:{x:656,y:2640},t2:{x:2352,y:2864},q:{x:2480,y:2864},ea:{x:1328,y:2992},l:{x:1136,y:3024},ed:{x:2288,y:3024}},
	load:function(spot){
		//up to s, up to ed
		var flowerList = 'abcdefghijklmnopqrs';
		var enemyList = '12345678abcd';
		
		for(var i = 0 ; i < flowerList.length; i++){
			var mySpot = spot[flowerList[i]];
			m.spawnActor(mySpot,'loot-flowerOff',{
				onclick:s.newNpc.onclick(
					null,
					null,
					s.newNpc.onclick.side('Pick up','lootFlower'),
					null
				),
			});
		}
		var possibleModel = ['goblin-melee','goblin-range','goblin-magic','orc-range','orc-magic','orc-melee'];
		
		for(var i = 0 ; i < enemyList.length; i++){
			var mySpot = spot['e' + enemyList[i]];
			var myModel = possibleModel.$random();
			m.spawnActor(mySpot,myModel,{
				deathEvent:'killEnemy',
			});
		}
	}
});
s.newMap('fight',{
	name:"Arena",
	lvl:0,
	grid:["00000000000000000000001100000000000000111100000010","01111110000000000000001100000000000000111100000100","11111111000000000000000000000000000000000000000110","11111111011111111111111111111111111111111110000011","01111110111111111111111111111111111111111111000001","00000001111111111111111111111111111111111111100000","00000001111111111111111111111111111111111111100000","11000001100000000000000000000000000000000001100000","00100001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100111","00010001100000000000000000000000000000000001101111","00010001100000000000000000000000000000000001101111","00010001100000000000000000000000000000000001100111","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100110","00010001100000000000000000000000000000000001100110","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001101100","10110001100000000000000000000000000000000001101100","11100001100000000000000000000000000000000001100000","01000001100000000000000000000000000000000001100000","00011111100000000000000000000000000000000001100000","00011111100000000000000000000000000000000001100000","00001111100000000000000000000000000000000001100000","00000111100000000000000000000000000000000001100000","00000001100000000000000000000000000000000001100000","00011100111111111111111111111111111111111111111100","00100010011111111111111111111111111111111110111100","01000001000000000000000000000000000000000000000000","01000001000000000000000000000000000000000000011100","01000000111111111111111111111111111000000000100010","01000000000000000000000000000000000100000000110110","01000000000000000000000000000000000010000000111110","01000000000000000000000000000000000010000000011100"],
	tileset:'v1.2'
},{
	spot:{t2:{x:1200,y:432},t3:{x:656,y:496},e1:{x:1136,y:560},t1:{x:528,y:1008},t4:{x:1072,y:1008},t5:{x:1264,y:1488}},
	load:function(spot){
		
	},
	loop:function(spot){
		if(!m.testInterval(50)) return;
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{n1:{x:688,y:624},e1:{x:2064,y:752},e2:{x:752,y:1712},e4:{x:1872,y:1776},e5:{x:848,y:2352},e3:{x:1616,y:2352},e6:{x:2608,y:2448}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			name:'Geff',
			sprite:s.newNpc.sprite('villager-child0',1),
			dialogue:'talkGeff',
			angle:s.newNpc.angle('down'),
		});
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('orc-melee',2),
			m.spawnActorGroup.list('orc-magic',1),
		]);
		
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('orc-range',2),
			m.spawnActorGroup.list('orc-magic',1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('goblin-melee',1),
			m.spawnActorGroup.list('goblin-range',1),
			m.spawnActorGroup.list('goblin-magic',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('mushroom',2),
			m.spawnActorGroup.list('ghost',1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('bee',4),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('bat',3),
		]);
	}
});

s.newBoss('myBoss',s.newBoss.variable({"direction":1,"bossType":"normal","rotationAngle":0,"rotationAngle2":0,"holePosition":3,"holePosition2":3}),function(boss){
	var TIME = 2;
	s.newBoss.phase(boss,'phase0',{
		loop:function(boss){
			var frame = b.get(boss,'_framePhase');
			if(frame % TIME === 0)	//need to make sure doesnt fuck other %
				return;
				
			var angle = b.get(boss,'rotationAngle');
			angle += 360/(25*3) * TIME;
			angle %= 360;
			b.set(boss,'rotationAngle',angle);
						
						
			var angle2 = b.get(boss,'rotationAngle2');
			angle2 += -360/(25*3)/2 * TIME;
			angle2 %= 360;
			b.set(boss,'rotationAngle2',angle2);

			if(frame % 250 === 1){	//check %2 above
				b.set(boss,'holePosition',Math.floor(Math.random()*3)+1);
				b.set(boss,'holePosition2',Math.floor(Math.random()*3)+1);
			}
			var dist = b.getDistance(boss);
			var maxAmount = dist > 400 ? 10 : 5;
			
			if(dist < 150 && frame % 5 === 0){
				b.useAbility(boss,'fireSlash',{x:0,y:0});
			}
				
			for(var i = 0 ; i < maxAmount; i++){
				if(i !== b.get(boss,'holePosition')){
					var x = Tk.cos(angle) * ((i+1) * 100);
					var y = Tk.sin(angle) * ((i+1) * 100);
				
					b.useAbility(boss,'fireBomb2',{
						x:x,
						y:y,
					});
				}
			}
			if(b.get(boss,'bossType') !== 'normal'){
				for(var i = 0 ; i < maxAmount; i++){
					if(i !== b.get(boss,'holePosition2')){
						var x = Tk.cos(angle2) * ((i+1) * 100);
						var y = Tk.sin(angle2) * ((i+1) * 100);
					
						b.useAbility(boss,'fireBomb2',{
							x:x,
							y:y,
						});
					}
				}
			}
			//}
		},
		transitionTest:function(boss){
			return false;
			//if(b.get(boss,'_framePhase') > 400) return 'phase1'	
		},
	});
});

s.exports(exports);
