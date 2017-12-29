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
let accountId = null;
let truckId = null;
let accountGroupId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('AccountGroupTests', () => {
    /*
    * Test the /GET route Getting Account Group Information
    */
    describe('/GET AccountGroup', () => {
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
                accountId = res.body._id;
                headerData = {"token": token};
            });
        /*
        * Test the /GET route Retrieving Empty Account Group Information Success
        */
        it('Retrieving Empty Account Group Information', (done) => {
            User.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/admin/getAllAccountGroup')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        done();
                    });
            });
        });
        /*
        * Test the /POST route Adding Account Group Information Success
        */
        it('Adding Account Group Information', (done) => {
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
                    /*
                    * Test the /POST route Adding Account Group Information Success
                    */
                    let accountGroupData = {
                        "groupName": 'Groups',
                        "userName": 'gps',
                        "password": '123',
                        "confirmPassword": '123',
                        "contactName": 'gps',
                        "contactPhone": '9874563210',
                        "location": 'Hyd',
                        "truckId": [{"truckId": truckId}],
                        "erpEnabled": true,
                        "gpsEnabled": true,
                    };
                    chai.request(server)
                        .post('/v1/admin/addAccountGroup')
                        .set(headerData)
                        .send(accountGroupData)
                        .end((err, res) => {
                            expect(err).to.be.null;
                            res.body.should.have.property('messages').eql(['Success']);
                        });
                });
        });
        /*
        * Test the /GET route Retrieving Account Group Information Success
        */
        it('Retrieving Account Group Information', (done) => {
                chai.request(server)
                    .get('/v1/admin/getAllAccountGroup')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        accountGroupId = res.body.accountGroup._id;
                        done();
                    });
        });
        /*
        * Test the /POST route Adding Account Group with same credentials Information Success
        */
        it('Adding Account Group with same credentials Information', (done) => {
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
                    /*
                    * Test the /PUT route Adding Account Group Information Success
                    */
                    let accountGroupData = {
                        "groupName": 'Groups',
                        "userName": 'gps',
                        "password": '123',
                        "confirmPassword": '123',
                        "contactName": 'gps',
                        "contactPhone": '9874563210',
                        "location": 'Hyd',
                        "truckId": [{"truckId": truckId}],
                        "erpEnabled": true,
                        "gpsEnabled": true,
                    };
                    chai.request(server)
                        .put('/v1/admin/addAccountGroup')
                        .set(headerData)
                        .send(accountGroupData)
                        .end((err, res) => {
                            expect(err).to.be.null;
                            res.body.should.have.property('messages').eql(['Account Group with same userName already exists']);
                        });
                });
        });
        /*
        * Test the /PUT route Updating Account Group Information Success
        */
        it('Updating Account Group Information', (done) => {
            let accountGroupData = {
                "accountGroupId": accountGroupId,
                "groupName": 'Groups',
                "userName": 'gps',
                "password": '123',
                "confirmPassword": '123',
                "contactName": 'gps',
                "contactPhone": '9874563210',
                "location": 'Hyd',
                "truckId": [{"truckId": truckId}],
                "erpEnabled": true,
                "gpsEnabled": true,
            };
            chai.request(server)
                .put('/v1/admin/updateAccountGroup')
                .send(accountGroupData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Account Group Information Failure
        */
        it('Updating Account Group Information', (done) => {
            let accountGroupData = {
                "groupName": 'Groups',
                "userName": 'gps',
                "password": '123',
                "confirmPassword": '123',
                "contactName": 'gps',
                "contactPhone": '9874563210',
                "location": 'Hyd',
                "truckId": [{"truckId": truckId}],
                "erpEnabled": true,
                "gpsEnabled": true,
            };
            chai.request(server)
                .put('/v1/admin/updateAccountGroup')
                .send(accountGroupData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid account Group Id']);
                    done();
                });
        });
    });
});