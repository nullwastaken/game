//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var IconModel = exports.IconModel = {};
IconModel.create = function(id,list,size){
	size = size || 48;
	if(DB[id]) 
		return ERROR(3,'id already taken',id);
	
	for(var i = 0 ; i < list.length; i++){
		var myId = id + '-' + list[i];
		var tmp = {
			id:myId,
			size:size,
			src:"img/ui/icon/" + myId + ".png",
			img:null,
		};
		DB[myId] = tmp;
	}
}
IconModel.get = function(id){
	return DB[id] || ERROR(3,'invalid icon',id) || DB['system-square'];
}
IconModel.testIntegrity = function(id){
	if(!DB[id])
		ERROR(3,'invalid icon',id);
}


var DB = IconModel.DB = {};

IconModel.init = function(){
	IconModel.create('system',["square","close","gold","question","flag"]);
	IconModel.create('color',["red","yellow","cyan","green","purple","orange"]);
	IconModel.create('system1',["more","less"]);
	IconModel.create('tab',["equip","inventory","quest","skill","friend","pref","ability","reputation"]);
	IconModel.create('element',["melee","range","magic","fire","cold","lightning","melee2","range2","magic2","fire2","cold2","lightning2"]);
	IconModel.create('status',["bleed","knock","drain","burn","chill","stun"]);
	IconModel.create('resource',["hp","mana"]);
	IconModel.create('minimapIcon',["quest","tree","trap","rock","door","questMarker"]);
	IconModel.create('offensive',["pierce","bullet","strike","leech","atkSpd"]);
	IconModel.create('defensive',["speed","pickup","life","magicFind"]);
	IconModel.create('attackMelee',["slash","scar","triple","slice","bleed","fierce","cube"]);
	IconModel.create('attackRange',["steady","bleed","rain","head"]);
	IconModel.create('attackMagic',["crystal","fireball","meteor","fire","ball","lightning","static"]);
	IconModel.create('blessing',["spike","muscle","reflect"]);
	IconModel.create('curse',["death","haunt","skull","stumble"]);
	IconModel.create('heal',["plus","vial","pill","cake","pot"]);
	IconModel.create('summon',["wolf"]);
	IconModel.create('misc',["clock"]);

	IconModel.create('weapon',["mace","spear","sword","bow","boomerang","crossbow","wand","staff","orb"]);
	IconModel.create('amulet',["ruby","sapphire","topaz"]);
	IconModel.create('helm',["metal","wood","bone"]);
	IconModel.create('ring',["ruby","sapphire","topaz"]);
	IconModel.create('body',["metal","wood","bone"]);
	IconModel.create('plan',["equip","ability","scroll","tool"]);
	IconModel.create('orb',["upgrade","boost","removal","water","ruby","sapphire","topaz"]);
	IconModel.create('metal',["metal"]);
	IconModel.create('chain',["chain"]);
	IconModel.create('wood',["wood"]);
	IconModel.create('leaf',["leaf"]);
	IconModel.create('bone',["bone"]);
	IconModel.create('hide',["hide"]);

	IconModel.create('villagerMale',['0','1','2','3','4','5','6','7','8','9'],128);
	IconModel.create('villagerFemale',['0','1','2','3','4','5','6','7','8','9'],128);
}
IconModel.init();	//cuz no dependcy

})(); //}