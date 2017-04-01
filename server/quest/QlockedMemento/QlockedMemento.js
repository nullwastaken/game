//05/15/2015 1:53 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QlockedMemento',{
	name:"Locked Memento",
	author:"Boo",
	thumbnail:true,
	zone:"QfirstTown-eastCave",
	description:"Bring back a memento hidden in a cave filled with bats.",
	recommendedPartySize:2,
	maxPartySize:8,
	reward:{completion:0.1,score:0.2,monster:0.4},
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
Talk to Roland.
Go to Hidden Alcove.
Solve switch puzzle.
Get sword from chest and return to Roland.
*/

s.newVariable({
	talkRoland:False,
	openedChest:False,
	switch1On:False,
	switch2On:False,
	switch3On:False,
	switch4On:False,
	batDied:False,
	bigBatKilled:0
});
s.newHighscore('fastestTime',"Fastest Time","Retrieve the sword in record time.",'ascending',function(key){
	return s.stopChrono(key,'timer')*40;
});

s.newChallenge('animalRights',"Animal Rights","Don't kill any of the small bats. Big ones are okay.",function(key){
	return !s.get(key,'batDied');
});
s.newChallenge('timeSensitive',"Time Sensitive","Deliver the sword within 2 minutes.",function(key){
	return s.stopChrono(key,'timer') < 25*60*2;
});
s.newChallenge('doubleFun',"Double Fun","Two times more monsters.");

s.newEvent('_hint',function(key){ //
	if(!s.get(key,'talkRoland'))
		return 'Talk with Roland.';
	if(!s.isInMap(key,'main'))
		return 'Go to the hidden alcove.';
	if(!s.get(key,'switch4On'))
		return 'Open the switches in the correct order.';
	if(s.callEvent('blockVisible',key))
		return 'Kill the big bat.';
	if(!s.get(key,'openedChest'))
		return 'Retrieve the sword from the chest.';
	return 'Return the sword to Roland.';
});
s.newEvent('_start',function(key){ //
	var visible = s.isChallengeActive(key,'timeSensitive');
	s.startChrono(key,'timer',visible);
	
	if(s.isAtSpot(key,'QfirstTown-main','n1',200)) {
		s.callEvent('talkRolandEvent',key);
	} else {
		s.addStartQuestMarker(key);
	}
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_death',function(key){ //
	s.set(key,'switch1On',false);
	s.set(key,'switch2On',false);
	s.set(key,'switch3On',false);
	s.set(key,'switch4On',false);
});
s.newEvent('talkRolandEvent',function(key){ //
	s.removeStartQuestMarker(key);
	if(s.haveItem(key,'rustySword')) {
		s.startDialogue(key,'talkRoland','done');
		s.completeQuest(key);
	} else {
		if(!s.get(key,'talkRoland')){
			s.startDialogue(key,'talkRoland','talkStartQuest');
		}
		else
			s.startDialogue(key,'talkRoland','talkExplain1');
			
	}
});
s.newEvent('doneTalkRoland',function(key){ //
	s.set(key,'talkRoland',true);
	s.addQuestMarker(key,'cave','QfirstTown-eastCave','t1');
});
s.newEvent('teleToCave',function(key){ //
	if(s.get(key,'talkRoland'))	{
		s.teleport(key,'main','t1')
		s.setRespawn(key,'QfirstTown-eastCave','t1','main',true);
		s.removeQuestMarker(key,'cave');
		s.addQuestMarker(key,'chest','main','e');
	}
	else
		s.message(key,'Why would you go there?');
});
s.newEvent('blockVisible',function(key){ //
	var killNeeded = s.isChallengeActive(key,'doubleFun') ? 2 : 1;
	return !(s.get(key,'switch1On') && s.get(key,'switch2On') && s.get(key,'switch3On') && s.get(key,'switch4On') && s.get(key,'bigBatKilled') >= killNeeded);
});
s.newEvent('switchTurnOn',function(key,switchId){ //
	if(switchId === 1){
		s.set(key,'switch1On',true);
		s.message(key,'You activated the switch.','green');
	}
	else if(switchId === 2){
		if(!s.get(key,'switch1On')){
			s.callEvent('onBadSwitch',key);
		} else {
			s.set(key,'switch2On',true);	
			s.message(key,'You activated the switch.','green');
		}	
	}
	else if(switchId === 3){
		if(!s.get(key,'switch2On')){
			s.callEvent('onBadSwitch',key);
		} else {
			s.set(key,'switch3On',true);	
			s.message(key,'You activated the switch.','green');
		}	
	}
	else if(switchId === 4){
		if(!s.get(key,'switch3On')){
			s.callEvent('onBadSwitch',key);
		} else {
			s.set(key,'switch4On',true);
			var amount = s.isChallengeActive(key,'doubleFun') ? 2 : 1;
			for(var i = 0 ; i < amount; i++)
				s.spawnActor(key,'main','e4','bat', {
					name:"Abnormal Bat",
					sprite:s.newNpc.sprite('bat',1.75),
					globalDef:5,
					globalDmg:2,
					deathEvent:'bigBatDeath'
				});
			if(s.isChallengeActive(key,'doubleFun')){
				s.message(key,'You activated the switch and two big bats appeared! Kill them.','green');
			} else
				s.message(key,'You activated the switch and a big bat appeared! Kill it.','green');
		}	
	}
});
s.newEvent('onBadSwitch',function(key){ //
	//spawn bats
	var batAlreadyInMap = s.forEachActor(key,'main',null,'npc',null,{bat:true}).length;
	if(batAlreadyInMap < 15){
		var amount = 2;
		if(s.isChallengeActive(key,'doubleFun'))
			amount = 4;
		for(var i = 0; i < amount; i++)
			s.spawnActorOnTop(key,'main','bat', {tag:{bat:true},deathEvent:'batDeath',v:50});
	}
	//switches
	if(!s.get(key,'switch1On') && !s.get(key,'switch2On') && !s.get(key,'switch3On') && !s.get(key,'switch4On'))
		s.message(key,'The switch refuses to budge.','#c6c6c6');
	else
		s.message(key,'The switches have been reset.','#ff0000');
	
	s.callEvent('_death',key);
});
s.newEvent('batDeath',function(key){ //
	if(s.isChallengeActive(key,'animalRights')) {
		if(!s.get(key,'batDied')) {
			s.message(key,'Animal Rights challenge failed.');
		}
	}
	s.set(key,'batDied',true);
});
s.newEvent('bigBatDeath',function(key){ //
	s.add(key,'bigBatKilled',1);
});
s.newEvent('lootChest',function(key){ //
	s.message(key,'You take out a rusty old sword that belonged to Roland\'s father.');
	s.addItem(key,'rustySword');
	s.set(key,'openedChest',true);
	s.removeQuestMarker(key,'chest');
	s.addQuestMarker(key,'roland','QfirstTown-main','n1');
});

s.newItem('rustySword',"Rusty Sword",'weapon-sword',[    //{
],"This sword has seen better days"); //}

s.newDialogue('talkRoland','Roland','villagerMale-7',[ //{ 
	s.newDialogue.node('talkStartQuest',"My parents were deleted from the game during the Infinite Spawn glitch caused by [[Lord Dotex]]. Before glitching out, my father told me he hid away his precious sword in a cave.",[ 
		s.newDialogue.option("You seem quite sentimental.",'talkSentimental'),
		s.newDialogue.option("Give me the details.",'talkExplain1')
	]),
	s.newDialogue.node('talkSentimental',"If both of your parents were gone, I bet you'd want a [[memento]] of them as well. So will you help me?",[ 
		s.newDialogue.option("Of course I'll help!",'talkExplain1')
	]),
	s.newDialogue.node('talkExplain1',"I marked the cave on your minimap. The sword was put behind a [[combination lock]]. Inside, there will be switches that control the gate that protects the chest with the sword in it. If you activate any switch out of order, they will [[all reset]].",[ 
		s.newDialogue.option("Anything else?",'talkExplain2'),
		s.newDialogue.option("Open gate, get sword. Got it.")
	],'doneTalkRoland'),
	s.newDialogue.node('talkExplain2',"Last time I ventured there I found it teeming with bats. Those switches are old and will make quite a racket when you grind them open... which might disturb the bats.",[ 
		s.newDialogue.option("Good to know.")
	]),
	s.newDialogue.node('done',"Thanks a lot for retrieving the [[memento]] of my father.",[ 
		s.newDialogue.option("No problem.")
	])
]); //}

s.newMap('main',{
	name:"Hidden Alcove",
	screenEffect:'cave'
},{
	load:function(spot){
		// Blocks that the switches open. Chest is behind here.
		m.spawnBlock(spot.qa, 'blockVisible');
		
		
		m.spawnActor(spot.e1,'bat',{deathEvent:'batDeath',tag:{bat:true}});
		m.spawnActor(spot.e2,'bat',{deathEvent:'batDeath',tag:{bat:true}});
		m.spawnActor(spot.e3,'bat',{deathEvent:'batDeath',tag:{bat:true}});
		
		// Chest
		m.spawnLoot(spot.e, function(key){
			return !s.get(key,'openedChest');
		;}, 'lootChest');
		
		var order = [spot.a,spot.b,spot.c,spot.d].$shuffle();
		
		// Switches
		m.spawnToggle(order[0], function(key){
			return !s.get(key,'switch1On');
		;}, function(key){
			s.callEvent('switchTurnOn',key,1);
			return false;
		;});
		m.spawnToggle(order[1], function(key){
			return !s.get(key,'switch2On');
		;}, function(key){
			s.callEvent('switchTurnOn',key,2);
			return false;
		;});
		m.spawnToggle(order[2], function(key){
			return !s.get(key,'switch3On');
		;}, function(key){
			s.callEvent('switchTurnOn',key,3);
			return false;
		;});
		m.spawnToggle(order[3], function(key){
			return !s.get(key,'switch4On');
		;}, function(key){
			s.callEvent('switchTurnOn',key,4);
			return false;
		;});
		
		// Cave exit
		m.spawnTeleporter(spot.t1, function(key){
			s.teleport(key,'QfirstTown-eastCave','t1');
			s.removeQuestMarker(key,'chest');
		;}, 'zone','down');
	}
});
s.newMapAddon('QfirstTown-main',{
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			name:"Roland",
			sprite:s.newNpc.sprite('villagerMale-7',1),
			dialogue:'talkRolandEvent',
			minimapIcon:CST.ICON.quest,
		});
		m.setAsStartPoint(spot.n1);
	}
});
s.newMapAddon('QfirstTown-eastCave',{
	load:function(spot){
		m.spawnTeleporter(spot.t1,'teleToCave','cave');
	}
});

s.exports(exports);
