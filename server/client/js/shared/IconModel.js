
"use strict";
(function(){ //}
var IconModel = exports.IconModel = function(extra){
	this.id = '';
	this.size = 48;
	this.src = '';
	this.img = null;	//Image
	Tk.fillExtra(this,extra);
};

IconModel.create = function(myId,size){
	if(DB[myId]) 
		return ERROR(3,'id already taken',myId);
	
	var tmp = new IconModel({
		id:myId,
		size:size,
		src:"img/ui/icon/" + myId + ".png",
	});
	DB[myId] = tmp;
}
IconModel.get = function(id){
	return DB[id] || ERROR(3,'invalid icon',id) || DB['system-square'];
}
IconModel.testIntegrity = function(id){
	if(!DB[id])
		ERROR(3,'invalid icon',id);
}

IconModel.toText = function(id,size,title,extra){
	extra = extra || '';
	size = size || 20;
	if(!IconModel.get(id))
		return ERROR(3,'invalid icon',id);
	if(title)
		return '<img title="' + title + '" src="/img/ui/icon/' + id + '.png" width="' + size + 'px" ' + extra + '/>';
	return '<img src="/img/ui/icon/' + id + '.png" width="' + size + 'px" ' + extra + '/>';
}

var DB = IconModel.DB = {};

/*var extendColor = function(array){
	var ret = [];
	var list = ['','-white','-blue','-orange','-gold'];
	for(var i = 0 ; i < array.length; i++){
		for(var j = 0 ; j < list.length; j++){
			ret.push(array[i] + list[j]);
		}
	}	
	return ret;
}*/
	
IconModel.init = function(){
	IconModel.create('system-square');
	IconModel.create('system-close');
	IconModel.create('system-gold');
	IconModel.create('system-question');
	IconModel.create('system-flag');
	IconModel.create('system-target');
	IconModel.create('color-red');
	IconModel.create('color-yellow');
	IconModel.create('color-cyan');
	IconModel.create('color-green');
	IconModel.create('color-purple');
	IconModel.create('color-orange');
	IconModel.create('system1-more');
	IconModel.create('system1-less');
	IconModel.create('tab-worldMap');
	IconModel.create('tab-equip');
	IconModel.create('tab-achievement');
	IconModel.create('tab-highscore');
	IconModel.create('tab-sideQuest');
	IconModel.create('tab-contribution');
	IconModel.create('tab-inventory');
	IconModel.create('tab-quest');
	IconModel.create('tab-skill');
	IconModel.create('tab-friend');
	IconModel.create('tab-pref');
	IconModel.create('tab-ability');
	IconModel.create('tab-reputation');
	IconModel.create('element-melee');
	IconModel.create('element-range');
	IconModel.create('element-magic');
	IconModel.create('element-fire');
	IconModel.create('element-cold');
	IconModel.create('element-lightning');
	IconModel.create('element-melee2');
	IconModel.create('element-range2');
	IconModel.create('element-magic2');
	IconModel.create('element-fire2');
	IconModel.create('element-cold2');
	IconModel.create('element-lightning2');
	IconModel.create('status-bleed');
	IconModel.create('status-knock');
	IconModel.create('status-drain');
	IconModel.create('status-burn');
	IconModel.create('status-chill');
	IconModel.create('status-stun');
	IconModel.create('resource-hp');
	IconModel.create('resource-mana');
	IconModel.create(CST.ICON.quest);
	IconModel.create('minimapIcon-tree');
	IconModel.create('minimapIcon-trap');
	IconModel.create('minimapIcon-rock');
	IconModel.create('minimapIcon-door');
	IconModel.create(CST.ICON.questMarker);
	IconModel.create('worldMap-bank');
	IconModel.create(CST.ICON.waypoint);
	IconModel.create('worldMap-waypointLocked');
	IconModel.create('worldMap-sideQuest');
	IconModel.create('worldMap-shop');
	IconModel.create('worldMap-sideQuestComplete');
	IconModel.create('worldMap-questLocked');
	IconModel.create('worldMap-player');
	IconModel.create('worldMap-questComplete');
	IconModel.create('offensive-pierce');
	IconModel.create('offensive-bullet');
	IconModel.create('offensive-strike');
	IconModel.create('offensive-leech');
	IconModel.create('offensive-atkSpd');
	IconModel.create('defensive-speed');
	IconModel.create('defensive-pickup');
	IconModel.create('defensive-life');
	IconModel.create('defensive-magicFind');
	IconModel.create('attackMelee-slash');
	IconModel.create('attackMelee-scar');
	IconModel.create('attackMelee-triple');
	IconModel.create('attackMelee-slice');
	IconModel.create('attackMelee-bleed');
	IconModel.create('attackMelee-fierce');
	IconModel.create('attackMelee-cube');
	IconModel.create('attackRange-steady');
	IconModel.create('attackRange-bleed');
	IconModel.create('attackRange-rain');
	IconModel.create('attackRange-head');
	IconModel.create('attackMagic-crystal');
	IconModel.create('attackMagic-fireball');
	IconModel.create('attackMagic-meteor');
	IconModel.create('attackMagic-fire');
	IconModel.create('attackMagic-ball');
	IconModel.create('attackMagic-lightning');
	IconModel.create('attackMagic-static');
	IconModel.create('blessing-spike');
	IconModel.create('blessing-muscle');
	IconModel.create('blessing-reflect');
	IconModel.create('curse-death');
	IconModel.create('curse-haunt');
	IconModel.create('curse-skull');
	IconModel.create('curse-stumble');
	IconModel.create('heal-plus');
	IconModel.create('heal-vial');
	IconModel.create('heal-pill');
	IconModel.create('heal-cake');
	IconModel.create('heal-pot');
	IconModel.create('summon-wolf');
	IconModel.create('misc-clock');
	IconModel.create('weapon-mace');
	IconModel.create('weapon-mace-white');
	IconModel.create('weapon-mace-blue');
	IconModel.create('weapon-mace-orange');
	IconModel.create('weapon-mace-gold');
	IconModel.create('weapon-spear');
	IconModel.create('weapon-spear-white');
	IconModel.create('weapon-spear-blue');
	IconModel.create('weapon-spear-orange');
	IconModel.create('weapon-spear-gold');
	IconModel.create('weapon-sword');
	IconModel.create('weapon-sword-white');
	IconModel.create('weapon-sword-blue');
	IconModel.create('weapon-sword-orange');
	IconModel.create('weapon-sword-gold');
	IconModel.create('weapon-bow');
	IconModel.create('weapon-bow-white');
	IconModel.create('weapon-bow-blue');
	IconModel.create('weapon-bow-orange');
	IconModel.create('weapon-bow-gold');
	IconModel.create('weapon-boomerang');
	IconModel.create('weapon-boomerang-white');
	IconModel.create('weapon-boomerang-blue');
	IconModel.create('weapon-boomerang-orange');
	IconModel.create('weapon-boomerang-gold');
	IconModel.create('weapon-crossbow');
	IconModel.create('weapon-crossbow-white');
	IconModel.create('weapon-crossbow-blue');
	IconModel.create('weapon-crossbow-orange');
	IconModel.create('weapon-crossbow-gold');
	IconModel.create('weapon-wand');
	IconModel.create('weapon-wand-white');
	IconModel.create('weapon-wand-blue');
	IconModel.create('weapon-wand-orange');
	IconModel.create('weapon-wand-gold');
	IconModel.create('weapon-staff');
	IconModel.create('weapon-staff-white');
	IconModel.create('weapon-staff-blue');
	IconModel.create('weapon-staff-orange');
	IconModel.create('weapon-staff-gold');
	IconModel.create('weapon-orb');
	IconModel.create('weapon-orb-white');
	IconModel.create('weapon-orb-blue');
	IconModel.create('weapon-orb-orange');
	IconModel.create('weapon-orb-gold');
	IconModel.create('amulet-ruby');
	IconModel.create('amulet-ruby-white');
	IconModel.create('amulet-ruby-blue');
	IconModel.create('amulet-ruby-orange');
	IconModel.create('amulet-ruby-gold');
	IconModel.create('amulet-sapphire');
	IconModel.create('amulet-sapphire-white');
	IconModel.create('amulet-sapphire-blue');
	IconModel.create('amulet-sapphire-orange');
	IconModel.create('amulet-sapphire-gold');
	IconModel.create('amulet-topaz');
	IconModel.create('amulet-topaz-white');
	IconModel.create('amulet-topaz-blue');
	IconModel.create('amulet-topaz-orange');
	IconModel.create('amulet-topaz-gold');
	IconModel.create('helm-metal');
	IconModel.create('helm-metal-white');
	IconModel.create('helm-metal-blue');
	IconModel.create('helm-metal-orange');
	IconModel.create('helm-metal-gold');
	IconModel.create('helm-wood');
	IconModel.create('helm-wood-white');
	IconModel.create('helm-wood-blue');
	IconModel.create('helm-wood-orange');
	IconModel.create('helm-wood-gold');
	IconModel.create('helm-bone');
	IconModel.create('helm-bone-white');
	IconModel.create('helm-bone-blue');
	IconModel.create('helm-bone-orange');
	IconModel.create('helm-bone-gold');
	IconModel.create('ring-ruby');
	IconModel.create('ring-ruby-white');
	IconModel.create('ring-ruby-blue');
	IconModel.create('ring-ruby-orange');
	IconModel.create('ring-ruby-gold');
	IconModel.create('ring-sapphire');
	IconModel.create('ring-sapphire-white');
	IconModel.create('ring-sapphire-blue');
	IconModel.create('ring-sapphire-orange');
	IconModel.create('ring-sapphire-gold');
	IconModel.create('ring-topaz');
	IconModel.create('ring-topaz-white');
	IconModel.create('ring-topaz-blue');
	IconModel.create('ring-topaz-orange');
	IconModel.create('ring-topaz-gold');
	IconModel.create('body-metal');
	IconModel.create('body-metal-white');
	IconModel.create('body-metal-blue');
	IconModel.create('body-metal-orange');
	IconModel.create('body-metal-gold');
	IconModel.create('body-wood');
	IconModel.create('body-wood-white');
	IconModel.create('body-wood-blue');
	IconModel.create('body-wood-orange');
	IconModel.create('body-wood-gold');
	IconModel.create('body-bone');
	IconModel.create('body-bone-white');
	IconModel.create('body-bone-blue');
	IconModel.create('body-bone-orange');
	IconModel.create('body-bone-gold');
	IconModel.create('plan-equip');
	IconModel.create('plan-ability');
	IconModel.create('plan-scroll');
	IconModel.create('plan-tool');
	IconModel.create('orb-upgrade');
	IconModel.create('orb-boost');
	IconModel.create('orb-removal');
	IconModel.create('orb-water');
	IconModel.create('orb-ruby');
	IconModel.create('orb-sapphire');
	IconModel.create('orb-topaz');
	IconModel.create('metal-metal');
	IconModel.create('chain-chain');
	IconModel.create('wood-wood');
	IconModel.create('leaf-leaf');
	IconModel.create('bone-bone');
	IconModel.create('hide-hide');
	IconModel.create('key-skeleton');
	IconModel.create('plant-mushroom');
	IconModel.create('plant-rose');
	IconModel.create('bomb-sparky');
	IconModel.create('padlock-locked');
	IconModel.create('potion-bubble');
	IconModel.create('book-open');
	IconModel.create('click-left');
	IconModel.create('click-right');
	
	IconModel.create('ui-waypoint');
	IconModel.create('face-hidden',128);
	IconModel.create('face-creator',128);
	
	IconModel.create('villagerMale-0',128);
	IconModel.create('villagerMale-1',128);
	IconModel.create('villagerMale-2',128);
	IconModel.create('villagerMale-3',128);
	IconModel.create('villagerMale-4',128);
	IconModel.create('villagerMale-5',128);
	IconModel.create('villagerMale-6',128);
	IconModel.create('villagerMale-7',128);
	IconModel.create('villagerMale-8',128);
	IconModel.create('villagerMale-9',128);
	IconModel.create('villagerFemale-0',128);
	IconModel.create('villagerFemale-1',128);
	IconModel.create('villagerFemale-2',128);
	IconModel.create('villagerFemale-3',128);
	IconModel.create('villagerFemale-4',128);
	IconModel.create('villagerFemale-5',128);
	IconModel.create('villagerFemale-6',128);
	IconModel.create('villagerFemale-7',128);
	IconModel.create('villagerFemale-8',128);
	IconModel.create('villagerFemale-9',128);

}

IconModel.init();	//cuz no dependcy

})(); //}