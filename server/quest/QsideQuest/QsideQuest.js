//06/26/2015 8:02 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QsideQuest',{
	name:"Side Quest",
	author:"rc",
	description:"",
	maxPartySize:8,	//unsued
	globalHighscore:true,
	showInTab:false,
	dailyTask:false,
	showWindowComplete:false,
	autoStartQuest:false,
	inMain:true,	//for highscore
	completable:false,
	admin:true,
	sideQuestAllowed:true,
	alwaysActive:true
});
var m = s.map; var b = s.boss; var d = s.sideQuest; var g;

/* COMMENT:

*/

s.newHighscore('completeCap10','Most Completed','Most side quests completed. Each side quest can be repeated up to 10 times.','descending',function(key){
	var count = s.getSideQuestCompleteCount(key,true);
	if(count > 0)
		return count;
});

s.newVariable({
});

s.newEvent('wBridge_protect',function(key){ //
	var sq = s.getSideQuest(key,'wBridge_protect');
	
	if(d.get(sq,'started'))
		return; //double
		
	d.set(sq,'started',true);
	
	var spots = ['e1','e2','e3'];
	var models = ['bat','bee','mosquito','dragon','ghost','pumpking'];
	var extra = {
		deathEvent:function(key){
			d.add(sq,'killCount',1);
			if(!d.get(sq,'stoppedSpawning'))
				return;
			var left = d.get(sq,'maxKillCount') - d.get(sq,'killCount');
			if(left <= 0){
				d.complete(sq,'q1');
				return;
			}
			if(left < 5)
				d.message(sq,left + ' monster' + (left < 2 ? '' : 's') + ' left.');
		}					
	}
	var spawn = function(){
		d.add(sq,'maxKillCount',1);
		d.spawnActor(sq,spots.$random(),models.$random(),extra)
	}
	d.setInterval(sq,'spawning',function(){
		var amount = 0;
		var r = Math.random();
		if(r < 0.50)
			amount = 1;
		if(r < 0.10)
			amount = 2;
		if(r < 0.03)
			amount = 3;
		for(var i = 0 ; i < amount; i++)
			spawn();
	},25*3);
	d.setTimeout(sq,'finish',function(){
		d.set(sq,'stoppedSpawning',true);
		d.clearInterval(sq,'spawning');						
	},25*60);
	
	for(var i = 0 ; i < 3; i++)
		spawn();
});
s.newEvent('wTinyHills_collect',function(key){ //
	var sq = s.getSideQuest(key,'wTinyHills_collect');
	if(d.get(sq,'started'))
		return; //double
	d.set(sq,'started',true);
	
	var spots = ['ta','tb','tc','td','tt'];
	
	var spawn = function(i){
		var visible = true;
	
		var eid = d.spawnActor(sq,spots[i],'fakeDrop',{
			alwaysActive:true,	//setTimeout invisible only works if active
			onclick:s.newNpc.onclick(
				s.newNpc.onclick.side('Pick',function(key){
					visible = false;
					s.setTimeout(eid,function(){
						visible = true;
					},25*10);
					
					s.addItem(key,'wTinyHills_collect_' + i);
					s.message(key,'You picked the item.',true);
				;}),
				null,
				null,
				null
			),
			viewedIf:function(key){
				return !d.isComplete(sq) && visible;		
			;}
		});
	}
	for(var i = 0 ; i < 5; i++)
		spawn(i);
});
s.newEvent('wStraightPath_trap',function(key){ //
	var sq = s.getSideQuest(key,'wStraightPath_trap');
	
	if(d.get(sq,'talkedTo'))
		return; //double
		
	d.set(sq,'talkedTo',true);
	
	var girl = s.getRandomNpc(key,'QfirstTown-wStraightPath',{girl:true});
	
	s.setAttr(girl,'maxSpd',6);
	s.setAttr(girl,'acc',3);
	s.moveTo(girl,'QfirstTown-wStraightPath','ta',function(){
		s.moveTo(girl,'QfirstTown-wStraightPath','tb',function(){
			d.set(sq,'reachedPosition',true);
			s.setAttr(girl,'move',false);
		});
	});
});
s.newEvent('wStraightPath_trap_transform',function(key){ //
	if(!s.isAtSpot(key,'QfirstTown-wStraightPath','qa'))
		s.teleport(key,'QfirstTown-wStraightPath','tb','main');
	
	var sq = s.getSideQuest(key,'wStraightPath_trap');
	var girl = s.getRandomNpc(key,'QfirstTown-wStraightPath',{girl:true});
	
	if(!girl)
		return; //prevent double
	
	s.killActor(girl);
	
	d.spawnActor(sq,'tb','ghost',{
		sprite:s.newNpc.sprite('villagerFemale-0',1.5),
		globalDmg:1,
		globalDef:15,
		hpRegen:0,
		preventStagger:true,
		atkSpd:3,
		deathEvent:function(){
			d.complete(sq,'q1');
			m.forEachActor(sq.spot,1,function(key){	//remove block and teleporter
				s.killActor(key);			
			;},'npc',null,{toRemoveWhenKilled:true});
		}
	});
	
	d.spawnBlock(sq,'qb',function(){
		return true;
	},null,{
		tag:{toRemoveWhenKilled:true},
	});
	
	d.spawnTeleporter(sq,'ta',function(key){
		s.teleport(key,'QfirstTown-wStraightPath','tb','main');
	},'zone',{
		tag:{toRemoveWhenKilled:true},
		angle:s.newNpc.angle('left'),
	});
});
s.newEvent('wLake_race',function(key){ //
	var sq = s.getSideQuest(key,'wLake_race');
	if(d.get(sq,'raceStarted'))
		return;	//if multi ppl talk and start same time
	
	var spots = ['e1',/*'e2','e3',*/'e4','e5','e6','e7','e8','ea','eb','ec','ed','ee','ef','eg'];
	var model = ['snake','goblin-range','mosquito','ghost','eyeball','bat','bee'];
	
	for(var i = 0 ; i < spots.length; i++){
		d.spawnActor(sq,spots[i],model.$random(),{
			tag:{monster:true},
			globalDmg:0.65,
		});
	}
	
	d.set(sq,'raceStarted',true);
	var eid = s.getRandomNpc(key,'QfirstTown-wLake',{racer:true});
	s.enableMove(eid,true);
	
	s.followPath(eid,'QfirstTown-wLake','wLake_blue',function(eid){
		//race over
		d.set(sq,'raceOver',true);
		s.enableMove(eid,false);
	
		//remove all monsters
		s.forEachActor(eid,'QfirstTown-wLake',function(key){
			s.setAttr(key,'killRewardMod',0); //other killActor would give exp
			s.killActor(key,true);
		;},'npc',null,{monster:true});
			
		//auto start dialogue
		if(d.get(sq,'switchActivated')){	//aka success
			s.forEachActor(eid,'QfirstTown-wLake',function(key){
				if(s.getDistance(key,eid) < 200)
					s.startDialogue(key,'wLake_race_racer','win');
			;},'player');
			d.complete(sq,'q1');
		} else {
			s.forEachActor(eid,'QfirstTown-wLake',function(key){
				if(s.getDistance(key,eid) < 200)
					s.startDialogue(key,'wLake_race_racer','lose');
			;},'player');
			d.fail(sq);	
		}
							
	});
});
s.newEvent('wEntrance_kill',function(key){ //
	var sq = s.getSideQuest(key,'wEntrance_kill');
	
	if(d.get(sq,'started'))
		return; //double
		
	d.set(sq,'started',true);
	
	var spots = ['e1','e2','e3','e4','e5'];
	for(var i = 0 ; i < spots.length; i++){
		d.spawnActor(sq,spots[i],'snake',{
			hp:5000,
			sprite:s.newNpc.sprite('snake',2),
			globalDmg:1.2,
			deathEvent:function(key){
				d.add(sq,'killCount',1);
				var left = 5 - d.get(sq,'killCount');
				if(left === 0)
					d.message(sq,'All the snakes have been killed. Go talk with Brooken for your reward.',true);
				else
					d.message(sq,left + ' snake' + (left > 1 ? 's' : '') + ' left.',true);
			}
		});
	}
});
s.newEvent('wSplit_switch_shake',function(key){ //
	var sq = s.getSideQuest(key,'wSplit_switch');
	
	if(d.get(sq,'startShaking'))
		return; //double
	d.set(sq,'startShaking',true);
	s.shakeScreen(key,'shake',25*2,75,5);
});
s.newEvent('wSplit_switch_spawn',function(key){ //
	var sq = s.getSideQuest(key,'wSplit_switch');
	
	if(d.get(sq,'started'))
		return; //double
	d.set(sq,'started',true);
	
	var switches = ['qi','qj','qk','ql','qm'];
	var enemy = ['e1','e2','e3','e4','e5'];
	var model = ['goblin-range','goblin-melee','dragon','snake','mushroom','werewolf'];
	
	//enemy
	for(var i = 0 ; i < enemy.length; i++)
		for(var j = 0 ; j < 3; j++)
			d.spawnActor(sq,enemy[i],model.$random(),{
				maxSpd:s.newNpc.maxSpd(0.25),
				tag:{monster:true},
			});
				
	
	var helper = function(i){
		var activated = false;
		d.spawnToggle(sq,switches[i],function(key,eid){
			return !activated;
		},function(key){
			var good = true;
			m.forEachActor(sq.spot,1,function(key){
				if(!good)
					return;
				if(s.isAtSpot(key,'QfirstTown-wSplit',switches[i],400))
					good = false;			
			;},'npc',null,{monster:true});
			if(!good){
				s.message(key,'This switch can only be activated if no monsters are around.',true);
				return false;
			}
			activated = true;
			d.add(sq,'switchActivatedCount',1);
			var left = 5 - d.get(sq,'switchActivatedCount');
			
			if(left === 0){
				s.removeScreenEffect(key,'shake');
				d.set(sq,'startShaking',false);
				d.message(sq,'All the switches have been activated. Go talk with Cryw for your reward.',true);
			} else
				d.message(sq,left + ' switch' + (left > 1 ? 'es' : '') + ' left.',true);
			
			return false;	
		});
	}
	
	for(var i = 0 ; i < switches.length; i++)
		helper(i);
});
s.newEvent('wBump_quiz_spawn',function(key){ //
	var sq = s.getSideQuest(key,'wBump_quiz');
	
	var ghost = 1 + Math.floor(Math.random()*4);	//1-4
	var eyeball = 1 + Math.floor(Math.random()*4);	//1-4
	var skeleton = 1 + Math.floor(Math.random()*4);	//1-4
	
	if(d.get(sq,'started'))
		return; //double
	
	d.set(sq,'started',true);
	
	var q = d.get(sq,'questionNum');
	if(q === 0)
		d.set(sq,'rightAnswer',ghost);
	else if(q === 1)
		d.set(sq,'rightAnswer',eyeball);
	else if(q === 2)
		d.set(sq,'rightAnswer',skeleton);
	else
		return ERROR(3,'invalid questionNum',q);
		
	var spots = ['e1','e2','e3'];
	var extra = {
		v:100,
		hp:2000,
		maxSpd:s.newNpc.maxSpd(0.5),
		globalDmg:0.5,
		tag:{monster:true}
	};
	
	for(var i = 0 ; i < ghost; i++)	
		s.setSprite(d.spawnActor(sq,spots.$random(),'ghost',extra),'ghost',0.5);
		
	for(var i = 0 ; i < eyeball; i++)	
		s.setSprite(d.spawnActor(sq,spots.$random(),'eyeball',extra),'eyeball',0.5);
		
	for(var i = 0 ; i < skeleton; i++)	
		s.setSprite(d.spawnActor(sq,spots.$random(),'skeleton',extra),'skeleton',0.5);
});
s.newEvent('wBump_quiz_answer',function(key,answer){ //
	var sq = s.getSideQuest(key,'wBump_quiz');
	
	if(d.get(sq,'answered'))
		return s.message(key,'Another player already answered the question.',true);
	
	d.set(sq,'answered',true);
	
	if(d.get(sq,'rightAnswer') === answer){
		d.complete(sq,'q1');
		return s.startDialogue(key,'wBump_quiz_npc','win');
	} else {
		d.fail(sq);
		return s.startDialogue(key,'wBump_quiz_npc','lose');
	}
});
s.newEvent('wBump_quiz_a1',function(key){ //
	s.callEvent('wBump_quiz_answer',key,1);
});
s.newEvent('wBump_quiz_a2',function(key){ //
	s.callEvent('wBump_quiz_answer',key,2);
});
s.newEvent('wBump_quiz_a3',function(key){ //
	s.callEvent('wBump_quiz_answer',key,3);
});
s.newEvent('wBump_quiz_a4',function(key){ //
	s.callEvent('wBump_quiz_answer',key,4);
});
s.newEvent('wSnake_totem_spawn',function(key){ //
	var sq = s.getSideQuest(key,'wSnake_totem');
	
	if(d.get(sq,'started'))
		return; //double
	
	d.set(sq,'started',true);
	
	var spots = ['e1','e2','e3','e4','e5'];
	var model = ['wSnake_totem0','wSnake_totem1','wSnake_totem2','wSnake_totem0','wSnake_totem1'];
	var extra = {
		deathEvent:function(){
			d.add(sq,'killCount',1);
			var left = 5 - d.get(sq,'killCount');
			
			if(left === 0){
				d.message(sq,'All the totems have been destroyed. Talk with Hex for your reward.',true);
			} else
				d.message(sq,left + ' totem' + (left > 1 ? 's' : '') + ' left.',true);
		}
	}
	for(var i = 0 ; i < 5; i++)
		d.spawnActor(sq,spots[i],model[i],extra);
});
s.newEvent('wHat_totem_start',function(key){ //
	var sq = s.getSideQuest(key,'wHat_totem');
	if(d.get(sq,'started'))
		return; //double
	
	d.set(sq,'started',true);
	d.set(sq,'spawning',true);
	
	//start a loop, spawn monster
	//after 1 minute, totem disppaear, monster disppear, quest complete
	
	var clearActor = function(){
		d.set(sq,'spawning',false);
		m.forEachActor(sq.spot,1,function(key){
			s.killActor(key);
		;},'npc',null,{monster:true});
		m.forEachActor(sq.spot,1,function(key){
			s.killActor(key);
		;},'npc',null,{totem:true});
	}
	var extra = {
		sprite:s.newNpc.sprite('tower-red',1),
		nevermove:true,
		name:'Anti-Glitch Totem',
		hp:5000,
		statusResist:s.newNpc.statusResist(1,1,1,1,1,1),
		tag:{totem:true},
		deathEvent:function(){
			if(d.get(sq,'spawning'))
				d.fail(sq);		
			clearActor();				
		}	
	}
	var totems = ['e1','e2'];
	var totemId = null;
	for(var i = 0 ; i < totems.length; i++){
		totemId = d.spawnActor(sq,totems[i],"npc-playerLike",extra);
	}
	
	s.setTimeout(totemId,function(key){ //success
		if(d.isFailed(sq))
			return;
		d.message(sq,'15 seconds done. 45 to go.',true);
	;},25*15);
	
	s.setTimeout(totemId,function(key){ //success
		if(d.isFailed(sq))
			return;
		d.message(sq,'30 seconds done. 30 to go.',true);
	;},25*30);
	
	s.setTimeout(totemId,function(key){ //success
		if(d.isFailed(sq))
			return;
		d.message(sq,'45 seconds done. 15 to go.',true);
	;},25*45);
	
	s.setTimeout(totemId,function(key){ //success
		if(d.isFailed(sq))
			return;
		d.set(sq,'spawning',false);
		d.message(sq,'Good job. Talk with Verfres for your reward.',true);
		clearActor();	
	;},25*60);
});

s.newItem('wTinyHills_collect_0',"Scroll",'plan-scroll',[    //{
],""); //}
s.newItem('wTinyHills_collect_1',"Ring",'ring-topaz',[    //{
],""); //}
s.newItem('wTinyHills_collect_2',"Cake",'heal-cake',[    //{
],""); //}
s.newItem('wTinyHills_collect_3',"Gem",'orb-upgrade',[    //{
],""); //}
s.newItem('wTinyHills_collect_4',"Clock",'misc-clock',[    //{
],""); //}

s.newAbility('wSnake_totem0','summon',{
},{
	model:s.newAbility.model('eyeball'),
	amount:3,
	maxChild:3,
	time:0
});
s.newAbility('wSnake_totem1','summon',{
},{
		model:s.newAbility.model('smallWorm'),
		amount:3,
		maxChild:3,
		time:0
	
});
s.newAbility('wSnake_totem2','summon',{
},{
		model:s.newAbility.model('plant'),
		amount:3,
		maxChild:3,
		time:0
	
});

s.newDialogue('wBridge_protect_guard','Bibiguhn','villagerMale-4',[ //{ 
	s.newDialogue.node('intro',"Hello. I'm supposed to [[guard that bridge]] and prevent glitched monsters from corrupting the village. However, during the last battle, monsters managed to corrupt my combat and movement systems. I can't fight anymore. Please, slay the monsters for me. I can hear them approaching.",[ 
		s.newDialogue.option("Sure.",'','wBridge_protect'),
		s.newDialogue.option("Nah.")
	]),
	s.newDialogue.node('end',"Thanks a lot! I'll stay here in case more monsters come. Actually, I can't move anymore so I don't really have the choice anyway.",[ 	])
]); //}
s.newDialogue('wTinyHills_collect_npc','Nioube','villagerFemale-1',[ //{ 
	s.newDialogue.node('intro',"Hello. As I was walking in the forest, my inventory glitched out and [[all my items]] were dispersed throughout the map. Could you bring them back to me please? ",[ 
		s.newDialogue.option("Sure.",'','wTinyHills_collect'),
		s.newDialogue.option("No, I'm busy.")
	]),
	s.newDialogue.node('end',"Thank you so much for collecting my items!",[ 	])
]); //}
s.newDialogue('wStraightPath_trap_girl','Equinox','villagerFemale-0',[ //{ 
	s.newDialogue.node('intro',"Hello. Can you [[follow]] me? I've got something to show you.",[ 
		s.newDialogue.option("Sure.",'','wStraightPath_trap'),
		s.newDialogue.option("Nah.")
	]),
	s.newDialogue.node('transform',"Euhm... I am feeling weird...",[ 
		s.newDialogue.option("Are you alright?",'','wStraightPath_trap_transform')
	])
]); //}
s.newDialogue('wLake_race_racer','Pyro','villagerFemale-7',[ //{ 
	s.newDialogue.node('intro',"Hey, do you want to [[race]] around that lake? First to complete a lap and <u>activate the switch</u> wins!",[ 
		s.newDialogue.option("Let's race!",'','wLake_race'),
		s.newDialogue.option("Nah, I'm lazy.")
	]),
	s.newDialogue.node('win',"You're very fast! I can't believe you beat me. Congratz.",[ 	]),
	s.newDialogue.node('lose',"You're fast, but not quite enough. Keep training and maybe one day you will manage to beat me.",[ 	])
]); //}
s.newDialogue('wEntrance_kill_npc','Brooken','villagerMale-7',[ //{ 
	s.newDialogue.node('intro',"Hi. Normally, small [[snakes]] are found in this forest. However, after the Lord Dotex hack, the size properties of the snakes got messed up. They keep growing and growing. Kill them before they become too big to handle.",[ 
		s.newDialogue.option("Okay, I'll kill them.",'','wEntrance_kill'),
		s.newDialogue.option("I got to go.")
	]),
	s.newDialogue.node('done',"Thanks a lot for killing the glitched snakes.",[ 
		s.newDialogue.option("No problem.")
	])
]); //}
s.newDialogue('wSplit_switch_npc','Cryw','villagerMale-8',[ //{ 
	s.newDialogue.node('intro',"Hi. Is your screen shaking right now?",[ 
		s.newDialogue.option("No, why?",'shake','wSplit_switch_shake'),
		s.newDialogue.option("You're insane, I'm out of here.")
	]),
	s.newDialogue.node('shake',"Are you sure?",[ 
		s.newDialogue.option("OMG! It started shaking.",'omg')
	]),
	s.newDialogue.node('omg',"The only way to make it stop is by activating the [[5 switches]] in this map. Beware, they are guarded by monsters.",[ 
		s.newDialogue.option("Okay.",'','wSplit_switch_spawn')
	]),
	s.newDialogue.node('done',"Thanks a lot. You are amazing. My head was starting to hurt after that much shaking.",[ 
		s.newDialogue.option("No problem.")
	])
]); //}
s.newDialogue('wBump_quiz_npc','Erra','villagerFemale-9',[ //{ 
	s.newDialogue.node('intro',"Hello. Do you want to participate in a [[quiz]]?",[ 
		s.newDialogue.option("Sure.",'sure'),
		s.newDialogue.option("Nope.")
	]),
	s.newDialogue.node('sure',"I will spawn a bunch of monsters. After you have killed them all, I will ask you a [[question]] about the monsters you have slain. Are you ready?",[ 
		s.newDialogue.option("I'm ready.",'','wBump_quiz_spawn'),
		s.newDialogue.option("No.")
	]),
	s.newDialogue.node('question0',"How many ghosts were spawned?",[ 
		s.newDialogue.option("One.",'','wBump_quiz_a1'),
		s.newDialogue.option("Two.",'','wBump_quiz_a2'),
		s.newDialogue.option("Three.",'','wBump_quiz_a3'),
		s.newDialogue.option("Four.",'','wBump_quiz_a4')
	]),
	s.newDialogue.node('question1',"How many eyeballs were spawned?",[ 
		s.newDialogue.option("One.",'','wBump_quiz_a1'),
		s.newDialogue.option("Two.",'','wBump_quiz_a2'),
		s.newDialogue.option("Three.",'','wBump_quiz_a3'),
		s.newDialogue.option("Four.",'','wBump_quiz_a4')
	]),
	s.newDialogue.node('question2',"How many skeletons were spawned?",[ 
		s.newDialogue.option("One.",'','wBump_quiz_a1'),
		s.newDialogue.option("Two.",'','wBump_quiz_a2'),
		s.newDialogue.option("Three.",'','wBump_quiz_a3'),
		s.newDialogue.option("Four.",'','wBump_quiz_a4')
	]),
	s.newDialogue.node('win',"Congratulations! You got the right answer! Good job.",[ 
		s.newDialogue.option("Thanks.")
	]),
	s.newDialogue.node('lose',"Unfortunately, this was not the right answer. Better luck next time. ",[ 
		s.newDialogue.option("I'll try harder next time.")
	])
]); //}
s.newDialogue('wSnake_totem_npc','Hex','villagerMale-6',[ //{ 
	s.newDialogue.node('intro',"Hello. Some weird [[totems]] spawned in the map. From what it seems, the totems use a forbidden script that makes them spawn monsters. Please, destroy all the totems before it's too late.",[ 
		s.newDialogue.option("Sure.",'','wSnake_totem_spawn'),
		s.newDialogue.option("No.")
	]),
	s.newDialogue.node('done',"Thanks a lot for destroying the totems. I'll call you if they appear again.",[ 
		s.newDialogue.option("Good.")
	])
]); //}
s.newDialogue('wHat_totem_npc','Verfres','villagerFemale-4',[ //{ 
	s.newDialogue.node('intro',"Hello. I'm currently trying to set a powerful script that would cure all the glitches present in the map. Unfortunately, monsters keep interrupting my ritual. [[Protect]] the two totems I will create while I write down the magic lines of code.",[ 
		s.newDialogue.option("Sure, I'll help.",'','wHat_totem_start'),
		s.newDialogue.option("I'm busy. Bye")
	]),
	s.newDialogue.node('done',"Thank you so much! The map is now glitch-free! It should stay that way as long as Lord Dotex stays away from here.",[ 
		s.newDialogue.option("Great.")
	]),
	s.newDialogue.node('fail',"I was counting on you to protect the totems... Because of you, this place will remain cursed for a while.",[ 	])
]); //}

s.newNpc('wSnake_totem0',{
	name:"Totem",
	hp:7000,
	nevermove:True,
	sprite:s.newNpc.sprite('tower-red',1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('wSnake_totem0',[0.4,0.4,0.4])
	])
});
s.newNpc('wSnake_totem1',{
	name:"Totem",
	hp:7000,
	nevermove:True,
	sprite:s.newNpc.sprite('tower-blue',1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('wSnake_totem1',[0.4,0.4,0.4])
	])
});
s.newNpc('wSnake_totem2',{
	name:"Totem",
	hp:7000,
	nevermove:True,
	sprite:s.newNpc.sprite('tower-yellow',1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('wSnake_totem2',[0.4,0.4,0.4])
	])
});

s.newMapAddon('QfirstTown-wSWHill',{
	load:function(spot){
		d.load('wSWHill_cure',spot.n1,{
			started:false,
			killCount:0,
		},function(sq){
			if(d.get(sq,'killCount') < 5)
				return 'Destroy the 5 glitched trees.';
			return 'Talk with the Tree.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Special Tree",
				minimapIcon:'worldMap-sideQuest',
				nevermove:true,
				block:s.newNpc.block(s.newNpc.block.size(6,5),true),
				sprite:s.newNpc.sprite('tree-red',1.5),
				dialogue:function(key){
					if(d.isComplete(sq))
						return s.message(key,'The tree has been cured.',true);
					if(d.get(sq,'killCount') >= 5){
						d.complete(sq,'q1');
						return s.message(key,'The tree has been cured.',true);
					}
					
					s.message(key,'Destroy the 5 glitched small trees in the right order to break the curse.',true);
					
					if(d.get(sq,'started'))
						return;
					
					d.set(sq,'started',true);
					
					var spots = ['e1','e2','e3','e4','e5'];
					spots.$shuffle();
					var deathEvent = function(key,eid){
						d.add(sq,'killCount',1);
						var killCount = d.get(sq,'killCount');
						if(killCount >= 5)
							d.message(sq,'The curse has been broken. Get your reward at the tree.');
						else {
							var tree = m.getRandomNpc(spot,{num:killCount});
							if(tree)
								s.addBoost(tree,'globalDef',0.01);
						}
					;};
					for(var i = 0 ; i < 5; i++){
						d.spawnActor(sq,spots[i],'genericEnemy',{
							sprite:s.newNpc.sprite('tree-red',0.7),
							nevermove:true,
							globalDef:i === 0 ? 1 : 100,
							statusResist:s.newNpc.statusResist(1,1,1,1,1,1),
							deathEvent:deathEvent,
							tag:{num:i}				
						});
					}
					
				;},
			});
			
		});
	}
});
s.newMapAddon('QfirstTown-wBridge',{
	load:function(spot){
		d.load('wBridge_protect',spot.n1,{
			started:false,
			killCount:0,
			maxKillCount:0,
			stoppedSpawning:false,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Bibiguhn.';
			return 'Kill all the monsters.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Bibiguhn",
				minimapIcon:'worldMap-sideQuest',
				nevermove:true,
				angle:s.newNpc.angle('right'),
				sprite:s.newNpc.sprite('villagerMale-4',1),
				dialogue:function(key){
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wBridge_protect_guard','intro');
					if(!d.isComplete(sq))
						return s.message(key,'Kill the monsters until they stop spawning!',true);
					s.startDialogue(key,'wBridge_protect_guard','end');
				;},
			});
			
		});
	}
});
s.newMapAddon('QfirstTown-wTinyHills',{
	load:function(spot){
		d.load('wTinyHills_collect',spot.n1,{
			started:false,
			item0:false,
			item1:false,
			item2:false,
			item3:false,
			item4:false,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Nioube.';
			return 'Bring all 5 items to Nioube.';
		},function(sq){
			var getCount = function(){
				var count = 0;
				count += +d.get(sq,'item0');
				count += +d.get(sq,'item1');
				count += +d.get(sq,'item2');
				count += +d.get(sq,'item3');
				count += +d.get(sq,'item4');
				return count;
			}
		
			d.spawnActor(sq,'n1','npc',{
				name:"Nioube",
				minimapIcon:'worldMap-sideQuest',
				sprite:s.newNpc.sprite('villagerFemale-1',1),
				dialogue:function(key){
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wTinyHills_collect_npc','intro');
					if(d.isComplete(sq))
						return s.startDialogue(key,'wTinyHills_collect_npc','end');
					
					var bool = false;
					if(s.haveItem(key,'wTinyHills_collect_0')){
						s.removeItem(key,'wTinyHills_collect_0',10000);
						bool = true;
						d.set(sq,'item0',true);
					}
					if(s.haveItem(key,'wTinyHills_collect_1')){
						s.removeItem(key,'wTinyHills_collect_1',10000);
						bool = true;
						d.set(sq,'item1',true);
					}
					
					if(s.haveItem(key,'wTinyHills_collect_2')){
						s.removeItem(key,'wTinyHills_collect_2',10000);
						bool = true;
						d.set(sq,'item2',true);
					}
					if(s.haveItem(key,'wTinyHills_collect_3')){
						s.removeItem(key,'wTinyHills_collect_3',10000);
						bool = true;
						d.set(sq,'item3',true);
					}
					if(s.haveItem(key,'wTinyHills_collect_4')){
						s.removeItem(key,'wTinyHills_collect_4',10000);
						bool = true;
						d.set(sq,'item4',true);
					}
					var left = 5 - getCount();
						
					if(bool){
						d.addContributor(sq,key);
						if(left === 0){
							d.forEachContributor(sq,function(key2){
								s.removeItem(key2,'wTinyHills_collect_0',10000);
								s.removeItem(key2,'wTinyHills_collect_1',10000);
								s.removeItem(key2,'wTinyHills_collect_2',10000);
								s.removeItem(key2,'wTinyHills_collect_3',10000);
								s.removeItem(key2,'wTinyHills_collect_4',10000);
								if(key2 !== key)
									d.message(key,'Talk with Nioube for your reward.');
							});	
							d.complete(sq,'q1');
							s.startDialogue(key,'wTinyHills_collect_npc','end');
						} else
							d.message(sq,left + ' item' + (left > 1 ? 's' : '') + ' left.',true);
						return;
					}
					return s.message(key,'Bring back Nioube\'s items. ' + left + ' left.',true);
					
					
				;},
			});
			
		});
	}
});
s.newMapAddon('QfirstTown-wStraightPath',{
	load:function(spot){
		d.load('wStraightPath_trap',spot.n1,{
			talkedTo:false,
			reachedPosition:false,
		},function(sq){
			if(!d.get(sq,'talkedTo'))
				return 'Talk with Equinox.';
			if(!d.get(sq,'reachedPosition'))
				return 'Follow Equinox.';
			return 'Kill Equinox.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Equinox",
				minimapIcon:'worldMap-sideQuest',
				tag:{girl:true},
				sprite:s.newNpc.sprite('villagerFemale-0',1),
				dialogue:function(key){
					if(d.isComplete(sq))
						return;	//shouldnt happen
					
					if(!d.get(sq,'talkedTo'))
						return s.startDialogue(key,'wStraightPath_trap_girl','intro');
					
					if(!d.get(sq,'reachedPosition'))
						return s.message(key,'Follow her.',true);
					
					s.startDialogue(key,'wStraightPath_trap_girl','transform');
					
					
				;},
			});
			
		});
	}
});
s.newMapAddon('QfirstTown-wLake',{
	load:function(spot){
		d.load('wLake_race',spot.n1,{
			reachB1List:{},
			reachB2List:{},
			switchActivated:false,
			raceStarted:false,
			raceOver:false,
		},function(sq){
			if(!d.get(sq,'raceStarted'))
				return 'Talk with Pyro.';
			return 'Race Pyro and activate the switch.';
		},function(sq){
			var eid = d.spawnActor(sq,'n1','npc',{
				name:"Pyro",
				maxSpd:s.newNpc.maxSpd(1),
				alwaysActive:true,
				minimapIcon:'worldMap-sideQuest',
				tag:{racer:true},
				sprite:s.newNpc.sprite('villagerFemale-7',1),
				dialogue:function(key){
					if(!d.get(sq,'raceStarted'))
						return s.startDialogue(key,'wLake_race_racer','intro');
					
					if(d.isFailed(sq))
						return s.startDialogue(key,'wLake_race_racer','lose');
					
					if(d.isComplete(sq))
						return s.startDialogue(key,'wLake_race_racer','win');
					
					
					//else racing
					s.message(key,'First to the switch wins!',true);
					return false;
				;},
			});
			
			s.enableMove(eid,false);
			
			d.spawnToggle(sq,'qi',function(){
				return !d.get(sq,'switchActivated');
			},function(key){
				if(!d.get(sq,'raceStarted'))
					return s.message(key,"The switch doesn't want to move.") || false;
				if(d.get(sq,'raceOver'))
					return s.message(key,"The race is over.") || false;
				if(!d.get(sq,'reachB2List')[key])
					return s.message(key,"You need to complete a lap before activating the switch.") || false;
				d.set(sq,'switchActivated',true);
				s.message(key,"You won the race!");
				return false;
			});
		},function(sq){
			if(!d.get(sq,'raceStarted') || d.get(sq,'raceOver'))
				return;
			m.forEachActor(spot,25,function(key){
				var qa = d.get(sq,'reachB1List');
				if(qa[key])
					return;
				qa[key] = true;
				d.addContributor(sq,key);
				d.set(sq,'reachB1List',qa);
			;},'player',spot.qa);
			
			m.forEachActor(spot,25,function(key){
				var qa = d.get(sq,'reachB1List');
				if(!qa[key])
					return s.message(key,'You need to do a lap counterclockwise.');
				var qb = d.get(sq,'reachB2List');
				if(qb[key])
					return;
				qb[key] = true;
				d.addContributor(sq,key);	//kinda useless cuz in qa too
				d.set(sq,'reachB2List',qb);
			;},'player',spot.qb);
			
			
		
		});
	}
});
s.newMapAddon('QfirstTown-wEntrance',{
	load:function(spot){
		d.load('wEntrance_kill',spot.n1,{
			started:false,
			killCount:0,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Brooken.';
			if(d.get(sq,'killCount') < 5)
				return 'Kill the 5 giants snakes.';
			return 'Talk with Brooken.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Brooken",
				minimapIcon:'worldMap-sideQuest',
				sprite:s.newNpc.sprite('villagerMale-7',1),
				dialogue:function(key){
					if(d.get(sq,'killCount') >= 5){
						if(!d.isComplete(sq))
							d.complete(sq,'q1');
						s.startDialogue(key,'wEntrance_kill_npc','done');
						return;
					}
						
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wEntrance_kill_npc','intro');
					
					return s.message(key,'Go kill the 5 giant glitched snakes.',true);
				;},
			});
		});
	}
});
s.newMapAddon('QfirstTown-wSplit',{
	load:function(spot){
		d.load('wSplit_switch',spot.n1,{
			started:false,
			startShaking:false,
			switchActivatedCount:0,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Cryw.';
			if(d.get(sq,'switchActivatedCount') < 5)
				return 'Activate the 5 switches.';
			return 'Talk with Cryw.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Cryw",
				minimapIcon:'worldMap-sideQuest',
				sprite:s.newNpc.sprite('villagerMale-8',1),
				dialogue:function(key){
					if(d.get(sq,'switchActivatedCount') >= 5){
						if(!d.isComplete(sq))
							d.complete(sq,'q1');
						s.startDialogue(key,'wSplit_switch_npc','done');
						return;
					}
					
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wSplit_switch_npc','intro');
					
					return s.message(key,'Activate the 5 switches to make the screen stop shaking.',true);
				;},
			});
		},function(sq){
			if(d.get(sq,'startShaking') && d.get(sq,'switchActivatedCount') !== 3)
				m.forEachActor(spot.e3,25*10,function(key){
					s.shakeScreen(key,'shake',25*2,75,5);
				;},'player');
		});
	}
});
s.newMapAddon('QfirstTown-wBump',{
	load:function(spot){
		d.load('wBump_quiz',spot.n1,{
			started:false,
			answered:false,
			questionNum:0,
			rightAnswer:2,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Erra.';
			if(m.getRandomNpc(spot,{monster:true}))
				return 'Kill all the monsters.';
			return 'Talk with Erra.';
		},function(sq){
			d.set(sq,'questionNum',Math.floor(Math.random()*3));
		
			//0: how many ghost     1-2-3-4
			//1: how many eyeball	1-2-3-4
			//2: how many skeleton  1-2-3-4
			
			d.spawnActor(sq,'n1','npc',{
				name:"Erra",
				minimapIcon:'worldMap-sideQuest',
				sprite:s.newNpc.sprite('villagerFemale-9',1),
				dialogue:function(key){
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wBump_quiz_npc','intro');
					
					var eid = m.getRandomNpc(spot,{monster:true});
					if(eid)	//aka monster still alive
						return s.message(key,'Kill all the monsters then talk with Erra again.',true);
					
					if(!d.get(sq,'answered'))
						return s.startDialogue(key,'wBump_quiz_npc','question' + d.get(sq,'questionNum'));
					
					if(d.isFailed(sq))
						return s.startDialogue(key,'wBump_quiz_npc','lose');
					if(d.isComplete(sq))
						return s.startDialogue(key,'wBump_quiz_npc','win');
					
				;},
			});
		});
	}
});
s.newMapAddon('QfirstTown-wSnake',{
	load:function(spot){
		d.load('wSnake_totem',spot.n1,{
			started:false,
			killCount:0,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Hex.';
			if(d.get(sq,'killCount') < 5)
				return 'Destroy all 5 totems.';
			return 'Talk with Hex.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Hex",
				minimapIcon:'worldMap-sideQuest',
				sprite:s.newNpc.sprite('villagerMale-6',1),
				dialogue:function(key){
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wSnake_totem_npc','intro');
					
					if(d.get(sq,'killCount') < 5)
						return s.message(key,'Destroy all the totems in the map.',true);
					
					if(!d.isComplete(sq))
						d.complete(sq,'q1');
					
					return s.startDialogue(key,'wSnake_totem_npc','done');			
				;},
			});
		});
	}
});
s.newMapAddon('QfirstTown-wHat',{
	load:function(spot){
		var spots = ['e3','e4','e5','e6','e7','e8'];
		var model = ['plant','bee','bat','mosquito','spirit'];
		
		d.load('wHat_totem',spot.n1,{
			started:false,
			spawning:false,
		},function(sq){
			if(!d.get(sq,'started'))
				return 'Talk with Verfres.';
			if(d.get(sq,'spawning'))
				return 'Protect the totems.';
			return 'Talk with Verfres.';
		},function(sq){
			d.spawnActor(sq,'n1','npc',{
				name:"Verfres",
				minimapIcon:'worldMap-sideQuest',
				sprite:s.newNpc.sprite('villagerFemale-4',1),
				dialogue:function(key){
					if(!d.get(sq,'started'))
						return s.startDialogue(key,'wHat_totem_npc','intro');
					if(d.get(sq,'spawning'))
						return s.message(key,'Protect the totems for 1 minute.',true);
						
					if(d.isFailed(sq))
						return s.startDialogue(key,'wHat_totem_npc','fail');
						
					if(!d.isComplete(sq))	//if started=true, spawning=false and not failed
						d.complete(sq,'q1');
								
					return s.startDialogue(key,'wHat_totem_npc','done');			
				;},
			});
		},function(sq){
			if(!d.get(sq,'spawning') || !m.testInterval(35))
				return;
				
			var amount = Math.random() < 0.12 ? 3 : 1;
			
			for(var i = 0 ; i < amount; i++)
				d.spawnActor(sq,spots.$random(),model.$random(),{
					tag:{monster:true},
					killRewardMod:0.2,
					hp:350,
					globalDmg:0.5,
				});
		});
	}
});

s.newPath('wLake_blue',s.newPath.compileSpotList('QfirstTown-wLake',s.newPath.spotList([s.newPath.spotChain('blue',0,8)])));

s.newSideQuest('wBridge_protect','Protect West Bridge');
s.newSideQuest('wSWHill_cure','Cure Tree');
s.newSideQuest('wTinyHills_collect','Glitched Inventory');
s.newSideQuest('wStraightPath_trap','Le Piege');
s.newSideQuest('wLake_race','Race Around the Lake');
s.newSideQuest('wEntrance_kill','Giant Snakes');
s.newSideQuest('wSplit_switch','Shaking Screen');
s.newSideQuest('wBump_quiz','Quiz');
s.newSideQuest('wSnake_totem','Summoner Totems');
s.newSideQuest('wHat_totem','Protect Totems');

s.exports(exports);
