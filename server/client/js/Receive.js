
"use strict";
(function(){ //}
var Actor, Anim, Entity, Main, Game, Socket, MapModel, BISON;
global.onReady(function(){
	BISON = rootRequire('shared','BISON',true); MapModel = rootRequire('shared','MapModel',true); Actor = rootRequire('shared','Actor',true); Anim = rootRequire('server','Anim',true); Entity = rootRequire('shared','Entity',true); Main = rootRequire('shared','Main',true); Game = rootRequire('client','Game',true); Socket = rootRequire('private','Socket',true);
	global.onLoop(Receive.loop,-10);
	
	Actor.onChange('transitionMap',Receive.onTransitionMap,100);
	
	Socket.on(CST.SOCKET.change, function(data){
		try { 
			if(CST.BISON) 
				data = BISON.decode(data);
			Receive.onPackReceived(data);	
		} catch (err){ ERROR.err(3,err,data); }
	});
});
var Receive = exports.Receive = {};

var SHOWDATA_ACTIVE = false;
var START_TIME = 0;

var NOT_READY_BUFFER = [];
var DEFAULT_CHRONO_C = 2;
var FRAME_TIL_LAST_SERVER_UPDATE = 0;

var C = CST.SEND;

Receive.onPackReceived = function(data){
	//BISON in onReady
	if(!Game.getReady()){
		if(NOT_READY_BUFFER.length < 1000)
			NOT_READY_BUFFER.push(data);
		else
			ERROR(3,'NOT_READY_BUFFER too small',NOT_READY_BUFFER.length);
		return;
	}
	FRAME_TIL_LAST_SERVER_UPDATE = 0;
	START_TIME = Date.now();
	
	Main.chrono.onPackageReceived(data[C.chrono] || DEFAULT_CHRONO_C);	//#frame since last update
	
	var timeDiff = Date.now() - CST.decodeTime(data[C.timestamp]);	//timestamp, data.t is only sent if bulletCreated
	if(timeDiff < 0 || timeDiff > CST.MIN) 	//> min means bug...
		timeDiff = 0;	//weird... but happens
	timeDiff = timeDiff || 0;
	
	Receive.showData(data);
	
	if(!Receive.freeze.onReceive(data)) 	//if map changes
		return;	//cuz still need to run game
	
	Receive.uncompressQU(data);	//quick update
	
	Actor.applyChange(w.player,data[C.player]);
	
	
	
	//Init Full List aka never seen before
	for(var i in data[C.init]) 
		Entity.create(data[C.init][i],i,timeDiff);
	
	
	//Update Full List
	for(var i in data[C.update]){	
		var act = Entity.get(i);
		var d = data[C.update][i];
		if(!act){
			ERROR(2,'no act',d,i);
			continue;
		}
		act.toRemoveTimer = 0;
		Actor.applyChange(act,d);
	}
	
	if(data[C.remove]){
		for(var i = 0; i < data[C.remove].length; i++){	//remove
			var eid = data[C.remove][i];
			if(data[C.init] && data[C.init][eid])		//fix bug if in both list
				continue;
			var e = Entity.get(eid);
			if(e)
				Entity.initRemove(e);
		}
    }
	
	Main.applyChange(w.main,data[C.main]);
	
	
    //Init Anim, after entity.create
	for(var i in data[C.anim]) 
		Anim.create(data[C.anim][i]);	
	
	
	Entity.removeInactive();	
}

Receive.useNonReadyBuffer = function(){
	for(var i = 0 ; i < NOT_READY_BUFFER.length; i++){
		Receive.onPackReceived(NOT_READY_BUFFER[i]);
	}
	NOT_READY_BUFFER = [];
}

Receive.getStartTime = function(){
	return START_TIME;
}

Receive.uncompressQU = function(data){
	if(!data[C.quickUpdate]) return;
	data[C.quickUpdate] = data[C.quickUpdate].split(',');
	data[C.update] = data[C.update] || {};
	for(var i = 0 ; i < data[C.quickUpdate].length; i++){
		var eid = data[C.quickUpdate][i];
		data[C.update][eid] = {};
	}
	delete data[C.quickUpdate];
}

Receive.showData = function(data){
	if(!SHOWDATA_ACTIVE) 
		return;
	var txt = JSON.stringify(data); 
	INFO(txt);
}

Receive.freeze = function(){
	Receive.freeze.ACTIVE = true;
}
Receive.freeze.LIST = [];

Receive.unfreeze = function(){
	Receive.freeze.ACTIVE = false;
	for(var i = 0 ; i < Receive.freeze.LIST.length; i++)
		Receive.onPackReceived(Receive.freeze.LIST[i]);
	Receive.freeze.LIST = [];	
}

Receive.freeze.onReceive = function(data){
	if(Receive.freeze.ACTIVE){
		Receive.freeze.LIST.push(data);
		return false;
	}
	return true;
}

Receive.onTransitionMap = function(act,data,all){
	delete all.x;
	delete all.y;
	delete all.transitionMap;
	
	if(w.player.map === data.map){
		w.player.x = data.x;
		w.player.y = data.y;
		return;
	}
	
	if(data.type === CST.TRANSITION_MAP.none){
		w.player.map = w.player.map;
		return;
	}
	
	if(data.type !== CST.TRANSITION_MAP.slide){
		Receive.freeze();
		Main.addScreenEffect(w.main,x.Main.ScreenEffect.fadeout('mapTransition',16));
		setTimeout(function(){
			act.map = data.map;
			act.x = data.x;
			act.y = data.y;
		},40*16/2);
		setTimeout(function(){
			Receive.unfreeze();
		},40*16/2 + 10);
	} 
	
	if(data.type === CST.TRANSITION_MAP.slide){
		MapModel.startTransition(data);
	}
}

Receive.loop = function(){
	FRAME_TIL_LAST_SERVER_UPDATE++;
}

Receive.getFrameTilLastUpdate = function(){
	return FRAME_TIL_LAST_SERVER_UPDATE;
}

Receive.setShowData = function(bool){
	SHOWDATA_ACTIVE = bool;
}

})(); //{




