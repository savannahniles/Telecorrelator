function init(sourceName)
{
	console.log(sourceName);
	UMevents.clientname(sourceName);

	UMevents.on('playVideo', function(e) {
        console.log (e.type);
        console.log (e.name);
        console.log (e.data);        
    });
}