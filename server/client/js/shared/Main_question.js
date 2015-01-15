//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['Server','Save','ItemList','Main','Contribution','Message']));

Main.Question = function(func,answerType){
	return {
		func:func,
		answerType:answerType,
	}
}

Main.question = function(main,func,text,answerType,option){
	answerType = answerType || 'boolean';
	text = text || "Are you sure?";
	option = option || [];
	if(answerType === 'boolean') 
		option = [Main.Question.YES,Main.Question.NO];
	
	if(!Main.Question.ANSWER_TYPE.contains(answerType)) 
		return ERROR(3,'invalid answerType',answerType);
	
	Main.openDialog(main,'question',Main.Question.Dialog(text,option));
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
			SERVER ? func(main.id) : func();
		return;
	}
	SERVER ? func.apply(null,[main.id].concat(msg.text.split(','))) : func.apply(null,msg.text.split(','));
}

Main.question.init = function(){
	Dialog('question','Question',Dialog.Size(300,200),Dialog.Refresh(function(html,variable,msg){
		html.css({textAlign:'center'});
		
		html.append($('<span>')
			.html(msg.text + '<br>')
			.css({fontSize:'1.5em'})
		);
			
		//#####################
		var submitAnswer = function(answer){
			Dialog.close('question');
			if(main.question) //means question was asked on client
				return Main.handleQuestionAnswer(main,answer);
			
			Message.sendToServer(Message('questionAnswer',answer,player.name));
		}
		
		if(msg.option.length){
			var option = $('<span>');
			
			for(var i in msg.option){
				option.append($('<button>')
					.html(msg.option[i])
					.click((function(answer){	
						return function(){
							submitAnswer(answer);
						}
					})(msg.option[i]))
				);
			}
			html.append(option);
			html.append('<br>');
		} else { //#####################
			var form = $('<form>')
				.append('<input id="questionInput"  placeholder="answer" type="text">')
				.submit(function(e) {
					e.preventDefault();
					submitAnswer($('#questionInput').val());
					return false;
				});
			html.append(form);
		}
		
	}));
	
}

