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
    renderObject = {
        'title': 'Ultimate Media Remix',
        'EDL': [{
            'url': "http://um-static.media.mit.edu/UU-0MrczERAe4/UU-0MrczERAe4_low.mp4",
            'startTime': 2.0,
            'endTime': 5.0,
        }, {
            'url': "http://um-static.media.mit.edu/UU-2QqLqnxXJc/UU-2QqLqnxXJc_low.mp4",              
            'startTime': 2.0,
            'endTime': 4.0,
        }, {
            'url': "http://um-static.media.mit.edu/UU-0MrczERAe4/UU-0MrczERAe4_low.mp4",
            'startTime': 54.0,
            'endTime': 56.0,
        }, {
            'url': "http://um-static.media.mit.edu/UU-2QqLqnxXJc/UU-2QqLqnxXJc_low.mp4",
            'startTime': 10.0,
            'endTime': 13.0,
        }, {
            'url': "http://um-static.media.mit.edu/UU-0MrczERAe4/UU-0MrczERAe4_low.mp4",
            'startTime': 34.0,
            'endTime': 37.0,
        }],
    }
    newsSources = ["CNN", "MSNBC", "Fox", "The Daily Show", "BBC", "ESPN"]

    # # perform some safety checks here to make sure the timeAvailable is a valid number
    # if timeAvailable == "few":
    #     timeAvailable = math.sqrt(10)
    # else:
    #     timeAvailable = float(timeAvailable)
    # timeAvailable = max(0.0, timeAvailable)
    # timeAvailable = min(60.0, timeAvailable)
    # timeAvailable = timeAvailable * 60 # convert to seconds

    # trends = json.loads(urllib2.urlopen("http://um.media.mit.edu:5005/trends").read())['json_list']
    
    # # print trends

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
