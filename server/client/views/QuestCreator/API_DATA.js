var LIST = [];
if(typeof exports !== 'undefined')
	exports.LIST = LIST;
	
var add = function(name,description,advanced,priority,ret,p1,p2,p3,p4,p5,p6,p7){
	var a = {
		name:name || '',
		description:description || '',
		ret:ret || null,
		advanced:advanced || false,
		priority:priority || 0,
		param:[],	
	};
	if(p1) a.param.push(p1);
	if(p2) a.param.push(p2);
	if(p3) a.param.push(p3);
	if(p4) a.param.push(p4);
	if(p5) a.param.push(p5);
	if(p6) a.param.push(p6);
	if(p7) a.param.push(p7);
	
	LIST.push(a);
}
var ret = function(type,description){
	return {
		name:'',
		type:type || '',
		description:description || '',
	}
}
var param = function(name,type,description){
	if(name === 'key'){
		type = 'key';
		description = 'apply event to the actor with this key';
	}
	return {
		name:name || '',
		type:type || '',
		description:description || '',
	}
}
var f = false;
var t = true;

//################
add("s.completeQuest", "Complete the quest.",
				f, 2, null,
				param("key")
			);

			add("s.testQuestActive", "Returns true if the quest is active.",
				f, 2, ret("boolean",""),
				param("key"),
				param("quest","string","test if that quest is active. by default its your quest","",true)
			);
			
			

			add("s.failQuest", "End the quest without giving rewards.",
				f, 2, null,
				param("key")
			);

			add("s.isOnline", "Is online? Return true if player with this key is online.",
				t, 1, ret("boolean", ""),
				param("key")
			);
			add("s.getPartySize", "Return the amount of players in the party of the actor with this key.",
				t, 1, ret("number", ""),
				param("key", "key", "event applied to actor with this key", "key")
			);
			add("s.getReputationPt", "Return amount of reputation points.",
				t, 1, ret("number", ""),
				param("key")
			);
			add("s.callEvent", "Call a quest event with the parameters specified. Ex: s.callEvent('addPt',key,100) where addPt is another event with 2 parameters ex: (key,num)",
				f, 2, ret("any", "return what the event returns"),
				param("event", "event", "event id to call. can be anonymous function.", "", f),
				param("*p0*", "any", "1st parameter.", "", t),
				param("*p1*", "any", "2nd parameter.", "", t),
				param("*p2*", "any", "3rd parameter.", "", t),
				param("...", "any", "and so on", "", t)
			);

			//Quest Variable
			add("s.get", "Return quest variable value.",
				f, 3, ret("any", ""),
				param("key"),
				param("attr", "variable", "name of quest variable", "variableId")
			);

			add("s.set", "Set a quest variable value.",
				f, 3, null,
				param("key"),
				param("attr", "variable", "name of quest variable", "variableId"),
				param("value", "any", "new value", "420")
			);

			add("s.add", "Increase/decrease a number quest variable value.",
				f, 3, null,
				param("key"),
				param("attr", "variable", "name of quest variable", "variableId"),
				param("value", "number", "amount to add (can be negative)", "1")
			);

			add("s.isChallengeActive", "Return true is challenge is active.",
				t, 2, ret("boolean", ""),
				param("key"),
				param("name", "challenge", "challenge id", "challengeId")
			);

			add("s.frameToChrono", "Convert frame to x:xx:xx format.",
				t, 1, ret("string", "fomatted chrono string"),
				param("frame", "number", "", "spot")
			);

			add("s.getParty", "Return the list of key of every player in the party.",
				t, 1, ret("key[]", "fomatted chrono string"),
				param("key")
			);

			add("s.inputToText", "Convert an ability input slot to string. (ex: 0 becomes Left-Click)",
				t, 1, ret("string", "fomatted chrono string"),
				param("abilitySlot", "number", "between 0 and 4", "")
			);
			add("s.isInDialogue", "Return true if the player is in a dialogue with an NPC.",
				t, 1, ret("boolean", ""),
				param("key")
			);

			add("s.setInterval", "Call an event every set amount of time. If the event called doesn't return true, the event won't be called again and the loop stops. The interval is linked with an actor. If the actor dies, so does the interval.",
				t, 1, null,
				param("key"),
				param("event", "event", "must return true to continue looping", ""),
				param("interval", "number", "time in frame before calling it again", ""),
				param("id", "string", "using same id will overwrite the old one", "", t)
			);

			add("s.filterScreen", "Apply an uniform color filter over the game. Can be removed via s.removeScreenEffect. ",
				t, 1, null,
				param("key"),
				param("id", "string", "used to remove the filter", ""),
				param("filter", "string", "rgba color or the filter. ex='rgba(255,0,0,0.1)'", "")
			);

			add("s.removeScreenEffect", "Remove an effect created by  s.filterScreen, s.addFadeout, s.shakeScreen or s.addTorchEffect.",
				t, 1, null,
				param("key"),
				param("id", "string", "id of the screen effect", "")
			);



			add("s.addStartQuestMarker", "Add a quest marker to the start of the quest which has been marked via m.setAsStartPoint in the map load.",
				t, 1, null,
				param("key")
			);
			add("s.removeStartQuestMarker", "Remove the starting quest marker added via s.addStartQuestMarker.",
				t, 1, null,
				param("key")
			);

			add("s.canInteractWith", "Return true if the player can interact with the actor. Consider distance and interact cooldown.",
				t, 1, null,
				param("key"),
				param("eid", "key", "actor the player is trying to interact with"),
				param("message", "string", "message displayed if the player can't interact.", "", t),
				param("overwriteDist", "number", "overwrite the default max distance in pixel", "", t)
			);

			add("s.moveActor", "Move the actor relative to current position. Only use small values (less than 32). The move is instant. For teleporting the player, use s.teleport.",
				t, 1, null,
				param("key"),
				param("vx", "number", "variation in x"),
				param("vy", "number", "variation in y")
			);
			add("s.disableCombatUntilMove", "Prevent the player from attacking or being attacked until he moves.",
				t, 1, null,
				param("key")
			);

			add("s.actorExists", "Return true if the actor is in the game.",
				t, 1, ret("boolean", ""),
				param("key")
			);

			add("s.triggerPush", "Simulate a click from the pusher (player) on the pushable actor. Still test if the pushing is valid as if the player did it himself.",
				t, 1, null,
				param("pusher", "key","key of the actor performing the push"),
				param("pushed", "key","key of the actor being pushed")
			);

			add("s.simulatePush", "Push the actor in the specified direction. Is not linked with a player. No validation is performed.",
				t, 1, null,
				param("pushed", "key", "the pushable actor"),
				param("direction", "string", "down,up,left or right")
			);

			add("s.getSpot", "Return an object {x,y} of the spot specified.",
				t, 1, ret("object", "{x,y} of the spot"),
				param("key"),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1")
			);

			add("s.moveTo", "Force the actor to move to the specified spot. Collision and move speed still applies.",
				t, 1, null,
				param("key"),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1"),
				param("callback", "event", "event to call when actor reaches destination", "", t)
			);
			add("s.teleportTo", "Teleport the actor (npc or player) to the specified spot instantly. Must stay within the same map.",
				t, 1, null,
				param("key"),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1")
			);

			add("s.getItemAmount", "Get the amount of a certain item the player has.",
				t, 1, ret("amount", "number"),
				param("key"),
				param("item", "item", "item id", "")
			);


			add("s.playSfx", "Play a sound effect.",
				t, 1, null,
				param("key"),
				param("id", "sfx", "sfx id", ""),
				param("volume", "number", "volume modifier 0 to 1", "1", t)
			);

			add("s.iconToText", "Convert an icon id to a string which can be displayed in s.message and s.displayPopup.",
				t, 1, ret("string", "formatted icon string"),
				param("id", "icon", "icon id", "")
			);

			add("s.getAttr", "Get a copy of the value of an attribute of an actor.",
				t, 1, ret("any", "a copy of the attribute"),
				param("key"),
				param("attr", "string", "attribute name", "hpMax")
			);

			add("s.setAttr", "Set an attribute of an actor. The attributes you can change are about the same than those in the extra param when creating it. Make sure to sure the right constructor for the value. Ex: s.newNpc.damagedIf('player').",
				t, 1, ret("any", "a copy of the attribute"),
				param("key"),
				param("attr", "string", "attribute name", "hpMax"),
				param("value", "any", "new value", "hpMax")
			);

			//Communication
			add("s.message", "Add message in player chat box. HTML coding works.",
				f, 2, null,
				param("key"),
				param("text", "string", "text", "hey"),
				param("color", "string", "color of text. Can use color name or hex code.", "yellow", t)
			);
			add("s.displayQuestion", "Ask a true/false question to player. Call event if player answers yes.",
				f, 2, null,
				param("key"),
				param("text", "string", "question text", ""),
				param("event", "event", "event to call if select yes", ""),
				param("answerType", "string", "boolean | number | option | string", ""),
				param("option", "string[]", "list of options the player can choose", "", t)
			);
			add("s.displayPopup", "Open a popup box in top of screen with message. HTML coding works. Only 1 popup can be opened at a time. They will overwrite each other.",
				f, 2, null,
				param("key"),
				param("text", "string", "text", "hey")
			);
			add("s.startDialogue", "Start dialogue. The dialogue doesnt need to be linked with a npc. Quest must be active else Quest Windows shows instead.",
				f, 2, null,
				param("key"),
				param("npc", "dialogue", "npc id", ""),
				param("node", "string", "node id", "")
			);
			add("s.endDialogue", "Close the dialogue box.",
				t, 1, null,
				param("key", "key", "apply event to actor with this key", "key")
			);

			add("s.ERROR", "Output an error in the terminal. (Not seen by players)",
				t, 1, null,
				param("txt", "string", "text showed", "error!")
			);

			add("s.startChrono", "Start a chronometer.",
				t, 2, null,
				param("key"),
				param("id", "string", "chrono id", ""),
				param("visible", "boolean", "if the timer is visible to the player", "", t),
				param("text", "string", "text showed to player on mouseover", "", t)
			);

			add("s.stopChrono", "Stop chronometer and get the time in frames (25 FPS). Continue even when player is offline",
				t, 2, ret("number", "amount of frames passed since it started"),
				param("key"),
				param("id", "string", "chrono id", "")
			);
			add("s.removeChrono", "Remove chronometer from memory and from player view. The player can remove it himself client side too.",
				t, 1, ret("number", "amount of frames passed since it started"),
				param("key"),
				param("id", "string", "chrono id", "")
			);

			add("s.setTimeout", "Call a function in the future (time in frame). Linked with a player.",
				t, 2, null,
				param("key"),
				param("event", "event", "event to call", "eventId"),
				param("time", "number", "frames before calling it", "250"),
				param("id", "string", "timeout id.", "timeoutId", t)
			);

			add("s.addFadeout", "Screen turns black then goes back to normal. num: time in frame",
				t, 1, null,
				param("key"),
				param("id", "string", "fadeout id", "myId"),
				param("duration", "number", "amount of frames", "25", t),
				param("color", "string", "color used for transition", "black", t)

			);

			add("s.addTorchEffect", "Screen turns black then goes back to normal. num: time in frame",
				t, 1, null,
				param("key"),
				param("id", "string", "effect id. used to remove the effect", "myEffect"),
				param("radiusInside", "number", "size of the 100% visible circle", "200", t),
				param("colorOutside", "string", "color used for transition", "black", t),
				param("radiusOutside", "number", "size of the semi-visible circle", "300", t),
				param("colorInside", "string", "color used for transition", "black", t)
			);
			add("s.shakeScreen", "Screen shakes.",
				t, 1, null,
				param("key"),
				param("id", "string", "effect id. used to remove the effect", "myEffect"),
				param("duration", "number", "duration in frames", "10", t),
				param("interval", "number", "time in ms between each shake", "50", t),
				param("magn", "number", "amount of pixel the screen will shake at most", "10", t)
			);

			add("s.teleport", "Teleport the player in a new map instance.",
				f, 3, null,
				param("key"),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1"),
				param("instance", "instance", "main=everybody, party=only party members or solo=only you", "party", t),
				param("newmap", "boolean", "if true and map already exists, create new instance instead of teleporting to old instance.", "", t),
				param("deleteold", "string", "map model id. if player was in this map when event called, destroy the old map.", "", t)
			);

			add("s.teleportTown", "Teleport the player to the main town. Also set the respawn point there.",
				t, 1, null,
				param("key")
			);

			add("s.setRespawn", "Set Respawn of player. When he dies, this is where he will respawn.",
				f, 3, null,
				param("key"),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1"),
				param("instance", "instance", "main=everybody, party=only party members or solo=only you", "party", t),
				param("safe", "boolean", "if map does no longer exist when player dies, create a new instance and still teleport him.", "false", t)
			);


			//Map Common
			add("s.isAtPosition", "Return true if actor is near the xy position.",
				t, 1, ret("boolean", ""),
				param("key"),
				param("x", "number", "", "100"),
				param("y", "number", "", "100"),
				param("delta", "number", "+- range at which it still counts has same position.", "4", t)
			);

			add("s.isAtSpot", "Return true if actor is near a map spot.",
				t, 1, ret("boolean", ""),
				param("key"),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1"),
				param("delta", "number", "+- range at which it still counts has same position.", "4", t)
			);
			add("s.isInMap", "Return true if player is in the map specified.",
				t, 1, ret("boolean", ""),
				param("key"),
				param("map", "mapId", "Map model id.", "")
			);

			add("s.isInQuestMap", "Return true if player is in any of the maps exclusive to this quest",
				t, 1, ret("boolean", ""),
				param("key")
			);
			add("s.getDistance", "Return distance in pixel between 2 actors. Do not check if in same map.",
				t, 1, ret("number", ""),
				param("key"),
				param("key2", "string", "key of the second actor", "")
			);

			add("s.getPosition", "Return Object with x and y of the actor.",
				t, 1, ret("object", "{x:Number,y:Number}"),
				param("key")
			);
			add("s.addQuestMarker", "Mark a location on minimap.",
				t, 2, null,
				param("key"),
				param("id", "string", "can be anything, used to remove quest marker", ""),
				param("map", "mapLetter", "map model id", "mapId"),
				param("letter", "string", "spot letter based on Tiled file", "t1")
			);
			add("s.removeQuestMarker", "Remove a quest marker.",
				t, 2, null,
				param("key"),
				param("id", "string", "quest marker id to remove", "")
			);
			add("s.isAtStartSpot", "Returns true if player is near the quest starting point (which was set prior via m.setAsStartPoint).",
				t, 2, ret("boolean", ""),
				param("key")
			);

			//item
			add("s.addItem", "Add quest items to player inventory. Quest needs to be active. You can only add items exclusive to your quest.",
				f, 3, null,
				param("key"),
				param("item", "item", "item id", "itemId"),
				param("amount", "number", "amount", "1", t)
			);

			add("s.removeItem", "Remove quest items to player inventory.",
				f, 3, null,
				param("key"),
				param("item", "item", "item id", "itemId"),
				param("amount", "number", "amount", "1", t)
			);

			add("s.haveItem", "Return true if player has the items specified in his inventory. to test multiple item type, use multiple s.haveItem",
				f, 3, ret("boolean", "player has the items"),
				param("key"),
				param("item", "item", "item id", "itemId"),
				param("amount", "number", "amount, default = 1", "1", t)
			);

			//Map Event
			add("s.forEachActor", "Call an event for every actor in a map. Search can be narrowed by specifying actor type, a zone where actor must be, and tag.",
				t, 1, ret("key[]", "list of the actor key that match query"),
				param("key", "key", "key of an actor whos in the map", ""),
				param("map", "mapId", "Map model id.", ""),
				param("event", "event", "event called for each matching actor", ""),
				param("actorType", "actorType", "either actor (match all), player or npc", "null", t),
				param("atSpot", "spotLetter", "if not null, actor must be in the spot to count", "null", t),	//BAD...
				param("tag", "object", "to npc only, tag to match {attribute:value} to count", "", t)
			);

			add("s.getRandomPlayer", "Return a single key of a player in the map. Useful for death event.",
				t, 2, ret("key", "key of a random player"),
				param("key", "key", "key of an actor whos in the map (can be a npc)", ""),
				param("map", "mapId", "Map model id.", "")
			);

			add("s.getRandomNpc", "Return a single key of a npc in the map that matches the tag. if no tag, match everyone.",
				t, 2, ret("key", "key of a random npc"),
				param("key", "key", "key of an actor whos in the map (can be a npc)", ""),
				param("map", "mapId", "Map model id.", ""),
				param("tag", "object", "tag to match {attribute:value}", "")
			);

			//Tag
			add("s.hasTag", "Return true if actor has the tag specified",
				f, 2, ret("boolean", ""),
				param("key"),
				param("tag", "object", "tag to match {attribute:value}", "")
			);
			add("s.getTag", "Return a read-only copy of npc tag. To modify it, use s.setTag.",
				f, 1, ret("tag", "object"),
				param("key")
			);
			add("s.setTag", "Modify a npc tag.",
				f, 1, null,
				param("key"),
				param("tag", "string", "attribute", ""),
				param("value", "any", "new value", "")
			);



			//Map Creation in Event
			add("s.spawnActor", "Add an actor.	Note: Use s.spawnActor only if you want to spawn the actor after a specific action. Otherwise, use m.spawnActor",
				f, 2, ret("string", "key of npc created"),
				param("key", "key", "the actor will spawn in same instance than the player with the key specified", "key"),
				param("map", "mapLetter", "map model id", ""),
				param("letter", "string", "letter from tiled project", ""),
				param("model", "npc", "model of npc to create", ""),
				param("extra", "actorExtra", "difference between template and npc to create", "{}", t)
			);

			add("s.spawnActorOnTop", "Add an actor on top of the actor with the key.",
				t, 1, ret("key", "key of npc created"),
				param("key", "key", "the actor will spawn ontop ofthe actor with this key", "key"),
				param("map", "mapId", "map model id", ""),
				param("model", "npc", "model of npc to create", ""),
				param("extra", "actorExtra", "difference between template and npc to create", "{}", t)
			);

			add("s.spawnActorGroup", "Create a group of npc. Those npcs can respawn.",
				f, 1, ret("key[]", "list of keys of npcs created"),
				param("key", "key", "the actor will spawn in same instance than the player with the key specified", "key"),
				param("map", "mapLetter", "map model id", ""),
				param("letter", "string", "letter from tiled project", ""),
				param("respawn", "number", "amount of frame before respawn. if 0, never respawn.", ""),
				param("list", "s.spawnActorGroup.list[]", "array of s.spawnActorGroup.list. will specify npc to spawn", ""),
				param("event", "event", "can event for every actor created", "", t),
				param("spotDelta", "number", "max difference in pixel between spot and actually spawn location", "25", t)
			);

			add("s.spawnActorGroup.list", "Info concerning the npc to spawn in s.spawnActorGroup(). Does nothing if not placed inside s.spawnActorGroup function.",
				f, 1, ret("object", "correctly formatted param for s.spawnActorGroup"),
				param("model", "npc", "model of npc to create", ""),
				param("amount", "number", "amount of npc to spawn with that model", "1", t),
				param("extra", "actorExtra", "difference between template and npc to create", "{}", t)
			);
			add("s.spawnBlock", "Create a series of unpushable blocks. Useful to prevent the player to reach a certain zone. viewedIf condition for bullets is ALWAYS true. This means bullets can't pass through those blocks. ",
				f, 1, null,
				param("key", "key", "the actor will spawn in same instance than the player with the key specified", "key"),
				param("map", "mapLetter", "map model id", ""),
				param("letter", "string", "letter from tiled project", ""),
				param("viewedIf", "event", "if event(key) returns true, then player with key can see and is blocked by the blocks", ""),
				param("sprite", "spriteBlock", "either spike or invisible", "spike", t),
				param("extra", "actorExtra", "add extra actor attribute", "", t)
			);


			add("s.addAnim", "Create an animation at a specific location visible by everyone nearby ",
				t, 1, ret("string", "id of anim created"),
				param("key"),
				param("map", "mapLetter", "map model id", ""),
				param("letter", "string", "letter on tiled project", ""),
				param("name", "anim", "id of the animation", ""),
				param("sizeMod", "number", "size modifier default = 1", "1", t)
			);

			add("s.addAnimOnTop", "Create an animation on top of the actor with the key by everyone nearby ",
				t, 1, ret("string", "id of anim created"),
				param("key"),
				param("name", "anim", "id of the animation", ""),
				param("sizeMod", "number", "size modifier default = 1", "1", t),
				param("dontFollowActor", "boolean", "if true, anim wont move if player moves", "", t)
			);

			//Preset Related
			add("s.usePreset", "Force the player to use predetermined equip and/or abilities instead of his regular ones.",
				t, 1, null,
				param("key"),
				param("id", "preset", "id of the preset", "presetId")
			);
			add("s.hasPreset", "Test if player has specific preset.",
				t, 1, ret("boolean", "true if player has preset"),
				param("key"),
				param("id", "preset", "id of the preset", "presetId")
			);

			add("s.removePreset", "Remove a preset.",
				t, 1, null,
				param("key"),
				param("id", "preset", "id of the preset", "presetId")
			);

			add("s.addAbility", "Teach and assign to a slot an ability to the player for the duration of the quest.",
				t, 1, null,
				param("key"),
				param("id", "ability", "id of ability", "abilityId"),
				param("slot", "number", "0-5.", "0")
			);

			add("s.hasAbility", "Return true if player has the ability.",
				t, 1, ret("boolean", ""),
				param("key"),
				param("id", "ability", "id of ability", "abilityId")
			);
			add("s.addEquip", "Add a equip to a player for the duration of the quest.",
				t, 1, null,
				param("key"),
				param("id", "equip", "id of equip", "equipId")
			);

			//Enable
			//Logging out and back in will re-enable the passive. Put that function in _start event in order to remove the passive grid upon login.
			add("s.enableReputation", "Change if player receives boost from Reputation Grid. This includes Abilities granted from the grid. ",
				t, 1, null,
				param("key"),
				param("allow", "boolean", "true = receive boost; false = dont", "true")
			);
			add("s.enableAttack", "Change if player can use attacks and abilities.",
				f, 1, null,
				param("key"),
				param("allow", "boolean", "true = can attack; false = cant", "true")
			);
			add("s.enablePvp", "Change if player can attack other players.",
				t, 1, null,
				param("key"),
				param("allow", "boolean", "true = can attack; false = cant", "false")
			);
			add("s.enableCombat", "Change if player can attack and be attacked.",
				f, 1, null,
				param("key"),
				param("allow", "boolean", "true = can attack and be attacked; false = cant", "true")
			);
			add("s.enableMove", "Change if player can move.",
				f, 1, null,
				param("key"),
				param("allow", "boolean", "true = can move; false = cant", "true")
			);

			//Actor Mods
			add("s.setSprite", "Change apparence of actor. Will also change bumperbox and hitbot automatically.",
				f, 1, null,
				param("key"),
				param("name", "sprite", "id of the sprite (Check Db_sprite.js)", ""),
				param("size", "number", "size modifier for the sprite (default = 1)", "1", t),
				param("alpha", "number", "transparence", "1", t)
			);

			add("s.addBoost", "Increase or decrease a stat of an actor over a period of time.",
				f, 1, null,
				param("key"),
				param("stat", "stat", "id of the stat", "statId"),
				param("value", "number", "multiplier. 0.5 => stat is halved. 1=> do nothing. 2 => double", "2"),
				param("time", "number", "time in frames. if 0, permanent boost until quest over. 25FPS", "250", t),
				param("name", "string", "id of the boost (used for s.removeBoost) you can choose anything.", "myCustomBoostId", t)
			);

			add("s.removeBoost", "Remove a boost added previously via s.addBoost",
				f, 1, null,
				param("key"),
				param("name", "string", "id of the boost (specified in s.addBoost name param)", "boostId"),
				param("stat", "stat", "id of the stat", "statId")
			);

			add("s.killParty", "Kill every player in the party of the player with the key. Will trigger _death event.",
				t, 1, null,
				param("key")
			);
			add("s.killActor", "Kill an actor. Will trigger deathEvent if npc, _death event if player.",
				f, 1, null,
				param("key")
			);
			add("s.addHp", "Increase/decrease lifepoints of an actor",
				f, 1, null,
				param("key"),
				param("amount", "number", "can be negative or position", "-100")
			);
			add("s.setHp", "Set lifepoints of an actor",
				f, 1, null,
				param("key"),
				param("amount", "number", "", "")
			);
			add("s.rechargeAbility", "All abilities of that actor get ready to be used.",
				t, 1, null,
				param("key")
			);

			add("s.isPlayer", "Return true is the actor is a player.",
				f, 1, ret("boolean", ""),
				param("key")
			);
			add("s.respawnPlayer", "If player is dead, respawn him instantly.",
				t, 1, null,
				param("key")
			);
			add("s.respawnParty", "Every player in the party of the player with the key is respawned instantly.",
				t, 1, null,
				param("key")
			);
			add("s.healActor", "Regen hp and mana to full for that actor.",
				f, 1, null,
				param("key")
			);
			add("s.healParty", "Every player in the party of the player with the key has its hp and mana back to full.",
				t, 1, null,
				param("key")
			);

			add("s.followPath", "Force the actor to follow a predetermined path. Player must be in right map.",
				t, 1, null,
				param("key"),
				param("mapId", "mapId", "map id", ""),
				param("pathId", "path", "path id", ""),
				param("callback", "event", "event to call once the actor reached its destination", "", t)
			);
			add("s.endPath", "Stop following a path. Change combat and movement attribute of actor.",
				t, 1, null,
				param("key")
			);
			add("m.spawnActor", "Add an actor to a spot.",
				f, 3, ret("key", "key of npc created"),
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("model", "npc", "model of npc to create", ""),
				param("extra", "actorExtra", "difference between template and npc to create", "{}", t)
			);

			add("m.spawnActorGroup", "Create a group of npc. Those npcs can respawn.",
				f, 1, ret("key[]", "list of keys of npcs created"),
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("list", "s.spawnActorGroup.list[]", "array of s.spawnActorGroup.list. will specify npc to spawn", ""),
				param("respawn", "number", "amount of frame before respawn. if 0, never respawn.", "", t),
				param("event", "event", "event called for each new npc spawned.", "", t),
				param("spotDelta", "number", "max difference in pixel between spot and actually spawn location", "25", t)
			);
			add("m.spawnActorGroup.list", "Info concerning the npc to spawn in m.spawnActorGroup(). Does nothing if not placed inside m.spawnActorGroup function.",
				f, 1, ret("object", "correctly formatted param for s.spawnActorGroup"),
				param("model", "npc", "model of npc to create", ""),
				param("amount", "number", "amount of npc to spawn with that model", "1"),
				param("extra", "actorExtra", "difference between template and npc to create", "{}", t)
			);


			add("m.spawnBlock", "Create a series of unpushable blocks. Useful to prevent the player to reach a certain zone. viewedIf condition for bullets is ALWAYS true. This means bullets can't pass through those blocks. ",
				f, 2, null,
				param("zone", "spot", "ex: spot.a. select via button to the left", ""),
				param("viewedIf", "event", "if event(key) returns true, then player with key can see and is blocked by the blocks", ""),
				param("sprite", "spriteBlock", "either spike or invisible", "spike", t),
				param("extra", "actorExtra", "add extra actor attribute", "", t)
			);

			add("m.spawnToggle", "Create a toggle (switch): Call event when player activate/desactivate this actor. It starts in the off position. Player activating it for first time will trigger turnOn event.",
				f, 2, null,
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("viewedIf", "event", "if event(key) return true, then player with key can see and use the Off-Switch (the switch that will trigger the turnOn event)", ""),
				param("turnOn", "event", "event called when activating the Off-Switch", "eventId"),
				param("turnOff", "event", "event called when activating the On-Switch", "null", t),
				param("sprite", "spriteToggle", "name of sprite. only sprite box is supported", "box", t),
				param("extraOff", "actorExtra", "add extra actor attribute for off-switch", "{}", t),
				param("extraOn", "actorExtra", "add extra actor attribute for on-switch", "{}", t)
			);

			add("m.spawnTeleporter", "Create an actor that allows players who click on it to be teleported",
				f, 2, null,
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("event", "event", "event to call when player click. normally involves s.teleport.", "eventId"),
				param("sprite", "spriteTeleporter", "door, underground or zone", "zone"),
				param("extra", "actorExtra", "regular extra. useful to set angle and viewedIf", "{}", t)
			);

			add("m.spawnLoot", "Create a loot (chest): Call quest event when player activate/desactivate this actor. It starts in the off position. (Player activating it for first time will trigger open event)",
				f, 2, null,
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("viewedIf", "event", "if event(key) return true, then player with key can open the chest", ""),
				param("open", "event", "event called when opening the chest. normally makes it so viewedIf(key) returns false", ""),
				param("sprite", "spriteLoot", "name of sprite. support chest, flower", "chest", t),
				param("extraOff", "actorExtra", "add extra actor attribute for closed chest", "{}", t),
				param("extraOn", "actorExtra", "add extra actor attribute for opened chest", "{}", t)
			);

			add("m.spawnSignpost", "Create a sign. Upon clicking, it will display a text in players chatbox.",
				f, 1, null,
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("text", "string", "text showed to the player", "Hello."),
				param("extra", "actorExtra", "add extra actor attribute for on-switch", "{}", t)
			);

			//Rest
			add("m.translateSpot", "Create a new spot using a pre-existing spot and translating it. ",
				t, 1, ret("object", "new spot correctly formatted"),
				param("spot", "spot", "ex: spot.a. select via button to the left", ""),
				param("x", "number", "difference in x between base spot and new spot", "15"),
				param("y", "number", "difference in y between base spot and new spot", "-30")
			);

			//Loop
			add("m.testInterval", "Return true every x frames. Game runs at 25 FPS.",
				t, 1, ret("boolean", ""),
				param("frame", "number", "amount of frames", "25")
			);

			add("m.forEachActor", "Call an event for every actor in a map. Search can be narrowed by specifying actor type, a zone where actor must be, and tag.",
				t, 1, ret("key[]", "list of the actor key that match query"),
				param("spot", "spotAny", "the global spot object", "spot"),
				param("freq", "number", "only test the collision every x frames for better performance (25FPS) ", "5"),
				param("event", "event", "event called for each matching actor", ""),
				param("actorType", "actorType", "either actor (match all), player or npc", "npc", t),
				param("atSpot", "spot", "if not null, actor must be in the spot to be considered", "null", t),
				param("tag", "object", "For npc only. Tag to match {attribute:value} to be considered", "{}", t)
			);

			add("m.getRandomPlayer", "Return a single key of a player in the map. Useful for death event.",
				t, 1, ret("key", "key of a random player"),
				param("spot", "spot", "ex: spot.a. ANY spot will work and wont make any difference.", "spot")
			);

			add("m.getRandomNpc", "Return a single key of a npc in the map that matches the tag. if no tag, match everyone.",
				t, 1, ret("key", "key of any actor in the map"),
				param("spot", "spot", "ex: spot.a. ANY spot will work and wont make any difference.", "spot"),
				param("tag", "object", "tag to match {attribute:value}", "{}", t)
			);


			add("m.isAtSpot", "Return true if the actor is in the spot.",
				t, 1, ret("boolean", "if at the spot"),
				param("key"),
				param("spot", "spot", "ex: spot.a", "spot"),
				param("delta", "number", "radius if spot is a point", "", t)
			);


			add("m.setAsStartPoint", "Set where the quest starts. Normally the spot of the first npc you need to talk to. Used by s.addStartQuestMarker.",
				t, 1, null,
				param("spot", "spot", "ex: spot.a", "spot")
			);
			
			
			