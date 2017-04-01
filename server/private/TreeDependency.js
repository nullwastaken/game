var TreeDependency = exports.TreeDependency = {};

var DISPLAY = false;

var LIST = {};	//moduleId: [module who needs it]
var EXCLUDE = 'Debug_server';

var INCLUDE_SUB_FILE = false;	//Main <=> Main_chrono
var TREAT_SUB_AS_MAIN = true;

TreeDependency.add = function(name){
	LIST[name] = LIST[name] || [];
	var needer = getNeeder();
	if(needer === EXCLUDE)
		return;
	if(!INCLUDE_SUB_FILE && (needer.$contains(name + '_') || name.$contains(needer + '_')))
		return;
	if(TREAT_SUB_AS_MAIN){
		if(name.$contains('_'))
			name = name.slice(0,name.indexOf('_'));
	}
	LIST[name].push(needer);
}

var getNeeder = function(){
	var str = (new Error()).stack;
	str = str.split('\n')[4];
	
	str = str.slice(0,str.indexOf('.js:'));
	str = str.slice(str.lastIndexOf('\\')+1);
	
	return str;
}

var display = function(){
	var list = [];
	for(var i in LIST){
		list.push({name:i,count:LIST[i].length});
	}
	list.sort(function(a,b){
		return b.count - a.count;
	})
	for(var j = 0 ; j < list.length; j++){
		var i = list[j].name;
		INFO(i,LIST[i].length,JSON.stringify(LIST[i]));
	}
	
	INFO('######################');
	INFO('######################');
	for(var i in LIST){	//i = Server
		for(var j = 0 ; j < LIST[i].length; j++){	//LIST[i][j] === Sign
			if(LIST[LIST[i][j]] && LIST[LIST[i][j]].indexOf(i) !== -1)	//circular
				INFO(i + ' <=> ' + LIST[i][j]);
		}			
	}
		
	
}

if(DISPLAY){
	setTimeout(display,3000);
}



/*
2015-01-31

Actor 			42 [Save, Server, Sign, ActorModel, Anim, Attack, Bullet, Button, Collision, Combat_shared, Combat, Command, Contribution, Drop, Main, Main_dialogue, Main_itemlist, Main_reputation, Main_quest, Main_quest_status, Main_social, OptionList, ReputationConverter, Sprite, Ability, Entity, ActorGroup, Boss, Debug, Equip, Input, Map, Message_server, OfflineAction, Quest_status, Send, Quest_API, Quest_API_new, Quest_API_map, Quest_API_boss, Qtutorial, Qhighscore]
Main 			38 [Save, Server, Sign, Actor, Actor_death, Actor_equip, Actor_interaction, Actor_skill, Actor_teleport, Button, Command, Contribution, QueryDb, ItemList, ItemModel, Main_dialogue, Main_quest, Main_quest_status, Main_social, ReputationGrid, ReputationConverter, Strike, Ability, Competition, Cycle, Debug, Equip, Message_server, OfflineAction, Party, Challenge, Quest_status, Send, Qsystem, Quest_API, Quest_API_new, Quest_API_map, Qhighscore]
Message 		28 [Account, Server, Socket, Actor, Actor_ability, Actor_death, Actor_equip, Actor_interaction, Actor_skill, Actor_teleport, Combat, Command, Contribution, ItemModel, Main, Main_change, Main_itemlist, Main_quest_status, Main_question, Main_social, Main_temp, ReputationConverter, Clan, Debug, Debug, Equip, OfflineAction, Quest_API]
Quest 			19 [Server, Sign, Actor, Actor_death, Actor_interaction, Command, QueryDb, Main_quest, Main_quest_status, Main_dailyTask, Competition, Cycle, Debug, Debug, Material, Challenge, Quest_API, Quest_API_new, Qhighscore]
Map 			19 [Server, Actor, Actor_death, Actor_interaction, Actor_teleport, Actor_questMarker, Anim, Attack, Bullet, Collision, Drop, Entity, ActorGroup, Debug, Map, MapModel, MapGraph, Send, Quest_API_map]
Collision 		16 [Server, Actor_ai, Actor_interaction, Actor_loop, Actor_move, Anim, Attack, Bullet, Button, Main_dialogue, Entity, Boss, Debug, Map, Quest_API, Quest_API_map]
Entity 		12 [Actor, Actor_death, Actor_loop, Actor_teleport, Attack, Bullet, Drop, Sprite, Strike, Debug, Map, Send]
Account 		12 [Save, Server, Sign, Socket, Actor, Command, ItemList, Main_social, Cycle, Debug, Message_server, OfflineAction]
Boost 			12 [Actor_boost, Actor_move, Actor_status, Combat_shared, Combat, Main_reputation, Ability, CraftBoost, Debug, Equip, Quest_API, Quest_API_new]
ItemModel 		12 [Sign, Actor_interaction, QueryDb, Drop, ItemList, Main_itemlist, Ability, Debug, Equip, Material, Message_server, Quest_API_new]
Equip 			11 [Server, Sign, Actor_equip, Combat_shared, Command, QueryDb, Drop, Debug, Quest_status, Qsystem, Quest_API_new]
Server 			11 [Sign, Socket, Actor_death, Actor_interaction, Command, Main, Main_quest, Debug, Performance, Highscore, ModuleManager]
Debug 			10 [Server, Sign, Socket, Main_quest, Main_quest_status, Quest, QuestVar, Quest_API, QfirstTown, Qtutorial]
Sign 			9 [Account, Server, Socket, Command, Entity, Debug, Map, Performance, Send]
Highscore 		9 [Save, Server, Sign, QueryDb, Main_quest_status, Competition, Debug, Quest, Quest_API_new]
Drop 			9 [Server, Actor_death, Actor_interaction, Button, Main, Entity, Debug, Map, Send]
QuestVar 		9 [Save, Server, Sign, Main, Main_quest, Debug, Quest_status, Quest_API, Quest_API_new]
OptionList 		9 [Actor, Actor_change, Actor_interaction, Button, ItemModel, Main_itemlist, Ability, Debug, Equip]
Sprite 			9 [Actor, ActorModel, Actor_change, Actor_loop, Attack, AttackModel, Bullet, Debug, Quest_API_new]
Combat 			9 [Actor_ability, Actor_ai, Actor_equip, Attack, Bullet, Collision, Debug, Debug, Equip]
ItemList 		8 [Command, ItemModel, Main_change, Main_itemlist, Debug, Debug, Equip, Quest_API]
Party 			8 [Sign, Main_dialogue, Main_quest, Main_quest_status, Main_party, Debug, Message_server, Quest_API]
MapModel		7 [Sign, Actor_teleport, Collision, Debug, Map, Quest_API, Quest_API_new]
Socket 			5 [Save, Server, Sign, Command, Send]
OfflineAction 	4 [Server, Sign, Competition, Debug]
Competition 	3 [Server, Main_quest_status, Debug]
Performance 	4 [Server, Socket, Debug, Send]
Attack 			3 [Server, Combat, Debug]
ActorGroup 		6 [Server, Actor, Actor_death, Main, Map, Quest_API_map]
Cycle 			3 [Server, Sign, Debug]
Clan 			2 [Server, Debug]
Send 			2 [Server, Debug]
ActorModel 		6 [Server, Actor, Debug, Quest_API, Quest_API_new, Quest_API_boss]
Material 		4 [Server, Actor_death, Equip, Quest_status]
Save 			4 [Server, Sign, Main_loop, Debug]
SpriteModel 	4 [Sign, Sprite, Debug, Quest_API_new]
ReputationGrid 	4 [Sign, Main_reputation, ReputationConverter, Debug]
Contribution 	2 [Sign, Command]
Input 			2 [Socket, Debug]
Button 			3 [Socket, Debug, Quest_API_new]
Command 		2 [Socket, Debug]
QueryDb 		1 [Socket]
Boss 			5 [Actor, Actor_loop, Debug, Quest_API_new, Quest_API_boss]
Stat 			5 [Actor, Actor_boost, Boost, Main_reputation, CraftBoost]
Ability			5 [Actor_ability, QueryDb, Debug, Quest_API_new, Quest_API_boss]
Anim 			6 [Actor_ability, Combat, Debug, Send, Quest_API, Quest_API_new]
Tk 				1 [Actor_ai]
Preset 			3 [Actor_combat, Debug, Quest_API_new]
SkillPlotModel 	2 [Actor_interaction, Quest_API_map]
MapGraph 		2 [Actor_questMarker, Quest_API_map]
Bullet 			5 [Attack, Entity, Debug, Map, Send]
AttackModel		3 [Attack, Ability, Quest_API_new]
Challenge 		4 [Command, Quest, Quest_status, Quest_API_new]
Dialogue 		3 [Main_dialogue, Debug, Quest_API_new]
ReputationConverter 2 [Main_reputation, ReputationGrid]
Strike 			4 [Entity, Debug, Map, Send]
CraftBoost 		1 [Equip]

*/
/*
2015-07-28

Actor 52 ["ActorModel","Attack","Bullet","Button","Collision","Combat_shared","Combat","Command","Main","Main_dialogue","Main_itemlist","Main_reputation","Main_quest_status","Main_social","Main_contribution","Main_sideQuest","OptionList","ReputationConverter","Sprite","Stat","Strike","Achievement","SideQuest","Waypoint","Anim","Ability","Entity","ActorGroup","Boss","Debug","Equip","Input","Maps","Message_server","OfflineAction","Shop","Quest","Quest_status","Send","Metrics","Account","Save","Server","Sign","IntegrityTest","Qsystem","Quest_API","Quest_API_new","Quest_API_map","Quest_API_boss","Qhighscore","Qtutorial"]
Main 47 ["Actor_ability","Actor","Actor_combat","Actor_death","Actor_equip","Actor_interaction","Actor_loop","Actor_skill","Actor_teleport","Bullet","Button","Command","QueryDb","ItemList","ItemModel","ReputationGrid","ReputationConverter","Sprite","Strike","Achievement","SideQuest","Waypoint","Ability","Competition","Cycle","Debug","Equip","Message_server","OfflineAction","Shop","Party","Quest","Quest_status","Send","Weather","Metrics","Account","Save","Server","Sign","IntegrityTest","Qsystem","Quest_API","Quest_API_new","Quest_API_map","QfirstTown","Qhighscore"]
Message 24 ["Actor_ability","Actor_death","Actor_interaction","Actor_teleport","Combat","Command","ItemModel","Main","Main_itemlist","Main_quest","Main_question","Main_social","Main_contribution","ReputationConverter","Achievement","Ability","Debug","Equip","Input","Material","OfflineAction","Account","Server","Quest_API"]
Quest 18 ["Actor_death","Actor_interaction","Command","QueryDb","Main_quest","Main_quest_status","Main_temp","Main_party","Main_dailyTask","Achievement","Competition","Cycle","Debug","Maps","Material","Sign","IntegrityTest","Qhighscore"]
Achievement 17 ["Main_achievement","Actor_death","Actor_equip","Actor_interaction","Actor_teleport","Main","Main_dialogue","Main_itemlist","Main_reputation","Main_quest_status","Main_sideQuest","Competition","Equip","Shop","Quest","Sign","QfirstTown"]
Maps 17 ["Actor","Actor_death","Actor_interaction","Actor_teleport","Bullet","Command","Drop","Strike","SideQuest","Anim","Entity","ActorGroup","Debug","MapModel","Send","Quest_API","Quest_API_map"]
ItemModel 15 ["Actor_interaction","QueryDb","Drop","ItemList","Main_itemlist","Achievement","Ability","Debug","Equip","Material","Message_server","Shop","Quest_status","Sign","Quest_API_new"]
Collision 15 ["Actor_ai","Actor_interaction","Actor_loop","Actor_move","Attack","Bullet","Button","Main_dialogue","Strike","Entity","Boss","Maps","Maps","Quest_API","Quest_API_map"]
Equip 15 ["Actor","Actor_death","Actor_equip","Combat_shared","Command","QueryDb","Drop","ItemList","Achievement","Debug","Shop","Quest_status","Sign","Qsystem","Quest_API_new"]
Socket 14 ["Actor_status","Button","Command","QueryDb","ClientError","Input","Message_server","Send","Metrics","Account","Save","Server","Sign","IntegrityTest"]
MapModel 12 ["Actor_teleport","Collision","SideQuest","MapGraph","Waypoint","Debug","Maps","Sign","IntegrityTest","Quest_API","Quest_API_new","Quest_API_map"]
Entity 12 ["Actor_change","Actor","Actor_death","Actor_loop","Actor_teleport","Attack","Bullet","Drop","Sprite","Strike","Maps","Send"]
Boost 11 ["Actor_boost","Actor_status","Combat_shared","Combat","Main_reputation","Ability","CraftBoost","Debug","Equip","Quest_API","Quest_API_new"]
Combat 11 ["Actor_ability","Actor_ai","Actor_change","Actor","Actor_combat","Actor_equip","Bullet","Collision","Strike","Equip","Maps"]
Server 11 ["Actor","Command","Main","Main_itemlist","Debug","Message_server","Highscore","Account","Sign","Socket","ModuleManager"]
Sign 10 ["Command","Main_itemlist","Entity","Maps","Performance","Send","Account","Server","Socket","IntegrityTest"]
Debug 9 ["Command","Main_quest_status","Quest","QuestVar","Server","Sign","Quest_API","QfirstTown","Qtutorial"]
Sprite 8 ["ActorModel","Actor_change","Actor","Actor_death","Actor_loop","AttackModel","Bullet","Quest_API_new"]
Party 8 ["Actor_death","Actor_interaction","Main_dialogue","Main_quest_status","Main_party","Message_server","Sign","Quest_API"]
Material 8 ["Actor_death","Command","Achievement","SideQuest","Competition","Equip","Shop","Quest_status"]
OptionList 8 ["Actor_change","Actor","Actor_interaction","Button","ItemModel","Main_itemlist","Ability","Equip"]
Account 8 ["Actor","Command","Main_social","Cycle","Message_server","OfflineAction","Server","Sign"]
Drop 7 ["Actor_death","Actor_interaction","Button","Main","Entity","Maps","Send"]
QuestVar 7 ["Main","Debug","Quest_status","Save","Sign","Quest_API","Quest_API_new"]
Highscore 7 ["QueryDb","Main_quest_status","Competition","Quest","Save","Sign","Quest_API_new"]
ItemList 7 ["ItemModel","Main_change","Main_itemlist","Achievement","SideQuest","Equip","Quest_API"]
Stat 6 ["Actor_boost","Actor","Boost","Main_reputation","CraftBoost","Equip"]
Anim 6 ["Actor_ability","Combat","Send","IntegrityTest","Quest_API","Quest_API_new"]
Ability 6 ["Actor_ability","QueryDb","Achievement","Debug","Quest_API_new","Quest_API_boss"]
AttackModel 5 ["Attack","BulletModel","StrikeModel","Ability","Quest_API_new"]
Challenge 5 ["Main_quest","Main_quest_status","Quest","Quest_status","Quest_API_new"]
OfflineAction 5 ["Command","Main_contribution","Competition","Sign","SocialMedia"]
ActorGroup 5 ["Actor","Actor_death","Main","Maps","Quest_API_map"]
IconModel 5 ["Message","ItemModel","Achievement","Dialogue","Quest_API"]
ActorModel 5 ["Actor","IntegrityTest","Quest_API","Quest_API_new","Quest_API_boss"]
Metrics 4 ["Command","Main_quest_status","Equip","Sign"]
Boss 4 ["Actor","Actor_loop","Quest_API_new","Quest_API_boss"]
SideQuest 4 ["Main_sideQuest","Sign","Quest_API","Quest_API_new"]
Dialogue 3 ["Main_dialogue","IntegrityTest","Quest_API_new"]
Save 3 ["Main_loop","Server","Sign"]
MapGraph 3 ["Actor_questMarker","Sign","Quest_API_map"]
Attack 3 ["Bullet","Combat","Strike"]
Bullet 3 ["Entity","Maps","Send"]
Strike 3 ["Entity","Maps","Send"]
SkillPlotModel 2 ["Actor_interaction","Quest_API_map"]
ReputationConverter 2 ["Main_reputation","ReputationGrid"]
ReputationGrid 2 ["Main_reputation","ReputationConverter"]
Preset 2 ["Actor_combat","Quest_API_new"]
Competition 2 ["Main_quest_status","Sign"]
SpriteModel 2 ["Main_contribution","Sprite"]
Waypoint 2 ["Command","Quest_API_map"]
AnimModel 2 ["Anim","IntegrityTest"]
Performance 2 ["Send","Socket"]
LightingEffect 2 ["AnimModel","SpriteModel"]
Weather 2 ["Maps","MapModel"]
Shop 2 ["Actor_interaction","Command"]
Send 1 ["Command"]
StrikeModel 1 ["Strike"]
InitManager 1 ["ModuleManager"]
Reddit 1 ["Command"]
ClientError 1 ["Command"]
CraftBoost 1 ["Equip"]
Input 1 ["Actor_ability"]
BulletModel 1 ["Bullet"]
Cycle 1 ["Sign"]
Button 1 ["Quest_API_new"]
VersionControl 0 []
SocialMedia 0 []
IntegrityTest 0 []
Command 0 []
######################
######################
Actor <=> ActorModel
Actor <=> Combat
Actor <=> Main
Actor <=> OptionList
Actor <=> Sprite
Actor <=> Stat
Actor <=> Entity
Actor <=> ActorGroup
Actor <=> Boss
Actor <=> Equip
Actor <=> Maps
Actor <=> Account
Actor <=> Server
Combat <=> Actor
Main <=> Actor
Main <=> Achievement
Main <=> Server
Quest <=> Achievement
Quest <=> Debug
Debug <=> Quest
Debug <=> QuestVar
Debug <=> Server
Achievement <=> Main
Achievement <=> Equip
Achievement <=> Quest
Stat <=> Actor
Sprite <=> Actor
Entity <=> Actor
Entity <=> Bullet
Entity <=> Drop
Entity <=> Strike
Entity <=> Maps
OptionList <=> Actor
Account <=> Actor
Account <=> Server
Account <=> Sign
Equip <=> Actor
Equip <=> ItemList
Equip <=> Achievement
Server <=> Actor
Server <=> Main
Server <=> Debug
Server <=> Account
Server <=> Sign
Server <=> Socket
Boss <=> Actor
Maps <=> Actor
Maps <=> Bullet
Maps <=> Drop
Maps <=> Strike
Maps <=> Entity
Maps <=> ActorGroup
Maps <=> MapModel
ActorGroup <=> Actor
ActorGroup <=> Maps
ActorModel <=> Actor
Drop <=> Entity
Drop <=> Maps
ItemModel <=> ItemList
Socket <=> Server
Socket <=> Sign
MapModel <=> Maps
Sign <=> Account
Sign <=> Server
Sign <=> Socket
ItemList <=> ItemModel
ItemList <=> Equip
QuestVar <=> Debug
ReputationConverter <=> ReputationGrid
ReputationGrid <=> ReputationConverter
Bullet <=> Entity
Bullet <=> Maps
Strike <=> Entity
Strike <=> Maps



*/







