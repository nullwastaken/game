var Actor = require2('Actor'), Debug = require2('Debug');
//01/08/2015 5:06 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

var s = loadAPI('v1.0','Qtutorial',{
	name:"GPS Tutorial",
	author:"rc",
	alwaysActive:true,
	admin:true,
	dailyTask:false,
	showWindowComplete:false,
	autoStartQuest:false,
	skillPlotAllowed:true,
	showInTab:false,
	thumbnail:'',
	reward:{"exp":1,"item":0,"reputation":{"min":1,"max":1,"mod":10}},
	description:"Teaches you the basic of Raining Chain.",
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
BAD:
-destroy baricade
-bow crafting
-assign ability
-hide buttons

//todo: removed boss attribute
destroy barricade
push block
activate lever
talk ringo
break target
kill all monsters
loot chest
assign heal
pass lava
get 2 leaves
make bow
kill boss
*/

s.newVariable({
	teleportedToAdmin:0,
	killBarricade:0,
	tgOn:0,
	talkRingo:0,
	killTarget:0,
	killBoss:0,
	killEnemy:0,
	killMushroom:0,
	lootChest:0,
	learnHeal:0,
	assignedHeal:0,
	walkedOverLava:0,
	lootChest2:0,
	upgradedEquip:0,
	bossStarted:0,
	talkGenetos:0,
	haveClickedDoor:0,
});

s.newEvent('_start',function(key){ //
	s.addEquip.permanently(key,'Qsystem-start-amulet');
	s.addEquip.permanently(key,'Qsystem-start-ring');
	s.addEquip.permanently(key,'Qsystem-start-helm');
	s.addEquip.permanently(key,'Qsystem-start-body');
	
	s.teleport(key,'QfirstTown-main','t1','main');
	s.setRespawn(key,'QfirstTown-main','t1','main',true);
		
	s.callEvent('updateHUD',key);
	
	s.setTimeout(key,function(){
		s.displayPopup(key,'ADWS to move. '
			+ '<span style="cursor:pointer;font-size:0.7em;color:blue;text-decoration:underline" title="Switch to AZERTY bindings. Can also be changed in settings (bottom right)." onclick="Input.usePreset(\'azerty\');">AZERTY?</span>'
			+ ' <span style="cursor:pointer;font-size:0.7em;color:blue;text-decoration:underline" title="Switch to QWERTY bindings. Can also be changed in settings (bottom right)." onclick="Input.usePreset(\'qwerty\');">QWERTY?</span>'
			+ '<br>Use mouse to interact and aim'
			+ '<br>Small screen? Press Ctrl-'
		);
	},25*1);
	
	if(Debug.isActive() && Debug.getAttr('SKIP_TUTORIAL'))
		s.setTimeout(key,function(){
			s.callEvent('skipTutorial',key);
		},25*1);
});
s.newEvent('_debugSignIn',function(key){ //
	s.callEvent('_signIn',key);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'teleportedToAdmin')) return 'ASDW to move.';
	if(!s.get(key,'talkGenetos')) return 'Left-Click to talk with Genetos.';
	if(!s.get(key,'haveClickedDoor')) return 'Open one of the door.';
	if(!s.get(key,'killMushroom')) return 'Left-Click to kill the mushroom.';
	if(!s.get(key,'tgOn')) return 'Activate the switch to free the man.';
	if(!s.get(key,'talkRingo')) return 'Talk with Ringo.';
	if(!s.get(key,'killTarget')) return 'Destroy the target with your new ability (Right-Click).';
	if(s.get(key,'killEnemy') < 6) return 'Kill all monsters.';
	if(!s.get(key,'lootChest')) return 'Loot the chest!';
	if(!s.get(key,'learnHeal')) return 'Read the scroll you just looted.';
	if(!s.get(key,'assignedHeal')) return 'Assign the ability Healing to a key binding.';
	if(!s.get(key,'walkedOverLava')) return 'Press F key to use Healing Ability while traversing the lava north.';
	if(!s.get(key,'lootChest2')) return 'Search for a chest.';
	if(!s.get(key,'upgradedEquip')) return 'Upgrade one of your equip before fighting the dragon.';
	if(!s.get(key,'killBoss')) return 'Kill the Dragon Boss!';	
	return "Congratz! Go talk with Genetos.";
});
s.newEvent('skipTutorial',function(key){ //
	Debug.skipTutorial(key);
});
s.newEvent('_complete',function(key){ //
	s.restoreHUD(key);
	s.startDialogue(key,'genetos','whatrep');
});
s.newEvent('updateHUD',function(key){ //
	s.setHUD(key,'tab-equip','invisible');
	s.setHUD(key,'tab-ability','invisible');
	s.setHUD(key,'tab-stat','invisible');
	s.setHUD(key,'tab-quest','invisible');
	s.setHUD(key,'tab-reputation','invisible');
	s.setHUD(key,'tab-highscore','invisible');
	s.setHUD(key,'tab-friend','invisible');
	s.setHUD(key,'tab-homeTele','invisible');
	
	s.setHUD(key,'pvpLookingFor','invisible');	
	s.setHUD(key,'mana','invisible');
	s.setHUD(key,'party','invisible');
	s.setHUD(key,'clan','invisible');
	s.setHUD(key,'bottomChatIcon','invisible');
	s.setHUD(key,'curseClient','invisible');
	s.setHUD(key,'aboveInventory','invisible');
	
	if(s.get(key,'learnHeal')){
		if(!s.get(key,'assignedHeal'))
			s.setHUD(key,'tab-ability','flashing');
		else s.setHUD(key,'tab-ability','normal');
	}
	if(s.get(key,'lootChest2')){
		if(!s.get(key,'upgradedEquip'))
			s.setHUD(key,'tab-equip','flashing');
		else s.setHUD(key,'tab-equip','normal');
	}
});
s.newEvent('_signIn',function(key){ //
	//teleport
	if(s.get(key,'lootChest2') && !s.get(key,'upgradedEquip'))
		s.callEvent('displayPopupEquip',key);
		
	if(s.get(key,'learnHeal') && !s.get(key,'assignedHeal'))
		s.callEvent('displayPopupHeal',key);
	
	s.callEvent('updateHUD',key);
});

s.newEvent('talkGenetos',function(key){ //
	if(!s.get(key,'talkGenetos')){
		s.startDialogue(key,'genetos','first');
	} else {
		s.startDialogue(key,'genetos','town');
	}
});
s.newEvent('teleAdminTutorial',function(key){ //
	if(s.get(key,'talkGenetos')){
		s.teleport(key,'main','t2','solo',true);
		s.setRespawn(key,'main','t2','solo',true);
		s.displayPopup(key,'Make your way to Town using the Quest Hints below the minimap.');
		s.setHUD(key,'questHint','flashing',25*10);
		s.addAbility.permanently(key,'Qsystem-start-melee',0);
		s.set(key,'haveClickedDoor',true);
	} else {
		s.message(key,"That's a weird door.");
	}
});
s.newEvent('doorSkipTutorial',function(key){ //
	s.displayQuestion(key,'Skip tutorial? Highly unrecommended to new players.','skipTutorial');
});

s.newEvent('killBarricade',function(key){ //
	s.set(key,'killBarricade',1);
});
s.newEvent('talkRingo',function(key){ //
	if(s.get(key,'talkRingo')) 
		return s.startDialogue(key,'ringo','second');
	
	s.startDialogue(key,'ringo','first');
	s.set(key,'talkRingo',1);
});
s.newEvent('doneTalkGenetos',function(key){ //
	s.set(key,'talkGenetos',true);
	s.setHUD(key,'questHint','normal');
});
s.newEvent('viewChest',function(key){ //
	if(s.get(key,'lootChest')) return false;
	if(s.get(key,'killEnemy') >= 6) return true;
	return null;
});
s.newEvent('killEnemy',function(key){ //
	s.add(key,'killEnemy',1);
});
s.newEvent('lootChest',function(key){ //
	s.addItem(key,'ability');	
	s.set(key,'lootChest',1);
	s.setRespawn(key,'main','g1','solo',true);
	s.displayPopup(key,'Sweet, a scroll!<br>You can use items with left-click and right-click<br> in your inventory at bottom right.');
	s.message(key,'Sweet, a scroll!<br>Left click it.');
	s.setHUD(key,'inventory','flashing');
});
s.newEvent('itemAbility',function(key){ //
	s.addAbility.permanently(key,'Qsystem-start-heal',null);
	s.removeItem(key,'ability');	
	s.setHUD(key,'inventory','normal');
	
	s.message(key,'You have learned the ability Healing.');
	s.displayPopup(key,'To use Healing ability, you will need to assign it to a Key Bind.');
	s.callEvent('displayPopupHeal',key);
	s.set(key,'learnHeal',1);
	s.setHUD(key,'tab-ability','flashing');
});
s.newEvent('displayPopupHeal',function(key){ //
	s.setTimeout(key,function(){
		s.displayPermPopup(key,'Assign Heal ability to F Key via Ability Window (bottom-right icon).<br>Select Heal then click F slot to the left.');	
		
		var func = function(key){
			if(s.hasAbility(key,'Qsystem-start-heal')){
				s.set(key,'assignedHeal',true);
				s.setHUD(key,'tab-ability','normal');
				s.closePermPopup(key);
				s.displayPopup(key,'You can now press F to fully replenish your health.');
			} else {
				s.setTimeout(key,func,5*25);
			}
		};
		func(key);
	},25*3);
	
});
s.newEvent('lootChest2',function(key){ //
	s.addItem.permanently(key,'Qsystem-start-bow');
	s.addItem.permanently(key,'Qsystem-start-staff');
	s.addItem.permanently(key,'Qsystem-start-weapon');
	s.setRespawn(key,'main','g2','solo',true);
	s.set(key,'lootChest2',1);
	s.displayPopup(key,'You just received a mace, a bow and a staff!<br>'
		+ 'Equip and upgrade one of them before fighting the dragon.<br><br>'
		+ 'Mace: +50% <span class="shadow" style="color:orange">Melee</span> & <span class="shadow" style="color:red">Fire</span> Dmg<br>'
		+ 'Bow: +50% <span class="shadow" style="color:green">Range</span> & <span class="shadow" style="color:red">Fire</span> Dmg<br>'
		+ 'Staff: +50% <span class="shadow" style="color:purple">Magic</span> & <span class="shadow" style="color:cyan">Cold</span> Dmg<br>'
		+ '<br><span style="font-size:0.8em">Note: You can use any ability with any weapon. Effectiveness will be impacted though. You can change weapon and ability at any time.</span>');
	s.callEvent('displayPopupEquip',key);
	s.setHUD(key,'tab-equip','flashing');
});
s.newEvent('displayPopupEquip',function(key){ //
	s.setTimeout(key,function(){
		s.displayPermPopup(key,'To upgrade gear, open Equip Window (bottom-right icon) then either Add Exp or Unlock Hidden Boost');	
				
		var func = function(key){
			var upgraded = false;
			var allDestroyed = true;
			var equip = Actor.getEquip(Actor.get(key));
			for(var i in equip.piece){
				if(equip.piece[i]){
					allDestroyed = false;
					if(!equip.piece[i].$contains('Qsystem-',true)){
						upgraded = true;
						break;
					}
				}
			}
			if(upgraded || allDestroyed){
				s.set(key,'upgradedEquip',true);
				s.setHUD(key,'tab-equip','normal');
				s.closePermPopup(key);
				s.displayPopup(key,'You are now ready to fight the dragon boss.');
			} else {
				s.setTimeout(key,func,5*25);
			}
		};
		func(key);	
	},25*3);
});
s.newEvent('learnArrow',function(key){ //
	s.addAbility.permanently(key,'Qsystem-start-bullet',1);
});
s.newEvent('viewChest2',function(key){ //
	return !s.get(key,'lootChest2');
});
s.newEvent('killBoss',function(key){ //
	if(!s.get(key,'killBoss')){
		s.displayPopup(key,'You just learned 3 new abilities.<span style="text-align:left"><br>-Shift-Left Clk: Freeze<br>-Shift-Right Clk: Fire<br>-Space Bar: Invincibility dodge</span>');
		
		s.addAbility.permanently(key,'Qsystem-start-freeze',2);
		s.addAbility.permanently(key,'Qsystem-start-fireball',3);
		s.addAbility.permanently(key,'Qsystem-start-dodge',5);
		
		s.setHUD(key,'mana','normal');
	}
	s.set(key,'killBoss',1);
});
s.newEvent('resourceExamine',function(key){ //
	s.message(key,'Useful material to craft weapons.');
});

s.newEvent('talkGenetosTown',function(key){ //
	if(s.testQuestActive(key,'Qtutorial'))
		s.startDialogue(key,'genetos','welcomeBack',true);
	else 
		s.startDialogue(key,'genetos','afterTutorial',true);
});
s.newEvent('questComplete',function(key){ //
	s.completeQuest(key);
});
s.newEvent('teleMainGenetos',function(key){ //
	s.teleport(key,'genetosHouse','t1','solo');
	s.setRespawn(key,'genetosHouse','t1','solo',true);	
});

s.newEvent('talkGenetosRecommend',function(key){ //
	s.openDialog(key,'questList',{onlyShow:[
		'QlureKill',
		'QprotectFirstTown',
		'Qdarkness',
		'Qrgb',
		'Qbtt000',
		'Qminesweeper',
	]});
});

s.newEvent('displayGEM',function(key){ //
	s.setHUD(key,'aboveInventory','normal');
});

s.newEvent('teleGenetosTown',function(key){	//
	if(s.testQuestActive(key,'Qtutorial')){
		return s.message(key,'Talk with Genetos first.');
	}
	if(s.testQuestActive(key,'')){	//aka no quest Active
		s.displayQuestion(key,"Leave without Genetos recommended quest?",function(){
			s.displayPopup(key,
				'Minimap Icon: <br>'  
				+ '<span style="color:purple;fontSize:2em;" class="shadow">' + CST.STAR + '</span>'
				+ ' = Quest Start<br>'
				+ '<span style="color:red;fontSize:2em;" class="shadow">X</span>'
				+ ' = Quest Directions<br><br>'
				+ 'If stuck in quest, click Door icon at bottom right corner.' );
			s.setHUD(key,'tab-homeTele','flashing',25*10);
			s.teleport(key,'QfirstTown-main','t8','main');
			s.setRespawn(key,'QfirstTown-main','t8','main',true);		
		});
	} else {
		s.displayPopup(key,'Talk with Genetos at any time for advice.<br>Check minimap big red X for quest directions.');
		s.teleport(key,'QfirstTown-main','t8','main');
		s.setRespawn(key,'QfirstTown-main','t8','main',true);	
	}
});
s.newEvent('reputationFlash',function(key){	//
	s.setHUD(key,'tab-reputation','flashing',25*15);
});

s.newItem('resource',"Red Leaf",'leaf.leaf',[    //{
	s.newItem.option('resourceExamine',"Examine","Examine.")
],''); //}
s.newItem('ability',"Ability Scroll",'plan.equip',[    //{
	s.newItem.option('itemAbility',"Learn","Learn new ability.")
],''); //}

s.newAbility('fireball','attack',{
},{
	type:'bullet',
	amount:1,
	angleRange:20,
	dmg:s.newAbility.dmg(50,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:40,
	sprite:s.newAbility.sprite('fireball',1.5)
});
s.newAbility('fireball-360','attack',{
},{
	type:'bullet',
	amount:1,
	angleRange:20,
	dmg:s.newAbility.dmg(100,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:8,
	maxTimer:25*20,
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('fireball-fast','attack',{
},{
	type:'bullet',
	amount:2,
	angleRange:90,
	dmg:s.newAbility.dmg(20,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:40,
	sprite:s.newAbility.sprite('fireball',1)
});
s.newAbility('fireball-oob','attack',{
},{
	type:'bullet',
	dmg:s.newAbility.dmg(125,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:40,
	sprite:s.newAbility.sprite('fireball',1)
});

s.newDialogue('ringo','Ringo','villager-male.0',[ //{ 
	s.newDialogue.node('first',"Thanks for saving me! I'll reward you by teaching you a new ability. Use Right-Click to use it.",[ 
		s.newDialogue.option("No problem.",'','')
	],'learnArrow'),
	s.newDialogue.node('second',"You should try shooting an arrow with Right-Click at the red and white target.",[ 
		s.newDialogue.option("Okay. I'll go do that.",'','')
	],'')
]); //}
s.newDialogue('genetos','Genetos','villager-male.2',[ //{ 
	s.newDialogue.node('first',"What! What are you doing here!?! This is an <u>unfinished admin testing zone</u>. Only the admins are allowed here.",[ 
		s.newDialogue.option("I just logged in and the error 1337 teleported me here.",'noclue',''),
		s.newDialogue.option("I'm an admin, that's why.",'imadmin',''),
		s.newDialogue.option("What are YOU doing here?",'you','')
	],''),
	s.newDialogue.node('noclue',"That's weird... Oh wait a minute! You must be the new GPS! That would explain why you're here.",[ 
		s.newDialogue.option("GPS?",'gps','')
	],''),
	s.newDialogue.node('imadmin',"Hahaha. You don't look like one at all. Admins have a badge in front of their name. According to your badge, you're the new GPS I hired.",[ 
		s.newDialogue.option("GPS?",'gps','')
	],''),
	s.newDialogue.node('you',"I'm Genetos, the famous, almighty Genetos. I'm the GPS Manager of this game. I guess you're the new GPS I hired.",[ 
		s.newDialogue.option("GPS?",'gps','')
	],''),
	s.newDialogue.node('gps',"<u>G</u>ame <u>P</u>roblem <u>S</u>olver, of course. What else could it be? Your job is to fix issues with the game.",[ 
		s.newDialogue.option("Okay?",'okay','')
	],''),
	s.newDialogue.node('okay',"Welcome to Primum, one of the worlds within Raining Chain. This game world was coded by a dumb programmer and everything is falling apart... Your job is to fix bugs.",[ 
		s.newDialogue.option("How do I find a bug?",'findbug','')
	],''),
	s.newDialogue.node('findbug',"Just go in town and talk with the villagers. They will tell you what to fix exactly. You can see bug fixing as the equivalent of completing a quest.",[ 
		s.newDialogue.option("How do I go to town?",'town',''),
		s.newDialogue.option("Fixing bugs... That seems boring...",'boring','')
	],''),
	s.newDialogue.node('boring',"Hahaha. That's what they all say at the beginning. Just trust me, your mind will be blown away when you'll realize it's not at all like you imagine. Bug fixing here is a lot different than bug fixing in other games.",[ 
		s.newDialogue.option("Ok, I'll trust you. How do I go to town?",'town','')
	],''),
	s.newDialogue.node('town',"Well... There's a little problem. Normally, new GPSs spawn directly in town. The only way out of this admin testing zone is by clicking one of the doors. I got no clue where they lead though. But like the saying goes, every road leads to town.",[ 
		s.newDialogue.option("Ok, thanks. Cya.",'',''),
		s.newDialogue.option("What door should I choose?",'whatdoor','')
	],'doneTalkGenetos'),
	s.newDialogue.node('whatdoor',"I don't know. It's not like I made this game. I don't think it matters... too much.. Choose wisely!",[ 
		s.newDialogue.option("(-_-)",'','')
	],''),
	s.newDialogue.node('welcomeBack',"Welcome back! I hope you didn't have too much trouble making it back to Town. It's time for you to fix bugs!",[ 
		s.newDialogue.option("What do I get from fixing bugs?",'reward','')
	],''),
	s.newDialogue.node('reward',"Everytime you complete a quest (by fixing a bug), your Global Exp Modifier (GEM) increases. The higher your GEM is, the more exp you get from killing monsters and harvesting resources. You can see your GEM above your inventory.",[ 
		s.newDialogue.option("I don't get it...",'dontgetit',''),
		s.newDialogue.option("What's the point of getting exp?",'pointexp','')
	],'displayGEM'),
	
	s.newDialogue.node('dontgetit',"Let say you have never completed a quest and your GEM is x1.00. Killing a certain monster will give you 10 exp. Now if you have completed 10 quests, your GEM would be x1.50 for example. Killing the same monster would grant 15 exp instead of 10.",[ 
		s.newDialogue.option("What's the point of getting exp?",'pointexp','')
	],''),
	s.newDialogue.node('pointexp',"Exp can be used to improve your equipment via the Equip Window. Exp is also used to level-up your character. You can do so by clicking the Level-Up icon next to your GEM and Exp Count. Everytime you level-up, you get 1 Reputation Point.",[ 
		s.newDialogue.option("What is a Reputation Point?",'whatrep','questComplete')
	],''),
	s.newDialogue.node('whatrep',"Reputation Points can be used to increase a stat via the Reputation Grid. It can be opened at the bottom right of your screen.",[ 
		s.newDialogue.option("What now?",'whatnow','')
	],'reputationFlash'),
	
	s.newDialogue.node('whatnow',"Go fix bugs! NPCs that appear as pink stars in your minimap will being a quest. Don't forget that you can only have one active quest at once.",[ 
		s.newDialogue.option("Okay, any tip?",'whatnow2',''),
	],''),	
	s.newDialogue.node('whatnow2',"Many NPCs reported issues to me. Either you fix the ones I recommend you or you go talk with the NPCs directly.",[ 
		s.newDialogue.option("What quest do you recommend?",'','talkGenetosRecommend'),
		s.newDialogue.option("I'll go talk with NPCs myself.",'talkSelf','')
	],''),	
	s.newDialogue.node('talkSelf',"Go in town and talk with NPCs who appears as pink stars in the minimap to start quests. Good luck!",[ 
		s.newDialogue.option("Great!",'','')
	],''),	
	s.newDialogue.node('afterTutorial',"Hello. How can I help you?",[ 
		s.newDialogue.option("What quest do you recommend?",'','talkGenetosRecommend'),
		s.newDialogue.option("What do I get from fixing bugs?",'reward2',''),
		s.newDialogue.option("What's the point of getting exp?",'pointexp2',''),
		s.newDialogue.option("What is a Reputation Point?",'whatrep2','')
	],''),
	s.newDialogue.node('whatrep2',"Reputation Points can be used to increase a stat via the Reputation Grid. It can be opened at the bottom right of your screen. (Flashing icon)",[ 
	],'reputationFlash'),
	s.newDialogue.node('pointexp2',"Exp can be used to improve your equipment via the Equip Window. Exp is also used to level-up your character. You can do so by clicking the Level-Up icon next to your GEM and Exp Count. Everytime you level-up, you get 1 Reputation Point.",[ 
	],''),
	s.newDialogue.node('reward2',"Everytime you complete a quest (by fixing a bug), your Global Exp Modifier (GEM) increases. The higher your GEM is, the more exp you get from killing monsters and harvesting resources. You can see your GEM above your inventory.",[ 
	],''),
]); //}

s.newNpc('boss',{
	name:"Dragon Boss",
	hp:10000,
	preventStagger:true,
	boss:s.newNpc.boss('dragon'),
	maxSpd:s.newNpc.maxSpd(0),
	statusResist:s.newNpc.statusResist(1,1,1,1,1,1),
	sprite:s.newNpc.sprite('dragonKing',1.2),
	moveRange:s.newNpc.moveRange(3.5,3),
	targetSetting:s.newNpc.targetSetting(10,50,90)
});

s.newMap('main',{
	name:"Tutorial",
	lvl:0,
	grid:["000000000000000000000000000000000000000000000001000000000110000000000010000000100000100111100000011000000010001100000000","000000000000000000000000000000000000000000000001000000000110001111111110000000100000100011111100001100000010001100000000","000000000000000000000000000000000000000000000001000000000000001111111110011111100000100001111110000100000010001100000000","000000000000000000000000000000000000001111000001000000000000001111111110011111100000100000111111000100000010001100000000","000000000000000000000000000000000000001111000001000011111110000111111110011111100000100000011111000100000010001100000000","000000000000000000000000000000000000001111000001000111111111000111111110011111100000100110000011000111110010001100000000","000000000000000000000000000000000000000000000001000100000001100111111100000000100000111110000011000111110010001100000000","000000000000000000000000000000000000000000000001000100000001111111100000000000100000011110000011000111110010001100000000","000000000000000000000000000000000000000000000011000100000001111110000000000000100000001111110011000111000110001100000000","000000000000000000000000000000000000001111111111000100000001111110000111100111100000000111111111000011001100001100000000","000000000000000000000000000000000000011000000000000100000001111100000111100111100000000000001111000001111000001100000000","000000000000000000000000000000011110010000000000000100000001110000000111100000100000000000001111001100110000001100000000","000000000000000000000000000000011110010000000000000100000001110000000000000000100000000000001111001100000000001100000000","000000000000000000000000000000011111110000000000001100000001111111111000000000110000000000001111100000000000011100000000","000000000000000000000000000000000111100001100000011110000001111111111100111111111111110000001111110000000000111100000000","000000000000000000000000000000000110000001100000111110000000000000000100100001111111111000001001111111111111111000000222","000000000000000000000000000000000100000000111111111110000000000000000100100000111111111000001000111111111111110000002222","000000000000000000000000000000000100000000111111111110000000000011111100100110000111111000001000011111111111100000022222","000000000000000000000000000000000100000011111111000000000000000011111100100110000111111000001000011111111111000000222222","000000000000000000000000000000000100000111001111000000000000000011111100111110000111111000001111110000000000000022222222","000000000000000000000000001111000100000110000000000000000000000000000100111111111111111000001111110000000000022222222222","000000000000000000000000001111000100000100000000000000000000000000000100011111111111111000001111110000000000222222222222","000000000000000000000000001111000100000100000000000000000000000000000110000000000000111000001111110000000012222222222222","000000000000000000000000000000000100000100000000000000000000000000000011000000000000110000000111110000000011222222222222","000000000000000000000000000000000100000100000000000000000000000000000001111111111111100000000011111111111111122222220000","000000000000000000000000000000000100000100000000000000000000000000000000111111111111000000000001111111111100000000000000","000000000000000000000011110000000100000100000000001000000100000000000000000000000000000000000000000000000100000000000000","000000000111100000000011110000000100000100000000011000000110000000000000000000000000000000000000000000000100000111111111","000000000111100011110011110000000100000100000000111000000111000000000000000000000000000000000000000000000100001100000000","000000000111100011110000010011111100111100000001111000000111100000000000000000000000000000000000000000000100001100000000","000000000000000011110000011111111100111100000001111000000111100000000000000000000000000000000000000000000100001111000000","000000000000000000000000011111111100001100000001111000000111100001110000000000000000000000000000000000000100001111000000","000000000110000000000000000000000110001100000001100000000001100011111110000000000000000000000000000000000100001000000000","000000000110000000000000000000000111111000000001100000000001100111111111100000000000000000000000000000000100001000000000","000000000011111111111111111111111111110000000001100000000001111111100001100000000000000000000000000000000100001000000000","000000000011111111111111111111111111100000000001100000000001111111100000110000000000000000000000000000000100001000000000","000000000111111111111111111111111111000000000001100000000001111100000000110000000000000000000000000000000100001000000000","000000000111111111111111111111111111000000000001100000000001111100000000110000000000000000000000000000000100001100000000","000000000111111111111001111111111111000000000001100000000001111100000000110000000000000000000000000000000100000110000000","000000000111111111111001000000000111000000000001100000000001111100011111110000000000000000000000000000000100000010000000","000000000111111111111001000000000111000000000001100000000001111100011111110000000000000000000000000000000100000010000000","000000000110000000000001000000000111000000000001100000000001111100011111110000000000000000000000000000000100000010000000","001111000110000000000001000000000111000000000001100000000001111100011111110000000000000000000000000000000111111110000000","001111000110000000000000111000111111100000000011100000000001111100000000110000000000000000000000000000000111111110000000","001111000110000000000000111000111111110000000111100000000001111100000000110000000000000000000000000000000111111110000000","000000111110000000000000000000000001111111111111000000000001111100000000111111000000000000000000000000000111111110000000","000000111110000000000000000000000000111111111110000000000001111100000000111111000000000000000000000000000111111100000000","000000000110000000000000000000000000011111111100000000000001111100000000111111000000000000000000000000000111111100000000","000000000110000000000000000000000000001111111000000000000001111100000000011111111111111100000000000001111111111100000000","000000000110000000000000000000000000000000000000000000000001111100000000011111111111111110000000000001111111111100000000","000000000110000000000000000000000000000000000000000000000001111100110011110000000000011111000000000001111111111100000000","000000000110000000000000000000000000000000000000000000000001111100110011110000000000011001111111111111111100111100000000","000110000110000000000000000000000000000000000000000000000001111110000011110000000000011000111111111111111000000000000000","000110000011110000000000000000000000000000000000000000000001111111000011110000000000000000000000000001111000000000000000","000000000001111000000000111111100000000001111100000000000001100111111111111100011000000000000000000001111110000000000000","000000000000001100000001111111110000000011111110000000000001100111111111111110011000000000000000000011111111000000000000","000000000000000110000011111111111000000111111111000000000001111111111111111111000000000000110000000110001111100000000000","000000000000000110000111111111001122221111111111100000000001111100111111111111100000000000110000001110001111110000000000","000000011110000110000111110011001122221111111111100000000001111000000000000011110000000000110000001110000011110000000000","000000011110000110000111110011001122221111000111100000000001111000000000000011111111111111111111001111000011110000000000","000000011110000110000111111111001100001111000111100000000000111111111111111111111111111111111111100111111111100000000000","000000000000000110000111111111001100001111000111100000000000011111111111111111111111111111111111110011111111000000000000","000000000000001110000111100001111100001111000111100000000000001111111111111111111111111111111111110001111110000000000000","011110000000011110000111100001111100001111111111100000000000000111111111111111111111000000000000110000111100000000000000","011110011111111100000011111111000111111100111111100000000000000000000000011111111111000000000000110000000000000000000000","011111111111111000000001111111000111111100011111100000000000000000000000011111111111000000000000111000000000000000000000","000000100000001000000000111111111110001111001111100000000000000000000000011111111111000000000000111100000000000000000000","000000100000001000000000011111111110001111001111100000000000000000000000000001111000000000000000100111111111111111111111","000111100000001000000000011111111111111100011111100000000000000000000000000001111000000000000000100011111111111111111111","000111100111111000000000011111100011111100011111100000000000000000000000000000111100000000000001100001111111111111111111","000000100111111000000000000001100011000110011111100000000000000000000000000000011100000000011111000001111111111111111111","000000100111111000000000000001100110000011111111100000000111111000000000000000001100000000111111000011000000000000000000","000000100000011000000000000001100110000011111000000000001111111100000000000000001100000000111111000110000000000000000000","111100100000011000000000000001100110011111111000000000011120000110000000000000001100000000111111001100000000000000000000","111100111111110000000000000001100110011111111000000000110000000011000000000000011000000000111111111000000000000000000000","111100111111100000000000000001100110000011111000000000110000000011000000000000110000000000100001110000001111000000000000","000000110000000000000000000001100110000011111000000000111000000111000000000001100000000000100001100000001111000000000000","000000110000000000000000000001100110000011111000000000111110011111000000000001100000000001100001000000001111000000000000","000000110000000000000000000001100110011111111000000000111110011110000000000001111111111111100001000000000000000000000000","000000110000000000000000000001100110011111111000000000111110011100000000011111111110000000110001000000000000000000000000","000000110001100000000000000001100110000011111000000000111110011000000000111111111110000000110001000000000000000000000000","000000110001100000000000000001100110000011111111100000111110010000000001100000111110000000000011000000000000000000000000","001100110000000000000000000001100110000011111111100000111110010000000011100000011110000000000110000000000000000000000000","001100110000000000000001111001100110000011111000000000000000000000000011111110001111111111111100000000000000000000000000","000000110000000000000001111001100110000011111000000000000000000000000011111110000111111111111000000000000000000000000000","000000110000000000000001111001100110000011111000000000000000000000000011111110000000000000000000000000000000000000000000","000000110000000000000000000001100110000011111111100000000000000000000011000000000000000000000000000000111100000000000000","000000110000000000000000000001100110000011111111110000000000000000000011000000000000000000000011110000111100000000000000","000000110000000000000000000001100110000011111000011000000000000000000011111000000000000000000011110000111100000000000000","000000110000000000000000000001100110000011000000011100000000000000000011111000000111100000000011110000000000000000000000","000000011111111111111111111111100110000011000111111100000000000000000011000000000111100000000000000000000000000000000000","000000011111111111111111111111111100000011000111111100000000000000000011000000000111100000000000000000000000000000000000","000011110000000000000001111111111000000011000111111100000000000000000011000000000000000000000000000000000000000000000000","000011110000000000000001111111000000000011000000001100000000000000111111000000000000000000000000000000000000000000000000","000011110000111111111111111110000000000001111000001100000000000000111111000000000000000000000000000000000000000000000000","000000000001111111111111111110000000000000111100001100000000000000111111000000000000000011110000000000000000000000000000","000000000011001100000011111100000001111000111110000111111111111111111111110000000000000011110000000000000000000000000000","000000000110001100000001111000000001111000110011000011111111111111111100110000000000000011110000000000000000000000000000","000000000110001100000000000000000001111000110011000000000000000000001100000000000000000000000000000000000000000000000000","000000000110000000000000000000000000000000000011000000000000000000001100000000000000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t1:{x:2608,y:48},q8:{x:1776,y:304},s3:{x:1920,y:496},g2:{x:1872,y:688},b5:{x:2784,y:704,width:160,height:32},q3:{x:2176,y:768},b4:{x:2208,y:736,width:32,height:288},a:{x:2240,y:768,width:32,height:256},b:{x:1568,y:800,width:320,height:288},b8:{x:2400,y:832,width:960,height:672},t3:{x:2160,y:896},t4:{x:2464,y:960},b7:{x:1568,y:1120,width:320,height:288},e5:{x:2896,y:1168},s1:{x:1248,y:1264},q2:{x:512,y:1248},n1:{x:912,y:1296},b2:{x:512,y:1344},b1:{x:864,y:1408,width:96,height:32},h:{x:1568,y:1408,width:320,height:32},c:{x:1472,y:1440,width:416,height:224},q4:{x:1856,y:1472},b3:{x:1344,y:1568,width:32,height:160},g1:{x:1712,y:1776},e1:{x:544,y:1952,width:128,height:32},e2:{x:1152,y:1984},e3:{x:1936,y:2192},el:{x:560,y:2352},q1:{x:1920,y:2400},t2:{x:656,y:2576},e4:{x:1968,y:2832}},
	load:function(spot){
		m.spawnSignpost(spot.q3,function(key){
			if(s.get(key,'lootChest2'))
				s.displayPopup(key,"Upgrade your equipment before fighting the boss.");
			else 
				s.displayPopup(key,"Search for a chest.");
		});
		m.spawnSignpost(spot.q4,"Only those who have a healing ability should attempt passing through the lava pit.");
		
		m.spawnLoot(spot.q8,'viewChest2','lootChest2','chest');
		
		m.spawnBlock(spot.e1,function(key){
			return !s.get(key,'killMushroom');
		},'spike');
		
		m.spawnActor(spot.el,'mushroom',{
			deathEvent:function(key){
				s.set(key,'killMushroom',1);
			},
			noAbility:true,
			maxSpd:s.newNpc.maxSpd(0.2),
			hp:10,
		});
				
		m.spawnActor(spot.e2,'target',{deathEvent:function(key){ 
			s.set(key,'killTarget',1);
			
			s.forEachActor(key,'main',function(key){;
				Actor.remove(Actor.get(key));	//Actor
			},'npc',null,{block:true})
		}});
		
		m.spawnActor(spot.b2,'pushable-rock2x2');
		m.spawnToggle(spot.q2,function(key){ 
			return !s.get(key,'tgOn');
		},function(key){ 
			s.set(key,'tgOn',1);}
		,null);
		
		m.spawnBlock(spot.b1,function(key){ 
			return !s.get(key,'tgOn');
		},'spike');
		m.spawnBlock(spot.b3,function(key){ 
			return !s.get(key,'killTarget');
		},'spike',{
			tag:{block:true},
		});
		m.spawnBlock(spot.b4,function(key){ 
			return !s.get(key,'upgradedEquip') || s.get(key,'bossStarted');
		},'spike');
		m.spawnBlock(spot.b5,function(key){ 
			return !s.get(key,'killBoss');
		},'spike');
		
		m.spawnBlock(spot.a,function(key){ return false;},'invisible');
		m.spawnBlock(spot.h,function(key){ return false;},'invisible');
		
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('villager-male0'),
			nevermove:true,
			angle:s.newNpc.angle('down'),
			name:'Ringo',
			dialogue:'talkRingo'
		});
		
		m.spawnLoot(spot.q1,'viewChest','lootChest','chest');
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'Qtutorial-main','t4','solo');
		},'zone',{angle:0,viewedIf:function(key){
			return s.get(key,'bossStarted');		
		}});
		
		m.spawnTeleporter(spot.t1,'teleMainGenetos','zone','up');
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list("bee",1,{globalDmg:0.3,globalDef:0.5,deathEvent:'killEnemy'}),
			m.spawnActorGroup.list("bat",2,{globalDmg:0.3,globalDef:0.5,deathEvent:'killEnemy'}),
		],0);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list("mushroom",1,{globalDmg:0.3,globalDef:0.5,deathEvent:'killEnemy'}),
			m.spawnActorGroup.list("plant",2,{globalDmg:0.3,globalDef:0.5,deathEvent:'killEnemy'}),
		],0);
		
		m.spawnActor(spot.e5,'boss',{deathEvent:'killBoss'});
		
		m.spawnSkillPlot(spot.s1,'Qtutorial','tree-red',0);
		m.spawnSkillPlot(spot.s3,'Qtutorial','tree-red',2);
	},
	loop:function(spot){
		m.forEachActor(spot,2,function(key){
			var dmg = s.get(key,'assignedHeal') ? -100 : -300;
			s.addHp(key,dmg);
		},'actor',spot.b7);
		
		m.forEachActor(spot,15,function(key){
			s.set(key,'walkedOverLava',1);
			s.addHp(key,500);
		},'actor',spot.b);
		
		m.forEachActor(spot,15,function(key){
			s.rechargeAbility(key);
		},'actor',spot.c);
		
		m.forEachActor(spot,25,function(key){
			s.set(key,'bossStarted',1);
		},'actor',spot.b8);
		if(!m.testInterval(25)) return;
	}
});
s.newMap('adminZone',{
	name:"Admin Test Zone",
	lvl:0,
	grid:["1111111111111111111111111111111111111111","1111111111111111111111111111111111111111","1111111111111111111111111111111111111111","1111111111111111111111111111111111111111","1111111111111111111111111111111111111111","1111111111111111111111111111111111111111","1111111111111111111111111111111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111111111111110000000000000111111111111","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1111100000000000000000000000000000000011","1000000000000000000000000000000000000011","1000000000000000000000000000111111111111","1001100000000000000000000000111111111111","1001111111111110000000000000111111111111","1001111111111110000000000000111111111111","1001111111111110000000000000111111111111","1001111111111110000000000000111111111111","1001111111111111111111111111111110000000","1001111111111111111111111111111110000000","1001111111111111111111111111111110000000","1001111111111111111111111111111110000000","1001111111111111111111111111111110000000","1000000000000000000000000000000000000000","1000000000000000000000000000000000000000","1111111111111111111111111111111111111111"],
	tileset:'v1.2'
},{
	spot:{t2:{x:656,y:432},n1:{x:720,y:560},t4:{x:304,y:688},t3:{x:1072,y:688},t1:{x:656,y:816},q1:{x:1200,y:1296}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkGenetos',
			name:'Genetos',
			nevermove:true,
			angle:s.newNpc.angle('down'),
			sprite:s.newNpc.sprite('villager-male2')
		});
		
		m.spawnTeleporter(spot.t2,'teleAdminTutorial','door');
		m.spawnTeleporter(spot.t3,'teleAdminTutorial','door');
		m.spawnTeleporter(spot.t4,'teleAdminTutorial','door');
		m.spawnTeleporter(spot.q1,'doorSkipTutorial','door');
	}
});
s.newMapAddon('QfirstTown-main',{
	spot:{n1:{x:1104,y:1936},t1:{x:1104,y:2032},t8:{x:1216,y:816}},
	load:function(spot){
		
	},
	loop:function(spot){
		m.forEachActor(spot,100,function(key){
			if(s.testQuestActive(key,'Qtutorial') && !m.isAtSpot(key,spot.t1,200)){
				s.displayPopup(key,'Weird-Ass Error 1337: SWAG overflow.<br>Teleporting to Admin Testing Zone');
				s.setTimeout(key,function(){
					s.set(key,'teleportedToAdmin',1);
					s.teleport(key,'adminZone','t1','main');
					s.setRespawn(key,'adminZone','t1','main',true);
					s.callEvent('talkGenetos',key);
					s.addBoost(key,'maxSpd',0,25*1);
					s.setHUD(key,'questHint','flashing');
				},25*1);
			}
		},'player');
	}
});

s.newMap('genetosHouse',{
	name:"Genetos House",
	lvl:0,
	grid:["0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000111111111100000001111111111111110000","0000111111111100000001111111111111110000","0000111111111100000001111111111111110000","0111111111111111111111111111111111111110","0111111111111111111111111111111111111110","0111111111111111111111111111111111111110","0111111111111111111111111111111111111110","0111111111111111111111100000000000111110","0111111000000000000000000000000000011110","0111111000000000000000000000000000011110","0110000001111111100000000000000000000110","0110000001111111100000000000000000000110","0110000001111111100000000000000000000110","0110000001111111100000000000000000000110","0110000001111111100000000000000000000110","0111100000011111100000000000000000000110","0111100000000000000000000000000000000110","0111100000000000000000000000000000000110","0111111111111111111111100000000000000110","0111111111111111111111100000000000000110","0111111111111111111111100000000000000110","0111111111111111111111111111111111111110","0111111111111111111111111111111111111110","0000111111111100000001111111111111111110","0000111111111100000001111111111111111110","0000111111111100000001111111111111111110","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{n1:{x:880,y:560},t1:{x:976,y:784}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkGenetosTown',
			name:'Genetos',	
			sprite:s.newNpc.sprite('villager-male2')
		});
		m.spawnTeleporter(spot.t1,'teleGenetosTown','zone','down');
	}
});

s.newMap('genetosHouse2',{
	graphic:'Qtutorial-genetosHouse',
	name:"Genetos House",
},{	
	spot:{n1:{x:880,y:560},t1:{x:976,y:784}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
		dialogue:'talkGenetosTown',
			name:'Genetos',
			sprite:s.newNpc.sprite('villager-male2')
		});
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-main','t8','main');
		},'zone','down');
	}
});

s.newBoss('dragon',s.newBoss.variable({"direction":1,"rotationAngle":0,"randomAngle":0}),function(boss){
	var SPD = 1;
	s.newBoss.phase(boss,'phase0',{
		loop:function(boss){
			var num = b.get(boss,'_framePhase') % 60;
			var angleVar = Math.randomML()*25;
			if(angleVar < 0) angleVar -= 15;
			else angleVar += 15;
			angleVar += b.get(boss,'_angle');
			if(num === 50)
				for(var i = 0; i < 340; i += 5)	
					b.useAbility(boss,'fireball-360',angleVar+i+10);
		},
		transitionTest:function(boss){
			if(b.get(boss,'_framePhase') > 400) return 'phase1'	
		},
	});
	s.newBoss.phase(boss,'phase1',{
		loop:function(boss){
			var toadd = b.get(boss,'direction') * SPD;
			b.add(boss,'rotationAngle',toadd);
			b.useAbility(boss,'fireball-fast',b.get(boss,'rotationAngle'));
			if(b.get(boss,'_framePhase') % 50 === 0)
				for(var i = 0; i < 300; i += 5)	b.useAbility(boss,'fireball-oob',b.get(boss,'rotationAngle')+i+30);
		},
		transitionTest:function(boss){
			if(b.get(boss,'_framePhase') % 250 === 0) return 'phase0';
		},
		transitionIn:function(boss){
			b.set(boss,'rotationAngle',b.get(boss,'_angle'));
			b.set(boss,'direction',Math.random() > 0.5 ? -1 : 1);
		}
	});
});

s.exports(exports);
