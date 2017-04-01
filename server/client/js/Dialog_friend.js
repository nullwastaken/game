
"use strict";
(function(){ //}
var Message;
global.onReady(function(){
	Message = rootRequire('shared','Message',true);
});
var Dialog = rootRequire('client','Dialog');


Dialog.create('friend','Friend List',Dialog.Size(300,500),Dialog.Refresh(function(){
	Dialog.friend.apply(this,arguments);
},function(){
	return Tk.stringify(w.main.social.friendList);
}));
//Dialog.open('friend')

var helperLeft = function(i){
	return function(){
		Message.setInputForPM(null,i);
	}
};
var helperRight = function(i){
	return function(e){
		e.preventDefault();
		Dialog.friend.rightClick(i);
	}
};	

Dialog.friend = function(html,variable){
	var list = w.main.social.friendList;
		 	
	var all = $('<div>').addClass('shadow');
	all.append('<h2>Friend List</h2>');
	html.append(all);

	
	for(var i in list){
		var el = $('<span>')
			.css({color:list[i].online ? '#00FF00' : '#FF4D49'})
			.attr('title',i + ' : ' + list[i].nick + '  |  '+ list[i].comment)
			.html(i)
			.click(helperLeft(i))
			.bind('contextmenu',helperRight(i))
		all.append(el);
		all.append('<br>');
	}
	
	
	html.append($('<button>')
		.addClass('myButton')
		.html('Add a friend.')
		.click(function(){
			//Dialog.chat.setInput('$f l,add,');	//TOFIX
		})
	);
	html.append('<br>');
	html.append($('<button>')
		.addClass('myButton')
		.html('Remove a friend.')
		.click(function(){
			//Dialog.chat.setInput('$f l,remove,'); //TOFIX
		})
	);
	html.append('<br>');
	html.append($('<button>')
		.addClass('myButton')
		.html('Mute a player.')
		.click(function(){
			//Dialog.chat.setInput('$m ute,'); //TOFIX
		})
	);

}

Dialog.friend.rightClick = function(name){
	/*
	use Message.setInputForPM(key,i);
	Main.set OptionList.create(w.main,OptionList.create(name,[
		OptionList.Option(Dialog.chat.setInput,['@' + name + ','],'Send Message'),
		OptionList.Option(Command.execute,['fl,remove',[name]],'Remove Friend'),
	]));
	*/
}




})();





