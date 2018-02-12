var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'openstreetmap'

    // Optional depending on the providers
    // httpAdapter: 'https', // Default
    // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
    // formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

for(var i = 0;i < 10; i++) {    //17.454185, 78.378912
    geocoder.reverse({lat:17.454185, lon:78.378912}, function(err, res) {
        if(res) console.log(i ,'==>', res[0].formattedAddress);
        else console.log(i ,'==>', res);
    });
}

//openstreetmap
//