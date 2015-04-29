//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Dialog = require4('Dialog'), Input = require4('Input'), LightingEffect = require4('LightingEffect'), MapModel = require4('MapModel'), Anim = require4('Anim'), Drop = require4('Drop'), Actor = require4('Actor'), Strike = require4('Strike'), Bullet = require4('Bullet'), Main = require4('Main');

var Draw = exports.Draw = {};

Draw.init = function(){
	Dialog.UI('stage',{
		position:'absolute',
		left:0,
		top:0,
		width:'100%',
		height:'100%',
		zIndex:Dialog.ZINDEX.LOW,
	},Dialog.Refresh(function(html,variable){
		var canvas = $('<canvas>')
			.css({
				top:0,
				left:0,
				width:CST.WIDTH,
				height:CST.HEIGHT,
				border:'4px solid #000000',
				background:'rgba(0,0,0,1)',
			})
			.attr({
				width:CST.WIDTH,
				height:CST.HEIGHT,
			})
			.click(function(){
				Dialog.chat.blurInput();
			});
			
		html.append(canvas);
		
		Input.callOnResize(canvas);
		Tk.smoothCanvas(canvas);
		var ctx = canvas[0].getContext("2d");
		ctx.font = '20px Kelly Slab';
		ctx.fillStyle = 'black';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.save();
		variable.ctx = ctx;		
	},null,1,null,function(html,variable){	//loop
		// !main.hudState.minimap 
		Draw.loop(variable.ctx);
	}));

}
Draw.loop = function(ctx){
	ctx.clearRect(0, 0, CST.WIDTH, CST.HEIGHT);
	LightingEffect.loop();	//BAD
	//Draw
	
	MapModel.draw(ctx,'b');   //below player
	
	Anim.drawAll(ctx,'b');  //below player
	
	
	var context = Drop.drawAll(ctx);
	context = Actor.drawAll(ctx) || context;
	
	Dialog.quickContextRefresh(context);
	
	Strike.drawAll(ctx);	
	Bullet.drawAll(ctx);
	Anim.drawAll(ctx,'a');  //above player
	MapModel.draw(ctx,'a');   //above player
	Actor.drawChatHead(ctx);
	
	Main.screenEffect.loop(main,ctx);
	
	
	
}


})();



	










