
"use strict";
(function(){ //}
var Actor, QueryDb, Sfx, Game, Sprite, Collision, MapModel, Button, Socket, Main, Message, Dialog, BISON;
global.onReady(function(){
	BISON = rootRequire('shared','BISON',true);  Actor = rootRequire('shared','Actor',true); Sprite = rootRequire('shared','Sprite',true); QueryDb = rootRequire('shared','QueryDb',true); Sfx = rootRequire('client','Sfx',true); Game = rootRequire('client','Game',true); Collision = rootRequire('shared','Collision',true); MapModel = rootRequire('server','MapModel',true); Button = rootRequire('shared','Button',true); Socket = rootRequire('private','Socket',true); Main = rootRequire('shared','Main',true); Message = rootRequire('shared','Message',true); Dialog = rootRequire('client','Dialog',true);
	global.onLoop(Input.loop);
},null,'Input',['Main'],function(){
	Input.init();
});
var Input = exports.Input = {};

//a 65,b 66,c 67,d 68,e 69,f 70,g 71,h 72,i 73,j 74,k 75,l 76,m 77,n 78,o 79,p 80,q 81,r 82,s 83,t 84,u 85,v 86,w 87,x 88,y 89,z 90,,backspace 8,tab 9,enter 13,shift 16,ctrl 17,alt 18,pause/break 19,caps lock 20,escape 27,page up 33,page down 34,end 35,home 36,left arrow 37,up arrow 38,right arrow 39,down arrow 40,insert 45,delete 46,0 48,1 49,2 50,3 51,4 52,5 53,6 54,7 55,8 56,9 57,left window key 91,right window key 92,select key 93,numpad 0 96,numpad 1 97,numpad 2 98,numpad 3 99,numpad 4 100,numpad 5 101,numpad 6 102,numpad 7 103,numpad 8 104,numpad 9 105,multiply 106,add 107,subtract 109,decimal point 110,divide 111,f1 112,f2 113,f3 114,f4 115,f5 116,f6 117,f7 118,f8 119,f9 120,f10 121,f11 122,f12 123,num lock 144,scroll lock 145,semi-colon 186,equal sign 187,comma 188,dash 189,period 190,forward slash 191,grave accent 192,open bracket 219,back slash 220,close braket 221,single quote 222,

var KEYBOARD = {BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,KEY_0:48,KEY_1:49,KEY_2:50,KEY_3:51,KEY_4:52,KEY_5:53,KEY_6:54,KEY_7:55,KEY_8:56,KEY_9:57,KEY_A:65,KEY_B:66,KEY_C:67,KEY_D:68,KEY_E:69,KEY_F:70,KEY_G:71,KEY_H:72,KEY_I:73,KEY_J:74,KEY_K:75,KEY_L:76,KEY_M:77,KEY_N:78,KEY_O:79,KEY_P:80,KEY_Q:81,KEY_R:82,KEY_S:83,KEY_T:84,KEY_U:85,KEY_V:86,KEY_W:87,KEY_X:88,KEY_Y:89,KEY_Z:90,LEFT_META:91,RIGHT_META:92,SELECT:93,NUMPAD_0:96,NUMPAD_1:97,NUMPAD_2:98,NUMPAD_3:99,NUMPAD_4:100,NUMPAD_5:101,NUMPAD_6:102,NUMPAD_7:103,NUMPAD_8:104,NUMPAD_9:105,MULTIPLY:106,ADD:107,SUBTRACT:109,DECIMAL:110,DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUM_LOCK:144,SCROLL_LOCK:145,SEMICOLON:186,EQUALS:187,COMMA:188,DASH:189,PERIOD:190,FORWARD_SLASH:191,GRAVE_ACCENT:192,OPEN_BRACKET:219,BACK_SLASH:220,CLOSE_BRACKET:221,SINGLE_QUOTE:222};
var MOUSE = {LEFT:1,RIGHT:3};


var $gameDiv; //init
var $mainDiv; 
var $gameBottom;
var SETTING = null;
var STATE = null;
var BINDING = {move:null,ability:null};
var SHIFTKEY = 1000;
var CTRLKEY = 10000;	//to prevent ctrl-c triggering c
var WINDOW_ACTIVE = true;
var XBOX_SHIFT = false;
var USED_TELEPORT = false;
var OLD = {key:'',mouse:[0,0],pos:[0,0],target:''};
var DIR = {right:0,down:1,left:2,up:3};

var DOWN = 1;
var UP = 0;

var INPUT_ORDER = ['right','down','left','up'];

var OFFSET_MIN_SCREEN_WIDTH = 925;
var OFFSET_MIN_SCREEN_HEIGHT = 600;
var MIN_WIDTH = 700;
var MIN_HEIGHT = 400;

Input.getSetting = function(){
	return SETTING;
}
Input.getState = function(what){
	return STATE[what];
}
Input.getBinding = function(){
	return BINDING;
}
Input.setBinding = function(what,val){
	BINDING[what] = val;
}

Input.Setting = function(move,ability,custom){
	return {
		move:move,
		ability:ability,
		custom:custom		
	}
}

Input.Setting.move = function(right,down,left,up){
	return [right,down,left,up];
}
Input.Setting.ability = function(a,b,c,d,e,f){
	return [a,b,c,d,e,f];
}
Input.Setting.custom = function(name,keyCode,func){
	return {
		name:name || '',
		keyCode:keyCode || 0,
		func:func
	}
}

Input.getDefaultCustom = function(){	//tutorial assume stay same
	//doesnt support mouse for performance
	return [
		Input.Setting.custom('Reply',KEYBOARD.TAB,function(){
			Message.reply();
			return false;
		}),
		Input.Setting.custom('Chat focus',KEYBOARD.ENTER,function(){ 	//enter
			if(Input.hasFocusOnInput()) 
				return true;

			if(!Dialog.chat.isInputActive()){
				Dialog.chat.focusInput();
			}
			return false;
		}),
		Input.Setting.custom('Close popup',KEYBOARD.ESCAPE,function(){ 	//esc
			Dialog.closeAll();
			
			if(Dialog.chat.isInputActive('')){
				Dialog.chat.blurInput();
			}
			
			Dialog.chat.setInput('',false); 
			
			$(".ui-tooltip-content").parents('div').remove();
			return false;
		}),
		Input.Setting.custom('',SHIFTKEY + KEYBOARD.SPACE,function(){ 	//shift-space
			if(!Game.isAdmin()) 
				return;
			var mouse = Input.getMouse();
			w.player.x += mouse.x;
			w.player.y += mouse.y;
			USED_TELEPORT = true;
			return false;
		}),
		Input.Setting.custom('',KEYBOARD.GRAVE_ACCENT,function(){ 	//` (left of 1)
			if(!Game.isAdmin())
				return;
			var act = Input.getActorUnderMouse();
			if(act){
				ts('Actor.get("' + act.id + '");');
				return false;
			}
		}),
		
		Input.Setting.custom('Equip Window',KEYBOARD.KEY_E,function(){ 	//e
			if(Dialog.isActive('equip'))
				return Dialog.close('equip');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-equip'] !== Main.hudState.INVISIBLE)
				Dialog.open('equip');
		}),
		Input.Setting.custom('Quest Window',KEYBOARD.KEY_Q,function(){ 	//q
			if(Dialog.isActive('questList'))
				return Dialog.close('questList');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-quest'] !== Main.hudState.INVISIBLE)
				Dialog.open('questList');
		}),
		Input.Setting.custom('Ability Window',KEYBOARD.KEY_B,function(){ 	//b
			if(Dialog.isActive('ability'))
				return Dialog.close('ability');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-ability'] !== Main.hudState.INVISIBLE)
				Dialog.open('ability');
		}),
		Input.Setting.custom('Achievement',KEYBOARD.KEY_V,function(){ 	//v
			if(Dialog.isActive('achievement'))
				return Dialog.close('achievement');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-achievement'] !== Main.hudState.INVISIBLE)
				Dialog.open('achievement');
		}),
		Input.Setting.custom('Contribution',KEYBOARD.KEY_C,function(){ 	//c
			if(Dialog.isActive('contribution'))
				return Dialog.close('contribution');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-contribution'] !== Main.hudState.INVISIBLE)
				Dialog.open('contribution');
		}),
		Input.Setting.custom('Settings',KEYBOARD.KEY_X,function(){ 	//x
			if(Dialog.isActive('setting'))
				return Dialog.close('setting');
			Dialog.closeBigWindow();
			Dialog.open('setting');
		}),
		Input.Setting.custom('Highscores',KEYBOARD.KEY_H,function(){ 	//h
			if(Dialog.isActive('highscore'))
				return Dialog.close('highscore');
			Dialog.closeBigWindow();
			Dialog.open('highscore');
		}),
		Input.Setting.custom('Map',KEYBOARD.KEY_M,function(){ 	//m
			if(Dialog.isActive('worldMap'))
				return Dialog.close('worldMap');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-worldMap'] !== Main.hudState.INVISIBLE)
				Dialog.open('worldMap');
		}),
		Input.Setting.custom('Reputation',KEYBOARD.KEY_R,function(){ 	//r
			if(Dialog.isActive('reputation'))
				return Dialog.close('reputation');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-reputation'] !== Main.hudState.INVISIBLE)
				Dialog.open('reputation');
		}),
		Input.Setting.custom('Side Quest',KEYBOARD.KEY_N,function(){ 	//n
			if(Dialog.isActive('sideQuest'))
				return Dialog.close('sideQuest');
			Dialog.closeBigWindow();
			if(w.main.hudState['tab-sideQuest'] !== Main.hudState.INVISIBLE)
				Dialog.open('sideQuest');
		}),
		
		/*
		Input.Setting.custom('',KEYBOARD.KEY_1,function(){ 	//1
			if(Dialog.isActive('dialogue') && w.main.dialogue.node.option[0]){
				Command.execute(CST.COMMAND.dialogueOption,[0]);
			} else {
				return true;
			}
		}),
		*/
	];
}

Input.fixCustomBindingCollision = function(){
	for(var i = SETTING.move.length-1 ; i >= 0; i--)
		for(var j = SETTING.custom.length-1 ; j >= 0; j--)
			if(SETTING.move[i] === SETTING.custom[j].keyCode)
				SETTING.custom.$removeAt(j);		
		
	for(var i = SETTING.ability.length-1 ; i >= 0; i--)
		for(var j = SETTING.custom.length-1 ; j >= 0; j--){
			if(SETTING.ability[i] === SETTING.custom[j].keyCode)
				SETTING.custom.$removeAt(j);
		}
}

Input.changeSetting = function(move,ability,custom){
	custom = custom || Input.getDefaultCustom();
	SETTING = Input.Setting(move,ability,custom);
	Input.fixCustomBindingCollision();
	Input.reset();
}

Input.usePreset = function(preset){
	preset = preset || 'qwerty';
	if(preset === 'qwerty')
		Input.changeSetting(
			Input.Setting.move(KEYBOARD.KEY_D,KEYBOARD.KEY_S,KEYBOARD.KEY_A,KEYBOARD.KEY_W),
			Input.Setting.ability(MOUSE.LEFT,MOUSE.RIGHT,SHIFTKEY+MOUSE.LEFT,SHIFTKEY+MOUSE.RIGHT,KEYBOARD.KEY_F,KEYBOARD.SPACE)
		);
	else if(preset === 'azerty')
		Input.changeSetting(
			Input.Setting.move(KEYBOARD.KEY_D,KEYBOARD.KEY_S,KEYBOARD.KEY_Q,KEYBOARD.KEY_Z),
			Input.Setting.ability(MOUSE.LEFT,MOUSE.RIGHT,SHIFTKEY+MOUSE.LEFT,SHIFTKEY+MOUSE.RIGHT,KEYBOARD.KEY_F,KEYBOARD.SPACE)
		);
	else if(preset === 'number')
		Input.changeSetting(
			Input.Setting.move(KEYBOARD.KEY_D,KEYBOARD.KEY_S,KEYBOARD.KEY_A,KEYBOARD.KEY_W),
			Input.Setting.ability(MOUSE.LEFT,KEYBOARD.KEY_1,KEYBOARD.KEY_2,KEYBOARD.KEY_3,KEYBOARD.KEY_4,KEYBOARD.KEY_5)
		);
	Input.saveSetting();
}
Input.resetAbilityBinding = function(){
	SETTING.ability = Input.Setting.ability(MOUSE.LEFT,MOUSE.RIGHT,SHIFTKEY+MOUSE.LEFT,SHIFTKEY+MOUSE.RIGHT,KEYBOARD.KEY_F,KEYBOARD.SPACE);
}	


Input.saveSetting = function(){
	localStorage.setItem('bindingMove',JSON.stringify(SETTING.move));
	localStorage.setItem('bindingAbility',JSON.stringify(SETTING.ability));
}
Input.loadSetting = function(){
	var move = JSON.parse(localStorage.getItem('bindingMove'));
	var ability = JSON.parse(localStorage.getItem('bindingAbility'));
		
	//integrity test
	if(!move || !ability) return Input.usePreset();
	if(typeof move !== 'object' || typeof move[0] !== 'number') 
		return Input.usePreset();
	if(typeof ability !== 'object' || typeof ability[0] !== 'number') 
		return Input.usePreset();
	Input.changeSetting(move,ability);
}

Input.getKeyName = function(what,position,full){
	if(!SETTING) return;
	var keycode = SETTING[what][position];
	return Tk.keyCodeToName(keycode,full);	
}
Input.Binding = function(){
	return {
		move:null,
		ability:null,
	}	
}

//################
//State
Input.State = function(){ //BAD
	return {
		move:[0,0,0,0],	//right,down,left,up
		ability:[0,0,0,0,0,0],
		mouseX:0,
		mouseY:0,
		mouseXCanvas:0,
		mouseYCanvas:0,
		mouseDown:0,
		target:{active:false,x:w.player.x,y:w.player.y},	//BAD
	}
}

Input.reset = function(){
	var model = Input.State();
	STATE.move = model.move;
	STATE.ability = model.ability;
	w.player.moveInput = Actor.MoveInput();
}

Input.offset = {left:0,top:0};	//updated in loop

Input.isPressed = function(what,position){
	return !!STATE[what][position];
}	

Input.getMouse = function(relCanvas){
	if(!relCanvas)
		return {
			x:STATE.mouseX,
			y:STATE.mouseY,
			down:STATE.mouseDown,
		}
	return {
		x:STATE.mouseXCanvas,
		y:STATE.mouseYCanvas,
		down:STATE.mouseDown,
	}
}

//################
//Event
Input.init = function(){
	STATE = Input.State();
	$gameDiv = $('#gameDiv');
	$mainDiv = $('#mainDiv');
	$gameBottom = $("#gameBottom");
	
	Input.loadSetting();
	$(window).resize(function(e){
		if(e.target === window)
			return Input.onResize();
			
		var div = $(e.target).find('.ui-dialog-content')
		if(div){
			div.css({width:'100%'});
			div.height($(e.target).height()-40);	//BAD
		}
	});
	Input.onResize();
	
	window.onblur = function(){
		Input.reset();
	}
	//EVENT
	$(document).mousedown(function(event) { 
		return Input.onclick(event.which,DOWN,event);  
	});
	$(document).mouseup(function(event) { 
		return Input.onclick(event.which,UP,event); 
	});
	$(document).bind('mousewheel',function(event){ 
		Input.onwheel(event.wheelDeltaY > 0 ? 1 : -1);
	});
	$(document).mousemove(function(event){ 
		Input.onmove(event);
	});
	
    $(window).focus(function() {
		WINDOW_ACTIVE = true; 
	});
    $(window).blur(function() { 
		WINDOW_ACTIVE = false; 
	});
	
	$(document).keydown(function(event){
		Input.onkeydown(event.keyCode,DOWN,event);
	});
	$(document).keyup(function(event) {
		Input.onkeydown(event.keyCode,UP,event);
	});
	$(document).bind('contextmenu', function(){	//Disable Right Click Context Menu and Lose Focus
		return false;
	});	
	$(document).bind('contextmenu', function(){	//Disable Right Click Context Menu and Lose Focus
		return false;
	});	
	$(document).keydown(function(event){
		
	});
	
	Input.fixCustomBindingCollision();
	//prevent firefox context box on shift right
	/*
	document.onclick = document.dblclick = function(event){	
		if(!event.shiftKey) return;
		event.preventDefault(); 
		event.stopPropagation();
		return false;
	}
	*/
	/* window.onbeforeunload = function(){	//on close browser
		return 'Note: Ctrl + W closes the window.';
	}*/
}

Input.hasFocusOnInput = function(){
	if(!document.activeElement)
		return false;
	var str = document.activeElement.constructor.toString();
	return str.$contains('HTMLInputElement') || str.$contains('HTMLTextAreaElement');
}

Input.onkeydown = function(code,dir,event){
	if(Input.hasFocusOnInput())
		return false;
	if(code === 8){	//backspace, prevent go back
		event.preventDefault();
		return false;
	}
	
	var testCustom = true;
	for(var i = 0; i < SETTING.move.length; i++){
		if(code === SETTING.move[i]){
			if(dir === DOWN)
				Input.resetTarget();
			STATE.move[i] = dir;	//useless...
			w.player.moveInput[INPUT_ORDER[i]] = dir;
			testCustom = false;			
		}
	}
	
	if(event.shiftKey) 
		code += SHIFTKEY;
	if(event.ctrlKey) 
		code += CTRLKEY;
	if(testCustom)
		Input.testCustom(code,dir,event,true);
	
	Input.onPressAbility(code,dir,event);
	
	if(BINDING.move !== null && !event.ctrlKey && code !== SHIFTKEY + KEYBOARD.SHIFT){
		SETTING.move[BINDING.move] = code; 
		BINDING.move = null;
		Input.saveSetting();		
	}
	if(BINDING.ability !== null && !event.ctrlKey && code !== SHIFTKEY + KEYBOARD.SHIFT){
		SETTING.ability[BINDING.ability] = code; 
		BINDING.ability = null;
		Input.saveSetting(); 
	}
	
	
	return false;
}

var INPUT_BAD = [0,0,0,0,0];
var LAST_BAD_INPUT = 0;
var LAST_WRONG_WEAPON_MESSAGE = Date.now();

Input.onPressAbility = function(code,dir,event,preventDefault){
	var playedSfxAlready = false;
	
	var pressedToAttack = w.player.combat && dir && !Dialog.isMouseOverDialog() && !Dialog.isMouseOverInventory();

	for(var i = 0 ; i < SETTING.ability.length; i++){
		if(code === SETTING.ability[i]){
			var aid = Actor.getAbility(w.player)[i];
			var ab = aid && QueryDb.get('ability',aid);
			if(ab && pressedToAttack){
				//has mana + charge
				if(Main.getPref(w.main,'inputAbilitySfx') && i >= 2){	//BAD aka spec or heal 
					if(!Actor.ability.hasEnoughResource(w.player,ab) || !Actor.ability.hasEnoughCharge(w.player,i)){
						if(dir)
							INPUT_BAD[i] = Date.now();
						else if(Date.now() - INPUT_BAD[i] < 300){	//aka press and bad, then release and still bad and within 0.3 sec
							if(Date.now() - LAST_BAD_INPUT > 2000){
								LAST_BAD_INPUT = Date.now();
								if(!playedSfxAlready)
									Sfx.play('error',1);
								playedSfxAlready = true;
							}
						}
					} else
						INPUT_BAD[i] = 0;
				}
				
				//has right weapon
				if(dir && !Actor.testUseAbilityWeapon(w.player,ab)){
					if(Date.now() - LAST_WRONG_WEAPON_MESSAGE > 3000){
						LAST_WRONG_WEAPON_MESSAGE = Date.now();			
						if(!playedSfxAlready)
							Sfx.play('error',1);
						playedSfxAlready = true;
						Message.add(null,"You need to wield a <span style='color:" + CST.color.gold + ";'>" + Tk.joinOrAnd(ab.weaponReq,'or') + "</span> weapon to use that ability. "
							+ '<fakea class="message" onclick="exports.Dialog.open(\'tips\',exports.Dialog.Tip.getViaTitle(\'Finding Weapons\'))"'
							+ '>Where to find weapons?</fake>'
						);
					}
				}
			}
			
			STATE.ability[i] = dir;
			if(preventDefault)
				event.preventDefault();
		}
		//quick fix for shiftkey
		if(SETTING.ability[i] >= SHIFTKEY && code < SHIFTKEY)
			STATE.ability[i] = 0;
		if(SETTING.ability[i] < SHIFTKEY && code >= SHIFTKEY)
			STATE.ability[i] = 0;
	}
}

Input.testCustom = function(code,dir,event){	//at most 1 triggered
	if(dir === DOWN){
		for(var i in SETTING.custom){
			if(code === SETTING.custom[i].keyCode){
				if(!SETTING.custom[i].func(event))
					event.preventDefault();
				return;	
			}
		}
	}
}

Input.onclick = function(code,dir,event){
	if(event.shiftKey || XBOX_SHIFT) 
		code += SHIFTKEY;
	//Input.testCustom(code,dir,event);
	//Binding
	if(BINDING.ability !== null){
		SETTING.ability[BINDING.ability] = code;
		BINDING.ability = null;
		Input.saveSetting();
	}
	
	//Emit Mouse Click
	if(dir === DOWN){
		var side = '';
		if(code === MOUSE.LEFT) 
			side = 'left';	//HCODE
		else if(code === MOUSE.RIGHT) 
			side = 'right';
		else if(code === SHIFTKEY + MOUSE.LEFT) 
			side = 'shiftLeft';
		else if(code === SHIFTKEY + MOUSE.RIGHT)
			side = 'shiftRight';
		
		//call button function, if returns true prevent use ability when clicking on non-combat actor
		if(Button.onclick(side))	
			return;
		if(code === MOUSE.LEFT)
			STATE.mouseDown = true;
	} else {
		if(code === MOUSE.LEFT)
			STATE.mouseDown = false;
	}
	
	//Update Input
	Input.onPressAbility(code,dir,event);
	
}

Input.onwheel = function(side){

}

Input.onmove = function (evt){
	/*var factor = 1;
	if(document.body.style.zoom)
		factor = 100/(+document.body.style.zoom.slice(0,-1));*/
	var canvasX = evt.clientX - ($gameDiv[0].offsetLeft - window.pageXOffset);
	var canvasY = evt.clientY - ($gameDiv[0].offsetTop - window.pageYOffset);
	
	STATE.mouseXCanvas = canvasX;
	STATE.mouseYCanvas = canvasY;
	STATE.mouseX = canvasX - CST.WIDTH2 - CST.OFFSET.x;
	STATE.mouseY = canvasY - CST.HEIGHT2 - CST.OFFSET.y;
	
}

var FRAME = 0;
var INP = CST.INPUT;

Input.LOG_EMIT = false;

Input.loop = function(){	//emit
	if(FRAME++ % 25 === 0 && Input.hasFocusOnInput()) 
		Input.reset();	
	
	//Input.loop.controller();
	Input.loop.target();
	Input.updateOffset();
	
	if(Input.DONT_EMIT)
		return;
	
	var d = {};
		
	var newKey = STATE.ability.join('');
	if(OLD.key !== newKey) 
		d[INP.key] = newKey;
		
	var mouse = Input.getMouse();
	var newMouse = [Math.round(mouse.x),Math.round(mouse.y)];

	if(OLD.mouse.toString() !== newMouse.toString())
		d[INP.mouse] = newMouse;
	
	var pos = [w.player.x,w.player.y];	//cant round because otheriwse can collision on server but not on client
	if(USED_TELEPORT)
		pos.push(true);
	
	if(OLD.pos.toString() !== pos.toString())
		d[INP.position] = pos;
	
	d[INP.timestamp] = CST.encodeTime(Date.now());
	
	if(d[INP.key] || d[INP.mouse] || d[INP.position]){
		if(CST.BISON)
			d = BISON.encode(d);
		Socket.emit(CST.SOCKET.input, d);
	}
	OLD.pos = pos;
	OLD.key = newKey;
	OLD.mouse = newMouse;
	OLD.timestamp = d[INP.timestamp];
	USED_TELEPORT = false;
}
Input.DONT_EMIT = true;	//SET when timestamp applied in Game.init

Input.isWindowActive = function(){
	return WINDOW_ACTIVE;
}	

Input.fixFirefox = function(){
	setTimeout(function(){
		if(!SETTING)	//not loaded yet
			return Input.fixFirefox();
		for(var i in SETTING.ability){
			if(SETTING.ability[i] === SHIFTKEY + MOUSE.RIGHT){	//shift-right => c
				Message.add(null,'Your Shift-Right click key binding has been changed to C because Shift-Right click is not supported in Firefox.');
				SETTING.ability[i] = KEYBOARD.KEY_C;	
			}
		}
		Input.fixCustomBindingCollision();
	},5000);
}
	
//##############
/*
0:a,1:b,2:x,3:y,4:lb,5:rb,
6:lt,7:rt,8:back,9:start,10:lJoy,
11:rJoy,12:padUp,13:padDown,14:padLeft,15:padRight,

axe:
0:left horizontal (-1 = left) - 1:left vertical (-1 = up)
2:right horizontal (-1 = left) - 3:right vertical (-1 = up)
*/

Input.loop.controller = function(){
	if(!Main.getPref(w.main,'controller')) 
		return;
	XBOX_SHIFT = false;
	if(!navigator.getGamepads) 
		return;
	var list = navigator.getGamepads();
	var con = list && (list[0] || list[1] || list[2] || list[3]);
	if(!con) 
		return;
	var but = con.buttons;
	if(!but[0]) 
		return;	//not loaded properly
	var axe = con.axes;
	
	STATE.ability[4] = +but[4].pressed;	//lb, heal
	STATE.ability[5] = +but[10].pressed; //lJoy, dodge
	XBOX_SHIFT = +but[6].pressed;
	
	STATE.move[DIR.right] = +(axe[0] > 0.4);
	STATE.move[DIR.left] = +(axe[0] < -0.4);
	STATE.move[DIR.down] = +(axe[1] > 0.4);
	STATE.move[DIR.up] = +(axe[1] < -0.4);
}

var FUNC_LIST = [];
Input.callOnResize = function(funcORdom){	
	FUNC_LIST.push(funcORdom);
}

var GAME_BOTTOM = 40;	//hardcoded game.html
Input.onResize = function(){
	var max = Main.getPref(w.main,'maxWidth');
	
	CST.WIDTH = Math.max(MIN_WIDTH,Math.min(max,$(window).width()));
	CST.HEIGHT = Math.max(MIN_HEIGHT,Math.min(max/16*9,$(window).height()-GAME_BOTTOM));
	
	$mainDiv.css({width:CST.WIDTH,height:CST.HEIGHT});
	$gameDiv.css({width:CST.WIDTH,height:CST.HEIGHT});
	$gameBottom.css({width:CST.WIDTH,top:CST.HEIGHT});
	
	CST.WIDTH2 = CST.WIDTH/2;
	CST.HEIGHT2 = CST.HEIGHT/2;
	
	for(var i = 0 ; i < FUNC_LIST.length; i++){
		if(typeof FUNC_LIST[i] !== 'function'){
			FUNC_LIST[i].css({width:CST.WIDTH,height:CST.HEIGHT}).attr({width:CST.WIDTH,height:CST.HEIGHT});
			Tk.sharpenCanvas(FUNC_LIST[i]);
			FUNC_LIST[i][0].getContext('2d').font = CST.FONT;
		}
		else
			FUNC_LIST[i](CST.WIDTH,CST.HEIGHT);
	}
}

var lastOffsetByMouseX = 0;
var lastOffsetByMouseY = 0;

Input.updateOffset = function(){	//camera mouse move logic here
	var oldX = CST.OFFSET.x;
	var oldY = CST.OFFSET.y;
	var offsetFromPlayerPositionX = Input.updateOffset.x();
	var offsetFromPlayerPositionY = Input.updateOffset.y();
	
	var m = Input.getMouse(true);
	var dist = Math.pyt(m.x-CST.WIDTH/2,m.y-CST.HEIGHT/2);
	var angle = Tk.atan2(m.y-CST.HEIGHT/2,m.x-CST.WIDTH/2);
	
	var mod = Main.getPref(w.main,'cameraOffsetMod') / 100; 
	if(w.main.preventCameraMovement)
		mod = 0;
	
	//offset mouse aiming
	if(!Dialog.isMouseOverDialog() && !Dialog.isActiveBigWindow()){
			
		var goalX = -Tk.cos(angle) * dist * mod;
		var goalY = -Tk.sin(angle) * dist * mod;
		
		//aka when custom offest to hide map border, dont consider opposite mouse offset 
		if(offsetFromPlayerPositionX < 0 && goalX > 0)
			goalX = 0;
		if(offsetFromPlayerPositionX > 0 && goalX < 0)
			goalX = 0;
		if(offsetFromPlayerPositionY < 0 && goalY > 0)
			goalY = 0;
		if(offsetFromPlayerPositionY > 0 && goalY < 0)
			goalY = 0;
			
		var CAP = Main.getPref(w.main,'cameraSpeedMod') / 100;
		var vx = Tk.getCappedVariation(goalX-lastOffsetByMouseX,CAP,true);
		var vy = Tk.getCappedVariation(goalY-lastOffsetByMouseY,CAP,true);
		
		lastOffsetByMouseX += vx;
		lastOffsetByMouseY += vy;
		if(CAP === 0)
			lastOffsetByMouseX = lastOffsetByMouseY = 0;
	}	
	
	var mustBeWithInX = Actor.getBumperBox(w.player,'right');	//w.player center must be at least XXX px away from border
	var mustBeWithInY = Actor.getBumperBox(w.player,'down');
	
	var goalX = Tk.getCappedVariation(offsetFromPlayerPositionX + lastOffsetByMouseX,CST.WIDTH/2-mustBeWithInX);
	var goalY = Tk.getCappedVariation(offsetFromPlayerPositionY + lastOffsetByMouseY,CST.HEIGHT/2-mustBeWithInY);
	
	if(MapModel.isDoingTransition()){
		CST.OFFSET.x += Tk.getCappedVariation(goalX-CST.OFFSET.x,40);	//slide mapTransition
		CST.OFFSET.y += Tk.getCappedVariation(goalY-CST.OFFSET.y,40);
	} else {
		CST.OFFSET.x = goalX;
		CST.OFFSET.y = goalY;
	}
	CST.OFFSET.x = Math.round(CST.OFFSET.x);
	CST.OFFSET.y = Math.round(CST.OFFSET.y);
	
	if(oldX !== CST.OFFSET.x || oldY !== CST.OFFSET.y)
		Dialog.onOffsetChange(CST.OFFSET.x,CST.OFFSET.y);
	
}

Input.getActorUnderMouse = function(){
	for(var i in Actor.LIST)
		if(Sprite.isMouseOver(Actor.LIST[i]))
			return Actor.LIST[i];
	return null;
}
	
Input.updateOffset.x = function(){
	var width = MapModel.getWidth(MapModel.getCurrent());
	if(width < CST.WIDTH || CST.WIDTH < OFFSET_MIN_SCREEN_WIDTH)
		return 0;
		
	if(w.player.x < CST.WIDTH2)	//aka would have black border left
		return w.player.x-CST.WIDTH2;
	else if(w.player.x > width - CST.WIDTH2)
		return w.player.x-(width - CST.WIDTH2);
	return 0;
}	
Input.updateOffset.y = function(){
	var height = MapModel.getHeight(MapModel.getCurrent());
	if(height < CST.HEIGHT || CST.HEIGHT < OFFSET_MIN_SCREEN_HEIGHT)
		return 0;
	
	
	if(w.player.y < CST.HEIGHT2)
		return w.player.y-CST.HEIGHT2;
	else if(w.player.y > height - CST.HEIGHT2)
		return w.player.y-(height - CST.HEIGHT2);
	return 0;
}

var TARGET = null;
Input.setTarget = function(act,cb){	//act is reference, used to walk toward target
	TARGET = {actor:act,cb:cb,old:CST.pt(w.player.x,w.player.y),frame:0};
}
Input.resetTarget = function(){
	if(!TARGET) 
		return;
	TARGET = null;
	Input.reset();
}
Input.loop.target = function(){
	if(!TARGET) return;
	var act = TARGET.actor;
	var id = act.id;
	if(!Actor.get(id)){
		TARGET = null;
		return;
	}
	
	if(act.x > w.player.x+15){
		STATE.move[DIR.right] = 1;
		w.player.moveInput.right = 1;
		STATE.move[DIR.left] = 0;
		w.player.moveInput.left = 0;
	} else if(act.x < w.player.x-15){
		STATE.move[DIR.right] = 0;
		w.player.moveInput.right = 0;
		STATE.move[DIR.left] = 1;
		w.player.moveInput.left = 1;
	} else {
		STATE.move[DIR.right] = 0;
		w.player.moveInput.right = 0;
		STATE.move[DIR.left] = 0;
		w.player.moveInput.left = 0;
	}
	if(act.y > w.player.y+15){
		STATE.move[DIR.down] = 1;
		w.player.moveInput.down = 1;
		STATE.move[DIR.up] = 0;
		w.player.moveInput.up = 0;
	} else if(act.y < w.player.y-15){
		STATE.move[DIR.down] = 0;
		w.player.moveInput.down = 0;
		STATE.move[DIR.up] = 1;
		w.player.moveInput.up = 1;
	} else {
		STATE.move[DIR.down] = 0;
		w.player.moveInput.down = 0;
		STATE.move[DIR.up] = 0;
		w.player.moveInput.up = 0;
	}
	var dist = Actor.getDistanceBumperBumper(act,w.player);
	
	var divide = act.sprite.name.$contains('teleport') ? 4 : 2;	//BAD
	
	if(dist < act.interactionMaxRange/divide){
		TARGET.cb();
		Input.resetTarget();
		return;
	}
	if(++TARGET.frame % 4 === 0){
		var progress = Collision.getDistancePtPt(TARGET.old,w.player);
		if(progress < 10){
			if(dist < act.interactionMaxRange)
				TARGET.cb();
			Input.resetTarget();
			return;
		}
		TARGET.old = CST.pt(w.player.x,w.player.y);
	}		
	
}





})();