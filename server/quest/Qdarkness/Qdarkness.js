//01/13/2015 2:54 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

//'use strict';
var s = loadAPI('v1.0','Qdarkness',{
	name:"Darkness",
	author:"rc",
	maxPartySize:8,
	recommendedPartySize:4,
	thumbnail:true,
	category:["Combat"],
	reward:{monster:0,score:1.2,completion:1.2},
	zone:"QfirstTown-north",
	party:"Coop",
	description:"Retrieve a precious object lost in a mysterious cave haunted by ghosts.",
});
var m = s.map; var b = s.boss;

/* COMMENT:
"Talk with Bimmy in the 2 story house. he needs rings from cave";
need lantern to enter cave
"Talk with Drof in house west.";
"Kill the bat in Drof's well.";
"Talk with Drof to get lantern.";
"Go South of Town and enter cave in middle.";
"Use traps to kill all ghosts.";
"Give the ring to Bimmy.";
*/

s.newVariable({
	deathCount:0,
	bossAmount:1,
	talkBimmy:False,
	talkDrof:False,
	killBatBoss:0,
	gotLantern:False,
	killGhost:0,
	lootChest:False,
	enterCave:False,
	lastTg:-1,
	chalStrike:False,
	tgCount:0
});

s.newHighscore('tgCount',"Trapper","Least amount of traps activated to kill the ghosts.",'ascending',function(key){
	return s.get(key,'tgCount');
});

s.newChallenge('strike',"Strike","Kill at least 6 ghosts at once.",function(key){
	return s.get(key,'chalStrike');	 //check tgOn
});
s.newChallenge('survivor',"Survivor","Complete the quest without dying.",function(key){
	return s.get(key,'deathCount') < 1;
});
s.newChallenge('x2boss',"Double Trouble","Fight 2 Bat bosses at once.",function(key){
	return true;
});

s.newEvent('_start',function(key){ //
	if(s.isChallengeActive(key,'x2boss'))
		s.set(key,'bossAmount',2);
	if(s.isAtSpot(key,'QfirstTown-high','n1',200))
		s.callEvent('talkBimmy',key);
	else s.addStartQuestMarker(key);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'talkBimmy')) return "Talk with Bimmy.";
	if(!s.get(key,'talkDrof')) return "Talk with Drof.";
	if(s.get(key,'killBatBoss') < s.get(key,'bossAmount')) return "Kill the bats in Drof's well.";
	if(!s.get(key,'gotLantern')) return "Talk with Drof to get lantern.";
	if(!s.get(key,'enterCave')) return "Cave on east side of Northern Mountains, north of town.";
	if(!s.get(key,'lootChest')) return "Activate switches to kill nearby ghosts. Alternate between them.";
	return "Give the ring to Bimmy.";
});
s.newEvent('seeTeleCaveTown',function(key){ //
	return s.get(key,'killBatBoss') >= s.get(key,'bossAmount');
});
s.newEvent('talkBimmy',function(key){ //
	s.removeStartQuestMarker(key);
	if(s.get(key,'lootChest')) return s.startDialogue(key,'bimmy','ringdone');
	if(!s.get(key,'talkBimmy')) return s.startDialogue(key,'bimmy','first');
	s.startDialogue(key,'bimmy','second');
	
	
});
s.newEvent('doneTalkBimmy',function(key){ //
	s.set(key,'talkBimmy',true);
	s.addQuestMarker(key,'drof','QfirstTown-nwLong','n1');
});
s.newEvent('finishQuest',function(key){ //
	s.completeQuest(key);
});
s.newEvent('_death',function(key){ //
	if(!s.get(key,'talkBimmy'))
		return;
	s.add(key,'deathCount',1);
});
s.newEvent('talkDrof',function(key){ //
	if(!s.get(key,'talkBimmy')) return s.startDialogue(key,'drof','tooearly');
	if(!s.get(key,'talkDrof')) return s.startDialogue(key,'drof','first');
	if(s.get(key,'killBatBoss') < s.get(key,'bossAmount')) return s.startDialogue(key,'drof','second');
	if(!s.get(key,'gotLantern')) return s.startDialogue(key,'drof','killbat');
	s.startDialogue(key,'drof','gotLantern');
});
s.newEvent('doneTalkDrof',function(key){ //
	s.set(key,'talkDrof',true);
	s.removeQuestMarker(key,'drof');
	s.addQuestMarker(key,'well','QfirstTown-main','t1');
});
s.newEvent('teleTownWell',function(key){ //enter well
	if(!s.get(key,'talkDrof')) 
		return s.message(key,'You have no reason to go down here.');
	s.teleport(key,'well','t1','party',true);
	s.setRespawn(key,'QfirstTown-main','t2','main',true);	//incase die inside
	s.removeQuestMarker(key,'well');
	
	var amount = s.get(key,'bossAmount');
	for(var i = 0; i < amount; i++)
		s.spawnActor(key,'well','e1','bigbat',{deathEvent:'killBatBoss'});
});
s.newEvent('teleWellTown',function(key){ //leave well
	s.teleport(key,'QfirstTown-main','t2','main',false);
});
s.newEvent('killBatBoss',function(key){ //
	s.add(key,'killBatBoss',1);
});
s.newEvent('gotLantern',function(key){ //
	s.addItem(key,'lantern');
	s.set(key,'gotLantern',true);
	s.addQuestMarker(key,'cave','QfirstTown-north','a');
});
s.newEvent('teleSouthCave',function(key){ //enter cave
	if(!s.haveItem(key,'lantern')) //prevent from entering if no lantern
		return s.message(key,'The cave is too dark. You would need a lantern before heading in.');
	s.message(key,'You can not attack while holding the lantern. Activate switches to kill the ghosts.',true);
	s.teleport(key,'ghost','t1','party',true);
	s.setRespawn(key,'QfirstTown-north','a','main',true);	//incase die inside
	s.set(key,'enterCave',true);
});
s.newEvent('teleCaveSouth',function(key){ //leave cave
	s.set(key,'killGhost',0);
	s.teleport(key,'QfirstTown-north','a','main',false);
});
s.newEvent('viewBlock',function(key){ //prevent player to reach chest until all ghost dead
	return s.get(key,'killGhost') < 8;
});
s.newEvent('viewChest',function(key){ //
	return !s.get(key,'lootChest');
});
s.newEvent('lootChest',function(key){ //
	if(s.callEvent('viewBlock',key)) 
		return s.ERROR(4,'not supposed to be able to loot chest if block there');	//prevent glitch
	s.addItem(key,'ring');
	s.set(key,'lootChest',true);	
	s.message(key,'Congratz! Now bring the ring back to Bimmy.');
	s.removeQuestMarker(key,'cave');
	s.addQuestMarker(key,'house','QfirstTown-high','n1');
});
s.newEvent('tgOn',function(key,num){ //activating switch
	s.add(key,'tgCount',1);		//for highscore
	s.set(key,'lastTg',num);	//prevent player from activating same switch over and over, check viewTg
	
	var spot = [null,'qi','qj','qk','ql'][num] || ERROR(3,'invalid spot',num);
	
	s.addAnim(key,'ghost',spot,'lightningBomb',1.5);	//explosion on top of switch
	
	var count = 0;
	s.forEachActor(key,'ghost',function(key2){	//for every ghost in trap zone,
		if(!s.isAtSpot(key2,'ghost',spot,300))
			return;
		count++;
		if(count === 6){
			s.set(key,'chalStrike',true);
			s.message(key,'Strike Challenge completed!');
		}
		s.killActor(key2);	//kill ghost
		s.add(key,'killGhost',1);	//increase killcount
	},'npc',null,{ghost:true});	//cant use atSpot cuz need range of 300
	
	if(s.get(key,'killGhost') >= 8)				//if all dead, see normally
		s.message(key,'You killed all the ghosts. You can now access the chest.',true);
});
s.newEvent('tgOff',function(key){ //
	s.message(key,'You can\'t activate the same switch two times in a row.');
	return false;
});
s.newEvent('viewTg',function(key,num){ //if last switch activated is this one, cant use
	return s.get(key,'lastTg') !== num;
});

s.newItem('lantern',"Lantern",'status-burn',[    //{
],''); //}
s.newItem('ring',"Ring",'ring-topaz',[    //{
],''); //}

s.newAbility('bigbat0','attack',{
	name:"Scratch",
	icon:'attackMelee-scar',
	delay:10
},{
	type:'strike',
	dmg:s.newAbility.dmg(150,'melee'),
	hitAnim:s.newAbility.anim('cursePink',0.5),
	leech:s.newAbility.status(0.25,1,1),
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim('scratch',0.5)
});
s.newAbility('bigbat1','attack',{
	name:"Lightning Bullet",
	icon:'attackMagic-static'
},{
	type:'bullet',
	amount:5,
	angleRange:30,
	dmg:s.newAbility.dmg(150,'lightning'),
	hitAnim:s.newAbility.anim('lightningHit',0.5),
	sprite:s.newAbility.sprite('lightningball',1)
});
s.newAbility('lightning','attack',{
},{
	type:'bullet',
	amount:16,
	angleRange:360,
	dmg:s.newAbility.dmg(25,'lightning'),
	spd:s.newAbility.spd(4),
	sprite:s.newAbility.sprite('lightningball',1)
});
s.newAbility('curse','attack',{
},{
	type:'strike',
	dmg:s.newAbility.dmg(150,'cold'),
	hitAnim:s.newAbility.anim('bind',0.25),
	chill:s.newAbility.status(1,1,1),
	curse:s.newAbility.curse(0.25,[s.newBoost('globalDef',0.5,250)]),
	initPosition:s.newAbility.initPosition(0,100),
	delay:10,
	width:25,
	height:25,
	preDelayAnim:s.newAbility.anim('bind',1)
});
s.newAbility('bat','summon',{
},{
	model:s.newAbility.model('bat'),
	amount:1,
	maxChild:8,
	time:0,	
});

s.newDialogue('bimmy','Bimmy','villagerMale-5',[ //{ 
	s.newDialogue.node('ringdone',"OMG! You found my ring! Thanks a lot.",[ 
		s.newDialogue.option("No problem.",'','finishQuest')
	],''),
	s.newDialogue.node('first',"Hello. Can you help me?",[ 
		s.newDialogue.option("Okay.",'okay',''),
		s.newDialogue.option("No.",'','')
	],''),
	s.newDialogue.node('okay',"Lord Dotex glitched my inventory. My [[precious ring]] got teleported into a cave. Could you go get it back for me?",[ 
		s.newDialogue.option("Sure. Where is the cave?",'where','')
	],''),
	s.newDialogue.node('where',"The cave is in the mountains, [[north of town]]. However, there's a little problem with that cave...",[ 
		s.newDialogue.option("What is it?",'what','')
	],''),
	s.newDialogue.node('what',"The cave is haunted by [[ghosts]] and it's really dark inside. You will definitely need a [[lantern]] if you want to go inside.",[ 
		s.newDialogue.option("Where can I find a lantern?",'lantern','')
	],''),
	s.newDialogue.node('lantern',"Go in the building [[north west of the town]] and talk with the guy there. He's a good friend of mine.",[ 
		s.newDialogue.option("Okay great!",'','doneTalkBimmy')
	],''),
	s.newDialogue.node('second',"Go talk with the guy in the house [[north west of the town]]. He will give you a [[lantern]].",[ 	],''),
]); //}
s.newDialogue('drof','Drof','villagerMale-3',[ //{ 
	s.newDialogue.node('tooearly',"Hey, you should go see my friend Bimmy. He lives in the 2 story house.",[ 	],''),
	s.newDialogue.node('first',"Hey, what do you want?",[ 
		s.newDialogue.option("A lantern!",'lantern',''),
		s.newDialogue.option("Nothing...",'','')
	],''),
	s.newDialogue.node('lantern',"Oh, sorry I can't give you my [[lantern]] because there are bats in my well.",[ 
		s.newDialogue.option("Okay? Kinda weird but whatever.",'','doneTalkDrof')
	],''),
	s.newDialogue.node('second',"If you want my [[lantern]], go kill all the bats in my [[well right outside of my house]].",[ 	],''),
	s.newDialogue.node('killbat',"Thanks a lot for killing the bats. Take my [[lantern]].",[ ],'gotLantern'),
	s.newDialogue.node('gotLantern',"Thanks again.",[ 	],''),
]); //}

s.newNpc('bigbat',{
	name:"Big Bat",
	hp:3000,
	boss:s.newNpc.boss('bigbat'),
	sprite:s.newNpc.sprite('bat',2),
	moveRange:s.newNpc.moveRange(3.5,3),
	targetSetting:s.newNpc.targetSetting(10,50,90),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('bigbat0',[0.2,0,0]),
		s.newNpc.abilityAi.ability('bigbat1',[0.4,0.4,1]),
		s.newNpc.abilityAi.ability('idle',[0.4,0.4,1])
	])
});

s.newMapAddon('QfirstTown-nwLong',{
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('villagerMale-3'),
			name:'Drof',
			dialogue:'talkDrof'
		});
	}
});
s.newMapAddon('QfirstTown-high',{
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('villagerMale-5'),
			name:'Bimmy',
			dialogue:'talkBimmy',
			minimapIcon:CST.ICON.quest,
		});
		m.setAsStartPoint(spot.n1);
	}
});
s.newMapAddon('QfirstTown-main',{
	load:function(spot){
		m.spawnTeleporter(spot.t1,'teleTownWell','well');
	}
});
s.newMap('well',{
	name:"Drof Well",
	screenEffect:'cave'
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,'teleWellTown','zone',{
			angle:s.newNpc.angle('up'),
			viewedIf:function(key){
				var chal = s.isChallengeActive(key,'x2boss') ? 2 : 1;
				return s.get(key,'killBatBoss') >= chal;
			}
		});
	},
});
s.newMap('ghost',{
	name:"Ghosts Cave",
	screenEffect:'cave'
},{
	load:function(spot){
		var list = ['e1','e2','e3','e4','e5','e6','e7','e8'];
		for(var i = 0 ; i < list.length; i++)
			m.spawnActor(spot[list[i]],'ghost',{
				tag:{ghost:true},
				hp:100000000,	//just incase...
			});			
		m.spawnBlock(spot.qe,'viewBlock','spike');
		m.spawnLoot(spot.q1,'viewChest','lootChest','chest');
		
		m.spawnTeleporter(spot.t1,'teleCaveSouth','zone','down');
		
		//traps, qi switch will trigger b1 trap zone
		var list = [spot.qi,spot.qj,spot.qk,spot.ql];
		var helper = function(i){
			m.spawnToggle(list[i],function(key){ //
				return s.callEvent('viewTg',key,i+1);
			},function(key){ //
				return s.callEvent('tgOn',key,i+1);
			},'tgOff');
		}
		for(var i = 0 ; i < list.length; i++)
			helper(i);
	},
	playerEnter:function(key){
		s.addBoost(key,'hp-regen',3,0,'helper');
		s.enableAttack(key,false); //prevent use of ability (check q.preset.nothing)
	},
	playerLeave:function(key){
		s.removeBoost(key,'helper','hp-regen');
		s.enableAttack(key,true);		//allow ability again
		s.set('killGhost',0);
	}
});
s.newMapAddon('QfirstTown-north',{
	load:function(spot){
		m.spawnTeleporter(spot.a,'teleSouthCave','cave');
	}
});

s.newBoss('bigbat',s.newBoss.variable({}),function(boss){
	s.newBoss.phase(boss,'phase0',{
		loop:function(boss){
			if(b.get(boss,'_framePhase') % 50 === 0 && b.getSummonCount(boss,'bat') < 8)
				b.useAbility(boss,'bat');
		},
		transitionTest:function(boss){
			if(b.get(boss,'_hpRatio') < 0.33) 
				return 'phase1';
		}
	});
	s.newBoss.phase(boss,'phase1',{
		loop:function(boss){
			if(b.get(boss,'_framePhase') % 25 === 0)
				b.useAbility(boss,'curse');
			if(b.get(boss,'_framePhase') % 25 === 0 && b.getSummonCount(boss,'bat') > 0){
				s.addHp(boss,2000);
			}
		},
		transitionIn:function(boss){
			b.useAbility(boss,'lightning');
			s.addBoost(boss,'globalDef',100,25*5);
		},
	});
});

s.exports(exports);
