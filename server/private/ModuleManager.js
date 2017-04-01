
"use strict";
(function(){ //}

var ModuleList = {};	//id:ModuleInfo		attribute is not filename but Module Object created.
var TreeDependency = MINIFY ? null : require('./TreeDependency').TreeDependency;

var Module = function(directory,file,exportsModule){
	exportsModule = file;	//because file can only have 1 exports atm
	var path = Module.getPath(directory,file);
	var tmp = {
		path:path,
		directory:directory,
		file:file,
		exportsModule:exportsModule,	//should only have 1	
	}
	if(exportsModule){
		if(directory === 'client')
			ModuleList['client-' + exportsModule] = tmp;	//prevent overwrite
		else
			ModuleList[exportsModule] = tmp;
	}
	
}

Module.getPath = function(directory,file){
	if(directory === 'client'){
		if(MINIFY)	return './client/js/' + file;
		return './../client/js/' + file;
	}
	else if(directory === 'shared'){
		if(MINIFY)	return './client/js/shared/' + file;
		return './../client/js/shared/' + file;
	}
	else if(directory === 'server'){
		if(MINIFY)	return './' + file;
		return './../' + file;
	}
	else if(directory === 'private'){
		if(MINIFY)	return './App_min';
		return './' + file;
	}
}	

exports.requireModuleList = function(){	//for integrityTest
	if(NODEJITSU) return;
	return ModuleList;
}

global.loadAPI = function(){
	if(!MINIFY)
		return require('./Quest_API').newQuest.apply(this,arguments);
	else
		return exports.newQuest.apply(this,arguments);
}

//create Module Info (not loading)

var readyFiles = false;

var fileRunner = Tk.newPubSub(false,function(f){
	if(readyFiles)
		f();
});

global.onReady = function(onFilesLoaded,initPack,self,dependency,onServerReady){
	var f = function(){
		onFilesLoaded(getInitPack(initPack));
	}
	fileRunner(f);
	
	if(readyFiles)
		return;
	
	if(self)
		initManager.add(self,dependency,onServerReady);
}

global.onLoop = Tk.newPubSub();

var getInitPack = function(initPack){
	if(!initPack)
		return null;
	var ret = {};
	if(initPack.db)
		ret.db = db.require(initPack.db);
	if(initPack.email)
		ret.email = email;
	if(initPack.app)
		ret.app = app;
	if(initPack.processArgv)
		ret.processArgv = processArgv;
	if(initPack.io)
		ret.io = io;
	return ret;
}
global.rootRequire = function(where,moduleId,client){
	if(client)
		return;
	if(TreeDependency) 
		TreeDependency.add(moduleId);
	var path = Module.getPath(where,moduleId);
	return require(path)[moduleId];
}

var initManager;
var db, email, processArgv, app, io;
exports.init_ModuleManager = function(db2,io2,email2,app2,processArgv2){
	db = db2;
	email = email2;
	processArgv = processArgv2;
	app = app2;
	io = io2;
	
	var IMModule = rootRequire('shared','InitManager');
	initManager = new IMModule();
	
	for(var i in ModuleList){
		if(ModuleList[i].directory !== 'client')
			require(ModuleList[i].path);
	}		
	fileRunner.pub();
	readyFiles = true;
	
	initManager.run(false);
	
	setInterval(function(){
		global.onLoop.pub();
	},1000/CST.FPS);
	var Server = rootRequire('private','Server');
	Server.init();
	return Server;
}; 


Module('shared','Actor');
Module('shared','ActorModel');
Module('shared','Actor_ability');
Module('shared','Actor_ai');
Module('shared','Actor_boost');
Module('shared','Actor_change');
Module('shared','Actor_combat');
Module('shared','Actor_death');
Module('shared','Actor_draw');
Module('shared','Actor_equip');
Module('shared','Actor_interaction');
Module('shared','Actor_loop');
Module('shared','Actor_move');
Module('shared','Actor_skill');
Module('shared','Actor_status');
Module('shared','Actor_teleport');
Module('shared','Actor_questMarker');

Module('shared','AnimModel');
Module('shared','Attack');
Module('shared','AttackModel');
Module('shared','BulletModel');
Module('shared','StrikeModel');
Module('shared','Boost');
Module('shared','Bullet');
Module('shared','Button');
Module('shared','Collision');
Module('shared','Combat_shared');
Module('shared','Command');
Module('shared','CST');
Module('shared','QueryDb');
Module('shared','Drop');
Module('shared','ERROR');
Module('shared','ItemList');
Module('shared','ItemModel');
Module('shared','Main');
Module('shared','Main_change');
Module('shared','Main_chrono');
Module('shared','Main_dialogue');
Module('shared','Main_itemlist');
Module('shared','Main_loop');
Module('shared','Main_reputation');
Module('shared','Main_quest');
Module('shared','Main_quest_status');
Module('shared','Main_question');
Module('shared','Main_social');
Module('shared','Main_temp');
Module('shared','Main_party');
Module('shared','Main_dailyTask');
Module('shared','Main_contribution');
Module('shared','Main_screenEffect');
Module('shared','Main_achievement');
Module('shared','Main_sideQuest');
Module('shared','Message');
Module('shared','OptionList');
Module('shared','ReputationGrid');
Module('shared','ReputationConverter');
Module('shared','Sprite');
Module('shared','SpriteModel');
Module('shared','Stat');
Module('shared','Strike');
Module('shared','Tk');
Module('shared','ClientError');
Module('shared','IconModel');
Module('shared','Achievement');
Module('shared','LightingEffect');
Module('shared','ParticleEffect');
Module('shared','SideQuest');
Module('shared','MapGraph');
Module('shared','Waypoint');
Module('shared','InitManager');
Module('shared','TmxParser');
Module('shared','BISON');




Module('server','Anim');
Module('server','Ability');
Module('shared','Entity');
Module('server','ActorGroup');
Module('server','Boss');
Module('server','Combat');
Module('server','Competition');
Module('server','CraftBoost');
Module('server','Debug');
	
Module('server','Dialogue');
Module('server','Equip');
Module('server','Input');
Module('server','Maps');
Module('server','MapModel');
Module('shared','MapModel_shared');
Module('server','Material');
Module('server','Message_server');
Module('server','OfflineAction');
Module('server','Shop');
Module('server','Party');
Module('server','Performance');
Module('server','Quest');
Module('server','Challenge');
Module('server','Preset');
Module('server','Quest_status');
Module('server','QuestVar');
Module('server','Highscore');
Module('server','SkillPlotModel');
Module('server','Send');
Module('server','Weather');
Module('server','Metrics');



Module('client','Account_client');
Module('client','Anim_client');
Module('client','Dialog');
Module('client','Dialog_ability');
Module('client','Dialog_achievement');
Module('client','Dialog_binding');
Module('client','Dialog_worldMap');
Module('client','Dialog_bottomLeft');
Module('client','Dialog_bottomRight');
Module('client','Dialog_contribution');
Module('client','Dialog_equip');
Module('client','Dialog_friend');
Module('client','Dialog_highscore');
Module('client','Dialog_itemList');
Module('client','Dialog_misc');
Module('client','Dialog_quest');
Module('client','Dialog_questList');
Module('client','Dialog_shop');
Module('client','Dialog_reputation');
Module('client','Dialog_setting');
Module('client','Dialog_stat');
Module('client','Dialog_topLeft');
Module('client','Dialog_topRight');
Module('client','Dialog_admin');
Module('client','Dialog_stage');
Module('client','Game');
Module('client','Img');
Module('client','Input_client');
//Module('client','main');	//cause problems...
Module('client','MapModel_client');
Module('client','Message_client');
Module('client','Message_receive');
Module('client','Performance_client');
Module('client','Pref');
Module('client','Receive');
Module('client','Sfx');
Module('client','Sign_client');
Module('client','Socket_client');
Module('client','Song');
Module('client','SpriteFilter');

Module('private','Account');
Module('private','Save');
Module('private','Server');
Module('private','Sign');
Module('private','Socket');
Module('private','VersionControl');
Module('private','Reddit');
Module('private','Debug_server');	//not in MINIFY
Module('private','SocialMedia');	//not in MINIFY
Module('private','IntegrityTest');	//not in MINIFY

})(); //{
