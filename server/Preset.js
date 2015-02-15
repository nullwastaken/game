//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Preset = exports.Preset = {};
Preset.create = function(quest,id,ability,equip,noReputation,pvp,noAttack,noCombat){
	var tmp = {
		quest:quest || '',
		id:id || '',
		ability:ability || false,
		equip:equip || false,
		noReputation:noReputation || false,
		pvp:pvp || false,
		noAttack:noAttack || false,
		noCombat:noCombat || false,
	};

	DB[id] = tmp;
	return tmp;
}

var DB = Preset.DB = {};
Preset.get = function(id){
	return DB[id];
}
//for ability and equip constructor, check QuestAPI_new
//Actor.updatePreset















