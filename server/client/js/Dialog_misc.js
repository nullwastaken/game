//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var QueryDb = require4('QueryDb'), Message = require4('Message'), OptionList = require4('OptionList'), Input = require4('Input'), Command = require4('Command'), Main = require4('Main');
var Dialog = require3('Dialog');

Dialog.create('hax','Most Wanted Hax List',Dialog.Size(700,700),Dialog.Refresh(function(html,variable,param){
	$.get('../html/hax.html').success(function(data){ 
		html.html(data);
	});
}));

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
			Message.add(key,"Your message has been sent.");
			Dialog.close('contactAdmin');
		})
	);	
}));

//###########################

Dialog.create('disconnect','You have been disconnected.',Dialog.Size(400,200),Dialog.Refresh(function(html,variable,d){
	var text = '<strong>Alert:</strong><br> ' + d.message;
	html.css({color:'white',font:'1.5em Kelly Slab',backgroundColor:'red'})
	html.append(text);
	
	setTimeout(function(){
		Dialog.close('disconnect');
		location.reload();
	},5000);
	
}));

//#####################

Dialog.UI('context',{	
	position:'relative',	//html width = CST.WIDTH, but only act as container
	height:150,
	width:CST.WIDTH,
	textAlign:'center',
	zIndex:Dialog.ZINDEX.HIGH,
	pointerEvents:'none',
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
	html.hide();
	return null;	//Dialog.open wont force the show
},function(){},10000000,function(html,variable,text){
	if(variable.text === text)
		return;
	if(!text){
		variable.text = text;
		html.hide();
		return;
	}
	if(!variable.text){
		html.show();
	}
	variable.text = text;
	variable.div.html(text);
}));

//#####################
//Dialog.open('questPopup',{text:'hey',time:100})
//Dialog.open('questPopup',{text:'heasdad asd asjkhd askjd askjd haskdh askd haskd haskdhj akdhas kjdh akjdha kjdhaskj hdask dhasdkj asy',time:3000})

//param:{text,time}
Dialog.create('questPopup','Quest Help',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,param){
	html.css({	
		zIndex:Dialog.ZINDEX.HIGH,	
		font:'18px Kelly Slab',
		fontSize:'1.3em',
		color:'black',
		lineHeight:'100%',
		backgroundColor:'whit1e',
		maxWidth:'600px',
		width:'400px',
		height:'auto',
		textAlign:'center',
		display:'inline-block',
	});
	
	if(!param) return false;
	if(variable.timeout) 
		clearTimeout(variable.timeout)
	
	variable.timeout = setTimeout(function(){
		Dialog.close('questPopup');
	},param.time * 40);
	
	html.html(param.text);

}));

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
	
	var mouse = Input.getMouse();
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
		//width:'auto',
		//height:'auto',
		textAlign:'center',
		border:'1px solid black',
		padding:'2px 2px',
		display:'inline-block',
	}
	
	html.css(def);
	html.html(param.text);
	html.css(param.css || {});
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
		//width:'auto',
		//height:'auto',
		textAlign:'center',
		border:'1px solid black',
		padding:'2px 2px',
		display:'inline-block',
	}
	
	html.css(def);
	html.html(param.text);
	html.css(param.css || {});
}));


//#####################

//Dialog.open('questRating','QlureKill');
Dialog.UI('questRating',{	
	position:'absolute',
	top:15,
	left:CST.WIDTH/2,
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
	
},Dialog.Refresh(function(html,variable,param){
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
	for(var i = 0 ; i < 3; i++){
		var span = $('<span>')
			.html(CST.STAR)
			.css({color:'white',fontSize:'2em'})
			.addClass('shadow360')
			.hover(hoverOn(i),
				function(){
					if(STAR_CLICKED !== null) return;
					for(var j=0;j<array.length;j++)
						array[j].css({color:'white'})
				}
			)
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
	var abandonReason = param.abandon ? (aban.val() || 'notSpecified') : 'N/A';
	var button = $('<button>')
		.html('Submit')
		.addClass('myButton skinny')
		.attr('title','Submit Quest Rating')
		.click(function(){
			Command.execute('questRating',[param.quest,STAR_CLICKED+1,textarea.val(),abandonReason]);	//+1 cuz 1-3 stars
			Dialog.close('questRating');
			Message.add(key,'Thanks for your feedback.');
		})
		
	div.append(textarea).append('<br>').append(button);
	html.append('<br>')
	html.append(div);
	
	
}));

Dialog.UI('expPopup',{
	position:'absolute',
	left:CST.WIDTH2 + 100,
	top:CST.HEIGHT2,
	width:'auto',
	height:'auto',
	color:'white',
	font:'1.3em Kelly Slab',
},Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	var val = param.r(0);
	html.html(val + ' Exp');
	if(variable.timeout)
		clearTimeout(variable.timeout);
	variable.timeout = setTimeout(function(){
		Dialog.close('expPopup');
	},2000);
}));

Dialog.UI('playerOnline',{
	position:'absolute',
	top:CST.HEIGHT,
	width:CST.WIDTH,
	height:'auto',
	color:'white',
	font:'1.6em Kelly Slab',
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


var playerOnlineConverter = function(info){	
	var span = $('<span>')
		.html(info.username)
		.click(function(){
			Message.setInputForPM(key,info.username);
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










})();

