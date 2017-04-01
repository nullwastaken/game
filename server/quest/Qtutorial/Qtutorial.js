//05/18/2015 3:53 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

var s = loadAPI('v1.0','Qtutorial',{
	name:"Tutorial",
	author:"rc",
	thumbnail:False,
	description:"Teaches you the basic of GAME_NAME.",
	maxPartySize:1,
	admin:true,
	showInTab:false,
	dailyTask:false,
	showWindowComplete:false,
	autoStartQuest:false,
	alwaysActive:true,
	reward:{monster:1,completion:1,score:0},
	zone:'QfirstTown-main'
});
var m = s.map; var b = s.boss; var g;

/* COMMENT: cant use quest created cuz s.iconToText('system-target')
*/

s.newVariable({
	metGenetos:false,
	talkGenetosIntro:false,
	teleportedToMain:false,
	a_:False,
	killMushroom:false,
	pushedRock:false,
	tgOn:false,
	talkRingo:false,
	killTarget:false,
	killEnemy:0,
	lootChest:false,
	learnHeal:false,
	assignedHeal:false,
	walkedOverLava:false,
	redTreeMessage:False,
	lootChest2:false,
	upgradedEquip:false,
	bossStarted:false,
	killBoss:false,
	b_:False,
	askedReputation:False,
	openedReputation:false,
	askedWorldMap:False,
	openedWorldMap:False,
	askedQuest:False
});

s.newEvent('_start',function(key){ //
	s.addEquip.permanently(key,'Qsystem-start-amulet');
	s.addEquip.permanently(key,'Qsystem-start-ring');
	s.addEquip.permanently(key,'Qsystem-start-helm');
	s.addEquip.permanently(key,'Qsystem-start-body');
	s.addAbility.permanently(key,'Qsystem-start-melee',0);
	
	s.teleport(key,'intro','t1','solo');
	s.setRespawn(key,'intro','t1','solo',true);
	
	s.callEvent('updateHUD',key);
	
	
	s.setTimeout(key,function(){
		s.displayPopup(key,'ADWS to move. '
			+ '<span style="cursor:pointer;font-size:0.7em;color:blue;text-decoration:underline" title="Switch bindings. Can also be changed in settings (bottom right)." '
				+ 'onclick="'
					+ 'if(this.innerHTML === \'AZERTY?\'){ exports.Input.usePreset(\'azerty\'); this.innerHTML = \'QWERTY?\'; } '
					+ 'else { exports.Input.usePreset(\'qwerty\'); this.innerHTML = \'AZERTY?\'; }'
					+ '">AZERTY?</span>'
			+ '<br>Use mouse to interact and aim.<br>'
			+ 'Settings accessible via ' + s.iconToText('tab-pref','style="cursor:pointer" onclick="exports.Dialog.open(\'setting\');"') + '.'
			+ '<br>'
		);
		s.callEvent('displayHelpPerm',key);
	},25*1);
	
	s.setTimeout(key,function(){
		if(!s.get(key,'metGenetos') && s.isAtSpot(key,'intro','t1',32))	//havent moved
			s.callEvent('showHelp',key);
	},25*30);
	
	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'metGenetos');
	},25*60,25*30);
	
	s.setTimeout(key,function(){
		s.callEvent('skipTutorial',key,true);
	},25*1);
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'metGenetos')) return 'Follow the path until you meet Genetos.';
	if(!s.get(key,'talkGenetosIntro')) return 'Talk with Genetos.';
	if(!s.get(key,'teleportedToMain')) return 'Go north.';
	//a_____
	if(!s.get(key,'killMushroom')) return 'Left-Click to kill the mushroom.';
	if(!s.get(key,'tgOn')) return 'Activate the switch to free the man.';
	if(!s.get(key,'talkRingo')) return 'Talk with Ringo.';
	if(!s.get(key,'killTarget')) return 'Destroy the target ' + s.iconToText('system-target') + ' with your new ability (Right-Click).';
	if(s.get(key,'killEnemy') < 6) return 'Kill all the monsters.';
	if(!s.get(key,'lootChest')) return 'Open the chest!';
	if(!s.get(key,'learnHeal')) return 'Read the scroll ' + s.iconToText('plan-equip') + ' in your inventory at bottom right.';
	if(!s.get(key,'assignedHeal')) return 'Assign the ability Healing to a key binding via ' + s.iconToText('tab-ability') + '.';
	if(!s.get(key,'walkedOverLava')) return 'Tap <kbd>F</kbd> key to use Healing Ability while traversing the lava north.';
	if(!s.get(key,'lootChest2')) return 'Search for a chest.';
	if(!s.get(key,'upgradedEquip')) return 'Equip a weapon before fighting the dragon via ' + s.iconToText('tab-equip') + '.';
	if(!s.get(key,'killBoss')) return 'Kill the Dragon Boss!';
	//b_____
	if(!s.get(key,'askedReputation')) return "Go north and talk with Genetos.";
	if(s.getReputationUsedPt(key) === 0) return "Spend 5 Reputation points via " + s.iconToText('tab-reputation') + '.';
	if(!s.get(key,'askedQuest')) return "Open the World Map window via " + s.iconToText('tab-worldMap') + '.';
	return "Open the Quest window via " + s.iconToText('tab-quest') + '.';
});
s.newEvent('img',function(src,width){
	return '<img src="/img/tutorial/' + src + '.png" width="' + width + 'px">'
});

s.newEvent('_help',function(key){
	if(!s.get(key,'metGenetos')) 
		return 'Follow the path until you meet Genetos.<br><br>' + s.callEvent('img','walkTo',500);
	if(!s.get(key,'talkGenetosIntro')) 
		return 'Left-Click to talk with Genetos.<br><br>' + s.callEvent('img','talkGenetos',400);
	if(!s.get(key,'teleportedToMain')) 
		return 'Go north.<br><br>' + s.callEvent('img','goNorth',400);
	//a_____
	if(!s.get(key,'killMushroom')) 
		return 'Left-Click to kill the mushroom.<br><br>' + s.callEvent('img','killMushroom',400);
	if(!s.get(key,'tgOn')) 
		return 'Activate the switch to free the man.<br>Left-click on the rock to push it.<br><br>' + s.callEvent('img','pushRock',400);
	if(!s.get(key,'talkRingo')) 
		return 'Talk with Ringo.<br><br>' + s.callEvent('img','talkRingo',400);
	if(!s.get(key,'killTarget')) 
		return 'Destroy the target ' + s.iconToText('system-target') + ' with your new ability (Right-Click).<br><br>' + s.callEvent('img','destroyTarget',400);
	if(s.get(key,'killEnemy') < 6) 
		return 'Kill all the monsters.<br><br>' + s.callEvent('img','killMonster',400);
	if(!s.get(key,'lootChest')) 
		return 'Open the chest!<br><br>' + s.callEvent('img','lootChest',400);
	if(!s.get(key,'learnHeal')) 
		return 'Read the scroll ' + s.iconToText('plan-equip') + ' in your inventory at bottom right.<br><br>' + s.callEvent('img','useItem',400);
	if(!s.get(key,'assignedHeal'))
		return 'Assign the ability Healing to a key binding via ' + s.iconToText('tab-ability') + '.<br><br>' + s.callEvent('img','openAbility',300) + s.callEvent('img','assignHeal',300);
	if(!s.get(key,'walkedOverLava')) 
		return 'Tap <kbd>F</kbd> key to use Healing Ability while traversing the lava north.<br><br>' + s.callEvent('img','walkLava',300);
	if(!s.get(key,'lootChest2')) 
		return 'Search for a chest.<br><br>' + s.callEvent('img','chest2',300);
	if(!s.get(key,'upgradedEquip'))
		return 'Equip a weapon before fighting the dragon via ' + s.iconToText('tab-equip') + '.<br><br>' + s.callEvent('img','openEquip',300) + s.callEvent('img','equipWeapon',300);
	if(!s.get(key,'killBoss')) 
		return 'Kill the Dragon Boss!<br><br>' + s.callEvent('img','killDragon',300);
	//b_____
	if(!s.get(key,'askedReputation')) 
		return "Go north and talk with Genetos.<br><br>" + s.callEvent('img','goNorthDragon',200);
	if(s.getReputationUsedPt(key) === 0) 
		return "Spend 5 Reputation points via " + s.iconToText('tab-reputation') + '.<br><br>' + s.callEvent('img','openReputation',300);
	if(!s.get(key,'askedQuest')) 
		return "Open the World Map window via " + s.iconToText('tab-worldMap') + '.<br><br>' + s.callEvent('img','openWorldMap',300);
	return "Open the Quest window via " + s.iconToText('tab-quest') + '.<br><br>' + s.callEvent('img','openQuest',300);
});	

s.newEvent('showHelp',function(key){
	var str = s.callEvent('_help',key);
	s.openDialog(key,'permPopupMouseover',{text:str,forceOpen:true});
});
s.newEvent('skipTutorial',function(key,triggeredAuto){ //
	s.skipTutorial(key,triggeredAuto || false);
});
s.newEvent('_complete',function(key){ //
	s.restoreHUD(key);
	s.closePermPopup(key);
});
s.newEvent('updateHUD',function(key){ //
	s.setHUD(key,'tab-equip','invisible');
	s.setHUD(key,'tab-ability','invisible');
	s.setHUD(key,'tab-sideQuest','invisible');
	s.setHUD(key,'tab-quest','invisible');
	s.setHUD(key,'tab-achievement','invisible');
	s.setHUD(key,'tab-contribution','invisible');
	s.setHUD(key,'tab-reputation','invisible');
	s.setHUD(key,'tab-worldMap','invisible');
	s.setHUD(key,'tab-highscore','invisible');
	s.setHUD(key,'tab-friend','invisible');
	s.setHUD(key,'tab-homeTele','invisible');
	
	s.setHUD(key,'pvpLookingFor','invisible');	
	s.setHUD(key,'playerOnline','invisible');
	s.setHUD(key,'minimapName','invisible');
	s.setHUD(key,'fps','invisible');
	
	s.setHUD(key,'inventory','invisible');
	
	
	s.setHUD(key,'mana','invisible');
	s.setHUD(key,'party','invisible');
	s.setHUD(key,'clan','invisible');
	s.setHUD(key,'bottomChatIcon','invisible');
	s.setHUD(key,'curseClient','invisible');
	s.setHUD(key,'aboveInventory','invisible');
	
	if(s.get(key,'killBoss')){
		s.setHUD(key,'mana','normal');
	}
	
	if(s.haveItem(key,'ability') || s.get(key,'learnHeal'))
		s.setHUD(key,'inventory','normal');
	
	if(s.get(key,'learnHeal')){
		if(!s.get(key,'assignedHeal'))
			s.setHUD(key,'tab-ability','flashing');
		else s.setHUD(key,'tab-ability','normal');
	}
	if(s.get(key,'lootChest2')){
		if(!s.get(key,'upgradedEquip'))
			s.setHUD(key,'tab-equip','flashing');
		else s.setHUD(key,'tab-equip','normal');
	}
	if(s.get(key,'askedReputation'))
		s.setHUD(key,'tab-reputation','normal');
	if(s.get(key,'askedWorldMap'))
		s.setHUD(key,'tab-worldMap','normal');
	if(s.get(key,'askedQuest'))
		s.setHUD(key,'tab-quest','normal');
		
});
s.newEvent('_signIn',function(key){ //
	if(!s.isInQuestMap(key))
		return s.callEvent('_start',key);
	
	s.callEvent('updateHUD',key);
	
	s.callEvent('displayHelpPerm',key);
	
	//a____
	if(s.get(key,'lootChest2') && !s.get(key,'upgradedEquip'))
		s.callEvent('checkIfEquip',key);
		
	if(s.get(key,'learnHeal') && !s.get(key,'assignedHeal'))
		s.callEvent('checkIfAssignedHeal',key);
});
s.newEvent('displayHelpPerm',function(key){ //
	var g = '<';
	s.displayPermPopup(key,'<div style="padding:10px"><span hidden class="' + CST.TUTORIAL_CLASS_BLINK_HELP + '">' + g + '</span> Help!</div>','help');	//BAD
});
s.newEvent('showHelpUntil',function(key,showUntil,firstTime,interval){ //
	if(showUntil())
		return;
	var stack = (new Error()).stack;
	s.setTimeout(key,function(){
		if(showUntil())
			return;
		s.closeDialog(key,'questPopup');
		s.callEvent('showHelp',key);
		s.setInterval(key,function(){
			if(showUntil())
				return;
			s.callEvent('showHelp',key);
			return true;
		},interval)
	},firstTime);
});
s.newEvent('setTimeoutPopup',function(key,text,cond){ //
	s.closeDialog(key,'questPopup');
	s.setTimeout(key,function(){
		if(!cond || cond())
			s.displayPopup(key,text);
	},15*1);
});

s.newEvent('talkGenetosIntro',function(key){ //
	if(!s.get(key,'talkGenetosIntro'))
		s.startDialogue(key,'genetos','intro');
	else
		s.startDialogue(key,'genetos','goTown');
});
s.newEvent('doneTalkGenetosIntro',function(key){ //
	s.set(key,'talkGenetosIntro',true);
	s.enableMove(key,true);
	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'teleportedToMain');
	},25*30,25*15);
});
s.newEvent('teleIntroMain',function(key){ //
	if(!s.get(key,'talkGenetosIntro'))
		return s.message(key,"Talk with Genetos first.");
	
	s.teleport(key,'main','t2','solo',true);
	s.setRespawn(key,'main','t2','solo',true);
	s.set(key,'teleportedToMain',true);
	
	s.setInterval(key,function(){
		if(s.get(key,'killMushroom'))
			return;
		var mush = s.getRandomNpc(key,'main',{mushroom:true});
		if(mush)
			s.addAnimOnTop(mush,'leftClick');
		return true;
	},25*10);
	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'killMushroom');
	},25*40,25*20);
});

s.newEvent('glitchScreen',function(key){ //
	s.setInterval(key,function(){
		if(Math.random() < 0.3) 
			return true;
		if(Math.random() < 0.5)
			s.shakeScreen(key,'shake',50+Math.random()*50,100,3);
		else {
			var r = Math.floor(Math.random()*255);
			var g = Math.floor(Math.random()*255);
			var b = Math.floor(Math.random()*255);
			s.addFadeout(key,'fadeout',50+Math.random()*50,'rgba(' + r + ',' + g + ',' + b + ',0.4)');
		}
		return !s.get(key,'teleportedToMain');			
	},25*5,'glitchScreen');
});
s.newEvent('a_____',function(key){ //
	
});
s.newEvent('killMushroom',function(key){ //
	s.set(key,'killMushroom',true);
	
	s.setTimeout(key,function(){
		s.displayPopup(key,'Follow the ' + s.iconToText(CST.ICON.questMarker) + ' in your minimap and the Quest Hints below it.<br><br>'
			+ s.callEvent('img','hint',200));
		s.setHUD(key,'questHint','flashing',25*10);
		s.addQuestMarker(key,'myMarker','main','q2');
	},25*5);
	
	s.setInterval(key,function(){
		if(s.get(key,'pushedRock'))
			return;
		var rock = s.getRandomNpc(key,'main',{rock:true});
		if(rock)
			s.addAnimOnTop(rock,'leftClick');
		return true;
	},25*10);
		
	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'pushedRock');
	},25*25,25*20);
});
s.newEvent('pushRock',function(key){ //
	s.set(key,'pushedRock',true);
});
s.newEvent('tgOn',function(key){
	if(!s.get(key,'pushedRock')){
		s.message(key,'Push the rock by clicking on it to access the lever.');
		return false;
	}
	s.set(key,'tgOn',true);
	s.addQuestMarker(key,'myMarker','main','n1');
	s.message(key,'You activated the switch and freed the man.',true);

	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'talkRingo');
	},25*30,25*20);
	
	return false;	
});
s.newEvent('talkRingo',function(key){ //
	if(!s.get(key,'tgOn')) 
		return;
	if(s.get(key,'killTarget'))
		return s.startDialogue(key,'ringo','afterGate');
	
	if(s.get(key,'talkRingo')) 
		return s.startDialogue(key,'ringo','second');
	
	s.startDialogue(key,'ringo','first');
	s.set(key,'talkRingo',true);
});
s.newEvent('learnArrow',function(key){ //
	s.addAbility.permanently(key,'Qsystem-start-bullet',1);
	s.addQuestMarker(key,'myMarker','main','e2');
	
	var func = function(){
		if(s.isInDialogue(key)){
			s.setTimeout(key,func,25*5);
			return true;
		}
		if(s.get(key,'killTarget'))
			return
		s.callEvent('showHelp',key);
		return true;
	};
	s.setInterval(key,function(){
		if(s.get(key,'killTarget'))
			return;
		var target = s.getRandomNpc(key,'main',{target:true});
		if(target)
			s.addAnimOnTop(target,'rightClick');
		return true;		
	},25*12);
	
	s.setInterval(key,func,25*25);
});
s.newEvent('killTarget',function(key){ 
	s.set(key,'killTarget',true);
	s.setRespawn(key,'main','ta','solo',true);	
	s.forEachActor(key,'main',function(key){;
		s.killActor(key,true);
	},'npc',null,{block:true});
	s.removeQuestMarker(key,'myMarker');
	
	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'killEnemy') >= 6;
	},25*75,25*25);
});
s.newEvent('viewChest',function(key){ //
	if(s.get(key,'lootChest')) return false;
	if(s.get(key,'killEnemy') >= 6) return true;
	return null;
});
s.newEvent('killEnemy',function(key){ //
	if(s.get(key,'killEnemy') === 0)
		s.message(key,'Hold mouse button to keep attacking. You only have to press once.',true);
	s.add(key,'killEnemy',1);
	var left = 6 - s.get(key,'killEnemy');
	
	if(left > 0)
		s.message(key,left + ' monster' + (left > 1 ? 's' : '') + ' left.');
	
	if(left === 0){
		s.message(key,'All the monsters have been killed. A chest appeared on top of the hill.');
		s.addQuestMarker(key,'myMarker','main','q1');
		s.playSfx(key,'levelUp');
		
		s.callEvent('showHelpUntil',key,function(){
			return s.get(key,'lootChest');
		},25*20,25*15);
	}
});
s.newEvent('lootChest',function(key){ //
	var func = function(){
		if(!s.haveItem(key,'ability'))
			return;
		
		s.callEvent('setTimeoutPopup',key,'You found a scroll ' + s.iconToText('plan-equip') + ' in the chest.<br>'
			+ 'Left-Click to use items in your inventory.<br>'
			+ 'Right-Click items to display all options.<br><br>'
			+ s.callEvent('img','useItem',200) + '<br>',function(){
				return s.haveItem(key,'ability');
			});
	}
	
	if(s.get(key,'lootChest')){ // aka already looted
		func();
		return;
	}
		
	s.addItem(key,'ability');
	func();
	s.set(key,'lootChest',true);
	s.setRespawn(key,'main','ta','solo',true);
	
	
	s.callEvent('showHelpUntil',key,function(){
		return !s.haveItem(key,'ability');
	},25*20,25*15);
	
	s.removeQuestMarker(key,'myMarker');
	s.setHUD(key,'inventory','flashing');
});
s.newEvent('itemAbility',function(key){ //
	s.addAbility.permanently(key,'Qsystem-start-heal',null);
	s.removeItem(key,'ability');	
	s.setHUD(key,'inventory','normal');
	s.removeQuestMarker(key,'myMarker');
	
	s.callEvent('setTimeoutPopup',key,'You learned the ability Heal ' + s.iconToText('heal-plus') + '.<br>'
		+ 'To use it, assign it to a Key Bind.<br><br>'
		+ s.callEvent('img','openAbility',200) + s.callEvent('img','assignHeal',200));
			
	s.callEvent('showHelpUntil',key,function(){
		return s.hasAbility(key,'Qsystem-start-heal');
	},25*30,25*40);
	
	s.callEvent('checkIfAssignedHeal',key);
	s.set(key,'learnHeal',true);
	s.setHUD(key,'tab-ability','flashing');
});

s.newEvent('checkIfAssignedHeal',function(key){ //
	s.setInterval(key,function(){
		if(s.hasAbility(key,'Qsystem-start-heal')){	
			s.set(key,'assignedHeal',true);
			s.setHUD(key,'tab-ability','normal');
			s.addQuestMarker(key,'myMarker','main','q8');
			s.callEvent('setTimeoutPopup',key,'You assigned the ability "Heal" to <kbd>F</kbd> key.<br>Tap <kbd>F</kbd> when your HP is low to heal yourself.');
			s.rechargeAbility(key);
		} else
			return true;
	},25);
});
s.newEvent('lootChest2',function(key){ //
	if(s.get(key,'lootChest2')){ // aka already looted
		s.callEvent('setTimeoutPopup',key,'<p>Equip a weapon via ' + s.iconToText('tab-equip') + ' before fighting the dragon.</p><br>'
			+ s.callEvent('img','openEquip',190) + s.callEvent('img','equipWeapon',190)
		);
		return;
	}
	
	s.callEvent('setTimeoutPopup',key,'<p>You just received a ' + s.iconToText('weapon-mace') + ' mace and a ' + s.iconToText('weapon-bow') + ' bow!</p>'
		+ '<p>Equip a weapon via ' + s.iconToText('tab-equip') + ' before fighting the dragon.</p><br>'
		+ s.callEvent('img','openEquip',190) + s.callEvent('img','equipWeapon',190)
	);
	
	
	s.callEvent('showHelpUntil',key,function(){
		return s.get(key,'upgradedEquip');
	},25*25,25*25);
	
	s.removeQuestMarker(key,'myMarker');
	s.addItem.permanently(key,'Qsystem-start-bow');
	s.addItem.permanently(key,'Qsystem-start-weapon');
	s.setRespawn(key,'main','tb','solo',true);
	s.set(key,'lootChest2',true);
	
	s.callEvent('checkIfEquip',key);
	s.setHUD(key,'tab-equip','flashing');
});
s.newEvent('checkIfEquip',function(key){ //
	s.setInterval(key,function(){
		var weapon = s.getEquip(key,'weapon');
		if(weapon){
			s.set(key,'upgradedEquip',true);
			s.setHUD(key,'tab-equip','normal');
			s.message(key,'The gate opened. You are now ready to fight the dragon boss.',true);
			s.closeDialog(key,'questPopup');
			
			s.playSfx(key,'levelUp');
		} else
			return true;
	},25);
});
s.newEvent('viewChest2',function(key){ //
	return !s.get(key,'lootChest2');
});
s.newEvent('killBoss',function(key){ //
	if(!s.get(key,'killBoss')){
		s.setTimeout(key,function(){
			s.displayPopup(key,'You just learned 2 new abilities.<br>'
				+ 'These abilities requires <span style="color:blue" class="shadow">Mana</span> (top left) to be casted.<br><br>'
				+ '<p>-' + s.inputToText(2) + ': ' + s.iconToText('attackMagic-crystal') + ' Freeze<br>-' + s.inputToText(3) + ': ' + s.iconToText('attackMagic-meteor') + ' Fire</p>'
				+ s.callEvent('img','manaBar',190)
			);
		},25*5);
		var weaponType = s.getEquipType(key,'weapon');
		if(weaponType === 'mace'){
			s.addAbility.permanently(key,'Qsystem-start-freeze-melee',2);
			s.addAbility.permanently(key,'Qsystem-start-fireball-melee',3);
			s.addAbility.permanently(key,'Qsystem-start-freeze-range',false);
			s.addAbility.permanently(key,'Qsystem-start-fireball-range',false);	
		} else {
			s.addAbility.permanently(key,'Qsystem-start-freeze-range',2);
			s.addAbility.permanently(key,'Qsystem-start-fireball-range',3);
			s.addAbility.permanently(key,'Qsystem-start-freeze-melee',false);
			s.addAbility.permanently(key,'Qsystem-start-fireball-melee',false);					
		}
		s.addAbility.permanently(key,'Qsystem-start-freeze',false);
		s.addAbility.permanently(key,'Qsystem-start-fireball',false);		
			
		
		s.setHUD(key,'mana','normal');
		s.playSfx(key,'levelUp');
		
		s.setTimeout(key,function(){
			if(!s.isInMap(key,'main'))
				return;
			s.callEvent('setTimeoutPopup',key,'Follow the path north.<br><br>'+ s.callEvent('img','goNorthDragon',190));
		},25*20);
		
	}
	s.set(key,'killBoss',true);
	s.addQuestMarker(key,'myMarker','main','t1');
});
s.newEvent('b_____',function(key){ //
	
});

s.newEvent('talkGenetosTown',function(key){ //
	if(!s.get(key,'askedReputation'))
		return s.startDialogue(key,'genetos','welcomeBack',true);
	
	if(s.getReputationUsedPt(key) === 0){
		s.callEvent('showHelp',key);
		return s.startDialogue(key,'genetos','reputationNoob',true);
	}
	if(!s.get(key,'askedWorldMap'))
		return s.startDialogue(key,'genetos','askOpenWorldMap');
	
	if(!s.get(key,'openedWorldMap')){
		s.callEvent('showHelp',key);
		return s.startDialogue(key,'genetos','worldMapNoob');
	}
	
	if(!s.get(key,'askedQuest'))
		return s.startDialogue(key,'genetos','askOpenQuest');
	
	s.callEvent('showHelp',key);
	s.startDialogue(key,'genetos','questNoob');
});
s.newEvent('okSpendRep',function(key){ //
	s.displayPopup(key,'Quest Complete => Higher GEM => More Exp<br> &nbsp;&nbsp; => Lvl Up => Reputation Pt => Higher Combat Stats<br><br>'
		+ 'Spend your 5 available Reputation points via ' + s.iconToText('tab-reputation') + '.<br><br>'
		+ s.callEvent('img','openReputation',120)
	);
});
s.newEvent('teleMainGenetos',function(key){ //
	s.teleport(key,'genetosHouse','t1','solo');
	s.setRespawn(key,'genetosHouse','t1','solo',true);
	s.removeQuestMarker(key,'myMarker');
});
s.newEvent('displayGEM',function(key){ //
	s.setHUD(key,'aboveInventory','normal');
});
s.newEvent('reputationFlash',function(key){ //
	s.setHUD(key,'tab-reputation','flashing');
	if(!s.get(key,'askedReputation')){
		s.set(key,'askedReputation',true);
		s.setTimeout(key,function(){
			if(!s.get(key,'openedReputation')){
				s.message(key,'The reputation grid has been opened for you.',true);
				s.openDialog(key,'reputation');
			}
		},25*60,'askedReputation');
	}
});
s.newEvent('askOpenWorldMap',function(key){ //
	s.setHUD(key,'tab-worldMap','flashing');
	s.setHUD(key,'tab-reputation','normal');
	if(!s.get(key,'askedWorldMap')){
		s.set(key,'askedWorldMap',true);
		s.setTimeout(key,function(){
			if(!s.get(key,'openedWorldMap')){
				s.message(key,'The world map has been opened for you.',true);
				s.openDialog(key,'worldMap');
			}
		},25*60,'askOpenWorldMap');
	}
});
s.newEvent('askOpenQuest',function(key){ //
	s.setHUD(key,'tab-quest','flashing');
	s.setHUD(key,'tab-worldMap','normal');
	if(!s.get(key,'askedQuest')){
		s.set(key,'askedQuest',true);
		s.setTimeout(key,function(){
			if(s.testQuestActive(key,'Qtutorial')){
				s.message(key,'The quest window has been opened for you.',true);
				s.openDialog(key,'questList');
			}
		},25*60,'askOpenQuest');
	}
});

s.newEvent('_dialogOpen',function(key,str){ //SEND_dialogOpen
	if(s.get(key,'askedWorldMap') && str === 'worldMap')
		s.set(key,'openedWorldMap',true);
	else if(s.get(key,'askedReputation') && str === 'reputation')
		s.set(key,'openedReputation',true);
	else if(s.get(key,'askedQuest') && str === 'questList'){
		s.completeQuest(key);
		s.teleport(key,'QfirstTown-genetosHouse2','t2','main');
	}
});
s.newEvent('_dialogClose',function(key,str){ //
	if(str === 'reputation' || str === 'worldMap')
		s.callEvent('talkGenetosTown',key);
});

s.newEvent('teleGenetosTown',function(key){ //
	if(s.testQuestActive(key,'Qtutorial'))
		return s.startDialogue(key,'genetos','beforeLeaving');
	
	s.teleport(key,'QfirstTown-main','t8','main');
	s.setRespawn(key,'QfirstTown-main','t8','main',true);
	s.displayPopup(key,
		'Minimap Icon: <br>'  
		+ '&nbsp; ' + s.iconToText(CST.ICON.quest) + ' = Quest Start<br>'
		+ '&nbsp; ' + s.iconToText(CST.ICON.questMarker) + ' = Quest Directions<br><br>'
		+ s.iconToText('minimapIcon-door') + ' = Teleport to town.'
	);
	s.setHUD(key,'tab-homeTele','flashing',25*10);
});
s.newEvent('displayQuest',function(key){ //after tutorial
	s.openDialog(key,'questList');
});

s.newItem('ability',"Ability Scroll",'plan-equip',[    //{
	s.newItem.option('itemAbility',"Learn","Learn new ability.")
],""); //}

s.newAbility('fireball','attack',{
},{
	type:'bullet',
	amount:1,
	angleRange:20,
	dmg:s.newAbility.dmg(50,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:s.newAbility.spd(4),
	sprite:s.newAbility.sprite('fireball',1.5,false)
});
s.newAbility('fireball-360','attack',{
},{
	type:'bullet',
	amount:1,
	angleRange:20,
	dmg:s.newAbility.dmg(100,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	maxTimer:500,
	spd:s.newAbility.spd(0.6),
	sprite:s.newAbility.sprite('fireball',1,false)
});
s.newAbility('fireball-fast','attack',{
},{
	type:'bullet',
	amount:1,
	angleRange:5,
	dmg:s.newAbility.dmg(10,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:s.newAbility.spd(4),
	sprite:s.newAbility.sprite('fireball',1,false)
});
s.newAbility('fireball-oob','attack',{
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(50,'fire'),
	knock:s.newAbility.status(1,1.5,1),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:s.newAbility.spd(4),
	sprite:s.newAbility.sprite('fireball',1,false)
});
s.newAbility('fireball-slow','attack',{
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(5,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	maxTimer:250,
	spd:s.newAbility.spd(0.33),
	sprite:s.newAbility.sprite('fireball',1,false)
});

s.newDialogue('ringo','Ringo','villagerMale-0',[ //{ 
	s.newDialogue.node('first',"Thanks for saving me! I'll reward you by teaching you a new ability. Use [[Right-Click]] {{click-right}} to shoot rocks and destroy the target {{system-target}} by the water.",[ 
		s.newDialogue.option("Come with me.",'help'),
		s.newDialogue.option("Okay, bye.")
	],'learnArrow'),
	s.newDialogue.node('help',"I wish I could. Unfortunately, Lord Dotex glitched my Movement Script which allowed me to walk. I'm doomed to stand here for eternity.",[ 
		s.newDialogue.option("Ah, that's sad.",'sad')
	]),
	s.newDialogue.node('sad',"But at least I can talk so I got that going for me which is nice. Now hurry and destroy the target {{system-target}} by using [[Right-Click]] {{click-right}}.",[ 	]),
	s.newDialogue.node('second',"You should try shooting a rock with [[Right-Click]] {{click-right}} at the target {{system-target}} by the water.",[ 
		s.newDialogue.option("Okay. I'll go do that."),
		s.newDialogue.option("Come show me.",'help')
	]),
	s.newDialogue.node('afterGate',"Good job. I hope you will find your way to town.",[ 
		s.newDialogue.option("Thanks."),
		s.newDialogue.option("Come with me.",'help')
	])
]); //}
s.newDialogue('genetos','Genetos','villagerMale-5',[ //{ 
	s.newDialogue.node('intro',"Thank the RNG God, you finally arrived! We really need your help! ",[ 
		s.newDialogue.option("What happened? - Click to continue",'intro2','glitchScreen')
	]),
	s.newDialogue.node('intro2',"[[Lord Dotex]], the leader of the VIRUS gang, managed to access the [[game source code]] and he's breaking everything! The Holy Creator is already trying to fix most of the [[glitches he caused]], but if nothing is done to stop him, I fear the worst.",[ 
		s.newDialogue.option("What can I do?",'intro3')
	]),
	s.newDialogue.node('intro3',"If you want to help, you will need to go to the [[town]]. That's where most of the glitches are. Just follow the [[path north]] by walking over {{teleport-zone}}. My clone #12 will meet you there.",[ 
		s.newDialogue.option("Clone #12?",'instance12'),
		s.newDialogue.option("Okay.")
	],'doneTalkGenetosIntro'),
	s.newDialogue.node('instance12',"I appear multiple times in this game. 31 times to be exact. You're currently talking with clone #3 right now if you are wondering. Now, hurry and go to town.",[ 
		s.newDialogue.option("Okay.")
	]),
	s.newDialogue.node('goTown',"Hurry! Villagers in the town need your help. Follow the [[path north]] by walking over {{teleport-zone}}. If Lord Dotex keeps messing with the code, he could make the entire game crash!",[ 	]),
	s.newDialogue.node('b____',"",[ 	]),
	s.newDialogue.node('beforeLeaving',"Wait! Before you leave, I got a few things to tell you.",[ 
		s.newDialogue.option("What is it?",'','talkGenetosTown')
	]),
	s.newDialogue.node('welcomeBack',"Great, you made it! I hope [[Lord Dotex]] didn't put too much trouble in your path. There are anomalies all over the place. Fix the issues and you will get nice rewards.",[ 
		s.newDialogue.option("What are the rewards?",'reward')
	]),
	s.newDialogue.node('reward',"Every time you complete a [[quest]] given by an NPC, your [[Global Exp Modifier (GEM)]] increases. The higher your GEM is, the more exp you get from killing monsters. You can see your GEM above your inventory.",[ 
		s.newDialogue.option("I don't get it.",'dontgetit'),
		s.newDialogue.option("What's the point of getting exp?",'pointexp')
	],'displayGEM'),
	s.newDialogue.node('dontgetit',"Let say you have never completed a quest, your GEM is x1.00. Killing a monster gives you 10 exp. After completing 10 quests, your GEM would be around x1.50. Killing the same monster would grant 15 exp instead of 10.",[ 
		s.newDialogue.option("What's the point of getting exp?",'pointexp')
	]),
	s.newDialogue.node('pointexp',"Exp can be used to improve your equipment and to [[level-up]] yourself. You can do so by clicking the Lvl-Up icon next to your GEM. Every time you level-up, you get a [[Reputation Point]].",[ 
		s.newDialogue.option("What is a Reputation Point?",'whatrep')
	]),
	s.newDialogue.node('whatrep',"[[Reputation Points]] can be used to increase a combat stat via the [[Reputation Grid]]. Open it by clicking {{tab-reputation}} at the bottom right of your screen and try spending some points. Points can be [[reallocated]] at any time for free. ",[ 
		s.newDialogue.option("Okay. I'll spend my Reputation points.",'','okSpendRep')
	],'reputationFlash'),
	s.newDialogue.node('reputationNoob',"Open your [[Reputation Grid]] by clicking {{tab-reputation}} at the bottom right of your screen and spending your [[Reputation points]].",[ 
		s.newDialogue.option("Okay.")
	],'reputationFlash'),
	
	s.newDialogue.node('askOpenWorldMap',"Good job. To know where to start quests, you can take a look to the [[World Map]]. Open the [[World Map]] {{tab-worldMap}}. ",[ 
		s.newDialogue.option("Okay.",'')
	],'askOpenWorldMap'),
	
	s.newDialogue.node('worldMapNoob',"Open your [[World Map]] by clicking {{tab-worldMap}} at the bottom right of your screen.",[ 
		s.newDialogue.option("Okay.")
	],'askOpenWorldMap'),
		
	s.newDialogue.node('questNoob',"Take a look at the list of available [[Quests]] by clicking {{tab-quest}} at the bottom right of your screen.",[ 
		s.newDialogue.option("Okay.")
	],'askOpenQuest'),
	s.newDialogue.node('askOpenQuest',"Good job. Now go fix [[Lord Dotex's glitches]]. NPCs displayed as {{minimapIcon-quest}} in your minimap represent a quest.<br>Alternatively, click {{tab-quest}} at the bottom right to see all the quests. Open it.",[ 
		s.newDialogue.option("Okay, I'll open the Quest Window.")
	],'askOpenQuest'),
]); //}

s.newNpc('boss',{
	name:"Dragon Boss",
	hp:15000,
	boss:s.newNpc.boss('dragon'),
	fixedPosition:True,
	mastery:s.newNpc.mastery([1,0.7,1,1,1,1]),
	maxSpd:s.newNpc.maxSpd(0),
	sprite:s.newNpc.sprite('dragon',1.2),
	moveRange:s.newNpc.moveRange(3.5,3),
	statusResist:s.newNpc.statusResist(1,1,1,0,1,1),
	targetSetting:s.newNpc.targetSetting(10,50,90)
});

s.newMap('intro',{
	name:"Forest",
	screenEffect:''
},{
	load:function(spot){
		m.spawnTeleporter(spot.t2,'teleIntroMain','zone','up');
		
		var glitchShape3 = function(eid){
			if(Math.random() > 1/16)
				return true;
			var spriteList = ['Qtutorial-bed','system-target','teleport-door'];
			s.setSprite(eid,spriteList.$random(),0.5);
			s.setTimeout(eid,function(){
				s.setSprite(eid,'villagerMale-5',1);
			},Math.floor(12));
			return true;
		}
		
		var genetos = m.spawnActor(spot.n1,'npc',{
			dialogue:'talkGenetosIntro',
			name:'Genetos',
			tag:{genetos:true},
			interactionMaxRange:s.newNpc.interactionMaxRange('far'),
			sprite:s.newNpc.sprite('villagerMale-5',1)
		});
		s.setInterval(genetos,glitchShape3,25);
		
		//glitch 1
		var list = ['a','b','c','d','e','f'];
		var glitchShape = function(eid){
			if(Math.random() > 1/4)
				return true;
			var count = s.getTag(eid).count;	
			s.setTag(eid,'count',count + 1);	
			
			/*if(count % 4 === 0)
				s.setSprite(eid,'Qtutorial-tree',1,0.8);
			if(count % 4 === 1)
				s.setSprite(eid,'Qtutorial-tree',1,0.6);
			if(count % 4 === 2)
				s.setSprite(eid,'Qtutorial-tree',0.8,0.8);
			if(count % 4 === 3)
				s.setSprite(eid,'Qtutorial-tree-glitched',1,1);				
			
			s.setTimeout(eid,function(){
				s.setSprite(eid,'Qtutorial-tree',1,1);
			},Math.floor(Math.random()*20+15));
			*/
			return true;
		}
		for(var i = 0; i < list.length; i++){
			var id = m.spawnActor(spot[list[i]],'tree-red',{
				minimapIcon:'',
				sprite:s.newNpc.sprite('Qtutorial-tree',1),
				name:'',
				tag:{tree:true,count:0},
			});
			s.setInterval(id,glitchShape,20+i*4);
		}
		
		//glitch 2
		var glitchShape2 = function(eid){
			if(Math.random() > 1/8)
				return true;
			var spriteList = ['Qtutorial-bed','bomb','teleport-door'];
			s.setSprite(eid,spriteList.$random(),1,0.2);
			s.setTimeout(eid,function(){
				s.setSprite(eid,'invisible');
			},Math.floor(Math.random()*30+60));
			return true;
		}
		var list = ['g','h'];
		for(var i = 0; i < list.length; i++){
			var id = m.spawnActor(spot[list[i]],'npc',{
				name:'',
				minimapIcon:'',
				sprite:s.newNpc.sprite('invisible'),
				tag:{bed:true,count:0},
			});
			s.setInterval(id,glitchShape2,15+i*4);
		}
	},
	loop:function(spot){
		m.forEachActor(spot,5,function(key){
			if(!s.get(key,'metGenetos')){
				s.set(key,'metGenetos',true);
				s.setRespawn(key,'intro','t3','solo',true);
				s.startDialogue(key,'genetos','intro');
				s.enableMove(key,false);
				
				s.setTimeout(key,function(){
					s.enableMove(key,true);
				},25*30);		
				
				var genetosId = m.getRandomNpc(spot,{genetos:true});
				if(genetosId){
					s.setAttr(genetosId,'maxSpd',10);
					s.setAttr(genetosId,'acc',5);
					s.followPath(genetosId,'intro','myPath',function(){
						s.enableMove(genetosId,false);
						s.setAttr(genetosId,'angle',s.newNpc.angle('down'));
					});
				}	
			
			}
		;},'player',spot.qa);
	}
});
s.newMap('main',{
	name:"Tutorial"
},{
	load:function(spot){
		m.spawnSignpost(spot.q3,function(key){
			if(s.get(key,'upgradedEquip'))
				return "Good luck!";			
			if(s.get(key,'lootChest2'))
				return "Equip a weapon before fighting the boss.";
			return "Search for a chest.";
		});
		m.spawnSignpost(spot.q4,function(key){
			if(!s.hasAbility(key,'Qsystem-start-heal'))
				return "Only those with a healing ability should attempt passing through the lava pit.";
			return "Tap <kbd>F</kbd> midway to heal yourself.";
		});
		
		
		m.spawnBlock(spot.e1,function(key){
			return !s.get(key,'killMushroom');
		},'spike');
		
		m.spawnActor(spot.el,'mushroom',{
			deathEvent:'killMushroom',
			noAbility:true,
			maxSpd:s.newNpc.maxSpd(0.2),
			hp:10,
			tag:{mushroom:true},
			bounceDmgMod:0,
		});
				
		var eid = m.spawnActor(spot.e2,'target',{
			nevermove:false,
			move:true,
			ghost:true,
			maxSpd:s.newNpc.maxSpd(0.3),
			deathEvent:'killTarget',
			tag:{target:true},
		});
		var helper = function(eid){
			var a = function(key){
				s.moveTo(key,'main','e2',function(key){
					s.moveTo(key,'main','tc',function(key){
						a(key);
					});
				});
			};
			a(eid);
		}
		helper(eid);
		
		m.spawnActor(spot.qb,'pushable-rock2x2-loose',{
			pushable:s.newNpc.pushable(8,8,'pushRock',false,true),
			tag:{rock:true},
		});
		
		m.spawnToggle(spot.q2,function(key){
			return !s.get(key,'tgOn');
		},'tgOn',null,null,{
			interactionMaxRange:s.newNpc.interactionMaxRange('far'),
			tag:{toggle:true},
		},{
			interactionMaxRange:s.newNpc.interactionMaxRange('far'),
		});
		
		m.spawnActor(spot.n1,'npc',{
			sprite:s.newNpc.sprite('villagerMale-0'),
			nevermove:true,
			angle:s.newNpc.angle('down'),
			name:'Ringo',
			dialogue:'talkRingo'
		});
		
		m.spawnBlock(spot.qa,function(key){ 
			return !s.get(key,'tgOn');
		},'spike');
		m.spawnBlock(spot.qc,function(key){ 
			return !s.get(key,'killTarget');
		},'spike',{
			tag:{block:true},
		});
		m.spawnBlock(spot.qd,function(key){ 
			return !s.get(key,'upgradedEquip') || s.get(key,'bossStarted');
		},'spike');
		m.spawnBlock(spot.qe,function(key){ 
			return !s.get(key,'killBoss');
		},'spike');
		
		m.spawnBlock(spot.a,function(key){ return false;},'invisible');
		
		m.spawnBlock(spot.h,function(key){
			return !s.get(key,'assignedHeal');
		});
		
		m.spawnLoot(spot.q1,'viewChest','lootChest','chest',null,{
			onclick:s.newNpc.onclick(s.newNpc.onclick.side('Check','lootChest'))
		});
		
		m.spawnTeleporter(spot.t3,function(key){
			s.teleport(key,'Qtutorial-main','t4','solo');
		},'zone',{angle:0,viewedIf:function(key){
			return s.get(key,'bossStarted');		
		}});
		
		m.spawnTeleporter(spot.t1,'teleMainGenetos','zone','up');
		
		m.spawnLoot(spot.q8,'viewChest2','lootChest2','chest',null,{
			onclick:s.newNpc.onclick(s.newNpc.onclick.side('Check','lootChest2'))
		});
		
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list("bee",1,{globalDmg:0.3,globalDef:0.6,deathEvent:'killEnemy'}),
			m.spawnActorGroup.list("bat",2,{globalDmg:0.3,globalDef:0.6,deathEvent:'killEnemy'}),
		],1000000);
		
		m.spawnActorGroup(spot.e4,[
			m.spawnActorGroup.list("mushroom",1,{globalDmg:0.3,globalDef:0.6,deathEvent:'killEnemy'}),
			m.spawnActorGroup.list("plant",2,{globalDmg:0.3,globalDef:0.6,deathEvent:'killEnemy'}),
		],1000000,null,100);
		
		m.spawnActor(spot.e5,'boss',{deathEvent:'killBoss'});
		
		m.spawnSkillPlot(spot.qk,'Qtutorial','tree-red',0);
	},
	loop:function(spot){
		m.forEachActor(spot,2,function(key){
			var dmg = s.get(key,'assignedHeal') ? -50 : -300;
			var hp = s.getAttr(key,'hp');
			if(hp > 1 && hp <= -dmg)
				s.message(key,'You were killed by the lava. Tap <kbd>F</kbd> to heal yourself when your hp is low (midway).');
			s.addHp(key,dmg);
		},'player',spot.qg);
		
		m.forEachActor(spot,15,function(key){
			if(!s.get(key,'walkedOverLava'))
				s.set(key,'walkedOverLava',true);
			s.addHp(key,50);
			if(!s.get(key,'redTreeMessage')){
				s.setTimeout(key,function(){
					s.message(key,'Red trees can be harvested to obtain Red Wood.',true);
				},25*5);
				s.set(key,'redTreeMessage',true);
			}
		},'player',spot.b);
		
		m.forEachActor(spot,15,function(key){
			s.rechargeAbility(key);
		},'player',spot.c);
		
		m.forEachActor(spot,25,function(key){
			if(!s.get(key,'bossStarted'))
				s.set(key,'bossStarted',true);
			var hp = s.getAttr(key,'hp');
			if(hp < 100)
				s.addBoost(key,'globalDef',5,25*5,'helper');
			else if(hp < 200)
				s.addBoost(key,'globalDef',3,25*5,'helper');
			else if(hp < 300)
				s.addBoost(key,'globalDef',1.5,25*5,'helper');
		},'player',spot.qh);
	}
});
s.newMapAddon('QfirstTown-main',{
	load:function(spot){
		
	}
});
s.newMap('genetosHouse',{
	name:"Genetos House",
	screenEffect:''
},{
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkGenetosTown',
			name:'Genetos',	
			sprite:s.newNpc.sprite('villagerMale-5')
		});
		m.spawnTeleporter(spot.t1,'teleGenetosTown','zone','down');
	},
	loop:function(spot){
		if(!m.testInterval(25*5))
			return;
		var key = m.getRandomPlayer(spot);
		
		if(s.get(key,'askedReputation')){
			if(s.getReputationUsedPt(key) === 0)
				return s.setHUD(key,'tab-reputation','flashing');
			else
				s.setHUD(key,'tab-reputation','normal');
			s.set(key,'askedReputation',true);	//BAD to refresh hint
		}
		if(s.get(key,'askedWorldMap')){
			if(!s.get(key,'openedWorldMap'))
				return s.setHUD(key,'tab-worldMap','flashing');
			else
				s.setHUD(key,'tab-worldMap','normal');
		}
		if(s.get(key,'askedQuest')){
			if(s.testQuestActive(key))
				return s.setHUD(key,'tab-quest','flashing');
			else
				s.setHUD(key,'tab-quest','normal');
		}
	}
});
s.newMapAddon('QfirstTown-genetosHouse2',{
	load:function(spot){
		
	}
});

s.newPath('myPath',s.newPath.compileSpotList('intro',s.newPath.spotList([s.newPath.spotChain('blue',0,1)])));
s.newBoss('dragon',s.newBoss.variable({"direction":1,"rotAngleInit":false,"phase0rot":0,"rotationAngle":0,"randomAngle":0}),function(boss){
	var SPD = 0.7;
	s.newBoss.phase(boss,'phase0',{
		loop:function(boss){
			if(b.get(boss,'_framePhase') % 25 !== 0)
				return;
			b.add(boss,'phase0rot',15);
			var rot = b.get(boss,'phase0rot');
			
			
			var dist = b.getDistance(boss);
			var increment = 6;
			if(dist < 100){
				increment = 10;
			}
			else if(dist < 150){
				increment = 8;
			}
			for(var i = 0 ; i < 360; i += 180){	//twice
				for(var j = -22; j < 22; j+= increment){
					var realAngle = rot + i + j;
					b.useAbility(boss,'fireball-360',{
						angle:realAngle,			
					});
				}
			}
		},
		transitionTest:function(boss){
			if(b.get(boss,'_framePhase') > 300 && b.getDistance(boss) < 500) 
				return 'phase1';
		},
	});
	s.newBoss.phase(boss,'phase1',{
		loop:function(boss){
			if(b.get(boss,'_framePhase') < 51) 
				return;
			if(b.get(boss,'rotAngleInit') === false){
				b.set(boss,'rotAngleInit',true);
				b.set(boss,'rotationAngle',b.get(boss,'_angle'));
				b.set(boss,'direction',Math.random() > 0.5 ? -1 : 1);
			}
			
			if(b.get(boss,'_framePhase') > 51+15){
				var toadd = b.get(boss,'direction') * SPD;
				b.add(boss,'rotationAngle',toadd);
			}
			
			var angle = b.get(boss,'rotationAngle');		
			
			b.useAbility(boss,'fireball-fast',{
				angle:angle-20,
				x:Tk.sin(angle)*60,
				y:-Tk.cos(angle)*60,
			});
			b.useAbility(boss,'fireball-fast',{
				angle:angle+20,
				x:-Tk.sin(angle)*60,
				y:Tk.cos(angle)*60,
			});
			
			var dist = b.getDistance(boss);
			var increment = 6;
			if(dist < 100){
				increment = 12;
			}
			else if(dist < 150){
				increment = 10;
			}
			
			if(b.get(boss,'_framePhase') % 30 === 0){
				for(var i = 0; i < 240; i += increment)	
					b.useAbility(boss,'fireball-oob',b.get(boss,'rotationAngle')+i+60);
			}
		},
		transitionTest:function(boss){
			if(b.get(boss,'_framePhase') > 200) 
				return 'phase0';
		},
		transitionIn:function(boss){
			b.set(boss,'rotAngleInit',false);
		}
	});
});

s.exports(exports);
