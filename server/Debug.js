
"use strict";

var Main, Actor, Message, Equip, Quest, ActorModel, ItemModel, Ability, QuestVar, Server, Boost, MapModel, Maps;

global.onReady(function(){
	ActorModel = rootRequire('shared','ActorModel'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); Message = rootRequire('shared','Message');  Equip = rootRequire('server','Equip'); Quest = rootRequire('server','Quest'); ItemModel = rootRequire('shared','ItemModel'); Ability = rootRequire('server','Ability'); QuestVar = rootRequire('server','QuestVar'); Server = rootRequire('private','Server'); Boost = rootRequire('shared','Boost'); MapModel = rootRequire('server','MapModel'); Maps = rootRequire('server','Maps');
	
},null,'Debug',[],function(){
	Debug.init();
});
var Debug = exports.Debug = {};

var DEV_TOOL = 'DEV_TOOL';
var QUEST_TOOL_SUFFIX = '_Tool';

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
	var act = Actor.get(key);
	try {
		Actor.addToMap(Actor.create(model),Actor.toSpot(act));
	} catch(err){ 
		ERROR.err(5,err);
	}
}

Debug.spawnEnemyViaQuestion = function(key){
	Main.askQuestion(Main.get(key),function(key,model,amount){
		amount = +amount;
		
		if(!Actor.create(model)){
			ERROR(5,'invalid model'); 
			return;
		}
		
		Debug.spawnEnemy(key,model);
		for(var i = 1; i < amount; i++){
			Debug.spawnEnemy(key,model);
		}
	},"Category,amount",'string');	
}

Debug.invincible = function(key){
	if(Actor.get(key).globalDef < 500){
		Actor.addPermBoost(Actor.get(key),'Debug.invincible',[
			Boost.Perm('globalDef',1000,CST.BOOST_PLUS),
			Boost.Perm('globalDmg',1000,CST.BOOST_PLUS),
		]);	
		Message.add(key,'Invincible');
	} else {
		Actor.addPermBoost(Actor.get(key),'Debug.invincible');
		Message.add(key,'Not Invincible');
	}
}

Debug.ghost = function(key){
	var act = Actor.get(key);
	if(act.ghost){
		Actor.addPermBoost(act,'Debug.ghost');
		Message.add(key,'Not ghost.');
		act.ghost = 0;
	} else {
		Message.add(key,'Ghost.');
		act.ghost = 1;
		act.bumper = Actor.Bumper();
		/*Actor.addPermBoost(act,'Debug.ghost',[
			Boost.Perm('acc',40,CST.BOOST_PLUS),
			Boost.Perm('maxSpd',40,CST.BOOST_PLUS),
		]);	*/
	}
}

Debug.giveRandomEquip = function(key,piece,type){
	var act = Actor.get(key);
	var eid = Equip.randomlyGenerate(act.username,Equip.PieceType(piece,type),Actor.getLevel(act)).id;
	Main.addItem(Main.get(key),eid);
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
	Actor.swapAbility(act,'Qsystem-start-melee',0);
	Actor.addAbility(act,'Qsystem-start-bullet');
	Actor.swapAbility(act,'Qsystem-start-bullet',1);
	Actor.addAbility(act,'Qsystem-start-freeze');
	Actor.swapAbility(act,'Qsystem-start-freeze',2);
	Actor.addAbility(act,'Qsystem-start-fireball');
	Actor.swapAbility(act,'Qsystem-start-fireball',3);
	Actor.addAbility(act,'Qsystem-start-heal');
	Actor.swapAbility(act,'Qsystem-start-heal',4);
	//Actor.addAbility(act,'Qsystem-start-dodge');
	//Actor.swapAbility(act,'Qsystem-start-dodge',5);
}

Debug.addItemViaQuestion = function(key){
	Main.askQuestion(Main.get(key),function(key,item,amount){
		Debug.addItem(key,item,amount);
	},"item,amount",'string');	
}

Debug.addItem = function(key,item,amount){
	if(item.indexOf('equip') === 0){
		var array = item.split('-');
		return Debug.giveRandomEquip(key,array[1],array[2]);
	}
	
	if(ItemModel.get(item,true))	
		Main.addItem(Main.get(key),item,+amount || 1);
	else Message.add(key,'wrong item id',item);
}

Debug.spawnEveryEnemy = function(key,log){
	Actor.verifyBlockPosition.ACTIVE = false;
	for(var i in ActorModel.DB){
		if(i !== 'player'){
			Debug.spawnEnemy(key,i);
			if(log)
				INFO('spawning actormodel' + i);
		}
	}
	Actor.verifyBlockPosition.ACTIVE = true;
}

Debug.addEveryAbility = function(key){
	for(var i in Ability.DB)
		if(Ability.DB[i].usableByPlayer)
			Actor.addAbility(Actor.get(key),i);
}

Debug.teleportViaQuestion = function(key){
	Main.askQuestion(Main.get(key),function(key,x,y,map){
		
		var act = Actor.get(key);
		if(y === undefined){	//aka x = playerName
			var err = Debug.teleportToPlayer(key,x);
			if(err)
				Message.add(key,err);
			return;
		}
		
		if(!map){ 
			act.x += +x; 
			act.y += +y; 
			return; 
		}
		var model = MapModel.get(map);
		if(!model) 
			return ERROR(5,'mapmodel not exist',map);
		Actor.teleport(act,Actor.Spot(+x,+y,map,model.id),true);		
	},"x,y,map OR playerName",'string');
}

Debug.completeQuest = function(key){
	if(Main.get(key).questActive)
		Main.completeQuest(Main.get(key));			
}

Debug.teleportTo = function(key,nameOrMapId){
	if(nameOrMapId[0] !== 'Q')
		Debug.teleportToPlayer(key,nameOrMapId);
	else {
		var act = Actor.get(key);
		var model = MapModel.get(nameOrMapId);
		if(!model) 
			return ERROR(5,'mapmodel not exist',nameOrMapId);
		Actor.teleport(act,Actor.Spot(act.x,act.y,nameOrMapId,model.id),true);
	}
}

Debug.teleportToSpot = function(key,spot){
	Actor.teleport.fromQuest(Actor.get(key),spot,true);
}

Debug.teleportToPlayer = function(key,name){
	var act = Actor.getViaUsername(name);
	if(!act) return 'no player with that name';
	Actor.teleport(Actor.get(key),Actor.toSpot(act),true);
}

Debug.createQuestTool = function(q){
	var option = [];
	option.push(ItemModel.Option(function(key){
		if(Main.get(key).questActive !== q.id)
			return;
		
		INFO('########### ' + Date.now() + ' ###########');
		var mq = QuestVar.getViaMain(Main.get(key));
		for(var i in mq){
			if(['quest','username','key'].$contains(i)) 
				continue;
			var attr = i;
			for(var j = attr.length; j < 15; j++)
				attr += ' ';
			INFO('   ' + attr + ' : ' + mq[i]);
		}
	},'Get Var'));
	
	option.push(ItemModel.Option(function(key){
		Main.askQuestion(Main.get(key),function(key,param,value){
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
			} catch(err){ ERROR.err(5,err); }
		},'variable,value','string');
	},'Change Var'));
	
	option.push(ItemModel.Option(function(key){
		Main.askQuestion(Main.get(key),function(key,param){
			var spot = Maps.getSpot(Maps.get(Actor.get(key).map),q.id,param);
			if(spot) 
				Actor.teleport(Actor.get(key),spot);
			else 
				INFO('not found');
		},"enter spot",'string');
	},'Teleport'));
	
	option.push(ItemModel.Option(function(key){
		Main.askQuestion(Main.get(key),function(key,item,amount){
			item = q.id + '-' + item;
			if(ItemModel.get(item))	
				Main.addItem(Main.get(key),item,amount || 1);
			else 
				Message.add(key,'wrong');
		},"item,amount",'string');	
	},'Add Item'));
	
	option.push(ItemModel.Option(function(key){
		Main.askQuestion(Main.get(key),function(key,param){
			if(q.event[param]) 
				return q.event[param](key);
			Message.add(key,"no found");
		},'event','string');
	},'Call Event',null));
	
	
	
	var itemId = Quest.addPrefix('Qsystem',q.id + QUEST_TOOL_SUFFIX);
	var itemName = q.id + ' Tool';
	ItemModel.create('Qsystem',itemId,itemName,'system-gold',option,itemName,{
		trade:false,drop:false,adminOnly:true,
	});
}

Debug.addAbilityViaQuestion = function(key){
	Main.askQuestion(Main.get(key),function(key,ability,slot){
		var act = Actor.get(key);
		if(ability[0] !== 'Q')
			ability = 'Qsystem-' + ability;
		if(!Ability.get(ability)) 
			return ERROR(5,'ability dont exist',ability);
		slot = +slot || 0;
		Actor.swapAbility(act,ability,slot);
	},"ability,slot",'string');
}

Debug.createDevTool = function(){
	var option = [
		ItemModel.Option(Debug.ghost,'Ghost'),
		ItemModel.Option(Debug.teleportToQuestMarker,'Tele QM'),
		ItemModel.Option(Debug.invincible,'Invincible'),
		ItemModel.Option(Debug.completeQuest,'Quest Complete'),
		ItemModel.Option(Debug.openAdminDialog,'Full'),
	];
	
	var itemId = Quest.addPrefix('Qsystem',DEV_TOOL);
	ItemModel.create('Qsystem',itemId,'Dev Tool','system-gold',option,'Dev Tool',{
		trade:false,drop:false,adminOnly:true,
	});
}

Debug.teleportToQuestMarker = function(key){
	var act = Actor.get(key);
	var qm = act.questMarker[act.questMarker.$keys()[0]];
	if(!qm)
		return;
	var g = qm.goal;
	Actor.teleport.fromQuest(act,Actor.Spot(g.x,g.y,g.map,g.map));
}


Debug.openAdminDialog = function(key){
	Main.openDialog(Main.get(key),'adminTool',{
		mapList:Maps.LIST.$keys(),
	});	
}

Debug.testQuest = function(key){
	var main = Main.get(key);
	var list = Object.keys(Quest.DB);
	Main.askQuestion(main,function(key,slot){
		Debug.startQuest(key,list[slot]);
	},'quest','option',list);
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
		for(var j in main.quest[i].highscore)
			main.quest[i].highscore[j] = Math.floor(Math.random()*1000);
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
	Main.addItem(Main.get(key),{'Qsystem-start-bow':1,'Qsystem-start-weapon':1});
	Debug.giveDefaultAbility(key);
	Main.completeQuest(Main.get(key));
	Actor.teleport.town(Actor.get(key));
}

Debug.salvageInventory = function(key){
	//3 boost or 1k exp => cant auto salvage
	var list = Equip.getAllEquipOwned.inventoryOnly(key);
	if(list.length === 0)
		return Message.addPopup(key,'You have no equip to salvage.');
	var allSalvaged = true;
	for(var i = 0 ; i < list.length; i++){
		var eq = Equip.get(list[i]);
		if(eq.salvagable){
			if(eq.boost.length > 3){
				allSalvaged = false;
			} else {
				Equip.salvage(key,list[i],true);
			}
		}
	}
	
	if(!allSalvaged){
		Message.addPopup(key,'One or more equips could not be salvaged automatically because they have too many boosts.');
	} else {
		Message.addPopup(key,'Your equips have been salvaged.');
	}
}

Debug.spyPlayer = function(key){	//Send.activateBotwatch
	var array = [];
	for(var i in Main.LIST){
		array.push({
			username:Main.get(i).username,
			name:Main.get(i).name,
			id:i,
			questActive:Main.get(i).questActive,
			map:Actor.get(i).map
		});
	}
	Main.openDialog(Main.get(key),'adminSpyPlayer',{data:array});
}












