//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../../server/models/schemas').AccountsColl;
var adminRoleColl = require('./../../server/models/schemas').adminRoleColl;
var adminPermissionsColl = require('./../../server/models/schemas').adminPermissionsColl;
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');

var should = chai.should();
let expect = chai.expect;
let token = null;
let accountId = null;
let userId = null;
let roleId = null;
let permissionId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "employee"
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('UserTests', () => {
    /*
    * Test the /GET route Getting User Information
    */
    describe('/GET User', () => {
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
        * Test the /GET route Retrieving Empty User Information Success
        */
        it('Retrieving Empty User Information', (done) => {
            chai.request(server)
                .get('/v1/settings/getUser')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding User Information Success
        */
        it('Adding User Information', (done) => {
            let UserData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "mobile": '7989544980',
                "adminRoleId": '123',
                "franchiseId": '123'
            };
            chai.request(server)
                .post('/v1/settings/addUser')
                .set(headerData)
                .send(UserData)
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
        * Test the /GET route Retrieving User Information Success
        */
        it('Retrieving User Information', (done) => {
            chai.request(server)
                .get('/v1/settings/getUser')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    UserId = res.body.data[0]._id;
                    done();
                });
        });
        /*
        * Test the /POST route Adding User with same credentials Information Success
        */
        it('Adding User with same credentials Information', (done) => {
            let UserData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "mobile": '7989544980',
                "adminRoleId": '123',
                "franchiseId": '123'
            };
            chai.request(server)
                .post('/v1/settings/addUser')
                .set(headerData)
                .send(UserData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['User already exists']);
                    done();
                });

        });
        /*
        * Test the /PUT route Updating User Information Success
        */
        it('Updating User Information Success', (done) => {
            let UserData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "mobile": '7989544980',
                "adminRoleId": '123',
                "franchiseId": '123'
            };
            chai.request(server)
                .put('/v1/settings/updateUser')
                .send(UserData)
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
        * Test the /PUT route Updating User Information Failure
        */
        it('Updating User Information Failure', (done) => {
            let UserData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "mobile": '7989544980',
                "adminRoleId": '123',
                "franchiseId": '123'
            };
            chai.request(server)
                .put('/v1/settings/updateUser')
                .send(UserData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid  plan Id']);
                    done();
                });
        });
        /*
        * Test the /PUT route Delete User Information
        */
        it('Delete User Information', (done) => {
            let UserData = {
                "UserId": UserId
            };
            chai.request(server)
                .delete('/v1/settings/deleteUser')
                .send(UserData)
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