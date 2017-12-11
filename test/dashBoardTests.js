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

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let truckId = null;
let driverId = null;
let partyId = null;
let tripId = null;
let expensemasterId = null;
let expenseId = null;
let paymentId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('DashboardTest', () => {

    /*
    * Test the /GET route Getting Dashboard Information
    */
    describe('/GET Dashboard', () => {
        userData.save(function (err, account) {

        });
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
            });

        /*
        * Test the /Get route Trucks Expiry Count Information Success
        */
        it('Retrieving empty Dashboard Data', (done) => {

            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trucks/findExpiryCount')
                    .set(headerData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.expiryCount.should.have.property('fitnessExpiryCount').eql(0);
                        res.body.expiryCount.should.have.property('permitExpiryCount').eql(0);
                        res.body.expiryCount.should.have.property('insuranceExpiryCount').eql(0);
                        res.body.expiryCount.should.have.property('pollutionExpiryCount').eql(0);
                        res.body.expiryCount.should.have.property('taxExpiryCount').eql(0);
                        done();
                    });
            });
        });

        /*
        * Test the /Get route Trucks Expiry Count Information Success
        */
        it('Retrieving Dashboard Data with trucks inserted', (done) => {
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
                .set(headerData)
                .send(truckData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                    chai.request(server)
                        .get('/v1/trucks/findExpiryCount')
                        .set(headerData)
                        .end((err, res) => {
                            expect(err).to.be.null;
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            res.body.expiryCount.should.have.property('fitnessExpiryCount').eql(1);
                            res.body.expiryCount.should.have.property('permitExpiryCount').eql(1);
                            res.body.expiryCount.should.have.property('insuranceExpiryCount').eql(1);
                            res.body.expiryCount.should.have.property('pollutionExpiryCount').eql(1);
                            res.body.expiryCount.should.have.property('taxExpiryCount').eql(1);
                            done();
                        });
                });
        });
        /*
        * Test the /Get route Trucks Expiry Count Information Success
        */
        it('Retrieving Dashboard Data with trucks inserted more than 60 days', (done) => {
            var today = new Date();
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(today.setDate(today.getDate() + 60)),
                "permitExpiry": new Date(today.setDate(today.getDate() + 60)),
                "insuranceExpiry": new Date(today.setDate(today.getDate() + 60)),
                "pollutionExpiry": new Date(today.setDate(today.getDate() + 60)),
                "taxDueDate": new Date(today.setDate(today.getDate() + 60)),
            };
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .set(headerData)
                    .send(truckData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        chai.request(server)
                            .get('/v1/trucks/findExpiryCount')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.expiryCount.should.have.property('fitnessExpiryCount').eql(0);
                                res.body.expiryCount.should.have.property('permitExpiryCount').eql(0);
                                res.body.expiryCount.should.have.property('insuranceExpiryCount').eql(0);
                                res.body.expiryCount.should.have.property('pollutionExpiryCount').eql(0);
                                res.body.expiryCount.should.have.property('taxExpiryCount').eql(0);
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Fitness Expiry Trucks Information Success
        */
        it('Retrieving empty Fitness Expiry Trucks Information', (done) => {
            chai.request(server)
                .get('/v1/trucks/fitnessExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('trucks');
                    expect(res.body.trucks).to.be.a('array');
                    expect(res.body.trucks).to.be.length(0);
                    done();
                });
        });
        /*
        * Test the /Get route Trucks Expiry Count Information Success
        */
        it('Retrieving Fitness Expiry Trucks Information with trucks inserted', (done) => {
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .set(headerData)
                    .send(truckData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        chai.request(server)
                            .get('/v1/trucks/fitnessExpiryTrucks')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('trucks');
                                expect(res.body.trucks).to.be.a('array');
                                expect(res.body.trucks).to.be.length(1);
                                res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Permit Expiry Trucks Information Success
        */
        it('Retrieving empty Permit Expiry Trucks Information', (done) => {
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trucks/permitExpiryTrucks')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.should.have.property('trucks');
                        expect(res.body.trucks).to.be.a('array');
                        expect(res.body.trucks).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /Get route Permit Expiry Count Information Success
        */
        it('Retrieving Permit Expiry Trucks Information with trucks inserted', (done) => {
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .set(headerData)
                    .send(truckData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        chai.request(server)
                            .get('/v1/trucks/permitExpiryTrucks')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('trucks');
                                expect(res.body.trucks).to.be.a('array');
                                expect(res.body.trucks).to.be.length(1);
                                res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Insurance Expiry Trucks Information Success
        */
        it('Retrieving empty Insurance Expiry Trucks Information', (done) => {
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trucks/insuranceExpiryTrucks')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.should.have.property('trucks');
                        expect(res.body.trucks).to.be.a('array');
                        expect(res.body.trucks).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /Get route Insurance Expiry Count Information Success
        */
        it('Retrieving Insurance Expiry Trucks Information with trucks inserted', (done) => {
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .set(headerData)
                    .send(truckData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        chai.request(server)
                            .get('/v1/trucks/insuranceExpiryTrucks')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('trucks');
                                expect(res.body.trucks).to.be.a('array');
                                expect(res.body.trucks).to.be.length(1);
                                res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Pollution Expiry Trucks Information Success
        */
        it('Retrieving empty Pollution Expiry Trucks Information', (done) => {
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trucks/pollutionExpiryTrucks')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.should.have.property('trucks');
                        expect(res.body.trucks).to.be.a('array');
                        expect(res.body.trucks).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /Get route Pollution Expiry Count Information Success
        */
        it('Retrieving Pollution Expiry Trucks Information with trucks inserted', (done) => {
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .set(headerData)
                    .send(truckData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        chai.request(server)
                            .get('/v1/trucks/pollutionExpiryTrucks')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('trucks');
                                expect(res.body.trucks).to.be.a('array');
                                expect(res.body.trucks).to.be.length(1);
                                res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Tax Expiry Trucks Information Success
        */
        it('Retrieving empty Tax Expiry Trucks Information', (done) => {
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trucks/taxExpiryTrucks')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.should.have.property('trucks');
                        expect(res.body.trucks).to.be.a('array');
                        expect(res.body.trucks).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /Get route Tax Expiry Count Information Success
        */
        it('Retrieving Tax Expiry Trucks Information with trucks inserted', (done) => {
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .set(headerData)
                    .send(truckData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        chai.request(server)
                            .get('/v1/trucks/taxExpiryTrucks')
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Success']);
                                res.body.should.have.property('trucks');
                                expect(res.body.trucks).to.be.a('array');
                                expect(res.body.trucks).to.be.length(1);
                                res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                                res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
                                done();
                            });
                    });
            });
        });
        /*
        * Test the /Get route Empty Total Revenue Information Success
        */
        it('Retrieving Empty Total Revenue Information', (done) => {
            TripCollection.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trips/find/totalRevenue')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('totalRevenue');
                        res.body.should.have.property('totalRevenue').eql(0);
                        done();
                    });
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
                "name": "Party1",
                "contact": 9999999999,
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
                                res.body.truck.should.have.property('truckType');
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
                                res.body.should.have.property('message').eql('Party Added Successfully');
                                res.body.should.have.property('party');
                                res.body.party.should.have.property('name');
                                res.body.party.should.have.property('name').eql('Party1');
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
                    "partyId": partyId,
                    "driverId": driverId,
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
                                .get('/v1/trips/find/revenueByVehicle')
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
        * Test the /Get route Empty Total Expense for all vehicles Information Success
        */
        it('Retrieving Empty Total Expense for all vehicles Information', (done) => {
            chai.request(server)
                .get('/v1/expense/total')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('totalExpenses');
                    res.body.should.have.property('totalExpenses').eql(0);
                    done();
                });
        });
        /*
        * Test the /Get route Empty Total Expenses by Vehicle Information Success
        */
        it('Retrieving Empty Total Expenses by Vehicle Information', (done) => {
            chai.request(server)
                .get('/v1/expense/groupByVehicle')
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
    });
});