
"use strict";
(function(){ //}
var Main, SideQuest, Actor, MapModel, Maps, Party;
global.onReady(function(){
	Party = rootRequire('server','Party');  Main = rootRequire('shared','Main'); SideQuest = rootRequire('shared','SideQuest'); Actor = rootRequire('shared','Actor'); MapModel = rootRequire('server','MapModel'); Maps = rootRequire('server','Maps');
});

exports.newQuest_sideQuest = function(s,Q,Qid,parseActorExtra,mapFormat,parseEvent){ //}
	var m = s.map;
	var d = s.sideQuest = {};

	
	var getAllSpotVia1Spot = function(spot){
		return Maps.get(spot.map).addon[Q].spot;
	}
	
	d.load = function(sid,spot,variable,hint,load,loop,refresh){
		var model = Qid(sid);
		var sqm = SideQuest.get(model);
		if(!sqm)
			return ERROR(3,'invalid model',model);
		
		MapModel.addWorldMapIcon(spot,'sideQuest',model);
		SideQuest.setQuestMarker(sqm,spot);
		
		var bool = SideQuest.testIfDisplay(model);
		if(!bool)
			return;
		
		sid = model + '-' + spot.map;
		var sq = {
			contributor:{},	// {key:true}
			rewarded:[],
			variable:variable,
			variableCopy:Tk.deepClone(variable),
			map:spot.map,
			spot:getAllSpotVia1Spot(spot),
			model:model,
			id:sid,	
			failed:false,
			started:false,
			complete:false,
			restartTimer:25*60*3,
			hint:hint || function(){ return 'No hint.' },
			load:load,
			loop:parseLoop(loop),
			refresh:refresh || CST.func,
		}
		SideQuest.addToList(sid,sq);
		
		load(sq);
		d.setInterval(sq,'_loop',sq.loop,1);
	}
	var refreshSQ = function(sq){
		sq.contributor = {};
		sq.rewarded = [];
		sq.complete = false;
		sq.started = false;
		sq.failed = false;
		sq.variable = Tk.deepClone(sq.variableCopy);
		sq.refresh(sq);
		m.forEachActor(sq.spot,1,function(key){
			s.killActor(key);
		},'npc',null,{_sidequest:sq.id});
		
		Maps.removeAllCustomLoop(Maps.get(sq.map),sq.id);
		
		if(SideQuest.testIfDisplay(sq.model)){
			sq.load(sq);
			d.setInterval(sq,'_loop',sq.loop,1);
		} else
			refreshIn(sq,CST.MIN*2);
	}
	var parseDeathEvent = function(sq,func){
		var ev = parseEvent(func);
		return function(key,eid,map,usedKiller,killers){
			for(var i = 0 ; i < killers.length; i++)
				d.addContributor(sq,killers[i]);
			if(ev)
				return ev.apply(this,arguments);
		}
	}
	var parseDialogue =  function(sq,func){
		var ev = parseEvent(func);
		return function(key){
			d.addContributor(sq,key);
			if(ev)
				return ev.apply(this,arguments);
		}
	}
	var parseExtraSQ = function(sq,extra){
		extra = extra || {};
		extra.tag = extra.tag || {};
		extra.tag._sidequest = sq.id;
		extra.zone = sq.zone;
		extra.sideQuest = sq.model;
		extra.deathEvent = parseDeathEvent(sq,extra.deathEvent);
		if(extra.dialogue)
			extra.dialogue = parseDialogue(sq,extra.dialogue);
			
		return extra;
	}
	var parseLoop = function(loop){
		return function(sq){
			if(!sq.complete && sq.started){
				m.forEachActor(sq.spot,15*25,function(key){
					var res = SideQuest.getCompleteBoostNerf(sq.model,Main.get(key));
					if(!res)
						return;
					s.addBoost(key,'globalDef',res.globalDef,15*25,'sidequestCompletionNerf');
					s.addBoost(key,'globalDmg',res.globalDmg,15*25,'sidequestCompletionNerf');
				},'player');
			}
			if(loop)
				loop(sq);
		}
	}
	var refreshIn = function(sq,timer){		
		d.setTimeout(sq,'_refresh',refreshSQ,timer,true);
	}
		
	d.get = function(sq,attr){
		if(!sq || sq.variable[attr] === undefined)
			return ERROR(3,'invalid sq or attr',sq,attr);
		return sq.variable[attr];
	}
	
	d.set = function(sq,attr,value){
		if(!sq || sq.variable[attr] === undefined)
			return ERROR(3,'invalid sq or attr',sq,attr);
		sq.started = true;
		sq.variable[attr] = value;
		d.updateHint(sq);
	}
	
	d.add = function(sq,attr,value){
		var val = d.get(sq,attr);
		if(isNaN(val) || isNaN(value)) 
			return ERROR(3,'val or increment is NaN',attr,val,value);
		d.set(sq,attr,val + value);
	}
	
	d.spawnActor = function(sq,letter,model,extra){
		var spot = sq.spot[letter];
		if(!spot)
			return ERROR(3,'invalid spot',letter);
		extra = parseExtraSQ(sq,extra);
		return m.spawnActor(spot,model,extra);
	}
	
	d.spawnActorOnTop = function(sq,key,model,extra){
		if(!d.isInMap(sq,key))
			return ERROR(3,'actor no in map');
		var act = Actor.get(key);
		var spot = Actor.toSpot(act);
		extra = parseExtraSQ(sq,extra);
		if(!spot)
			return ERROR(3,'invalid actor',key);
		return m.spawnActor(spot,model,extra);
	}
	
	d.addContributor = function(sq,key){
		sq.contributor[key] = true;
		sq.started = true;
		d.updateHint.one(sq,key);
	}	
	
	d.complete = function(sq,spawnLootLetter,contributor){
		if(sq.complete)
			return ERROR(3,'sq already completed',sq);
		sq.complete = true;
		
		if(sq.failed)
			return;
		
		contributor = contributor !== false;
		//around = around !== false;	//reward ppl around zone
		
		var gotReward = {};
		if(contributor){
			d.forEachContributor(sq,function(key){
				gotReward[key] = true;
				Main.SideQuest.onComplete(Main.get(key),sq.model);
			});
		}		
		
		sq.rewarded = gotReward.$keys();
		if(spawnLootLetter)
			d.spawnRewardLoot(sq,spawnLootLetter);
			
		refreshIn(sq,sq.restartTimer);
		d.updateHint(sq);
	}
	
	d.isComplete = function(sq){
		return sq.complete;
	}
	
	d.isFailed = function(sq){
		return sq.failed;
	}
	
	d.isStarted = function(sq){
		return sq.started;
	}
	
	d.spawnBlock = function(sq,letter,viewedIf,sprite,extra){
		var zone = sq.spot[letter];
		extra = parseExtraSQ(sq,extra);
		if(!zone)
			return ERROR(3,'invalid spot',letter);
		return m.spawnBlock(zone,viewedIf,sprite,extra);
	}
	
	d.spawnTeleporter = function(sq,letter,event,sprite,extra){
		var spot = sq.spot[letter];
		extra = parseExtraSQ(sq,extra);
		if(!spot)
			return ERROR(3,'invalid spot',letter);
		return m.spawnTeleporter(spot,event,sprite,extra,null,false);	//no autoTeleport cuz can be removed
	}
	
	d.spawnToggle = function(sq,letter,viewedIf,on,off,sprite,extraOff,extraOn){
		var spot = sq.spot[letter];
		extraOff = parseExtraSQ(sq,extraOff);
		extraOn = parseExtraSQ(sq,extraOn);
		if(!spot)
			return ERROR(3,'invalid spot',letter);
		return m.spawnToggle(spot,viewedIf,on,off,sprite,extraOff,extraOn);	
	}

	d.message = function(sq,text,color){
		d.forEachContributor(sq,function(key){
			s.message(key,text,color);
		});
	}
	
	d.forEachContributor = function(sq,func,includeOutsideMap){
		for(var i in sq.contributor){
			if(!Main.get(i))
				continue;
			var inside = d.isInMap(sq,i);
			if(!inside && !includeOutsideMap)
				continue;
			func(i,inside);
		}
	}
	
	d.setTimeout = function(sq,id,func,timer,continueEvenIfComplete){
		var loopId = sq.id + '-' + id;
		var COUNTER = 0;
		Maps.addCustomLoop(Maps.get(sq.map),loopId,function(){
			if(COUNTER++ < timer)
				return;
			if(sq.complete && !continueEvenIfComplete)
				return;
			Maps.removeCustomLoop(Maps.get(sq.map),loopId);
			func(sq);
		});
	}
	
	d.setInterval = function(sq,id,func,interval,continueEvenIfComplete){
		var loopId = sq.id + '-' + id;
		var COUNTER = 0;
		Maps.addCustomLoop(Maps.get(sq.map),loopId,function(){
			if(COUNTER++ % interval !== 0)
				return;
			if(sq.complete && !continueEvenIfComplete)
				return;
			func(sq);
		});
	}
	
	d.clearInterval = function(sq,id){
		var loopId = sq.id + '-' + id;
		Maps.removeCustomLoop(Maps.get(sq.map),loopId);
	}
	
	d.fail = function(sq,timer){
		if(sq.failed)
			return;
			
		sq.failed = true;
		
		d.message(sq,'Side quest failed.');
		d.updateHint(sq);
		refreshIn(sq,timer || sq.restartTimer);
	}	
	
	d.spawnRewardLoot = function(sq,letter){
		if(!sq.complete)
			return ERROR(3,'sq must be complete b4 spawnLoot');
		if(!sq.spot[letter])
			return ERROR(3,'invalid spot',letter);
		var see = Tk.deepClone(sq.rewarded);
		return m.spawnLoot(sq.spot[letter],function(key){
			return see.$contains(key);
		},function(key){
			Party.forEach(Main.getParty(Main.get(key)),function(key2){
				if(see.$contains(key2)){
					see.$remove(key);
					if(key2 !== key)
						s.message.one(key2,'A party member opened the side quest reward chest.');
					SideQuest.giveReward(SideQuest.get(sq.model),Main.get(key2));
				}
			});
			return false;
		},null,parseExtraSQ(sq,{}),parseExtraSQ(sq,{}));
	}
	
	d.isInMap = function(sq,key){
		return s.isInMap(key,sq.map);
	}
	
	d.updateHint = function(sq){
		d.forEachContributor(sq,function(key){
			d.updateHint.one(sq,key);
		},true);
	}
	
	d.updateHint.one = function(sq,key){
		var hint = null;
		if(!d.isFailed(sq) && !d.isComplete(sq))
			hint = d.isInMap(sq,key) ? Main.SideQuestHint(sq.model,sq.hint(sq)) : null;
		Main.setSideQuestHint(Main.get(key),hint);
	}
	
}

})(); //{

