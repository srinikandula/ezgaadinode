var positions = db.devicePositions.find({"createdAt":{$lte:ISODate("2018-12-05T13:21:01.822Z")}}).limit(50000).toArray()
while(positions.length > 49999) {
    for(p in positions){
        db.archivedDevicePositions.insert(positions[p]);
        db.devicePositions.remove({"_id":positions[p]._id})
    }
    positions = db.devicePositions.find({"createdAt":{$lte:ISODate("2018-12-05T13:21:01.822Z")}}).limit(50000).toArray()
}


db.userLogins.remove({})
var accounts = db.accounts.find({},{"userName":1,"contactPhone":1,"password" :1,"contactName" :1,"role":1}).toArray()
for(a in accounts) {
    db.userLogins.insert({"userName" : accounts[a].userName, "contactPhone" : accounts[a].contactPhone, "password" : accounts[a].password, "accountId" : accounts[a]._id, "role":accounts[a].role})
}


var geoFenceReports = db.gpsFencesReports.find({"accountId":"5b33727677e71e20a5d8503b"}).toArray()
for(var i=0; i<geoFenceReports.length;i++){
    db.gpsFencesReports.remove({"_id":geoFenceReports[i]._id});
    geoFenceReports[i].registrationNo = geoFenceReports[i].registrationNo.toUpperCase();
    db.gpsFencesReports.save(geoFenceReports[i]);
}


