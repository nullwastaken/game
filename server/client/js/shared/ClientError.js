"use strict";
(function(){ //}
var Socket;
global.onReady(function(initPack){
	Socket = rootRequire('private','Socket');
	db = initPack.db;
	if(SERVER)
		Socket.on(CST.SOCKET.clientError,ClientError.receiveError,10,10,false);
},{db:['clientError']});

var ClientError = exports.ClientError = function(extra){
	this.timestamp = Date.now();
	this.file = '';
	this.line = 0;
	this.column = 0;
	this.message = '';
	this.username = '';
	Tk.fillExtra(this,extra);
};

var db;
var LAST_SEND = -1;
var SEND_COUNT_LAST_MIN = 0;
var LAST_RESET_COUNT_TIME = 0;
var ERROR_MSG_HISTORY = [];

if(!SERVER)
	window.onerror = function(msg,file,num,col,error){
		try {
			ClientError.onError(msg,file,num,col,error && error.stack);
		}catch(err){}
	}

ClientError.create = function(message,file,line,column){
	if(!file) 
		return null;
	file = file.replace('http://www.rainingchain.com/','');
	file = file.replace('http://rainingchain.com/','');
	return new ClientError({
		file:file,
		line:line,
		column:column,
		message:message,
		username:w.player.name,
	});
}

ClientError.onError = function(msg,file,line,col,stack){	//client
	if(ERROR_MSG_HISTORY.$contains(msg))
		return;
	if(w.player.name === 'rc')
		return;
	if(ERROR_MSG_HISTORY.length > CAP)
		return;
	
	if(Date.now() - LAST_SEND < (1000 + ERROR_MSG_HISTORY.length*500))
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
	
	if(stack)
		msg += stack;
	Socket.emit(CST.SOCKET.clientError,ClientError.create(msg,file,line));
}
var HARD_CAP = {};	//BAD memory leak
var CAP = 30;

ClientError.receiveError = function(socket,err){	//server
	HARD_CAP[socket.key] = HARD_CAP[socket.key] || 0;
	if(HARD_CAP[socket.key] >= CAP)
		return;
	HARD_CAP[socket.key]++;
	
	if(!err || typeof err !== 'object') 
		return;
	if(JSON.stringify(err).length >= 5000) 
		return;
	db.clientError.insert(err,db.err);
}
ClientError.deleteAll = function(){
	db.clientError.remove();
}

ClientError.getData = function(cb){
	db.clientError.find({},{timestamp:1,file:1,line:1,column:1,message:1},cb);
}


})(); //{