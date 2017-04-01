
"use strict";
(function(){ //}
var Main, MapModel, Waypoint, MapGraph, Actor, SkillPlotModel, Quest,  ActorGroup, Maps, Collision;
global.onReady(function(){
	Quest = rootRequire('server','Quest'); Main = rootRequire('shared','Main'); MapModel = rootRequire('server','MapModel'); Waypoint = rootRequire('shared','Waypoint'); MapGraph = rootRequire('shared','MapGraph'); Actor = rootRequire('shared','Actor'); SkillPlotModel = rootRequire('server','SkillPlotModel'); ActorGroup = rootRequire('server','ActorGroup'); Maps = rootRequire('server','Maps'); Collision = rootRequire('shared','Collision');
});


var defaultV = 200;

var applyFunctionToList = function(event,list){
	for(var i = 0 ; i < list.length; i++){
		if(event(list[i],i,list.length) === 'return') return;
	}	
}
		
exports.newQuest_map = function(s,Q,Qid,parseActorExtra,modelFormat,parseEvent,mapFormat){ //}
	var q = s.quest;
	var m = s.map = {}; 
	//Load
	m.spawnActor = function(spot,model,extra){
		if(!spot) 
			return ERROR(2,'spot dont exist');
		
		if(extra && extra.v){ 
			spot = ActorGroup.alterSpot(spot,extra.v);
			delete extra.v; 
		}
		
		var act = Actor.create(modelFormat(model),parseActorExtra(extra,spot));
		return Actor.addToMap(act,spot).id;
	}
	m.spawnActorGroup = function(spot,list,respawn,event,spotDelta){
		if(!spot) return ERROR(3,'spot dont exist');
		event = parseEvent(event);
		spotDelta = spotDelta === undefined ? defaultV : spotDelta;
		respawn = respawn === undefined ? CST.NPC_RESPAWN : respawn;
		
		for(var i = 0 ; i < list.length; i++)
			list[i].extra = parseActorExtra(list[i].extra,spot);
			
		var list2 = ActorGroup.create(spot,list,respawn,spotDelta);
		if(event)
			for(var i = 0 ; i < list2.length; i++)
				event(list2[i]);
		return list2;
	}
	m.spawnActorGroup.list = function(model,amount,extra){
		return ActorGroup.List(modelFormat(model),amount,extra);
	}
	var VALID_BLOCK_SPRITE = ['invisible','spike'];
	m.spawnBlock = function(zone,viewedIf,sprite,extra){	//only support spikes
		sprite = sprite || 'spike';
		if(!VALID_BLOCK_SPRITE.$contains(sprite))
			return ERROR(3,'invalid sprite',sprite);
		if(!zone) return ERROR(3,'zone dont exist');
		extra = extra || {};
		viewedIf = parseEvent(viewedIf);
		if(viewedIf) 
			extra.viewedIf = viewedIf;
		if(sprite === 'invisible')
			extra.sprite = s.newNpc.sprite('invisible');
			
		extra = parseActorExtra(extra,zone);
		
		var totalinit = Math.max(Math.abs(zone.width)/32,Math.abs(zone.height)/32);
		var total = totalinit;	
		var a9 = Math.floor(total/9);	total -= a9*9;
		var a5 = Math.floor(total/5);	total -= a5*5;
		var a3 = Math.floor(total/3);	total -= a3*3;
		var a1 = total;
		var list = {'1':a1,'3':a3,'5':a5,'9':a9};
		var haveAppliedBlockOnce = false;		
		
		if(zone.height <= 32){	//horizontal
			var x = zone.x + 16;
			var y = zone.y + 16;
			for(var i in list){
				var ext = Tk.deepClone(extra);
				if(sprite === 'spike') 
					ext.sprite = s.newNpc.sprite('block-spike' + i + 'x1');
				
				for(var j = 0 ; j < list[i]; j++){
					if(!haveAppliedBlockOnce) 
						ext.block = s.newNpc.block(s.newNpc.block.size(totalinit,1,0,0),1);
					var spot = Actor.Spot(x,y,zone.map,zone.mapModel);
					m.spawnActor(spot,'block-spike',ext);
					if(!haveAppliedBlockOnce){ 
						ext = Tk.deepClone(ext); 
						ext.block = null;
						haveAppliedBlockOnce = true;
					}
					x += 32*(+i);
				}
			}
		}
		else if(zone.width <= 32){	//vertical
			var x = zone.x + 16;
			var y = zone.y + 16;
			for(var i in list){
				var ext = Tk.deepClone(extra);
				if(sprite === 'spike')
					ext.sprite = s.newNpc.sprite('block-spike1x' + i);
					
				for(var j = 0 ; j < list[i]; j++){
					if(!haveAppliedBlockOnce) 
						ext.block = s.newNpc.block(s.newNpc.block.size(1,totalinit,0,0),1);
					var spot = Actor.Spot(x,y,zone.map,zone.mapModel);
					m.spawnActor(spot,'block-spike',ext);
					if(!haveAppliedBlockOnce){ 
						ext = Tk.deepClone(ext); 
						ext.block = null;
						haveAppliedBlockOnce = true;
					}
					y += 32*(+i);
				}
			}
		}
		else {
			//size == 2
				
			//ERROR(3,'spot is not a rectangle',spot);
			var ext = Tk.deepClone(extra);
			ext.block = s.newNpc.block(s.newNpc.block.size(1,1,0,0),1);
			ext.sprite = s.newNpc.sprite('block-spike1x1');
			
			if(zone.x % 32 === 0){	//horizontal
				var spot = Actor.Spot(zone.x-16,zone.y,zone.map,zone.mapModel);
				var spot2 = Actor.Spot(zone.x+16,zone.y,zone.map,zone.mapModel);
				m.spawnActor(spot,'block-spike',ext);
				m.spawnActor(spot2,'block-spike',ext);
			} else {	//vertical
				var spot = Actor.Spot(zone.x,zone.y-16,zone.map,zone.mapModel);
				var spot2 = Actor.Spot(zone.x,zone.y+16,zone.map,zone.mapModel);
				m.spawnActor(spot,'block-spike',ext);
				m.spawnActor(spot2,'block-spike',ext);
			}
		}
	}
	
	var VALID_TOOGLE_SPRITE = ['box','red','green','yellow','wall'];
	m.spawnToggle = function(spot,viewedIf,turnOn,turnOff,sprite,extraOff,extraOn){
		sprite = sprite || 'box';
		if(!VALID_TOOGLE_SPRITE.$contains(sprite))
			return ERROR(3,'invalid sprite',sprite);
		viewedIf = parseEvent(viewedIf);
		turnOn = parseEvent(turnOn);
		turnOff = parseEvent(turnOff);
		
		//Off
		extraOff = parseActorExtra(extraOff,spot);
			
		extraOff.viewedIf = function(key){
			if(Actor.get(key).type !== CST.ENTITY.player) return true;
			return viewedIf(key,this.id) === true;
		};
		if(turnOn)
			extraOff.toggle = turnOn;
		
		m.spawnActor(spot,'toggle-' + sprite+'Off',extraOff);

		//On
		extraOn = parseActorExtra(extraOn,spot);
		extraOn.viewedIf = function(key){
			if(Actor.get(key).type !== CST.ENTITY.player) return true;
			return viewedIf(key,this.id) === false;
		};
		if(turnOff) 
			extraOn.toggle = turnOff;
		else
			extraOn.toggle = function(key){
				s.message(key,'This switch is already active.');
				return false;
			};
		
		m.spawnActor(spot,'toggle-' + sprite + 'On',extraOn);
	}
	m.spawnTeleporter = function(spot,event,sprite,extra,_destination,_autoTeleport){
		sprite = sprite || 'zone';
		extra = extra || {};
		if(typeof extra === 'string') 
			extra = {angle:s.newNpc.angle(extra)};
		extra.teleport = event;
		extra = parseActorExtra(extra,spot);
		var eid = m.spawnActor(spot,'teleport-' + sprite,extra);
		
		if(_autoTeleport === undefined)
			_autoTeleport = sprite === 'zone' || sprite === 'zoneLight';
		if(_autoTeleport)
			Maps.addAutoTeleport(Maps.get(spot.map),eid);
		if(_destination)
			MapGraph.create(spot,mapFormat(_destination));
	}
	m.spawnLoot = function(spot,viewedIf,open,sprite,extraOff,extraOn){
		viewedIf = parseEvent(viewedIf);
		open = parseEvent(open);
		sprite = sprite || 'chest';
		
		//Off
		extraOff = parseActorExtra(extraOff,spot);
		extraOff.viewedIf = function(key,eid){
			if(Actor.get(key).type !== CST.ENTITY.player) return true;
			return viewedIf(key,eid) === true;
		};
		extraOff.loot = open;

		m.spawnActor(spot,'loot-' + sprite + 'Off',extraOff);

		//On
		extraOn = parseActorExtra(extraOn,spot);
		extraOn.viewedIf = function(key,eid){
			if(Actor.get(key).type !== CST.ENTITY.player) return true;
			return viewedIf(key,eid) === false;
		};
		
		m.spawnActor(spot,'loot-' + sprite + 'On',extraOn);
	}
	m.spawnSignpost = function(spot,text,extra){
		extra = parseActorExtra(extra,spot);
		if(typeof text === 'string'){
			extra.signpost = function(key){
				s.displayPopup(key,text);
			}
		} else if(typeof text === 'function'){
			extra.signpost = text;	//text is function
		} else 
			return ERROR(3,'text not a func or string',text); 
		
		return m.spawnActor(spot,'system-sign',extra);	
	}
	m.spawnSkillPlot = function(spot,quest,type){/**/
		if(!Quest.get(quest))
			quest = 'QlureKill'; //TODO
		var plot = SkillPlotModel.get(type);
		
		var func = function(key,eid){
			if(!Main.get(key)) return true;
			var plot = Actor.get(eid).skillPlot;
			var mq = Main.get(key).quest[plot.quest];
			return mq && !mq.skillPlot && (Date.now() - mq.completeTime > SkillPlotModel.TIMER);
		};
		m.spawnActor(spot,plot.model,{
			skillPlot:Actor.SkillPlot(quest,type),
			viewedIf:func	
		});

		m.spawnActor(spot,plot.downModel,{
			skillPlot:Actor.SkillPlot(quest,CST.SKILLPLOT_DOWN),
			viewedIf:function(key,eid){
				return !func(key,eid);	
			},
		});
		MapModel.addWorldMapIcon(spot,'skillPlot');
	}
	m.spawnBank = function(spot,extra){/**/
		if(!q.admin)
			return ERROR(3,'bank admin only');
		MapModel.addWorldMapIcon(spot,'bank');
		return m.spawnActor(spot,'system-bank',parseActorExtra(extra,spot));	
	}
	
	m.spawnShop = function(spot,shopModel,extra){/**/
		if(!q.admin)
			return ERROR(3,'bank admin only');

		extra = parseActorExtra(extra,spot)
		extra.shop = shopModel;
		extra.minimapIcon = 'worldMap-shop';
		
		MapModel.addWorldMapIcon(spot,'shop');
		return m.spawnActor(spot,CST.ENTITY.npc,extra);
	}
	
	m.spawnWaypoint = function(spot,model,func,extra){/**/
		if(!q.admin)
			return ERROR(3,'only admin can spawn waypoint');
				
		var way = Waypoint.get(model);
		
		extra = parseActorExtra(extra,spot);
		extra.waypoint = model;
		extra.teleport = function(key){	//BAD
			var canUse = Waypoint.testCanUse(way,Main.get(key),Actor.get(key));
			if(canUse)
				s.openDialog(key,'worldMap',{waypoint:true});
			else
				s.displayPopup(key,way.cantUseMessage);
		}
		Waypoint.addInstance(model,spot,func);
		MapModel.addWorldMapIcon(spot,'waypoint',model);
		return m.spawnActor(spot,'waypoint',extra);
	}
	
	//
	m.translateSpot = function(spot,x,y){
		spot = Tk.deepClone(spot);
		spot.x += x;
		spot.y += y;
		return spot;
	}
	
	m.addDialogue = function(spot,tag,dialogue,overwriteNormal){/**/
		dialogue = parseEvent(dialogue);
		var eid = m.getRandomNpc(spot,tag);
		if(!eid) return ERROR(3,'no actor has tag',tag);
		var e = Actor.get(eid);
		if(!e.dialogue)
			return ERROR(3,'this actor needs a dialogue to start things off.',tag);
		
		if(!overwriteNormal)
			e.dialogue[Q] = dialogue;
		else {
			e.dialogue.normalSkipTestActive = true;
			e.dialogue.normal = dialogue;
		}
	}
	
	m.addTeleport = function(spot,tag,teleport,overwriteNormal,destination){/**/
		teleport = parseEvent(teleport);
		var eid = m.getRandomNpc(spot,tag);
		if(!eid) 
			return ERROR(3,'no actor has tag',tag);
		var e = Actor.get(eid);
		if(!e.teleport)
			return ERROR(3,'this actor needs a teleport to start things off.',tag);
		
		if(!overwriteNormal)
			e.teleport[Q] = teleport;
		else {
			e.teleport.normalSkipTestActive = true;
			e.teleport.normal = teleport;
		}
		if(destination)
			MapGraph.create(Actor.toSpot(e),mapFormat(destination));
	}
	
	//Loop
	m.testInterval = function(frame){
		return Main.testInterval(null,frame);	//so-so
	}
	
	m.isAtSpot = function(key,spot,delta){
		if(!spot)
			return ERROR(3,'invalid spot');
		if(!s.isInMap(key,spot.map))
			return false;
		if(!spot.width && !spot.height)	//aka a point	
			return s.isAtPosition(key,spot.x,spot.y,delta);
		return Collision.testPtRect(Actor.get(key),spot);
	}
	
	m.forEachActor = function(spot,freq,event,actorType,atSpot,tag){
		if(!m.testInterval(freq || 5)) return;
		actorType = actorType || 'actor';
		if(tag)
			actorType = 'npc';
		event = parseEvent(event);
		
		var list = [];
		if(actorType === 'actor') list = Maps.getActorInMap(Maps.get(spot.map));
		else if(actorType === 'npc') list = Maps.getNpcInMap(Maps.get(spot.map));
		else if(actorType === 'player') list = Maps.getPlayerInMap(Maps.get(spot.map));
		else return ERROR(3,'invalid actorType',actorType);
		
		if(atSpot){
			for(var i = list.length-1; i >= 0; i--)
				if(!m.isAtSpot(list[i],atSpot))
					list.splice(i,1);
		}
		
		if(tag){
			for(var i = list.length-1; i >= 0; i--)
				if(!s.hasTag(list[i],tag))
					list.splice(i,1);
		}
		if(event)
			applyFunctionToList(event,list);
		return list;
	}
	
	m.getRandomPlayer = function(spot){
		var map = Maps.get(spot.map);
		if(!map.loaded)
			return map.creatorKey;
		return Maps.getPlayerInMap(map)[0];
	}
	
	m.getRandomNpc = function(spot,tag){
		var list = Maps.getNpcInMap(Maps.get(spot.map));
		for(var i in list)
			if(s.hasTag(list[i],tag)) 
				return list[i];
		return null;
	}
	
	m.setAsStartPoint = function(spot){
		var qm = Quest.get(Q).questMarker;
		if(qm)
			return;
		MapModel.addWorldMapIcon(spot,'quest',Q);
		Quest.setQuestMarker(Q,spot);
	}
	
	
	return m;
}

})(); //{
