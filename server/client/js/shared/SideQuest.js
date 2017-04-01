
"use strict";
;(function(){ //}
var Maps, ItemList, MapModel, Material, Main, Actor;
global.onReady(function(){
	Maps = rootRequire('server','Maps'); ItemList = rootRequire('shared','ItemList'); MapModel = rootRequire('server','MapModel'); Material = rootRequire('server','Material'); Main = rootRequire('shared','Main'); Actor = rootRequire('shared','Actor');
},null,'SideQuest',SERVER ? ['MapModel'] : [],function(pack){
	SideQuest.init(pack);	//needed for signInPack will have zone (MapModel.init set questMarker)
});
var SideQuest = exports.SideQuest = function(extra){
	this.quest = '';
	this.id = '';
	this.name = '';
	this.zone = null; //set in init, for killCount and window
	this.rewardMod = 1;
	this.questMarker = null; //client, set in init
	this.randomNumber = Math.floor(Math.random()*RANDOM_NUM_MAX);
	Tk.fillExtra(this,extra);
};

var DB = SideQuest.DB = {};	//model
var LIST = SideQuest.LIST = {};	//instance

var BASE_EXP = 150;
var BASE_MAT = 5;
var SIGN_IN_PACK = {};
var FIRST_TIME_EXP = 250;

var BASE_DISPLAY_CHANCE = 1/3;
var RANDOM_NUM_MAX = 1;
var TIME_CHANGE_NUM = 5*CST.MIN;

var ALWAYS_DISPLAY = true; //SERVER && NODEJITSU ? false : true;
var TIME_PREVENT_IN_OUT = 30*1000;	//if fail, time before try again

var LATEST_COMPLETION = {};
var LAST_TRY_DISPLAY = {};

SideQuest.create = function(quest,id,name,rewardMod){
	if(!id.$contains(quest,true))
		return ERROR(3,'id must start with quest id',id);
	if(DB[id])
		return ERROR(3,'sidequest id already taken',id);
		
	var a = new SideQuest({
		quest:quest,
		id:id,
		name:name,
		rewardMod:rewardMod,
	});
	
	DB[id] = a;
	return a;
}

SideQuest.get = function(id,noError){
	if(DB[id])
		return DB[id];
	if(!noError)
		ERROR(3,'invalid sid',id)
	return null;
}

SideQuest.giveReward = function(sq,main){	//from chest
	LATEST_COMPLETION[sq.model] = Date.now();
	
	var rew = SideQuest.getReward(sq,main);
	Actor.addExp(Main.getAct(main),rew.exp);
	Main.addItem(main,rew.item);
	
	var it = ItemList.stringify(rew.item);
	if(it)
		Main.addMessage(main,'You got ' + rew.exp.r(0) + ' exp and ' + it + '.');
	else if(rew.exp)
		Main.addMessage(main,'You got ' + rew.exp.r(0) + ' exp.');
	else
		Main.addMessage(main,'You got no reward because you complete that side quest too many times today.');
}

SideQuest.getReward = function(sq,main){
	var firstTime = Main.SideQuest.getComplete(main,sq.id) <= 1;	//cuz called after completed, when looting chest
	var completeToday = Main.SideQuest.getCompleteToday(main,sq.id);
	var mod = sq.rewardMod * getRewardMod(completeToday);
	
	var ret = {
		exp:BASE_EXP * mod,
		item:{}	
	};
	if(firstTime)
		ret.exp += FIRST_TIME_EXP;
		
	ret.item[Material.getRandom()] = Math.roundRandom(BASE_MAT * mod);
	
	return ret;
}

var getRewardMod = function(completeToday){	//called after complete so -1
	return Math.pow(0.5,completeToday-1);
}

SideQuest.getCompleteBoostNerf = function(sid,main){
	var count = Main.SideQuest.getComplete(main,sid);
	if(!count)
		return null;
	count = Math.min(count,10);
	var dmg = 1/Math.pow(1.15,count);	//aka more enemy def, 10 => 0.247
	var def = 1/Math.pow(1.05,count);	//more enemy dmg, 10 => 0.61
	return {
		globalDmg:dmg,
		globalDef:def,
	}
}

SideQuest.setQuestMarker = function(sq,spot){
	if(sq.questMarker)
		return;
	sq.questMarker = Maps.Spot(spot.x,spot.y,spot.mapModel);
	sq.zone = MapModel.get(sq.questMarker.map).zone;
}

SideQuest.init = function(pack){ //server and client different
	if(SERVER){
		for(var i in DB)
			SIGN_IN_PACK[i] = SideQuest.compressClient(DB[i]);
		
		setInterval(SideQuest.loop,1000*10);
		return;
	}
	for(var i in pack.sideQuest)
		DB[i] = SideQuest.uncompressClient(pack.sideQuest[i]);
}

SideQuest.getSignInPack = function(){
	return SIGN_IN_PACK;
}

var DISPLAY_REASON = false;
SideQuest.setDisplayReason = function(bool){
	DISPLAY_REASON = bool;
}

SideQuest.testIfDisplay = function(model){
	if(ALWAYS_DISPLAY)
		return true;
	var now = Date.now();
	if(LAST_TRY_DISPLAY[model] !== undefined && now - LAST_TRY_DISPLAY[model] < TIME_PREVENT_IN_OUT){	//prevent in/out/in/out
		if(DISPLAY_REASON)
			INFO('testIfDisplay LAST_TRY_DISPLAY',now,LAST_TRY_DISPLAY[model]);
		return false;
	}
	
	LAST_TRY_DISPLAY[model] = now;
			
	if(LATEST_COMPLETION[model] !== undefined && now - LATEST_COMPLETION[model] < TIME_CHANGE_NUM){	//prevent doing it x2 times in a row
		if(DISPLAY_REASON)
			INFO('testIfDisplay LATEST_COMPLETION',now,LATEST_COMPLETION[model]);
		return false;
	}
	
	if(Math.random() > BASE_DISPLAY_CHANCE){
		if(DISPLAY_REASON)
			INFO('testIfDisplay BASE_DISPLAY_CHANCE');
		return false;
	}
	
	var now = Math.floor(Date.now() / TIME_CHANGE_NUM); //+1 every TIME_CHANGE_NUM
	var res = now % RANDOM_NUM_MAX === SideQuest.get(model).randomNumber;	//every RANDOM_NUM_MAX min
	if(!res && DISPLAY_REASON)
		INFO('testIfDisplay RANDOM_NUM_MAX');
	return res;
}

SideQuest.compressClient = function(sq){
	return [
		sq.id,	//0
		sq.name,
		sq.zone,	//2
	];	
}

SideQuest.uncompressClient = function(sq){
	return {
		id:sq[0],
		name:sq[1],
		zone:sq[2],
	}
}

SideQuest.addToList = function(id,sq){
	LIST[id] = sq;
}	

SideQuest.remove = function(id){
	delete LIST[id];
}	

SideQuest.getInstance = function(id){
	return LIST[id] || ERROR(3,'sidequest doesnt exist',id,LIST.$keys());
}
 
SideQuest.loop = function(){	//setInterval
	for(var i in LIST)
		if(!Maps.get(LIST[i].map))
			SideQuest.remove(i);
}

SideQuest.getListActive = function(){
	return LIST.$keys();
}





})(); //{











