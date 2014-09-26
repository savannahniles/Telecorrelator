var telecorrelator; //= document.getElementById('telecorrelator');
var newsSources;
// var newsSources = ["CNN", "MSNBC", "Fox", "The Daily Show", "BBC", "ESPN"]
var player;
var selectedSource = "BBC";
var renderObject;

function getContent() {
	var request = new XMLHttpRequest();
	request.onload = init;

	request.open('GET', '/getContent', true); // request a renderObject from the server
	request.send();
}

// function fillTimelineTicker() {
// 	var timeline = document.getElementById('timeline-ticker'),
// 		times = ["Last Hour", "Today", "Yesterday", "This Week", "All"],
// 		list = "";
// 	for (var i = 0; i < times.length; i++) {
// 		list += "<li class='timeButton'>" + times[i] + "</li>";
// 	};
// 	timeline.innerHTML = "<ul class='horizontalList'>" + list + "</ul>";
// }

// function fillTrendTicker(trends) {
// 	var trendTicker = document.getElementById('trend-ticker'),
// 		list = "";
// 	for (var i = 0; i < trends.length; i++) {
// 		var trendClassName = trends[i].replace( /\W/g , '');
// 		list += "<li onClick=telecorrelate('" + trendClassName + "') class='trendButton' id='" + trendClassName + "'>" + trends[i] + "</li>";
// 	};
// 	trendTicker.innerHTML = "<ul class='horizontalList'>" + list + "</ul>";
// }

function createRenderObject(content) {
	var totalContentObjects = content.length;
	var EDL = [];
	for (var i = 0; i < totalContentObjects; i++) {
		var trend = content[i]["trend"],
			startTime = content[i]["startTime"],
			endTime = content[i]["endTime"],
			title = content[i]["title"],
			transcript = content[i]["transcript"],
			url = content[i]["videoHigh"];

		var contentObject = {
			"trend": trend,
			"startTime": 1.0,  //fornow
			"endTime": 3.0, //fornow
			"title": title,
			"transcript": transcript,
			// "url": url   //for now
			"url": "http://um-static.media.mit.edu/EP018549150103_2014-08-28T04:30Z/EP018549150103_2014-08-28T04:30Z_high.mp4"
		};

		EDL.push(contentObject);
	};
	var renderObject = {
		"EDL": EDL
	};
	return renderObject;
}

function init()
{
	//connect to UM events
	// UMevents.clientname("um-telecorrelator");

	//get window height/width
	var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0],
	    headerHeight = 45,
	    margin = 10,
	    padding = 10,
	    heightFromTop = headerHeight + margin + padding + 5,
	    x = w.innerWidth || e.clientWidth || g.clientWidth,
	    y = w.innerHeight|| e.clientHeight|| g.clientHeight,
	    x = x - margin*2 - padding*2,
	    y = y - headerHeight - margin*2 - padding*2;

	var response = JSON.parse(this.responseText);
	if (response.errorCode != 0)
	{
		// there was an error
		console.log ("whoops error");
		return;
	}
	
	newsSources = response.newsSources;

	//set up telecorrelator
	telecorrelator = document.getElementById('telecorrelator');
	telecorrelator.style.width = x + "px";
	telecorrelator.style.height = y + "px";

	// create a timeline for each news source
	var tempHtml = "<div class='timeline-wrapper' style='width:{width}px; height:{height}px;'><div class='news-source-logo'><img src='{sourceImage}'></div><div class='timeline' id='{sourceName}' style='height:{height}px;'><div id='{loadingId}' class='contentLoading'>Content Loading...</div></div></div>",
		html = '',
		totalSources = newsSources.length,
		tickerHeight = 0,
		videoHeight = (y - tickerHeight ) / 2
		h = videoHeight / totalSources - 3; //hack to account for border
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i]["sourceName"],
			sourceImage = newsSources[i]["thumbnail"],
			loadingId = sourceName + "_loading";

			if (sourceName == selectedSource) {
				renderObject = createRenderObject(newsSources[i]["content"]);
			}

		html += tempHtml.replace(/\{height\}/g, h)
          .replace(/\{width\}/g, newsSources[i]["content"].length*230+120)
          .replace(/\{timelineTickerHeight\}/g, tickerHeight)
          .replace("{sourceImage}", sourceImage)
          .replace("{sourceName}", sourceName)
          .replace("{loadingId}", loadingId);
	}
	var slider = "<div id='slider'></div>",
		ticker = "<section id='tickerContainer' style='height:" + tickerHeight + "px;'><div id='tickerCard'><div id='tickerFlipButton'><i class='fa fa-refresh fa-lg'></i></div><figure class='back' id='timeline-ticker'></figure><figure class='front' id='trend-ticker'>trend ticker here</figure></div></section>",
		umVideoDiv = "<div id='um-video-plus-info-wrapper'><div id='um-video-wrapper' style='height:" + videoHeight + "px;' onclick=videoClicked() onmousemove=mouseMove()></div>",
		videoInfo = "<div id='video-info' style='height:" + videoHeight + "px;'><h1 id='trend-info'></h1><h2 id='title-info'></h2><h3 id='cc-info'></h3></div></div>";
	
	telecorrelator.innerHTML = slider + /*ticker +*/ umVideoDiv + videoInfo + html;

	// //fill the timeline ticker with ~ * ~ * T I M E * ~ * ~
	// fillTimelineTicker();

	// //fill the trend ticker with ~ * ~ * T R E N D S * ~ * ~
	// trendsList = response.trends;
	// fillTrendTicker(trendsList);

	//fill each timeline with ~ * ~ * C O N T E N T * ~ * ~
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i]["sourceName"],
		    timeline = document.getElementById(sourceName),
			contentHtml = "",
			content = newsSources[i]["content"],
			contentPadding = 7,
			totalContentObjects = content.length,
			tempContentHtml = "<div onclick=contentClicked() class='content {trend} {timePeriod}' title={title} url={url} timestamp={timestamp} style='{backgroundImage}; height:{height}px; margin-left:{margin}px'></div>"
			lastTrend = "";

		//here, go through the source's videos and plop them on the timeline
		for (var j = 0; j < totalContentObjects; j++) {
			margin = 30;
			if (lastTrend === content[j]["trend"]) {
				margin = 0;
			}
			lastTrend = content[j]["trend"];
			contentHtml += tempContentHtml.replace(/\{height\}/g, h-2*contentPadding)
				.replace(/\{margin\}/g, margin)
				.replace(/\{backgroundImage\}/g, 'background-image:url("' + content[j]["thumbnail"] + '")')
				.replace("{trend}", content[j]["trend"])
				.replace("{timePeriod}", content[j]["timePeriod"])
				.replace("{title}", "'" + content[j]["title"] + "'")
				.replace("{url}", content[j]["videoHigh"])
				.replace("{timestamp}", content[j]["timestamp"]);
		};
		timeline.innerHTML = contentHtml;
	};

	//set the selected source green and get its videos into a render object
	selectedSourceTimeline = document.getElementById(selectedSource);
	selectedSourceTimeline.parentNode.className += ' selectedSource'

	//fill the video player with selected source content 
	fillVideo(renderObject);

	//event listeners
	// document.getElementById('tickerFlipButton').addEventListener( 'click', function(){
	// 	tickerCard = document.getElementById('tickerCard');//.toggleClassName('flipped');
	// 	var className = ' ' + tickerCard.className + ' ';
	//     if ( ~className.indexOf(' flipped ') ) {
	//         tickerCard.className = className.replace(' flipped ', ' ');
	//     } else {
	//         tickerCard.className += ' flipped';
	//     }
	//     resetTelecorrelator();
	// }, false);

	//loading screen--reveal
	document.getElementById('loading').style.opacity = 0;
	setTimeout( function() {
		document.getElementById('loading').style.height = '0px';
	}, 1000);

}

// function centerVideo() {
// 	document.getElementById("um-video-wrapper").style.left = window.innerWidth / 2 - document.getElementById("um-video-wrapper").firstChild.offsetWidth * .5 + "px";
// }

function fillVideo(renderObject)
{
	if (player)
	{
		// if a video is already playing we should pause it while we prepare and load the next videos
		delete player;
		player = undefined;

		// remove any currently existing video elements
		videoContainer = document.getElementById('um-video-wrapper');
		while (videoContainer.hasChildNodes()) {
			videoContainer.removeChild(videoContainer.lastChild);
		}

	}

	//fill the video with the umplayer
	var videoWrapper = document.getElementById('um-video-wrapper');

	//callbacks for player
	function videoReadyHandler() {        
		// console.log("video ready");
        // start the video paused
		player.pause();
		document.getElementById("um-video-wrapper").style.width = document.getElementById("um-video-wrapper").firstChild.offsetWidth + "px";
    }

    function playHandler() {
    	console.log("play");
    }

    function pauseHandler() {
    	console.log("paused");
    }

    function clipStartHandler() {
    	// console.log('clip started');
    	clipIndex = player.returnClipIndex();
    	trend = renderObject["EDL"][clipIndex]["trend"];
    	console.log('clip:' + clipIndex);
    	console.log(trend);

    	var trendInfo = document.getElementById('trend-info'),
    		titleInfo = document.getElementById('title-info'),
    		ccInfo = document.getElementById('cc-info');

    	// trendInfo.innerHtml = trend;
    	// titleInfo.innerHtml = renderObject["EDL"][clipIndex]["title"];
    	// ccInfo.innerHtml = renderObject["EDL"][clipIndex]["transcript"];

    	console.log(trendInfo);

    	trendInfo.innerHTML = trend + " ";
    	titleInfo.innerHTML = renderObject["EDL"][clipIndex]["title"];
    	ccInfo.innerHTML = "Transcript: " + renderObject["EDL"][clipIndex]["transcript"] + "</br>" + "<span class='blue'>Up next: " + renderObject["EDL"][clipIndex + 1]["trend"] + "</span>";

    	telecorrelate(trend, renderObject["EDL"][clipIndex]["url"]);
    }

	player = new UMVideoPlayer('um-video-wrapper', renderObject, {
        "transitionTime" : .3,
        "classString" : "um-videoPlayer",
        // "finishedHandler" : finishedHandler,
        // "loadingStartedHandler" : loadingStartedHandler,
        // "loadingStoppedHandler" : loadingStoppedHandler,
        "playHandler" : playHandler,
        "pauseHandler" : pauseHandler,
        // "timeUpdateHandler" : timeUpdateHandler,
        "videoReadyHandler" : videoReadyHandler,
        "clipStartHandler": clipStartHandler,
    });
}

function videoClicked()
{
	player.togglePlayPause();
	// console.log("toggling");
	// mouseMove();
}

function mouseMove()
{
	//hide controls container
}

function telecorrelate(trendName, url) {
	//highlight selected trend name
	// var selects = document.getElementsByClassName("trendButton");
	// for(var i =0, il = selects.length;i<il;i++){
	//      selects[i].style.color = '#ffffff';
	//   }
	// event.target.style.color = "#2c3e50"; //'#FCFF32';

	var x = window.innerWidth / 2 - 100; //middle of window minus 100 to account for slider width
	var slider = document.getElementById("slider");

	//move slider to the position
	slider.style.left = x - 10 + "px";

	//get the videos with the trends
	//go through each source, get children videos with the trend class, take the first
	for (var i = 0; i < newsSources.length; i++) {
		
		var timeline = document.getElementById(newsSources[i].sourceName);
		var matchingVideos = $(timeline).children("." + trendName);
		var matchingVideo = $(timeline).children("." + trendName)[0];

		if (matchingVideo) { //if there's a matching video for any source
			//move timeline to position
			var blockPosition = $(matchingVideo).position().left;
			var d = x - blockPosition - 50; //margin of telecorrelator and margin of block
			timeline.style.opacity = 1;
			timeline.style.left = d + "px";

			// var gestureData = {
			// 	"source": newsSources[i].sourceName,
			// 	"video": matchingVideo.attributes.url.nodeValue
			// };
			// console.log(gestureData);
			// console.log('emitting event...');
    		// UMevents.emit('telecorrelate', gestureData);

		}
		else { //no matching video-- move the whole shit out of the way.
			// console.log("Nothing for: " + newsSources[i].sourceName);
			if ( x <= document.getElementById("telecorrelator").clientWidth / 2) { 
				timeline.style.left = x +100 + "px";
			}
			else {
				timeline.style.left = x - 270 + slider.clientWidth - timeline.clientWidth + "px";
			}
		}

	};
}

function resetTelecorrelator() {
	// fillVideo(renderObject); //?
	var timelines = document.getElementsByClassName("timeline");
	// console.log (timelines);
	for (var i = 0; i < timelines.length; i++) {
		timelines[i].style.left = "0px";
	};
	document.getElementById("slider").style.left = "-300px";
	// var selects = document.getElementsByClassName("trendButton");
	// for(var i =0, il = selects.length;i<il;i++){
	//      selects[i].style.color = '#ffffff';
	//   }

}
