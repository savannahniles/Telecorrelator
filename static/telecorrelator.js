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

	//set up telecorrelator
	telecorrelator = document.getElementById('telecorrelator');
	telecorrelator.style.margin = margin + "px";
	telecorrelator.style.padding = padding + "px";
	telecorrelator.style.width = x + "px";
	telecorrelator.style.height = y + "px";

	// create a timeline for each news source
	var temp = "<div class='timeline-wrapper' style='width:{width}px; height:{height}px;'><div class='news-source-logo'>{source}</div><div class='timeline' id='{source}' style='height:{height}px;'></div></div>",
		html = '',
		totalSources = newsSources.length,
		timelineTickerHeight = 30,
		w = x,
		h = (y - timelineTickerHeight) / totalSources - 3; //hack to account for border
	for (var i = 0; i < totalSources; i++) {
		var sourceName = newsSources[i];
		html += temp.replace(/\{height\}/g, h)
          .replace(/\{width\}/g, w)
          .replace(/\{timelineTickerHeight\}/g, timelineTickerHeight)
          .replace("{source}", sourceName);
	}
	telecorrelator.innerHTML = "<div id='timeline-ticker' style='width:" + 100 + "%; height:" + timelineTickerHeight + "px;'>timeline ticker here</div>" + html;
}
