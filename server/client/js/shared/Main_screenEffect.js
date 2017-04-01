
"use strict";
(function(){ //}
var LightingEffect, Input, Dialog, MapModel;
global.onReady(function(){
	LightingEffect = rootRequire('shared','LightingEffect',true); Input = rootRequire('server','Input',true); Dialog = rootRequire('client','Dialog',true); MapModel = rootRequire('server','MapModel',true);
	if(!SERVER)
		global.onLoop(Main.screenEffect.loop);
		
});	
var Main = rootRequire('shared','Main');


//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.rain('asd',3));
//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.sun('asd',1));
//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.night('asd','rgba(0,0,0,0.5)',true,true));
//exports.Main.addScreenEffect(main,exports.Main.ScreenEffect.shake('asd',10000));

Main.ScreenEffect = function(type,id){
	return {
		type:type,
		id:id || Math.randomId(),
	}
}

var onCreate = {};
var onLoop = {};
var onDraw = {};
var SUN_LIGHTING_EFFECT = null; //check onCreate.sun
var IS_MASK_TAINTED = false;
var DROPPLET_LIST = {};
var MASK_CTX;
var MASK_CANVAS;
var SUN_CANVAS;
var SUN_CTX;
var ACTIVE = {};
var ALLOW_MULTI_INSTANCE = ['torch','filter'];


Main.ScreenEffect.fadeout = function(id,timer,color){
	var a = Main.ScreenEffect('fadeout',id);
	a.timer = timer || 25;
	a.maxTimer = timer || 25;
	a.color = color || 'black';
	return a;
}
onLoop.fadeout = function(se){
	if(--se.timer < 0) 
		Main.removeScreenEffect(w.main,se.id);
}
onDraw.fadeout = function(se,ctx){
	var tenth = se.maxTimer/10;
	var timer = se.maxTimer - se.timer;
	
	var alpha = 1;
	if(timer < 3*tenth)
		alpha = timer / (3*tenth);
	
	if(timer > 7*tenth)
		alpha = 1- (timer - 7*tenth)/(3*tenth);
	
	ctx.globalAlpha = alpha;
	ctx.fillStyle = se.color || 'black';
	ctx.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
	ctx.globalAlpha = 1;
}

Main.ScreenEffect.torch = function(id,radiusInside,colorOutside,radiusOutside,colorInside){
	var a = Main.ScreenEffect('torch',id);
	a.colorOutside=colorOutside || 'black';
	a.colorInside=colorInside || 'rgba(31,0,0,0.5)';
	a.radiusInside=radiusInside || 200;
	a.radiusOutside=radiusOutside || (2*radiusInside) || 350;
	return a;
}

onDraw.torch = function(se,ctx){
	var x = Tk.absToRel.x(w.player.x);
	var y = Tk.absToRel.y(w.player.y);
	var grd = ctx.createRadialGradient(
		x,y,
		se.radiusInside || 200,
		x,y,
		se.radiusOutside || 300
	);
	grd.addColorStop(0.1,se.colorInside);
	grd.addColorStop(1,se.colorOutside);
	
	MASK_CTX.fillStyle = grd;
	MASK_CTX.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
	IS_MASK_TAINTED = true;
}

Main.addBasicShakeScreenEffect = function(main,mod){
	Main.setChange(main,CST.CHANGE.screenShake,mod);
}
Main.onChange(CST.CHANGE.screenShake,function(main,data){
	Main.addScreenEffect(main,Main.ScreenEffect.shake('basic',5,50,2*data));
});

Main.ScreenEffect.shake = function(id,duration,interval,magn){
	var a = Main.ScreenEffect('shake',id);
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
			Main.removeScreenEffect(w.main,se.id);
		} else {
			stage.css({left:se.magn*Math.randomML(),top:se.magn*Math.randomML()});
		}
	},se.interval);
}

Main.ScreenEffect.rain = function(id,magn,filter){
	var a = Main.ScreenEffect('rain',id);
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
	for(var i in DROPPLET_LIST){
		var d = DROPPLET_LIST[i];
		d.x += d.spdX;
		d.y += d.spdY;
		d.timer++;
	}
}
onLoop.rain.createDropplet = function(){
	var d = {
		id:Math.randomId(),
		x:CST.WIDTH * (Math.random()*1.1),	//[0,CST.WIDT*1.1]
		y:CST.HEIGHT * (-0.8 + Math.random()*1.3),	//[-CST.HEIGHT*0.3,CST.HEIGHT/2]
		angle:110,
		timer:0,
		spd:50,
		spdX:0,
		spdY:0,
		length:100,
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
onDraw.rain = function(se,ctx){
	ctx.save();
	if(se.filter){
		MASK_CTX.fillStyle = se.filter;
		MASK_CTX.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
		IS_MASK_TAINTED = true;
	}
		
	ctx.strokeStyle = '#EEFFEE';
	ctx.lineWidth = 1;
	for(var i in DROPPLET_LIST){
		onDraw.rain.forEach(DROPPLET_LIST[i],ctx);
	}	
	ctx.restore();
}


onDraw.rain.forEach = function(d,ctx){
	if(d.x < 0 || d.x > CST.WIDTH || d.y < 0 || d.y > CST.HEIGHT)
		return;
	
	ctx.beginPath();
	ctx.moveTo(d.x,d.y);
	ctx.lineTo(d.x+d.vx,d.y+d.vy);
	ctx.stroke();
	
	if(d.timer > d.maxTimer){
		ctx.beginPath();
		ctx.arc(d.x+d.vx,d.y+d.vy,2,0,2*Math.PI);
		ctx.stroke();
		delete DROPPLET_LIST[d.id];
	}
}


Main.ScreenEffect.sun = function(id,sizeMod,r,g,b,a){
	var se = Main.ScreenEffect('sun',id);
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
onDraw.sun = function(se,ctx){
	ctx.save();
	SUN_CTX.clearRect(0,0,CST.WIDTH,CST.HEIGHT);
	LightingEffect.draw(SUN_LIGHTING_EFFECT,SUN_CTX,-250,-250,1,'lighter');	
	var zone = MapModel.getZoneDrawOnScreen();
	ctx.drawImage(SUN_CANVAS,zone.x,zone.y,zone.width,zone.height,zone.x,zone.y,zone.width,zone.height);
	IS_MASK_TAINTED = true;
	ctx.restore();
}

Main.ScreenEffect.trippy = function(id){
	return Main.ScreenEffect('trippy',id);
}
Main.ScreenEffect.isTrippyActive = function(){
	return ACTIVE['trippy'];
}

Main.ScreenEffect.night = function(id,filter,glowPlayer,glowActor){
	var se = Main.ScreenEffect('night',id);
	se.filter = filter || '';
	se.glowPlayer = glowPlayer || 0;
	se.glowActor = glowActor || 0;
	return se;
}
onDraw.night = function(se,ctx){
	MASK_CTX.fillStyle = se.filter;
	MASK_CTX.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
	IS_MASK_TAINTED = true;
}

Main.ScreenEffect.filter = function(id,filter){
	var a = Main.ScreenEffect('filter',id);
	a.filter = filter || 'black';
	return a;
}
onDraw.filter = function(se,ctx){
	ctx.fillStyle = se.filter;
	ctx.fillRect(0,0,CST.WIDTH,CST.HEIGHT);
}

Main.addScreenEffect = function(main,se){
	if(SERVER)
		return Main.setTemp(main,CST.CHANGE.screenEffectAdd,se,true);
	
	if(main.screenEffect[se.id])	//another effect with same name exist
		Main.removeScreenEffect(main,se.id);
	
	if(!ALLOW_MULTI_INSTANCE.$contains(se.type)){
		for(var i in main.screenEffect){
			if(main.screenEffect[i].type === se.type)
				Main.removeScreenEffect(main,i);
		}
	}
	ACTIVE[se.type] = se;
	
	if(se.type === 'shake')
		onCreate.shake(se);
	else if(se.type === 'sun')
		onCreate.sun(se);
	main.screenEffect[se.id] = se;
}


Main.removeScreenEffect = function(main,id){	//id:string or object {quest}	//BAD
	if(SERVER)
		return Main.setTemp(main,CST.CHANGE.screenEffectRemove,id,true);
	
	if(typeof id === 'object'){
		for(var i in main.screenEffect)
			if(i.$contains(id.quest))
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

Main.screenEffect = {};

Main.screenEffect.isPlayerGlowing = function(){
	return ACTIVE['night'] && ACTIVE['night'].glowPlayer;
}

Main.screenEffect.isActorGlowing = function(){
	return ACTIVE['night'] && ACTIVE['night'].glowActor;
}

Main.screenEffect.loop = function(){ 
	Main.screenEffect.drawLowLife.loop();
	
	for(var i in w.main.screenEffect){
		var se = w.main.screenEffect[i];
		if(se.type === 'torch' && onLoop.torch) 
			onLoop.torch(se);
		else if(se.type === 'filter' && onLoop.filter)
			onLoop.filter(se);
			
		if(!Main.getPref(w.main,'enableWeather'))
			continue;
			
		if(se.type === 'rain' && onLoop.rain)
			onLoop.rain(se);
		else if(se.type === 'sun' && onLoop.sun)
			onLoop.sun(se);
		else if(se.type === 'night' && onLoop.night)
			onLoop.night(se);
	}
	for(var i in w.main.screenEffect){	//fadeout after others
		var se = w.main.screenEffect[i];
		if(se.type === 'fadeout' && onLoop.fadeout) 
			onLoop.fadeout(se);
	}
}

Main.screenEffect.draw = function(main,ctx){
	ctx.save();
	if(IS_MASK_TAINTED){
		MASK_CTX.clearRect(0,0,CST.WIDTH,CST.HEIGHT);
		IS_MASK_TAINTED = false;
	}
	Main.screenEffect.drawLowLife.draw(ctx);
	
	for(var i in main.screenEffect){
		var se = main.screenEffect[i];
		if(se.type === 'torch' && onDraw.torch) 
			onDraw.torch(se,ctx);
		else if(se.type === 'filter' && onDraw.filter)
			onDraw.filter(se,ctx);
			
		if(!Main.getPref(w.main,'enableWeather'))
			continue;
			
		if(se.type === 'rain' && onDraw.rain)
			onDraw.rain(se,ctx);
		else if(se.type === 'sun' && onDraw.sun)
			onDraw.sun(se,ctx);
		else if(se.type === 'night' && onDraw.night)
			onDraw.night(se,ctx);
	}
	for(var i in main.screenEffect){	//fadeout after others
		var se = main.screenEffect[i];
		if(se.type === 'fadeout' && onDraw.fadeout) 
			onDraw.fadeout(se,ctx);
	}
	if(IS_MASK_TAINTED)
		LightingEffect.modifyMaskCanvas(MASK_CTX);
	ctx.restore();	
}

Main.screenEffect.init = function(){
	SUN_CANVAS = Tk.createSharpCanvas(CST.WIDTH,CST.HEIGHT)[0];
	Input.callOnResize($(SUN_CANVAS));
	SUN_CTX = SUN_CANVAS.getContext('2d');	
	
	Dialog.UI('stageMask',null,{
		position:'absolute',
		left:0,
		top:0,
		width:'100%',
		height:'100%',
		zIndex:Dialog.ZINDEX.LOW+1,
	},Dialog.Refresh(function(html,variable){
		var canvas = Tk.createSharpCanvas(CST.WIDTH,CST.HEIGHT)
			.css({
				top:0,
				left:0,
			});
		Input.callOnResize(canvas);
		
		html.append(canvas);
		var ctx = canvas[0].getContext("2d");
		variable.ctx = ctx;
		MASK_CTX = ctx;
		MASK_CANVAS = canvas[0];
	}));
}



Main.onChange(CST.CHANGE.screenEffectAdd,function(main,data){
	for(var i = 0 ; i < data.length; i++)
		Main.addScreenEffect(main,data[i]);
});

Main.onChange(CST.CHANGE.screenEffectRemove,function(main,data){
	for(var i = 0 ; i < data.length; i++)
		Main.removeScreenEffect(main,data[i]);
});

var LOW_LIFE_FRAME = 0;
var LOW_LIFE_CYCLE = 25;
var LOW_LIFE_ACTIVE = false;
var LOW_LIFE_ALPHA_MOD = 1;

Main.screenEffect.drawLowLife = function(ctx){ //red splash BAD name
	var frame = LOW_LIFE_FRAME % LOW_LIFE_CYCLE;
	if(frame > LOW_LIFE_CYCLE/2) 
		frame = LOW_LIFE_CYCLE-frame;
	var alpha = frame / LOW_LIFE_CYCLE / 2; //0-0.25
	alpha *= LOW_LIFE_ALPHA_MOD;
	alpha += 0.05;	//optional
	Main.addScreenEffect(w.main,Main.ScreenEffect.filter('lowlife','rgba(255,0,0,' + alpha + ')'));
}
Main.screenEffect.drawLowLife.loop = function(){
	if(LOW_LIFE_ACTIVE)
		LOW_LIFE_FRAME++;
	
	if(LOW_LIFE_FRAME > LOW_LIFE_CYCLE){	//stop it
		Main.removeScreenEffect(w.main,'lowlife');
		LOW_LIFE_ACTIVE = false;
		LOW_LIFE_FRAME = 0;
	}
	
	var pct = w.player.hp / w.player.hpMax;
	if(!LOW_LIFE_ACTIVE){
		if(pct < 1/10)
			Main.screenEffect.drawLowLife.set(17,1);
		else if(pct < 1/8)
			Main.screenEffect.drawLowLife.set(25,1);
		else if(pct < 1/6)
			Main.screenEffect.drawLowLife.set(33,1);
		else if(pct < 1/5)
			Main.screenEffect.drawLowLife.set(40,1);
		else if(pct < 1/4)
			Main.screenEffect.drawLowLife.set(50,1);
	}
}
Main.screenEffect.drawLowLife.set = function(frame,alpha){
	if(LOW_LIFE_ACTIVE)	//must wait..
		return;
	LOW_LIFE_CYCLE = frame;
	LOW_LIFE_FRAME = 0;
	LOW_LIFE_ACTIVE = true;
	LOW_LIFE_ALPHA_MOD = alpha;
}

Main.screenEffect.drawLowLife.draw = function(ctx){
	if(LOW_LIFE_ACTIVE)
		Main.screenEffect.drawLowLife(ctx);
}

})(); //{
