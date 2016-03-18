// 1. Go to chrome://memory-redirect/
// 2. Paste this script into the developer console

(function(){
  var SERVER = 'http://localhost:4567/', // Post metrics to any server
      STRINGS = 'chrome://memory-redirect/strings.js',
      INTERVAL = 10e3,
      RE_INCLUDE = /./; // only include certain results, if you want.

  function getMemoryStats() {
    console.log('Getting stats.')
    xhr({ method: 'GET', url: STRINGS, callback: sendMemoryStats })
  }

  function sendMemoryStats(req){
    eval(req.responseText.replace(/loadTimeData./, ''))
    xhr({ method: 'POST', url: SERVER, data: formatData(data) })
  }

  function xhr(opts){
    var req, type, url, callback;
    method = opts.method;
    url = opts.url;
    callback = opts.callback || function(){};
    data = opts.data;
    req = new XMLHttpRequest()
    req.open(method, url, true)
    req.onreadystatechange = function(){
      if (req.readyState === 4 && req.status === 200) {
        callback(req)
      }
    }
    req.send(data)
  }

  function flatten(result, array){
    return result.concat(array);
  }

  function formatData(data){
    var result = [].concat(
      data.jstemplateData.browsers
        .map(function(browser){
          var private = browser.ws_priv * 1000,
              virtual = browser.comm_priv * 1000,
              source  = formatSource(browser.name);

          return [
            { 'chrome.memory.private': { value: private, source: source } },
            { 'chrome.memory.virtual': { value: virtual, source: source } }
          ]
        })
        .reduce(flatten, [])
      ,
      data.jstemplateData.child_data
        .map(function(item){
          var private = item.ws_priv * 1000,
              virtual = item.comm_priv * 1000,
              source  = formatSource(item.child_name, item.titles.slice(-1)[0]);

          return [
            { 'chrome.process.memory.private': { value: private, source: source } },
            { 'chrome.process.memory.virtual': { value: virtual, source: source } }
          ]
        })
        .filter(function(item){
          return RE_INCLUDE.test(item.source)
        })
        .reduce(flatten, [])
    );

    return JSON.stringify(result);
  }

  function getMemory(measurement) {
    return {
      virtual: measurement.ws_priv * 1000,
      private: measurement.comm_priv * 1000
    };
  }

  function formatSource() {
    var args = [].slice.call(arguments);
    return args.join(" ")
      .toLowerCase()
      .replace(/[^a-z\- ]/g, ' ')
      .replace(/ [ ]*/g, ' ')
      .replace(/ /g, '.')
      .replace(/\.$/g, '')
  }

  console.info('Start collecting memory stats...')
  getMemoryStats()
  setInterval(getMemoryStats, INTERVAL)
})()
