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
    * Test the /GET route Getting User Profile Information
    */
    describe('/GET UserProfile', () => {
        User.remove({},function (err, result){

        })
        userData.save(function (err, account) {

        });
        it('Retrieving Login Information', (done) => {

            chai.request(server)
                .post('/v1/group/login')
                .send(userData)
                .end((err, res) => {
                    console.log('user',res.body)
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
        * Test the /Get Retrieving User Profile Information Success
        */
        it('Retrieving User Profile Information', (done) => {
            chai.request(server)
                .get('/v1/admin/accounts/'+accountId)
                .set(headerData)
                .end((err, res) => {
                    console.log('body---',res.body)
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.account.should.be.a('object');
                    res.body.account.should.have.property('userName').eql('ramarao');
                    res.body.account.should.have.property('type').eql('account');
                    done();
                });
        });
        /*
        * Test the /Get Retrieving User Profile with Groups and Trucks Count Information Success
        */
        it('Retrieving User Profile with Groups and Trucks Count Information', (done) => {
            chai.request(server)
                .get('/v1/admin/userProfile/')
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.result.profile.should.be.a('object');
                    res.body.result.profile.should.have.property('userName').eql('ramarao');
                    res.body.result.profile.should.have.property('type').eql('account');
                    res.body.result.should.have.property('accountGroupsCount').eql(0);
                    res.body.result.should.have.property('accountTrucksCount').eql(0);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Profile without Password Information Success
        */
        it('Updating User Profile without Password Information', (done) => {
            let userProfileData = {
                profile: {
                    "_id":accountId,
                    "userName": 'ramarao',
                    "contactPhone": 9999999998,
                    "email": 'ramarao@in.com'}
            }
            chai.request(server)
                .put('/v1/admin/accounts/update')
                .set(headerData)
                .send(userProfileData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Profile with Old Password Information Success
        */
        it('Updating User Profile with Old Password Information', (done) => {
            let userProfileData = {
                profile: {
                    "_id":accountId,
                    "userName": 'ramarao',
                    "password": '',
                    "contactPhone": 9999999998,
                    "email": 'ramarao@in.com'},
                "oldPassword": 'aesfaw'
            }
            chai.request(server)
                .put('/v1/admin/accounts/update')
                .set(headerData)
                .send(userProfileData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please Provide New Password']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Profile without Confirm Password Information Success
        */
        it('Updating User Profile without Confirm Password Information', (done) => {
            let userProfileData = {
                profile: {
                    "_id":accountId,
                    "userName": 'ramarao',
                    "password": '',
                    "contactPhone": 9999999998,
                    "email": 'ramarao@in.com'},
                "oldPassword": 'aesfaw',
                "newPassword": '123'
            }
            chai.request(server)
                .put('/v1/admin/accounts/update')
                .set(headerData)
                .send(userProfileData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Passwords Not Matched']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Profile with Wrong Password Information Success
        */
        it('Updating User Profile with Wrong Password Information', (done) => {
            let userProfileData = {
                profile: {
                    "_id":accountId,
                    "userName": 'ramarao',
                    "password": '',
                    "contactPhone": 9999999998,
                    "email": 'ramarao@in.com'},
                "oldPassword": 'aesfaw',
                "newPassword": '123',
                "confirmPassword": '123'
            }
            chai.request(server)
                .put('/v1/admin/accounts/update')
                .set(headerData)
                .send(userProfileData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid Password']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Profile Information Success
        */
        it('Updating User Profile Information', (done) => {
            let userProfileData = {
                profile: {
                    "_id":accountId,
                    "userName": 'ramarao',
                    "password": '',
                    "contactPhone": 9999999998,
                    "email": 'ramarao@in.com'},
                "oldPassword": '9999999999',
                "newPassword": '123',
                "confirmPassword": '123'
            }
            chai.request(server)
                .put('/v1/admin/accounts/update')
                .set(headerData)
                .send(userProfileData)
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