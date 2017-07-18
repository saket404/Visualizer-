from flask import Flask, jsonify

import os
from flask import request, redirect, url_for
from werkzeug.utils import secure_filename
import json

UPLOAD_FOLDER = './static'
ALLOWED_EXTENSIONS = set(['json'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


import simulationStub as sim
import json
from threading import Thread


app.secret_key = 'some_secret'

@app.route('/')
def hello():
    return redirect("/static/index.html", code=302)

@app.route('/api/start/<int:max_tick>')
def start(max_tick):
    print "Simulation has been started."
    
    t = Thread(target=sim.start, args=(max_tick,))
    t.start()
        
    return jsonify({"result":"started simulation."})
  

@app.route('/api/pause/<string:is_pause>')
def pause(is_pause):
    state = "running"
    if (is_pause == "true"):
      state = "pause"
    
    print "Simulation state: " + state
    with open('./static/state.json', 'w') as fp:
      json.dump({"state":state}, fp)    
        
    return jsonify({"result":"Simulation state: " + state})    
  
  
@app.route('/api/stop')
def stop():
    print "Simulation has been stopped."
    with open('./static/state.json', 'w') as fp:
      json.dump({"state":"done"}, fp)    
        
    return jsonify({"result":"stopped simulation."})  

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/static/api/upload', methods=['POST'])
def upload_file():
    print "uploading file..."
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename("raw.json")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return "done"  
  
@app.route('/api/store', methods=['POST'])
def store_file():
  with open('./static/raw.json', 'w') as fp:
      json.dump(json.loads(request.data), fp)    
  return "done"

  
if __name__ == "__main__":
        app.run(debug=True)
    
    

