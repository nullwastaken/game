//06/27/2015 12:32 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','Qsoccer',{
	name:"Soccer",
	author:"rc",
	description:"Play soccer against your friends! Push the ball in the goal to score.",
	maxPartySize:8,
	zone:"QfirstTown-west",
	category:["Mixed"],
	thumbnail:true,
	reward:{"completion":0.75,"score":0.75,"monster":0}
});
var m = s.map; var b = s.boss; var d = s.sideQuest; var g;

/* COMMENT:
can right click players, annoying
solo player is in team2Pt
*/

s.newVariable({
	team1Pt:0,
	team2Pt:0,
	team:1,
	deathCount:0,
	startGame:False
});
s.newHighscore('speedrun',"Speedrun","Fastest Completion of the quest",'ascending',function(key){
	if(s.getPartySize(key) === 1)
		return s.stopChrono(key,'timer');
});

s.newChallenge('speedrun',"Speedrun","Complete the quest in less than 1:30 minute",function(key){
	return s.stopChrono(key,'timer') < 25 * 90;
},1);
s.newChallenge('wind',"Windy","The wind is against you!",function(key){
	return true;
},1);
s.newChallenge('deathless',"Deathless","You have 500 Hp. You can't die.",function(key){
	return s.get(key,'deathCount') === 0;
},1);

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-wBump','n1',200))
		s.callEvent('talkJaimaysh',key);
	else s.addStartQuestMarker(key);
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_signOff',function(key){ //
	s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-wBump','n1','main');
		s.setRespawn(key,'QfirstTown-wBump','n1','main');
	}
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('talkJaimaysh',function(key){ //
	s.startDialogue(key,'Jaimaysh','intro');
	s.removeStartQuestMarker(key);
});
s.newEvent('spawnBall',function(key){ //
	s.spawnActor(key,'main','e1','bat',{
		name:"Ball",
		damageIf:s.newNpc.damageIf('never'),
		useUpdateInput:false,
		globalDef:100000000,
		hp:4,
		sprite:s.newNpc.sprite('pushable-rock2x2',0.75),
		statusResist:s.newNpc.statusResist(1,0,1,1,1,1),
		tag:{
			ball:true,
		}
	});
});
s.newEvent('startGame',function(key){ //
	s.set(key,'startGame',true);
	var list = s.getParty(key);
	
	var todo = [
		[1,'t1','LEFT'],
		[2,'t1','LEFT'],
		[1,'t1','LEFT'],
		[2,'t1','LEFT'],
		[1,'t1','LEFT'],
		[2,'t1','LEFT'],
		[1,'t1','LEFT'],
		[2,'t1','LEFT'],
		[1,'t1','LEFT'],
	
	]
	for(var i = 0 ; i < list.length; i++){
		var team = i % 2 + 1;
		var side = team === 1 ? 'LEFT' : 'RIGHT';
		var tele = team === 1 ? 't1' : 't2';
		
		s.set.one(list[i],'team',team);
		s.teleport.one(list[i],'main',tele,'party');
		s.setRespawn.one(list[i],'main',tele,'party');
		s.message.one(list[i],'Push the ball to the ' + side + ' side to score.',true);
	}
	
	if(list.length === 1){
		for(var i = 0 ; i < 3; i++){
			s.spawnActor(key,'main','t2','defender',{
				damageIf:s.newNpc.damageIf('always'),
				damagedIf:s.newNpc.damagedIf('never'),
				globalDef:100000000,
				hp:4,
			});
				
			s.spawnActor(key,'main','t4','defender',{
				damageIf:s.newNpc.damageIf('always'),
				damagedIf:s.newNpc.damagedIf('never'),
				globalDef:100000000,
				hp:4,
			});
			
			s.spawnActor(key,'main','t3','skeleton',{
				damagedIf:s.newNpc.damagedIf('never'),
				globalDef:100000000,
				hp:4,
			});
		}
		s.displayPopup(key,'Score 5 times to win the game.<br>If they score once, you lose.');
	}
	
	s.callEvent('spawnBall',key);
	if(s.getPartySize(key) === 1)
		s.usePreset(key,'soccer');
	else
		s.usePreset(key,'soccerParty');
	s.startChrono(key,'timer');
	if(s.isChallengeActive(key,'deathless')){
		s.addBoost(key,'hp-max',0.5);
	}
});
s.newEvent('onGoal',function(key,team){ //
	if(team === 1){
		s.add(key,'team1Pt',1);
		if(s.getPartySize(key) === 1){
			s.setTimeout(key,function(){	//so doesnt fuck map loop
				s.failQuest(key);
			},5);
			return true;
		} else {
			if(s.get(key,'team1Pt') >= 5){
				s.displayPopup(key,'Left Team won!');
				s.setTimeout(key,function(){
					s.completeQuest(key);
				},25*3);
				return true;
			}
		}
	}
	if(team === 2){
		s.add(key,'team2Pt',1);
		if(s.get(key,'team2Pt') >= 5){
			if(s.getPartySize(key) === 1){
				s.setTimeout(key,function(){ //so doesnt fuck map loop
					s.completeQuest(key);
				},5);
				return true;
			} else {
				s.displayPopup(key,'Right Team won!');
				s.setTimeout(key,function(){
					s.completeQuest(key);
				},25*3);
				return true;
			}
		}
	}
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'startGame'))
		return 'Talk with Jaimaysh.';
	
	if(s.getPartySize(key) === 1){
		return 'Goal Count: ' + s.get(key,'team2Pt');
	}
		
	if(s.get(key,'team') === 1)
		return s.get(key,'team1Pt') + ' - ' + s.get(key,'team2Pt') 
			+ '<br>Push the ball to the LEFT side to score.' ;
	else
		return s.get(key,'team1Pt') + ' - ' + s.get(key,'team2Pt') 
			+ '<br>Push the ball to the RIGHT side to score.' ;
});
s.newEvent('_death',function(key){ //
	if(!s.get(key,'startGame'))
		return;
	s.add(key,'deathCount',1);
	return true;
});

s.newAbility('pushBall','attack',{
	name:"Tornado",
	icon:'attackMelee-fierce',
	periodOwn:10,
	periodGlobal:10,
	delay:0
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(1,'range'),
	knock:s.newAbility.status(1,2,0.25),
	sprite:s.newAbility.sprite('tornado',1)
});
s.newAbility('closeBall','attack',{
	periodOwn:10,
	periodGlobal:10
},{
	type:'strike',width:50,height:50,amount:1,
	dmg:s.newAbility.dmg(1,'melee'),
	knock:s.newAbility.status(1,2,1),
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim('slashMelee',1)
});
s.newAbility('pushBallNpc','attack',{
	name:"Tornado",
	icon:'attackMelee-fierce',
	periodOwn:35,
	periodGlobal:35,
	delay:0
},{
	type:'bullet',
	amount:5,
	angleRange:180,
	dmg:s.newAbility.dmg(1,'range'),
	knock:s.newAbility.status(1,2,0.25),
	sprite:s.newAbility.sprite('tornado',1)
});
s.newAbility('closeBallParty','attack',{
	periodOwn:10,
	periodGlobal:10
},{
	type:'strike',amount:1,width:50,height:50,
	dmg:s.newAbility.dmg(1,'melee'),
	knock:s.newAbility.status(1,2,2.1),
	initPosition:s.newAbility.initPosition(0,50),
	preDelayAnim:s.newAbility.anim('slashMelee',1)
});
s.newAbility('pushBallParty','attack',{
	name:"Tornado",
	icon:'attackMelee-fierce',
	periodOwn:10,
	periodGlobal:10,
	delay:0
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(1,'range'),
	knock:s.newAbility.status(1,2,0.5),
	sprite:s.newAbility.sprite('tornado',1)
});

s.newPreset('soccer',s.newPreset.ability(['closeBall','pushBall','','','','']),null,False,False,False,False);
s.newPreset('soccerParty',s.newPreset.ability(['closeBallParty','pushBallParty','','','','']),null,False,False,False,False);

s.newDialogue('Jaimaysh','Jaimaysh','villagerFemale-4',[ //{ 
	s.newDialogue.node('intro',"I'm petting a bunch of ghosts and they are bored all the time. Do you want to entertain them for me?",[ 
		s.newDialogue.option("Sure.",'intro2'),
		s.newDialogue.option("What do ghosts like to do?",'intro2')
	]),
	s.newDialogue.node('intro2',"Their favorite activity is playing [[soccer]]. Use your abilities to push the ball in their zone. And beware of my Skeleton pets, they don't like strangers much. Good luck.",[ 
		s.newDialogue.option("Okay, I'm up for the task.",'','startGame')
	])
]); //}

s.newNpc('defender',{
	name:"Defender",
	sprite:s.newNpc.sprite('ghost',1),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('pushBallNpc',[1,1,1])
	])
});

s.newMap('main',{
	name:"Soccer Field"
},{
	load:function(spot){
		
	},
	loop:function(spot){
		m.forEachActor(spot,10,function(eid){
			s.moveActor(eid,0,16);
		},'npc',spot.qc,{ball:true});
		
		m.forEachActor(spot,10,function(eid){
			s.moveActor(eid,0,-16);
		},'npc',spot.qd,{ball:true});
		
		var stop = false;
		m.forEachActor(spot,10,function(eid){
			s.killActor(eid);
			
			var key = m.getRandomPlayer(spot);
			s.callEvent('spawnBall',key);
			stop = s.callEvent('onGoal',key,2);
		},'npc',spot.qa,{ball:true});
		
		if(stop) return;
		
		m.forEachActor(spot,10,function(eid){
			s.killActor(eid);
			
			var key = m.getRandomPlayer(spot);
			s.callEvent('spawnBall',key);
			stop = s.callEvent('onGoal',key,1);
		},'npc',spot.qb,{ball:true});
		
		m.forEachActor(spot,2,function(eid){
			var key = m.getRandomPlayer(spot);
			if(s.isChallengeActive(key,'wind'))
				s.moveActor(eid,6,0);
		},'npc',spot.qe,{ball:true});
	}
});
s.newMapAddon('QfirstTown-wBump',{
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkJaimaysh',
			angle:s.newNpc.angle('right'),
			name:'Jaimaysh',
			minimapIcon:CST.ICON.quest,
			nevermove:true,
			sprite:s.newNpc.sprite('villagerFemale-4',1),
		});
		m.setAsStartPoint(spot.n1);
	}
});

s.exports(exports);
