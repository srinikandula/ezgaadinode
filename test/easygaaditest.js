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
let espenseId = "";
let paymentId = "";

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            let userData = new User({
                "userName": "ramarao",
                "password": "9908126699",
                "contactPhone": 9908126699
            });
            userData.save();
            accountId = User._id;
            console.log(accountId);           
            done();
        });
        Driver.remove({}, (err) => {            
            
        });
        Truck.remove({}, (err) => {            
            
        });
        Trip.remove({}, (err) => {            
            
        });
        Party.remove({}, (err) => {            
            
        });
        ExpenseMaster.remove({}, (err) => {            
            
        });
        Expense.remove({}, (err) => {            
            
        });
        Payment.remove({}, (err) => {            
            
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
                    res.body.should.have.property('messages').eql([ 'Invalid full name' ]);                                        
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
                "mobile": "9618489859",                
            };

            chai.request(server)
                .post('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.driver.should.have.property('fullName');
                    res.body.driver.should.have.property('mobile');                    
                    driverId = res.body._id;
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
                "token": token,                
            };            

            chai.request(server)
                .get('/v1/drivers/account/drivers')                
                .set(headerData)
                .end((err, res) => {    
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.drivers.should.have.property([ 'fullName' ]);
                    res.body.drivers.should.have.property([ 'mobile' ]);                    
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Driver Information
    */
    describe('/POST Updating Driver', () => {
        /*
        * Test the /POST route Updating Driver Information Failure
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
                    res.body.should.have.property('messages').eql([ 'Invalid full name' ]);
                    done();
                });
        });
        /*
        * Test the /POST route Updating Driver Information Success
        */
        it('It Should Update Driver', (done) => {            
            let headerData = {
                "token": token
            };
            let driverData = {
                "_id": driverId,
                "fullName": "Kumar1",
                "mobile": "9618489859",                
            };

            chai.request(server)
                .post('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
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
                "truckType": "20 Tyre"                
            };

            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
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
                "truckType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Truck Added Successfully' ]);
                    res.body.truck.should.have.property('registrationNo');
                    res.body.truck.should.have.property('truckType');                    
                    truckId = res.body._id;
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
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.trucks.should.have.property([ 'registrationNo' ]);                                        
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Truck Information
    */
    describe('/POST Updating Truck', () => {
        /*
        * Test the /POST route Updating Truck Information Failure
        */
        it('It Throws Error', (done) => {            
            let headerData = {
                "token": token
            };
            let truckData = {
                "registrationno": "AP36AA9876",
                "truckType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
                    done();
                });
        });
        /*
        * Test the /POST route Updating Truck Information Success
        */
        it('It Should Update Truck', (done) => {            
            let headerData = {
                "token": token
            };
            let truckData = {
                "_id": truckId,
                "registrationNo": "AP36AA9866",
                "truckType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/trucks')
                .send(truckData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Truck Added Successfully' ]);
                    res.body.truck.should.have.property('registrationNo');
                    res.body.truck.should.have.property('truckType');                    
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
                "registrationno": "AP36AA9876",
                "tripType": "20 Tyre"                
            };

            chai.request(server)
                .post('/v1/trips')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
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
                "registrationNo": "AP36AA9876",
                "tripType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/trips')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Trip Added Successfully' ]);
                    res.body.trip.should.have.property('registrationNo');
                    res.body.trip.should.have.property('tripType');                    
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
                .get('/v1/trips/groupTrips')                
                .set(headerData)
                .end((err, res) => {    
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.trips.should.have.property([ 'registrationNo' ]);                                        
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Trip Information
    */
    describe('/POST Updating Trip', () => {
        /*
        * Test the /POST route Updating Trip Information Failure
        */
        it('It Throws Error', (done) => {            
            let headerData = {
                "token": token
            };
            let tripData = {
                "registrationno": "AP36AA9876",
                "tripType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/trips')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
                    done();
                });
        });
        /*
        * Test the /POST route Updating Trip Information Success
        */
        it('It Should Update Trip', (done) => {            
            let headerData = {
                "token": token
            };
            let tripData = {
                "_id": tripId,
                "registrationNo": "AP36AA9866",
                "tripType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/trips')
                .send(tripData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Trip Added Successfully' ]);
                    res.body.trip.should.have.property('registrationNo');
                    res.body.trip.should.have.property('tripType');                    
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
                "registrationno": "AP36AA9876",
                "partyType": "20 Tyre"                
            };

            chai.request(server)
                .post('/v1/partys')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
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
                "registrationNo": "AP36AA9876",
                "partyType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/partys')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Party Added Successfully' ]);
                    res.body.party.should.have.property('registrationNo');
                    res.body.party.should.have.property('partyType');                    
                    partyId = res.body._id;
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
                .get('/v1/partys/groupPartys')                
                .set(headerData)
                .end((err, res) => {    
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.partys.should.have.property([ 'registrationNo' ]);                                        
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Party Information
    */
    describe('/POST Updating Party', () => {
        /*
        * Test the /POST route Updating Party Information Failure
        */
        it('It Throws Error', (done) => {            
            let headerData = {
                "token": token
            };
            let partyData = {
                "registrationno": "AP36AA9876",
                "partyType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/partys')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
                    done();
                });
        });
        /*
        * Test the /POST route Updating Party Information Success
        */
        it('It Should Update Party', (done) => {            
            let headerData = {
                "token": token
            };
            let partyData = {
                "_id": partyId,
                "registrationNo": "AP36AA9866",
                "partyType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/partys')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Party Added Successfully' ]);
                    res.body.party.should.have.property('registrationNo');
                    res.body.party.should.have.property('partyType');                    
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
                "registrationno": "AP36AA9876",
                "expensemasterType": "20 Tyre"                
            };

            chai.request(server)
                .post('/v1/expensemasters')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
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
                "registrationNo": "AP36AA9876",
                "expensemasterType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/expensemasters')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Expense Master Added Successfully' ]);
                    res.body.expensemaster.should.have.property('registrationNo');
                    res.body.expensemaster.should.have.property('expensemasterType');                    
                    expensemasterId = res.body._id;
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
                .get('/v1/expensemasters/groupExpense Masters')                
                .set(headerData)
                .end((err, res) => {    
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.expensemasters.should.have.property([ 'registrationNo' ]);                                        
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Expense Master Information
    */
    describe('/POST Updating Expense Master', () => {
        /*
        * Test the /POST route Updating Expense Master Information Failure
        */
        it('It Throws Error', (done) => {            
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "registrationno": "AP36AA9876",
                "expensemasterType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/expensemasters')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
                    done();
                });
        });
        /*
        * Test the /POST route Updating Expense Master Information Success
        */
        it('It Should Update Expense Master', (done) => {            
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "_id": expensemasterId,
                "registrationNo": "AP36AA9866",
                "expensemasterType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/expensemasters')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Expense Master Added Successfully' ]);
                    res.body.expensemaster.should.have.property('registrationNo');
                    res.body.expensemaster.should.have.property('expensemasterType');                    
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
                "registrationno": "AP36AA9876",
                "expenseType": "20 Tyre"                
            };

            chai.request(server)
                .post('/v1/expenses')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
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
                "registrationNo": "AP36AA9876",
                "expenseType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/expenses')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Expense Added Successfully' ]);
                    res.body.expense.should.have.property('registrationNo');
                    res.body.expense.should.have.property('expenseType');                    
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
                .get('/v1/expenses/groupExpenses')                
                .set(headerData)
                .end((err, res) => {    
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.expenses.should.have.property([ 'registrationNo' ]);                                        
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Expense Information
    */
    describe('/POST Updating Expense', () => {
        /*
        * Test the /POST route Updating Expense Information Failure
        */
        it('It Throws Error', (done) => {            
            let headerData = {
                "token": token
            };
            let expenseData = {
                "registrationno": "AP36AA9876",
                "expenseType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/expenses')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
                    done();
                });
        });
        /*
        * Test the /POST route Updating Expense Information Success
        */
        it('It Should Update Expense', (done) => {            
            let headerData = {
                "token": token
            };
            let expenseData = {
                "_id": expenseId,
                "registrationNo": "AP36AA9866",
                "expenseType": "20 Tyre"
            };

            chai.request(server)
                .post('/v1/expenses')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Expense Added Successfully' ]);
                    res.body.expense.should.have.property('registrationNo');
                    res.body.expense.should.have.property('expenseType');                    
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
                "date": "2017-12-04T11:12:00.000Z",
                "amount": 120
            };

            chai.request(server)
                .post('/v1/payments/addPayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
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
                "date": "2017-12-04T11:12:00.000Z",
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
                    res.body.should.have.property('messages').eql([ 'Successfully Added' ]);                
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
                    console.log(res.body);                                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Success' ]);
                    res.body.payments.should.have.property([ 'registrationNo' ]);                                        
                    done();
                });
        });
    });    
    /*
    * Test the /POST route Updating Payment Information
    */
    describe('/POST Updating Payment', () => {
        /*
        * Test the /POST route Updating Payment Information Failure
        */
        it('It Throws Error', (done) => {            
            let headerData = {
                "token": token
            };
            let paymentData = {
                "_id": paymentId,
                "partyid": partyId,
                "date": "2017-12-04T11:12:00.000Z",
                "amount": 150
            }

            chai.request(server)
                .post('/v1/payments/updatePayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Please provide valid registration number' ]);                                        
                    done();
                });
        });
        /*
        * Test the /POST route Updating Payment Information Success
        */
        it('It Should Update Payment', (done) => {            
            let headerData = {
                "token": token
            };
            let paymentData = {
                "_id": paymentId,
                "partyId": partyId,
                "date": "2017-12-04T11:12:00.000Z",
                "amount": 150
            }

            chai.request(server)
                .post('/v1/payments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {                    
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Payment updated successfully' ]);                   
                    done();
                });
        });
    });
});