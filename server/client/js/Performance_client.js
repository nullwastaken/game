
"use strict";
(function(){ //}
var Input, Sfx, Command, Receive, Socket, Dialog, Main;
global.onReady(function(){
	Input = rootRequire('server','Input',true); Sfx = rootRequire('client','Sfx',true); Command = rootRequire('shared','Command',true); Receive = rootRequire('client','Receive',true); Socket = rootRequire('private','Socket',true); Dialog = rootRequire('client','Dialog',true); Main = rootRequire('shared','Main',true);
	Performance.init();
	global.onLoopDraw(Performance.loop,-100);
});
var Performance = exports.Performance = {};

var FRAME_COUNT = 0;
var FREQUENCE = 10*25;

var OLD_TIME = Date.now();
var LATENCY = 0;	//include going and returning (round trip) 
var CYCLE_TIME = 0;
var CLIENT_PERFORMANCE = '';
var FPS = 30;
var FPS_CAP = 30;
var FULL_FOCUS_FOR_LOOP = false;
var DELAY = 0;	//unused

Performance.getLatency = function(){
	return LATENCY; 
}

Performance.loop = function(){
	if(FRAME_COUNT % 25*60 === 0){
		if(Input.isWindowActive())
			Command.execute(CST.COMMAND.sendPing,[Performance.getLatency()]);
	}
	DELAY = Date.now() - Receive.getStartTime();
    if(FRAME_COUNT++ % FREQUENCE !== 0) 
		return;
	
	var timeTaken = Date.now() - OLD_TIME;
	
	CYCLE_TIME = timeTaken / FREQUENCE;
	FPS = 1000/CYCLE_TIME;
	if(Main.getPref(w.main,'capFPS') && FPS > FPS_CAP)	//CAPPED
		FPS = FPS_CAP;
	CLIENT_PERFORMANCE = Math.ceil(FPS) + '/' + FPS_CAP + ' FPS';
		
	OLD_TIME = Date.now();
	Performance.testLatency();
	Performance.loop.lowerSetting();
};
var BAD_FPS = 0;	
var ALREADY_OFF = false;
var SHOWN_ALREADY = false;
Performance.loop.lowerSetting = function(){
	if(ALREADY_OFF || !window_focus) 
		return;
	if(!FULL_FOCUS_FOR_LOOP){
		FULL_FOCUS_FOR_LOOP = true;
		return;
	}
	if(FPS < 20){
		if(FPS < 10)
			BAD_FPS += 7;
		if(FPS < 15)
			BAD_FPS += 3;
	} else if(BAD_FPS > 0)
		BAD_FPS--;
		
	if(BAD_FPS >= 10){
		if(!Main.getPref(w.main,'enableLightingEffect') && !Main.getPref(w.main,'enableWeather'))
			return;	//nothing to do...
		if(SHOWN_ALREADY)
			return;
		SHOWN_ALREADY = true;
		Sfx.play('levelUp');
		Dialog.chat.addText($('<span>')
			.css({color:CST.color.gold})
			.html('It appears you are lagging. Would you click to turn off Lighting effects and weather?')
			.append($('<fakea>')
				.addClass('message')
				.html('Yes')
				.css({zIndex:10000})
				.click(function(){
					Main.setPref(w.main,'enableLightingEffect',0);
					Main.setPref(w.main,'enableWeather',0);
					Dialog.chat.addText('Lighting effects and weather can be switch on again in the Settings.');
					ALREADY_OFF = true;
				}),
				' / ',
				$('<fakea>')
				.addClass('message')
				.html('No')
				.css({zIndex:10000})	//???
				.click(function(){
					Dialog.chat.addText('Lighting effects and weather can be switch off manually in the Settings.');
					ALREADY_OFF = true;
				})
			)
		);
	}
}	

Performance.testLatency = function(){
	Socket.emit(CST.SOCKET.ping, {send:Date.now()});
}

Performance.init = function(){ //}
	Socket.on(CST.SOCKET.pingAnswer, function (d) {
		LATENCY = Date.now() - d.send; 
	});
	
	Dialog.UI('performance',null,{
		position:'absolute',
		left:'70%',
		top:5,
		width:'auto',
		height:'auto',
		color:'white',
		fontSize:'1em',
	},Dialog.Refresh(function(html){
		if(!Main.getPref(w.main,'displayFPS') || w.main.hudState.fps === Main.hudState.INVISIBLE) 
			return false;
		//if overwrite old one, double tooltip...
		
		html.addClass('shadow');
		return true;
	},function(){
		return '' + LATENCY + CLIENT_PERFORMANCE + Main.getPref(w.main,'displayFPS') + w.main.hudState.fps;
	},25,function(html,variable,param){
		if(!Main.getPref(w.main,'displayFPS') || w.main.hudState.fps === Main.hudState.INVISIBLE){
			html.html('');
			return false;
		}
		
		var title = 'Latency: ' + LATENCY + ' ms.';
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

} //{

var window_focus = false;
$(window).focus(function() {
    window_focus = true;
}).blur(function() {
    window_focus = false;
	FULL_FOCUS_FOR_LOOP = false;
});


})();