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
	timeline = document.getElementById('timeline-ticker');
	times = ["Last Hour", "Today", "Yesterday", "This Week", "All"]
	list = ""
	for (var i = 0; i < times.length; i++) {
		list += "<li class='timeButton'>" + times[i] + "</li>";
	};
	timeline.innerHTML = "<ul class='horizontalList'>" + list + "</ul>";
}

function fillTrendTicker() {
	trendTicker = document.getElementById('trend-ticker');
	trend = ["Trend Here", "Another", "Gimme Dat Trend", "More Trends", "All"]
	list = ""
	for (var i = 0; i < trend.length; i++) {
		list += "<li class='timeButton'>" + trend[i] + "</li>";
	};
	trendTicker.innerHTML = "<ul class='horizontalList'>" + list + "</ul>";
}

function init()
{

	//get window height
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
	console.log (newsSources);

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
		w = x,
		h = (y - tickerHeight) / totalSources - 3; //hack to account for border
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i]["sourceName"],
			sourceImage = newsSources[i]["thumbnail"],
			loadingId = sourceName + "_loading";

		html += tempHtml.replace(/\{height\}/g, h)
          .replace(/\{width\}/g, w)
          .replace(/\{timelineTickerHeight\}/g, tickerHeight)
          .replace("{sourceImage}", sourceImage)
          .replace("{sourceName}", sourceName)
          .replace("{loadingId}", loadingId);
          // .replace("{content}", contentHtml);
	}
	ticker = "<section id='tickerContainer' style='height:" + tickerHeight + "px;'><div id='tickerCard'><div id='tickerFlipButton'><i class='fa fa-refresh fa-lg'></i></div><figure class='front' id='timeline-ticker'></figure><figure class='back' id='trend-ticker'>trend ticker here</figure></div></section>";
	telecorrelator.innerHTML = ticker + html;

	//fill the timeline ticker with ~ * ~ * T I M E * ~ * ~
	fillTimelineTicker();

	//fill the trend ticker with ~ * ~ * T R E N D S * ~ * ~
	fillTrendTicker();

	//fill each timeline with ~ * ~ * C O N T E N T * ~ * ~

	console.log ("totalSources: " + totalSources);

	for (var i = 0; i < totalSources; i++) {
		console.log(i);
		var sourceName = newsSources[i]["sourceName"],
		    timeline = document.getElementById(sourceName),
			contentHtml = "",
			content = newsSources[i]["content"],
			contentPadding = 7,
			totalContentObjects = content.length,
			tempContentHtml = "<div class=content {keyword} title={title} url={url} timestamp={timestamp} style='{backgroundImage}; height:{height}px;'></div>";

			console.log(content);
		//here, go through the source's videos and plop them on the timeline
		for (var j = 0; j < totalContentObjects; j++) {
			contentHtml += tempContentHtml.replace(/\{height\}/g, h-2*contentPadding)
				.replace(/\{backgroundImage\}/g, 'background-image:url("' + content[j]["thumbnail"] + '")')
				.replace("{keyword}", "")
				.replace("{title}", "'" + content[j]["title"] + "'")
				.replace("{url}", content[j]["url"])
				.replace("{timestamp}", content[j]["timestamp"]);
		};

		timeline.innerHTML = contentHtml;
	};

	//vertically center logos


	//event listeners
  
	document.getElementById('tickerFlipButton').addEventListener( 'click', function(){
		tickerCard = document.getElementById('tickerCard');//.toggleClassName('flipped');
		var className = ' ' + tickerCard.className + ' ';
	    if ( ~className.indexOf(' flipped ') ) {
	        tickerCard.className = className.replace(' flipped ', ' ');
	    } else {
	        tickerCard.className += ' flipped';
	    }
	}, false);

	//loading screen
	document.getElementById('loading').style.opacity = 0;
	setTimeout( function() {
		document.getElementById('loading').style.height = '0px';
	}, 1000);


}
