//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN

PUBLIC_VERSION = false;

NODEJITSU = typeof process.env.NODEJITSU !== 'undefined';
SERVER = true;

//versions in VersionControl
MINIFY = NODEJITSU ? false : PUBLIC_VERSION;

INFO = ERROR = function(){ console.log.apply(console,arguments); };	//here so doesnt show in search all
ERROR.err = INFO;	//until overwritten

ROOT = __dirname;
USE_TINGO_DB = true;
//simulate http only: 		node app.js --http --compiled --doNotStartServer --useSignInPackStatic
//simulate websocket only:	node app.js --websocket --compiled --doNotStartServer --useSignInPackStatic

process.on('uncaughtException', function(err) {
	if(err.code == 'EADDRINUSE') {
		INFO('The server is already running. Stop the running server by closing its Command Prompt then try again.');
	} else
		ERROR.err(1,err);
	
	setTimeout(function() {
		INFO('Exiting.');
		process.exit(1);
	},100);
});

var processArgv = require('yargs')
	.alias('i','integrityTest')
	.alias('o','onlineDb')
	.alias('d','doNotStartServer')
	.alias('p','port')
	.alias('n','nodetime')
	.alias('c','compiled')
	.alias('h','http')
	.alias('w','websocket')
	.alias('s','useSignInPackStatic')
	.argv;
	
if(NODEJITSU){ //}
	processArgv.deleteDb = false;
	processArgv.onlineDb = false;
	processArgv.doNotStartServer = true;
	processArgv.integrityTest = false;
	processArgv.useSignInPackStatic = true;
}	//{
	
PORT = processArgv.port || process.env.PORT || 3000;

if(processArgv.compiled)
	INFO('COMPILED');
if(processArgv.useSignInPackStatic)
	INFO('USING STATIC SIGN IN PACK');

//process.env.GAME_RAININGCHAIN_COM
if(process.env.SERVER_TYPE === 'http'){
	processArgv.http = true;
	processArgv.websocket = false;
}	
if(process.env.SERVER_TYPE === 'websocket'){
	processArgv.http = false;
	processArgv.websocket = true;
}

if(MINIFY && !processArgv.onlineDb){
	INFO('You are attempting to connect to a local database.');
	INFO('To connect to the public online database, use: \n\tnode app.js -o');
}

global.rootRequire = function(){}	//for http doesnt crash...
global.onReady = function(){}

if(NODEJITSU || processArgv.compiled){	//online
	require('./serverCompiled/client/js/shared/CST.js');
	require('./serverCompiled/client/js/shared/Tk.js');
	require('./serverCompiled/client/js/shared/ERROR.js');
	require('./serverCompiled/private/App_private.js').init_app(processArgv);
}
else if(!MINIFY){	//local
	require('./server/client/js/shared/CST.js');
	require('./server/client/js/shared/Tk.js');
	require('./server/client/js/shared/ERROR.js');
	require('./server/private/App_private.js').init_app(processArgv);
}
else {	//public
	require('./server/client/js/shared/CST.js');
	require('./server/client/js/shared/Tk.js');
	require('./server/client/js/shared/ERROR.js');
	require('./server/App_min.js').init_min(processArgv);
}