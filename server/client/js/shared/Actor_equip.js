
"use strict";
(function(){ //}
var Achievement, Equip, Combat, Main, QueryDb,Command;
global.onReady(function(){
	Achievement = rootRequire('shared','Achievement'); Equip = rootRequire('server','Equip'); Combat = rootRequire('server','Combat'); Main = rootRequire('shared','Main');
	Command = rootRequire('shared','Command'); QueryDb = rootRequire('shared','QueryDb',true);
	
	Command.create(CST.COMMAND.removeEquip,Command.ACTOR,[ //{
		Command.Param('string','Equipement Piece',false,{whiteList:CST.equip.piece}),
	],Actor.removeEquip.onCommand); //}
	
	Command.create(CST.COMMAND.useEquip,Command.ACTOR,[ //{
		Command.Param('string','Equipement Id',false),
	],Actor.equip.click); //}
	
	
});
var Actor = rootRequire('shared','Actor');

Actor.Equip = function(normal,quest){
	return {
		normal:normal || Actor.Equip.Part(),
		quest:quest || Actor.Equip.Part(),
	}
};

Actor.Equip.Part = function(weapon,amulet,ring,helm,body){
	var equip = {
		piece:{helm:helm||'',amulet:amulet || '',ring:ring||'',body:body||'',weapon:weapon || ''},
		def:CST.element.template(1),
		dmg:CST.element.template(1),
	}
	//Actor.equip.updateDef(equip);	//bad... if do that, called for npc and npc has 0.5 def...
	return equip;
}

Actor.Equip.compressDb = function(equip){
	var tmp = [];
	for(var i in CST.equip.piece) 
		tmp.push(equip.normal.piece[CST.equip.piece[i]]);
	return tmp;
}

Actor.Equip.uncompressDb = function(equip){
	var equip = Actor.Equip(Actor.Equip.Part.apply(this,equip),null);
	return Actor.Equip.fixIntegrity(equip);	//assume Actor.Equip.fetch was called earlier
	//Message.add(key,'Sorry, we can\'t find the data about one or multiples equips you own... :('); 
}

Actor.Equip.getDbSchema = function(){
	return Array.of(String);
}

Actor.Equip.compressClient = function(equip,act){
	return Actor.getEquip(act);
}

Actor.Equip.uncompressClient = function(equip){
	return Actor.Equip(equip);
}

Actor.Equip.fetch = function(equip,username,cb){
	//equip compress is just array [ids]
	Equip.fetchList(equip,username,function(){
		cb();
	});
}

Actor.Equip.fixIntegrity = function(equip){
	for(var j in equip){
		for(var i in equip[j].piece){
			if(equip[j].piece[i] && !Equip.get(equip[j].piece[i])){
				ERROR(2,'cant find equip',equip[j].piece[i]);
				equip[j].piece[i] = '';
			}
		}
	}
	return equip;	
}

//#######################

Actor.equip = {};

Actor.equip.click = function(act,eid){	//called when clicking in inventory (item option)
	var equip = Equip.get(eid);
	if(!equip) return ERROR(3,'equip dont exist',eid);
	var main = Actor.getMain(act);
	if(!Main.haveItem(main,eid))
		return Main.error(main,"You don't have this equipment in your inventory.");
	
	if(act.combatContext.equip === 'quest' && Actor.getMain(act).questActive !== equip.quest)
		return Main.error(main,"You can only use equips you received from the quest you're doing.");
	if(Actor.getLevel(act) < equip.lvl)
		return Main.error(main,"You need to be at least level " + equip.lvl + " to use that equipment.");	
	Main.playSfx(main,'select');
	Actor.changeEquip(act,eid);
}

Actor.changeEquip = function(act,eid){
	var equip = Equip.get(eid);
	if(!equip) return ERROR(3,'equip dont exist',eid);
	Actor.removeEquip(act,equip.piece,true);
	//##
	Actor.getEquip(act).piece[equip.piece] = equip.id;
	Main.removeItem(Actor.getMain(act),equip.id);
	Actor.equip.update(act);
	Achievement.onEquipChange(Actor.getMain(act),eid);
	Actor.refreshNormalSprite(act);
}

Actor.removeEquip = function(act,piece){
	var equip = Actor.getEquip(act);
	var old = equip.piece[piece];
	if(old) //add old item if it wasnt empty
		Main.addItem(Actor.getMain(act),old);
	equip.piece[piece] = '';
	Actor.equip.update(act);
	Actor.refreshNormalSprite(act);
	return old;
}
Actor.removeEquip.onCommand = function(act,piece){
	Actor.removeEquip(act,piece,false);
}

Actor.haveEquip = function(act,eid){
	var equip = Actor.getEquip(act);
	for(var i in equip.piece)
		if(equip.piece[i] === eid)
			return true;
	return false;
}

Actor.getEquip = function(act){
	return act.equip[act.combatContext.equip || 'normal'];
}

Actor.equip.update = function(act){	//accept act or equip directly
	if(act.type !== CST.ENTITY.player) return;
	var equip = Actor.getEquip(act);
	
	Actor.equip.updateDef(equip);

	//Boost
	for(var i in equip.piece){
		if(!equip.piece[i]){
			Actor.addPermBoost(act,'equip-' + i);	 //have nothing so reset
			continue;	//no equip on that slot
		}
		var eq = Equip.get(equip.piece[i]);
		if(eq) 
			Actor.addPermBoost(act,'equip-' + i,eq.boost);		//have something
	}
	Actor.setFlag(act,'equip',function(act){
		return Actor.Equip.compressClient(act.equip,act);
	});
}

Actor.equip.updateDef = function(equip){
	for(var i in equip.def){	//Each Element
		var sum = 0;
		for(var j in equip.piece){	//Each Piece
			if(!equip.piece[j]) continue;	//no equip on that slot
			var eq = Equip.get(equip.piece[j]);
			if(!eq){ 
				ERROR(3,'no equip',equip.piece[j]); 
				continue; 
			}
			var toAdd = eq.def.main * eq.def.ratio[i];
			if(isNaN(toAdd))
				ERROR(3,'isNaN updateDef',eq.name,eq);
			else
				sum += toAdd;
		}
		
		equip.def[i] = Math.max(sum,Combat.MIN_EQUIP_DEF);
	}
}

Actor.getWeapon = function(act){
	return Actor.getEquip(act).piece.weapon || CST.UNARMED;
}

Actor.getWeaponType = function(act,cb){
	var eid = Actor.getWeapon(act);
	if(eid === CST.UNARMED)
		return null;
	if(SERVER)
		return Equip.get(eid).type;
	var equip = QueryDb.get('equip',eid,cb);
	if(!equip) 
		return null;
	return equip.type;
}




//#########

var ABILITY_WEAPON_TYPE = {
	melee:[],
	range:[],
	magic:[],
	first:true,
};

Actor.equip.onWeaponChange = function(act,oldType,newType){	//client only
	if(ABILITY_WEAPON_TYPE.first){	//aka not do that on first data receive
		ABILITY_WEAPON_TYPE.first = false;
		return;
	}
	if(newType === null)
		return;
	if(act.combatContext.ability !== 'normal' || act.combatContext.equip !== 'normal')
		return;
	
	if(oldType !== null){
		var oldElement = CST.equip.weaponTypeToMainElement[oldType];
		ABILITY_WEAPON_TYPE[oldElement] = Tk.deepClone(Actor.getAbility(act));
	}
	
	var newElement = CST.equip.weaponTypeToMainElement[newType];
	if(ABILITY_WEAPON_TYPE[newElement].length === 0)
		fillEmptyAbList(newElement);
	
	assignAbility(newElement);
}

var assignAbility = function(type){
	var array = ABILITY_WEAPON_TYPE[type];
	for(var i = 0 ; i < array.length; i++){
		if(!array[i])
			continue;
		Command.execute(CST.COMMAND.abilitySwap,[array[i],i]);
	}
}

var fillEmptyAbList = function(type){
	var refresh = function(){
		fillEmptyAbList(type);
		assignAbility(type);
	}
	var array = ABILITY_WEAPON_TYPE[type];
	
	var abList = Actor.getAbilityList(w.player);
	for(var i in abList){
		var ab = QueryDb.get('ability',i,refresh);
		if(ab.type !== 'attack')
			continue;
		if((type === 'melee' && ab.weaponReq.$contains('mace'))
			|| (type === 'range' && ab.weaponReq.$contains('bow'))
			|| (type === 'magic' && ab.weaponReq.$contains('wand'))){
			var isSpec = Actor.ability.isSpecialAttack(ab);
			if(isSpec){
				if(!array[2])
					array[2] = ab.id;
				else
					array[3] = ab.id;
			} else {
				if(!array[0])
					array[0] = ab.id;
				else
					array[1] = ab.id;
			}
		}
	}
}

})();

