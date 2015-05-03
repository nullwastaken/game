//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Input = require4('Input'), Command = require4('Command'), Receive = require4('Receive'), Socket = require4('Socket'), Dialog = require4('Dialog'), Main = require4('Main');
var Performance = exports.Performance = {};

var FRAME_COUNT = 0;
var FREQUENCE = 3*25;

var OLD_TIME = Date.now();
var LATENCY = 0;
var CYCLE_TIME = 0;
var CLIENT_PERFORMANCE = '100%';

Performance.getLatency = function(){
	return LATENCY; 
}

Performance.loop = function(){
	if(FRAME_COUNT % 25*30 === 0){
		if(Input.isWindowActive())
			Command.execute('sendPing',[Performance.getLatency()]);
	}
	Performance.delay = Date.now() - Receive.getStartTime();
    if(FRAME_COUNT++ % FREQUENCE !== 0) return;
	
	var timeSupposedToTake = FREQUENCE*40;
	var timeTaken = Date.now() - OLD_TIME;
	
	CYCLE_TIME = timeTaken / FREQUENCE;
	CLIENT_PERFORMANCE = (timeSupposedToTake/timeTaken*100).r(0) + '%';
	
	OLD_TIME = Date.now();
	Performance.testLatency();
};
	

Performance.testLatency = function(){
	Socket.emit('ping', {'send':Date.now()});
}

Performance.init = function(){
	Socket.on('ping', function (d) {
		LATENCY = Date.now() - d.send; 
	});
	
	Dialog.UI('performance',{
		position:'absolute',
		left:'75%',
		top:5,
		width:'auto',
		height:'auto',
		color:'white',
		font:'1em Kelly Slab',
	},Dialog.Refresh(function(html){
		if(!Main.getPref(main,'displayFPS')) 
			return false;
		//if overwrite old one, double tooltip...
		
		html.addClass('shadow');
		return true;
	},function(){
		return '' + LATENCY + CLIENT_PERFORMANCE + Main.getPref(main,'displayFPS');
	},25,function(html,variable,param){
		var title = 'Latency: ' + LATENCY + ' ms. FPS: ' + (1000/CYCLE_TIME).r(0) + '/25.';
		var text = CLIENT_PERFORMANCE;
		
		if(variable.title !== title){
			variable.title = title;
			html.attr('title',title);
		}
		if(variable.text !== text){
			variable.text = text;
			html.html(text);
		}
	}));
	
	
}

})();