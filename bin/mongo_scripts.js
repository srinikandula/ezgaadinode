var positions = db.devicePositions.find({"createdAt":{$lte:ISODate("2018-07-15T13:21:01.822Z")}}).limit(500000).toArray()
while(positions.length > 499999) {
    for(p in positions){
        db.archivedDevicePositions.insert(positions[p]);
        db.devicePositions.remove({"_id":positions[p]._id})
    }
    positions = db.devicePositions.find({"createdAt":{$lte:ISODate("2018-07-15T13:21:01.822Z")}}).limit(500000).toArray()
}
