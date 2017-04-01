
"use strict";
var Sign, Main, Entity, Socket, Maps, Actor, Performance, Anim, Strike, Drop, Bullet, BISON;
global.onReady(function(){
	BISON = rootRequire('shared','BISON'); Sign = rootRequire('private','Sign'); Main = rootRequire('shared','Main'); Entity = rootRequire('shared','Entity'); Socket = rootRequire('private','Socket'); Maps = rootRequire('server','Maps'); Actor = rootRequire('shared','Actor'); Performance = rootRequire('server','Performance'); Anim = rootRequire('server','Anim'); Strike = rootRequire('shared','Strike'); Drop = rootRequire('shared','Drop'); Bullet = rootRequire('shared','Bullet');
	global.onLoop(Send.loop,-10);
});
var Send = exports.Send = {};


var VERIFY_BISON = NODEJITSU ? false : true;
Send.STORE_PACK = NODEJITSU ? false : false;

if(Send.STORE_PACK)
	INFO('STORE_PACK is on. This is a huge memory leak.');

Send.PACK_LIST = [];

var LOOP100 = true;

var BOT_WATCHER = null;
var BOT_WATCHED = null;
var FRAME_COUNT = 0;
var DEFAULT_CHRONO_C = 2;

var JSON_STRINGIFY_SIZE = 0;
var BISON_SIZE = 0;

var TRACK_BISON_RATIO = NODEJITSU ? false : false;
if(TRACK_BISON_RATIO)
	INFO('TRACK_BISON_RATIO is on.');

Send.getBISONCompressRatio = function(){
	return BISON_SIZE + '/' + JSON_STRINGIFY_SIZE + '=' + BISON_SIZE/JSON_STRINGIFY_SIZE;
}

var LAST_FRAME_SENT_CHRONO = {};	//key:frame, small memory leak
var C = CST.SEND;

Send.loop = function(){		// 1/2 times
	FRAME_COUNT++;
	
	if(FRAME_COUNT % 2 !== 0)	
		return;
	
	LOOP100 = FRAME_COUNT % 100 === 0;
		
	Actor.setChangeAll(FRAME_COUNT);
	Main.setChangeAll(FRAME_COUNT);
	
	Socket.forEach(function(socket){
		if(socket.key === BOT_WATCHER) 
			return;
		var info = Send.sendUpdate(socket.key,socket);	//important line
		
		botWatch(socket,info);
		
		if(FRAME_COUNT % 10 === 0) 
			Performance.bandwidth(Performance.UPLOAD,info,socket,10);
	});
	Send.reset();
}

var botWatch = function(socket,info){
	if(!BOT_WATCHER)
		return;
	
	if(!Socket.get(BOT_WATCHED) || !Socket.get(BOT_WATCHER))
		Send.desactivateBotwatch();
	
	if(info && socket.key === BOT_WATCHED){
		var watcherSocket = Socket.get(BOT_WATCHER);
		if(watcherSocket)
			watcherSocket.emit(CST.SOCKET.change, info);
		else {
			BOT_WATCHER = null;	//logout
			BOT_WATCHED = null;
		}
	} 
}

//send 31k string = 2 ms, send small = 0.02 ms
Send.sendUpdate = function(key,socket){	//must not call setChange
	var player = Actor.get(key);
	var main = Main.get(key);
	if(!player || !main)
		return Sign.off.onError(key,socket);
	
	var sa = {};
	var bulletCreated = false;
	
	//Update Private Player
	if(!player.privateChange.$isEmpty())
		sa[C.player] = player.privateChange;

	
	//Remove List
	if(player.removeList.length) 
		sa[C.remove] = player.removeList;
	//Main
	if(!main.change.$isEmpty()) 
		sa[C.main] = main.change;
		
	//Update Entity
	for(var i in player.activeList){
		var obj = Entity.get(i);
		if(!obj){ 
			delete player.activeList[i]; 
			ERROR(2,'no act'); 
			continue; 
		}
		
		if(player.activeList[i] !== Entity.SEEN){		//Need to Init
			sa[C.init] = sa[C.init] || {};
			sa[C.init][obj.id] = Send.init(obj,player);
			player.activeList[i] = Entity.SEEN;
			if(obj.type === CST.ENTITY.bullet)
				bulletCreated = true;
		} else {
			if(obj.type !== CST.ENTITY.bullet){
				var empty = Array.isArray(obj.change) ? !obj.change.length : obj.change.$isEmpty();
				if(!empty){
					sa[C.update] = sa[C.update] || {};
					sa[C.update][obj.id] = obj.change;	//Only Update
				} else if(LOOP100){
					sa[C.quickUpdate] = sa[C.quickUpdate] || [];
					sa[C.quickUpdate].push(obj.id);
				}
			}
		}
	}
	if(sa[C.quickUpdate])
		sa[C.quickUpdate] = sa[C.quickUpdate].toString();
	
	
	//Anim
	var map = Maps.get(player.map);
	for(var i in map.list.anim){
		var anim = Anim.get(i);
		if(!Send.testIncludeAnim(player,anim)) 
			continue;
		sa[C.anim] = sa[C.anim] || [];
		sa[C.anim].push(Send.init(anim));		
	}
	
	//Send
	if(!sa.$isEmpty()){
		Send.setChronoData(key,sa);	
		if(bulletCreated)
			sa[C.timestamp] = CST.encodeTime(Date.now());	//timestamp, only used when creating new bullets
		
		var oldSa = sa;
		if(CST.BISON)
			sa = BISON.encode(sa);
		Socket.emit(socket,CST.SOCKET.change, sa);
		
		
		extraBISONAndStore(oldSa,sa);
		return sa;
	}
	
	return null;
}

var extraBISONAndStore = function(oldSa,sa){
	if(NODEJITSU)
		return;
	if(CST.BISON){
		if(!sa)
			ERROR(3,'sa is empty',oldSa,sa);
		if(VERIFY_BISON && !BISON.isValid(oldSa)){
			BISON.findError(oldSa);
			ERROR(3,'invalid BISON',oldSa);
		}
		if(TRACK_BISON_RATIO)
			JSON_STRINGIFY_SIZE += JSON.stringify(oldSa).length;
		
		if(TRACK_BISON_RATIO)
			BISON_SIZE += sa.length;
	}
	if(Send.STORE_PACK)
		Send.PACK_LIST.push(sa);
}


Send.setChronoData = function(key,sa){
	var main = Main.get(key);
	if(main.chrono.$isEmpty()){
		LAST_FRAME_SENT_CHRONO[key] = 0;	//for when i do || FRAME_COUNT, it works
		return;
	}
	LAST_FRAME_SENT_CHRONO[key] = LAST_FRAME_SENT_CHRONO[key] || FRAME_COUNT;
	var variation = FRAME_COUNT - LAST_FRAME_SENT_CHRONO[key];
	LAST_FRAME_SENT_CHRONO[key] = FRAME_COUNT;
	if(variation === DEFAULT_CHRONO_C)	//aka default
		return;
	sa[C.chrono] = variation;
}

Send.testIncludeAnim = function(player,anim){
	if(anim.target.type === CST.ANIM_TYPE.id){	//aka target is an obj
		var targ = Actor.get(anim.target.id);
		if(!targ) return;	//possible if died
		if(player.id === anim.target.id || Entity.testViewed(player,targ)){
			return true;
		}
	}
	else if(anim.target.type === CST.ANIM_TYPE.position){	//aka target is already in form {x:1,y:1,map:1}
		if(Entity.testViewed(player,anim.target)){
			return true;
		}
	}
	return;
}

Send.reset = function(){
	Anim.removeAll();
	Actor.resetChangeForAll();
	Main.resetChangeForAll();
}

//####################################
Send.init = function(obj,player){ //create object that has all info for the client to init the object
	if(obj.type === CST.ENTITY.bullet) 
		return Bullet.doInitPack(obj,player);
	else if(obj.type === CST.ENTITY.anim) 
		return Anim.doInitPack(obj);
	else if(obj.type === CST.ENTITY.npc || obj.type === CST.ENTITY.player)	
		return Actor.doInitPack(obj);
	else if(obj.type === CST.ENTITY.strike) 
		return Strike.doInitPack(obj);
	else if(obj.type === CST.ENTITY.drop) 
		return Drop.doInitPack(obj);
	
}

//########################################

Send.activateBotwatch = function(key,towatch){
	if(!Main.get(key) || !Main.get(towatch))
		return ERROR(3,'BOT_WATCHER or BOT_WATCHED not online');
	
	BOT_WATCHER = key;
	BOT_WATCHED = towatch;
	
	Main.get(BOT_WATCHER).changeOld = {};
	Actor.get(BOT_WATCHER).changeOld = {};
	Actor.get(BOT_WATCHER).privateOld = {};
	
	Main.get(BOT_WATCHED).changeOld = {};
	Actor.get(BOT_WATCHED).changeOld = {};
	Actor.get(BOT_WATCHED).privateOld = {};
}

Send.desactivateBotwatch = function(){
	var main = Main.get(BOT_WATCHER);
	if(main){
		main.changeOld = {};
		var act = Actor.get(BOT_WATCHER);
		act.changeOld = {};
		act.privateOld = {};
		Actor.setChange(act,'transitionMap',{
			x:act.x,y:act.y,map:act.mapModel,mapModel:act.mapModel,type:CST.TRANSITION_MAP.fadeout
		});
		Main.addItem(main,{});	//cheap way trigger flag
		Main.setChange(main,'hudState',main.hudState);
		Main.setChange(main,'dialogue',main.dialogue);
	}
	if(Main.get(BOT_WATCHED)){
		Main.get(BOT_WATCHED).changeOld = {};
		Actor.get(BOT_WATCHED).changeOld = {};
		Actor.get(BOT_WATCHED).privateOld = {};
	}
	BOT_WATCHER = null;
	BOT_WATCHED = null;
}























