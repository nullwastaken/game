Raining Chain
==============

Raining Chain is a HTML5 MMORPG using Javascript, Canvas, NodeJS, MongoDb and Socket.io. Play now for free at [https://rainingchain.com/](https://rainingchain.com/).

[![Raining Chain Trailer](http://i.imgur.com/Duqym7r.png)](https://youtu.be/EnwhuOsjFEY "Raining Chain Trailer")

By popular demand, I am releasing the source of the game as of version 1.5.18. The game engine is under MIT license while the game content is under GPL license.

While the version 1.5.18 of the game is public, more recent versions of the game are not. I am not offering support nor planning to maintain the public version of the game. The more recent versions of the game will NOT be released on Github. 
If you would like to contribute to the latest version of Raining Chain, check [Raining Chain Development](http://rainingchain.wikia.com/wiki/Game_Development) or come chat with us on [Discord](https://discord.gg/dKEegX4).

### Installation:
* Install NodeJS
* npm install // Install NodeJS dependencies
* node app // Starts the server
* Go to localhost:3000

### Database:
* By default, the game uses the embedded database TingoDB which requires no installation.
* To use MongoDB instead, install MongoDB and change `USE_TINGO_DB = true;` by `USE_TINGO_DB = false;` in app.js.
* The game will connect to MongoDb database at localhost:27017/test and assumes the following collections exist: clientError, sideQuest, zeldaGlitch, socialMedia, achievement, pingData, report, player, contributionHistory, socialMedia, offlineAction, main, equip, account, competition, questRating, highscore, questVar, mainQuest

### Game Engine Structure Overview (Outdated):
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/actor_zps9f43232a.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/data_zpsb1cd2886.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/playerdata_zps2b263f84.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/image_zpsc34a8eed.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/collision_zps105d39b8.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/interface_zpsdeb93b2e.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/script_zps133a627b.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/loop_zps57f295f9.png)
![alt tag](http://i1378.photobucket.com/albums/ah83/FCones1944/async_zpsb5118b74.png)
s
Check http://rainingchain.com/credit for the list of contributors.