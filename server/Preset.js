//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['Actor','Main']));

var Preset = exports.Preset = function(quest,id,ability,equip,noReputation,pvp,noAttack,noCombat){
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
Preset.Ability = function(ability){
	for(var i = ability.length; i < 6; i++)
		ability.push('');
	return ability;
}
Preset.Equip = function(equip){
	for(var i in CST.equip.piece){
		var p = CST.equip.piece[i];
		equip[p] = equip[p] || '';
	}
}
















