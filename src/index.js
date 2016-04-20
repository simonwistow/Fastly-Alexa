require('dotenv').load();

var http       = require('http')
  , url        = require 'url')
  , AlexaSkill = require('./AlexaSkill')
  , APP_ID     = process.env.APP_ID
  , FASTLY_KEY    = process.env.MTA_KEY;

var getJsonFromFastly = function(path, callback, method='GET') {
  return makeRequest({ method: method, protocol: 'https', hostname: 'api.fastly.com',  path: path }, callback);
}

var purgeUrlFromFastly = function(uri, callback) {
  var opts = url.parse(uri);
  opts['method'] = "PURGE";
  return makeRequest(opts, callback)
}

var makeRequest = function(opts, callback) {
  opts['headers'] = { 'Fastly-Key': FASTLY_KEY }
  http.request(opts, function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

// FIXME we need to have error handling around this
var getService = function(name) {
  return makeRequest(url.parse("https://api.fastly.com/service/search?name="+name));
}

var getVersion = function(service, version) {
  return version || service.versions.sort(function(a,b) { b.number <=> a.number })[0].number
}

var handleDeployRequest = function(intent, session, response){
  var service = getService(intent.slots.service.value)
  var version = getVersion(service, intent.slots.service.value)
  var path    = "/service/"+service.id+"/version/"+version+"/activate";

  getJsonFromFastly(path, function(data){
    // FIXME do error handling from the request - docs for 'http' are unclear
    if (success) {
      var cardText = 'Deploying service ' + service.name + ' version ' + version;
    } else {
      var cardText = "I couldn't deploy service " + service.name + ': ' + data.detail;
    }
    var heading = 'Deploying service ' + service.name;
    response.tellWithCard(text, heading, cardText);
  });
};

var handleVersionRequest = function(intent, session, response){
  var service  = getService(intent.slots.service.value)
  var latest   = getVersion(service, nil) 
  var deployed = service.versions.filter(function(element, index, array) { element.deployed != nil } )[0].number
  
  var heading = 'Getting the latest version of service ' + service.name;
  var cardText = 'The latest version of ' + service.name + ' is '+latest'. ';
  if (latest == deployed) {
    cardText += 'It is currently deployed'
  } else {
    cardText += 'Version ' + deployed + ' is currently deployed.'
  }
  response.tellWithCard(text, heading, cardText);
};

var handlePurgeRequest = function(intent, session, response){
  if (intent.slots.key.value) {
    var service = getService(intent.slots.service.value);
    var path    = '/service/' + service.id + '/purge/' + intent.slots.key.value;
    var method    = 'POST';
  } else if (intent.slots.service.value)
    var service = getService(intent.slots.service.value);
    var path    = '/service/' + service.id + '/purge_all';
    var method    = 'POST';
  } else {
    var path   = intent.slots.url.value;
    var method = 'PURGE';
  }
  getJsonFromFastly(path, function(data){
    if (success) {
      var cardText = 'Deploying service ' + service.name + ' version ' + version;
    } else {
      var cardText = "I couldn't deploy service " + service.name + ': ' + data.detail;
    }
    var heading = 'Deploying service ' + service.name;
    response.tellWithCard(text, heading, cardText);
  }, method);
};



var Fastly = function(){
  AlexaSkill.call(this, APP_ID);
};

Fastly.prototype = Object.create(AlexaSkill.prototype);
Fastly.prototype.constructor = Fastly;

Fastly.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
  // What happens when the session starts? Optional
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
      + ", sessionId: " + session.sessionId);
};

Fastly.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
  // This is when they launch the skill but don't specify what they want. Prompt
  // them for their bus stop
  var output = 'Welcome to Fastly. ' +
    'I can do a purge, deploy a version for you, let you know the lastest and deployed versions and tell you various stats.';

  var reprompt = 'What would you like to do?';

  response.ask(output, reprompt);

  console.log("onLaunch requestId: " + launchRequest.requestId
      + ", sessionId: " + session.sessionId);
};

Fastly.prototype.intentHandlers = {
  DeployIntent: function(intent, session, response){
    handleDeployRequest(intent, session, response);
  },
s
  VersionIntent: function(intent, session, response){
    handleVersionRequest(intent, session, response);
  },

  PurgeIntent: function(intent, session, response){
    handlePurgeRequest(intent, session, response);
  },

  HelpIntent: function(intent, session, response){
    var speechOutput = "I'm here to help"; // FIXME
    response.ask(speechOutput);
  }
};

exports.handler = function(event, context) {
    var skill = new Fastly();
    skill.execute(event, context);
};