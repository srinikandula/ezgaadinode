//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
var TrucksColl = require('./../server/models/schemas').TrucksColl;
var User = require('./../server/models/schemas').AccountsColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9908126699",
    "contactPhone": 9908126699
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

            TrucksColl.remove({},function (error, result) {
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
    });
});