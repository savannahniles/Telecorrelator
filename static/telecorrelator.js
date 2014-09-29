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
			"startTime": startTime,  
			"endTime": endTime, 
			"title": title,
			"transcript": transcript,
			"url": url   //for now
			// "url": "http://um-static.media.mit.edu/EP018549150103_2014-08-28T04:30Z/EP018549150103_2014-08-28T04:30Z_high.mp4"
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
	var tempHtml = "<div class='timeline-wrapper' style='width:{width}px; height:{height}px;'><div class='news-source-logo' value='{source}' onclick=switchSource(event)><img src='{sourceImage}' value='{source}'></div><div class='timeline' id='{sourceName}' style='height:{height}px;'><div id='{loadingId}' class='contentLoading'>Content Loading...</div></div></div>",
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
          .replace("{source}", sourceName)
          .replace("{source}", sourceName)
          .replace("{sourceName}", sourceName)
          .replace("{loadingId}", loadingId);
	}
	var slider = "<div id='slider'></div>",
		umVideoDiv = "<div id='um-video-plus-info-wrapper' style='height:" + videoHeight + "px'><div id='um-video-wrapper' style='height:" + videoHeight + "px;' onclick=videoClicked() onmousemove=mouseMove()></div>",
		videoInfo = "<div id='video-info' style='height:" + videoHeight + "px;'><h1 id='trend-info'></h1><h2 id='title-info'></h2><h3 id='cc-info'></h3></div></div>";
	
	telecorrelator.innerHTML = slider + umVideoDiv + videoInfo + html;

	//fill each timeline with ~ * ~ * C O N T E N T * ~ * ~
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i]["sourceName"],
		    timeline = document.getElementById(sourceName),
			contentHtml = "",
			content = newsSources[i]["content"],
			contentPadding = 7,
			totalContentObjects = content.length,
			tempContentHtml = "<div onclick=contentClicked() class='content {trend} {timePeriod}' id='{id}' title={title} url={url} timestamp={timestamp} style='{backgroundImage}; height:{height}px; margin-left:{margin}px'></div>"
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
				.replace("{id}", content[j]["trend"] + "-" + j)
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


	//loading screen--reveal
	document.getElementById('loading').innerHTML = "";
	document.getElementById('loading').style.opacity = 0;
	setTimeout( function() {
		document.getElementById('loading').style.height = '0px';
	}, 1000);

}

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
        // start the video paused
		player.pause();
    }

    function playHandler() {
    	console.log("play");
    	document.getElementById("um-video-wrapper").style.width = document.getElementById("um-video-wrapper").firstChild.offsetWidth + "px";

    }

    function pauseHandler() {
    	console.log("paused");
    }

    function clipStartHandler() {
    	clipIndex = player.returnClipIndex();
    	trend = renderObject["EDL"][clipIndex]["trend"];
    	console.log('clip:' + clipIndex);
    	console.log(trend);

    	var trendInfo = document.getElementById('trend-info'),
    		titleInfo = document.getElementById('title-info'),
    		ccInfo = document.getElementById('cc-info');

    	console.log(trendInfo);

    	trendInfo.innerHTML = trend + " ";
    	titleInfo.innerHTML = renderObject["EDL"][clipIndex]["title"];
    	ccInfo.innerHTML = /*"Transcript: " + renderObject["EDL"][clipIndex]["transcript"] + "</br>" + */"Playing next: <span class='blue' onclick=goToNextVideo()>" + renderObject["EDL"][clipIndex + 1]["trend"] + " <i class='fa fa-long-arrow-right'></i></span>";

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
	// mouseMove();
}

function goToNextVideo() {
	clipIndex = player.returnClipIndex();
	player.seekToClipIndex(clipIndex + 1);
}

function mouseMove()
{
	//hide controls container
}

function telecorrelate(trendName, url) {

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
			if ((newsSources[i].sourceName == selectedSource) & (matchingVideos.length > 1)) { //for telecorrelating among multiple videos in selected source
				clipIndex = player.returnClipIndex();

				console.log(trendName + "-" + clipIndex);
				match = $("#" + trendName + "-" + clipIndex);
				var blockPosition = $(match).position().left;
				var margin = 0;
				if ($(match).css("margin-left") == "30px") {
					margin = 30;
				}

				var d = x - blockPosition - 20 - margin; //margin of telecorrelator
				timeline.style.opacity = 1;
				timeline.style.left = d + "px";
			}

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

function switchSource(event) {
	//remove selected class from selected source
	selectedSourceTimeline = document.getElementById(selectedSource);
	selectedSourceTimeline.parentNode.className = 'timeline-wrapper';
	// selectedSourceTimeline = document.getElementById("selectedSource");
	// selectedSourceTimeline.className = 'timeline-wrapper';

	source = event.target.attributes.value.value;
	var timelines = document.getElementsByClassName("timeline");
	// console.log (timelines);
	for (var i = 0; i < timelines.length; i++) {
		timelines[i].style.left = "0px";
	};
	document.getElementById("slider").style.left = "-300px";

	selectedSource = source; //switch source

	//add selected source class name
	selectedSourceTimeline = document.getElementById(selectedSource);
	selectedSourceTimeline.parentNode.className += ' selectedSource'

	fillVideo(renderObject); //?
}
