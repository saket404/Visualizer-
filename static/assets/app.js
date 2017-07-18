var app = angular.module("dashboardApp", ["ngRoute", "ngFileUpload"]);
app.config(["$routeProvider", function($routeProvider) {
    $routeProvider
    .when("/network", {
        templateUrl : "./templates/network.html"
    })
    .when("/upload", {
        templateUrl : "./templates/upload.html"
    })
    .when("/simulation", {
        templateUrl : "./templates/simulation.html"
    })
}]);


angular.module('dashboardApp')
.controller('AppController', ["$scope", function ($scope) {
 
$scope.networkGraph = {nodes: {}, links: {}, nodeIDs : [], customIDs : []}  

  
$scope.isAbout = false
$scope.isHome = true

  
$scope.triggerHome = function(){
  $scope.isAbout = false
$scope.isHome = true
}  
  
$scope.triggerAbout = function(){
  $scope.isAbout = true
  $scope.isHome = false
  
}    
  
}]) 
angular.module('dashboardApp')
.controller('NetworkController', ["$scope", "$http", function ($scope, $http) {

// init
$scope.isNodeDiv  = false
$scope.isLinkDiv  = false
$scope.nodeOptions  = "both"
$scope.node = {}
$scope.node.properties = {}
$scope.link = {}
$scope.link.properties = {}

$scope.isMachine = false
$scope.isUser = false


$scope.linkHeader = ""
$scope.nodeHeader = ""

$scope.drawNetwork = function(){  
  
  d3.select("#network-viz").selectAll("*").remove()
  
  var width = 600
  var height = 600
  var svg = d3.select("#network-viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  var graph = {nodes: [], links:[]}
  Object.keys($scope.networkGraph.nodes).forEach(function(key) {
    d = $scope.networkGraph.nodes[key];
    if ($scope.nodeOptions != "both"){
       if (d.properties.type == $scope.nodeOptions){
          graph.nodes.push({id: d.id, group: d.properties.type})
       }
    }
    else{
      graph.nodes.push({id: d.id, group: d.properties.type})
    }
  });
  
  Object.keys($scope.networkGraph.links).forEach(function(key) {
    d = $scope.networkGraph.links[key];
    console.log(d.source)
    
    var validNodes = []
    graph.nodes.forEach(function(d){
      validNodes.push(d.id)
    })
        
    var sourceFlag = validNodes.indexOf(d.source) > -1
    console.log("FLAG: "+ sourceFlag)
    if (sourceFlag){
      graph.links.push({source: d.source, target: d.target, value: 1})
    }
  });
  
  
  console.log(JSON.stringify(graph))
      
  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var  dragstarted = function(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

 var dragged = function(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

var dragended = function(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

  
  
  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  
  var ticked = function() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  node.on("click", function (d) {
        console.log("******NODE****************")
        console.log(JSON.stringify($scope.networkGraph.nodes[d.id]))
        $scope.node.id = d.id
        $scope.node.label = $scope.networkGraph.nodes[d.id].label
        $scope.node.properties.type = $scope.networkGraph.nodes[d.id].properties.type
        $scope.node.properties.vulnerability = $scope.networkGraph.nodes[d.id].properties.vulnerability
        
        if ($scope.networkGraph.nodes[d.id].properties.hasOwnProperty("CVE")) {
          $scope.node.properties.cve = $scope.networkGraph.nodes[d.id].properties.CVE
        }
        if ($scope.networkGraph.nodes[d.id].properties.hasOwnProperty("cve")) {
          $scope.node.properties.cve = $scope.networkGraph.nodes[d.id].properties.cve
        }
        
        $scope.node.properties.hasacc = $scope.networkGraph.nodes[d.id].properties.hasacc
        
        if ($scope.node.properties.type == "machine") {
          $scope.triggerAddMachine()
        }
        if ($scope.node.properties.type == "user") {
          $scope.triggerAddUser()
        }  
    
        $scope.nodeHeader = "Edit Node"
        $scope.$apply()
      })
  
  link.on("click", function (d) {
        console.log(d)
        console.log(d.source.id+"-"+d.target.id)
        console.log($scope.networkGraph.links[d.source.id+"-"+d.target.id])
        console.log($scope.networkGraph.links)
        $scope.link.source = d.source.id
        $scope.link.target = d.target.id
        
        if ($scope.networkGraph.nodes[d.source.id].properties.type == "user"){
          $scope.linkHeader = "Edit user link"
          $scope.triggerLinkUsers()
          $scope.triggerLinkChanged()
          $scope.$apply()
          
        }
        if ($scope.networkGraph.nodes[d.source.id].properties.type == "machine"){
          $scope.linkHeader = "Edit machine link"
          $scope.triggerLinkMachines()
          $scope.triggerLinkChanged()
          $scope.$apply()
        }
      
      })
  
  node.append("title")
      .text(function(d) { return d.id; })
      

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);
}

// bind UI
$scope.triggerCreate = function(){
  console.log("trigger create")
  d3.json("raw.json?"+ new Date().toLocaleTimeString(), function(error, graph) {
    $scope.networkGraph.nodes = {}
    graph.nodes.forEach(function(d){
      $scope.networkGraph.nodes[d.id] = d
    })
    $scope.networkGraph.links = {}
    graph.links.forEach(function(d){
      $scope.networkGraph.links[d.source + "-" + d.target] = d
    })
    console.log(JSON.stringify($scope.networkGraph))
    $scope.drawNetwork()
  })
}  

$scope.triggerAddUserPre = function(){
  $scope.node = {}
  $scope.node.properties = {}
  $scope.triggerAddUser()
}

$scope.triggerAddMachinePre = function(){
  $scope.node = {}
  $scope.node.properties = {}
  $scope.triggerAddMachine()
}


$scope.triggerAddUser = function(){
  $scope.nodeHeader = "Add user"
  $scope.isUser = true
  $scope.isMachine = false
  $scope.isNodeDiv = true;
  $scope.isLinkDiv = false;
  $scope.node.properties.type = "user";
  $scope.apply
}

$scope.triggerAddMachine = function(){
  $scope.nodeHeader = "Add machine"
  $scope.isMachine = true
  $scope.isUser = false
  $scope.isNodeDiv = true;
  $scope.isLinkDiv = false;
  $scope.node.properties.type = "machine";
  $scope.apply
}


$scope.triggerSaveNode = function(){
  $scope.isNodeDiv = false;
  $scope.networkGraph.nodes[$scope.node.id] = 
    JSON.parse(JSON.stringify($scope.node))
  console.log(JSON.stringify($scope.networkGraph.nodes))
  $scope.drawNetwork() 
}
$scope.triggerAddLink = function(){
  $scope.linkHeader = "Add link"
  $scope.networkGraph.nodeIDs = Object.keys($scope.networkGraph.nodes);
    
  $scope.isLinkDiv = true;
  $scope.isNodeDiv = false;
  $scope.apply
}

$scope.triggerLinkMachinesPre = function(){
  $scope.linkHeader = "Link machines"
  $scope.link.source = null
  $scope.link.target = null
  $scope.link.properties = {}
  $scope.triggerLinkMachines()
}

$scope.triggerLinkUsersPre = function(){
  $scope.linkHeader = "Link users"
  $scope.link.source = null
  $scope.link.target = null
  $scope.link.properties = {}
  $scope.triggerLinkUsers()
}


$scope.triggerLinkUsers = function(){
  $scope.networkGraph.customIDs = []
  Object.keys($scope.networkGraph.nodes).forEach(function(d){
    if ($scope.networkGraph.nodes[d].properties.type == "user"){
      $scope.networkGraph.customIDs.push(d)
    }
  })
  $scope.isMachine = false
  $scope.isUser = true
  $scope.isLinkDiv = true;
  $scope.isNodeDiv = false;
  $scope.apply
}

$scope.triggerLinkMachines = function(){
  $scope.networkGraph.customIDs = []
  Object.keys($scope.networkGraph.nodes).forEach(function(d){
    if ($scope.networkGraph.nodes[d].properties.type == "machine"){
      $scope.networkGraph.customIDs.push(d)
    }
  })
  $scope.networkGraph.nodeIDs = Object.keys($scope.networkGraph.nodes);
  $scope.isMachine = true
  $scope.isUser = false
  $scope.isLinkDiv = true;
  $scope.isNodeDiv = false;
  $scope.apply
}




$scope.triggerSaveLink = function(){
  
  $scope.isLinkDiv = false;
  $scope.networkGraph.links[$scope.link.source + "-" + $scope.link.target] = 
    {source: $scope.link.source, target: $scope.link.target, value: 1,
    properties: JSON.parse(JSON.stringify($scope.link.properties))}
  $scope.drawNetwork() 
  $scope.apply
}

$scope.triggerLinkChanged = function(){
  var link = $scope.networkGraph.links[$scope.link.source + "-" + $scope.link.target]
  
  $scope.link.properties.protocol = ""
  $scope.link.properties.port = ""
  $scope.link.properties.leakage = ""
  
  if (link.properties.hasOwnProperty("protocol")) {
    $scope.link.properties.protocol = link.properties.protocol
  }
  if (link.properties.hasOwnProperty("port")) {
    $scope.link.properties.port = link.properties.port
  }
  $scope.link.properties.leakage = link.properties.leakage
}


$scope.triggerOptionsChange = function(){
  $scope.drawNetwork()
}


$scope.triggerSaveGraph = function(){
  rawData = {nodes: [], links:[]}
  
  Object.keys($scope.networkGraph.nodes).forEach(function(key) {
    d = $scope.networkGraph.nodes[key];
    rawData.nodes.push(d)
  })
                                                 
  Object.keys($scope.networkGraph.links).forEach(function(key) {
    d = $scope.networkGraph.links[key];
    rawData.links.push(d)
  })
                                                 
  console.log("Raw data: " + JSON.stringify(rawData))
  $http.post('/api/store',  rawData);

  
}

  
 $scope.drawNetwork() 
  
}]) 
angular.module('dashboardApp')
.controller('SimulationController', ["$scope", "$http", function ($scope, $http) {

 
// init  
$scope.simulationData = [{id:1, tick:1, compromised:5}]  
$scope.isPause = false  
$scope.maxTick = 10

$scope.refreshGraph = function(){  
  doneFlag = false
  d3.json("state.json?"+ new Date().toLocaleTimeString(), function(error, state) {
  
    if (state.state != "done"){
      $scope.simulationData = []  
      $scope.drawGraph()
    }
  })
}
  
  
$scope.drawGraph = function(){  
  
  d3.select("#simulation-viz").selectAll("*").remove()
    
  var margin = {top: 20, right: 20, bottom: 30, left: 50}
  var width = 600 
  var height = 600
  
  
  
  
  var svg = d3.select("#simulation-viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  width = width - margin.left - margin.right
  height = height - margin.top - margin.bottom
  
  
      
      
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%d-%b-%y %H:%M:%S");

  var x = d3.scaleTime()
      .rangeRound([0, width]);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.close); });

  d3.csv("data.csv?"+ new Date().toLocaleTimeString(), function(d, i) {
    d.date = parseTime(d.date);
    d.close = +d.close;
    
    $scope.simulationData.push({id:i, tick:i, vulnerability:d.close, compromised:d.compromised})
          $scope.$apply()

    console.log(JSON.stringify($scope.simulationData))
    
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%M:%S")))
      .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Compromised");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
  });  
}
 

$scope.drawGraph()


$scope.start = function(){
   $http.get('/api/start/' + $scope.maxTick)
    .then(function (response) {
      console.log(response.data)
    })
}

$scope.stop = function(){
   $http.get('/api/stop')
    .then(function (response) {
      console.log(response.data)
    })
}

$scope.stop = function(){
   $http.get('/api/stop')
    .then(function (response) {
      console.log(response.data)
    })
}

$scope.triggerPause = function(){
  
   $http.get('/api/pause/' + $scope.isPause)
    .then(function (response) {
      console.log(response.data)
    })
  
}


$scope.timerId = setInterval(function () {
    
       $scope.refreshGraph()
    }, 1000);    






















}]) 
angular.module('dashboardApp')
.controller('UploadController', ["$scope", "Upload", "$timeout", function ($scope, Upload, $timeout) {

$scope.uploadFiles = function(file) {
  
  $scope.errorMsg = ""

  
  if (file.name.split(".")[1] != "json"){
    $scope.errorMsg = "Error: Wrong file. Please select a .json file."
    return
  }
  console.log("*************FILE*************")
        console.log(file.name.split(".")[1])
  
  if (file){
        $scope.f = file;
        
        
        file.upload = Upload.upload({
            url: 'api/upload',
            data: {file: file}
        });
        file.upload.then(function (response) {
        $timeout(function () {
          file.result = response.data;
        });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
        })
  }
  else{
    $scope.errorMsg = "Error: Please select a file!"
  }
            
        
    }  



}]) 