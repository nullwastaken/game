//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN

NODEJITSU = typeof process.env.NODEJITSU !== 'undefined';

SERVER = true;
PUBLIC_VERSION = true;

//versions in VersionControl
MINIFY = NODEJITSU ? false : PUBLIC_VERSION;
PORT = 3000;
INFO = function(){ console.log.apply(console,arguments); };	//here so doesnt show in search all
require(MINIFY ? './server/min.js' : './server/private/App_private').init_app();
