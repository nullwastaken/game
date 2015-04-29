//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Party = require2('Party'), Achievement = require2('Achievement'),Equip = require2('Equip'), Sprite = require2('Sprite'), ActorGroup = require2('ActorGroup'), Main = require2('Main'), Quest = require2('Quest'), Maps = require2('Maps'), ActiveList = require2('ActiveList'), Message = require2('Message'), Drop = require2('Drop'), Material = require2('Material');
var Actor = require3('Actor');
Actor.death = {};
Actor.SPRITE_DEATH = 'waypoint-grave';

var DEATH_MESSAGE = [ //{
	"Please don't ragequit.",
	"You just got a free teleport! Lucky you.",
	"Try harder next time.",
	"You're feeling giddy!",
	"Is that all you got?",
	"This game is harder than it looks.",
	"If someone asks, just say you died on purpose.",
	"If someone asks, just say it's RNG manipulation.",
	"If someone asks, just say it was a planned deathwarp.",
]; //}

Actor.die = function(act){	
	var killers = Actor.death.getKillers(act);
	Actor.death.removeSummonChild(act);
	if(act.type === 'npc') 
		Actor.die.npc(act,killers);
	else 
		Actor.die.player(act,killers);
	for(var i = 0 ; i < killers.length; i++){
		var key = killers[i];
		var killer = Actor.get(key);
		if(!Actor.isPlayer(killer)) 
			return;
		Achievement.onActorKilled(Actor.getMain(killer),act);
	}
	
	
}

Actor.die.player = function(act,killers){
	var key = act.id;
	var main = Main.get(key);
	
	Main.addScreenEffect(main,Main.ScreenEffect.fadeout('death',30,'black'));
	act.dead = true;
	Actor.setTimeout(act,function(){
		var party = Main.getParty(main);
		var partyDead = Party.isPartyDead(party);
		
		Achievement.onDeath(main);
		
		//Quest
		Actor.endPath(act,true,true);
		if(act.deathEvent && killers[0]) 	//idk if compatible with grave
			act.deathEvent(act.id,killers[0]);	
		Message.add(key,'You are dead... ' + DEATH_MESSAGE.$random());
		
		act.respawnTimer = 25;	//above _death
		var turnIntoGrave = Main.quest.onDeath(main,partyDead,killers[0]);
		
		if(partyDead){
			Party.forEach(party,function(key){
				Actor.onCommandRespawn(Actor.get(key));
			});
			return;
		}
		
		
		if(turnIntoGrave){	
			Sprite.change(act,{name:Actor.SPRITE_DEATH});
			act.move = 0;	//BAD
			act.respawnTimer = 100000000;
			Main.openDialog(Main.get(act.id),'permPopupSystem',{
				text:'Waiting for your party to revive you...<br>'
					+ '<button onclick="exports.Command.execute(\'respawnSelf\',[]);">Or Respawn at Waypoint</button>'
				,css:{
					position:'absolute',
					width:'200px',
					height:'auto',
					top:'400px',
					right:'0px'
				}
			});
			
			
		}
	},12,'death');
	
}

Actor.die.npc = function(act,killers){
	act.dead = true;
	
	Actor.death.generateDrop(act,killers);	//increase killCount here
	Actor.death.grantExp(act,killers);
	
	if(act.deathEvent){ //after drop, otherwise bug
		act.deathEvent(killers[0],act.id,act.map);	//killers[0] may be null
	}
	
	ActiveList.clear(act);
	Actor.remove(act);
}

Actor.death.loop = function(act){
	if(act.type === 'npc'){ 
		ERROR(2,'dead npc should already have been removed'); 
		Actor.remove(act); 
		return; 
	}
	
	if(--act.respawnTimer < 0)
		Actor.death.respawn(act);
}

Actor.death.removeSummonChild = function(act){
	for(var i in act.summon){
		for(var j in act.summon[i].child){
			Actor.remove(Actor.get(j));
		}		
	}
}

Actor.death.getKillers = function(act){
	for(var i in act.damagedBy) 
		if(!Actor.get(i)) delete act.damagedBy[i];

	var tmp = Object.keys(act.damagedBy);	

	for(var i = tmp.length-1; i >= 0; i--){
		if(!Actor.isPlayer(tmp[i])) tmp.splice(i,1);	//remove non-player
	}
	return tmp;

}

Actor.death.generateDrop = function(act,killers){
	if(!act.quest) 
		return;
	var zone = Actor.getQuestZone(act);
	if(!zone) 
		return;
	for(var p in killers){
		var key = killers[p];
		var killer = Actor.get(key);
		if(!Actor.isPlayer(killer)) 
			continue;
		
		if(!Main.get(key).quest[act.quest]){
			ERROR(3,'invalid quest for npc',act.quest);
			continue;
		}
		
		var amount = Main.get(key).killCount[zone]++;
		if(amount > 150) 
			continue; //prevent bot
		
		var chanceMod = Quest.get(act.quest).reward.item * (1+killer.magicFind.quantity);
		var item;
		
		//equip
		var baseChance = getRawDropRateEquip(amount);
		if(Math.random() < Math.probability(baseChance,chanceMod)){	
			item = Equip.randomlyGenerateFromQuestReward(killer).id;
		} else {	//test for material if no equip
			var baseChance = getRawDropRateMaterial(amount);
			if(Math.random() < Math.probability(baseChance,chanceMod)){	
				item = Material.getRandom(Actor.getCombatLevel(killer));
			}
		}
		if(item){
			var spot = Actor.Spot(act.x,act.y,act.map);
			spot = ActorGroup.alterSpot(spot,25);
			Drop.create(spot,item,1,[key]);		
		}
	}
}

var getRawDropRateMaterial = function(amount){
	var baseChance = Math.min(1,10 / amount);	//killed <10 => 100%, 50 => 20%, 100 => 10%
	baseChance *= 0.3;		//killed <10 => 30%, 50 => 6%, 100 => 3%
	return baseChance;
}

var getRawDropRateEquip = function(amount){
	return getRawDropRateMaterial(amount) / 4;
}

Actor.death.respawn = function(act,teleport,forceGroupeTele){	//for player
	onDeathTeleport(act,teleport);
	Actor.onRespawn(act);
}

var onDeathTeleport = function(act,teleport,forceGroupeTele){
	//kill all party if respawn is far
	var res = Actor.getRespawnSpot(act);
	if(act.map !== res.map || forceGroupeTele){
		Party.forEach(Actor.getMain(act),function(key){
			if(key !== main.id){
				var act2 = Actor.get(key);
				Actor.teleport(act2,res);
				if(act2.dead)
					Actor.revivePlayer(act2);
			}
		});
	}
	
	if(teleport !== false){
		var rec = act.respawnLoc.recent;
		var good = Maps.get(Actor.teleport.getMapName(act,rec.map)) ? rec : act.respawnLoc.safe;
		Actor.teleport(act, good);
	}
}

Actor.revivePlayer = function(act){		//revived by other player
	if(act.sprite.name === Actor.SPRITE_DEATH)
		Sprite.change(act,{name:'normal'});
	act.move = 1; //BAD
	Main.closeDialog(Main.get(act.id),'permPopupSystem');	//BAD, should check if permPopup about death
	Actor.onRespawn(act);
}	

Actor.onCommandRespawn = function(act){
	onDeathTeleport(act);
	Actor.revivePlayer(act);
}

Actor.onRespawn = function(act){
	Actor.status.clear(act);
	Actor.boost.removeAll(act);
	Actor.fullyRegen(act);
	act.dead = false;
	
	Actor.becomeInvincible(act,25*5);
	Actor.rechargeAbility(act);
}

Actor.death.grantExp = function(act,killers){
	if(!act.quest) return;
	var zone = Actor.getQuestZone(act);
	if(!zone) 
		return;
	var expMod = Quest.get(act.quest).reward.exp;
	for(var i in killers){
		var key = killers[i];
		var killer = Actor.get(key);
		
		var amount = Main.get(key).killCount[zone];
		if(amount > 150) 
			continue; //prevent bot
			
		var baseExp = 10;	//constant
		baseExp *= Math.min(1,10 / amount);
		baseExp *= expMod;
		
		var bonus = Main.getSimpleQuestBonus(Actor.getMain(killer),act.quest);
		baseExp *= bonus.exp;
				
		Actor.addExp(killer,baseExp);
	}
}

Actor.kill = function(act){
	if(act.combat || Actor.isPlayer(act))
		act.hp = -1;
	else
		Actor.remove(act);
}

})(); //{



