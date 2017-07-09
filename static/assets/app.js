
var app = angular.module("dashboardApp", ["ngRoute"]);
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
.controller('NetworkController', ["$scope", function ($scope) {
  
  
  d3.select("#network-viz").selectAll("*").remove()
  
  var width = 960
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

d3.json("graph.json", function(error, graph) {
  if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

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

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
  
}]) 
angular.module('dashboardApp')
.controller('SimulationController', ["$scope", "$http", function ($scope, $http) {
  
$scope.refreshGraph = function(){  
  doneFlag = false
  d3.json("state.json", function(error, state) {
  
    if (state.state != "done"){
      $scope.drawGraph()
    }
  })
}
  
  
$scope.drawGraph = function(){  
  
  d3.select("#simulation-viz").selectAll("*").remove()
    
  var margin = {top: 20, right: 20, bottom: 30, left: 50}
  var width = 960 
  var height = 400
  
  var svg = d3.select("#simulation-viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  width = width - margin.left - margin.right
  height = height - margin.top - margin.bottom
  
  
      
      
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%d-%b-%y");

  var x = d3.scaleTime()
      .rangeRound([0, width]);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.close); });

  d3.csv("data.csv?"+ new Date().toLocaleTimeString(), function(d) {
    d.date = parseTime(d.date);
    d.close = +d.close;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
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
   $http.get('/api/start')
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

$scope.timerId = setInterval(function () {
    
       $scope.refreshGraph()
    }, 1000);    






















}]) 