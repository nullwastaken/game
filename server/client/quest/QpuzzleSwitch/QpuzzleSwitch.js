//03/19/2015 9:41 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QpuzzleSwitch',{
	name:"Puzzle & Switch",
	author:"rc",
	thumbnail:True,
	description:"Activate switches and push blocks to complete 5 puzzles.",
	maxParty:1,
	scoreModInfo:"Depends on amount of puzzles done.",
	category:['Puzzle'],
	zone:"QfirstTown-north",
	admin:true
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
lvl1-2: 21
lvl3: 55
lvl4: 73
*/

s.newVariable({
	greenActive:False,
	yellowActive:False,
	redActive:False,
	lvl:0,
	resetCount:0,
	pushCount:0,
	startGame:false,
});
s.newHighscore('speedrun',"Fastest Time","Fastest Time completing all 5 puzzles.",'ascending',function(key){
	if(s.get(key,'lvl') >= 5) return s.get(key,'chrono')*40;
	return null;
});
s.newHighscore('pushing',"Least Interaction","Least amount of interactions (Block pushes and switch activations).",'ascending',function(key){
	if(s.get(key,'lvl') >= 5) return s.get(key,'pushCount');
	return null;
});

s.newChallenge('speedrun',"Speedrun","Complete all 5 puzzles in less than 10 minutes.",function(key){
	if(s.get(key,'lvl') >= 5) return s.get(key,'chrono') < 10*60*25;
	return false;
});
s.newChallenge('noreset',"No Reset","Complete all 5 puzzles without resetting.",function(key){
	if(s.get(key,'lvl') >= 5) return s.get(key,'resetCount') == 0;
	return false;
});
s.newChallenge('pushing',"Pusher","Complete all 5 puzzles with less than 100 interactions (Block pushes and switch activations).",function(key){
	if(s.get(key,'lvl') >= 5) 
		return s.get(key,'pushCount') <= 100;
	return false;
});

s.newEvent('_death',function(key){ //
	s.failQuest(key);
});
s.newEvent('_signIn',function(key){ //
	s.callEvent('resetPuzzle',key);
});
s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-south','n1','main');
		s.setRespawn(key,'QfirstTown-south','n1','main');
	}
});
s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-south','n1',200))
		s.callEvent('talkTheninzon',key);
	s.addQuestMarker(key,'myQuestMarker','QfirstTown-south','n1');
});
s.newEvent('_getScoreMod',function(key){ //impact reputation pts given
	var lvl = s.get(key,'lvl');
	if(lvl <= 3) return 0.1;
	if(lvl === 4) return 1;
	if(lvl === 5) return 3;
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('startGame',function(key){ //
	s.set(key,'startGame',true);
	s.startChrono(key,'timer',s.isChallengeActive(key,'speedrun'));
	s.teleport(key,'lvl1','t1','party');
	s.setRespawn(key,'lvl1','t1','party',true);
	s.addItem(key,'reset');
	s.displayPopup(key,'Complete at least 3 of the 5 puzzles to beat the quest.<br>If stuck, use item "Reset".');
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'startGame'))
		return 'Go talk to Theninzon.';
	if(!s.isChallengeActive(key,'pushing'))
		return "Activate switch to toggle buttons state. Bronze switches can be pushed.";
	else
		return 'Push Count: ' + s.get(key,'pushCount');
});
s.newEvent('viewedIfBlock',function(color,base){ //
	return function(key){
		if(base === false)
			return s.get(key,color + 'Active');
		else
			return !s.get(key,color + 'Active');
	}
});
s.newEvent('spawnToggle',function(spot,color){ //
	m.spawnToggle(spot,function(key){
		return s.get(key,color + 'Active')
	},function(key){
		s.add(key,'pushCount',1);
		s.set(key,color + 'Active',false);
	},function(key){
		s.add(key,'pushCount',1);
		s.set(key,color + 'Active',true);	
	},null,{
		sprite:s.newNpc.sprite('toggle-' + color + 'Off'),
	},{
		sprite:s.newNpc.sprite('toggle-' + color + 'On'),
	});
});
s.newEvent('spawnToggleMove',function(spot,color){ //
	var duoId = Math.random();
	
	m.spawnToggle(spot,function(key){
		if(s.getTag(key).isSwitch) return false;
		return s.get(key,color + 'Active')
	},function(key,switch1){
		s.add(key,'pushCount',1);
		s.set(key,color + 'Active',false);
		s.addBoost(key,'maxSpd',0,10);
		s.callEvent('fixInWallBug',key,switch1,color);
	},function(key,switch1){
		s.add(key,'pushCount',1);
		s.set(key,color + 'Active',true);
		s.addBoost(key,'maxSpd',0,10);
		s.callEvent('fixInWallBug',key,switch1,color);
	},null,{
		nevermove:false,
		tag:{isSwitch:true,state:'off',duoId:duoId},
		pushable:s.newNpc.pushable(8,8,s.callEvent('syncToggle',spot.map)),
		sprite:s.newNpc.sprite('toggle-' + color + 'Off-bronze',1),
		block:s.newNpc.block(s.newNpc.block.size(2,2),1),
		interactionMaxRange:75,
	},{
		nevermove:false,
		tag:{isSwitch:true,state:'on',duoId:duoId},
		pushable:s.newNpc.pushable(8,8,s.callEvent('syncToggle',spot.map)),
		sprite:s.newNpc.sprite('toggle-' + color + 'On-bronze',1),
		block:s.newNpc.block(s.newNpc.block.size(2,2),1),
		interactionMaxRange:75,
	});
});
s.newEvent('fixInWallBug',function(key,switchId,color){ //possibly abusable
	if(color === 'yellow' && s.isInMap(key,'lvl2') && s.isAtSpot(key,'lvl2','b',32)){
		s.teleport(key,'lvl2','a',false);
	}
	if(color === 'green' && s.isInMap(key,'lvl3') && s.isAtSpot(key,'lvl3','b',32)){
		s.teleport(key,'lvl3','a',false);
	}
	if(color === 'red' && s.isInMap(key,'lvl5') && s.isAtSpot(key,'lvl5','n1',32)){
		s.teleport(key,'lvl5','n2',false);
	}
	if(color === 'yellow' && s.isInMap(key,'lvl5') && s.isAtSpot(key,'lvl5','I',32)){
		s.teleport(key,'lvl5','E',false);
	}
});
s.newEvent('spawnButton',function(spot,color,defaultState){ //
	m.spawnActor(spot,'block-rock2x2',{
		sprite:s.newNpc.sprite(color + '-up',1),
		viewedIf:s.callEvent('viewedIfBlock',color,defaultState)
	});
	m.spawnActor(spot,'block-rock2x2',{
		sprite:s.newNpc.sprite(color + '-down',1),
		block:null,
		viewedIf:s.callEvent('viewedIfBlock',color,!defaultState)
	});
});
s.newEvent('spawnPushableRock',function(spot){ //
	m.spawnActor(spot,"pushable-rock2x2",{
		pushable:s.newNpc.pushable(8,8,function(key){
			s.add(key,'pushCount',1);
		}),
	});
});
s.newEvent('spawnWalkableRock',function(spot){ //
	m.spawnActor(spot,"block-rock2x2",{
		viewedIf:'viewPreventBlock'
	});
});
s.newEvent('viewPreventBlock',function(key){ //
	return !s.isPlayer(key);
});
s.newEvent('spawnList',function(list,spot){ //
	for(var i in list.walkableRock){
		s.callEvent('spawnWalkableRock',spot[list.walkableRock[i]]);
	}
	for(var i in list.pushableRock){
		s.callEvent('spawnPushableRock',spot[list.pushableRock[i]]);
	}
	for(var i in list.toggleRed){
		s.callEvent('spawnToggle',spot[list.toggleRed[i]],'red');
	}
	for(var i in list.toggleGreen){
		s.callEvent('spawnToggle',spot[list.toggleGreen[i]],'green');
	}
	for(var i in list.toggleYellow){
		s.callEvent('spawnToggle',spot[list.toggleYellow[i]],'yellow');
	}
	for(var i in list.toggleRedMove){
		s.callEvent('spawnToggleMove',spot[list.toggleRedMove[i]],'red');
	}
	for(var i in list.toggleGreenMove){
		s.callEvent('spawnToggleMove',spot[list.toggleGreenMove[i]],'green');
	}
	for(var i in list.toggleYellowMove){
		s.callEvent('spawnToggleMove',spot[list.toggleYellowMove[i]],'yellow');
	}
	for(var i in list.buttonRedDown){
		s.callEvent('spawnButton',spot[list.buttonRedDown[i]],'red',false);
	}
	for(var i in list.buttonGreenDown){
		s.callEvent('spawnButton',spot[list.buttonGreenDown[i]],'green',false);
	}
	for(var i in list.buttonYellowDown){
		s.callEvent('spawnButton',spot[list.buttonYellowDown[i]],'yellow',false);
	}
	for(var i in list.buttonRedUp){
		s.callEvent('spawnButton',spot[list.buttonRedUp[i]],'red',true);
	}
	for(var i in list.buttonGreenUp){
		s.callEvent('spawnButton',spot[list.buttonGreenUp[i]],'green',true);
	}
	for(var i in list.buttonYellowUp){
		s.callEvent('spawnButton',spot[list.buttonYellowUp[i]],'yellow',true);
	}
});
s.newEvent('resetActive',function(key){ //
	s.set(key,'greenActive',false);
	s.set(key,'yellowActive',false);
	s.set(key,'redActive',false);
});
s.newEvent('syncToggle',function(map){ //
	return function(key,switch1){
		s.setTimeout(key,function(){
			s.add(key,'pushCount',1);
			var tag = s.getTag(switch1);
			
			var switch2 = s.getRandomNpc(key,map,{
				duoId:tag.duoId,
				state:tag.state === 'off' ? 'on' : 'off'
			});			
						
			s.setAttr(switch2,'x',s.getAttr(switch1,'x'));
			s.setAttr(switch2,'y',s.getAttr(switch1,'y'));
		},25*2);
	}
});
s.newEvent('leave',function(key){ //
	var str = s.get(key,'lvl') >= 3 
		? 'Leave and complete the quest but with a penalty?' 
		: 'Abandon the quest and leave?';
	s.displayQuestion(key,str,function(key){
		if(s.get(key,'lvl') < 3) s.failQuest(key);
		else s.completeQuest(key);
	});
});
s.newEvent('resetPuzzle',function(key){ //
	s.add(key,'resetCount',1);
	s.callEvent('resetActive',key);
	var lvl = s.get(key,'lvl');
	if(lvl === 0)
		s.teleport(key,'lvl1','t1','party',true);
	if(lvl === 1)
		s.teleport(key,'lvl2','t1','party',true);
	if(lvl === 2)
		s.teleport(key,'lvl3','t1','party',true);
	if(lvl === 3)
		s.teleport(key,'lvl4','t1','party',true);
	if(lvl === 4)
		s.teleport(key,'lvl5','t1','party',true);
});
s.newEvent('talkTheninzon',function(key){ //
	s.startDialogue(key,'Theninzon','intro');
});

s.newItem('reset',"Reset Puzzle",'attackMelee-cube',[    //{
	s.newItem.option('resetPuzzle',"Reset Puzzle","Reset the puzzle.")
],'Reset the puzzle.'); //}

s.newDialogue('Theninzon','Theninzon','villagerFemale-8',[ //{ 
	s.newDialogue.node('intro',"There's a glitched chest, can you repair it for me?",[ 
		s.newDialogue.option("Sure",'intro2','')
	],''),
	s.newDialogue.node('intro2',"Only problem is the only way to access the chest is by completing puzzles involving switches.",[ 
		s.newDialogue.option("No problem.",'','startGame')
	],'')
]); //}

s.newMapAddon('QfirstTown-south',{
	spot:{n1:{x:2192,y:3152}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			name:'Theninzon',
			dialogue:'talkTheninzon',
			nevermove:true,
			angle:s.newNpc.angle('up'),
			sprite:s.newNpc.sprite('villagerFemale-8',1),
		});
	}
});
s.newMap('lvl1',{
	name:"Level 1",
	lvl:0,
	screenEffect:'weather',
	grid:["111111000000001000011111111111","111111000000001000011111111111","111111000000001000011111111111","111111000000011000011111111111","111111111111111000011111111111","001111111111001100110011111111","001111111111001100110001111111","001111111111001100110001000000","001111111111001100110001000000","001000110011111100111111000000","001000110011111100111111000000","001000110011000000001111111100","001000110011000000001111111100","001111000000000000001111111100","001111000000000000001111111100","001000111100000000001111111100","001000111100000000001111000000","001000001111111100111111000000","001100001111111100111111000000","000110001111111100111110000000","000011111111111100111100000000","000001111111111100111000000000","000000001111000000000000011111","000000001111000000000000011111","000000000000000000000000011111","111000000000000000000000000000","111001111000000000001111000000","111111111000000000001111000000","111111111000000000001111000000","111111111000000000001111000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:544,y:48},a:{x:544,y:192},b:{x:544,y:256},f:{x:288,y:320},c:{x:544,y:320},e:{x:416,y:384},d:{x:544,y:384},g:{x:288,y:448},h:{x:352,y:448},t1:{x:512,y:912}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['h'],
			pushableRock:['g'],
			toggleRed:['f'],
			toggleGreen:['e'],
			toggleYellow:[],
			toggleRedMove:[],
			toggleGreenMove:[],
			toggleYellowMove:['d'],
			buttonRedUp:['a'],
			buttonGreenUp:['c'],
			buttonYellowUp:['b'],
			buttonRedDown:[],
			buttonGreenDown:[],
			buttonYellowDown:[],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,'leave','zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.set(key,'lvl',1);
			s.teleport(key,'lvl2','t1');
			s.setRespawn(key,'lvl2','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMap('lvl2',{
	name:"Level 2",
	lvl:0,
	screenEffect:'weather',
	grid:["1111111100000100001000000000","1111111100000100001000000000","1111111111000100001000000000","1111111111001100001100011110","1111111111111100001111111110","1111111111100110011001111110","1111111111100110011001100000","0011110001111110011111100000","0011110001111110011111100000","0000110011111000011111100000","0000111111111000011111111111","0001111111111000011111111111","0001111111111000011111111111","0001111000000000000111111111","0001111000000000000111111111","0001111001111110011111111111","0001111001111110011111111111","0001111000000000000111111111","0001111000000000000111111111","0001111001111110011111100000","0001111001111110011111100000","0001111000000000000111100000","0001111000000000000111100000","0001111001111110011111100000","0001111001111110011111111100","0001111000000000000111111100","0001111000000000000111100000","0001111111111110000111100000","0001111111111110000111111111","0001110000111110011111111111","0000110000111110011111111111","0000011111100110011111100000","1111001111100110011111100000","1111001111100110011001100000","1111111111100110011001100000","0000011111110000000011000000","0000011110011000000110011110","0000000000001100001100011110","0000000000000100001000011110","0000000000000100001000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:512,y:48},a:{x:512,y:256},b:{x:512,y:320},c:{x:320,y:448},d:{x:384,y:448},e:{x:448,y:448},f:{x:512,y:448},g:{x:320,y:576},h:{x:384,y:576},i:{x:448,y:576},j:{x:512,y:576},k:{x:320,y:704},l:{x:384,y:704},m:{x:448,y:704},n:{x:512,y:704},o:{x:512,y:768},p:{x:512,y:832},q:{x:576,y:832},r:{x:576,y:896},t1:{x:512,y:1232}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['p'],
			pushableRock:['f','j','n'],
			toggleRed:['r'],
			toggleGreen:['q'],
			toggleYellow:[],
			toggleRedMove:[],
			toggleGreenMove:[],
			toggleYellowMove:['o'],
			buttonRedUp:['c','k'],
			buttonGreenUp:['e','i'],
			buttonYellowUp:['a','l'],
			buttonRedDown:['g'],
			buttonGreenDown:['m'],
			buttonYellowDown:['h','b','d'],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,'leave','zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.set(key,'lvl',2);
			s.teleport(key,'lvl3','t1');
			s.setRespawn(key,'lvl3','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMap('lvl3',{
	name:"Level 3",
	lvl:0,
	screenEffect:'weather',
	grid:["1111000000000000001100010000100111100000","1111000000000000001100010000100111100000","1111000000110000001100010000100111100111","1111111111110000000000110000111111100111","0000011110000111100011111001111000000000","0000011110000111100111111001111000000000","0000000000000111100111111001111000111100","0000000000000111111111111001111000111100","0000001111111111111111111001111000111100","0000001111111111111111111001111000000111","1111100010011111111111111001111000000111","1111100010011111111111111001111100000100","1111100010011000000000000001100111111100","0000000010011000000000000001100111111111","0000000010011000011111111001111111110011","0000000110011000011111111001111111110011","1111111100011110000000000000011111111111","1111100100011110000000000000011111111111","0001100111111110011111100110011110011111","0001111111111100011111100110011110011111","0001111110000000011111100110011110011111","0001001110000000011111100110011110011111","0001001110000001111111100110000000011111","0001111110000001111111000110000000011111","0001111110000000000000000000000000011111","0001111100000000000000000000000000011111","0001111000000000000000000000000001111111","0001111000000000000000000000000001111111","1111100111111110000001111111111111100111","1111100111111110000001111111111111100111","0000111111111110000001111111111111111100","0000011111111110000001111111111111111100","0000001111111111000011111111111111111111","0000001100011001000011111100000001111111","0000111100011001000011111100000001111111","0000111100000001000011111100001111100000","0000111100000001000011111100001100000000","0000111100000001000011111100001100000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:832,y:48},a:{x:832,y:352},f:{x:448,y:416},b:{x:832,y:416},g:{x:448,y:480},c:{x:832,y:480},d:{x:832,y:544},e:{x:896,y:544},h:{x:512,y:608},w:{x:1088,y:608},j:{x:448,y:672},i:{x:512,y:672},o:{x:896,y:672},v:{x:1024,y:736},l:{x:320,y:800},n:{x:576,y:800},p:{x:832,y:800},r:{x:896,y:800},s:{x:960,y:800},k:{x:256,y:864},m:{x:320,y:864},q:{x:832,y:864},t:{x:960,y:864},u:{x:1024,y:864},t1:{x:576,y:1168}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['t','u'],
			pushableRock:['v','s','r'],
			toggleRed:['l','w'],
			toggleGreen:[],
			toggleYellow:['k'],
			toggleRedMove:[],
			toggleGreenMove:['n'],
			toggleYellowMove:[],
			buttonRedUp:['c','p','q','h'],
			buttonGreenUp:['a','e','m'],
			buttonYellowUp:['d'],
			buttonRedDown:['g','o'],
			buttonGreenDown:['j','f','b'],
			buttonYellowDown:['i'],
		};
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,'leave','zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.set(key,'lvl',3);
			s.teleport(key,'lvl4','t1');
			s.setRespawn(key,'lvl4','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMap('lvl4',{
	name:"Level 4",
	lvl:0,
	screenEffect:'weather',
	grid:["0000000000000000000000000010000100000000","0000000000000111100000000010000100000000","0000000111100111100111100010000100011110","0000000111100111100111100010000100011110","0011111111100000000111100110000110011110","0011111111100000000111111110000111110000","0011111111111111111111100011001100110000","0000001111111111111111100011001100110000","0000001111111111111111111111001111110000","0000001111111111111111111111001111110000","0000001111000000000000001111000011110000","0011001111000000000000001111000011110000","0111111111000000000000001111110011110011","0000001111000000000000001111110011110011","0000001111000000000000001111110011110000","0000001111000000000000001111100011110000","0000001111000000000000000000000011110000","1111001111000000000000000000000011110000","1111001111000000000000111111111111110000","1111001111000000000000111111111111110000","0000001111000000000000001111111111100000","0000001111000000000000001111111111000000","0000001111000000000000001111111110000000","0000001111000000000000001111000000011110","0000001111111111110011111111000000011110","1111001111111111110011111111111110011110","1111001100011110000000111111111110000000","1111001100011110000000111001111110000000","0000000110011110000000000001000000000000","0000000011111000000000000011000000000000","0000000001111000000000000110000000000000","0000000000001000001111111100000110011110","0000011110001000011111111000001111111110","0000011110001000010000000000000000011110","0000011110001000010000000011110000000000","0000000000001000010000000011110000000000","0000000000001000010000000011110000000000","0000000000001000010000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{t2:{x:928,y:48},a:{x:352,y:352},b:{x:416,y:352},c:{x:480,y:352},d:{x:544,y:352},e:{x:608,y:352},f:{x:672,y:352},g:{x:736,y:352},i:{x:352,y:416},j:{x:416,y:416},k:{x:480,y:416},l:{x:544,y:416},m:{x:608,y:416},n:{x:672,y:416},o:{x:736,y:416},p:{x:352,y:480},q:{x:416,y:480},r:{x:480,y:480},s:{x:544,y:480},t:{x:608,y:480},u:{x:672,y:480},v:{x:736,y:480},w:{x:352,y:544},x:{x:416,y:544},A:{x:480,y:544},B:{x:672,y:544},C:{x:736,y:544},D:{x:800,y:544},E:{x:864,y:544},G:{x:352,y:608},H:{x:416,y:608},I:{x:544,y:608},J:{x:608,y:608},K:{x:672,y:608},L:{x:352,y:672},M:{x:416,y:672},N:{x:480,y:672},O:{x:544,y:672},P:{x:608,y:672},Q:{x:672,y:672},R:{x:736,y:672},S:{x:352,y:736},T:{x:416,y:736},U:{x:480,y:736},V:{x:544,y:736},W:{x:672,y:736},X:{x:736,y:736},e1:{x:608,y:800},e2:{x:608,y:864},e3:{x:736,y:928},t1:{x:480,y:1168}},
	load:function(spot){
		var toSpawn = {
			walkableRock:['q','p'],
			pushableRock:['r','s','A','J'],
			toggleRed:[],
			toggleGreen:['e3'],
			toggleYellow:[],
			toggleRedMove:['t'],
			toggleGreenMove:[],
			toggleYellowMove:['I'],
			buttonRedUp:['D','T'],
			buttonGreenUp:[
				'a','b','c','d','e','f','g','i','o','p',
				'v','w','G','L','S','V','W','X','R','C'
			],
			buttonYellowUp:['E'],
			buttonRedDown:['e2'],
			buttonGreenDown:[
				'j','k','l','m','n','u','B','K','Q','O','N','M','H','x'
			],
			buttonYellowDown:['e1','U'],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,'leave','zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnTeleporter(spot.t2,function(key){
			s.set(key,'lvl',4);
			s.teleport(key,'lvl5','t1');
			s.setRespawn(key,'lvl5','t1');
			s.callEvent('resetActive',key);
		},'zone',{
			angle:s.newNpc.angle('up'),
		});
	}
});
s.newMap('lvl5',{
	name:"Level 5",
	lvl:0,
	screenEffect:'weather',
	grid:["000000000000000000000000000000000000000000000","000000000011000000000000111111111110000000000","000000000011000000000000111100000011000000000","000000000000000000000000001000000001000000000","000000000000011110000000001000000001000011110","000000000000011110000000001000000001000011110","000000011110011111100000001100000011111111110","000000011110000001100000000110000110011000000","000000011110000000001111000010000100000000000","000000000000000000001111000010000100000000000","011000000000000000001111000010000110000000000","011000000000000000000000000110000111000000000","000011110000000000000000001111001111111110000","000011110000000111111111111111001111111110000","000011110000001111111111111111001111111110011","000000000000001111111111111111001111110000011","000000000000001111110000000011001111110000000","000000111111111111110000000011001111110000000","000000111111111111000000000000000011110000000","000000000111111111000000000000000011110000000","000000000000001111000000000000110011111000000","000000000000001111000000000000110011111100000","000000000000001111000000000000110011111111110","000000001111001111000000000000110011111111110","000000001111001111000000000000000000111111110","011110001111001111000000000000000000111100000","011110000000001111000000000011111100111100000","011110000000011111000000000011111100111100000","000000000111110011110000000000000000111100000","000000001111110011110000000000000000111100000","000000001111111111111111110000000000111100000","000000001111111111111111110000000000111100000","000000011111001100110011000000000000111100000","110000111111001100110011000000000000111111111","110000111111001100110011000000000000111111111","000000111111001100110011000000000000111111111","000000111100000000000000000000000000111100000","000000111100000000000000000000000000111100000","000000111100111111111111000000000000111100000","000000111100111111111111000000000000111100011","000000111100000000000000000000000000111100011","000000111100000000000000000000000000111100000","000000111111111111111111111100000000111100000","000000111111111111111111111100000000111100000","000000011111111111111111111100000000111000000","000000001111111111111111111110000001110011110","000111100111111111111111111111000011100011110","000111100000000000000000001111000010000011110","000111100000000000000000001111000010000000000","000000000000000000000000000001000010000000000"],
	tileset:'v1.2'
},{
	spot:{a:{x:992,y:144},b:{x:672,y:544},c:{x:736,y:544},d:{x:800,y:544},e:{x:864,y:544},f:{x:992,y:544},g:{x:608,y:608},h:{x:672,y:608},i:{x:736,y:608},j:{x:800,y:608},k:{x:864,y:608},l:{x:928,y:608},m:{x:992,y:608},n:{x:1056,y:608},p:{x:608,y:672},q:{x:672,y:672},r:{x:736,y:672},s:{x:800,y:672},t:{x:864,y:672},u:{x:928,y:672},v:{x:1056,y:672},w:{x:608,y:736},x:{x:672,y:736},A:{x:736,y:736},B:{x:800,y:736},C:{x:864,y:736},D:{x:928,y:736},E:{x:1056,y:736},F:{x:608,y:800},G:{x:672,y:800},H:{x:800,y:800},n1:{x:928,y:800},n2:{x:992,y:800},I:{x:1056,y:800},J:{x:608,y:864},K:{x:672,y:864},L:{x:736,y:864},M:{x:800,y:864},N:{x:864,y:864},O:{x:672,y:928},P:{x:736,y:928},Q:{x:800,y:928},R:{x:864,y:928},S:{x:992,y:928},T:{x:1056,y:928},U:{x:928,y:992},V:{x:992,y:992},W:{x:1056,y:992},ef:{x:416,y:1056},ee:{x:544,y:1056},ec:{x:672,y:1056},X:{x:928,y:1056},e1:{x:992,y:1056},e2:{x:1056,y:1056},e3:{x:928,y:1120},e4:{x:992,y:1120},e5:{x:1120,y:1120},eg:{x:416,y:1184},ed:{x:672,y:1184},e6:{x:928,y:1184},e7:{x:992,y:1184},e8:{x:1056,y:1184},ea:{x:992,y:1248},eb:{x:1056,y:1248},t1:{x:1024,y:1552}},
	load:function(spot){
		var toSpawn = {
			walkableRock:[],
			pushableRock:['B','C','H','T','e2','e5','eg','ed'],
			toggleRed:['ef'],
			toggleGreen:['ee'],
			toggleYellow:['ec'],
			toggleRedMove:['A'],
			toggleGreenMove:[],
			toggleYellowMove:['W'],
			buttonRedUp:['f','n','p','K','J','P','Q','V','n2'],
			buttonGreenUp:['d','q','x','w','G','e6','X','eb'],
			buttonYellowUp:['i','k','l','E','O','S','e1','e4','e7','e8'],
			buttonRedDown:['c','g','h','r','s','t','u','D','F','n1','L','M','R'],
			buttonGreenDown:['b','e','m','v','U','e3','ea'],
			buttonYellowDown:['I','N'],
		}
		
		s.callEvent('spawnList',toSpawn,spot);
		
		m.spawnTeleporter(spot.t1,'leave','zone',{
			angle:s.newNpc.angle('down'),
		});
		m.spawnLoot(spot.a,function(){ return true;},function(key){
			s.set(key,'lvl',5);
			s.completeQuest(key);
		});
	}
});

s.exports(exports);
