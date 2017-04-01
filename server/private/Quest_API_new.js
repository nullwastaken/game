
"use strict";
(function(){ //}
var Main, SideQuest, Actor, QuestVar, ActorModel, Preset, Button, Challenge, Highscore, AttackModel, Boost, MapModel, ItemModel, Boss, Quest, Dialogue, Ability, Sprite, Anim, Equip;
global.onReady(function(){
	Main = rootRequire('shared','Main'); SideQuest = rootRequire('shared','SideQuest'); Actor = rootRequire('shared','Actor'); QuestVar = rootRequire('server','QuestVar'); ActorModel = rootRequire('shared','ActorModel'); Preset = rootRequire('server','Preset'); Button = rootRequire('shared','Button'); Challenge = rootRequire('server','Challenge'); Highscore = rootRequire('server','Highscore'); AttackModel = rootRequire('shared','AttackModel'); Boost = rootRequire('shared','Boost'); MapModel = rootRequire('server','MapModel'); ItemModel = rootRequire('shared','ItemModel'); Boss = rootRequire('server','Boss'); Quest = rootRequire('server','Quest'); Dialogue = rootRequire('server','Dialogue'); Ability = rootRequire('server','Ability'); Sprite = rootRequire('shared','Sprite'); Anim = rootRequire('server','Anim'); Equip = rootRequire('server','Equip');
});


var ABILITY_TEMPLATE = {};
var QUEST_LEVEL = 0;	//used by s.newEquip
var DIALOGUE_GOLD_START = '\\[\\[';
var DIALOGUE_GOLD_END = '\\]\\]';
var DIALOGUE_IMG_START = '{{';
var DIALOGUE_IMG_END = '}}';

exports.newQuest_new = function(s,Q,Qid,parseActorExtra,mapFormat,parseEvent){ //}
	var getAbilityTemplate = function(id){
		if(ABILITY_TEMPLATE[id]) return Tk.deepClone(ABILITY_TEMPLATE[id]);
		if(ABILITY_TEMPLATE[Qid(id)]) return Tk.deepClone(ABILITY_TEMPLATE[Qid(id)]);
		return Tk.deepClone(ABILITY_TEMPLATE[Quest.addPrefix('Qsystem',id)]);
	}	
	
	var ACCEPTNEW = true;
	var q = s.quest;
	var LVL = q.lvl || 0;
	var ZONE = q.zone || 'QfirstTown-main';
	//####################
	
	s.newVariable = function(obj){	//modified by highscore and challenge
		QuestVar.Model(Q,obj);
	}
	s.newEvent = function(id,func){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		q.event[id] = func;
	}
	s.newItem = function(id,name,icon,option,description,extra){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		if(q.admin) extra = extra || {trade:false,drop:false,bank:false,destroy:false}; 
		else extra = {trade:false,drop:false,bank:false,destroy:false};
		q.item[id] = ItemModel.create(Q,Qid(id),name,icon,option,description,extra);
	}
	s.newItem.option = function(func,name,description,param){
		func = parseEvent(func);
		return ItemModel.Option(func,name,description,param);
	}
	s.newChallenge = function(id,name,desc,testSuccess,maxPartySize){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		var id = Qid(id);
		maxPartySize = maxPartySize || q.maxPartySize;
		q.challenge[id] = Challenge.create(Q,id,name,desc,testSuccess,maxPartySize);
	}
	s.newHighscore = function(id,name,description,order,getScore){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		var id = Qid(id);
		q.highscore[id] = Highscore.create(Q,id,name,description,order,getScore);
	}
	
	s.newSideQuest = function(id,name,rewardMod){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		if(!q.sideQuestAllowed) return ERROR(2,'not allowed to create sidequest');
		var id = Qid(id);
		q.sideQuest[id] = SideQuest.create(Q,id,name,rewardMod);
		s.newHighscore('complete_' + id,name,'Most Completion of ' + name,'descending',function(key){
			var count = Main.SideQuest.getComplete(Main.get(key),id);
			if(count > 0)
				return count;
		});
	}
	
	
	var setAbility = function(template,ability){
		var model;
		if(template === 'attack')		//BAD linked with CST.ABILITY but not really
			model = {
				type:CST.ABILITY.attack,icon:'attackMagic-fireball',
				name:'Attack',description:'Deal damage.',
			};
		else if(template === 'heal')
			model = {
				type:CST.ABILITY.heal,
				icon:'heal-plus',
				name:'Heal',
				description:'Replenish resources.',
				preDelayAnimOverSprite:s.newAbility.anim('boostRed'),
			};	
		else if(template === 'dodge')
			model = {
				type:CST.ABILITY.dodge,
				icon:'blessing-spike',
				name:'Dodge',
				description:'Makes you invincible for a bit.',
			};	
		else if(template === 'summon')
			model = {
				type:CST.ABILITY.summon,
				icon:'summon-wolf',
				name:'Summon',
				description:'Standard healing.',
				periodOwn:50,
				periodGlobal:50,
				preDelayAnimOverSprite:s.newAbility.anim('boostPink'),
			};
		else if(template === 'boost')
			model = {
				type:CST.ABILITY.boost,
				icon:'blessing-spike',
				name:'Blessing',
				description:'Boost a stat.',
				periodOwn:25,
				periodGlobal:25,
			};
		else if(template === 'idle')	
			model = {
				type:CST.ABILITY.idle,
			}
		else if(template === 'event')	
			model = {
				name:'Event',icon:'attackMagic-fireball',type:CST.ABILITY.event,
				description:'Custom Event',
				periodOwn:10,periodGlobal:10,
			}
		else return ERROR(2,'invalid template',template);
		
		for(var i in ability) model[i] = ability[i];
		return s.newAbility.ability(model);
	}
	
	var setParam = function(template,param){
		if(template === 'attack')
			return s.newAbility.attack(param);
		else if(template === 'heal')
			return s.newAbility.heal(param);
		else if(template === 'dodge')
			return s.newAbility.dodge(param);
		else if(template === 'summon')
			return s.newAbility.summon(param);
		else if(template === 'boost')
			return s.newAbility.boost(param);
		else if(template === 'idle')
			return s.newAbility.idle(param);	
		else if(template === 'event')
			return s.newAbility.event(param);			
		else return ERROR(2,'invalid template',template);
			
	}
	
	s.newAbility = function(id,template,ability,param){	//assumed used param constr ex s.newAbility.attacl
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		
		ability = ability || {}; 
		param = param || {};
		
		if(param.type === CST.ENTITY.strike && !param.initPosition)
			ERROR(3,'warning, strike but no initPosition',id,template);
		var ab;
		if(id){	//means normal.	template means ability type
			ability = setAbility(template,ability);
			param = setParam(template,param);
			ability.param = param;
			ab = Ability.create(Q,Qid(id),ability);
		}
		
		if(!id){	//means ability only for 1 npc. template means model used
			id = Math.randomId();	//for admin, quick way to create npc
			ab = getAbilityTemplate(template);
			if(!ab) return ERROR(4,'no ability template',template);
			for(var i in ability) 
				ab[i] = ability[i];
			for(var i in param) 
				ab.param[i] = param[i];
			ab.randomlyGeneratedId = true;			
			ab = Ability.create(Q,Qid(id),ab);
		} 
		ABILITY_TEMPLATE[ab.id] = ab;
		q.ability[id] = ab;
		return ab.id;	//important for quick
	}
	s.newAbility.dmg = function(main,element){
		if(element === 'melee') return AttackModel.Dmg(main,1,0,0,0,0,0);
		if(element === 'range') return AttackModel.Dmg(main,0,1,0,0,0,0);
		if(element === 'magic') return AttackModel.Dmg(main,0,0,1,0,0,0);
		if(element === 'fire') return AttackModel.Dmg(main,0,0,0,1,0,0);
		if(element === 'cold') return AttackModel.Dmg(main,0,0,0,0,1,0);
		if(element === 'lightning') return AttackModel.Dmg(main,0,0,0,0,0,1);
		if(element === 'typeless') return AttackModel.Dmg(main,1/6,1/6,1/6,1/6,1/6,1/6);
		return ERROR(4,'invalid element',element);
	}
	s.newAbility.sprite = function(name,sizeMod,lightingEffect){
		return AttackModel.Sprite(name,sizeMod,lightingEffect);
	}
	s.newAbility.triggerAbility = function(list){
		for(var i = 0 ; i < list.length; i++){
			if(!list[i].$contains(Q,true))
				list[i] = Qid(list[i]);
		}
		return list;			
	}
	s.newAbility.anim = function(id,sizeMod,sfx,lightingEffect){
		return Anim.Base(id,sizeMod || 1,sfx === undefined ? 1 : sfx,lightingEffect === undefined ? true : lightingEffect);
	}
	s.newAbility.onHit = s.newAbility.onDamagePhase = function(chance,attack){
		return AttackModel.OnHit(chance || 0,attack);
	}
	s.newAbility.pierce = function(chance,dmgReduc,amount){
		return AttackModel.Pierce(chance,dmgReduc,amount);
	}
	s.newAbility.onMove = function(period,rotation,attack){ 
		return AttackModel.OnMove(period,rotation,attack);
	}
	s.newAbility.status = function(chance,magn,time){
		return AttackModel.Status(chance,magn,time);
	}
	s.newAbility.boomerang = function(comeBackTime,spd,spdBack,newId){
		return AttackModel.Boomerang(comeBackTime,spd,spdBack,newId);
	}
	s.newAbility.sin = function(amp,freq){
		return AttackModel.Sin(amp,freq);
	}
	s.newAbility.parabole = function(height,min,max,timer){
		return AttackModel.Parabole(height,min,max,timer);
	}
	s.newAbility.curse = function(chance,boost){
		return AttackModel.Curse(chance,boost);
	}
	s.newAbility.onHitHeal = function(hp,mana){
		return AttackModel.OnHitHeal(hp,mana);
	}
	s.newAbility.initPosition = function(min,max){
		return AttackModel.InitPosition(min,max);
	}
	s.newAbility.spd = function(spd){
		return spd * CST.BULLETSPD;
	}
	s.newAbility.spriteFilter = function(filter,time){
		return Actor.SpriteFilter(filter,time);
	}

	s.newAbility.damageOverTime = function(duration,interval,adjustDmg,keepHitId){
		return AttackModel.DamageOverTime(duration,interval,adjustDmg,keepHitId);
	}
	
	s.newAbility.hitEvent = function(id){
		return q.event[id] || ERROR(3,'event not found',id);
	}	
	
	//when creating ability without template
	s.newAbility.ability = function(param){
		return param;	//?
	}

	s.newAbility.event = function(param){
		return Ability.Param.event(param);
	}
	s.newAbility.idle = function(param){
		return Ability.Param.idle(param);
	}
	s.newAbility.dodge = function(param){
		return Ability.Param.dodge(param);
	}
	s.newAbility.boost = function(param){
		return Ability.Param.boost(param);
	}
	s.newAbility.attack = function(param){	//only use when not using template
		return Ability.Param.attack(param);
	}
	s.newAbility.heal = function(param){
		return Ability.Param.heal(param);
	}
	s.newAbility.summon = function(param){
		return Ability.Param.summon(param);
	}
	
	
	
	//######################################
	
	s.newBoost = function(stat,value,time,type){
		if(type === '+')
			type = CST.BOOST_PLUS;
		else if(type === '*')
			type = CST.BOOST_X;
		else if(type === '***')
			type = CST.BOOST_XXX;
		return Boost.create(Math.randomId(),stat,value,time,type);
	}	
	
	s.newAbility.model = function(name){	//same than s.boss
		if(q.npc[Qid(name)]) return Qid(name);
		else return 'Qsystem-' + name;
	}
	//###############
	s.newEquip = function(id,piece,type,name,value,boost,extra){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		if(!q.admin) extra = {};
		
		q.equip[id] = Equip.create(Q,Qid(id),piece,type,name,QUEST_LEVEL,value,boost,extra,false);
	}
	s.newEquip.boost = function(stat,value,type){
		return Equip.Boost(stat,value,type);
	}
	s.newPreset = function(id,ability,equip,noReputation,pvp,noAbility,noCombat,noMove){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		if(id !== '_disableMove' && !q.admin && noMove){
			ERROR(3,'cant use noMove=true while not admin');
			noMove = false;
		}
		var id = Qid(id);
		if(q.preset[id])
			return ERROR(3,'a preset already has this id',id);
		q.preset[id] = Preset.create(Q,Qid(id),ability,equip,noReputation,pvp,noAbility,noCombat,noMove);
	}	
	s.newPreset.ability = function(ability){	//can only contain ability created exclusively for quest
		for(var i = 0; i < 6; i++){
			if(!ability[i]) 
				ability[i] = '';
			else
				ability[i] = ability[i][0] !== 'Q' ? Qid(ability[i]) : ability[i];
		}
		return ability;
	}
	s.newPreset.equip = function(equip){ //can only contain equip created exclusively for quest
		for(var i in CST.equip.piece){
			var p = CST.equip.piece[i];
			if(!equip[p]) equip[p] = '';
			else equip[p] = Qid(equip[p]);
		}	
		return equip;		
	}
	
	s.newNpc = function(id,extra){
		var id = Qid(id);
		q.npc[id] = ActorModel.create(id,parseActorExtra(extra));
		if(!q.inMain)	//prevent generateDrop bug
			q.npc[id].quest = '';
	}
	s.newNpc.maxSpd = function(spdMod){
		return spdMod * CST.NPCSPD;
	}
	s.newNpc.moveRange = function(ideal,max){
		return Actor.MoveRange(ideal,max);
	}
	s.newNpc.sprite = function(name,sizeMod,lightingEffect){
		return Sprite.create(name,sizeMod,lightingEffect);
	}
	s.newNpc.mastery = function(def,dmg){
		var arrayDef = [];
		for(var i in def) 
			arrayDef.push(Actor.Mastery.element(def[i]));
		var arrayDmg = [];
		for(var i in dmg) 
			arrayDef.push(Actor.Mastery.element(dmg[i]));
		
		return Actor.Mastery(Actor.Mastery.part.apply(this,arrayDef),Actor.Mastery.part.apply(this,arrayDmg));
	}
	s.newNpc.statusResist = function(bleed,knock,drain,burn,chill,stun){
		return Actor.StatusResist(bleed,knock,drain,burn,chill,stun);
	}
	s.newNpc.abilityAi = function(array){
		return Actor.AbilityAi(array);
	}
	s.newNpc.abilityAi.ability = function(id,distanceInfo){
		var ab = getAbilityTemplate(id);
		if(!ab) return ERROR(2,'no ability with this id',id);
		if(distanceInfo.length !== 3) return ERROR(3,'invalid distanceInfo');
		return Actor.AbilityAi.ability(ab.id,distanceInfo);
	}
	s.newNpc.block = function(size,value,impactPlayer,impactNpc,impactBullet){
		return Actor.Block(size,+value,impactPlayer,impactNpc,impactBullet);
	}
	s.newNpc.block.size = function(width,height,x,y){
		if(x === undefined && y === undefined){		//we center the block
			if(width % 2 === 1){
				x = -(width/2 - 0.5);
			} else {
				x = -(width/2 - 1);
			}
			if(height % 2 === 1){
				y = -(height/2 - 0.5);
			} else {
				y = -(height/2 - 1);
			}
		}
		return CST.rect(x,y,width,height);	//custom centering	
	}
	s.newNpc.boss = function(name){
		if(name[0] !== 'Q') return Qid(name);
		return name;
	}
	s.newNpc.angle = function(side){
		if(side === 'up') return 270;
		if(side === 'down') return 90;
		if(side === 'left') return 180;
		if(side === 'right') return 0;
		return 0;
	}
	s.newNpc.pushable = function(magn,time,event,onlySimulate,loose){
		event = parseEvent(event);
		return Actor.Pushable(magn,time,event,onlySimulate || false,loose || false);
	}
	s.newNpc.targetSetting = function(maxAngleChange,periodSub,periodMainActor,periodMainSpot,periodStuck){
		return Actor.TargetSetting(maxAngleChange,periodSub,periodMainActor,periodMainSpot,periodStuck);	
	}
	s.newNpc.onclick = function(shiftLeft,shiftRight,left,right){
		return {
			shiftLeft:shiftLeft|| null,
			shiftRight:shiftRight|| null,
			left:left|| null,
			right:right|| null
		};
	}
	s.newNpc.onclick.side = function(text,func,testDistance){
		if(!func) 
			return null;	//ide
		func = parseEvent(func);
		
		if(!func) 
			return ERROR(3,'no func');
		
		var f = testDistance !== false ? function(key,eid){
			if(!s.canInteractWith(key,eid))
				return;
			func(key,eid); 
		} : func;
		
		
		return Button.Click(f,[],text);
	}
	s.newNpc.immune = function(melee,range,magic,fire,cold,lightning){	//bad...only used by immune and immune should have own constructor
		return CST.element.template(melee,range,magic,fire,cold,lightning);
	}
	
	s.newNpc.damageIf = s.newNpc.damagedIf = s.newNpc.targetIf = function(type){
		return CST.DAMAGE_IF[type] || ERROR(3,'invalid prop',type);
	}
	
	s.newNpc.interactionMaxRange = function(range){
		if(range === 'close')
			return 32;
		if(range === 'normal')
			return 75;
		if(range === 'far')
			return 150;
		if(range === 'infinite')
			return 10000;
		return ERROR(3,'invalid interactionMaxRange',range);
	}
	
	s.newMap = function(id,map,addon){
		if(!ACCEPTNEW) 
			return ERROR(2,'cant create new stuff at this point');
		map.lvl = map.lvl || LVL;
		map.zone = map.zone || ZONE;
		if(!Quest.isValidZone(map.zone))
			return ERROR(3,'invalid zone',map.zone);
		var id = MapModel.create(Q,id,map,addon);
		q.map[id] = map;
		return id;
	}
	s.newMapAddon = function(mapid,addon){
		if(!ACCEPTNEW) return ERROR(2,'cant create new stuff at this point');
		MapModel.MapAddon(mapid,Q,addon);	//split is bad, want quest name
	}
	s.newDialogue = function(id,name,image,list){
		return Dialogue.create(Q,id,name,image,list);
	}
	s.newDialogue.node = function(id,text,option,event,noFace,allowExit){
		event = parseEvent(event);
		text = text.$replaceAll(DIALOGUE_GOLD_START,'<span style="color:' + CST.color.gold + '">').$replaceAll(DIALOGUE_GOLD_END,'</span>')
		
		text = text.$replaceAll(DIALOGUE_IMG_START,'<img src="/img/ui/icon/').$replaceAll(DIALOGUE_IMG_END,'.png" width="20px">');
		
		return Dialogue.Node(Q,id,text,option,event,noFace,allowExit);
	}
	s.newDialogue.option = function(text,next,event){
		event = parseEvent(event);
		return Dialogue.Option(Q,text,next,event);	
	}
	
	s.newBoss = function(id,variable,phaseFunc){
		var id = Qid(id);
		
		var dummy = {phase:{},startingPhase:''};
		phaseFunc(dummy);	//modify dummy
		
		q.boss[id] = Boss.create(id,variable,dummy.phase,dummy.startingPhase);
	};
	s.newBoss.phase = function(boss,phase,info){
		if(boss.phase.$isEmpty()) 
			boss.startingPhase = phase;
		boss.phase[phase] = Boss.Phase(info);
	};
	s.newBoss.variable = function(list){
		return Boss.Variable(list);
	}	
	
	s.newPath = function(id,cutscene){
		var id = Qid(id);
		q.path[id] = MapModel.Path(id,cutscene);
	}
	s.newPath.spotList = function(list){
		var tmp = [];
		for(var i in list){
			if(!Array.isArray(list[i])) tmp.push(list[i])
			else {	//else group
				for(var j in list[i])
					tmp.push(list[i][j])
			}
		}
		return tmp;
	}
	s.newPath.spot = function(letter,wait,event,spdMod,timeLimit){
		event = parseEvent(event);
		return MapModel.Path.Spot.raw(letter,wait,event,spdMod,timeLimit);
	}
	s.newPath.spotChain = function(color,start,end){
		var tmp = [];
		for(var i = start; i <= end; i++)
			tmp.push(s.newPath.spot(color+i));	//assume letter is blue0
		return tmp;
	}
	s.newPath.compileSpotList = function(mapId,spot){
		var tmp = [];
		var theMapModel = MapModel.get(mapFormat(mapId));
		for(var i in spot)
			tmp.push(MapModel.Path.Spot(theMapModel,Q,spot[i]));
		return tmp;
	}	
	/*
	s.newPath('whatever',s.newPath.compileSpotList('QfirstTown',s.newPath.spotList([
		s.newPath.spot('blue',0,3*25,'myEvent'),
		s.newPath.spotChain('blue',1,10),
	])));
	*/
	
	s.exports = function(exp){/**/
		delete s.quest;
		exp.quest = q;
		q.s = s;
		
		if(q.showInTab){
			s.newHighscore('_score','Quest Score','Cumulative Quest Score (Increase every time you complete the quest.)','descending',function(key){
				var score = Math.floor(Main.get(key).quest[Q].rewardScore);
				if(score > 0)
					return score;
			});
		}
		s.newPreset('_disableCombat',null,null,false,false,false,true);
		s.newPreset('_disableCombatUntilMove',null,null,false,false,false,true);
		s.newPreset('_disableAbility',null,null,false,false,true,false);
		
		s.newPreset('_enablePvp',null,null,false,true,false,false);
		s.newPreset('_disableReputation',null,null,true,false,false,false);
		s.newPreset('_disableMove',null,null,false,false,false,false,true);
		
		ACCEPTNEW = false;
	}
	
}

})(); //{

