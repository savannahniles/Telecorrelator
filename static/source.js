function init(sourceName)
{
	console.log(sourceName);
	UMevents.clientname("um-telecorrelator");

	UMevents.on('telecorrelate', function(e) {
        console.log (e.data);

        if (e.data.source == sourceName) {
        	console.log ("Received!");
			console.log (e.data.video);
			document.getElementById('video').src = e.data.video;
			video.play();
		}

    });
}