//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Song = require4('Song'), Main = require4('Main'), Message = require4('Message');
var Pref = exports.Pref = {};

var VOL_MASTER = 25; //30
Pref.create = function(id,name,initValue,min,max,description,func){
	var tmp = {
		id:id||ERROR(3,'id missing'),
		name:name||'',
		initValue:initValue || 0,
		min:min||0,
		max:max||0,
		description:description||'',
		func:func||null,
	}
	DB[id] = tmp;
}

var DB = Pref.DB = {};

Pref.get = function(id){
	if(!id) return DB;
	return DB[id] || null;
}

Pref.create('volumeMaster','Volume Master',VOL_MASTER,0,100,'Volume Master. 0:Mute',function(){ Song.updateVolume(); });	//cant direct cuz id need song to be loaded
Pref.create('volumeSong','Volume Song',5,0,100,'Volume Song.',function(){ Song.updateVolume(); });
Pref.create('volumeSfx','Volume Effects',75,0,100,'Volume Sound Effects.');
Pref.create('clientPredictionThreshold','Lantecy Threshold',200,75,10000,'BETA. Activate Client Prediction if latency (in ms) is above this value.');
Pref.create('displayStrike','Display AoE',0,0,1,'Display Damage Zone For Strikes. 0=no, 1=yes');
Pref.create('strikeTarget','Highlight Target',0,0,3,'Display Damage Zone For Strikes. 0=Red Border, 1=Red Rect 2=Red Skin 3=None');
Pref.create('displayFPS','Display FPS',1,0,1,'Display FPS Performance. 0=false, 1=true');
Pref.create('overheadHp','Overhead Hp',0,0,1,'Display HP Bar and Status Effect over player head.');
Pref.create('chatHeadTimer','Chat Head Timer',10,2,60,'How long chat messages are displayed above their heads (in seconds).');
Pref.create('highlightHover','Highlight Hover',0,0,1,'Highlight actor sprite under mouse.');
Pref.create('signNotification','Notify Log In',1,0,2,'Notify you if someone logs in or out of the game. 0=none, 1=text, 2=sound');
Pref.create('puush','Allow Puush Link',2,0,2,'Allow Puush Link in chat. 0=never, 1=friend only, 2=always');
Pref.create('chatTimePublic','Chat Time',120,15,999,'Time in seconds before chat box messages disappear.');
Pref.create('mapRatio','Map Ratio',6,4,7,'Minimap Size');
Pref.create('bankTransferAmount','X- Bank',1000,1,9999999999,'Amount of items transfered with Shift + Left Click');
Pref.create('orbAmount','X- Orb',1000,1,9999999999,'Amount of orbs used with X- option');
Pref.create('controller','Enable Controller',0,0,1,'Play the game with a Xbox 360 Controller.');
Pref.create('displayMiddleSprite','Display Center Sprite',0,0,1,'Display a dot in the middle of actor sprites. 0=false, 1=true');
Pref.create('minimizeChat','Minize Chat',0,0,1,'Minize chat. 0=false, 1=true');
Pref.create('displayServerPosition','Display Server Position',1,0,1,'Display Server Position (Black Circle) when Client Prediction is active. 0=false, 1=true');

Pref.strikeTarget = {
	RED_BORDER:0,
	RED_RECT:1,
	RED_SKIN:2,
	NONE:3
}


Pref.RESET = 'reset';

Pref.verify = function(name,value){
	var req = DB[name];

	value = +value; 
	if(isNaN(value)) return false;
	
	return value.mm(req.min,req.max);	
}
Pref.getDefaultValue = function(pref){
	var a = {};
	for(var i in DB)
		a[i] = DB[i].initValue;
	for(var i in pref)
		if(a[i] !== undefined) 
			a[i] = pref[i];
	return a;
}

Pref.change = function(name,value){
	if(name === Pref.RESET){
		main.pref = Main.Pref();
		return Message.add(key,'Preferences Reset to Default.');
	}
	
	if(main.pref[name] === undefined) return Message.add(key,'Invalid name.');
	value = Pref.verify(name,value);
	if(value === false) return Message.add(key,'Invalid value.');
	
	main.pref[name] = value;
	if(DB[name].func) DB[name].func(value);
	Message.add(key,'Preferences Changed.');	//timer:100
	localStorage.setItem('pref',JSON.stringify(main.pref));
}

})();