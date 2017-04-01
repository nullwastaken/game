
"use strict";
(function(){ //}
var Dialog, Socket, Dialog, Game;
global.onReady(function(){
	Dialog = rootRequire('client','Dialog',true); Socket = rootRequire('private','Socket',true); Dialog = rootRequire('client','Dialog',true); Game = rootRequire('client','Game',true);
	Sign.init();	//requires Socket
});
var Sign = exports.Sign = {};

var DOWN_MSG = 'The server or your browser seems to have some difficulties...<br> Restart browser and try again. If still doesn\'t work, try later.';
var LAST_CLICK_TIME = -1;
var LAST_CLICK_TIME_RANDOM = -1;
var DOWN_TIMEOUT = null;
var SERVER_RESPONDED = false;
var LOG = [];
var EMAIL_REQUIRED = false;
var GEO_REQUIRED = false;
var RANDOM_USER = '';
var RANDOM_PASS = '';
var ALLOW_SAFARI = true;
var LOADING_HTML = $('<span>').css({color:'green'});

Sign.init = function(onSignIn){
	if(localStorage.getItem('username'))
		$("#lg-signInUsername").val(localStorage.getItem('username'));
	
	if(localStorage.getItem('password'))	//case random generated
		$("#lg-signInPassword").val(localStorage.getItem('password'));
	
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
	
	$('#lg-playNow').mousedown(function(e){	
		e.preventDefault();
		Sign.up.quick();
		return false;
	});
	
	Sign.init.socket();
}

Sign.onGameStart = Tk.newPubSub();

Sign.init.socket = function(){
	Socket.on(CST.SOCKET.signInAnswer, function (res) {
		SERVER_RESPONDED = true;
		if(res.message === CST.SERVER_DOWN)
			$('#serverIsDown').show();		
		else if(res.message) 
			Sign.log(res.message);
		if(res.data){
			Sign.log(LOADING_HTML);
			Sign.postLoadingProgress(0);
			Sign.onGameStart.pub(res.data);
		}
	});

	Socket.on(CST.SOCKET.signUpAnswer, function (data) {
		SERVER_RESPONDED = true;
		Sign.log(data.message);
		if(data.success === true){
			setTimeout(function(){
				var user = RANDOM_USER || $("#lg-signUpUsername").val();
				var pass = RANDOM_PASS || $("#lg-signUpPassword").val();
				$("#lg-signInUsername").val(user);
				$("#lg-signInPassword").val(pass);
				Sign.in();
			},1000);
		}
	});

	Socket.on(CST.SOCKET.signOffAnswer,function (d){
		Game.stop(d);
	});
	
	
	
	//check Server.onSignIn
	Socket.on(CST.SOCKET.toEval,function(d){
		eval(d.toEval);
	});
}

//#######

Sign.in = function(){
	var user = $("#lg-signInUsername").val();
	if(!user) return Sign.log('You need to enter a username.');
	
	var pass = $("#lg-signInPassword").val();
	if(!pass) 
		return Sign.log('You need to enter a password.');
	if(!Sign.onclick()) 
		return;
	
	Sign.log('Info sent.');
	
	var data = {username: user,password: pass };
	Socket.emit(CST.SOCKET.signIn, data);
}

Sign.updateServerDown = function(){
	Sign.log(DOWN_MSG,true);
}

Sign.onclick = function(){
	if(Date.now() - LAST_CLICK_TIME < 200) 
		return Sign.log("Don't click too fast!");
	
	if(Game.isLoading()) 
		return Sign.log("Loading images...");
	
	
	if(!ALLOW_SAFARI && Game.isOnRainingChainCom() && Tk.getBrowserVersion().$contains('Safari'))
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
	if(EMAIL_REQUIRED && Game.isOnRainingChainCom() && !escape.email(email)) 
		return Sign.log('Invalid Email.<br> Keep in mind that it\'s your own way to recover your account.');
	
	var geoLocation = $("#lg-signUpGeoLocation").val();
	if(GEO_REQUIRED && Game.isOnRainingChainCom() && !geoLocation) 
		return Sign.log('Please select a Location.');
	
	if(!Sign.onclick()) 
		return;
	Sign.log('Info sent.');
	
	var data = {
		username: user,
		password: pass,
		email:email,
		geoLocation:geoLocation,
		randomlyGenerated:false,
	};
	Socket.emit(CST.SOCKET.signUp,data);
}

Sign.up.quick = function(){
	var user = Sign.generateRandomUsername();
	var pass = Sign.generateRandomPassword();
	var data = {
		username: user,
		password: pass,
		email:'',
		geoLocation:'',
		randomlyGenerated:true,
	};
	if(!Sign.onclick()) 
		return;
	
	if(Date.now() - LAST_CLICK_TIME_RANDOM < 5000) 
		return Sign.log("Wait 5 seconds before trying again.");
	LAST_CLICK_TIME_RANDOM = Date.now();
	
	RANDOM_USER = user;
	RANDOM_PASS = pass;
	
	Sign.log('Info sent.');
	Socket.emit(CST.SOCKET.signUp,data);
}

Sign.log = function(text){
	var div = $('<div>')
		.html(text);
	$("#lg-message").prepend(div);
	
	LOG.push(div);
	if(LOG.length > 5){
		LOG[0].remove();
		LOG.shift();
	}
	
}

Sign.postLoadingProgress = function(pct){
	LOADING_HTML.html('Loading game... ' + Math.floor(pct*100) + '/100%');
}

Sign.generateRandomUsername = function(){
	var voyel = 'aeiouy';
	var cons = 'bcdfghjklmnprstvwxz';	//q
	var user = '';
	var c = function(){ return cons[Math.floor(cons.length*Math.random())]; };
	var v = function(){ return voyel[Math.floor(voyel.length*Math.random())]; };
	var n = function(){ return Math.floor(Math.random()*10); }
	user += c().$capitalize();
	user += v() + c() + v() + c() + v() + c() + v() + c() + n() + n();
	return user;
}

Sign.generateRandomPassword = function(){
	return (Math.randomId() + Math.randomId()).$replaceAll('-','').$replaceAll('_','');
}

})(); //{
