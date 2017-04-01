
(function(){ //}

var Command, Message, Input, Main, Dialog;
global.onReady(function(){
	Dialog = rootRequire('client','Dialog',true); Command = rootRequire('shared','Command',true); Message = rootRequire('shared','Message',true); Input = rootRequire('client','Input',true); Main = rootRequire('shared','Main',true);
},null,'Game',['Main'],function(pack){
	Game.init(pack);
});
var Game = exports.Game = {};

var LOADING = false;	//never set to true?? //BADD
var ACTIVE = false;
var READY = false;
var BOT_WATCH_ACTIVE = false;
var START_TIME = 0;

Game.setBotWatch = function(bool){
	BOT_WATCH_ACTIVE = bool;
}
Game.getBotWatch = function(bool){
	return BOT_WATCH_ACTIVE;
}

Game.getReady = function(){
	return READY;
}
Game.setReady = function(bool){
	READY = bool;
}

Game.setActive = function(bool){
	ACTIVE = bool;
}

Game.getActive = function(){
	return ACTIVE;
}

Game.isLoading = function(){
	return LOADING;
}	

Game.init = function(pack) {
	ACTIVE = true;
	LOADING = true;
	
	var clockDiff = Date.now() - (+pack.currentTime + 100);	//100 for latency
	if(Math.abs(clockDiff) < 200)
		clockDiff = 0;
	CST.TIMESTAMP_OFFSET = +pack.TIMESTAMP_OFFSET + clockDiff;
	
	Game.init.manageUserPass(pack);
	Game.init.testChrome();
	Game.init.testInIframe();
	Game.init.setHandleSignOff();
	Game.init.displayUpdateMessage(pack);
	Game.init.displayTwitch(pack);
	
	setTimeout(Game.checkIfSizeCorrect,30*1000);
	
	LOADING = false;
	//READY done in initManager
	START_TIME = Date.now();
	Input.DONT_EMIT = false;
}

Game.init.manageUserPass = function(pack){
	var user = $("#lg-signInUsername").val() || $("#lg-signUpUsername").val();
	localStorage.setItem('username',user);
	if(pack.randomlyGeneratedPassword){
		var pass = $("#lg-signInPassword").val() || $("#lg-signUpPassword").val();
		localStorage.setItem('password',pass);
	} else {
		localStorage.setItem('password','');
	}
	
	$("#lg-signUpPassword").val('');
	$("#lg-signInPassword").val('');
	
	setTimeout(function(){
		var button = '<button class="myButton" style="font-size:0.9em; padding:3px 5px;margin-top:3px;" onclick="exports.Dialog.open(\'account\',true); exports.Dialog.close(\'questPopup\');">Account</button>';
		
		//var popup = '<button class="myButton" title="Change username and password" style="font-size:0.8em; padding:3px 5px;" onclick="exports.Dialog.open(\'account\',true);">Account</button>';

		if(pack.randomlyGeneratedUsername){
			Message.addPopup(null,'You can change your username and password<br>at any time via ' + button + ' (below game).');
			$('#below-accountManagement').show();
		} else if(pack.randomlyGeneratedPassword){
			Message.addPopup(null,'Please, change your password via ' + button + '.');
		}
	},2*1000);
}

Game.init.fadeStage = function(){	//triggered by initManager
	$('#myNavbar').fadeOut();
	var d = $('<div>').css({position:'absolute',zIndex:-100000000,left:0,top:0,background:'black',minHeight:'100%',minWidth:'100%'}).fadeIn(2000,function(){
		$('body').css({backgroundImage:"url(../css/img/blackmamba.png)"});
		d.fadeOut(2000,function(){
			d.remove();
		});
	});
	$('body').append(d);
	
	$("#startDiv").fadeOut();
	$("#mainDiv").fadeIn(2000);  //show game
}

Game.init.testChrome = function(){
	if(!Game.isChrome()){
		setTimeout(function(){
			Message.add(null,'Consider switching to <a class="message" target="_blank" href="http://www.google.com/chrome/">Google Chrome</a> for an optimal gameplay experience. Your current browser doesn\'t support lighting and particle effects well.');
			Main.setPref(w.main,'enableLightingEffect',0);
			Main.setPref(w.main,'maxParticleMod',25);
			Main.setPref(w.main,'enableWeather',0);
			if(navigator.userAgent.indexOf("Firefox") > -1)
				Input.fixFirefox();
			if(navigator.userAgent.search("OPR") > -1)		//aka opera
				Message.add(null,'Make sure to disable Opera Mouse Gestures. This can be done via Settings > Preferences > Advanced > Shortcuts. Otherwise, you will most likely close the game by accident.');
				
		},100);
	}
}

Game.init.testInIframe = function(){
	if(window.inIframe()){
		setTimeout(function(){
			Message.add(null,'The game can be resized and played full page at <a title="Ctrl-Click to open in a new tab" class="message" target="_blank" href="http://www.rainingchain.com/game">RainingChain.com</a>.<br>Otherwise, unzoom (Ctrl-) until the game fits your screen.');
		},100);
	}
}

Game.init.setHandleSignOff = function(){
	if(Game.isOnRainingChainCom()){
		window.onbeforeunload = function() {
			if(!ACTIVE) return;
			return 'Quit GAME_NAME? Click X at top-right corner to log out safely.';
		};
		$(window).unload(function(){
			if(!ACTIVE) return;
			Command.execute(CST.COMMAND.signOff);
		});
	}
}

Game.init.displayTwitch = function(pack){
	if(pack.streamingTwitch)
		setTimeout(function(){
			Message.add(null,'RainingChain is currently streaming on <a target="_blank" class="message" href="http://www.twitch.tv/rainingchain/">Twitch</a>!');
		},3000);
}

Game.init.displayUpdateMessage = function(pack){
	if(pack.updateMessage)
		setTimeout(function(){
			Message.addPopup(null,pack.updateMessage);
		},10000);
}

Game.isOnRainingChainCom = function(){
	return window.location.hostname.$contains('rainingchain');
}

Game.isAdmin = function(){
	if(!Game.isOnRainingChainCom())
		return true;
	return w.player.username === 'rc';
}

Game.isChrome = function(){
	return !!window.chrome && !!window.chrome.webstore;
}

Game.removeTooltip = function(){
	$(".ui-tooltip-content").parents('div').remove();
}

Game.checkIfSizeCorrect = function(){
	if($(window).height() < 540){
		Message.addPopup(null,'Press Ctrl- so the game fits your screen.');
	}	
}


window.setEverythingSelectable = function(what){
	if(what === false){
		$('*').removeClass('selectable');
		$(document).bind('contextmenu',function(e){ e.preventDefault(); return false; });
	} else {
		$('*').addClass('selectable');
		$(document).unbind('contextmenu');
	}
}


Game.getStartTime = function(){
	return START_TIME;
}
Game.stop = function(d){
	Game.setActive(false);
	if(d)
		Dialog.open('disconnect',d);
	setTimeout(function(){
		Dialog.close('disconnect');
		location.pathname = '/game';
	},5000);	
}

})(); //{

