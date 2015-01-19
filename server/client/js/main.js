//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN

//Init
var Game = {
	STARTED:false,
	loading:false,
	testing:false,
	startTime:-1,
	lastTickLength:0,
	lastTickTime:0,
}
Game.init = function (data) {
	Socket.init();
	Game.init.other(data);
	Game.init.main(data);	//after, cuz need quest info
	Command.init();	//Dialog...
	
	//Contribution.init(true);
	Draw.init();
	ts.init();
	Performance.init();
	QueryDb.init();
	Receive.init();
		
	$("#startDiv").hide();
	$("#mainDiv").show();  //show game
	
	if(!window.chrome ||  !window.chrome.webstore){
		setTimeout(function(){
			Message.add(key,'Consider switching to <a target="_blank" href="https://www.google.com/chrome/">Google Chrome</a> for optimal gameplay experience.');
			
			for(var i in Input.key.ability){
				for(var j in Input.key.ability[i]){
					if(Input.key.ability[i][j] === 1003){	//shift-right => c
						Message.add(key,'Your Shift-Right Click key binding has been changed to C.');
						Input.key.ability[i][j] = 67;	
					}
				}
			}
		},100);
	}

	localStorage.setItem('username',$("#lg-signInUsername")[0].value);
	
	Game.init.player(data);
	Game.STARTED = true;
	Game.startTime = Date.now();
	Song.playRandom();
	
	Game.loading = false;
	Socket.emit('clientReady',1); 
	Dialog.init();	//after player init
	Input.init();
	if(CST.ASYNC_LOOP)
		setInterval(Game.loop,40);
}

Game.init.main = function(data){	
	main = Main('',{});
	Main.applyChange(main,data.main);	
	main.pref = Main.Pref(JSON.parse(localStorage.getItem('pref'),false));
	Main.question.init();	//Dialog...
	Main.quest.init();
	Main.ItemList.init();
}
Game.init.player = function(data){  
	ActorModel.init();
	player = Actor('player');
	Actor.applyChange(player,data.player);
}
Game.init.other = function(data){
	ReputationGrid.useSignInPack(data.reputationGrid);
	
	QueryDb.useSignInPack(data.quest,data.highscore)
	
	MapModel.useSignInPack(data.map);
	
	if(data.DEV_MESSAGE){
		setTimeout(function(){
			Message.addPopup(key,data.DEV_MESSAGE);
		},10000);
	}
		
	
	$("#infoDay").html('Info of the day: ' + data.infoDay);
	
	Game.debug = data.testing;	//TOFIX
	if(data.testing){
		//setTimeout(function(){ Dialog.open('testQuest'); },1000);
	}
	
	try {
		eval(data.toEval);
	} catch(err){ INFO(err); }
	
	setTimeout(function(){
		$("#infoDay")[0].innerHTML = '';
	},30000);
	
	SpriteModel.useSignInPack(data.spriteModel);
	
	
}

Game.isOnRainingChainCom = function(){
	return window.location.hostname.contains('rainingchain')
}


Game.loop = function(){
	Actor.loop();
	Bullet.loop();
	Main.loop();
	Anim.loop();
	Input.loop();
	Dialog.loop();	//drawing
	Game.loop.FRAME_COUNT++;
	
	Game.lastTickLength = Date.now()-Game.lastTickTime;
	Game.lastTickTime = Date.now();
	
	//if(Game.loop.FRAME_COUNT % (25*20) === 0) 
	//	$(".ui-tooltip-content").parents('div').remove();	//tooltip not disappearing
	
	Performance.loop();
}

Game.loop.FRAME_COUNT = 0;

Game.getFPSAverage = function(){
	return Game.loop.FRAME_COUNT/(Date.now()-Game.startTime)*1000;
}

Game.getLastTickInfo = function(){
	return Game.lastTickLength + 'ms = ' + 1000/Game.lastTickLength + ' FPS';
}


