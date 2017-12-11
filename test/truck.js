//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
//require("./userLogin");
let mongoose = require("mongoose");

let Truck = require('./../server/models/schemas').TrucksColl;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {    
    Truck.collection.drop();
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
});