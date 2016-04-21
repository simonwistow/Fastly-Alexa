require('./utils');

var AlexaSkill = require('./AlexaSkill')

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
  // them for what they want to do
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