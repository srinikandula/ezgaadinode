db.trucks.createIndex({"deviceId":1})
db.trucks.createIndex({"accountId":1})
db.trucks.createIndex({"userName":1})
db.trucks.createIndex({"registrationNo":1})

db.operatingRoutes.createIndex({"destinationLocation" : "2dsphere"})
db.devicePositions.createIndex({"deviceTime":1})



var devices=db.devices.find({},{"_id":1,"imei":1}).toArray()
for(var d=0;d<devices.length;d++){
    var trucks = db.trucks.find({"deviceId":devices[d].imei}).toArray();
    for(var t=0;t<trucks.length;t++){
        print(trucks[t].registrationNo);
        db.devices.updateMany({"imei":devices[d].imei},{$set:{"registrationNo":trucks[t].registrationNo,"truckId":trucks[t]._id}});
    }
}