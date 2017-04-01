
"use strict";
(function(){ //}
var Party, Achievement, Equip, Sprite, ActorGroup, Main, Quest, Maps, Entity, Message, Drop, Material;
global.onReady(function(){
	Party = rootRequire('server','Party'); Achievement = rootRequire('shared','Achievement'); Equip = rootRequire('server','Equip'); Sprite = rootRequire('shared','Sprite'); ActorGroup = rootRequire('server','ActorGroup'); Main = rootRequire('shared','Main'); Quest = rootRequire('server','Quest'); Maps = rootRequire('server','Maps'); Entity = rootRequire('shared','Entity'); Message = rootRequire('shared','Message'); Drop = rootRequire('shared','Drop'); Material = rootRequire('server','Material');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.respawnSelf,Command.ACTOR,[ //{
	],Actor.onReviveCommand); //}
});
var Actor = rootRequire('shared','Actor');

Actor.death = {};
Actor.SPRITE_DEATH = 'gravestone';
var BASE_EXP = 20;
var MAX_KILL_EXP_AMOUNT = 150;
var DROP_RATE_EQUIP_VS_MAT = 1/4;
var GEM_IMPACT_ON_DROP = 1/4;
var FIRST_TOWN_MIN_EXP = 2;
var DROP_RATE_MULT = 0.3;

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
	if(act.type === CST.ENTITY.npc) 
		Actor.die.npc(act,killers);
	else 
		Actor.die.player(act,killers);
	for(var i = 0 ; i < killers.length; i++){
		var key = killers[i];
		var killer = Actor.get(key);
		if(!Actor.isPlayer(killer)) 
			return;
		Achievement.onActorKilled(Actor.getMain(killer),act.model);
	}
	
	
}

Actor.die.player = function(act,killers){	//act is player
	var key = act.id;
	var main = Main.get(key);
	
	//Main.addScreenEffect(main,Main.ScreenEffect.fadeout('death',30,'black'));
	act.dead = true;
	
	var party = Main.getParty(main);
	var partyDead = Party.isPartyDead(party);
	var alone = Party.getSize(party) === 1;
	Achievement.onDeath(main);
	
	//Quest
	Actor.endPath(act);
	handleDeathEvent(act,killers);	
	
	Main.dialogue.end(main);
	Message.add(key,'You are dead... ' + DEATH_MESSAGE.$random());
	Actor.playSfx(act,'death');
	
	var reviveSoloNow = Main.quest.onDeath(main,killers[0],partyDead);	//note: this can resetQuest which triggers revive in settimeout
	
	if(reviveSoloNow){
		Actor.reviveAndTeleportSelfOnly(act);
		return;
	}	
	
	/*if(partyDead && !alone){
		Actor.reviveAndTeleportParty(act);
		return;
	}*/
	
	//otherwise (alone or in coop party)
	Sprite.change(act,{name:Actor.SPRITE_DEATH});
	Actor.addPreset(act,'_disableMove');
	
	var message = alone 
		? 'You are dead.<br>' + buttonRespawn('Respawn')
		: 'Waiting for your party to revive you...<br>' + buttonRespawn('Or Respawn At Waypoint');
	
	//respawnSelf triggers reviveAndTeleportParty
	Main.openDialog(Main.get(act.id),'permPopupSystem',{
		text:message,
		css:{
			position:'absolute',
			width:'200px',
			height:'auto',
			top:'50%',
			left:'45%'
		}
	});
	
}

var handleDeathEvent = function(act,killers){
	if(!act.deathEvent)
		return;
	var usedKiller;
	var key;
	if(killers[0] && Actor.isPlayer(killers[0])){
		usedKiller = true;
		key = killers[0];
	} else {
		usedKiller = false;
		var map = Maps.get(act.map);
		if(map)
			key = Maps.getPlayerInMap(map)[0];
	}
	if(key)
		act.deathEvent(key,act.id,act.map,usedKiller,killers);
	else
		ERROR(3,'deathEvent but no player in map');
	
}

Actor.reviveAndTeleportSelfOnly = function(act){	//normal solo revive
	Actor.revivePlayer(act);
	var spot = Actor.getRespawnSpot(act);
	Actor.teleport.fromQuest(act,spot);
}

var buttonRespawn = function(text){	//BAD
	return '<button onclick="exports.Command.execute(CST.COMMAND.respawnSelf,[]);">' + text + '</button>'
}	

Actor.reviveAndTeleportParty = function(act){	//when self click revive
	var main = Actor.getMain(act);
	Party.forEach(Main.getParty(main),function(key){
		Actor.reviveAndTeleportSelfOnly(Actor.get(key));
	});
}

Actor.revivePlayer = function(act,invincibleTilMove){		//revived by OTHER player while in gravestone
	if(!act.dead)
		return;
	
	if(act.sprite.name === Actor.SPRITE_DEATH)
		Sprite.change(act,{name:CST.SPRITE_NORMAL});
	Actor.removePreset(act,'_disableMove');
	
	Main.closeDialog(Main.get(act.id),'permPopupSystem');	//BAD, should check if permPopup about death
	Actor.clearStatus(act);
	Actor.boost.removeAll(act);
	Actor.fullyRegen(act);
	act.dead = false;
	
	Actor.setInvincibleDuration(act,25*5);
	
	Actor.rechargeAbility(act);
	if(invincibleTilMove !== false)
		Actor.setTimeout(act,function(){	//must be called after the respawn teleport
			Actor.addPresetUntilMove(act,'onRespawn',50);	//need quite big cuz if spawn in wall, gets pushed
		},25);
}	


Actor.onReviveCommand = function(act){
	if(!act.dead && act.sprite.name === Actor.SPRITE_DEATH){
		ERROR(3,'player dead=false but sprite is gravestone');
		act.dead = true;
	}
	
	if(act.dead){
		var main = Actor.getMain(act);
		if(main.questActive){
			Quest.get(main.questActive).event._respawn(act.id);
			Actor.reviveAndTeleportParty(act);
		} else
			Actor.reviveAndTeleportSelfOnly(act);
	}
}

Actor.die.npc = function(act,killers){
	act.dead = true;
	
	Actor.death.generateDrop(act,killers);	//increase killCount here
	Actor.death.grantExp(act,killers);
			
	handleDeathEvent(act,killers);//after drop, otherwise bug
	
	Entity.clear(act);
	Actor.remove(act);
}

Actor.death.removeSummonChild = function(act){
	for(var i in act.summon){
		for(var j in act.summon[i].child){
			Actor.remove(Actor.get(j));
		}		
	}
}

var completeTodayMod = function(num){
	if(num <= 3)
		return 1;
	return 5/(5+num);	//
}	

Actor.death.getKillers = function(act){
	for(var i in act.damagedBy) 
		if(!Actor.get(i)) 
			delete act.damagedBy[i];

	var tmp = Object.keys(act.damagedBy);	

	for(var i = tmp.length-1; i >= 0; i--){
		if(!Actor.isPlayer(tmp[i])) 
			tmp.splice(i,1);	//remove non-player
	}
	return tmp;

}

Actor.death.generateDrop = function(act,killers){
	if(!act.quest || act.quest === CST.QTUTORIAL)	//BAD 
		return;
	var zone = Actor.getQuestZone(act);
	if(!zone) 
		return;
	
	var dropMod = Quest.get(act.quest).reward.monster * act.killRewardMod;
	if(dropMod === 0)
		return;	
		
	for(var p in killers){
		var key = killers[p];
		var killer = Actor.get(key);
		if(!Actor.isPlayer(killer)) 
			continue;
				
		var amount = Main.get(key).killCount[zone]++

		if(amount > MAX_KILL_EXP_AMOUNT) 
			continue; //prevent bot
		var mq = Main.get(key).quest[act.quest];
		
		var chanceMod = dropMod;
		if(mq)
			chanceMod *= completeTodayMod(mq.completeToday);
			
		var item = null;
		var amount = 1;
		
		//equip
		var baseChance = getRawDropRateEquip(amount);
		if(Math.random() < Math.probability(baseChance,chanceMod)){	
			item = Equip.randomlyGenerateFromQuestReward(killer).id;
		} else {	//test for material if no equip
			var baseChance = getRawDropRateMaterial(amount);
			if(Math.random() < Math.probability(baseChance,chanceMod)){	
				item = Material.getRandom();
				var gem = (Actor.getGEM(killer)-1)*GEM_IMPACT_ON_DROP + 1;
				amount = Math.roundRandom(gem);				
			}
		}
		if(item){
			var spot = Actor.toSpot(act);
			spot = ActorGroup.alterSpot(spot,25);
			Drop.create(spot,item,amount,[key]);		
		}
	}
}

var getRawDropRateMaterial = function(amount){
	var baseChance = Math.min(1,10 / amount);	//killed <10 => 100%, 50 => 20%, 100 => 10%
	baseChance *= DROP_RATE_MULT;		//killed <10 => 20%, 50 => 3%, 100 => 1.5%
	return baseChance;
}

var getRawDropRateEquip = function(amount){
	return getRawDropRateMaterial(amount) * DROP_RATE_EQUIP_VS_MAT;
}

Actor.death.grantExp = function(act,killers){
	if(!act.quest) return;
	var zone = Actor.getQuestZone(act);
	if(!zone) 
		return;
	var expMod = Quest.get(act.quest).reward.monster * act.killRewardMod;
	if(expMod === 0)
		return;	
	
	for(var i in killers){
		var key = killers[i];
		var killer = Actor.get(key);
		var expModLvl = expModifier(killer.lvl,act.lvl);
		
		var amount = Main.get(key).killCount[zone];
		if(amount === undefined)
			return ERROR(3,'invalid zone',zone);
		
		if(amount >= MAX_KILL_EXP_AMOUNT){
			if(amount === MAX_KILL_EXP_AMOUNT || amount % 25 === 0)
				Message.add(key,'You no longer get exp from killing monsters in the area. Complete a quest in the area to get exp from them again.');
			continue; //prevent bot
		}
		
		var baseExp = BASE_EXP;	//constant
		baseExp *= Math.min(1,10 / amount);	//<10 = *1, 20=*0.5, 100=*0.1
		baseExp *= expMod * expModLvl;
		
		var mq = Main.get(key).quest[act.quest];
		if(mq)
			amount *= completeTodayMod(mq.completeToday);
		
		if(act.quest === 'QfirstTown')
			baseExp = Math.max(FIRST_TOWN_MIN_EXP,baseExp);
		
		if(isNaN(baseExp))
			return ERROR(3,'exp is nan',amount,Quest.get(act.quest).reward.monster,act.killRewardMod,expModLvl,completeTodayMod(mq.completeToday));
		
		Actor.addExp(killer,baseExp);
	}
}

var expModifier = function(playerLvl,monsterLvl){
	var diff = playerLvl-monsterLvl;
	if(diff <= 0) 
		return 1;
	return Math.pow(2,-diff/20);
}

Actor.kill = function(act,instant){
	act.cantDie = false;
	if(Actor.isPlayer(act) || (!instant && act.combat))
		act.hp = -1;
	else
		Actor.remove(act);
}

})(); //{



