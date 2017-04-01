
"use strict";
(function(){ //}
var Main, Message, Img, Command;
global.onReady(function(){
	Main = rootRequire('shared','Main',true); Message = rootRequire('shared','Message',true); Img = rootRequire('client','Img',true); Command = rootRequire('shared','Command',true);
});
var Dialog = rootRequire('client','Dialog');

var CHAT_BOX_TEXT = null;
var DIALOGUE_HEIGHT = 200;
var DIALOGUE_WIDTH = 600;
var CHAT_BOX_INPUT = null;
var FIRST = true;

var REMOVE_TIME = 15*60*1000;
var HOVER_TIME = 2*60*1000;

var getHeight = function(){
	return Main.getPref(w.main,'minimizeChat') ? 150 : 200;
}
var getWidth = function(){
	return Main.getPref(w.main,'minimizeChat') ? 525 : 600; 
}

Dialog.getSizeBottomLeft = function(includePm){
	return {
		width:400,	//getWidth(),	//BAD, but otherwise, because more than half size, alwaysgoes away
		height:getHeight() + 25 + (includePm ? PM_HEIGHT : 0),	//25 for partyClan
	}	
}


var HOVER_DIALOG = false;

Dialog.UI('chat','bottomLeft',{
	position:'absolute',
	left:0,
	zIndex:11,	//otherwise, cant click links
	background:'rgba(0,0,0,0.3)',
	padding:'0px 0px',
	border:'1px solid black',
	color:'white',
	fontSize:'1.1em',
},Dialog.Refresh(function(html,variable){
	if(w.main.hudState.chat === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	var HEIGHT = getHeight();
	var WIDTH = getWidth();
	
	html.css({
		bottom:0,
		width:WIDTH,
		height:HEIGHT,
	});
	
	
	CHAT_BOX_TEXT = CHAT_BOX_TEXT || $("<div>")
		.css({fontSize:'0.8em'})
		.addClass('onlyTextScroll shadow15')	//
		.css({padding:'5px 5px'});
	
	CHAT_BOX_TEXT.unbind('hover');	//idk y...
	CHAT_BOX_TEXT.hover(function(){
			HOVER_DIALOG = true;
			$('.visibleOnFocus').show();
			CHAT_BOX_TEXT.scrollTop(1000000);
		},function(){
			$('.visibleOnFocus').hide();
			HOVER_DIALOG = false;
		});
	
	if(FIRST)
		Dialog.chat.addText('Welcome!');

	CHAT_BOX_TEXT.css({height:HEIGHT-27});
	html.append(CHAT_BOX_TEXT);
		
	
	//#############
	
	var form = $('<form>')
		.css({
			border:'1px solid black',
			position:'absolute',
			left:0,	//-4 cuz border
			bottom:0,
		});
	
	CHAT_BOX_INPUT = $('<input>')
		.attr('placeholder','Press Enter to chat.')
		.addClass('onlyText')
		.css({marginLeft:'10px',width:WIDTH-75 - 5*w.player.name.length});	//-100 cuz player name takes place
			
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
		});
		
	html.append(form);	
	
	FIRST = false;
},function(){
	return "" + w.main.hudState.chat + w.main.hudState.bottomChatIcon + Main.getPref(w.main,'minimizeChat');
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


var TEXT_LIST = {};
Dialog.chat.addText = function(text){
	if(!CHAT_BOX_TEXT)	//case not ready
		return setTimeout(function(){
			Dialog.chat.addText(text);
		},5000);

	var atBottom = Tk.isScrollBarBottom(CHAT_BOX_TEXT,20);
	
	var el = $('<span>').append(text,'<br>');	
	CHAT_BOX_TEXT.append(el);
	
	if(atBottom)
		CHAT_BOX_TEXT.scrollTop(10000);	
		
	var id = Math.randomId();
	TEXT_LIST[id] = {
		id:id,
		html:el,
		timestamp:Date.now(),
	};
	
	if(Main.getPref(w.main,'deleteChat'))
		setTimeout(function(){
			if(!TEXT_LIST[id])
				return;
			TEXT_LIST[id].html.remove();
			delete TEXT_LIST[id];
		},REMOVE_TIME);
		
	
	setTimeout(function(){
		if(!TEXT_LIST[id])
			return;
		TEXT_LIST[id].html.addClass('visibleOnFocus');
		if(!HOVER_DIALOG)
			TEXT_LIST[id].html.hide();
	},HOVER_TIME);
	
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
var PM_TEXT = null;


Dialog.UI('pm','bottomLeft',{
	position:'absolute',
	left:0,
	height:PM_HEIGHT,
	maxHeight:PM_HEIGHT,
	background:'rgba(0,0,0,0)',
	padding:'4px 4px',
	color:'yellow',
	fontSize:'1.1em',
},Dialog.Refresh(function(html){
	html.css({	//cant put above, cuz Main not defined (for getHeight)
		bottom:DIALOGUE_HEIGHT+PARTY_HEIGHT,
		width:getWidth(),
	});
	
	PM_HTML = PM_HTML || html;
	html.addClass('onlyText container shadow');
	
	PM_TEXT = PM_TEXT || $('<div>').css({
		height:PM_HEIGHT,maxHeight:PM_HEIGHT
	});
	
	html.append(PM_TEXT);
},function(){
	return "" + Main.getPref(w.main,'minimizeChat');
},25*10,null,function(){	//BAD hotfix
	PM_HTML[0].scrollTop += 5000;
}));


var PM_TEXT_LIST = {};

Dialog.pm = {};
Dialog.pm.addText = function(text){
	var html = $('<span>').append(text,'<br>');
	PM_TEXT.append(html);
	
	var el = {
		html:html,
		id:Math.randomId(),
		timestamp:Date.now()
	};
	var id = el.id;
	PM_TEXT_LIST[id] = el;
	
	PM_HTML[0].scrollTop += 5000;
	
	if(Main.getPref(w.main,'deleteChat'))
		setTimeout(function(){
			if(!PM_TEXT_LIST[id])
				return;
			PM_TEXT_LIST[id].html.remove();
			delete PM_TEXT_LIST[id];
		},REMOVE_TIME);
	
}


	



Dialog.UI('dialogue','bottomLeft',{
	position:'absolute',
	left:0,
	bottom:0,
	width:DIALOGUE_WIDTH,
	height:DIALOGUE_HEIGHT,
	background:'rgba(0,0,0,0.8)',
	padding:'5px 5px',
	border:'1px solid black',
	color:'white',
	fontSize:'1.1em',
},Dialog.Refresh(function(html,variable,dia){
	if(!dia) return false;
	html.addClass('onlyText container shadow');
	
	var FACE = false;
	w.main.dialogue = dia;
	
	if(dia.face && dia.face.image){
		var face = Img.drawFace(dia.face,96);
		face.find('canvas').css({border:'1px solid rgba(255, 255, 55, 0.2)'});
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
			left:FACE ? 115 : 0,
			top:5,	
			width:FACE ? DIALOGUE_WIDTH - 115 : DIALOGUE_WIDTH,
		})
		.addClass('inline')
		.append(dia.node.text)
		.append('<br>');
	html.append(text);
	
	var helper = function(i){
		return function(){
			Dialog.playSfx('select');
			Command.execute(CST.COMMAND.dialogueOption,[i]);
		}
	};
	for(var i = 0 ; i < dia.node.option.length; i++){
		//text.append('&nbsp; ' + (i+1) + '- ');
		text.append($('<span>')
			.html('&nbsp; &nbsp; -> ')
			.addClass('shadow15')
			.css({color:'yellow'})
		);
		text.append($('<span>')
			.html(dia.node.option[i].text + '<br>')	//padding?
			.css({cursor:'pointer',color:'yellow'})
			.addClass('shadow15')
			.click(helper(i))
			.addClass('underlineHover')
		);
	}
	
	
}));

var PARTY_HEIGHT = 30;
Dialog.UI('partyClan','bottomLeft',{
	position:'absolute',
	left:0,
	height:PARTY_HEIGHT,
	padding:'5px 5px',
	color:'white',
	fontSize:'1.1em',
},Dialog.Refresh(function(html){
	if(w.main.hudState.party === Main.hudState.INVISIBLE) 
		return;
	
	if(Dialog.isActive('dialogue') && Main.getPref(w.main,'minimizeChat'))
		return;
	
	var HEIGHT = getHeight();
	var WIDTH = getWidth();
	
	html.css({
		bottom:HEIGHT,
		width:WIDTH,
	});
	
	var party = $('<span>').addClass('shadow');
	html.append(party);
	
	var button = $('<button>')
		.addClass('skinny');
		
	if(w.main.acceptPartyInvite){
		button.addClass('myButtonGreen')
			.html('On')
			.attr('tabindex',-1)
			.attr('title','Currently accepting party request. Click to refuse them.')
			.click(function(){
				Dialog.playSfx('select');
				Command.execute(CST.COMMAND.setAcceptPartyInvite,[false]);
			});	
	} else {
		button.addClass('myButtonRed')
			.html('Off')
			.attr('title','Currently refusing party request. Click to accept them.')
			.click(function(){
				Dialog.playSfx('select');
				Command.execute(CST.COMMAND.setAcceptPartyInvite,[true]);
			});
	}
	
	party.append(button);	
	
	var solo = !w.main.party.id || w.main.party.id[0] === '&'; //& is Party.SOLO
	var icon;
	if(solo){	
		icon = Img.drawIcon.html(CST.UI.party,24,'Click to create party.')
			.css({verticalAlign:'bottom',margin:'2px',cursor:'pointer'})
			.click(function(){
				Dialog.playSfx('select');
				Command.execute(CST.COMMAND.partyJoin,[]);
			});
	} else {
		icon = Img.drawIcon.html(CST.UI.party,24,'Click to leave party.')
			.css({verticalAlign:'bottom',margin:'2px',cursor:'pointer'})
			.click(function(){
				Dialog.playSfx('select');
				Command.execute(CST.COMMAND.partyJoinSolo,[]);
			});
	}
	party.append(icon);
	if(solo)
		return;

	party.append(' ',$('<u>')
		.attr('title','Party Leader')
		.html(w.main.party.leader)
	);
	var str = ', ';
	for(var i = 0; i < 10 && i < w.main.party.list.length; i++){
		if(w.main.party.list[i] !== w.main.party.leader)
			str += w.main.party.list[i] + ', '; 
	}
	str = str.slice(0,-2);	//remove ,
	if(w.main.party.list.length >= 10) 
		str += '...';
	party.append(str);
	
	party.append(' ',$('<div>')
		.attr('title','Invite to party.')
		.css({cursor:'pointer',display:'inline-block',paddingLeft:'4px',paddingRight:'4px',border:'1px solid white'})
		.html('+')
		.click(function(){
			Main.askQuestion(w.main,function(key,str){	
				Command.execute(CST.COMMAND.invite,[str]);
			},'Invite to party.','string');
		})
	);
	
	
},function(){
	return Tk.stringify(w.main.party) + Tk.stringify(w.main.social.clanList) + Dialog.isActive('dialogue') + w.main.acceptPartyInvite + w.main.hudState.party + Main.getPref(w.main,'minimizeChat');
}));





})();




