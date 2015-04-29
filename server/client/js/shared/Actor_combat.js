//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Preset = require2('Preset');
var Actor = require3('Actor');
Actor.setCombatContext = function(act,what,type,reset){
	act.combatContext[what] = type;
	if(what === 'ability'){
		if(reset){
			act.abilityList[type] = {};
			act.ability[type] = Actor.Ability.Part();
		}
		act.abilityChange = Actor.AbilityChange(act.abilityList[type]);
		Actor.setFlag(act,'ability');
		Actor.setFlag(act,'abilityList');
	}
	if(what === 'equip'){
		if(reset) act.equip[type] = Actor.Equip.Part();
		Actor.equip.update(act);	//act.flag.equip set there
	}
}

Actor.addHp = function(act,amount){
	Actor.resource.add(act,amount);
}
Actor.setHp = function(act,amount){
	var num = amount - act.hp;
	Actor.resource.add(act,num);
}

Actor.fullyRegen = function(act){
	act.hp = act.hpMax;
	act.mana = act.manaMax;
}

Actor.changeResource = function(act,heal){
	Actor.resource.add(act,heal.hp,heal.mana);
}

Actor.getMasteryValue = function(act,what,element,useMod){
	if(!useMod)
		return act.mastery[what][element].value;
	return act.mastery[what][element].value * act.mastery[what][element].mod;		
}
Actor.turnImmune = function(act,element){
	act.mastery.def[element].value = CST.bigInt;
}
	
				

Actor.resource = {};
Actor.resource.loop = function(act){
	if(!Actor.testInterval(act,5)) return;
	Actor.resource.add(act,act.hpRegen*5,act.manaRegen*5);	
}

Actor.resource.add = function(act,hp,mana){
	if(typeof hp === 'string')
		return ERROR(3,'no longer supported');
	act.hp = Math.min(act.hpMax,act.hp + (hp || 0));
	act.mana = Math.min(act.manaMax,act.mana + (mana || 0));
}


Actor.getDef = function(act){
	var defratio = Actor.getEquip(act).def;
	var def = {
		main:act.globalDef,
		ratio:Tk.deepClone(defratio)
	};
	for(var i in def.ratio){
		def.ratio[i] *= Actor.getMasteryValue(act,'def',i,true);
		def.ratio[i].mm(1);
	}
	return def;
}

Actor.dodge = function(act,time,dist){
	
	Actor.becomeInvincible(act,time);
	
	//movement
	Actor.movePush(act,act.angle,dist/time,time)
	Actor.setSpriteFilter(act,Actor.SpriteFilter('dodge',time+5));
}

Actor.becomeInvincible = function(act,time){
	if(!time) return;
	
	//invincibility
	if(!Actor.becomeInvincible.HISTORY[act.id])
		Actor.becomeInvincible.HISTORY[act.id] = act.damagedIf;
	
	act.damagedIf = 'false';
	
	Actor.setTimeout(act,function(){
		act.damagedIf = Actor.becomeInvincible.HISTORY[act.id];
		delete Actor.becomeInvincible.HISTORY[act.id];
	},time,'actor.invincible');
}
Actor.becomeInvincible.HISTORY = {};	//BADDDDD

Actor.enablePvp = function(act,enable){
	if(enable){
		act.damageIf = 'true';
		act.damagedIf = 'true';
		act.pvpEnabled = true;
	} else {
		act.damageIf = 'npc';
		act.damagedIf = 'npc';
		act.pvpEnabled = false;
	}
	Actor.setFlag(act,'pvpEnabled');
}


Actor.rechargeAbility = function(act){
	Actor.ability.fullyRecharge(act);
}


//Preset
Actor.addPreset = function(act,name,s){
	act.preset[name] = Preset.get(name);
	Actor.updatePreset(act,s);
}

Actor.removePreset = function(act,name,s){
	delete act.preset[name];
	Actor.updatePreset(act,s);
}

Actor.updatePreset = function(act,s){
	var key = act.id;
	
	var reputation = true;
	var ability = true;
	var pvp = act.pvpEnabled;
	var combat = true;
	
	for(var i in act.preset){
		if(act.preset[i].noReputation)
			reputation = false;
		if(act.preset[i].noAbility)
			ability = false;
		if(act.preset[i].pvp)
			pvp = true;
		if(act.preset[i].noCombat)
			combat = false;
	}
	s.enableReputation.one(key,reputation); 
	s.enableAttack.one(key,ability); 	
	s.enablePvp.one(key,pvp); 
	s.enableCombat.one(key,combat); //case quest isAlwaysActive???
	
	var ability = false;	
	for(var i in act.preset){
		var preset = act.preset[i];
		if(preset.ability){
			Actor.setCombatContext(act,'ability','quest',true);
			for(var i = 0 ; i < preset.ability.length; i++){
				if(preset.ability[i]){
					Actor.addAbility(act,preset.ability[i]); 	//based on s.addAbility.one
					Actor.swapAbility(act,preset.ability[i],i);
				}
			}
			s.rechargeAbility(act.id);
			ability = true;
			break;
		}
	}
	if(!ability)
		Actor.setCombatContext(Actor.get(key),'ability','normal');
	
	
	var equip = false;	
	for(var i in act.preset){
		var preset = act.preset[i];
		if(preset.equip){
			Actor.setCombatContext(act,'equip','quest',true);
			for(var i in preset.equip){
				if(preset.equip[i]){
					Actor.changeEquip(act,preset.equip[i]);	//based on s.addEquip.one
				}
			}
			equip = true;
			break;
		}
	}
	if(!equip)
		Actor.setCombatContext(Actor.get(key),'equip','normal');
	
}

})(); //{
















