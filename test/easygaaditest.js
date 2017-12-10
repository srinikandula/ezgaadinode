//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('./../server/models/schemas').AccountsColl;
let Driver = require('./../server/models/schemas').DriversColl;
let Truck = require('./../server/models/schemas').TrucksColl;
let Trip = require('./../server/models/schemas').TripCollection;
let Party = require('./../server/models/schemas').PartyCollection;
let ExpenseMaster = require('./../server/models/schemas').expenseMasterColl;
let Expense = require('./../server/models/schemas').ExpenseCostColl;
let Payment = require('./../server/models/schemas').paymentsReceivedColl;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

let accountId = "";
let token = "";
let driverId = "";
let truckId = "";
let tripId = "";
let partyId = "";
let expensemasterId = "";
let expenseId = "";
let paymentId = "";

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {
    User.collection.drop();
    Driver.collection.drop();
    Truck.collection.drop();
    Trip.collection.drop();
    Party.collection.drop();
    ExpenseMaster.collection.drop();
    Expense.collection.drop();
    Payment.collection.drop();

    beforeEach((done) => { //Before each test we empty the database        
        let userData = new User({
            "userName": "ramarao",
            "password": "9908126699",
            "contactPhone": 9908126699
        });
        userData.save(function (err, data) {
            done();
        });
    });
    /*
    * Test the /POST route User Login
    */
    describe('/POST User Login Failure', () => {
        /*
        * Test the /POST route User Login Failure
        */
        it('It Should Return User Doesn\'t Exist', (done) => {
            let userData = {
                "userName": "ramarao1",
                "password": "99081266991",
                "contactPhone": 99081266991
            };

            chai.request(server)
                .post('/v1/group/login')
                .send(userData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['User doesn\'t exist']);
                    done();
                });
        });
        /*
        * Test the /POST route User Login Success
        */
        it('Logging to EasyGaadi', (done) => {
            let userData = {
                "userName": "ramarao",
                "password": "9908126699",
                "contactPhone": 9908126699
            };

            chai.request(server)
                .post('/v1/group/login')
                .send(userData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userName').eql('ramarao');
                    res.body.should.have.property('token');
                    token = res.body.token;
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Driver Information
    */
    describe('/POST Adding Driver', () => {
        /*
        * Test the /POST route Adding Driver Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let driverData = {
                "fullname": "Kumar",
                "mobile": 9618489859,
            };

            chai.request(server)
                .post('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid full name']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Driver Information Success
        */
        it('It Should Add Driver To Driver Schema', (done) => {
            let headerData = {
                "token": token
            };
            let driverData = {
                "fullName": "Kumar",
                "mobile": 9618489859,
            };
            chai.request(server)
                .post('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.driver.should.have.property('fullName');
                    res.body.driver.should.have.property('mobile');
                    driverId = res.body.driver._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Driver Information
    */
    describe('/GET Retrieving Driver', () => {
        /*
        * Test the /GET route Retrieving Driver Information Success
        */
        it('It Should Retrive Driver Details From Driver Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/drivers/account/drivers')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.drivers[0].should.have.property(['fullName']);
                    res.body.drivers[0].should.have.property(['mobile']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Driver Information
    */
    describe('/PUT Updating Driver', () => {
        /*
        * Test the /PUT route Updating Driver Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let driverData = {
                "id": driverId,
                "fullName": "Kumar",
                "mobile": 9618489849,
            };

            chai.request(server)
                .put('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid driverId']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Driver Information Success
        */
        it('It Should Update Driver', (done) => {
            let headerData = {
                "token": token
            };
            let driverData = {
                "_id": driverId,
                "fullName": "Kumar1",
                "mobile": 9618489849,
            };
            chai.request(server)
                .put('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.driver.should.have.property('fullName');
                    res.body.driver.should.have.property('mobile');
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Truck Information
    */
    describe('/POST Adding Truck', () => {
        /*
        * Test the /POST route Adding Truck Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let truckData = {
                "registrationno": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };

            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please provide valid registration number']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Truck Information Success
        */
        it('It Should Add Truck To Truck Schema', (done) => {
            let headerData = {
                "token": token
            };
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                    res.body.truck.should.have.property('registrationNo');
                    res.body.truck.should.have.property('truckType');
                    truckId = res.body.truck._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Truck Information
    */
    describe('/GET Retrieving Truck', () => {
        /*
        * Test the /GET route Retrieving Truck Information Success
        */
        it('It Should Retrive Truck Details From Truck Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/trucks/groupTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property(['registrationNo']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Truck Information
    */
    describe('/POST Updating Truck', () => {
        /*
        * Test the /PUT route Updating Truck Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let truckData = {
                "registrationno": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };

            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please provide valid registration number']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Truck Information Success
        */
        it('It Should Update Truck', (done) => {
            let headerData = {
                "token": token
            };
            let truckData = {
                "_id": truckId,
                "registrationNo": "AP36AA9866",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            chai.request(server)
                .put('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Truck updated successfully']);
                    res.body.truck.should.have.property('registrationNo');
                    res.body.truck.should.have.property('truckType');
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Party Information
    */
    describe('/POST Adding Party', () => {
        /*
        * Test the /POST route Adding Party Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "name": "Party2",
                "contactt": 9874563210,
                "email": "party2@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ]
            };

            chai.request(server)
                .post('/v1/party/addParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql(' Please provide valid contact number for party type');
                    done();
                });
        });
        /*
        * Test the /POST route Adding Party Information Success
        */
        it('It Should Add Party To Party Schema', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "name": "Party2",
                "contact": 9874563210,
                "email": "party2@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ]
            };
            chai.request(server)
                .post('/v1/party/addParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Party Added Successfully');
                    res.body.party.should.have.property('name');
                    res.body.party.should.have.property('contact');
                    partyId = res.body.party._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Party Information
    */
    describe('/GET Retrieving Party', () => {
        /*
        * Test the /GET route Retrieving Party Information Success
        */
        it('It Should Retrive Party Details From Party Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/party/get/all')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.parties[0].should.have.property(['name']);
                    res.body.parties[0].should.have.property(['contact']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Party Information
    */
    describe('/PUT Updating Party', () => {
        /*
        * Test the /PUT route Updating Party Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "_id": partyId,
                "name": "Party1",
                "contactt": 9512376408,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ]
            };

            chai.request(server)
                .put('/v1/party/updateParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Error while updating party, try Again');
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Party Information Success
        */
        it('It Should Update Party', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "_id": partyId,
                "name": "Party1",
                "contact": 9512376408,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
                "updatedBy": ""
            };
            chai.request(server)
                .put('/v1/party/updateParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Party updated successfully');
                    res.body.party.should.have.property('name');
                    res.body.party.should.have.property('contact');
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Trip Information
    */
    describe('/POST Adding Trip', () => {
        /*
        * Test the /POST route Adding Trip Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let tripData = {
                "date": new Date(),
                "registrationno": truckId,
                "partyid": partyId,
                "driverId": driverId,
                "freightAmount": 1500
            };

            chai.request(server)
                .post('/v1/trips/addTrip')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please select a party']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Trip Information Success
        */
        it('It Should Add Trip To Trip Schema', (done) => {
            let headerData = {
                "token": token
            };
            let tripData = {
                "date": new Date(),
                "registrationNo": truckId,
                "partyId": partyId,
                "driverId": driverId,
                "freightAmount": 1500
            };
            chai.request(server)
                .post('/v1/trips/addTrip')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Trip Added Successfully']);
                    tripId = res.body._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Trip Information
    */
    describe('/GET Retrieving Trip', () => {
        /*
        * Test the /GET route Retrieving Trip Information Success
        */
        it('It Should Retrive Trip Details From Trip Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/trips/getAllAccountTrips')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trips[0].should.have.property(['tripId']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Trip Information
    */
    describe('/PUT Updating Trip', () => {
        /*
        * Test the /PUT route Updating Trip Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let tripData = {
                "_id": tripId,
                "freightamount": 1300
            };

            chai.request(server)
                .put('/v1/trips')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error, finding trip']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Trip Information Success
        */
        it('It Should Update Trip', (done) => {
            let headerData = {
                "token": token
            };
            let tripData = {
                "_id": tripId,
                "freightAmount": 1300
            };
            chai.request(server)
                .put('/v1/trips')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Trip updated successfully']);
                    res.body.trip.should.have.property('freightAmount');
                    res.body.trip.should.have.property('tripId');
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Expense Master Information
    */
    describe('/POST Adding Expense Master', () => {
        /*
        * Test the /POST route Adding Expense Master Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "expensename": "Breaks"
            };

            chai.request(server)
                .post('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please provide valid expense name']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Expense Master Information Success
        */
        it('It Should Add Expense Master To Expense Master Schema', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "expenseName": "Breaks"
            };
            chai.request(server)
                .post('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Successfully Added']);
                    res.body.newDoc.should.have.property('expenseName');
                    expensemasterId = res.body.newDoc._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Expense Master Information
    */
    describe('/GET Retrieving Expense Master', () => {
        /*
        * Test the /GET route Retrieving Expense Master Information Success
        */
        it('It Should Retrive Expense Master Details From Expense Master Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/ExpenseMaster')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.expenses[0].should.have.property(['expenseName']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Expense Master Information
    */
    describe('/PUT Updating Expense Master', () => {
        /*
        * Test the /PUT route Updating Expense Master Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "id": expensemasterId,
                "expensename": "Greese"
            };

            chai.request(server)
                .put('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error, finding expense']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Expense Master Information Success
        */
        it('It Should Update Expense Master', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "_id": expensemasterId,
                "expenseName": "Grease"
            };
            chai.request(server)
                .put('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expense updated successfully']);
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Expense Information
    */
    describe('/POST Adding Expense', () => {
        /*
        * Test the /POST route Adding Expense Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "vehiclenumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 100
            };

            chai.request(server)
                .post('/v1/expense/addExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Please provide valid vehicle number');
                    done();
                });
        });
        /*
        * Test the /POST route Adding Expense Information Success
        */
        it('It Should Add Expense To Expense Schema', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "vehicleNumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 100
            };
            chai.request(server)
                .post('/v1/expense/addExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('expenses Cost Added Successfully');
                    expenseId = res.body._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Expense Information
    */
    describe('/GET Retrieving Expense', () => {
        /*
        * Test the /GET route Retrieving Expense Information Success
        */
        it('It Should Retrive Expense Details From Expense Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/expense/getAllExpenses')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    res.body.expenses[0].should.have.property(['cost']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Expense Information
    */
    describe('/PUT Updating Expense', () => {
        /*
        * Test the /PUT route Updating Expense Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "_id": expenseId,
                "vehiclenumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 120
            };

            chai.request(server)
                .put('/v1/expense/updateExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Error, finding expenses Record');
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Expense Information Success
        */
        it('It Should Update Expense', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "_id": expenseId,
                "vehicleNumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 120
            };
            chai.request(server)
                .put('/v1/expense/updateExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql(['expenses Cost updated successfully']);
                    done();
                });
        });
    });
    /*
    * Test the /POST route Adding Payment Information
    */
    describe('/POST Adding Payment', () => {
        /*
        * Test the /POST route Adding Payment Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "partyid": partyId,
                "date": new Date(),
                "amount": 120
            };

            chai.request(server)
                .post('/v1/payments/addPayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please provide Party']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Payment Information Success
        */
        it('It Should Add Payment To Payment Schema', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "partyId": partyId,
                "date": new Date(),
                "amount": 120
            };
            chai.request(server)
                .post('/v1/payments/addPayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Successfully Added']);
                    paymentId = res.body._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Payment Information
    */
    describe('/GET Retrieving Payment', () => {
        /*
        * Test the /GET route Retrieving Payment Information Success
        */
        it('It Should Retrive Payment Details From Payment Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/payments')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.payments[0].should.have.property(['amount']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Payment Information
    */
    describe('/PUT Updating Payment', () => {
        /*
        * Test the /PUT route Updating Payment Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "_id": paymentId,
                "partyid": partyId,
                "date": new Date(),
                "amount": 150
            }

            chai.request(server)
                .put('/v1/payments/updatePayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error, finding payment']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Payment Information Success
        */
        it('It Should Update Payment', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "_id": paymentId,
                "partyId": partyId,
                "date": new Date(),
                "amount": 150
            }
            chai.request(server)
                .put('/v1/payments/updatePayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payment updated successfully']);
                    done();
                });
        });
    });
    /*
    * Test the /GET route Getting Dashboard Information
    */
    describe('/GET Dashboard', () => {
        /*
        * Test the /Get route Trucks Expiry Count Information Success
        */
        it('Retrieving Dashboard Data', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/findExpiryCount')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.expiryCount.should.have.property('fitnessExpiryCount');
                    res.body.expiryCount.should.have.property('permitExpiryCount');
                    res.body.expiryCount.should.have.property('insuranceExpiryCount');
                    res.body.expiryCount.should.have.property('pollutionExpiryCount');
                    res.body.expiryCount.should.have.property('taxExpiryCount');
                    done();
                });
        });
        /*
        * Test the /Get route Fitness Expiry Trucks Information Success
        */
        it('Retrieving Fitness Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/fitnessExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('fitnessExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Permit Expiry Trucks Information Success
        */
        it('Retrieving Permit Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/permitExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('permitExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Insurance Expiry Trucks Information Success
        */
        it('Retrieving Insurance Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/insuranceExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('insuranceExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Pollution Expiry Trucks Information Success
        */
        it('Retrieving Pollution Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/pollutionExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('pollutionExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Tax Expiry Trucks Information Success
        */
        it('Retrieving Tax Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/taxExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('taxDueDate');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue Information Success
        */
        it('Retrieving Total Revenue Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trips/find/totalRevenue')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('totalRevenue');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Vehicles Information Success
        */
        it('Retrieving Total Revenue by Vehicles Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trips/find/revenueByVehicle')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.revenue[0].should.have.property('registrationNo');
                    res.body.revenue[0].should.have.property('totalFreight');
                    res.body.revenue[0].should.have.property('totalExpense');
                    res.body.revenue[0].should.have.property('totalRevenue');
                    res.body.revenue[0].attrs.should.have.property('truckName');
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight');
                    res.body.grossAmounts.should.have.property('grossExpenses');
                    res.body.grossAmounts.should.have.property('grossRevenue');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Individual Vehicle Information Success
        */
        it('Retrieving Total Revenue by Individual Vehicle Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/party/vehiclePayments/' + truckId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trips[0].should.have.property('vehicleNumber');
                    res.body.trips[0].should.have.property('expenseType');
                    res.body.trips[0].should.have.property('cost');
                    res.body.should.have.property('totalRevenue');
                    res.body.totalRevenue.should.have.property('totalFreight');
                    res.body.totalRevenue.should.have.property('totalExpenses');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue Information Success
        */
        it('Retrieving Total Revenue Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/expense/total')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('totalExpenses');
                    done();
                });
        });
        /*
        * Test the /Get route Total Expenses by Vehicles Information Success
        */
        it('Retrieving Total Expenses by Vehicles Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/expense/groupByVehicle')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.expenses[0].should.have.property('regNumber');
                    res.body.expenses[0].exps[0].should.have.property('dieselExpense');
                    res.body.expenses[0].exps[0].should.have.property('tollExpense');
                    res.body.expenses[0].exps[0].should.have.property('mExpense');
                    res.body.expenses[0].exps[0].should.have.property('misc');
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense');
                    res.body.totalExpenses.should.have.property('totaltollExpense');
                    res.body.totalExpenses.should.have.property('totalmExpense');
                    res.body.totalExpenses.should.have.property('totalmisc');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Individual Vehicle Information Success
        */
        it('Retrieving Total Expenses by Individual Vehicle Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/expense/vehicleExpense/' + truckId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.expenses[0].should.have.property('vehicleNumber');
                    res.body.expenses[0].should.have.property('expenseType');
                    res.body.expenses[0].should.have.property('cost');
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense');
                    res.body.totalExpenses.should.have.property('totaltollExpense');
                    res.body.totalExpenses.should.have.property('totalmExpense');
                    res.body.totalExpenses.should.have.property('totalmisc');
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment Information Success
        */
        it('Retrieving Total Payment Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/payments/getTotalAmount/')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('amounts');
                    res.body.amounts[0].should.have.property('total');
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment by party Information Success
        */
        it('Retrieving Total Payment by Party Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/payments/getDuesByParty/')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('parties');
                    res.body.parties[0].should.have.property('totalPayment');
                    res.body.parties[0].should.have.property('totalFright');
                    res.body.parties[0].should.have.property('totalDue');
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight');
                    res.body.grossAmounts.should.have.property('grossExpenses');
                    res.body.grossAmounts.should.have.property('grossDue');
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment by Individual Party Information Success
        */
        it('Retrieving Total Payment by Individual Party Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/party/tripsPayments/' + partyId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('results');
                    res.body.results[0].should.have.property('partyId');
                    res.body.should.have.property('totalPendingPayments');
                    res.body.totalPendingPayments.should.have.property('totalFreight');
                    res.body.totalPendingPayments.should.have.property('totalPaid');
                    done();
                });
        });
    });
});