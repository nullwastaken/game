
//"use strict";
(function(){ //}
var Main, Actor, Input, Img, QueryDb, Stat, Command;
global.onReady(function(){
	Main = rootRequire('shared','Main',true); Actor = rootRequire('shared','Actor',true); Input = rootRequire('server','Input',true); Img = rootRequire('client','Img',true); QueryDb = rootRequire('shared','QueryDb',true); Stat = rootRequire('shared','Stat',true); Command = rootRequire('shared','Command',true);
	
});
var Dialog = rootRequire('client','Dialog');

var RED_BAR = null;
var BLUE_BAR = null;
var RED_BAR_BIG = null;
var BLUE_BAR_BIG = null;

Dialog.getSizeTopLeft = Tk.newCacheManager(function(){
	return {
		width:Dialog.get('abilityBar').width(),
		height:100,
	}	
},500);

Dialog.UI('resourceBar','topLeft',{
	position:'absolute',
	left:2,
	top:2,
	width:200,
	height:50,
	//padding:'0px 0px',
},Dialog.Refresh(function(html){
	RED_BAR_BIG = $("<div>")
		.css({background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'3px',padding:'2px'})

	RED_BAR = $("<div>")
		.css({pointerEvents:'none',backgroundColor:'red',width:'100%',height:'15px',borderRadius:'2px'})
		
	RED_BAR_BIG.append(RED_BAR);
	html.append(RED_BAR_BIG);
	
	//######################
	
	BLUE_BAR_BIG = $("<div>")
		.css({background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'3px',padding:'2px'})
		
	BLUE_BAR = $("<div>")
		.css({pointerEvents:'none',backgroundColor:'#2222FF',width:'100%',height:'8px',borderRadius:'2px'})
		
	BLUE_BAR_BIG.append(BLUE_BAR);
	html.append(BLUE_BAR_BIG);
	return true;
},function(){
	return '' + w.player.hpMax + w.player.hp + w.player.mana + w.player.manaMax + w.main.hudState.hp + w.main.hudState.mana;	//w.player.hp + w.player.hpMax + w.player.mana + w.player.manaMax + 
},3,function(html,variable,param){
	if(w.main.hudState.hp === Main.hudState.INVISIBLE){
		if(variable.hpVisible !== false){
			variable.hpVisible = false;
			RED_BAR_BIG.hide();
		}
	} else {
		if(variable.hpVisible !== true){
			variable.hpVisible = true;
			RED_BAR_BIG.show();
		}
				
		var title = 'Max Hp: ' + Math.floor(w.player.hpMax);
		
		if(variable.hpTitle !== title){
			variable.hpTitle = title;
			RED_BAR_BIG.attr('title',title);
		}
		
		var hp = Math.min(w.player.hp,w.player.hpMax);
		var pct = Math.round(hp/w.player.hpMax*100)+"%";
		if(variable.hpPct !== pct){
			variable.hpPct = pct;
			RED_BAR.css({width:pct});
		}
	}
	if(w.main.hudState.mana === Main.hudState.INVISIBLE){
		if(variable.manaVisible !== false){
			variable.manaVisible = false;
			BLUE_BAR_BIG.hide();
		}
	} else {
		if(variable.manaVisible !== true){
			variable.manaVisible = true;
			BLUE_BAR_BIG.show();
		}
				
		var title = 'Max Mana: ' + Math.floor(w.player.manaMax);
		
		if(variable.manaTitle !== title){
			variable.manaTitle = title;
			BLUE_BAR_BIG.attr('title',title);
		}
		
		var mana = Math.min(w.player.mana,w.player.manaMax);
		var pct = Math.round(mana/w.player.manaMax*100)+"%";
		
		if(variable.manaPct !== pct){
			variable.manaPct = pct;
			BLUE_BAR.css({width:pct});
		}
	}
}));

//####################
var ARRAY_ABILITY = [];
var SIZE = 28;
Dialog.UI('abilityBar','topLeft',{
	position:'absolute',
	left:2,
	top:2+35,
	width:200,
	height:35,
	//padding:'0px 0px',
},Dialog.Refresh(function(html,variable,param){
	if(w.main.hudState.abilityBar === Main.hudState.INVISIBLE) 
		return false;
	ARRAY_ABILITY = [];
	
	for(var i = 0; i < 5; i++){
		ARRAY_ABILITY.push(Img.drawIcon.html(null,SIZE));
	}
	variable.data = ['','','','','',''];
	var table = Tk.arrayToTable([ARRAY_ABILITY],false,false,false,'2px');//.addClass('center')
	html.append(table);
	return true;
},function(){
	return '' + Actor.getWeapon(w.player) + canAttack(w.player) + Tk.stringify(w.player.ability) + Tk.stringify(w.player.abilityChange.chargeClient) + w.main.hudState.abilityBar + w.player.mana + w.player.hp;
},3,function(html,variable,param){
	if(w.main.hudState.abilityBar === Main.hudState.INVISIBLE){
		if(variable.visible !== false){
			variable.visible = false;
			html.html('');
		}
		return;
	} else {
		if(variable.visible !== true){
			variable.visible = true;
			return true;
		}
	}
	
	var ability = Actor.getAbility(w.player);
	var refresh = function(){
		Dialog.refresh('abilityBar');
	}
	
	for(var i = 0; i < ARRAY_ABILITY.length; i++){
		var img = ARRAY_ABILITY[i];
		var str = Input.getKeyName('ability',i,true);
		
		var ab = null;
		if(ability[i]){
			ab = QueryDb.get('ability',ability[i],refresh);
		}
		if(!ability[i] || !ab){
			if(variable.data[i] === '')
				continue;
			variable.data[i] = '';
			Img.redrawIcon(img,null);
			img.css({border:''});
			continue;
		}
		
		var charge = w.player.abilityChange.chargeClient[i];
		
		var hasRightWeapon = Actor.testUseAbilityWeapon(w.player,ab);
		var enoughResource = Actor.ability.hasEnoughResource(w.player,ab);
		var enoughCharge = Actor.ability.hasEnoughCharge(w.player,i);
		var canUse = canAttack(w.player) && enoughCharge && enoughResource;
		var alpha = canUse ? 1 : 0.5;
		var inputPressed = Input.isPressed('ability',i);
		
		var representativeStr = '' + ability[i] + canUse + alpha + enoughCharge + charge + inputPressed + enoughResource + hasRightWeapon;
		
		if(variable.data[i] === representativeStr)
			continue;
	
		variable.data[i] = representativeStr;
			
		Img.redrawIcon(img,ab.icon,str,alpha);
		
		if(inputPressed)
			img.css({border:'1px solid white'});
		else 
			img.css({border:''});
			
		var ctx = img[0].getContext("2d")
		
		if(charge !== 1){	//loading circle
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = 'red';

			ctx.beginPath();
			ctx.moveTo(SIZE/2,SIZE/2);
			ctx.arc(SIZE/2,SIZE/2,SIZE/2,-Math.PI/2,-Math.PI/2 + charge*2*Math.PI);
			ctx.lineTo(SIZE/2,SIZE/2);
			ctx.closePath();
			ctx.fill();
		}
		if(!enoughResource || !hasRightWeapon){
			ctx.globalAlpha = 0.6;
			Dialog.drawRedX(ctx,SIZE);
		}
		
	}
}));

var canAttack = function(act){
	return act.combat && !act.dead && !act.noAbility;
}

Dialog.UI('curseClient','topLeft',{
	position:'absolute',
	left:5,
	top:2+35+35,
	width:200,
	height:30,
},Dialog.Refresh(function(html,variable,param){
	variable.array = [];
	variable.state = [];
	variable.stateStr = Tk.stringify([]);
	for(var i = 0; i < 8; i++){
		var img = Img.drawIcon.html(null,28);
		img.hide();
		variable.array.push(img);
		variable.state.push('');
		html.append(img);
		html.append(' ');
	}
	return true;
},function(){
	return Tk.stringify(w.player.curseClient) + w.player.statusClient + w.main.hudState.curseClient;
},3,function(html,variable,param){
	if(w.main.hudState.curseClient === Main.hudState.INVISIBLE){
		if(variable.visible !== false){
			variable.visible = false;
			html.hide();
			return null;
		}
	} else {
		if(variable.visible !== true){
			variable.visible = true;
			html.show();
		}
	}
	var list = [];
	for(var i = 0 ; i < w.player.statusClient.length; i++){
		if(w.player.statusClient[i] === '1'){
			list.push({icon:'status-' + CST.status.list[i],title:CST.status.list[i].$capitalize()});
		}
	}
	for(var i in w.player.curseClient){
		var stat = Stat.get(i);
		list.push({icon:stat.icon,title:w.player.curseClient[i] + ' ' + stat.name});
	}
	
	var str = Tk.stringify(list);
	if(variable.stateStr !== str){
		variable.stateStr = str;
		
		for(var i = 0 ; i < variable.array.length; i++){
			if(!list[i]){
				if(variable.state[i] !== ''){
					variable.state[i] = '';
					variable.array[i].hide();
				}
			} else {
				if(!variable.state[i])
					variable.array[i].show();
				if(variable.state[i] !== list[i].title){
					variable.state[i] = list[i].title;
					Img.redrawIcon(variable.array[i],list[i].icon,list[i].title);
				}
			}
		}
	}
}));

Dialog.UI('chrono','topLeft',{
	position:'absolute',
	left:2,
	top:2+35+35+50,
},Dialog.Refresh(function(html,variable){
	var helper = function(i){
		return function(e){
			if(w.main.chrono[i])
				Command.execute(CST.COMMAND.chronoRemove,[i]);
		}
	}
	variable.chrono = {};
	variable.active = {};
	
	for(var i in w.main.chrono){
		var c = w.main.chrono[i];
		if(c.visible === false) 
			continue;
				
		var span = $('<span>')
			.html(Tk.frameToChrono(c.time))
			.css({color:c.active ? 'white' : 'red',fontSize:'1.5em'})
			.attr('title',c.active ? '' : 'Right-Click to remove');	//w.main.chrono[i].text + //cant put that cuz refresh too high
		if(!c.active)
			span.bind('contextmenu',helper(i))
			
		variable.chrono[i] = span;
		variable.active[i] = c.active;
		html.append(span);
		html.append('<br>');
	}
	CHRONO_CHANGED = false;
	variable.keys = JSON.stringify(w.main.chrono.$keys());
},function(){
	return CHRONO_CHANGED;
},3,function(html,variable){
	CHRONO_CHANGED = false;
	if(variable.keys !== JSON.stringify(w.main.chrono.$keys()))	//chrono removed or added
		return true;
	for(var i in variable.chrono)
		if(variable.active[i] !== w.main.chrono[i].active)
			return true;
	
	for(var i in variable.chrono){
		if(variable.active[i])
			variable.chrono[i].html(Tk.frameToChrono(w.main.chrono[i].time));
	}
}));


var CHRONO_CHANGED = false;
Dialog.onChronoChange = function(){
	CHRONO_CHANGED = true;
}







})();



