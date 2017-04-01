
"use strict";
(function(){ //}
var Actor, Main, Socket;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); Socket = rootRequire('private','Socket');
});
var Metrics = exports.Metrics = {};

var onSignUp = [];
var onSignIn = [];
var onSignOff = [];
var onQuestComplete = [];
var onEquipUpgrade = [];

Metrics.onSignUp = function(username){
	onSignUp.push({
		username:username,
		date:Date.now(),
	});
}
Metrics.onEquipUpgrade = function(key){
	onEquipUpgrade.push({
		username:Actor.get(key).username,
		date:Date.now(),
	});
}
Metrics.onSignIn = function(key){
	onSignIn.push({
		username:Actor.get(key).username,
		date:Date.now(),
	});
}
Metrics.onSignOff = function(key){
	var quest = Main.get(key).questActive;
	var hint = Main.get(key).questHint;
	onSignOff.push({
		username:Actor.get(key).username,
		date:Date.now(),
		timePlayed:Date.now() - Socket.get(key).connectionStartTime,
		quest:quest,
		hint:hint,
	});
}
Metrics.onQuestComplete = function(key,quest,chalSuccess){
	var challenge = chalSuccess ? chalSuccess.name : null;
	
	onQuestComplete.push({
		username:Actor.get(key).username,
		date:Date.now(),
		quest:quest,
		challenge:challenge,
	});
}
Metrics.getDisplayText = function(){
	var str = [];
	for(var i = 0 ; i < onSignIn.length; i++){
		var a = onSignIn[i];
		str.push(Date.niceFormat(a.date) + ' ' + a.username + ' signed in.<br>');
	}
	for(var i = 0 ; i < onSignUp.length; i++){
		var a = onSignUp[i];
		str.push(Date.niceFormat(a.date) + ' ' + a.username + ' signed up.<br>');
	}
	for(var i = 0 ; i < onSignOff.length; i++){
		var a = onSignOff[i];
		str.push(Date.niceFormat(a.date) + ' ' + a.username + ' signed off (' + Math.floor(a.timePlayed / 60000) + ' mins) ' + (a.quest ? '<br> ==== ' + a.quest + ' - ' + a.hint : '') + '<br>');
	}
	for(var i = 0 ; i < onQuestComplete.length; i++){
		var a = onQuestComplete[i];
		str.push(Date.niceFormat(a.date) + ' ' + a.username + ' completed quest ' + a.quest + (a.challenge ? ' (Challenge ' + a.challenge + ')': '') + '<br>');
	}
	for(var i = 0 ; i < onEquipUpgrade.length; i++){
		var a = onEquipUpgrade[i];
		str.push(Date.niceFormat(a.date) + ' ' + a.username + ' upgraded an equip.<br>');
	}
	str.sort();	//only works cuz all starts with date
	
	var str2 = '';
	var up24 = 0;
	for(var i = 0 ; i < onSignUp.length; i++)
		if(onSignUp[i].date > Date.now()-CST.DAY)
			up24++;
	str2 += 'SignUp: ' + onSignUp.length + ' (24h: ' + up24 + ')<br>';
	//#####################
	var in24 = {};
	var in24c = 0;
	for(var i = 0 ; i < onSignIn.length; i++)
		if(onSignIn[i].date > Date.now()-CST.DAY*3)
			in24[onSignIn[i].username] = 1;
	in24c = in24.$length();
	
	var time = 0;
	for(var i = 0 ; i < onSignOff.length; i++)
		time += onSignOff[i].timePlayed;
	time = Math.floor(time / onSignOff.length / 60000);
	str2 += 'SignIn: ' + onSignIn.length + ' (Avg Playtime: ' + time + ' mins, 72h no dupe: ' + in24c + ')<br>';
	//######################
	var quest24 = {};
	var quest24c = 0;
	for(var i = 0 ; i < onQuestComplete.length; i++)
		if(onQuestComplete[i].date > Date.now()-CST.DAY*3)
			quest24[onQuestComplete[i].username] = 1;
	quest24c = quest24.$length();
	
	var chal = 0;
	for(var i = 0 ; i < onQuestComplete.length; i++)
		if(onQuestComplete[i].challenge)
			chal++;
	str2 += 'Quest: ' + onQuestComplete.length + ' (Challenge: ' + chal + ', 72h diff person: ' + quest24c + ')<br>';
	
	str2 += '<br>' + str.join('');
	return str2;
	
}
Metrics.deleteAll = function(){
	onSignUp = [];
	onSignIn = [];
	onSignOff = [];
	onEquipUpgrade = [];
	onQuestComplete = [];
}


})(); //{













