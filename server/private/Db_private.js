
"use strict";
(function(){ //}
//Note: Tk and ERROR are not loaded yet.
var LOCAL_DB = 'localhost:27017/test';
var REFRESH_CONNECTION_INTERVAL = 60*1000;
var COLLECTIONS = ["clientError","sideQuest","zeldaGlitch","socialMedia","achievement","pingData","report","player",'contributionHistory','socialMedia',"offlineAction","main","equip","account",'competition','questRating','highscore','questVar','mainQuest'];

var mongojs = require("mongojs");
	
var HAS_BEEN_INIT_ALREADY = false;
var D = {B:null};
exports.initDb = function(data){	//data:{databaseURI,deleteDb,emailData,nodetimeData,onlineDb}
	if(HAS_BEEN_INIT_ALREADY) return;	//only allow db to go to other file once
	HAS_BEEN_INIT_ALREADY = true;
	
	data = data || {};
	var MONGO = {	//public
		options: {
			server:{
				auto_reconnect: true,
				socketOptions:{
					connectTimeoutMS:1000*30,
					keepAlive:1,
					socketTimeoutMS:1000*30,
				}
			},
			replset:{
				auto_reconnect: true,
				socketOptions:{
					connectTimeoutMS:1000*30,
					keepAlive:1,
					socketTimeoutMS:1000*30,
				}
			}
		}
	};
	
	var databaseURI = data.databaseURI;
	
	if(!data.onlineDb && !data.databaseURI){
		INFO('LOCAL DB');
		databaseURI = LOCAL_DB;
	}
	D.B = mongojs.connect(databaseURI, COLLECTIONS, MONGO.options);
	D.B.main.findOne({},function(err){
		if(err) 
			INFO('Unable to connect with database. Most likely wrong password.');
	});
	setInterval(function(){	
		D.B.close();
		D.B = mongojs.connect(databaseURI, COLLECTIONS, MONGO.options);
	},REFRESH_CONNECTION_INTERVAL);	//refresh connection
	
	//############################
	
	if(data.deleteDb && !NODEJITSU && !MINIFY){
		for(var i = 0 ; i < COLLECTIONS.length; i++)
			D.B[COLLECTIONS[i]].remove();
		INFO('DELETED EVERYTHING IN DATABASE!');
	}
	
	
	if(!NODEJITSU && !MINIFY)
		require('./Db_maintenance').init(D);
	
	return DbConstructor();
	
	//require('social...').init(data);
	//require('email...').init(data);
}

var DbConstructor = function(){
	var tmp = {};
	tmp.require = function(array){
		if(!Array.isArray(array)) array = [array];
		var list = {};
		for(var i = 0 ; i < array.length; i++){
			if(COLLECTIONS.indexOf(array[i]) === -1) 
				return INFO('table dont exist',array[i]);
			list[array[i]] = DbConstructor.Part(array[i]);
		}
		list.err = function(err){ 
			if(err)
				if(typeof ERROR !== 'undefined')
					ERROR.err(1,err); 
				else
					INFO(err.toString());
		}
		return list;
	}
	return tmp;
}

DbConstructor.Part = function(name){
	var tmp = {};
	tmp.find = function(){
		if(!dbVerify()) return;
		return D.B[name].find.apply(D.B[name],parseArguments(arguments));
	}
	tmp.findOne = function(request,wantedData){
		if(!dbVerify()) return;
		wantedData._id = 0;
		return D.B[name].findOne.apply(D.B[name],parseArguments(arguments));
	}
	tmp.update = function(searchInfo,updateInfo,cb){
		if(!dbVerify()) return;
		return D.B[name].update.apply(D.B[name],parseArguments(arguments));
	}
	tmp.upsert = function(searchInfo,updateInfo,cb){	//home made
		if(!dbVerify()) return;
		return tmp.update(searchInfo,updateInfo,{upsert:true},cb || handleError);
	}
	tmp.insert = function(updateInfo){
		if(!dbVerify()) return;
		return D.B[name].insert.apply(D.B[name],parseArguments(arguments));
	}
	tmp.remove = function(){
		if(!dbVerify()) return;
		return D.B[name].remove.apply(D.B[name],parseArguments(arguments));
	}
	
	tmp.aggregate = function(){
		return D.B[name].aggregate.apply(D.B[name],arguments);
	}
	
	return tmp;


}

var helper = function(func){
	return function(err){
		if(err) 
			ERROR.err(1,err);
		else 
			func.apply(this,arguments);
	}
};

var parseArguments = function(args){
	for(var i = 0 ; i < args.length; i++){
		if(typeof args[i] === 'function'){
			args[i] = helper(args[i]);
		}
	}
	return args;
}

var handleError = function(err){
	if(err)
		ERROR.err(1,err);
}

var dbVerify = function(){
	return true;
}




})(); //{








