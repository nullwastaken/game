//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
	window.SERVER = false;
	window.player = {};
	window.main = {};
	window.exports = {};
	window.require2 = null;
	window.require3 = null;
	window.require4 = null;
	
	exports.m = function(){ 
		for(var i in this) 
			window[i] = exports[i]; 
	}

	require3 = function(str){	//instant request
		if(!exports[str]) exports[str] = {}; // for Combat_client...
		return exports[str];	
	}

	require2 = require4 = function(str){	//works because if declated=>good, if not, then when declaring, it will overwrite value
		if(require4List[str])
			return require4List[str];
		require4List[str] = {};
		return require4List[str];
	};

	var require4List = {};

	var initRequire4 = function(){
		for(var i in exports){
			for(var j in exports[i]){
				if(require4List[i])	//case CST...
					require4List[i][j] = exports[i][j];				
			}
		}
	}

	$(document).ready(function() {
		initRequire4();
		
		exports.Sign.init();
		$(document).tooltip({
			items: '*:not(.ui-dialog-titlebar-close)',
			show:false,
			hide:false,
			tooltipClass: "toolTipDetails",
		});
	});
})(); //{

