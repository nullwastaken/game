
"use strict";
(function(){ //}
var Sprite;
global.onReady(function(){
	Sprite = rootRequire('shared','Sprite');
});
var AttackModel = exports.AttackModel = function(extra,addDefaultStatus){
	this.type = CST.ENTITY.bullet;
	
	this.dmg = AttackModel.Dmg(0,1,0,0,0,0,0);
	this.hitAnim = null;	//Anim.Base, when enemy get hits, use anim on him {name,sizeMod}
	this.damageIfMod = false; //if true, hit allies
	this.amount = 1; //# bullets shot
	this.aim = 0;
	this.delay = 0;	//delay between cast and action
	this.angleRange = 5;
	this.bleed = null;	//AttackModel.Status
	this.knock = null;	//AttackModel.Status
	this.drain = null;	//AttackModel.Status
	this.burn = null;	//AttackModel.Status
	this.chill = null;	//AttackModel.Status
	this.stun = null;	//AttackModel.Status
	this.crit = AttackModel.Status(1,1,1); //100% will be multiplied by the 0.05 of player
	this.leech = AttackModel.Status(1,1,1);	 //100% will be multiplied by the 0.05 of player
	this.curse = null;	//AttackModel.Curse
	this.onHit = null; //AttackModel.OnHit
	this.onHitHeal = null; //AttackModel.OnHitHeal
	this.hitEvent = null; //function(key,shooterId)
	this.ghost = false;
	this.damageOverTime = null;	//AttackModel.DamageOverTime
	
	this.initPosition = AttackModel.InitPosition();
		
	Tk.fillExtra(this,extra);
	
	if(addDefaultStatus){
		AttackModel.addDefaultStatus(this);
		if(this.damageOverTime && this.damageOverTime.adjustDmg)
			this.dmg.main /= this.damageOverTime.duration / this.damageOverTime.interval;
	}
};

AttackModel.create = function(info,addDefaultStatus){
	return AttackModel.onCreate.pub(info.type,info,addDefaultStatus);
}
AttackModel.onCreate = Tk.newPubSub(true);

AttackModel.Parabole = function(height,min,max,timer){
	return {
		height:height*10,	//height of parabole (distance from middle)
		min:min*100,		//min distance where bullets will collide
		max:max*500,		//max distance where bullets will collide
		timer:timer*50,		//time before bullets collide
	}
}
AttackModel.Sin = function(amp,freq){
	return {
		amp:amp*1.5,
		freq:freq*15,
	}
}
AttackModel.Boomerang = function(comeBackTime,spd,spdBack,newId){
	return {
		comeBackTime:comeBackTime*15,//time before bullet turns 180 degre
		spd:spd*2,					//spd mod
		spdBack:spdBack*2,			//spd mod when bullet comes back
		newId:Tk.nu(newId,true),	//after turn back, renew id so it can hit enemy again
	}
}
AttackModel.Dmg = function(main,me,ra,ma,fi,co,li){
	if(typeof me === 'string')
		return ERROR(3,'me should be number');
	return {
		main:main || 0,
		ratio:CST.element.template(me,ra,ma,fi,co,li)
	};
}
AttackModel.Status = function(chance,magn,time){
	return {
		chance:chance || 0,
		magn:magn || 1,
		time:time || 1
	};
}
AttackModel.Pierce = function(chance,dmgReduc,amount){
	return {
		chance:chance || 0,
		dmgReduc:dmgReduc || 0.5,
		amount:amount || 5
	};
}	
AttackModel.OnMove = function(period,rotation,attack){
	return {
		period:period || 25,
		rotation:rotation || 0,
		attack:AttackModel.create(attack,true)
	};
}
AttackModel.Curse = function(chance,boost){
	return {
		chance:chance || 0,
		boost:boost || null
	};
}
AttackModel.OnHit = AttackModel.OnDamagePhase = function(chance,attack){
	return {
		chance:chance || 0,
		attack:AttackModel.create(attack,true) || ERROR(2,'no attack returned'),
	};
}
AttackModel.Sprite = function(name,sizeMod,lightingEffect){
	return Sprite.create(name,sizeMod,lightingEffect);
}
AttackModel.OnHitHeal = function(hp,mana){
	return {
		hp:hp||0,
		mana:mana||0,
	};
}
AttackModel.DamageOverTime = function(duration,interval,adjustDmg){
	return {
		duration:duration || 0,
		interval:interval || 1,	//dmg every x frame
		adjustDmg:adjustDmg || false,
		currentTime:0,
	}
}

//###################

AttackModel.addDefaultStatus = function(model){	//select 1st element, if no status, add 5% status default
	var el = AttackModel.getElement(model);
	var status = CST.element.toStatus[el];
	if(!model[status])
		model[status] = AttackModel.Status(0.05,1,1);
		
}

AttackModel.getElement = function(model){
	for(var el in model.dmg.ratio) 
		if(model.dmg.ratio[el]) return el;	
}

AttackModel.InitPosition = function(min,max){
	return {
		type:min === undefined ? CST.INIT_POSITION.actor : CST.INIT_POSITION.mouse,
		min:min || 0,
		max:max === undefined ? 50 : max,
	}
}



})(); //{

