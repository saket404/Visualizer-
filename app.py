from flask import Flask, jsonify
app = Flask(__name__)

import simulationStub as sim
import json
from threading import Thread
    


app.secret_key = 'some_secret'

@app.route('/api/start')
def start():
    print "Simulation has been started."
    
    t = Thread(target=sim.start)
    t.start()
        
    return jsonify({"result":"started simulation."})
  
  
@app.route('/api/stop')
def stop():
    print "Simulation has been stopped."
    with open('./static/state.json', 'w') as fp:
      json.dump({"state":"done"}, fp)    
        
    return jsonify({"result":"stopped simulation."})  

  
if __name__ == "__main__":
        app.run(debug=True,host='0.0.0.0')
    
    

