(function(){ //}
Dialog('basic','Message',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,param){
	if(typeof param === 'string'){
		html.append(param);
		html.dialog('option','title','Message');
	} else {
		html.append(param.text);
		html.dialog('option','title',param.title);
	}
}));

//###########################

Dialog('testQuest','Test Quest',Dialog.Size('auto',300),Dialog.Refresh(function(html,variable,param){
	html.css({fontSize:'1.5em'});
	
	html.append('Click links below to quickly test quests:<br>');
	
	var div = $('<div>').css({marginLeft:'50px'});
	html.append(div);
	for(var i in main.quest){
		div.append($('<a>')
			.click((function(i){
				return function(){
					ts("Debug.startQuest(key,'" + i + "')");
				}
			})(i))
			.html('Quest "' + QueryDb.getQuestName(i) + '"<br>')
		);
	}
}));


//################

Dialog('hax','Most Wanted Hax List',Dialog.Size(700,700),Dialog.Refresh(function(html,variable,param){
	$.get('../html/hax.html').success(function(data){ 
		html.html(data);
	});
}));
//###########################

Dialog('contactAdmin','Contact Admin',Dialog.Size(600,400),Dialog.Refresh(function(html,variable,param){
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

Dialog('disconnect','You have been disconnected.',Dialog.Size(400,200),Dialog.Refresh(function(html,variable,d){
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
},function(html,variable,text){	//param:{x,y,text}
	if(!text) return false;
	
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
		})
		.html(text);
		
	html.append(context);	
});

//#####################
//Dialog.open('questPopup',{text:'hey',time:100})
//Dialog.open('questPopup',{text:'heasdad asd asjkhd askjd askjd haskdh askd haskd haskdhj akdhas kjdh akjdha kjdhaskj hdask dhasdkj asy',time:3000})

//param:{text,time}
Dialog('questPopup','Quest Help',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,param){
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

},function(html,variable,info){	//param:text
	if(!info) return false;
	$(document).tooltip('disable');
	
	html.append($('<span>')
		.html(info.name + '<br>')
		.css({font:'1.3em Kelly Slab'})
	);
	
	var optionHtml = $('<div>')
		.css({textAlign:'left'});
	var option = info.option;
	for(var i = 0 ; i < option.length ; i++){
		optionHtml.append($('<span>')
			.html(' - ' + option[i].name)
			//.attr('title',option[i].description || option[i].name)	//annoying as fuck
			.addClass('underlineHover')
			.mousedown((function(i){		//mousedown and NOT click... cuz Button.onclick is on down
				return function(){
					OptionList.executeOption(main,option[i]);
				}
			})(i))
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
	
	
},null,null,null,function(){	//onclose
	$(document).tooltip('enable');
});






//Dialog.open('permPopup',{text:'heyads asd as das  dsad',css:{top:'100px',left:'100px',width:'400px',height:'400px'}});
//Dialog.open('permPopup',{text:'heyads asd as das  dsad',css:{}});
Dialog.UI('permPopup',{},function(html,variable,param){
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
});




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
	
},function(html,variable,param){
	if(!param) return false;
	var star = ' ★ ';
	html.append($('<span>')
		.html('Rate ' + QueryDb.getQuestName(param.quest) + ':<br>')
		.css({fontSize:'1.5em'})
	);
	//###################
	var STAR_CLICKED = null;
	var array = [];		
	for(var i = 0 ; i < 3; i++){
		var span = $('<span>')
			.html(star)
			.css({color:'white',fontSize:'2em'})
			.addClass('shadow360')
			.hover((function(i){
					return function(){
						if(STAR_CLICKED !== null) return;
						for(var j=0;j<array.length;j++)
							array[j].css({color:i >= j ? 'gold' : 'white'});
					}
				})(i),
				function(){
					if(STAR_CLICKED !== null) return;
					for(var j=0;j<array.length;j++)
						array[j].css({color:'white'})
				}
			)
			.click(function(i){
				return function(){
					STAR_CLICKED = i;
					div.show();
				}
			}(i));
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
	
	
});



Dialog.UI('expPopup',{
	position:'absolute',
	left:CST.WIDTH2 + 100,
	top:CST.HEIGHT2,
	width:'auto',
	height:'auto',
	color:'white',
	font:'1.3em Kelly Slab',
},function(html,variable,param){
	if(!param) return false;
	var val = param.r(0);
	var str = val < 0 ? val : '+' + val;
	html.html(val + ' Exp');
	if(variable.timeout)
		clearTimeout(variable.timeout);
	variable.timeout = setTimeout(function(){
		Dialog.close('expPopup');
	},2000);
});

Dialog.UI('playerOnline',{
	position:'absolute',
	top:CST.HEIGHT,
	width:CST.WIDTH,
	height:'auto',
	color:'white',
	font:'1.6em Kelly Slab',
},function(html,variable,temp){
	
	if(!temp)
		temp = variable.whatever;
	if(!temp) 
		return false;
	variable.whatever = temp;
	
	var div = $('<div>')
		.html(temp.playerOnline.length + ' player(s) online: You ');
	html.append(div);
		
	if(player.pvpEnabled){
		var pvpButton = $('<button>')
			.html('PvP On')
			.css({top:-3,fontSize:'12px',padding:'2px 3px'})
			.addClass('myButtonGreen')
			.attr('title','Turn PvP Off')
			.click(function(){
				Command.execute('enablePvp',[false]);
			});
	} else {
		var pvpButton = $('<button>')
			.html('PvP Off')
			.css({top:-3,fontSize:'12px',padding:'2px 3px'})
			.addClass('myButtonRed')
			.attr('title','Turn PvP On')
			.click(function(){
				Command.execute('enablePvp',[true]);
			});
	}
	div.append(pvpButton);
	div.append(' | ');
	
		
	for(var i in temp.playerOnline){
		if(temp.playerOnline[i].username === player.name)
			continue;
		div.append($('<span>')
			.html(temp.playerOnline[i].username)
			.click((function(i){
				return function(){
					Message.setInputForPM(key,temp.playerOnline[i].username);
				}
			})(i))
			.attr('title','Click to send PM')
		);
		if(temp.playerOnline[i].pvp){
			div.append($('<span>')
				.html(' (PvP)')
				.attr('title','This player has enabled PvP.')
				.css({fontSize:'0.5em'})
			);
		}
		
		if(i != temp.playerOnline.length - 1)
			div.append(', ');
	}
	//$('#playerOnline').html(div);
	
	
},function(){
	return '' + player.pvpEnabled;
});





})();

