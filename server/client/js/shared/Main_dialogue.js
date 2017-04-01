
"use strict";
(function(){ //}
var Achievement, Party, Collision, Actor, Dialogue, Quest;
global.onReady(function(){
	Quest = rootRequire('server','Quest'); Achievement = rootRequire('shared','Achievement'); Party = rootRequire('server','Party'); Collision = rootRequire('shared','Collision'); Actor = rootRequire('shared','Actor'); Dialogue = rootRequire('server','Dialogue');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.dialogueOption,Command.MAIN,[ //{
		Command.Param('number','Dialogue Option #',false),
	],Main.dialogue.selectOption); //}
});
var Main = rootRequire('shared','Main');


Main.Dialogue = function(node,face,x,y){
	return {
		node:node || ERROR(3,'node missing'),
		face:face || null,
		x:x || 0,
		y:y || 0,
	}
}

Main.startDialogue = function(main,d,activateEvent){
	//start dialogue. also set start x and y to end dialogue if player walks away
	var key = main.id;
	var npc = Dialogue.get(d.quest,d.npc);
	if(!npc) return ERROR(3,'no dialogue',d);
	var node = npc.nodeList[d.node];
	var face = node.noFace ? null : Dialogue.Face(npc.image,npc.name); //temp TOFIX
	main.dialogue = Main.Dialogue(node,face,Actor.get(key).x,Actor.get(key).y,activateEvent);
	if(node.event && activateEvent){
		node.event(key);	
	}
	Main.setChange(main,'dialogue',main.dialogue);
	Actor.addPresetUntilMove(Main.getAct(main),'onDialogue',75);
	Achievement.onDialogue(main,d.quest,d.npc,d.node);
}

Main.isInDialog = function(main){
	return !!main.dialogue;
}
Main.dialogue = {};

Main.dialogue.end = function(main){
	main.dialogue = null;
	Main.setChange(main,'dialogue',main.dialogue);
	
	var act = Main.getAct(main);
	Actor.setTimeout(act,function(){
		if(!main.dialogue)
			Actor.removePreset(act,'onDialogue');
	},25);
}

Main.dialogue.selectOption = function(main,slot,dontCallEvent){	//dontCallEvent for IntegrityTest
	//if(main.questActive && !Party.isLeader(main.id))
	//	return Message.addPopup(main.id,'Only the leader can choose dialogue options.');
	if(!Main.isInDialog(main)) 
		return;	
	var option = main.dialogue.node.option[slot];
	if(!option) 
			return;
	
	var q = Quest.get(option.quest);
	var bool = true;
	Party.forEach(Main.getParty(main),function(key2){
		var main2 = Main.get(key2);
		if(q.alwaysActive && main2 !== main)	//aka dont send option to party member
			return;
		
		if(option.next)
			Main.startDialogue(main2,{quest:option.quest,npc:option.npc,node:option.next},bool);
		else 
			Main.dialogue.end(main2);
		bool = false;
	});
	
	if(dontCallEvent !== false && option.event)	//after end so can trigger another dialogue
		option.event(main.id);
}

Main.dialogue.loop = function(main){
	if(!Main.testInterval(main,5)) return;	
	//test if player has move away to end dialogue
	if(!Main.isInDialog(main)) return;
	if(Collision.getDistancePtPt(Main.getAct(main),main.dialogue) > 100){
		Main.dialogue.end(main);
	}
}




})(); //{

