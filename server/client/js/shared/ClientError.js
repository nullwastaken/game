"use strict";
(function(){ //}
var Socket = require4('Socket');

var db;
var LAST_SEND = -1;
var SEND_COUNT_LAST_MIN = 0;
var LAST_RESET_COUNT_TIME = 0;
var ERROR_MSG_HISTORY = [];

var ClientError = exports.ClientError = {};

ClientError.create = function(message,file,line){
	return {
		timestamp:Date.now(),
		file:file,
		line:line,
		message:message,
		username:player.name,
		map:player.map,
	}
}

ClientError.init = function(dbLink){
	if(SERVER)
		db = dbLink;
	else
		window.onerror = function(msg,file,num){
			ClientError.onError(msg,file,num);
		}
}

ClientError.onError = function(msg,file,num){	//client
	if(ERROR_MSG_HISTORY.$contains(msg))
		return;
	if(player.username === CST.ADMIN)
		return;
	
	if(Date.now() - LAST_SEND < 1000)
		return;
		
	if(Date.now() - LAST_RESET_COUNT_TIME > CST.MIN){
		LAST_RESET_COUNT_TIME = Date.now();
		SEND_COUNT_LAST_MIN = 0;
	}
		
	if(SEND_COUNT_LAST_MIN >= 5)
		return;
		
	ERROR_MSG_HISTORY.push(msg);
	LAST_SEND = Date.now();
	SEND_COUNT_LAST_MIN++;
	
	Socket.emit('clientError',ClientError.create(msg,file,num));
}
var HARD_CAP = {};	//BAD memory leak

ClientError.receiveError = function(socket,err){	//server
	HARD_CAP[socket.key] = HARD_CAP[socket.key] || 0;
	if(HARD_CAP[socket.key] >= 30)
		return;
	HARD_CAP[socket.key]++;
	
	if(Object.keys(err).length !== 6) return;
	if(JSON.stringify(err).length >= 1000) return;
	
	db.clientError.insert(err,db.err);
}

})(); //{