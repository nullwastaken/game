//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Sprite = require2('Sprite'), Actor = require2('Actor');

var ActorModel = exports.ActorModel = {};
ActorModel.create = function(id,info){
	var tmp = {
		modelId:id,
		alwaysActive:0,
		type:'npc',
		combatType:'npc',
		mastery:Actor.Mastery(),
		awareNpc:0,
		hp:1000,	
		hpMax:1000,
		hpRegen:25/25,
		mana:100,
		manaMax:100,
		manaRegen:20/25,
		abilityList:Actor.AbilityList(),
		friction:CST.FRICTIONNPC,
		bounce:1,			//mod
		move:1,
		model:"Qsystem-bat",   //for enemy
		lvl:0,
		name:"Goblin",     //visible name
		minimapIcon:'color-red',     //icon used for minimap
		quest:'',
		sprite:Sprite.create(Actor.DEFAULT_SPRITENAME,1),
		moveRange:Actor.MoveRange(),
		useUpdateInput:true, 		//generate its own input	(ex: pushable dont but still move)
		useMouseForMove:false,
		nevercombat:0,
		boss:'',
		ability:Actor.Ability(),
		
		preventStagger:false,
		globalDef:1,
		globalDmg:1,   //global modifier
		aim:0,       //difference between mouse and actually bullet direction
		atkSpd:1,	
		ghost:0,
		nevermove:0,
		maxSpd:CST.NPCSPD,	
		acc:CST.PLAYERACC,
		immune:{},
		abilityAi:Actor.AbilityAi(),	
		interactionMaxRange:100,
		waypoint:null, 		//right click:setRespawn
		combat:1,
		damageIf:'player',
		damagedIf:'true',
		targetIf:'player',  //condition used by monsters to find their target. check targetIfList
		statusResist:Actor.StatusResist(),
		pvpEnabled:false,
		pickRadius:250,	
		targetSetting:Actor.TargetSetting(),
		block:null,
		angle:1,
		bank:0,
		pushable:null,
		
		//BAD
		combatContext:Actor.CombatContext(),		//only there cuz need it to access ability... -.-
		flag:Actor.Flag(),
		globalMod:null,
		hideOptionList:false,
	}
	for(var i in info){
		if(tmp[i] === undefined) return ERROR(4,'prop undefined',i);
		tmp[i] = info[i];
	}
	if(!SERVER) return tmp;
	
	DB[id] = tmp;
	
	return tmp;
}
var DB = ActorModel.DB ={};

ActorModel.init = function(){
	DB['player'] = ActorModel.create('player',{
		type:"player",
		preventStagger:true,
		combatType:'player',
		damageIf:'npc',
		damagedIf:'npc',
		targetIf:'npc',	//important for summon
		awareNpc:1,
		alwaysActive:1,
		minimapIcon:'color-yellow',
		pickRadius:250,
		useUpdateInput:false,
		useMouseForMove:false,
		maxSpd:CST.PLAYERSPD,
		friction:CST.FRICTION,
		acc:CST.PLAYERACC,
	});
}
ActorModel.get = function(id){
	return DB[id] || null;
}



})();

