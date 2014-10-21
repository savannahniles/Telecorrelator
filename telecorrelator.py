from flask import Flask, render_template, request   # for running the Flask server
import sys                                          # for obtaining command line arguments
import json                                         # for creating json objects to send to client
import math                                         # for performing calculations
import urllib2                                      # for querying other sites for content
import datetime
import dateutil.parser
import re
import random

app = Flask(__name__)
app.debug=True

@app.route('/')
def telecorrelator():
    return render_template('telecorrelator.html')

@app.route('/mediaResponsiveObjects')
def mediaResponsiveObjects():
    return render_template('mediaResponsiveObjects.html')

@app.route('/source/<sourceName>')
def show_source(sourceName):
    return render_template('source.html', source=sourceName)

@app.route('/getContent')
def getContent():
    # timeAvailable = request.args.get('t')
    errorCode = 0
    trendsList = []
    newsSources = [
        {
            'sourceName': "CNN",
            'matchNames': ["CNN"],
            'thumbnail': "http://www.logotypes101.com/logos/818/0DC42F494DC71D10AA9168972ECCFDD3/CNN282.png",
            'content': []
        }, {
        #     'sourceName': "ABC",
        #     'matchNames': ["23ABCnews", "ABC (WCVB)", "ABC News", "AbcNews", "ABC7 WJLA", "Super News Planet"],
        #     'thumbnail': "http://media.10news.com/photo/2012/09/30/ABC-Logo-AP-Image-9676346_175336_ver1.0_320_240.jpg",
        #     'content': []
        # }, {
            'sourceName': "CBS",
            'matchNames': ["CBS", "CBS Sports", "CBS (WBZ) ", "CBS New York", "VOAvideo", "CBS SF Bay Area"],
            'thumbnail': "http://goldmusiclibrary.com/wp-content/uploads/cbs-logo.jpg",
            'content': []
        }, {
            'sourceName': "BBC",
            'matchNames': ["BBC", "BBC News", "BBCnews", "BBC World News"],
            'thumbnail': "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT2VI5VQgveLK38CbIMeW5jO753dYaQuKdBLZQE6X1yR1Y3-p4oPxPshPg",
            'content': []
        }, {
            'sourceName': "USA Today",
            'matchNames': ["USA TODAY"],
            'thumbnail': "https://pbs.twimg.com/profile_images/461560356314165249/Ik1AqEj4_400x400.png",
            'content': []
        },  {
            'sourceName': "ESPN",
            'matchNames': ["ESPN", "206"],
            'thumbnail': "http://i.imgur.com/QSQdgGq.jpg",
            'content': []
       },  {
            'sourceName': "MSNBC",
            'matchNames': ["MSNBC"],
            'thumbnail': "http://fontmeme.com/images/MSNBC-Logo.jpg",
            'content': []
        }, {
            'sourceName': "The White House",
            'matchNames': ["The White House"],
            'thumbnail': "http://www.socialmediadelivered.com/wp-content/uploads/2012/02/profile_icon_01.jpg",
            'content': []
        }
    ]
    trends = [
"Ukraine",
"China",
"Gaza",
"Police",
"Gough Whitlam",
"Percy Harvin",
"Cold War",
"Iran",
"Manchester United F.C.",
"Baghdad",
"iPhone",
"Iraq",
"Oscar de la Renta",
"Palestine",
"Apple",
"Ebola",
"Indiana",
"Dallas Cowboys",
"Kansas City Royals",
"Boko Haram",
"Oscar Pistorius",
"Shinz? Abe",
"European Union",
"University of Virginia",
"Joko Widodo",
"Bharatiya Janata Party",
"IBM",
"Talladega",
"Dilma Rousseff",
"Syria",
"Philippines",
"Fury",
"Yemen",
"Peyton Manning",
"Russia",
"Serena Williams",
"New Orleans Saints",
"Miami Dolphins",
"Nepal",
"Hamas",
"Seattle Seahawks",
"Woman",
"Liverpool F.C.",
"Pope Francis"
]

    for trend in trends:
        UM_QUERY_API = "http://um-query.media.mit.edu/search/"
        url = UM_QUERY_API + urllib2.quote(trend.encode('utf-8')) + "?segmentType=scene" + "&after=2014-10-09T00:00:00.000Z"
        umQueryResponse = json.loads(urllib2.urlopen(url).read())
        if umQueryResponse["code"] == 0:
            results = umQueryResponse["results"]
            numberOfVideosForTrendPerCreator = {
                'CNN': 0,
                # 'ABC': 0,
                'MSNBC': 0,
                'CBS': 0,
                'BBC': 0,
                'USA Today': 0,
                'ESPN': 0,
                'The White House': 0
            }
            for video in results:
                creator = video["creator"]
                for source in newsSources:
                    if creator in source["matchNames"]:
                        sourceName = source["sourceName"]
                        numberOfVideosForTrendPerCreator[sourceName] = numberOfVideosForTrendPerCreator[sourceName] + 1
                        video["trend"] = re.sub(r'\W+', '', trend) #remove spaces so it can be a class name
                        video["timePeriod"] = getTimePeriod(video["timestamp"])
                        if numberOfVideosForTrendPerCreator[sourceName] < 4:
                            source["content"].append(video)
                        if trend not in trendsList:
                            trendsList.append(trend)
                        break
    response = {'errorCode' : errorCode, 'trends' : trendsList, 'newsSources' : newsSources}
    # print response
    return json.dumps(response)

def getTimePeriod (timestamp):
    currentTime = datetime.datetime.now()
    time = dateutil.parser.parse(timestamp).replace(tzinfo=None)
    elapsedTime = currentTime - time
    if elapsedTime.seconds <= 3600:
        return "lastHour"
    if elapsedTime.days <= 1:
        return "today"
    if elapsedTime.days <= 2:
        return "yesterday"
    if elapsedTime.days <= 7:
        return "thisWeek"
    return "older"


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "USAGE: python telecorrelator.py [port #]"
    else:
        # app.run(port = int(sys.argv[1])) # run on the specified port number
        app.run(host = "0.0.0.0", port = int(sys.argv[1]))
