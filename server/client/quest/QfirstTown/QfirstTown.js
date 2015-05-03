//04/06/2015 12:40 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

var Debug = require2('Debug');

var s = loadAPI('v1.0','QfirstTown',{
	name:"",
	author:"rc",
	thumbnail:False,
	description:"",
	maxParty:2,
	admin:true,
	showInTab:false,
	dailyTask:false,
	showWindowComplete:false,
	autoStartQuest:false,
	skillPlotAllowed:true,
	completable:false,
	inMain:false,
	alwaysActive:true
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
setTimeout BAD
*/

s.newVariable({
});

s.newEvent('zeldo',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','Qminesweeper','QfirstTown-north','t5');
});
s.newEvent('mjolk',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','QtowerDefence','QfirstTown-east','t2');
});
s.newEvent('zehefgee',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','Qbtt000','QfirstTown-east','t6');
});
s.newEvent('gryll',function(key){ //
	s.addQuestMarker.admin(key,'startQuest','QpuzzleBridge','QfirstTown-east','t5');
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
	s.addQuestMarker.admin(key,'wiseOldMan','QfirstTown','QfirstTown-south','t2');
});
s.newEvent('zezymahSquirrel',function(key){ //
	var array = [];
	for(var i = 0 ; i < 15; i++){
		var eid = s.spawnActorOnTop(key,'main','npc',{
			sprite:s.newNpc.sprite('hunt-squirrel',1),
			maxSpd:s.newNpc.maxSpd(3),
		});
		array.push(eid);
	}
	setTimeout(function(){
		for(var i = 0 ; i < array.length; i++){
			if(s.actorExists(array[i]))
				s.killActor(array[i]);
		}	
	},1000*10);
});
s.newEvent('benSalvage',function(key){ //
	s.displayQuestion(key,'This will permanently destroy <u>every</u> equip in your inventory<br>and turn them into materials. Continue?',function(){
		Debug.salvageInventory(key);
	});
});
s.newEvent('wiseOldMan',function(key){ //
	s.setSprite(key,'bee',1);
	s.setTimeout(key,function(key){
		s.setSprite(key,'normal',1);
	;},25*15,'bee');
});

s.newPreset('inTown',null,null,False,False,True,True);

s.newDialogue('Biglemic','Biglemic','villagerMale-0',[ //{ 
	s.newDialogue.node('intro',"Explore Northern Mountains and Eastern Valley for quests!.",[ 	])
]); //}
s.newDialogue('Zeldo','Zeldo','villagerMale-1',[ //{ 
	s.newDialogue.node('intro',"Hello there traveler, you must be tired from all the walking. I wish I knew that feeling... Anyway how can I be of use?",[ 
		s.newDialogue.option("Why can't you walk?",'cantwalk'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"Hello there traveler, you must be tired from all the walking. I wish I knew that feeling... Anyway how can I be of use?",[ 
		s.newDialogue.option("Why can't you walk?",'cantwalk')
	]),
	s.newDialogue.node('cantwalk',"The Creator didn't feel like I needed to. I probably don't deserve it.",[ 
		s.newDialogue.option("This is unfair.",'unfair'),
		s.newDialogue.option("Maybe The Creator just forgot.",'forgot'),
		s.newDialogue.option("Have you tried to fix the problem?",'fixproblem')
	]),
	s.newDialogue.node('unfair',"Yeah, I guess. Especially considering every other NPC in the town can move. But who am I to judge The Creator's decisions. If he thinks I shouldn't walk, then be it!",[ 
		s.newDialogue.option("Is there anything you can do?",'fixproblem')
	]),
	s.newDialogue.node('fixproblem',"There's nothing much I can do other than pray The Creator. Hopefully he will listen my prayers but I doubt it.",[ 
		s.newDialogue.option("I wish you the best of luck.")
	]),
	s.newDialogue.node('forgot',"Oh, I've never thought of that. Maybe He just forgot to enable the Movement attribute on my body declaration. But still, it doesn't really change anything.",[ 	]),
	s.newDialogue.node('quest',"I heard there's a Minesweeper quest if you go north. Do you want me to mark it on your minimap?",[ 
		s.newDialogue.option("Yes.",'','zeldo'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Condsmo','Condsmo','villagerMale-2',[ //{ 
	s.newDialogue.node('intro',"The guy in the 2 story house in the town has lost his ring.",[ 	])
]); //}
s.newDialogue('Klappa','Klappa','villagerMale-7',[ //{ 
	s.newDialogue.node('intro',"Please, talk with me! I'm begging you.",[ 
		s.newDialogue.option("Why?",'useless')
	]),
	s.newDialogue.node('useless',"Because if nobody talks with me, I am going to die.",[ 
		s.newDialogue.option("Why is that?",'useless2')
	]),
	s.newDialogue.node('useless2',"I have nothing interesting to say so not many players take the time to talk with me. I am entirely useless and a waste of time. If The Creator realizes that I'm not needed in the game, He will delete me.",[ 
		s.newDialogue.option("Okay then, let's continue talking.",'useless3'),
		s.newDialogue.option("You deserve to die. I'm leaving.")
	]),
	s.newDialogue.node('useless3',"Thanks you so much! Talk with me as much as you want.<br>(＾0＾)//",[ 
		s.newDialogue.option("Okay.",'useless4')
	]),
	s.newDialogue.node('useless4',"You are amazing! Talk with me as much as you want.<br>(＾0＾)//",[ 
		s.newDialogue.option("Okay.",'useless3')
	])
]); //}
s.newDialogue('Ben','Ben','villagerMale-4',[ //{ 
	s.newDialogue.node('intro',"Hello, if you want I can salvage all the equips in your inventory.",[ 
		s.newDialogue.option("Okay.",'','benSalvage'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Mjolk','Mjolk','villagerMale-5',[ //{ 
	s.newDialogue.node('intro',"You're disturbing be. I'm praying.",[ 
		s.newDialogue.option("Who are you praying to?",'rng'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"You're disturbing be. I'm praying.",[ 
		s.newDialogue.option("Who are you praying to?",'rng')
	]),
	s.newDialogue.node('rng',"The RNG God of course, the God of randomness. You should pray him too if you want a lucky future.",[ 
		s.newDialogue.option("What can he do?",'rng2')
	]),
	s.newDialogue.node('rng2',"The RNG God is the One who decides how much damage you deal, what attacks enemies use, how powerful your newly-found equipment is and so on.",[ 
		s.newDialogue.option("Have you ever seen him?",'rng3')
	]),
	s.newDialogue.node('rng3',"Not myself. I don't even think The Creator has ever seen Him either. The RNG God lies deep in the program under the alias Math.random(). It is not meant to be seen by humans eyes. It is written in the programming language C++ and it is compiled.",[ 
		s.newDialogue.option("I'll let you you pray.",'rng4')
	]),
	s.newDialogue.node('rng4',"Thanks. May the RNG God be ever in your favor.",[ 	]),
	s.newDialogue.node('quest',"Yes actually. Tower Defence starting point is east of this town. I'll mark it in your minimap. Now leave me alone.",[ 
		s.newDialogue.option("Okay.",'','mjolk'),
		s.newDialogue.option("No thanks.")
	])
]); //}
s.newDialogue('Esvea','Esvea','villagerMale-6',[ //{ 
	s.newDialogue.node('intro',"If you find any glitch in the game, please tell me! I've already found over 9000 myself.",[ 
		s.newDialogue.option("Tell me a cool glitch you found.",'glitch'),
		s.newDialogue.option("Have you ever made the server crash?",'crash'),
		s.newDialogue.option("What's a glitch?",'what')
	]),
	s.newDialogue.node('glitch',"I once found a glitch that allowed me to duplicate items exploiting a bug in the bank saving process. I reported the issue to The Creator and he grant me any item I wanted.",[ 
		s.newDialogue.option("What did you ask for?",'item'),
		s.newDialogue.option("Anything else?",'crash')
	]),
	s.newDialogue.node('item',"I asked for my berret of course! I look so good with it.",[ 
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
	s.newDialogue.node('intro',"Hello there. Did you get the chance to see the magnifient river south-east of the town?",[ 
		s.newDialogue.option("Yeah, what's the big deal about it?",'dream'),
		s.newDialogue.option("Not yet. Why?",'dream'),
		s.newDialogue.option("Do you have a quest for me?",'quest')
	]),
	s.newDialogue.node('introQuest',"Hello there. Did you get the chance to see the magnifient river south-east of the town?",[ 
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
	s.newDialogue.node('danger',"I once caused the end of the world. A random player came and asked for a quest. A glitch in my dialogue script made the entire server crash, killing every living beings in the world. Ever since, I'm scared to talk with players.",[ 
		s.newDialogue.option("So far, nothing weird had happened.",'danger3','vokeup2'),
		s.newDialogue.option("I'll keep talk until the server crashes.",'danger2')
	]),
	s.newDialogue.node('danger2',"You are insane! I will not let you do that. No more dialogue options for you. That way you can't continue the conversation. Bye, crazy.",[ 	]),
	s.newDialogue.node('danger3',"I told you! I'm dangerous! Leave now before it's too late!",[ 
		s.newDialogue.option("Okay, right. I'm leaving."),
		s.newDialogue.option("These explosions deal no damage...",'danger4')
	]),
	s.newDialogue.node('danger4',"The problem is not the damage, it's the server crash. How can I make you go away...",[ 
		s.newDialogue.option("Just give me 1,000.000$ and I'll leave.",'danger5'),
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
	s.newDialogue.node('intro',"Can't you see I'm busy scripting!? Leave me alone.",[ 
		s.newDialogue.option("Tell me more about scripting.",'scripting'),
		s.newDialogue.option("Okay...")
	]),
	s.newDialogue.node('scripting',"Really? Normally people don't care much about scripting. I'm still an apprentice so I don't much about it but I guess I can teach you the basics. Scripting is the art of writing lines of code that can create powerful game-changing effects.",[ 
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
	s.newDialogue.node('learn',"You should go meet my master then. He lives in a cave south of the village. He's by far the most powerful scripter of this game, other than The Creator of course. I can mark the cave location on your minimap if you want.",[ 
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
	s.newDialogue.node('intro',"Hello. How may the Script Master help you?",[ 
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

s.newMap('main',{
	name:"First Town",
	lvl:0,
	isTown:true,
	screenEffect:'weather',
	grid:["11100000000001100110000000000000000000000000110000000000001100011000000001100000000000000000010000000001000000","00000000000001111110000000110000000000000000110000000000001100011000001111100000000000000000010000000001000000","00000000000001111110000000110000000001111000110000000000001100011000001111100000000000000000110000000001100000","00001111111111111110000000110000000001111000110000000000001100001100001111000000000000000001100000000000110000","00011111111111111111111111111100000001111000110000000000001100000111111110000000011111111111000000000000111100","00111111111111111100000000000100000000011100110000000000001100000011111100110000111111111110000000000000111110","00111111111111100100000000000100000000011111110000000000001111111000000000110001100000000000000000000000111110","00111111111111100110000000001100111100000000110000000000001111111000000000000011000000000000000000000000111110","00111111111111100111111111111100111100000000110000000000001111111000000000000110011110000000000000000000111110","00111111111111100011111111111000111100000001110000000000001111000011111000001100011110000000000000000000111110","00111111111111100001111111111000111100000011110000000000001111000111111100011000011110000000000000000000000010","00111111111111100001111111111111111111111111100000000000000111111111111111111000000000000000000000000000000010","00111111111111100011111111111111111111111111100000000000000011111111111111111000000000000000000000000000000010","00111111111111100111111111111111111111111111111100000000000001111111111111111000000000000000000000000001111110","00111111111111100111111111111111111111111111111100000000000000111111111111111000000000000000000000000001111110","00111111111111100111111111111111111111111111111100000000000000111111111111111000000000000000000000000001111111","00111111111111100111111111111111111111111111000000000000000000111111111111111000000000000001111110000011111111","00111111111111100111111111111111111111111111000000000000000000111111111111110000000000000011000000000000000111","00111111111111100111111111111111111111111111000000000000000000111111111110000000000000000011000000000000000000","00111111111111100111111111111111111111111111000000000000000000111111111110000000000000000011111100000000000000","00111111111111100111111111111111111111111111000000000000000000111111000000000000000000000011111100000000000000","00111111111111100111111111111111111111111111000000000000011111111110000000000000000000000011111100000000000000","00111111111111100111111111111111001111111111000000000000011111100000000000000000000000000010000000000000000000","00111111111111100111111111111111001111111111000000000000011111100000000000000000000000000010000000000000000000","01111111111111100111111111111111001111111100000000000000000000100000000000000000000000000010000000000000000000","11111111000000000111111111111111001111111100000000000000000000100000000000000000000000000010000000000011111111","11111111000000000110000011111111000000000000000000000000011000100000000000000000000011110010000000000110000000","11001111000000000110000011111111000000000000000000000000111100100000000000000000000011110010000000000100000000","10000000000000000110000011111000000000000000000000000000000000100000000000000000001111111110000000000100000000","00000000000000000110000000000000000000000000000000000000000000100000000000000000001111111110000000000100110000","00000000000000000110000000000000000000000000000000000000000000100000000000000000111111111110000000000111111000","00000000000000000110001111000000000000000000000000000000000000100000000000000000111111110010000000000100000000","00000000000000000110001111000000000000000000000000000000110000100000000000000000111111110010000000000100000000","00000000000000000110001111000000000000000000000000000000110000100000000000000000111111110010000000000100000000","10000000000000000110000000000000000000000000001111000000000000100000000000011111111111111110000000000100000000","11000000000000000110000000000000000000000000001111000000000000110000000000111111111111111110000000000100001110","01100000000000000011111111110000000000000000001111000000000000011110000111100000000011111110000000000100011111","01110000000000000001111111111000000000000000001111000000000000011110000111000000000011111110000000000100010001","01110000000000000001110011111100000000000000111111000000000000111110000110000111100000000110000001111100010001","11110000000000000011110011111110000000000001111111100000000000110010000100000111100000000110000001111100010001","11100000000000000000000111111110000000000011000000110000000000000000000000000111100000000110000001111100010001","11000000000000000000000100011110000000000110000000011000000000000000000000000000000000000110000000000100010001","10000000000000000000000100011110000000000110000000011000000000000000000000000000000000000110000000000100011111","00000000000000000000000100011110000000000110000000011100000000000000000000000000000111100110000000000100001110","00000000000000000000000100011111110000000110000000111110000000000000000000000000000111100110000000000100000100","00000000001000010000000100011111110000000110000000111111000000000000000000000000000111100110000000000100000000","11111111111000011111100111111110000000000110000000111111100000000000000000000000000000000110000000000100000000","11111111111000011111110011100110000000000111000000000111100000000000000000000000000000000110000000000100000000","11111111111000011111111001100110000000000111100000000111100000000000000000011111111111111100000000000100110000","11111111111000011111111000111110000000000011111111111111000000000000000000111111111111111000000000000100110000","01111000001000010000011000111110000000000001111111111110001100000000000001100000000000000000000000000100000000","01111000000000000000011100011110000000000000111111111100001100000000000011000000000000000000000000000110000000","01111000000000000000011110011110000000000000011111111000000000000000000011000000000000000000000000000011000000","00000000000000000000001111111100000000000000000000000000000000000000000011100000000000000000000000000001110000","00000000000000000000000111111000000000000000000000000000000000000000000011110010000000100000000000000001111000","00000000000000000000000011110000000000000000000000000000000000000000001111111110000000111000000000001111111000","00000000000000000000000001100000000000000000000000000000000000000000011111111110000000111100000000001111111000","00000000000000000000000000000000000000000000000000000000000000000000000000011110000000111110000000001111111000","00000000000000000000000000000000000000000000000000000000000000000000000000001110000000111110000000000011111000","00000000000000000000000000000000000000111111000000000000111100000000000000000010000000100110000000000011111000","00000000000000000000000000000000000000111111000000000001111110000000000000000000000000000110000000000011111000","00000000000000000000000000000000000000111111000000000011111111000000000000000000000000000110000000000011111000","11111111110000000000000000000000000000011110000000000111111111100000000000000000000000000110000000000011111000","11111111111000001111111111110000000000011110000000001111111111110000000000000000000000000110000000000011111000","00000111111100011111111111111000000000000000000000001111111111110000000000000000000000000110000000000011111000","00000111100111111111111111111100000000000000000000001111111111110000000000000000000000001100000000000000001000","00000111100111111111111111111100000000000000000001111111111111110000000000000000000000011000000000000000001000","00000111100111111111111111111100000000000000000001111111111111110000000000000000000000110000000000000000001000","11111100000111111111111111111100000000000000000000001111111111110000000000000000011111100000000000000000001000","11111100000111111111111111111100000000000000000000001111111111110000000000000000111111000000000000000000001000","00000110000111111111111111111111111000000000000000001111111111110000000000000001100000000000000000000000001000","00000011000111111111111111111111111000000000000000001111111111110000000000000011100000000000000000000110001000","00000011000111111111111111111111111000000000011110001111111111110000000000000111111100000000000000000110011000","00000011000110000111111111111000000000000000011110001111111111110000000000001100111100000000000000000111110000","00000011000110000111111110000000000000000000011110001111111111110000000000011000111100000000221000100110010000","00000011000110000111111110000000000000000000000000001111111111000000000000110000000000000022221000122100011000","00000011000110000000000000000000000000000000000000001111111111000000000000110000000000002222221000122100011000","00000011000111111000000000000000000000000000000000000000000000000000000000110000000000022222221000122100000000","00000111000111111000000000000000000000000000000000000000000000000000000000110000000000222222221000122100000000","00001111000111111000000000000000000000000000000000000000000000000000000000110000000002222222221000122100000000","11111110000110000000000000000000000000000000000000000000000000000000000000111110000222222222221000122100000000","11111100000110000000000000000000000000000000000000000000000000000000000000111110022222222222221000122100000000","11111000000110000000000000000000011111111000000000000000000000000000000001111111222222222222221000122100001100","11110000000110000000000000000000111111111100000000110000000000000000000011111112222222222222221000122100011110","01100000001110000000000000000000100111100100000000110000000000000000000110011112222222222222221000122100000000","01100000011110000000000000000000100111100100000000000000000000000000001100000022222222222222221000122100000000","11111111111100000000000000000000111111111100000000000000000000000000011000000022222222222222221000122210000000","00011111111000000000000111000000011111111000000000000000000011111111110000000222222222222222221000122221000000","00011111110000000000001111100000001111110000000000000000000111111111100000000222222222222222221000122222111111","11111111100000000000011000110000000111100000000000000000001100000000000000002222222222222222200000002222222222","11111000000000000000110000011000000000000000000000000000011100000000000000002222222222222222200000000222222222","11110000000000000000110000011000000000000000000000000000011111110000000000222222222222222222200000000022222222","11100000000000000000110000011000000000000000000000000000011111110000000002222222222222222222200000000000222222","00000000000000000000110000001100000000000000000000000000011111110000000002222222222222222222200000000000000000","00000000000000000000110000000110000000000000000000000000011000000000000222222222222222222222200000000000000000","00000000000000000001100000000011001111000000000000000111111000000000002222222222222222222222200000000000000000","00000000000001111111100000000011001111000000000000000111111000000000222222222222222222222222220000000000000000","00000000000011111111110011110011111111110000000000000111111000000002222222222222222222222222220000000022222222","00000000000110000001111111110011111111110000000000000111111000000222222222222222222222222222222222222222222222","00000000001100000000000011110011111111111100000000000111111000002222222222222222222222222222222222222222222222"],
	tileset:'v1.2'
},{
	spot:{t1:{x:1664,y:48},g:{x:3152,y:48},s1:{x:1888,y:592},n8:{x:2640,y:560},c:{x:2224,y:624},n7:{x:1680,y:688},t3:{x:3472,y:688},t7:{x:368,y:784},t8:{x:1216,y:816},s5:{x:2496,y:976},n2:{x:1264,y:976},i:{x:48,y:1008},s6:{x:3168,y:1136},s3:{x:192,y:1296},l:{x:1488,y:1328},q1:{x:1200,y:1488},n1:{x:2096,y:1488},k:{x:1584,y:1680},q4:{x:3056,y:1680},t5:{x:48,y:1776},f:{x:1024,y:1776},n5:{x:464,y:1808},g1:{x:2336,y:1888},q2:{x:1584,y:1904},n3:{x:2224,y:2256},n4:{x:1264,y:2288},a:{x:672,y:2416},b:{x:1856,y:2448},q3:{x:1040,y:2480},s4:{x:800,y:2672},s2:{x:2112,y:2672},n6:{x:1488,y:2640},h:{x:3472,y:3040},j:{x:112,y:3152},t4:{x:1472,y:3152}},
	load:function(spot){
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'east','t7','main');
			s.setRespawn(key,'east','t7','main');
		},'zone',null,'east');
		m.spawnTeleporter(spot.t4,function(key){
			s.teleport(key,'south','t1','main');
			s.setRespawn(key,'south','t1','main');
		},'zone','down','south');
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'north','t1','main');
			s.setRespawn(key,'north','t1','main');
		},'zone','up','north');
		
		m.spawnTeleporter(spot.t7,function(key){
			s.teleport(key,'nwLong','t1','main');
			s.setRespawn(key,'nwLong','t1','main');
		},'door',null,'nwLong');
		m.spawnTeleporter(spot.t8,function(key){ 
			s.teleport(key,'Qtutorial-genetosHouse2','t1','main');
			s.setRespawn(key,'Qtutorial-genetosHouse2','t1','main');
		},'door');
		m.spawnTeleporter(spot.a,function(key){ 
			s.teleport(key,'southWestHouse','t1','main');	
		},'door',null,'southWestHouse');
		m.spawnTeleporter(spot.b,function(key){
			s.teleport(key,'high','t1','main');
			s.setRespawn(key,'high','t1','main');
		},'door',null,'high');
		m.spawnTeleporter(spot.c,function(key){ 
			s.teleport(key,'northEastHouse','t1','main');
		},'door');
		
		m.spawnTeleporter(spot.k,function(key){ 
			s.teleport(key,'eastCave','t1','main');
			s.setRespawn(key,'eastCave','t1','main');
		},'cave','right','eastCave');
		
		m.spawnBank(spot.f);
		
		m.spawnSkillPlot(spot.s2,'Qdarkness','tree-red',0);
		m.spawnSkillPlot(spot.s1,'QprotectFirstTown','tree-red',0);
		
		m.spawnActor(spot.n1,'npc',{
			name:'Biglemic',
			sprite:s.newNpc.sprite('villagerMale-0'),
			dialogue:function(key){ s.startDialogue(key,'Biglemic','intro'); }
		});
		m.spawnActor(spot.n2,'npc',{
			name:'Zeldo',
			minimapIcon:'minimapIcon-quest',
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
			sprite:s.newNpc.sprite('villagerMale-7'),
			dialogue:function(key){ s.startDialogue(key,'Klappa','intro'); }
		});
		m.spawnActor(spot.n5,'npc',{
			name:'Ben',
			sprite:s.newNpc.sprite('villagerMale-4'),
			dialogue:function(key){ s.startDialogue(key,'Ben','intro'); }
		});
		m.spawnActor(spot.n6,'npc',{
			name:'Mjolk',
			minimapIcon:'minimapIcon-quest',
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
			minimapIcon:'minimapIcon-quest',
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
			minimapIcon:'minimapIcon-quest',
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
			minimapIcon:'minimapIcon-quest',
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
			minimapIcon:'minimapIcon-quest',
			sprite:s.newNpc.sprite('villagerFemale-2'),
			dialogue:function(key){ s.startDialogue(key,'Zezymah','intro'); }
		});
		m.spawnActor(spot.q4,'npc',{
			name:'Beatpistol',
			sprite:s.newNpc.sprite('villagerFemale-3'),
			dialogue:function(key){ s.startDialogue(key,'Beatpistol','intro'); }
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
	lvl:0,
	screenEffect:'weather',
	grid:["0000000011000000001111100000000000100000000110000110000000000000111111110000000000000000000000000000","0111000011000000011111100000000000100000000111000110000000000001111001111110011111111100001100000000","1111000000000000111111100000001100100000000111100110000000000001111000111111111111111110001100000000","1111000000000111100111000000001100100000000011111111111111111111110000011111111111111111000000000000","1110000000011111100001000100111111100000000001111111111111111111110000001111111111111111100000000000","0000011111111111111001111100111111100000000000111111111111111111111000000000100000000011100001111111","0000111111100111111111111100111111100000000000011111111111111111111111000000100000000001100011000001","0000100000000001111111111100111111111111000000000000000001111111111111111111111100000001100011000001","0000100000000000000111111100111111111111100000000000000001111001111111111111111110000001100011000001","0000100000000000000110000100100011111111100000000000000001111000000111111111111111000001100001111111","1100100000000000000110000000000011111111100000000000000000000000000000011111111111000001111100111110","1100100000000000000110000000000011111111100011000000000000000000000000000000111111000001111100000000","0000100000000000000110000000000000000000100111100000000000000000000000000000111111000001111000000000","0000111100000000000110000000000000000000100000000000000000000000000000000000111111000001111000000000","0001111100000000001110000000000000000000110000000000000000000000000000000000000011000000111111111111","0011111100000000011110000000000000000000011000000000000000000000000000000000000011000000011111111111","1111111100000000111100000000000000000000001111111111111111111111111110000000000011000000001111111111","1111111110001001111000000000000000000000000111111111111111111111111111000000000011000000000111111111","1111111110001111110000000000110000000000000000000000000000000000000001000000000011000000000000000111","1111111110001110010000000000110000000000000000000000000000000000000001000000000011111100000000000111","0000000010001000010000000000000000000000000000000000000000000000000001100000000011111100000000000111","0000000000000000010000000000000000000000000000000000000000000000000000111100001111111100000000000111","0000000000000000000000000000000000000000000000000000000000000000000000011100001111110000000000000111","0000000000000000000000000000000000000000000000000000000000000000000000001100001111110000010000100111","0000000000000000000000000000000000000000000000111111111100000000011000000100001001111111110000111111","0000000000000000000000000110000000000000000001111111000110000000011000000000000000111111110000111111","0000000000000000000000000110000000000000000001111111000110000000000000000000000000011111110000111111","0000000000000000010000000000000000000000000001111111000110000000000000000000000000001111110000111111","0000000000000000010000000000000000000000000000111111001100000000000000000000000000000000010000100000","1111111111000000010000000000000000000000000000011111111000000000000000000000000000000000000000000000","0000011111100000011000000000000000000011000000001111110000000000000000000000000000000000000000000000","0000011111100000001111111111111100000011000000000000000000000000000000000000000000000000000000000000","0000011111100000000000000000000110000000000000000000000000000000000000000000000000000000000000000000","0001111000100000000000000000000010000000000000000000000000000000000000000000000000000000000000000000","0011111000100000000000000000000010000000000000000000000000000000000000000000000000000000000000000000","0010001000100000000000000000000010000000000000000000000000000000000111111111111111111000000001100111","0010001000100000000000000000000011000000000000000000000000000000001100000000000011111100000001111111","0010001000111100000000000000000001111110000011110000000000000000001000000000000011111100000000111000","0010001000111100000000000000000000000000000000011000000000000000011000000000000011111100000000111000","0010001000111100000000000000000000000000000000001111111111111111110000000000000000000100000000111111","0010001000011111111111111100000000000000000000000000000000000000000000000000000000000100000000111111","0010001000000000000000111110000000000000000000000000000000000000000000000000000000000100000000111111","0010001100000000000000110010000000000000000000000000000000000000000000000011001111111100000000110000","0010001111111111111111110011111000000000000000000000000000000000000000000111111000011100000000110000","0010011000000000000001100011111000000000000000000000000000000000000000000000111000011100000000110000","0010011000000000000001100011111000000000000000000000000000000000000000000000111111111100000000110000","0011111000000000000001100001111111111111111111110000000001111111111111111111111111111100000000110000","0001111111111111111111000000000001100000001100011000000011000000000001100000001111111100000000111110","0000111111111111111110000000000001100000001100001000000010000000000001100000001111111100000000111110","0000000000000000000000000000000001100000000000001000000010000000000000000000000111001100000000110000"],
	tileset:'v1.2'
},{
	spot:{t3:{x:864,y:48},t2:{x:1232,y:48},t1:{x:2608,y:144},a:{x:1648,y:208},s4:{x:736,y:304},s7:{x:224,y:288},s3:{x:2368,y:336},s5:{x:2112,y:560},s6:{x:1152,y:544},t8:{x:3024,y:560},t7:{x:48,y:784},e1:{x:1136,y:784},g1:{x:1792,y:960},e2:{x:2064,y:944},t5:{x:3152,y:1008},s1:{x:2496,y:1168},s2:{x:1056,y:1392},t4:{x:1680,y:1552},t6:{x:2896,y:1552}},
	load:function(spot){
		m.spawnTeleporter(spot.t7,function(key){
			s.teleport(key,'main','t3','main');
			s.setRespawn(key,'main','t3','main');
		},'zone','left','main');
		
		m.spawnSkillPlot(spot.s3,'QtowerDefence','tree-red',0);
		m.spawnSkillPlot(spot.s5,'QbulletHeaven','tree-red',0);
		m.spawnSkillPlot(spot.s1,'Qbtt000','tree-red',0);
		m.spawnSkillPlot(spot.s4,'QbaseDefence','tree-red',0);
		m.spawnSkillPlot(spot.s2,'QpuzzleBridge','tree-red',0);
		m.spawnSkillPlot(spot.s6,'QpuzzleBridge','hunt-squirrel',1);
	}
});
s.newMap('eastCave',{
	name:"Town Cave",
	lvl:0,
	screenEffect:'cave',
	grid:["011000001100000001100000011000000010000000100011000000110000000100000000000","111000001110000001100000011000000011000001100011000000110000000110000000000","111000001110000001100000011100110011111111100011000000110000110011000000000","111100011110000001100000011111110001111111000011000000110000110001111111111","011111111100000001100000001111100000000000000111000000111000000000111111111","001111111100111111100000000111100000000000001111000000111100000000001100100","000111111111111111100000000011111111111111111110000000011111100000001100000","000011111111111111100000000001111111111111111100000000001111111111111100000","000000000111111111000000000000111111111111111000000000000111111111111100000","000000000011111110000000000000011111111111110000000000000011111111111100000","000000000011111100000000000000000000000000000000000000000000011111111110000","111111111111111000000000000000000000000000000000000000000000000000011110000","111111111111100000000000000000000000000000000000000000000000000000000110000","111111111111000000000000000000000000000000000000000000000000000000000110000","111111111110000000000000000000000000000000000000000000000000000000000110000","000000000000000000000111111111100000000000000000000000011100000000000111000","000000000000000000000111100001100000000000000000000000111110000000000111111","000000000000000000000111100001100000000000000000000001111111000000000011111","000000000000000000000110001111100000000000000000000011111111100000000001111","000000000000000000000110011111000000000000000000000011111111100000000000111","000000000000000000000111110000000000000000000000000011111111100000000000000","000000000000000000000011100000000000000000000000000001111111000000000000000","111111111110000000000000000000000000000000000000000000111110000000000000000","111111111111000000000000000000000000000000000000000000011100000000000000000","111111111001100000000000000000000000022000000000000000001000000000000000111","111111111000110000000000000000000002222222222200000000000000000000000001111","000000001100110000000000000000000022222222222220000000000000000000000011000","000000001100110000000000000000000222222222222222000000000000000000000110000","000000001100110000000000000000000022222222222220000000000000000000000110000","111111111000110000000000000000000022222111222220000000000000000000000110000","111111110000110000000000000000000002222211222200000000000000000000000110000","001111000000110000000000000000000002222222222000000000000000000111100110000","002222000000110000000000000000000000222222220000000000000000000111111100000","222222200000111000000000000000000000022222200001100000000000000000111100000","222222220000111111000000111111000000000000000001100000000000000000111111110","222222200000100000000000000001100000000000000000000000000011111111111111111","222222100000100000000000000000100000000000000000000000000111111111111111111","222200111100100000000000000000100000000000000000000000001100000000001111110","220000111111100000000000000000110000000000000000000000011000000000001100000","000000111111000000000000000000111111000001111100000000011000111111111100000","000000111110000000000000000000111111000001111110000000011000110000001100000","000001111100000000000000000001111110000000011111000000011000110000001100000","000001000000000000000000000001111110000000011111100000011000111111111100000","000001000000000000000000000001111111100011000111100000011000011111111000000","000001000000000000111100000001111111000001000111100000011000011100000000000","000011000000000001100110000001111001000001000111000000011000111100000000000","111111000000000001100110000011111001000001000110000000011100111100000000000","111111100000000001100110000011001001100011000110000000011111111100000000000","000001100000000000111100000000001001111111000110000000001111111111111000000","000000000000000000011000000000001000111110000110000000000111111111111100000","000000000000000000000000000000001000000010000110000000000011111111111110000","000000000000000000000000000000001000000011111111110000000001111111111110000","000000000000000000000000000000001100000011111110000000000000000001100110000","111110000000000000000000000000001110000011111110000000000000000001100110000","000011000000000000000000000000001111111111111100001111100000000000000110000","000001100000000000000000000000001111111111111000001111100000000000000110000","000000111111110000000000000000000100001111110000001111100000000000000110000","000000000111111000000000000000000000001111100000001111100000000000000110000","000000000111111000000000000000000000001000000000000111000000000000000110000","000001111111111000000000000000000000001000000000000000000000000000000110000","000011111100001000000000000000000000000000000000000000000000000000000110000","000110001100001000000000000000000000000000000000000000000000000000000110000","001100000110001000000000000000000000000000000000000000000000000000000110000","001100000110001000000000000000000000000000000000000000000000000000000110000","001100000110001000000000000000000000001000000000000000000000000000000110000","001100000110001000000000000000001100001000000000000000000000000000000110000","001100000110001000000000000000001100001100000000000000000000000000000111111","001100000111111100000000000000001100001111111111111111111110001111111111111","001100000111111111111111111111111111111111111111111111111111111111111001111","001100000110010000000000111100000000000000000001100000000000000000000001111","001100000110010000000000111100000000000000000001100000000000000000000011000","001100000011111000000000111111111111111111111111111111111111111111111110000","001100000001111100000000011110000000000000000000000000000000000000000000000","001100000000000110000000001110000000000000000000000000000000000000000000000","001100000000000011000000000010000000000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t4:{x:704,y:48},t5:{x:1632,y:48},s1:{x:592,y:368},s5:{x:2096,y:432},e1:{x:1104,y:496},t3:{x:48,y:592},t6:{x:2352,y:704},e2:{x:1712,y:880},e4:{x:656,y:912},s8:{x:528,y:976},s4:{x:1936,y:1040},s2:{x:272,y:1424},t7:{x:1232,y:1456},s3:{x:1552,y:1552},s7:{x:976,y:1584},t2:{x:48,y:1616},e3:{x:688,y:1808},s6:{x:560,y:2096},t1:{x:1936,y:2096}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','k','main');
			s.setRespawn(key,'main','k','main');
		},'zone','down','main');
		
		m.spawnSkillPlot(spot.s2,'QduelLeague','rock-bronze',0);
		m.spawnSkillPlot(spot.s3,'QaggressiveNpc','rock-bronze',0);
	},
});
s.newMap('south',{
	name:"Southern River",
	screenEffect:'weather',
	lvl:0,
	grid:["0001111111111100000000000000000011000000011000000000000000000000110011112222222222222222222222222222","0011000011000110000000000000000011001111111000000000000000000000110011112222222222222222222222222222","0011000011000110000000000000000011001111111111100000000000000000110011112222222222222222222222222222","0011000000000110000000000011110011001111111111100000000000000000110011112222222222222222222222222222","0001100000001100000001100011110011001111111111100000000000000000111111111122222222222222222222222222","0000111111111000000001100011111111111111111000000000000000000000111111111122222222222222222222222222","0000011111110011000000000011111111111111111000000000000000000000111111111111222222222222222222222222","0000000000000011000000001111111111111100011000000000000000000000110011111111222222222222211111111111","0000000000000000000011111111111100111100011000000000000000001111110011111111112222222222111000000110","0000000000000000001111111111111000111100111000000000000000001111110000111111112222222221111000000110","0000011000011111111111111111111000111111111000000000000000001111110000111111111112222221111000000000","0000011001111111111111111111111111111111111000000000000000000000110000111111111111222221000000000000","0000000011111111111111111111111111111111111000000000000000000000111000111111111111222221000000000000","0000000111111111111111111111111111111111111000000000000000000000111100111111110001111111000001111000","0000001111111111111111111111111111111110000000000000000000000000011111111111110001111111000001111000","0000011111111111111111111111100000000000000000000000000000000000001111110000000001111111001111111000","0000111111111111111100000111100000000000000000000000000000000000000111110000000001122211001100000000","0000111111111111110000000111100000000000000000000000000000000000000011111000000011122211111100000000","0000111111111111000000000000000000000000000000000000000000000000000000111111111111122211111111000000","0000111110001111000000000000000000000000000000000000000000000000000000011111111111222221111111100000","1111111100001111000000000000000000000000000000011110000000000000000000001111111112222222111111110000","1111111100000000000000000000000000000000000000011110000000000000000000000111111122222222211111110000","1111111100000000000000000000000000000000000000011110000000000000000000000000112222222222221111110000","0001111100000000000000000000000000000000000000000000000000000000000000000000112222222222221111110000","0001111100000000000000000000000000000000000000000000000000000000000000000000002222222222221111110000","0011111100000000000000000000000001111111111111111111111110000000000000000000002222222222221111110000","1111111100000000000000000000000011111111111111111111111111000000000000000000002222222222221111110000","1111111100000000000000000000000110000111111111111111100001100000000011110000002222222222221111110000","1111111000000000000000000000001100000111111111111111100000110000000011110000002222222222221111110000","1111110000000000000000000000001100001111111111111111111000110000000011110000002222222222221111110000","1111100000000000000000000000001100011111100000000011111000110000000000000000022222222222211111110000","1111000000000000000000000000001100111111100000000011001100110000000000000000022222222222211111110000","1110000000000000000000000000001100111111100000000011001100110000000000000000222222222222200000110000","1100000000000000000000000000001100111111100000000011111100110000000000000000222222222222200000110000","0000000000000000000000000000001100111100111111111111111100110000000000000002222222222222200000110000","0000000000000000000000000000001100111100111111111111111000110000000000000002222222222222000000110000","0000000000000000000000000000001100011111111111111111110000110000000000110022222222222222000000110000","0000000000000000000000000000001100001111111111111111100000110000000000111222222222222220000000110000","0000000000000000000000000000001100000111111100000000000000110000000000002222222222222220000000110000","0000000000000000000001111000001100000011111100000000000000110000000000002222222222222220000000110000","0000000000000000000001111000001100000000111100000000000001110000000000022222222222222200000000110000","0000000000000000000001111000001100111100111100100010000011110000000000022222222222222000000000110000","0000000000000000000000000000001100111100011111100011111111100000000000222222222222220000000000110000","0000000000000000000000000000001100111100011111100011111111100000000000222222222222220000000000110011","1100000000000000000000000000001100000000111111100011111111111000000002222222222222200000000000111111","1110000000000000000000000000001100000001111111100011111111111000000002222222222222200000000000111111","1111000000011110000000000000001110000011110000100010000001111000000002222222222222000000000000011111","1111100000011110000000000000001111000111100000000000000000000000000002222222222222000111100000001111","1111100000011110000000000000000111111111000000000000000000000000000002222222222220000111100000000111","0001100000000000000000000000000011111110000000000000000000000000000002222222222220000111100000000011","0001100000000000000000000000000001111100011110000000000000000000000002222222222220000000000000000000","0001100000000000000000000000000000111000011110000000000000000000000002222222222220000000000000000000","0001100000000000000000000000000000000000000000000000000000000000000002222222222220000000000000000000","1000110000000000000000000000000000000000000000000000000000000000000011111111111111000000000000000000","1100011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","0100001111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000","0100000111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000","0110000111111100110000000000000000000000000000000000000000000000000000000000000000000000000000000000","1111111111111100011000000000000000000000000000111110000000000000000000000000000000000000000001111111","1100000000001100011000000000000000000000000000100010000000000000000000000000000000000000000011111111","1100000000001100011000000000000000000000001111100010000000000000000011111111111111000000000111100000","1111111111111100011000000000000000000000001111100010000000000000000002222222222220000000001111100000","1111111111111100011000000000000000000000001111100010000000000000000002222222222220000000001111111111","0000000000001111111000000000000000000011111111111110000000000000000002222222222220000000001100110000","0000000000001111111000000000000000000011000000011110000000000000000002222222222220000000001100100000","0000000000001111111000000000000000000011000000011110000000000000000002222222222220000000001100100000","0000000000000000011000000000000000000011111111111110000000000000000002222222222220000000001100111111","0000000000000000011000000000000000000001111111111100000000000000000002222222222220000000001100111111","0000000000000000011000000000000000000000000000000000000000000000000002222222222220000000001100111111","0000000000000000011000000000000000000000000000000000000000000001100022222222222220000000001100100000","0000000000000011111000000000000000000000000000000000000000000001100222222222222220000000001100100000","0000000000000011111000000000000000000000000000000000000001111000002222222222222220000000001100100011","0000000000000011111000000000000000000000000000000000000001111000002222222222222220000011111100100011","0000000010000111111000000000000000000000000000000000000001111000022222222222222200000011111100100000","0000001110000111110000000000000000000000000000000000000000001000022222222222222200000011111100100000","0000011110000111100000000000000000000000000000000000000000002222222222222222222000000011111000100000","0000111110000111000000000000000000000000000000000000000000222222222222222222222000000011111000100000","0000111110000110000000000000001111111111111100000000000022222222222222222222220000000111111001111100","1111110010000100000000000000001111111111111100000000000222222222222222222222220000001111111111001100","1111110000000000000000000000001111111100011100000000002222222222222222222222200000001111111111000000","1111110000000000000000000000001111111100011100000000002222222222222222222222200000001111111111000000","0000110000000000000000000000001111111100011100000000022222222222222222222222000000001110000001111111","0000110000000000000000000000001111111100011100000000022222222222222222222220000000001110000000111111","0111110000000000000000000000001111111100111100000000222222221122222222222200000000001111000000100110","0111110000000000000000000000001111111111111100000000222222221122222222222000000000000111111111100110","0000110000000000000000000000001111111111111100000002222222222222222222220000000000000011111111111110","0000110000000000000000000000001111111111111100000002222222222222222222200000000000000001111111111000","0000111111000000000000000000001111111111111100000002222222222222200000000000000000000000111111111000","0000111111000000000000000000000111111111111000000002222222222222100000000000000000000000000111111000","0000111111000000000000000000000000000000000000000002222222222222111100000000000000000000000111111000","0000111111111111111000000000000000000000000000000112222222222221111100000000000000000000000111111000","0000111111111111111000000000000000000000000000000112222222222221111100000000000000000000000111111000","0000111111111111111000000000000000000000000000000012222222222200000000000000000000000000000111111000","0000011111111111111111100000000000000000000000000022222222222200000000000000000000000001111111111000","1100001111111111111111110001111000000000000000000022222222222200000000000000000000000001111111111000","0110000000000000000111111001111000000000000000000022222222222200000000000000000000000001111111111000","0010000000000000000111111100000000000000000000000022222222222200000000000000011111111111111111110000","0011000000000000000111111100000000000000000000000022222222222200000000000000111111111111111111100000","0001111111111111111100001100000000000000000000000022222222222200000000000001100000000000000000000000","0000000000000000000100001100000000000000000000000022222222222200000000000011000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t1:{x:1760,y:48},s2:{x:656,y:1008},s6:{x:2064,y:1072},t2:{x:1552,y:1200},t7:{x:48,y:1248},s1:{x:304,y:1680},t3:{x:3152,y:1728},s5:{x:1776,y:1776},s3:{x:880,y:1936},s7:{x:2736,y:2000},t6:{x:48,y:2240},s4:{x:720,y:2672},s8:{x:2448,y:2736},t5:{x:1216,y:3152},t4:{x:2176,y:3152}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','t4','main');
			s.setRespawn(key,'main','t4','main');
		},'zone','up','main');
		
		m.spawnSkillPlot(spot.s6,'QcollectFight','hunt-squirrel',0);
		m.spawnSkillPlot(spot.s2,'QcatchThemAll','hunt-squirrel',0);
		m.spawnSkillPlot(spot.s7,'QkingOfTheHill','hunt-squirrel',0);
		m.spawnSkillPlot(spot.s4,'Qsoccer','hunt-squirrel',0);
		m.spawnSkillPlot(spot.s8,'QpuzzleSwitch','hunt-squirrel',0);
		
		m.spawnTeleporter(spot.t2,function(key){
			s.removeQuestMarker(key,'wiseOldMan');
			s.teleport(key,'wiseOldManCave','t1','main');	
			s.setRespawn(key,'south','t2','main');
		;},'cave',{
			tag:{wiseOldManCave:true},
		});
	}
});
s.newMap('north',{
	name:"Northern Mountains",
	lvl:0,
	screenEffect:'weather',
	grid:["0000000001100000000000000000000000011000000000000100000000100011000010001000000011000000110000000000","0000000001100000000000000000000000111000000000000100000000100011000011111111110011000000110000111100","0000000001100000000000000000000001111000000000000100000000100011000011111111110000000000110001111111","0000000011100000001111111111111111111111111100000100000000100011100001110011110000111111111111111111","0000000111100000011111111111111111111111100110000100000000100011110000000011110001111111111111111111","0000011111000000111111111111111111001111100110000100000000100001111000000011111111111111111111000011","0000111111000000111111111111111110001110000110000100000000100000111100000111111111111111111110000000","0001111111111000111111110000000000000110001110001100000000100000011111111111111111000000000000000000","1111111001111000111111110000000000000011111111111000000000110000011111111111111110000000000000000000","1111100001111000111111110000000000000001111111110000000000011111111111111100000000000001111111111111","1111000000000001111111110000000000000000000111110000000000000000011111111000000000000011000000000000","1110000000000011111111110000000000000000000111000000000000000000001000000000000001111110000000000000","0000000001111111100011100000000000000000000011000000000000000000001000000000000011000000000000000000","0000000011111111000000000000000000000000000001110000000000000000000000000000000010000000000000000000","0000000111111110000000000000000000000000000001111000000000000000000000000000000000000000000000000000","0000000111111100000000000000022000000000000001001000000000000000000000000000000000000000000000000000","0111000110000000000000000002222200000000000011001000000000000000000000000000000000000000000000000000","1111100110000000000000000222222220000000000011001000000000000011111000000000000000000001111111111111","1111100110011110000000022222222200000000000011111000000000000011111100000000000011000001111110000000","1111100110011110000000222222222000000000000011111000000000000011111111110000000001111111111110000000","1111000110000000000002222222220000000000000111111111110000011111111111111000000000111111000110000000","0010000110000000000002222222000000000000001100000000000000000000000000001100000000000001000011111111","0000000110000000000022222220000000000000011000000000000000000000000000000111110000000001000001111111","0000000110000000000022222200000000000000110000000000000000000000000000000011111000000001100000000000","0000000110000000000002222000000000000001100000000000000000000000000000000000001100000000110000000000","1111000110000000000000220000000000000011000000011111111111111111111110000000000110000000011111111111","1111000110000000000000000000000000000110000000111111111111111111111111000000000110000000001111111111","1111000110000000000000000000000000000110000001111111111001100001111111100000000110000000000000000000","0000001110000000000000000000000000000110000001111111111001100001111111100000000110000000000000000000","0000011110000000000000000000011000011100000001100000001111100111110001100000000110000000000000000000","0001111100000000000000000000111000011000000001100000000111111110000001100000000011111000000000000000","1111111000000000000000000001111000000000000001100000000011111000000001100000000001111100000000000000","1111110000000000000000000011111000000000000001100000000000000000000001110000000000011110000000000000","1111100000000000000011000111111000000000000011100000000000000000000001111000000000011111000000000000","1110000000000000000011001111111000000000000111100001111000000000000000111111100000000011001111000000","0000000000000000000011111000111111111111111111100001111000000000000000011111110000000011001111000000","0000000000000001111111110000111111111111111111100000000000000000000000001111111000000011000000000000","0000000000000011111111100001111111111111111100100000000000000000000000000111111000000011000000000000","0000000000000111111111100001111111111111111000100000000000000000000000000111111000000011000000000000","0000000000001111100001100001100000000000000000000000000000000000000000000111111000000011000000000000","0000000000001111100000110001100000000000000000000000000000000000000000000111111000000001111111111111","0000000011111111111100011001100000000000000000000000000000000000000000000111111000000000111111111111","0000000011111100111110001111100000000000000000000000000000011000000000000000111000000000000001111100","0000000011111100100010000111100000000000000000000000000000011000000000000000111000000000000001111100","1111111111111001100010000111100000000000000000100000000000011000000000000001111100000000000001111100","1111111111110001100011001111100000000000000000100000000011111111000000000001111100000000000001111100","1111111111110000000011111111100000000000001100100000000111111111100000000001111100000000000000111000","1111111111111110000001111001100000000000001111100000000111111111100000000001111110000100000000111000","0000000000000110000000000001100000000000000111000000000111111111100000000000111110000111111111111111","0000000000000110000000000011100000010000100110000000000111111111100000000000011110000111111111111111","0000000111111110000000000111111111110000111100000000000111111111100000000000001110000111111111111111","0000011111111100000011111111111111110000111100000000001100000000100000000000000110000111111111111111","1111111000000000000111111111111111110000111111100000011000000000100000000000000010000100000000000000","1111100000000000001111111100111111110000111111111111111000000000100000111100000000000000000000000000","0000000000000000001111111000111111110000100000011111111000000000100000111100000000000000000000000000","0000000000000110001100000000111111000000000000000000011000000000100000000000000000000000000000000000","0000000000000110001100000000111111000000000000000000000000000000100000000000000000000000000000000000","0000000000000000011100111100110000000000000000000000000000000000100000000000000000000000000000000000","0000000000000000111100111100110000000000000000000000000000000000100000000000000000000000000000000000","1111111111111111111000111100110000000000000000000000000000000000100000000000000000000000000000000000","1111111111111111110000000000110000000000000111100000000000000000100000000000111111111111111111111111","1111111111111111100000000000011110000000000111100000000000000000100000000001111000000000000000000000","1111111111111111000011111110001111000000000111100000000000011111100000000001111000000000000000000000","0000000000000000000110000011000001100000000000000000000000011111100000000001111000111111111111111000","0000000000000000000110000001000000110000000000000000000000011111100000000001000001111111111111111100","0000000000000000000111100001000000110000000000000000000000011111100000000001000011111100000001100111","0000000000000000000111100001100000110000000000000001111111111111000000000001000111111100000001100111","0000000000000000001100001111111110011111110000000011111110000000000000000001000111111100000000000111","0000000000000001111000001111000011001111111000000011111110000000000000000001000110000000000000001111","0000000000000011000011001111000011000111111100000010000000000000000000000011000110000001100011111111","1111111111000011000011001111000011000111100110000010000000000011111111111110000110000001100011111100","1111111111100011000000000001000110000111100110000010000000000111111100000000000111000000000111111000","1111111111110001100000000001111100000111111110000010000000000100111100000000000111100000001111110000","1111111111111000111111111111111000000111111110000010000000000100111100000000000011111111111110000000","0000000011111000011111111110000001111111111100000011000000000111111100000000000001111111111100000000","0000000011111000000000000000000011111111111000000001111111111111111100000000000000111111111000000000","0000000011111000000000000000000111111111110000000000111111111111111110000000000000011111110000000000","0000011110011000000000000000001111111111110010000100111000011111111111000000000000000000000000000000","0001111100011000000000000000001111111111111110000111111000011001111111100000000000000000000000000000","1111100000111000000000000000001111111111111110000111111100000000111111100000000000000000000000000000","1110000001111000000000000110001111111000000010000111111100000000011111100000000000000000000000000000","0000000111110000000000000110001111111000000000000001111100000000011111100000000000000000000000000111","0000001111110000000000000000001111111000000000000001111000000000011111110000000000000000000000001111","0000011111111111111000000000011111111000000000000000000000000000011111111001000010000000000000011000","1111111111111111111100000000111110000000000000000000000000000000000000111111000011100000000000110000","1111111000111111100100011111111110000000000000000000000000000000000000011111000011110000000000110000","1111110000111111100100111111110010000000000000000000000100000000000000001111000011111000000000110000","1111100000011111111111111111100010000000000000000000001100000000000000000111000011111000000000110000","0000000000001111111001111111000010000000000000001111111100000000000000000001000010011000000000110000","0000000000000111110001111111000010000000000001111110000000000000000000000000000000011000000000110000","0000000000000011100001111111000010000100001001111110000000000111100000000000000000011000000000110000","0000000000000000000011111111000010011100001111110000000000000111100000000000000000011000000000110000","0000000000000000000111111111000011111100001111110000000000000111100000000000000011111000000000110000","0000000111111111111111000000000011111100001001110000000000000000000000000000000011111111111111110000","0000001111111111111110000000000011111000000000110000000000000000000000111111111111111111111111111111","0000011111111111111100000000000011111000000000110000000000000000000001111111111111111100000000011111","0000011111111111111000000000000011000000000000111111100000000000000011001111000000011100000000011111","0000011111100000000000000000000011000000000000111111111111111111100110001111000000011100000000011111","0000011111100000000000000000000011000000000000111111110000000000111110001111000000011110000000011111","0000011111100000000000000000000011000000000000110000100000000000011110001111000000001111111111111111"],
	tileset:'v1.2'
},{
	spot:{t3:{x:1728,y:48},s4:{x:1120,y:208},t8:{x:880,y:208},t4:{x:3152,y:432},s5:{x:3104,y:848},s3:{x:2160,y:976},e2:{x:1936,y:1200},t7:{x:1232,y:1232},t2:{x:48,y:1264},s6:{x:976,y:1296},g1:{x:1888,y:1664},b1:{x:2592,y:1632,width:128,height:32},t5:{x:3152,y:1792},e1:{x:1584,y:1936},s8:{x:1216,y:2064},s1:{x:2304,y:2288},s2:{x:1840,y:2288},a:{x:2768,y:2448},t6:{x:3152,y:2448},e3:{x:2416,y:2512},s7:{x:2896,y:2864},t1:{x:1280,y:3152}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','t1','main');
			s.setRespawn(key,'main','t1','main');
		},'zone','down','main');
		m.spawnBlock(spot.b1,function(){ return true; },'spike');	
		
		m.spawnSkillPlot(spot.s6,'QlureKill','rock-bronze',0);
		m.spawnSkillPlot(spot.s2,'Qminesweeper','rock-bronze',0);
		m.spawnSkillPlot(spot.s7,'Qfifteen','rock-bronze',0);
	}
});
s.newMap('nwLong',{
	name:"Long House",
	lvl:0,
	grid:["00000000000000000000000000000000","00000000000000000000000000000000","00011111111111100111111110000000","00011111111111100111111110000000","00011111111111100111111110000000","00011111111111100111111111110000","00011111111111100111111111110000","00011111111111100111111111110000","00011111111111100111111111110000","00011111111111100111111111110000","00011111111111100111111111110000","00011111100001111110000111110000","00011111100001111110000111110000","00011111100001111110001111110000","00011111100001111110001111110000","00011110000001111110000000110000","00011110000001111110000000110000","00011110000001111110000000110000","00011000000001111110000000110000","00011000000001111110000000110000","00011000000001111110000000110000","00011000000000000000000000110000","00011000000000000000000000110000","00011000000000000000000000110000","00011000000000000111110000110000","00011000000000001111111000110000","00011110000000001111111100110000","00011110000000001111111100110000","00011110000000001111111100110000","00011110000000001111111000110000","00011110000000000000000000110000","00011000000000000000000000110000","00011000000000000000000000110000","00011111100000000000000000110000","00011111100000000000000000110000","00011111100000000000000111110000","00011111100000000000000111110000","00011111100000000000000111110000","00011111111111111111111111110000","00011111111111111111111111110000","00011111111111111111111111110000","00011111111111111111111111110000","00011111111111111111111111110000","00000001111111111111111110000000","00000001111111111111111110000000","00000001111111111111111110000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{n1:{x:368,y:912},t1:{x:528,y:1168},t2:{x:528,y:1456}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','t7','main');
			s.setRespawn(key,'main','t7','main');
		},'zone','down','main');
	}
});
s.newMap('high',{
	name:"High House",
	lvl:0,
	grid:["00000000000000000000000000000000","00000001111111111111111111000000","00000001111111111111111111000000","00000001111111111111111111000000","00001111111111111111111111111000","00001111111111111111111111111000","00001111111111111111111111111000","00001111110011111111111111111000","00001111110011111111111111111000","00001111110010000011111111111000","00001111110010000000000011111000","00001111110010000000000000011000","00001100010010000000000000011000","00001100000000000000000000011000","00001100000000000001100000011000","00001100000000000011110000011000","00001100000000001111111110011000","00001100000000001111111110011000","00001100000000011111111110011000","00001100000000011111111110011000","00001100000000011111111110011000","00001100000000001111111110011000","00001100000000000011110000011000","00001100000000000011110000011000","00001111110000000001100000011000","00001111110000000000000111111000","00001111110000000000000111111000","00001111100000000000000011111000","00001111100000000000000011111000","00001111100000000000000011111000","00001111111111111111111111111000","00001111111111111111111111111000","00001111111111111111111111111000","00001111111111111111111111111000","00000001111111111111111111000000","00000001111111111111111111000000","00000001111111111111111111000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:352,y:384},n1:{x:368,y:592},t1:{x:528,y:928}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','b','main');
			s.setRespawn(key,'main','b','main');
		},'zoneLight','down','main');
	}
});
s.newMap('transitionMap',{
	name:"Transition Map",
	lvl:0,
	graphic:'QfirstTown-main',
},{
	spot:{a:{x:752,y:592}},
	load:function(spot){
		
	}
});
s.newMap('southWestHouse',{
	name:"Tree House",
	lvl:0,
	grid:["0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111000000000000111111110000000","0000001111111000000000000000000110000000","0000001111111000000000000000000110000000","0000001111111000000000000000000110000000","0000001111111000000000000000011110000000","0000001111111000000000000000011110000000","0000001111100000000000000111111110000000","0000001111100000000000000111111110000000","0000001111110000000000000111111110000000","0000001111110000000000001111111110000000","0000001111100000000000001111111110000000","0000001111100000000000001111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000001111111111111111111111111110000000","0000000001111111111111111100000000000000","0000000001111111111111111100000000000000","0000000001111111111111111100000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{n1:{x:640,y:464},t1:{x:560,y:656}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','a','main');
		;},'zone','down','main');
	}
});
s.newMap('wiseOldManCave',{
	name:"Wise Man Cave",
	lvl:0,
	screenEffect:'lightCave',
	grid:["0000010012221000110000000000000000000000","0000010012221000110000000000000000000000","0000010012221000111000001111111100000000","0000110012221000111111111111111110000000","0001100011111000111111110000000010000000","1111000011111000000000000000000010000000","1110000011111000000000000000000011000000","1000000111211000000000000000000001100000","0000011111211111111111111111111100111000","0000111112221111111111111111111110011100","0001111122222111111111111111111111000100","0001111222222211111111111111111111000100","0001122222222222111111111111111111000100","0001122222222222111111111111111111001100","0001122222222222111111110000000011111000","0001122222222222000000000000000011110000","0001122222222222000000000000000011110000","0001122222222220000000000000000011110000","0001122222222200000000001111111111110000","0000111122220000000000001111111111110000","0000011112000000000000001111111111110000","1100000011000000000000000000000011110000","1110000001100000000000000000000011110000","0011000001100000000000000000000011111000","0001100001100000000000000000011111001100","0001100000111100000000000000111111000111","0000111100011110000000000001100011000011","0000011110001111000000000011000011000000","0000000011001111100000000011001111100000","0000000001100111100000000011111000110000","0000000001100001100000000011110000010000","0000000001100001100000000011110000010000","0000000001100001100000000011110000011000","0000000001100000111111111110010000001100","0000000000110000011111111100010000001111","0000000000011000000000000000111111111111","0000000000001100000000000001111111111111","0000000000000110000000000001001111111111","0000000000000110000000000001000111111000","0000000000000110000000000001000111111000"],
	tileset:'v1.2'
},{
	spot:{n1:{x:656,y:624},t1:{x:688,y:1008}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-south','t2','main');
		;},'zone','down');
		
		m.spawnActor(spot.n1,'npc',{
			name:"Wise Old Man",
			sprite:s.newNpc.sprite('villagerMale-3',1),
			tag:{wiseOldMan:true},
			dialogue:function(key){
				s.startDialogue(key,'WiseOldMan','intro');
			}
		});
	},
});
s.newMap('northEastHouse',{
	name:"Brian's House",
	lvl:0,
	grid:["0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111110000001111111100000000000","0000000111111110000001111111100000000000","0000000111111110000000000001100000000000","0000000111100000000000000001100000000000","0000000111100000000000001111100000000000","0000000111111111100000011111100000000000","0000000111111111100000011111100000000000","0000000111111111100000011111100000000000","0000000111111111100000011111100000000000","0000000111111111100000011111100000000000","0000000111111111100000011111100000000000","0000000111111111100000001111100000000000","0000000111111111100000001111100000000000","0000000111111111000000000001100000000000","0000000111111111000000000001100000000000","0000000110000000000000000001100000000000","0000000110000000000000000001100000000000","0000000110000000000000000001100000000000","0000000111111000000000000001100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000111111111111111111111100000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{n1:{x:656,y:496},t1:{x:640,y:816}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'main','c','main');
		;},'zone','down','main');
	}
});
s.newMapAddon('Qtutorial-genetosHouse2',{
	spot:{n1:{x:880,y:560},t1:{x:976,y:784}},
	load:function(spot){
		
	}
});
s.exports(exports);
