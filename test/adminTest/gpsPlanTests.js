//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../../server/models/schemas').AccountsColl;
var devicePlansColl = require('./../../server/models/schemas').devicePlansColl;
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');

var should = chai.should();
let expect = chai.expect;
let token = null;
let accountId = null;
let gpsPlanId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "admin"
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('GPSPlanTests', () => {
    /*
    * Test the /GET route Getting GPS Plan  Information
    */
    describe('/GET GPS Plan', () => {
        User.remove({}, function (err, result) {
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
                    accountId = res.body._id;
                    headerData = {"token": token};
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Empty GPS Plan Information Success
        */
        it('Retrieving Empty GPS Plan Information', (done) => {
            chai.request(server)
                .get('/v1/settings/getGPSPlan')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding GPS Plan Information Success
        */
        it('Adding GPS Plan Information', (done) => {
            let gpsPlanData = {
                "planName": 'Yearly',
                "durationInMonths": 12,
                "amount": 4000,
            };
            chai.request(server)
                .post('/v1/settings/addGPSPlan')
                .set(headerData)
                .send(gpsPlanData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('planName').eql('Yearly');
                    res.body.data.should.have.property('durationInMonths').eql(12);
                    res.body.data.should.have.property('amount').eql(4000);
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving GPS Plan Information Success
        */
        it('Retrieving GPS Plan Information', (done) => {
            chai.request(server)
                .get('/v1/settings/getGPSPlan')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    gpsPlanId = res.body.data[0]._id;
                    done();
                });
        });
        /*
        * Test the /POST route Adding GPS Plan with same credentials Information Success
        */
        it('Adding GPS Plan with same credentials Information', (done) => {
            let gpsPlanData = {
                "planName": 'Yearly',
                "durationInMonths": 12,
                "amount": 4000,
            };
            chai.request(server)
                .post('/v1/settings/addGPSPlan')
                .set(headerData)
                .send(gpsPlanData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['GPS Plan already exists']);
                    done();
                });

        });
        /*
        * Test the /PUT route Updating GPS Plan Information Success
        */
        it('Updating GPS Plan Information Success', (done) => {
            let gpsPlanData = {
                "planName": 'Monthly',
                "durationInMonths": 1,
                "amount": 500,
                "gpsPlanId": gpsPlanId
            };
            chai.request(server)
                .put('/v1/settings/updateGPSPlan')
                .send(gpsPlanData)
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
        * Test the /PUT route Updating GPS Plan Information Failure
        */
        it('Updating GPS Plan Information Failure', (done) => {
            let gpsPlanData = {
                "planName": 'Monthly',
                "durationInMonths": 1,
                "amount": 500,
                "gpsPlanId": ""
            };
            chai.request(server)
                .put('/v1/settings/updateGPSPlan')
                .send(gpsPlanData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid gps plan Id']);
                    done();
                });
        });
        /*
        * Test the /PUT route Delete GPS Plan Information
        */
        it('Delete GPS Plan Information', (done) => {
            let gpsPlanData = {
                "gpsPlanId": gpsPlanId
            };
            chai.request(server)
                .delete('/v1/settings/deleteGPSPlan')
                .send(gpsPlanData)
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