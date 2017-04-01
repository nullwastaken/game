/*jshint unused:false*/
var Socket, Waypoint, SideQuest, MapGraph, IntegrityTest, Shop, Quest, VersionControl, Weather, SocialMedia, OfflineAction, Preset, Send, Competition, ActorModel, MapModel, Highscore, QuestVar, Party, SpriteModel, ItemModel, Account, ItemList, Combat, Message, OptionList, Boss, Server, Boost, Actor, Main, Attack, Strike, Bullet, Entity, ItemList, Sign, Save, Combat, Maps, Input, Message, Dialogue, Drop, Performance, Ability, Equip, Quest, Collision, Button, Sprite, Anim, Command, ReputationGrid;
global.onReady(function(){
	Socket = rootRequire('private','Socket'); Waypoint = rootRequire('shared','Waypoint'); SideQuest = rootRequire('shared','SideQuest'); MapGraph = rootRequire('shared','MapGraph'); IntegrityTest = rootRequire('private','IntegrityTest'); Shop = rootRequire('server','Shop'); Quest = rootRequire('server','Quest'); VersionControl = rootRequire('private','VersionControl'); Weather = rootRequire('server','Weather'); SocialMedia = rootRequire('private','SocialMedia'); OfflineAction = rootRequire('server','OfflineAction'); Preset = rootRequire('server','Preset'); Send = rootRequire('server','Send'); Competition = rootRequire('server','Competition'); ActorModel = rootRequire('shared','ActorModel'); MapModel = rootRequire('server','MapModel'); Highscore = rootRequire('server','Highscore'); QuestVar = rootRequire('server','QuestVar'); Party = rootRequire('server','Party'); SpriteModel = rootRequire('shared','SpriteModel'); ItemModel = rootRequire('shared','ItemModel'); Account = rootRequire('private','Account'); ItemList = rootRequire('shared','ItemList'); Combat = rootRequire('server','Combat'); Message = rootRequire('shared','Message'); OptionList = rootRequire('shared','OptionList'); Boss = rootRequire('server','Boss'); Server = rootRequire('private','Server'); Boost = rootRequire('shared','Boost'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); Attack = rootRequire('shared','Attack'); Strike = rootRequire('shared','Strike'); Bullet = rootRequire('shared','Bullet'); Entity = rootRequire('shared','Entity'); ItemList = rootRequire('shared','ItemList'); Sign = rootRequire('private','Sign'); Save = rootRequire('private','Save'); Combat = rootRequire('server','Combat'); Maps = rootRequire('server','Maps'); Input = rootRequire('server','Input'); Message = rootRequire('shared','Message'); Dialogue = rootRequire('server','Dialogue'); Drop = rootRequire('shared','Drop'); Performance = rootRequire('server','Performance'); Ability = rootRequire('server','Ability'); Equip = rootRequire('server','Equip'); Quest = rootRequire('server','Quest'); Collision = rootRequire('shared','Collision'); Button = rootRequire('shared','Button'); Sprite = rootRequire('shared','Sprite'); Anim = rootRequire('server','Anim'); Command = rootRequire('shared','Command'); ReputationGrid = rootRequire('shared','ReputationGrid');
	Socket.on(CST.SOCKET.debug,Debug.ts,100,10,true);
});
var Debug = rootRequire('server','Debug');


Debug.ts = function(socket,d){
			
}


Debug.ts.onSignIn = function(socket){	//only called for admin
	
}	



Debug.evalOnClient = function(key,what){
	var socket = Socket.get(key);
	socket.emit(CST.SOCKET.toEval,{toEval:what});
}
Debug.evalOnClient.all = function(what){
	for(var i in Socket.LIST)
		Debug.evalOnClient(i,what);
}
Debug.evalOnClientMsg = function(key,what){	//not working..
	Debug.evalOnClient(key,'exports.Message.sendToServer(exports.Message.Public(' + what + ',w.player.name))');
}


