
"use strict";
(function(){ //}
var Input, MapModel, LightingEffect, Anim, Drop, Actor, Strike, Bullet, Main, ParticleEffect;
global.onReady(function(){
	ParticleEffect = rootRequire('shared','ParticleEffect',true); Input = rootRequire('server','Input',true); MapModel = rootRequire('server','MapModel',true); LightingEffect = rootRequire('shared','LightingEffect',true); Anim = rootRequire('server','Anim',true); Drop = rootRequire('shared','Drop',true); Actor = rootRequire('shared','Actor',true); Strike = rootRequire('shared','Strike',true); Bullet = rootRequire('shared','Bullet',true); Main = rootRequire('shared','Main',true);
	global.onLoopDraw(drawStage);
});
var Dialog = rootRequire('client','Dialog');
var ctx, canvas;
Dialog.UI('stage',null,{
	position:'absolute',
	left:0,
	top:0,
	width:'100%',
	height:'100%',
	zIndex:Dialog.ZINDEX.LOW,
},Dialog.Refresh(function(html,variable){
	canvas = Tk.createSharpCanvas(CST.WIDTH,CST.HEIGHT)
		.css({
			top:0,
			left:0,
			border:'4px solid #000000',
			background:'rgba(0,0,0,1)',
		})
		.click(function(){
			Dialog.chat.blurInput();
		});
		
	html.append(canvas);
	
	Input.callOnResize(canvas);
	
	ctx = canvas[0].getContext("2d");
	ctx.font = CST.FONT;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.save();
}));
Dialog.getStageCanvas = function(){
	return canvas;
}
Dialog.getStageCtx = function(){
	return ctx;
}

var drawStage = function(){	//loop
	// !w.main.hudState.minimap 
	ctx.clearRect(0, 0, CST.WIDTH, CST.HEIGHT);
	LightingEffect.reset();
	
	MapModel.drawAll(ctx,CST.LAYER.below);   //below player
	
	Anim.drawAll(ctx,CST.LAYER.below);  //below player
	
	
	var context = Drop.drawAll(ctx);
	context = Actor.drawAll(ctx) || context;
	
	if(Dialog.isMouseOverDialog())
		Dialog.quickContextRefresh('');
	else 
		Dialog.quickContextRefresh(context && context.text);
	
	
	ParticleEffect.drawAll(ctx);
	Strike.drawAll(ctx);
	Bullet.drawAll(ctx);
	Anim.drawAll(ctx,CST.LAYER.above);
	MapModel.drawAll(ctx,CST.LAYER.above);
	Actor.drawChatHead(ctx);
	
	Main.screenEffect.draw(w.main,ctx);
	
	
	//drawLayout(ctx);
	
	
}

var drawLayout = function(ctx){
	if(!ctx)
		return;
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(CST.WIDTH,CST.HEIGHT);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(CST.WIDTH,0);
	ctx.lineTo(0,CST.HEIGHT);
	ctx.stroke();
	
	//
	
	ctx.beginPath();
	ctx.moveTo(CST.WIDTH/2,0);
	ctx.lineTo(CST.WIDTH/2,CST.HEIGHT);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(0,CST.HEIGHT/2);
	ctx.lineTo(CST.WIDTH,CST.HEIGHT/2);
	ctx.stroke();
	
	
	ctx.beginPath();
	ctx.moveTo(CST.WIDTH/2-200,CST.HEIGHT/2-200);
	ctx.lineTo(CST.WIDTH/2+200,CST.HEIGHT/2+200);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(CST.WIDTH/2+200,CST.HEIGHT/2-200);
	ctx.lineTo(CST.WIDTH/2-200,CST.HEIGHT/2+200);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(CST.WIDTH/2+200,CST.HEIGHT/2-200);
	ctx.lineTo(CST.WIDTH/2-200,CST.HEIGHT/2+200);
	ctx.stroke();
}
drawLayout();	//so not unsued...



})();



	










