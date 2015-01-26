(function(){ //}
//latency
var socket = io();

var FAKE_LATENCY_VALUE = 0;
var FAKE_LATENCY = false;

Socket = {};
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
			func(data);
		else 
			setTimeout(function(){
				func(data);
			},FAKE_LATENCY);
	});
}

Socket.init = function(){
	

}

})();

