(function(){ //}
var HEIGHT_BTN = 60;
var HEIGHT_INV = 110;
var HEIGHT_BAR = 110;

//Dialog.open('inventory')
Dialog.UI('tabButton',{
	position:'absolute',
	left:CST.WIDTH-200,
	top:CST.HEIGHT-HEIGHT_BTN,
	width:200,
	height:HEIGHT_BTN,
	background:'rgba(0,0,0,0.2)',
	padding:'2px 2px',
	overflowY:"hidden",
	border:'1px solid black',
},function(html){
	Main.hudState.clearInterval(['tab-equip','tab-ability','tab-stat','tab-quest','tab-reputation','tab-highscore','tab-friend','tab-feedback','tab-homeTele','tab-setting']);
	if(main.hudState.tab === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	var array = [
		[
			Main.hudState.applyHudState('tab-equip',Img.drawIcon.html('tab.equip',24,'Open Equip Window',function(){
				Dialog.open('equip');
			})),
			Main.hudState.applyHudState('tab-ability',Img.drawIcon.html('tab.ability',24,'Open Ability Window',function(){
				Dialog.open('ability');
			})),
			Main.hudState.applyHudState('tab-stat',Img.drawIcon.html('attackMelee.slash',24,'Open Stat Window',function(){
				Dialog.open('stat');
			})),
			Main.hudState.applyHudState('tab-quest',Img.drawIcon.html('tab.quest',24,'Open Quest List Window',function(){
				Dialog.open('questList');
			})),
			
		],
		[
			Main.hudState.applyHudState('tab-reputation',Img.drawIcon.html('tab.reputation',24,'Open Reputation Grid',function(){
				Dialog.open('reputation');
			})),
			Main.hudState.applyHudState('tab-highscore',Img.drawIcon.html('tab.quest',24,'Open Highscore Window',function(){
				Dialog.open('highscore');
			})),
			/*Main.hudState.applyHudState('tab-friend',Img.drawIcon.html('tab.friend',24,'Open Friend List',function(){
				Dialog.open('friend');
			})),*/
			/*Main.hudState.applyHudState('tab-feedback',Img.drawIcon.html('system.flag',24,'Leave Feedback',function(){
				Message.addPopup(main.id,'Click the Display/Hide Comments button below the game box.');
			})),*/
			Main.hudState.applyHudState('tab-homeTele',Img.drawIcon.html('minimapIcon.door',24,'Abandon Active Quest and teleport to Town',function(){
				Command.execute('hometele',[]);
			})),	
			Main.hudState.applyHudState('tab-setting',Img.drawIcon.html('tab.pref',24,'Settings',function(){
				Dialog.open('setting');
			}))
		],
	];	
	/*
	Main.a ddBtn(main,Button(Dr aw.icon("tab.quest",s.w-24*3,CST.HEIGHT-24,24),'Shift-Left: Check Contribution Rewards',{
			"shiftLeft":Button.Click(Command.execute,'reward,open'),
		}));
	*/
	
	var table = Tk.arrayToTable(array,false,false,false,'4px 1px');
	table.addClass('center');
	html.append(table);
},function(){
	return Tk.stringify(main.hudState);
});


//##################

//Dialog.open('inventory')
Dialog.UI('inventory',{
	position:'absolute',
	left:CST.WIDTH-200,
	top:CST.HEIGHT-HEIGHT_INV-HEIGHT_BTN,
	width:250,	//BAD.. but if 200, 2nd table goes down cuz wrap
	height:HEIGHT_INV,
	background:'rgba(0,0,0,0.2)',
	padding:'0px 0px',
	border:'1px solid black',
},function(html){
	Main.hudState.clearInterval(['inventory']);
	
	if(main.hudState.inventory === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	html.show();
	
	var full = $('<div>');
	
	var nonquest = {};
	var quest = {};
	for(var i in main.invList.data)
		if(main.questActive && i.contains(main.questActive))
			quest[i] = main.invList.data[i];
		else 
			nonquest[i] = main.invList.data[i];
	
	if(!quest.$isEmpty()){
		var array = convertItemListToArray(quest,2);
		var table = Tk.arrayToTable(array,false,false,false,'4px');
		
		table.addClass('inline').css({
			margin:'0px 0px 0px 0px',
			padding:'0px 0px 0px 0px',
			width:100,
			overflowY:"scroll",
			height:HEIGHT_INV,
		});
		full.append(table);
	}
	var amountPerRow = quest.$isEmpty() ? 4 : 2;
	var width = quest.$isEmpty() ? 200 : 100;
		
	var array = convertItemListToArray(nonquest,amountPerRow);
	var table = Tk.arrayToTable(array,false,false,false,'4px');
	table.addClass('inline').css({
		margin:'0px 0px 0px 0px',
		padding:'0px 0px 0px 0px',
		width:width,
		overflowY:"scroll",
		height:HEIGHT_INV,
	});
	full.append(table);
	
	html.append(full);
	Main.hudState.applyHudState('inventory',full);
	
},function(){
	return Tk.stringify(main.invList.data) + Dialog.isActive('bank') + main.questActive + main.hudState.inventory;
});

Dialog.isMouseOverInventory = function(){
	return Collision.testMouseRect(key,{
		x:CST.WIDTH-200,
		width:250,
		y:CST.HEIGHT-HEIGHT_INV-HEIGHT_BTN,
		height:HEIGHT_INV+HEIGHT_BTN
	}); 
}
var convertItemListToArray = function(list,amountPerRow){
	var array = [[]];
	var arrayPosition = 0;
	for(var i in list){
		var amount = list[i];
		if(array[arrayPosition].length >= amountPerRow){
			arrayPosition++;
			array.push([]);
		}
		var item = QueryDb.get('item',i,function(){
			Dialog.refresh('inventory');
		});
		if(!item) continue;
		
		var word = Dialog.isActive('bank') ? 'Transfer ' : 'Use ';
		var itemHtml = Img.drawItem(item.icon,36,word + item.name,amount);
				
		if(Dialog.isActive('bank')){
			//BANK
			itemHtml.click((function(i){
				return function(e){
					if(!e.shiftKey) Command.execute('transferInvBank',[i,1]);
					else Command.execute('transferInvBank',[i,Main.getPref(main,'bankTransferAmount')]);
				}
			})(i))
			.bind('contextmenu',(function(i){
				return function(e){
					if(!e.shiftKey) Command.execute('transferInvBank',[i,25]);
					else Command.execute('transferInvBank',[i,99999999999]);
				}
			})(i));
		} else {
			//NORMAL
			itemHtml.click((function(i,item){
				return function(e){
					if(!e.shiftKey) Command.execute('useItem',[i,0]);	//first slot
					//else Command.execute('useItem',[i,1]);			//second slot
				}
			})(i,item))
			.bind('contextmenu',(function(i,item){
				return function(e){
					if(!e.shiftKey) Dialog.open('optionList',item);
					else ItemModel.displayInChat(item);
				}
			})(i,item));		
		}
			
		array[arrayPosition].push(itemHtml);
	}
	return array;
}



Dialog.UI('reputationBar',{
	position:'absolute',
	left:CST.WIDTH-200,
	top:CST.HEIGHT-HEIGHT_INV-HEIGHT_BTN-20,
	width:200,
	height:20,
	padding:'0px 0px',
	backgroundColor:'rgba(0,0,0,0.5)',
	color:'white',
},function(html,variable,param){
	if(main.hudState.aboveInventory === Main.hudState.INVISIBLE){
		html.hide();
		return null;
	}
	
	html.show();
	
	html.html('');
	
	var questCount = 0;
	for(var i in main.quest) if(main.quest[i]._complete) questCount++;
	
	html.append($('<span>')
		.attr('title','Global Exp Modifier for completing ' + questCount + ' quest(s)')
		.html('GEM: x' + Tk.round(Actor.getGEM(player),2,true))
	);
	
	var rawexp = Tk.round(player.skill.exp,0);
	var exp = rawexp;
	if(exp > 10000000)
		exp = Tk.round(exp/1000000,0) + 'M';
	else if(exp > 10000)
		exp = Tk.round(exp/1000,0) + 'K';
	
	
	html.append($('<span>')
		.attr('title',rawexp + ' Exp. Get more by killing monsters, harvesting resource and completing quests.')
		.html(', Exp: ' + exp)
	);
	html.append(' ',$(Img.drawIcon.html('system1.more',18))
		.attr('title','Current Level: ' + player.skill.lvl + '. Level Up Cost: ' + Actor.getLevelUpCost(player) + ' Exp')
		.click(function(){
			Command.execute('lvlup',[]);
		})
	);
	
},function(){
	return '' + main.hudState.aboveInventory + player.skill.exp;
});
TRUUUE = true;




})();



