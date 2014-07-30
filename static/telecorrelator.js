var telecorrelator; //= document.getElementById('telecorrelator');
var newsSources;
// var newsSources = ["CNN", "MSNBC", "Fox", "The Daily Show", "BBC", "ESPN"]

//get window height
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    margin = 20,
    padding = 20,
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight,
    x = x - margin*2 - padding*2,
    y = y - margin*2 - padding*2;

function getContent() {
	var request = new XMLHttpRequest();
	request.onload = init;

	request.open('GET', '/getContent', true); // request a renderObject from the server
	request.send();
}

function fillTimelineTicker(tickerW, tickerH) {
	//var w = 500,
    //h = 300,
    // var tickerX = d3.time.scale().range([0, tickerW]),  
   	// 	xAxis = d3.svg.axis().scale(tickerX).orient("bottom").tickSize(-tickerH, 0).tickPadding(6); 

    // var svg = d3.select("#timeline-ticker").append("svg:svg")
	   //  .attr("width", tickerW)
	   //  .attr("height", tickerH)
	   //  .append("svg:g");

    // svg.append("svg:g")
	   //  .attr("class", "x axis")
	   //  // .attr("transform", "translate(0," + tickerH + ")");

    // svg.append("svg:rect")
	   //  .attr("class", "pane")
	   //  .attr("width", tickerW)
	   //  .attr("height", tickerH)
	   //  .call(d3.behavior.zoom().on("zoom", zoom));

    // tickerX.domain([new Date(2012, 0, 1), new Date(2014, 0, 0)]);

    // draw();

    // function draw() {
    //   console.log ("drawing");
    //   svg.select("g.x.axis").call(xAxis);
    // }

    // function zoom() {
    //   console.log("zooming");
    //   // d3.event.transform(tickerX); // TODO d3.behavior.zoom should support extents
    //   draw();
    // }
}

function init()
{
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
	telecorrelator.style.margin = margin + "px";
	telecorrelator.style.padding = padding + "px";
	telecorrelator.style.width = x + "px";
	telecorrelator.style.height = y + "px";

	// create a timeline for each news source
	var tempHtml = "<div class='timeline-wrapper' style='width:{width}px; height:{height}px;'><div class='news-source-logo'>{source}</div><div class='timeline' id='{source}' style='height:{height}px;'><div id='{loadingId}' class='contentLoading'>Content Loading...</div></div></div>",
		html = '',
		totalSources = newsSources.length,
		tickerHeight = 30,
		w = x,
		h = (y - tickerHeight) / totalSources - 3; //hack to account for border
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i]["sourceName"],
			loadingId = sourceName + "_loading";

		html += tempHtml.replace(/\{height\}/g, h)
          .replace(/\{width\}/g, w)
          .replace(/\{timelineTickerHeight\}/g, tickerHeight)
          .replace("{source}", sourceName)
          .replace("{source}", sourceName)
          .replace("{loadingId}", loadingId);
          // .replace("{content}", contentHtml);
	}
	ticker = "<section id='tickerContainer' style='height:" + tickerHeight + "px;'><div id='tickerCard'><div id='tickerFlipButton'><i class='fa fa-refresh'></i></div><figure class='front' id='timeline-ticker'></figure><figure class='back' id='trend-ticker'>trend ticker here</figure></div></section>";
	telecorrelator.innerHTML = ticker + html;

	//fill the timeline ticker with ~ * ~ * T I M E * ~ * ~
	fillTimelineTicker(w, tickerHeight)

	//fill each timeline with ~ * ~ * C O N T E N T * ~ * ~

	console.log ("totalSources: " + totalSources);

	for (var i = 0; i < totalSources; i++) {
		console.log(i);
		var sourceName = newsSources[i]["sourceName"],
		    timeline = document.getElementById(sourceName),
			contentHtml = "",
			content = newsSources[i]["content"],
			totalContentObjects = content.length,
			tempContentHtml = "<div class=content {keyword} title={title} url={url} timestamp={timestamp} style='{backgroundImage}; height:{height}px;'></div>";

			console.log(content);
		//here, go through the source's videos and plop them on the timeline
		for (var j = 0; j < totalContentObjects; j++) {
			contentHtml += tempContentHtml.replace(/\{height\}/g, h-5)
				.replace(/\{backgroundImage\}/g, 'background-image:url("' + content[j]["thumbnail"] + '")')
				.replace("{keyword}", "")
				.replace("{title}", "'" + content[j]["title"] + "'")
				.replace("{url}", content[j]["url"])
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
	}, false);


}
