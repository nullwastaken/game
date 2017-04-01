
"use strict";
(function(){ //}
var AttackModel;
global.onReady(function(){
	AttackModel = rootRequire('shared','AttackModel');
	AttackModel.onCreate(CST.ENTITY.strike,StrikeModel.create);
});
var StrikeModel = exports.StrikeModel = function(extra,addDefaultStatus){
	AttackModel.call(this,null,addDefaultStatus);
	
	this.type = CST.ENTITY.strike; 

	this.width = 25;
	this.height = 25;
	this.onDamagePhase = null;	//AttackModel.OnDamagePhase call another attack when strike goes live
	this.maxHit = 5;
	this.preDelayAnim = null;	//Anim.Base
	this.postDelayAnim = null;	//Anim.Base
	this.point = [];	//CST.pt[]
	this.rotatedRect = null;
	
	Tk.fillExtra(this,extra);
};
StrikeModel.create = function(extra,addDefaultStatus){
	return new StrikeModel(extra,addDefaultStatus);
}

})(); //{









