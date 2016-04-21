require('dotenv').load();

var http       = require('http')
  , url        = require('url')
  , APP_ID     = process.env.APP_ID
  , FASTLY_KEY = process.env.MTA_KEY;

var getJsonFromFastly = function(path, callback, method) {
  method = method || 'GET'
  makeRequest({ method: method, protocol: 'https', hostname: 'api.fastly.com',  path: path }, callback);
}

var purgeUrlFromFastly = function(uri, callback) {
  var opts = url.parse(uri);
  opts['method'] = "PURGE";
  makeRequest(opts, callback)
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
      callback(null, result);
    });

  }).on('error', function(e){
    // FIXME does this work? (i.e is body still collected and parsed?)
    callback(e, result);
  });
};

var getService = function(name, callback) {
  makeRequest(url.parse("https://api.fastly.com/service/search?name="+name), callback);
}

var getVersion = function(service, version) {
  return version || service.versions.sort(function(a,b) { b.number - a.number })[0].number
}

var handleDeployRequest = function(intent, session, response){
  var heading = 'Deploying service ' + intent.slots.service.value;
  getService(intent.slots.service.value, function(error, response) {
    if (error) {
      var cardText = "Coudn't find service " + intent.slots.service.value + ": " + response.detail;
    } else {
      var service = response;
    }
  });
  
  if (!service) {
    return response.tellWithCard(cardText, heading, cardText);
  }
  
  var version = getVersion(service, intent.slots.service.value)
  var path    = "/service/"+service.id+"/version/"+version+"/activate";

  getJsonFromFastly(path, function(error, response){
    if (error) {
      var cardText = "I couldn't deploy service " + service.name + ': ' + data.detail + ": " + response.detail;
    } else {
      var cardText = 'Deploying service ' + service.name + ' version ' + version;
    }
    response.tellWithCard(text, heading, cardText);
  });
};

var handleVersionRequest = function(intent, session, response){
  var heading = 'Deploying service ' + intent.slots.service.value;
  getService(intent.slots.service.value, function(error, response) {
    if (error) {
      var cardText = "Coudn't find service " + intent.slots.service.value;
    } else {
      var service = response;
    }
  });
  
  if (!service) {
    return response.tellWithCard(text, heading, cardText);
  }
  
  var latest   = getVersion(service, nil) 
  var deployed = service.versions.filter(function(element, index, array) { element.deployed != nil } )[0].number
  
  var cardText = 'The latest version of ' + service.name + ' is ' + latest + '. ';
  if (latest == deployed) {
    cardText += 'It is currently deployed'
  } else {
    cardText += 'Version ' + deployed + ' is currently deployed.'
  }
  response.tellWithCard(cardText, heading, cardText);
};

var handlePurgeRequest = function(intent, session, response){  
  if (intent.slots.key.value) {
    var need_service = true;
    var heading      = 'Purging key ' + intent.slots.key.value;
    var path         = '/service/' + service.id + '/purge/' + intent.slots.key.value;
    var method       = 'POST';
  } else if (intent.slots.service.value) {
    var need_service = true;
    var heading      = 'Purging service ' + intent.slots.service.value;
    var path         = '/service/' + service.id + '/purge_all';
    var method       = 'POST';
  } else {
    var need_service = false;
    var heading      = 'Purging ' + intent.slots.url.value;
    var path         = intent.slots.url.value;
    var method       = 'PURGE';
  }
  
  if (need_service) {
    getService(intent.slots.service.value, function(error, response) {
      if (error) {
        var cardText = "Coudn't find service " + intent.slots.service.value + ": " + response.detail;
      } else {
        var service = response;
      }
    });
  }
  
  getJsonFromFastly(path, function(error, response) {
    if (error) {
      var cardText = "Couldn't purge: " + response.detail;
    } else {
      var cardText = "Successfully purged"
    }
    response.tellWithCard(cardText, heading, cardText);
  }, method);
};
