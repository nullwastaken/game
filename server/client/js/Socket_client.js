//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Socket = require4('Socket'), Game = require4('Game');

var ALREADY_INIT = false;
var socket;

var FAKE_LATENCY_VALUE = 0;
var FAKE_LATENCY = false;

Socket = exports.Socket = {};
Socket.emit = function(what,data){
	if(!FAKE_LATENCY)
		socket.emit(what,data);
	else 
		setTimeout(function(){
			socket.emit(what,data);
		},FAKE_LATENCY);
}

Socket.on = function(what,func){
	if(FAKE_LATENCY === false){
		FAKE_LATENCY = Game.isOnRainingChainCom() ? 0 : FAKE_LATENCY_VALUE/2;
		if(FAKE_LATENCY) alert('FAKE LATENCY ACTIVATED ' + FAKE_LATENCY_VALUE + 'ms');
	}
		
	socket.on(what,function(data){
		if(!FAKE_LATENCY)
			try {	//otherwise impossible to know if error on load...
				func(data);
			} catch(err){ ERROR.err(2,err); }
		else 
			setTimeout(function(){
				func(data);
			},FAKE_LATENCY);
	});
}

Socket.init = function(){	//called on index when click Account. called onstart game
	if(ALREADY_INIT) return;
	ALREADY_INIT = true;
	socket = io();
}

})();

