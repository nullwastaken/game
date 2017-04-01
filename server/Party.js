
"use strict";
var Main;
global.onReady(function(){
	Main = rootRequire('shared','Main');
});
var Party = exports.Party = function(extra){
	this.id = '';
	this.leader = null;
	this.list = {};
	this.quest = null;
	this.solo = false;
	Tk.fillExtra(this,extra);
};

Party.SOLO = '&';	//hardcoded in Dialog
Party.OR = 'or';
Party.AND = 'and';
Party.create = function(id){
	var tmp = new Party({
		id:id,
		solo:id[0] === Party.SOLO
	});
	LIST[id] = tmp;
	return tmp;
}
var LIST = Party.LIST = {};

Party.remove = function(party){
	Party.forEach(party,function(i){
		Main.leaveParty(Main.get(i));
	});
	delete LIST[party.id];
}

Party.onSignIn = function(main){ //should be in Main.onSignIn... but need to be b4 teleport map
	if(!Main.get(main.id))
		return ERROR(3,'main must be added to Main.LIST at this point',main.name);
	Main.joinParty(main,Party.SOLO + Math.randomId(),false);	
}

Party.getKeyList = function(party){
	return Object.keys(party.list);
}

Party.setQuest = function(party,quest){
	party.quest = quest;
}

Party.get = function(id){
	return LIST[id];
}

Party.addPlayer = function(party,key,name){
	Party.addMessage(party,'"' + name + '" has joined the party.');
	party.list[key] = name;
	if(!party.leader) 
		Party.changeLeader(party,key,false);
	Party.setFlagForAll(party);
}

Party.removePlayer = function(party,key){
	var name = party.list[key];
	delete party.list[key];
	
	var mainDelete = Main.get(key);
	if(mainDelete)	//not always case bug...
		Main.setFlagParty(mainDelete);
	if(party.list.$isEmpty())
		return Party.remove(party);
	Party.addMessage(party,'"' + name + '" left the party.');
	if(party.leader === key)
		Party.changeLeader(party,party.list.$keys()[0]);
	Party.setFlagForAll(party);
}

Party.changeLeader = function(party,key,message){
	if(!party.list[key]) 
		return ERROR(3,'leader not in party');
	
	party.leader = key;
	//if(message !== false) 
	//	Party.addMessage(party,'The new party leader is "' + Main.get(key).name + '".');
	Party.setFlagForAll(party);	
}

Party.addMessage = function(party,str,toexclude){
	Party.forEach(party,function(i){
		if(!toexclude || !toexclude.$contains(i))
			Main.addMessage(Main.get(i),str);
	});
}

Party.setFlagForAll = function(party){
	Party.forEach(party,function(i){
		var main = Main.get(i);
		if(!main){
			ERROR(3,'no main',i);
			Party.removePlayer(party,i);
			return;
		}
		main.party = Main.Party(party);
		Main.setFlagParty(main);
	});
}

Party.isSolo = function(party){
	return party.solo;
}

Party.isPartyDead = function(party){
	var bool = true;
	Party.forEach(party,function(i){
		if(!Main.getAct(Main.get(i)).dead)
			bool = false;
	});
	return bool;
}

Party.getViaMain = function(main){
	return Main.getParty(main);
}

Party.isLeader = function(partyOrKey,key){	//accept
	if(!key) key = partyOrKey;
	return Party.getLeader(partyOrKey) === key;
}	

Party.getLeader = function(party){
	var p = typeof party === 'string' ? Party.getViaMain(Main.get(party)) : party;
	return p.leader;
}	

Party.getSize = function(party){
	return party.list.$length();
}

Party.forEach = function(party,func,type){
	if(party.list === undefined)
		return ERROR(3,'party is not a party, probably main or something');
	var bool;
	for(var i in party.list){
		if(!Main.get(i)){	//important Main.get and not Actor.get, because not in Actor on signIn
			ERROR(3,'not main',i,party.list[i]);
			Party.removePlayer(party,i);
		} else {
			if(!type)
				bool = func(i);
			else if(type === Party.OR)
				bool = bool || func(i);
			else if(type === Party.AND)
				bool = bool && func(i);
			else
				ERROR(3,'invalid type',type);
		}			
	}
	return bool;
}




