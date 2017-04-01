
"use strict";
var Preset = exports.Preset = function(extra){
	this.quest = '';
	this.id = '';
	this.ability = false;
	this.equip = false;
	this.noReputation = false;
	this.pvp = false;
	this.noAbility = false;
	this.noCombat = false;
	this.noMove = false;
	Tk.fillExtra(this,extra);
};
Preset.create = function(quest,id,ability,equip,noReputation,pvp,noAbility,noCombat,noMove){
	var tmp = new Preset({
		quest:quest,
		id:id,
		ability:ability,
		equip:equip,
		noReputation:noReputation,
		pvp:pvp,
		noAbility:noAbility,
		noCombat:noCombat,
		noMove:noMove,
	});

	DB[id] = tmp;
	return tmp;
}

var DB = Preset.DB = {};
Preset.get = function(id){
	if(id[0] !== 'Q')
		id = 'Qsystem-' + id;
	return DB[id];
}
//for ability and equip constructor, check QuestAPI_new
//Actor.updatePreset















