
"use strict";
(function(){ //}
var OptionList, Sprite, Combat, Dialog, Entity, QueryDb;
global.onReady(function(){
	Entity = rootRequire('shared','Entity'); OptionList = rootRequire('shared','OptionList'); Sprite = rootRequire('shared','Sprite'); Combat = rootRequire('server','Combat');
	Dialog = rootRequire('client','Dialog',true); QueryDb = rootRequire('shared','QueryDb',true);
});
var Actor = rootRequire('shared','Actor');

var C = CST.CHANGE;
var NOT_DISPLAY_HP_IF_BELOW = 5;

Actor.doInitPack = function(act,player){
	var extra = {};
	if(act.block)
		extra.block = act.block;
	if(act.safeZoneRadius)
		extra.safeZoneRadius = act.safeZoneRadius;
	
	if(act.nevercombat){
		return [
			Entity.TYPE.actor,
			Math.round(act.x),			//1
			Math.round(act.y),
			Math.round(act.angle),		//3
			act.sprite.name,
			act.sprite.sizeMod || 1,	//5
			Math.round(act.maxSpd),
			act.context,				//7
			act.minimapIcon||'',
			act.optionList,				//9
			extra,						
			act.interactionMaxRange,	//11
			act.name,
		];	
	}
	
	return [
		Entity.TYPE.actor,
		Math.round(act.x),				//1
		Math.round(act.y),
		Math.round(act.angle),			//3
		act.sprite.name,
		act.sprite.sizeMod || 1,		//5
		Math.round(act.maxSpd),
		act.context,					//7
		act.minimapIcon||'',			
		act.optionList,					//9	
		Math.round(act.hp),				
		Math.round(act.hpMax),			//11	
		act.weakness.resist||'',		
		act.weakness.weak||'',			//13
		+Combat.damageIf(act,player),
		extra,							//15
		act.interactionMaxRange,
		act.name,						//17
		act.type,	//npc or player, at the end cuz lazy to change order
		act.combatType,					//19
	];
}

Actor.undoInitPack = function(draw,id){	//client constructor
	var act = new Actor({
		map:w.player.map,
		mapModel:w.player.map,
		id:id,
		x:draw[1],
		y:draw[2],
		serverX:draw[1],
		serverY:draw[2],
		angle:draw[3],
		sprite:Sprite.create(draw[4],draw[5]),
		maxSpd:draw[6],
		context:draw[7],
		minimapIcon:draw[8],
	});
	act.optionList = Actor.undoInitPack.generateOptionList(act,draw[9]);
	var extra;
	if(draw.length === 13){
		act.type = CST.ENTITY.npc;
		act.preventAbility = true;
		act.hp = 1;
		act.hpMax = 1;
		act.combat = false;
		extra = draw[10];
		act.interactionMaxRange = draw[11];
		act.name = draw[12];
	} else {
		act.type = draw[18];
		act.combatType = draw[19];
		act.preventAbility = false;
		act.hp = draw[10];
		act.hpMax = draw[11];
		act.weakness = Actor.Weakness(draw[12],draw[13]);
		act.context = Actor.undoInitPack.generateContext(act);
		act.combat = true;
		extra = draw[15];
		act.interactionMaxRange = draw[16];
		act.name = draw[17];
	}
	if(act.hpMax < NOT_DISPLAY_HP_IF_BELOW)
		act.hideHpBar = true;
	
	Tk.fillExtra(act,extra);
	
	if(act.sprite.name === 'Qtutorial-tree')
		Sprite.initGlitch(act);
	
	
	return act;
}

Actor.undoInitPack.generateContext = function(act){	//use weakness	//BAD...
	if(act.type === 'player' || !act.weakness.weak || (!act.weakness.weak && !act.weakness.resist)) 
		return act.context;
		
		
	var span = $('<span>')
		.html(act.context + '<br>');
	if(act.weakness.weak){
		span.append("Weak: ");
		span.append($('<span>')
			.html(CST.element.toCaps[act.weakness.weak])
			.css({color:CST.element.toColor[act.weakness.weak]})
			.addClass('shadow')
		);
		if(act.weakness.resist) span.append(' - ');
	}
	if(act.weakness.resist){
		span.append("Resist: ");
		span.append($('<span>')
			.html(CST.element.toCaps[act.weakness.resist])
			.css({color:CST.element.toColor[act.weakness.resist]})
			.addClass('shadow')
		);
	}
	
	return span.html();
}

Actor.undoInitPack.generateOptionList = function(act,optionList){	//recreate optionList, atm no func but gonna add func so send info to server when click
	return OptionList.uncompressClient(optionList,CST.COMMAND.actorOptionList,act.id);
}

Actor.createFromInitPack = function(obj,id){
	var act = Actor.undoInitPack(obj,id);
	Actor.addToList(act);
	Entity.addToList(act);
}

//x.Actor.addDummy(act.x,x.Actor.getSpriteLegY(act))
Actor.addDummy = function(x,y,relativeToPlayer){	//for debug
	if(relativeToPlayer){
		x += w.player.x;
		y += w.player.y;
	}
	var act = new Actor({
		map:w.player.map,
		mapModel:w.player.map,
		id:'dummy-' + Math.randomId(),
		x:x,
		y:y,
		serverX:x,
		serverY:y,
		combat:false,
		move:false,
		angle:0,
		dummy:true,
		sprite:Sprite.create('square-red',0.15),
	});
	DUMMY_LIST.push(act.id);
	Actor.addToList(act);
	Entity.addToList(act);
}
var DUMMY_LIST = [];
Actor.removeDummy = function(){
	for(var i = 0 ; i < DUMMY_LIST.length; i++)
		Actor.remove(Actor.get(DUMMY_LIST[i]));
	DUMMY_LIST = [];
}


//#############
Actor.setChangeAll = function(frame){
	for(var i in Actor.LIST){	
		var act = Actor.LIST[i];
		Actor.generateChange(act,frame);
	}
}
	
Actor.generateChange = function(act,frame,force){	//compressXYA 
	if(!act.active && !force) 
		return;
	if(Actor.isPlayer(act)){
		Actor.generateChange.player(act,frame);
		Actor.generatePrivChange(act,frame);
		act.privateChange = Actor.compressXYA(act.privateChange);
	} else {
		Actor.generateChange.npc(act,frame);
	}
	act.change = Actor.compressXYA(act.change);
}

Actor.generateChange.npc = function(act,frame){
	var old = act.changeOld;
	if(!act.nevermove){
		if(frame % 2 === 0){
			var serverX = Math.floor(act.x); if(old.serverX !== serverX) act.change[C.serverX] = old.serverX = serverX;
			var serverY = Math.floor(act.y); if(old.serverY !== serverY) act.change[C.serverY] = old.serverY = serverY;
		}
		if(frame % 4 === 0){
			var angle = Math.floor(act.angle/15)*15+1;	if(old.angle !== angle) act.change[C.angle] = old.angle = angle;
			if(act.change[C.hitHistory])
				act.hitHistory = [];
		}
	}
	if(!act.nevercombat){
		if(frame % 6 === 0){
			var hp = Math.floor(act.hp);	if(old.hp !== hp) act.change.hp = old.hp = hp;
			if(old.statusClient !== act.statusClient) act.change.statusClient = old.statusClient = act.statusClient;
		}
		if(frame % 24 === 0){
			var x = Math.floor(act.hpMax);	if(old.hpMax !== x) act.change.hpMax = old.hpMax = x; 
			if(old.combat !== act.combat) act.change.combat = old.combat = act.combat; 
		}
	}
	if(frame % 6 === 0){
		if(act.chatHead){ act.change.chatHead = act.chatHead; act.chatHead = null; }
	}
	/*if(frame % 6 === 0){
		if(act.sprite.anim){ act.change[C.sprite_anim] = act.sprite.anim; act.sprite.anim = ''; }
	}*/
	
}

Actor.generateChange.player = function(act,frame){ 
	var old = act.changeOld;
	if(frame % 2 === 0){
		var serverX = Math.floor(act.x); if(old.serverX !== serverX) act.change[C.serverX] = old.serverX = serverX;
		var serverY = Math.floor(act.y); if(old.serverY !== serverY) act.change[C.serverY] = old.serverY = serverY;
	}
	if(frame % 4 === 0){
		var angle = Math.floor(act.angle); if(old.angle !== angle) act.change[C.angle] = old.angle = angle;	//
		if(act.change[C.hitHistory])	//BAD
			act.hitHistory = [];
	}
	if(frame % 6 === 0){
		var hp = Math.floor(act.hp);	if(old.hp !== hp) act.change.hp = old.hp = hp;
		if(old.statusClient !== act.statusClient) act.change.statusClient = old.statusClient = act.statusClient;
		
		if(act.sprite.anim){ act.change[C.sprite_anim] = act.sprite.anim; act.sprite.anim = ''; }
		if(act.chatHead){ act.change.chatHead = act.chatHead; act.chatHead = null; }
	}
	if(frame % 24 === 0){
		var x = Math.floor(act.hpMax);	if(old.hpMax !== x) act.change.hpMax = old.hpMax = x; 
		if(old.combat !== act.combat) act.change.combat = old.combat = act.combat; 
	}	
}

Actor.setChange = function(act,what,value,append){	//good if no compression and changed a 1 place
	if(!what)
		return ERROR(3,'invalid what');
	if(Array.isArray(act.change))
		return ERROR(3,'act.change is array');
	if(!append){
		act.change[what] = value;
		return;
	}
	act.change[what] = act.change[what] || [];
	act.change[what].push(value);
}

Actor.setPrivateChange = function(act,what,value,append){	//good if no compression and changed a 1 place
	if(act.type !== CST.ENTITY.player)
		return ERROR(3,'cant set private change to non-player');
	if(Array.isArray(act.privateChange))
		return ERROR(3,'act.privateChange is array');
	if(!what)
		return ERROR(3,'invalid what');
	if(!append){
		act.privateChange[what] = value;
		return;
	}
	act.privateChange[what] = act.privateChange[what] || [];
	act.privateChange[what].push(value);
}

Actor.generatePrivChange = function(act,frame){ //compress: ac,
	for(var i in act.change)
		act.privateChange[i] = act.change[i];
	
	if(frame % 8 === 0){
		for(var i in act.flag)
			act.privateChange[i] = act.flag[i](act);
		act.flag = {};
	}

	if(frame % 6 === 0){
		var mana = Math.floor(act.mana);	if(act.privateOld.mana !== mana) act.privateChange.mana = act.privateOld.mana = mana; 
		if(act.privateOld.atkSpd !== act.atkSpd) act.privateChange.atkSpd = act.privateOld.atkSpd = act.atkSpd; 
		if(act.privateOld.combat !== act.combat) act.privateChange.combat = act.privateOld.combat = act.combat; 
		if(act.privateOld.move !== act.move) act.privateChange.move = act.privateOld.move = act.move; 
		if(act.privateOld.noAbility !== act.noAbility) act.privateChange.noAbility = act.privateOld.noAbility = act.noAbility;
		if(act.privateOld[C.abilityChange_chargeClient] !== act.abilityChange.chargeClient) act.privateChange[C.abilityChange_chargeClient] = act.privateOld[C.abilityChange_chargeClient] = act.abilityChange.chargeClient;
	}
	if(frame % 24 === 0){
		var x = Math.floor(act.manaMax);	if(act.privateOld.manaMax !== x) act.privateChange.manaMax = act.privateOld.manaMax = x; 
		if(act.privateOld.ghost !== act.ghost){ act.privateOld.ghost = act.privateChange.ghost = act.ghost; }  
	}
}

Actor.setFlag = function(act,what,func){ //only works for privChange, good if compression
	act.flag[what] = func;
}

Actor.resetChangeForAll = function(){
	for(var i in Actor.LIST){ 
		var act = Actor.get(i);
		act.change = {};
		if(Actor.isPlayer(act)){
			act.privateChange = {}; 	
			act.removeList = [];
		}
	}
}

//#############

Actor.uncompressChange = function(change){
	return Actor.uncompressXYA(change);
}


Actor.onChange(C.abilityChange_chargeClient,function(act,data){
	act.abilityChange.chargeClient = Actor.ability.chargeClient.uncompressClient(data);
});
Actor.onChange('ability',function(act,data){
	act.ability = Actor.Ability.uncompressClient(data);
});
Actor.onChange('abilityList',function(act,data){
	act.abilityList = Actor.AbilityList.uncompressClient(data);
	
	setTimeout(function(){	//BAD idk why needed...
		var list = Actor.getAbilityList(act);
		var time = 0;
		var query = function(i){
			return function(){
				QueryDb.get('ability',i);
			};
		}
		for(var i in list)
			setTimeout(query(i),time++*100);
	},5000);
});
Actor.onChange('equip',function(act,data){
	var oldWeapon = Actor.getWeaponType(act);
	act.equip = Actor.Equip.uncompressClient(data);
	Actor.equip.onWeaponChange(act,oldWeapon,Actor.getWeaponType(act));
});
Actor.onChange(C.sprite_anim,function(act,data){
	act.sprite.anim = data;
});
Actor.onChange(C.hitHistory,function(act,data){
	for(var i = 0; i < data.length; i++){
		act.hitHistoryToDraw.push(Actor.HitHistoryToDraw(data[i]));	
	}
});
Actor.onChange(C.curseClient,function(act,data){
	act.curseClient = data;
});
Actor.onChange('skill',function(act,data){
	act.skill = data;
	Dialog.open('expPopup',data.exp - Actor.getExp(act))
});

Actor.onChange('questMarker',function(act,data){
	act.questMarker = data;
	Actor.questMarker.update(act);
});
Actor.onChange('permBoost',function(act,data){
	act.permBoost = data;
	Actor.permBoost.update(act);
});
Actor.onChange('x',function(act,data){	//note: normally its serverX that changes. x => teleport
	if(act === w.player){
		act.x = data;
		Actor.bumper.update(act);
		act.spdX = 0;
		act.spdY = 0;
	}
});
Actor.onChange('y',function(act,data){
	if(act === w.player){
		act.y = data;
		Actor.bumper.update(act);
		act.spdX = 0;
		act.spdY = 0;
	}
});


Actor.compressXYA = function(change){
	//if only change is x,y and angle, compress it into [x,y,angle]	
	if(change[C.serverX] === undefined)
		return change;
	var length = Object.keys(change).length;
	if(length === 1)	//only x
		return [change[C.serverX]];
	if(change[C.serverY] === undefined)	//x && !y
		return change;
	if(length === 2)	//only x y
		return [change[C.serverX],change[C.serverY]];
	if(change[C.angle] === undefined){	//x && y && !a
		change.xy = [change[C.serverX],change[C.serverY]];
		delete change[C.serverX];
		delete change[C.serverY];
		return change;
	}
	if(length === 3)	//only x y a
		return [change[C.serverX],change[C.serverY],change[C.angle]];

	change.xya = [change[C.serverX],change[C.serverY],change[C.angle]];
	delete change[C.serverX];
	delete change[C.serverY];
	delete change[C.angle];
	return change;
}

Actor.uncompressXYA = function(info){
	if(info instanceof Array && info.length === 3) 
		return {serverX:info[0],serverY:info[1],angle:info[2]};
	if(info instanceof Array && info.length === 2) 
		return {serverX:info[0],serverY:info[1]};
	if(info instanceof Array && info.length === 1) 
		return {serverX:info[0]};
	if(info.xya){ 
		info.serverX = info.xya[0]; 
		info.serverY = info.xya[1]; 
		info.angle = info.xya[2]; 
		delete info.xya;
		delete info.xy;
		return info;
	}
	if(info.xy){ 
		info.serverX = info.xy[0]; 
		info.serverY = info.xy[1]; 
		delete info.xya;
		delete info.xy;
		return info;
	}
	if(info[C.angle] !== undefined){ 
		info.angle = info[C.angle]; 
		delete info[C.angle]; 
	}
	if(info[C.serverX] !== undefined){ 
		info.serverX = info[C.serverX];
		delete info[C.serverX]; 
	}
	if(info[C.serverY] !== undefined){ 
		info.serverY = info[C.serverY];
		delete info[C.serverY];
	}
	return info;
}

Actor.applyChange = function(act,change){ //note: if map changes, its done in Receive.freeze
	if(!change) 
		return;
	change = Actor.uncompressChange(change);
	for(var i in change)
		if(Actor.onChange.have(i))
			Actor.onChange.pub(i,act,change[i],change);
	//must be separated to respect priority
	for(var i in change)
		if(!Actor.onChange.have(i))
			Tk.viaArray.set(act,i.split(','),change[i]);	
}

Actor.getSignInPack = function(act){	//for player sign in
	return {
		name:act.name,
		username:act.username,
		id:act.id,
		x:act.x,
		y:act.y,
		map:Actor.Map.compressClient(act.map,act),
		equip:Actor.Equip.compressClient(act.equip,act),
		ability:Actor.Ability.compressClient(act.ability,act),
		abilityList:Actor.AbilityList.compressClient(act.abilityList,act),
		skill:act.skill,
		permBoost:act.permBoost,
		'sprite,name':act.sprite.name,	//bad... should compress and uncompress,
	};
}

Actor.compressDb = function(act){
	var tmp = {
		ability:Actor.Ability.compressDb(act.ability),
		abilityList:Actor.AbilityList.compressDb(act.abilityList),
		equip:Actor.Equip.compressDb(act.equip),
		respawnLoc:Actor.RespawnLoc.compressDb(act.respawnLoc),
		//
		username:act.username,
		name:act.name,
		skill:Actor.Skill.compressDb(act.skill),
	}
	if(!Actor.getDbSchema()(tmp))
		ERROR(3,'invalid player schema',JSON.stringify(Actor.getDbSchema().errors(tmp)),tmp);
	
	return tmp;
}

var schema;
Actor.getDbSchema = function(){
	schema = schema || require('js-schema')({
		ability:Actor.Ability.getDbSchema(),
		abilityList:Actor.AbilityList.getDbSchema(),
		equip:Actor.Equip.getDbSchema(),		
		respawnLoc:Actor.RespawnLoc.getDbSchema(),
		username:String,
		name:String,
		skill:Actor.Skill.getDbSchema(),
		'*':null
	});
	return schema;
}

Actor.uncompressDb = function(act,key){
	try {
		if(!Actor.getDbSchema()(act))
			return ERROR(3,'invalid player schema',JSON.stringify(Actor.getDbSchema().errors(act)),act);
		
		
		act.equip = Actor.Equip.uncompressDb(act.equip);
		act.ability = Actor.Ability.uncompressDb(act.ability);
		act.abilityList = Actor.AbilityList.uncompressDb(act.abilityList);
		act.abilityChange = Actor.AbilityChange(act.ability.normal);	//bad...
		act.respawnLoc = Actor.RespawnLoc.uncompressDb(act.respawnLoc);
		
		act.skill = Actor.Skill.uncompressDb(act.skill);
		
		act.context = act.name;
		act.id = key;
		return act;
	} catch(err){ 
		ERROR.err(3,err,'error with uncompress Db');
		return null;
	}
}




})(); //{
