
"use strict";
(function(){ //}
var Account, Equip, Server, Combat, Boss, Maps, Entity, ActorGroup, Stat, OptionList, Sprite, Main, ActorModel, Input;
global.onReady(function(){
	Account = rootRequire('private','Account'); Equip = rootRequire('server','Equip'); Server = rootRequire('private','Server'); Combat = rootRequire('server','Combat'); Boss = rootRequire('server','Boss'); Maps = rootRequire('server','Maps'); Entity = rootRequire('shared','Entity'); ActorGroup = rootRequire('server','ActorGroup'); Stat = rootRequire('shared','Stat'); OptionList = rootRequire('shared','OptionList'); Sprite = rootRequire('shared','Sprite'); Main = rootRequire('shared','Main'); ActorModel = rootRequire('shared','ActorModel');
	Input = rootRequire('server','Input',true);
	
	Entity.onPackReceived(Entity.TYPE.actor,Actor.createFromInitPack);
},null,SERVER ? '' : 'Actor',['MapModel','SpriteModel'],function(pack){
	Actor.init(pack);
});

var Actor = exports.Actor = function(extra){
	Entity.call(this);
	ActorModel.call(this);
	
	this.isActor = true;
	
	this.changeOld = {}; //any
	this.permBoost = {};  //Boost.Perm[]
	this.boost = null;	//Actor.Boost
	this.frame = Math.floor(Math.random()*100);
	this.active = true; //if not active, dont move. no cpu
	this.damagedBy = {}; //id:number
	this.dead = false;
	this.hitHistory = []; //number
	this.hitHistoryToDraw = []; //Actor.HitHistoryToDraw
	this.moveAngle = 1;
	this.spdX = 0;
	this.spdY = 0;
	this.mouseX = 0;
	this.mouseY = 0;
	this.moveInput = Actor.MoveInput();
	this.moveTarget = Actor.MoveTarget();
	this.bumper = Actor.Bumper();
	this.attackReceived = {}; //so pierce doesnt hit multiple times
	this.targetMain = Actor.TargetMain();
	this.targetSub = Actor.TargetSub();
	this.mapMod = {}; //string:number	string=x+y
	this.abilityChange = Actor.AbilityChange();
	this.statusClient = Actor.StatusClient();
	this.curseClient = {}; //statId:value
	this.timeout = {}; //Actor.Timeout
	this.summon = {}; //Actor.Summon
	this.summoned = null; //Actor.Summoned
	this.staggerTimer = 0;
	this.serverX = 0;
	this.serverY = 0;
	this.group = '';	//enemy group
	this.noAbility = false;
	this.hitEvent = null;	//function(key,shooterKey) for quest
	this.sideQuest = '';	//only model, tag _sideQuest has real id
	this.spriteFilter = null; //Actor.SpriteFilter
	this.spdMod = Actor.SpdMod();
	this.equip = Actor.Equip();
	this.status = Actor.Status();
	this.bonus = Actor.Bonus(); //Bonus applies on top of ability attack. If effect not on ability, do nothing.
	this.username = "";
	this.context = '';
	this.weakness = Actor.Weakness();
	this.optionList = null; //Actor.OptionList
	this.dialogue = null; // {id:function(key)}
	this.chatHead = null; //Actor.ChatHead
	this.deathEvent = null; //function(key,killerKey,killerMap,usedKiller:bool,killers:string[])
	this.onclick = {}; //Actor.Onclick
	this.loot = null; //function(key,eid):bool
	this.teleport = null; // {id:function(key)}
	this.tag = {}; //any
	this.hideOptionList = false;
	this.lastInteraction = 0;
	this.skillPlot = null; //Actor.SkillPlot
	this.shop = null; //string
	this.toggle = null; //function(key,eid):bool
	this.signpost = null; //function(key,eid)
	this.lastTeleport = null; //Actor.LastTeleport
	this.skill = Actor.Skill();
	this.removeList = [];	//string[] for things that got removed from activeList
	this.privateChange = {};	//any
	this.privateOld = {}; //any
	this.privateChangeCompressed = {};	//any
	this.magicFind = Actor.MagicFind();
	this.respawnLoc = Actor.RespawnLoc();
	this.questMarker = {}; //Actor.QuestMarker
	this.preset = {}; //Preset
	this.lastAttack = 0;
	this.lastBounce = 0;
	
	
	//client
	this.preventAbility = true;
	this.spd = 0;
	this.withinStrikeRange = false;
	this.outOfSyncCount = 0;
	this.staggerAngle = 0;
	this.hideHpBar = false;
	this.dummy = false;
	
	Tk.fillExtra(this,extra);	
};

Actor.create = function(model,extra){
	var model = Tk.deepClone(ActorModel.get(model));
	if(!model) 
		return ERROR(2,'no model dont exist',model);
	
	var act = new Actor(model);
	Tk.fillExtra(act,extra);
	
	if(!SERVER){
		Actor.setBoostListBase(act);
		return act;
	}
	
	if(act.type !== CST.ENTITY.player)
		Actor.setAbilityListUsingAbilityAi(act); //based on aiChance
		
	act.optionList = Actor.generateOptionList(act);
	act.onclick = Actor.generateOnclick(act);
	
	act.context = Actor.getContext(act);
	if(act.type === CST.ENTITY.npc)
		act.acc = act.maxSpd/3;
	
	if(act.boss) 
		act.boss = Boss.get(act.boss,act);
	
	if(act.nevermove)
		act.fixedPosition = true;
	
	if(act.nevermove || act.fixedPosition){
		act.move = false;
		act.spdX = 0;
		act.spdY = 0;
		act.maxSpd = 1;
		act.statusResist.knock = 1;
		//act.preventStagger = true;
	}
	
	if(act.nevercombat){
		act.combat = false;
		act.hpMax = 1;
		act.hp = 1;
	} else {
		for(var i in act.immune) 
			if(act.immune)
				Actor.turnImmune(act,i);
		Actor.setWeakness(act);
		act.hpMax = act.hp; 
		act.manaMax = act.mana;
		if(act.type !== CST.ENTITY.player)
			Combat.applyLvlScaling(act);		
	}
	Actor.setBoostListBase(act);	//after lvl scaling
		
	Actor.generateChange(act,0,true); //set old	change
	
	act.change = {}; //otherwise, data would be sent twice, in sa.i and sa.u
	if(act.type === CST.ENTITY.player){	//QUICKFIX, otherwise reuptation ability disappear when login in
		var ab = Tk.deepClone(act.ability);
		Actor.equip.update(act);	//only if player
		act.ability = ab;
	}
		
	return act;
}


Actor.init = function(pack){  //client
	ActorModel.init();
	w.player = Actor.create('player');
	Actor.applyChange(w.player,pack.player);
}

Actor.MoveTarget = function(x,y,active){
	return {
		x:x || 0,
		y:y || 0,
		active:active || false,	
	}
}

Actor.getContext = function(act){
	return act.name + (act.type === CST.ENTITY.player ? ' (Lv ' + Actor.getLevel(act) +')': '');
}

Actor.LIST = {};	//supposed to be only accesable by file starting with Actor_

Actor.Spot = function(x,y,map,mapModel){
	return {
		x:x !== undefined ? x : Actor.TOWN_SPOT.x,
		y:y !== undefined ? y : Actor.TOWN_SPOT.y,
		map:map || Actor.TOWN_SPOT.map,
		mapModel:mapModel || Actor.TOWN_SPOT.mapModel,
	}
}
Actor.StatusClient = function(){
	return '000000';
}
Actor.get = function(id){
	return Actor.LIST[id] || null;
}

if(!SERVER)
	Actor.get = function(id){
		if(id === w.player.id) 
			return w.player;
		return Actor.LIST[id] || null;
	}

Actor.isAdmin = function(act){
	return Server.isAdmin(act.id);
}

Actor.isOnline = function(id){
	if(typeof id === 'string')
		return !!Actor.get(id);
	return !!Actor.get(id.id);
}

Actor.onChange = Tk.newPubSub(true);

Actor.getViaUsername = function(id){
	return Actor.get(Account.getKeyViaUsername(id)) || null;
}
Actor.getViaName = function(name){
	return Actor.get(Account.getKeyViaName(name)) || null;
}

Actor.isInMap = function(act,map){
	return Maps.getModel(act.map) === Maps.getModel(map); 
}

Actor.addToList = function(act){
	Actor.LIST[act.id] = act;
}
Actor.removeFromList = function(id){
	delete Actor.LIST[id]; 
}

Actor.isPlayer = function(act){
	if(!act) return ERROR(3,'no act');
	
	if(typeof act === 'string') 
		return !!Actor.LIST[act] && Actor.LIST[act].type === CST.ENTITY.player;
	return act.type === 'player';
}

Actor.playSfx = function(act,id,vol){
	Main.playSfx(Actor.getMain(act),id,vol);
}

Actor.SPRITE_NORMAL = 'mace';
Actor.IDLE_ABILITY_ID = 'Qsystem-idle';


//###############

Actor.MagicFind = function(quantity,quality,rarity){
	return {
		quantity:quantity || 0,
		quality:quality || 0,
		rarity:rarity || 0
	};
}


Actor.onSignIn = function(act,firstSignIn){
	var teleSpot = firstSignIn
		? Actor.getTutorialStartSpot(act)
		: Actor.getRespawnSpot(act);
		
		
	Actor.addToMap(act,teleSpot,true);	//after cuz trigger playerEnter
	Actor.changeSprite(act,{name:CST.SPRITE_NORMAL});
	Actor.rechargeAbility(act);
}
//###############

Actor.Bonus = function(){
	return Stat.actorBonus();
}

Actor.ChatHead = function(text,timer){
	return {
		text:text || '',
		timer:timer || 25*10,
	}
}


var TEXT_INVITE_PARTY = 'Invite to Party';

Actor.generateOnclick = function(act){
	act.onclick = act.onclick || {};
	
	for(var i in act.onclick)	//if added onclick manually in quest api
		if(act.onclick[i] && act.onclick[i].param[0] !== act.id)
			act.onclick[i].param.unshift(act.id);
	
	var left = null;
	if(act.onclick.left)
		left = act.onclick.left;
	else {
		if(act.optionList && act.optionList.option[0] && act.optionList.option[0].name !== TEXT_INVITE_PARTY)	//BAD prevent left-click invite party...
			left = act.optionList.option[0];
	}
	
	var click = Actor.Onclick(left,act.onclick.right,act.onclick.shiftLeft,act.onclick.shiftRight);
	
	if(!click.shiftLeft	&& !click.shiftRight && !click.left && !click.right) 
		return null;
	return click;
}

Actor.Onclick = function(left,right,shiftLeft,shiftRight){
	return {
		left:left || null,
		right:right || null,
		shiftLeft:shiftLeft || null,
		shiftRight:shiftRight || null,
	}
}

Actor.generateOptionList = function(act){
	if(act.hideOptionList) 
		return null;
	var option = [];
	
	if(act.onclick){
		if(act.onclick.left) 
			option.push(act.onclick.left);	//note: Button.Click is same than OptionList.Option
		if(act.onclick.right) 
			option.push(act.onclick.right);
		if(act.onclick.shiftLeft) 
			option.push(act.onclick.shiftLeft);
		if(act.onclick.shiftRight) 
			option.push(act.onclick.shiftRight);
	}
	
	if(act.type === CST.ENTITY.player){
		option.push(OptionList.Option(Actor.click.party,[OptionList.ACTOR,act.id],TEXT_INVITE_PARTY));
		option.push(OptionList.Option(Actor.click.trade,[OptionList.ACTOR,act.id],'Trade'));
		option.push(OptionList.Option(Actor.click.revive,[OptionList.ACTOR,act.id],'Revive'));
	}
	if(act.shop) 
		option.push(OptionList.Option(Actor.click.shop,[OptionList.ACTOR,act.id],'Shop'));
	if(act.dialogue) 
		option.push(OptionList.Option(Actor.click.dialogue,[OptionList.ACTOR,act.id],'Talk'));
	if(act.loot)	
		option.push(OptionList.Option(Actor.click.loot,[OptionList.ACTOR,act.id],'Loot'));
	if(act.skillPlot)	
		option.push(OptionList.Option(Actor.click.skillPlot,[OptionList.ACTOR,act.id],'Harvest'));
	if(act.toggle) 
		option.push(OptionList.Option(Actor.click.toggle,[OptionList.ACTOR,act.id],'Interact With'));
	if(act.pushable) 
		option.push(OptionList.Option(Actor.click.pushable,[OptionList.ACTOR,act.id],'Push'));
	if(act.teleport) 
		option.push(OptionList.Option(Actor.click.teleport,[OptionList.ACTOR,act.id],'Teleport'));
	if(act.bank) 
		option.push(OptionList.Option(Actor.click.bank,[OptionList.ACTOR,act.id],'Bank'));
	if(act.signpost) 
		option.push(OptionList.Option(Actor.click.signpost,[OptionList.ACTOR,act.id],'Read'));
	
	if(option.length === 0) 
		return null;
	return Actor.OptionList(act.name,option);
}

Actor.remove = function(act){
	if(typeof act === 'string') 
		act = Actor.LIST[act];
	if(SERVER){
		Maps.leave(act,act.map,true);
		if(Actor.isPlayer(act))
			Account.removeFromListToKey(act);
		if(act.group) 
			ActorGroup.removeActorFromGroup(act);
		if(act.summoned)
			Actor.summon.removeFromParentList(act);
	}
	Actor.removeFromList(act.id);
	Entity.removeFromList(act.id);
}

Actor.setWeakness = function(act){
	//verify if same
	var same = true;
	var valSame;
	for(var index = 0 ; index < CST.element.list.length; index++){
		var i = CST.element.list[index];
		var val = Actor.getMasteryValue(act,'def',i);
		if(valSame === undefined)
			valSame = val;
		if(valSame !== val){
			same = false;
			break;
		}
	}
	if(same){
		act.weakness = Actor.Weakness('','');
		return;
	}
	
	//find min and max
	var min = CST.BIG_INT;
	var max = 0;
	var resist = '';
	var weak = '';
	
	for(var index = 0 ; index < CST.element.list.length; index++){
		var i = CST.element.list[index];
		var val = Actor.getMasteryValue(act,'def',i);
		if(val > max){
			max = val;
			resist = i;
		}
		else if(val < min){
			min = val;
			weak = i;
		}
	}
	if(weak === resist) 
		weak = resist = '';
	act.weakness = Actor.Weakness(resist,weak);
}

Actor.Weakness = function(resist,weak){
	return {
		resist:resist || '',
		weak:weak || '',
	}
}

Actor.getMouse = function(act){
	return SERVER ? CST.pt(act.mouseX,act.mouseY) : Input.getMouse();
}
	
Actor.getMain = function(act){	//accept string key and object
	return SERVER ? Main.get(act.id || act) : w.main;
}

Actor.Map = function(map){
	return map;
}	

Actor.Map.compressClient = function(name){
	//used for instanced. client doesnt need to know its instanced
	return Maps.getModel(name);
}

//####################################

Actor.testActiveList = function(viewer,viewed){
	return Entity.testViewed(viewer,viewed);
}
Actor.addMessage = function(act,mes){
	Main.addMessage(Actor.getMain(act),mes);
}

Actor.HitHistoryToDraw = function(num){
	return {
		num:num || 0,
		timer:12,
	};
}
Actor.HitHistoryToDraw.loop = function(act){
	for(var i = act.hitHistoryToDraw.length-1; i>=0 ;i--){
		if(act.hitHistoryToDraw[i].timer-- < 0)
			act.hitHistoryToDraw.splice(i,1);
	}
	while(act.hitHistoryToDraw.length > Actor.MAX_HIT_HISTORY)
		act.hitHistoryToDraw.shift();

	
}


Actor.addHitHistory = function(act,num){
	var n = Math.round(num);
	if(n)
		Actor.setChange(act,CST.CHANGE.hitHistory,n,true);
}

Actor.Mastery = function(def,dmg){
	return {	
		def:def || Actor.Mastery.part(),
		dmg:dmg || Actor.Mastery.part(),
	};
};

Actor.Mastery.part = function(me,ra,ma,fi,co,li){
	return {
		melee:me || Actor.Mastery.element(),
		range:ra || Actor.Mastery.element(),
		magic:ma || Actor.Mastery.element(),
		fire:fi || Actor.Mastery.element(),
		cold:co || Actor.Mastery.element(),
		lightning:li || Actor.Mastery.element(),
	}
}
Actor.Mastery.element = function(value){
	return {
		value:value === undefined ? 1: value,
		mod:1
	};
}

Actor.CombatContext = function(){
	return {ability:'normal',equip:'normal'};
}

Actor.getQuestZone = function(act){
	return act.zone || null;
}

Actor.Pushable = function(magn,time,event,onlySimulate,loose){
	return {
		magn:magn,
		time:time,
		event:event||null,
		timer:0,
		angle:0,
		onlySimulate:onlySimulate || false,
		loose:loose || false,
	};
}

Actor.Block = function(size,value,impactPlayer,impactNpc,impactBullet){
	return {
		size:size,
		value:value === undefined ? 1 : value,
		impactPlayer:impactPlayer === undefined ? true : impactPlayer,
		impactNpc:impactNpc === undefined ? true : impactNpc,
		impactBullet:impactBullet === undefined ? true : impactBullet,
	};
}
Actor.verifyBlockPosition = function(act){
	if(!Actor.verifyBlockPosition.ACTIVE || !act.block)
		return 
	if(act.block.size.x === 0 && act.block.size.y === 0 && act.block.size.width === 2 && act.block.size.height === 2){
		if((act.x+1) % 32 !== 0 || (act.y+1) % 32 !== 0){
			ERROR(3,'A block actor is not placed correctly. 2x2 block actors must be placed inbetween tiles. This is done by placing two times the same spot in the tmx file, in diagonal. (Final position is the average of both spots.)',act.name,act.map,act.x,act.y);
		
			act.x = Math.floor(act.x / 32) * 32 + 1;
			act.y = Math.floor(act.y / 32) * 32 + 1;
		
		}
	}	
}
Actor.verifyBlockPosition.ACTIVE = true;	//cuz Integrity test...

Actor.changeSprite = function(act,info){
	Sprite.change(act,info);
}

Actor.getBumperBox = function(act,side){
	if(side === 'down')	//HCODE
		return act.sprite.bumperBox.down.y;
	if(side === 'up')
		return act.sprite.bumperBox.up.y;
	if(side === 'left')
		return act.sprite.bumperBox.left.x;
	if(side === 'right')
		return act.sprite.bumperBox.right.x;
	return ERROR(3,'invalid side',side);
}


Actor.getNormalSprite = function(act){
	var customSprite = Main.contribution.getPlayerSprite(Actor.getMain(act));
	if(customSprite)
		return customSprite;
	
	//return Actor.SPRITE_NORMAL;
	
	var str = 'skin-body-normal';
	
	var equip = Actor.getEquip(act);
	if(equip.piece.body){
		var body = Equip.get(equip.piece.body).type;
		str += ',body-' + body;	//BAD, linked with SpriteModel.init
	} else 
		str += ',body-normal';
		
	str += ',skin-head-normal';	
	
	if(equip.piece.helm){
		var helm = Equip.get(equip.piece.helm).type;
		str += ',helm-' + helm;
	} else		
		str += ',helm-normal';
	
	return str;
	
}

Actor.refreshNormalSprite = function(act){
	if(act.sprite.isNormal)
		Actor.changeSprite(act,{name:CST.SPRITE_NORMAL});
}

Actor.Summon = function(){
	return {
		child:{},
	}
}
Actor.Summoned = function(parent,name,time,distance){
	return {
		parent:parent,
		name:name,
		time:time,
		distance:distance,		
	}
}

Actor.OptionList = function(name,option){
	return OptionList.create(name,option);
}

Actor.getSpriteName = function(act){
	return Tk.getSplit0(act.sprite.name,',');
}

Actor.toSpot = function(act){
	return Actor.Spot(act.x,act.y,act.map,act.mapModel);
}


})(); //{



