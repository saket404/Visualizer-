import datetime
import pandas as pd
import time
import random 
import json


def storeData(updatedData):
  updatedData.to_csv("./static/data.csv", index=False)  

def getVuln(i):
    value = random.random()
    print value
    print i
    
    customCompromised = []
    for _ in range(0,random.choice(range(4))):
      customCompromised.append(random.choice([1,2,3,4,5,6,7,8,9]))
      
    return {"vuln": value, "compromised": customCompromised}
    
def start(maxTick):
  
  # Add stub api for input file pass to simulator
  with open("./static/raw.json") as json_data:
      jsonGraphData = json.load(json_data)
      print jsonGraphData
  
  
  # toggle to running state
  with open('./static/state.json', 'w') as fp:
      json.dump({"state":"running"}, fp)
  
  a  = datetime.datetime(2017, 1, 1, 0, 0,0)
  customColumns = ["date","close", "compromised"]
  data = []
  
  value = 0
  for i in range(maxTick):
    
    # handle current state
    with open("./static/state.json") as json_data:
      state = json.load(json_data)
      print data
      
      if state["state"] == "done":
        exit()
        
      if state["state"] == "pause":
        while True:
          isPause = True
          time.sleep(1)
          with open("./static/state.json") as json_data:
            state = json.load(json_data)
            if state["state"] != "pause":
              isPause = False
          if (isPause == False):
            break
        
        
    time.sleep(1)
    tickData = getVuln(i)
    
    a += datetime.timedelta(seconds = 1)
    data.append({"date": a.strftime('%d-%b-%y %H:%M:%S'),
                 "close": "%s"%float(tickData["vuln"]),
                 "compromised": tickData["compromised"]})
    storeData(pd.DataFrame(data, columns = customColumns) )
    
    
    
    
    
    # toggle to done state
  
  time.sleep(3)
  with open('./static/state.json', 'w') as fp:
      json.dump({"state":"done"}, fp)

    

    






    





