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
let accountId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('UserProfileTests', () => {
    /*
    * Test the /GET route Getting Driver Information
    */
    describe('/GET UserProfile', () => {
        userData.save(function (err, account) {

        });
        chai.request(server)
            .post('/v1/group/login')
            .send(userData)
            .end((err, res) => {
            console.log('res : ',res.body);
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
        * Test the /Get Retrieving User Profile Information Success
        */
        it('Retrieving User Profile Information', (done) => {
            chai.request(server)
                .get('/v1/admin/accounts/'+accountId)
                .set(headerData)
                .end((err, res) => {
                    console.log(res.body);
                    done();
                });
        });
    });
});