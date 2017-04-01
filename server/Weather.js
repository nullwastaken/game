
"use strict";
(function(){ 	//}
var Main;
global.onReady(function(){
	Main = rootRequire('shared','Main');
	global.onLoop(Weather.loop);
	Weather.init();
});
var Weather = exports.Weather = {};

var LOOP_INTERVAL = 25*60*2;
var FRAME_COUNT = 0;
var CURRENT = null;
var PHASE = 0;
var CATEGORY = 'rain';

var DATA = null; //check init
var CAVE = null,LIGHT_CAVE = null,DARK_CAVE = null;

Weather.SCREEN_EFFECT = ['weather','cave','lightCave','darkCave',''];

Weather.loop = function(){
	if(FRAME_COUNT++ % LOOP_INTERVAL !== 0)
		return;
	var list = DATA[CATEGORY];
	if(list[PHASE])
		CURRENT = list[PHASE];
	else
		Weather.changeCategory();
	PHASE++;
}

Weather.onMapEnter = function(main,map){
	if(map.screenEffect === 'weather' && CURRENT)
		Main.addScreenEffect(main,CURRENT);
	else if(map.screenEffect === 'cave')
		Main.addScreenEffect(main,CAVE);
	else if(map.screenEffect === 'lightCave')
		Main.addScreenEffect(main,LIGHT_CAVE);
	else if(map.screenEffect === 'darkCave')
		Main.addScreenEffect(main,DARK_CAVE);
}
Weather.onPlayerLeave = function(main,map){
	if(!map.screenEffect) 
		return;
	Main.removeScreenEffect(main,'weather');	//CAVE id is weather
}

Weather.get = function(){
	return CURRENT;
}

Weather.changeCategory = function(category){
	PHASE = 0;
	if(category){
		CATEGORY = category;
		return;
	}
	var safety = 0;
	var newWeather;
	do {
		newWeather = DATA.$randomAttribute();
	} while(CATEGORY === newWeather && safety++ < 1000);
	CATEGORY = newWeather;
}
Weather.setPhase = function(num){
	PHASE = num || 0;
}

Weather.init = function(){
	CAVE = Main.ScreenEffect.torch('weather',200);
	DARK_CAVE = Main.ScreenEffect.torch('weather',150);
	LIGHT_CAVE = Main.ScreenEffect.torch('weather',300);
	
	DATA = {
		sunYellow:[			
			Main.ScreenEffect.sun('weather',0.10,255,122,66,0.025),
			Main.ScreenEffect.sun('weather',0.25,255,122,66,0.05),
			Main.ScreenEffect.sun('weather',0.5,255,122,66,0.15),
			Main.ScreenEffect.sun('weather',0.75,255,122,66,0.25),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,122,66,0.45),
			Main.ScreenEffect.sun('weather',0.75,255,122,66,0.25),
			Main.ScreenEffect.sun('weather',0.5,255,122,66,0.15),
			Main.ScreenEffect.sun('weather',0.25,255,122,66,0.05),
			Main.ScreenEffect.sun('weather',0.10,255,122,66,0.025),
		],
		sunRed:[
			Main.ScreenEffect.sun('weather',0.10,255,50,25,0.025),
			Main.ScreenEffect.sun('weather',0.25,255,50,25,0.05),
			Main.ScreenEffect.sun('weather',0.5,255,50,25,0.15),
			Main.ScreenEffect.sun('weather',0.75,255,50,25,0.25),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.87,255,50,25,0.45),
			Main.ScreenEffect.sun('weather',0.75,255,50,25,0.25),
			Main.ScreenEffect.sun('weather',0.5,255,50,25,0.15),
			Main.ScreenEffect.sun('weather',0.25,255,50,25,0.05),
			Main.ScreenEffect.sun('weather',0.10,255,50,25,0.025),
		],
		rain:[
			Main.ScreenEffect.rain('weather',0.15,'rgba(0,0,0,0.01)'),
			Main.ScreenEffect.rain('weather',0.30,'rgba(0,0,0,0.02)'),
			Main.ScreenEffect.rain('weather',0.50,'rgba(0,0,0,0.03)'),
			Main.ScreenEffect.rain('weather',1,'rgba(0,0,0,0.05)'),
			Main.ScreenEffect.rain('weather',2,'rgba(0,0,0,0.07)'),
			Main.ScreenEffect.rain('weather',3,'rgba(0,0,0,0.1)'),
			Main.ScreenEffect.rain('weather',5,'rgba(0,0,0,0.12)'),
			Main.ScreenEffect.rain('weather',7,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',10,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',10,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',10,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',10,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',10,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',10,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',7,'rgba(0,0,0,0.15)'),
			Main.ScreenEffect.rain('weather',5,'rgba(0,0,0,0.12)'),
			Main.ScreenEffect.rain('weather',3,'rgba(0,0,0,0.1)'),
			Main.ScreenEffect.rain('weather',2,'rgba(0,0,0,0.07)'),
			Main.ScreenEffect.rain('weather',1,'rgba(0,0,0,0.05)'),
			Main.ScreenEffect.rain('weather',0.50,'rgba(0,0,0,0.03)'),
			Main.ScreenEffect.rain('weather',0.30,'rgba(0,0,0,0.02)'),
			Main.ScreenEffect.rain('weather',0.15,'rgba(0,0,0,0.01)'),
		],
		night:[
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.05)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.10)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.20)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.30)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.40)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.50)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.50)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.50)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.50)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.40)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.30)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.20)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.10)',0,0),
			Main.ScreenEffect.night('weather','rgba(0,0,0,0.05)',0,0),
		],
	}

};


})(); //{


