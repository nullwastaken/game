//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN

NODEJITSU = typeof process.env.NODEJITSU !== 'undefined';

SERVER = true;
PUBLIC_VERSION = true;

//versions in VersionControl
MINIFY = NODEJITSU ? false : PUBLIC_VERSION;
PORT = 3000;
INFO = function(){ console.log.apply(console,arguments); };	//here so doesnt show in search all

if(MINIFY && process.argv[2] !== '-o' && process.argv[3] !== '-o'){
	INFO('You are attempting to connect to a local database.');
	INFO('To connect to the public online database, use: \n\tnode app.js -o');
}

require(MINIFY ? './server/min.js' : './server/private/App_private').init_app();

