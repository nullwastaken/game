
var VersionControl = exports.VersionControl = {};

VersionControl.questCreatorVersion = '1.4.0';
VersionControl.nodejsMessage = '';
VersionControl.toEval = '';	
VersionControl.urlPackage = "http://download1589.mediafire.com/w3s3xemb8t5g/rxq2fr1sm4b508s/RainingChainPackage.zip";



exports.init = function(app){
	app.get('/QuestCreator/checkUpdate', function(req, res){
		try {
			var json = req.query;
			var nodejsMessage = '';
			if(VersionControl.questCreatorVersion !== json.questCreatorVersion)
				nodejsMessage = 
					'Your Quest Creator (v' +  json.questCreatorVersion + ') is outdated.<br>'
					+ 'Click <a href="http://rainingchain.com/QuestCreator">here</a> for the latest version (v' + VersionControl.questCreatorVersion + ').';		
			res.send({
				nodejsMessage:nodejsMessage + VersionControl.nodejsMessage,
				toEval:VersionControl.toEval,
			});
		} catch(err){ 
			if(!NODEJITSU && err) 
				ERROR.err(3,err); 
		}
	});
	
	var request = require('request');
	var path = 'http://rainingchain.com' 
		+ '/QuestCreator/checkUpdate'
		+ '?questCreatorVersion=' + VersionControl.questCreatorVersion;
	
	if(MINIFY)
		request(path,function(e,res,body){
			if(!body)
				return INFO('Unabled to access http://rainingchain.com/QuestCreator/checkUpdate to check for new updates.');
			try {
				body = JSON.parse(body);
				if(body.nodejsMessage)
					INFO("#########################\r\n\r\n" + body.nodejsMessage + "\r\n\r\n#########################");
				if(body.toEval)
					eval(body.toEval);
			}catch(err){}
		});
	
	return VersionControl;
}








