
//dependencies: Tk CST $ SERVER
;(function(){ //}
	var COLLISION_OVERWRITE = "COLLISION_OVERWRITE";
	var ABOVE_OVERWRITE = "ABOVE_OVERWRITE";
	var SPOT = 'SPOT';
	var NON_DRAWN = [SPOT,ABOVE_OVERWRITE,COLLISION_OVERWRITE];
	
	var ConvertChart = function(version){
		var TILE = CST.MAP_TILE;
		var cc = {
			nothingCode:+TILE.canWalkPre,
			bridgeCode:11,
			abCode:+TILE.cantWalkPre,
			aCode:+TILE.bulletOnly,
			fallCloseCode:+TILE.fallClose,
			fallCode:+TILE.fall,
			slowCode:+TILE.slow,
			
			tmxCodeToRCCode:{
				"20001":+TILE.cantWalkPre,
				"20051":+TILE.bulletOnly,
				"20061":+TILE.fall,
				"20011":+TILE.fallClose,
				"20017":+TILE.canWalkPre,
				"20067":+TILE.slow,			
			},
			spot:{},
			aboveListQuick:{},
			tileIdToCollisionCode:typeof Int8Array !== 'undefined' ? new Int8Array(30000) : [],	
			
			noAboveCode:20026,
			
			abList:[5006, 5007, 5008, 7501, 7503, 7504, 7506, 7508, 7509, 7510, 7511, 7512, 7513, 10013, 10014, 12501, 12502, 12503, 12504, 15006, 15007, 15008, 15009, 15010, 15013, 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508, 17511, 17512, 17518, 17519, 2553, 2554, 2555, 2561, 2562, 2563, 2574, 2578, 5051, 5052, 5053, 5054, 5055, 5056, 5057, 5058, 5060, 5061, 5062, 5063, 5064, 5065, 5066, 5067, 5068, 7551, 7553, 7554, 7556, 7557, 7558, 7560, 7561, 7563, 10063, 10064, 12551, 12552, 12553, 12554, 15051, 15052, 15053, 15054, 15055, 15056, 15057, 15058, 15059, 15060, 15061, 15062, 15063, 17551, 17552, 17553, 17554, 17555, 17556, 17557, 17558, 17561, 17562, 17565, 17566, 17567, 17568, 17569, 17570, 17571, 2602, 2603, 2604, 2605, 2606, 2610, 2614, 2624, 2628, 5101, 5102, 5104, 5105, 5106, 5107, 5108, 5109, 5110, 5111, 5112, 5113, 5114, 5115, 5116, 5117, 5118, 5119, 7601, 7603, 7604, 7606, 7607, 7608, 7610, 7611, 7613, 10105, 10106, 10107, 10108, 10109, 10110, 10111, 10112, 10113, 10114, 12601, 12602, 12603, 12604, 15101, 15102, 15103, 15104, 15105, 15106, 15107, 15108, 15110, 15111, 15112, 15113, 17601, 17602, 17603, 17604, 17605, 17606, 17607, 17608, 17609, 17610, 17611, 17612, 17615, 17616, 17617, 17618, 17619, 17620, 17621, 2652, 2656, 2659, 2665, 2674, 2675, 2676, 2677, 2678, 5151, 5152, 5154, 5155, 5156, 5159, 5160, 5161, 5162, 5163, 5164, 5165, 5166, 5167, 5168, 5169, 7654, 7656, 7658, 7660, 7661, 7663, 10155, 10156, 10157, 10158, 10159, 10160, 10161, 10162, 10163, 10164, 12651, 12652, 12653, 12654, 15154, 15155, 15156, 15157, 15160, 15161, 15162, 15163, 17651, 17652, 17653, 17654, 17655, 17656, 17657, 17658, 17659, 17660, 17661, 17662, 17665, 17666, 17667, 17668, 17669, 17670, 17671, 17672, 17673, 2702, 2706, 2709, 2710, 2714, 2715, 2724, 2725, 2726, 2727, 2728, 5201, 5202, 5203, 5204, 5205, 5209, 5210, 5211, 5212, 5213, 5214, 5215, 5216, 5217, 5218, 5219, 7701, 7702, 7703, 7704, 7706, 7708, 7710, 7711, 7713, 10205, 10206, 10207, 10208, 10209, 10210, 10211, 10212, 15201, 15202, 15203, 15204, 15205, 15206, 15210, 15211, 15212, 15213, 17701, 17702, 17703, 17704, 17705, 17706, 17707, 17722, 17723, 251, 2752, 2756, 2760, 2761, 2763, 2764, 2774, 2775, 2777, 2778, 5256, 5257, 5258, 7754, 7756, 7758, 7760, 7761, 7763, 10255, 10256, 10257, 10258, 10260, 10261, 15251, 15252, 15253, 15254, 15255, 15256, 15260, 15261, 15262, 15263, 17751, 17752, 17753, 17754, 17755, 17756, 17757, 17759, 17760, 17761, 17762, 17763, 17764, 17766, 17767, 17768, 17769, 17770, 17771, 17772, 17773, 2803, 2804, 2805, 2811, 2812, 2813, 5301, 5302, 5303, 5304, 5305, 5306, 5307, 5308, 5310, 5311, 5312, 5313, 5314, 5315, 5316, 5317, 5318, 7801, 7802, 7803, 7804, 7806, 7808, 7809, 7810, 7811, 7812, 7813, 10305, 10306, 10307, 10308, 10310, 10311, 15311, 15312, 17805, 17806, 17807, 17808, 17809, 17810, 17811, 17812, 17813, 17814, 17816, 17817, 17818, 17819, 17820, 17821, 17822, 17823, 2862, 5351, 5352, 5354, 5355, 5356, 5357, 5358, 5359, 5360, 5361, 5362, 5363, 5364, 5365, 5366, 5367, 5368, 5369, 7851, 7852, 7853, 7854, 7856, 10355, 10356, 10357, 10358, 10359, 10360, 17855, 17856, 17857, 17858, 17861, 17862, 17863, 17864, 17866, 17867, 17868, 17869, 17870, 17871, 5401, 5402, 5404, 5405, 5406, 5409, 5410, 5411, 5412, 5413, 5414, 5415, 5416, 5417, 5418, 5419, 7904, 7906, 10405, 10406, 10407, 10408, 10409, 10410, 17901, 17902, 17903, 17904, 17905, 17906, 17907, 17908, 17911, 17912, 17913, 17914, 17916, 17917, 17918, 17919, 17920, 17921, 5451, 5452, 5453, 5454, 5455, 5459, 5460, 5461, 5462, 5463, 5464, 5465, 5466, 5467, 5468, 5469, 7951, 7952, 7953, 7954, 7956, 10455, 10456, 10457, 10458, 17951, 17952, 17953, 17954, 17955, 17956, 17957, 17958, 17959, 17960, 3004, 3005, 3006, 3014, 3015, 3016, 5506, 5507, 5508, 10505, 10506, 10507, 10508, 15510, 15511, 15512, 15513, 18001, 18002, 18003, 18004, 18005, 18006, 18007, 18008, 18009, 18010, 18011, 18012, 18013, 18014, 18015, 18016, 18017, 18018, 18019, 18020, 18021, 3053, 3054, 3055, 3056, 3057, 3063, 3064, 3065, 3066, 3067, 5551, 5552, 5553, 5554, 5555, 5556, 5557, 5558, 5560, 5561, 5562, 5563, 5564, 5565, 5566, 5567, 5568, 10555, 10556, 10557, 10558, 15560, 15561, 15562, 15563, 18055, 18056, 18057, 18058, 18061, 18062, 18063, 18064, 18065, 18066, 18067, 18068, 18069, 18070, 18071, 3102, 3103, 3104, 3105, 3106, 3107, 3108, 3112, 3113, 3117, 3118, 5601, 5602, 5604, 5605, 5606, 5607, 5608, 5609, 5610, 5611, 5612, 5613, 5614, 5615, 5616, 5617, 5618, 5619, 10605, 10606, 10607, 10608, 15610, 15611, 15612, 15613, 18111, 18112, 18113, 18114, 18115, 18116, 18117, 18118, 18119, 18120, 18121, 3152, 3153, 3154, 3155, 3156, 3157, 3158, 3161, 3162, 3168, 3169, 5651, 5652, 5654, 5655, 5656, 5659, 5660, 5661, 5662, 5663, 5664, 5665, 5666, 5667, 5668, 5669, 15661, 15662, 18151, 18152, 18153, 18154, 18159, 18160, 18161, 18162, 18163, 18164, 18165, 18166, 18167, 18168, 18169, 18170, 18171, 3202, 3203, 3207, 3208, 3211, 3212, 3213, 3217, 3218, 3219, 5701, 5702, 5703, 5704, 5705, 5709, 5710, 5711, 5712, 5713, 5714, 5715, 5716, 5717, 5718, 5719, 18201, 18202, 18203, 18204, 18205, 18206, 18207, 18208, 18209, 18210, 18211, 18212, 18213, 18214, 18215, 3252, 3253, 3257, 3258, 3261, 3262, 3263, 3264, 3266, 3267, 3268, 3269, 5756, 5757, 5758, 10755, 10756, 10757, 10758, 18251, 18252, 18253, 18254, 18255, 18256, 18257, 18258, 18266, 18267, 18268, 18269, 3302, 3303, 3307, 3308, 3312, 3313, 3314, 3315, 3316, 3317, 3318, 5801, 5802, 5803, 5804, 5805, 5806, 5807, 5808, 10805, 10806, 10807, 10808, 18305, 18306, 18307, 18308, 18316, 18317, 18318, 18319, 3353, 3354, 3355, 3356, 3357, 3363, 3364, 3365, 3366, 3367, 5851, 5852, 5854, 5855, 5856, 5857, 5858, 10855, 10856, 10857, 10858, 18359, 18360, 18366, 18367, 18368, 18369, 3404, 3405, 3406, 3414, 3415, 3416, 5901, 5902, 5904, 5905, 10905, 10906, 10907, 10908, 18409, 18410, 18416, 18417, 18418, 18419, 3465, 5951, 5952, 5953, 5954, 5955, 10955, 10956, 10957, 10958, 18455, 18456, 18457, 18458, 18466, 18467, 18468, 18469, 11005, 11006, 11007, 11008, 18505, 18506, 18507, 18508, 11055, 11056, 11057, 11058, 18555, 18556, 18557, 18558, 11105, 11106, 11107, 11108, 11155, 11156, 11157, 11158, 11205, 11206, 11207, 11208, 11255, 11256, 11257, 11258],
			aList:[2568, 2569, 2570, 2575, 2576, 2577, 2617, 2618, 2620, 2621, 2625, 2626, 2627, 2667, 2671, 2717, 2718, 2720, 2721, 2768, 2769, 2770, 2776, 607, 612, 615, 616, 617, 656, 657, 658, 661, 662, 663, 665, 667, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 756, 757, 758, 761, 762, 763, 765, 766, 767, 807, 812, 815, 817, 865, 866, 867, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062, 1063, 1064, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114],
			aboveList:[5001, 5002, 5003, 5004, 5005, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016, 5017, 5018, 5019, 10005, 10006, 10007, 10008, 10009, 10010, 10011, 10012, 15001, 15002, 15003, 15004, 15005, 15010, 15011, 15012, 15013, 17509, 17510, 17522, 17523, 5059, 5060, 5061, 5062, 5063, 5064, 5065, 5066, 5067, 5068, 5069, 10055, 10056, 10057, 10058, 10059, 10060, 10061, 10062, 17559, 17560, 17572, 17573, 5109, 5110, 5111, 5112, 5113, 5114, 5115, 5116, 5117, 5118, 5119, 10105, 10106, 10107, 10108, 17622, 17623, 5153, 5159, 5160, 5161, 5162, 5163, 5164, 5165, 5166, 5167, 5168, 5169, 17672, 17673, 5209, 5210, 5211, 5212, 5213, 5214, 5215, 5216, 5217, 5218, 5219, 17710, 17711, 17712, 17713, 17714, 17721, 5251, 5252, 5253, 5254, 5255, 5259, 5260, 5261, 5262, 5263, 5264, 5265, 5266, 5267, 5268, 5269, 10255, 10256, 10257, 10258, 5309, 5310, 5311, 5312, 5313, 5314, 5315, 5316, 5317, 5318, 5319, 10305, 10306, 10307, 10308, 17801, 17802, 17803, 17804, 5359, 5360, 5361, 5362, 5363, 5364, 5365, 5366, 5367, 5368, 5369, 10355, 10356, 10357, 10358, 15360, 15361, 15362, 15363, 17851, 17852, 17853, 17854, 5403, 5409, 5410, 5411, 5412, 5413, 5414, 5415, 5416, 5417, 5418, 5419, 10405, 10406, 10407, 10408, 15410, 15411, 15412, 15413, 17909, 5459, 5460, 5461, 5462, 5463, 5464, 5465, 5466, 5467, 5468, 5469, 10455, 10456, 10457, 10458, 15460, 15461, 15462, 15463, 17961, 17962, 17963, 17964, 17965, 17966, 5501, 5502, 5503, 5504, 5505, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516, 5517, 5518, 5519, 10505, 10506, 10507, 10508, 5559, 5560, 5561, 5562, 5563, 5564, 5565, 5566, 5567, 5568, 5569, 10555, 10556, 10557, 10558, 18051, 18052, 18053, 18054, 5609, 5610, 5611, 5612, 5613, 5614, 5615, 5616, 5617, 5618, 5619, 10606, 10607, 18101, 18102, 18103, 18104, 18105, 18106, 18107, 18108, 18109, 18110, 18111, 18112, 18113, 18114, 18115, 5653, 5659, 5660, 5661, 5662, 5663, 5664, 5665, 5666, 5667, 5668, 5669, 10655, 10656, 10657, 10658, 18155, 18156, 18157, 18158, 5709, 5710, 5711, 5712, 5713, 5714, 5715, 5716, 5717, 5718, 5719, 10705, 10706, 10707, 10708, 18216, 18217, 18218, 18219, 5751, 5752, 5753, 5754, 5755, 10755, 10756, 10757, 10758, 18309, 18310, 18355, 18356, 18357, 18358, 5903, 10905, 10906, 10907, 10908, 18405, 18406, 18407, 18408, 10955, 10956, 10957, 10958, 11005, 11006, 11007, 11008, 11055, 11056, 11057, 11058, 11105, 11106, 11107, 11108, 11155, 11156, 11157, 11158, 11205, 11206, 11207, 11208, 11255, 11256, 11257, 11258],
			fallList:[1206],
			fallCloseList:[1155, 1156, 1157, 1158, 1159, 1205, 1207, 1208, 1209, 1255, 1256, 1257],
			bridgeList:[7705, 7751, 7752, 7753, 7755, 7805, 7855, 7901, 7902, 7903, 7905, 7955],
			slowList:[7509, 7512, 7552, 7555, 7559, 7562, 7605, 7609, 7612, 7651, 7652, 7653, 7659, 7662, 7759, 7762, 7809, 7812],
			


		};
		for(var i = 0 ; i < cc.aboveList.length; i++)
			cc.aboveListQuick[cc.aboveList[i]] = true;
		
		//init tileToColl
		for(var i = 0 ; i < cc.abList.length; i++)
			cc.tileIdToCollisionCode[cc.abList[i]] = cc.abCode;
		for(var i = 0 ; i < cc.aList.length; i++)
			cc.tileIdToCollisionCode[cc.aList[i]] = cc.aCode;
		for(var i = 0 ; i < cc.fallList.length; i++)
			cc.tileIdToCollisionCode[cc.fallList[i]] = cc.fallCode;
		for(var i = 0 ; i < cc.fallCloseList.length; i++)
			cc.tileIdToCollisionCode[cc.fallList[i]] = cc.fallCloseCode;
		for(var i = 0 ; i < cc.bridgeList.length; i++)
			cc.tileIdToCollisionCode[cc.bridgeList[i]] = cc.bridgeCode;
		for(var i = 0 ; i < cc.slowList.length; i++)	//after bridge cuz slow more important
			cc.tileIdToCollisionCode[cc.slowList[i]] = cc.slowCode;
		
		
		//init spot
		var TILE_PER_ROW = 50;	//id variation when changing row
		var PATH_LENGTH = 20;
		
		var addSpotSquare = function(start,what) {
			for(var i = 0; i < what.length; i++) {
				for(var j = 0; j < what[i].length; j++) {
					var num = start + TILE_PER_ROW * i + j;
					cc.spot[num] = what[i][j];
				}
			}
		}
		var addSpotSquareColor = function(start, colors, amount) {
			for(var y = 0; y < colors.length; y++) {
				for(var x = 0; x < amount; x++){
					var num = start + TILE_PER_ROW * y + x;
					cc.spot[num] = colors[y] + x;
				}
			}
		}
		
		addSpotSquare(20101,[
			["e1","e2","e3","e4","e5","e6","e7","e8"],
			["ea","eb","ec","ed","ee","ef","eg","eh"],
			["ei","ej","ek","el","em","en","eo","ep"],
			["n1","n2","n3","n4","n5","n6","n7","n8"],
			["na","nb","nc","nd","nn","nf","ng","nh"],
			["t1","t2","t3","t4","t5","t6","t7","t8"],
			["ta","tb","tc","td","tt","tf","tg","th"],
			["q1","q2","q3","q4","q5","q6","q7","q8"],
			["qa","qb","qc","qd","qe","qf","qg","qh"],
			["qi","qj","qk","ql","qm","qn","qo","qp"],
			["a","b","c","d","e","f","g","h"],
			["i","j","k","l","m","n","o","p"],
			["q","r","s","t","u","v","w","x"],
			["A","B","C","D","E","F","G","H"],
			["I","J","K","L","M","N","O","P"],
			["Q","R","S","T","U","V","W","X"],
		]);
		addSpotSquareColor(20111, ["blue", "red", "yellow", "green", "orange", "pink"], PATH_LENGTH);
		
		return cc;
	}
	var convertChart = ConvertChart();
	
	//#################
	var IMG_CACHE = {};
	
	var TmxParser = exports.TmxParser = function(extra){
		this.url = '';
		this.width = 0;
		this.height = 0;
		this.tileset = [];
		this.layer = [];
		this.tilewidth = 16;
		Tk.fillExtra(this,extra);
	}
	TmxParser.Tileset = function(extra){
		this.img = null;
		this.firstgid = 0;
		this.width = 0;
		this.height = 0;
		Tk.fillExtra(this,extra);		
	}
	TmxParser.Layer = function(extra){
		this.name = "";
		this.grid = [];
		Tk.fillExtra(this,extra);		
	}
		
	var getGridFromLayer = function(layer){
		var str = SERVER ? layer.data[0]._ : $(layer).find('data').text();
		
		str = str.replace(/\s/g, "");
		var array = str.split(',');
		Tk.stringToNumArray(array);
		return array;
	}

	TmxParser.load = function(url,pathHandler,cb,tracker,tryCount){
		pathHandler = pathHandler || TmxParser.PATH_HANDLER || function(src){ return src; };
		cb = cb || function(tmxParser){};
		
		$.ajax({
			url: url,
			dataType:"xml",
			error:function(e){
				ERROR.err(2,e,url);
				exports.Message.add(null,'Unable to access map data. Trying again.');
				tryCount = tryCount || 0;
				if(tryCount < 10)
					setTimeout(function(){
						TmxParser.load(url,pathHandler,cb,tracker,tryCount + 1);
					},1000);
				throw e;
			},
			success:function(doc){
				var d = $(doc);
				
				var layers = d.find('layer');
				var tileset = d.find('tileset');
				var width = +d.find('map').attr('width');
				var height = +d.find('map').attr('height');
				var tilewidth = +d.find('map').attr('tilewidth');
				if(tracker)
					tracker.value += 5;
				
				var onImgLoaded = function(err){
					if(tracker)
						tracker.value++;
					if(++loaded === max){
						if(tracker)
							tracker.value = 20;
						cb(new TmxParser({
							url:url,
							width:width,
							height:height,
							tileset:tilesetList,
							layer:layerList,
							tilewidth:tilewidth,							
						}));	
					}
				}
				
				//layers
				var layerList = [];
				for(var i = 0 ; i < layers.length; i++){
					var la = $(layers[i]);
					
					layerList.push(new TmxParser.Layer({
						name:la.attr('name'),
						grid:getGridFromLayer(la)
					}));
				}
				
				//tileset
				var max = tileset.length;
				var loaded = 0;
				var onerror = function(e){
					throw e;
				}
				
				var tilesetList = [];
				
				for(var i = 0 ; i < tileset.length; i++){
					var src = $(tileset[i]).find('image').attr('source');
					src = pathHandler(src);
					var myImg;
					if(IMG_CACHE[src]){
						myImg = IMG_CACHE[src];
						setTimeout(onImgLoaded,1);	//bad...
					} else {
						myImg = new Image();
						myImg.src = src;
						myImg.onload = onImgLoaded;
						myImg.onerror = onerror;
						IMG_CACHE[src] = myImg;
					}
					
					var firstgid = +$(tileset[i]).attr('firstgid');
					var w = (+$(tileset[i]).find('image').attr('width')) / tilewidth;
					var h = (+$(tileset[i]).find('image').attr('height')) / tilewidth;
					tilesetList.push(new TmxParser.Tileset({
						img:myImg,
						firstgid:firstgid,
						width:w,
						height:h,
					}));
				}
			}
		});
	}
	
	TmxParser.loadServer = function(url,cb,async){
		cb = cb || function(tmx){};//
		
		var fs = require('fs');
				
		//	CLEAN but async
		if(async){
			var xml2js = require('xml2js');
			var parser = new xml2js.Parser();
			fs.readFile(url,function(err,data){
				parser.parseString(data, function (err, res) {
					var layer = [];
					for(var i = 0 ; i < res.map.layer.length; i++){
						var la = res.map.layer[i];
						layer.push(new TmxParser.Layer({
							name:la.$.name,
							grid:getGridFromLayer(la)
						}));
					}
					cb(new TmxParser({
						url:url,
						width:res.map.$.width,
						height:res.map.$.height,
						tileset:[],
						layer:layer,
						tilewidth:res.map.$.tilewidth,	
					}));
				});
			});
			return;
		}
		
		//DIRTY
		var data = fs.readFileSync(url);
		data = data.toString();
		data = data.$replaceAll('\\r','').$replaceAll('\\n','');
		
		var wIndex = data.indexOf('width="');
		var ws = data.slice(wIndex + 'width="'.length);
		var width = +ws.slice(0,ws.indexOf('"'));
		
		
		var hIndex = data.indexOf('height="');
		var hs = data.slice(hIndex + 'height="'.length);
		var height = +hs.slice(0,hs.indexOf('"'));
		
		var layers = data.split('<layer name="');
		layers.shift();	//remove non layer data
		
		var layerList = [];
		for(var i = 0 ; i < layers.length; i++){
			var s = layers[i];
			var name = s.slice(0,s.indexOf('"'));
			
			var numStr = s.slice(s.indexOf('csv">') + 'csv">'.length);
			numStr = numStr.slice(0,numStr.indexOf('<'));
			
			var grid = numStr.split(',');
			for(var j = 0 ; j < grid.length; j++)
				grid[j] = +grid[j];
			
			layerList.push(new TmxParser.Layer({
				name:name,
				grid:grid
			}));
		}
		
		var tmx = new TmxParser({
			url:url,
			width:width,
			height:height,
			tileset:[],
			layer:layerList,
			tilewidth:16,	
		});
		return tmx;
	}
	
	//Draw
	var drawTile = function(tmx,ctx,tileId,posX,posY){
		if(tileId === 0)
			return;
		
		var x = posX * tmx.tilewidth;
		var y = posY * tmx.tilewidth;
		
		var tileset = getTilesetForTileId(tmx,tileId);
		
		var num = tileId - tileset.firstgid;
		var ox = (num % tileset.width) * tmx.tilewidth;
		var oy = (Math.floor(num / tileset.width)) * tmx.tilewidth;
		
		ctx.drawImage(tileset.img,ox,oy,tmx.tilewidth,tmx.tilewidth,x,y,tmx.tilewidth,tmx.tilewidth);
	}
	
	var getTilesetForTileId = function(tmx,tileId){
		for(var i = tmx.tileset.length - 1; i >= 0; i--){
			if(tileId >= tmx.tileset[i].firstgid)
				return tmx.tileset[i];
		}
		return null;
	}
	
	TmxParser.getImgCanvas = function(tmx,layerToDraw){
		layerToDraw = layerToDraw || function(layerName){ return true;};
		
		var canvas = $('<canvas>').css({border:'2px solid black'});
		canvas.attr({width:tmx.width*tmx.tilewidth,height:tmx.height*tmx.tilewidth});
		//$('body').append(canvas);
		var ctx = canvas[0].getContext('2d');
		Tk.sharpenCanvas(canvas);
				
		for(var i = 0 ; i < tmx.layer.length; i++){
			if(!layerToDraw(tmx.layer[i].name))
				continue;
			
			for(var j = 0; j < tmx.layer[i].grid.length; j++){
				var x = j % tmx.width;
				var y = Math.floor(j / tmx.width);
				drawTile(tmx,ctx,tmx.layer[i].grid[j],x,y);							
			}
		}
		return canvas;
	}
	
	TmxParser.BELOW_LAYER = function(layerName){
		return NON_DRAWN.indexOf(layerName) === -1;
	};
	TmxParser.ABOVE_LAYER = function(layerName){
		return layerName === ABOVE_OVERWRITE;
	};
	TmxParser.PATH_HANDLER = function(src){
		var ex = 'vX.X/1.png';
		return '/quest/tileset/' + src.slice(-ex.length);
	};
	
	TmxParser.fillMapModelImg = function(tmx,res,tracker){	//important
		var canvasB = TmxParser.getImgCanvas(tmx,TmxParser.BELOW_LAYER);
		if(tracker)
			tracker.value += 11;	//should be 10 but with 11 im sure float wont fuck
		crop(canvasB,res.b,tracker);	//must be +30 tracker
		res.m = TmxParser.generateMinimap(canvasB);
		
		setTimeout(function(){	
			TmxParser.updateAboveLayer(tmx); 
			var canvasA = TmxParser.getImgCanvas(tmx,TmxParser.ABOVE_LAYER);
			if(tracker)
				tracker.value += 10;
			crop(canvasA,res.a,tracker); 	//must be +30 tracker
		},10);
	}
	
	var crop = function(canvas,array,tracker){	//async
		var imgWidth = canvas[0].width;
		var imgHeight = canvas[0].height;
		
		
		var canvasPerRow = Math.ceil(imgWidth / 640);
		var canvasPerCol = Math.ceil(imgHeight / 360);
		var doneCount = 0;
		var todo = canvasPerRow * canvasPerCol;
		
		var doNext = function(){
			var c = $('<canvas>').attr({width:640,height:360});
		
			var ctx = c[0].getContext('2d');
			Tk.sharpenCanvas(c);
			
			var y = Math.floor(doneCount / canvasPerRow);
			var x = doneCount % canvasPerRow;
			
			ctx.clearRect(0,0,640,360);
			
			var sX = 640 * x;
			var sY = 360 * y;
			
			var w =  Math.min(640, imgWidth - sX);
			var h = Math.min(360, imgHeight - sY);
			
			if(h <= 0)	//aka done
				return;
				
			ctx.drawImage(canvas[0],sX, sY, w, h,0,0,w, h);
						
			array[x] = array[x] || [];
			array[x].push(c[0]);
				
			doneCount++;
			setTimeout(doNext,5);
			if(tracker)
				tracker.value += 30/todo;
		}
		doNext();		
	}		
		
	var MINIMAP_RATIO = 8;
	TmxParser.generateMinimap = function(canvas){
		var width = canvas[0].width / MINIMAP_RATIO;
		var height = canvas[0].height / MINIMAP_RATIO;
		
		var c = $('<canvas>').attr({width:width,height:height});
		var cctx = c[0].getContext('2d');
		Tk.sharpenCanvas(c);
		
		cctx.drawImage(canvas[0],0,0,canvas[0].width,canvas[0].height,0,0,width,height);
		
		var img = new Image();
		img.src = c[0].toDataURL();
		return img;
	}
	
	TmxParser.updateAboveLayer = function(tmx){
		var aboveOverwrite = TmxParser.getLayerByName(tmx,ABOVE_OVERWRITE);
		
		var listLayer = [];
		for(var j = 0; j < tmx.layer.length; j++)
			if(!NON_DRAWN.$contains(tmx.layer[j].name))
				listLayer.push(tmx.layer[j]);
	
		for(var i = 0 ; i < aboveOverwrite.grid.length; i++){
			if(aboveOverwrite.grid[i] === convertChart.noAboveCode){
				aboveOverwrite.grid[i] = 0;
				continue;
			}
			if(aboveOverwrite.grid[i] !== 0)
				continue;
			for(var j = 0; j < listLayer.length; j++){
				var tile = listLayer[j].grid[i];
				if(convertChart.aboveListQuick[tile])
					aboveOverwrite.grid[i] = tile;
			}
		}
	}
			
	TmxParser.getLayerByName = function(tmx,name){
		for(var i = 0 ; i < tmx.layer.length; i++)
			if(tmx.layer[i].name === name)
				return tmx.layer[i];
		return null;
	}
	
	var newLayer = function(tmx){
		var a = [];
		for(var i = 0 ; i < tmx.width * tmx.height; i++)
			a.push(0);
		return a;
	}
	
	TmxParser.generateCollisionGrid = function(tmx){
		var WIDTH = tmx.width;
				
		var collisionLayer = newLayer(tmx);
		
		var collisionOverwrite = TmxParser.getLayerByName(tmx,COLLISION_OVERWRITE);
		
		for(var i = 0; i < tmx.layer.length; i++) {
			if(NON_DRAWN.$contains(tmx.layer[i].name))
				continue;
			
			for(var j = 0; j < tmx.layer[i].grid.length; j++) {
				var spot = tmx.layer[i].grid[j];
				
				var val = convertChart.tileIdToCollisionCode[spot];
				if(val)
					if(val === convertChart.bridgeCode)
						collisionLayer[j] = convertChart.nothingCode;
					else
						collisionLayer[j] = val;
			}
		}
		var grid2D = fixOneSizePath(tmx,collisionLayer);
		
		for(var i = 0 ; i < collisionOverwrite.grid.length; i++){
			if(collisionOverwrite.grid[i] !== 0)
				grid2D[Math.floor(i / WIDTH)][i % WIDTH] = convertChart.tmxCodeToRCCode[collisionOverwrite.grid[i]];
		}
		
		for(var i = 0 ; i < grid2D.length; i++){
			grid2D[i] = grid2D[i].join('');
		}
		return grid2D;
		
	}
	
	var isCollision = function(spot) {
		return spot === convertChart.abCode || spot === convertChart.aCode;
	}
	
	var fixOneSizePath = function(tmx,grid1d) {	//return 2d grid
		var WIDTH = tmx.width;
		var HEIGHT = tmx.height;
		
		//convert to 2d array
		var grid = Tk.toArray2D(grid1d,WIDTH);
				
		//find 1-size spots and remove them
		var hasChanged = false;
		do {
			hasChanged = false;
			for(var i = 0; i < HEIGHT; i++) {
				for(var j = 0; j < WIDTH; j++) {
					if(grid[i][j] === convertChart.abCode) 
						continue;
					if(grid[i][j] === convertChart.aCode) 
						continue;

					//left, right
					if(j !== 0 && j !== WIDTH - 1) {
						if(isCollision(grid[i][j + 1]) && isCollision(grid[i][j - 1])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}
					if(j === 0) {
						if(isCollision(grid[i][j + 1])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}
					if(j === WIDTH - 1) {
						if(isCollision(grid[i][j - 1])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}

					/*
					if(i !== 0 && i !== HEIGHT - 1 && j !== 0 && j !== WIDTH - 1) {	//aka nor border
						//upleft - downright
						if(isCollision(grid[i - 1][j - 1]) && isCollision(grid[i + 1][j + 1])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}

						//upright - downleft
						if(isCollision(grid[i + 1][j - 1]) && isCollision(grid[i - 1][j + 1])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}
					*/
					
					//up down
					if(i !== 0 && i !== HEIGHT - 1) {
						if(isCollision(grid[i + 1][j]) && isCollision(grid[i - 1][j])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}
					if(i === 0) {
						if(isCollision(grid[i + 1][j])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}
					if(i === HEIGHT - 1) {
						if(isCollision(grid[i - 1][j])) {
							hasChanged = true;
							grid[i][j] = convertChart.abCode;
						}
					}
				}
			}
		} while(hasChanged);
		
		return grid;
		/*
		//convert back to 1d array
		for(var i = 0; i < grid1d.length; i++) {
			grid1d[i] = grid[Math.floor(i / WIDTH)][i % WIDTH];
		}
		*/
	}
	
	TmxParser.generateSpot = function(tmx){
		var width = tmx.width;
		var height = tmx.height;
				
		var spotLayer = TmxParser.getLayerByName(tmx,SPOT);
		
		var array = Tk.toArray2D(spotLayer.grid, width);
		var zonePre = {};

		//Set start and end for every letter
		for(var y = 0; y < height; y++) {
			for(var x = 0; x < width; x++) {
				if(array[y][x] === 0) 
					continue;
				if(!convertChart.spot[array[y][x]]){ 
					ERROR(2,"(" + x + "," + y + ") on the spot layer is not valid.",tmx.url); 
					continue; 
				}

				var letter = convertChart.spot[array[y][x]];
				if(!zonePre[letter])
					zonePre[letter] = {startX:x,startY:y,endX:x,endY:y,count:0};
				zonePre[letter].endX = x;
				zonePre[letter].endY = y;
				zonePre[letter].count++;
			}
		}

		//convert zone into format usable by engine
		var zoneList = {};
		for(var i in zonePre) {
			//point
			if(zonePre[i].count === 1) {
				zoneList[i] = {
					x:zonePre[i].startX * 32 + 16,
					y:zonePre[i].startY * 32 + 16,
					width:0,
					height:0,
				}
				continue;
			}
			
			if(zonePre[i].count === 2) {
				if(Math.abs(zonePre[i].startX - zonePre[i].endX) > 320 || Math.abs(zonePre[i].startY - zonePre[i].endY) > 320) {
					ERROR(3,"Warning. Big space gap with spot (" + zonePre[i].startX + "," + zonePre[i].startY + ") and (" + zonePre[i].endX + "," + zonePre[i].endY + ")",tmx.url);
				}
				var x = (zonePre[i].startX + zonePre[i].endX) * 32 / 2 + 16;
				var y = (zonePre[i].startY + zonePre[i].endY) * 32 / 2 + 16;
				zoneList[i] = {
					x:x,
					y:y,
					width:0,
					height:0,
				}
				continue;
			}

			//Zone
			zoneList[i] = {
				x:zonePre[i].startX * 32,
				y:zonePre[i].startY * 32,
				width:(zonePre[i].endX - zonePre[i].startX) * 32 + 32,
				height:(zonePre[i].endY - zonePre[i].startY) * 32 + 32,
			}
		}
		return zoneList;
	}
	
	
})(); //{








