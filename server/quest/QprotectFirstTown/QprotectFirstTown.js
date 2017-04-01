//11/28/2014 4:13 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/
'use strict';
var s = loadAPI('v1.0','QprotectFirstTown',{
	name:"Protect Town",
	author:"rc",
	recommendedPartySize:4,
	maxPartySize:8,
	category:["Combat"],
	party:"Coop",
	thumbnail:true,
	reward:{completion:0.25,score:0.5,monster:0.20},
	zone:"QfirstTown-main",
	description:"Protect villagers from waves of monsters.",
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:

*/

s.newVariable({
	interval:150,
	started:false,
	time:0,
	timeToSurvive:1500
});

s.newChallenge('hardmode',"I want MORE","More enemies! More villagers!",function(key){
	return true;
});
s.newChallenge('longer',"Longer","Protect for 2 minutes.",function(key){
	return true;
});

s.newChallenge('boss',"Ending Surprise","Fun surprise at the end.",function(key){
	return true;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-main','n3',200))
		s.callEvent('talkCyber',key);
	else s.addStartQuestMarker(key);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'started')) 
		return 'Talk to Cyber.';
	return 'Protect the villagers for ' + s.frameToChrono(s.get(key,'timeToSurvive')) + '.';
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_death',function(key,killer,partyDead){ //
	if(partyDead)
		s.callEvent('_respawn',key);
});
s.newEvent('_respawn',function(key){ //
	if(!s.get(key,'started'))
		return;
	s.failQuest(key);
});

s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-main','n3','main');
		s.setRespawn(key,'QfirstTown-main','n3','main');
	}
});
s.newEvent('_complete',function(key){ //
	s.message(key,'You managed to protect the village!');
	s.callEvent('_abandon',key);
});
s.newEvent('startGame',function(key){ //
	s.removeStartQuestMarker(key);
	var LIFE = 1000;
	
	s.teleport(key,'main','n3','party',true);
	s.setRespawn(key,'QfirstTown-main','n3','main',true);
	s.startChrono(key,'timer');	//only used to show time to player
	
	if(s.isChallengeActive(key,'hardmode')){
		s.set(key,'interval',4*25);
		s.spawnActor(key,'main','e2','npc-playerLike',{
			sprite:s.newNpc.sprite('villagerMale-4'),
			name:'Ylbeekyl',
			deathEvent:'killNpc',
			hp:LIFE
		});	
		s.spawnActor(key,'main','e3','npc-playerLike',{
			sprite:s.newNpc.sprite('villagerMale-5'),
			name:'Zonrose',
			deathEvent:'killNpc',
			hp:LIFE
		});
	}
	if(s.isChallengeActive(key,'longer')){
		s.set(key,'timeToSurvive',2*60*25);
	}
	
	
	s.setTimeout(key,function(){
		if(!s.isChallengeActive(key,'boss'))
			s.completeQuest(key);
		else 
			s.spawnActor(key,'main','n3','dragon',{
				deathEvent:function(){ s.completeQuest(key); },
				sprite:s.newNpc.sprite('dragon',2.5),
				hp:5000,
			});
	},s.get(key,'timeToSurvive'));	//use setTimeout for timing
	
	s.set(key,'started',true);
	s.displayPopup(key,'Protect the villagers.');
	
	s.spawnActor(key,'main','n1','npc-playerLike',{
		sprite:s.newNpc.sprite('villagerMale-1'),
		name:'Imdum',
		deathEvent:'killNpc',
		hp:LIFE
	});	
	s.spawnActor(key,'main','n2','npc-playerLike',{
		sprite:s.newNpc.sprite('villagerMale-2'),
		name:'Imstoopid',
		deathEvent:'killNpc',
		hp:LIFE
	});
	s.spawnActor(key,'main','n3','npc-playerLike',{
		sprite:s.newNpc.sprite('villagerMale-3'),
		name:'Igonhawdye',
		deathEvent:'killNpc',
		hp:LIFE
	});
});
s.newEvent('talkCyber',function(key){ //
	s.startDialogue(key,'cyber','intro1');
});
s.newEvent('killNpc',function(killer,villagerId){ //
	var key = s.getRandomPlayer(villagerId,'main');
	if(!key) return ERROR(3,'no player');
	s.message(key,'One of the villagers died... You failed to protect the village.');
	s.failQuest(key);
});

s.newDialogue('cyber','Cyber','villagerMale-5',[ //{ 
	s.newDialogue.node('intro1',"Lord Dotex introduced a weird glitch in the town script. Monsters are going to spawn all over the place very soon. Protect the villagers!",[ 
		s.newDialogue.option("I'll protect them.",'','startGame')
	],'')
]); //}

s.newMap('main',{
	name:"Town Under Attack!",
	screenEffect:'weather',
	graphic:'QfirstTown-main',
},{
	load:function(spot){
		//restrict area
		m.spawnBlock(spot.qa,function(){ return true;},'spike');	
		m.spawnBlock(spot.qb,function(){ return true;},'spike');	
		m.spawnBlock(spot.qc,function(){ return true;},'spike');
		m.spawnBlock(spot.qd,function(){ return true;},'spike');
		
		//npc to protect, npc&playerLike template is npc that can be attacked by monsters
	},
	loop:function(spot){
		var key = m.getRandomPlayer(spot);
		if(!key) return ERROR(3,'no player');
		if(!m.testInterval(s.get(key,'interval'))) 
			return;
		
		var amount = 1;
		var r = Math.random();
		var enemyCount = m.forEachActor(spot,1,null,'npc',null,{monster:true}).length;
		
		if(enemyCount === 3){
			if(r < 0.2) amount = 2;
		}
		if(enemyCount === 2){
			if(r < 0.3) amount = 2;
		}
		if(enemyCount === 1){
			if(r < 0.3) amount = 2;
			if(r < 0.1) amount = 3;
		}
		if(enemyCount === 0){
			if(r < 0.4) amount = 2;
			if(r < 0.1) amount = 3;
		}	
		
		for(var i = 0; i < amount; i++){		
			var possibleSpot = ['e1','e2','e3','e4'];
			var possibleEnemy = ['werewolf','spirit','skeleton','eyeball','ghost','orc-melee'];
			var randomSpot = spot[possibleSpot.$random()];
			var randomEnemy = possibleEnemy.$random();
			m.spawnActor(randomSpot,randomEnemy,{tag:{monster:true},globalDmg:0.7});	//spawn enemy
		}
	}
});
s.newMapAddon('QfirstTown-main',{
	load:function(spot){
		m.spawnActor(spot.n3,'npc',{
			sprite:s.newNpc.sprite('villagerMale-5'),
			dialogue:'talkCyber',
			name:'Cyber',
			minimapIcon:CST.ICON.quest,
		});
		m.setAsStartPoint(spot.n3);
	}
});

s.exports(exports);
