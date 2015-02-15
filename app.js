//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN

NODEJITSU = typeof process.env.NODEJITSU !== 'undefined';
SERVER = true;
PUBLIC_VERSION = true;

MINIFY = NODEJITSU ? false : PUBLIC_VERSION;
GAME_VERSION = 'v1.4';
QUEST_CREATOR_VERSION = 'v1.2';
PORT = 3000;
INFO = function(){ console.log.apply(console,arguments); };	//so doesnt show in search all
require(MINIFY ? './server/min.js' : './server/private/App_private').init_app();
