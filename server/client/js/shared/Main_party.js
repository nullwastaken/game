//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Party = require2('Party'), Quest = require2('Quest');
var Main = require3('Main');
Main.party = {};
Main.Party = function(party){
	party = party || {};
	var tmp = {
		id:party.id || Math.randomId(),
	};
	
	return tmp;
}
Main.Party.compressClient = function(party){
	var p = Party.get(party.id);
	var tmp = {
		id:party.id,
		list:[],
		leader:Main.get(p.leader).username,
	};

	for(var i in p.list)
		tmp.list.push(p.list[i]);
	return tmp;	
}
Main.Party.uncompressClient = function(party){
	return party;
}

//Start quest must change party.quest
Main.party.onSignOff = function(main){
	if(!main.questActive) return;
	
	var p = Party.getKeyList(Main.getParty(main));
	if(p.length === 1) return;
	var notGuySignOff;
	for(var i = 0 ; i < p.length; i++){
		notGuySignOff = p[i];
		if(notGuySignOff !== main.id)
			break;
	}
	Quest.get(main.questActive).event._signOff(notGuySignOff);
	
	Main.leaveParty(main);
}

Main.joinParty = function(main,name,showMessage){ //only called directly when sign in, otherwise, use changeParty
	main.party.id = name;
	
	var party = Party.get(name);
	if(!party){
		party = Party.create(name);	//create if not exist
		Party.setQuest(party,main.questActive);
	} else if(party.quest){
		party = Party.create(Math.randomId());	//join random party
		Main.addMessage(main,"You can't join this party because they are already doing a quest.");
	}
	Party.addPlayer(party,main.id,main.username);
	
	Main.setFlag(main,'party');
	
	if(showMessage !== false)
		Main.addMessage(main, 'You are now in party "' + name + '".');
}
Main.joinSoloParty = function(main){	//called when player leaves party
	Main.leaveParty(main);
	Main.joinParty(main,Party.SOLO + Math.randomId(),false);
	//message in Command
}
Main.leaveParty = function(main){
	var party = Party.get(main.party.id);
	Party.removePlayer(party,main.id);
}

Main.changeParty = function(main,newParty){
	if(main.questActive)
		return Main.addMessage(main,"You can't change your party while doing a quest.");
	if(newParty.$contains(Party.SOLO))
		return Main.addMessage(main,"You can't join that party.");
	newParty = newParty || Math.randomId();
	Main.leaveParty(main);
	Main.joinParty(main,newParty);
}

Main.getParty = function(main){
	return Party.get(main.party.id);
}
Main.getPartyId = function(main){
	return main.party.id;
}

})(); //{

