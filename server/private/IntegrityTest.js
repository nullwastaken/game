
"use strict";
(function(){ //}
var Ability, Main, Dialogue, Debug, AnimModel, Socket, Sign, Actor, ActorModel, MapModel, Quest, Anim;
global.onReady(function(initPack){
	Ability = rootRequire('server','Ability'); Debug = rootRequire('server','Debug'); Main = rootRequire('shared','Main'); Dialogue = rootRequire('server','Dialogue'); AnimModel = rootRequire('shared','AnimModel'); Socket = rootRequire('private','Socket'); Sign = rootRequire('private','Sign'); Actor = rootRequire('shared','Actor'); ActorModel = rootRequire('shared','ActorModel'); MapModel = rootRequire('server','MapModel'); Quest = rootRequire('server','Quest'); Anim = rootRequire('server','Anim');
	ENABLED = initPack.processArgv.integrityTest;
},{processArgv:true},'IntegrityTest',['Quest','Achievement','SideQuest','MapModel'],function(pack){
	IntegrityTest.init(pack);
});

var ENABLED;
var ModuleList = require('./ModuleManager').requireModuleList();

var DO_TEST_DEPENDENCY = false;

//setTimeout(function(){ IntegrityTest.testIdeApi(); },5000)
//setTimeout(function(){	INFO(IntegrityTest.getQuestCreatorQsystem());},5000);

var FILE_LIST = {};
var path = require('path');
var fs = require('fs');
		
var getFile = function(p){
	p = path.resolve(__dirname,p) + '.js';
	if(!FILE_LIST[p]){
		var file = fs.readFileSync(p).toString();
		FILE_LIST[p] = Tk.removeComment(file);
	}
	return FILE_LIST[p];
}
var IntegrityTest = exports.IntegrityTest = {};

IntegrityTest.init = function(){
	if(NODEJITSU || !ENABLED)
		return;
	Sign.in.saveSignInPackStatic();
		
	IntegrityTest.signInFakePlayer(function(){
		try {
			var act = IntegrityTest.getFakePlayer();
			var main = IntegrityTest.getFakeMain();
			IntegrityTest.testUnusedStaticFunction(act,main);
			IntegrityTest.testDialogue(act,main);
			IntegrityTest.testStaticFunction(act,main);
			IntegrityTest.testQuestFunction(act,main);
			IntegrityTest.testActorModel(act,main);
			IntegrityTest.testAnimModel(act,main);
			IntegrityTest.testAbility(act,main);
			
			IntegrityTest.testMap(act,main,function(){
				INFO("################## ERROR ##################");
				INFO(ERROR.LOG);
			});
			if(DO_TEST_DEPENDENCY)
				IntegrityTest.testDependency();
		} catch(err){
			INFO('ENDED PREMATURELY');
			ERROR.err(2,err);
		}
	});
}	

IntegrityTest.signInFakePlayer = function(cb){
	var socket = IntegrityTest.createFakeSocket();
	INFO('signing in');
	Sign.in(socket,{
		username:'bob',password:'bob'
	});
	setTimeout(function(){
		var main = IntegrityTest.getFakeMain();
		if(!main)
			INFO('make sure bob/bob exists');
		var act = IntegrityTest.getFakePlayer();
		INFO('main id: ' + main.id);
		INFO('act id: ' + act.id);
		cb();
	},1000);
}

//simulate sign in/up
var BOT_PASSWORD = 'BOTBOT';
var BOT_USERNAME = function(i){ return 'BOT_' + i; };

IntegrityTest.stressTestSignIn = function(amount){
	amount = amount || 100;
	for(var i = 0 ; i < amount; i++){
		IntegrityTest.stressTestSignIn.one(i);
	}
}
IntegrityTest.stressTestSignIn.one = function(num){
	var socket = IntegrityTest.createFakeSocket();
	Sign.in(socket,{
		username:BOT_USERNAME(num),password:BOT_PASSWORD
	},function(){
		setTimeout(function(){
			Sign.off(socket.key);	
		},10000);	// * Math.random()*50000
	});
}

var LIST = [];
IntegrityTest.stressTestSignInOff = function(amount){
	amount = amount || 100;
	for(var i = 0 ; i < amount; i++){
		IntegrityTest.stressTestSignInOff.one(i);
	}
}
IntegrityTest.stressTestSignInOff.one = function(num){
	var interval = setInterval(function(){
		var socket = IntegrityTest.createFakeSocket();
		Sign.in(socket,{
			username:BOT_USERNAME(num),password:BOT_PASSWORD
		},function(){	
			setTimeout(function(){
				Sign.off(socket.key);	
			},1000);
		});
	},10000);
	LIST.push(interval);
}
IntegrityTest.stressTestSignInOff.stop = function(){
	for(var i = 0 ; i < LIST.length; i++)
		clearInterval(LIST[i]);
	LIST = [];
}


IntegrityTest.stressTestSignUp = function(amount){
	amount = amount || 100;
	for(var i = 0 ; i < amount; i++){
		IntegrityTest.stressTestSignUp.one(i);		
	}
}
IntegrityTest.stressTestSignUp.one = function(num){
	var socket = IntegrityTest.createFakeSocket();
	var username = BOT_USERNAME(Math.randomId());	// + num;
	var password = BOT_PASSWORD;
	Sign.up(socket,{
		username:username,password:password
	});
}


IntegrityTest.getFakeMain = function(){
	return Main.get(Main.LIST.$randomAttribute());
}

IntegrityTest.getFakePlayer = function(){
	var act = Actor.get(Main.LIST.$randomAttribute());
	act.ghost = true;
	act.combat = false;
	return act;
}

IntegrityTest.createFakeSocket = function(){
	var s = Socket.create({
		emit:function(what,data){
			//INFO(what,data);
		},
		on:function(){
			
		},
		disconnect:function(){},
	});
	s.fake = true;
	return s;
}

IntegrityTest.testMap = function(act,main,cb){
	var count = 0;
	var func = function(id){
		return function(){
			INFO('teleporting to map: ' + id);
			Actor.teleport(act,Actor.Spot(0,0,id,null));
		}
	};
	
	for(var i in MapModel.DB){
		setTimeout(func(i),++count*100);
	}
	if(cb)
		setTimeout(cb,++count*100);
}

IntegrityTest.testActorModel = function(act,main,cb){
	Debug.spawnEveryEnemy(act.id,true);
	if(cb)
		cb();
}

IntegrityTest.testAbility = function(act,main,cb){
	for(var i in Ability.DB){
		INFO('using ability: ' + i);
		var ab = Ability.DB[i];
		for(var i in ab.param)
			if(typeof ab.param[i] === 'function')	//remove hitEvent and events
				ab.param[i] = null;
		try {
			Actor.useAbility(act,ab,true,undefined,true);
		} catch(err){ ERROR.err(3,'can be infinite loop cuz of triggerAbility'); }
	}
	if(cb)
		cb();
}


IntegrityTest.testAnimModel = function(act,main,cb){
	for(var i in AnimModel.DB){
		INFO('create anim: ' + i);
		Anim.create({id:i,sizeMod:1},Anim.Target(0,0,act.map,CST.VIEWED_IF.always));
	}
	if(cb)
		cb();
}

IntegrityTest.testDialogue = function(act,main,cb){
	var list = Dialogue.DB;
	for(var i in list){	//i=quest
		for(var j in list[i]){ //j=npc
			for(var k in list[i][j].nodeList){ //k=node
				INFO('starting dialogue: ' + i + ',' + j + ',' + k);
				Main.startDialogue(main,{quest:i,npc:j,node:k});
				for(var m = 0 ;  m < list[i][j].nodeList[k].option.length; m++){
					//INFO('    node #' + m);
					Main.dialogue.selectOption(main,m,false);
				}
			}
		}	
	}
	if(cb)
		cb();
}

IntegrityTest.testEvent = function(act,main,cb){	//doesnt work
	return ERROR(3,'doesnt work...');
	/*
	var list = Quest.DB;
	for(var i in list){
		var q = list[i];
		if(!q.inMain) 
			continue;
		INFO('starting quest: ' + q.id);
		Main.startQuest(main,q.id);
		for(var j in q.event){
			INFO('event: ' + j);
			q.event[j](act.id);
		}
	}
	if(cb)
		cb();
	*/
}



IntegrityTest.testQuestFunction = function(act,main,cb){
	INFO('testQuestFunction start\r\n');
	
	var funcList = {};
	
	for(var i in Quest.DB){
		var str = getFile('./../quest/' + i + '/' + i);
		
		var notLetterDor = '[^a-zA-Z0-9_\\.]';
		var dot = '\\.';
		var letter = '[a-zA-Z0-9_]*';
		var parenthese = '\\(';
			
		for(var j in {s:1,b:1,m:1}){	//check for every function called
			var reg1 = new RegExp(notLetterDor + j + dot + letter + parenthese,'g');
			var res1 = str.match(reg1) || [];
			var reg2 = new RegExp(notLetterDor + j + dot + letter + dot + letter + parenthese,'g');
			var res2 = str.match(reg2) || [];
			
			var res = res1.concat(res2);
			
			for(var k = 0 ; k < res.length ;k++){
				var str2 = res[k].slice(1,-1);	//remove space and (
				funcList[str2] = 1;
			}
		}
	}
	var array = [];
	for(var i in funcList)
		array.push(i);
	array.sort();
	//INFO(array);
	
	
	var q = Quest.get('Qsystem');
	var questFunc = {
		s:q.s,
		m:q.s.map,
		b:q.s.boss,
	}
	for(var i in funcList){
		if(i.$contains('.apply') || i.$contains('.push') || i.$contains('BISON'))
			continue;
			
		try {
			var array = i.split('.');
			if(array.length === 2)
				if(questFunc[array[0]][array[1]] === undefined)
					ERROR(2,'invalid function',i);
			else if(array.length === 3)
				if(questFunc[array[0]][array[1]][array[2]] === undefined)
					ERROR(2,'invalid function',i);

		} catch(err){
			ERROR(2,'invalid function',i);
		}
	}
	INFO('testQuestFunction done');
	
	if(cb)
		cb();
};

IntegrityTest.testUnusedStaticFunction = function(act,main,cb){
	INFO('testUnusedStaticFunction start\r\n');
	var list = IntegrityTest.getAllStaticFunction();
	var pathList = ['./App_private','./Quest_API','Quest_API_boss','Quest_API_map','Quest_API_new'];
	for(var j in ModuleList)
		pathList.push(ModuleList[j].path);
		
	for(var i = 0 ; i < list.length; i++){
		var good = false;
		for(var j = 0 ; j < pathList.length; j++){
			var str = getFile(pathList[j]);
			str = str.replace(list[i].name + ' =','');
			if(str.$contains(list[i].name)){
				good = true;
			}
		}	
		
		if(!good)
			INFO(' => unsued: ',list[i].name);
	}
	
	INFO('testUnusedStaticFunction done');
	
	if(cb)
		cb();
}

IntegrityTest.testStaticFunction = function(act,main,cb){
	INFO('testStaticFunction start\r\n');
	
	var funcList = {};
	
	for(var i in ModuleList){
		//INFO('analysing module: ' + i);
		var str = getFile(ModuleList[i].path);
		
		var notLetterDot = '[^a-zA-Z0-9_\\.]';
		var dot = '\\.';
		var letter = '[a-zA-Z0-9_]*';
		var parenthese = '\\(';
			
		for(var j in ModuleList){	//check for every function called
			var reg1 = new RegExp(notLetterDot + ModuleList[j].exportsModule + dot + letter + parenthese,'g');
			var res1 = str.match(reg1) || [];
			var reg2 = new RegExp(notLetterDot + ModuleList[j].exportsModule + dot + letter + dot + letter + parenthese,'g');
			var res2 = str.match(reg2) || [];
			
			var res = res1.concat(res2);
			
			for(var k = 0 ; k < res.length ;k++){
				var str2 = res[k].slice(1,-1);	//remove space and (
				funcList[str2] = 1;
			}
		}
	}
	var array = [];
	for(var i in funcList)
		array.push(i);
	array.sort();
	//INFO(array);
		
	for(var i in funcList){
		if(i.$contains('.apply') || i.$contains('.call') || i.$contains('Manager.') || i.$contains('.have') || i.$contains('.push') || i.$contains('.pub') || i.$contains('BISON'))
			continue;
		var good = false;
		for(var j in ModuleList){
			var str = getFile(ModuleList[j].path);
			if(str.$contains(i + ' = '))
				good = true;
		}
		if(!good)
			ERROR(2,'invalid function',i);
	}
	INFO('testStaticFunction done');
	
	if(cb)
		cb();
}	

IntegrityTest.getAllStaticFunction = function(){
	if(NODEJITSU)
		return null;
	var a = {};
	for(var i in ModuleList){
		var what = ModuleList[i].exportsModule;
		if(ModuleList[i].directory !== 'client')
			a[what] = rootRequire(ModuleList[i].directory,what);
	}
	return a;
}

var getAllFunction = function(obj,name,deep,array){
	name = name || '';
	array = array || [];
	deep = deep || 0;
	deep++;
	if(deep > 4) 
		return;
	if(typeof obj === 'function'){
		//testOptimization(obj,name,true);
		array.push({name:name,func:obj});
		return;
	}
	if(obj && typeof obj === 'object'){
		for(var i in obj){
			getAllFunction(obj[i],name ? name + '.' + i : i,deep,array);
		}
	}
	return array;
}

var V8_OPTIMIZATION_ONLY_FOR_NAME = '';
var testOptimization = function(func,name,callTwice){
	if(NODEJITSU)
		return;
	if(V8_OPTIMIZATION_ONLY_FOR_NAME && name !== V8_OPTIMIZATION_ONLY_FOR_NAME)
		return;
	
	var res = getOptimizationStatus(func,callTwice)	

	//if(res === 1) INFO('Optimized          ',name);
	if(res === 2) INFO('Not Optimized      ',name);	
	//if(res === 3) INFO('Always Optimized   ',name);
	if(res === 4) INFO('Never Optimized    ',name);
	if(res === 6) INFO('Maybe deoptimized  ',name);
}

var getOptimizationStatus = function(func,callTwice){
	if(callTwice){
		ERROR = function(){};
		ERROR.err = function(){};
		ERROR.loop = function(){};
	
		// 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic	
		try { func(); } catch(err){}
		try { func(); } catch(err){}
		
		eval('%OptimizeFunctionOnNextCall(func);'); //otherwise compile dumb...
		
		try { func();} catch(err){}
	}
	return eval('%GetOptimizationStatus(func);');
}

IntegrityTest.testOptimization = function(){
	var list = IntegrityTest.getAllStaticFunction();
	for(var i = 0 ; i < list.length; i++){
		if(!list[i].name.$contains('Actor'))
			continue;
		testOptimization(list[i].func,list[i].name);
	}
}
IntegrityTest.testOptimization.pre = function(){
	var list = IntegrityTest.getAllStaticFunction();
	for(var i = 0 ; i < list.length; i++){
		eval('%OptimizeFunctionOnNextCall(list[i].func);');
	}
}

IntegrityTest.testOptimization.manuallyPre = function(name,p1,p2,p3,p4,p5){
	var list = IntegrityTest.getAllStaticFunction();
	for(var i = 0 ; i < list.length; i++){
		if(list[i].name === name){
			list[i].func(p1,p2,p3,p4,p5);
			list[i].func(p1,p2,p3,p4,p5);
			eval('%OptimizeFunctionOnNextCall(list[i].func);');
			list[i].func(p1,p2,p3,p4,p5);
			testOptimization(name,list[i].func);
			return;
		}
	}
	//TODO: illegal access...
	INFO('Invalid name',name);
}

IntegrityTest.testIdeApi = function(){
	INFO('testIdeApi start');
	var s = Quest.get('Qsystem').s;
	
	var array = getAllFunction(s,'s');
	
	var remove = function(name){
		var banned = [
			's.sideQuest.',
			's.new',	//needed for npc
			'admin',
			's.boss',
			'.one',
		];
		for(var i = 0 ; i < banned.length; i++)
			if(name.$contains(banned[i]))
				return true;
		return false;			
	}
	
	for(var i = array.length-1 ; i >= 0 ; i--){
		if(array[i].name.$contains('s.map.',true))
			array[i].name = array[i].name.replace('s.map.','m.');
		
		if(remove(array[i].name))
			array.splice(i,1);
	}
	var LIST = require('../client/views/QuestCreator/API_DATA').LIST;
	
	var getApiParamViaName = function(name){
		for(var i = 0 ; i < LIST.length; i++)
			if(LIST[i].name === name)
				return LIST[i].param;
		return null;
	}
	

	for(var i = 0 ; i < array.length ; i++){		
		if(array[i].func.toString().$contains('/**/'))	//aka adminwd
			continue;
		
		var apiRaw = getApiParamViaName(array[i].name);
		if(apiRaw === null){
			INFO('missing api',array[i].name);
			continue;
		}
		var api = [];
		for(var j = 0 ; j < apiRaw.length; j++)
			api.push(apiRaw[j].name);
		
		var code = Tk.getFunctionParameter(array[i].func,true);
		if(!code){
			ERROR(3,'no code',array[i].func.toString);
			return;
		}
			
		for(var j = code.length -1 ; j >= 0; j--)
			if(code[j].$contains('_'))	//aka admin
				code.splice(j,1);
				
		if(code.length !== api.length)
			INFO(array[i].name,api,code)
		else
			for(var j = 0; j < code.length; j++)
				if(code[j] !== api[j])
					INFO('!= param:  ',array[i].name,code[j],api[j]);
	}
	INFO('testIdeApi done');
	
	
}

//

IntegrityTest.testDependency = function(act,main,cb){
	INFO('testDependency start\r\n');
		
	for(var i in ModuleList){
		//INFO('analysing module: ' + i);
		var str = getFile(ModuleList[i].path);
		var p = ModuleList[i].path.replace('./../client/js','client').replace('./../private','private').replace('./..','');
		
		if(p.$contains('Debug_server'))
			continue;
		
		var list = str.split('\r\n');
		var dep = null;
		for(var j = 0 ; j < list.length && j < 6; j++){
			if(list[j].indexOf('global.onRaedy') !== -1)	//aka too late
				break;
			if(list[j].indexOf('rootRequire') !== -1)	//aka too late
				break;
			if(list[j].indexOf('exports') !== -1)	//aka too late
				break;
				
			if(list[j].indexOf('var') === 0){
				dep = list[j];
				break;
			}
			
				
				
		}
		
		
		if(!dep){
			if(p.$contains('CST') || p.$contains('ERROR') || p.$contains('Tk'))
				continue;
			INFO('bad',p);
			continue;
		}
		dep = dep.replace('var ','').replace(';','');
		dep = dep.$replaceAll(' ','');
		var list = dep.split(',');
		for(var j = 0 ; j < list.length; j++){
			var mod = '(\\(|!|\\+|\\-|,|:|\\[|\\s)' + list[j] + '\\.';	//(\(|\s)Tk\.
			
			if(Tk.getOccurenceCount(str,mod) === 0)
				INFO('Unneeded dependency: ', p + ' => ' + list[j]);
		}
	}
	if(cb)
		cb()
}


IntegrityTest.getQuestCreatorQsystem = function(){
	

	var START = function(func){
		return 'public static string[] ' + func + '() { return new string[]{'
	}
	var END = function(str){
		return str.slice(0,-1) + '};}\r\n\r\n';
	}
	var add = function(i){
		return '"' + i + '",';
	}
	
	//##############
	var IconModel = rootRequire('shared','IconModel');
	var str = START('getIconList');
	for(var i in IconModel.DB)
		if(IconModel.get(i).size === 48)
			str += add(i);
	str = END(str);
	
	//##############
	str += START('getFaceList');
	for(var i in IconModel.DB)
		if(IconModel.get(i).size !== 48)
			str += add(i);
	str = END(str);
	
	
	//##############
	var AnimModel = rootRequire('shared','AnimModel');
	str += START('getAnimList');
	for(var i in AnimModel.DB)
		str += add(i);
	str = END(str);
	
	//##############
	var SpriteModel = rootRequire('shared','SpriteModel');
	str += START('getNpcSpriteList');
	var array = [];
	var vill = [];
	dance: for(var i in SpriteModel.DB){
		var s = SpriteModel.DB[i];
		if(s.isPlayerSprite || s.isBulletSprite)
			continue;
		var ban = ['block-spike','Qtutorial','number','teleport','toggle','waypoint','loot'];
		for(var j = 0 ; j < ban.length; j++)
			if(i.$contains(ban[j]))
				continue dance;
		if(i.$contains('villager'))
			vill.push(i);
		else
			array.push(i);
	}
	var fin = vill.concat(array);
	for(var i = 0 ; i < fin.length; i++)
		str += add(fin[i]);
	str = END(str);
	
	//##############
	str += START('getBulletSpriteList');
	for(var i in SpriteModel.DB){
		if(SpriteModel.DB[i].isBulletSprite)
			str += add(i);
	}
	str = END(str);
	
	//############
	str += 'public static string getSpritePath(string what) { return getSpritePath_dict[what];}\r\n' + 
		'private static Dictionary<string,string> getSpritePath_dict = new Dictionary<string,string>(){ ';
		
	for(var i in SpriteModel.DB)
		str += '{"' + i + '","' + SpriteModel.DB[i].src + '"},';
	str = str.slice(0,-1);	//remove comma
	str += '};\r\n';
	
	//##############
	var ActorModel = rootRequire('shared','ActorModel');
	str += START('getNpcModelList');
	str += add('npc');
	str += add('genericEnemy');
	var ban = ['npc','genericEnemy',	//already addded
		'teleport','toggle','tree','rock','hunt','loot'];
	dance2 : for(var i in ActorModel.DB){
		if(!i.$contains('Qsystem'))
			continue;
		for(var j = 0 ; j < ban.length; j++)
			if(i.$contains(ban[j]))
				continue dance2;
		str += add(i.replace('Qsystem-',''));
	}
	str = END(str);
	
	//##############
	var Ability = rootRequire('server','Ability');
	str += START('getAbilityList');
	for(var i in Ability.DB){
		if(Ability.DB[i].randomlyGeneratedId)
			continue;
		if(Ability.DB[i].type === 'dodge')
			continue;
		if(!i.$contains('Qsystem'))
			continue;
		if(["Qsystem-boost","Qsystem-attack","Qsystem-idle","Qsystem-summon","Qsystem-event","Qsystem-heal","Qsystem-dodge"].$contains(i))
			continue;
		str += add(i.replace('Qsystem-',''));
	}
	str = END(str);
	
	
	return str;
	
}



})(); //{






