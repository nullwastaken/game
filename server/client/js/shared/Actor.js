//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Account = require2('Account'), Quest = require2('Quest'), Boss = require2('Boss'), Maps = require2('Maps'), ActiveList = require2('ActiveList'), ActorGroup = require2('ActorGroup'), Message = require2('Message'), Stat = require2('Stat'), OptionList = require2('OptionList'), Sprite = require2('Sprite'), Main = require2('Main'), ActorModel = require2('ActorModel');
var Input = require4('Input');

var Actor = exports.Actor = {};
Actor.create = function(modelId,extra){
	var act = {
		//non-extra
		change:{},
		old:{},
		//flag in model
		permBoost:{},    //no timer
		boost:null,
		frame:Math.floor(Math.random()*100),
		activeList:{},   //actors near this object
		active:1,    	//if not active, dont move. no cpu
		damagedBy:{},   //list of actors that damaged him (used for owner of the drops)
		dead:false,          //dead:invisible
		
		hitHistory:[],
		hitHistoryToDraw:[],
		moveAngle:1,
		spdX:0,	
		spdY:0,	
		mouseX:0,	
		mouseY:0,
		moveInput:Actor.MoveInput(),	
		moveTarget:Actor.MoveTarget(),
		bumper:Actor.Bumper(),        //true if touchs map

		attackReceived:{},	//so pierce doesnt hit multiple times
		targetMain:Actor.TargetMain(),
		targetSub:Actor.TargetSub(),
		mapMod:{},
			
		abilityChange:Actor.AbilityChange(),	
		statusClient:'000000',
		curseClient:{},
		timeout:{},
		summon:{},       //if actor is master
		summoned:null,      //if actor is child
		
		staggerTimer:0,
		serverX:0,
		serverY:0,
		id:Math.randomId(),
		group:'',            //enemy group
		
		noAbility:0,	//for temp time only ex:town
		isActor:true,
		
		//extra
		map:Actor.DEFAULT_SPOT.map,
		mapModel:Actor.DEFAULT_SPOT.mapModel,
		x:Actor.DEFAULT_SPOT.x,	
		y:Actor.DEFAULT_SPOT.y,	
		spriteFilter:null,
		
		maxSpdMod: 1,	//BAD but alternative is Boost which is slow
		
		equip:Actor.Equip(),

		status:Actor.Status(),
		bonus:Actor.Bonus(),	//Bonus applies on top of ability attack. If effect not on ability, do nothing.
		
		viewedIf:'true', //condition to see. check viewedIfList
		username:"player000",     //id name
		context:'',
		weakness:Actor.Weakness(),	//set when creating
		optionList:null,	
			
		//{Setting for Maps.load extra
		dialogue:null,
		chatHead:null,
		deathEvent:null,	//function param:id of each killer
		deathEventOnce:null,	//function param:array id of killers
		onclick:{},
		loot:null,
		teleport:null,
		tag:{},				//to get enemy in q.event
		hideOptionList:false,
		lastInteraction:Date.now(),
		lastAbilitySkill:'',
		skillPlot:null,
		toggle:null,
		signpost:'',		
		//}	
		
		//player only
		skill:Actor.Skill(),
		removeList:{},	//for things that got removed from activeList
		privateChange:{},
		privateOld:{},
		magicFind:Actor.MagicFind(),
		respawnLoc:Actor.RespawnLoc(),
		respawnTimer:25,
		questMarker:{},
		preset:{},	
	}
	var model = Tk.deepClone(ActorModel.get(modelId));
	if(!model) return ERROR(2,'no model dont exist',modelId);
	for(var i in model)
		act[i] = model[i];
	for(var i in extra){
		if(act[i] === undefined) ERROR(4,'prop not in constructor',i);
		act[i] = extra[i];
	}
	
	Actor.setBoostListBase(act);
	
	if(!SERVER){
		act.clientSpdX = 0; //for clientPrediction
		act.clientSpdY = 0;
		return act;
	}
	
	if(act.type !== 'player')
		Actor.setAbilityListUsingAbilityAi(act); //based on aiChance
		
	act.optionList = Actor.generateOptionList(act);
	act.onclick = Actor.generateOnclick(act);
		
	act.context = Actor.getContext(act);
	if(act.type === 'npc')
		act.acc = act.maxSpd/3;
	
	if(act.boss) 
		act.boss = Boss.get(act.boss,act);
	
	if(act.nevermove){
		act.preventStagger = true;
		act.move = 0;
		act.spdX = 0;
		act.spdY = 0;
		act.maxSpd = 1;
		act.statusResist = Actor.StatusResist(0,1,0,0,0,0);
	}
	if(act.nevercombat){
		act.combat = 0;
		act.hpMax = 1;
		act.hp = 1;
	} else {
		for(var i in act.immune) 
			if(act.immune)
				Actor.turnImmune(act,i);
		Actor.setWeakness(act);
		act.hpMax = act.hp; 
		act.manaMax = act.mana;
	}
	
		
	Actor.setChange(act,0,true); //set change and old	
	act.change = {}; //otherwise, data would be sent twice, in sa.i and sa.u
	if(act.type === 'player'){	//QUICKFIX, otherwise reuptation ability disappear when login in
		var ab = Tk.deepClone(act.ability);
		Actor.equip.update(act);	//only if player
		act.ability = ab;
	}
	return act;
}


Actor.MoveTarget = function(x,y,active){
	return {
		x:x || 0,
		y:y || 0,
		active:active || false,	
	}
}

Actor.getContext = function(act){
	return act.name + (act.type === 'player' ? ' (Lv ' + Actor.getLevel(act) +')': '');
}
Actor.addToMap = function(act,spot,force){	//act=[Actor]
	if(!force && !Actor.addToMap.test(act,spot)) return;
	
	act.map = spot.map;
	act.mapModel = Maps.getModel(spot.map);
	
	act.x = act.crX = spot.x; 
	act.y = act.crY = spot.y; 
	act.targetMain = Actor.TargetMain(null,spot.x,spot.y);	
	act.targetSub =  Actor.TargetSub(spot.x,spot.y);	
	
	Actor.addToList(act);
	ActiveList.addToList(act);
	Maps.enter(act,force);
		
	
	if(act.pushable || act.block) 
		Actor.stickToGrid(act);
	
	return act;
}
Actor.addToMap.test = function(act,spot){
	if(!Maps.get(spot.map)) return ERROR(3,'map dont exist?',spot.map);
	return true;
}

Actor.LIST = {};	//supposed to be only accesable by file starting with Actor_
Actor.USERNAME_TO_ID = {};
Actor.get = function(id){
	return Actor.LIST[id] || null;
}

Actor.isOnline = function(id){
	return !!Actor.get(id);
}

Actor.getViaUserName = function(id){
	return Actor.get(Account.getKeyViaUsername(id)) || null;
}

Actor.isInMap = function(act,map){
	return Maps.getModel(act.map) === Maps.getModel(map); 
}



Actor.addToList = function(bullet){
	Actor.LIST[bullet.id] = bullet;
}
Actor.removeFromList = function(id){
	delete Actor.LIST[id]; 
}

Actor.isPlayer = function(act){
	if(!act) return ERROR(3,'no act');
	
	if(typeof act === 'string') 
		return !!Actor.LIST[act] && Actor.LIST[act].type === 'player';
	return act.type === 'player';
}

Actor.DEFAULT_SPRITENAME = 'mace';
Actor.DEFAULT_SPOT = {x:1550,y:550,map:'QfirstTown-main@MAIN',mapModel:'QfirstTown-main'};
Actor.IDLE_ABILITY_ID = 'Qsystem-idle';

//###############

Actor.MagicFind = function(quantity,quality,rarity){
	return {
		quantity:quantity || 0,
		quality:quality || 0,
		rarity:rarity || 0
	};
}

//###############

Actor.Bonus = function(){
	return Stat.actorBonus();
}

Actor.sendMessage = function(act,txt){
	Message.add(act.id,txt);
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
	
	var click = {
		left:left,
		right:act.onclick.right || null,
		shiftLeft:act.onclick.shiftLeft || null,
		shiftRight:act.onclick.shiftRight || null,
	}
	
	if(!click.shiftLeft	&& !click.shiftRight && !click.left && !click.right) return null;
	return click;
}

Actor.generateOptionList = function(act){
	if(act.hideOptionList) return null;
	var option = [];
	
	if(act.onclick){
		if(act.onclick.left) option.push(act.onclick.left);	//note: Button.Click is same than OptionList.Option
		if(act.onclick.right) option.push(act.onclick.right);
		if(act.onclick.shiftLeft) option.push(act.onclick.shiftLeft);
		if(act.onclick.shiftRight) option.push(act.onclick.shiftRight);
	}
	
	if(act.type === 'player') option.push(OptionList.Option(Actor.click.party,[OptionList.ACTOR,act.id],TEXT_INVITE_PARTY));
	if(act.type === 'player') option.push(OptionList.Option(Actor.click.trade,[OptionList.ACTOR,act.id],'Trade'));
	if(act.type === 'player') option.push(OptionList.Option(Actor.click.revive,[OptionList.ACTOR,act.id],'Revive'));
	if(act.dialogue) option.push(OptionList.Option(Actor.click.dialogue,[OptionList.ACTOR,act.id],'Talk'));
	if(act.waypoint) option.push(OptionList.Option(Actor.click.waypoint,[OptionList.ACTOR,act.id],'Set Respawn'));
	if(act.loot)	option.push(OptionList.Option(Actor.click.loot,[OptionList.ACTOR,act.id],'Loot'));
	if(act.skillPlot)	option.push(OptionList.Option(Actor.click.skillPlot,[OptionList.ACTOR,act.id],'Harvest'));
	if(act.pushable) option.push(OptionList.Option(Actor.click.pushable,[OptionList.ACTOR,act.id],'Push'));
	if(act.toggle) option.push(OptionList.Option(Actor.click.toggle,[OptionList.ACTOR,act.id],'Interact With'));
	if(act.teleport) option.push(OptionList.Option(Actor.click.teleport,[OptionList.ACTOR,act.id],'Teleport'));
	if(act.bank) option.push(OptionList.Option(Actor.click.bank,[OptionList.ACTOR,act.id],'Bank'));
	if(act.signpost) option.push(OptionList.Option(Actor.click.signpost,[OptionList.ACTOR,act.id],'Read'));
	
	if(option.length === 0) return null;
	return Actor.OptionList(act.name,option);
}

Actor.remove = function(act){
	if(typeof act === 'string') act = Actor.LIST[act];
	Maps.leave(act,act.map,true);
	if(Actor.isPlayer(act)) 
		delete Actor.USERNAME_TO_ID[act.username];
	Actor.removeFromList(act.id);
	ActiveList.removeFromList(act.id);
	if(act.group) ActorGroup.removeActorFromGroup(act);
	if(act.summoned)
		Actor.summon.removeFromParentList(act);

}

Actor.setWeakness = function(act){
	var min = CST.bigInt;
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
	return SERVER ? {x:act.mouseX,y:act.mouseY} : Input.getMouse();
}
	
Actor.getMain = function(act){	//accept string key and object
	return SERVER ? Main.get(act.id || act) : main;
}

Actor.Map = function(map){
	return map;
}	

Actor.Map.compressClient = function(name){
	//used for instanced. client doesnt need to know its instanced
	return Maps.getModel(name);
}

//####################################

Actor.HitHistory = function(num){
	return num;
}
Actor.HitHistoryToDraw = function(num){
	return {
		num:num || 0,
		timer:20,
	};
}
Actor.HitHistoryToDraw.loop = function(act){
	while(act.hitHistoryToDraw.length > 5)
		act.hitHistoryToDraw.shift();

	for(var i = act.hitHistoryToDraw.length-1; i>=0 ;i--){
		if(act.hitHistoryToDraw[i].timer-- < 0)
			act.hitHistoryToDraw.splice(i,1);
	}
}


Actor.addHitHistory = function(act,num){
	act.hitHistory.push(num);
	Actor.setFlag(act,'hitHistory');
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
	if(!act.quest) return null;
	return Quest.get(act.quest).zone || null;
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


Actor.changeSprite = function(act,info){
	Sprite.change(act,info);
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

})(); //{



