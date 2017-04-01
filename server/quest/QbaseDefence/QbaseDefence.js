//12/15/2014 5:48 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QbaseDefence',{
	name:"Base Defence",
	author:"rc",
	maxPartySize:2,
	thumbnail:true,
	category:["Combat"],
	zone:"QfirstTown-east",
	party:"Coop",
	lvl:10,
	reward:{completion:0.5,score:1,monster:0.1},
	requirement:{lvl:10},
	description:"Kill waves of monsters before they reach your base using the right ability.",
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
kill zombies by using the right ability
get pt by killing them, use pt to upgrade self
if survive all waves, win
*/


s.newVariable({
	wave:0,
	amountWave:15,
	pt:125,
	life:5,
	upgradeAmount:0,
	upgradeSpd:0,
	startGame:false,
});

s.newHighscore('remainingpteasy',"Remaining Pts [Easy]","Most points at the end of the game.",'descending',function(key){
	if(!s.isChallengeActive(key,'hardmode') && !s.isChallengeActive(key,'color4')) return s.get(key,'pt');	
	return null;
});
s.newHighscore('remainingpthard',"Remaining Pts [Hard]","Most points at the end of the game with challenge Hardmode active.",'descending',function(key){
	if(s.isChallengeActive(key,'hardmode')) return s.get(key,'pt');	
	return null;
});
s.newHighscore('remainingpt4',"Remaining Pts [4 Colors]","Most points at the end of the game with challenge 4 Colors active.",'descending',function(key){
	if(s.isChallengeActive(key,'color4')) return s.get(key,'pt');	
	return null;
});

s.newChallenge('hardmode',"Hardmode","Only 3 Life. Survive 20 waves.",function(key){
	return true;
});
s.newChallenge('pt400',"400+ Pts","End the quest with 400 remaining points.",function(key){
	return s.get(key,'pt') > 400;
});
s.newChallenge('color4',"4 Types","There are 4 types of enemies.",function(key){
	return true;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-east','t4',200))
		s.callEvent('talkPoppy',key);
	else s.addStartQuestMarker(key);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'startGame'))
		return 'Talk with Poppy.';	
	return 'Pt: ' + s.get(key,'pt') + ' | Wave: ' + s.get(key,'wave') + '/' + s.get(key,'amountWave') + ' | Life: ' + s.get(key,'life');
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});

s.newEvent('_respawn',function(key){ //
	if(!s.get(key,'startGame'))
		return;
	s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-east','t4','main');
		s.setRespawn(key,'QfirstTown-east','t4','main');
	}
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_button',function(key,button){ //
	if(button === 'amount') s.callEvent('upgradeAmount',key);
	else if(button === 'spd') s.callEvent('upgradeSpd',key);
	s.callEvent('updatePermPopup',key);
});
s.newEvent('startGame',function(key){ //
	s.set(key,'startGame',true);
	s.removeStartQuestMarker(key);
	s.teleport(key,'base','t1','party',true);
	s.setRespawn(key,'base','t1','party');
	s.callEvent('updatePermPopup',key);
		
	if(s.isChallengeActive(key,'hardmode')){
		s.set(key,'life',3);
		s.set(key,'amountWave',20);
		s.set(key,'pt',0);
	}
	
	if(!s.isChallengeActive(key,'color4')){
		s.displayPopup(key,'Use the right ability to defeat the enemies.<br>'
			+ 'Blue: ' + s.inputToText(0) + '<br>'
			+ 'Red: ' + s.inputToText(1) + '<br>'
			+ 'Yellow: ' + s.inputToText(2)
		);
		s.usePreset(key,'color3');
	} else {
		s.displayPopup(key,'Use the right ability to defeat the enemies.<br>'
			+ 'Blue: ' + s.inputToText(0) + '<br>'
			+ 'Red: ' + s.inputToText(1) + '<br>'
			+ 'Yellow: ' + s.inputToText(2) + '<br>'
			+ 'Green: ' + s.inputToText(3) + '<br>'
		);
		
		s.displayPopup(key,'Use the right ability to defeat the enemies (' + s.inputToText(0) + ', ' + s.inputToText(1) + ', ' + s.inputToText(2) + ', ' + s.inputToText(3) + ').');
		s.usePreset(key,'color4');
	}
	s.message(key,'The more points you have, the more points you get.');
	s.setTimeout(key,'nextWave',1*25);	//call the first wave in 1 sec
});
s.newEvent('nextWave',function(key){ //
	if(s.get(key,'wave') >= s.get(key,'amountWave')){ 	//if survived long enough, complete quest
		return s.completeQuest(key); 
	}
	if(!s.isInMap(key,'base')) 	
		return s.ERROR('nextWave timeout should have been removed if no longer in map');
	
	var info = s.callEvent('getWaveInfo',s.get(key,'wave'));		//get info about wave. [amount,time]
	
	for(var i = 0 ; i < info.amount; i++){
		s.callEvent('spawnEnemy',key);
	}
	
	s.add(key,'wave',1);
	s.setTimeout(key,'nextWave',info.time*25);	//set next wave
});
s.newEvent('getWaveInfo',function(num){ //
	if(num === 0) return {amount:2,time:15};
	if(num === 1) return {amount:3,time:8};
	if(num === 2) return {amount:3,time:8};
	if(num === 3) return {amount:4,time:7};
	if(num === 4) return {amount:4,time:7};
	if(num === 5) return {amount:5,time:6};
	if(num === 6) return {amount:5,time:6};
	if(num === 7) return {amount:6,time:6};
	if(num === 8) return {amount:6,time:6};
	if(num === 9) return {amount:7,time:5};
	if(num === 10) return {amount:7,time:5};
	if(num === 11) return {amount:8,time:8};
	if(num === 12) return {amount:8,time:10};
	if(num === 13) return {amount:8,time:10};
	if(num === 14) return {amount:8,time:10};
	//if challenge
	if(num === 15) return {amount:8,time:5};
	if(num === 16) return {amount:9,time:5};
	if(num === 17) return {amount:10,time:5};
	if(num === 18) return {amount:10,time:5};
	if(num === 19) return {amount:10,time:15};
	return s.ERROR('bad wave:' + num);
});
s.newEvent('spawnEnemy',function(key){ //
	var color = s.isChallengeActive(key,'color4') 
		? ['red','blue','yellow','green'].$random() 
		: ['red','blue','yellow'].$random();
	var spot = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s'].$random();
	var eid = s.spawnActor(key,'base',spot,color,{deathEvent:'killEnemy',v:32});
	
	s.followPath(eid,'base','myPath',function(){	//no key in param cuz using key of nextWave
		s.killActor(eid);
		if(s.isOnline(key)){
			s.add(key,'life',-1);
			if(s.get(key,'life') <= 0)
				s.failQuest(key);
		}
	});
});
s.newEvent('killEnemy',function(key){ //
	s.callEvent('addPt',key);
});
s.newEvent('addPt',function(key){ //
	var currentPt = s.get(key,'pt');
	var ptToAdd = s.callEvent('getPtToAdd',key,currentPt);
	s.add(key,'pt',ptToAdd);
	s.callEvent('updatePermPopup',key);
});
s.newEvent('getPtToAdd',function(key){ //the more pt you save, the more you get
	var num = s.get(key,'pt');
	if(num < 25) return Math.round(5);
	if(num < 50) return Math.round(6);
	if(num < 100) return Math.round(7);
	if(num < 200) return Math.round(8);
	if(num < 400) return Math.round(9);
	if(num < 800) return Math.round(10);
	return Math.round(11);
});
s.newEvent('upgradeSpd',function(key){ //
	var cost = s.callEvent('upgradeSpdCost',key);
	if(s.get(key,'pt') < cost) 
		return s.message(key,'You need ' + cost + ' points.');
	s.add(key,'pt',-cost);
	s.add(key,'upgradeSpd',1);
	
	var boost = 1 + s.get(key,'upgradeSpd')*0.5;
	s.addBoost(key,'atkSpd',boost);
	
	s.message(key,'You shoot x' + boost + ' faster now.');
});
s.newEvent('upgradeSpdCost',function(key){ //
	return 50 * (1 + s.get(key,'upgradeSpd'));
});
s.newEvent('upgradeAmount',function(key){ //
	var cost = s.callEvent('upgradeAmountCost',key);
	if(s.get(key,'pt') < cost) 
		return s.message(key,'You need ' + cost + ' points.');
	s.add(key,'pt',-cost);
	s.add(key,'upgradeAmount',1);
	
	var boost = 1 + s.get(key,'upgradeAmount')*2;
	s.addBoost(key,'bullet-amount',boost);
	
	s.message(key,'You shoot ' + boost + ' at a time now.');
});
s.newEvent('upgradeAmountCost',function(key){ //
	return 200 * (1 + s.get(key,'upgradeAmount'));
});

s.newEvent('reachEnd',function(key){ //when mushroom reach end
	s.add(key,'life',-1);
	if(s.get(key,'life') <= 0){
		s.message(key,"You lost because too many enemies past through your defence.");
		s.failQuest(key);
		return true;	//stops the loop in the map loop
	}
});
s.newEvent('talkPoppy',function(key){ //
	s.startDialogue(key,'Poppy','intro');
});
s.newEvent('updatePermPopup',function(key){ //
	var text = 'Points: ' + s.get(key,'pt') + '<br>'
		+ 'Amount ' + s.displayPermPopup.button('amount',s.callEvent('upgradeAmountCost',key) + ' pts','Shoot more bullets.') + '<br>'
		+ 'Atk Spd ' + s.displayPermPopup.button('spd',s.callEvent('upgradeSpdCost',key) + ' pts','Shoot bullets faster.')
		
	s.displayPermPopup(key,text,'aboveInventory',{
		width:'250px',
	});
});

s.newAbility('green','attack',{
	name:"Green",
	icon:'offensive-bullet',
	description:"This is an ability.",
	periodOwn:15,
	periodGlobal:15
},{
	type:'bullet',
	dmg:s.newAbility.dmg(10,'range'),
	hitAnim:s.newAbility.anim('earthBomb',0.4),
	sprite:s.newAbility.sprite('rock',1)
});
s.newAbility('red','attack',{
	name:"Red",
	icon:'attackMagic-fireball',
	description:"This is an ability.",
	periodOwn:15,
	periodGlobal:15
},{
	type:'bullet',
	dmg:s.newAbility.dmg(10,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	sprite:s.newAbility.sprite('fireball',1.2)
});
s.newAbility('blue','attack',{
	name:"Blue",
	icon:'attackMagic-crystal',
	description:"This is an ability.",
	periodOwn:15,
	periodGlobal:15
},{
	type:'bullet',
	dmg:s.newAbility.dmg(10,'cold'),
	hitAnim:s.newAbility.anim('coldHit',0.5),
	sprite:s.newAbility.sprite('iceshard',1)
});
s.newAbility('yellow','attack',{
	name:"Yellow",
	icon:'attackMagic-static',
	description:"This is an ability.",
	periodOwn:15,
	periodGlobal:15
},{
	type:'bullet',
	dmg:s.newAbility.dmg(10,'lightning'),
	hitAnim:s.newAbility.anim('lightningHit',0.5),
	sprite:s.newAbility.sprite('lightningball',1)
});

s.newPreset('color3',s.newPreset.ability(['blue','red','yellow','','','']),null,False,False,False,False);
s.newPreset('color4',s.newPreset.ability(['blue','red','yellow','green','','']),null,False,False,False,False);

s.newNpc('blue',{
	name:"Blue",
	hp:4,
	alwaysActive:True,
	ghost:True,
	maxSpd:s.newNpc.maxSpd(0.25),
	sprite:s.newNpc.sprite('tower-blue',1),
	mastery:s.newNpc.mastery([1000,1000,1000,1000,0.001,1000]),
	damageIf:s.newNpc.damageIf('never')
});
s.newNpc('yellow',{
	name:"Yellow",
	hp:4,
	alwaysActive:True,
	ghost:True,
	maxSpd:s.newNpc.maxSpd(0.25),
	sprite:s.newNpc.sprite('tower-yellow',1),
	mastery:s.newNpc.mastery([1000,1000,1000,1000,1000,0.001]),
	damageIf:s.newNpc.damageIf('never')
});
s.newNpc('red',{
	name:"Red",
	hp:4,
	alwaysActive:True,
	ghost:True,
	maxSpd:s.newNpc.maxSpd(0.25),
	sprite:s.newNpc.sprite('tower-red',1),
	mastery:s.newNpc.mastery([1000,1000,1000,0.001,1000,1000]),
	damageIf:s.newNpc.damageIf('never')
});
s.newNpc('green',{
	name:"Green",
	hp:4,
	alwaysActive:True,
	ghost:True,
	maxSpd:s.newNpc.maxSpd(0.25),
	sprite:s.newNpc.sprite('tower-green',1),
	mastery:s.newNpc.mastery([1000,0.001,1000,1000,1000,1000]),
	damageIf:s.newNpc.damageIf('never')
});

s.newDialogue('Poppy','Poppy','villagerFemale-3',[ //{ 
	s.newDialogue.node('intro',"Hello. Some weird-ass coloured squares appeared out of nowhere and tried to kill me! Exterminate them please, they don't belong to this game! They have been added by Lord Dotex.",[ 
		s.newDialogue.option("Sure",'intro2','')
	],''),
	s.newDialogue.node('intro2',"Apparently, red monsters can only be killed by red attacks (fire), yellow monsters by lightning and blue ones by cold.",[ 
		s.newDialogue.option("Okay. I'm ready.",'','startGame')
	],''),
]); //}

s.newMap('base',{
	name:"Base",
	screenEffect:'lightCave'
},{
	load:function(spot){
		
	},
});
s.newMapAddon('QfirstTown-east',{
	load:function(spot){
		m.spawnActor(spot.t4,'npc',{
			dialogue:'talkPoppy',
			name:'Poppy',
			sprite:s.newNpc.sprite('villagerFemale-3',1),
			minimapIcon:CST.ICON.quest,
			angle:s.newNpc.angle('up'),
			nevermove:true,
		});
		m.setAsStartPoint(spot.t4);
		
	}
});

s.newPath('myPath',s.newPath.compileSpotList('base',s.newPath.spotList([s.newPath.spotChain('blue',0,0)])));

s.exports(exports);
