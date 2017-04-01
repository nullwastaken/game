
"use strict";
(function(){ //}
	
	var ready = false;
	var fileRunner = Tk.newPubSub(false,false,function(f){
		if(ready)
			f();
	});
	
	var initManager = new exports.InitManager(function(pct){
		exports.Sign.postLoadingProgress(pct);
	});
	var initPack = null;
	
	global.onReady = function(onFilesLoaded,unused,self,dependency,onGameLoad){
		var f = function(){ onFilesLoaded({}); };
		fileRunner(f);
		if(self)
			initManager.add(self,dependency,function(){
				onGameLoad(initPack);	//initPack always provided
			});
	}
	
	var FRAME_RATE_MOD = 1;	//for debug
	global.onLoop = Tk.newPubSub();
	
	global.onLoopDraw = Tk.newPubSub();
	
	window.rootRequire = function(where,moduleId,client){
		return x[moduleId];	//BAD shorter in con sole
	}
	
	$(document).ready(function() {
		fileRunner.pub();
		ready = true;
		
		$(document).tooltip(Tk.getTooltipOptions());
		
		exports.Sign.onGameStart(function(data){ //requires Socket
			var signInPackStatic = window[CST.SIGN_IN_PACK_STATIC_VAR];
			data.quest = data.quest || signInPackStatic.quest;
			data.highscore = data.highscore || signInPackStatic.highscore;
			data.mapGraph = data.mapGraph || signInPackStatic.mapGraph;
			data.map = data.map || signInPackStatic.map;
			data.sideQuest = data.sideQuest || signInPackStatic.sideQuest;
			
			initPack = data;
			
			initManager.run(true,function(){
				initLoop();
				exports.Game.setReady(true);
				exports.Game.init.fadeStage();
				exports.Receive.useNonReadyBuffer();
			});
			
			
			
		});	
	});
	
	
	if(typeof window.requestAnimationFrame === 'undefined')
		window.requestAnimationFrame = function(func){
			setTimeout(func,1000/CST.FPS);
		}
	
	var initLoop = function(){
		if(FRAME_RATE_MOD !== 1)
			alert('FRAME_RATE_MOD is not 1');
		
		setInterval(function(){
			if(exports.Game.getActive())
				global.onLoop.pub();
		},1000/CST.FPS/FRAME_RATE_MOD);	//no drawing
		
		var draw = function(){	//as fast as possible
			requestAnimationFrame(draw);
			if(exports.Game.getActive())
				global.onLoopDraw.pub();
		}
		draw();
		
		/*var fps = CST.FPS;
		var now;
		var then = Date.now();
		var interval = 1000/fps;
		var delta;
		var draw = function(){
			requestAnimationFrame(draw);
			 
			now = Date.now();
			delta = now - then;
			 
			if (delta > interval) {
				then = now - (delta % interval);
				global.onLoopDraw.pub();
			}
		}
		draw();
		*/
	}
	
})(); //{

