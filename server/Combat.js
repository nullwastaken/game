
"use strict";
var Actor, Attack, Message, Anim, Boost;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Attack = rootRequire('shared','Attack'); Message = rootRequire('shared','Message'); Anim = rootRequire('server','Anim'); Boost = rootRequire('shared','Boost');
});
var Combat = exports.Combat = {};
/*
*INIT
every frame, boost ability charge, and globalCooldown--
if charge > period && pressed && globalCooldown < 0, start input 
reset other ability / mana if needed / globalCooldown

call custom func if action has func
anim	(player.sprite.anim) 
preDelayAnimOverSprite	(Anim)

*ADD MODIFIERS
add player bonus to atk
add dmg from player to atk (mastery, globalDmg, curse)
add dmg from weapon to atk

spawn bullet or strike
*/
var ATTACK_RECEIVED_TIME = 20*25;
var NPC_DELAY = 10;

Combat.attack = function(act,param,extra){
	var atk = Tk.deepClone(param); 
	
	extra = extra || {};
	
	//Add Bonus and mastery
	atk = Combat.applyAttackMod(act,atk);
	
	Combat.attack.setXYA(act,atk,extra);
		
	
	if(atk.preDelayAnim){
		Anim.create(atk.preDelayAnim,Anim.Target(extra.x,extra.y,act.map,act.viewedIf),extra.angle);	
	}
	
	Actor.onAttack(act);	//outside so movement stops before attack
	var addDelay = act.type === CST.ENTITY.npc ? NPC_DELAY : 0; 	//TEMP
	Actor.setTimeout(act,function(){
		if(atk.postDelayAnim)
			Anim.create(atk.postDelayAnim,Anim.Target(extra.x,extra.y,act.map,act.viewedIf),extra.angle);
		Combat.attack.perform(act,atk,extra);
	},atk.delay + addDelay);
}

Combat.attack.setXYA = function(act,atk,extra){
	if(extra.angle === undefined){
		extra.angle = act.angle;
	}
	
	if(extra.x === undefined){
		if(atk.initPosition.type === CST.INIT_POSITION.actor){
			extra.x = act.x;
			extra.y = act.y;
		}	
		if(atk.initPosition.type === CST.INIT_POSITION.mouse){
			var end = Attack.getInitPosition(atk,act);
			
			extra.x = end.x;
			extra.y = end.y;
		}
	}
}

Combat.attack.perform = function(act,atk,extra){   //act may not be a actor, extra used for stuff like boss loop
	//At this point, act.bonus/mastery must be already applied
	var atkList = [atk];
	for(var i = 1 ; i < atk.amount ; i ++)
		atkList.push(Tk.deepClone(atk));
	
	var initAngle = extra.angle + Math.randomML() * (atk.aim + act.aim) || 0;
	var atkAngle = atk.angleRange;	//required
	
	for(var i = 0 ; i < atkList.length ; i ++){
		var angle = initAngle + atkAngle * (atk.amount-2*(i+0.5)) / (atk.amount*2);
		Attack.create(atkList[i],act,{
			num:i,
			angle:Tk.formatAngle(angle),
			x:extra.x,
			y:extra.y
		});	
	}
}

Combat.summon = function(master,param){
	var name = param.model;
	
	if(!master.summon[name]) master.summon[name] = Actor.Summon();

	var maxChild = param.maxChild; 
	var time = param.time;
	var atkMod = param.globalDmg;
	var defMod = param.globalDef;
	
	if(master.bonus && master.bonus.summon){
		maxChild *= master.bonus.summon.amount;
		time *= master.bonus.summon.time;
		atkMod *= master.bonus.summon.atk;
		defMod *= master.bonus.summon.def;
	}
	
	if(master.summon[name].child.$length() > maxChild){ 
		if(Actor.isPlayer(master)) 
			Message.add(master.id,"You already have maximum amount of minions.");  
		return;
	}	
	
	for(var i = 0 ; i < param.amount && master.summon[name].child.$length() < maxChild; i++){
		var extra = {	//assume no other extra
			summoned:Actor.Summoned(master.id,name,time,param.distance),		
			targetIf:master.targetIf,//'summoned',
			damageIf:master.damageIf,//'summoned',
			damagedIf:master.damagedIf,//'summoned',
			viewedIf:master.viewedIf,//'summoned',
			combatType:master.combatType,
			quest:master.quest,	//for killCount
			awareNpc:true,
			lvl:master.lvl,
			killRewardMod:0,
		}
		
		var spot = Actor.toSpot(master);
		var act = Actor.create(param.model,extra);
		Actor.addToMap(act,spot);
		master.summon[name].child[act.id] = 1;	
		
		var boost = [];
		if(atkMod !== 1)
			boost.push(Boost.Perm('globalDmg',atkMod,CST.BOOST_XXX));
		if(defMod !== 1)
			boost.push(Boost.Perm('globalDmg',defMod,CST.BOOST_XXX));
		if(boost.length){
			Actor.addPermBoost(act,'summon',boost);
		}
	}	
}

Combat.boost = function(act,param){
	Actor.addBoost(act,param.boost);
}

Combat.heal = function(act,param){
	if(!Actor.canUseHeal(act))
		return Message.add(act.id,"A magical force is preventing you from healing.");
	
	if(act.hp === act.hpMax && param.mana === 0)	//BAD
		return Message.add(act.id,"You're already at maximum HP. Use this ability when your HP gets low.");
	Actor.changeResource(act,param);
	Actor.addHitHistory(act,param.hp);
}

Combat.dodge = function(act,param){
	Message.add(act.id,'Dodge has been removed from the game. This ability does nothing anymore.');
	return;
	//Actor.dodge(act,param.time,param.distance);
}

Combat.event = function(act,param){   	
	if(param.event)
		param.event(act.id);
}
Combat.idle = function(){}

//COLLISION//
Combat.onCollision = function(b,act){	
	if(act.attackReceived[b.hitId]) 
		return;    //for pierce
    act.attackReceived[b.hitId] = ATTACK_RECEIVED_TIME;	//last for 20 sec
	
	if(!act.preventStagger && act.staggerTimer < 0){
		Actor.applyStagger(act,b.moveAngle);
	}
	
	if(b.hitEvent)	//for quest
		b.hitEvent(act.id,b.parent);
	if(act.hitEvent)
		act.hitEvent(act.id,b.parent);
	
	if(b.onHitHeal)
		return Actor.changeResource(act,b.onHitHeal);
	
	if(b.crit && b.crit.chance >= Math.random())
		Combat.onCollision.crit(b)
	
	var dmg = Combat.onCollision.damage(b,act); 
	
	if(typeof dmg === 'undefined') 
		return;	//bug?

	//Mods
	if(b.leech && b.leech.chance >= Math.random())
		Combat.onCollision.leech(act,b);
		
	if(b.pierce && b.pierce.chance >= Math.random())
		Combat.onCollision.pierce(b)
	else 
		b.toRemove = true;
	
	if(b.onHit && b.onHit.chance >= Math.random())
		Combat.attack(b,b.onHit.attack);
	
	if(b.curse && b.curse.chance >= Math.random())
		Combat.onCollision.curse(act,b.curse);
		
	if(b.hitAnim){
		if(act.hp > 0)	//BAD, problem is cant put anim on dead one
			Anim.create(b.hitAnim,Anim.Target(act.id),b.angle);	
		else	
			Anim.create(b.hitAnim,Anim.Target(act.x,act.y,act.map),b.angle);			
	}
	
	//Apply Status
	Actor.afflictStatus(act,b);
	
}

//Apply Mods
Combat.onCollision.curse = function(act,info){
	for(var i = 0; i < info.boost.length; i++){
		var boost = info.boost[i];
		boost.name = Boost.FROM_ABILITY;
		Actor.addBoost(act,boost); 
		
		act.curseClient[boost.stat] = boost.type + Tk.round(boost.value,2);
		Actor.setChange(act,'curseClient',act.curseClient);
	}
}

Combat.onCollision.pierce = function(b){
	if(--b.pierce.amount <= 0)
		b.pierce.chance = 0;
	b.dmg.main *= b.pierce.dmgReduc;
}

Combat.onCollision.leech = function(act,b){
	var act = Actor.get(b.parent);	
	var amount = (act.hpMax-act.hp) * b.leech.magn;
	Actor.addHp(act,amount,true);
}

Combat.onCollision.crit = function(b){
	b.dmg.main *= b.crit.magn;
}

//Damage
Combat.onCollision.damage = function(atk,act){
	var def = Actor.getDef(act);
	var dmgInfo = Combat.onCollision.damage.calculate(atk.dmg,def);
	if(dmgInfo.sum === 0) 
		return;
	if(!dmgInfo.sum){
		var puser = (Actor.get(atk.parent) && Actor.get(atk.parent).name) || 'unable to get parent name';
		return ERROR(4,'dmg sum is NaN',atk.dmg,def,'atk: ' + puser,'def:' + act.name);
	}
	if(dmgInfo.sum > 5)
		dmgInfo.sum += 3 * Math.random();
	
	Actor.addHp(act,-dmgInfo.sum,true);
	
	act.damagedBy[atk.parent] = act.damagedBy[atk.parent] || 0;
	act.damagedBy[atk.parent] += dmgInfo.sum;
	
	return dmgInfo;
}

Combat.onCollision.damage.calculate = function(dmg,def){
	var info = {};
	var sum = 0;
	
	var mod = dmg.main / def.main;
	for(var i in dmg.ratio){ 
		var add = mod * dmg.ratio[i]/def.ratio[i]; 
		sum += add;
		info[i] = add;
	}
	info.sum = sum;
	return info;
}































