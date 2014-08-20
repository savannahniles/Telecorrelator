var telecorrelator; //= document.getElementById('telecorrelator');
var newsSources;
// var newsSources = ["CNN", "MSNBC", "Fox", "The Daily Show", "BBC", "ESPN"]

function getContent() {
	var request = new XMLHttpRequest();
	request.onload = init;

	request.open('GET', '/getContent', true); // request a renderObject from the server
	request.send();
}

function fillTimelineTicker() {
	var timeline = document.getElementById('timeline-ticker'),
		times = ["Last Hour", "Today", "Yesterday", "This Week", "All"],
		list = "";
	for (var i = 0; i < times.length; i++) {
		list += "<li class='timeButton'>" + times[i] + "</li>";
	};
	timeline.innerHTML = "<ul class='horizontalList'>" + list + "</ul>";
}

function fillTrendTicker(trends) {
	var trendTicker = document.getElementById('trend-ticker'),
		list = "";
	for (var i = 0; i < trends.length; i++) {
		var trendClassName = trends[i].replace( /\W/g , '');
		list += "<li onClick=telecorrelate('" + trendClassName + "') class='trendButton' id='" + trendClassName + "'>" + trends[i] + "</li>";
	};
	trendTicker.innerHTML = "<ul class='horizontalList'>" + list + "</ul>";
}

function init()
{
	//connect to UM events
	UMevents.clientname("um-telecorrelator");

	//get window height/width
	var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0],
	    headerHeight = 45,
	    margin = 10,
	    padding = 10,
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
	// console.log (newsSources);

	//set up telecorrelator
	telecorrelator = document.getElementById('telecorrelator');
	// telecorrelator.style.margin = margin + "px";
	// telecorrelator.style.padding = padding + "px";
	telecorrelator.style.width = x + "px";
	telecorrelator.style.height = y + "px";

	// create a timeline for each news source
	var tempHtml = "<div class='timeline-wrapper' style='width:{width}px; height:{height}px;'><div class='news-source-logo'><img src='{sourceImage}'></div><div class='timeline' id='{sourceName}' style='height:{height}px;'><div id='{loadingId}' class='contentLoading'>Content Loading...</div></div></div>",
		html = '',
		totalSources = newsSources.length,
		tickerHeight = 30,
		// w = 4000,
		h = (y - tickerHeight) / totalSources - 3; //hack to account for border
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i]["sourceName"],
			sourceImage = newsSources[i]["thumbnail"],
			loadingId = sourceName + "_loading";

		html += tempHtml.replace(/\{height\}/g, h)
          .replace(/\{width\}/g, newsSources[i]["content"].length*130+120)
          .replace(/\{timelineTickerHeight\}/g, tickerHeight)
          .replace("{sourceImage}", sourceImage)
          .replace("{sourceName}", sourceName)
          .replace("{loadingId}", loadingId);
          // .replace("{content}", contentHtml);
	}
	ticker = "<div id='slider'></div><section id='tickerContainer' style='height:" + tickerHeight + "px;'><div id='tickerCard'><div id='tickerFlipButton'><i class='fa fa-refresh fa-lg'></i></div><figure class='back' id='timeline-ticker'></figure><figure class='front' id='trend-ticker'>trend ticker here</figure></div></section>";
	telecorrelator.innerHTML = ticker + html;

	//fill the timeline ticker with ~ * ~ * T I M E * ~ * ~
	fillTimelineTicker();

	//fill the trend ticker with ~ * ~ * T R E N D S * ~ * ~
	trendsList = response.trends;
	fillTrendTicker(trendsList);

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
			//look to see if margin should be added
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

	//event listeners
  
	document.getElementById('tickerFlipButton').addEventListener( 'click', function(){
		tickerCard = document.getElementById('tickerCard');//.toggleClassName('flipped');
		var className = ' ' + tickerCard.className + ' ';
	    if ( ~className.indexOf(' flipped ') ) {
	        tickerCard.className = className.replace(' flipped ', ' ');
	    } else {
	        tickerCard.className += ' flipped';
	    }
	    resetTelecorrelator();
	}, false);

	//loading screen
	document.getElementById('loading').style.opacity = 0;
	setTimeout( function() {
		document.getElementById('loading').style.height = '0px';
	}, 1000);


}

function telecorrelate(trendName) {
	// console.log (event);

	//highlight selected trend name
	var selects = document.getElementsByClassName("trendButton");
	for(var i =0, il = selects.length;i<il;i++){
	     selects[i].style.color = '#ffffff';
	  }
	event.target.style.color = "#2c3e50"; //'#FCFF32';

	//get the x of the mouse click and create an x-origin that makes sense
	var x = event.x;
	var slider = document.getElementById("slider");

	//move slider to the position
	slider.style.left = x - 10 + "px";

	//get the videos with the trends
	//go through each source, get children videos with the trend class, take the first
	for (var i = 0; i < newsSources.length; i++) {
		
		var timeline = document.getElementById(newsSources[i].sourceName);
		var matchingVideo = $(timeline).children("." + trendName)[0];

		if (matchingVideo) {
			// console.log(matchingVideo);
			//move the timeline over to the spot

			//move timeline to position
			var blockPosition = $(matchingVideo).position().left;

			// console.log ("blockPosition = " + blockPosition);
			// console.log ("x = " + x);
			// console.log ("*");

			var d = x - blockPosition - 50; //margin of telecorrelator and margin of block
			// console.log(d);
			timeline.style.opacity = 1;
			timeline.style.left = d + "px";

			var gestureData = {
				"source": newsSources[i].sourceName,
				"video": matchingVideo.attributes.url.nodeValue
			};
			console.log(gestureData);
			console.log('emitting event...');
    		UMevents.emit('telecorrelate', gestureData);
			
		}
		else {
			//move the whole shit out of the way.
			console.log("Nothing for: " + newsSources[i].sourceName);
			if ( x <= document.getElementById("telecorrelator").clientWidth / 2) { 
				timeline.style.left = x + "px";
			}
			else {
				timeline.style.left = x + 140 + slider.clientWidth - timeline.clientWidth + "px";
			}
		}

	};

}

function resetTelecorrelator() {
	var timelines = document.getElementsByClassName("timeline");
	// console.log (timelines);
	for (var i = 0; i < timelines.length; i++) {
		timelines[i].style.left = "0px";
	};
	document.getElementById("slider").style.left = "-300px";
	var selects = document.getElementsByClassName("trendButton");
	for(var i =0, il = selects.length;i<il;i++){
	     selects[i].style.color = '#ffffff';
	  }

}
