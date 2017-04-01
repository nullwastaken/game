
"use strict";
(function(){ //}
var Main, Dialog;
global.onReady(function(){
	Main = rootRequire('shared','Main',true); Dialog = rootRequire('client','Dialog',true);
},null,SERVER ? '' : 'ParticleEffect',['Dialog'],function(){
	ParticleEffect.init.call(this);
});
var ctx, canvas;
var RENDERER = null;

var ParticleEffect = exports.ParticleEffect = function(extra){
	this.emitter = null;	//Proton.Emitter
	this.updatePosition = null;	//function(emitter)
	this.id = Math.randomId.num();
	this.toRemove = false;
	Tk.fillExtra(this,extra);
};

var proton = ParticleEffect.proton = null;
var QUANTITY_MOD = 1;
var LIFE_MOD = 1;

var BASE_RADIUS = 5;
var FRAME = 0;
ParticleEffect.create = function(func,updatePosition,once){
	if(RENDERER === null)
		return ERROR(3,'renderer is null');
	
	var emitter = new Proton.Emitter();
	func(emitter);
	
	
	var p = new ParticleEffect({
		emitter:emitter,
		updatePosition:updatePosition,
	});
	if(updatePosition)
		updatePosition(emitter);
	
	proton.addEmitter(emitter);
	
	if(once)
		TO_EMIT_ONCE.push(p);
	else
		emitter.emit();
	
	LIST[p.id] = p;
	
	return p;
}

var LIST = ParticleEffect.LIST = {};

ParticleEffect.ACTIVE = true;

var TO_EMIT_ONCE = [];

ParticleEffect.drawAll = function(ctx){
	if(!ParticleEffect.ACTIVE)
		return;
	
	for(var i = 0 ; i < TO_EMIT_ONCE.length; i++){
		TO_EMIT_ONCE[i].emitter.emit('once',true);
		TO_EMIT_ONCE[i].toRemove = true;
	}
	TO_EMIT_ONCE = [];
	
	for(var i in LIST){
		var p = LIST[i];
		if(p.updatePosition){
			var remove = p.updatePosition(p.emitter);
			if(remove)
				ParticleEffect.remove(p);
		}
		if(LIST[i].toRemove && p.emitter.particles.length === 0){
			proton.removeEmitter(p.emitter);
			delete LIST[p.id];
		}
	}
	
	if(FRAME++ % 5 === 0){
		var count = ParticleEffect.getParticleCount();
		var MAX_MOD = Main.getPref(w.main,'maxParticleMod') / 100;
		QUANTITY_MOD = Math.min(1,0.25+MAX_MOD);
		LIFE_MOD = 1;
		if(count >= 50*MAX_MOD)
			QUANTITY_MOD = 0.5;
		if(count >= 100*MAX_MOD)
			QUANTITY_MOD = 0.3;
		if(count >= 200*MAX_MOD){
			QUANTITY_MOD = 0.2;
			LIFE_MOD = 0.8;
		}
		if(count >= 500*MAX_MOD){
			QUANTITY_MOD = 0.1;
			LIFE_MOD = 0.5;
		}
		if(count >= 1000*MAX_MOD){
			QUANTITY_MOD = 0;
			if(FRAME % 10 === 0)
				return;
		}		
	}
	
	ctx.save();
	if(Main.getPref(w.main,'enableLightingEffect') && QUANTITY_MOD >= 0.3)
		ctx.globalCompositeOperation = 'lighter';
	proton.update();
	ctx.restore();
}

ParticleEffect.remove = function(p,particleToo){
	p.toRemove = true;
	p.emitter.stopEmit();
}

ParticleEffect.removeAll = function(p,particleToo){
	for(var i in LIST)
		ParticleEffect.remove(LIST[i],particleToo !== false);
}

ParticleEffect.init = function(){
	canvas = Dialog.getStageCanvas()[0];
	ctx = canvas.getContext('2d');

	proton = ParticleEffect.proton = new Proton();
	RENDERER = new Proton.Renderer('canvas', proton, canvas);
	RENDERER.start();
}

ParticleEffect.Model = function(color,quantity,size,frequency,life){
	var base = {
		color:'#ffffff',
		quantity:1,
		frequency:1,
		life:1,
		size:1,
	};
	Tk.fillExtra(base,{
		color:color,
		quantity:quantity,
		frequency:frequency,
		life:life,
		size:size,
	});
	return base;
}

ParticleEffect.applyModel = function(emitter,model,size,x,y){
	emitter.rate = new Proton.Rate(new Proton.Span(2*model.quantity*QUANTITY_MOD, 5*model.quantity*QUANTITY_MOD), new Proton.Span(0.05*model.frequency, 0.1*model.frequency));
	
	emitter.addInitialize(new Proton.Mass(1));
	emitter.addInitialize(new Proton.V(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));
	emitter.addBehaviour(new Proton.Alpha(0.5, 0));
	emitter.addBehaviour(new Proton.Scale(1, 0));
	
	emitter.addInitialize(new Proton.Life(0.5*model.life*LIFE_MOD, 1*model.life*LIFE_MOD));
		
	emitter.addBehaviour(new Proton.Color(model.color));
	
	size = size !== undefined ? size : 1; 
	emitter.addInitialize(new Proton.Radius(BASE_RADIUS * model.size * size));
		
	if(x !== undefined)
		emitter.p.x = x;
	if(y !== undefined)
		emitter.p.y = y;
}

var CACHE_COUNT = 0;
ParticleEffect.getParticleCount = function(useCache){
	if(useCache)
		return CACHE_COUNT;
	CACHE_COUNT = proton.getCount();
	return CACHE_COUNT;
}


ParticleEffect.setSizeMod = function(emitter,size){
	emitter.addInitialize(new Proton.Radius(BASE_RADIUS*size));
}

//subemitter.addBehaviour(new Proton.RandomDrift(10, 10, .05));

})(); //{




