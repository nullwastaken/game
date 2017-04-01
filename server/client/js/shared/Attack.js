
"use strict";
(function(){ //}
var Actor, Entity, Collision, AttackModel;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Entity = rootRequire('shared','Entity'); Collision = rootRequire('shared','Collision'); AttackModel = rootRequire('shared','AttackModel');
});
var Attack = exports.Attack = function(extra,act,custom){
	Entity.call(this);
	
	this.toRemove = false;
	this.hitId = Math.randomId();
	this.combat = true;
	this.timer = 0;
	this.mouseX = 0;
	this.mouseY = 0;
	this.damageIf = CST.DAMAGE_IF.player;
	this.parent = null;	//string?
	this.angle = 0;
	this.crAngle = 0;
	this.moveAngle = 0;	//where bullet moves (used for knock, boomerang)
	this.num = 0;	//-th bullet if many shoot at once
	this.normal = true;	//for movement, get set inside creation
	this.bonus = null;	//Actor.Bonus
	this.mastery = null;	//Actor.Mastery
	this.globalDmg = 0;
	this.combatContext = null;	//Actor.CombatContext
	this.equip = null;		//Actor.Equip
	
	this.frameLate = 0;	//client
	this.boostedSpd = false;
	Tk.fillExtra(this,extra);
	//
	
	if(act || custom){
		this.x = custom.x;
		this.y = custom.y;
		this.crX = custom.x;
		this.crY = custom.y; 			//creation Y, used for parabole and sin
		this.mouseX = act.mouseX;	//strike and parabole
		this.mouseY = act.mouseY;
		this.map = act.map;
		this.mapModel = act.mapModel;
		this.viewedIf = act.viewedIf;
		this.damageIf = act.damageIf;
		this.parent = act.parent || act.id;
		this.angle = custom.angle;
		this.crAngle = custom.angle;
		this.moveAngle = custom.angle;
		this.num = custom.num;
		this.normal = false;
		this.globalDmg = act.globalDmg;
		this.bonus = act.bonus || ERROR(3,'shouldnt need bonus',act.name) || Actor.Bonus();
		this.mastery = act.mastery || ERROR(3,'shouldnt need Mastery',act.name) || Actor.Mastery();
		this.combatContext = act.combatContext || ERROR(3,'shouldnt need combatContext',act.name)  || Actor.CombatContext();
		this.equip = act.equip || ERROR(3,'shouldnt need equip',act.name) || Actor.Equip();
	}
};

Attack.create = function(model,act,extra){
	return Attack.onCreate.pub(model.type,model,act,extra);
}; 

Attack.onCreate = Tk.newPubSub(true);

Attack.getInitPosition = function(atk,act){
	var mouse = Actor.getMouse(act);
	var diff = Math.pyt(mouse.x,mouse.y); //difference between actor and mouse
	
	diff = Math.min(Math.max(diff,atk.initPosition.min),atk.initPosition.max);
	
	var goal = CST.pt(diff * Tk.cos(act.angle) + act.x,diff * Tk.sin(act.angle) + act.y);
	
	if(!SERVER) return goal;
	
	var pos = atk.ghost ? goal : Collision.getFarthestStrikePosition(act,goal);	//get farthest possible without touching wall
	if(pos.collision){	//check Collision.getFarthestStrikePosition
		atk.dmg = AttackModel.Dmg(0,1,0,0,0,0,0);
		atk.hitAnim = null;
	}
	return pos;
}


			
})(); //{
		


