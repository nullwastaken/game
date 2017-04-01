
"use strict";
(function(){ //}
var Song, Main, Message, Input, Dialog;
global.onReady(function(){
	Dialog = rootRequire('client','Dialog',true); Song = rootRequire('client','Song',true); Main = rootRequire('shared','Main',true); Message = rootRequire('shared','Message',true); Input = rootRequire('server','Input',true);
});
var Pref = exports.Pref = function(extra){
	this.id = '';
	this.name = '';
	this.initValue = 0;
	this.min = 0;
	this.max = 0;
	this.description = '';
	this.func = null;	//function(val)
	this.displayType = Pref.DisplayType();
	Tk.fillExtra(this,extra);
};

var VOL_MASTER = 25; //30
Pref.create = function(id,name,initValue,min,max,description,displayType,func){
	var tmp = new Pref({
		id:id,
		name:name,
		initValue:initValue,
		min:min,
		max:max,
		description:description,
		func:func,
		displayType:displayType,
	});
	if(min === 0 && max === 1)
		tmp.displayType = Pref.DisplayType('boolean');
	
	DB[id] = tmp;
}

var DB = Pref.DB = {};

Pref.get = function(id){
	if(!id) return DB;
	return DB[id] || null;
}

Pref.DisplayType = function(type,option){
	var a = {
		type:type || 'number',
		option:option || null	
	}
	if(!['boolean','number','string','slider'].$contains(a.type)) 
		return ERROR(4,'invalid type',a.type);
	return a;
}

Pref.create('volumeMaster','Volume Master',VOL_MASTER,0,100,'Volume Master. 0:Mute',Pref.DisplayType('slider'),function(){ Song.updateVolume(); });	//cant direct cuz id need song to be loaded
Pref.create('volumeSong','Volume Song',5,0,100,'Volume Song.',Pref.DisplayType('slider'),function(){ Song.updateVolume(); });
Pref.create('volumeSfx','Volume Effects',75,0,100,'Volume Sound Effects.',Pref.DisplayType('slider'));
Pref.create('maxParticleMod','Particle Quantity (%)',100,0,100,'Quantity of particles. Turn off to improve performance. 0= No Particle');
Pref.create('enableLightingEffect','Enable Lighting Effects',1,0,1,'Enable Lighting Effects. Turn off to improve performance.');
Pref.create('enableWeather','Enable Weather',1,0,1,'Enable Weather like rain, sun and night. Turn off to improve performance.');
Pref.create('maxWidth','Max Screen Width',1280,900,1600,'The Max Screen Width in pixel. Setting a large width can create frame drops on slow computers.',undefined,function(){ Input.onResize(); });
Pref.create('inputAbilitySfx','Ability Miss Sound',1,0,1,'Play a sound when trying to use a not ready ability.');
Pref.create('cameraSpeedMod','Camera Speed',7,0,20,'Camera move speed when you move the mouse. 0=no movement');	//divide by 100
Pref.create('cameraOffsetMod','Camera Max Offset',30,0,50,'How far away the camera can move when you move the mouse.'); //divide by 100
Pref.create('displayStrike','Display AoE',0,0,1,'Display Damage Zone For Strikes.');
Pref.create('strikeTarget','Highlight Target',0,0,3,'Display Damage Zone For Strikes.',
	Pref.DisplayType('string',['Red Border','Red Rect','Red Skin','None']));
Pref.create('displayFPS','Display FPS',1,0,1,'Display FPS Performance.');
Pref.create('overheadHp','Overhead Hp',1,0,1,'Display HP Bar and Status Effect over player head.');
Pref.create('chatHeadTimer','Chat Head Timer',10,2,60,'How long chat messages are displayed above their heads (in seconds).');
Pref.create('signNotification','Notify Log In',1,0,2,'Notify you if someone logs in or out of the game.',
	Pref.DisplayType('string',['None','Text','Sound']));
Pref.create('puush','Allow Puush Link',2,0,2,'Allow Puush Link in chat.',
	Pref.DisplayType('string',['Never','Friends Only','Always']));
Pref.create('deleteChat','Auto Chat Delete ',1,0,1,'Delete chat messages automatically after 15 minutes.');
Pref.create('mapRatio','Map Ratio',7,6,7,'Minimap Size');
Pref.create('controller','Enable Controller',0,0,1,'Play the game with a Xbox 360 Controller.');
Pref.create('displayMiddleSprite','Display Center Sprite',0,0,1,'Display a dot in the middle of actor sprites.');
Pref.create('minimizeChat','Minimize Chat',1,0,1,'Minimize chat.');
Pref.create('capFPS','Cap to 30 FPS',1,0,1,'Cap to 30 FPS');

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
	if(isNaN(value)) 
		return false;
	
	return Math.min(Math.max(value,req.min),req.max);
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

Pref.set = function(name,rawValue){
	if(name === Pref.RESET){
		w.main.pref = Main.Pref();
		return Message.add(null,'Preferences reset to default.');
	}
	
	if(w.main.pref[name] === undefined) 
		return ERROR(3,'Invalid pref name.',name);
	var value = Pref.verify(name,rawValue);
	if(value === false) 
		return Message.add(null,'Invalid pref value.');
	
	w.main.pref[name] = value;
	if(DB[name].func) 
		DB[name].func(value);
	localStorage.setItem('pref',JSON.stringify(w.main.pref));
	
	Dialog.onPrefChange(name,value,rawValue);
}

})();