//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var ReputationGrid = require2('ReputationGrid'), Message = require2('Message'), Actor = require2('Actor'), Main = require2('Main');
var Img = require4('Img'), Stat = require4('Stat');
var ReputationConverter = exports.ReputationConverter = {};

var DB = {};
var GROUP = [];

ReputationConverter.create = function(id,name,description,func,getButtonAppend){
	var tmp = {
		id:id || '',
		name:name || '',
		description:description || '',
		func:func || function(a){ return a; },
		getButtonAppend:getButtonAppend || function(){ return ''; },
	};
	DB[id] = tmp;
	return tmp;
}


ReputationConverter.get = function(id){
	return DB[id];
}

//main.reputation.list[0].converter.push('test')

ReputationConverter.getConvertedGrid = function(listConverter){
	var rawGrid = Tk.deepClone(ReputationGrid.get());
	for(var i in listConverter){
		var conv = ReputationConverter.get(listConverter[i]);
		if(!conv){
			ERROR(3,'converter doesnt exist: ' + listConverter[i]);
			continue;			
		}
		rawGrid = conv.func(rawGrid);
	}
	return rawGrid;	
}


var helper = function(before,after){
	if(!Array.isArray(before)) before = [before];
	if(!Array.isArray(after)) after = [after];
	
	return function(grid){
		var b = grid.base;	//2d array
		for(var i in b){
			for(var j in b[i]){
				for(var k in before)
					if(b[i][j].stat === before[k])
						b[i][j].stat = after[k];
			}
		}
		return grid;
	}
}


var helper2 = function(icon1,icon2){
	var button = $('<button>');
	var div = $('<div>').css({pointerEvents:'none'});
	div.append(
		Img.drawIcon.html(icon1,20),' -> ',Img.drawIcon.html(icon2,20)
	);
	button.append(div);
	return button;
}


ReputationConverter.Group = function(lvl,list){
	var tmp = {
		list:list,
		lvl:lvl,	
	}
	GROUP.push(tmp);
	return tmp;	
}	

ReputationConverter.getGroup = function(){
	return GROUP;
}

ReputationConverter.canSelect = function(main,num,converterId){
	var lvl = Actor.getLevel(Main.getAct(main));
	var conv = ReputationConverter.get(converterId);
	if(!conv) return ERROR(3,'no conv'); //error
	var group = ReputationConverter.findGroup(conv);
	if(group.lvl > lvl) 
		return Message.addPopup(main.id,"You need to be at least level " + group.lvl + " to select that converter.");
	
	var convList = Main.reputation.get(main,num).converter;
	for(var i in group.list){
		if(convList.$contains(group.list[i]))
			convList.$remove(group.list[i]);
		//return Message.addPopup(main.id,"Incompatiblity. You already have a converter of that group (" +  ReputationConverter.get(group.list[i]).name + ").");
	}
	return true;	
}

ReputationConverter.findGroup = function(conv){
	for(var i in GROUP)
		if(GROUP[i].list.$contains(conv.id))
			return GROUP[i];
	return null;
};	

(function(){ //}
	ReputationConverter.create('dmgMeleeRange','Dmg ML -> Dmg RG','Convert every Dmg Melee Boost into Dmg Range Boost',
		helper('dmg-melee-+','dmg-range-+'),
		function(){ return helper2(Stat.get('dmg-melee-+').icon,Stat.get('dmg-range-+').icon); }
	);
	ReputationConverter.create('dmgRangeMagic','Dmg RG -> Dmg MG','Convert every Dmg Range Boost into Dmg Magic Boost',
		helper('dmg-range-+','dmg-magic-+'),
		function(){ return helper2(Stat.get('dmg-range-+').icon,Stat.get('dmg-magic-+').icon); }
	);
	ReputationConverter.create('dmgMagicMelee','Dmg MG -> Dmg ML','Convert every Dmg Magic Boost into Dmg Melee Boost',
		helper('dmg-magic-+','dmg-melee-+'),
		function(){ return helper2(Stat.get('dmg-magic-+').icon,Stat.get('dmg-melee-+').icon); }
	);

	ReputationConverter.create('dmgFireCold','Dmg FR -> Dmg CD','Convert every Dmg Fire Boost into Dmg Cold Boost',
		helper('dmg-fire-+','dmg-cold-+'),
		function(){ return helper2(Stat.get('dmg-fire-+').icon,Stat.get('dmg-cold-+').icon); }
	);
	ReputationConverter.create('dmgColdLightning','Dmg CD -> Dmg LG','Convert every Dmg Cold Boost into Dmg Lightning Boost',
		helper('dmg-cold-+','dmg-lightning-+'),
		function(){ return helper2(Stat.get('dmg-cold-+').icon,Stat.get('dmg-lightning-+').icon); }
	);
	ReputationConverter.create('dmgFireLightning','Dmg LG -> Dmg FR','Convert every Dmg Lightning Boost into Dmg Fire Boost',
		helper('dmg-lightning-+','dmg-fire-+'),
		function(){ return helper2(Stat.get('dmg-lightning-+').icon,Stat.get('dmg-fire-+').icon); }
	);

	ReputationConverter.create('hpLeech','Hp -> Life Leech','Convert every Hp Boost into Life Leech Boost',
		helper(['hp-max','hp-regen'],['leech-chance','leech-magn']),
		function(){ return helper2(Stat.get('hp-max').icon,Stat.get('leech-magn').icon);}
	);
	ReputationConverter.create('leechMana','Life Leech -> Mana','Convert every Life Leech Boost into Mana Boost',
		helper(['leech-chance','leech-magn'],['mana-max','mana-regen']),
		function(){ return helper2(Stat.get('leech-magn').icon,Stat.get('mana-max').icon);}
	);
	ReputationConverter.create('manaHp','Mana -> Hp','Convert every Mana Boost into Hp Boost',
		helper(['mana-max','mana-regen'],['hp-max','hp-regen']),
		function(){ return helper2(Stat.get('mana-max').icon,Stat.get('hp-max').icon);}
	);

	ReputationConverter.create('critAmount','Crit -> Bullet Amount','Convert every Crit Boost into Bullet Amount Boost',
		helper(['crit-chance','crit-magn'],['bullet-amount','bullet-amount']),
		function(){ return helper2(Stat.get('crit-chance').icon,Stat.get('bullet-amount').icon);}
	);
	ReputationConverter.create('amountSpd','Bullet Amount -> Atk Spd','Convert every Bullet Amount Boost into Atk Spd Boost',
		helper(['bullet-amount'],['atkSpd']),
		function(){ return helper2(Stat.get('bullet-amount').icon,Stat.get('atkSpd').icon);}
	);
	ReputationConverter.create('spdCrit','Atk Spd -> Crit','Convert every Atk Spd Boost into Crit Boost',
		helper(['atkSpd'],['crit-magn']),
		function(){ return helper2(Stat.get('atkSpd').icon,Stat.get('crit-magn').icon);}
	);

	ReputationConverter.Group(3,['dmgMeleeRange','dmgRangeMagic','dmgMagicMelee']);
	ReputationConverter.Group(6,['dmgFireCold','dmgColdLightning','dmgFireLightning']);
	ReputationConverter.Group(10,['hpLeech','leechMana','manaHp']);
	ReputationConverter.Group(14,['critAmount','amountSpd','spdCrit']);
})(); //{
/*

Lvl	14:
	crit -> bullet amount
	bullet amount -> atk spd
	atk spd -> crit

Lvl 19:	
	chance -> magn
	magn -> time 
	time -> chance
	
Lvl 24:
	0.03 -> 0.035	(all)
	0.03 -> 0.04 (dmg def)
	0.03 -> 0.05 (all but dmg def)
	
Lvl 30:	
	range -> melee
	melee -> magic
	magic -> range

Lvl 36:	
	cold -> fire
	fire -> lightning
	lightning -> cold
*/


//###################


})(); //{
























