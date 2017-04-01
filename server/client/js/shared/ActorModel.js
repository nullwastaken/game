
"use strict";
(function(){ //}
var Sprite, Actor;
global.onReady(function(){
	Sprite = rootRequire('shared','Sprite'); Actor = rootRequire('shared','Actor');
},null,'ActorModel',['SpriteModel'],function(){
	ActorModel.init();
});

var ActorModel = exports.ActorModel = function(extra){
	this.type = CST.ENTITY.npc;
	
	this.model = '';
	this.alwaysActive = false;
	this.combatType = CST.ENTITY.npc;
	this.mastery = Actor.Mastery();
	this.awareNpc = false;
	this.aggressive = false;
	this.hp = 1000;
	this.hpMax = 1000;
	this.hpRegen = 25/25;
	this.mana = 100;
	this.manaMax = 100;
	this.manaRegen = 20/25;
	this.abilityList = Actor.AbilityList();
	this.friction = CST.FRICTIONNPC;
	this.bounce = 1; //mod
	this.move = true;
	this.lvl = 0;
	this.name = '';
	this.cantDie = false;
	this.minimapIcon = 'color-red';	//HCODE
	this.quest = '';
	this.sprite = Sprite.create(Actor.SPRITE_NORMAL,1);
	this.moveRange = Actor.MoveRange();
	this.useUpdateInput = true;
	this.nevercombat = false;
	this.boss = '';
	this.ability = Actor.Ability();
	this.killRewardMod = 1;
	this.preventStagger = false;
	this.fixedPosition = false;	//nevermove => fixedPosition. but if fixedPosition and move=true, then can be staggered
	this.globalDef = 1;
	this.globalDmg = 1;
	this.aim = 0;
	this.atkSpd = 1;
	this.ghost = false;
	this.nevermove = false;
	this.maxSpd = CST.NPCSPD;
	this.acc = CST.NPCACC;
	this.immune = {};	//element:bool BAD
	this.abilityAi = Actor.AbilityAi();
	this.interactionMaxRange = 100;
	this.combat = true;
	this.damageIf = CST.DAMAGE_IF.player;
	this.damagedIf = CST.DAMAGE_IF.always;
	this.targetIf = CST.DAMAGE_IF.player; 
	this.statusResist = Actor.StatusResist();
	this.pvpEnabled = false;
	this.pickRadius = 250;
	this.targetSetting = Actor.TargetSetting();
	this.block = null;	//Actor.Block
	this.angle = 1;
	this.bank = false;
	this.pushable = null; //Actor.Pushable
	this.zone = '';	//set in parseActorExtra
	this.waypoint = null;
	this.combatContext = Actor.CombatContext();
	this.flag = {};	//string:function():any
	this.hideOptionList = false;
	this.bounceDmgMod = 1;
	this.delayBeforeAttack = 10;
	this.safeZoneRadius = 0;
	
	Tk.fillExtra(this,extra);
};

ActorModel.create = function(id,info){
	var tmp = new ActorModel(info);
	tmp.model = id;
	DB[id] = tmp;
	return tmp;
}
var DB = ActorModel.DB ={};

ActorModel.init = function(){
	ActorModel.create('player',{
		type:CST.ENTITY.player,
		combatType:CST.ENTITY.player,
		damageIf:CST.DAMAGE_IF.npc,
		damagedIf:CST.DAMAGE_IF.npc,
		targetIf:CST.DAMAGE_IF.npc,	//important for summon
		awareNpc:true,
		alwaysActive:true,
		minimapIcon:'color-yellow', //HCODE
		pickRadius:250,
		delayBeforeAttack:0,
		useUpdateInput:false,
		maxSpd:CST.PLAYERSPD,
		friction:CST.FRICTION,
		acc:CST.PLAYERACC,
	});
}
ActorModel.get = function(id){
	return DB[id] || null;
}



})();

