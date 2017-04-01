
/*jshint -W018*/
"use strict";
var Actor, Message, Socket, BISON;
global.onReady(function(){
	BISON = rootRequire('shared','BISON'); Socket = rootRequire('private','Socket'); Actor = rootRequire('shared','Actor'); Message = rootRequire('shared','Message');
	Socket.on(CST.SOCKET.input,Input.key,60*40,0,true,true);
});
var Input = exports.Input = {};

var POSITION_INPUT = {};
var MAX_INPUT_PER_SEC = 30;

var DISPLAY_INPUT_TO = null;
var DISPLAY_INPUT_FROM = null;
var DISPLAY_LAST_TIME = 0;

var INP = CST.INPUT;

//mouse in Button.handleClickServerSide
Input.key = function(socket,d){
	if(CST.BISON)
		d = BISON.decode(d);
	
	socket.timer = 0;
	var act = Actor.get(socket.key);
		
	if(act.useUpdateInput) 
		return;
	
	if(d[INP.key]) //d.i format: ability0,ability1...
		Actor.onAbilityInput(act,d[INP.key]);
	
	if(d[INP.position]){
		var p = d[INP.position];
		//important		
		POSITION_INPUT[socket.key] = POSITION_INPUT[socket.key] || 0;
		POSITION_INPUT[socket.key]++;
		
		var timestamp = CST.decodeTime(d[INP.timestamp]);
		
		if(POSITION_INPUT[socket.key] < MAX_INPUT_PER_SEC*5)	//cuz setInterval 5000
			Actor.onPositionInput(act,p[0],p[1],p[2],timestamp);	//p[2] for admin
		
		//extra
		if(DISPLAY_INPUT_TO && DISPLAY_INPUT_FROM === act.name){
			var diff = Date.now() - DISPLAY_LAST_TIME;
			DISPLAY_LAST_TIME = Date.now();
			Message.add(DISPLAY_INPUT_TO,'time=' + diff 
				+ ', x=' + Math.floor(p[0]) 
				+ ', y=' + Math.floor(p[1]) 
				+ ', vx=' + (act.x-Math.floor(p[0])) 
				+ ', vy=' + (act.y-Math.floor(p[1])));
		}
		
	}
	
	if(d[INP.mouse]){
		var m = d[INP.mouse];
		act.mouseX = Math.min(Math.max(m[0],-CST.WIDTH*1.5),CST.WIDTH*1.5);
		act.mouseY = Math.min(Math.max(m[1],-CST.HEIGHT*1.5),CST.HEIGHT*1.5);
		act.angle = Tk.atan2.precise(act.mouseY,act.mouseX);
	}
}

Input.listenTo = function(admin,lagger){	//admin:key, lagger:name
	if(!admin || !lagger){
		DISPLAY_INPUT_TO = null;
		DISPLAY_INPUT_FROM = null;
		return;
	}
	DISPLAY_INPUT_TO = admin;
	DISPLAY_INPUT_FROM = lagger;
}


setInterval(function(){	//because server can run slower than client
	POSITION_INPUT = {};
},5000);


