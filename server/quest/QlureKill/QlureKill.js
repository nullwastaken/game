//01/16/2015 10:41 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QlureKill',{
	name:"Lure & Kill",
	author:"rc",
	maxPartySize:8,
	recommendedPartySize:4,
	thumbnail:true,
	category:["Combat"],
	party:"Coop",
	zone:"QfirstTown-north",
	reward:{completion:0.25,score:0.5,monster:0.08},
	description:"Kill monsters by luring them on the red mat.",
	scoreModInfo:"Depends on amount of kills. [Only for Infinite Challenge]."
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
Enter zone.
3 near invincible monsters spawn, need to lure in pit to turn them vulnerable
when monster dies, another spawn.
need to kill 100
*/

s.newVariable({
	killCount:0,
	enemyStart:3,
	enemyToKill:15,
	startGame:false,
});

s.newHighscore('killCount',"Most Kills","Most kills without dying. Use Challenge Infinite",'descending',function(key){
	return s.get(key,'killCount');
});
s.newHighscore('timeEasy',"Fastest Time [Easy]","Kill all the monsters and finish quest.",'ascending',function(key){
	if(s.isChallengeActive(key,'insane')) return null;
	return s.stopChrono(key,'timer')*40;
});
s.newHighscore('timeHard',"Fastest Time [Insane]","Kill all the monsters and finish quest with Challenge Insanity on.",'ascending',function(key){
	if(!s.isChallengeActive(key,'insane')) return null;
	return s.stopChrono(key,'timer')*40;
});

s.newChallenge('insane',"Insanity","Fight against 10 enemies at once. Need to kill 50.",function(key){
	return true;
});
s.newChallenge('infinite',"Infinite","Fight until you die for highscore. Challenge and quest successful if killed 50 or more.",function(key){
	return true;
});
s.newChallenge('speedrun',"Speedrunner","Complete the quest in less than 3 minutes.",function(key){
	return s.stopChrono(key,'timer') < 3*60*25;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-north','t7',200))
		s.callEvent('talkTapis',key);
	else s.addStartQuestMarker(key);
	
	if(s.isChallengeActive(key,'insane')){
		s.set(key,'enemyStart',10);
		s.set(key,'enemyToKill',50);
	}
	if(s.isChallengeActive(key,'infinite')){
		s.set(key,'enemyToKill',50);
	}
});
s.newEvent('_getScoreMod',function(key){ //
	if(!s.isChallengeActive(key,'infinite')) 
		return 1;
	return Math.pow(s.get('key','killCount')/50,1.5);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'startGame'))
		return 'Talk to Tapis.';
	return 'Killcount: ' + s.get(key,'killCount') + '/' + s.get(key,'enemyToKill') + ' | Red zone weakens monsters and yourself!';
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_death',function(key,killer,partyDead){ //
	if(partyDead)
		s.callEvent('_respawn',key);
});

s.newEvent('_respawn',function(key){ //
	if(!s.get(key,'startGame'))
		return;
	
	if(s.get(key,'killCount') >= s.get(key,'enemyToKill')) 
		s.completeQuest(key);	//incase doing challenge
	else 
		s.failQuest(key);
});

s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-north','t7','main');
		s.setRespawn(key,'QfirstTown-north','t7','main');
	}
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('startGame',function(key){ //teleport and spawn enemy
	s.set(key,'startGame',true);
	s.removeStartQuestMarker(key);
	var chronoVisible = !!s.isChallengeActive(key,'speedrun');
	s.startChrono(key,'timer',chronoVisible);
	s.teleport(key,'main','t1','party',true);
	s.setRespawn(key,'QfirstTown-north','t7','main');
	s.message(key,'The strange shape on the ground weakens enemies.');
	s.message(key,'Kill ' + s.get(key,'enemyToKill') + ' enemies to complete the quest.');
	
	var amount = s.get(key,'enemyStart');
	for(var i = 0; i < amount; i++){
		s.callEvent('spawnEnemy',key);
	}
});
s.newEvent('spawnEnemy',function(key){ //
	var spot = ['e1','e2','e3','e4','e5','e6','e7','e8'].$random();
	var monster = ['plant','bat','bee','mushroom','skeleton','ghost','snake','werewolf'].$random();
	s.spawnActor(key,'main',spot,monster,{
		hp:5000,
		globalDmg:0.5,
		deathEvent:'killEnemy',
	});
});
s.newEvent('killEnemy',function(key,e){ //
	s.add(key,'killCount',1);	//increase kill count	
	var killCount = s.get(key,'killCount');	
	if(s.isChallengeActive(key,'infinite')){
		s.callEvent('spawnEnemy',key);		//when enemy dies, it spawns a new one
		if(killCount > 8 && Math.sqrt(killCount) % 1 === 0)	//aka killCount is squared
			s.callEvent('spawnEnemy',key);	//spawn another one
	} else {
		if(killCount >= s.get(key,'enemyToKill')) 
			return s.completeQuest(key); 
		s.callEvent('spawnEnemy',key);		//when enemy dies, it spawns a new one
	}
});
s.newEvent('weakenActor',function(key){ //weaken enemy on red zone, check map loop, last 10 sec
	if(s.isPlayer(key)){ 
		s.message(key,"You have been weakened by the carpet.",true);
		s.addBoost(key,'globalDef',0.25,25*5,'weakenActor');
	} else
		s.addBoost(key,'globalDef',0.05,25*10,'weakenActor');
		
	s.addAnimOnTop(key,'boostPink');
});
s.newEvent('talkTapis',function(key){ //
	s.startDialogue(key,'Tapis','intro');
});

s.newDialogue('Tapis','Tapis','villagerMale-6',[ //{ 
	s.newDialogue.node('intro',"Hello there. That cave is filled with monsters spawned by [[Lord Dotex]]. To get rid of them, I created a super amazing device: the [[Carpet2000]]!",[ 
		s.newDialogue.option("Sounds cool.",'intro2','')
	],''),
	s.newDialogue.node('intro2',"The Carpet2000 is very special. When an Actor steps on it, his [[defence stats are lowered]].",[ 
		s.newDialogue.option("That's amazing!",'intro3',''),
		s.newDialogue.option("So what?",'intro3','')
	],''),
	s.newDialogue.node('intro3',"Well, there's a little issue with it. Monsters have their defences lowered but they don't die. I need someone to deliver the killing blow.",[ 
		s.newDialogue.option("Okay.",'intro4','')
	],''),
	s.newDialogue.node('intro4',"Just lure the monsters onto the [[red zone]] and then kill them. Be careful to not go over it yourself! Good luck.",[ 
		s.newDialogue.option("My body is ready.",'','startGame')
	],'')
]); //}

s.newMap('main',{
	name:"Fight Cave",
	screenEffect:'cave'
},{
	load:function(spot){
		
	},
	loop:function(spot){
		//weak actor that are in red zone. test every 10 frames
		m.forEachActor(spot,10,'weakenActor','actor',spot.qc);
	},
});
s.newMapAddon('QfirstTown-north',{
	load:function(spot){
		m.spawnTeleporter(spot.t7,'talkTapis','cave',{});
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkTapis',
			sprite:s.newNpc.sprite('villagerMale-6',1),
			minimapIcon:CST.ICON.quest,
			angle:s.newNpc.angle('right'),
			nevermove:true,
			name:'Tapis',
			tag:{Tapis:true},
		});
		m.setAsStartPoint(spot.n1);
	}
});

s.exports(exports);
