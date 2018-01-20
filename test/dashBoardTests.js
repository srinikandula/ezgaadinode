//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var TrucksColl = require('./../server/models/schemas').TrucksColl;
var User = require('./../server/models/schemas').AccountsColl;
var DriversColl = require('./../server/models/schemas').DriversColl;
var PartyCollection = require('./../server/models/schemas').PartyCollection;
var TripCollection = require('./../server/models/schemas').TripCollection;
var expenseMasterColl = require('./../server/models/schemas').expenseMasterColl;
var ExpenseCostColl = require('./../server/models/schemas').ExpenseCostColl;
var paymentsReceivedColl = require('./../server/models/schemas').paymentsReceivedColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let accountId = null;
let truckId = null;
let driverId = null;
let partyId = null;
let tripId = null;
let expensemasterId = null;
let expenseId = null;
let paymentId = null;
let fitnessExpiry = null;
let permitExpiry = null;
let insuranceExpiry = null;
let pollutionExpiry = null;
let taxDueDate = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "account"
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('DashboardTest', () => {

    /*
    * Test the /GET route Getting Dashboard Information
    */
    describe('/GET Dashboard', () => {
        User.remove({},function (err, result){
        })
        userData.save(function (err, account) {

        });

        it('Retrieving Login Information', (done) => {
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
                    headerData = {"token": token};
                    accountId = res.body._id;
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving empty Dashboard Information Success
        */
        it('Retrieving empty Dashboard Information', (done) => {
            TrucksColl.remove({}, function (error, result) {
                TripCollection.remove({}, function (error, result) {
                    ExpenseCostColl.remove({}, function (error, result) {
                        paymentsReceivedColl.remove({}, function (error, result) {
                            chai.request(server)
                                .get('/v1/admin/erpDashboard')
                                .set(headerData)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.result.should.be.a('object');
                                    res.body.result.should.have.property('expensesTotal').eql(0);
                                    res.body.result.should.have.property('totalRevenue').eql(0);
                                    res.body.result.should.have.property('paybleAmount').eql(0);
                                    res.body.result.should.have.property('pendingDue').eql(0);
                                    res.body.result.expiring.should.have.property('pollutionExpiryCount').eql(0);
                                    res.body.result.expiring.should.have.property('insuranceExpiryCount').eql(0);
                                    res.body.result.expiring.should.have.property('taxExpiryCount').eql(0);
                                    res.body.result.expiring.should.have.property('fitnessExpiryCount').eql(0);
                                    res.body.result.expiring.should.have.property('permitExpiryCount').eql(0);
                                    done();
                                });
                        });
                    });
                });
            });
        });
        /*
        * Test the /Get route Retrieving Empty Revenue Information Success
        */
        it('Retrieving Empty Revenue Information', (done) => {
            chai.request(server)
                .get('/v1/trips/find/revenueByVehicle?fromDate=&page=1&regNumber=&size=10&sort={"createdAt":-1}&toDate=')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expect(res.body.revenue).to.be.a('array');
                    res.body.grossAmounts.should.have.property('grossFreight').eql(0);
                    res.body.grossAmounts.should.have.property('grossExpenses').eql(0);
                    res.body.grossAmounts.should.have.property('grossRevenue').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving Empty Expense Information Success
        */
        it('Retrieving Empty Expense Information', (done) => {
            chai.request(server)
                .get('/v1/expense/groupByVehicle?fromDate=&page=1&regNumber=&size=10&sort={"createdAt":-1}&toDate=')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([]);
                    expect(res.body.expenses).to.be.a('array');
                    res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totaltollExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving Empty Payments Payable Information Success
        */
        it('Retrieving Empty Payments Payable Information', (done) => {
            chai.request(server)
                .get('/v1/expense/getPaybleAmountByParty?fromDate=&page=1&partyId=&size=10&sort={"createdAt":-1}&toDate=')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['No Expense found']);
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving Empty Payments Receivable Information Success
        */
        it('Retrieving Empty Payments Receivable Information', (done) => {
            chai.request(server)
                .get('/v1/payments/getDuesByParty/?fromDate=&partyId=&toDate=&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expect(res.body.parties).to.be.a('array');
                    res.body.grossAmounts.should.have.property('grossFreight').eql(0);
                    res.body.grossAmounts.should.have.property('grossExpenses').eql(0);
                    res.body.grossAmounts.should.have.property('grossDue').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving Empty Expiry Trucks Information Success
        */
        it('Retrieving Empty Expiry Trucks Information', (done) => {
            chai.request(server)
                .get('/v1/trucks/findExpiryTrucks?page=1&regNumber=&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expect(res.body.expiryTrucks).to.be.a('array');
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving Total Revenue by adding Trip to a vehicle Information Success
        */
        it('Retrieving Total Revenue by adding Trip to a vehicle Information', (done) => {
            /*
            * Before Adding Trip to Vehicle need to add Truck Information to schema
            */
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            /*
            * Before Adding Trip to Vehicle need to add driver Information to schema
            */
            let driverData = {
                "fullName": "Driver1",
                "mobile": 9999999999,
            };
            /*
            * Before Adding Trip to Vehicle need to add party Information to schema
            */
            let partyData = {
                "name": "Party2",
                "contact": 9999999999,
                "email": "party2@gmail.com",
                "city": "WRL",
                "partyType": "Transporter",
                "isSms": true,
                "isEmail": true,
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ]
            };

            async.parallel({
                truckId: function (truckCallback) {
                    TrucksColl.remove({}, function (error, result) {
                        chai.request(server)
                            .post('/v1/trucks')
                            .send(truckData)
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                                res.body.should.have.property('truck');
                                res.body.truck.should.have.property('registrationNo');
                                res.body.truck.should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.truck.should.have.property('truckType').eql('20 Tyre');
                                truckId = res.body.truck._id;
                                truckCallback(error, truckId);
                            });
                    });
                },

                driverId: function (driverCallback) {
                    DriversColl.remove({}, function (error, result) {
                        chai.request(server)
                            .post('/v1/drivers')
                            .send(driverData)
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('driver');
                                res.body.driver.should.have.property('fullName');
                                res.body.driver.should.have.property('fullName').eql('Driver1');
                                res.body.driver.should.have.property('mobile');
                                res.body.driver.should.have.property('mobile').eql(9999999999);
                                driverId = res.body.driver._id;
                                driverCallback(error, driverId);
                            });
                    });
                },

                partyId: function (partyCallback) {
                    PartyCollection.remove({}, function (error, result) {
                        chai.request(server)
                            .post('/v1/party/addParty')
                            .send(partyData)
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('message').eql(['Party Added Successfully']);
                                res.body.should.have.property('party');
                                res.body.party.should.have.property('name');
                                res.body.party.should.have.property('name').eql('Party2');
                                res.body.party.should.have.property('contact');
                                res.body.party.should.have.property('contact').eql(9999999999);
                                partyId = res.body.party._id;
                                partyCallback(error, partyId);
                            });
                    });
                }
            }, function (err, results) {
                /*
                * Adding Trip Information to schema
                */
                let tripData = {
                    "date": new Date(),
                    "registrationNo": truckId,
                    "driverId": driverId,
                    "partyId": partyId,
                    "tripLane": "WRL-HYD",
                    "tonnage": 30,
                    "rate": 50,
                    "freightAmount": 1500
                };
                TripCollection.remove({}, function (error, result) {
                    chai.request(server)
                        .post('/v1/trips/addTrip')
                        .set(headerData)
                        .send(tripData)
                        .end((err, res) => {
                            expect(err).to.be.null;
                            res.body.should.have.property('messages').eql(['Trip Added Successfully']);
                            chai.request(server)
                                .get('/v1/trips/find/revenueByVehicle?fromDate=&page=1&regNumber=&size=10&sort={"createdAt":-1}&toDate=')
                                .set(headerData)
                                .end((err, res) => {
                                    expect(err).to.be.null;
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('messages').eql(['Success']);
                                    res.body.should.have.property('revenue');
                                    expect(res.body.revenue).to.be.a('array');
                                    expect(res.body.revenue).to.be.length(1);
                                    res.body.revenue[0].should.have.property('attrs');
                                    res.body.revenue[0].attrs.should.have.property('truckName');
                                    res.body.revenue[0].attrs.should.have.property('truckName').eql('AP36AA9876');
                                    res.body.revenue[0].should.have.property('totalFreight');
                                    res.body.revenue[0].should.have.property('totalFreight').eql(1500);
                                    res.body.revenue[0].should.have.property('totalExpense');
                                    res.body.revenue[0].should.have.property('totalExpense').eql(0);
                                    res.body.revenue[0].should.have.property('totalRevenue');
                                    res.body.revenue[0].should.have.property('totalRevenue').eql(1500);
                                    done();
                                });
                        });
                });
            });
        });
        /*
        * Test the /Get route Total Revenue by Vehicle Using Date Filter Information Success
        */
        it('Retrieving Total Revenue by Vehicle Using Date Filter Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var regNumber = "";
            chai.request(server)
                .get('/v1/trips/find/revenueByVehicle?fromDate=' + fromDate + '&page=1&regNumber=' + regNumber + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('revenue');
                    expect(res.body.revenue).to.be.a('array');
                    expect(res.body.revenue).to.be.length(1);
                    res.body.revenue[0].should.have.property('attrs');
                    res.body.revenue[0].attrs.should.have.property('truckName');
                    res.body.revenue[0].attrs.should.have.property('truckName').eql('AP36AA9876');
                    res.body.revenue[0].should.have.property('totalFreight');
                    res.body.revenue[0].should.have.property('totalFreight').eql(1500);
                    res.body.revenue[0].should.have.property('totalExpense');
                    res.body.revenue[0].should.have.property('totalExpense').eql(0);
                    res.body.revenue[0].should.have.property('totalRevenue');
                    res.body.revenue[0].should.have.property('totalRevenue').eql(1500);
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Vehicle Using Vehicle Filter Information Success
        */
        it('Retrieving Total Revenue by Vehicle Using Vehicle Filter Information', (done) => {
            var fromDate = "";
            var toDate = ""
            var regNumber = truckId;
            chai.request(server)
                .get('/v1/trips/find/revenueByVehicle?fromDate=' + fromDate + '&page=1&regNumber=' + regNumber + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('revenue');
                    expect(res.body.revenue).to.be.a('array');
                    expect(res.body.revenue).to.be.length(1);
                    res.body.revenue[0].should.have.property('attrs');
                    res.body.revenue[0].attrs.should.have.property('truckName');
                    res.body.revenue[0].attrs.should.have.property('truckName').eql('AP36AA9876');
                    res.body.revenue[0].should.have.property('totalFreight');
                    res.body.revenue[0].should.have.property('totalFreight').eql(1500);
                    res.body.revenue[0].should.have.property('totalExpense');
                    res.body.revenue[0].should.have.property('totalExpense').eql(0);
                    res.body.revenue[0].should.have.property('totalRevenue');
                    res.body.revenue[0].should.have.property('totalRevenue').eql(1500);
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Vehicle Using Date and Vehicle Filter Information Success
        */
        it('Retrieving Total Revenue by Vehicle Using Date and Vehicle Filter Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var regNumber = truckId;
            chai.request(server)
                .get('/v1/trips/find/revenueByVehicle?fromDate=' + fromDate + '&page=1&regNumber=' + regNumber + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('revenue');
                    expect(res.body.revenue).to.be.a('array');
                    expect(res.body.revenue).to.be.length(1);
                    res.body.revenue[0].should.have.property('attrs');
                    res.body.revenue[0].attrs.should.have.property('truckName');
                    res.body.revenue[0].attrs.should.have.property('truckName').eql('AP36AA9876');
                    res.body.revenue[0].should.have.property('totalFreight');
                    res.body.revenue[0].should.have.property('totalFreight').eql(1500);
                    res.body.revenue[0].should.have.property('totalExpense');
                    res.body.revenue[0].should.have.property('totalExpense').eql(0);
                    res.body.revenue[0].should.have.property('totalRevenue');
                    res.body.revenue[0].should.have.property('totalRevenue').eql(1500);
                    done();
                });
        });
        /*
        * Test the /Get route Sending Total Revenue Details using Email Information Success
        */
        it('Sending Total Revenue Details using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/trips/shareRevenueDetailsByVechicleViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Revenue details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Revenue Details without Email Information Success
        */
        it('Sending Total Revenue Details without Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = "";
            var email = "";
            chai.request(server)
                .get('/v1/trips/shareRevenueDetailsByVechicleViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter valid email']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Revenue Details With Date Filter using Email Information Success
        */
        it('Sending Total Revenue Details With Date Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var regNumber = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/trips/shareRevenueDetailsByVechicleViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Revenue details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Revenue Details With Vehicle Filter using Email Information Success
        */
        it('Sending Total Revenue Details With Vehicle Filter using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = truckId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/trips/shareRevenueDetailsByVechicleViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Revenue details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Revenue Details With Date and Vehicle Filter using Email Information Success
        */
        it('Sending Total Revenue Details With Date and Vehicle Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var regNumber = truckId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/trips/shareRevenueDetailsByVechicleViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Revenue details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Total Revenue by Individual Vehicle Information Success
        */
        it('Retrieving Total Revenue by Individual Vehicle Information', (done) => {
            chai.request(server)
                .get('/v1/party/vehiclePayments/' + truckId)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trips[0].should.have.property('registrationNo');
                    res.body.trips[0].should.have.property('registrationNo').eql(truckId);
                    res.body.should.have.property('totalRevenue');
                    res.body.totalRevenue.should.have.property('totalFreight').eql(1500);
                    res.body.totalRevenue.should.have.property('totalExpenses').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Total Expenses by adding expense and expense master as other Information Success
        */
        it('Retrieving Total Expenses by adding expense and expense master as other', (done) => {

            /*
            * Test the /POST route Adding Expense based on expense master as other Information Success
            */
            ExpenseCostColl.remove({}, function (error, result) {
                expenseMasterColl.remove({}, function (error, result) {
                let expenseData = {
                    "vehicleNumber": truckId,
                    "expenseType": "others",
                    "expenseName": "Toll",
                    "date": new Date(),
                    "paidAmount": 0,
                    "totalAmount": 0,
                    "cost": 100,
                    "mode": "Cash"
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
                        chai.request(server)
                            .get('/v1/expense/groupByVehicle?fromDate=&regNumber=&toDate=&page=1&size=10&sort={"createdAt":-1}')
                            .set(headerData)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('expenses');
                                expect(res.body.expenses).to.be.a('array');
                                expect(res.body.expenses).to.be.length(1);
                                res.body.expenses[0].should.have.property('exps');
                                expect(res.body.expenses[0].exps).to.be.a('array');
                                expect(res.body.expenses[0].exps).to.be.length(1);
                                res.body.expenses[0].exps[0].should.have.property('dieselExpense').eql(0);
                                res.body.expenses[0].exps[0].should.have.property('tollExpense').eql(100);
                                res.body.expenses[0].exps[0].should.have.property('mExpense').eql(0);
                                res.body.expenses[0].exps[0].should.have.property('misc').eql(0);
                                res.body.should.have.property('totalExpenses');
                                res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                                res.body.totalExpenses.should.have.property('totaltollExpense').eql(100);
                                res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                                res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                                done();
                            });
                    });
            });
            });
        });
        /*
        * Test the /Get route Total Expenses by adding expense and expense master Information Success
        */
        it('Retrieving Total Expenses by adding expense and expense master Information', (done) => {

            /*
            * Test the /POST route Adding Expense based on expense master Information Success
            */
            chai.request(server)
                .get('/v1/expenseMaster')
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expensemasterId = res.body.expenses[0]._id;
                    ExpenseCostColl.remove({}, function (error, result) {
                        let expenseData = {
                            "vehicleNumber": truckId,
                            "expenseType": expensemasterId,
                            "date": new Date(),
                            "paidAmount": 0,
                            "totalAmount": 0,
                            "cost": 100,
                            "mode": "Cash"
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
                                chai.request(server)
                                    .get('/v1/expense/groupByVehicle?fromDate=&page=1&regNumber=&size=10&sort={"createdAt":-1}&toDate=')
                                    .set(headerData)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.a('object');
                                        res.body.should.have.property('expenses');
                                        expect(res.body.expenses).to.be.a('array');
                                        expect(res.body.expenses).to.be.length(1);
                                        res.body.expenses[0].should.have.property('exps');
                                        expect(res.body.expenses[0].exps).to.be.a('array');
                                        expect(res.body.expenses[0].exps).to.be.length(1);
                                        res.body.expenses[0].exps[0].should.have.property('dieselExpense').eql(0);
                                        res.body.expenses[0].exps[0].should.have.property('tollExpense').eql(100);
                                        res.body.expenses[0].exps[0].should.have.property('mExpense').eql(0);
                                        res.body.expenses[0].exps[0].should.have.property('misc').eql(0);
                                        res.body.should.have.property('totalExpenses');
                                        res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                                        res.body.totalExpenses.should.have.property('totaltollExpense').eql(100);
                                        res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                                        res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                                        done();
                                    });
                            });
                    });
                });
        });
        /*
        * Test the /Get route Total Expenses Using Date Filter Information Success
        */
        it('Retrieving Total Expenses Using Date Filter Information', (done) => {
            var fromDate = new Date();
            var toDate = new Date();
            var regNumber = "";
            chai.request(server)
                .get('/v1/expense/groupByVehicle?fromDate=' + fromDate + '&page=1&regNumber=' + regNumber + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('expenses');
                    expect(res.body.expenses).to.be.a('array');
                    expect(res.body.expenses).to.be.length(0);
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totaltollExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Total Expenses Using Vehicle Filter Information Success
        */
        it('Retrieving Total Expenses Using Vehicle Filter Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = truckId;
            chai.request(server)
                .get('/v1/expense/groupByVehicle?fromDate=' + fromDate + '&page=1&regNumber=' + regNumber + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('expenses');
                    expect(res.body.expenses).to.be.a('array');
                    expect(res.body.expenses).to.be.length(0);
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totaltollExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Total Expenses Using Date and Vehicle Filter Information Success
        */
        it('Retrieving Total Expenses Using Date and Vehicle Filter Information', (done) => {
            var fromDate = new Date();
            var toDate = new Date();
            var regNumber = truckId;
            chai.request(server)
                .get('/v1/expense/groupByVehicle?fromDate=' + fromDate + '&page=1&regNumber=' + regNumber + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('expenses');
                    expect(res.body.expenses).to.be.a('array');
                    expect(res.body.expenses).to.be.length(0);
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totaltollExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Sending Total Expenses Details using Email Information Success
        */
        it('Sending Total Expenses Details using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/shareExpensesDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expenses details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Expenses Details without Email Information Success
        */
        it('Sending Total Expenses Details without Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = "";
            var email = "";
            chai.request(server)
                .get('/v1/expense/shareExpensesDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter valid email']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Expenses Details With Date Filter using Email Information Success
        */
        it('Sending Total Expenses Details With Date Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var regNumber = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/shareExpensesDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expenses details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Expenses Details With Vehicle Filter using Email Information Success
        */
        it('Sending Total Expenses Details With Vehicle Filter using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = truckId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/shareExpensesDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expenses details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Expenses Details With Date and Vehicle Filter using Email Information Success
        */
        it('Sending Total Expenses Details With Date and Vehicle Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var regNumber = truckId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/shareExpensesDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&regNumber=' + regNumber + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expenses details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Total Expenses by Individual Vehicle Information Success
        */
        it('Retrieving Total Expenses by Individual Vehicle Information', (done) => {
            chai.request(server)
                .get('/v1/expense/vehicleExpense/' + truckId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.expenses).to.be.a('array');
                    expect(res.body.expenses).to.be.length(1);
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totaltollExpense').eql(100);
                    res.body.totalExpenses.should.have.property('totalmExpense').eql(0);
                    res.body.totalExpenses.should.have.property('totalmisc').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Total Payments Payable by adding expense as credit and expense master as other Information Success
        */
        it('Retrieving Total Payments Payable by adding expense as credit and expense master as other', (done) => {

            /*
            * Test the /POST route Adding Expense based on expense master as other Information Success
            */
            ExpenseCostColl.remove({}, function (error, result) {
                expenseMasterColl.remove({}, function (error, result) {
                    let expenseData = {
                        "vehicleNumber": truckId,
                        "expenseType": "others",
                        "expenseName": "Toll",
                        "date": new Date(),
                        "paidAmount": 0,
                        "totalAmount": 100,
                        "mode": "Credit",
                        "partyId": partyId,
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
                            chai.request(server)
                                .get('/v1/expense/getPaybleAmountByParty?fromDate=&page=1&partyId=&size=10&sort={"createdAt":-1}&toDate=')
                                .set(headerData)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('messages').eql(['Success']);
                                    res.body.should.have.property('paybleAmounts');
                                    expect(res.body.paybleAmounts).to.be.a('array');
                                    expect(res.body.paybleAmounts).to.be.length(1);
                                    res.body.paybleAmounts[0]._id.should.have.property('name').eql('Party2');
                                    res.body.paybleAmounts[0]._id.should.have.property('contact').eql(9999999999);
                                    res.body.paybleAmounts[0].should.have.property('totalAmount').eql(100);
                                    res.body.paybleAmounts[0].should.have.property('paidAmount').eql(0);
                                    res.body.paybleAmounts[0].should.have.property('payableAmount').eql(100);
                                    res.body.should.have.property('gross');
                                    res.body.gross.should.have.property('totalAmount').eql(100);
                                    res.body.gross.should.have.property('paidAmount').eql(0);
                                    res.body.gross.should.have.property('payableAmount').eql(100);
                                    done();
                                });
                        });
                });
            });
        });
        /*
        * Test the /Get route Total Payments Payable by adding expense as credit and expense master Information Success
        */
        it('Retrieving Total Payments Payable by adding expense as credit and expense master Information', (done) => {

            /*
            * Test the /POST route Adding Expense based on expense master Information Success
            */
            chai.request(server)
                .get('/v1/expenseMaster')
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expensemasterId = res.body.expenses[0]._id;
                    ExpenseCostColl.remove({}, function (error, result) {
                        let expenseData = {
                            "vehicleNumber": truckId,
                            "expenseType": expensemasterId,
                            "date": new Date(),
                            "paidAmount": 0,
                            "totalAmount": 100,
                            "mode": "Credit",
                            "partyId":partyId,
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
                                chai.request(server)
                                    .get('/v1/expense/getPaybleAmountByParty?fromDate=&page=1&partyId=&size=10&sort={"createdAt":-1}&toDate=')
                                    .set(headerData)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.a('object');
                                        res.body.should.have.property('messages').eql(['Success']);
                                        res.body.should.have.property('paybleAmounts');
                                        expect(res.body.paybleAmounts).to.be.a('array');
                                        expect(res.body.paybleAmounts).to.be.length(1);
                                        res.body.paybleAmounts[0]._id.should.have.property('name').eql('Party2');
                                        res.body.paybleAmounts[0]._id.should.have.property('contact').eql(9999999999);
                                        res.body.paybleAmounts[0].should.have.property('totalAmount').eql(100);
                                        res.body.paybleAmounts[0].should.have.property('paidAmount').eql(0);
                                        res.body.paybleAmounts[0].should.have.property('payableAmount').eql(100);
                                        res.body.should.have.property('gross');
                                        res.body.gross.should.have.property('totalAmount').eql(100);
                                        res.body.gross.should.have.property('paidAmount').eql(0);
                                        res.body.gross.should.have.property('payableAmount').eql(100);
                                        done();
                                    });
                            });
                    });
                });
        });
        /*
        * Test the /Get route Total Payments Payable Using Date Filter Information Success
        */
        it('Retrieving Total Payments Payable Using Date Filter Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId1 = "";
            chai.request(server)
                .get('/v1/expense/getPaybleAmountByParty?fromDate=' + fromDate +'&page=1&partyId=' + partyId1 + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('paybleAmounts');
                    expect(res.body.paybleAmounts).to.be.a('array');
                    expect(res.body.paybleAmounts).to.be.length(1);
                    res.body.paybleAmounts[0]._id.should.have.property('name').eql('Party2');
                    res.body.paybleAmounts[0]._id.should.have.property('contact').eql(9999999999);
                    res.body.paybleAmounts[0].should.have.property('totalAmount').eql(100);
                    res.body.paybleAmounts[0].should.have.property('paidAmount').eql(0);
                    res.body.paybleAmounts[0].should.have.property('payableAmount').eql(100);
                    res.body.should.have.property('gross');
                    res.body.gross.should.have.property('totalAmount').eql(100);
                    res.body.gross.should.have.property('paidAmount').eql(0);
                    res.body.gross.should.have.property('payableAmount').eql(100);
                    done();
                });
        });
        /*
        * Test the /Get route Total Payments Payable Using Party Filter Information Success
        */
        it('Retrieving Total Payments Payable Using Party Filter Information', (done) => {
            var fromDate = "";
            var toDate = ""
            var partyId1 = partyId;
            chai.request(server)
                .get('/v1/expense/getPaybleAmountByParty?fromDate=' + fromDate +'&page=1&partyId=' + partyId1 + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('paybleAmounts');
                    expect(res.body.paybleAmounts).to.be.a('array');
                    expect(res.body.paybleAmounts).to.be.length(1);
                    res.body.paybleAmounts[0]._id.should.have.property('name').eql('Party2');
                    res.body.paybleAmounts[0]._id.should.have.property('contact').eql(9999999999);
                    res.body.paybleAmounts[0].should.have.property('totalAmount').eql(100);
                    res.body.paybleAmounts[0].should.have.property('paidAmount').eql(0);
                    res.body.paybleAmounts[0].should.have.property('payableAmount').eql(100);
                    res.body.should.have.property('gross');
                    res.body.gross.should.have.property('totalAmount').eql(100);
                    res.body.gross.should.have.property('paidAmount').eql(0);
                    res.body.gross.should.have.property('payableAmount').eql(100);
                    done();
                });
        });
        /*
        * Test the /Get route Total Payments Payable Using Date and Party Filter Information Success
        */
        it('Retrieving Total Payments Payable Using Date and Party Filter Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId1 = partyId;
            chai.request(server)
                .get('/v1/expense/getPaybleAmountByParty?fromDate=' + fromDate +'&page=1&partyId=' + partyId1 + '&size=10&sort={"createdAt":-1}&toDate=' + toDate)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('paybleAmounts');
                    expect(res.body.paybleAmounts).to.be.a('array');
                    expect(res.body.paybleAmounts).to.be.length(1);
                    res.body.paybleAmounts[0]._id.should.have.property('name').eql('Party2');
                    res.body.paybleAmounts[0]._id.should.have.property('contact').eql(9999999999);
                    res.body.paybleAmounts[0].should.have.property('totalAmount').eql(100);
                    res.body.paybleAmounts[0].should.have.property('paidAmount').eql(0);
                    res.body.paybleAmounts[0].should.have.property('payableAmount').eql(100);
                    res.body.should.have.property('gross');
                    res.body.gross.should.have.property('totalAmount').eql(100);
                    res.body.gross.should.have.property('paidAmount').eql(0);
                    res.body.gross.should.have.property('payableAmount').eql(100);
                    done();
                });
        });
        /*
        * Test the /Get route Sending Total Payments Payable Details using Email Information Success
        */
        it('Sending Total Payments Payable Details using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var partyId2 = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/sharePayableDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId2 + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payable details shared successfully']);
                    done();
                });
        }).timeout(10000);
        /*
        * Test the /Get route Sending Total Payments Payable Details without Email Information Success
        */
        it('Sending Total Payments Payable Details without Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var partyId2 = "";
            var email = "";
            chai.request(server)
                .get('/v1/expense/sharePayableDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId2 + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter valid email']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Payable Details With Date Filter using Email Information Success
        */
        it('Sending Total Payments Payable Details With Date Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId2 = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/sharePayableDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId2 + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payable details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Payable Details With Party Filter using Email Information Success
        */
        it('Sending Total Payments Payable Details With Party Filter using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var partyId2 = partyId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/sharePayableDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId2 + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payable details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Payable Details With Date and Party Filter using Email Information Success
        */
        it('Sending Total Payments Payable Details With Date and Party Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId2 = partyId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/expense/sharePayableDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId2 + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payable details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Total Payment Payable by Individual Party Information Success
        */
        it('Retrieving Total Payment Payable by Individual Party Information', (done) => {
            chai.request(server)
                .get('/v1/expense/getPaybleAmountByPartyId?partyId=' + partyId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql(['success']);
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('totalAmount').eql(100);
                    res.body.grossAmounts.should.have.property('paidAmount').eql(0);
                    res.body.grossAmounts.should.have.property('payableAmount').eql(100);
                    res.body.should.have.property('partyData');
                    expect(res.body.partyData).to.be.a('array');
                    res.body.partyData[0].expenseType.should.have.property('expenseName').eql('Toll');
                    done();
                });
        });
        /*
        * Test the /Get route Empty Total Payment Payable by party Information Success
        */
        it('Retrieving Empty Total Payment Payable by Party Information', (done) => {
            chai.request(server)
                .get('/v1/payments/getDuesByParty?fromDate=&toDate=&partyId=&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('parties');
                    expect(res.body.parties).to.be.a('array');
                    expect(res.body.parties).to.be.length(1);
                    res.body.parties[0].should.have.property('totalPayment').eql(0);
                    res.body.parties[0].should.have.property('totalFright').eql(1500);
                    res.body.parties[0].should.have.property('totalDue').eql(1500);
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight').eql(1500);
                    res.body.grossAmounts.should.have.property('grossExpenses').eql(0);
                    res.body.grossAmounts.should.have.property('grossDue').eql(1500);
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment Receivable by adding payment as NEFT Information Success
        */
        it('Retrieving Total Payment Receivable by adding payment as NEFT Information', (done) => {
            let paymentData = {
                "partyId": partyId,
                "date": new Date(),
                "amount": 1200,
                "paymentType": "NEFT",
                "paymentRefNo": "ghngn546454gd",
            };
            /*
            * Test the /POST route Adding Payment Information Success
            */
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
                    chai.request(server)
                        .get('/v1/payments/getDuesByParty?fromDate=&toDate=&partyId=&page=1&size=10&sort={"createdAt":-1}')
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            res.body.should.have.property('parties');
                            expect(res.body.parties).to.be.a('array');
                            expect(res.body.parties).to.be.length(1);
                            res.body.parties[0].should.have.property('totalPayment').eql(1200);
                            res.body.parties[0].should.have.property('totalFright').eql(1500);
                            res.body.parties[0].should.have.property('totalDue').eql(300);
                            res.body.should.have.property('grossAmounts');
                            res.body.grossAmounts.should.have.property('grossFreight').eql(1500);
                            res.body.grossAmounts.should.have.property('grossExpenses').eql(1200);
                            res.body.grossAmounts.should.have.property('grossDue').eql(300);
                            done();
                        });
                });
        });
        /*
       * Test the /Get route Total Payment Receivable by adding payment as CASH Information Success
       */
        it('Retrieving Total Payment Receivable by adding payment as CASH Information', (done) => {
            let paymentData = {
                "partyId": partyId,
                "date": new Date(),
                "amount": 1200,
                "paymentType": "CASH"
            };
            /*
            * Test the /POST route Adding Payment Information Success
            */
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
                    chai.request(server)
                        .get('/v1/payments/getDuesByParty?fromDate=&toDate=&partyId=&page=1&size=10&sort={"createdAt":-1}')
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            res.body.should.have.property('parties');
                            expect(res.body.parties).to.be.a('array');
                            expect(res.body.parties).to.be.length(1);
                            res.body.parties[0].should.have.property('totalPayment').eql(2400);
                            res.body.parties[0].should.have.property('totalFright').eql(1500);
                            res.body.parties[0].should.have.property('totalDue').eql(-900);
                            res.body.should.have.property('grossAmounts');
                            res.body.grossAmounts.should.have.property('grossFreight').eql(1500);
                            res.body.grossAmounts.should.have.property('grossExpenses').eql(2400);
                            res.body.grossAmounts.should.have.property('grossDue').eql(-900);
                            done();
                        });
                });
        });
        /*
        * Test the /Get route Total Payments Receivable Using Date Filter Information Success
        */
        it('Retrieving Total Payments by Vehicle Using Date Filter Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId1 = "";
            chai.request(server)
                .get('/v1/payments/getDuesByParty?fromDate=' + fromDate + '&toDate=' + toDate + '&partyId=' + partyId1 + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                console.log('drfhfgjhfj',res.body)
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('parties');
                    expect(res.body.parties).to.be.a('array');
                    expect(res.body.parties).to.be.length(1);
                    res.body.parties[0].should.have.property('totalPayment').eql(2400);
                    res.body.parties[0].should.have.property('totalFright').eql(1500);
                    res.body.parties[0].should.have.property('totalDue').eql(-900);
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight').eql(1500);
                    res.body.grossAmounts.should.have.property('grossExpenses').eql(2400);
                    res.body.grossAmounts.should.have.property('grossDue').eql(-900);
                    done();
                });
        });
        /*
        * Test the /Get route Total Payments Receivable Using Party Filter Information Success
        */
        it('Retrieving Total Payments Receivable Using Party Filter Information', (done) => {
            var fromDate = "";
            var toDate = ""
            var partyId1 = partyId;
            chai.request(server)
                .get('/v1/payments/getDuesByParty?fromDate=' + fromDate + '&toDate=' + toDate + '&partyId=' + partyId1 + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('parties');
                    expect(res.body.parties).to.be.a('array');
                    expect(res.body.parties).to.be.length(1);
                    res.body.parties[0].should.have.property('totalPayment').eql(2400);
                    res.body.parties[0].should.have.property('totalFright').eql(1500);
                    res.body.parties[0].should.have.property('totalDue').eql(-900);
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight').eql(1500);
                    res.body.grossAmounts.should.have.property('grossExpenses').eql(2400);
                    res.body.grossAmounts.should.have.property('grossDue').eql(-900);
                    done();
                });
        });
        /*
        * Test the /Get route Total Payments Receivable Using Date and Party Filter Information Success
        */
        it('Retrieving Total Payments Receivable Using Date and Party Filter Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId1 = partyId;
            chai.request(server)
                .get('/v1/payments/getDuesByParty?fromDate=' + fromDate + '&toDate=' + toDate + '&partyId=' + partyId1 + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('parties');
                    expect(res.body.parties).to.be.a('array');
                    expect(res.body.parties).to.be.length(1);
                    res.body.parties[0].should.have.property('totalPayment').eql(2400);
                    res.body.parties[0].should.have.property('totalFright').eql(1500);
                    res.body.parties[0].should.have.property('totalDue').eql(-900);
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight').eql(1500);
                    res.body.grossAmounts.should.have.property('grossExpenses').eql(2400);
                    res.body.grossAmounts.should.have.property('grossDue').eql(-900);
                    done();
                });
        });
        /*
        * Test the /Get route Sending Total Payments Receivable Details using Email Information Success
        */
        it('Sending Total Payments Receivable Details using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var partyId = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/payments/sharePaymentsDetailsByPartyViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payments details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Receivable Details without Email Information Success
        */
        it('Sending Total Payments Receivable Details without Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var partyId = "";
            var email = "";
            chai.request(server)
                .get('/v1/payments/sharePaymentsDetailsByPartyViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter valid email']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Receivable Details With Date Filter using Email Information Success
        */
        it('Sending Total Payments Receivable Details With Date Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var partyId = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/payments/sharePaymentsDetailsByPartyViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payments details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Receivable Details With Party Filter using Email Information Success
        */
        it('Sending Total Payments Receivable Details With Party Filter using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/payments/sharePaymentsDetailsByPartyViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payments details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Payments Receivable Details With Date and Party Filter using Email Information Success
        */
        it('Sending Total Payments Receivable Details With Date and Party Filter using Email Information', (done) => {
            var fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
            var toDate = new Date();
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/payments/sharePaymentsDetailsByPartyViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payments details share successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Total Payment Receivable by Individual Party Information Success
        */
        it('Retrieving Total Payment Receivable by Individual Party Information', (done) => {
            chai.request(server)
                .get('/v1/party/tripsPayments/' + partyId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('results');
                    expect(res.body.results).to.be.a('array');
                    //will get expense and payment data
                    expect(res.body.results).to.be.length(3);
                    res.body.results[0].should.have.property('partyId').eql(partyId);
                    res.body.should.have.property('totalPendingPayments');
                    res.body.totalPendingPayments.should.have.property('totalFreight').eql(1500);
                    res.body.totalPendingPayments.should.have.property('totalPaid').eql(2400);
                    done();
                });
        });
        /*
        * Test the /Get route Retrieving Total Expiry by adding Truck Information Success
        */
        it('Retrieving Total Expiry by adding Truck Information', (done) => {
            /*
            * Before Adding Trip to Vehicle need to add Truck Information to schema
            */
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(new Date().setDate(new Date().getDate() + 16)),
                "permitExpiry": new Date(new Date().setDate(new Date().getDate() + 16)),
                "insuranceExpiry": new Date(new Date().setDate(new Date().getDate() + 16)),
                "pollutionExpiry": new Date(new Date().setDate(new Date().getDate() + 16)),
                "taxDueDate": new Date(new Date().setDate(new Date().getDate() + 16))
            };

            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .send(truckData)
                    .set(headerData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        truckId = res.body.truck._id;
                        fitnessExpiry = res.body.truck.fitnessExpiry;
                        permitExpiry = res.body.truck.permitExpiry;
                        insuranceExpiry = res.body.truck.insuranceExpiry;
                        pollutionExpiry = res.body.truck.pollutionExpiry;
                        taxDueDate = res.body.truck.taxDueDate;
                        chai.request(server)
                            .get('/v1/trucks/findExpiryTrucks?page=1&regNumber=' + truckId + '&size=10&sort={"createdAt":-1}')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('expiryTrucks');
                                expect(res.body.expiryTrucks).to.be.a('array');
                                res.body.expiryTrucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.expiryTrucks[0].should.have.property('fitnessExpiry').eql(fitnessExpiry);
                                res.body.expiryTrucks[0].should.have.property('permitExpiry').eql(permitExpiry);
                                res.body.expiryTrucks[0].should.have.property('insuranceExpiry').eql(insuranceExpiry);
                                res.body.expiryTrucks[0].should.have.property('pollutionExpiry').eql(pollutionExpiry);
                                res.body.expiryTrucks[0].should.have.property('taxDueDate').eql(taxDueDate);
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Retrieving Expiry Trucks Information Success
        */
        it('Retrieving Expiry Trucks Information', (done) => {
            chai.request(server)
                .get('/v1/trucks/findExpiryTrucks?page=1&regNumber=&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expect(res.body.expiryTrucks).to.be.a('array');
                    done();
                });
        });
        /*
        * Test the /Get route Sending Total Expiry Details using Email Information Success
        */
        it('Sending Total Expiry Details using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = "";
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/trucks/shareExpiredDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expiry details shared successfully']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Expiry Details without Email Information Success
        */
        it('Sending Total Expiry Details without Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = "";
            var email = "";
            chai.request(server)
                .get('/v1/trucks/shareExpiredDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter valid email']);
                    done();
                });
        }).timeout(5000);
        /*
        * Test the /Get route Sending Total Expiry Details With Vehicle Filter using Email Information Success
        */
        it('Sending Total Expiry Details With Vehicle Filter using Email Information', (done) => {
            var fromDate = "";
            var toDate = "";
            var regNumber = truckId;
            var email = "naresh.d@mtwlabs.com";
            chai.request(server)
                .get('/v1/trucks/shareExpiredDetailsViaEmail?email=' + email + '&fromDate=' + fromDate + '&partyId=' + partyId + '&toDate=' + toDate + '&page=1&size=10&sort={"createdAt":-1}')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expiry details shared successfully']);
                    done();
                });
        }).timeout(5000);
    });

});

