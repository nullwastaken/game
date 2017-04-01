
"use strict";
(function(){ //}
var Entity, Main, Attack, Maps, StrikeModel, Actor, Combat, Collision;
global.onReady(function(){
	Collision = rootRequire('shared','Collision'); Combat = rootRequire('server','Combat'); Actor = rootRequire('shared','Actor'); StrikeModel = rootRequire('shared','StrikeModel'); Maps = rootRequire('server','Maps'); Attack = rootRequire('shared','Attack'); Entity = rootRequire('shared','Entity'); Main = rootRequire('shared','Main');
	Entity.onPackReceived(Entity.TYPE.strike,Strike.createFromInitPack);
	Attack.onCreate(CST.ENTITY.strike,Strike.create);
	if(SERVER)
		global.onLoop(Strike.loop);
});
var Strike = exports.Strike = function(extra,act,custom){
	StrikeModel.call(this);
	Attack.call(this,null,act,custom)
	
	Tk.fillExtra(this,extra);
}

//need to remove player.bonus to pre-atk
Strike.create = function(model,act,custom){
	var s = new Strike(model,act,custom);
	//make sure s.x and s.y is not thru wall
		
	//after that, we place 9 points around (s.x,s.y). exact position depends on width and height of strike
	s.point = Strike.getPoint(s);
	s.rotatedRect = Strike.getRotatedRect(s,s.point);
	
	Strike.addToList(s);
	
	Entity.addToList(s);
	Maps.addToEntityList(Maps.get(s.map),s.type,s.id);
	
	return s;
}

Strike.loop = function(){
	for(var i in LIST)
		Strike.loop.forEach(LIST[i]);
}

Strike.loop.forEach = function(s){
	if(!s.damageOverTime){
		Strike.onDamagePhase(s);
		Strike.remove(s);
	} else {
		if(s.damageOverTime.currentTime % s.damageOverTime.interval === 0)
			Strike.onDamagePhase(s);
		if(++s.damageOverTime.currentTime >= s.damageOverTime.duration)
			Strike.remove(s);	
	}		
}

Strike.onDamagePhase = function(s){
	var list = Maps.getActorInMap(Maps.get(s.map),true);
	var hit = false;
	for(var j in list){
		var act2 = Actor.get(j);
		if(Collision.testStrikeActor(s,act2)){
			Combat.onCollision(s,act2);
			hit = true;
			if(--s.maxHit <= 0) 
				break;	//can not longer hit someone
		}
	}
	var parent = Actor.get(s.parent);
	if(parent && parent.type === CST.ENTITY.player)
		Main.addBasicShakeScreenEffect(Actor.getMain(parent),hit ? 2 : 1);
		
	if(s.onDamagePhase && s.onDamagePhase.chance >= Math.random())
		Combat.attack(s,s.onDamagePhase.attack);
}

Strike.getRotatedRect = function(s,point){
	return {	//BAD CST.rotRect?
		x:point[0].x,y:point[0].y,width:s.width,height:s.height,angle:s.angle,
	};
}

Strike.getPoint = function(s){
	var startX = -s.width/2; 
	var startY = -s.height/2;
		
	var pt = [];
	for(var k = 0 ; k < 9 ; k++){
		var axeX = startX + (k % 3)*s.width/2;
		var axeY = startY + Math.floor(k/3)*s.height/2;
		var numX = (axeX*Tk.cos(s.angle) - axeY * Tk.sin(s.angle));
		var numY = (axeX*Tk.sin(s.angle) + axeY * Tk.cos(s.angle));

		pt[k] = CST.pt(numX + s.x,numY + s.y);
	}
	return pt;
}	

var LIST = Strike.LIST = {};

Strike.remove = function(strike){
	if(typeof strike === 'string') 
		strike = LIST[strike];
	Entity.clear(strike);
	if(SERVER)
		Maps.removeFromEntityList(Maps.get(strike.map),strike.type,strike.id);
	Strike.removeFromList(strike.id);
	Entity.removeFromList(strike.id);
	
}

Strike.doInitPack = function(obj){
	var p = obj.point;
	var r = Math.round;
	
	return [
		Entity.TYPE.strike,
		obj.delay,
		r(p[0].x),r(p[0].y),
		r(p[2].x),r(p[2].y),
		r(p[8].x),r(p[8].y),
		r(p[6].x),r(p[6].y),
	];
}

Strike.undoInitPack = function(obj,id){
	var st = new Strike({
		type:CST.ENTITY.strike,
		id:id,
		delay:obj[1],
		point:[
			CST.pt(obj[2],obj[3]),
			CST.pt(obj[4],obj[5]),
			CST.pt(obj[6],obj[7]),
			CST.pt(obj[8],obj[9]),
		],	
	});
	return st;
}

Strike.createFromInitPack = function(obj,id){
	var b = Strike.undoInitPack(obj,id);
	Strike.addToList(b);
	Entity.addToList(b);
}

Strike.addToList = function(bullet){
	LIST[bullet.id] = bullet;
}

Strike.removeFromList = function(id){
	delete LIST[id]; 
}

Strike.drawAll = function(ctx){	//unused cuz no longer send strike info to client
	if(!Main.getPref(w.main,'displayStrike')) 
		return;
	
	ctx.fillStyle = 'red';
	for(var i in LIST){
		var s = LIST[i];
		var p = s.point;
		
		var x = Tk.absToRel.x(0);
		var y = Tk.absToRel.y(0);
		
		ctx.globalAlpha = Math.min(0.5,1/Math.abs(s.delay));
		
		ctx.beginPath();
		ctx.moveTo(x+p[0].x,y+p[0].y);
		ctx.lineTo(x+p[1].x,y+p[1].y);
		ctx.lineTo(x+p[2].x,y+p[2].y);
		ctx.lineTo(x+p[3].x,y+p[3].y);
		ctx.lineTo(x+p[0].x,y+p[0].y);
		ctx.closePath();
		ctx.fill();
		
		if(--s.delay < -4) 
			Entity.removeAny(s);
	}
	ctx.fillStyle = 'black';
	ctx.globalAlpha = 1;	
}

})();


