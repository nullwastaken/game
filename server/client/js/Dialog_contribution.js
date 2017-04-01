
"use strict";
(function(){ //}
var Command, SpriteModel, Main;
global.onReady(function(){
	Command = rootRequire('shared','Command',true); SpriteModel = rootRequire('shared','SpriteModel',true); Main = rootRequire('shared','Main',true);
});
var Dialog = rootRequire('client','Dialog');

var LOG;
var LOG_LIST = [];
//
var RED = '#FFEEEE';
var YELLOW = '#FFFFEE';
var GREEN = '#EEFFEE';
var TABLE_CSS = {background:'rgba(0,0,0,0.04)',border:'2px solid black',borderRadius:'4px'};

Dialog.create('contribution','Contribution',Dialog.Size(725,600),Dialog.Refresh(function(){
	Dialog.contribution.apply(this,arguments);
},function(){
	return Tk.stringify(w.main.contribution);
}));


Dialog.contribution = function(html,variable,param){
	var c = w.main.contribution;
	html.append('<h3 title="Cumulative CP: ' + c.ptTotal + '">Balance: ' + c.pt + ' CP</h3>');
	
	LOG = LOG || $('<div>');
	html.append(LOG);
	
	html.append(whatIs(c));
	html.append(howToGet(c));
	html.append(chatSymbol(c));
	html.append(chatColor(c));
	html.append(playerSprite(c));
	html.append(bullet(c));
	html.append(broadcastAchievement(c));
}


var whatIs = function(c){
	var div = $('<div class="container2">');
	div.append('<h3>What are Contribution Points?</h3>');
	div.append('<p>Contribution points (CP) are a currency used to purchase cosmetic rewards. They are meant to reward players who contributed to the game in a way or another.</p>');
	return div;
}	
	
var howToGet = function(c){
	var div = $('<div class="container2">');
	div.append('<h3>How to get CP</h3>');
	
	var li = function(str){
		return $('<li>').addClass('list-group-item').html(str);
	}
	var ul = $('<ul>').addClass('list-group').append(
		li('Leave useful quest feedback.'),
		li('<a style="color:blue" target="_blank" href="/contribution">Create maps.</a>'),
		li('Create quests with the <a style="color:blue;" target="_blank" href="/contribution">Quest Creator</a>.')	,
		li('Create new sprites and art. <a style="color:blue;" target="_blank" href="/contribution">Art Bounties</a>.')	
	);
	div.append(ul);
	return div;
	
}


Dialog.contribution.log = function(msg){
	var span = $('<p>')
		.html((new Date()).toLocaleTimeString() + ' ' + msg.text);
	LOG.append(span);
	LOG_LIST.push(span);
	if(LOG_LIST.length > 3){
		LOG_LIST[0].remove();
		LOG_LIST.shift();
	}
	if(msg.scroll)
		LOG[0].scrollIntoView(true);
}

var chatSymbol = function(c){
	var div = $('<div class="container2">');
	div.append('<h3>Name Symbol</h3>');
	div.append('<p>Permanently add a symbol in front of your name in the chat box.</p>');
	div.append('<p>The symbol is unlocked upon reaching the required Cumulative CP.</p>');
	
	var list = [
		['None','',0],
		['Bronze','#CD7F32',10],
		['Silver','#C0C0C0',100],
		['Gold','#FFD700',1000],
		['Diamond','white',10000]	
	];
	
	var helper = function(what){
		return function(){
			Command.execute(CST.COMMAND.contributionSelect,[what]);
		}
	}	
		
	var array = [];
	for(var i = 0 ; i < list.length; i++){
		var html, color;
		var id = 'chatSymbol' + list[i][0];
		if(c.active.chatSymbol === id){
			html = 'Active';
			color = GREEN;
		} else if(c.ptTotal < list[i][2]){
			html = 'Unlocked at ' + list[i][2] + ' CP';
			color = RED;
		} else {
			html = 'Select';
			color = YELLOW;
		}
		
		array.push([
			list[i][0] === 'None' ? 'None' : list[i][0] + ' Contributor',
			list[i][0] === 'None' ? 'YourName:' : '<span><span style="color:' + list[i][1] + ';">★</span>YourName: </span>',
			$('<button>')
				.addClass('myButton')
				.html(html)
				.css({background:color,width:'100%'})
				.click(helper(id))
		]);
	}
	
	var table = Tk.arrayToTable(array,false,false,false,'10px 4px').css(TABLE_CSS);
	div.append(table);
	return div;	
}

var bullet = function(c){
	var div = $('<div class="container2" style="display:block;">');
	div.append('<h3>Bullet Sprite</h3>');
	div.append('<p>Change bullet image.</p>');
	
	var list = [
		['Happy Face','bullet-happyface','bulletLightningball','bulletHappyface',100],
		['Penguin','bullet-penguin','bulletIceshard','bulletPenguin',150],
		['"Cannon"','bullet-cannon','bulletArrow','bulletCannon',200],
		['Pony!','bullet-pony','bulletFireball','bulletPony',250],
	];
	
	var helper = function(action,what){
		return function(){
			Command.execute(action,[what]);
		}
	}
	
	var array = [];
	for(var i = 0 ; i < list.length; i++){
		var html, color, title, action;
		var id = list[i][3];
		if(c.active[list[i][2]] === id){
			html = 'Active';
			title = 'Click to desactivate';
			color = GREEN;
			action = CST.COMMAND.contributionReset;
			id = list[i][2];
		} else if(c.unlocked[id]){
			title = '';
			html = 'Select';
			color = YELLOW;
			action = CST.COMMAND.contributionSelect;
		} else {
			title = '';
			html = 'Cost ' + list[i][4] + ' CP';
			color = c.pt < list[i][4] ? RED : YELLOW;
			action = CST.COMMAND.contributionPurchase;
		}
		
		array.push([
			list[i][0],
			'<img src="/img/ui/contribution/' + list[i][1] + '.png">',
			$('<button>')
				.addClass('myButton')
				.html(html)
				.css({background:color,width:'100%'})
				//.attr('title',title)	//weird bug...
				.click(helper(action,id))
		]);
	}
	
	var table = Tk.arrayToTable(array,false,false,false,'10px 4px').css(TABLE_CSS);
	div.append(table);
	return div;	
}

var chatColor = function(c){
	var div = $('<div class="container2">');
	div.append('<h3>Chat Color</h3>');
	div.append('<p>Modify the color of your text in the chat box.</p>');
	
	var list = [
		['Yellow','yellow',0],
		['Orange','orange',10],
		['Green','#55FF55',20],
		['Pink','pink',50],
		['Cyan','cyan',80],
		['Crimson','#FF5555',100]
	];

	var helper = function(action,what){
		return function(){
			if(!action) return;
			Command.execute(action,[what]);
		}
	}	
		
	var array = [];
	for(var i = 0 ; i < list.length; i++){
		var html,color,action;
		var id = 'chatColor' + list[i][0];
		if(c.active.chatColor === id){
			html = 'Active';
			color = GREEN;
		} else if(c.unlocked[id]){
			html = 'Select';
			color = YELLOW;
			action = CST.COMMAND.contributionSelect;
		} else {
			html = 'Cost ' + list[i][2] + ' CP';
			color = c.pt < list[i][2] ? RED : YELLOW;
			action = CST.COMMAND.contributionPurchase;
		}
		
		array.push([
			'<span class="shadow" style="color:' + list[i][1] + ';">Hello, I\'m ' + list[i][0] + '.</span>',
			$('<button>')
				.addClass('myButton')
				.html(html)
				.css({background:color,width:'100%'})
				.click(helper(action,id))
		]);
	}
	
	var table = Tk.arrayToTable(array,false,false,false,'10px 4px').css(TABLE_CSS);
	div.append(table);
	return div;	
}

var broadcastAchievement = function(c){
	var div = $('<div class="container2">');
	div.append('<h3>Broadcast Achievement</h3>');
	div.append('<p>Display a message to every player upon levelling up or completing a quest.</p>');
	div.append('<p>Current Stock: ' + c.active.broadcastAchievement + '.</p>');
	div.append($('<button>')
		.addClass('myButton')
		.html('Buy 5 for 10 CP')
		.click(function(){
			Command.execute(CST.COMMAND.contributionPurchase,['broadcastAchievement',"5"]);
		})
	);
	return div;
}


var SKIN, BODY, HELM, CANVAS, FIRST = true;
var playerSprite = function(){
	var div = $('<div class="container2">');
	div.append('<h3>Player Sprite</h3>');
	div.append('<p>Change player appearance.</p>');
	
	CANVAS = CANVAS || Tk.createSharpCanvas(270,120);
		
	SKIN = SKIN || $('<select>');
	SKIN.unbind('change');	//BAD... for whatever reason, change gets removed when close then reopen
	SKIN.change(function(){
			playerSprite.onchange();
		});
	BODY = BODY || $('<select>');
	BODY.unbind('change');
	BODY.change(function(){
			playerSprite.onchange();
		});
	HELM = HELM || $('<select>');
	HELM.unbind('change');
	HELM.change(function(){
			playerSprite.onchange();
		});
	
	//left
	var left = $('<div>')	// class="col-xs-6"
		.css({border:'2px solid black',borderRadius:'4px',display:'inline-block'});
	
	var table = Tk.arrayToTable([
		['Skin: ',SKIN],
		['Body: ',BODY],
		['Helm: ',HELM]		
	],false,false,false,'10px 4px');
	left.append(table);
	left.append($('<button>')
		.addClass('myButton')
		.css({width:'100%'})
		.html('Get for 50 CP')
		.click(function(){
			var str = playerSprite.getValue();
			Command.execute(CST.COMMAND.contributionPurchase,['playerSprite',str]);
		})
	);
	left.append('<br>');
	left.append($('<button>')
		.addClass('myButton')
		.css({width:'100%'})
		.html('Reset')
		.click(function(){
			Main.askQuestion(w.main,function(){
				Command.execute(CST.COMMAND.contributionReset,['playerSprite']);
			},'Revert to default player sprite?','boolean');
		})
	);
	//<button onclick="Contribution.reset('player');">Turn Off</button><br>
	
	div.append(left);
	
	//right
	var str = $('<div>')
		.css({display:'inline-block'})
		.append(CANVAS);
	div.append(str);
	
	if(FIRST){
		playerSprite.setSelectOptions();
		FIRST = false;
	}
	return div;
	
}
playerSprite.getValue = function(){
	return SKIN.val() + ';' + BODY.val() + ';' + HELM.val();
}
playerSprite.onchange = function(){
	var ctx = CANVAS[0].getContext('2d');
	ctx.clearRect(0,0,270,120);
	
	var list = playerSprite.getValue().split(';');
	//on screen: 60x80, image: 24x32
	for(var i in list){
		if(list[i] === 'NONE') 
			continue;
		var sp = SpriteModel.get(list[i]);
		if(!sp) return ERROR(3,'invalid sprite',list[i]);
		var img = SpriteModel.getImage(sp,null,playerSprite.onchange);
		if(img){
			ctx.drawImage(img,0,32*2,24,32,0,0,90,120); //facing
			ctx.drawImage(img,0,32*3,24,32,90,0,90,120); //Right
			ctx.drawImage(img,0,32*0,24,32,180,0,90,120); //back
		}
	}
}
playerSprite.setSelectOptions = function(){
	var tmp = {	//duplicated data in Qsystem
		body:[205,206,207,208,209,210,211,221,222,223,224,225,325,326,327,328,410,411,412,413,680],
		helm:[
			//120,
			132,133,134,135,136,137,138,139,140,141,15085,15088,15191,15192,15193,15194,15195,15196,15197,15198,15199,15200,15201,15202,15203,15204,15205,168,169,170,171,172,173,174,175,176,177,178,179,
			1389,1507,230,253,254,255,256,257,361,641
		],
		skin:[115,291,432,434],
	};
	
	var sel = {};
	for(var i in tmp){
		//sel[i] = '<option value="NONE">None</option>';
		for(var j in tmp[i]){
			sel[i] += '<option value="' + tmp[i][j] + '">' + tmp[i][j] + '</option>'
		}
	}
		
	SKIN.html(sel.skin);
	BODY.html(sel.body);
	HELM.html(sel.helm);
	SKIN.val('115');
	BODY.val('207'); //
	HELM.val('15085'); //
	playerSprite.onchange();
}

/*
<h3></h3>
	 
	<br>
	<table style="background-color:rgba(0,0,0,0.2);">
		<tr>
		<td>
			
			<!--Hair: <select class="" id="contributionPlayerSel3" onchange="Contribution.player.update()"></select><br>
			Helm: <select class="" id="contributionPlayerSel4" onchange="Contribution.player.update()"></select><br>
			 Hat: <select class="" id="contributionPlayerSel5" onchange="Contribution.player.update()"></select><br>
			Any: <select class="" id="contributionPlayerSel6" onchange="Contribution.player.update()"></select><br> -->
		</td>
		<canvas width="180" height="80" id="contributionPlayerCanvasFront"></canvas>
	</table>
	<input id="contributionPlayerInput" onchange="Contribution.player.input()" value="115;410;247" size="60"><br>
*/

/*
<h2><button style="text-decoration:underline" id="contributionBtnEarning" onclick="Contribution.click('earning');">
Earning</button> | <button id="contributionBtnSpending" onclick="Contribution.click('spending');">Spending</button> Contribution Points</h2>

<div id="contributionEarning">
	
	<h3>Quest Creation: <span id="contributionQuestPt">0</span> CP Earned</h3>
	Create a quest for GAME_NAME. Grant 1 CP for every player who completes the quest.<br>
	<!-- -->Check this <a style="text-decoration:underline;color:blue;font-size:20px;" href="http://www.youtube.com/watch?v=3j4d2xkhJP4" target="_blank">Youtube video</a> for a fully detailed guide about creating quests for beginner coders.<br>
	History:<div style="padding:5px" id="contributionQuestHistory"></div><br>
	
	<!--
	<h3>Map Creation: </h3>
	Create a map for GAME_NAME.<br>
	CP Earned: <span id="contributionMapPt">0</span> CP<br>
	History:<br>
	<div style="padding:5px" id="contributionMapHistory"></div><br>
	-->
	
	<h3>Youtube: <span id="contributionYoutubePt">0</span> CP Earned <button onclick="Contribution.updateSocialMedia('youtube');">Update</button></h3>
	Post a video on Youtube with GAME_NAME in the title. Grant 1 CP/10 views.<br>
	Account: <input onchange="this.style.color = 'orange';" id="contributionYoutubeUsername" placeholder="None"></input> <button onclick="Contribution.change('youtube',$('#contributionYoutubeUsername')[0].value);">Change Name</button><br>
	History:<div style="padding:5px" id="contributionYoutubeHistory"></div><br>
	
	<h3>Reddit: <span id="contributionRedditPt">0</span> CP Earned <button onclick="Contribution.updateSocialMedia('reddit');">Update</button></h3>
	Post on <a href="http://www.reddit.com/r/rainingchain" target="_blank">www.reddit.com/r/rainingchain</a>. Grant 1 CP per Up Vote.<br>
	Account: <input onchange="this.style.color = 'orange';" id="contributionRedditUsername" placeholder="None"></input> <button onclick="Contribution.change('reddit',$('#contributionRedditUsername')[0].value);">Change Name</button><br>
	History:<div style="padding:5px" id="contributionRedditHistory"></div><br>
	
	<h3>Twitter: <span id="contributionTwitterPt">0</span> CP Earned <button onclick="Contribution.updateSocialMedia('twitter');">Update</button></h3>
	Tweet about GAME_NAME with the hashtag #rainingchain. Grant 1 CP per tweet.<br>
	Account: <input onchange="this.style.color = 'orange';" id="contributionTwitterUsername" placeholder="None"></input> <button onclick="Contribution.change('twitter',$('#contributionTwitterUsername')[0].value);">Change Name</button><br>
	History:<div style="padding:5px" id="contributionTwitterHistory"></div><br>
	
	<h3>Twitch: <span id="contributionTwitchPt">0</span> CP Earned <button title="Click this button while streaming." onclick="Contribution.updateSocialMedia('twitch');">Update</button></h3>
	<!-- -->Stream under the game <a href="http://www.twitch.tv/directory/game/Raining%20Chain" target="_blank" title="Your stream should appear in this list.">"GAME_NAME"</a> on Twitch.<br>
	While streaming, click the Update button to get 1 CP/3 viewers rounded up. (Limit of 1 Update/Hour).<br>
	Account: <input  onchange="this.style.color = 'orange';" id="contributionTwitchUsername" placeholder="None"></input> <button onclick="Contribution.change('twitch',$('#contributionTwitchUsername')[0].value);">Change Name</button><br>
	History:<div style="padding:5px" id="contributionTwitchHistory"></div><br>
	
</div>
*/
})();



