
"use strict";
(function(){ //}
var Preset, Main, Combat, Boost;
global.onReady(function(){
	Preset = rootRequire('server','Preset'); Boost = rootRequire('shared','Boost'); Main = rootRequire('shared','Main'); Combat = rootRequire('server','Combat');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.enablePvp,Command.ACTOR,[ //{
		Command.Param('boolean','Enable',false),
	],Actor.enablePvp.onCommand); //}
});
var Actor = rootRequire('shared','Actor');


Actor.setCombatContext = function(act,what,type,reset){
	if(reset && type !== 'quest')
		return ERROR(3,'can only reset for quest combat context');
	if(act.combatContext[what] === type && !reset)
		return;
	act.combatContext[what] = type;
	if(what === 'ability'){
		if(reset){
			act.abilityList[type] = {};
			act.ability[type] = Actor.Ability.Part();
		}
		act.abilityChange = Actor.AbilityChange(act.ability[type]);
		Actor.setFlagAbility(act);
	}
	if(what === 'equip'){
		if(reset) 
			act.equip[type] = Actor.Equip.Part();
		Actor.equip.update(act);	//act.flag.equip set there
	}
}

Actor.addHp = function(act,amount,addHistory){
	Actor.resource.add(act,amount);
	if(addHistory)
		Actor.addHitHistory(act,amount);
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
	act.mastery.def[element].value = CST.BIG_INT;
}
	
Actor.resource = {};
Actor.resource.loop = function(act){
	if(!Actor.testInterval(act,5)) return;
	Actor.resource.add(act,act.hpRegen*5,act.manaRegen*5);	
}

Actor.resource.add = function(act,hp,mana){
	if(hp)
		act.hp = Math.min(act.hpMax,act.hp + hp);
	if(mana)
		act.mana = Math.min(act.manaMax,act.mana + mana);
}

Actor.getDef = function(act){
	var defratio = Actor.getEquip(act).def;
	var def = {
		main:act.globalDef,
		ratio:Tk.deepClone(defratio)
	};
	for(var i in def.ratio){
		def.ratio[i] *= Actor.getMasteryValue(act,'def',i,true);
		def.ratio[i] = Math.max(def.ratio[i],1);
		
		if(isNaN(def.ratio[i])){
			def.ratio[i] = 1;
			ERROR(3,'isNaN def',defratio,Actor.getMasteryValue(act,'def',i,true));
		}
	}
	return def;
}

Actor.dodge = function(act,time,dist){
	Actor.setInvincibleDuration(act,time);
	
	//movement
	Actor.movePush(act,act.angle,dist/time,time)
	Actor.setSpriteFilter(act,Actor.SpriteFilter('dodge',time+5));
}

Actor.setInvincibleDuration = function(act,time){
	if(!time) 
		return;
	
	//invincibility
	if(!Actor.setInvincibleDuration.HISTORY[act.id])
		Actor.setInvincibleDuration.HISTORY[act.id] = act.damagedIf;
	
	act.damagedIf = CST.DAMAGE_IF.never;
	
	Actor.setTimeout(act,function(){
		act.damagedIf = Actor.setInvincibleDuration.HISTORY[act.id];
		delete Actor.setInvincibleDuration.HISTORY[act.id];
	},time,'Actor.setInvincibleDuration');
}
Actor.setInvincibleDuration.HISTORY = {};	//BADDDDD


Actor.rechargeAbility = function(act){
	Actor.ability.fullyRecharge(act);
}

var STAGGER_TIME_NPC = 10;	//time b4 stagger-able again
var STAGGER_TIME_PLAYER = 25;
var STAGGER_DIST = 15;
Actor.applyStagger = function(act,angle,mod){
	if(act.nevermove)
		return;
	mod = mod || 1;
	if(act.type === CST.ENTITY.player)
		mod *= 0.6;
	
	
	act.spdX /= 4;
	act.spdY /= 4;
	
	var time = act.type === CST.ENTITY.player ? STAGGER_TIME_PLAYER : STAGGER_TIME_NPC;
	
	if(!SERVER)
		Actor.moveBy(act,Tk.cos(angle)*STAGGER_DIST*mod,Tk.sin(angle)*STAGGER_DIST*mod);
	else {
		if(act.fixedPosition){
			var x = act.x;
			var y = act.y;
			Actor.setTimeout(act,function(){
				act.x = x;
				act.y = y;
			},time/2);
		}
		act.staggerTimer = time;
		act.staggerAngle = angle;
		act.lastBounce = act.frame; //BAD
		Actor.setChange(act,CST.CHANGE.stagger,[time,angle]);
		if(act.type === CST.ENTITY.player)
			Actor.setPrivateChange(act,CST.CHANGE.onHit,true);
		return;
	}
	
}
Actor.updateStagger = function(act){	//client
	if(act === w.player){
		if(act.staggerTimer >= STAGGER_TIME_PLAYER - 3)	//3 times in a row
			Actor.applyStagger(act,act.staggerAngle,2/3);	//at 2/3 strength, aka x2 more stagger than normal
	}
	act.staggerTimer--;
}
Actor.onChange(CST.CHANGE.stagger,function(act,data){
	act.staggerTimer = data[0];
	act.staggerAngle = data[1];	
});


//Preset
Actor.addPreset = function(act,name){
	var pre = Preset.get(name);
	if(!pre)
		return ERROR(3,'no preset with name',name);
	act.preset[name] = pre;
	Actor.updatePreset(act);
}

var HISTORY = {};
Actor.addPresetUntilMove = function(act,presetName,dist){
	dist = dist || 100;
	if(act.type !== CST.ENTITY.player)
		return ERROR(3,'can only be used by player');
	
	HISTORY[act.id] = HISTORY[act.id] || {};
	HISTORY[act.id][presetName] = Actor.toSpot(act);
	
	Actor.addPreset(act,presetName);
	
	Actor.setInterval(act,function(){
		var old = HISTORY[act.id] && HISTORY[act.id][presetName];
		if(!old){
			Actor.updatePreset(act);
			return ERROR(3,'HISTORY undefined',act.name);
		}
		
		if(old.map !== act.map || Actor.getDistance(act,old) > dist){
			Actor.removePreset(act,presetName);
			delete HISTORY[act.id][presetName];
			if(HISTORY[act.id].$isEmpty())
				delete HISTORY[act.id];
			return;
		}
		return true;
	},10,'addPresetUntilMove' + presetName);
}

Actor.removePreset = function(act,name){
	delete act.preset[name];
	Actor.updatePreset(act);
}

Actor.updatePreset = function(act){
	var key = act.id;
	
	var reputation = true;
	var ability = !act.nevercombat;
	var pvp = false;
	var combat = !act.nevercombat;
	var move = !act.nevermove;
	
	for(var i in act.preset){
		if(act.preset[i].noReputation)
			reputation = false;
		if(act.preset[i].noAbility)
			ability = false;
		if(act.preset[i].pvp)
			pvp = true;
		if(act.preset[i].noCombat)
			combat = false;
		if(act.preset[i].noMove)
			move = false;
	}
	act.combat = combat;
	act.noAbility = !ability;
	act.move = move;
	
	if(!Actor.isPlayer(act))
		return;
	
	Actor.enableReputation(act,reputation);
	Actor.enablePvp(act,pvp); 
		
	var usedAbility = false;	
	for(var i in act.preset){
		var preset = act.preset[i];
		if(preset.ability){
			Actor.setCombatContext(act,'ability','quest',true);
			for(var i = 0 ; i < preset.ability.length; i++){
				if(preset.ability[i]){
					Actor.addAbility(act,preset.ability[i]); 
					Actor.swapAbility(act,preset.ability[i],i);
				}
			}
			Actor.rechargeAbility(act);
			usedAbility = true;
			break;
		}
	}
	if(!usedAbility)
		Actor.setCombatContext(Actor.get(key),'ability','normal');
	
	
	var usedEquip = false;	
	for(var i in act.preset){
		var preset = act.preset[i];
		if(preset.equip){
			Actor.setCombatContext(act,'equip','quest',true);
			for(var i in preset.equip){
				if(preset.equip[i]){
					Actor.changeEquip(act,preset.equip[i]);
				}
			}
			usedEquip = true;
			break;
		}
	}
	if(!usedEquip)
		Actor.setCombatContext(Actor.get(key),'equip','normal');
}

Actor.canUseHeal = function(act){
	if(Actor.boost.getBase(act,'leechKing'))
		return false;
	if(Actor.boost.getBase(act,'riskyHp'))
		return act.hp <= 0.1 * act.hpMax;
	return true;
}

Actor.onAttack = function(act){
	if(SERVER)
		if(act.type === CST.ENTITY.player && Actor.boost.getBase(act,'lifeForSpd'))
			Actor.addHp(act,-25,true);	//check Stat lifeForSpd
	act.lastAttack = Date.now();
	
	if(act.type === CST.ENTITY.player){
		act.spdX /= 4;
		act.spdY /= 4;
		if(!SERVER && act === w.player)
			Actor.setSpdMod(act,'attack',0.75,4);
			
		
	}
	if(act.type === CST.ENTITY.npc){
		act.spdX /= 8;
		act.spdY /= 8;
		
		if(SERVER){
			Actor.addBoost(act,Boost.create('useAbility','maxSpd',1/4,act.delayBeforeAttack*2,CST.BOOST_X));
			Actor.addBoost(act,Boost.create('useAbility','acc',1/4,act.delayBeforeAttack*2,CST.BOOST_X));
		}
	}
}

Actor.onAfflictBleed = function(act,b){
	var atker = Actor.get(b.parent); 
	if(!atker || atker.type !== CST.ENTITY.player || !Actor.boost.getBase(atker,'leechBleed')) 
		return;
		
	Combat.onCollision.leech(act,b);
}

Actor.enablePvp = function(act,enable){
	if(enable){
		act.damageIf = CST.DAMAGE_IF.always;
		act.damagedIf = CST.DAMAGE_IF.always;
		act.pvpEnabled = true;
	} else {
		act.damageIf = Actor.isPlayer(act) ? CST.DAMAGE_IF.npc : CST.DAMAGE_IF.player;
		act.damagedIf = Actor.isPlayer(act) ? CST.DAMAGE_IF.npc : CST.DAMAGE_IF.player;	
		act.pvpEnabled = false;
	}
	Actor.setChange(act,'pvpEnabled',act.pvpEnabled);	//should be private?
}

Actor.enablePvp.onCommand = function(act,bool){
	var main = Actor.getMain(act);
	if(Main.getQuestActive(main))
		return Main.error(main,'You can\'t toggle PvP while doing a quest.');
	Main.playSfx(main,'select');
	if(bool){
		Actor.addPreset(act,'pvpCommand');
		Main.addMessage(main,'PvP has been enabled. You can now attack other players who also have PvP On.');
	} else {
		Actor.removePreset(act,'pvpCommand');
		Main.addMessage(main,'PvP has been disabled. You can no longer attack other players.');
	}
}

Actor.enableReputation = function(act,allow){
	if(allow)
		Main.reputation.updateBoost(Actor.getMain(act));
	else
		Actor.addPermBoost(act,Main.reputation.BOOST_NAME);
}

Actor.getRawGlobalDef = function(act){	//without lvl boost
	return act.globalDef / Combat.getLvlScaling(act);
}

})(); //{







