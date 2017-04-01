
"use strict";
var OfflineAction;
global.onReady(function(initPack){
	OfflineAction = rootRequire('server','OfflineAction');
	db = initPack.db;
},{db:['socialMedia']});
var SocialMedia = exports.SocialMedia = {};

//TODO: client manually call updatePt, call on login

var request = require('request');
//var Twit; 
var T;
var db;

var getNiceDate = function(){
	var str = (new Date()).toISOString();
	str = str.replace('T',' ');
	str = Tk.getSplit0(str,'.');
	return str;
}

//BAD unused atm
SocialMedia.create = function(username){
	return {
		username:username,
		twitch:{
			username:'',
			lastUpdate:-1,
			totalViewer:0,
		},
		youtube:{
			username:'',
			lastUpdate:-1,
			totalView:0,
		},
		reddit:{
			username:'',
			lastUpdate:-1,
			totalPost:0,
			totalUps:0,
			postList:[],	//id
		},
		twitter:{
			username:'',
			lastUpdate:-1,
			totalTweet:0,
			totalFollowerXTweet:0,
		},
	}
};
/*
//


setInterval(function(){
	SocialMedia.youtube.updatePt();
	SocialMedia.reddit.updatePt();
},CST.HOUR*6);
setInterval(function(){
	SocialMedia.twitch.updatePt();
},CST.MIN*30);
*/	


SocialMedia.twitter = {};
// { created_at: 'Fri Jul 11 17:18:20 +0000 2014',$$$  id: 487647086306132000,$$$  id_str: '487647086306131968',$$$  text: '#rainingchain #QtowerDefence Skyier: This is the best quest of all! Tower Defence, but seen in a different way!',$$$  source: '<a href="http://rainingchain.com/" rel="nofollow">GAME_NAME Bot</a>',$$$  truncated: false,$$$  in_reply_to_status_id: null,$$$  in_reply_to_status_id_str: null,$$$  in_reply_to_user_id: null,$$$  in_reply_to_user_id_str: null,$$$  in_reply_to_screen_name: null,$$$  user: { id: 2547296246, id_str: '2547296246' },$$$  geo: null,$$$  coordinates: null,$$$  place: null,$$$  contributors: null,$$$  retweet_count: 0,$$$  favorite_count: 0,$$$  entities: { hashtags: [Object], symbols: [], urls: [], user_mentions: [] },$$$  favorited: false,$$$  retweeted: false,$$$  lang: 'en' },
SocialMedia.twitter.post = function(text,cb){
	return;
	/*
	text = "#rainingchain " + text;
	T.post('statuses/update', { status: text }, function(err, data, response) {
		if(err) ERROR.err(3,err);
		if(cb) cb();
	});
	*/
};
SocialMedia.twitter.getRainingChainBotTweet = function(hashtag,cb){
	return; /*
	T.get('statuses/user_timeline',{ q: '#' + hashtag, trim_user:true, screen_name:'rainingchainbot', count: 100 }, function(err, data, response) {
		var list = [];
		for(var i in data){
			if(data[i].text && data[i].text.$contains(hashtag)){
				var str = data[i].text.replace('#rainingchain #' + hashtag + ' ','');
				var name = Tk.getSplit0(str,': ');
				str = str.slice(name.length + 2);
				list.push({hashtag:hashtag,name:name,text:str}); 
			}
		}
		cb(list);
	});
	*/
};
SocialMedia.twitter.getTweetAmountViaList = function(list,cb){
	cb(list.length);
};
SocialMedia.twitter.getListFromUser = function(name,cb){	//return amount of tweets, should return array with id instead
	T.get('statuses/user_timeline',{ q: '#rainingchain', trim_user:true, screen_name: name, count: 100 }, function(err, data, response) {
		try {
			var list = [];
			for(var i in data)
				if(data[i].text.$contains('#rainingchain'))
					list.push({id:data[i].id});
			cb(list);
		} catch(err){}	//BAD
	});
}
SocialMedia.twitter.getFollowerCount = function(name,cb){
	T.get('followers/ids', { screen_name: name },  function (err, data, response) {
		cb(data.length);
	});
}

var CP_PER_TWITCH_VIEWER = 5;
SocialMedia.twitch = {};
//https://api.twitch.tv/kraken/search/streams?q=Super_Mario_64
SocialMedia.twitch.getList = function(cb){	//uses tw name, not rc name
	request('https://api.twitch.tv/kraken/search/streams?q=raining_chain', function (e, ress, body) {	//to fix so GAME_NAME
		body = JSON.parse(body);
		var tmp = {};
		for(var i in body.streams){
			tmp[body.streams[i].channel.name] = body.streams[i].viewers;	//tw_name : viewer
		}
		cb(tmp);
	});	
};

SocialMedia.twitch.updatePt = function(){
	SocialMedia.twitch.getList(function(list){
		for(var i in list){
			helper(i,list[i]);			
		}		
	});
};

var helper = function(name,viewCount){
	db.socialMedia.update({"twitch.username":name},{$set:{"twitch.lastUpdate":Date.now()},$inc:{"twitch.totalView":viewCount}});
	
	db.socialMedia.findOne({"twitch.username":name},{username:1},function(err,doc){
		if(!doc) return;
		SocialMedia.giveCP(doc.username,viewCount * CP_PER_TWITCH_VIEWER,'twitch',viewCount + ' Twitch viewers on ' + getNiceDate());
	});
}



var CP_PER_YT_VIEW = 0.1;
SocialMedia.youtube = {};
//http://gdata.youtube.com/feeds/api/users/IdkWhatsRc/uploads/?start-index=1&max-results=50&alt=json&q=rainingchain
SocialMedia.youtube.getListFromUser = function(name,cb){	//uses yt name, not rc name
	request('http://gdata.youtube.com/feeds/api/users/' + name + '/uploads/?start-index=1&max-results=50&alt=json&q=rainingchain', function (e, ress, body) {
		try {
			body = JSON.parse(body);
			var list = [];
			for(var i in body.feed.entry){
				var vid = body.feed.entry[i];
				if(vid.title.$t.$contains('rainingchain') || vid.title.$t.$contains('GAME_NAME') || vid.title.$t.$contains('RainingChain') || vid.title.$t.$contains('Rainingchain'))
					list.push({title:vid.title.$t,viewCount:+vid["yt$statistics"].viewCount});	
			}
			cb(list);
		} catch(err){
			ERROR.err(3,err);
		}	//BAD
	});	
};

SocialMedia.youtube.updatePt = function(){
	db.socialMedia.find({"youtube.username":{$ne:""}},{username:1,youtube:1}).forEach(function(err,doc){
		if(!doc) return;
		SocialMedia.youtube.getListFromUser(doc.youtube.username,function(list){
			var sum = 0;
			for(var i = 0 ; i < list.length; i++){
				sum += list[i].viewCount;
			}
			
			var diff = sum - doc.youtube.totalView;
			if(diff < 0) 
				diff = 0;
				
			SocialMedia.giveCP(doc.username,Math.ceil(diff * CP_PER_YT_VIEW),'youtube',diff + ' additional Youtube views on ' + getNiceDate());
			
			db.socialMedia.update({username:doc.username},{$set:{"youtube.lastUpdate":Date.now(),"youtube.totalView":sum}});
		});
	});
}


SocialMedia.reddit = {};
//http://www.reddit.com/r/rainingchain/hot.json
//ts("m.contribution.point.reddit.lastUpdate = -1")
SocialMedia.reddit.getList = function(cb){
	request('http://www.reddit.com/r/rainingchain/hot.json', function (e, ress, body) {
		body = JSON.parse(body);
		var tmp = body.data.children;
		
		var list = [];	//need to get post name/id
		for(var i in tmp){
			list.push({id:tmp[i].data.id,username:tmp[i].data.author,ups:tmp[i].data.ups});			//could be .score if want include downs
		}
		cb(list);
	});
};

SocialMedia.reddit.updatePt = function(){	//
	SocialMedia.reddit.getList(function(list){
		var nameToData = {};
		
		for(var i = 0 ; i < list.length; i++){
			nameToData[list[i].username] = nameToData[list[i].username] || [];
			nameToData[list[i].username].push(list[i]);
		}
		
		var func = function(err,doc){
			if(!doc) return;
			
			var givePtCount = 0;
			var newPostCount = 0;
			
			for(var i = 0 ; i < nameToData[doc.reddit.username].length; i++){
				var n = nameToData[doc.reddit.username][i];
				if(!doc.reddit.postList.$contains(n.id)){
					doc.reddit.postList.push(n.id);
					doc.reddit.totalUps += n.ups;
					givePtCount += 1 + Math.ceil(n.ups/2);
					newPostCount++;
				}
			}
			doc.reddit.totalPost = doc.reddit.postList.length;
			doc.reddit.lastUpdate = Date.now();
			db.socialMedia.update({username:doc.username},{$set:{reddit:doc.reddit}});
			if(givePtCount !== 0)
				SocialMedia.giveCP(doc.username,givePtCount,'reddit',newPostCount + ' new Reddit posts (' + getNiceDate() + ')');
		}
			
		for(var name in nameToData)
			db.socialMedia.findOne({"reddit.username":name},{username:1,reddit:1},func);
	});
}

SocialMedia.giveCP = function(username,pt,type,comment){
	OfflineAction.create(username,'addCP',OfflineAction.Data.addCP(pt,type,comment));
}
/*
var async_function = function(val, callback){
    process.nextTick(function(){
        callback(val);
    });
};
*/
/*
exports.updateContribution = function(){
	db.main.find({},{username:1,contribution:1},function(err,res){		//TOCHANGE, contribution is now in main
		//TOUPDATE: socialMedia no longer exist, check contribution,point,twitch,username
		exports.reddit(function(redditlist){	//only called once for everyone
			exports.twitch(function(twitchlist){	//only called once for everyone
			
				for(var i = 0 ; i < res.length; i++){
					var s = res[i].socialMedia;
					var c = res[i].contribution.source;
					var user = res[i].username;
					
					//contribution:{reward:{},source:{youtube:{point:0},twitch:{point:0},reddit:{point:0},twitter:{point:0}}};
					
					//Reddit
					if(s.reddit.username){
						var count = redditlist[s.reddit.username] || 0;
						c.reddit.point += count;
						c.reddit.history.push({date:Date.now(),upsCount:count});
					}
					
					//Twitch
					if(s.twitch.username){
						var count = twitchlist[s.twitch.username] || 0;
						c.twitch.point += count;
						c.twitch.history.push({date:Date.now(),viewCount:count});
					}
					
					
					//Twitter
					//if(s.twitter.username){	//cant cuz rest is in callback...
						exports.twitter.getFrom(user,function(count){
							c.twitter.count = count;
							c.twitter.point = count*1;	//1 pt per tweet, cap at 100 cuz count:100
							
							c.twitch.history.push({date:Date.now(),tweetCount:count});
							
							//Youtube
							exports.youtube.getSumViewFrom(user,function(count){
								c.youtube.count = count;
								c.youtube.point = count/50;
								c.youtube.history.push({date:Date.now(),viewCount:count});
							});
							
						
						})
					
					}
					
				
				
				
				}	
		}
	});
}
*/









