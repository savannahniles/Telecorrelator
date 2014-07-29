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
	ticker = "<section id='tickerContainer' style='height:" + tickerHeight + "px;'><div id='tickerCard'> <figure class='front' id='timeline-ticker'>timeline ticker here</figure><figure class='back' id='trend-ticker'>trend ticker here</figure></div></section>";
	telecorrelator.innerHTML = ticker + html;

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
  
	// document.getElementById('flip').addEventListener( 'click', function(){
	// 	document.getElementById('card').toggleClassName('flipped');
	// }, false);


}
