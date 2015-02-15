//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
var CHAT_BOX_TEXT = null;
"use strict";
(function(){ //}
var Main = require4('Main'), Message = require4('Message'), Img = require4('Img'), Command = require4('Command');
var Dialog = require3('Dialog');

var DIALOGUE_HEIGHT = 200;
var DIALOGUE_WIDTH = 600;
var CHAT_BOX_INPUT = null;

var getHeight = function(){
	return Main.getPref(main,'minimizeChat') ? 150 : 200;
}
var getWidth = function(){
	return Main.getPref(main,'minimizeChat') ? 450 : 600; 
}



Dialog.UI('chat',{
	position:'absolute',
	left:0,
	background:'rgba(0,0,0,0.3)',
	padding:'0px 0px',
	border:'1px solid black',
	color:'white',
	font:'1.3em Kelly Slab',
},Dialog.Refresh(function(html){
	if(main.hudState.chat === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	var HEIGHT = getHeight();
	var WIDTH = getWidth();
	
	html.css({
		top:CST.HEIGHT-HEIGHT,
		width:WIDTH,
		height:HEIGHT,
	});
	
	
	CHAT_BOX_TEXT = CHAT_BOX_TEXT || $("<div>")
		.addClass('onlyTextScroll shadow')
		.css({padding:'5px 5px'})
		.html('Welcome!<br>');
	
	CHAT_BOX_TEXT.css({height:HEIGHT-27});
	html.append(CHAT_BOX_TEXT);
	
	//#############
	
	var form = $('<form>')
		/*.css({
			border:'1px solid black',
			height:25,
			padding:'4px -4px',
			width:WIDTH
		})*/
		.css({
			border:'1px solid black',
			position:'absolute',
			left:0,	//-4 cuz border
			bottom:0,
		})
		.append($('<span>')
			.html(player.name + ": ")
			.attr('id','chatUserName')
		);
	CHAT_BOX_INPUT = $('<input>')
		.addClass('onlyText')
		.css({width:WIDTH-75 - 5*player.name.length});	//-100 cuz player name takes place
			
	form.append(CHAT_BOX_INPUT)	
		.submit(function(e) {
			e.preventDefault();
			Dialog.chat.blurInput(true);
			if(Dialog.chat.getInput()){
				Message.sendChatToServer(Dialog.chat.getInput());
			}
			return false;
		})
		.click(function(){
			Dialog.chat.focusInput();
		})
		.keyup(function(){
			Dialog.open('command');
		});
		
	html.append(form);	
	
	if(main.hudState.bottomChatIcon === Main.hudState.INVISIBLE) return;
	html.append($('<span>')	//span for all buttons, but only 1 button...
		.css({
			position:'absolute',
			left:WIDTH-24-4,	//-4 cuz border
			top:HEIGHT-24,
		})
		.append(Img.drawIcon.html("attackMelee.cube",24,'Shift-Left: Clear Chat and PM')
			.click(function(e){
				if(!e.shiftKey) return;
				CHAT_BOX_TEXT.html('');
				$("#pmText").html('');
			})
		)
	);
	
	
	var min = Main.getPref(main,'minimizeChat');		
	html.append($('<button>')
		.html(min ? '+' : '-')
		.attr('title',min ? 'Maximize Chat' : 'Minimize Chat')
		.css({
			color:'white',
			backgroundColor:'rgba(0,0,0,0)',
			position:'absolute',
			left:WIDTH-24-4,	//-4 cuz border
			top:0,
		})
		.click(function(){
			Command.execute('pref',['minimizeChat',!min]);
		})
	);
	CHAT_BOX_TEXT[0].scrollTop += 100000;
	setTimeout(function(){	//BAD
		CHAT_BOX_TEXT[0].scrollTop += 100000;
	},100);
	
	
},function(){
	return "" + main.hudState.chat + main.hudState.bottomChatIcon + Main.getPref(main,'minimizeChat');
}));

Dialog.chat = {};

Dialog.chat.setInput = function(text,focus,add){	//input chat
	var input = CHAT_BOX_INPUT;
	if(add) input.val(input.val() + text);
	else input.val(text);
	if(focus !== false){ 
		input.focus();
		setTimeout(function(){ 
			input.focus();
			input.selectRange(input.val().length);
		},100);
	}
}

Dialog.chat.getInput = function(){
	return CHAT_BOX_INPUT.val();
}

Dialog.chat.addText = function(text,time){
	CHAT_BOX_TEXT.append(text,'<br>');
	CHAT_BOX_TEXT[0].scrollTop += 50;
}

Dialog.chat.isInputActive = function(text){
	if(typeof text === 'string')
		return CHAT_BOX_INPUT.is(":focus") && CHAT_BOX_INPUT.val() === text;
	return CHAT_BOX_INPUT.is(":focus");
};

Dialog.chat.blurInput = function(blurInput){
	if(blurInput)
		CHAT_BOX_INPUT.blur();
};

Dialog.chat.focusInput = function(){
	setTimeout(function(){
		CHAT_BOX_INPUT.focus();
	},20);	
};

//##################################

var PM_HEIGHT = 110;
var PM_HTML = null;
Dialog.UI('pm',{
	position:'absolute',
	left:0,
	height:PM_HEIGHT,
	maxHeight:PM_HEIGHT,
	background:'rgba(0,0,0,0)',
	padding:'4px 4px',
	color:'yellow',
	font:'1.3em Kelly Slab',
},Dialog.Refresh(function(html){
	html.css({	//cant put above, cuz Main not defined
		top:CST.HEIGHT-getHeight()-PM_HEIGHT-30,
		width:getWidth(),
	});
	
	PM_HTML = html;
	html.addClass('onlyText container shadow');
	html.append($('<div>')
		.attr('id','pmText')
		.css({height:PM_HEIGHT,maxHeight:PM_HEIGHT})
	);
}));

Dialog.pm = {};
Dialog.pm.addText = function(text,time){
	$("#pmText").append(text);
	$("#pmText").append('<br>');
	PM_HTML[0].scrollTop += 5000;
}

//###########################

Dialog.UI('dialogue',{
	position:'absolute',
	left:0,
	top:CST.HEIGHT-DIALOGUE_HEIGHT,
	width:DIALOGUE_WIDTH,
	height:DIALOGUE_HEIGHT,
	background:'rgba(0,0,0,0.8)',
	padding:'5px 5px',
	border:'1px solid black',
	color:'white',
	font:'1.3em Kelly Slab',
},Dialog.Refresh(function(html,variable,dia){
	if(!dia) return false;
	html.addClass('onlyText container shadow');
	
	var FACE = false;
	main.dialogue = dia;
	
	if(dia.face && dia.face.image){
		var face = Img.drawFace(dia.face,96);
		face.css({
			position:'absolute',
			left:3,
			top:3,
			width:100,
		})
		.addClass('inline');
		html.append(face);
		FACE = true;
	}
	var text = $('<div>')
		.css({
			position:'absolute',
			left:FACE ? 105 : 0,
			top:5,	
			width:FACE ? DIALOGUE_WIDTH - 105 : DIALOGUE_WIDTH,
		})
		.addClass('inline')
		.append(dia.node.text)
		.append('<br>');
	html.append(text);
	
	var helper = function(i){
		return function(){
			Command.execute('dialogue,option',[i]);
		}
	};
	for(var i = 0 ; i < dia.node.option.length; i++){
		text.append('&nbsp; ' + (i+1) + '- ');
		text.append($('<span>')
			.html(dia.node.option[i].text + '<br>')	//padding?
			.css({cursor:'pointer'})
			.click(helper(i))
			.addClass('underlineHover')
		);
	}
	
	
}));



//#########


Dialog.UI('partyClan',{
	position:'absolute',
	left:0,
	height:30,
	padding:'5px 5px',
	color:'white',
	font:'1.3em Kelly Slab',
},Dialog.Refresh(function(html,variable,dia){
	if(main.hudState.party === Main.hudState.INVISIBLE) return;
	
	var HEIGHT = getHeight();
	var WIDTH = getWidth();
	
	html.css({
		top:CST.HEIGHT-HEIGHT-30,
		width:WIDTH,
	});
	
	var party = $('<span>');
	
	var button = $('<button>')
		.addClass('skinny');
		
	if(main.acceptPartyInvite){
		button.addClass('myButtonGreen')
			.html('On')
			.attr('title','Currently accepting party request. Click to refuse them.')
			.click(function(){
				Command.execute('setAcceptPartyInvite',[false]);
			});	
	} else {
		button.addClass('myButtonRed')
			.html('Off')
			.attr('title','Currently refusing party request. Click to accept them.')
			.click(function(){
				Command.execute('setAcceptPartyInvite',[true]);
			});
	}
		
	
	party.append(button);	
	
	party.append(Img.drawIcon.html('tab.friend',20,'Click to change Party')
		.click(function(){
			Command.execute('party,join',[]);
		}
	));
	party.append(' Party "' + (main.party.id || '') + '": ');
	party.append($('<u>')
		.attr('title','Leader')
		.html(main.party.leader)
	);
	var str = ', ';
	for(var i = 0; i < 10 && i < main.party.list.length; i++){
		if(main.party.list[i] !== main.name && main.party.list[i] !== main.party.leader)
			str += main.party.list[i] + ', '; 
	}
	if(main.party.list.length >= 10) str += '...';
	party.append(str);
	
	html.append(party);
	
},function(){
	return Tk.stringify(main.party) + Tk.stringify(main.social.clanList) + main.acceptPartyInvite + main.hudState.party + Main.getPref(main,'minimizeChat');
}));





})();




