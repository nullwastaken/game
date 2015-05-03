//03/28/2015 11:26 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QsadTree',{
	name:"Sad Tree",
	author:"rc",
	thumbnail:true,
	zone:"QfirstTown-south",
	description:"A NPC that has been transformed into a tree sends you in a quest to retrieve its normal form.",
	maxParty:4
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
*/

s.newVariable({
	talkTree:False,
	talkWiseOldMan:False,
	killImage:False,
	killTimer:'null',
	killCave:0
});
s.newHighscore('Speedrun',"Speedrun","Kill the Image as fast as possible after entering the tree.",'ascending',function(key){
	if(s.getPartySize(key) === 1)
		return s.get(key,'killTimer');
});

s.newChallenge('noHarmInnocent',"Collateral Damage","Don't hurt non-Image enemies.",function(key){
	return true;
});
s.newChallenge('tinyImage',"Tiny Image","The Image enemy has the same size than the other ones.",function(key){
	return true;
});
s.newChallenge('speedrun',"Speedrun","You have 1 minute to kill the Image after entering the tree.",function(key){
	return s.get(key,'killTimer') < 25*60;
});

s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-soutWestHouse','t1','main');
		s.setRespawn(key,'QfirstTown-soutWestHouse','t1','main');
	}
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_start',function(key){ //
	s.addQuestMarker(key,'start','QfirstTown-southWestHouse','n1');
	if(s.isInMap(key,'QfirstTown-wiseOldManCave'))
		s.teleportTown(key);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'talkTree'))
		return 'Go talk with the weird Tree.';
	if(!s.get(key,'talkWiseOldMan'))
		return 'Go find the Wise Old Man to get the Minimization script.';
	if(!s.get(key,'killImage'))
		return 'Talk with the Tree and kill the Image enemy.';
	return 'Talk with Karl for your reward.';
});
s.newEvent('talkTree',function(key){ //
	if(!s.get(key,'talkTree'))
		return s.startDialogue(key,'Tree','intro');
	
	if(s.get(key,'killImage'))
		return s.startDialogue(key,'Karl','success');
	
	if(s.haveItem(key,'script'))
		return s.startDialogue(key,'Tree','withScript');
	
	s.startDialogue(key,'Tree','noOld');
});
s.newEvent('talkTreeDone',function(key){ //
	s.set(key,'talkTree',true);
	s.removeQuestMarker(key,'start');
	s.addQuestMarker(key,'cave','QfirstTown-south','t2');
});
s.newEvent('talkWiseOldMan',function(key){ //
	if(!s.get(key,'talkWiseOldMan'))
		s.startDialogue(key,'wiseOldMan','intro');
	else
		s.startDialogue(key,'wiseOldMan','done');
});
s.newEvent('talkWiseOldManDone',function(key){ //
	s.addItem(key,'script',1);
	s.set(key,'talkWiseOldMan',true);
	s.addQuestMarker(key,'start','QfirstTown-southWestHouse','n1');
});
s.newEvent('scriptUse',function(key){ //
	s.message(key,'I should talk with the Tree dude before using that script.');
});
s.newEvent('killInnocent',function(key){ //
	s.teleport(key,'QfirstTown-southWestHouse','n1','main');
	s.startDialogue(key,'Tree','fail');
});
s.newEvent('teleHouseTree',function(key){ //
	s.removeQuestMarker(key,'start');
	s.setSprite(key,'normal',0.5);
	s.setTimeout(key,function(){
		s.setRespawn(key,'QfirstTown-southWestHouse','t1','main');
		s.teleport(key,'tree','t1','party');
		s.displayPopup(key,"Kill the Image enemy without killing the others.");
		s.startChrono(key,'chrono',s.isChallengeActive(key,'speedrun'));
	},25*2);
});
s.newEvent('killImage',function(key){ //
	s.set(key,'killImage',true);
	s.teleport(key,'QfirstTown-southWestHouse','n1','main');
	s.startDialogue(key,'Karl','success');
	var time = s.stopChrono(key,'chrono');
	s.set(key,'killTimer',time);
});
s.newEvent('complete',function(key){ //
	s.set(key,'killImage',false);
	s.setTimeout(key,function(){
		s.endDialogue(key);
		s.completeQuest(key);
	},25*2);
});

s.newItem('script',"Script",'plan-scroll',[    //{
	s.newItem.option('scriptUse',"Use","")
],"s.setSprite('normal',0.1);"); //}

s.newDialogue('Tree','Tree','',[ //{ 
	s.newDialogue.node('intro',"Hi. Don't be scared. I am a regular NPC but The Creator mistyped my Image attribute and therefore, I look like a tree. Please help me turn back to like I am meant to be.",[ 
		s.newDialogue.option("Sure, I'll help.",'intro2'),
		s.newDialogue.option("Nope.")
	]),
	s.newDialogue.node('intro2',"Thanks! In order to modify my Image attribute you will need to come inside me.",[ 
		s.newDialogue.option("Okay, how?",'intro3'),
		s.newDialogue.option("I'll not really into trees, you know.",'intro3')
	]),
	s.newDialogue.node('intro3',"By that, I mean that you need to find a way to minimize yourself and then kill the element responsible for the Image attribute in my body declaration. Do you know how to minimize yourself?",[ 
		s.newDialogue.option("With a potion, I guess?",'intro4')
	]),
	s.newDialogue.node('intro4',"Where do you think you are! This isn't a magical world, we are in a video game. In video games, special effects are triggered by scripts. So obviously, you need a a Minimization Script.",[ 
		s.newDialogue.option("Where can I find one?",'intro5')
	]),
	s.newDialogue.node('intro5',"There's an old man living deep inside a cave that could help you with that. Go meet him and come back to me. I'll mark it in your minimap.",[ 
		s.newDialogue.option("Okay, thanks.",'','talkTreeDone')
	]),
	s.newDialogue.node('noOld',"Go meet the Old Man and get the Minimization Script. I marked its cave on your minimap.",[ 	]),
	s.newDialogue.node('withScript',"Great, you made it! Now use that script and come inside me. Inside, you will face multiple enemies.<br>ONLY KILL the Image monster. Killing the other ones would break me.",[ 
		s.newDialogue.option("Good. I'll only kill the Image enemy.",'','teleHouseTree')
	]),
	s.newDialogue.node('fail',"I told you to only kill the Image enemy. I don't want my other attributes to go away. Try again.",[ 
		s.newDialogue.option("Ok, I'll try again.",'','teleHouseTree')
	])
]); //}
s.newDialogue('wiseOldMan','Wise Old Man','villagerMale-3',[ //{ 
	s.newDialogue.node('intro',"Welcome! I don't get many visitors. What brings you here? I guess you need a script or something. ",[ 
		s.newDialogue.option("Yes, an Infinite Money script.",'money'),
		s.newDialogue.option("Yes, a Minimization script.",'minimization'),
		s.newDialogue.option("How do you make scripts?",'scripts')
	]),
	s.newDialogue.node('done',"Go talk with the Tree dude. I think he needs your help.",[ 	]),
	s.newDialogue.node('money',"I would but unfortunately, there is no money in the game, only crafting materials and rare equipments. So I guess I can't give you Infinite Money. What else would you need?",[ 
		s.newDialogue.option("I need a Minimization Script.",'minimization')
	]),
	s.newDialogue.node('minimization',"That's a weird request. Normally people ask me for overpowered scripts that grant godlike equipments. Anyway, I'll give you what you request. It is as simple as<br> &nbsp;&nbsp; - s.setSprite(key,'normal',0.1);",[ 
		s.newDialogue.option("Okay, thanks.",'','talkWiseOldManDone')
	]),
	s.newDialogue.node('scripts',"I'm rather busy right now and I guess you are too. Go help that Tree dude and when you come back, I'll be happy to answer your questions.",[ 	])
]); //}
s.newDialogue('Karl','Karl','villagerMale-8',[ //{ 
	s.newDialogue.node('success',"Thanks a lot, I'm human now! Good job!",[ 
		s.newDialogue.option("No problem.",'success2','complete')
	]),
	s.newDialogue.node('success2',"Wait what! No!!! I'm a tree again!",[ 	])
]); //}

s.newMapAddon('QfirstTown-southWestHouse',{
	spot:{n1:{x:640,y:400},t1:{x:560,y:656}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite("tree-red",1),
			dialogue:'talkTree',
			name:"Karl",
			angle:s.newNpc.angle('down'),
			nevermove:true,
			viewedIf:function(key){
				if(!s.testQuestActive(key)) 
					return true;
				return !s.get(key,'killImage');
			;},
		});
		
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('villagerMale-8',1),
			dialogue:'talkTree',
			name:"Karl",
			angle:s.newNpc.angle('down'),
			nevermove:true,
			viewedIf:function(key){
				if(!s.testQuestActive(key)) 
					return false;
				return s.get(key,'killImage');
			;},
		});
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{t2:{x:1552,y:1200}},
	load:function(spot){
		m.addTeleport(spot,{wiseOldManCave:true},function(key){
			s.removeQuestMarker(key,'cave');
			if(!s.get(key,'talkTree'))
				return s.message(key,'I have no reason to go there yet.');
			if(s.get(key,'killCave') >= 6){
				s.teleport(key,'QfirstTown-wiseOldManCave','t1','party');
				s.setRespawn(key,'QfirstTown-wiseOldManCave','t1','party');
			} else {
				s.teleport(key,'caveToOldMan','t1','party');
				s.setRespawn(key,'caveToOldMan','t1','party');
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
s.newMap('tree',{
	name:"Inside The Tree",
	lvl:0,
	grid:["0000000111111111111111111111111110000000","0000000111111111111111111111111110000000","0000000111111111111111111111111110000000","0000000111111111111111111111111110000000","0000111111111111111111111111111111110000","0000111111111111111111111111111111110000","0000111110000000000000000000000111110000","1111111110000000000000000000000111110000","1111111110000000000000000000000111111111","1111110000000000000000000000000000111111","1111110000000000000000000000000000111111","1111110000000000000000000000000000111111","1110000000000000000000000000000000111111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1110000000000000000000000000000000000111","1111110000000000000000000000000000111111","1111110000000000000000000000000000111111","1111110000000000000000000000000000111111","1111111110000000000000000000000111111111","1111111110000000000000000000000111111111","0000111110000000000000000000000111110000","0000111111111111111111111111111111110000","0000111111111111111111111111111111110000","0000000111111111111111111111111110000000","0000000111111111111111111111111110000000","0000000111111111111111111111111110000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{e7:{x:400,y:304},ea:{x:944,y:304},e2:{x:752,y:400},e1:{x:432,y:496},e3:{x:1008,y:624},t1:{x:688,y:656},e4:{x:240,y:720},eb:{x:976,y:784},e6:{x:880,y:880},e8:{x:304,y:912},e5:{x:560,y:912}},
	load:function(spot){
		var spotArray = ['e1','e2','e3','e4','e5','e6','e7','e8','ea'];
		var nameArray = ['Hp: 1','Name: Karl','Move: False','Combat: False','x: 1337','y: 69','Map: southWestHouse','Visible: True','Dialogue: talkTree'];
		
		
		var key = m.getRandomPlayer(spot.e7);
		var hp = 1000;
		var size = 1;
		if(key){
			if(s.isChallengeActive(key,'noHarmInnocent'))
				hp = 1;
			if(s.isChallengeActive(key,'tinyImage'))
				size = 0.25;
		}
		
		for(var i = 0 ; i < spotArray.length; i++){
			m.spawnActor(spot[spotArray[i]],'mushroom',{
				sprite:s.newNpc.sprite('tree-red',0.25),
				deathEvent:'killInnocent',
				name:nameArray[i],
				hp:hp,
				atkSpd:0.25,
			});
		}
		m.spawnActor(spot.eb,'eyeball',{
			sprite:s.newNpc.sprite('tree-red',size),
			name:"Image: Tree",
			deathEvent:'killImage',
			hp:10000,
		});
	},
	playerEnter:function(key){
		s.setSprite(key,'normal',0.5);
	},
	playerLeave:function(key){
		s.setSprite(key,'normal',1);
	}
});
s.newMap('caveToOldMan',{
	name:"Unknown Cave",
	lvl:0,
	screenEffect:'cave',
	grid:["000000010000000000001100000000000110000111100000000110000000","000000010000000000001100000000000010000111000000000110000000","000000010000000000011000011111100010001110000000000011000000","000000011000000000010000111111110010001000001111110001110000","000000001100000000010001111111111110001000011111111000111000","000000000111000000010001111111111110001000111111111100111000","000000000011100000010001100000011110001000111111111111111000","111000000000100000010001100000011110001000110000001111111000","111000000000100000010001100000011110001000110000001100001000","000000000000100000110001100000011111111000110000001100001000","000011111100110001100001100000011001111111110000001100001000","000111111110011111000001100000011000100111110000001100001000","001111111111001110000011100000011100000011110000001100001000","001111111111000100000111100000011110000011110000001100001000","001100000011000000011111000000001111111111100000001100001000","001100000011000000111110000000000111111111000000001100001000","001100000011000001111110000000000011111110000000001100001000","001100000011000001111110000000000001111100000000001100011000","001100000011111001111110000000000001100000000011111100110000","001100000011111001111110000000000001100000000111111111110000","001100000011111111111100000000000000000000001100001111110000","001100000011111111100000000000000000000000011100000111111111","001100000001111111000000000000000000000000011100000011001111","001100000000111110000000000000000000000000011110000011000000","001100000000011100000000000000000000000000001111111111110000","000110000000001000000000000000000000000000000111111111111000","000011000000000000000000000000000000000000000011111111111100","100001100000000000000000000000000000000000000001111111111100","111100110000000000000000000000000000000000000000000000111100","111110011000000000000000000000000000000000000000000000111100","000011001111111000000000000000000000000000000000000000001100","000011100111111100000000000000000000000000000000000000001100","000011100000000110000000000000000000000000000011000000001100","000111100000000111000000000000000000000000000111100000001100","111111000001111111000000000000000000000000001100110000001100","111110000001111111000000000000000000000000011000011000001100","111100000001111111000000000000000000000000011000011000001100","111000111111111111000000000000000000000011111000011000001100","100001111111110011110000000000000000000111111000011000001100","000011111111110011110000000000000000000111111000011000001100","000011111111110011110000000000000000000111111000011000001100","000011000000110001111111111000000000000111111111111000001100","000011000000110000111111111100000000000111100111111000001100","000011000000110000000011111110000000001111100111111000001100","000011000000111000000011111111000000011111111111111000001100","000011000000111100000011111111000000011111000110011000001100","000011000000011111111111111110000000011110000010011000001100","000011000000001111111111111100000000011110000010011000001100","000011000000000111111111111000000000011110000010011000001100","000011000000000011111111110000000000011110000010011000001100","000011000000000000000000000000000011111110000010001111111100","000011000000000000000000000000000111111110000010000111111111","000001100000000000000000000000000111111110000011000100001111","111000110000000000000000000000000111111110000001111100000111","001100011000000000000000000000011111110010000001111110000011","000100001111111111111111111111111111100010001111111111000000","000110000111111111111111111111111000000010011111111001100000","000011110001100000000000000001111000000110011111111000110000","000000011001100000000000000001111001111100001111110000010000","000000011001100000000000000001111111111100001111110000010000"],
	tileset:'v1.2'
},{
	spot:{t3:{x:896,y:176},t2:{x:1504,y:208},t4:{x:224,y:432},e2:{x:1008,y:720},e1:{x:752,y:848},e3:{x:1232,y:848},e4:{x:1008,y:1040},e5:{x:784,y:1104},t5:{x:288,y:1296},e6:{x:1040,y:1424},t1:{x:1712,y:1552}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-south','t2','main');
			s.set(key,'killCave',0);
		;},'zone','down');
		
		var badTele = function(key){
			s.teleport(key,'caveToOldMan','t1','party',true);
			s.set(key,'killCave',0);
			s.displayPopup(key,'You got lost. You should look for an hidden entrance.');
		;}
		
		m.spawnTeleporter(spot.t2,badTele,'cave');
		m.spawnTeleporter(spot.t3,badTele,'cave');
		m.spawnTeleporter(spot.t4,badTele,'cave');
		
		m.spawnTeleporter(spot.t5,function(key){
			s.teleport(key,'QfirstTown-wiseOldManCave','t1');
		;},'cave',{
			viewedIf:function(key){
				return s.get(key,'killCave') >= 6;
			;},	
		});
		
		var killCave = function(key){
			s.add(key,'killCave',1);
			if(s.get(key,'killCave') >= 6){
				s.displayPopup(key,'You heard a weird sound.');
			}
		}
		
		m.spawnActor(spot.e1,'goblin-melee',{deathEvent:killCave});
		m.spawnActor(spot.e2,'goblin-range',{deathEvent:killCave});
		m.spawnActor(spot.e3,'goblin-magic',{deathEvent:killCave});
		m.spawnActor(spot.e4,'smallWorm',{deathEvent:killCave});
		m.spawnActor(spot.e5,'bat',{deathEvent:killCave});
		m.spawnActor(spot.e6,'mosquito',{deathEvent:killCave});
	},
	playerEnter:function(key){
		s.addTorchEffect(key,'torch');
	},
	playerLeave:function(key){
		s.removeTorchEffect(key,'torch');
	}
});

s.exports(exports);
