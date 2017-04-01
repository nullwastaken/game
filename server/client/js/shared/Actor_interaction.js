
"use strict";
(function(){ //}
var Waypoint, SkillPlotModel, Achievement, Shop, Party, Quest, ItemModel, Main, Maps, Message, Drop, Collision, OptionList;
global.onReady(function(){
	Waypoint = rootRequire('shared','Waypoint'); SkillPlotModel = rootRequire('server','SkillPlotModel'); Achievement = rootRequire('shared','Achievement'); Shop = rootRequire('server','Shop'); Party = rootRequire('server','Party'); Quest = rootRequire('server','Quest'); ItemModel = rootRequire('shared','ItemModel'); Main = rootRequire('shared','Main'); Maps = rootRequire('server','Maps'); Message = rootRequire('shared','Message'); Drop = rootRequire('shared','Drop'); Collision = rootRequire('shared','Collision'); OptionList = rootRequire('shared','OptionList');
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.invite,Command.ACTOR,[ //{
		Command.Param('string','Username',false),
	],Actor.invitePlayer); //}
	Command.create(CST.COMMAND.actorOptionList,Command.ACTOR,[ //{
		Command.Param('string','Id',false),
		Command.Param('number','Option Position',false),
	],Actor.click.optionList); //}
	Command.create(CST.COMMAND.useWaypoint,Command.ACTOR,[ //{
		Command.Param('string','Waypoint Id',false),
	],Actor.useWaypoint); //}
});
var Actor = rootRequire('shared','Actor');


var SKILLPLOT_ITEM = 3;
var MIN_INTERVAL = 250;

var TOOFAR = function(key){
	Message.add(key,"You're too far away.");
}

Actor.canInteractWith = function(act,e,message,overwriteDist,noResetLastInteraction){
	if(Date.now() - act.lastInteraction < MIN_INTERVAL) 
		return false;
	var val = Actor.isWithinInteractionRange(act,e,overwriteDist);
	if(!val && message !== false)
		TOOFAR(act.id);
	if(val && noResetLastInteraction !== true)
		act.lastInteraction = Date.now();
	return val;
}

Actor.isWithinInteractionRange = function(act,e,overwriteDist){
	var maxDist = overwriteDist || e.interactionMaxRange;
	
	var dist = Actor.getDistanceBumperBumper(act,e);
	if(dist < maxDist/2) 
		return true;
	
	if(dist > maxDist || Collision.testLineMap(act.map,act,e))
		return false;
	
	return true;
}

Actor.getDistanceBumperBumper = function(act,e){
	var angleA = Collision.getAnglePtPt(act,e);
	var angleE = Tk.formatAngle(angleA+180);
	
	var sideA = Tk.convertAngleNumToSide(angleA);
	var sideE = Tk.convertAngleNumToSide(angleE);
	
	var distX = (e.x + Actor.getBumperBox(e,sideE)) - (act.x + Actor.getBumperBox(act,sideA));
	var distY = (e.y + Actor.getBumperBox(e,sideE)) - (act.y + Actor.getBumperBox(act,sideA));
	
	if(sideA === 'right')
		return distX;
	if(sideA === 'left')
		return -distX;
	if(sideA === 'up')
		return -distY;
	if(sideA === 'down')
		return distY;
	return ERROR(3,'invalid sideA',sideA) || 0;
}

var testQuestActive = function(act,e){
	var main = Main.get(act.id);
	if(e.quest && main.questActive !== e.quest){
		var q = Quest.get(e.quest);
		if(q.alwaysActive)
			return true;
		if(q.autoStartQuest && !main.questActive){
			Main.dialogue.end(main);
			Main.openDialog(main,'questStart',e.quest);
			Actor.addPresetUntilMove(act,'onQuestWindow',75);
		}
		return false;
	}
	return true;
}

//dead verification is done via command actorOptionList and Button.handleClickServerSide...

Actor.click = {};

//via command actorOptionList
Actor.click.optionList = function(act,eid,slot){
	if(act.dead)
		return;
	var e = Actor.get(eid);
	if(!e || !e.optionList || !Actor.testActiveList(act,e)) 
		return;
	var option = e.optionList.option[slot];
	if(!option) 
		return;
	OptionList.executeOption(Actor.getMain(act),option);
}

Actor.click.teleport = function(act,eid){
	var e = Actor.get(eid);
	
	if(!Actor.canInteractWith(act,e)) 
		return;
	
	var main = Actor.getMain(act);
	
	if(main.questActive){
		if(e.teleport[main.questActive])
			e.teleport[main.questActive](act.id);
		else {
			if(!Quest.get(e.quest).alwaysActive)
				Main.addMessage(main,"You can't go there now.");
			else
				e.teleport.normal(act.id);
		}
	} else {
		if(!e.teleport.normalSkipTestActive && !testQuestActive(act,e))
			return;
		e.teleport.normal(act.id);
	}
}

Actor.click.dialogue = function(act,eid){
	var e = Actor.get(eid);
	if(!Actor.canInteractWith(act,e)) 
		return;
	
	var main = Actor.getMain(act);
	
	var stopMoving;
	
	if(main.questActive){
		if(e.dialogue[main.questActive])
			stopMoving = e.dialogue[main.questActive](act.id);
		else {
			if(!Quest.get(e.quest).alwaysActive){
				Main.addMessage(main,"The NPC doesn't want to talk with you while you're doing another quest.");
				if(Math.random() < 0.2)
					Main.addMessage(main,"You can abandon a quest via the Quest Window " + Message.iconToText('tab-quest') + ".");
				Actor.playSfx(act,'error');
				return;	
			} else
				stopMoving = e.dialogue.normal(act.id);
		}
	} else {
		if(!e.dialogue.normalSkipTestActive && !testQuestActive(act,e))
			return;
		stopMoving = e.dialogue.normal(act.id);
	}
	
	Actor.playSfx(act,'select');	
	if(stopMoving !== false){
		Actor.addPreset(e,'_disableMove');
		e.angle = Tk.atan2(act.y-e.y,act.x-e.x);
		Actor.setInterval(e,function(){
			if(!Main.get(main.id) || !Main.isInDialog(main)){
				Actor.removePreset(e,'_disableMove');
				return false;
			}
			return true;
		},25*2,'Actor.click.dialogue');
	}
}

Actor.click.pushable = function(pusher,beingPushed){
	var act = Actor.get(beingPushed);
	if(!act.pushable) 
		return ERROR(3,'no pushable');
	if(act.pushable.onlySimulate || Actor.isBeingPushed(act) || !Actor.canInteractWith(pusher,act)) 
		return;
	
	var pusherAngle = Tk.atan2(act.y - pusher.y,act.x - pusher.x);			//only work with square block
	var fact = 360/4;
	var angle = Math.floor((pusherAngle+fact/2)/fact)*fact%360;
	
	if(!act.pushable.loose){
		if(pusherAngle > 340) 
			pusherAngle -= 360;	//QUICKFIX
		if(Math.abs(pusherAngle-angle) > 20)
			return Message.add(pusher.id,'You must be in the middle of the block to push it.');
	}
	
	//Check if destination is wall
	var map = pusher.map;
	
	//BAD only works for 2x2 block
	var x = Collision.ptToPos(act.x + Tk.cos(angle)*act.pushable.magn*act.pushable.time - 1);	//-1 so sure not on edge
	var y = Collision.ptToPos(act.y + Tk.sin(angle)*act.pushable.magn*act.pushable.time - 1);
	
	var bad = Collision.testActorMap(x,y,map,act) || Collision.testActorMap(x+1,y,map,act) || 
					Collision.testActorMap(x,y+1,map,act) || Collision.testActorMap(x+1,y+1,map,act);
	if(bad)
		return Message.add(pusher.id,"You can't push the block in that direction.");
	Actor.playSfx(pusher,'push');
	Actor.initPushable(act,angle,pusher.id);	//if no being in movement already, prevent spam click
}

Actor.click.skillPlot = function(act,eid){	
	var e = Actor.get(eid);
	if(!e.skillPlot) 
		return ERROR(3,'not skillplot');
	var quest = e.skillPlot.quest;
	var key = act.id;
	var main = Main.get(key);
	var diff = Date.now() - main.quest[quest].completeTime;
	
	if(e.skillPlot.type === CST.SKILLPLOT_DOWN){
		if(main.quest[quest].skillPlot) 
			return Message.add(act.id,'This plot is down. You need to complete the quest "' + Quest.get(quest).name + '" to harvest this plot again.');
		else {
			var val = 15 - Math.ceil(diff / CST.MIN);
			return Message.add(act.id,'This plot is down. It will be regrown in ' + val + ' minute' + (val >= 2 ? 's.' : '.'));
		}	
	}
		
	var plot = SkillPlotModel.get(e.skillPlot.type);

	if(!Actor.canInteractWith(act,e)) 	//not sure if always work cuz if tree in wall, cant click..
		return;
	
	main.quest[quest].skillPlot = true;
	
	var item = plot.item.$random();
	if(plot.sfx)
		Actor.playSfx(act,plot.sfx);
	Achievement.onHarvest(main,e.skillPlot.type);
	Main.addItem(main,item,SKILLPLOT_ITEM);
	Message.add(key,"You harvested the item: " + ItemModel.get(item).name + '.');
	Actor.addExp(act,plot.exp);
}

Actor.click.loot = function(act,eid){	//need work
	var e = Actor.get(eid);
	
	if(!Actor.canInteractWith(act,e)) 
		return;
	if(!testQuestActive(act,e)) 
		return Message.add(act.id,"You need to start this quest via the Quest Tab before making progression in it.");
	
	var showtext = e.loot(act.id,eid);
	if(showtext)
		Message.add(act.id,"Nice loot!");
		
	Actor.playSfx(act,'chest');
}

Actor.click.toggle = function(act,eid){
	var e = Actor.get(eid);
	
	if(!Actor.canInteractWith(act,e)) 
		return;
	if(!testQuestActive(act,e)) 
		return Message.add(act.id,"You need to start this quest via the Quest Tab before making progression in it.");
	
	var sw = e.toggle;
	if(!sw) return ERROR(3,'not a toggle',e.name);
	
	
	if(e.viewedIf(act.id,e.id)){
		var showMessage = e.toggle(act.id,eid);
		if(showMessage !== false){
			Actor.playSfx(act,'switch');
			Message.add(act.id,"You interacted with the switch.");
		}
	}
}

Actor.click.drop = function (act,id){
	var main = Actor.getMain(act);
	var drop = Drop.get(id);
	if(!drop) return;
	
	if(Collision.getDistancePtPt(act,drop) > act.pickRadius) 
		return TOOFAR(act.id);
	if(Array.isArray(drop.viewedIf) && drop.viewedIf[0] !== act.id){
		ERROR(3,'Actor.click.drop double drop?',drop,act.id,act.username);
		return Main.addMessage(main,"This drop belongs to another player.");
	}
	Main.addItem(main,drop.item,drop.amount);
	Actor.playSfx(act,'select');
	Drop.remove(drop);	
}

Actor.click.drop.rightClick = function(act,pt){
	var option = [];
	var list = Maps.get(act.map).list.drop;
	for(var i in list){
		var d = Drop.get(i);
		if(Collision.getDistancePtPt(d,pt) < 48)
			option.push(OptionList.Option(Actor.click.drop,[OptionList.ACTOR,i],'Pick ' + ItemModel.get(d.item).name));
	}
}

Actor.click.bank = function(act,eid){
	var e = Actor.get(eid);
	if(!e.bank) return ERROR(4,'not a bank');
	if(!Actor.canInteractWith(act,e)) 
		return;
	Actor.playSfx(act,'chest');
	Main.openDialog(Actor.getMain(act),'bank');
}

Actor.click.signpost = function(act,eid){
	var e = Actor.get(eid);
	if(!e.signpost) 
		return ERROR(4,'not a signpost');
	if(!Actor.canInteractWith(act,e)) 
		return;
	Actor.playSfx(act,'select');
	var str = e.signpost(act.id,eid);
	if(typeof str === 'string')
		Main.addPopup(Actor.getMain(act),str);
}

Actor.click.party = function(act,eid){
	var main = Actor.getMain(act);
	
	if(main.questActive) 
		return Message.add(act.id,"You can't invite a player to your party while having a quest active.");
	
	if(Date.now() - main.lastInvite < INVITE_COOLDOWN)
		return Message.add(act.id,'Wait 10 seconds before sending another request.');
	
	main.lastInvite = Date.now();
	
	
	if(Party.isSolo(Main.getParty(main))){
		var newPartyName = Party.get(main.name) ? Math.randomId() : main.name;
			
		Main.changeParty(main,newPartyName);
	}
	var main2 = Main.get(eid);
	if(main2.questActive) 
		return Message.add(act.id,"The player you are trying to invite is currently has an active quest and therefore can't join your party.");
	if(Main.getPartyId(main) === Main.getPartyId(main2))
		return Message.add(act.id,"This player is already in your party.");
	if(!main2.acceptPartyInvite)
		return Message.add(act.id,"This player is not accepting party requests right now.");
	
	Main.askQuestion(main2,function(key,res){
		if(!Main.get(main.id))  //aka dc
			return;
		if(res === 0)
			Main.changeParty(main2,Main.getPartyId(main));
		else
			Main.addMessage(main,main2.name + ' declined your party invite.');
	},'Do you want to join "' + act.name + '" party?','option',['Yes','No']);
	
	Message.add(act.id,"You sent a party invite to " + main2.name + ".");
}	

Actor.invitePlayer = function(act,user){
	var eid = Actor.getViaName(user);
	if(!eid) 
		return Actor.addMessage(act,'This player doesn\'t exist.');
	Actor.click.party(act,eid.id);
}

var INVITE_COOLDOWN = 10000;
Actor.click.trade = function(act,eid){
	var main = Actor.getMain(act);
	var main2 = Main.get(eid);
	
	if(Main.isTrading(main2) || Main.isIgnoringPlayer(main2,act.name))
		return Message.add(act.id,'This player is busy.');
	
	var requestTime = Date.now();
	
	if(requestTime - main.lastInvite < INVITE_COOLDOWN)
		return Message.add(act.id,'Wait 10 seconds before sending another request.');
	
	main.lastInvite = requestTime;
	
	Main.askQuestion(main2,function(key,res){
		if(!Main.get(main.id)) 	//aka dc
			return;
		
		if(Date.now() - requestTime > CST.MIN)
			return Main.addMessage(main2,'The trade request has expired.');
			
		if(Main.getAct(main).map !== Main.getAct(main2).map)
			return Main.addMessage(main2,'This player is too far away.');
		
		if(res === 0)
			Main.startTrade(main,main2);
		else
			Main.addMessage(main,main2.name + ' declined your trade request.');
	},'Do you want to trade with "' + act.name + '"?','option',['Yes','No']);
	Message.add(act.id,"You sent a trade request to " + main2.name + ".");
}	

Actor.click.shop = function(act,eid){
	var e = Actor.get(eid);
	if(!e.shop)
		return ERROR(3,'no shop',eid);
	if(Collision.getDistancePtPt(act,e) > 200)
		return TOOFAR(act.id);
	Main.openDialog(Actor.getMain(act),'shop',Shop.compressClient(Shop.get(e.shop)));
	Actor.playSfx(act,'select');
}

var REVIVE_TIME = 25*3;
Actor.click.revive = function(act,eid){
	var act2 = Actor.get(eid);
	if(!Actor.canInteractWith(act,act2,true,100)) 
		return;
	if(!act2.dead) 
		return;
	
	var main = Actor.getMain(act);
	
	Main.addMessage(Actor.getMain(act2),act.name + ' is trying to revive you.');
	
	Actor.setTimeout(act,function(){
		if(!Actor.isOnline(act2)) 
			return;
		if(!act2.dead) 
			return;
		if(!Actor.isWithinInteractionRange(act,act2,100)) 
			return Main.addMessage(main,'Reviving failed. You need to stay closer.');
		Main.addMessage(main,'You managed to revive ' + act2.name + '. Good job!');
		Actor.revivePlayer(act2,false);
	},REVIVE_TIME);
	
	Main.addMessage(Actor.getMain(act),'Trying to revive ' + act2.name + '...'); 
}

var MOVEPUSH = 'movePush';
Actor.movePush = function(act,angle,magn,time){	//can push actor that arent pushable, ex: when player fall
	if(Actor.isBeingPushed(act)) 
		return false;	//only 1 push at a time
	act.friction = 1;
	act.spdX = magn*Tk.cos(angle);
	act.spdY = magn*Tk.sin(angle);
	
	Actor.setTimeout(act,function(){
		act.spdX = 0;
		act.spdY = 0;
		act.friction = CST.FRICTION;
	},time,MOVEPUSH);
}

Actor.isBeingPushed = function(act){
	return !!act.timeout[MOVEPUSH];
}

Actor.initPushable = function(act,angle,pusherId){	//TOFIX find better name
	if(act.pushable.timer >= 0) 
		return false;	//only 1 push at a time
	
	act.pushable.angle = angle;
	act.pushable.timer = act.pushable.time;
	
	Actor.stickToGrid(act);
	if(act.pushable.event)
		act.pushable.event(pusherId,act.id);
}

Actor.stickToGrid = function(act){
	act.x = Math.round(act.x/16)*16-1; 
	act.y = Math.round(act.y/16)*16-1; 
}

Actor.useWaypoint = function(act,wId){
	var main = Actor.getMain(act);
	
	var destination = Waypoint.get(wId,true);
	if(!destination)
		return Message.add(act.id,'Invalid waypoint: ' + wId);
	var canUse = Waypoint.testCanUse(destination,main,act);
	if(!canUse)
		return Message.addPopup(act.id,"You can't use teleport to the selected waypoint:<br> " + destination.cantUseMessage);
	
	
	var way = Maps.getNearWaypoint(Maps.get(act.map),act);
	if(!way)
		return Message.addPopup(act.id,'You need to be close to a waypoint to teleport to another waypoint.');
	var model = Waypoint.get(way.waypoint);
	var canUse = Waypoint.testCanUse(model,main,act);
	if(!canUse)
		return Message.addPopup(act.id,"You can't use the waypoint near you:<br> " + model.cantUseMessage);
	
	if(destination === model)
		return Message.addPopup(act.id,"You are already at that waypoint.");
		
	Waypoint.use(destination,act);		
	
}









})();

