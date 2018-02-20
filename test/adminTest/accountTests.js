//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../../server/models/schemas').AccountsColl;
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');

var should = chai.should();
let expect = chai.expect;
let token = null;
let accountId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "employee"
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('AccountTests', () => {
    /*
    * Test the /GET route Getting Account  Information
    */
    describe('/GET Account', () => {
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
        * Test the /GET route Retrieving Total Account Information Success
        */
        it('Retrieving Empty Account Information', (done) => {
            chai.request(server)
                .get('/v1/accounts/totalAccounts')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Empty Account Information Success
        */
        it('Retrieving Empty Account Information', (done) => {
            chai.request(server)
                .get('/v1/accounts/getAccounts')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Account Information Success
        */
        it('Adding Account Information', (done) => {
            let accountData = {
                "userName": 'svprasadk',
                "password": '123456',
                "contactName": 'svprasadk',
                "contactPhone": '9874563210',
                "erpEnabled": true,
                "gpsEnabled": true,
                "type": "admin",
            };
            chai.request(server)
                .post('/v1/accounts/addAccount')
                .set(headerData)
                .send(accountData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('userName').eql('svprasadk');
                    res.body.data.should.have.property('contactPhone').eql(9874563210);
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Account Information Success
        */
        it('Retrieving Account Information', (done) => {
            chai.request(server)
                .get('/v1/accounts/getAccounts')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    accountId = res.body.data[0]._id;
                    done();
                });
        });
        /*
        * Test the /POST route Adding Account with same credentials Information Success
        */
        it('Adding Account with same credentials Information', (done) => {
            let accountData = {
                "userName": 'svprasadk',
                "password": '123456',
                "contactName": 'svprasadk',
                "contactPhone": '9874563210',
                "erpEnabled": true,
                "gpsEnabled": true,
                "type": "admin",
            };
            chai.request(server)
                .post('/v1/accounts/addAccount')
                .set(headerData)
                .send(accountData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['Account with same userName already exists']);
                    done();
                });

        });
        /*
        * Test the /PUT route Updating Account Information Success
        */
        it('Updating Account Information Success', (done) => {
            let accountData = {
                "accountId": accountId,
                "userName": 'svprasadk',
                "password": '123456',
                "contactName": 'svprasadk',
                "contactPhone": '9874563211',
                "erpEnabled": true,
                "gpsEnabled": true,
                "type": "admin",
            };
            chai.request(server)
                .put('/v1/accounts/updateAccount')
                .send(accountData)
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
        * Test the /PUT route Updating Account Information Failure
        */
        it('Updating Account Information Failure', (done) => {
            let accountData = {
                "accountId": "",
                "userName": 'svprasadk',
                "password": '123456',
                "contactName": 'svprasadk',
                "contactPhone": '9874563211',
                "erpEnabled": true,
                "gpsEnabled": true,
                "type": "admin",
            };
            chai.request(server)
                .put('/v1/accounts/updateAccount')
                .send(accountData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid account Id']);
                    done();
                });
        });
        /*
        * Test the /PUT route Delete Account Information
        */
        it('Delete Account Information', (done) => {
            let accountData = {
                "accountId": accountId,
            };
            chai.request(server)
                .delete('/v1/accounts/deleteAccount')
                .send(accountData)
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