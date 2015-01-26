

(function(){ //}

ClientPrediction = {
	ACTIVE:false,
	ABOVE_THRESHOLD_COUNT:0,
	MODE:1,	//YES,AUTO,NEVER
	FORCED:false,
}



ClientPrediction.YES = 0;
ClientPrediction.AUTO = 1;
ClientPrediction.NO = 2;


ClientPrediction.isActive = function(){
	return ClientPrediction.ACTIVE;
}


ClientPrediction.loop = function(){
	if(ClientPrediction.MODE !== ClientPrediction.AUTO) return;
	if(!Input.isWindowActive()) return;
	
	var thres = Main.getPref(main,'clientPredictionThreshold');
	var latency = Performance.getLatency();
	if(latency > thres)	ClientPrediction.ABOVE_THRESHOLD_COUNT++;
	else ClientPrediction.ABOVE_THRESHOLD_COUNT--;
	ClientPrediction.ABOVE_THRESHOLD_COUNT = Math.max(ClientPrediction.ABOVE_THRESHOLD_COUNT,-4);
	ClientPrediction.ABOVE_THRESHOLD_COUNT = Math.min(ClientPrediction.ABOVE_THRESHOLD_COUNT,4);
	
	if(ClientPrediction.ABOVE_THRESHOLD_COUNT >= 4 && !ClientPrediction.ACTIVE){
		ClientPrediction.askForActivation();
	} 
	if(ClientPrediction.ABOVE_THRESHOLD_COUNT <= -4 && ClientPrediction.ACTIVE){
		Message.add(key,'The client prediction system was deactivated as it seems you are lagging less.');
		ClientPrediction.deactivate();
	}
}

ClientPrediction.activate = function(){
	ClientPrediction.ACTIVE = true;
	Message.add(key,'The client prediction system was activated. You can deactivate it via the Setting Tab.');
}
ClientPrediction.deactivate = function(){
	ClientPrediction.ACTIVE = false;
	Message.add(key,'The client prediction system was deactivated.');
}

ClientPrediction.askForActivation = function(){
	Message.addPopup(key,$('<div>')
		.append('It seems you are lagging.<br>')
		.append('Do you want to activate the <u>BETA</u> client prediction system?<br>')
		.append('You can deactivate it via the Setting Tab.<br>')
		.append($('<button>')
			.addClass('myButtonGreen')
			.html('Yes')
			.click(function(){
				ClientPrediction.activate();
				Dialog.close('questPopup');
			})
		)
		.append($('<button>')
			.addClass('myButtonRed')
			.html('No')
			.click(function(){
				ClientPrediction.MODE = ClientPrediction.NO;
				Message.add('You can activate the Client Prediction at any time via the Setting Tab.')
				Dialog.close('questPopup');
			})
		)
	);
}

	
var lastX = 0;
var lastY = 0;

var HISTORY = [];
	
ClientPrediction.updatePosition = function(act){
	var good = null;
	var serverTime = Receive.getServerTimestamp();
	for(var i = 0; i < HISTORY.length; i++){
		if(HISTORY[i].timestamp > serverTime){
			good = HISTORY[i];
			break;
		}				
	}
	good = good || HISTORY[HISTORY.length-1];
	if(!good){
		return HISTORY.push({x:act.x,y:act.y,timestamp:Date.now()}); 
	}
	
	var diffX = act.serverX - good.x;	//serverX = where u should be
	var diffY = act.serverY - good.y;	//x = where u are according to client calc
	
	if(Math.abs(diffX) > 200){
		act.x = act.serverX;
	}
	if(Math.abs(diffY) > 200){
		act.y = act.serverY;
	}
	
	var attraction = Input.state.move.toString() === '0,0,0,0' ? 8 : 3;
	if(diffX > 4){
		act.x += Math.min(diffX/2,attraction);
	}
	if(diffX < -4){
		act.x += Math.max(diffX/2,-attraction);
	}
	if(diffY > 4){
		act.y += Math.min(diffY/2,attraction);
	}
	if(diffY < -4){
		act.y += Math.max(diffY/2,-attraction);
	}
	
	act.spdX = diffX;
	act.spdY = diffY;
	
	HISTORY.push({x:act.x,y:act.y,timestamp:Date.now()});
	if(HISTORY.length > 50){
		HISTORY.splice(0,10);
	}
	if(Math.abs(player.y-lastY) < 1 && Math.abs(player.x-lastX) < 1)
		player.moveAngle = player.angle;
	else
		player.moveAngle = Tk.atan2(player.y-lastY,player.x-lastX);
	lastX = player.x;
	lastY = player.y;
	
}






})(); //{














