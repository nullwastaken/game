//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var LightingEffect = require4('LightingEffect'), Input = require4('Input'), Dialog = require4('Dialog'), MapModel = require4('MapModel');
var Main = require3('Main');
//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.rain('asd',3));
//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.sun('asd',1));
//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.night('asd','rgba(0,0,0,0.5)',true,true));

Main.ScreenEffect = {};

var ScreenEffect = function(type,id){
	return {
		type:type,
		id:id || Math.randomId(),
	}
}

var onCreate = {};
var onLoop = {};
var SUN_LIGHTING_EFFECT = null; //check onCreate.sun
var IS_MASK_TAINTED = false;
var DROPPLET_LIST = {};
var MASK_CTX;
var MASK_CANVAS;
var SUN_CANVAS;
var SUN_CTX;
var ACTIVE = {};

Main.ScreenEffect.fadeout = function(id,timer,color){
	var a = ScreenEffect('fadeout',id);
	a.timer = timer || 25;
	a.maxTimer = timer || 25;
	a.color = color || 'black';
	return a;
}
onLoop.fadeout = function(se,ctx){
	var third = se.maxTimer/3;
	var timer = se.maxTimer - se.timer;
	
	var alpha = 1;
	if(timer < third)
		alpha = timer / third;
	if(timer > 2*third)
		alpha = 1- (timer - 2*third)/third;
	
	ctx.globalAlpha = alpha;
	ctx.fillStyle = se.color || 'black';
	ctx.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
	ctx.globalAlpha = 1;
	
	if(--se.timer < 0) 
		Main.removeScreenEffect(main,se.id);
}

Main.ScreenEffect.torch = function(id,radiusInside,colorOutside,radiusOutside,colorInside){
	var a = ScreenEffect('torch',id);
	a.colorOutside=colorOutside || 'black';
	a.colorInside=colorInside || 'rgba(31,0,0,0.5)';
	a.radiusInside=radiusInside || 200;
	a.radiusOutside=radiusOutside || (2*radiusInside) || 350;
	return a;
}
onLoop.torch = function(se,ctx){
	var grd = ctx.createRadialGradient(
		CST.WIDTH2,
		CST.HEIGHT2,
		se.radiusInside || 200,
		CST.WIDTH2,
		CST.HEIGHT2,
		se.radiusOutside || 300
	);
	grd.addColorStop(0.1,se.colorInside);
	grd.addColorStop(1,se.colorOutside);
	
	MASK_CTX.fillStyle = grd;
	MASK_CTX.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
	IS_MASK_TAINTED = true;
	
}

Main.ScreenEffect.shake = function(id,duration,interval,magn){
	var a = ScreenEffect('shake',id);
	a.duration = duration || 10;
	a.interval = Math.max(interval || 50,20);
	a.magn = Math.min(magn || 10,100);
	a.intervalFunction = null;
	a.startTime = -1;
	return a;
}
onCreate.shake = function(se){
	var stage = Dialog.get('stage');
	se.startTime = Date.now();
	se.intervalFunction = setInterval(function(){
		if(Date.now() - se.startTime >= se.duration*40){
			Main.removeScreenEffect(main,se.id);
		} else {
			stage.css({left:se.magn*Math.randomML(),top:se.magn*Math.randomML()});
		}
	},se.interval);
}

Main.ScreenEffect.rain = function(id,magn,filter){
	var a = ScreenEffect('rain',id);
	a.magn = magn || 1;
	a.filter = filter || '';
	return a;
}
onLoop.rain = function(se,ctx){
	for(var i = 0 ; i < se.magn; i++){	//average 10*magn dropplet per sec
		if(Math.random() < 10/25){
			onLoop.rain.createDropplet();
		}
	}
	ctx.save();
	if(se.filter){
		MASK_CTX.fillStyle = se.filter;
		MASK_CTX.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
		IS_MASK_TAINTED = true;
	}
		
	ctx.strokeStyle = 'white';
	for(var i in DROPPLET_LIST){
		onLoop.rain.forEach(DROPPLET_LIST[i],ctx);
	}	
	ctx.restore();
}
onLoop.rain.forEach = function(d,ctx){
	d.x += d.spdX;
	d.y += d.spdY;
	d.timer++;
	
	ctx.lineWidth = d.width;
	
	ctx.globalAlpha = 1;//(d.maxTimer-d.timer)/d.maxTimer;
	
	if(d.x < 0 || d.x > CST.WIDTH || d.y < 0 || d.y > CST.HEIGHT)
		return;
	
	ctx.beginPath();
	ctx.moveTo(d.x,d.y);
	ctx.lineTo(d.x+d.vx,d.y+d.vy);
	ctx.stroke();
	
	if(d.timer > d.maxTimer){
		delete DROPPLET_LIST[d.id];
	}
}
onLoop.rain.createDropplet = function(){
	var d = {
		id:Math.randomId(),
		x:CST.WIDTH * (Math.random()*1.1),	//[0,CST.WIDT*1.1]
		y:CST.HEIGHT * (-0.8 + Math.random()*1.3),	//[-CST.HEIGHT*0.3,CST.HEIGHT/2]
		angle:110,
		timer:0,
		spd:60,
		spdX:0,
		spdY:0,
		length:100,
		width:1,
		maxTimer:5,
		vx:0,
		vy:0,
	};
	d.vx = Tk.cos(d.angle)*d.length;
	d.vy = Tk.sin(d.angle)*d.length;
	d.spdX = Tk.cos(d.angle)*d.spd;
	d.spdY = Tk.sin(d.angle)*d.spd;
	
	
	DROPPLET_LIST[d.id] = d;
	return d;
}

Main.ScreenEffect.sun = function(id,sizeMod,r,g,b,a){
	var se = ScreenEffect('sun',id);
	se.sizeMod = sizeMod || 1;
	se.red = r !== undefined ? r : 255;
	se.green = g !== undefined ? g : 122;
	se.blue = b !== undefined ? b : 66;
	se.alpha = a !== undefined ? a : 0.5;
	return se;
}

onCreate.sun = function(se){	
	SUN_LIGHTING_EFFECT = LightingEffect.create(0,250*6*se.sizeMod,[
		LightingEffect.Color(0.2,Tk.rgbaToString({red:se.red,blue:se.blue,green:se.green,alpha:se.alpha})),
		LightingEffect.Color(0.6,Tk.rgbaToString({red:se.red,blue:se.blue,green:se.green,alpha:se.alpha/2})),
		LightingEffect.Color(1.0,Tk.rgbaToString({red:se.red,blue:se.blue,green:se.green,alpha:0})),
	]);
}
onLoop.sun = function(se,ctx){
	ctx.save();
	//LightingEffect.draw(SUN_LIGHTING_EFFECT,ctx,-250,-250,1,'lighter');	//
	SUN_CTX.clearRect(0,0,CST.WIDTH,CST.HEIGHT);
	
	LightingEffect.draw(SUN_LIGHTING_EFFECT,SUN_CTX,-250,-250,1,'lighter');	//TEMP_IMPROTANT
	
	var zone = MapModel.getZoneDrawOnScreen();
	ctx.drawImage(SUN_CANVAS,zone.x,zone.y,zone.width,zone.height,zone.x,zone.y,zone.width,zone.height);
	IS_MASK_TAINTED = true;
	ctx.restore();
}

onLoop.sun.image = null;	//check init

Main.ScreenEffect.night = function(id,filter,glowPlayer,glowActor){
	var se = ScreenEffect('night',id);
	se.filter = filter || '';
	se.glowPlayer = glowPlayer || 0;
	se.glowActor = glowActor || 0;
	return se;
}
onLoop.night = function(se,ctx){
	MASK_CTX.fillStyle = se.filter;
	MASK_CTX.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
	IS_MASK_TAINTED = true;
}

Main.addScreenEffect = function(main,se){
	if(SERVER){
		main.temp.screenEffectAdd = main.temp.screenEffectAdd  || [];
		main.temp.screenEffectAdd.push(se);
	} else {
		if(main.screenEffect[se.id])	//another effect with same name exist
			Main.removeScreenEffect(main,se.id);
		
		for(var i in main.screenEffect){
			if(main.screenEffect[i].type === se.type)
				Main.removeScreenEffect(main,i);
		}
		ACTIVE[se.type] = se;
		
		if(se.type === 'shake')
			onCreate.shake(se);
		else if(se.type === 'sun')
			onCreate.sun(se);
		main.screenEffect[se.id] = se;
	}
}

Main.removeScreenEffect = function(main,id){
	if(SERVER){
		main.temp.screenEffectRemove = main.temp.screenEffectRemove  || [];
		main.temp.screenEffectRemove.push(id);
	} else {
		if(id === Main.screenEffect.REMOVE_ALL){
			for(var i in main.screenEffect)
				Main.removeScreenEffect(main,i);
		} else {
			var se = main.screenEffect[id];
			if(!se)
				return;
			if(se.type === 'shake'){
				clearInterval(se.intervalFunction);
				Dialog.get('stage').css({left:0,top:0});
			}
			else if(se.type === 'torch'){
				MASK_CTX.clearRect(0,0,CST.WIDTH,CST.WIDTH);
			}
			delete ACTIVE[se.type];
			delete main.screenEffect[id];
		}
	}
}

Main.screenEffect = {};
Main.screenEffect.REMOVE_ALL = '$all';

Main.screenEffect.isPlayerGlowing = function(){
	return ACTIVE['night'] && ACTIVE['night'].glowPlayer;
}
Main.screenEffect.isActorGlowing = function(){
	return ACTIVE['night'] && ACTIVE['night'].glowActor;
}


Main.screenEffect.loop = function(main,ctx){ 
	if(IS_MASK_TAINTED){
		MASK_CTX.clearRect(0,0,CST.WIDTH,CST.HEIGHT);
		IS_MASK_TAINTED = false;
	}
	
	for(var i in main.screenEffect){
		var se = main.screenEffect[i];
		if(se.type === 'fadeout') 
			onLoop.fadeout(se,ctx);
		else if(se.type === 'torch') 
			onLoop.torch(se,ctx);
		
		if(!Main.getPref(main,'enableWeather'))
			continue;
			
		if(se.type === 'rain')
			onLoop.rain(se,ctx);
		else if(se.type === 'sun')
			onLoop.sun(se,ctx);
		else if(se.type === 'night')
			onLoop.night(se,ctx);
	}
	if(IS_MASK_TAINTED)
		LightingEffect.modifyMaskCanvas(MASK_CTX);	
}
Main.screenEffect.init = function(){
	SUN_CANVAS = $('<canvas>').attr({width:CST.WIDTH,height:CST.HEIGHT}).css({width:CST.WIDTH,height:CST.HEIGHT})[0];
	Input.callOnResize($(SUN_CANVAS));
	SUN_CTX = SUN_CANVAS.getContext('2d');

	Dialog.UI('stageMask',{
		position:'absolute',
		left:0,
		top:0,
		width:CST.WIDTH,
		height:CST.HEIGHT,
		zIndex:Dialog.ZINDEX.LOW+1,
	},Dialog.Refresh(function(html,variable){
		var canvas = $('<canvas>')
			.css({
				top:0,
				left:0,
				width:CST.WIDTH,
				height:CST.HEIGHT,
			})
			.attr({
				width:CST.WIDTH,
				height:CST.HEIGHT,
			});
		Input.callOnResize(canvas);
		
		html.append(canvas);
		var ctx = canvas[0].getContext("2d");
		variable.ctx = ctx;
		MASK_CTX = ctx;
		MASK_CANVAS = canvas[0];
	}));
}


})(); //{
