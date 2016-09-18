from flask import Flask, render_template, request
app = Flask(__name__)

#general- main page
@app.route('/index')
@app.route('/')
def hello_world():
    return render_template('index.html')

#when we have selected an area
@app.route('/select', methods=['GET', 'POST'])
def selector():
    minlat = request.args.get('minlat')
    minlng = request.args.get('minlng')
    maxlat = request.args.get('maxlat')
    maxlng = request.args.get('maxlng')
    return "Hi! Got data: " + str(minlat)
    #call the other python script

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
