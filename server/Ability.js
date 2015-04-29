//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var AttackModel = require2('AttackModel'), Message = require2('Message'), ItemModel = require2('ItemModel'), Actor = require2('Actor'), Main = require2('Main'), Boost = require2('Boost'), OptionList = require2('OptionList');

var Ability = exports.Ability = {};
Ability.create = function(quest,id,ability){
	var tmp = {
		quest:'',
		id:'',
		type:"attack",
		name:"Strike",
		icon:"attackMelee-cube",
		description:"Regular Melee Strike",
		periodOwn:25,
		periodGlobal:25,
		bypassGlobalCooldown:false,
		costMana:0,
		costHp:0,
		//
		funcStr:"",
		param:null,
		//
		delay:2,
		preDelayAnimOverSprite:null,
		spriteFilter:null,
		postDelayAnimOverSprite:null,
	}
	
	for(var i in ability) tmp[i] = ability[i];
	tmp.quest = quest; tmp.id = id;	//need after loop thru ability
	
	
	DB[id] = tmp;
	
	if(id.$contains('player'))	//BAD
		Ability.createItemVersion(tmp);
	
	return tmp;
}

Ability.verifyDmg = function(ab){
	if(ab.type === 'attack'){
		var dmg = ab.param.attack.dmg;
		if(isNaN(dmg.main))
			ERROR(3,'dmg ratio not a number ability:' + ab.id);
		for(var i in dmg.ratio){
			if(isNaN(dmg.ratio[i]))
				ERROR(3,'dmg ratio not a number ability:' + ab.id);
		}
	}
}

var DB = Ability.DB = {};

Ability.get = function(id){
	return DB[id] || null;	
};

Ability.createItemVersion = function(tmp){
	//ability id === item id or quest reward fucked
	ItemModel.create(tmp.quest,tmp.id,tmp.name,'plan-ability',[
		ItemModel.Option(Ability.clickScroll,'Learn Ability','Learn Ability',[OptionList.ACTOR,tmp.id])
	],tmp.name,{trade:false,type:'ability'});
}

Ability.Param = function(funcStr,param){	//unused but sub yes
	if(funcStr === 'heal') return Ability.Param.heal(param);
	else if(funcStr === 'summon') return Ability.Param.summon(param);
	else if(funcStr === 'attack') return Ability.Param.attack(param);
	else if(funcStr === 'boost') return Ability.Param.boost(param);
	else if(funcStr === 'dodge') return Ability.Param.dodge(param);
	else if(funcStr === 'event') return Ability.Param.event(param);
	else if(funcStr === 'idle') return Ability.Param.idle(param);
	return ERROR(3,'invalid funcStr',funcStr,param);
}
Ability.Param.idle = function(){
	return {};
}

Ability.Param.heal = function(param){
	return {
		mana:param.mana || 0,
		hp:param.hp || 0,
	}
}
Ability.Param.dodge = function(param){
	return {
		distance:param.distance || 0,
		time:param.time || 0,
	}
}
Ability.Param.event = function(param){
	return {
		event:param.event || CST.func
	}
}

Ability.Param.summon = function(param){
	return {
		maxChild:param.maxChild || 1,
		time:param.time || CST.bigInt,
		distance:param.distance || 500,	//distance before tele back to u
		model:param.model || '',
		amount:param.amount || 1,
		lvl:param.lvl || 0,				//unsued
	}
}

Ability.Param.boost = function(param){
	return {
		boost:param.boost || [],
	}
}
Ability.Param.boost.boost = function(stat,type,value,time){	//bad name...
	return {
		stat:stat || ERROR(3,'stat missing') || 'globalDmg',
		type:type || '*',
		value:value || 0,
		time:time || 100,
		name:Boost.FROM_ABILITY,
	}
}

Ability.Param.attack = function(param){
	return AttackModel.create(param);
}


//#################

Ability.functionVersion = function(name){	//turn ability into function. called when swapAbility
	var ab = typeof name === 'object' ? name : Tk.deepClone(DB[name]);
	if(!ab) return ERROR(3,'no ability',name);
	
	if(ab.funcStr === 'Combat.attack'){
		ab.param = new Function('return ' + Tk.stringify(AttackModel.create(ab.param)));
	}
	return ab;
}

Ability.objectVersion = function(name){
	var ab = Ability.functionVersion(name);
	if(!ab) return ERROR(3,'no ability',name);
	if(typeof ab.param === 'function') ab.param = ab.param();
	return ab;
}	

Ability.compressClient = function(ability){	
	return Ability.objectVersion(ability);
}	

Ability.clickScroll = function(act,id){
	var main = Actor.getMain(act);
	if(!Main.haveItem(main,id,1)) return;
	Main.openDialog(main,'ability');
	Message.addPopup(act.id,"Congratulations! You learned a new ability!");
	Actor.addAbility(act,id);
	Main.removeItem(main,id);
}

