
"use strict";
(function(){ //}
var Socket, Sign, Game;
global.onReady(function(){
	Game = rootRequire('client','Game',true); Socket = rootRequire('client','Socket',true); Sign = rootRequire('client','Sign',true);
});
var Socket = exports.Socket = {};

var socket;

//fake latency
var FAKE_LATENCY_VALUE = 0;
var SIM_PACKET_LOSS = false;
var PACK_EMIT = [];
var PACK_ON = [];
var FREEZE = 0;
var LAST_FREEZE = 0;

Socket.socket = null;

Socket.emit = function(what,data){
	//Tk.getCallPerSec('Socket.emit',true);
	
	if(!FAKE_LATENCY_VALUE && !SIM_PACKET_LOSS)
		return socket.emit(what,data);
	
	//debug
	setTimeout(function(){
		if(!FREEZE){
			socket.emit(what,data);
			if(Date.now() - LAST_FREEZE > 10000){
				INFO('PACKET FREEZE');
				LAST_FREEZE = Date.now();
				FREEZE = Date.now();
			}
		} else {
			if(Date.now() - FREEZE > 1000){
				for(var i = 0 ; i < PACK_EMIT.length; i++)
					socket.emit(PACK_EMIT[i].what,PACK_EMIT[i].data);
				for(var i = 0 ; i < PACK_ON.length; i++)
					socket._callbacks[PACK_ON[i].what][0](PACK_ON[i].data);	//BAD
				PACK_EMIT = [];
				PACK_ON = [];
				FREEZE = 0;
				INFO('PACKET UNFREEZE');
			} else 
				PACK_EMIT.push({what:what,data:data});
		}
	},FAKE_LATENCY_VALUE);
}




Socket.on = function(what,func){
	if(!what)
		return ERROR(3,'no what');
	
	if(!FAKE_LATENCY_VALUE && !SIM_PACKET_LOSS)
		socket.on(what,function(data){
			try {	//otherwise impossible to know if error on load...
				//Tk.getCallPerSec('Socket.on',true);
				func(data);
			} catch(err){ 
				ERROR.err(2,err,'Socket.on',what); 
				if(what === CST.SOCKET.signInAnswer){	//BAD
					Sign.log('<span style="color:red">A browser error prevents the game from starting.<br><br>Error: ' + err.stack);
				}
			}
		});
	else  //debug
		socket.on(what,function(data){
			setTimeout(function(){
				if(FREEZE)
					PACK_ON.push({what:what,data:data});
				else
					func(data);
			},FAKE_LATENCY_VALUE);
		});
}

;(function(){
	socket = Socket.socket = io(SOCKET_URL);	//SOCKET_URL set at beginning of game.html
	
	setTimeout(function(){
		if(!socket.io.engine.transport.ws)
			INFO('You are not using Websockets.');
	},10000);
	socket.on('connect_error',function(err){
		$('#serverIsDown').show();
		ERROR.err(1,err);
		Game.stop(true);
	});
	socket.on('error',function(err){
		$('#serverIsDown').show();
		ERROR.err(1,err);
		Game.stop(true);
	});
	
	
	FAKE_LATENCY_VALUE /= 2;	//cuz back and forth
	if(FAKE_LATENCY_VALUE) 
		alert('FAKE LATENCY ACTIVATED ' + FAKE_LATENCY_VALUE*2 + 'ms');
	if(SIM_PACKET_LOSS) 
		alert('SIM_PACKET_LOSS ACTIVATED');
	
})();

})();

