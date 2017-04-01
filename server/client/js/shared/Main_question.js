
"use strict";
(function(){ //}
var Message, Dialog;
global.onReady(function(){
	Message = rootRequire('shared','Message');
	Dialog = rootRequire('client','Dialog',true);
});
var Main = rootRequire('shared','Main');

Main.Question = function(id,func,answerType,preventClose){
	return {
		id:id,
		func:func,
		answerType:answerType,
		preventClose:!!preventClose,
		server:SERVER,
	}
}
Main.Question.Dialog = function(text,option,preventClose){
	return {
		id:Math.randomId(),
		text:text,
		option:option,
		preventClose:!!preventClose,
		server:SERVER,
	}
}
Main.Question.ANSWER_TYPE = ['boolean','number','string','option'];	//HCODE

Main.askQuestion = function(main,func,text,answerType,option,preventClose){	//should work client and server
	answerType = answerType || 'boolean';
	text = text || "Are you sure?";
	option = option || [];
	if(answerType === 'boolean') 
		option = [Main.Question.YES,Main.Question.NO];
	
	if(!Main.Question.ANSWER_TYPE.$contains(answerType)) 
		return ERROR(3,'invalid answerType',answerType);
	
	var pack = Main.Question.Dialog(text,option,preventClose);
	
	if(SERVER)
		Main.setChange(main,'question',pack,true);
	else
		openDialogQuestion(pack);
	
	main.question[pack.id] = Main.Question(pack.id,func,answerType,preventClose);
	setTimeout(function(){
		delete main.question[pack.id];
	},5*60*1000);
}

Main.Question.YES_SLOT = 0;
Main.Question.YES = 'Yes';
Main.Question.NO = 'No';

Main.onChange('question',function(main,data){
	for(var i = 0 ; i < data.length; i++)
		openDialogQuestion(data[i]);
});

var openDialogQuestion = function(data){
	for(var j  = 0; j < 10; j++){
		if(!Dialog.isActive('question' + j)){
			data.questionDialogNum = 'question' + j;
			Dialog.open('question' + j,data);
			return
		}
	}
	ERROR(3,'more than 10 question dialog opened');
}

	
Main.handleQuestionAnswer = function(main,msg){	//both
	var q = main.question[msg.id];
	if(!q)
		return;
	delete main.question[msg.id];
	
	if(q.answerType === 'boolean'){
		if(+msg.text === Main.Question.YES_SLOT)
			q.func(main.id);
		return;
	}
	if(q.answerType === 'option'){
		var num = +msg.text;
		q.func.apply(null,[main.id,num]);
		return;
	}
	
	q.func.apply(null,[main.id].concat(msg.text.split(',')));
	
}

Main.question = {};
Main.question.init = function(){
	var func = function(html,variable,msg){	//msg:Main.Question.Dialog
		html.css({textAlign:'center'});
		html.append($('<div>')
			.html(msg.text + '<br>')
			.css({fontSize:'1.2em',marginLeft:'auto',marginRight:'auto'})
		);
		var ANSWERED = false;
		html.dialog({
			beforeClose: function(){
				if(ANSWERED)
					return true;
				return !msg.preventClose;
			}
		});
		//#####################
		var submitAnswer = function(answer){
			ANSWERED = true;
			Dialog.close(msg.questionDialogNum);	//BAD
			Dialog.playSfx('select');
			var answer = Message.QuestionAnswer(msg.id,answer);
			if(msg.server)
				return Message.sendToServer(answer);			
			Main.handleQuestionAnswer(w.main,answer);
		}
		
		if(msg.option.length){
			var click = function(slot){	
				return function(){
					submitAnswer(slot);
				}
			}
			var optionDiv = $('<div>')
				.css({width:'auto'});
			html.append(optionDiv);
			for(var i in msg.option){
				var width = '80%';
				if(msg.option[i] === Main.Question.YES || msg.option[i] === Main.Question.NO)
					width = 'auto';
				
				optionDiv.append($('<button>')
					.addClass('myButton')
					.css({margin:'3px',width:width})
					.html(msg.option[i])
					.click(click(i))
				);
				optionDiv.append('<br>');
			}
		} else { //#####################
			var input = $('<input placeholder="Answer." type="text">');
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
		
		Dialog.positionPopup(html);		
	};
	
	for(var i = 0 ; i < 10; i++)
		Dialog.create('question' + i,'Question',Dialog.Size('auto','auto'),Dialog.Refresh(func));
	
}

})(); //{

