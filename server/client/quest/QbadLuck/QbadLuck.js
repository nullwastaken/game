//04/09/2015 3:12 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QbadLuck',{
	name:"Bad Luck Brian",
	author:"rc",
	thumbnail:False,
	description:"",
	maxParty:2,
	zone:'QfirstTown-south'
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
only support 1 player atm
*/

s.newVariable({
	talkBrian:False,
	talkWiseOldMan:False,
	killBoss:False,
	bossStarted:False,
	killSpecialBomb:0
});

s.newEvent('talkBrian',function(key){ //
	if(!s.get(key,'talkBrian'))
		return s.startDialogue(key,'Brian','intro');
	else
		return s.startDialogue(key,'Brian','talkagain');
});
s.newEvent('talkBrianDone',function(key){ //
	s.set(key,'talkBrian',true);
	s.addQuestMarker(key,'cave','QfirstTown-south','t2');
});
s.newEvent('talkWiseOldMan',function(key){ //
	s.startDialogue(key,'WiseOldMan','intro');
});
s.newEvent('spawnBomb',function(key){ //
	var eid = s.spawnActor(key,'main','n1','genericEnemy',{
		hp:50,
		v:32*8,
		hpRegen:0,
		sprite:s.newNpc.sprite('pushable-rock1x1',2),
		nevermove:true,
		tag:{bomb:true,dontDamage:false},
		deathEvent:function(key2){
			s.addAnimOnTop(eid,'earthBomb',1,true);
			
			if(s.hasTag(eid,{dontDamage:true}))
				return;
			
			if(!key2 || !s.isPlayer(key2)){
				s.forEachActor(eid,'main',function(pid){
					if(s.getDistance(eid,pid) <= 150){
						s.addAnimOnTop(pid,'strikeHit',0.5);
						s.addHp.one(pid,-200);
					}
				},'player');
			} else {
				var pid = s.getRandomNpc(eid,'main',{boss:true});
				if(pid && s.getDistance(eid,pid) <= 150){
					s.addAnimOnTop(pid,'strikeHit',0.5);
					if(!b.get(pid,'phase2') || s.getAttr(pid,'hp') <= 1000/10*2){
						s.addHp(pid,-1000/10);
						if(s.getAttr(pid,'hp') <= 1000/10*2)
							s.callEvent('performBossPhase2',pid);
					}
				}
			}
		;},
	});
});
s.newEvent('performBossPhase2',function(boss){ //
	b.set(boss,'phase2',true);
	var pid = s.getRandomPlayer(boss,'main');
	if(!pid)
		return;
	s.message(pid,'Muahahahahaha! You will never manage to destroy the big bomb!');
	
	s.forEachActor(boss,'main',function(key2){
		s.setTag(key2,'dontDamage',true);
		s.killActor(key2);
	},'npc',null,{bomb:true});
	
	
	var list = ['a','b','c','d','f','g','h','i'];	//'e' is boss
	for(var i = 0 ; i < list.length; i++){
		s.spawnActor(boss,'main',list[i],'genericEnemy',{
			hp:1000,
			hpRegen:0,
			sprite:s.newNpc.sprite('pushable-rock1x1',2),	//TODO find other sprite
			nevermove:true,
			deathEvent:function(key){
				s.add(key,'killSpecialBomb',1);
				if(s.get(key,'killSpecialBomb') >= 8){
					var bigBomb = s.getRandomNpc(key,'main',{bigBomb:true});
					if(!bigBomb)
						return;
					s.setAttr(bigBomb,'damagedIf','player');
				}
			}
		});
	}
	var bigBomb = s.spawnActor(boss,'main','e','genericEnemy',{
		hp:50,	//check map loop to find how long it lasts (15 sec)
		hpRegen:0,
		damagedIf:'false',
		sprite:s.newNpc.sprite('pushable-rock1x1',4),	//TODO find other sprite
		nevermove:true,
		tag:{bigBomb:true},
		deathEvent:function(key){
			s.addAnimOnTop(bigBomb,'earthBomb',2,true);
					
			if(!key || !s.isPlayer(key)){
				var pid = s.getRandomPlayer(bigBomb,'main');
				if(pid){
					s.setTimeout(pid,function(){
						s.killActor(pid);	
					},5);						
				}
			} else {
				s.set(key,'killBoss',true);
				if(s.actorExists(boss))
					s.killActor(boss);
			}
		}
	});
});

s.newAbility('shadowball-360','attack',{
},{
	type:'bullet',
	amount:8,
	angleRange:360,
	dmg:s.newAbility.dmg(100,'magic'),
	hitAnim:s.newAbility.anim('magicHit',0.5),
	sprite:s.newAbility.sprite('shadowball',1)
});

s.newDialogue('Brian','Brian','villagerMale-9',[ //{ 
	s.newDialogue.node('intro',"Don't talk with me! I've been cursed!",[ 
		s.newDialogue.option("Cursed?",'cursed'),
		s.newDialogue.option("Good for you!",'goodforyou')
	]),
	s.newDialogue.node('cursed',"Yeah, by the RNG God Himself! I am the most unlucky man in the entire game. Everything I do turns out to be a failure, no matter how hard I try.",[ 
		s.newDialogue.option("Like what?",'example'),
		s.newDialogue.option("How did you get cursed?",'howcursed')
	]),
	s.newDialogue.node('goodforyou',"Very funny... You have no clue how hard it is when everything you do fails. Whenever I'm in a party, every monster selects me as their target. The most is that every attack they land on me is a critical hit. ",[ 
		s.newDialogue.option("That sounds like some bad luck, Brian.",'badluck')
	]),
	s.newDialogue.node('example',"EVERYTHING! Whenever I walk around, I always end up stuck in a corner. I never landed a critical hit in my entire life. Every equipment I have picked up has been a white. Every single one of them! It drives me insane.",[ 
		s.newDialogue.option("Is there anything I can do?",'breakcurse')
	]),
	s.newDialogue.node('howcursed',"I don't know. I've never done anything bad! From the very first day I've been added to the game, bad luck seems to follow me.  The RNG God hates me I guess.",[ 
		s.newDialogue.option("Let's break the curse!",'breakcurse')
	]),
	s.newDialogue.node('badluck',"I know right! I need to ask you something. Could you help me break the curse?",[ 
		s.newDialogue.option("Sure.",'breakcurse')
	]),
	s.newDialogue.node('breakcurse',"Actually, I have no clue how to break the curse. For me, coding and random number generation is all gibberish. I do know a man that could help though. He lives in a cave south of the town. Go meet him.",[ 
		s.newDialogue.option("Okay.")
	],'talkBrianDone'),
	s.newDialogue.node('talkagain',"So, have you met the Wise Old Man that lives in a cave south of the town?",[ 
		s.newDialogue.option("Nope, not yet...",'talkagain2')
	]),
	s.newDialogue.node('talkagain2',"Then what are you waiting for! I'm counting on you!",[ 	],'talkBrianDone')
]); //}
s.newDialogue('WiseOldMan','Wise Old Man','',[ //{ 
	s.newDialogue.node('intro',"Hello. How may I help you?",[ 
		s.newDialogue.option("I need to break Brian's curse.")
	]),
	s.newDialogue.node('intro2',"",[ 	])
]); //}

s.newMap('main',{
	name:"Cave",
	lvl:0,
	screenEffect:'lightCave',
	grid:["1111111000011111001111100111000000000000","1111111000011111001111100111000000000000","1111110000111111111111111111001111111111","1111100001111111111111111111111000111111","1111100001111111111111001000010000111111","0011111111100000111110001000010000111111","0000111111100000111110011001111000111111","0000111111100000111111110001111100111111","0000111111100000111111100000100111111111","0001111111000000011111100000100111111111","0011111110000000001111111111111111111111","0011111100000000000111111111111111111111","0011111100000000000000000000000000011000","0011111100000000000000000000000000011000","0011111000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011111","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0011000000000000000000000000000000011000","0001111111111001111111110000000011111100","0001111111111111111111111000000111111100","1111111111111001111110001100001111111100","1111111111100001111100001100001111111111","1111110011100000111100001100001100110000","1111110011000110011100001100001100110000","0011111110000110011100001100001100110000","0000011110000111111100001100001100011000","0000011111111111001111111100001100001111","0000011111111110001000111111111100000111","0000111111111110001000111111111111100000","0001100111111110001000111100000111100000","1111100111111110001000111100000111100000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:432,y:144},b2:{x:352,y:256,width:160,height:32},b3:{x:128,y:384,width:992,height:640},a:{x:368,y:528},b:{x:656,y:528},c:{x:912,y:528},d:{x:368,y:720},n1:{x:656,y:720},e:{x:656,y:720},f:{x:912,y:720},g:{x:368,y:912},h:{x:656,y:912},i:{x:912,y:912},b1:{x:832,y:1088,width:128,height:32},t1:{x:896,y:1264}},
	load:function(spot){
		m.spawnTeleporter(spot.t2,function(key){
			if(s.get(key,'killBoss'))
				s.teleport(key,'QfirstTown-wiseOldManCave','t1','main');
		;},'cave');
		
		m.spawnBlock(spot.b2,function(key){
			return !s.get(key,'killBoss');
		;},'spike');
		
		m.spawnBlock(spot.b1,function(key){
			return s.get(key,'bossStarted');
		;},'spike');
		
		var bossId = m.spawnActor(spot.n1,'ghost',{
			damagedIf:'false',
			sprite:s.newNpc.sprite('ghost',2),
			hpRegen:0,
			atkSpd:2,
			boss:s.newNpc.boss('bombBoss'),
			tag:{boss:true},
			deathEvent:function(){
				var pid = s.getRandomPlayer(bossId,'main');	//key wont be player cuz s.addHp
				if(pid)
					s.set(pid,'killBoss',true);
			;},
		});
	},
	loop:function(spot){
		m.forEachActor(spot,25,function(key){
			if(!s.get(key,'bossStarted'))
				s.set(key,'bossStarted',true);
		;},'player',spot.b3);
		
		
		m.forEachActor(spot,5,function(key){
			s.addHp(key,-10/5);	//last 5 sec
		;},'npc',null,{bomb:true});
		
		m.forEachActor(spot,5,function(key){
			s.addHp(key,-10/30);	//last 30 sec
		;},'npc',null,{bigBomb:true});
	},
	playerEnter:function(key){
		s.set(key,'bossStarted',false);
		s.set(key,'killSpecialBomb',0);
		s.shakeScreen.one(key,'shake',1000000000,100,4);
	},
	playerLeave:function(key){
		s.stopShakingScreen.one(key,'shake');
	}
});
s.newMapAddon('QfirstTown-northEastHouse',{
	spot:{n1:{x:656,y:496},t1:{x:640,y:816}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('villagerMale-9',1),
			name:'Brian',
			dialogue:'talkBrian',
		});
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{t1:{x:1760,y:48},s2:{x:656,y:1008},s6:{x:2064,y:1072},t2:{x:1552,y:1200},t7:{x:48,y:1248},s1:{x:304,y:1680},t3:{x:3152,y:1728},s5:{x:1776,y:1776},s3:{x:880,y:1936},s7:{x:2736,y:2000},t6:{x:48,y:2240},s4:{x:720,y:2672},s8:{x:2448,y:2736},t5:{x:1216,y:3152},t4:{x:2176,y:3152}},
	load:function(spot){
		m.addTeleport(spot,{wiseOldManCave:true},function(key){
			s.removeQuestMarker(key,'cave');
			if(!s.get(key,'talkBrian'))
				return s.message(key,'I have no reason to go there yet.');
			if(s.get(key,'killBoss')){
				s.teleport(key,'QfirstTown-wiseOldManCave','t1','party');
				s.setRespawn(key,'QfirstTown-wiseOldManCave','t1','party');
			} else {
				s.teleport(key,'main','t1','party');
				s.setRespawn(key,'QfirstTown-south','t2','main');
			}
		;});
	}
});
s.newMapAddon('QfirstTown-wiseOldManCave',{
	spot:{n1:{x:656,y:624},t1:{x:688,y:1008}},
	load:function(spot){
		m.addDialogue(spot,{wiseOldMan:true},'talkWiseOldMan');
	}
});

s.newBoss('bombBoss',s.newBoss.variable({"invincible":false,"phase2":false}),function(boss){
	s.newBoss.phase(boss,'phase0',{
		loop:function(boss){
			if(b.get(boss,'phase2')){
				if(b.get(boss,'_framePhase') % 15 === 0){				
					b.useAbility(boss,'shadowball-360');
				}
				return;				
			}
			var spawnBombInterval = (b.get(boss,'_hpRatio') < 0.5) ? 10 : 25;
			
			if(b.get(boss,'_framePhase') % spawnBombInterval === 0)
				s.callEvent('spawnBomb',boss);
		},
	});
});

s.exports(exports);
