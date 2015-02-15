//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
var ts;
var myEval = function(){	//prevent memory scope
	eval.apply(this,arguments);
}
"use strict";
(function(){ //}
var Dialog = require4('Dialog'), Socket = require4('Socket'), Game = require4('Game'), Account = require4('Account');

var Sign = exports.Sign = {};

var DOWN_MSG = 'The server or your browser seems to have some difficulties...<br> Restart browser and try again. If still doesn\'t work, try later.';
var LAST_CLICK_TIME = -1;
var DOWN_TIMEOUT = null;
var SERVER_RESPONDED = false;
var HIDE_SOCIALMEDIA = true;

Sign.init = function(){
	var startDiv = $('#startDiv');
	var signInUp = $('#startDiv-sign');
	
	var signIn = Sign.init.html(signInUp);
	signIn.addClass("lg-container");
	
	if(localStorage.getItem('username') && !sessionStorage.getItem('signUpDetail')){
		$("#lg-signInUsername").val(localStorage.getItem('username'));
		Sign.display('in');
	}
	
	if(!Game.isIndex()){
		$('#startDiv-about').hide();
		Socket.init();
		Account.init();
		Sign.init.socket();
		
		var detail = sessionStorage.getItem('signInDetail');
		if(detail){
			sessionStorage.setItem('signInDetail','');
			detail = JSON.parse(detail);
			$("#lg-signInPassword").val(detail.password);
			$("#lg-signInUsername").val(detail.username);
			Sign.in();
			return;
		}
		
		var detail = sessionStorage.getItem('signUpDetail');
		if(detail){
			sessionStorage.setItem('signUpDetail','');
			detail = JSON.parse(detail);
			$("#lg-signUpUsername").val(detail.username);
			$("#lg-signUpPassword").val(detail.password);
			$("#lg-signUpPasswordConfirm").val(detail.password);
			$("#lg-signUpEmail").val(detail.email);
			$("#lg-signUpGeoLocation").val(detail.geoLocation);
			$("#lg-signUpReferral").val(detail.referral);
			$("#lg-signUpYoutube").val(detail.youtube);
			$("#lg-signUpReddit").val(detail.reddit);
			$("#lg-signUpTwitch").val(detail.twitch);
			$("#lg-signUpTwitter").val(detail.twitter);
			Sign.up();
			return;
		}	
		return;		
	}	
	
	//#####################
	var high = Sign.init.html.highscore();
	var comp = Sign.init.html.competition();
	
	var highcomp = $('#startDiv-highscore')
		.addClass("lg-container")
		.css({font: '20px Kelly Slab',textAlign:'center'})
		.append(
			high.addClass('inline'),
			comp.addClass('inline')
		)
	
	
	/* done manually for seo
	var about = Sign.init.html.about();
	about.addClass("lg-container")
	startDiv.append(about);
	*/
	
	
	
}

Sign.init.html = function(full){
	var containerDiv =  $('<div>')
		.css({width:'auto',height:'auto',textAlign:'center',font:'20px Kelly Slab'});
	full.append(containerDiv);
	
	containerDiv.append('<h1>Raining Chain<span style="font-size:25px"> Beta</h1>');
	containerDiv.append('<br>');
	
	var signUpBtn = $('<button>')
		.attr({title:"Create A New Account",id:'lg-signUpBtn'})
		.html('Sign Up')
		.css({textDecoration:'underline'})
		.click(function(){
			Sign.display('up');
		})
	containerDiv.append(signUpBtn);
	
	var signInBtn = $('<button>')
		.attr({title:"Log In An Existing Account",id:'lg-signInBtn'})
		.html('Sign In')
		.css({textDecoration:'none'})
		.click(function(){
			Sign.display('in');
		})
	containerDiv.append(signInBtn);
	containerDiv.append('<br>');
	
	var signUpDiv = $('<form>')
		.attr('id','lg-signUpDiv')
		.addClass("lg-form")
		.submit(function(e) {
			e.preventDefault();
			return false;
		});

	signUpDiv.append('<br>');
	
	
	var array = [
		[
			'Username:',
			$('<input>').attr({id:"lg-signUpUsername",placeholder:"username",type:'text'})
		],
		[
			'Password:',
			$('<input>').attr({id:"lg-signUpPassword",placeholder:"password",type:'password'})
		],
		[
			'Confirm:',
			$('<input>').attr({id:"lg-signUpPasswordConfirm",placeholder:"confirm password",type:'password'})
		],
		[
			'Email:',
			$('<input>').attr({id:"lg-signUpEmail",placeholder:"recovery email",type:'text'})
		],
		[
			$('<span>')
				.html('Location:'),
				//.attr('title',"Only used for latency statistics. You still play be able to play with anyone.")
				
			$('<select>')
				.attr({id:"lg-signUpGeoLocation"})
				.attr('title',"Only used for latency statistics. You still play be able to play with anyone.")
				.append('<option value="EastCoast">East Coast</option>')
				.append('<option value="WestCoast">West Coast</option>')
				.append('<option value="SouthAmerica">South America</option>')
				.append('<option value="Europe">Europe</option>')
				.append('<option value="Asia">Asia</option>')
				.append('<option value="Africa">Africa</option>')
				.append('<option value="Australia">Australia</option>')
		],
		[
			$('<span>')
				.attr('title',"If you have been referred by a friend, enter his username here.")
				.html('Referral:'),
			$('<input>').attr({id:"lg-signUpReferral",placeholder:"friend username *optional*",type:'text'})
		]	
	];
	signUpDiv.append(Tk.arrayToTable(array).addClass('center'));
	signUpDiv.append('<br>');
	//#############
	
	var socialMedia = $('<div>');
	signUpDiv.append(socialMedia);
	
	socialMedia.append('<h3 class="u">Social Media: Optional</h3>');
	socialMedia.append($('<div>')
		.html('Posting about Raining Chain on these accounts will automatically grant you Contribution Points used for cosmetic rewards.')
	);
	socialMedia.append('<br>');
	var array = [
		[
			'Youtube:',
			$('<input>').attr({id:"lg-signUpYoutube",placeholder:"ex: IdkWhatsRc *optional*",type:'text'})
		],
		[
			'Twitch:',
			$('<input>').attr({id:"lg-signUpTwitch",placeholder:"*optional*",type:'text'})
		],
		[
			'Reddit:',
			$('<input>').attr({id:"lg-signUpReddit",placeholder:"*optional*",type:'text'})
		],
		[
			'Twitter:',
			$('<input>').attr({id:"lg-signUpTwitter",placeholder:"*optional*",type:'text'})
		]
	];
	socialMedia.append(Tk.arrayToTable(array).addClass('center'));
	socialMedia.append('<br>');	
	if(HIDE_SOCIALMEDIA)
		socialMedia.hide();
	
	signUpDiv.append($('<button>')
		.html('Create Account And Play')
		.click(function(){
			Sign.up();
		})
	);
	containerDiv.append(signUpDiv);
	//###############################
	
	var signInDiv = $('<form>')
		.attr('id','lg-signInDiv')
		.addClass("lg-form")
		.hide()
		.submit(function(e) {
			e.preventDefault();
			Sign.in();	
			Sign.display('in');
			return false;
		});
		
	signInDiv.append('<br>');
	var array = [
		[
			'Username:',
			$('<input>').attr({id:"lg-signInUsername",placeholder:"username",type:'text'})
		],
		[
			'Password:',
			$('<input>').attr({id:"lg-signInPassword",placeholder:"password",type:'password'})
		],
	];
	signInDiv.append(Tk.arrayToTable(array).addClass('center'));
	signInDiv.append('<br>');
	
	signInDiv.append($('<button>')
		.html('Enter the Game')
		.click(function(e){
			e.preventDefault();
			Sign.in();
			return false;
		})
	);
	signInDiv.append('<br>');
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
	
	signInDiv.append('<br>');
	
	containerDiv.append(signInDiv);
	containerDiv.append($('<div>')
		.attr({id:"lg-message"})
	);
	return full;
}

Sign.init.html.about = function(){
	var full = $('<div>')
		.css({font: '20px Kelly Slab',textAlign:'center'});
	$('#startDiv').append(full);
	full.append($('<h2>')
		.html('What is Raining Chain?') 
	);
	
	full.append('Raining Chain is a F2P <a style="color:blue" href="https://github.com/RainingChain/rainingchain">open-source</a> MMORPG.<br><br>');
	
	full.append('Latest gameplay video:<br>')
	full.append($('<object>')
		.attr({width:450,height:300,data:"https://www.youtube.com/embed/Xnjb2ZshyHM"})
	);
	full.append('<br><br>Run the game on your own computer and <br>'
		+ 'contribute to the project with the <a style="color:blue" href="http://www.rainingchain.com/contribution/">Quest Creator</a>:<br>')
	full.append($('<object>')
		.attr({width:450,height:300,data:"http://www.youtube.com/embed/CCAjNcfS5OI"})
	);
	return full;
}	

Sign.init.html.competition = function(){
	var full = $('<div>');
	full.hide();
	
	$.ajax({
		url: '/competitionHomePage',
		data: '',
		type: 'POST',
		success: function(data) {
			full.append(
				$('<u>')
					.html('Competition<br>')
					.css({fontSize:'1.5em'})
					.attr('title','Ends on ' + (new Date(data.competition.endTime)).toDateString()),
				$('<span>')
					.html(data.competition.quest + "<br>")
					.css({fontSize:'1.2em'})
					.attr('title',data.competition.name + ": " + data.competition.description)
			);
			var array = [['Rank','Name','Score']];
			
			for(var i = 0 ; i < data.competition.rank.length && i < 5; i++){
				var info = data.competition.rank[i];
				//full.append('Rank ' + (i+1) + ': ' + info.username + ' (' + info.score + ')<br>');
				array.push([i+1,info.username,info.score]);
			}
			full.append(Tk.arrayToTable(array,true,false,true).css({marginLeft: 'auto', marginRight:'auto'}));
			
			full.show();
		}
	});
	
	return full;
}

Sign.init.html.highscore = function(){
	var full = $('<div>');
	full.append(
		$('<u>')
		.html('Highscore<br>')
		.css({fontSize:'1.5em'}),
		$('<span>')
		.html('Most Quests Complete<br>')
		.css({fontSize:'1.2em'})
	);
	full.hide();
	
	$.ajax({
		url: '/highscoreHomePage',
		data: '',
		type: 'POST',
		success: function(data) {
			var array = [['Rank','Name','Quest']];
			for(var i = 0 ; i < data.highscore.length; i++){
				//full.append('Rank ' + data.highscore[i].rank + ': ' + data.highscore[i].username + ' (' + data.highscore[i].value + ' Quests)<br>');
				array.push([data.highscore[i].rank,data.highscore[i].username,data.highscore[i].value]);
			}
			full.append(Tk.arrayToTable(array,true,false,true).css({marginLeft: 'auto', marginRight:'auto'}));
			
			full.show();
		}
	});
	
	return full;
}	


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
				Sign.display('in');
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
		myEval(d.toEval);
	});
}




Sign.display = function(num){
	if(num === 'in'){
		$('#lg-signInDiv').show();
		$('#lg-signUpDiv').hide();
		$('#lg-signInBtn').css({textDecoration:'underline'});
		$('#lg-signUpBtn').css({textDecoration:'none'});
	} else {
		$('#lg-signInDiv').hide();
		$('#lg-signUpDiv').show();
		$('#lg-signInBtn').css({textDecoration:'none'});
		$('#lg-signUpBtn').css({textDecoration:'underline'});
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
	if(Game.isIndex()){
		sessionStorage.setItem('signInDetail',JSON.stringify(data)); //check Sign.init
		Sign.goGame();
	} else
		Socket.emit('signIn', data);	
}

Sign.updateServerDown = function(){
	$('#lg-signInDiv').find('button').hide();
	$('#lg-signUpDiv').find('button').hide();
	
	Sign.log(DOWN_MSG,true);
}

Sign.onclick = function(){
	if(Date.now() - LAST_CLICK_TIME < 200) return Sign.log("Don't click too fast!");
	
	if(Game.isLoading()) return Sign.log("Loading images...");
	
	if(Tk.getBrowserVersion().$contains('Safari'))
		return Sign.log("Safari supports canvas-based games very poorly.<br> Use Google Chrome, Firefox, Opera or IE instead.<br>"+
			//"You are currently using " + Tk.getBrowserVersion() + '.<br>' +
			'You can download Google Chrome at <br><a target="_blank" href="https://www.google.com/chrome/">www.google.com/chrome/</a>');
	
	
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
	
	if(!Sign.onclick()) return;
	Sign.log('Info sent.');
	
	var data = {
		username: user,
		password: pass,
		email:email,
		geoLocation:$("#lg-signUpGeoLocation").val(),
		referral:$("#lg-signUpReferral").val(),
		youtube:$("#lg-signUpYoutube").val(),
		reddit:$("#lg-signUpReddit").val(),
		twitch:$("#lg-signUpTwitch").val(),
		twitter:$("#lg-signUpTwitter").val(),
	};
	
	if(Game.isIndex()){
		sessionStorage.setItem('signUpDetail',JSON.stringify(data));	//check Sign.init
		Sign.goGame();
	} else {
		Socket.emit('signUp',data);
	}
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


})();
