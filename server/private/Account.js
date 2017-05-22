
"use strict";
(function(){ //}
var Sign, Message, Server, Main, Actor, Socket;
global.onReady(function(initPack){
	Socket = rootRequire('private','Socket'); Sign = rootRequire('private','Sign'); Message = rootRequire('shared','Message'); Server = rootRequire('private','Server'); Main = rootRequire('shared','Main'); Actor = rootRequire('shared','Actor');

	db = initPack.db;
	emailer = initPack.email;
	Account.setOfflineInDb(Account.setOfflineInDb.ALL);
	var app = initPack.app;
	app.get('/confirmEmail',Account.handleConfirmEmail);
	
	Socket.on(CST.SOCKET.account,Account.manageSocket,10,10,false); //some action requires online

},{db:['account','player','main','highscore','competition'],email:true,app:true});
var Account = exports.Account = function(extra){
	this.username = '';
	this.name = '';
	this.password = '';
	this.salt = '';
	this.email = '';
	this.emailActivated = false;
	this.emailChangeRequestTime = -1;
	this.emailActivationKey = '';
	this.resetPasswordKey = '';
	this.resetPasswordSalt = '';
	this.resetPasswordTime = 0;
	this.timePlayedTotal = 0;
	this.timePlayedThisWeek = 0;
	this.online = false;
	this.admin = false;
	this.lastSignIn = null;
	this.signUpDate = Date.now();
	this.geoLocation = '';
	this.displayNameChangeTime = -1;
	this.randomlyGeneratedUsername = false;
	this.randomlyGeneratedPassword = false;			//true= password has been reset, aka send message to change for own password on login
	Tk.fillExtra(this,extra);
};

Account.create = function(extra){
	var tmp = new Account(extra);
	return tmp;
};

var crypto = require('crypto');
var db = null;
var emailer = null;

var MIN_PASSWORD_LENGTH = 3;
var MAX_PASSWORD_LENGTH = 32;
var MIN_USERNAME_LENGTH = 3;
var MAX_USERNAME_LENGTH = 12;

var TIME_EMAIL_CHANGE = CST.DAY * 3;
var NAME_CHANGE_TIME = CST.DAY * 7;

Account.isFirstSignIn = function(account){
	return account.lastSignIn === null;
}



Account.handleConfirmEmail = function(req,res){
	var str = req.query.confirmKey || '';
	db.account.findOne({emailActivationKey:str},{username:1,emailActivated:1},function(err,res){
		if(res){
			if(res.emailActivated){
				str = 'Your account was already activated.<br><br>Play now at <a style="color:cyan" href="/">RainingChain.com</a>';
			} else {
				db.account.update({username:res.username},{$set:{emailActivated:true}});
				str = 'Your account has been successfully activated.<br><br>Play now at <a style="color:cyan" href="/">RainingChain.com</a>';
			}
		} else
			str = 'No email is associated with the activation key "' + str + '".';
		return res.render('confirmEmail',{
			message:str,
			location:'confirmEmail'
		});
	});
}

Account.isValidUsername = function(username){	//return true=good, string if not
	if(username !== escape.user(username || '') || Server.isBannedName(username)) 
		return 'Illegal characters in username.';
	if(!Server.isAdmin(0,username) && username.length < MIN_USERNAME_LENGTH) 
		return 'Too short username.';	
	if(username.length > MAX_USERNAME_LENGTH)
		return 'Too long username.';
	return true;
}
Account.isValidPassword = function(password){	//return true=good, string if not
	if(typeof password !== 'string')
		return 'Must be string.';
	if(password.length < MIN_PASSWORD_LENGTH) 
		return 'Too short password.';	
	if(password.length > MAX_PASSWORD_LENGTH)
		return 'Too long password.';
	return true;
}

Account.insertInDb = function(account,cb){
	if(!Account.getDbSchema()(account))
		ERROR(3,'data not following schema',JSON.stringify(Account.getDbSchema().errors(account)),account);
	db.account.upsert({username:account.username},account,cb || db.account.err);
}

var schema;
Account.getDbSchema = function(){
	schema = schema || require('js-schema')({
        admin : Boolean,
        email : String,
        emailActivated : Boolean,
        emailActivationKey : String,
        emailChangeRequestTime : Number,
        lastSignIn : [Number,null],
        name : String,
        online : Boolean,
        password : String,
        randomlyGeneratedPassword : Boolean,
		randomlyGeneratedUsername: Boolean,
		displayNameChangeTime: Number,
        resetPasswordKey : String,
        resetPasswordSalt : String,
        resetPasswordTime : Number,
        salt : String,
        signUpDate : Number,
        timePlayedThisWeek : Number,
        timePlayedTotal : Number,
        username : String,
		geoLocation: String,
		'*':null
	});
	return schema;
}

Account.TIMELIMIT_PERWEEK = CST.HOUR*999999;

Account.USERNAME_TO_KEY = {};
Account.NAME_TO_KEY = {};

Account.getKeyViaUsername = function(id){
	return Account.USERNAME_TO_KEY[id];
}

Account.getKeyViaName = function(id){	
	return Account.NAME_TO_KEY[id];
}

Account.addPlayerToListKey = function(act,key){
	Account.USERNAME_TO_KEY[act.username] = key;
	Account.NAME_TO_KEY[act.name] = key;
}

Account.removeFromListToKey = function(act){
	delete Account.USERNAME_TO_KEY[act.username];
	delete Account.NAME_TO_KEY[act.name];
}

//##############
var getAccountViaUserPass = function(username,password,query,failCb,successDb){
	query = query || {};
	query.salt = 1;
	query.password = 1;
	db.account.findOne({username:username},query,function(err, account) { 
		if(!account) 
			return failCb(AccountError.NO_ACCOUNT);
		Account.encryptString(password,account.salt,function(data){
			if(data.password !== account.password) 
				return failCb(AccountError.BAD_PASSWORD);
			successDb(account);
		});
	});
}

var getDefaultFailCb = function(cb){
	return function(err){
		if(err === AccountError.BAD_PASSWORD)
			return cb('Invalid password.');
		else if(err === AccountError.NO_ACCOUNT)
			return cb('Invalid password.');
		return cb('Error.');
	}
}

var sendMessage = function(socket,msg){
	Socket.emit(socket,CST.SOCKET.accountAnswer,msg);	
}

var SocketHandler = function(id,online,func){
	var tmp = {
		id:id || '',
		online:!!online,
		func:func,		
	};
	DB[id] = tmp;
}
var DB = SocketHandler.DB = {};

SocketHandler('changePassword',true,function(key,username,d,cb){
	if(typeof d.oldPassword !== 'string' || typeof d.newPassword !== 'string') 
		return;
	var res = Account.isValidPassword(d.newPassword);
	if(res !== true)
		return cb(res);
	
	getAccountViaUserPass(username,d.oldPassword,{},getDefaultFailCb(cb),function(account){
		//else he had current pass right
		Account.changePassword(username,d.newPassword,function(){
			Main.setTemp(Main.get(key),'removePassword',true);
			cb('Password changed.');
		});
	});
});

SocketHandler('abortChangeEmail',true,function(key,username,d,cb){
	db.account.update({username:username},{$set:{emailChangeRequestTime:-1}});
	return cb('You successfully aborted the change of your email.');
});

SocketHandler('changeEmail',true,function(key,username,d,cb){
	if(typeof d.password !== 'string' || typeof d.email !== 'string') 
		return;
	var email = escape.email(d.email);
	if(!email) 
		return cb('Invalid email.');
	getAccountViaUserPass(username,d.password,{emailChangeRequestTime:1,email:1},getDefaultFailCb(cb),function(account){
		if(!account.email){	//no email
			db.account.update({username:username},{$set:{email:email}});
			return cb('You successfully set your email.');
		}
		if(account.email === email)
			return cb('You already have this email.');
			
		if(account.emailChangeRequestTime === -1){	//request only
			db.account.update({username:username},{$set:{emailChangeRequestTime:Date.now()}});
			return cb('You requested an email change. You will be able to change the email in ' + (TIME_EMAIL_CHANGE/CST.DAY) + ' days.');
		}
		var diff = TIME_EMAIL_CHANGE - (Date.now() - account.emailChangeRequestTime);
		if(diff > 0){	//still pending
			return cb('You will be able to change your email in ' + (diff/CST.HOUR).r(0) + ' hours.');
		}
		//if !activated || after 3 days
		db.account.update({username:username},{$set:{email:email,emailChangeRequestTime:-1}});
		return cb('Email changed.');
	});
});

SocketHandler('resetPassword',false,function(key,username,d,cb){	//cant trust username
	//sendMessage(socket,{command:'resetPassword',username:'rc',resetPasswordKey:'asdasdasd'});
	Account.resetPassword(d.username,d.resetPasswordKey,function(res){
		if(res === 'no account') return cb('No account found with this username.');	
		if(res === 'no email') return cb('This account has no email.');	
		if(res === 'no resetPasswordKey') return cb('No request was made to reset this password.');	
		if(res === 'bad resetPasswordKey') return cb('Wrong Reset Password Key. The key was sent to you via email.');	
		if(res === 'old resetPasswordKey') return cb('Your Reset Password Key has expired, please send a new request to reset the password.');	
		if(res === true) cb('Password reset. A new randomly-generated password has been sent to you via email.<br> Upon signing in, you will be asked to change it.');	
	});
});

SocketHandler('requestResetPassword',false,function(key,username,d,cb){ //cant trust username
	//cb({command:'requestResetPassword',user:'rc',email:'test'});
	Account.requestResetPassword(d.username,d.email,function(res){
		if(res === AccountError.NO_ACCOUNT) 
			return cb('No account found with this username.');	
		if(res === AccountError.NO_EMAIL) 
			return cb('Your account has no email linked to it. The only way for you to recover it is to remember your password.');	
		if(res === AccountError.BAD_EMAIL) 
			return cb('Email doesn\'t match username.<br>');	
		if(res === true) cb('A Reset Password Key has been sent to you by email. You will need use it to reset your password.');	
	});
});

SocketHandler('sendActivationKey',true,function(key,username,d,cb){
	db.account.findOne({username:username},{emailActivationKey:1},function(err, account) { 
		if(!account) 
			return cb('No account found.');
		if(account.emailActivationKey !== d.key) 
			return cb('Wrong key.');
		
		db.account.update({username:username},{$set:{emailActivated:true}});
		cb('You successfully activated your account.');
	});
});

SocketHandler('changeName',true,function(key,username,d,cb){
	if(typeof d.password !== 'string' || typeof d.newName !== 'string') 
		return;
	var res = Account.isValidUsername(d.newName);
	if(res !== true)
		return cb(res);
	
	getAccountViaUserPass(username,d.password,{displayNameChangeTime:1,name:1},getDefaultFailCb(cb),function(account){
		var diff = NAME_CHANGE_TIME - (Date.now() - account.displayNameChangeTime);
		if(diff > 0)
			return cb('You will be able to change your name again in ' + (diff/CST.HOUR).r(0) + ' hours.');
			
		var main = Main.get(key);
		if(main.name === d.newName)
			return cb('You already have that display name.');
	
		db.account.findOne({name:d.newName},{name:1},function(err,res){
			if(res)
				return cb('This username is already taken.');
			
			
			main.name = d.newName;
			Actor.get(key).name = d.newName;
			
			Main.setTemp(main,'name',d.newName);
			db.player.update({username:username},{$set:{name:d.newName}});
			db.main.update({username:username},{$set:{name:d.newName}});
			db.account.update({username:username},{$set:{name:d.newName,randomlyGeneratedUsername:false,displayNameChangeTime:Date.now()}});
			
			db.highscore.update({username:username},{$set:{name:d.newName}},{multi:true});
			db.competition.update({"score.username":username},{$set:{"score.$.name":d.newName}},{multi:true});
			//"3Cr3dF3vjG0QV" Zogisekec91
			cb('You successfully changed your account display name.');
		});
		
	});
});


Account.manageSocket = function(socket,d){	//note, client can cheat and send any d.username
	var key = socket.key;
	var online = socket.online;
	var username = online ? socket.username : null;
	if(!DB[d.command]) return;
	if(DB[d.command].online && !online) 
		return sendMessage(socket,'You need to be logged in to perform that action.');
	
	try {
		DB[d.command].func(key,username,d,function(string){
			sendMessage(socket,string);
		});
	} catch(err){ 
		sendMessage(socket,'Problem with your query: ' + err.stack);
	}
}

//##############
var AccountError = {};
AccountError.NO_ACCOUNT = 'no account';
AccountError.NO_EMAIL = 'no email';
AccountError.BAD_EMAIL = 'bad email';
AccountError.NO_RESETPASSWORDKEY = 'no resetPasswordKey';
AccountError.OLD_RESETPASSWORDKEY = 'old resetPasswordKey';
AccountError.BAD_RESETPASSWORDKEY = 'bad resetPasswordKey';
AccountError.BAD_PASSWORD = 'bad password';

//##############



Account.sendActivationKey = function(account){
	var str = 'Welcome to GAME_NAME! This is your activation key for your account ' + account.username + ': ' + account.emailActivationKey;
	emailer.send(account.email,'GAME_NAME: Activation Key',str);
}

Account.encryptString = function(pass,sel,cb){
	if(!sel) 
		Account.getSalt(function(salt){
			crypto.pbkdf2(pass,salt,2000,64,'sha1', function(err,pass){
				var buff = new Buffer(pass, 'binary');
				pass = buff.toString('base64');
				buff = null;
				cb({password:pass,salt:salt});
			});
		});
	else
		crypto.pbkdf2(pass,sel,2000,64,'sha1',function(err,pass){
			var buff = new Buffer(pass, 'binary');
			pass = buff.toString('base64');
			buff = null;
			cb({password:pass,salt:sel});
		});
}
		
Account.getSalt = function(cb){
	crypto.randomBytes(32, function(err,salt){
		cb(salt.toString('base64'));
	});
}

Account.randomString = function(){
	return Math.random().toString(36).slice(2);
}

Account.changePassword = function(user,newpass,cb){
	Account.encryptString(newpass,null,function(data){
		db.account.update({username:user},{$set:{password:data.password,salt:data.salt,randomlyGeneratedPassword:false}},cb);
	});
}

Account.requestResetPassword = function(name,emailStr,cb){
	db.account.findOne({name:name},{email:1},function(err,res){ 	
		if(!res) return cb(AccountError.NO_ACCOUNT);
		if(!res.email) return cb(AccountError.NO_EMAIL);
		if(res.email !== emailStr) 
			return cb(AccountError.BAD_EMAIL);
		
		var resetKey = Account.randomString();
		
		Account.encryptString(resetKey,null,function(data){
			db.account.update({name:name},{$set:{resetPasswordKey:data.password,resetPasswordSalt:data.salt,resetPasswordTime:Date.now()}},function(){
				var title = 'GAME_NAME Reset Password Key';
				var text = 'A request to reset the password for the account ' + name + ' has been made. If you have not requested this, ignore this message.\r\n'
					+ 'Here is your Reset Password Key: ' + resetKey;
				
				emailer.send(res.email,title,text);
				cb(true);
			});
		});
	});
}

Account.resetPassword = function(name,resetPasswordKey,cb){
	db.account.findOne({name:name},{email:1,resetPasswordKey:1,resetPasswordTime:1,resetPasswordSalt:1},function(err,res){ 	
		if(!res) return cb(AccountError.NO_ACCOUNT);
		if(!res.email) return cb(AccountError.NO_EMAIL);
		if(!res.resetPasswordKey) return cb(AccountError.NO_RESETPASSWORDKEY);
		if(Date.now() - res.resetPasswordTime > CST.DAY) return cb(AccountError.OLD_RESETPASSWORDKEY);
		
		Account.encryptString(resetPasswordKey,res.resetPasswordSalt,function(data){
			if(res.resetPasswordKey !== data.password) 
				return cb(AccountError.BAD_RESETPASSWORDKEY);
			
			var newpass = Account.randomString();
			Account.encryptString(newpass,null,function(data){
				db.account.update({name:name},{'$set':{password:data.password,salt:data.salt,resetPasswordKey:'',randomlyGeneratedPassword:true}},function(){
					var title = 'GAME_NAME Password Reset';
					var text = 'The password for the account ' + name + ' has been reset to: ' + newpass + ' .';
					emailer.send(res.email,title,text);
					cb(true);
				});
			});
		});
	});
}

//##############
Account.onSignIn = function(account,key){
	Account.sendEmailChangeRequestMessage(account,key);
	Account.sendNoEmailMessage(account,key);
	Account.addPlayerToListKey(account,key);
	
	if(account.lastSignIn === null || Date.nowDate(account.lastSignIn) !== Date.nowDate()){ //BAD
		Main.quest.resetCompleteToday(Main.get(key));
		Main.SideQuest.resetCompleteToday(Main.get(key));
	}
	db.account.update({username:account.username},{$set:{online:true,lastSignIn:Date.now()}},db.account.err);
}	

Account.sendNoEmailMessage = function(account,key){
	if(!account.email && !Account.isFirstSignIn(account))
		Message.add(key,'There is currently no email linked with your account. This is the only way to recover your account. ' 
			+ '<fakea class="message" onclick="exports.Dialog.open(\'account\',true);">Please provide one</fakea>.');
}

Account.sendEmailChangeRequestMessage = function(account,key){
	if(account.emailChangeRequestTime !== -1){
		if(Date.now()-account.emailChangeRequestTime < CST.DAY*7) 
			Message.add(key,'A request to change your email has been made. You can abort the change via the '
				+ '<fakea class="message" onclick="exports.Dialog.open(\'account\',true);">Setting Tab</fakea>.');
		else 
			Message.add(key,'You can now change your email.');
	}
}

//####################

Account.setOfflineInDb = function(username,cb){
	if(username === Account.setOfflineInDb.ALL)
		db.account.update({},{'$set':{online:false}},{multi:true},cb || db.err);
	else 
		db.account.update({username:username},{$set:{online:false}},cb || db.err);
}

Account.setOfflineInDb.ALL = '$ALL$';

Account.ban = function(name,message){
	db.account.update({username:name},{'$set':{'banned':1}});
	var key = Account.getKeyViaUsername(name);
	if(!key) 
		return ERROR(3,'no player with this name');
	Sign.off(key,"You have been banned. " + (message || ''));
}

Account.unban = function(name){
	db.account.update({username:name},{'$set':{'banned':0}});
}

Account.resetTimePlayedThisWeek = function(){
	db.account.update({},{'$set':{timePlayedThisWeek:0}},db.err);
}

Account.usernameExists = function(username,cb){
	db.account.findOne({username:username},{username:1},function(err,doc){
		cb(!!doc);
	});
}

//no dependencies
Account.getPlayerCount = function(db){
	if(Date.now() - LAST_UPDATE > 60000){
		LAST_UPDATE = Date.now();
		db.account.find({online:true}).count(function(err,result){
			CONTENT = result || 0;
		});
	}
	return CONTENT;
}

var CONTENT = 0;
var LAST_UPDATE = -1;

})(); //{

