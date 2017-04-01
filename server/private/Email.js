//bug: need db to access email

var nodemailer;
var db;
var ACTIVE = true;

var myEmail = '';//TODO

exports.init = function(data,dbLink,active){
	db = dbLink;
	ACTIVE = !!active;
	if(!ACTIVE) return exports;
	nodemailer = require("nodemailer").createTransport("SMTP",{
		service: "Gmail",
		auth: data.emailPassword  
			? {user: myEmail,pass: data.emailPassword}
			: {user: "",pass: ''}
	});
	return exports;
}

exports.send = function(to,title,text,from,cb){
	if(!ACTIVE) return;
	if(!nodemailer) 
		return ERROR(3,'email not init');
	
	if(to.$contains('@')){	//to is email address
		nodemailer.sendMail({
			from: from || ("GAME_NAME <" + myEmail + ">"),
			to: to || '',
			subject: title || '', 
			text: text || ''
		});	
		if(cb) cb(true);
		return;
	}	
		
	db.account.findOne({username:to},{email:1},function(err, res){
		if(!res || !res.email || !res.email.$contains('@')){
			if(cb) 
				cb(false);
			return;
		}
		exports.send(to + ' ' + res.email,title,text,cb);
	});	
}

exports.sendCrashReport = function(text){
	exports.send(
		myEmail,
		'Server Crash',
		text || (new Date()).toString()
	);
}
exports.send.feedback = function(title,text,who){
	exports.send(
		myEmail,
		'Feedback by ' + who + ': ' + title.slice(0,20),
		'Feedback by ' + who /*+ ' (' + email + ') '*/ + '\r\n\r\n' + title + '\r\n\r\n' + text,
		who
	);
}

