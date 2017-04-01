//11/26/2014 6:34 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/
'use strict';
var s = loadAPI('v1.0','Qbtt000',{
	name:'Break Targets',
	author:'rc',
	maxPartySize:1,
	thumbnail:true,
	category:["Mixed"],
	zone:"QfirstTown-east",
	party:"No",
	reward:{monster:0,score:0.05,completion:0.05},
	description:"Find the fastest way to break 10 targets.",
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
	
*/

s.newVariable({
	killTarget:0,
	chrono:0,
	lastReset:0,
	countComplete:0,
	chalTimes:0,
	startGame:false,
});

s.newHighscore('speedrun','Fastest Time','Fastest Time','ascending',function(key){
	return s.get(key,'chrono')*40;		//record = 6 sec
});
s.newHighscore('fireonly','Fire Only','Fastest Time with the Challenge Fire Only active.','ascending',function(key){
	if(s.isChallengeActive(key,'fireonly')) return s.get(key,'chrono')*40;		//record = 11.160
	return null;
});

s.newChallenge('speedrun','Speedrun','Get below 10 seconds.',function(key){
	return s.get(key,'chrono') < 25*10;
});
s.newChallenge('fireonly','Fire Only','Get below 15 seconds only using the fire attack.',function(key){
	return s.get(key,'chrono') < 25*15;
});
s.newChallenge('fivetimes','5 Times!','Get below 15 seconds five times in a row.',function(key){
	return true;
});

s.newEvent('_start',function(key){	//
	if(s.isAtSpot(key,'QfirstTown-east','t6',200))
		s.callEvent('talkMatthe',key);
	else s.addStartQuestMarker(key);
});
s.newEvent('_hint',function(key){	//
	if(!s.get(key,'startGame'))
		return 'Talk with Matthe.';
	return "Kill all 10 targets.<br>" + s.inputToText(4) + " = Restart.";
});
s.newEvent('_death',function(key){ //
	if(!s.get(key,'startGame'))
		return;
	s.failQuest(key);
});
s.newEvent('_signIn',function(key){	//
	s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	if(s.isInQuestMap(key)){
		s.teleport(key,'QfirstTown-east','t6','main');
		s.setRespawn(key,'QfirstTown-east','t6','main');
	}
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('startGame',function(key){	//
	s.set(key,'startGame',true);
	s.removeStartQuestMarker(key);
	s.message(key,"Break all 10 targets in less than 18 seconds.");
	s.message(key,"Press " + s.inputToText(2) + " to shoot 5 fireballs.");
	s.message(key,"Press " + s.inputToText(4) + " to restart the quest quickly.");
	if(s.isChallengeActive(key,'fireonly')) 
		s.usePreset(key,'fireonly');
	else s.usePreset(key,'target');
	s.callEvent('teleportCourse',key);
});
s.newEvent('teleportCourse',function(key){	//
	s.enableMove(key,false);
	s.enableAttack(key,false);
	s.teleport(key,'main','t1','solo',true);
	s.removeChrono(key,'timer');
	s.rechargeAbility(key);
	s.setTimeout(key,'startCourse',40);
});
s.newEvent('startCourse',function(key){	//
	s.message(key,"GO!");
	s.startChrono(key,'timer');
	s.enableMove(key,true);
	s.enableAttack(key,true);
});
s.newEvent('killTarget',function(key){	//
	s.add(key,'killTarget',1)
	if(s.get(key,'killTarget') >= 10){
		s.callEvent('endCourse',key);
	}
});
s.newEvent('endCourse',function(key){	//
	var time = s.stopChrono(key,'timer');
	s.set(key,'chrono',time);
	s.message(key,'Your time: ' + s.frameToChrono(time));
	if(!s.isChallengeActive(key,'fivetimes')){
		if(time < 25*18)
			return s.completeQuest(key);
		else {
			s.displayPermPopup(key,'Try harder to get sub 18 seconds.');
			s.callEvent('resetCourse',key);
			s.setTimeout(key,function(){
				s.closePermPopup(key);
			},25*3);
			return;
		}
	}
	
	//else
	if(time < 25*15) 
		s.add(key,'chalTimes',1);
	else {
		s.set(key,'chalTimes',0);
		s.message(key,'Your time was slower than 15 seconds... Your count has been reset.');
	}
	s.message(key,'Challenge 5 Times: ' + s.get(key,'chalTimes') + '/5');
	if(s.get(key,'chalTimes') >= 5)	
		return s.completeQuest(key);
	else 
		s.callEvent('resetCourse',key);
});
s.newEvent('resetCourse',function(key){	//
	s.set(key,'killTarget',0);
	s.callEvent('teleportCourse',key);
});
s.newEvent('abilityReset',function(key){	//
	if(Date.now() - s.get(key,'lastReset') < 2000) return;	//prevent player to restart too fast
	s.set(key,'lastReset',Date.now())
	if(s.isChallengeActive(key,'fivetimes')){
		s.set(key,'chalTimes',0);
		s.message(key,'Challenge 5 Times: ' + s.get(key,'chalTimes') + '/5');
	}
	s.callEvent('resetCourse',key);
});
s.newEvent('talkMatthe',function(key){ //
	s.startDialogue(key,'Matthe','intro');
});
s.newAbility('simple','attack',{
	name:'Bullet',
	icon:'offensive-bullet',
	description:'This is an ability.',
	periodOwn:15
},{
	type:'bullet',
	dmg:s.newAbility.dmg(150,'range'),
	hitAnim:s.newAbility.anim('earthBomb',0.4),
	sprite:s.newAbility.sprite('rock',0.5)
});
s.newAbility('boomerang','attack',{
	name:'Boomerang',
	icon:'weapon-boomerang',
	description:'This is an ability.',
	periodGlobal:15
},{
	type:'bullet',
	dmg:s.newAbility.dmg(150,'melee'),
	hitAnim:s.newAbility.anim('strikeHit',0.5),
	maxTimer:250,
	ghost:True,
	boomerang:s.newAbility.boomerang(1,1,0.2,True),
	sprite:s.newAbility.sprite('bone',1),
	pierce:s.newAbility.pierce(1,0.8,5)
});
s.newAbility('5ways','attack',{
	name:'Fire Bullet',
	icon:'attackMagic-fireball',
	description:'This is an ability.',
	periodOwn:100,
	periodGlobal:15
},{
	type:'bullet',
	amount:5,
	angleRange:360,
	dmg:s.newAbility.dmg(150,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	ghost:True,
	sprite:s.newAbility.sprite('fireball',1.2)
});
s.newAbility('reset','event',{
	name:'myAbility',
	icon:'attackMelee-cube',
	description:'This is an ability.'
},{
	event:s.getEvent('abilityReset')
});

s.newPreset('target',s.newPreset.ability(['simple','boomerang','5ways','','reset','']),null,False,False,False,False);
s.newPreset('fireonly',s.newPreset.ability(['5ways','','','','reset','']),null,False,False,False,False);

s.newDialogue('Matthe','Matthe','villagerMale-5',[ //{ 
	s.newDialogue.node('intro',"Hey! There is a weird bug in the map ahead. There are [[10 targets]] that spawned out of nowhere and I can\'t get rid of them fast enough. Can you help me out?",[ 
		s.newDialogue.option("Sure.",'','startGame')
	],''),
]); //}

s.newMap('main',{
	name:'Practice Field'
},{
	load: function(spot){
		var list = ['e1','e2','e3','e4','e5','e6','e7','e8','ea','eb'];
		for(var i = 0 ; i < list.length; i++)
			m.spawnActor(spot[list[i]],"target",{deathEvent:'killTarget'});
	}
});
s.newMapAddon('QfirstTown-east',{
	load: function(spot){
		m.spawnActor(spot.t6,'npc',{
			dialogue:'talkMatthe',
			sprite:s.newNpc.sprite('villagerMale-5',1),
			minimapIcon:CST.ICON.quest,
			angle:s.newNpc.angle('up'),
			nevermove:true,
			name:'Matthe',
			tag:{Matthe:true},
		});
		m.setAsStartPoint(spot.t6);
	}
});



s.exports(exports);