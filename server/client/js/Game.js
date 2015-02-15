//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
//ts
(function(){ //}
var ClientPrediction = require4('ClientPrediction'), AnimModel = require4('AnimModel'), Socket = require4('Socket'), Command = require4('Command'), Draw = require4('Draw'), Performance = require4('Performance'), QueryDb = require4('QueryDb'), Receive = require4('Receive'), Message = require4('Message'), Input = require4('Input'), Song = require4('Song'), Dialog = require4('Dialog'), Main = require4('Main'), ActorModel = require4('ActorModel'), Actor = require4('Actor'), ReputationGrid = require4('ReputationGrid'), MapModel = require4('MapModel'), SpriteModel = require4('SpriteModel'), Bullet = require4('Bullet'), Anim = require4('Anim');
var Game = exports.Game = {};

var REST_PREF_DATE = (new Date(2015,2,1,0,0,0)).getTime();
var START_TIME = Date.now();
var LAST_TICK_LENGTH = 0;
var LAST_TICK_TIME = 0;
var LOADING = false;	//never set to true?? //BADD
var FRAME_COUNT = 0;

var ACTIVE = false;

Game.setActive = function(bool){
	ACTIVE = bool;
}
Game.getActive = function(){
	return ACTIVE;
}

Game.isLoading = function(){
	return LOADING;
}	

Game.init = function (data) {
	ACTIVE = true;
	Socket.init();
	Game.init.other(data);
	Game.init.main(data);	//after, cuz need quest info
	Command.init();	//Dialog...
	
	//Contribution.init(true);
	AnimModel.init();
	Draw.init();
	Performance.init();
	QueryDb.init();
	Receive.init();
		
	$("#startDiv").hide();
	$("#mainDiv").show();  //show game
	
	if(!Game.isChrome()){
		setTimeout(function(){
			Message.add(key,'Consider switching to <a target="_blank" href="https://www.google.com/chrome/">Google Chrome</a> for optimal gameplay experience.');
			if(navigator.userAgent.search("Firefox") > -1)
				Input.fixFirefox();
		},100);
	}

	localStorage.setItem('username',$("#lg-signInUsername")[0].value);
	
	Game.init.player(data);
	START_TIME = Date.now();
	Song.playRandom();
	
	LOADING = false;
	Socket.emit('clientReady',1); 
	Dialog.init();	//after player init
	Input.init();
	if(CST.ASYNC_LOOP)
		setInterval(Game.loop,40);
		
	if(Game.isOnRainingChainCom()){	//BAD
		window.onbeforeunload = function() {
			if(!ACTIVE) return;
			return 'Quit Raining Chain? Click X at top-right corner to log out safely.';
		};
	}
}
	
Game.init.main = function(data){	
	main = Main.create('',{});
	Main.applyChange(main,data.main);
		
	Game.init.pref();
	
	Main.question.init();	//Dialog...
	Main.quest.init();
}
Game.init.player = function(data){  
	ActorModel.init();
	player = Actor.create('player');
	Actor.applyChange(player,data.player);
}
Game.init.other = function(data){
	
	QueryDb.useSignInPack(data.quest,data.highscore,data.item,data.equip);
	
	MapModel.useSignInPack(data.map);
	
	if(data.DEV_MESSAGE){
		setTimeout(function(){
			Message.addPopup(key,data.DEV_MESSAGE);
		},10000);
	}
		
	
	$("#infoDay").html('Info of the day: ' + data.infoDay);
	
	setTimeout(function(){
		$("#infoDay").html('');
	},30000);
	
	SpriteModel.useSignInPack(data.spriteModel);
}

Game.init.pref = function(){
	main.pref = Main.Pref(JSON.parse(localStorage.getItem('pref'),false));
	var date = +localStorage.getItem('prefDate');
	if(!date || date < REST_PREF_DATE){
		localStorage.setItem('prefDate',REST_PREF_DATE);
		Main.Pref({});	//reset pref
	}
}

Game.isOnRainingChainCom = function(){
	return window.location.hostname.$contains('rainingchain');
}

Game.isChrome = function(){
	return window.chrome &&  window.chrome.webstore;
}

Game.isIndex = function(){
	return window.location.pathname !== '/game';
}


Game.loop = function(){
	ClientPrediction.loop();
	Actor.loop();
	Bullet.loop();
	Main.loop();
	Anim.loop();
	Input.loop();
	Dialog.loop();	//drawing
	FRAME_COUNT++;
	
	LAST_TICK_LENGTH = Date.now()-LAST_TICK_TIME;
	LAST_TICK_TIME = Date.now();
	
	
	//	$(".ui-tooltip-content").parents('div').remove();	//tooltip not disappearing
	
	Performance.loop();
}

Game.getFPSAverage = function(){
	return FRAME_COUNT/(Date.now()-START_TIME)*1000;
}

Game.getLastTickInfo = function(){
	return LAST_TICK_LENGTH + 'ms = ' + 1000/LAST_TICK_LENGTH + ' FPS';
}

})(); //{

