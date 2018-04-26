db.trucks.createIndex({"deviceId":1})
db.trucks.createIndex({"accountId":1})
db.trucks.createIndex({"userName":1})
db.trucks.createIndex({"registrationNo":1})

db.operatingRoutes.createIndex({"destinationLocation" : "2dsphere"})
db.devicePositions.createIndex({"deviceTime":1})