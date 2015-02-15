//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require2('Actor'), Account = require2('Account'), Equip = require2('Equip'), Socket = require2('Socket'), Server = require2('Server'), Contribution = require2('Contribution'), ItemList = require2('ItemList'), Challenge = require2('Challenge'), Sign = require2('Sign'), Message = require2('Message'), Main = require2('Main'), Quest = require2('Quest');
var Dialog = require4('Dialog'), Pref = require4('Pref'), Song = require4('Song');
var Command = exports.Command = {};

//quests needed to be loaded first via D b.quest.$keys() for Command.Param.quest

Command.create = function(id,description,help,param,func,clientSide){
	if(DB[id]) return ERROR(2,'id already taken',id);
	var tmp = {
		id:id || ERROR(3,'id missing'),
		description:description || '',
		help:!!help,
		param:param || [],
		func:func || ERROR(3,'func missing'),
		clientSide:!!clientSide
	}
	DB[id] = tmp;
};
var DB = Command.DB = {};

Command.Param = function(type,name,optional,extra){
	var tmp = {
		type:type,
		visibleType:Command.Param.CONVERT[type],
		name:name || '',
		optional:!!optional,	
		whiteList:null,	//[]
		default:null,
		min:0,
		max:CST.bigInt,
		noEmptyString:true,
	};
	for(var i in extra) tmp[i] = extra[i];
	return tmp;
}

Command.Param.CONVERT = {string:'Letters',number:'Number'};

Command.Param.mouse = function(){
	return Command.Param('string','Mouse Button',false,{whiteList:['left','right','shiftLeft','shiftRight']});
}

Command.Query = function(func,param){
	return {
		func:func,
		param:param,	
	}
}

Command.init = function(){
	Dialog.UI('command',{	
		position:'absolute',
		left:100,
		top:CST.HEIGHT-300,
		height:'auto',
		width:'auto',
		zIndex:Dialog.ZINDEX.HIGH,
		font:'1.5em Kelly Slab',
		border:'2px solid black',
		lineHeight:'100%',
		whiteSpace:'nowrap',
		padding:'3px',
		backgroundColor:'white',
	},Dialog.Refresh(function(html){
		var text = Dialog.chat.getInput();
		if(text[0] !== '$')	return false;	//setTimeout cuz called before keydown
		
		var txt = text.slice(1);
		for(var i in DB){
			if(!txt.$contains(i)) continue;
			var cmd = DB[i];	//a match!
			var str = cmd.description;
			for(var j in cmd.param){
				str += '<br>@param' + j + ' ' + cmd.param[j].name + ' [' + cmd.param[j].type + ']';
				if(cmd.param[j].optional) str += ' -Optional'
			}
			html.html(str);
			return;	
		}
		return false;	//no command matches $command
	},function(){
		return Dialog.chat.getInput();
	}));
}

//############

Command.receive = function(socket,d){	//server	d=Command.Query
	var info = Command.receive.verifyInput(d);
	if(typeof info === 'string') return Message.add(socket.key,info);	//aka error
	info.param.unshift(socket.key);	
	
	DB[info.func].func.apply(this,info.param);
}

Command.receive.verifyInput = function(d){
	var cmd = DB[d.func];
	if(!cmd) return 'invalid func';
	if(cmd.clientSide) return 'clientside func';
	
	var p = d.param;
	var doc = cmd.param;
	
	for(var i = 0 ; i < p.length && i < doc.length; i++){ 
		if(p[i] !== undefined && doc[i].type === 'number'){
			if(typeof p[i] !== 'number') return 'param' + i + ' is not number'; 
			p[i] = Math.round(p[i]).mm(doc[i].min,doc[i].max);
		}	

		if(p[i] !== undefined && doc[i].type === 'string'){
			if(typeof p[i] !== 'string') return 'param' + i + ' is not string'; 
			
			if(doc[i].whiteList && !doc[i].whiteList.$contains(p[i])) return 'param' + i + ' not part of whiteList';
		}
	}
	for(++i;i < doc.length; i++){
		if(!doc[i].optional) 
			return 'missing non-optional param';
		p[i] = doc[i].default;
	}
	
	return d;
}

Command.textToCommand = function(txt){
	for(var i in DB){
		if(txt.indexOf(i) !== 0) continue	//valid cmd
		var cmd = i;
		var param = txt.slice(i.length+1).split(',');
		for(var j in param)
			if(DB[i].param[j] && DB[i].param[j].type === 'number') param[i] = +param[i];
		return Command.Query(cmd,param);
	}
	return null;
}

Command.execute = function(func,param){
	if(func.func && func.param){ param = func.param; func = func.func; }	//aka if func is Command.Query
	param = param || [];
	if(!DB[func]) return ERROR(3,'invalid func',func);
	if(DB[func].clientSide) return DB[func].func.apply(this,param);
	Socket.emit('command',Command.Query(func,param));
}



//############
//############

Command.create('invite','Invite player to party.',true,[ //{
	Command.Param('string','Username',false),
],function(key,user){
	var act = Actor.get(key);
	var eid = Account.getKeyViaUsername(user);
	if(!eid) return Message.add(key,'This player doesn\'t exist.');
	Actor.click.party(act,eid);
}); //}

//Fl
Command.create('fl,add','Add a new Friend to your Friend List',true,[ //{
	Command.Param('string','Username to add',false),
	Command.Param('string','Nickname',true),
	Command.Param('string','Comment',true),
],function(key,user,nick,comment){
	if(user.length === 0) return;
	Main.addFriend(Main.get(key),user,nick,comment);
}); //}
Command.create('fl,remove','Remove a Friend',true,[ //{
	Command.Param('string','Username to remove',false),
],function(key,user){
	Main.removeFriend(Main.get(key),user);
}); //}
Command.create('fl,comment','Change Friend Comment',true,[ //{
	Command.Param('string','Username',false),
	Command.Param('string','Comment',false),
],function(key,user,comment){
	Main.social.changeFriendComment(Main.get(key),user,comment);
	
}); //}
Command.create('fl,nick','Set Nickname for a friend',true,[ //{
	Command.Param('string','Username',false),
	Command.Param('string','Nickname',false),
],function(key,user,nick){
	Main.social.changeFriendNick(Main.get(key),user,nick);
}); //}
Command.create('fl,pm','Change who can PM you right now.',true,[ //{
	Command.Param('string','Option (on,off or friend)',false,{whiteList:['on','off','friend']}),
],function(key,setting){
	Main.changeStatus(Main.get(key),setting);
}); //}
Command.create('mute',"Mute a player.",true,[ //{
	Command.Param('string','Username',false),
],function(key,user){
	Main.question(Main.get(key),function(){
		Main.mutePlayer(Main.get(key),user);
		Message.add(key,'To unmute, type $unmute,' + user + '.');
	},'Are you sure you want to mute "' + user + '"?','boolean');
}); //}
Command.create('unmute',"Unmute a player.",true,[ //{
	Command.Param('string','Username',false),
],function(key,user){
	Main.unmutePlayer(Main.get(key),user);
}); //}

//Window
Command.create('win,quest,toggleChallenge',"Toggle a Quest Challenge. Only possible before starting the quest.",false,[ //{
	Command.Param('string','Challenge Id',false),
],function(key,challenge){
	Challenge.toggle(Challenge.get(challenge),Main.get(key));
}); //}
Command.create('win,quest,start',"Start a quest.",false,[ //{
	Command.Param('string','Quest Id',false),
],function(key,qid){
	Main.startQuest(Main.get(key),qid);
}); //}
Command.create('win,quest,abandon',"Abandon a quest.",false,[ //{
	Command.Param('string','Quest Id',false),
],function(key,qid){
	var main = Main.get(key);
	if(main.quest[qid] && Date.now() - main.quest[qid]._startTime > CST.MIN)
		Main.displayQuestRating(main,qid,true);
			
	Main.abandonQuest(main);
}); //}
Command.create('win,reputation,add',"Select a Reputation",false,[ //{
	Command.Param('number','Page',false,{max:1}),
	Command.Param('number','Y',false,{max:14}),
	Command.Param('number','X',false,{max:14}),
],function(key,num,i,j){	
	if(Main.getQuestActive(Main.get(key)) !== null) 
		return Message.addPopup(key,'Finish the quest you\'re doing before modifying your Reputation.');
	Main.reputation.add(Main.get(key),num,i,j);
}); //}
Command.create('win,reputation,clear',"Clear Reputation Grid",false,[ //{
	Command.Param('number','Page',false,{max:1}),
],function(key,num){
	var main = Main.get(key);
	if(Main.getQuestActive(main) !== null) 
		return Message.addPopup(key,'Finish the quest you\'re doing before modifying your Reputation.');
	Main.question(main,function(){
		Main.reputation.clearGrid(main,num);
	},'Are you sure you want to clear the grid?','boolean');
	
}); //}
Command.create('win,reputation,remove',"Remove a Reputation",false,[ //{
	Command.Param('number','Page',false,{max:1}),
	Command.Param('number','Y',false,{max:14}),
	Command.Param('number','X',false,{max:14}),
],function(key,num,i,j){
	if(Main.getQuestActive(Main.get(key)) !== null) 
		return Message.addPopup(key,'Finish the quest you\'re doing before modifying your Reputation.');
	Main.reputation.remove(Main.get(key),num,i,j);
}); //}
Command.create('win,reputation,page',"Change Active Reputation Page",false,[ //{
	Command.Param('number','Page',false,{max:1}),
],function(key,num){
	if(Main.getQuestActive(Main.get(key)) !== null) 
		return Message.addPopup(key,'Finish the quest you\'re doing before modifying your Reputation.');
	Main.reputation.changeActivePage(Main.get(key),num);
}); //}

Command.create('win,reputation,converterAdd',"Add Converter",false,[ //{
	Command.Param('number','Page',false,{max:1}),
	Command.Param('string','Converter Name',false),
],function(key,num,name){
	Main.reputation.addConverter(Main.get(key),num,name);	
}); //}
Command.create('win,reputation,converterRemove',"Add Converter",false,[ //{
	Command.Param('number','Page',false,{max:1}),
	Command.Param('string','Converter Name',false),
],function(key,num,name){
	Main.reputation.removeConverter(Main.get(key),num,name);	
}); //}


Command.create('win,ability,swap',"Set an Ability to a Key",false,[ //{
	Command.Param('string','Ability Id',false),
	Command.Param('number','Key Position',false,{max:5}),
],function(key,name,position){
	Actor.swapAbility(Actor.get(key),name,position,true);
}); //}


Command.create('sendPing','Send Ping',false,[ //{
	Command.Param('number','Ping',false),
],function(key,ping){
	Socket.addPingData(Socket.get(key),ping);
}); //}

Command.create('setAcceptPartyInvite','Change if you accept party invite or not',false,[ //{
	Command.Param('boolean','Value',false),
],function(key,val){
	Main.get(key).acceptPartyInvite = val;
	Main.setFlag(Main.get(key),'acceptPartyInvite');
	Message.add(key,val ? 'You can receive party invitations.' : 'You cannot receive party invitations.');
}); //}


//Tab
Command.create('useItem',"Select an option from the Right-Click Option List of an item.",false,[ //{
	Command.Param('string','Id',false),
	Command.Param('number','Option Position',false),
],function(key,id,slot){
	Main.useItem(Main.get(key),id,slot);
}); //}

Command.create('transferInvBank',"Transfer items from Inventory to Bank.",false,[ //{
	Command.Param('string','Item Id',false),
	Command.Param('number','Amount',true,{default:1,min:1}),
],function(key,id,amount){
	Main.transferInvBank(Main.get(key),id,amount);
}); //}

Command.create('transferBankInv',"Transfer items from Bank to Inventory.",false,[ //{
	Command.Param('string','Item Id',false),
	Command.Param('number','Amount',true,{default:1,min:1}),
],function(key,id,amount){
	Main.transferBankInv(Main.get(key),id,amount);
}); //}


Command.create('transferInvBankAll',"Transfer all items from Inventory to Bank.",false,[ //{
],function(key,id,amount){
	Main.transferInvBankAll(Main.get(key));
}); //}


Command.create('transferInvTrade',"Transfer items from Inventory to Trade.",false,[ //{
	Command.Param('string','Item Id',false),
	Command.Param('number','Amount',true,{default:1,min:1}),
],function(key,id,amount){
	Main.transferInvTrade(Main.get(key),id,amount);
}); //}

Command.create('transferTradeInv',"Transfer items from Bank to Inventory.",false,[ //{
	Command.Param('string','Item Id',false),
	Command.Param('number','Amount',true,{default:1,min:1}),
],function(key,id,amount){
	Main.transferTradeInv(Main.get(key),id,amount);
}); //}

Command.create('tradeAcceptSelf',"Change if you accept the trade.",false,[ //{
	Command.Param('boolean','New State',false),
],function(key,val){
	Main.setTradeAcceptSelf(Main.get(key),val);
}); //}

Command.create('tradeCloseWin',"Close trade window.",false,[ //{
],function(key){
	Main.stopTrade(Main.get(key));
}); //}

Command.create('questButton',"Click quest button.",false,[ //{
	Command.Param('string','Button Id',false),
],function(key,str){
	var main = Main.get(key);
	if(!main.questActive) return;
	Quest.get(main.questActive).event._button(key,str);
}); //}


//############

Command.create('equipBound',"Bound an equip to you.",false,[ //{
	Command.Param('string','Equip Id',false),
],function(key,id){
	Main.question(Main.get(key),function(){
		Equip.boundToAccount(key,id);
	},'Are you sure? You won\'t be able to trade the equip afterward.','boolean');
	
}); //}

Command.create('equipUpgrade',"Upgrade an equip.",false,[ //{
	Command.Param('string','Equip Id',false),
],function(key,id){
	var main = Main.get(key);
	var equip = Equip.get(id);
	if(!equip) return;
	
	if(!Main.haveItem(main,equip.upgradeInfo.item)){
		return Message.addPopup(key,'You don\'t have the materials required:<br> ' + ItemList.stringify(equip.upgradeInfo.item));
	}
	
	Main.question(main,function(){
		Equip.upgrade.click(key,id);
	},'Are you sure you want to upgrade the equip?','boolean');
	
}); //}

Command.create('equipMastery',"Improve an equip.",false,[ //{
	Command.Param('string','Equip Id',false),
],function(key,eid){
	Equip.addMasteryExp.click(key,eid);	
}); //}

Command.create('equipSalvage',"Salvage an equip.",false,[ //{
	Command.Param('string','Equip Id',false),
],function(key,id){
	Equip.salvage(key,id);	
}); //}


//############

Command.create('enableMouseForMove',"Move Using the Mouse",false,[ //{
	Command.Param('boolean','Is Active?',false),
],function(key,active){
	Actor.get(key).useMouseForMove = !!active;
}); //}


Command.create('respawnSelf',"Revive self.",false,[ //{
],function(key){
	var act = Actor.get(key);
	if(act.dead)
		Actor.onCommandRespawn(act);
}); //}

Command.create('lvlup',"Level Up",false,[ //{
],function(key){
	Actor.levelUp(Actor.get(key));
}); //}

Command.create('enablePvp',"Toggle PvP",false,[ //{
	Command.Param('boolean','Enable',false),
],function(key,bool){
	if(Main.getQuestActive(Main.get(key)))
		return Message.addPopup(key,'You can\'t toggle PvP while doing a quest.');
	Actor.enablePvp(Actor.get(key),bool);
}); //}

Command.create('setLookingFor',"Set Looking For",false,[ //{
	Command.Param('string','Looking For',false),
	Command.Param('string','Comment',true),
],function(key,str,comment){
	var main = Main.get(key);
	main.lookingFor = Main.LookingFor(str,comment);
	Main.setFlag(main,'lookingFor');
}); //}


Command.create('tab,removeEquip',"Remove a piece of equipment",false,[ //{
	Command.Param('string','Equipement Piece',false,{whiteList:CST.equip.piece}),
],function(key,piece){
	Actor.removeEquip(Actor.get(key),piece,false);
}); //}

/*
Command.create('cc,create',"Create a new Clan",true,[ //{
	Command.Param('string','Clan Name',false),
],function(key,name){
	Clan.creation(key,name);
}); //}
Command.create('cc,enter',"Enter a Clan",true,[ //{
	Command.Param('string','Clan Name',false),
],function(key,name){
	Clan.enter(key,name);
}); //}

Command.create('cc,leave',"Leave a Clan",true,[ //{
	Command.Param('string','Clan Name',false),
],function(key,name){
	Clan.leave(key,name);
}); //}

Command.create('cc,leaveAll',"Leave all Clans",true,[ //{
],function(key){
	Clan.leave(key,'ALL');
}); //}
*/

Command.create('playerlist',"Get list of player online.",true,[ //{
],function(key){	//to improve, save the list every 1 sec
	Message.add(key,Server.getPlayerInfo());
}); //}

Command.create('chrono,remove',"Remove a stopped chronometer.",false,[ //{
	Command.Param('string','Chrono Name',false),
],function(key,name){
	var main = Main.get(key);
	if(main.chrono[name] && !main.chrono[name].active)
		Main.chrono.remove(main,name);
}); //}

Command.create('logout',"Safe way to log out of the game",false,[ //{
],function(key){
	Sign.off(key,"You safely quit the game.");
}); //}

Command.create('hometele',"Abandon active quest and teleport to Town. Useful if stuck.",false,[ //{
],function(key){
	var main = Main.get(key);
	var str = Main.getQuestActive(main) 
		? 'Are you sure you want to abandon active quest and teleport to town?'
		: 'Teleport to town?';
	Main.question(main,function(){
		if(Actor.teleport.town(Actor.get(key),true,false) !== true) return;
		Main.abandonQuest(main);
		Message.add(key,'You were teleported to first town.');		
	},str,'boolean');
}); //}

Command.create('dialogue,option',"Choose a dialogue option.",false,[ //{
	Command.Param('number','Dialogue Option #',false,{min:-1}),
],function(key,slot){
	var main = Main.get(key);
	if(!main.dialogue) return;
	if(slot === -1 && main.dialogue.exit !== 0) return Main.dialogue.end(main);		
	if(!main.dialogue.node.option[slot]) return;
	Main.dialogue.selectOption(main,main.dialogue.node.option[slot]);
}); //}

Command.create('actorOptionList',"Select an option from the Right-Click Option List of an actor.",false,[ //{
	Command.Param('string','Id',false),
	Command.Param('number','Option Position',false),
],function(key,id,slot){
	Actor.click.optionList(Actor.get(key),id,slot);
}); //}

Command.create('party,join',"Join a party.",true,[ //{

],function(key){
	if(Main.getQuestActive(Main.get(key)))
		return Message.addPopup(key,"You can't change your party while doing a quest.");
	
	Main.question(Main.get(key),function(key,name){
		if(name.$contains('@') || name.$contains('!') || name.$contains('$')) 
			return Message.addPopup(key,"You can't join this party.");	//reserved
		Main.changeParty(Main.get(key),name);
	},'What party would you like to join?','string');	
}); //}

Command.create('party,leave',"Leave your party.",true,[ //{
],function(key){
	Message.add(key, 'You left your party.');
	Main.changeParty(Main.get(key),Math.randomId());
}); //}

Command.create('pvp',"Teleport/Quit to PvP Zone.",true,[ //{
],function(key){
	return;
	/*
	var act = Actor.get(key);
	if(act.map.$contains('pvpF4A')){	//TOFIX
		Actor.teleport(act,act.respawnLoc.safe);
		Message.add(key,"You can no longer attack or be attacked by other players.");
	}
	*/
}); //}

Command.create('questRating',"Rate a quest.",false,[ //{
	Command.Param('string','Quest Id',false),
	Command.Param('number','Rating',false,{min:1,max:3}),
	Command.Param('string','Comment',true),
	Command.Param('string','Abandon Reason',true),
],function(key,quest,rating,text,abandonReason){
	Quest.rate(Main.get(key),quest,rating,text,abandonReason);
}); //}

Command.create('reward,purchase',"Purchase a Contribution Reward",false,[ //{
	Command.Param('string','Type',false),
	Command.Param('string','Param',false),
],function(key,type,param){
	Contribution.purchase(key,type,param);
}); //}

Command.create('reward,select',"Select a Contribution Reward",false,[ //{
	Command.Param('string','Type',false),
	Command.Param('string','Param',false),
],function(key,type,param){
	Contribution.select(key,type,param);
}); //}

Command.create('reward,reset',"Reset a Contribution Reward",false,[ //{
	Command.Param('string','Type',false),
],function(key,type){
	Contribution.reset(key,type);
}); //}

Command.create('reward,change',"Change the social media accounts linked with your Raining Chain account.",false,[ //{
	Command.Param('string','Website',false,{whiteList:['reddit','youtube','twitch','twitter']}),
	Command.Param('string','Account Name',false),
],function(key,account,name){
	Contribution.change(key,account,name);
}); //}

Command.create('reward,updateSocialMedia',"Update Social Media Contribution Points",false,[ //{
	Command.Param('string','Website',false,{whiteList:['reddit','youtube','twitch','twitter']}),
],function(key,account){
	Contribution.updateSocialMedia(key,account);
}); //}

Command.create('help',"Show List of Commands.",true,[ //{
	Command.Param('number','Show ALL Options (Not Recommended)',true),
],function(lvl){
	lvl = typeof lvl === 'undefined' ? lvl : 1;
	for(var i in Command.list){
		if(!DB[i]) continue;
		if(!DB[i].help && !lvl) continue;
		var str = '$' + i + ' :     ' + DB[i].description;
		Message.add(str);
	}
},true); //}

Command.create('reward,open',"Open Contribution Window",false,[ //{
],function(key){
	//$( "#contribution" ).d ialog('open');
},true); //}

Command.create('pref',"Change a Preference.",true,[ //{
	Command.Param('string','Pref Id',false),
	Command.Param('number','New Pref Value',false),
],function(name,value){
	Pref.change(name,value);
},true); //}

Command.create('music,next',"Skip this song.",true,[ //{
],function(){
	Song.ended();
},true); //}

Command.create('music,info',"Get info about song being played.",true,[ //{
],function(){
	Message.add(key,Song.getCurrentSongInfo());
},true); //}


})();
