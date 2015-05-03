//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var QueryDb = require4('QueryDb'), Message = require4('Message'), OptionList = require4('OptionList'), Input = require4('Input'), Command = require4('Command'), Main = require4('Main');
var Dialog = require3('Dialog');
/*Dialog.create('hax','Most Wanted Hax List',Dialog.Size(700,700),Dialog.Refresh(function(html,variable,param){
	$.get('../html/hax.html').success(function(data){ 
		html.html(data);
	});
}));*/

//###########################

Dialog.create('contactAdmin','Contact Admin',Dialog.Size(600,400),Dialog.Refresh(function(html,variable,param){
	html.append('Title: ');
	var title = $('<input>')
		.val(param || '');
	html.append(title);
	
	html.append('<br>');
	var text = $('<textarea>')
		.attr({rows:10,cols:50});
	html.append(text)
	html.append('<br>');
	html.append($('<button>')
		.addClass('myButton')
		.html('Submit')
		.click(function(){
			Message.sendToServer(Message.Report(text.val(),player.name,title.val()));
			Message.add(null,"Your message has been sent.");
			Dialog.close('contactAdmin');
		})
	);	
}));

//###########################

Dialog.UI('disconnect',{	
	position:'absolute',
	top:'30%',
	left:'40%',
	border:'2px solid black',
	zIndex:Dialog.ZINDEX.HIGH,	
	font:'1.5em Kelly Slab',
	backgroundColor:'red',
	height:'auto',
	width:'auto',
	textAlign:'center',
	color:'white',
	padding:'20px 20px 20px 20px',	//0px cuz h3?
},Dialog.Refresh(function(html,variable,d){	//d:{message,backgroundColor}	check Sign.off
	if(!d) return false;
	html.html(d.message);
	html.css({backgroundColor:d.backgroundColor});
	setTimeout(function(){
		Dialog.close('disconnect');
		location.reload();
	},5000);	
}));



//#####################

Dialog.UI('context',{		//uses Dialog.quickContextRefresh
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
			font:'1.5em Kelly Slab',
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
	variable.hidden = true;
	html.hide();
	return null;	//Dialog.open wont force the show
},function(){},10000000,function(html,variable,text){
	if(variable.oldText === text)
		return;
	variable.oldText = text;
	if(!text){
		variable.hidden = true;
		html.hide();
		return;
	}
	if(variable.hidden){
		html.show();
	}
	variable.div.html(text);
}));

//#####################
//Dialog.open('questPopup',{text:'hey',time:100})
//Dialog.open('questPopup',{text:'heasdad asd asjkhd askjd askjd haskdh askd haskd haskdhj akdhas kjdh akjdha kjdhaskj hdask dhasdkj asy',time:3000})

//param:{text}
var questPopupCOUNT = 10;	
(function(){ //}
	var func = function(html,variable,param){
		html.css({	
			zIndex:Dialog.ZINDEX.HIGH + 5,	
			font:'18px Kelly Slab',
			fontSize:'1.3em',
			color:'black',
			lineHeight:'100%',
			backgroundColor:'white',
			maxWidth:'600px',
			width:'400px',
			height:'auto',
			textAlign:'center',
			display:'inline-block',
		});
		
		if(!param) return false;
		/*
		if(variable.timeout) 
			clearTimeout(variable.timeout)
		
		variable.timeout = setTimeout(function(){
			Dialog.close('questPopup');
		},param.time * 40);
		*/
		var x = 50 + Math.randomML()*5 + "%";
		var y = 50 + Math.randomML()*5 + "%";
		html.dialog('option','position',[x,y]);	//so dont perfectly pile up
		html.html(param.text);
	};
	for(var i = 0 ; i < questPopupCOUNT; i++){
		Dialog.create('questPopup' + i,'Info',Dialog.Size('auto','auto'),Dialog.Refresh(func));
	}
})(); //{

Dialog.displayQuestPopup = function(msg){
	for(var i = 0 ; i < questPopupCOUNT; i++){
		if(!Dialog.isActive('questPopup'+i)){
			Dialog.open('questPopup'+i,msg);
			return;
		}
	}
	//all 10 used, overwrite first one
	Dialog.open('questPopup0',msg);
}

//#####################

Dialog.UI('optionList',{	
	position:'absolute',
	
	marginTop:'15px',
	padding:'3px',
	border:'2px solid black',
	zIndex:Dialog.ZINDEX.HIGH,	
	font:'1.1em Kelly Slab',
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
		.css({font:'1.3em Kelly Slab'})
	);
	
	var optionHtml = $('<div>')
		.css({textAlign:'left'});
	var option = info.option;
	
	var helper = function(i){		//mousedown and NOT click... cuz Button.onclick is on down
		return function(){
			OptionList.executeOption(main,option[i]);
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
	
	var width = html.outerWidth(true).mm(50);
	var height = html.outerHeight(true).mm(50);
	
	var mouse = Input.getMouse(true);
	var idealX = CST.WIDTH - mouse.x;
	var idealY = CST.HEIGHT - mouse.y - height;
	html.css({
		right:idealX.mm(0,CST.WIDTH - width-5),
		bottom:idealY.mm(0,CST.HEIGHT - height-5),
	});
	
	
},null,null,null,null,function(){	//onclose
	$(document).tooltip('enable');
}));

//Dialog.open('permPopup',{text:'heyads asd as das  dsad',css:{top:'100px',left:'100px',width:'400px',height:'400px'}});
//Dialog.open('permPopup',{text:'heyads asd as das  dsad',css:{}});
var BOTTOM = 240; //hardcoded
Dialog.UI('permPopup',{},Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	var def = {	
		position:'absolute',
		zIndex:Dialog.ZINDEX.HIGH,
		font:'18px Kelly Slab',
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
	
	if(param.model === 'aboveInventory'){
		html.css({
			right:0,
			width:200,
			bottom:BOTTOM,
			height:'auto',
		});
	}	
}));

Dialog.UI('permPopupSystem',{},Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	var def = {	
		position:'absolute',
		zIndex:Dialog.ZINDEX.HIGH,
		font:'18px Kelly Slab',
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
	
	if(param.model === 'aboveInventory'){
		html.css({
			right:0,
			width:200,
			bottom:BOTTOM,
		});
	}
}));

//#####################

//Dialog.open('questRating','QlureKill');
Dialog.UI('questRating',{		
	position:'absolute',
	top:15,
	left:'50%',
	marginTop:'15px',
	padding:'3px',
	border:'2px solid black',
	zIndex:Dialog.ZINDEX.HIGH,
	font:'1.1em Kelly Slab',
	color:'black',
	backgroundColor:'white',
	height:'auto',
	width:'auto',
	textAlign:'center',
	whiteSpace:'nowrap',	
},Dialog.Refresh(function(html,variable,param){ //param = Main.displayQuestRating
	if(!param) return false;
	html.append($('<span>')
		.html('Rate ' + QueryDb.getQuestName(param.quest) + ':<br>')
		.css({fontSize:'1.5em'})
	);
	//###################
	var STAR_CLICKED = null;
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
			div.show();
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
	
	var aban = $('<select>')
		.append('<option value=""></option>')
		.append('<option value="No clue what to do">No clue what to do</option>')
		.append('<option value="Too Hard">Too hard</option>')
		.append('<option value="Boring quest">Boring quest</option>')
		.append('<option value="Other">Other</option>');
	if(param.abandon)
		html.append('<br>Reason for abandon: ',aban);
	
	//Comment
	var div = $('<div>')
		.css({textAlign:'center'})
		.hide();
	var placeholder = param.abandon ? 'Tell us more about why you abandonned the quest?' : 'Comment - Your feedback is highly appreciated!';
	var textarea = $('<textarea>')
		.attr({rows:5,col:50,placeholder:placeholder});
		
	//Submit
	var abandonReason = param.abandon ? (aban.val() || 'Not Specified') : "";
	var button = $('<button>')
		.html('Submit')
		.addClass('myButton skinny')
		.attr('title','Submit Quest Rating')
		.click(function(){
			Command.execute('questRating',[param.quest,STAR_CLICKED+1,textarea.val(),abandonReason,param.hint]);	//+1 cuz 1-3 stars
			Dialog.close('questRating');
		})
		
	div.append(textarea).append('<br>').append(button);
	html.append('<br>')
	html.append(div);
	
	
}));

Dialog.UI('expPopup',{
	position:'absolute',
	left:'60%',
	top:'50%',
	width:'auto',
	height:'auto',
	color:'white',
	font:'1.3em Kelly Slab',
},Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	var val = param.r(0);
	if(val <= 0) return false;
	html.html(val + ' Exp');
	if(variable.timeout)
		clearTimeout(variable.timeout);
	variable.timeout = setTimeout(function(){
		Dialog.close('expPopup');
	},2000);
}));

Dialog.UI('playerOnline',{
	width:'auto',
	height:'auto',
	color:'white',
	font:'0.8em Kelly Slab',
},Dialog.Refresh(function(html,variable,temp){
	if(!temp)
		temp = variable.whatever;
	if(!temp) 
		temp = {playerOnline:[{username:player.name,category:'',comment:''}]};
	variable.whatever = temp;
	
	var myCategory = main.lookingFor.category;
	
	var sortedList = [];	//kinda bad... but w/e
	for(var i = 0 ; i < temp.playerOnline.length; i++){
		if(temp.playerOnline[i].category === myCategory)
			sortedList.push(temp.playerOnline[i]);
	}
	for(var i = 0 ; i < temp.playerOnline.length; i++){
		if(temp.playerOnline[i].category !== myCategory)
			sortedList.push(temp.playerOnline[i]);
	}
	temp.playerOnline = sortedList;
	
	var div = $('<div>');
	
	
	if(main.hudState.pvpLookingFor !== Main.hudState.INVISIBLE){
		var pvpButton;
		
		if(player.pvpEnabled){
			pvpButton = $('<button>')
				.html('PvP On')
				.css({top:-3,fontSize:'14px',padding:'2px 3px'})
				.addClass('myButtonGreen')
				.attr('title','Turn PvP Off')
				.click(function(){
					Command.execute('enablePvp',[false]);
				});
		} else {
			pvpButton = $('<button>')
				.html('PvP Off')
				.css({top:-3,fontSize:'14px',padding:'2px 3px'})
				.addClass('myButtonRed')
				.attr('title','Turn PvP On')
				.click(function(){
					Command.execute('enablePvp',[true]);
				});
		}
		div.append(pvpButton);
		
		
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
				Command.execute('setLookingFor',['','']);
				return;
			} 
			
			Main.question(main,function(str){	
				Command.execute('setLookingFor',[select.val(),str]);
			},'Extra comment (optional)','string');
		});
		div.append(select);
		
		div.append(' ');
	}
	
	
	
	div.append(temp.playerOnline.length + ' player(s) online: ');
	
	html.append(div);
	
	div.append('You');
	if(main.lookingFor.category){
		div.append($('<span>')
			.html(' + ')
			.attr('title',Main.LookingFor.toString(main.lookingFor))
		);
	}
	if(temp.playerOnline.length > 1)
		div.append(', ');
	
	for(var i = 0; i < temp.playerOnline.length; i++){
		if(temp.playerOnline[i].username !== player.name){
			div.append(playerOnlineConverter(temp.playerOnline[i]));
			div.append(', ');
		}
	}	
	
},function(){
	return '' + player.pvpEnabled + main.lookingFor + main.hudState.pvpLookingFor;
}));
Dialog.setParent('playerOnline','#playerOnline');

Dialog.UI('processBar',{
	position:'absolute',
	top:'50%',
	left:'50%',
	width:'300px',
	height:'auto',
	font:'1.6em Kelly Slab',
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
	
	var pct = Math.floor((variable.param.value / variable.param.max)*100) + '%';
	var big = $("<div>")
		.css({background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'3px',padding:'2px'})

	var bar = $("<div>")
		.css({pointerEvents:'none',backgroundColor:'green',width:pct,height:'15px',borderRadius:'2px'})
	variable.bar = bar;	
	big.append(bar);
	var span = $('<span>')
		.html(variable.param.value + ' / ' + variable.param.max);
	variable.span = span;
	var btn = $('<button>')
		.html('Hide Bar')
		.addClass('myButton')
		.css({marginLeft:10})
		.click(function(){
			Dialog.close('processBar');
		});
	html.append(big,span,btn);
},function(html,variable,param){
	return '' + variable.param.value;
},3,function(html,variable,param){
	if(variable.param.value >= variable.param.max) 
		return false;
	var pct = Math.floor((variable.param.value / variable.param.max)*100) + '%';
	variable.bar.css({width:pct});
	variable.span.html(variable.param.value + ' / ' + variable.param.max);
}));

var playerOnlineConverter = function(info){	
	var span = $('<span>')
		.html(info.username)
		.click(function(){
			Message.setInputForPM(null,info.username);
		})
		.attr('title','Click to send PM');
	if(main.lookingFor.category && main.lookingFor.category === info.category){
		span.css({textDecoration:'underline'})
	}
	
	if(info.category){
		span.append($('<span>')
			.html(' + ')
			.attr('title',Main.LookingFor.toString(info))
			.css({fontSize:'0.8em'})
		);
	}
	return span;
}

Dialog.create('adminQuestRating','Quest Rating',Dialog.Size(800,700),Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	html.html('');
	var questList = {};
	
	for(var i = 0 ; i < param.list.length; i++){
		var q = param.list[i];
		if(!q.text && !q.abandonReason) continue;
		questList[q.quest] = questList[q.quest] || [];
		questList[q.quest].push(q);
	}
	var div = $('<div>').css({height:500,overflowY:'scroll'});
	html.append(div);
	
	var helper = function(q,btn){
		return function(){
			Command.execute('addCPQuestFeedback',[q.username,QueryDb.getQuestName(q.quest)]);			
			btn.hide();
		}
	}
	
	for(var i in questList){
		div.append('<h3>' + i + '</h3>');
		for(var j = 0 ; j < questList[i].length; j++){
			var q = questList[i][j];
			var str = q.username + ': ' + q.text;
			
			if(q.hint)
				str += '<br> &nbsp;&nbsp;&nbsp;&nbsp;Hint: ' + q.hint;
			if(q.abandonReason)
				str += '<br> &nbsp;&nbsp;&nbsp;&nbsp;Abandon: ' + q.abandonReason;
			str += '<hr>';
			
			var btn = $("<button>")
				.html('+');
			btn.click(helper(q,btn));
				
			div.append(btn,str);
		}
	}
	html.append('<br>',$('<button>')
		.html('Set as Read')
		.click(function(){
			ts.setQuestRatingAsRead();
		})
	);
}));

Dialog.create('adminQuestStats','Quest Statistics',Dialog.Size(800,700),Dialog.Refresh(function(html,variable,param){
	var array = [
		['Quest','# Complete','% Complete','# Repeat'],
	];
	for(var i in main.quest){
		var q = QueryDb.get('quest',i);
		if(!q) 
			continue;
		if(['Qdebug','Qhighscore','Qcontribution'].$contains(i))
			continue;
		array.push([
			i,
			q.statistic.countComplete,
			q.statistic.countStarted === 0 ? ' - ' : Math.floor(q.statistic.countComplete / q.statistic.countStarted * 100) + "%",
			Tk.round(q.statistic.averageRepeat,2)	
		]);		
	}
	html.html(Tk.arrayToTable(array,true,false,true));	
}));



Dialog.create('adminSpyPlayer','Spy Players',Dialog.Size(800,700),Dialog.Refresh(function(html,variable,param){
	html.append($('<button>')
		.html('Refresh')
		.click(function(){
			ts.spyPlayer();
		})
	);
	
	var array = [
		['Name','Key','Map','Quest','Spy'],
	];
	
	param.data.sort(function(a,b){
		return a.username < b.username;
	})
	
	var helper = function(id){
		return function(){
			Command.execute('activeBotwatch',[id]);
		}
	}
	
	for(var i = 0 ; i < param.data.length; i++){
		array.push([
			param.data[i].username,
			param.data[i].id,
			param.data[i].map,
			param.data[i].questActive,
			$('<button>')
				.click(helper(param.data[i].id))
				.html('Spy')
		]);
	}
	html.append('<br>',Tk.arrayToTable2(array,true).addClass('table selectable'));	
}));



})();

