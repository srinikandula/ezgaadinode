var GpsColl = require('./../../models/schemas').GpsColl;
var gps = require('./../../apis/gpsApi');
var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client(),
    consumer = new Consumer(
        client,
        [
            { topic: 'test' , partition: 0 }
        ],
        {
            autoCommit: true
            // fromOffset: 1
        }
    );

consumer.on('message', function (message) {
    var position = JSON.parse(message.value);
    gps.AddDevicePositions(position, function (result) {
        console.log();
    });
    /*var positionDoc = new GpsColl(position);
    positionDoc.save(function (err,result) {
        if (err) {
            console.log('err');
        } else {
            console.log('saved');
        }
    });*/

});

consumer.on("error", function(err) {
    console.log("error", err);
});