
"use strict";
var AttackModel, Message, ItemModel, Actor, Main, Boost, OptionList;
global.onReady(function(){
	AttackModel = rootRequire('shared','AttackModel'); Message = rootRequire('shared','Message'); ItemModel = rootRequire('shared','ItemModel'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); Boost = rootRequire('shared','Boost'); OptionList = rootRequire('shared','OptionList');
});
var Ability = exports.Ability = function(extra){
	this.quest = "";
	this.id = "";
	this.type = "attack";
	this.name = "Strike";
	this.icon = "attackMelee-cube";
	this.description = "Regular Melee Strike";
	this.periodOwn = 25;
	this.periodGlobal = 25;
	this.bypassGlobalCooldown = false;
	this.costMana = 0;
	this.costHp = 0;
	this.param = null;
	this.weaponReq = [];	//string[]
	this.delay = 2;
	this.preDelayAnimOverSprite = null;	//Anim.Base
	this.spriteFilter = null;
	this.postDelayAnimOverSprite = null; //Anim.Base
	this.randomlyGeneratedId = false;
	this.triggerAbility = [];
	this.usableByPlayer = false;	//not enforced
	Tk.fillExtra(this,extra);
}
Ability.create = function(quest,id,extra){
	var tmp = new Ability(extra);
	tmp.quest = quest; 
	tmp.id = id;	//need after loop thru ability
	
	DB[id] = tmp;
	if(!id)
		ERROR(3,'empty id');
	if(!Tk.enumContains(CST.ABILITY,tmp.type))
		ERROR(3,'empty type',tmp.type);
	if(id.$contains('player'))	//BAD
		Ability.createItemVersion(tmp);
	
	return tmp;
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

Ability.Param = function(type,param){	//unused but sub yes
	if(type === CST.ABILITY.heal) return Ability.Param.heal(param);
	else if(type === CST.ABILITY.summon) return Ability.Param.summon(param);
	else if(type === CST.ABILITY.attack) return Ability.Param.attack(param);
	else if(type === CST.ABILITY.boost) return Ability.Param.boost(param);
	else if(type === CST.ABILITY.dodge) return Ability.Param.dodge(param);
	else if(type === CST.ABILITY.event) return Ability.Param.event(param);
	else if(type === CST.ABILITY.idle) return Ability.Param.idle(param);
	return ERROR(3,'invalid type',type,param);
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
		time:param.time || CST.BIG_INT,
		distance:param.distance || 500,	//distance before tele back to u
		model:param.model || '',
		amount:param.amount || 1,
		globalDef:param.globalDef || 1,
		globalDmg:param.globalDmg || 1,
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
		type:type || CST.BOOST_X,
		value:value || 0,
		time:time || 100,
		name:Boost.FROM_ABILITY,
	}
}

Ability.Param.attack = function(param){
	return AttackModel.create(param,true);		
}

Ability.getUsableByPlayerCount = function(){
	var c = 0;
	for(var i in DB)
		if(DB[i].usableByPlayer)
			c++;
	return c;
}
//#################

Ability.compressClient = function(ability){	
	return ability;
}	

Ability.clickScroll = function(act,id){
	var main = Actor.getMain(act);
	if(!Main.haveItem(main,id,1)) return;
	Main.openDialog(main,'ability');
	Message.addPopup(act.id,"Congratulations! You learned a new ability!");
	Actor.addAbility(act,id);
	Main.removeItem(main,id);
}

