//06/30/2015 10:01 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QfirstTown',{
	name:"",
	author:"rc",
	description:"",
	maxPartySize:8,
	thumbnail:False,
	admin:true,
	showInTab:false,
	dailyTask:false,
	showWindowComplete:false,
	autoStartQuest:false,
	inMain:false,
	alwaysActive:true,
	completable:false,
	zone:"QfirstTown-main",
	reward:{"monster":0.5}
});
var m = s.map; var b = s.boss; var d = s.sideQuest; var g;

/* COMMENT:
setTimeout BAD
*/

s.newVariable({
});

s.newEvent('zeldo',function(key){ //
	//using s.addQuestMarker.admin so theres no quest popup
	s.addQuestMarker.admin(key,'startQuest','Qminesweeper','QfirstTown-north','t5');
});
s.newEvent('mjolk',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','QtowerDefence','QfirstTown-wSplit','n1');
});
s.newEvent('zehefgee',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','Qbtt000','QfirstTown-east','t6');
});
s.newEvent('gryll',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','QpuzzleBridge','QfirstTown-wLake','n1');
});
s.newEvent('vokeup',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','QlureKill','QfirstTown-north','t7');
});
s.newEvent('vokeup2',function(key){ //
	s.addAnimOnTop(key,'fireBomb2',2);
	for(var i = 0 ; i < 10; i++){
		s.setTimeout(key,function(){
			s.addAnimOnTop(key,'fireBomb2',1.5);
		},5*i);
	}
});
s.newEvent('zezymah',function(key){ //
	s.removeQuestMarker(key,'startQuest');
	s.addQuestMarker.admin(key,'wiseOldMan','QfirstTown','QfirstTown-south','t2');
});
s.newEvent('zezymahSquirrel',function(key){ //
	var array = [];
	for(var i = 0 ; i < 15; i++){
		var eid = s.spawnActorOnTop(key,'main','npc',{
			name:'Squirrel',
			sprite:s.newNpc.sprite('hunt-squirrel',1),
			maxSpd:s.newNpc.maxSpd(2),
		});
		array.push(eid);
	}
	setTimeout(function(){
		for(var i = 0 ; i < array.length; i++){
			if(s.actorExists(array[i]))
				s.killActor(array[i]);
		}	
	},1000*10);
	s.triggerAchievement(key,'onSquirrelSpawn');
});
s.newEvent('benSalvage',function(key){ //
	s.displayQuestion(key,'This will permanently destroy <u>every</u> equip in your inventory<br>and turn them into materials. Continue?',function(){
		s.salvageInventory(key);
	});
});
s.newEvent('wiseOldMan',function(key){ //
	s.setSprite(key,'bee',1);
	s.setTimeout(key,function(key){
		s.setSprite(key,'normal',1);
	;},25*15,'bee');
	s.triggerAchievement(key,'onBeeTransform');
});
s.newEvent('displayQuest',function(key){
	s.openDialog(key,'questList');
});
s.newEvent('talkGenetos',function(key){
	s.startDialogue(key,'genetos','afterTutorial');
});

s.newPreset('inTown',null,null,False,False,True,True);

s.newDialogue('Biglemic','Biglemic','villagerMale-0',[ //{ 
	s.newDialogue.node('intro',"Explore Northern Mountains and Eastern Valley for quests!",[ 	])
]); //}
s.newDialogue('Zeldo','Zeldo','villagerMale-1',[ //{ 
	s.newDialogue.node('intro',"Hello there traveler, you must be tired from all the walking. I wish I knew that feeling... Anyway how can I be of use?",[ 
		s.newDialogue.option("Why can't you walk?",'cantwalk'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"Hello there traveler, you must be tired from all the walking. I wish I knew that feeling... Anyway how can I be of use?",[ 
		s.newDialogue.option("Why can't you walk?",'cantwalk')
	]),
	s.newDialogue.node('cantwalk',"[[Lord Dotex]] messed up my movement script. [[The Creator]] fixed every NPC in the town except me. I probably don't deserve to be fixed...",[ 
		s.newDialogue.option("That is unfair.",'unfair'),
		s.newDialogue.option("Maybe The Creator just forgot.",'forgot'),
		s.newDialogue.option("Have you tried to fix the problem?",'fixproblem')
	]),
	s.newDialogue.node('unfair',"Yeah, I guess. But who am I to judge [[The Creator]]'s decisions. If he thinks I shouldn't walk, then so be it!",[ 
		s.newDialogue.option("Is there anything you can do?",'fixproblem')
	]),
	s.newDialogue.node('fixproblem',"There's nothing much I can do other than pray to [[The Creator]]. Hopefully he will listen to my prayers but I doubt it.",[ 
		s.newDialogue.option("I wish you the best of luck.")
	]),
	s.newDialogue.node('forgot',"I hope you're right. But in the mean time, I'm just stuck here.",[ 	]),
	s.newDialogue.node('quest',"I heard there's a Minesweeper quest if you go north. Do you want me to mark it on your minimap?",[ 
		s.newDialogue.option("Yes.",'','zeldo'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Condsmo','Condsmo','villagerMale-2',[ //{ 
	s.newDialogue.node('intro',"The guy in the 2 story house in the town has lost his ring.",[ 	])
]); //}
s.newDialogue('Klappa','Klappa','villagerMale-8',[ //{ 
	s.newDialogue.node('intro',"Please, talk with me! I'm begging you.",[ 
		s.newDialogue.option("Why?",'useless')
	]),
	s.newDialogue.node('useless',"Because if nobody talks with me, I am going to die.",[ 
		s.newDialogue.option("Why is that?",'useless2')
	]),
	s.newDialogue.node('useless2',"I have nothing interesting to say so not many players take the time to talk with me. I am entirely useless and a waste of time. If The Creator realizes that I'm not needed in the game, He will delete me.",[ 
		s.newDialogue.option("Okay then, let's continue talking.",'useless3'),
		s.newDialogue.option("You deserve to die. I'm leaving.",'no')
	]),
	s.newDialogue.node('useless3',"Thanks you so much! Talk with me as much as you want.<br>(＾0＾)//",[ 
		s.newDialogue.option("Okay.",'useless4')
	]),
	s.newDialogue.node('useless4',"You are amazing! Talk with me as much as you want.<br>(＾0＾)//",[ 
		s.newDialogue.option("Okay.",'useless3')
	]),
	s.newDialogue.node('no',"Noooooooooo!",[
	])
]); //}
s.newDialogue('BEN','BEN D.','villagerMale-4',[ //{ 
	s.newDialogue.node('intro',"Hello, if you want I can salvage all the equips in your inventory.",[ 
		s.newDialogue.option("Okay.",'','benSalvage'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Mjolk','Mjolk','villagerMale-5',[ //{ 
	s.newDialogue.node('intro',"You're disturbing me. I'm praying.",[ 
		s.newDialogue.option("Who are you praying to?",'rng'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"You're disturbing me. I'm praying.",[ 
		s.newDialogue.option("Who are you praying to?",'rng')
	]),
	s.newDialogue.node('rng',"The [[RNG God]] of course, the God of Randomness. You should pray to him too if you want a lucky future.",[ 
		s.newDialogue.option("What can he do?",'rng2')
	]),
	s.newDialogue.node('rng2',"The RNG God is the One who decides how much damage you deal, what attacks enemies use, how powerful your newly-found equipment is and so on.",[ 
		s.newDialogue.option("Have you ever seen him?",'rng3')
	]),
	s.newDialogue.node('rng3',"Not myself. I don't think [[The Creator]] has ever seen Him either. The RNG God lies deep in the program under the alias [[Math.random()]]. It is not meant to be seen by humans eyes. It is written in the programming language C++ and it is compiled.",[ 
		s.newDialogue.option("I'll let you pray.",'rng4')
	]),
	s.newDialogue.node('rng4',"Thanks. May the RNG God be ever in your favor.",[ 	]),
	s.newDialogue.node('quest',"Yes actually. Tower Defence starting point is east of this town. I'll mark it in your minimap. Now leave me alone.",[ 
		s.newDialogue.option("Okay.",'','mjolk'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Esvea','Esvea','villagerMale-6',[ //{ 
	s.newDialogue.node('intro',"If you find any glitches in the game, please tell me! Since Lord Dotex modified the game source, I've already found over 9000 glitches myself.",[ 
		s.newDialogue.option("Tell me a cool glitch you found.",'glitch'),
		s.newDialogue.option("Have you ever made the server crash?",'crash'),
		s.newDialogue.option("What's a glitch?",'what')
	]),
	s.newDialogue.node('glitch',"I once found a glitch that allowed me to duplicate items exploiting a bug in the bank saving process. I reported the issue to The Creator and he granted me any item I wanted.",[ 
		s.newDialogue.option("What did you ask for?",'item'),
		s.newDialogue.option("Anything else?",'crash')
	]),
	s.newDialogue.node('item',"I asked for my beret of course! I look so good with it.",[ 
		s.newDialogue.option("Cool story bro.")
	]),
	s.newDialogue.node('crash',"I managed to crash the server multiple times. I once had a glitched item from a quest that had been removed. Using it would crash the server instantly because the effect no longer existed. Fortunately, this has been fixed as well as most of the critical bugs.",[ 
		s.newDialogue.option("Anything else?",'glitch')
	]),
	s.newDialogue.node('what',"A glitch is a problem in the game code that causes unexpected behaviour.",[ 
		s.newDialogue.option("What glitch have you found?",'glitch')
	])
]); //}
s.newDialogue('Zehefgee','Zehefgee','villagerMale-3',[ //{ 
	s.newDialogue.node('intro',"Hello young one. Do you seek advice from me? I'm the oldest NPC and thus the wisest.",[ 
		s.newDialogue.option("How old are you?",'old'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"Hello young one. Do you seek advice from me? I'm the oldest NPC and thus the wisest.",[ 
		s.newDialogue.option("How old are you?",'old')
	]),
	s.newDialogue.node('old',"I just turned 2 years old. I was the first NPC implemented in the game. Things have changed so much over the years.",[ 
		s.newDialogue.option("What exactly?",'old2')
	]),
	s.newDialogue.node('old2',"Back in the days, I used to be a blue square like every other NPCs. It took many months before a proper sprite system was implemented. I enjoyed been a square though.",[ 
		s.newDialogue.option("How were the players?",'old3')
	]),
	s.newDialogue.node('old3',"This used to be a solo game so there was only 1 player. The player was a red circle with a black line in the middle. Maps were really ugly. I still have nightmares about them. If you want more info, you can check this <a target='_blank' href='http://www.youtube.com/watch?v=wGe4qM8K5rQ'>video</a>.",[ 
		s.newDialogue.option("Okay thanks.")
	]),
	s.newDialogue.node('quest',"I do actually. I challenge you to break my records in Break The Target. I'll mark it on your minimap. ",[ 
		s.newDialogue.option("Okay.",'','zehefgee'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Gryll','Gryll','villagerFemale-0',[ //{ 
	s.newDialogue.node('intro',"Hello there. Did you get the chance to see the magnificent river south-east of the town?",[ 
		s.newDialogue.option("Yeah, what's the big deal about it?",'dream'),
		s.newDialogue.option("Not yet. Why?",'dream'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"Hello there. Did you get the chance to see the magnificent river south-east of the town?",[ 
		s.newDialogue.option("Yeah, what's the big deal about it?",'dream'),
		s.newDialogue.option("Not yet. Why?",'dream')
	]),
	s.newDialogue.node('dream',"My biggest dream is to see that river but I don't think the RNG God will ever let me.",[ 
		s.newDialogue.option("The RNG God?",'dream2')
	]),
	s.newDialogue.node('dream2',"The Random Number Generator God. He controls everything that involves randomness. My movement being random means that he is the one who decides if I walk right or left and therefore, if I'll ever see the river.",[ 
		s.newDialogue.option("What are the odds that you reach the river?",'dream3')
	]),
	s.newDialogue.node('dream3',"Almost inexistant. But I won't give up. But yeah, even if I wanted, I couldn't give up. My script doesn't cover that.",[ 
		s.newDialogue.option("Any way I could help?",'dream4')
	]),
	s.newDialogue.node('dream4',"When you talk with me, I stop moving. Not sure if that's any useful though. Anyway, have a nice day.",[ 	]),
	s.newDialogue.node('quest',"You look like a smart guy. If you're looking for a puzzle challenge, try the quest Puzzle & Bridge. I'll mark it in your minimap.",[ 
		s.newDialogue.option("Okay.",'','gryll'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Vokeup','Vokeup','villagerFemale-1',[ //{ 
	s.newDialogue.node('intro',"Go away! I'm dangerous.",[ 
		s.newDialogue.option("You don't seem dangerous to me?",'danger'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"Go away! I'm dangerous.",[ 
		s.newDialogue.option("You don't seem dangerous to me?",'danger')
	]),
	s.newDialogue.node('danger',"I once caused the end of the world. A random player came and asked for a quest. A glitch in my dialogue script made the entire server crash, killing every living being in the world. Ever since, I've been scared to talk with players.",[ 
		s.newDialogue.option("So far, nothing weird has happened.",'danger3','vokeup2'),
		s.newDialogue.option("I'll keep talking until the server crashes.",'danger2')
	]),
	s.newDialogue.node('danger2',"You are insane! I will not let you do that. No more dialogue options for you. That way you can't continue the conversation. Bye, crazy.",[ 	]),
	s.newDialogue.node('danger3',"I told you! I'm dangerous! Leave now before it's too late!",[ 
		s.newDialogue.option("Okay, right. I'm leaving."),
		s.newDialogue.option("These explosions deal no damage...",'danger4')
	]),
	s.newDialogue.node('danger4',"The problem is not the damage, it's the server crash. How can I make you go away...",[ 
		s.newDialogue.option("Just give me $1,000.000 and I'll leave.",'danger5'),
		s.newDialogue.option("I want a quest.",'quest')
	]),
	s.newDialogue.node('danger5',"-.-",[ 
		s.newDialogue.option("Give me a quest then.",'quest')
	]),
	s.newDialogue.node('quest',"I just came back from the northern mountains. I was not strong enough to kill all the monsters. I'll mark it in your minimap so you can finish the job for me?",[ 
		s.newDialogue.option("Okay.",'','vokeup'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Zezymah','Zezymah','villagerFemale-2',[ //{ 
	s.newDialogue.node('intro',"Can't you see I'm busy [[scripting]]!? Leave me alone.",[ 
		s.newDialogue.option("Tell me more about scripting.",'scripting'),
		s.newDialogue.option("Okay...")
	]),
	s.newDialogue.node('scripting',"Really? Normally people don't care much about [[scripting]]. I'm still an apprentice so I don't much about it but I guess I can teach you the basics. Scripting is the art of writing lines of code that can create [[powerful game-changing effects]].",[ 
		s.newDialogue.option("What are you working on?",'workingon'),
		s.newDialogue.option("Where can I learn scripting?",'learn')
	]),
	s.newDialogue.node('workingon',"I'm trying to spawn squirrels. It's very hard but I think I got it. I can show you if you want.",[ 
		s.newDialogue.option("Sure, go ahead.",'','zezymahSquirrel'),
		s.newDialogue.option("Why squirrels?",'squirrel')
	]),
	s.newDialogue.node('squirrel',"Because they are cute, of course. I could spawn dragons too but I find them ugly.",[ 
		s.newDialogue.option("I want to see dragons!",'learn')
	]),
	s.newDialogue.node('learn',"You should go meet my [[master]] then. He lives in a cave south of the village. He's by far the most powerful scripter of this game, other than The Creator of course. I can mark the cave location on your minimap if you want.",[ 
		s.newDialogue.option("Okay.",'','zezymah'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Beatpistol','Beatpistol','villagerFemale-3',[ //{ 
	s.newDialogue.node('intro',"There's a weird switch on the top of the mountain in the middle of the town. I wonder what it does.",[ 
		s.newDialogue.option("Me too!")
	])
]); //}
s.newDialogue('WiseOldMan','Wise Old Man','villagerMale-3',[ //{ 
	s.newDialogue.node('intro',"Hello. How may the [[Script Master]] help you?",[ 
		s.newDialogue.option("What is a script?",'whatis'),
		s.newDialogue.option("How do you make scripts?",'howto'),
		s.newDialogue.option("What can a script do?",'whatdo')
	]),
	s.newDialogue.node('whatis',"A script is a series of instructions that modifies variables within the game memory. In short, it's a thing that does something when you use it.",[ 
		s.newDialogue.option("How do you make scripts?",'howto'),
		s.newDialogue.option("What can a script do?",'whatdo')
	]),
	s.newDialogue.node('howto',"Making scripts is no easy task. You need to make sure to respect the syntax. A single mistyped character and the server will crash instantly! ",[ 
		s.newDialogue.option("Can you teach me?!",'teach')
	]),
	s.newDialogue.node('teach',"The art of scripting is reserved to Wise Old Men. It took me many years to be where I am. I first started my training with the Quest Creator. I then graduated and gained access to the client script. Eventually I reached the ultimate level of power: access to the eval function.",[ 
		s.newDialogue.option("What is the eval function?",'eval')
	]),
	s.newDialogue.node('whatdo',"A script can do nearly anything. Its power is only limited by what data its creator has access to. For example, even if I wanted, I couldn't delete the database because I don't have access to it. However, I can turn you into a bee if I want because you're within my reach.",[ 
		s.newDialogue.option("I don't believe you.",'dontbelieve','wiseOldMan'),
		s.newDialogue.option("That makes sense.")
	]),
	s.newDialogue.node('dontbelieve',"Oh really. What about now? Never underestimate the power of scripts!",[ 	]),
	s.newDialogue.node('eval',"The eval function is by far the most powerful function of the entire Javascript language. It grants the power to get access any data. If such power falls under the wrong hands, this will lead to the end of the world for sure.",[ 
		s.newDialogue.option("Okay, thanks.")
	])
]); //}


s.newDialogue('genetos','Genetos','villagerMale-5',[ //{ 
	s.newDialogue.node('afterTutorial',"What do you want to know?",[ 
		s.newDialogue.option("What quest can I do?",'','displayQuest'),
		s.newDialogue.option("What do I get from fixing bugs?",'reward2'),
		s.newDialogue.option("What's the point of getting exp?",'pointexp2'),
		s.newDialogue.option("What is a Reputation Point?",'whatrep2')
	]),
	s.newDialogue.node('whatrep2',"Reputation Points can be used to increase a stat via the Reputation Grid. It can be opened at the bottom right of your screen.",[ 	]),
	s.newDialogue.node('pointexp2',"Exp can be used to improve your equipment via the Equip Window. Exp is also used to level-up. You can do so by clicking the Level-Up icon next to your GEM and Exp Count. Everytime you level-up, you get 1 Reputation Point.",[ 	]),
	s.newDialogue.node('reward2',"Every time you complete a quest (by fixing a bug), your Global Exp Modifier (GEM) increases. The higher your GEM is, the more exp you get from killing monsters and harvesting resources. You can see your GEM above your inventory.",[ 	])
]);


s.newMap('main',{
	name:"Town",
	screenEffect:'weather',
	zone:'QfirstTown-main',
	isTown:true
},{
	load:function(spot){
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'east','t7','main');
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'east','t7','main');
		},'zone',null,'east');
		m.spawnTeleporter(spot.t4,function(key){
			s.teleport(key,'south','t1','main');
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'south','t1','main');
		},'zone','down','south');
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'north','t1','main');
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'north','t1','main');
		},'zone','up','north');
		
		m.spawnTeleporter(spot.t7,function(key){
			s.teleport(key,'nwLong','t1','main');
			s.setRespawn(key,'nwLong','t1','main');
		},'door',null,'nwLong');
		m.spawnTeleporter(spot.t8,function(key){ 
			s.teleport(key,'genetosHouse2','t1','main');
			s.setRespawn(key,'genetosHouse2','t1','main');
		},'door',null,'genetosHouse2');
		m.spawnTeleporter(spot.a,function(key){ 
			s.teleport(key,'southWestHouse','t1','main');	
		},'door',{
			minimapIcon:CST.ICON.quest
		},'southWestHouse');
		m.spawnTeleporter(spot.b,function(key){
			s.teleport(key,'high','t1','main');
			s.setRespawn(key,'high','t1','main');
		},'door',{
			minimapIcon:CST.ICON.quest
		},'high');
		m.spawnTeleporter(spot.c,function(key){ 
			s.teleport(key,'northEastHouse','t1','main');
		},'door',{
			minimapIcon:CST.ICON.quest
		},'northEastHouse');
		
		m.spawnTeleporter(spot.t5,function(key){ 
			s.teleport(key,'wEntrance','t1','main');
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wEntrance','t1','main',true);
		},'zone','left','wEntrance');
		
		m.spawnTeleporter(spot.k,function(key){ 
			s.teleport(key,'eastCave','t1','main');
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'eastCave','t1','main');
		},'cave','right','eastCave');
		
		m.spawnWaypoint(spot.q5,'QfirstTown-main',function(key){
			s.teleport(key,'QfirstTown-main','q5','main');
			s.setRespawn(key,'QfirstTown-main','q5','main');
			s.respawnParty(key);
		});
		
		//Misc
		m.spawnBank(spot.f);
		
		m.spawnSkillPlot(spot.C,'Qdarkness','tree-red',0);
		m.spawnSkillPlot(spot.E,'QprotectFirstTown','tree-red',0);
		m.spawnSkillPlot(spot.D,'QbadLuck','tree-red',0);
		m.spawnSkillPlot(spot.A,'QsadTree','tree-red',0);
		
		
		
		
		//Npc
		m.spawnActor(spot.n1,'npc',{
			name:'Biglemic',
			sprite:s.newNpc.sprite('villagerMale-0'),
			dialogue:function(key){ s.startDialogue(key,'Biglemic','intro'); }
		});
		m.spawnActor(spot.n2,'npc',{
			name:'Zeldo',
			minimapIcon:CST.ICON.quest,
			sprite:s.newNpc.sprite('villagerMale-1'),
			nevermove:true,
			dialogue:function(key){ 
				if(s.testQuestActive(key,false))
					s.startDialogue(key,'Zeldo','intro');
				else
					s.startDialogue(key,'Zeldo','introQuest');		
			}
		});
		m.spawnActor(spot.n3,'npc',{
			name:'Condsmo',
			sprite:s.newNpc.sprite('villagerMale-2'),
			dialogue:function(key){ s.startDialogue(key,'Condsmo','intro'); }
		});
		m.spawnActor(spot.n4,'npc',{
			name:'Klappa',
			sprite:s.newNpc.sprite('villagerMale-8'),
			dialogue:function(key){ s.startDialogue(key,'Klappa','intro'); }
		});
		m.spawnActor(spot.n5,'npc',{
			name:'BEN',
			sprite:s.newNpc.sprite('villagerMale-4'),
			dialogue:function(key){ s.startDialogue(key,'BEN','intro'); }
		});
		m.spawnActor(spot.n6,'npc',{
			name:'Mjolk',
			minimapIcon:CST.ICON.quest,
			sprite:s.newNpc.sprite('villagerMale-5'),
			dialogue:function(key){ 
				if(s.testQuestActive(key,false))
					s.startDialogue(key,'Mjolk','intro');
				else
					s.startDialogue(key,'Mjolk','introQuest');	
			}
		});
		m.spawnActor(spot.n7,'npc',{
			name:'Esvea',
			sprite:s.newNpc.sprite('villagerMale-6'),
			dialogue:function(key){ s.startDialogue(key,'Esvea','intro'); }
		});
		m.spawnActor(spot.n8,'npc',{
			name:'Zehefgee',
			minimapIcon:CST.ICON.quest,
			sprite:s.newNpc.sprite('villagerMale-3'),
			dialogue:function(key){ 
				if(s.testQuestActive(key,false))
					s.startDialogue(key,'Zehefgee','intro');
				else
					s.startDialogue(key,'Zehefgee','introQuest');	
			}
		});
		m.spawnActor(spot.q1,'npc',{
			name:'Gryll',
			minimapIcon:CST.ICON.quest,
			sprite:s.newNpc.sprite('villagerFemale-0'),
			dialogue:function(key){ 
				if(s.testQuestActive(key,false))
					s.startDialogue(key,'Gryll','intro');
				else
					s.startDialogue(key,'Gryll','introQuest');					
			}
		});
		m.spawnActor(spot.q2,'npc',{
			name:'Vokeup',
			minimapIcon:CST.ICON.quest,
			sprite:s.newNpc.sprite('villagerFemale-1'),
			dialogue:function(key){ 
				if(s.testQuestActive(key,false))
					s.startDialogue(key,'Vokeup','intro');
				else
					s.startDialogue(key,'Vokeup','introQuest');		
			}
		});
		m.spawnActor(spot.q3,'npc',{
			name:'Zezymah',
			sprite:s.newNpc.sprite('villagerFemale-2'),
			dialogue:function(key){ s.startDialogue(key,'Zezymah','intro'); }
		});
		m.spawnActor(spot.q4,'npc',{
			name:'Beatpistol',
			sprite:s.newNpc.sprite('villagerFemale-3'),
			dialogue:function(key){ s.startDialogue(key,'Beatpistol','intro'); }
		});
		
		m.spawnShop(spot.m,'general',{
			name:'Argent',
			nevermove:true,
			angle:s.newNpc.angle('down'),
			sprite:s.newNpc.sprite('villagerFemale-4',1),	
		});
	},
	playerEnter:function(key){
		s.healActor(key);
		s.usePreset.one(key,'inTown');
	},
	playerLeave:function(key){
		s.removePreset.one(key,'inTown');
	}
});
s.newMap('east',{
	name:"Eastern Valley",
	screenEffect:'weather',
	zone:'QfirstTown-east'
},{
	load:function(spot){
		m.spawnTeleporter(spot.t7,function(key){
			s.teleport(key,'main','t3','main');
			s.setRespawn(key,'main','t3','main');
		},'zone','left','main');
		
		m.spawnSkillPlot(spot.qk,'QtowerDefence','tree-red',0);
		m.spawnSkillPlot(spot.qm,'QbulletHeaven','tree-red',0);
		m.spawnSkillPlot(spot.qi,'Qbtt000','tree-red',0);
		m.spawnSkillPlot(spot.ql,'QbaseDefence','tree-red',0);
		m.spawnSkillPlot(spot.qn,'QpuzzleBridge','hunt-squirrel',0);
		m.spawnSkillPlot(spot.X,'Qbtt001','rock-bronze',0);
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("slime",1),
			m.spawnActorGroup.list("eyeball",1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("pumpking",1),
			m.spawnActorGroup.list("spirit",1),
		]);
	}
});
s.newMap('eastCave',{
	name:"Town Cave",
	screenEffect:'cave',
	lvl:5,
	zone:'QfirstTown-eastCave'
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','k','main');
			s.setRespawn(key,'main','k','main');
		},'zone','down','main');
		
		m.spawnSkillPlot(spot.qj,'QduelLeague','rock-bronze',0);
		m.spawnSkillPlot(spot.qk,'QaggressiveNpc','rock-bronze',0);
		m.spawnSkillPlot(spot.ql,'QlockedMemento','rock-bronze',0);
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('snake',1),
			m.spawnActorGroup.list('mosquito',2),
		]);
				
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('ghost',1),
			m.spawnActorGroup.list('plant',2),
		]);
	}
});
s.newMap('south',{
	name:"Southern River",
	screenEffect:'weather',
	zone:'QfirstTown-south'
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','t4','main');
			s.setRespawn(key,'main','t4','main');
		},'zone','up','main');
		
		m.spawnSkillPlot(spot.qn,'QcollectFight','hunt-squirrel',0);
		m.spawnSkillPlot(spot.qj,'QcatchThemAll','hunt-squirrel',0);
		m.spawnSkillPlot(spot.qo,'QkingOfTheHill','hunt-squirrel',0);
		m.spawnSkillPlot(spot.ql,'Qsoccer','hunt-squirrel',0);
		m.spawnSkillPlot(spot.qp,'QpuzzleSwitch','hunt-squirrel',0);
		
		m.spawnTeleporter(spot.t2,function(key){
			s.removeQuestMarker(key,'wiseOldMan');
			s.teleport(key,'wiseOldManCave','t1','main');	
			s.setRespawn(key,'south','t2','main');
		;},'cave',{
			tag:{wiseOldManCave:true},
		});
		
		m.spawnTeleporter(spot.t7,function(key){
			s.message(key,'You can\'t go there.');
		},'zone',{
			tag:{westTeleporter:true},
			angle:s.newNpc.angle('left'),
		});
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('orc-melee',1),
			m.spawnActorGroup.list('orc-magic',1),
		]);
		
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('orc-range',1),
			m.spawnActorGroup.list('orc-magic',1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('goblin-melee',1),
			m.spawnActorGroup.list('goblin-range',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('mushroom',1),
			m.spawnActorGroup.list('ghost',1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('bee',2),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('bat',2),
		]);
	}
});
s.newMap('north',{
	name:"Northern Mountains",
	screenEffect:'weather',
	zone:'QfirstTown-north'
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','t1','main');
			s.setRespawn(key,'main','t1','main');
		},'zone','down','main');
		
		m.spawnSkillPlot(spot.qn,'QlureKill','rock-bronze',0);
		m.spawnSkillPlot(spot.qj,'Qminesweeper','rock-bronze',0);
		m.spawnSkillPlot(spot.qo,'Qfifteen','rock-bronze',0);
		m.spawnSkillPlot(spot.qp,'QflipTile','rock-bronze',0);
		m.spawnSkillPlot(spot.ql,'QbossBattle','rock-bronze',0);
		m.spawnSkillPlot(spot.X,'Qspawner','tree-red',0);
		
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("snake",1),
			m.spawnActorGroup.list("werewolf",1),
		]);
		
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("bigWorm",1),
			m.spawnActorGroup.list("smallWorm",1),
		]);
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list("snake",2),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('mosquito',2),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('ghost',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('goblin-melee',1),
			m.spawnActorGroup.list('goblin-range',1),
		]);
		
		m.spawnActorGroup(spot.e7,[
			m.spawnActorGroup.list('goblin-magic',1),
			m.spawnActorGroup.list('orc-range',1),
		]);
	}
});
s.newMap('nwLong',{
	name:"Long House"
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','t7','main');
			s.setRespawn(key,'main','t7','main');
		},'zone','down','main');
	}
});
s.newMap('high',{
	name:"High House"
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','b','main');
			s.setRespawn(key,'main','b','main');
		},'zone','down','main');
	}
});
s.newMap('transitionMap',{
	name:"Transition Map",
	graphic:'QfirstTown-main',
},{
	load:function(spot){
		
	}
});
s.newMap('southWestHouse',{
	name:"Tree House"
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','a','main');
		;},'zone','down','main');
	}
});
s.newMap('wiseOldManCave',{
	name:"Wise Man Cave",
	screenEffect:'lightCave'
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-south','t2','main');
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'QfirstTown-south','t2','main');
		;},'zone','down');
		
		m.spawnActor(spot.n1,'npc',{
			name:"Wise Old Man",
			sprite:s.newNpc.sprite('villagerMale-3',1),
			tag:{wiseOldMan:true},
			dialogue:function(key){
				s.startDialogue(key,'WiseOldMan','intro');
			}
		});
	}
});
s.newMap('northEastHouse',{
	name:"Brian's House"
},{
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','c','main');
		;},'zone','down','main');
	}
});
s.newMap('wEntrance',{
	name:"The Entrance",
	zone:'QfirstTown-west',
	lvl:0,
	screenEffect:'weather'
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('ghost',1),
		]);
		
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('orc-range',1),
			m.spawnActorGroup.list('mushroom',1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('goblin-melee',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('plant',1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('bee',1),
			m.spawnActorGroup.list('orc-magic',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('bat',1),
		]);
		
		m.spawnActorGroup(spot.e7,[
			m.spawnActorGroup.list('mosquito',1),
		]);
		
		m.spawnTeleporter(spot.t1,function(key){ 
			s.teleport(key,'main','t5','main');
			s.setRespawn(key,'main','t5','main',true);
		},'zone','right','main');
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'wLake','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wLake','t1','main',true);
		;},'zone','up','QfirstTown-wLake');
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wLake','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wLake','t2','main',true);
		;},'zone','up','QfirstTown-wLake');
		
		
		m.spawnTeleporter(spot.t4,function(key){
			s.teleport(key,'wSplit','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSplit','t1','main',true);
		;},'zone','left','QfirstTown-wSplit');
		
		m.spawnTeleporter(spot.t5,function(key){
			s.teleport(key,'wSplit','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSplit','t2','main',true);
		;},'zone','left','QfirstTown-wSplit');
	}
});
s.newMap('wLake',{
	name:"The Lake",
	lvl:0,
	screenEffect:'weather',
	zone:'QfirstTown-west'
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('ghost',1),
			m.spawnActorGroup.list("eyeball",1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("pumpking",1),
			m.spawnActorGroup.list('plant',1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('spirit',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list("smallWorm",1),
		]);
		
		
		m.spawnTeleporter(spot.t3,function(key){
			return s.message(key,'The door is locked.');
		;},'door');
		
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wEntrance','t3','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wEntrance','t3','main',true);
		;},'zone','down','QfirstTown-wEntrance');
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wEntrance','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wEntrance','t2','main',true);
		;},'zone','down','QfirstTown-wEntrance');
	}
});
s.newMap('wSplit',{
	name:"The Split",
	screenEffect:'weather',
	zone:'QfirstTown-west',
	lvl:0
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('snake',1),
		]);
				
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('mosquito',1),
		]);
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('spirit',1),
		]);
				
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('eyeball',1),
		]);
				
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('orc-range',1),
			m.spawnActorGroup.list('goblin-range',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('skeleton',1),
		]);
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wEntrance','t4','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wEntrance','t4','main',true);
		;},'zone','right','QfirstTown-wEntrance');
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wEntrance','t5','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wEntrance','t5','main',true);
		;},'zone','right','QfirstTown-wEntrance');
		
		
		m.spawnTeleporter(spot.t5,function(key){
			s.teleport(key,'wBump','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wBump','t1','main',true);
		;},'zone','left','QfirstTown-wBump');
		
		m.spawnTeleporter(spot.t6,function(key){
			s.teleport(key,'wBump','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wBump','t2','main',true);
		;},'zone','left','QfirstTown-wBump');
	}
});
s.newMap('wBump',{
	name:"The Bump",
	screenEffect:'weather',
	zone:'QfirstTown-west',
	lvl:0
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("slime",1),
			m.spawnActorGroup.list("eyeball",1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("pumpking",1),
			m.spawnActorGroup.list("spirit",1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('spirit',1),
		]);
				
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('eyeball',1),
		]);
				
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('goblin-range',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('werewolf',1),
		]);
		
		m.spawnActorGroup(spot.e7,[
			m.spawnActorGroup.list('bat',1),
		]);
		
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wSplit','t5','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSplit','t5','main',true);
		;},'zone','right','QfirstTown-wSplit');
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wSplit','t6','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSplit','t6','main',true);
		;},'zone','right','QfirstTown-wSplit');
		
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'wSnake','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSnake','t1','main',true);
		;},'zone','down','QfirstTown-wSnake');
	}
});
s.newMap('wSnake',{
	name:"The Snake",
	screenEffect:'weather',
	lvl:0
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("bigWorm",1),
			m.spawnActorGroup.list("smallWorm",1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("smallWorm",1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('bigWorm',1),
			m.spawnActorGroup.list('plant',1),
		]);
				
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('plant',1),
		]);
				
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('orc-magic',1),
			m.spawnActorGroup.list('goblin-magic',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('eyeball',1),
		]);
		
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wBump','t3','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wBump','t3','main',true);
		;},'zone','up','QfirstTown-wBump');
		
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'wHat','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wHat','t1','main',true);
		;},'zone','left','QfirstTown-wHat');
	}
});
s.newMap('wHat',{
	name:"The Hat",
	lvl:10,
	screenEffect:'weather'
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("plant",1),
			m.spawnActorGroup.list("skeleton",1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("pumpking",1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('ghost',1),
			m.spawnActorGroup.list('goblin-melee',1),
		]);
				
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('slime',1),
		]);
				
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('spirit',1),
		]);
		
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wSnake','t3','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSnake','t3','main',true);
		;},'zone','right','QfirstTown-wSnake');
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'wBridge','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wBridge','t2','main',true);
		;},'zone','left','QfirstTown-wBridge');
	}
});
s.newMap('wBridge',{
	name:"Western Bridge",
	zone:'QfirstTown-west',
	screenEffect:'weather',
	lvl:10
},{
	load:function(spot){
		m.spawnWaypoint(spot.q1,'QfirstTown-wBridge',function(key){
			s.teleport(key,'QfirstTown-wBridge','q1','main',false,false,true);
			s.setRespawn(key,'QfirstTown-wBridge','q1','main');
			s.respawnParty(key);
		});
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('orc-melee',1),
			m.spawnActorGroup.list('ghost',1),
		]);
		
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('orc-range',1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('goblin-melee',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('mushroom',1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('bee',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('bat',1),
			m.spawnActorGroup.list('goblin-range',1),
		]);
		
		m.spawnTeleporter(spot.t5,function(key){
			s.teleport(key,'wSWHill','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSWHill','t2','main',true);
		;},'zone','left','QfirstTown-wSWHill');
		
		m.spawnTeleporter(spot.t4,function(key){
			s.teleport(key,'wSWHill','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSWHill','t1','main',true);
		;},'zone','left','QfirstTown-wSWHill');
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wHat','t3','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wHat','t3','main',true);
		;},'zone','right','QfirstTown-wHat');
	}
});
s.newMap('wSWHill',{
	name:"Tree Road",
	zone:'QfirstTown-west',
	screenEffect:'weather',
	lvl:10
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("slime",1),
			m.spawnActorGroup.list("eyeball",1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("plant",1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('mushroom',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list("bigWorm",1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list('bee',1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list("smallWorm",1),
		]);
		
		m.spawnActorGroup(spot.e7,[
			m.spawnActorGroup.list("snake",1),
			m.spawnActorGroup.list("spirit",1),
		]);
		
		m.spawnActorGroup(spot.e8,[
			m.spawnActorGroup.list('bee',1),
		]);
		m.spawnActorGroup(spot.ea,[
			m.spawnActorGroup.list("slime",1),
		]);
		
		
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wBridge','t5','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wBridge','t5','main',true);
		;},'zone','right','QfirstTown-wBridge');
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wBridge','t4','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wBridge','t4','main',true);
		;},'zone','right','QfirstTown-wBridge');
		
		
		m.spawnTeleporter(spot.t4,function(key){
			s.teleport(key,'wTinyHills','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wTinyHills','t1','main',true);
		;},'zone','up','QfirstTown-wTinyHills');
	}
});
s.newMap('wTinyHills',{
	name:"Tiny Hills",
	zone:'QfirstTown-west',
	screenEffect:'weather',
	lvl:10
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("slime",1),
			m.spawnActorGroup.list('ghost',1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("snake",1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('skeleton',1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list("bigWorm",1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list("eyeball",1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list("smallWorm",1),
		]);
		
		m.spawnActorGroup(spot.e7,[
			m.spawnActorGroup.list("spirit",1),
		]);
		
		m.spawnActorGroup(spot.e8,[
			m.spawnActorGroup.list('bee',1),
			m.spawnActorGroup.list("werewolf",1),
		]);
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wSWHill','t4','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wSWHill','t4','main',true);
		;},'zone','down','QfirstTown-wSWHill');
		
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wStraightPath','t1','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wStraightPath','t1','main',true);
		;},'zone','up','QfirstTown-wStraightPath');
		
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'wStraightPath','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wStraightPath','t2','main',true);
		;},'zone','up','QfirstTown-wStraightPath');
	}
});
s.newMap('wStraightPath',{
	name:"Straight Path",
	zone:'QfirstTown-west',
	screenEffect:'weather',
	lvl:15
},{
	load:function(spot){
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('ghost',1),
		]);
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('bee',1),
		]);
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list('spirit',1),
			m.spawnActorGroup.list("slime",1),
		]);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list('skeleton',1),
		]);
		
		m.spawnActorGroup(spot.e5,[
			m.spawnActorGroup.list("eyeball",1),
		]);
		
		m.spawnActorGroup(spot.e6,[
			m.spawnActorGroup.list('bat',1),
			m.spawnActorGroup.list("snake",1),
		]);
		
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'wTinyHills','t2','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wTinyHills','t2','main',true);
		;},'zone','down','QfirstTown-wStraightPath');
		
		
		m.spawnTeleporter(spot.t2,function(key){
			s.teleport(key,'wTinyHills','t3','main',false,false,true);
			s.disableCombatUntilMove(key);
			s.setRespawn(key,'wTinyHills','t3','main',true);
		;},'zone','down','QfirstTown-wTinyHills');
	}
});

s.newMap('genetosHouse2',{
	name:"Genetos House",
	screenEffect:'',
	graphic:'Qtutorial-genetosHouse',
},{
	load:function(spot){		
		m.spawnActor(spot.n1,'npc',{
			name:'Genetos',
			dialogue:'talkGenetos',
			tag:{genetos:true},
			sprite:s.newNpc.sprite('villagerMale-5')
		});
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-main','t8','main');
		},'zone','down','QfirstTown-main');
	}
});

s.exports(exports);
