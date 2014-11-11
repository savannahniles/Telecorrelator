from flask import Flask, render_template, request   # for running the Flask server
import sys                                          # for obtaining command line arguments


app = Flask(__name__)
app.debug=True

@app.route('/')
def videoheadlines():
    return render_template('videoheadlines.html')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "USAGE: python videoheadlines.py [port #]"
    else:
        # app.run(port = int(sys.argv[1])) # run on the specified port number
        app.run(host = "0.0.0.0", port = int(sys.argv[1]))
