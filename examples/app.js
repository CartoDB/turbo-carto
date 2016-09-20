'use strict';

/* jshint ignore:start */
var map = L.map('map', {
    scrollWheelZoom: false,
    center: [30, 0],
    zoom: 2
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: '<a href="http://cartodb.com">CartoDB</a> © 2014',
    maxZoom: 18
}).addTo(map);

var sqlEditor = CodeMirror.fromTextArea(document.getElementById('sql_editor'), {
    theme: 'monokai',
    lineNumbers: true,
    mode:  "text/x-plsql",
    height: "100px"
});

var cssEditor = CodeMirror.fromTextArea(document.getElementById('css_editor'), {
    theme: 'monokai',
    lineNumbers: true,
    mode: "text/x-scss",
    height: "200px"
});

var rasterLayer = null;
function updateMap() {
    if (rasterLayer) {
        map.removeLayer(rasterLayer);
    }

    var config = {
        "version": "1.2.0",
        "layers": [
            {
                "type": "cartodb",
                "options": {
                    "sql": sqlEditor.getValue(),
                    "cartocss": cssEditor.getValue(),
                    "cartocss_version": "2.3.0"
                }
            }
        ]
    };

    var request = new XMLHttpRequest();
    request.open('POST', currentEndpoint(), true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.onload = function() {
        if (this.status >= 200 && this.status < 400){
            var layergroup = JSON.parse(this.response);

            var tilesEndpoint = currentEndpoint() + '/' + layergroup.layergroupid + '/{z}/{x}/{y}.png';

            var protocol = 'https:' === document.location.protocol ? 'https' : 'http';
            if (layergroup.cdn_url && layergroup.cdn_url[protocol]) {
                var domain = layergroup.cdn_url[protocol];
                if ('http' === protocol) {
                    domain = '{s}.' + domain;
                }
                tilesEndpoint = protocol + '://' + domain + '/' + currentUser() + '/api/v1/map/' + layergroup.layergroupid + '/{z}/{x}/{y}.png';
            }

            rasterLayer = L.tileLayer(tilesEndpoint, {
                maxZoom: 18
            }).addTo(map);
        } else {
            throw 'Error calling server: Error ' + this.status + ' -> ' + this.response;
        }
    };
    request.send(JSON.stringify(config));
}


function currentUser() {
    return currentEndpoint().match(/http[s]*:\/\/([^.]*).*/)[1];
}

function currentEndpoint() {
    return document.getElementById('endpoint').value;
}


CodeMirror.commands.save = function() {
    updateMap();
};


document.getElementById('endpoint').addEventListener('blur', updateMap, false);


updateMap();
/* jshint ignore:end */
