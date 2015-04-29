//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Message = require2('Message');
var Dialog = require4('Dialog');
var Main = require3('Main');

Main.Question = function(func,answerType){
	return {
		func:func,
		answerType:answerType,
	}
}

Main.question = function(main,func,text,answerType,option){	//should work client and server
	answerType = answerType || 'boolean';
	text = text || "Are you sure?";
	option = option || [];
	if(answerType === 'boolean') 
		option = [Main.Question.YES,Main.Question.NO];
	
	if(!Main.Question.ANSWER_TYPE.$contains(answerType)) 
		return ERROR(3,'invalid answerType',answerType);
	if(SERVER)
		Main.openDialog(main,'question',Main.Question.Dialog(text,option));
	else
		Dialog.open('question',Main.Question.Dialog(text,option));
	main.question = Main.Question(func,answerType);
	
}
Main.Question.ANSWER_TYPE = ['boolean','number','string','option'];

Main.Question.YES = 'Yes';
Main.Question.NO = 'No';
Main.Question.Dialog = function(text,option){
	return {
		text:text,
		option:option
	}
}
	
Main.handleQuestionAnswer = function(main,msg){	//both
	if(!main.question) return;
	
	var func = main.question.func;
	var answerType = main.question.answerType;
	main.question = null;	//needed cuz func can remodify question
	if(answerType === 'boolean'){
		if(msg.text === Main.Question.YES)
			func(main.id);
		return;
	}
	if(SERVER)
		func.apply(null,[main.id].concat(msg.text.split(',')))
	else
		func.apply(null,msg.text.split(','));
}

Main.question.init = function(){
	Dialog.create('question','Question',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,msg){
		html.css({textAlign:'center'});
		
		html.append($('<div>')
			.html(msg.text + '<br>')
			.css({fontSize:'1.5em',marginLeft:'auto',marginRight:'auto'})
		);
			
		//#####################
		var submitAnswer = function(answer){
			Dialog.close('question');
			if(main.question) //means question was asked on client
				return Main.handleQuestionAnswer(main,Message.QuestionAnswer(answer));
			
			Message.sendToServer(Message.QuestionAnswer(answer));
		}
		
		if(msg.option.length){
			var option = $('<span>');
			
			var click = function(answer){	
				return function(){
					submitAnswer(answer);
				}
			}
			for(var i in msg.option){
				option.append($('<button>')
					.html(msg.option[i])
					.click(click(msg.option[i]))
				);
			}
			html.append(option);
			html.append('<br>');
		} else { //#####################
			var input = $('<input placeholder="answer" type="text">');
			var form = $('<form>')
				.append(input)
				.submit(function(e) {
					e.preventDefault();
					submitAnswer(input.val());
					return false;
				});
			setTimeout(function(){
				input.focus();
			},100);
			html.append(form);
		}
		
	}));
	
}

})(); //{

