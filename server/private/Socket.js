
(function(){ //}
var Server, Sign, Performance;
global.onReady(function(initPack){
	Server = rootRequire('private','Server'); Sign = rootRequire('private','Sign'); Performance = rootRequire('server','Performance');

	io = initPack.io;
	io.sockets.on('connection',Socket.onConnection);
	db = initPack.db;
	global.onLoop(Socket.loop);
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.sendPing,Command.SOCKET,[ //{
		Command.Param('number','Ping',false),
	],Socket.addPingData); //}
		
},{db:['pingData'],io:true});
var Socket = exports.Socket = {};

Socket.create = function(socket){
	Tk.fillExtra(socket,{
		emitCount:Tk.deepClone(EMITCOUNT_TEMPLATE),
		emitLast:Tk.deepClone(EMITCOUNT_TEMPLATE),
		toRemove:false,
		connectionStartTime:Date.now(),
		timeOfLastEmit:Date.now(),	//refresh only by input and click
		lastCallForTimePlayed:Date.now(),
		online:false,
		passwordAcceptedSigninIn:false,
		corruptedDb:false,
		beingRemoved:false,
		removed:false,
		pingSum:0,
		pingDataCount:0,
		geoLocation:'',
		bandwidth:Socket.Bandwidth(),	//BAD
		key:null,	//set when sign in
		username:null, //set when sign in
	},true);
	
	var helper = function(name){
		return function(data){ 
			try {
				handleSocketEvent(name,socket,data);
			} catch (err){
				ERROR.err(3,err);
				if(socket.key) 
					Sign.off(socket.key,'Error with request "' + name + '". Reload the page.'); 
				else 
					socket.disconnect();
			}
		}
	}
	
	for(var i in Socket.DB)
		socket.on(i,helper(i));
	return socket;
}

Socket.Bandwidth = function(){
	return {
		upload:0,
		download:0
	};	
}	

var DB = Socket.DB = {};
var LIST = Socket.LIST = {};
var EMITCOUNT_TEMPLATE = {};
var db;

var FRAME_COUNT = 0;
var LOOP_INTERVAL = 10;
var MAX_TIME_BETWEEN_EMIT = 10*CST.MIN;
var MAX_TIME_BETWEEN_EMIT_MOD = 60*CST.MIN;
var MAX_TIME_SESSION = 6*CST.HOUR;

var io;

var handleSocketEvent = function(name,socket,d){
	var event = DB[name];
	if(!event) 
		return;
	
	if(event.online && !socket.online)
		return socket.disconnect();
	
	var now = Date.now();
	if(socket.emitCount[name] /Math.max(socket.globalTimer/CST.MIN,5) > event.limitPerMin) 
		return;
	if(now-socket.emitLast[name] < event.minInterval) 
		return;
	
	if(event.resetTimeOfLastEmit){
		socket.timeOfLastEmit = now;
	}
	socket.emitLast[name] = now;
	socket.emitCount[name]++;
	
	if(Server.isReady()) 
		Performance.bandwidth(Performance.DOWNLOAD,d,socket);	//before func
	
	event.func(socket,d); 
}

Socket.onConnection = function (socket){
	if(Server.getAttr('shutdown')){
		Sign.respond(socket,CST.SOCKET.signInAnswer,CST.SERVER_DOWN,null);
		setTimeout(function(){
			socket.disconnect();
		},10000);
		return 
	}
	Socket.create(socket); 
}

Socket.get = function(id){
	return LIST[id] || null;
}

Socket.addToList = function(bullet){
	LIST[bullet.key] = bullet;
}

Socket.removeFromList = function(id){
	delete LIST[id]; 
}

Socket.forEach = function(func){
	for(var i in LIST)
		func(Socket.get(i));
}

Socket.getConnectionType = function(key){
	var s = Socket.get(key);
	if(!s)
		return null;
	return io.engine.clients[s.id].transport.name;
}	

Socket.loop = function(){
	FRAME_COUNT++;
	if(FRAME_COUNT % LOOP_INTERVAL !== 0) 
		return;
	var now = Date.now();
	for(var i in LIST){
		Socket.loop.forEach(LIST[i],now);
	}
}

Socket.loop.forEach = function(socket,now){
	var isAdmin = Server.isAdmin(socket.key);
	var isMod = Server.isModerator(socket.key);
	if(socket.beingRemoved) 
		return;
		
	var maxTime = MAX_TIME_BETWEEN_EMIT;
	if(isMod)
		maxTime = MAX_TIME_BETWEEN_EMIT_MOD;
	if(isAdmin)
		maxTime = CST.BIG_INT;
	
	if(now - socket.timeOfLastEmit >= maxTime)
		return Sign.off(socket.key,'Disconnected due to inactivity.');
	
	if(!isAdmin && now - socket.connectionStartTime >= MAX_TIME_SESSION)
		return Sign.off(socket.key,'Disconnected due because max session time reached.');
		
	if(socket.toRemove)
		return Sign.off(socket.key,'');
}

Socket.getTimePlayedSinceLastCall = function(socket){
	var ret = Date.now() - socket.lastCallForTimePlayed;	
	socket.lastCallForTimePlayed = Date.now();
	return ret;
}

Socket.emit = function(socket,what,data){
	socket.emit(what,data);
}

//###########################

Socket.on = function(id,func,limitPerMin,minInterval,online,resetTimeOfLastEmit){
	if(!id)
		ERROR(3,'no what');
	var tmp = {
		id:id,
		func:func,
		limitPerMin:limitPerMin || 60,
		minInterval:minInterval !== undefined ? minInterval : 100,
		online:!!online,
		resetTimeOfLastEmit:!!resetTimeOfLastEmit,
	}
	DB[id] = tmp;
	EMITCOUNT_TEMPLATE[id] = 0;
}

Socket.on(CST.SOCKET.ping,function(socket,d){
	Socket.emit(socket,CST.SOCKET.pingAnswer,{send:d.send,receive:Date.now()});
},100,10,false);

Socket.addPingData = function(socket,ping){
	if(socket.pingDataCount > 5){	//prevent extreme value
		var avg = socket.pingSum/socket.pingDataCount;
		if(ping > avg*2)
			ping = avg*2;
	}
	socket.pingDataCount++;
	socket.pingSum += ping;
}

Socket.addPingDataToDb = function(socket){
	if(socket.pingDataCount < 10)
		return;
	db.pingData.insert({
		timestamp:Date.now(),
		username:socket.username,
		pingDataCount:socket.pingDataCount,
		pingAverage:Math.round(socket.pingSum/socket.pingDataCount),
		geoLocation:socket.geoLocation,
	});
}

Socket.getPingData = function(cb){
	db.pingData.find({timestamp:{$gte:Date.now()-CST.WEEK}},{geoLocation:1,pingAverage:1},cb);
}





return Socket;

})(); //{





