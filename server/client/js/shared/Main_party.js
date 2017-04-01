
"use strict";
(function(){ //}
var Party, Quest;
global.onReady(function(){
	Party = rootRequire('server','Party'); Quest = rootRequire('server','Quest');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.setAcceptPartyInvite,Command.MAIN,[ //{
		Command.Param('boolean','Value',false),
	],Main.setAcceptPartyInvite); //}
	
	Command.create(CST.COMMAND.partyJoin,Command.MAIN,[ //{
	],Main.changeParty.onCommand); //}

	Command.create(CST.COMMAND.partyJoinSolo,Command.MAIN,[ //{
	],Main.joinSoloParty); //}

	
});
var Main = rootRequire('shared','Main');


Main.party = {};
Main.Party = function(party){
	party = party || {};
	var tmp = {
		id:party.id || Math.randomId(),
	};
	
	return tmp;
}
Main.Party.compressClient = function(party){
	var p = Party.get(party.id);	//party is Main.Party (only contains id)
	var lead = Main.get(p.leader);
	var leader = '';
	if(!lead)
		ERROR(3,'leader not in party',party.id);
	else
		leader = lead.name;
		
	var tmp = {
		id:party.id,
		list:[],
		leader:leader,
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
	//Main.leaveParty(main); at the end important
	var p = Party.getKeyList(Main.getParty(main));
	if(main.questActive && p.length !== 1){
		var notGuySignOff;
		for(var i = 0 ; i < p.length; i++){
			notGuySignOff = p[i];
			if(notGuySignOff !== main.id)
				break;
		}
		Quest.get(main.questActive).event._signOff(notGuySignOff);
	}
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
	Party.addPlayer(party,main.id,main.name);
	Main.setFlagParty(main);
	
	if(showMessage !== false)
		Main.addMessage(main, 'You joined a new party.');
}

Main.setFlagParty = function(main){
	Main.setFlag(main,'party',function(main){
		return Main.Party.compressClient(main.party);
	});
}

Main.joinSoloParty = function(main){	//called when player leaves party
	Main.addMessage(main, 'You left your party.');
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

Main.changeParty.onCommand = function(main){
	if(Main.getQuestActive(main))
		return Main.addPopup(main,"You can't change your party while doing a quest.");
	
	/*Main.askQuestion(main,function(key,name){
		if(name.$contains('@') || name.$contains('&') || name.$contains('!') || name.$contains('$')) 
			return Main.addPopup(main,"You can't create/join this party.");	//reserved
		
	},'What party would you like to create/join?','string');	*/
	var name = Math.randomId();
	Main.changeParty(main,name);
}

Main.getParty = function(main){
	return SERVER ? Party.get(main.party.id) : main.party;
}

Main.getPartyId = function(main){
	return main.party.id;
}


Main.setAcceptPartyInvite = function(main,val){
	main.acceptPartyInvite = val;
	Main.setChange(main,'acceptPartyInvite',val);
	Main.addMessage(main,val ? 'You can receive party invitations.' : 'You cannot receive party invitations.');
}


})(); //{

