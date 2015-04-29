//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Dialog = require4('Dialog'), Socket = require4('Socket'), Dialog = require4('Dialog'), Game = require4('Game'), Account = require4('Account');

var Sign = exports.Sign = {};

var DOWN_MSG = 'The server or your browser seems to have some difficulties...<br> Restart browser and try again. If still doesn\'t work, try later.';
var LAST_CLICK_TIME = -1;
var DOWN_TIMEOUT = null;
var SERVER_RESPONDED = false;

var QUEST_DATA = {"Qsystem":{"name":"Default Name","description":"A super awesome quest!","author":"rc","id":"Qsystem"},"QfirstTown":{"name":"","description":"A super awesome quest!","author":"rc","id":"QfirstTown"},"Qtutorial":{"name":"GPS Tutorial","description":"Teaches you the basic of Raining Chain.","author":"rc","id":"Qtutorial"},"Qdebug":{"name":"Debug","description":"A super awesome quest!","author":"Admin","id":"Qdebug"},"Qhighscore":{"name":"Global Highscore","description":"A super awesome quest!","author":"rc","id":"Qhighscore"},"Qbtt000":{"name":"Break Targets","description":"Find the fastest way to break 10 targets.","author":"rc","id":"Qbtt000"},"QlureKill":{"name":"Lure & Kill","description":"Kill monsters by luring them on the red mat.","author":"rc","id":"QlureKill"},"QprotectFirstTown":{"name":"Protect Town","description":"Protect villagers from waves of monsters.","author":"rc","id":"QprotectFirstTown"},"QtowerDefence":{"name":"Tower Defence","description":"Place towers to kill waves of enemies trying to reach the bottom of the screen.","author":"rc","id":"QtowerDefence"},"QbulletHeaven":{"name":"Bullet Heaven","description":"Survive as long as you can in a cave filled with deadly towers.","author":"rc","id":"QbulletHeaven"},"QpuzzleBridge":{"name":"Puzzle & Bridge","description":"Puzzle where you need to move blocks to form a bridge.","author":"rc","id":"QpuzzleBridge"},"Qdarkness":{"name":"Darkness","description":"Retrieve a precious object lost in a mysterious cave haunted by ghosts.","author":"rc","id":"Qdarkness"},"QbaseDefence":{"name":"Defend The Base","description":"Kill waves of monsters before they reach your base using the right ability.","author":"rc","id":"QbaseDefence"},"Qminesweeper":{"name":"Minesweeper","description":"Play the puzzle game minesweeper.","author":"rc","id":"Qminesweeper"},"Qfifteen":{"name":"15-Puzzle","description":"Place 15 blocks in the right order by pushing them.","author":"rc","id":"Qfifteen"},"Qrgb":{"name":"RGB","description":"You must restore the RBG setting by activating 2 switches guarded by enemies.","author":"rc","id":"Qrgb"},"QkillTheDragon":{"name":"Kill The Dragon","description":"","author":"rc","id":"QkillTheDragon"},"QaggressiveNpc":{"name":"Bipolarity","description":"Activating a switch can have weird effects on villagers.","author":"rc","id":"QaggressiveNpc"},"QcollectFight":{"name":"Collect & Fight","description":"In a parallel universe, you're a pumpking harvesting resources to become stronger in preparation for an epic battle.","author":"rc","id":"QcollectFight"},"QduelLeague":{"name":"Duel League","description":"Kill enemies in your zone to send enemies in your rivals' zone until they die.","author":"rc","id":"QduelLeague"},"QkingOfTheHill":{"name":"King of the Hill","description":"Stay on the hill as long as possible while killing rivals.","author":"rc","id":"QkingOfTheHill"},"QcatchThemAll":{"name":"Catch Them All","description":"Catch monsters by first weakening them. When the time runs out, use them to kill the boss.","author":"rc","id":"QcatchThemAll"},"Qsoccer":{"name":"Soccer","description":"Play soccer against your friends! Push the ball in the goal to score. First to 5 points win.","author":"rc","id":"Qsoccer"},"QpuzzleSwitch":{"name":"Puzzle & Switch","description":"Activate switches and push blocks to complete 5 puzzles.","author":"rc","id":"QpuzzleSwitch"}};
/*get QUEST_DATA: 
var tmp = {};
for(var i in exports.QueryDb.DB.quest.data){
	var q = exports.QueryDb.DB.quest.data[i];
	tmp[i] = {name:q.name,description:q.description,author:q.author,id:q.id};
}*/

Sign.init = function(){
	if(Game.isIndex()){
		Sign.init.questOverview($('#questOverview'));
		return;
	}
	if(localStorage.getItem('username')){
		$("#lg-signInUsername").val(localStorage.getItem('username'));
	}
	$('#lg-signInForm').submit(function(e){
		e.preventDefault();
		Sign.in();
		return false;
	});
	$('#lg-signUpForm').submit(function(e){
		e.preventDefault();
		Sign.up();
		return false;
	});
	if(window.location.href.$contains('signUp'))
		$('#lg-signInForm').hide();
	else
		$('#lg-signUpForm').hide();
	
	Socket.init();
	Account.init();
	Sign.init.socket();
}




/*
	signInDiv.append($('<button>')
		.html('Lost Password')
		.css({fontSize:'0.8em'})
		.click(function(e){
			e.preventDefault();
			Socket.init();
			Account.init();
			Dialog.open('account',false);
			return false;
		})
	);
}
*/

Sign.init.socket = function(){
	Socket.on('signIn', function (data) {
		SERVER_RESPONDED = true;
		if(data.message) Sign.log(data.message);
		if(data.data){
			Game.init(data.data);
		}
	});

	Socket.on('signUp', function (data) {
		SERVER_RESPONDED = true;
		Sign.log(data.message);
		if(data.success === true){
			setTimeout(function(){
				$("#lg-signInUsername").val($("#lg-signUpUsername").val());
				$("#lg-signInPassword").val($("#lg-signUpPassword").val());
				Sign.in();
			},1000);
		}
	});

	Socket.on('signOff', function (d){
		Game.setActive(false);
		Dialog.open('disconnect',d);
	});
	
	Socket.on('toEval',function(d){
		eval(d.toEval);
	});
}


Sign.init.questOverview = function(full){
	var list = [
		'QlureKill',
		'QtowerDefence',
		'QcollectFight',
		'Qsoccer',
		'QpuzzleSwitch',
		'QbulletHeaven',
		'QprotectFirstTown',
		'QaggressiveNpc',
		'Qbtt000',
		'QpuzzleBridge',
		'QkingOfTheHill',
		'Qdarkness',
		'Qminesweeper',
		'Qrgb',
		'QduelLeague',
		'QbaseDefence',
		'QcatchThemAll',
		'Qfifteen',
	];
	
	for(var i = 0 ; i < list.length; i++){
		var id = list[i];
		var div = $('<div class="col-xs-4">');
		var a = $('<a class="thumbnail">');
		var img = $('<img src="../quest/' + id + '/' + id + '-small.png" class="img-responsive">');
		img.attr('title',id);
		full.append(div.append(a.append(img)));
		
		var popup = Dialog.questThumbnail(0.5);
		Dialog.questThumbnail.refresh(popup,id,{
			author:QUEST_DATA[id].author,
			name:QUEST_DATA[id].name,
			description:QUEST_DATA[id].description,
			thumbnail:'../quest/' + id + '/' + id + '.png'
		})();
		
		img.tooltip({
			content:popup.html()
		});
	}
}


//#######

Sign.in = function(){
	var user = $("#lg-signInUsername").val();
	if(!user) return Sign.log('You need to enter a username.');
	
	var pass = $("#lg-signInPassword").val();
	if(!pass) return Sign.log('You need to enter a password.');
	if(!Sign.onclick()) return;
	
	Sign.log('Info sent.');
	
	var data = {username: user,password: pass };
	Socket.emit('signIn', data);
}

Sign.updateServerDown = function(){
	Sign.log(DOWN_MSG,true);
}

Sign.onclick = function(){
	if(Date.now() - LAST_CLICK_TIME < 200) return Sign.log("Don't click too fast!");
	
	if(Game.isLoading()) 
		return Sign.log("Loading images...");
	
	if(Tk.getBrowserVersion().$contains('Safari'))
		return Sign.log("Safari supports canvas-based games very poorly.<br> Use Google Chrome, Firefox, Opera or IE instead.<br>"+
			//"You are currently using " + Tk.getBrowserVersion() + '.<br>' +
			'You can download Google Chrome at <br><a target="_blank" href="http://www.google.com/chrome/">www.google.com/chrome/</a>');
	
	
	LAST_CLICK_TIME = Date.now();
	
	clearTimeout(DOWN_TIMEOUT);
	DOWN_TIMEOUT = setTimeout(function(){
		if(!SERVER_RESPONDED)
			Sign.updateServerDown();
		SERVER_RESPONDED = false;
	},15*1000);
	
	return true;
}

Sign.up = function (){
	var user = $("#lg-signUpUsername").val();
	if(!user) return Sign.log('You need to enter a username.');
	
	var pass = $("#lg-signUpPassword").val();
	if(!pass) return Sign.log('You need to enter a password.');
	
	var confirm = $("#lg-signUpPasswordConfirm").val();
	if(pass !== confirm) return Sign.log('Passwords do not match.');
	
	var email = $("#lg-signUpEmail").val();
	if(Game.isOnRainingChainCom() && !escape.email(email)) 
		return Sign.log('Invalid Email.<br> Keep in mind that it\'s your own way to recover your account.');
	
	var geoLocation = $("#lg-signUpGeoLocation").val();
	if(Game.isOnRainingChainCom() && !geoLocation) 
		return Sign.log('Please select a Location.');
	
	if(!Sign.onclick()) return;
	Sign.log('Info sent.');
	
	var data = {
		username: user,
		password: pass,
		email:email,
		geoLocation:geoLocation,
	};
	Socket.emit('signUp',data);
}

Sign.goGame = function(){
	window.location = '/game';
}

Sign.log = function(text){
	var span = $('<span>')
		.html(text + '<br>');
	$("#lg-message").prepend(span);
	
	Sign.log.array.push(span);
	if(Sign.log.array.length > 5){
		Sign.log.array[0].remove();
		Sign.log.array.shift();
	}
	
}
Sign.log.array = [];


})(); //{
