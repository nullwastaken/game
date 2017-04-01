
"use strict";
(function(){ //}
var Main, SideQuest, Maps, Actor, IconModel, Party, QuestVar, Equip, Debug, Achievement, ActorModel, Boost, MapModel, ItemList, Quest, Message, Collision, Anim;
global.onReady(function(){
	Equip = rootRequire('server','Equip'); Achievement = rootRequire('shared','Achievement'); Main = rootRequire('shared','Main'); SideQuest = rootRequire('shared','SideQuest'); Maps = rootRequire('server','Maps'); Actor = rootRequire('shared','Actor'); IconModel = rootRequire('shared','IconModel'); Party = rootRequire('server','Party'); QuestVar = rootRequire('server','QuestVar'); Debug = rootRequire('server','Debug'); ActorModel = rootRequire('shared','ActorModel'); Boost = rootRequire('shared','Boost'); MapModel = rootRequire('server','MapModel'); ItemList = rootRequire('shared','ItemList'); Quest = rootRequire('server','Quest'); Message = rootRequire('shared','Message'); Collision = rootRequire('shared','Collision'); Anim = rootRequire('server','Anim');
});
//security in s.teleport,s.completeQuest

exports.newQuest = function(version,qid,extra){	//}

	//NOT IN IDE YET: s.shakeScreen,s.getPermData,s.setPermData,s.playSfx,s.playSong,s.setAttr,s.getItemAmount
	
	//for admin function, start function with /**/
	//for admin parameter, param must contains _
	
	
	// { For Admins Only
	var Q = qid;
	if(Q[0] !== 'Q') 
		return ERROR(1,'quest id needs to start with Q',qid);
	var s = {};
	extra = extra || {};
	extra.id = qid;
	extra.version = version;
	var LVL = extra.lvl || 0;
	
	var q = s.quest = Quest.getAPItemplate(extra);
	var d,m,b;
	
	var Qid = function(name){
		if(!name) return ERROR(2,'adding prefix to nothing');
		return Quest.addPrefix(Q,name);
	}
	
	var itemFormat = function(item,amount){
		var list = ItemList.format(item,amount,true);
		var goodList = {};
		for(var i in list) goodList[Qid(i)] = list[i];
		return goodList;
	}
	
	var mapFormat = function(name){
		if(!name)
			return name;
		if(name[0] !== 'Q')
			return Q + '-' + name;
		return name;
	}
	
	var parseActorExtra = function(extra,spot){
		extra = extra || {};
		extra.quest = Q;
		
		if(!extra.zone && spot){
			if(!spot.mapModel)
				ERROR(4,'no mapModel linked with spot');
			else
				extra.zone = MapModel.get(spot.mapModel).zone;
		}
		if(extra.shop && !q.admin)
			return ERROR(2,'not allowed shop');
		if(extra.waypoint && !q.admin)
			return ERROR(2,'not allowed waypoint');
			
		if(extra.bank && !q.admin)	
			return ERROR(2,'not allowed bank in extra. use m.spawnBank');
			
		if(extra.skillPlot && !q.admin) 
			return ERROR(2,'not allowed skillplot');
		
		if(extra.dialogue !== undefined){
			if(!extra.dialogue[Q]){	//case parseActorExtra called twice
				var ev = parseEvent(extra.dialogue);
				extra.dialogue = {normal:ev};
				extra.dialogue[Q] = ev;
			}
		}
		if(extra.teleport !== undefined){
			if(!extra.teleport[Q]){	//case parseActorExtra called twice
				var ev = parseEvent(extra.teleport);
				extra.teleport = {normal:ev};
				extra.teleport[Q] = ev;		
			}
		}
		if(extra.boss && extra.delayBeforeAttack === undefined)
			extra.delayBeforeAttack = 0;
		if(extra.damageIf && !extra.targetIf)
			extra.targetIf = extra.damageIf;
		if(extra.combatType === CST.ENTITY.player && extra.bounceDmgMod === undefined)
			extra.bounceDmgMod = 0;	//BAD...Actor.bounce.loop should check damageIf instead
		if(extra.deathEvent !== undefined) 
			extra.deathEvent = parseEvent(extra.deathEvent);
		if(extra.viewedIf !== undefined) 
			extra.viewedIf = parseEvent(extra.viewedIf);
		if(extra.lvl === undefined)
			extra.lvl = spot ? Maps.get(spot.map).lvl : LVL;
		return extra;
	}
	
	var modelFormat = function(model){
		if(ActorModel.get(Qid(model))) 
			return Qid(model);
		if(ActorModel.get('Qsystem-' + model)) 
			return 'Qsystem-' + model;
		ERROR(4,'no npc with that model',model);
		return 'Qsystem-bat';
	}
	
	var getSpot = function(key,map,spot){
		if(!s.isInMap(key,map)) return ERROR(4,'monster spawning in wrong map',key,map,spot);
		return getSpot.map(Actor.get(key).map,spot);
	}
	getSpot.map = function(map,spot){
		if(typeof spot === 'object') 
			return Maps.Spot(spot.x,spot.y,map,spot.mapModel);
		
		if(!MapModel.get(map)) 
			return ERROR(3,'map model dont exist',map);
		if(!MapModel.get(map).addon[Q])
			return ERROR(3,'no addon for that quest',map,Q);
		
		var a = MapModel.get(map).addon[Q].spot[spot];	//cant use list cuz map could not be created yet
		if(!a) 
			return ERROR(3,'spot not found ',map,spot);
		a = Tk.deepClone(a);
		a.map = map;
		return a;
	}
	
	var keyToSpot = function(key,map){
		if(!s.isInMap(key,map)) return ERROR(4,'key not in map');
		var act = Actor.get(key);
		return {map:act.map,x:act.x,y:act.y};
	}
	
	var partyForEach = function(key,func,type){	//once if sq
		if(!s.isPlayer(key)) 
			return func(key);
		if(q.sideQuestAllowed)
			return func(key);
		return Party.forEach(Main.getParty(Main.get(key)),func,type);
	}	
	
	var parseEvent = function(id){
		if(id === undefined) return id;
		if(id === null) return id;
		if(id === '') return null;
		if(id === true) return function(){ return true; }
		if(id === false) return function(){ return false; }
		
		if(typeof id === 'function') 
			return id;
		return q.event[id] || ERROR(3,'no event with id',id);
	}
	
	var openStartQuest = function(key,quest){
		var main = Main.get(key);
		Main.openDialog(main,'questStart',quest || Q);
		Actor.addPresetUntilMove(Actor.get(key),'onQuestWindow',75);
	}
	
	if(!MINIFY){
		require('./Quest_API_new').newQuest_new(s,Q,Qid,parseActorExtra,mapFormat,parseEvent,mapFormat);
		m = require('./Quest_API_map').newQuest_map(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat);
		b = require('./Quest_API_boss').newQuest_boss(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat);
		d = require('./Quest_API_sideQuest').newQuest_sideQuest(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat);
	} else {
		exports.newQuest_new(s,Q,Qid,parseActorExtra,mapFormat,parseEvent,mapFormat);
		m = exports.newQuest_map(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat);
		b = exports.newQuest_boss(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat);
		d = exports.newQuest_sideQuest(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat);
	}
	// } Admins Only End

	//Quest Creation
	s.getEvent = function(id){/**/ //BAD...
		return parseEvent(id);
	}
	s.callEvent = function(event){/**/
		if(!q.event[event]) return ERROR(3,'event undefined',event);
		
		var array = [];
		for(var i = 1; i < arguments.length; i++)
			array.push(arguments[i]);
		return q.event[event].apply(this,array);
	}
	s.callEvent.one = s.callEvent;
	
	s.callEvent.fromExternalQuest = function(quest,event){/**/
		if(!q.admin)
			return ERROR(3,'admin only');
		var array = [];
		for(var i = 2; i < arguments.length; i++)
			array.push(arguments[i]);
		Quest.get(quest).event[event].apply(this,array);
	}
	
	s.ERROR = function(txt){
		ERROR(4,txt);
	}
	
	s.frameToChrono = function(frame){
		return Tk.frameToChrono(frame);
	}
	
	s.getParty = function(key){
		return Party.getKeyList(Main.getParty(Main.get(key)));
	}
	
	//Quest Status
	s.startQuest = function(key,quest){/**/
		if(s.testQuestActive(key,quest)) 
			return true;
		return partyForEach(key,function(key2){
			return s.startQuest.one(key2,quest);
		});		
	}
	s.startQuest.one = function(key,quest){
		quest = quest || Q;
		if(s.testQuestActive(key,quest)) 
			return true;
		openStartQuest(key,quest);
		return false;
	}
	
	s.failQuest = function(key){	//NOT same function than when player choose to abandon
		return partyForEach(key,function(key2){
			s.failQuest.one(key2);
		});
	}
	s.failQuest.one = function(key){
		s.displayPopup.one(key,'You have failed the quest ' + q.name + '.',25*5);
		Main.abandonQuest(Main.get(key));
	}
	s.completeQuest = function(key){
		partyForEach(key,function(key2){
			s.completeQuest.one(key2);
		});
	}
	s.completeQuest.one = function(key){
		Main.completeQuest(Main.get(key));
	}
	s.testQuestActive = function(key,quest){
		if(quest === false)
			return !Main.get(key).questActive;
		if(quest !== undefined) 
			return Main.get(key).questActive === quest; //admin
		if(q.alwaysActive) 
			return true;
		if(Main.get(key).questActive === Q) 
			return true;
		return false;
	}
	s.haveQuestActive = function(key){/**/
		return !!Main.get(key).questActive;
	}
	s.haveCompletedQuest = function(key,quest){/**/
		return !!Main.haveCompletedQuest(Main.get(key),quest);
	}
	s.isOnline = function(key){
		return !!Actor.isOnline(key);
	}
	
	s.getPartySize = function(key){
		return Party.getSize(Main.getParty(Main.get(key)));
	}

	//Quest Variable
	s.get = function(key,attr){
		if(!s.isPlayer(key)) return;
		if(!s.testQuestActive(key,Q)) return;
		if(!q.inMain) return ERROR(3,'trying to access not inMain var');
		return QuestVar.get(Q,key,attr);
	}
	s.get.one = function(key,attr){
		return s.get(key,attr);
	}
	
	
	s.set = function(key,attr,value){
		if(!q.inMain) return;
		if(!s.isPlayer(key)) return;
		return partyForEach(key,function(key2){
			return s.set.one(key2,attr,value);
		});
	}
	s.set.one = function(key,attr,value){
		if(!s.testQuestActive(key,Q)) return;
		if(value === undefined)
			return ERROR(3,'value is undefined',attr);
		var currentValue = s.get.one(key,attr);
		if(currentValue === undefined)
			return ERROR(3,'you need to declare the variable in s.newVariable first');
		if(currentValue === value){
			Main.updateQuestHint(Main.get(key));	//BAD, used to update hint in tutorial for rep pts
			return;
		}
		
		QuestVar.set(Q,key,attr,value);
		Main.updateQuestHint(Main.get(key));	//must be after set
		
	}
	s.add = function(key,attr,value){
		if(!q.inMain) return;
		if(!s.isPlayer(key)) return;
		if(!s.testQuestActive(key,Q)) return;
		return partyForEach(key,function(key2){
			return s.add.one(key2,attr,value);
		});
	}
	s.add.one = function(key,attr,value){
		var val = s.get.one(key,attr);
		if(isNaN(val) || isNaN(value)) 
			return ERROR(3,'val or increment is NaN',attr,val,value);
		s.set.one(key,attr,val + value);
	}
	s.isChallengeActive = function(key,name){
		if(!s.isPlayer(key))
			return false;
		return Main.get(key).quest[Q].challenge === Qid(name);
	}
	
	//Communication - Misc
	s.message = function(key,text,color){	//Message.receive.parseInput [$1]
		partyForEach(key,function(key2){
			s.message.one(key2,text,color);
		});
	}
	s.message.one = function(key,text,color){
		Message.add(key,text,color);
	}
	
	s.inputToText = function(abilitySlot){
		return "[$" + abilitySlot + "]";
	}
	s.displayPopup = function(key,text){
		partyForEach(key,function(key2){
			s.displayPopup.one(key2,text);
		});
	}
	s.displayPopup.one = function(key,text){
		Message.addPopup(key,text);
	}
	s.displayQuestion = function(key,text,event,answerType,option,_preventClose){	//make it so only key===key2 can select optoins	
		event = parseEvent(event);
		Main.askQuestion(Main.get(key),event,text,answerType,option,_preventClose);
	}	
	
	s.startDialogue = function(key,npc,node,_evenIfNotActive){	//make it so only key===key2 can select optoins	
		if(q.alwaysActive)
			return s.startDialogue.one(key,npc,node,_evenIfNotActive);
		
		var activateEvent = true;
		partyForEach(key,function(key2){
			s.startDialogue.one(key2,npc,node,_evenIfNotActive,activateEvent);
			activateEvent = false;
		});
	}
	s.startDialogue.one = function(key,npc,node,evenIfNotActive,activateEvent){
		if(!evenIfNotActive && !s.testQuestActive(key))
			return openStartQuest(key);
		Main.startDialogue(Main.get(key),{quest:Q,npc:npc,node:node},activateEvent !== false);
	}
	
	
	s.displayPermPopup = function(key,text,model,css){/**/
		partyForEach(key,function(key2){
			s.displayPermPopup.one(key2,text,model,css);
		});
	}

	s.displayPermPopup.one = function(key,text,model,css){
		css = css || {};
		model = model || 'aboveInventory';
		Main.openDialog(Main.get(key),'permPopup',{text:text,model:model,css:css});
	}
	s.closePermPopup = function(key){/**/
		partyForEach(key,function(key2){
			s.closePermPopup.one(key2);
		});
	}
	s.closePermPopup.one = function(key){
		Main.openDialog(Main.get(key),'permPopup',false);
	}
	
	s.displayPermPopup.button = function(buttonId,html,title,style){
		return '<button style="' + (style || '') + '" title="' + (title || '') + '" onclick="exports.Command.execute(\'questButton\',[\'' + buttonId + '\']);">' + html + '</button>';
	}
	
	s.endDialogue = function(key){		
		partyForEach(key,function(key2){
			s.endDialogue.one(key2);
		});
	}	
	s.endDialogue.one = function(key){		
		Main.dialogue.end(Main.get(key));
	}	
	
	s.isInDialogue = function(key){
		return !!Main.get(key).dialogue;
	}
	s.startChrono = function(key,id,visible,text){
		return partyForEach(key,function(key2){
			return s.startChrono.one(key2,id,visible,text);
		});
	}
	s.startChrono.one = function(key,id,visible,text){
		return Main.chrono.start(Main.get(key),Qid(id),visible,text);
	}
	s.stopChrono = function(key,id){
		return partyForEach(key,function(key2){
			return s.stopChrono.one(key2,id);
		});
	}
	s.stopChrono.one = function(key,id){
		return Main.chrono.stop(Main.get(key),Qid(id));
	}
	s.removeChrono = function(key,id){
		return partyForEach(key,function(key2){
			return s.removeChrono.one(key2,id);
		});
	}
	s.removeChrono.one = function(key,id){
		return Main.chrono.remove(Main.get(key),Qid(id));
	}
	s.setTimeout = function(key,event,time,id){
		event = parseEvent(event);
		id = id || Math.randomId();
		if(isNaN(time)) return ERROR(3,'time NaN',time);
		Actor.setTimeout(Actor.get(key),event,time,Qid(id));	
	};
	
	s.setInterval = function(key,event,interval,id){
		event = parseEvent(event);
		id = id || Math.randomId();
		if(isNaN(interval)) return ERROR(3,'interval NaN',interval);
		Actor.setInterval(Actor.get(key),event,interval,Qid(id));	
	}
	
	s.clearTimeout = function(key){/**/
		partyForEach(key,function(key2){
			Quest.onReset.removeTimeout(Actor.get(key2),Q);
		});
	}
	
	s.addFadeout = function(key,id,duration,color){
		return partyForEach(key,function(key2){
			return s.addFadeout.one(key2,id,duration,color);
		});
	}
	s.addFadeout.one = function(key,id,duration,color){
		Main.addScreenEffect(Main.get(key),Main.ScreenEffect.fadeout(Qid(id),duration,color));
	}
	s.addTorchEffect = function(key,id,radiusInside,colorOutside,radiusOutside,colorInside){
		return partyForEach(key,function(key2){
			return s.addTorchEffect.one(key2,id,radiusInside,colorOutside,radiusOutside,colorInside);
		});
	}
	s.addTorchEffect.one = function(key,id,radiusInside,colorOutside,radiusOutside,colorInside){
		Main.addScreenEffect(Main.get(key),Main.ScreenEffect.torch(Qid(id),radiusInside,colorOutside,radiusOutside,colorInside));
	}
	s.shakeScreen = function(key,id,duration,interval,magn){
		return partyForEach(key,function(key2){
			return s.shakeScreen.one(key2,id,duration,interval,magn);
		});
	}
	s.shakeScreen.one = function(key,id,duration,interval,magn){
		Main.addScreenEffect(Main.get(key),Main.ScreenEffect.shake(Qid(id),duration,interval,magn));
	}
	s.trippyScreen = function(key,id){/**/
		return partyForEach(key,function(key2){
			return s.trippyScreen.one(key2,id);
		});
	}
	s.trippyScreen.one = function(key,id){
		Main.addScreenEffect(Main.get(key),Main.ScreenEffect.trippy(Qid(id)));
	}
	
	s.filterScreen = function(key,id,filter){
		return partyForEach(key,function(key2){
			return s.filterScreen.one(key2,id,filter);
		});
	}
	s.filterScreen.one = function(key,id,filter){
		Main.addScreenEffect(Main.get(key),Main.ScreenEffect.filter(Qid(id),filter));
	}
	
	s.removeScreenEffect = function(key,id){
		return partyForEach(key,function(key2){
			return s.removeScreenEffect.one(key2,id);
		});
	}	
	s.removeScreenEffect.one = function(key,id){
		Main.removeScreenEffect(Main.get(key),Qid(id));
	}
	
	s.startWeatherRain = function(key,id,magn,filter){/**/
		return partyForEach(key,function(key2){
			return s.startWeatherRain.one(key2,id,magn,filter);
		});
	}
	s.startWeatherRain.one = function(key,id,magn,filter){
		Main.addScreenEffect(Main.get(key),Main.ScreenEffect.rain(Qid(id),magn,filter));
	}
		
	s.setHUD = function(key,name,value,time){/**/
		return partyForEach(key,function(key2){
			return s.setHUD.one(key2,name,value,time);
		});
	}
	
	s.setHUD.one = function(key,name,value,time){
		if(Main.get(key).hudState[name] === undefined)
			return ERROR(3,'invalid hud name',name);
			
		if(!q.admin){
			var allowed = ['minimap','hp','mana','abilityBar','curseClient','inventory'];
			if(!allowed.$contains(name)) 
				return ERROR(3,'cant change hudState of',name);
		}
		
		if(value === 'normal')
			value = Main.hudState.NORMAL;
		else if(value === 'invisible')
			value = Main.hudState.INVISIBLE;
		else if(value === 'flashing')
			value = Main.hudState.FLASHING;	
		else 
			return ERROR(3,'invalid hud value',value);
		Main.hudState.set(Main.get(key),name,value);
		
		if(time){
			s.setTimeout(key,function(){
				s.setHUD(key,name,'normal');
			},time);
		}
	}
	
	s.restoreHUD = function(key){/**/
		return partyForEach(key,function(key2){
			return s.restoreHUD.one(key2);
		});
	}
	s.restoreHUD.one = function(key){
		var hud = Main.get(key).hudState;
		for(var i in hud){
			Main.hudState.set(Main.get(key),i,Main.hudState.NORMAL);
		}	
	}	
		
	//Teleport - Positions
	s.teleport = function(key,map,letter,instance,newmap,deleteold,_slideTransition){	//
		if(q.alwaysActive)
			return s.teleport.one(key,map,letter,instance,newmap,deleteold,_slideTransition);
	
		return partyForEach(key,function(key2){
			s.teleport.one(key2,map,letter,instance,newmap,deleteold,_slideTransition,true);
			newmap = false;	//only potentially true for first one
			deleteold = false;																				
			return;
		});		
	}
	s.teleport.one = function(key,map,letter,instance,createNewMap,deleteOld,slideTransition,inLoop){
		if(!s.isPlayer(key)) return;
		map = mapFormat(map);
		if(!s.testQuestActive(key)) 
			return openStartQuest(key);
		
		if(!instance || instance === 'party') 
			map += CST.MAP.separator;
		else if(instance === 'solo') 
			map += CST.MAP.solo;
			
		var spot = getSpot.map(map,letter);	
		if(!inLoop && s.isInMap(key,map) && createNewMap)
			return ERROR(3,'cant call s.teleport.one and overwrite new map at same time.');
		var transition = slideTransition ? CST.TRANSITION_MAP.slide : CST.TRANSITION_MAP.fadeout;
		Actor.teleport.fromQuest(Actor.get(key),spot,createNewMap,deleteOld,transition);
		Main.updateQuestHint(Main.get(key));
	}
		
	s.teleport.force = function(key,x,y,map){	//for DEBUG
		if(!Debug.isActive()) return;
		map = mapFormat(map);
		Actor.teleport(Actor.get(key),Maps.Spot(x,y,map));	
	}
	s.teleportTown = function(key){
		return partyForEach(key,function(key2){
			return s.teleportTown.one(key2);
		});	
	}
	s.teleportTown.one = function(key){
		if(!s.isPlayer(key)) return;
		Actor.teleport.town(Actor.get(key));
		Main.updateQuestHint(Main.get(key));
	}
	
	s.setRespawn = function(key,map,letter,instance,safe){
		return partyForEach(key,function(key2){
			return s.setRespawn.one(key2,map,letter,instance,safe);
		});	
	}
	s.setRespawn.one = function(key,map,letter,instance,safe){
		map = mapFormat(map);
		if(!instance || instance === 'party') 
			map += CST.MAP.separator;
		if(instance === 'solo') 
			map += CST.MAP.solo;
		
		var spot = getSpot.map(map,letter);
		if(!spot) return ERROR(3,'no spot');
		Actor.setRespawn(Actor.get(key),spot,safe);
	}
	
	//missing one
	s.followPath = function(key,mapId,pathId,callback){
		if(!s.isInMap(key,mapId)) 
			return ERROR(3,'trying to spawn monster while player is not in map');
		callback = parseEvent(callback);
		var act = Actor.get(key);
		Actor.followPath(act,q.path[Qid(pathId)].list,callback);
	}
	s.endPath = function(key){
		var act = Actor.get(key);
		Actor.endPath(act);
	}
	
	s.addQuestMarker = function(key,id,map,letter){
		return partyForEach(key,function(key2){
			return s.addQuestMarker.one(key2,id,map,letter);
		});
	}
	s.addQuestMarker.one = function(key,id,map,letter){
		map = mapFormat(map);
		var spot = getSpot.map(map,letter);
		Actor.addQuestMarker(Actor.get(key),Qid(id),spot);
	};
	s.removeQuestMarker = function(key,id){
		return partyForEach(key,function(key2){
			return s.removeQuestMarker.one(key2,id);
		});
	}
	s.removeQuestMarker.one = function(key,id){
		Actor.removeQuestMarker(Actor.get(key),Qid(id));
	};
	s.removeAllQuestMarker = function(key){/**/
		return partyForEach(key,function(key2){
			return s.removeAllQuestMarker.one(key2);
		});
	}
	s.removeAllQuestMarker.one = function(key){
		Actor.removeAllQuestMarker(Actor.get(key));
	};
	
	s.addStartQuestMarker = function(key){
		var qm = Quest.get(Q).questMarker;
		if(!qm)
			return ERROR(3,'no start quest marker');
		return Actor.addQuestMarker(Actor.get(key),Qid('_start'),qm);
	}
	s.removeStartQuestMarker = function(key){
		return s.removeQuestMarker(key,'_start');
	}
	//Map Common
	s.isAtPosition = function(key,x,y,delta){
		delta = delta || 4;
		var act = Actor.get(key);
		if(Math.abs(act.x - x) > delta) return false;
		if(Math.abs(act.y - y) > delta) return false;
		return true;
	}
	s.isAtSpot = function(key,map,letter,delta){
		if(!s.isInMap(key,map)) return false;
		var spot = getSpot(key,map,letter);
		return m.isAtSpot(key,spot,delta)
	}
	s.isAtStartSpot = function(key){
		var qm = Quest.get(Q).questMarker;
		if(!qm)
			return ERROR(3,'no start quest marker');
		return m.isAtSpot(key,qm,200);
		
	}
	s.isInMap = function(key,map){
		if(!Actor.get(key))
			return ERROR(3,'no actor',key,Q);
		map = mapFormat(map);
		return Actor.isInMap(Actor.get(key),map);
	}
	s.isInQuestMap = function(key){
		return Actor.get(key).map.$contains(Q,true);
	}
	s.getDistance = function(key,key2){
		return Collision.getDistancePtPt(Actor.get(key),Actor.get(key2));
	}
	s.getPosition = function(key){
		var act = Actor.get(key);
		return Actor.toSpot(act);	
	}
	s.canInteractWith = function(key,eid,message,overwriteDist){
		return Actor.canInteractWith(Actor.get(key),Actor.get(eid),message,overwriteDist,true);
	}
	s.moveActor = function(key,vx,vy){
		Actor.moveBy(Actor.get(key),vx,vy);
	}
	//Map Event
	s.getRandomPlayer = function(key,map){
		return m.getRandomPlayer(keyToSpot(key,map));
	}
	s.getRandomNpc = function(key,map,tag){
		return m.getRandomNpc(keyToSpot(key,map),tag);
	}
	
	//Tag
	s.hasTag = function(key,tag){	//tag={name:value}
		var act = Actor.get(key);
		for(var i in tag)
			if(act.tag[i] !== tag[i])
				return false;
		return true;
	}
	s.getTag = function(key){
		return Tk.deepClone(Actor.get(key).tag);
	}
	s.setTag = function(key,tag,value){
		Actor.get(key).tag[tag] = value;
	}
	
	
	//Map Creation in Event
	s.forEachActor = function(key,map,event,actorType,atSpot,tag){
		if(!s.isInMap(key,map)) return ERROR(3,'actor is not in map',map);
		if(atSpot) atSpot = getSpot(key,map,atSpot);
		map = Actor.get(key).map;
		event = parseEvent(event);
		return m.forEachActor({map:map},1,event,actorType,atSpot,tag);
	}
		
	s.spawnActor = function(key,map,letter,model,extra){
		map = mapFormat(map);
		if(!s.isInMap(key,map)) 
			return ERROR(3,'trying to spawn monster while player is not in map');
		var spot = getSpot(key,map,letter);
		return m.spawnActor(spot,model,extra);
	}
	s.spawnActorOnTop = function(key,map,model,extra){
		map = mapFormat(map);
		var act = Actor.get(key);
		if(!s.isInMap(key,map)) 
			return ERROR(3,'trying to spawn monster while player is not in map');
		var spot = Actor.toSpot(act);
		return m.spawnActor(spot,model,extra);	
	}
	s.spawnActorGroup = function(key,map,letter,respawn,list,event,spotDelta){
		map = mapFormat(map);
		if(!s.isInMap(key,map)) 
			return ERROR(3,'trying to spawn monster while player is not in map');
		
		event = parseEvent(event);
		var spot = getSpot(key,map,letter);
		return m.spawnActorGroup(spot,list,respawn,event,spotDelta);
	}
	s.spawnActorGroup.list = function(model,amount,extra){
		return m.spawnActorGroup.list(model,amount,extra);
	}
	
	s.spawnBlock = function(key,map,letter,viewedIf,sprite,extra){
		map = mapFormat(map);
		if(!s.isInMap(key,map)) 
			return ERROR(3,'trying to spawn monster while player is not in map');
		var spot = getSpot(key,map,letter);
		return m.spawnBlock(spot,viewedIf,sprite,extra);
	}
	
	s.addAnim = function(key,map,letter,name,sizeMod){
		map = mapFormat(map);
		if(!s.isInMap(key,map)) 
			return ERROR(3,'trying to spawn anim while player is not in map');
		
		var spot = getSpot(key,map,letter);
		return Anim.create(s.newAbility.anim(name,sizeMod),Anim.Target(spot.x,spot.y,spot.map,CST.VIEWED_IF.always));
	}
	s.addAnimOnTop = function(key,name,sizeMod,dontFollowActor){
		if(dontFollowActor !== true)
			return Anim.create(s.newAbility.anim(name,sizeMod),Anim.Target(key));
		
		var spot = Actor.get(key);
		return Anim.create(s.newAbility.anim(name,sizeMod),Anim.Target(spot.x,spot.y,spot.map,CST.VIEWED_IF.always));
	}
	
	//Preset Related
	s.usePreset = function(key,id){
		return partyForEach(key,function(key2){
			return s.usePreset.one(key2,id);
		});	
	}
	s.usePreset.one = function(key,id){
		Actor.addPreset(Actor.get(key),Qid(id));
	}
	s.hasPreset = function(key,id){
		return !!Actor.get(key).preset[Qid(id)];
	}
	s.hasPreset.one = function(key,id){
		return s.hasPreset(key,id);
	}
	s.removePreset = function(key,id){
		return partyForEach(key,function(key2){
			return s.removePreset.one(key2,id);
		});
	}
	s.removePreset.one = function(key,id){
		Actor.removePreset(Actor.get(key),Qid(id));
	}
	s.addAbility = function(key,id,slot){
		return partyForEach(key,function(key2){
			return s.addAbility.one(key2,id,slot);
		});
	}
	s.addAbility.one = function(key,id,slot){
		if(!q.ability[id])
			return ERROR(4,'no ability',id);
		var act = Actor.get(key);
		Actor.addAbility(act,Qid(id),false);
		if(typeof slot === 'number' || slot === undefined)
			Actor.swapAbility(act,Qid(id),slot);
	}
	
	s.hasAbility = function(key,id){
		if(id[0] !== 'Q') 
			id = Qid(id);
		var ab = Actor.getAbility(Actor.get(key));
		for(var i in ab)
			if(ab[i] && ab[i].id === id){
				return true;
			}
		return false;
	}
	s.addEquip = function(key,id){
		return partyForEach(key,function(key2){
			return s.addEquip.one(key2,id);
		});
	}
	s.addEquip.one = function(key,id){
		var act = Actor.get(key);
		Actor.changeEquip(act,Qid(id));
	}	
	
	s.getEquip = function(key,piece){/**/
		var p = Actor.getEquip(Actor.get(key)).piece;
		if(p[piece] === undefined)
			return ERROR(3,'invalid piece',piece);
		return p[piece];
	}
	s.getEquipType = function(key,piece){/**/
		var p = Actor.getEquip(Actor.get(key)).piece;
		if(p[piece] === undefined)
			return ERROR(3,'invalid piece',piece);
		if(!p[piece])	//unequip
			return null;
		return Equip.get(p[piece]).type;
	}
	
	
	//Enable
	s.enableReputation = function(key,allow){
		return partyForEach(key,function(key2){
			return s.enableReputation.one(key2,allow);
		});
	}
	s.enableReputation.one = function(key,allow){
		if(typeof allow === 'undefined') 
			allow = true;
		if(!allow)
			s.usePreset.one(key,'_disableReputation');
		else
			s.removePreset.one(key,'_disableReputation');
	}
	s.enableAttack = function(key,allow){
		return partyForEach(key,function(key2){
			return s.enableAttack.one(key2,allow);
		});
	}
	s.enableAttack.one = function(key,allow){
		if(typeof allow === 'undefined') 
			allow = true;
		if(!allow)
			s.usePreset.one(key,'_disableAbility');
		else
			s.removePreset.one(key,'_disableAbility');
	}
	s.enableCombat = function(key,allow){
		return partyForEach(key,function(key2){
			return s.enableCombat.one(key2,allow);
		});
	}
	s.enableCombat.one = function(key,allow){
		if(typeof allow === 'undefined') 
			allow = true;
		if(!allow)
			s.usePreset.one(key,'_disableCombat');
		else
			s.removePreset.one(key,'_disableCombat');
	}
	s.disableCombatUntilMove = function(key){
		Actor.addPresetUntilMove(Actor.get(key),Qid('_disableCombatUntilMove'),10);
	}
	s.enablePvp = function(key,allow){
		return partyForEach(key,function(key2){
			return s.enablePvp.one(key2,allow);
		});
	}
	s.enablePvp.one = function(key,allow){
		if(typeof allow === 'undefined') 
			allow = true;
		if(!allow)
			s.removePreset.one(key,'_enablePvp');
		else
			s.usePreset.one(key,'_enablePvp');
	}
	s.enableMove = function(key,allow){
		return partyForEach(key,function(key2){
			return s.enableMove.one(key2,allow);
		});
	}
	s.enableMove.one = function(key,allow){
		if(typeof allow === 'undefined') 
			allow = true;
		if(!allow)
			s.usePreset.one(key,'_disableMove');
		else 	
			s.removePreset.one(key,'_disableMove');
	}
	
	
	
	//Actor Mods
	s.setSprite = function(key,name,size,alpha){
		return partyForEach(key,function(key2){
			return s.setSprite.one(key2,name,size,alpha);
		});
	}
	s.setSprite.one = function(key,name,size,alpha){
		var tmp = {};
		if(name) 
			tmp.name = name === 'normal' ? CST.SPRITE_NORMAL : name;
		if(size) tmp.sizeMod = size;
		if(alpha) tmp.alpha = alpha;
		Actor.changeSprite(Actor.get(key),tmp);
	}
	
	s.addBoost = function(key,stat,value,time,name){
		return partyForEach(key,function(key2){
			return s.addBoost.one(key2,stat,value,time,name);
		});
	}
	s.addBoost.one = function(key,stat,value,time,name){
		if(stat === 'maxSpd' && s.isPlayer(key))
			return ERROR(3,'maxSpd cant be modified');
		name = name || Math.randomId();
		if(!time) 
			Actor.addPermBoost(Actor.get(key),Qid(name),[
				Boost.Perm(stat,value,CST.BOOST_XXX)
			]);
		else 
			Actor.addBoost(Actor.get(key),Boost.create(Qid(name),stat,value,time,CST.BOOST_X));
		
	}
	s.removeBoost = function(key,name,stat){
		return partyForEach(key,function(key2){
			return s.removeBoost.one(key2,name,stat);
		});
	}
	s.removeBoost.one = function(key,name,stat){
		Actor.boost.removeById(Actor.get(key),stat,Qid(name)); //wait
		Actor.addPermBoost(Actor.get(key),Qid(name));
	}
	
	
	s.actorExists = function(key){
		return !!Actor.get(key);
	}
	s.killParty = function(key){
		return partyForEach(key,function(key2){
			return s.killActor(key2);
		});
	}
	s.killActor = function(key,_instant){
		Actor.kill(Actor.get(key),_instant);
	}
	s.rechargeAbility = function(key){
		return partyForEach(key,function(key2){
			return s.rechargeAbility.one(key2);
		});	
	}
	s.rechargeAbility.one = function(key){
		Actor.rechargeAbility(Actor.get(key));		
	}
	s.isPlayer = function(key){
		return Actor.get(key) && Actor.get(key).type === CST.ENTITY.player;
	}
	s.addHp = function(key,amount){
		return partyForEach(key,function(key2){
			return s.addHp.one(key2,amount);
		});
	}
	s.addHp.one = function(key,amount,addHitHistory){
		Actor.addHp(Actor.get(key),amount,addHitHistory);
	}
	s.setHp = function(key,amount){
		return partyForEach(key,function(key2){
			return s.setHp.one(key2,amount);
		});
	}
	s.setHp.one = function(key,amount){
		Actor.setHp(Actor.get(key),amount);
	}
	
	s.setSpriteFilter = function(key,filterName,time){/**/
		if(!CST.SPRITE_FILTER[filterName])
			return ERROR(3,'invalid filter',filterName);
		Actor.setSpriteFilter(Actor.get(key),Actor.SpriteFilter(filterName,time));
	}
	
	s.healActor = function(key){
		var act = Actor.get(key);
		act.hp = act.hpMax;
		act.mana = act.manaMax;
		
		Actor.clearStatus(act);
	}
	s.healParty = function(key){
		return partyForEach(key,function(key2){
			return s.healActor(key2);
		});
	}
	
	s.respawnPlayer = function(key){
		return ERROR(4,'unsupported');
	}
	s.respawnParty = function(key){
		Actor.reviveAndTeleportParty(Actor.get(key));
	}
	s.triggerPush = function(pusher,pushed){
		Actor.click.pushable(Actor.get(pusher),pushed);
	}
	
	s.simulatePush = function(pushed,direction){
		var angle = 0;
		if(direction === 'down') angle = 90;
		else if(direction === 'up') angle = 270;
		else if(direction === 'left') angle = 180;
		else if(direction === 'right') angle = 0;
		else return ERROR(4,'invalid direction',direction);
		
		var act = Actor.get(pushed);
		if(!act.pushable) return ERROR(3,'not pushable',act.name);
		Actor.initPushable(act,angle);
	}
	
	s.getSpot = function(key,map,letter){
		return Tk.deepClone(getSpot(key,map,letter));
	}
		
	s.moveTo = function(key,map,letter,callback){
		callback = parseEvent(callback);
		var act = Actor.get(key);
		if(act.type === CST.ENTITY.player)
			return ERROR(4,'cant only moveTo npc');
		var spot = getSpot(key,map,letter);
		var cutscene = [
			MapModel.Path.Spot.quick(spot.x,spot.y)	//bad, cs has much more attr
		];
		Actor.followPath(act,cutscene,callback);
	}
	s.teleportTo = function(key,map,letter){
		if(s.isPlayer(key))
			return ERROR(3,'s.teleportTo can only be used by npc');
		if(!s.isInMap(key,map))
			return ERROR(3,'in wrong map');
		var spot = getSpot(key,map,letter);
		s.setAttr(key,'x',spot.x);
		s.setAttr(key,'y',spot.y);
	}
	
	//Item
	s.addItem = function(key,item,amount){
		return partyForEach(key,function(key2){
			return s.addItem.one(key2,item,amount);
		});	
	}
	s.addItem.one = function(key,item,amount){
		if(!s.testQuestActive(key)) return false;
		Main.addItem(Main.get(key),itemFormat(item,amount));
		Main.updateQuestHint(Main.get(key));
	}
	s.removeItem = function(key,item,amount){
		return partyForEach(key,function(key2){
			return s.removeItem.one(key2,item,amount);
		});
	}
	s.removeItem.one = function(key,item,amount){
		Main.removeItem(Main.get(key),itemFormat(item,amount));
	}
	s.haveItem = function(key,item,amount){
		return partyForEach(key,function(key2){
			return s.haveItem.one(key2,item,amount);
		});
	}
	s.haveItem.one = function(key,item,amount){
		var list = itemFormat(item,amount);
		return Main.haveItem(Main.get(key),list);
	}
	s.getItemAmount = function(key,item){
		return Main.getItemAmount(Main.get(key),Qid(item));
	}	
	s.getItemAmount.one = function(key,item){
		return s.getItemAmount(key,item);
	}
	
	s.setAttr = function(key,attr,value){	
		if(!ALLOWED_ATTR[attr]) return ERROR(3,'not allowed to set this attr');
		if(s.isPlayer(key)) return ERROR(3,'not allowed to change player attr');
		if(attr === 'killRewardMod' && !q.admin)
			return ERROR(3,'only admins can change killRewardMod');
		Actor.get(key)[attr] = value;
	}
	s.getAttr = function(key,attr){
		if(!ALLOWED_ATTR[attr]) return ERROR(3,'not allowed to get this attr');
		return Tk.deepClone(Actor.get(key)[attr]);
	}
	var ALLOWED_ATTR = {cantDie:1,sprite:1,killRewardMod:1,angle:1,damagedIf:1,damageIf:1,targetIf:1,globalDef:1,globalDmg:1,name:1,combat:1,dead:1,move:1,hp:1,hpMax:1,mana:1,manaMax:1,maxSpd:1,acc:1,x:1,y:1}
	//note: globalDef and globalDmg should be read-only, because affected by balancing boost Combat_shared.js
	
	s.getPermData = function(key){/**/	//only for 1 dude, not all party
		Main.getQuestPermData(Main.get(key),Q);
	}
	s.setPermData = function(key,value){/**/
		Main.setQuestPermData(Main.get(key),Q,value);
	}
	
	s.playSfx = function(key,id,volume){
		volume = isNaN(volume) ? 1 : volume;
		Main.playSfx(Main.get(key),{id:id,volume:volume});
	}
	s.playSong = function(key,id,volume){/**/
		volume = isNaN(volume) ? 1 : volume;
		Main.playSong(Main.get(key),{id:id,volume:volume});
	}
	//Admin	
	
	s.iconToText = function(id,_extra){
		return IconModel.toText(id,null,null,_extra);
	}
	
	s.teleport.admin = function(key,map,letter,instance,newmap,deleteold){
		if(!q.admin) return ERROR(3,'not admin');
		map = mapFormat(map);
		
		if(!instance || instance === 'party') 
			map += CST.MAP.separator;
		else if(instance === 'solo') 
			map += CST.MAP.solo;
			
		var spot = getSpot.map(map,letter);	
		
		Actor.teleport.fromQuest(Actor.get(key),spot,newmap,deleteold);
	}
	
	s.addItem.permanently = function(key,item,amount){
		if(!q.admin) return;
		Main.addItem(Main.get(key),item,amount || 1);
	}
	
	s.addAbility.permanently = function(key,name,slot){
		if(!q.admin) return;
		var act = Actor.get(key);
		Actor.addAbility(act,name,false);
		if(typeof slot === 'number' || slot === undefined)
			Actor.swapAbility(act,name,slot);
	}
	s.addEquip.permanently = function(key,name){
		if(!q.admin) return ERROR(3,'not admin');
		var act = Actor.get(key);
		Actor.changeEquip(act,name);
	}
	
	s.addQuestMarker.admin = function(key,id,quest,map,letter){
		if(!q.admin) 
			return ERROR(2,'not admin');
		var spot = MapModel.get(map).addon[quest].spot[letter] || ERROR(2,'invalid spot',quest,map,letter);
		Actor.addQuestMarker(Actor.get(key),Qid(id),spot);
	}
	
	s.openDialog = function(key,name,param){/**/
		if(!q.admin) return ERROR(3,'need to be admin');
		Main.openDialog(Main.get(key),name,param);
	}
	s.closeDialog = function(key,name,param){/**/
		if(!q.admin) return ERROR(3,'need to be admin');
		Main.closeDialog(Main.get(key),name);
	}
	
	s.getLevel = function(key){/**/
		return Actor.getLevel(Actor.get(key));
	}
	
	s.triggerAchievement = function(key,what){/**/
		if(!q.admin)
			return ERROR(3,'triggerAchievement is admin only');
		return Achievement.on(Main.get(key),what);
	}
	s.salvageInventory = function(key){/**/
		if(!q.admin)
			return ERROR(3,'salvageInventory is admin only');
		return Debug.salvageInventory(key);
	}
	s.skipTutorial = function(key,triggeredAuto){/**/
		if(Q !== 'Qtutorial')
			return ERROR(3,'can only skip tutorial');
		if(!q.admin)
			return ERROR(3,'skipTutorial is admin only');
		
		if(!triggeredAuto || (Debug.isActive() && Debug.getAttr('SKIP_TUTORIAL')))
			Debug.skipTutorial(key);
	}
	
	s.setChatHead = function(key,text){/**/
		Actor.get(key).chatHead = Actor.ChatHead(text);
	}
	
	s.sendFakePm = function(key,text,from){/**/
		if(!q.admin)
			return ERROR(3,'skipTutorial is admin only');
		Message.add(key,Message.Pm(text,from,key));
	}	
	s.sendFakeChat = function(key,text,from){/**/
		if(!q.admin)
			return ERROR(3,'skipTutorial is admin only');
		Message.add(key,Message.Public(text,from,'FF5555'));
	}
	
	s.getReputationUsedPt = function(key){/**/
		return Main.reputation.getUsedPt(Main.get(key));
	}
	
	//sidequest
	s.getSideQuestCompleteCount = function(key,repeat){/**/
		return Main.SideQuest.getCompleteCount(Main.get(key),repeat);
	}
	s.getSideQuest = function(key,id){/**/
		var map = Actor.get(key).map;
		return SideQuest.getInstance(Qid(id) + '-' + map);
	}
	
	
	
	return s;
}

})(); //{

