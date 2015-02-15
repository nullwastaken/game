//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Quest = require2('Quest'), OfflineAction = require2('OfflineAction'), Preset = require2('Preset'), Send = require2('Send'), Competition = require2('Competition'), ActorModel = require2('ActorModel'), MapModel = require2('MapModel'), Highscore = require2('Highscore'), QuestVar = require2('QuestVar'), Party = require2('Party'), SpriteModel = require2('SpriteModel'), ItemModel = require2('ItemModel'), Account = require2('Account'), ItemList = require2('ItemList'), Combat = require2('Combat'), Message = require2('Message'), OptionList = require2('OptionList'), Boss = require2('Boss'), Server = require2('Server'), Boost = require2('Boost'), Cycle = require2('Cycle'), Actor = require2('Actor'), Main = require2('Main'), Attack = require2('Attack'), Strike = require2('Strike'), Bullet = require2('Bullet'), ActiveList = require2('ActiveList'), ItemList = require2('ItemList'), Sign = require2('Sign'), Save = require2('Save'), Combat = require2('Combat'), Map = require2('Map'), Input = require2('Input'), Message = require2('Message'), Dialogue = require2('Dialogue'), Drop = require2('Drop'), Performance = require2('Performance'), Ability = require2('Ability'), Equip = require2('Equip'), Quest = require2('Quest'), Clan = require2('Clan'), Collision = require2('Collision'), Button = require2('Button'), Sprite = require2('Sprite'), Anim = require2('Anim'), Command = require2('Command'), ReputationGrid = require2('ReputationGrid');

var DEV_TOOL = 'DEV_TOOL';
var QUEST_TOOL_SUFFIX = '_Tool';
var Debug = exports.Debug = {};

Debug.attr = {
	trackQuestVar:!NODEJITSU,
	SKIP_TUTORIAL:PUBLIC_VERSION || false,
	ACTIVE:!NODEJITSU,
};

Debug.getAttr = function(attr){
	return Debug.attr[attr];
}
Debug.isActive = function(){
	return Debug.attr.ACTIVE;
}

Debug.init = function(){
	Debug.createDevTool();
}

Debug.spawnEnemy = function(key,model){
	model = model || 'Qsystem-bat';
	var player = Actor.get(key);
	try {
		Actor.addToMap(Actor.create(model),Actor.Spot(player.x,player.y,player.map));
	} catch(err){ ERROR.err(3,err); }
}

Debug.spawnEnemyViaQuestion = function(key){
	Main.question(Main.get(key),function(key,cat,amount){
		amount = +amount;
		Debug.spawnEnemy(key,cat);
		for(var i = 1; i < amount; i++)
			Debug.spawnEnemy(key,cat);
	},"Category,amount",'string');	
}

Debug.invincible = function(key){
	if(Actor.get(key).globalDef < 500){
		Actor.permBoost(Actor.get(key),'Debug.invincible',[
			Boost.Perm('globalDef',1000,'+'),
			Boost.Perm('globalDmg',1000,'+'),
		]);	
		Message.add(key,'Invincible');
	} else {
		Actor.permBoost(Actor.get(key),'Debug.invincible');
		Message.add(key,'Not Invincible');
	}
}

Debug.ghost = function(key){
	var act = Actor.get(key);
	if(act.ghost){
		Actor.permBoost(act,'Debug.ghost');
		Message.add(key,'Not ghost.');
		act.ghost = 0;
	} else {
		Message.add(key,'Ghost.');
		act.ghost = 1;
		act.bumper = Actor.Bumper();
		Actor.permBoost(act,'Debug.ghost',[
			Boost.Perm('acc',40,'+'),
			Boost.Perm('maxSpd',40,'+'),
		]);	
	}
}

Debug.giveRandomEquip = function(key,type){
	var username = Actor.get(key).username;
	if(type === 'weapon')
		Main.addItem(Main.get(key),Equip.randomlyGenerate(username,Equip.PieceType('weapon')).id);
	else
		Main.addItem(Main.get(key),Equip.randomlyGenerate(username).id);
}

Debug.onSignIn = function(key,name,socket){
	if(Server.isAdmin(0,name)){
		Debug.giveDevTool(key);
		if(!MINIFY)
			Debug.ts.onSignIn(socket);
	}
	if(!Debug.isActive())	return;
	
	var main = Main.get(key);
	if(main.questActive)
		Debug.giveQuestTool(key,main.questActive);
	
}

Debug.giveDefaultAbility = function(key){
	var act = Actor.get(key);
	Actor.addAbility(act,'Qsystem-start-melee');
	Actor.addAbility(act,'Qsystem-start-bullet');
	Actor.addAbility(act,'Qsystem-start-freeze');
	Actor.addAbility(act,'Qsystem-start-fireball');
	Actor.addAbility(act,'Qsystem-start-heal');
	Actor.addAbility(act,'Qsystem-start-dodge');
	
	Actor.swapAbility(act,'Qsystem-start-melee',0);
	Actor.swapAbility(act,'Qsystem-start-bullet',1);
	Actor.swapAbility(act,'Qsystem-start-freeze',2);
	Actor.swapAbility(act,'Qsystem-start-fireball',3);
	Actor.swapAbility(act,'Qsystem-start-heal',4);
	Actor.swapAbility(act,'Qsystem-start-dodge',5);
}

Debug.addItemViaQuestion = function(key){
	Main.question(Main.get(key),function(key,item,amount){
		if(item === 'equip') return Debug.giveRandomEquip(key);
		if(item === 'weapon') return Debug.giveRandomEquip(key,'weapon');		
		
		if(ItemModel.get(item))	Main.addItem(Main.get(key),item,+amount || 1);
		else Message.add(key,'wrong');
	},"item,amount",'string');	
}

Debug.teleportViaQuestion = function(key){
	Main.question(Main.get(key),function(key,x,y,map){
		var act = Actor.get(key);
		if(!map || map === '1'){ act.x += +x; act.y += +y; return; }
		if(!MapModel.get(map)) return ERROR(3,'mapmodel not exist',map);
		Actor.teleport(act,Actor.Spot(+x,+y,map));		
	},"x,y,map",'string');
}

Debug.completeQuest = function(key){
	if(Main.get(key).questActive)
		Main.completeQuest(Main.get(key));			
}

Debug.teleportTo = function(key,name){
	var act = Actor.getViaUserName(name);
	if(!act) return 'no player with that name';
	Actor.teleport(Actor.get(key),Actor.Spot(act.x,act.y,act.map));
}

Debug.createQuestTool = function(q){
	var option = [];
	option.push(ItemModel.Option(function(key){
		if(Main.get(key).questActive !== q.id) return;
		
		INFO('########### ' + Date.now() + ' ###########');
		var mq = QuestVar.getViaMain(Main.get(key));
		for(var i in mq){
			if(['quest','username','key'].$contains(i)) continue;
			var attr = i;
			for(var j = attr.length; j < 15; j++)
				attr += ' ';
			INFO('   ' + attr + ' : ' + mq[i]);
		}
	},'Get Var'));
	
	option.push(ItemModel.Option(function(key){
		Main.question(Main.get(key),function(key,param,value){
			try {
				var mq = QuestVar.getViaMain(Main.get(key));
				if(value === undefined)	return Message.add(key,param + ' : ' + mq[param]);
				if(mq[param] !== undefined){
					if(value === 'true') mq[param] = true;
					else if(value === 'false') mq[param] = false;
					else if(!isNaN(value)) mq[param] = +value;
					else mq[param] = value;
				}
				else Message.add(key,"bad name");
			} catch(err){ ERROR.err(3,err); }
		},'variable,value','string');
	},'Change Var'));
	
	option.push(ItemModel.Option(function(key){
		Main.question(Main.get(key),function(key,param){
			var spot = Map.getSpot(Map.get(Actor.get(key).map),q.id,param);
			if(spot) Actor.teleport(Actor.get(key),spot);
			else INFO('not found');
		},"enter spot",'string');
	},'Teleport'));
	
	option.push(ItemModel.Option(function(key){
		Main.question(Main.get(key),function(key,item,amount){
			item = q.id + '-' + item;
			if(ItemModel.get(item))	Main.addItem(Main.get(key),item,amount || 1);
			else Message.add(key,'wrong');
		},"item,amount",'string');	
	},'Add Item'));
	
	option.push(ItemModel.Option(function(key){
		Main.question(Main.get(key),function(key,param){
			if(q.event[param]) return q.event[param](key);
			else for(var i in q.event.test)	if(q.event.test[param]) return q.event.test[param](key);
			Message.add(key,"no found");
		},'event','string');
	},'Call Event',null));
	
	
	
	var itemId = Quest.addPrefix('Qsystem',q.id + QUEST_TOOL_SUFFIX);
	var itemName = q.id + ' Tool';
	ItemModel.create('Qsystem',itemId,itemName,'system.gold',option,itemName,{
		trade:0,drop:0
	});
}

Debug.addAbility = function(key){
	Main.question(Main.get(key),function(key,ability,slot){
		var act = Actor.get(key);
		if(!Ability.get(ability)) return ERROR(3,'ability dont exist',ability);
		slot = +slot || 0;
		Actor.swapAbility(act,ability,slot);
	},"ability,slot",'string');
}

Debug.createDevTool = function(){
	var option = [
		ItemModel.Option(Debug.ghost,'Ghost'),
		ItemModel.Option(Debug.invincible,'Invincible'),
		ItemModel.Option(Debug.teleportViaQuestion,'Tele'),
		ItemModel.Option(Debug.addItemViaQuestion,'Add Item'),	
		ItemModel.Option(Debug.addAbility,'Ability'),
		ItemModel.Option(Debug.spawnEnemyViaQuestion,'Enemy'),
		ItemModel.Option(Debug.testQuest,'Test Quest'),
		ItemModel.Option(Debug.completeQuest,'Quest Complete'),
	];
	
	var itemId = Quest.addPrefix('Qsystem',DEV_TOOL);
	ItemModel.create('Qsystem',itemId,'Dev Tool','system.gold',option,'Dev Tool',{
		trade:0,drop:0
	});
	

}

Debug.testQuest = function(key){
	var main = Main.get(key);
	Main.question(main,function(key,quest){
		Debug.startQuest(key,quest);
	},'quest','option',Object.keys(Quest.DB));
}

Debug.giveDevTool = function(key){
	Main.addItem(Main.get(key),DEV_TOOL);
}

Debug.giveQuestTool = function(key,quest){
	Main.addItem(Main.get(key),quest + QUEST_TOOL_SUFFIX);
}

Debug.giveRandomHighscore = function(key){
	var main = Main.get(key);
	for(var i in main.quest){
		for(var j in main.quest[i]._highscore)
			main.quest[i]._highscore[j] = Math.floor(Math.random()*1000);
	}
}

Debug.startQuest = function(key,qid){
	var main = Main.get(key);
	if(main.questActive && main.questActive !== qid)
		Main.abandonQuest(main);
	if(main.questActive !== qid)
		Main.startQuest(main,qid);
}

Debug.onStartQuest = function(key,qid){
	if(!Debug.isActive()) return;
	Debug.giveQuestTool(key,qid);
}

Debug.skipTutorial = function(key){
	var act = Actor.get(key);
	
	Main.addItem(Main.get(key),{'Qsystem-start-bow':1,'Qsystem-start-staff':1,'Qsystem-start-weapon':1});
	Actor.addAbility(act,'Qsystem-start-melee',false);
	Actor.swapAbility(act,'Qsystem-start-melee',0);
	
	Actor.addAbility(act,'Qsystem-start-bullet',false);
	Actor.swapAbility(act,'Qsystem-start-bullet',1);
		
	Actor.addAbility(act,'Qsystem-start-freeze',false);
	Actor.swapAbility(act,'Qsystem-start-freeze',2);
	
	Actor.addAbility(act,'Qsystem-start-fireball',false);
	Actor.swapAbility(act,'Qsystem-start-fireball',3);
	
	Actor.addAbility(act,'Qsystem-start-heal',false);
	Actor.swapAbility(act,'Qsystem-start-heal',4);
	
	Actor.addAbility(act,'Qsystem-start-dodge',false);
	Actor.swapAbility(act,'Qsystem-start-dodge',5);
	
	Main.completeQuest(Main.get(key));
	Actor.teleport.town(Actor.get(key),true);
}


















