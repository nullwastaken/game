
"use strict";
(function(){ //}
var Main, MapModel;
global.onReady(function(){
	MapModel = rootRequire('shared','MapModel',true); Main = rootRequire('shared','Main',true);
});
var LightingEffect = exports.LightingEffect = function(extra){
	this.radiusInside = 0;
	this.radiusOutside = 50;
	this.color = [];
	Tk.fillExtra(this,extra);
};

var LIST = LightingEffect.LIST = [];

LightingEffect.create = function(radiusInside,radiusOutside,color){
	return new LightingEffect({
		radiusInside:radiusInside,
		radiusOutside:radiusOutside,
		color:color
	});
}

LightingEffect.Color = function(num,color){
	return {num:num,color:color};
}

LightingEffect.reset = function(){
	LIST = [];
}

LightingEffect.modifyColor = function(le,func){
	for(var i = 0 ; i < le.color.length ; i++){
		var color = Tk.rgbaToObject(le.color[i].color);
		func(color,i);			
		le.color[i].color = Tk.rgbaToString(color);
	}
}

LightingEffect.getEntityGlow = function(){
	return GLOW;
}

LightingEffect.isActive = function(){
	return Main.getPref(w.main,'enableLightingEffect') && MapModel.getCurrent().lightingEffect;
}

LightingEffect.drawEntity = function(le,ctx,x,y,sizeMod,realX,realY){
	if(!LightingEffect.isActive())
		return;
	
	sizeMod = sizeMod || 1;
	LIST.push({
		lightingEffect:le,
		x:realX || x,	//realX and realY for canvasRotate
		y:realY || y,
		sizeMod:sizeMod,
	});
	
	LightingEffect.draw(le,ctx,x,y,sizeMod,'lighter');
}

LightingEffect.draw = function(le,ctx,x,y,sizeMod,globalCompositeOperation){	//only draw, nothing else
	if(!LightingEffect.isActive())
		return;
	ctx.save();
	
	sizeMod = sizeMod || 1;
	
	var radiusOutside = le.radiusOutside * sizeMod;
	var radiusInside = le.radiusInside * sizeMod;
	
	var grd = ctx.createRadialGradient(
		x,y,radiusInside,
		x,y,radiusOutside
	);
	
	for(var i = 0 ; i < le.color.length; i++){
		grd.addColorStop(le.color[i].num,le.color[i].color);
	}
	
	ctx.fillStyle = grd;
	if(globalCompositeOperation)
		ctx.globalCompositeOperation = globalCompositeOperation;
	ctx.fillRect(x-radiusOutside,y-radiusOutside,radiusOutside*2,radiusOutside*2);
	
	ctx.restore();
}

LightingEffect.modifyMaskCanvas = function(ctx){
	if(!LightingEffect.isActive())
		return;
	for(var i = 0 ; i < LIST.length; i++){
		var ar = LIST[i];
		LightingEffect.draw(ar.lightingEffect,ctx,ar.x,ar.y,ar.sizeMod*2,'xor');	
	}
}

var GLOW = LightingEffect.create(15,50,[
	LightingEffect.Color(0,'rgba(255,255,122,0.25)'),
	LightingEffect.Color(1,'rgba(255,255,122,0)'),
]);

})(); //{




