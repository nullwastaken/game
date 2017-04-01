
"use strict";
(function(){ //}
var AttackModel;
global.onReady(function(){
	AttackModel = rootRequire('shared','AttackModel');
	AttackModel.onCreate(CST.ENTITY.bullet,BulletModel.create);
});
var BulletModel = exports.BulletModel = function(extra,addDefaultStatus){
	AttackModel.call(this,null,addDefaultStatus);
	
	this.type = CST.ENTITY.bullet; 
	this.timer = 0;
	this.pierce = null;	//ActorModel.Pierce
	this.maxTimer = CST.BULLET_MAXTIMER;
	this.spd = 10;
	this.onMove = null;	//ActorModel.OnMove
	this.boomerang = null;	//ActorModel.Boomerang
	this.parabole = null;	//ActorModel.Parabole
	this.sin = null;	//ActorModel.Sin
	this.sprite = AttackModel.Sprite('fireball');
	this.crX = 0;	//creation X, used for parabole and sin
	this.crY = 0;
	
	Tk.fillExtra(this,extra);

};

BulletModel.create = function(extra,addDefaultStatus){
	return new BulletModel(extra,addDefaultStatus);
}


})(); //{









