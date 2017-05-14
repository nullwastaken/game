

"use strict";
(function(){ //}
//node app.js -d -w -p 7000
//node app.js -d -h
var SOCKET_SERVER = !NODEJITSU ? [
	//'http://game.rainingchain.com',
	//'http://localhost:7000',
] : [
	process.env.GAME_RAININGCHAIN_COM !== "false" ? 'http://game.rainingchain.com' : 'https://rainingchain1.herokuapp.com'	//case dr
];
var path = require('path');
var express = require('express');

var db;	//only for dev & online
var Account, Competition, Highscore;	//only for http
var Server;	//only for socket
var EMAIL_ACTIVE = NODEJITSU ? true : (MINIFY ? false : ((false)) );

var dbFile = USE_TINGO_DB ? './Db_tingodb' : './Db_private';

exports.init_app = function(processArgv){ //}
	if(MINIFY) INFO('Using MINIFY.\r\nTo play, open Google Chrome and go to the url "localhost:3000".');
	if(NODEJITSU && MINIFY)	return INFO('Cant use NODEJITSU and MINIFY');
	
	//Create Server
	var app = global.app || express();
	var compress = require('compression');
	
	/*app.use(function(req,res,next){
		console.log(req.url);
		next();
	});*/
	
	app.use(compress({
		filter: function (req, res) {
			if(req.url.indexOf('.tmx') !== -1)
				return true;
			return /json|text|javascript|dart|image\/svg\+xml|application\/x-font-ttf|application\/vnd\.ms-opentype|application\/vnd\.ms-fontobject/.test(res.getHeader('Content-Type'));
		}
	}));	//needed otherwise cant parse init info
	app.use(require('body-parser').urlencoded({ extended: false }));
	app.use(require('body-parser').json());
	var serv = require('http').Server(app);
	
	serv.listen(PORT);
	
	//#########################
	if(!processArgv.http && (NODEJITSU || processArgv.nodetime)) 
		require('./Nodetime').init();
	
	var start = Date.now();
	app.get('/ERROR',function(req,res){
		if(typeof ERROR !== 'undefined')
			res.send('Started ' + Math.ceil((Date.now()-start)/CST.MIN) + ' mins ago.\r\n'
			+ (new Date(Date.now()-CST.HOUR*4)).toString() + '\r\n' 
			+ ERROR.LOG
		);
		else 
			res.send('ERROR is undefined... :(');
	});
			
	//Online
	if(!MINIFY && processArgv.doNotStartServer){
		if(processArgv.http){
			INFO("Initializing HTTP server...");
			INFO("Send info to connect to the database.");
			initHttpApp(app);
						
			require('./InitDb').setInitDbHttp(app,SOCKET_SERVER,function(initInfo){
				var dbFull = require(dbFile).initDb(initInfo);
				db = dbFull.require(['account','competition','highscore','zeldaGlitch']);
				
				Account = require('./Account').Account;
				Highscore = require('./../Highscore').Highscore;
				Competition = require('./../Competition').Competition;
				INFO("HTTP server ready.");
				initInfo = null;
			});
			app.use(send404);
		} else if(processArgv.websocket){
			INFO("Initializing Websocket server...");
			INFO("Waiting for database info from HTTP Server.");
			var io = initWebsocket(serv);
						
			require('./InitDb').setInitDbWebsocket(app,function(initInfo){
				var dbFull = require(dbFile).initDb(initInfo);
				var email = require('./Email').init({
					emailPassword:initInfo.emailPassword
				},dbFull.require('account'),EMAIL_ACTIVE);
							
				require('./Reddit').init(initInfo.redditPassword);
				Server = require('./ModuleManager').init_ModuleManager(dbFull,io,email,app,processArgv);
				initInfo = null;
			});
			handleSIGKILL();
		} else {
			//ERROR(2,"Server must be either HTTP or Websocket.");
			//section when online and only 1 server:
			INFO("Send info to connect to the database.");
			initHttpApp(app);
			require('./InitDb').setInitDbHttp(app,SOCKET_SERVER,function(initInfo){
				var dbFull = require(dbFile).initDb(initInfo);
				db = dbFull.require(['account','competition','highscore','zeldaGlitch']);
				
				var io = initWebsocket(serv);
				var email = require('./Email').init({
					emailPassword:initInfo.emailPassword
				},dbFull.require('account'),EMAIL_ACTIVE);
			
				require('./Reddit').init(initInfo.redditPassword);
				Server = require('./ModuleManager').init_ModuleManager(dbFull,io,email,app,processArgv);
				
				Account = require('./Account').Account;
				Highscore = require('./../Highscore').Highscore;
				Competition = require('./../Competition').Competition;
				initInfo = null;
			});
			handleSIGKILL();
			app.use(send404);
		}
	}
	
	//Development
	if(!MINIFY && !processArgv.doNotStartServer){ 
		INFO("Initializing server...");
		initHttpApp(app);
		var io = initWebsocket(serv);
		
		var dbFull = require(dbFile).initDb({	
			databaseURI:null,
			onlineDb:processArgv.onlineDb,	
			deleteDb:processArgv.deleteDb,
		});
		db = dbFull.require(['account','competition','highscore','zeldaGlitch']);
			
		var email = require('./Email').init({	
			emailPassword:null,
		},dbFull.require('account'),EMAIL_ACTIVE);
		Server = require('./ModuleManager').init_ModuleManager(dbFull,io,email,app,processArgv);
		
		Account = require('./Account').Account;
		Highscore = require('./../Highscore').Highscore;
		Competition = require('./../Competition').Competition;
	}
	
	//Public
	if(MINIFY){
		INFO("Initializing server...");
		initHttpApp(app);
		var io = initWebsocket(serv);
		
		var dbFull = exports.initDb({	
			databaseURI:null,
			deleteDb:false,
			onlineDb:processArgv.onlineDb,
		});
		Server = exports.init_ModuleManager(dbFull,io,fakeEmail(),app,processArgv);
	}
}; //{


var fakeEmail = function(){
	return {
		send:function(){},
		sendCrashReport:function(){},
	};
}

//################

var handleSIGKILL = function(){
	process.on('SIGTERM', function(code) {
		if(Server)
			Server.shutdown(0);
	});
}
var send404 = function(req, res) {
	res.status(404)
	res.render('404', {
		location:'error',
	});
}

var initHttpApp = function(app){
	var client_route = path.resolve(__dirname, MINIFY ? 'client' : '../client');
	var quest_route = path.resolve(__dirname, MINIFY ? 'quest' : '../quest');
	
	app.get('/quest/*.png', function(req, res, next) {
		req.url = req.url.replace('/quest','');
		next();
	}, express.static(quest_route));
	
	
	app.get('/quest/*.tmx', function(req, res, next) {
		req.url = req.url.replace('/quest','');
		next();
	}, express.static(quest_route));
	
	
	app.use(express.static(client_route));
		
	app.engine('.html', require('ejs').__express);
	app.set('views', path.resolve(client_route,'views'));
	app.set('view engine', 'html');
			
	app.get('/', function(req, res){
		if(!db)
			res.render('index', {
				location:'index',
				playerCount:0,
				competition:{},
				highscore:{},
			});
		else
			res.render('index', {
				location:'index',
				playerCount:Account.getPlayerCount(db),
				competition:Competition.getHomePageContent(db),
				highscore:Highscore.getHomePageContent(db),
			});
	});
	
	app.get('/game',function(req,res){
		var type = req.query.s;
		
		res.render('game', {
			location:'game',
			noAnalytic:!NODEJITSU,
			noInfo:!type,							//true if none
			signUp:type === 'up' ? '' : 'hidden',	//visible if up
			signIn:type !== 'up' ? '' : 'hidden',	//visible otherwise
			SOCKET_URL:SOCKET_SERVER[0] || '',
		});
	});	
	if(!MINIFY)
		initHttpApp.extra(app,function(){
			return db;
		});
}

initHttpApp.extra = function(app,getZeldaDcFunc){	//optional
	if(global.app)
		return;
		
	app.use(function(req,res,next){	//www. redirect
		var host = req.get('host');
		if(/^www\./.test(host)){
            host = host.substring(4, host.length);	//remove www.
            res.writeHead(301, {
				Location:req.protocol + '://' + host + req.originalUrl,
                Expires: new Date().toGMTString()
			});
            res.end();
        } else {
            next();
        }
    });
	
	var busy = require('busy'); var busyCheck = busy();
	app.use(function(req, res, next) { 
		if(busyCheck.blocked) 
			res.status(503).send("I'm busy right now, sorry."); 
		else
			next();
	});
		
	//404
	app.use(function(err, req, res, next){ 
		if (err.status === 404){ res.statusCode = 404; res.send('Cant find that file, sorry!'); } 
		else next(err);
	});

	var VersionControl = require('./VersionControl').init(app);
		
	app.get('/credit',function(req,res){
		res.render('credit', {
			location:'credit',
		});
	});
	
	app.get('/contribution',function(req,res){
		res.render('contribution', {
			location:'contribution',
		});
	});
	app.get('/QuestCreator',function(req,res){
		res.render('QuestCreator/index', {	
			location:'QuestCreator',
			urlPackage:VersionControl.urlPackage,
		});
	});	
	app.get('/QuestCreator/localdb',function(req,res){
		res.render('QuestCreator/localdb', {	
			location:'QuestCreator',
		});
	});	
	app.get('/QuestCreator/map',function(req,res){
		res.render('QuestCreator/map', {	
			location:'QuestCreator',
		});
	});	
	app.get('/QuestCreator/submit',function(req,res){
		res.render('QuestCreator/submit', {	
			location:'QuestCreator',
		});
	});	
	app.get('/QuestCreator/feedback',function(req,res){
		res.render('QuestCreator/feedback', {
			location:'QuestCreator',
		});
	});
	app.get('/SpritePreview',function(req,res){
		res.render('QuestCreator/SpritePreview', {
			location:'QuestCreator',
		});
	});
	app.get('/AnimPreview',function(req,res){
		res.render('QuestCreator/AnimPreview', {
			location:'QuestCreator',
		});
	});
	app.get('/QuestCreator/tutorial',function(req,res){
		res.render('QuestCreator/tutorial', {
			location:'QuestCreator',
		});
	});
	app.get('/QuestCreator/API',function(req,res){
		res.render('QuestCreator/API', {
			location:'QuestCreator',
		});
	});
	app.get('/patchNotes',function(req,res){
		res.render('patchNotes', {
			location:'patchNotes',
		});
	});	
	var SUPPORTED_WIKI = ['ability','equip','exp','lore','map','material','monster','stat'];
	app.get('/wiki/:page',function(req,res){
		var page = req.params.page;
		if(!SUPPORTED_WIKI.$contains(page))
			return send404(req,res);
		res.render('wiki/' + page, {
			location:'wiki',
			page:page,
		});
	});
	
	/* HTTP TUTORIAL
	GET => 	when client type that in url, response is showed as file.
			$.ajax => client ask for data and response is eval
	POST => $.ajax => client ask for data and response is used in function

	in ajax,	data:{bob:1} is accessible via req.body.bob
	
	in url, 	?bob=1 is accessible via req.query
	*/
	
}


//################
var initWebsocket = function(serv){
	var io = require('socket.io')(serv,{});
	
	io.sockets.on('connection', function (socket){
		socket.on(CST.SOCKET.signIn, function (d) { 
			if(!Server || !Server.isReady())
				return socket.emit(CST.SOCKET.signInAnswer,{	//not Socket.emit cuz might not work and not accesable
					success:false,
					message:CST.SERVER_DOWN,
				});
		});
	});
	return io;
}



})(); //{
