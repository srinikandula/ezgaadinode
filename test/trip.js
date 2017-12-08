//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require("./truck");
require("./driver");
require("./party");

let mongoose = require("mongoose");

let Trip = require('./../server/models/schemas').TripCollection;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {    
    Trip.collection.drop();        
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
});