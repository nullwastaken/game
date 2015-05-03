//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require4('Actor'), Collision = require4('Collision'), Button = require4('Button'), Socket = require4('Socket'), Main = require4('Main'), Message = require4('Message'), Dialog = require4('Dialog'), Command = require4('Command');
var Input = exports.Input = {};

//a 65,b 66,c 67,d 68,e 69,f 70,g 71,h 72,i 73,j 74,k 75,l 76,m 77,n 78,o 79,p 80,q 81,r 82,s 83,t 84,u 85,v 86,w 87,x 88,y 89,z 90,,backspace 8,tab 9,enter 13,shift 16,ctrl 17,alt 18,pause/break 19,caps lock 20,escape 27,page up 33,page down 34,end 35,home 36,left arrow 37,up arrow 38,right arrow 39,down arrow 40,insert 45,delete 46,0 48,1 49,2 50,3 51,4 52,5 53,6 54,7 55,8 56,9 57,left window key 91,right window key 92,select key 93,numpad 0 96,numpad 1 97,numpad 2 98,numpad 3 99,numpad 4 100,numpad 5 101,numpad 6 102,numpad 7 103,numpad 8 104,numpad 9 105,multiply 106,add 107,subtract 109,decimal point 110,divide 111,f1 112,f2 113,f3 114,f4 115,f5 116,f6 117,f7 118,f8 119,f9 120,f10 121,f11 122,f12 123,num lock 144,scroll lock 145,semi-colon 186,equal sign 187,comma 188,dash 189,period 190,forward slash 191,grave accent 192,open bracket 219,back slash 220,close braket 221,single quote 222,

var $gameDiv; //init
var $mainDiv; 
var $gameBottom;
var SETTING = null;
var STATE = null;
var BINDING = {move:null,ability:null};
var SHIFTKEY = 1000;
var WINDOW_ACTIVE = true;
var USE_MOUVE_FOR_MOVE = false;
var FRAME = 0;


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
Input.Setting.custom = function(keyCode,func){
	return {
		keyCode:keyCode,
		func:func	
	}
}

Input.changeSetting = function(move,ability,custom){
	custom = custom || [
		Input.Setting.custom(9,function(){ 	//tab
			Message.reply();
			return false;
		}),
		Input.Setting.custom(13,function(){ 	//enter
			if(Input.hasFocusOnInput()) return true;

			if(!Dialog.chat.isInputActive()){
				Dialog.chat.focusInput();
			}
			return false;
		}),
		Input.Setting.custom(27,function(){ 	//esc
			Dialog.closeAll();
			
			if(Dialog.chat.isInputActive('')){
				Dialog.chat.blurInput();
			}
			
			Dialog.chat.setInput('',false); 
			
			$(".ui-tooltip-content").parents('div').remove();
			return false;
		}),
		/*
		Input.Setting.custom(49,function(){ 	//1
			if(Dialog.isActive('dialogue') && main.dialogue.node.option[0]){
				Command.execute('dialogue,option',[0]);
			} else {
				return true;
			}
		}),
		Input.Setting.custom(50,function(){ 	//2
			if(Dialog.isActive('dialogue') && main.dialogue.node.option[1]){
				Command.execute('dialogue,option',[1]);
			} else {
				return true;
			}
		}),
		Input.Setting.custom(51,function(){ 	//3
			if(Dialog.isActive('dialogue') && main.dialogue.node.option[2]){
				Command.execute('dialogue,option',[2]);
			} else {
				return true;
			}
		}),
		Input.Setting.custom(52,function(){ 	//4
			if(Dialog.isActive('dialogue') && main.dialogue.node.option[3]){
				Command.execute('dialogue,option',[3]);
			} else {
				return true;
			}
		}),
		*/
	];
	SETTING = Input.Setting(move,ability,custom);
	Input.reset();
}

Input.usePreset = function(preset){
	preset = preset || 'qwerty';
	if(preset === 'qwerty')
		Input.changeSetting(
			Input.Setting.move(68,83,65,87),	//d s a w
			Input.Setting.ability(1,3,SHIFTKEY+1,SHIFTKEY+3,70,32) //clk left, clk right, click left sshift, click right shift, f, space
		);
	else if(preset === 'azerty')
		Input.changeSetting(
			Input.Setting.move(68,83,81,90),	//d s q z
			Input.Setting.ability(1,3,SHIFTKEY+1,SHIFTKEY+3,70,32) //clk left, clk right, click left sshift, click right shift, f, space
		);
	else if(preset === 'number')
		Input.changeSetting(
			Input.Setting.move(68,83,65,87),	//d s a w
			Input.Setting.ability(1,49,50,51,52,53) //clk left, 1,2,3,4,5
		);
	else if(preset === 'moveWithMouse')
		Input.changeSetting(
			Input.Setting.move(189,189,189,189),	//- - - -
			Input.Setting.ability(81,87,69,82,70,32) //q w e r f space
		);	
}
Input.resetAbilityBinding = function(){
	SETTING.ability = Input.Setting.ability(1,3,SHIFTKEY+1,SHIFTKEY+3,70,32);
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
	if(typeof move !== 'object' || typeof move[0] !== 'number') return Input.usePreset();
	if(typeof ability !== 'object' || typeof ability[0] !== 'number') return Input.usePreset();
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
		mouseDown:0,
		target:{active:false,x:player.x,y:player.y},	//BAD
	}
}

Input.reset = function(){
	STATE = Input.State();
	player.moveInput = Actor.MoveInput();
}
Input.resetTarget = function(){
	STATE.target = Input.State.Target(player.x,player.y,false);
}

Input.offset = {left:0,top:0};	//updated in loop

Input.isPressed = function(what,position){
	return !!STATE[what][position];
}	

Input.getMouse = function(absolute){
	if(!absolute)
		return {
			x:STATE.mouseX,
			y:STATE.mouseY,
			down:STATE.mouseDown,
		}
	return {
		x:STATE.mouseX + CST.WIDTH2,
		y:STATE.mouseY + CST.HEIGHT2,
		down:STATE.mouseDown,
	}
}

//################
//Event
Input.init = function(){
	$gameDiv = $('#gameDiv');
	$mainDiv = $('#mainDiv');
	$gameBottom = $("#gameBottom");
	
	Input.loadSetting();
	$(window).resize(function(e){
		Input.init.T = e.target;
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
		return Input.onclick(event.which,'down',event);  
	});
	$(document).mouseup(function(event) { 
		return Input.onclick(event.which,'up',event); 
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
	
	$(document).keydown(function(event) {	
		Input.onkeydown(event.keyCode,'down',event);
	});
	$(document).keyup(function(event) { 
		Input.onkeydown(event.keyCode,'up',event);
	});
	$(document).bind('contextmenu', function(){	//Disable Right Click Context Menu and Lose Focus
		return false;
	});	
	
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
	var str = document.activeElement.constructor.toString();
	return str.$contains('HTMLInputElement') || str.$contains('HTMLTextAreaElement');
}

Input.onkeydown = function(code,dir,event){
	var num = dir === 'down' ? 1 : 0;
	if(dir === 'down'){
		for(var i in SETTING.custom){
			if(code === SETTING.custom[i].keyCode){
				if(!SETTING.custom[i].func(event))
					event.preventDefault();
			}
		}
	}
	
	if(Input.hasFocusOnInput()) return false;
	
	var list = ['right','down','left','up'];
	for(var i = 0; i < SETTING.move.length; i++){
		if(code === SETTING.move[i]){
			STATE.move[i] = num;
			player.moveInput[list[i]] = num;
		}
	}
	
	if(event.shiftKey) code += SHIFTKEY;
	
	for(var i in SETTING.ability){
		if(code === SETTING.ability[i]){
			STATE.ability[i] = num;
			event.preventDefault();
		}
		//quick fix for shiftkey
		if(SETTING.ability[i] >= SHIFTKEY && code < SHIFTKEY)
			STATE.ability[i] = 0;
		if(SETTING.ability[i] < SHIFTKEY && code >= SHIFTKEY)
			STATE.ability[i] = 0;
	}
	// if (e.ctrlKey)
	//16 = shift key
	if(BINDING.move !== null && code !== 16 && code !== 1016){ 
		SETTING.move[BINDING.move] = code; 
		BINDING.move = null;
		Input.saveSetting();		
	}
	if(BINDING.ability !== null  && code !== 16 && code !== 1016){ 
		SETTING.ability[BINDING.ability] = code; 
		BINDING.ability = null;
		Input.saveSetting(); 
	}
	
	
	return false;
}
var XBOX_SHIFT = false; //Input.controller.loop

Input.onclick = function(code,dir,event){	
	var num = dir === 'down' ? 1 : 0;
	if(event.shiftKey || XBOX_SHIFT) 
		code += SHIFTKEY;
	
	//Binding
	if(BINDING.ability !== null){
		SETTING.ability[BINDING.ability] = code;
		BINDING.ability = null;
		Input.saveSetting();
	}
	
	//Emit Mouse Click
	if(dir === 'down'){
		var side;
		if(code === 1) side = 'left';
		else if(code === 3) side = 'right';
		else if(code === SHIFTKEY + 1) side = 'shiftLeft';
		else if(code === SHIFTKEY + 3) side = 'shiftRight';
		
		//call button function, if returns true prevent use ability when clicking on non-combat actor
		if(Button.onclick(side))	
			return;
		if(code === 1)
			STATE.mouseDown = true;
	} else {
		if(code === 1)
			STATE.mouseDown = false;
	}
	
	//Update Input
	for(var i in SETTING.ability){
		if(code === SETTING.ability[i]){
			STATE.ability[i] = num;
		}
		//quick fix for shiftkey
		if(SETTING.ability[i] >= SHIFTKEY && code < SHIFTKEY)
			STATE.ability[i] = 0;
		if(SETTING.ability[i] < SHIFTKEY && code >= SHIFTKEY)
			STATE.ability[i] = 0;
	}
	
	if(Input.isActiveUseMouseForMove() && dir === 'down' && code === 1){
		Input.setTarget();
	}
}

Input.onwheel = function(side){

}

Input.onmove = function (evt){
	/*var factor = 1;
	if(document.body.style.zoom)
		factor = 100/(+document.body.style.zoom.slice(0,-1));*/
	
	STATE.mouseX = evt.clientX - ($gameDiv[0].offsetLeft - window.pageXOffset) - CST.WIDTH2;
	STATE.mouseY = evt.clientY - ($gameDiv[0].offsetTop - window.pageYOffset) - CST.HEIGHT2;	
}

Input.State.Target = function(x,y,active){
	return {
		x:x,
		y:y,
		active:active	
	}
}

Input.setTarget = function(x,y){
	x = x || Input.getMouse(true).x;
	y = y || Input.getMouse(true).y;

	var farthest = Collision.strikeMap.client(player,{
		x:Tk.absToRel.x(x),
		y:Tk.absToRel.y(y),
	},'player');

	STATE.target.x = farthest.x;
	STATE.target.y = farthest.y;
	STATE.target.active = true;
}

//Send
Input.loop = function(){
	if(Input.hasFocusOnInput()) 
		Input.reset();	
	
	Input.controller.loop();
	
	var d = {};
	
	if(Input.isActiveUseMouseForMove()){
		Input.loop.updateStateWithMouse();
		
		var mouse = Input.getMouse(true);
		if(mouse.down && FRAME++ % 15 === 0){
			Input.setTarget(mouse.x,mouse.y);
		}
		
		var t = [Math.round(STATE.target.x),Math.round(STATE.target.y)];
		if(Input.loop.OLD.target !== t.toString()){
			Input.loop.OLD.target = t.toString();
			d.t = t;
		}
	}
	
	var newKey = STATE.move.join('') + STATE.ability.join('');
	if(Input.loop.OLD.key !== newKey) 
		d.i = newKey;
		
	
	
	var mouse = Input.getMouse();
	var newMouse = [Math.round(mouse.x),Math.round(mouse.y)];

	
	if(Input.loop.OLD.mouse.toString() !== newMouse.toString())
		d.m = newMouse;
	
	
	if(d.i || d.m || d.t)
		Socket.emit("input", d);
	
	Input.loop.OLD.key = newKey;
	Input.loop.OLD.mouse = newMouse;
}
	
Input.loop.updateStateWithMouse = function(){
	var DELTA = 4;//4*player.maxSpd; //very small cause in Actor.move.client, make it so cant go too much
	
	if(!STATE.target.active){
		player.moveInput = Actor.MoveInput();	//kinda useless cuz Actor move does nothing is not active
		return;
	}
	
	if(STATE.target.x - DELTA > player.x){
		player.moveInput.right = 1;
	}else player.moveInput.right = 0;
	
	if(STATE.target.y - DELTA > player.y)
		player.moveInput.down = 1;
	else player.moveInput.down = 0;
	
	if(STATE.target.x + DELTA < player.x){
		player.moveInput.left = 1;
	} else player.moveInput.left = 0;
	
	if(STATE.target.y + DELTA < player.y)
		player.moveInput.up = 1;
	else player.moveInput.up = 0;
}	

Input.loop.OLD = {key:'',mouse:[0,0],target:''};

Input.isWindowActive = function(){
	return WINDOW_ACTIVE;
}	

Input.fixFirefox = function(){
	for(var i in SETTING.ability){
		if(SETTING.ability[i] === 1003){	//shift-right => c
			Message.add(null,'Your Shift-Right click key binding has been changed to C becase Shift-Right click is not supported in Firefox.');
			SETTING.ability[i] = 67;	
		}
	}
}
					
Input.isActiveUseMouseForMove = function(){
	return USE_MOUVE_FOR_MOVE;
}	

Input.setUseMouseForMove = function(val){
	if(!val && USE_MOUVE_FOR_MOVE){
		USE_MOUVE_FOR_MOVE = false;
		Command.execute('enableMouseForMove',[false]);
		Input.usePreset('qwerty');
		Input.reset();
		setTimeout(function(){
			Dialog.open('binding');
			Message.addPopup(null,'Your Key Bindings have been changed.');
		},500);
	}
	else if(val && !USE_MOUVE_FOR_MOVE){
		USE_MOUVE_FOR_MOVE = true;
		Command.execute('enableMouseForMove',[true]);
		Input.usePreset('moveWithMouse');
		Input.reset();
		setTimeout(function(){
			Dialog.open('binding');
			Message.addPopup(null,'Your Key Bindings have been changed.<br>Use Left-Click to move around and Q-W-E-R to attack.<br>The black circle following you represents the server position.');
		},500);
	}
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

Input.controller = {};
Input.controller.loop = function(){	//TOFIX bad name
	XBOX_SHIFT = false;
	if(!navigator.getGamepads) return;
	var list = navigator.getGamepads();
	var con = list && (list[0] || list[1] || list[2] || list[3]);
	if(!con || !Main.getPref(main,'controller')) return;
	var but = con.buttons;
	if(!but[0]) return;	//not loaded properly
	var axe = con.axes;
	
	STATE.ability[4] = +but[4].pressed;	//lb, heal
	STATE.ability[5] = +but[10].pressed; //lJoy, dodge
	XBOX_SHIFT = +but[6].pressed;	//BAD TO FIX
	
	STATE.move[0] = +(axe[0] > 0.4);
	STATE.move[2] = +(axe[0] < -0.4);
	STATE.move[1] = +(axe[1] > 0.4);
	STATE.move[3] = +(axe[1] < -0.4);
}

var FUNC_LIST = Input.F = [];
Input.callOnResize = function(funcORdom){	
	FUNC_LIST.push(funcORdom);
}

Input.onResize = function(){
	var max = Main.getPref(main,'maxWidth');
	
	CST.WIDTH = Math.max(700,Math.min(max,$(window).width()));
	CST.HEIGHT = Math.max(400,Math.min(max/16*9,$(window).height()-35));	//-30 for gameBottom
	
	$mainDiv.css({width:CST.WIDTH,height:CST.HEIGHT});
	$gameDiv.css({width:CST.WIDTH,height:CST.HEIGHT});
	$gameBottom.css({width:CST.WIDTH,top:CST.HEIGHT});
	
	CST.WIDTH2 = CST.WIDTH/2;
	CST.HEIGHT2 = CST.HEIGHT/2;
	
	for(var i = 0 ; i < FUNC_LIST.length; i++){
		if(typeof FUNC_LIST[i] !== 'function'){
			FUNC_LIST[i].css({width:CST.WIDTH,height:CST.HEIGHT}).attr({width:CST.WIDTH,height:CST.HEIGHT});
			Tk.smoothCanvas(FUNC_LIST[i]);
		}
		else
			FUNC_LIST[i](CST.WIDTH,CST.HEIGHT);
	}
}




})();