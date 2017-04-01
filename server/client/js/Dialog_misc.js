
"use strict";
(function(){ //}
var QueryDb, Actor,Img, Message, OptionList, Input, Command, Main, MapModel;
global.onReady(function(){
	Img = rootRequire('shared','Img',true); MapModel = rootRequire('shared','MapModel',true); QueryDb = rootRequire('shared','QueryDb',true); Actor = rootRequire('shared','Actor',true); Message = rootRequire('shared','Message',true); OptionList = rootRequire('shared','OptionList',true); Input = rootRequire('server','Input',true); Command = rootRequire('shared','Command',true); Main = rootRequire('shared','Main',true);
});
var Dialog = rootRequire('client','Dialog');

Dialog.UI('disconnect',null,{	
	position:'absolute',
	top:'30%',
	left:'40%',
	border:'2px solid black',
	zIndex:Dialog.ZINDEX.HIGH,	
	fontSize:'1.5em',
	backgroundColor:'red',
	height:'auto',
	width:'auto',
	textAlign:'center',
	color:'white',
	padding:'20px 20px 20px 20px',	//0px cuz h3?
},Dialog.Refresh(function(html,variable,d){	//d:{message,backgroundColor}	check Sign.off
	if(!d) 
		return false;
	if(d === true)
		d = {message:'The game stopped.',backgroundColor:'red'};
	html.html(d.message);
	html.css({backgroundColor:d.backgroundColor});
}));

Dialog.UI('context',null,{		//uses Dialog.quickContextRefresh
	position:'relative',
	height:150,
	width:'100%',
	textAlign:'center',
	zIndex:Dialog.ZINDEX.HIGH,
	pointerEvents:'none',	//otherwise cant close dialog
},Dialog.Refresh(function(html,variable,text){	//param:{x,y,text}
	var context = $('<div>')
		.css({
			marginTop:'15px',
			padding:'3px',
			border:'2px solid black',
			fontSize:'1.5em',
			color:'black',
			lineHeight:'100%',
			backgroundColor:'white',
			height:'auto',
			width:'auto',
			textAlign:'center',
			whiteSpace:'nowrap',
			display:'inline-block',
			pointerEvents:'none',
		});
	variable.div = context;	
	html.append(context);
	variable.visible = false;
	html.hide();
	return null;	//Dialog.open wont force the show
},function(){},10000000,function(html,variable,text){
	if(variable.oldText === text)
		return;
	variable.oldText = text;
	if(!text){
		variable.visible = false;
		html.hide();
		return;
	}
	if(variable.visible !== true){
		variable.visible = true;
		html.show();
	}
	
	variable.div.html(text);
}));

//#####################
//Dialog.open('questPopup',{text:'hey',time:100})
//Dialog.open('questPopup',{text:'heasdad asd asjkhd askjd askjd haskdh askd haskd haskdhj akdhas kjdh akjdha kjdhaskj hdask dhasdkj asy',time:3000})

//param:{text}

var QUESTPOPUP_CONTENT;
	
Dialog.create('questPopup','Info',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,param){
	html.css({	
		zIndex:Dialog.ZINDEX.HIGH + 5,
		fontSize:'1.1em',
		color:'black',
		lineHeight:'100%',
		backgroundColor:'white',
		maxWidth:'600px',
		width:'400px',
		height:'auto',
		textAlign:'center',
		display:'inline-block',
	});
	html.dialog({
		width:'auto', 
		height:'auto',
	});
			
	if(!param) 
		return false;
	param.text = Message.receive.parseInput(param.text);
	html.html(param.text);
	Dialog.positionPopup(html);
	QUESTPOPUP_CONTENT = html;
}));


Dialog.displayQuestPopup = function(msg){
	if(Dialog.isActive('questPopup'))
		QUESTPOPUP_CONTENT.prepend(msg.text + '<hr style="height:1px;">');
	else
		Dialog.open('questPopup',msg);
}

//#####################

Dialog.UI('optionList',null,{	
	position:'absolute',
	
	marginTop:'15px',
	padding:'3px',
	border:'2px solid black',
	zIndex:Dialog.ZINDEX.HIGH,	
	fontSize:'1.1em',
	color:'black',
	lineHeight:'100%',
	backgroundColor:'white',
	height:'auto',
	width:'auto',
	textAlign:'center',
	whiteSpace:'nowrap',
	display:'inline-block'

},Dialog.Refresh(function(html,variable,info){	//param:text
	if(!info) return false;
	$(document).tooltip('disable');
	
	html.append($('<span>')
		.html(info.name + '<br>')
		.css({fontSize:'1.3em'})
	);
	
	var optionHtml = $('<div>')
		.css({textAlign:'left'});
	var option = info.option;
	
	var helper = function(i){		//mousedown and NOT click... cuz Button.onclick is on down
		return function(){
			OptionList.executeOption(w.main,option[i]);
		}
	}
	for(var i = 0 ; i < option.length ; i++){
		optionHtml.append($('<span>')
			.html(' - ' + option[i].name)
			//.attr('title',option[i].description || option[i].name)	//annoying as fuck
			.addClass('underlineHover')
			.mousedown(helper(i))		//mousedown and NOT click... cuz Button.onclick is on down
		);
		if(i !== option.length-1)
			optionHtml.append('<br>');
	}
	html.append(optionHtml);
	
	var width = Math.max(html.outerWidth(true),50);
	var height = Math.max(html.outerHeight(true),50);
	
	var mouse = Input.getMouse(true);
	var idealX = CST.WIDTH - mouse.x;
	var idealY = CST.HEIGHT - mouse.y - height;
	html.css({
		right:Math.min(Math.max(idealX,0),CST.WIDTH - width-5),
		bottom:Math.min(Math.max(idealY,0),CST.HEIGHT - height-5),
	});	
},null,null,null,null,function(){	//onclose
	$(document).tooltip('enable');
}));

//Dialog.open('permPopup',{text:'heyads asd as das  dsad',model:'',css:{top:'100px',left:'100px',width:'400px',height:'400px'}});
//Dialog.open('permPopup',{text:'heyads asd as das  dsad',model:'',css:{}});
var BOTTOM = 240; //hardcoded
var PERM_WIDTH = 200;
var ON_HELP = false;
var WAS_FORCED = false;

var applyModel = function(html,model){
	if(model === 'aboveInventory'){
		html.css({
			right:0,
			width:PERM_WIDTH,
			bottom:BOTTOM,
			height:'auto',
		});
	}	
	if(model === 'help'){
		html.css({
			right:0,
			width:PERM_WIDTH,
			bottom:BOTTOM,
			height:'auto',
		});
		var close = function(){
			WAS_FORCED = false;
			ON_HELP = false;
			Dialog.close('permPopupMouseover');
		};
		html.hover(function(){
			if(!WAS_FORCED){
				ON_HELP = true;
				Dialog.playSfx('mouseover');
				Command.execute(CST.COMMAND.getTutorialHelp,[]);
			} else 
				close();
		},close);
	}
	
}
Dialog.UI('permPopup',null,{},Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	var def = {	
		position:'absolute',
		zIndex:Dialog.ZINDEX.HIGH,
		fontSize:'1.3em',
		color:'black',
		lineHeight:'100%',
		backgroundColor:'white',
		textAlign:'center',
		border:'1px solid black',
		padding:'2px 2px',
		display:'inline-block',
	}
	
	
	html.css(def);
	html.html(param.text);
	html.css(param.css || {});
	
	html.unbind('mouseout mouseover');
	
	applyModel(html,param.model);
		
}));


setInterval(function(){	//BAD, linked with tutorial
	if(WAS_FORCED)
		$('.' + CST.TUTORIAL_CLASS_BLINK_HELP).toggle();
	else
		$('.' + CST.TUTORIAL_CLASS_BLINK_HELP).hide();		
},1000);


Dialog.UI('permPopupSystem',null,{},Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	var def = {	
		position:'absolute',
		zIndex:Dialog.ZINDEX.HIGH,
		fontSize:'1.3em',
		color:'black',
		lineHeight:'100%',
		backgroundColor:'white',
		textAlign:'center',
		border:'1px solid black',
		padding:'2px 2px',
		display:'inline-block',
	}
	
	html.css(def);
	html.html(param.text);
	html.css(param.css || {});
	
	applyModel(html,param.model);
}));
Dialog.UI('permPopupMouseover',null,{},Dialog.Refresh(function(html,variable,param){
	if(param && param.forceOpen){
		WAS_FORCED = true;
		ON_HELP = true;
	} else
		WAS_FORCED = false;
	if(!param || !ON_HELP) 
		return false;
	
	var def = {	
		position:'absolute',
		zIndex:Dialog.ZINDEX.HIGH,
		fontSize:'1.3em',
		color:'black',
		lineHeight:'100%',
		backgroundColor:'white',
		textAlign:'center',
		border:'1px solid black',
		padding:'2px 2px',
		display:'inline-block',
		right:PERM_WIDTH,
		top:'25%',
	}
	
	html.css(def);
	html.html(param.text);
}));

//#####################

//Dialog.open('questFeedback','QlureKill');
Dialog.UI('questFeedback',null,{		
	position:'absolute',
	top:15,
	left:'50%',
	marginTop:'15px',
	padding:'3px',
	border:'2px solid black',
	zIndex:Dialog.ZINDEX.HIGH,
	fontSize:'1.1em',
	color:'black',
	backgroundColor:'white',
	height:'auto',
	width:'auto',
	textAlign:'center',
	whiteSpace:'nowrap',	
},Dialog.Refresh(function(html,variable,param){
	Dialog.QuestFeedback(html,variable,param);	//cant be direct cuz undefined at this point
}));

Dialog.QuestFeedback = function(html,variable,param){ //param = Main.QuestFeedbackParam
	if(!param) 
		return false;
	if(!param.embed || param.displayStar)
		html.append($('<span>')
			.html(param.embed ? 'Rate: ' : 'Rate ' + QueryDb.getQuestName(param.quest) + ':<br>')
			.css({fontSize:'1.5em'})
		);
	
	//###################
	var STAR_CLICKED = null;
	if(param.displayStar){
		var array = [];	
		
		var hoverOn = function(i){
			return function(){
				if(STAR_CLICKED !== null) return;
				for(var j=0;j<array.length;j++)
					array[j].css({color:i >= j ? 'gold' : 'white'});
			}
		}
		var helper = function(i){
			return function(){
				STAR_CLICKED = i;
				comment.show();
				Dialog.playSfx('select');
			}
		}
		var hoverOff = function(){
			if(STAR_CLICKED !== null) return;
			for(var j=0;j<array.length;j++)
				array[j].css({color:'white'})
		};
		
		for(var i = 0 ; i < 3; i++){
			var span = $('<span>')
				.html(CST.STAR)
				.css({color:'white',fontSize:'2em'})
				.addClass('shadow360')
				.hover(hoverOn(i),hoverOff())
				.click(helper(i));
			array.push(span)		
			html.append(span);
		}
	}
	var aban = $('<select>')
		.append('<option value=""></option>')
		.append('<option value="No clue what to do">No clue what to do</option>')
		.append('<option value="Too Hard">Too hard</option>')
		.append('<option value="Boring quest">Boring quest</option>')
		.append('<option value="Other">Other</option>');
	if(param.abandon)
		html.append('<br>Reason for abandon: ',aban);
		
	//Comment
	var comment = $('<div>')
		.css({textAlign:'center'});
	if(param.displayStar)
		comment.hide();
	var placeholder = param.abandon 
		? 'Tell us more about why you abandonned the quest?' 
		: 'What did you think of the quest?';
	var textarea = $('<textarea>')
		.attr({rows:5,col:50,placeholder:placeholder});
	if(param.embed){
		comment.css({textAlign:'left'});
		textarea.click(function(){
			button.show();
		})
		.attr({rows:3}).css({width:'80%',marginTop:'-20px'})
	}
	//Submit
	var abandonReason = param.abandon ? (aban.val() || 'Not Specified') : "";
	var button = $('<button>')
		.html('Submit')
		.addClass('myButton skinny')
		.attr('title','Submit Quest Rating')
		.click(function(){
			var rating = STAR_CLICKED === null ? 0 : STAR_CLICKED + 1;
			Command.execute(CST.COMMAND.questFeedback,[param.quest,rating,textarea.val(),abandonReason,param.hint]);	//+1 cuz 1-3 stars
			if(!param.embed)
				Dialog.close('questFeedback');
			else
				html.hide();
			Dialog.playSfx('select');
		});
	if(param.embed)
		button.hide();	//shown on click textarea
	comment.append('<br>',textarea,'<br>',button);
	html.append(comment);
	
	
}


Dialog.UI('expPopup',null,{
	position:'absolute',
	left:'60%',
	top:'50%',
	width:'auto',
	height:'auto',
	color:'white',
	fontSize:'1.3em',
},Dialog.Refresh(function(html,variable,param){
	if(!param) 
		return false;
	
	var GEM = Actor.getGEM(w.player);
	param /= GEM;
	
	var val = param.r(0);
	if(val <= 0) 
		return false;
	
	html.html(val + ' Exp <span style="font-size:0.7em">(x' + GEM.r(2) + ')</span>');
	if(variable.timeout)
		clearTimeout(variable.timeout);
	variable.timeout = setTimeout(function(){
		Dialog.close('expPopup');
	},2000);
}));

Dialog.UI('playerOnline','gameBottom',{
	width:'auto',
	height:'auto',
	color:'white',
	fontSize:'0.6em',
},Dialog.Refresh(function(html,variable,temp){
	if(!temp)
		temp = variable.whatever;
	if(!temp) 
		temp = [{name:w.player.name,category:'',comment:''}];
	variable.whatever = temp;
	
	var myCategory = w.main.lookingFor.category;
	
	var sortedList = [];	//kinda bad... but w/e
	for(var i = 0 ; i < temp.length; i++){
		if(temp[i].category === myCategory)
			sortedList.push(temp[i]);
	}
	for(var i = 0 ; i < temp.length; i++){
		if(temp[i].category !== myCategory)
			sortedList.push(temp[i]);
	}
	temp = sortedList;
	
	var div = $('<div>');
	html.append(div);
	
	
	if(w.main.hudState.pvpLookingFor !== Main.hudState.INVISIBLE){
		var pvpButton;
		
		if(w.player.pvpEnabled){
			pvpButton = $('<button>')
				.html('PvP is On')
				.css({top:-3,fontSize:'14px',padding:'2px 3px',marginRight:'3px'})
				.addClass('myButtonGreen')
				.attr('title','Turn PvP Off')
				.click(function(){
					Command.execute(CST.COMMAND.enablePvp,[false]);
				});
		} else {
			pvpButton = $('<button>')
				.html('PvP is Off')
				.css({top:-3,fontSize:'14px',padding:'2px 3px',marginRight:'3px'})
				.addClass('myButtonRed')
				.attr('title','Turn PvP On')
				.click(function(){
					Command.execute(CST.COMMAND.enablePvp,[true]);
				});
		}
		div.append(pvpButton);
		
		/*
		var select = $('<select>').css({color:'black',fontSize:'14px'});
		select.append($('<option>')
			.attr({value:'',selected:!myCategory})
			.html('Want to:')
		);
		select.append($('<option>')
			.attr({value:'PvP',selected:myCategory === 'PvP'})
			.html('PvP')
		);
		select.append($('<option>')
			.attr({value:'Trade',selected:myCategory === 'Trade'})
			.html('Trade')
		);
		select.append($('<option>')
			.attr({value:'Quest',selected:myCategory === 'Quest'})
			.html('Quest')
		);
		
		select.change(function(){
			if(select.val() === ''){
				Command.execute(CST.COMMAND.setLookingFor,['','']);
				return;
			} 
			
			Main.askQuestion(w.main,function(key,str){	
				Command.execute(CST.COMMAND.setLookingFor,[select.val(),str]);
			},'Extra comment (optional)','string');
		});
		div.append(select);
		
		div.append(' ');
		*/
	}
	
	
	
	if(w.main.hudState.playerOnline !== Main.hudState.INVISIBLE){
		if(temp.length <= 1)
			return;
		div.append(temp.length + ' players online: ');
		
		
		div.append('You');
		/*if(w.main.lookingFor.category){
			div.append($('<span>')
				.html(' + ')
				.attr('title',Main.LookingFor.toString(w.main.lookingFor))
			);
		}*/
		if(temp.length > 1)
			div.append(', ');
		
		for(var i = 0; i < temp.length; i++){
			if(temp[i].name !== w.player.name){
				div.append(playerOnlineConverter(temp[i]));
				div.append(', ');
			}
		}	
	}
},function(){
	return '' + w.main.questActive + w.player.pvpEnabled + w.main.lookingFor + w.main.hudState.playerOnline + w.main.hudState.pvpLookingFor;
}));

Dialog.ProcessBarTracker = function(max){
	return {
		max:max || 0,
		min:0,
		value:0,
	}
}

//always open via Dialog.open('processBar',{},true);	//< true to force new
Dialog.UI('processBar',null,{
	position:'absolute',
	top:'5%',
	left:'40%',
	width:'200px',
	height:'auto',
	fontSize:'1.2em',
	background:'white',
	border:'2px solid black',
	borderRadius:'5px',
	padding:'5px 5px',
},Dialog.Refresh(function(html,variable,param){
	if(!param) 
		return false;
	variable.param = param;
	if(variable.param.value >= variable.param.max) 
		return false;
	
	html.show();
	
	var pct = Math.floor((variable.param.value / variable.param.max)*100) + '%';
	var big = $("<div>")
		.css({background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'3px',padding:'2px'})

	var bar = $("<div>")
		.css({pointerEvents:'none',backgroundColor:'green',width:pct,height:'10px',borderRadius:'2px'})
	variable.bar = bar;	
	big.append(bar);
	
	var span = $('<span>')
		.html(variable.param.value + ' / ' + variable.param.max);
	variable.span = span;
	
	var btn = $('<button>')
		.html('Hide Bar')
		.addClass('myButton skinny')
		.css({marginLeft:10})
		.click(function(){
			Dialog.close('processBar');
		});
	html.append(big,span,btn);

	
},function(html,variable,param){
	return '' + Math.floor(variable.param.value);
},3,function(html,variable,param){
	if(variable.param.value >= variable.param.max) 
		return false;
	var pct = Math.floor((variable.param.value / variable.param.max)*100) + '%';
	variable.bar.css({width:pct});
	variable.span.html(Math.floor(variable.param.value) + ' / ' + variable.param.max);
}));

var playerOnlineConverter = function(info){	
	var text = 'Click to send PM. (Map: ' + MapModel.get(info.mapModel).name;
	
	if(info.questActive)
		text += ', Quest: ' + QueryDb.getQuestName(info.questActive);
	if(info.pvpEnabled)
		text += ', PVP';
	text += ')';
	
	var span = $('<span>');
	var name = $('<span>')
		.css({cursor:'pointer'})
		.html(info.name)
		.click(function(){
			Message.setInputForPM(null,info.name);
		})
		.attr('title',text);
		
	span.append(name);
	if(!info.questActive && !info.pvpEnabled && !w.main.questActive && !w.player.pvpEnabled){
		var btn = Img.drawIcon.html('ui-waypoint',20,'Click to teleport to ' + info.name + '.')
			.css({cursor:'pointer'})
			.click(function(){
				Command.execute(CST.COMMAND.teleportTo,[info.name]);
			});
		span.append(' ',btn)
		
	}
	/*
	if(w.main.lookingFor.category && w.main.lookingFor.category === info.category){
		span.css({textDecoration:'underline'})
	}
	
	if(info.category){
		span.append($('<span>')
			.html(' + ')
			.attr('title',Main.LookingFor.toString(info))
			.css({fontSize:'0.8em'})
		);
	}
	*/
	return span;
}


/*	
var TUTORIAL_LINK = 'http://www.youtube.com/embed/pA2u3Gkv2W4';
Dialog.create('videoTutorial','Tutorial',Dialog.Size(800,450),Dialog.Refresh(function(html,variable,param){
	html.css({padding:'0px',overflowX:'hidden',overflowY:'hidden'});
		
	param = param || 0;
	var iframe = $('<iframe>')
		.attr({
			src:TUTORIAL_LINK + '?autoplay=1&modestbranding=1&showinfo=0?start=' + param,
			width:'100%',
			height:'100%',
		})
		.css({
			position:'absolute',top:0,left:0,
			width:'100%',
			height:'100%',
		});
	html.append(iframe);
}));
*/

var Tip = Dialog.Tip = function(category,title,text,advancedText){
	var t = {
		category:category,
		id:Tip.LIST.length,
		title:title,
		text:text,		
		advancedText:advancedText || '',
	}
	Tip.LIST.push(t);
	return t;
}
Tip.LIST = [];

Tip.getRandom = function(category){
	var r = Tip.LIST.$random();
	if(category && r.category !== category)
		return Tip.getRandom(category);
	return r;
}
Tip.get = function(num){
	if(num < 0)
		num += Tip.LIST.length;
	num %= Tip.LIST.length;
	return Tip.LIST[num];
}
Tip.getViaTitle = function(title){
	for(var i = 0 ; i < Tip.LIST.length; i++)
		if(Tip.LIST[i].title === title)
			return Tip.LIST[i];
	return null;
}

var link = function(href,text){
	return '<a target="_blank" style="color:blue;" href="' + href + '">' + text + '</a>';
}
var img = function(src,height){
	return '<img style="margin-top:10px" src="/img/tips/' + src + '.png" height="' + height + '">';
}

;(function(){	//init
	var CAT = {combat:'combat',ui:'ui',misc:'misc'};
	
	Tip(CAT.ui,"Quick Reply","Press tab to reply to the last player who PMed you.");
	Tip(CAT.ui,"Chatting","Press Enter to chat. Messages are sent to every player online no matter where they are.");
	Tip(CAT.ui,"Esc Key","Press Esc to remove the current input in chat, close windows and remove tooltips.");
	Tip(CAT.ui,"Show Item in Chat","Shift-left click an item in inventory to display it in chat. It also works for equips.");
	Tip(CAT.ui,"Links","You can post links in the chat. Links must start with http and your chat line must only contain the link, no other text.");
	Tip(CAT.ui,"PvP","PvP can be enabled anywhere while not doing a quest. When PvP is on, you can kill other players that also have PvP on.<br>" + img('pvp',100));
	Tip(CAT.ui,"Party","Quests can be completed with other players. To do so, you must create a party and invite them.<br>" + img('party',100));
	Tip(CAT.ui,"Teleport to Town","A quick way to come back to the town is with the Teleport to Town button.<br>" + img('homeTele',100));
	Tip(CAT.ui,"Ping","Moving your mouse over the FPS counter will tell you your ping (the time for your inputs to reach the server).<br>" + img('ping',100));
	Tip(CAT.ui,"Join Friends","By right-clicking the name of your friend, you can instantly teleport to his location.<br>" + img('playerOnline',100),
		"You can only join a friend if you aren't doing a quest and aren't in PvP.");
	Tip(CAT.ui,"Abandon Quest","You can abandon an active quest by clicking the X button on the hint.<br>" + img('abandonQuest',100));
	
	
	//Finding Weapons title important Input.onPressAbility
	Tip(CAT.combat,"Finding Weapons","Weapons can be obtained from killing monsters, completing quests or bought from the shop in town.<br>" + img('shop',100));
	Tip(CAT.combat,"Ability & Weapon","You can use any ability with any weapon. (Ex: Slash with a bow. Shoot arrow with a sword.) However, using the wrong weapon will decrease your damage considerably.");
	Tip(CAT.combat,"Party Loot","When a monster dies, it will drop an item for every player who contributed to the kill. You can only see and pick one copy of the item. This means other players can't steal your loot.");
	Tip(CAT.combat,"Monster Exp","Monsters give exp and items upon killing. However, the loot has diminishing returns. The more you kill, the less likely you will get loot. Completing a quest near the enemies location will reset the diminishing returns.");
	Tip(CAT.combat,"Reputation Points","Levelling-up grants a Reputation point that can be used to boost a stat of your choice via the Reputation Grid.");
	Tip(CAT.combat,"Bleeding","Every Melee Ability has a default 5% chance to bleed. Bleed deals damage over time.");
	Tip(CAT.combat,"Knockback","Every Range Ability has a default 5% chance to knockback, pushing the enemy away from you.");
	Tip(CAT.combat,"Mana Drain","Every Arcane Ability has a default 5% chance to drain mana and replenish yours.");
	Tip(CAT.combat,"Burning","Every Fire Ability has a default 5% chance to burn. Burning deals damage over time related to the remaining life.");
	Tip(CAT.combat,"Chilling","Every Cold Ability has a default 5% chance to chill which reduces movement and attack speed.");
	Tip(CAT.combat,"Stun","Every Lightning Ability has a default 5% chance to stun. Stunning stops the targets and reduces its ability charges, delaying its next attack.");
	Tip(CAT.combat,"Cooldowns","Every ability has 2 types of cooldowns. The global cooldown prevents you from using any another ability. The local cooldown prevents you from using the same ability again.");
	Tip(CAT.combat,"Mana","The most powerful abilities require mana. If you don't have enough mana, you can't use them.","You can increase your maximum mana and mana regen with Reputation points and equips. The mana draining status effect that Arcane abilities have quickly regens mana.");
	Tip(CAT.combat,"Weakness","Every monster has a weakness (x2 more damage) and a resistance (x2 less damage) that can be seen when moving your mouse over it.",
		"It is recommended to use two different element types, normally the two elements your weapon is strong in.");
	Tip(CAT.combat,"Equip Boost","Level up to gain access to better equips. Their maximum power increase by 5% every level.");
	Tip(CAT.combat,"Unique Boost","Every equipment has a tiny chance of having an " + link('/wiki/stat','unique boost') + ". Those boosts have very special effects and are very powerful.");
	Tip(CAT.combat,"Monster Scaling","Monsters' damage and defence scale with your own level. They also become stronger if multiple players are around.",
		"Monsters become 5.5% stronger every level. Monsters gains approximately 25% damage and 50% defence for every player nearby");
	Tip(CAT.combat,"Weapon Element","Using an ability that matches the weapon elemental types will increase damage by 50%.",
		"Every weapon has 2 elements. If you are fighting a monster that is resistant to your first weapon element, use the other weapon element.");
	
	Tip(CAT.misc,"Skill Plots","You can only harvest skill plots once (ex: trees). To harvest it again, you need to complete the related quest and wait 15 minutes.",
		"Red trees give wood, rock gives metal and squirrel gives bone. Each skill plot can also give gems (Ruby, Sapphire, Topaz) at random.");
	Tip(CAT.misc,"Material Rarity","There are 6 types of materials. The gems (Ruby, Sapphire, Topaz) are 3 times rarer than the others (Metal, Wood, Bone)");
	Tip(CAT.misc,"Convert Material","You can convert your materials (ex: selling Ruby to get Wood) at the shop.");
	Tip(CAT.misc,"Unlock New Abilities","Completing achievements is the best way to get new abilities. The hardest achievements give the most powerful abilities.");
	Tip(CAT.misc,"Equip Level","Level up to gain access to better equips. Their maximum power increase by 5% every level.");
	Tip(CAT.misc,"Sell Equip","If you no longer need an equip, you can sell it to get useful materials.");
	Tip(CAT.misc,"Unlock Equip Boost","When looting an equip, most of its boosts will be locked. Use materials to upgrade the equip and make it more powerful.");
	Tip(CAT.misc,"GEM","Every exp you get is multiply be your GEM (Global Exp Modifier). Completing quests increase your GEM.","Each quest can give up to +0.10 GEM. This is done by getting 10,000 Score (+0.04 GEM) and completing the 3 challenges. (x3 +0.02 GEM)");
	Tip(CAT.misc,"Challenge","You need to beat a quest at least once before activating a challenge. A challenge gives better rewards but makes the quest harder.");
	
	/*Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");
	Tip(CAT.,"","");*/
	
	
})();

var SHOW_DETAIL = false;
Dialog.create('tips','Tips & Tricks',Dialog.Size(600,'auto',false),Dialog.Refresh(function(html,variable,param){
	param = param || Tip.getRandom();
	
	var div = $('<div>');
	div.append($('<h3>').html('#' + (param.id+1) + ' ' + param.title));
	div.append(param.text);
	if(SHOW_DETAIL)
		div.append(' ' + param.advancedText);
	
	html.append(div);
	
	
	var topRight = $('<div>')
		//.css({position:'absolute',right:'20px',top:'0px'})
		.append(
			$('<div>')
			.addClass('checkbox')
			.append($('<label>')
				.append($('<input>')
					.attr('type','checkbox')
					.change(function(){
						SHOW_DETAIL = $(this)[0].checked;
						Dialog.open('tips',param);
					})
					.prop('checked', SHOW_DETAIL)
					,' Show Details'
				)
			)
		);
	html.append('<br>');		
	html.append(topRight);
	
	var btns = $('<div>').css({position:'absolute',right:'20px',top:'0px'});
		
	btns.append($('<button>')
		.addClass('myButton skinny')
		.html('Previous')
		.click(function(){
			Dialog.open('tips',Tip.get(param.id - 1));
		})
	);
	btns.append($('<button>')
		.addClass('myButton skinny')
		.html('Random')
		.click(function(){
			Dialog.open('tips');
		})
	);
	btns.append($('<button>')
		.addClass('myButton skinny')
		.html('Next')
		.click(function(){
			Dialog.open('tips',Tip.get(param.id + 1));
		})
	);	
	html.append(btns);
	
}));



})();

