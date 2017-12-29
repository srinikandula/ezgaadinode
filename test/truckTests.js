//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var TrucksColl = require('./../server/models/schemas').TrucksColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let truckId = null;
let fitnessExpiry = null;
let permitExpiry = null;
let insuranceExpiry = null;
let pollutionExpiry = null;
let taxDueDate = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('TruckTest', () => {
    /*
    * Test the /GET route Getting Truck Information
    */
    describe('/GET Truck', () => {
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
        * Test the /GET route Retrieving Empty Truck Information Success
        */
        it('Retrieving Empty Truck Information', (done) => {
            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/trucks/groupTrucks')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        expect(res.body.trucks).to.be.a('array');
                        expect(res.body.trucks).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Truck Information by Adding Truck Success
        */
        it('Retrieving Truck Information', (done) => {
            /*
            * Test the /POST route Adding Truck Information Success
            */
            let today = new Date();
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": today,
                "permitExpiry": today,
                "insuranceExpiry": today,
                "pollutionExpiry": today,
                "taxDueDate": today,
            };
            chai.request(server)
                .post('/v1/trucks')
                .set(headerData)
                .send(truckData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                    truckId = res.body.truck._id;
                    fitnessExpiry = res.body.truck.fitnessExpiry;
                    permitExpiry = res.body.truck.permitExpiry;
                    insuranceExpiry = res.body.truck.insuranceExpiry;
                    pollutionExpiry = res.body.truck.pollutionExpiry;
                    taxDueDate = res.body.truck.taxDueDate;
                    chai.request(server)
                        .get('/v1/trucks/groupTrucks')
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            expect(res.body.trucks).to.be.a('array');
                            expect(res.body.trucks).to.be.length(1);
                            res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
                            res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
                            res.body.trucks[0].should.have.property('fitnessExpiry').eql(fitnessExpiry);
                            res.body.trucks[0].should.have.property('permitExpiry').eql(permitExpiry);
                            res.body.trucks[0].should.have.property('insuranceExpiry').eql(insuranceExpiry);
                            res.body.trucks[0].should.have.property('pollutionExpiry').eql(pollutionExpiry);
                            res.body.trucks[0].should.have.property('taxDueDate').eql(taxDueDate);
                            done();
                        });
                });
        });
         /*
        * Test the /GET route Retrieving Truck Information with Truck Name Information Success
        */
        it('Retrieving Truck Information with Truck Name Information Success', (done) => {
            var truckName="AP36AA9876"
           chai.request(server)
           .get('/v1/trucks/groupTrucks?truckName='+truckName)
           .set(headerData)
           .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('object');
               res.body.should.have.property('messages').eql(['Success']);
               expect(res.body.trucks).to.be.a('array');
               expect(res.body.trucks).to.be.length(1);
               res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
               res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
               res.body.trucks[0].should.have.property('fitnessExpiry').eql(fitnessExpiry);
               res.body.trucks[0].should.have.property('permitExpiry').eql(permitExpiry);
               res.body.trucks[0].should.have.property('insuranceExpiry').eql(insuranceExpiry);
               res.body.trucks[0].should.have.property('pollutionExpiry').eql(pollutionExpiry);
               res.body.trucks[0].should.have.property('taxDueDate').eql(taxDueDate);
               done();
           });
       });
        /*
        * Test the /GET route Retrieving Truck Information with Truck Name Information Failure
        */
        it('Retrieving Truck Information with Truck Name Information Failure', (done) => {
            var truckName="AP36AA9876"
           chai.request(server)
           .get('/v1/trucks/groupTrucks?truckName='+truckName)
           .set(headerData)
           .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('object');
               res.body.should.have.property('messages').eql(['Success']);
               expect(res.body.trucks).to.be.a('array');
               expect(res.body.trucks).to.be.length(1);
               res.body.trucks[0].should.have.property('registrationNo').eql('AP36AA9876');
               res.body.trucks[0].should.have.property('truckType').eql('20 Tyre');
               res.body.trucks[0].should.have.property('fitnessExpiry').eql(fitnessExpiry);
               res.body.trucks[0].should.have.property('permitExpiry').eql(permitExpiry);
               res.body.trucks[0].should.have.property('insuranceExpiry').eql(insuranceExpiry);
               res.body.trucks[0].should.have.property('pollutionExpiry').eql(pollutionExpiry);
               res.body.trucks[0].should.have.property('taxDueDate').eql(taxDueDate);
               done();
           });
       });
        /*
        * Test the /PUT route Updating Truck Information Success
        */
        it('Updating Truck Information', (done) => {
            let today = new Date();
            let truckData = {
                "_id": truckId,
                "registrationNo": "AP36AA9866",
                "truckType": "24 Tyre",
                "fitnessExpiry": today,
                "permitExpiry": today,
                "insuranceExpiry": today,
                "pollutionExpiry": today,
                "taxDueDate": today,
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
                    res.body.truck.should.have.property('registrationNo').eql('AP36AA9866');
                    res.body.truck.should.have.property('truckType').eql('24 Tyre');
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Truck Information Success
        */
        it('Deleting Truck Information', (done) => {
            chai.request(server)
                .delete('/v1/trucks/'+truckId)
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