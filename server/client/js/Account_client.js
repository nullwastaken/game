
"use strict";
(function(){ //}
var Socket, Dialog, Game;
global.onReady(function(){
	Socket = rootRequire('private','Socket',true); Dialog = rootRequire('client','Dialog',true); Game = rootRequire('client','Game',true);
	Account.init();	//requires Socket
});
var Account = exports.Account = {};

var LOG = $('<div>');

var emit = function(what){
	Socket.emit(CST.SOCKET.account,what);
}

Account.init = function(){
	Socket.on(CST.SOCKET.accountAnswer,function(d){
		Account.log(d);
	});
	
	//Dialog.open('account')
	Dialog.create('account','Account Management',Dialog.Size(550,700),Dialog.Refresh(function(html){
		html.append('<h2>Account Management</h2>');
		html.append('Log: ',LOG);
		
		
		if(Game.getActive()){
			//###############
			/*
			html.append('<h3>Confirm Email</h3>');
			html.append('The Activation Key was sent to your email. Check in the Spam Folder too.<br>');
			html.append($('<button>')
				.html('Send again.')
				.click(function(){ Account.requestActivationKey(); }));
			html.append('<br>');
			*/
			var pass = localStorage.getItem('password') || '';
			//###############
			html.append('<h3>Change Username</h3>');
			html.append('You can only change your username once every week.<br>');
			html.append($('<span>')
				.html('Current Password: <input type="password" value="' + pass + '" id="accountCurrentPasswordName"></input><br>')
				.css(pass ? {display:'none'} : {})
			);
			html.append('New Username: <input id="accountNewName"></input><br>');
			html.append($('<button>')
				.html('Go!')
				.click(function(){ Account.changeName(); }));
			html.append('<br>');
			
			//###############
			html.append('<h3>Change Email</h3>');
			html.append('The new email will be active in 3 days. <br>(Or instantly if your account has none.)<br>');
			html.append($('<span>')
				.html('Current Password: <input type="password" value="' + pass + '" id="accountCurrentPasswordEmail"></input><br>')
				.css(pass ? {display:'none'} : {})
			);
			html.append('New Email: <input id="accountNewEmail"></input><br>');
			html.append($('<button>')
				.html('Go!')
				.click(function(){ Account.changeEmail(); }));
				
			if(!pass){
				html.append(' &nbsp;&nbsp;&nbsp;&nbsp;');
				html.append($('<button>')
					.html('Abort Request')
					.click(function(){ Account.abortChangeEmail(); }));
			}
			html.append('<br>');
			//###############
			html.append('<h3>Change Password</h3>');
			html.append($('<span>')
				.html('Current Password: <input type="password" value="' + pass + '" id="accountCurrentPassword"></input><br>')
				.css(pass ? {display:'none'} : {})
			);
			html.append('New Password: <input type="password" id="accountNewPassword"></input><br>');
			html.append('Type Again: <input type="password" id="accountNewPasswordConfirm"></input><br>');
			html.append($('<button>')
				.html('Go!')
				.click(function(){ Account.changePassword(); }));
			html.append('<br>');
		}
		
		//##################
		
		if(!Game.getActive()){
			//###############
			html.append('<h3>Request Reset Password</h3>');
			html.append('This will send a Reset Key to the email address linked with the account.<br>');
			html.append('Username: <input id="accountRequestName"></input><br>');
			html.append('Email: <input id="accountRequestEmail"></input><br>');
			html.append($('<button>')
				.html('Go!')
				.click(function(){ Account.requestResetPassword(); }));
			html.append('<br>');
			
			//###############
			html.append('<h3>Reset Password</h3>');
			html.append('Enter the Reset Key you received via email from "Request Reset Password" to reset your password. The new randomly-generated password will be sent to you by email.<br>');
			html.append('Username: <input id="accountResetName"></input><br>');
			html.append('Reset Key: <input id="accountResetKey"></input><br>');
			html.append($('<button>')
				.html('Go!')
				.click(function(){ Account.resetPassword(); }));
			html.append('<br>');
			
		}
	}),{
		parentDiv:'body',
		requireInit:false
	});
}

Account.log = function(text){
	LOG.html(text);
}

Account.changePassword = function(){
	var old = $("#accountCurrentPassword").val();
	if(!old)
		return Account.log("You need to provide the current password.");
		
	var pass = $("#accountNewPassword").val();
	if(pass !== $("#accountNewPasswordConfirm").val()) 
		return Account.log("Passwords do not match.");
	
	emit({
		command:'changePassword',
		oldPassword:old,
		newPassword:pass
	});
	
	$("#accountNewPassword").val('');
	$("#accountNewPasswordConfirm").val('');
}

Account.requestResetPassword = function(){
	emit({
		command:'requestResetPassword',
		username:$("#accountRequestName").val(),
		email:$("#accountRequestEmail").val()
	});
}

Account.resetPassword = function(){
	emit({
		command:'resetPassword',
		username:$("#accountResetName").val(),
		resetPasswordKey:$("#accountResetKey").val()
	});
}

Account.changeEmail = function(){
	var pass = $("#accountCurrentPasswordEmail").val();
	if(!pass)
		return Account.log('You need to provide your current password.');
	var email = $("#accountNewEmail").val();
	if(!email)
		return;
	emit({
		command:'changeEmail',
		password:pass,
		email:email
	});
}	

Account.abortChangeEmail = function(){
	emit({command:'abortChangeEmail'});
}

Account.requestActivationKey = function(){
	emit({command:'requestActivationKey'});
}

Account.sendActivationKey = function(){
	emit({
		command:'sendActivationKey',
		key:$("#accountActivationKey").val()
	});
}

Account.changeName = function(){
	var pass = $("#accountCurrentPasswordName").val();
	if(!pass)
		return Account.log('You need to provide your current password.');
	var newName = $("#accountNewName").val();
	if(!newName)
		return;
		
	emit({
		command:'changeName',
		password:pass,
		newName:newName
	});
}

})();





