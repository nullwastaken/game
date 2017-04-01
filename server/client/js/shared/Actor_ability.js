
"use strict";
(function(){ //}
var Message, Main, Input, Combat, Ability, Anim;
global.onReady(function(){
	Message = rootRequire('shared','Message'); Main = rootRequire('shared','Main'); Input = rootRequire('server','Input'); Combat = rootRequire('server','Combat'); Ability = rootRequire('server','Ability'); Anim = rootRequire('server','Anim');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.abilitySwap,Command.ACTOR,[ //{
		Command.Param('string','Ability Id',false),
		Command.Param('number','Key Position',false,{max:5}),
	],Actor.swapAbility.onCommand); //}
});
var Actor = rootRequire('shared','Actor');

var INTERVAL_ABILITY = 3;

Actor.AbilityList = function(normal,quest){
	return {
		normal:normal || {},	//abilityId:bool
		quest:quest || {}
	};
}

Actor.AbilityList.compressDb = function(abilityList){
	return Object.keys(abilityList.normal);
}

Actor.AbilityList.uncompressDb = function(abilityList){
	var tmp = {};	
	for(var i in abilityList) 
		tmp[abilityList[i]] = true;
	tmp = Actor.AbilityList.fixIntegrity(tmp);
	return Actor.AbilityList(tmp);
}

Actor.AbilityList.getDbSchema = function(){
	return Array.of(String);
}

Actor.AbilityList.fixIntegrity = function(abilityList){
	for(var i in abilityList){
		if(!Ability.get(i)){
			ERROR(2,'ability no longer exist',i);
			delete abilityList[i];
		}
	}
	return abilityList;
}

Actor.AbilityList.compressClient = function(abilityList,act){
	return Object.keys(Actor.getAbilityList(act));
}

Actor.AbilityList.uncompressClient = function(abilityList){
	var tmp = {};
	for(var i in abilityList){
		if(SERVER && !Ability.get(abilityList[i]))
			ERROR(3,'ability dont exist',abilityList[i]);
		else
			tmp[abilityList[i]] = true;
	}
	return Actor.AbilityList(tmp);
}

//################

Actor.Ability = function(normal,quest){
	return {
		normal:normal || Actor.Ability.Part(),	
		quest:quest || Actor.Ability.Part(),
	}
}

Actor.Ability.Part = function(){
	return [null,null,null,null,null,null];
}

Actor.Ability.compressDb = function(ability){
	for(var i in ability.normal) 
		ability.normal[i] = ability.normal[i] ? ability.normal[i].id : "";
	return ability.normal;
}

Actor.Ability.uncompressDb = function(ability){
	for(var i in ability)
		ability[i] = Ability.get(ability[i]);	
	return Actor.Ability(ability);
}

Actor.Ability.getDbSchema = function(){
	return Array.of(String);
}

Actor.Ability.compressClient = function(ability,act){
	var list = Actor.getAbility(act);
	var tmp = [];
	for(var i in list){
		tmp[i] = list[i] ? list[i].id : 0;		
	}
	return tmp;
}

Actor.Ability.uncompressClient = function(ability){
	for(var i in ability) 
		if(!ability[i]) ability[i] = null;
	return Actor.Ability(ability);
}

//################

Actor.AbilityAi = function(array,range){
	var tmp = {
		close:{},
		middle:{},
		far:{},
		range:range || [60,300],
		list:{},
	};
	
	for(var i in array){
		var id = array[i].id;
		var distanceInfo = array[i].distanceInfo;
		
		tmp.close[id] = distanceInfo[0];
		tmp.middle[id] = distanceInfo[1];
		tmp.far[id] = distanceInfo[2];
		tmp.list[id] = 1;
	}
	return tmp;	
} 

Actor.AbilityAi.ability = function(id,distanceInfo){
	return {
		id:id,
		distanceInfo:distanceInfo,
	}
}

Actor.AbilityChange = function(ab){	//ab : ability
	var tmp = {
		press:Actor.AbilityChange.press(),	//more than 6 cuz monsters
		charge:{},	//abilityId:charge
		chargeClient:'RRRRRR',	
		globalCooldown:0
	};
	ab = ab || [];
	for(var i = 0; i < ab.length; i++)
		if(ab[i]) 
			tmp.charge[ab[i].id] = 0;	//aka already charged
	return tmp;
}

Actor.AbilityChange.press = function(str){
	if(!str)
		return [false,false,false,false,false,false,false,false,false,false,false,false];
	
	var a = [];
	for(var i = 0; i < 10; i++)
		a.push(str[i] === '1');
	return a;			
}

Actor.onAbilityInput = function(act,str){
	act.abilityChange.press = Actor.AbilityChange.press(str);
	if(Actor.isPressingAbility(act) && act.combat){
		Actor.ability.loop.clickVerify(act);
	}
}

Actor.setAbilityListUsingAbilityAi = function(act){
	act.abilityList = Actor.AbilityList(act.abilityAi.list);
	for(var id in act.abilityAi.list){
		if(id !== Actor.IDLE_ABILITY_ID) 
			Actor.swapAbility(act,id);
	}
}

//#################

Actor.removeAbility = function(act,name){
	delete Actor.getAbilityList(act)[name];
	var ab = Actor.getAbility(act);
	for(var i = 0; i < ab.length; i++){
		if(ab[i] && ab[i].id === name){
			ab[i] = null;
		}
	}
	Actor.setFlagAbility(act);
}

Actor.setFlagAbility = function(act){
	Actor.setFlag(act,'ability',function(act){
		return Actor.Ability.compressClient(act.ability,act);
	});
	Actor.setFlag(act,'abilityList',function(act){
		return Actor.AbilityList.compressClient(act.abilityList,act);
	});
}

Actor.swapAbility = function(act,name,position,strict){
	if(strict && !Actor.swapAbility.test(act,name,position)) return;
	
	var ab = Actor.getAbility(act);
	if(position === undefined)	
		for(position = 0; position < 100; position++) 
			if(!ab[position]) 
				break;	//get first empty position
	
	for(var i in ab){ //prevent multiple
		if(ab[i] && ab[i].id === name) 
			ab[i] = null; 
	}	

	var ability = Ability.get(name);
	ab[position] = ability;
	act.abilityChange = Actor.AbilityChange(ab);
	
	Actor.setFlagAbility(act);
}

Actor.swapAbility.onCommand = function(act,name,position){
	Actor.swapAbility(act,name,position,true);
}

Actor.swapAbility.test = function(act,name,position){
	var main = Actor.getMain(act);
	if(act.combatContext.ability !== 'normal'){
		return Main.error(main,'You can\'t change your ability at this point of the quest.',true);
	}
	if(!Actor.getAbilityList(act)[name]){
		return Main.error(main,'You don\'t have this ability',true);
	}
	var ability = Ability.get(name);
	
	if(position !== 4 && ability.type === CST.ABILITY.heal){
		return Main.error(main,'The ability "' + ability.name + '" abilities can only be assigned to the <span class="shadow" style="color:#11FF11">5th slot</span>.',true);	
	}
	if(position === 4 && ability.type !== CST.ABILITY.heal){
		return Main.error(main,'You can\'t assign the ability "' + ability.name + '" to the 5th slot.<br>The 5th ability slot can only support Healing abilities.',true);
	}
	var spec = Actor.ability.isSpecialAttack(ability);
	if(spec && (position === 0 || position === 1)){
		return Main.error(main,'You can\'t assign the ability "' + ability.name + '" to the slot #' + (position+1) + '.<br>Special attack abilities can only be assigned in the <span class="shadow" style="color:#11FF11">3rd and 4th slots</span>.',true);
	}
	if(!spec && (position === 2 || position === 3)){
		return Main.error(main,'You can\'t assign the ability "' + ability.name + '" to the slot #' + (position+1) + '.<br>Main attack abilities can only be assigned in the <span class="shadow" style="color:#11FF11">1st and 2nd slots</span>.',true);
	}
	Main.playSfx(main,'select');
	return true;
}

Actor.addAbility = function(act,name){
	if(!Ability.get(name)) 
		return ERROR(3,'ability not exist',name);
	Actor.getAbilityList(act)[name] = 1;

	Actor.setFlagAbility(act);
}

Actor.isPressingAbility = function(act){
	var press = Actor.getAbilityPress(act);
	
	for(var i = 0 ; i < press.length; i++)
		if(press[i])
			return true;
	return false;
}

Actor.getAbilityPress = function(act){
	return SERVER ? act.abilityChange.press : Input.getState('ability');
}	

Actor.getAbility = function(act){
	return act.ability[act.combatContext.ability];
}

Actor.getAbilityList = function(act,forceContext){
	return act.abilityList[forceContext || act.combatContext.ability];
}

Actor.ability = {};

Actor.ability.loop = function(act){
	if(!Actor.testInterval(act,INTERVAL_ABILITY)) return;
	Actor.ability.loop.charge(act);
	Actor.ability.loop.clickVerify(act);
	if(act.type === CST.ENTITY.player)
		Actor.ability.loop.chargeClient(act);
};

Actor.ability.loop.charge = function(act){	//HOTSPOT
	var ma = act.abilityChange;
	ma.globalCooldown -= INTERVAL_ABILITY;
		
	if(ma.globalCooldown > 125)	//cuz if atkSpd is low, fuck everything with stun
		ma.globalCooldown = 125;
		
	var ab = Actor.getAbility(act);
	for(var i = 0; i < ab.length; i++){
		if(!ab[i]) 
			continue;	//cuz can have hole if player
		ma.charge[ab[i].id] = (ma.charge[ab[i].id] + act.atkSpd * INTERVAL_ABILITY) || 0;
	}
}

Actor.ability.loop.chargeClient = function(act){
	var ab = Actor.getAbility(act);
	var ma = act.abilityChange;
	
	ma.chargeClient = '';
	for(var i = 0; i < ab.length; i++){
		var s = ab[i]; 
		if(!s){	//cuz can have hole if player
			ma.chargeClient += '0'; 
			continue; 
		}	
		//Client
		var rate = ma.charge[s.id] / s.periodOwn;
		ma.chargeClient += Actor.ability.chargeClient.compressClient(rate);
	}
}

Actor.ability.chargeClient = {};

Actor.ability.chargeClient.compressClient = function(rate){
	return rate >= 1 ? 'R' : Math.round(rate*35).toString(36).slice(0,1);
}

Actor.ability.chargeClient.uncompressClient = function(charge){
	var tmp = [0,0,0,0,0,0];
	for(var i = 0 ; i < charge.length ; i++){ 
		tmp[i] = charge[i] === 'R' ? 1 : parseInt(charge[i],36)/36;
	}
	return tmp;
}

Actor.ability.loop.clickVerify = function(act){
	if(act.noAbility) 
		return;
	var ab = Actor.getAbility(act);
	var ma = act.abilityChange;
	
	for(var i = 0; i < ab.length; i++){
		if(!ab[i]) 
			continue;	//cuz can have hole if player
		if(ma.press[i] === true && ma.charge[ab[i].id] > ab[i].periodOwn && (ab[i].bypassGlobalCooldown || (ma.globalCooldown <= 0))){
			Actor.useAbility(act,ab[i]);
			break;
		}
	}
}

Actor.ability.fullyRecharge = function(act){
	var ab = Actor.getAbility(act);
	act.abilityChange.globalCooldown = 0;
	for(var i = 0; i < ab.length; i++){
		var s = ab[i]; 
		if(!s) 
			continue;	//cuz can have hole if player
		act.abilityChange.charge[s.id] = 1000;
	}
}

Actor.ability.isSpecialAttack = function(ability){	//BAD name but cant be Ability cuz client needs too
	return ability.type === CST.ABILITY.attack && (ability.periodOwn > 25 || ability.costMana > 20 || ability.costHp > 20);
}	

Actor.setSpriteFilter = function(act,filter){	//dodge is hardcodded
	if(SERVER) 
		Actor.setChange(act,'spriteFilter',act.spriteFilter);
	else 
		act.spriteFilter = filter;
}

Actor.SpriteFilter = function(filter,time){ //BAD name
	return {
		filter:filter,
		time:time || 5,
	}
}

Actor.ability.hasEnoughResource = function(act,ab){
	return ab.costMana <= act.mana && ab.costHp <= act.hp;
}

Actor.ability.hasEnoughCharge = function(act,slot){	//not sure if works on server
	return act.abilityChange.chargeClient[slot] >= 1;
}

Actor.useAbility = function(act,ab,bypassRestriction,extra,noDelay){ //server
	if(bypassRestriction !== true && !Actor.testUseAbilityWeapon(act,ab))
		return;
	//Mana
	if(bypassRestriction !== true && !Actor.useAbility.testResource(act,ab)) 
		return;
	
	for(var i = 0 ; i < ab.triggerAbility.length; i++){	//potential infinite loop
		var ab2 = Ability.get(ab.triggerAbility[i]);
		if(!ab2)
			ERROR(3,'no ability with id',ab2.triggerAbility[i]);
		else
			Actor.useAbility(act,ab2,true,extra,noDelay);
	}
	
	
	
	if(bypassRestriction !== true)	
		Actor.useAbility.resetCharge(act,ab);
	
	//Anim
	if(ab.spriteFilter && act.isActor)
		Actor.setSpriteFilter(act,ab.spriteFilter);
	
	if(ab.preDelayAnimOverSprite)
		Anim.create(ab.preDelayAnimOverSprite,Anim.Target(act.id));
	
	Actor.setTimeout(act,function(){
		if(ab.postDelayAnimOverSprite)	
			Anim.create(ab.postDelayAnimOverSprite,Anim.Target(act.id));
		//Do Ability Action
		if(ab.type === CST.ABILITY.attack) 
			Combat.attack(act,ab.param,extra);
		else if(ab.type === CST.ABILITY.dodge) 
			Combat.dodge(act,ab.param);
		else if(ab.type === CST.ABILITY.heal) 
			Combat.heal(act,ab.param);
		else if(ab.type === CST.ABILITY.summon) 
			Combat.summon(act,ab.param);
		else if(ab.type === CST.ABILITY.event) 
			Combat.event(act,ab.param);
		else if(ab.type === CST.ABILITY.idle) 
			Combat.idle(act,ab.param);
		else if(ab.type === CST.ABILITY.boost) 
			Combat.boost(act,ab.param);
		else
			ERROR(3,'invalid type',ab.id,ab.type,act.name,ab);
	},noDelay ? 0 : ab.delay);
	
}

Actor.testUseAbilityWeapon = function(act,ab){
	if(act.type !== CST.ENTITY.player || !ab.weaponReq.length) 
		return true;
	var equipType = Actor.getWeaponType(act);
	if(equipType === null)	//aka unarmed
		return true;
	return ab.weaponReq.$contains(equipType);
}	

Actor.useAbility.resetCharge = function(act,ab){
	var charge = act.abilityChange.charge;
	charge[ab.id] = 0;
	act.abilityChange.globalCooldown = Math.max(act.abilityChange.globalCooldown,0);	//incase bypassing Global
	act.abilityChange.globalCooldown +=  ab.periodGlobal / Math.max(act.atkSpd,0.05);	//math max case atkSpd < 0.05 cuz stun

}

Actor.useAbility.testResource = function(act,ab){
	if(act.mana < ab.costMana || act.hp < ab.costHp) return false;
	act.mana -= ab.costMana;
	act.hp -= ab.costHp;
	return true;		
}



})(); //{



