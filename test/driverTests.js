//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var DriversColl = require('./../server/models/schemas').DriversColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let driverId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = { "token": token };

chai.use(chaiHttp);

describe('DriverTest', () => {
    /*
    * Test the /GET route Getting Driver Information
    */
    describe('/GET Driver', () => {
        userData.save(function (err, account) {

        });
           /*
        * Test the /GET route Retrieving Login Information
        */
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
                headerData = { "token": token };
                done();
            });
        });
        /*
        * Test the /GET route Retrieving Empty Driver Information Success
        */
        it('Retrieving Empty Driver Information', (done) => {
            DriversColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/drivers/account/drivers')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        expect(res.body.drivers).to.be.a('array');
                        expect(res.body.drivers).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Driver Information by Adding Driver Success
        */
        it('Retrieving Driver Information', (done) => {
            /*
            * Test the /POST route Adding Driver Information Success
            */
            let today = new Date();
            let driverData = {
                "fullName": "Driver1",
                "mobile": 9999999999,
            };
            chai.request(server)
                .post('/v1/drivers')
                .set(headerData)
                .send(driverData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.body.should.have.property('messages').eql(['Success']);
                    driverId = res.body.driver._id;
                    chai.request(server)
                        .get('/v1/drivers/account/drivers')
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            expect(res.body.drivers).to.be.a('array');
                            expect(res.body.drivers).to.be.length(1);
                            res.body.drivers[0].should.have.property('fullName').eql('Driver1');
                            res.body.drivers[0].should.have.property('mobile').eql(9999999999);
                            done();
                        });
                });
        });
        /*
       * Test the /GET route Retrieving Driver Information by Driver Name Information Success
       */
        it('Retrieving Driver Information by Driver Name Information Success', (done) => {

            var driverName = "Driver";

            chai.request(server)
                .get('/v1/drivers/account/drivers?driverName='+driverName)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expect(res.body.drivers).to.be.a('array');
                    expect(res.body.drivers).to.be.length(1);
                    res.body.drivers[0].should.have.property('fullName').eql('Driver1');
                    res.body.drivers[0].should.have.property('mobile').eql(9999999999);
                    done();
                });

        });
        /*
       * Test the /GET route Retrieving Driver Information by Driver Name Information Failure
       */
      it('Retrieving Driver Information by Driver Name Information Failure', (done) => {
        
                    var driverName = "Driver12";
        
                    chai.request(server)
                        .get('/v1/drivers/account/drivers?driverName='+driverName)
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            expect(res.body.drivers).to.be.a('array');
                            expect(res.body.drivers).to.be.length(0);
                            
                            done();
                        });
        
                });
        /*
        * Test the /PUT route Updating Driver Information Success
        */
        it('Updating Driver Information', (done) => {
            let driverData = {
                "_id": driverId,
                "fullName": "Kumar",
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
                    res.body.driver.should.have.property('fullName').eql('Kumar');
                    res.body.driver.should.have.property('mobile').eql(9618489849);
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Driver Information Success
        */
        it('Deleting Driver Information', (done) => {
            chai.request(server)
                .delete('/v1/drivers/' + driverId)
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