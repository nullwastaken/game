//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
//"use strict";
(function(){ //}
var Main = require4('Main'), Actor = require4('Actor'), Input = require4('Input'), Img = require4('Img'), QueryDb = require4('QueryDb'), Stat = require4('Stat'), Command = require4('Command');
var Dialog = require3('Dialog');

var RED_BAR = null;
var BLUE_BAR = null;
var RED_BAR_BIG = null;
var BLUE_BAR_BIG = null;
var LAST_HP = 0;
var LAST_MANA = 0;

Dialog.UI('resourceBar',{
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
	return '' + player.hpMax + player.hp + player.mana + player.manaMax + main.hudState.hp + main.hudState.mana;	//player.hp + player.hpMax + player.mana + player.manaMax + 
},3,function(html,variable,param){
	if(main.hudState.hp === Main.hudState.INVISIBLE){
		if(variable.hpVisible !== false){
			variable.hpVisible = false;
			RED_BAR_BIG.hide();
		}
	} else {
		if(variable.hpVisible !== true){
			variable.hpVisible = true;
			RED_BAR_BIG.show();
		}
				
		var title = 'Max Hp: ' + player.hpMax;
		
		if(variable.hpTitle !== title){
			variable.hpTitle = title;
			RED_BAR_BIG.attr('title',title);
		}
		
		var hp = Math.min(player.hp,player.hpMax);
		var pct = Math.round(hp/player.hpMax*100)+"%";
		if(variable.hpPct !== pct){
			variable.hpPct = pct;
			RED_BAR.css({width:pct});
		}
	}
	if(main.hudState.mana === Main.hudState.INVISIBLE){
		if(variable.manaVisible !== false){
			variable.manaVisible = false;
			BLUE_BAR_BIG.hide();
		}
	} else {
		if(variable.manaVisible !== true){
			variable.manaVisible = true;
			BLUE_BAR_BIG.show();
		}
				
		var title = 'Max Mana: ' + player.manaMax;
		
		if(variable.manaTitle !== title){
			variable.manaTitle = title;
			BLUE_BAR_BIG.attr('title',title);
		}
		
		var mana = Math.min(player.mana,player.manaMax);
		var pct = Math.round(mana/player.manaMax*100)+"%";
		
		if(variable.manaPct !== pct){
			variable.manaPct = pct;
			BLUE_BAR.css({width:pct});
		}
	}
}));

//####################
var ARRAY_ABILITY = [];
var SIZE = 28;
Dialog.UI('abilityBar',{
	position:'absolute',
	left:2,
	top:2+35,
	width:200,
	height:35,
	//padding:'0px 0px',
},Dialog.Refresh(function(html,variable,param){
	if(main.hudState.abilityBar === Main.hudState.INVISIBLE) return;
	ARRAY_ABILITY = [];
	
	for(var i = 0; i < 6; i++){
		ARRAY_ABILITY.push(Img.drawIcon.html(null,SIZE));
	}
	variable.data = ['','','','','',''];
	var table = Tk.arrayToTable([ARRAY_ABILITY],false,false,false,'2px');//.addClass('center')
	html.append(table);	
},function(){
	return '' + Tk.stringify(player.ability) + Tk.stringify(player.abilityChange.chargeClient) + main.hudState.abilityBar + player.mana + player.hp;
},5,function(html,variable,param){
	var ability = Actor.getAbility(player);
	for(var i = 0; i < ARRAY_ABILITY.length; i++){
		var img = ARRAY_ABILITY[i];
		var str = Input.getKeyName('ability',i,true);
		
		var ab;
		if(ability[i]){
			ab = QueryDb.get('ability',ability[i],function(){
				Dialog.refresh('abilityBar');
			});
		}
		
		if(!ability[i] || !ab){
			if(variable.data[i] === '')
				continue;
			variable.data[i] = '';
			Img.redrawIcon(img,null);
			img.css({border:''});
			continue;
		}
		
		var charge = player.abilityChange.chargeClient[i];
		var enoughResource = ab.costMana <= player.mana && ab.costHp <= player.hp;
		var canUse = charge === 1 && enoughResource;
		var alpha = canUse ? 1 : 0.5;
		var inputPressed = Input.isPressed('ability',i);
		
		var representativeStr = '' + ability[i] + canUse + charge + inputPressed + enoughResource;
		
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
		if(!enoughResource){
			ctx.globalAlpha = 0.5;
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo(SIZE,SIZE);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.moveTo(SIZE,0);
			ctx.lineTo(0,SIZE);
			ctx.stroke();
		}
	}
}));

//####################

Dialog.UI('curseClient',{
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
	return Tk.stringify(player.curseClient) + player.statusClient + main.hudState.curseClient;
},3,function(html,variable,param){
	if(main.hudState.curseClient === Main.hudState.INVISIBLE){
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
	for(var i = 0 ; i < player.statusClient.length; i++){
		if(player.statusClient[i] == '1'){
			list.push({icon:'status.' + CST.status.list[i],title:CST.status.list[i].capitalize()});
		}
	}
	for(var i in player.curseClient){
		var stat = Stat.get(i);
		list.push({icon:stat.icon,title:player.curseClient[i] + ' ' + stat.name});
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

//####################

Dialog.UI('chrono',{
	position:'absolute',
	left:2,
	top:2+35+35+50,
},Dialog.Refresh(function(html,variable){
	var helper = function(i){
		return function(e){
			if(main.chrono[i])
				Command.execute('chrono,remove',[i]);
		}
	}
	variable.chrono = {};
	variable.active = {};
	
	for(var i in main.chrono){
		if(main.chrono[i].visible === false) continue;
				
		var span = $('<span>')
			.html(Tk.frameToChrono(main.chrono[i].time))
			.bind('contextmenu',helper(i))
			.css({color:main.chrono[i].active ? 'white' : 'red',font:'1.5em Kelly Slab'})
			.attr('title',main.chrono[i].active ? '' : 'Right-Click to remove')	//main.chrono[i].text + //cant put that cuz refresh too high
			
		variable.chrono[i] = span;
		variable.active[i] = main.chrono[i].active;
		
		html.append(span);
		html.append('<br>');
	}
	variable.keys = JSON.stringify(main.chrono.$keys());
},function(){
	return Tk.stringify(main.chrono);
},3,function(html,variable){
	if(variable.keys !== JSON.stringify(main.chrono.$keys())){	//chrono removed or added
		return true;
	}
	for(var i in variable.chrono){
		variable.chrono[i].html(Tk.frameToChrono(main.chrono[i].time));
		
		if(variable.active[i] !== main.chrono[i].active){
			variable.chrono[i].css({color:main.chrono[i].active ? 'white' : 'red',font:'1.5em Kelly Slab'})
				.attr('title',main.chrono[i].active ? '' : ' - Click to remove')	//main.chrono[i].text + //cant put that cuz refresh too high
		}
			
	}
}));











})();



