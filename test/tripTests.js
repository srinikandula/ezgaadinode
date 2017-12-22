//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var TrucksColl = require('./../server/models/schemas').TrucksColl;
var DriversColl = require('./../server/models/schemas').DriversColl;
var PartyCollection = require('./../server/models/schemas').PartyCollection;
var TripCollection = require('./../server/models/schemas').TripCollection;

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
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('TripTest', () => {
    /*
    * Test the /GET route Getting Trip Information
    */
    describe('/GET Trip', () => {
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
        * Test the /GET route Retrieving Empty Trip Information Success
        */
        it('Retrieving Empty Trip Information', (done) => {
            TripCollection.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trips/getAllAccountTrips')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        expect(res.body.trips).to.be.a('array');
                        expect(res.body.trips).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Trip Information by Adding Truck,Party and Driver Success
        */
        it('Retrieving Trip Information', (done) => {
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
                "contact": 7382042321,
                "email": "naresh.d@mtwlabs.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
                "isSms":true,
                "isEmail":false,
                "partyType":"isSupplier"
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
                                res.body.party.should.have.property('contact').eql(7382042321);
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
                    "freightAmount": 1500,
                    "share":true
                };
                TripCollection.remove({}, function (error, result) {
                    chai.request(server)
                        .post('/v1/trips/addTrip')
                        .send(tripData)
                        .set(headerData)
                        .end((err, res) => {
                            console.log('reee====>',res.body);
                            expect(err).to.be.null;
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Trip Added Successfully']);
                            tripId = res.body.trips._id;
                            done();
                        });
                });
            });
        });
        /*
        * Test the /PUT route Updating Trip Information Success
        */
        it('Updating Trip Information', (done) => {
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
                    res.body.trip.should.have.property('freightAmount').eql(1300);
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Trip Information Success
        */
        it('Deleting Trip Information', (done) => {
            chai.request(server)
                .delete('/v1/trips/'+tripId)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
    });
});