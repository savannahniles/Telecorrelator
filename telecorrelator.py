from flask import Flask, render_template, request   # for running the Flask server
import sys                                          # for obtaining command line arguments
import json                                         # for creating json objects to send to client
import math                                         # for performing calculations
import urllib2                                      # for querying other sites for content

app = Flask(__name__)
app.debug=True

@app.route('/')
def telecorrelator():
    return render_template('telecorrelator.html')

@app.route('/getContent')
def getContent():
    # timeAvailable = request.args.get('t')
    errorCode = 0
    newsSources = [
        {
            'sourceName': "CNN",
            'matchNames': ["CNN"],
            'thumbnail': "http://um-static.media.mit.edu/UU-0MrczERAe4/UU-0MrczERAe4_low.mp4",
            'content': []
        }, {
            'sourceName': "ABC", 
            'matchNames': ["23ABCnews", "ABC (WCVB)", "ABC News"],
            'thumbnail': "http://um-static.media.mit.edu/UU-2QqLqnxXJc/UU-2QqLqnxXJc_low.mp4",
            'content': []
        }, {
            'sourceName': "CBS", 
            'matchNames': ["CBS", "CBS Sports", "CBS (WBZ)"],
            'thumbnail': "http://um-static.media.mit.edu/UU-0MrczERAe4/UU-0MrczERAe4_low.mp4",
            'content': []
        }, {
            'sourceName': "BBC", 
            'matchNames': ["BBC", "BBC News", "BBCnews"],
            'thumbnail': "http://um-static.media.mit.edu/UU-2QqLqnxXJc/UU-2QqLqnxXJc_low.mp4",
            'content': []
        }, {
            'sourceName': "ESPN",
            'matchNames': ["ESPN"],
            'thumbnail': "http://um-static.media.mit.edu/UU-0MrczERAe4/UU-0MrczERAe4_low.mp4",
            'content': []
        }
    ]
    trends = json.loads(urllib2.urlopen("http://um.media.mit.edu:5005/trends").read())['json_list']

    for trend in trends:
        UM_QUERY_API = "http://um-query.media.mit.edu/search/"
        url = UM_QUERY_API + urllib2.quote(trend.encode('utf-8'))
        umQueryResponse = json.loads(urllib2.urlopen(url).read())
        if umQueryResponse["code"] == 0:
            results = umQueryResponse["results"]
            for video in results:
                creator = video["creator"]
                for source in newsSources:
                    if creator in source["matchNames"]:
                        video["trend"] = trend
                        source["content"].append(video)
                        break

    #we want to pull every trend and search through those videos for our sources
    #when we get a match, we want to append that video to the array of videos in the dictionary of sources

    # videos = []
    # for trend in trends:
    #     UM_QUERY_API = "http://um-query.media.mit.edu/search/"
    #     desiredTime = timeAvailable / len(trends)
    #     url = UM_QUERY_API + urllib2.quote(trend.encode('utf-8')) + '?duration=' + str(int(desiredTime))
    #     umQueryResponse = json.loads(urllib2.urlopen(url).read())
    #     if umQueryResponse["code"] == 0:
    #         videos.append(umQueryResponse["results"][0])


    # # generate the render object containing the playlist
    # renderObject = {'EDL': [] }

    # for video in videos:

    #     url = video['videoHigh'] if video['videoHigh'] else ""
    #     startTime = video['startTime'] if video['startTime'] else ""
    #     endTime = video['endTime'] if video['endTime'] else ""
    #     title = video['creator'] if video['creator'] else ""
    #     thumbnail = video['thumbnail'] if video['thumbnail'] else ""

    #     renderObject['EDL'].append(
    #         {
    #             'url': url,
    #             'startTime': startTime,
    #             'endTime': endTime,
    #             'title': title,
    #             'thumbnail': thumbnail
    #         })

    response = {'errorCode' : errorCode, 'newsSources' : newsSources}
    print response
    return json.dumps(response)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "USAGE: python telecorrelator.py [port #]"
    else:
        app.run(port = int(sys.argv[1])) # run on the specified port number
