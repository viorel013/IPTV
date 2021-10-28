var Parser = {}

Parser.parse = function(content) {
	try{
		  var playlist = {
				    header: {},
				    items: []
				  }

				  log('parser 1');
				  var manifest = content.split(/(?=#EXTINF)/).map(function(l) { return l.trim()});

				  log('parser 2');
				  var firstLine = manifest.shift();
				  log('parser 3');
				  if (!firstLine || !/#EXTM3U/.test(firstLine)) throw ('Playlist is not valid');
				  log('parser 4');
				  playlist.header = parseHeader(firstLine);
				  log('parser 5');
				  for (var line in manifest) {
				    var item = {
				      name: manifest[line].getName(),
				      tvg: {
				        id: manifest[line].getAttribute('tvg-id'),
				        name: manifest[line].getAttribute('tvg-name'),
				        language: manifest[line].getAttribute('tvg-language'),
				        country: manifest[line].getAttribute('tvg-country'),
				        logo: manifest[line].getAttribute('tvg-logo'),
				        url: manifest[line].getAttribute('tvg-url'),
				        rec: manifest[line].getAttribute('tvg-rec')
				      },
				      group: {
				        title: manifest[line].getGroup() || manifest[line].getAttribute('group-title')
				      },
				      http: {
				        referrer: manifest[line].getVlcOption('http-referrer') || manifest[line].getKodiOption('Referer'),
				        'user-agent': manifest[line].getVlcOption('http-user-agent') || manifest[line].getKodiOption('User-Agent')
				      },
				      url: manifest[line].getURL(),
				      raw: manifest[line],
				      catchup: {
				        type: manifest[line].getAttribute('catchup'),
				        days: manifest[line].getAttribute('catchup-days'),
				        source: manifest[line].getAttribute('catchup-source')
				      },
				      timeshift: manifest[line].getAttribute('timeshift')
				    };

				    playlist.items.push(item)
				  }

				  return playlist
	}
	catch(e){
		log(e);
	}

};

function parseHeader(line) {
  var supportedAttrs = ['x-tvg-url']

  var attrs = {}
  for (var attrName in supportedAttrs) {
    var tvgUrl = line.getAttribute(attrName)
    if (tvgUrl) {
      attrs[attrName] = tvgUrl
    }
  }

  return {
    attrs: attrs,
    raw: line
  }
}

function getFullUrl(url) {
  var supportedTags = ['#EXTVLCOPT', '#EXTINF', '#EXTGRP']
  var last = url.split('\n')
    .filter(function(l){return l})
    .map(function(l) {return l.trim()})
    .filter(function(l) {
      return supportedTags.every(function(t) { return !l.startsWith(t)})
    })
    .shift()
    return last || '';
}

String.prototype.getAttribute = function (name) {
  var regex = new RegExp(name + '="(.*?)"', 'gi')
  var match = regex.exec(this)

  return match && match[1] ? match[1] : ''
}

String.prototype.getName = function () {
  var name = this.split(/[\r\n]+/)
    .shift()
    .split(',')
    .pop()
  return name || ''
}

String.prototype.getVlcOption = function (name) {
  var regex = new RegExp('#EXTVLCOPT:' + name + '=(.*)', 'gi')
  var match = regex.exec(this)

  return match && match[1] && typeof match[1] === 'string' ? match[1].replace(/\"/g, '') : ''
}

String.prototype.getGroup = function () {
  var regex = new RegExp('#EXTGRP:(.*)', 'gi')
  var match = regex.exec(this)

  return match && match[1] ? match[1] : ''
}

String.prototype.getURL = function () {
  var last = getFullUrl(this).split('|')[0]
  return last || ''
}

String.prototype.getKodiOption = function (name) {
  var url = getFullUrl(this)
  var regex = new RegExp(name + '=(\\w[^&]*)', 'g')
  var match = regex.exec(url)
  return match && match[1] ? match[1] : ''
}

//export default Parser