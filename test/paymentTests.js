//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var PartyCollection = require('./../server/models/schemas').PartyCollection;
let paymentsReceivedColl = require('./../server/models/schemas').paymentsReceivedColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let partyId = null;
let paymentId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "account"
});
let headerData = { "token": token };

chai.use(chaiHttp);

describe('PaymentTest', () => {
    /*
    * Test the /GET route Getting Payment Information
    */
    describe('/GET Payment', () => {
        User.remove({},function (err, result){
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
                headerData = { "token": token };
                done();
            });
        });
        /*
        * Test the /GET route Retrieving Empty Payment Information Success
        */
        it('Retrieving Empty Payment Information', (done) => {
            paymentsReceivedColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/payments')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        expect(res.body.payments).to.be.a('array');
                        expect(res.body.payments).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Payment with payment type NEFT Information by Adding Payment Success
        */
        it('Retrieving Payment with payment type NEFT Information', (done) => {
            /*
            * Test the /POST route Adding Party Information Success
            */
            let partyData = {
                "name": "Party1",
                "contact": 9874563210,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
                "isEmail": true,
                "partyType":'Transporter'
            };
            PartyCollection.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/party/addParty')
                    .set(headerData)
                    .send(partyData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('message').eql([ 'Party Added Successfully' ]);
                        partyId = res.body.party._id;
                        /*
                        * Test the /POST route Adding Payment with Payment Type NEFT Information Success
                        */
                        let paymentData = {
                            "partyId": partyId,
                            "date": new Date(),
                            "amount": 120,
                            "paymentType": "NEFT",
                            "paymentRefNo": "abcd123456",
                        };
                        paymentsReceivedColl.remove({}, function (error, result) {
                            chai.request(server)
                                .post('/v1/payments/addPayments')
                                .send(paymentData)
                                .set(headerData)
                                .end((err, res) => {
                                    expect(err).to.be.null;
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('messages').eql(['Successfully Added']);
                                    paymentId = res.body.payments._id;
                                    chai.request(server)
                                        .get('/v1/payments/getPayments')
                                        .set(headerData)
                                        .end((err, res) => {
                                            res.should.have.status(200);
                                            res.body.should.be.a('object');
                                            res.body.should.have.property('message').eql('Success');
                                            expect(res.body.paymentsCosts).to.be.a('array');
                                            expect(res.body.paymentsCosts).to.be.length(1);
                                            res.body.paymentsCosts[0].should.have.property('partyId').eql(partyId);
                                            res.body.paymentsCosts[0].should.have.property('amount').eql(120);
                                            done();
                                        });
                                });
                        });
                        
                    });
            });
        });
         /*
        * Test the /GET route Retrieving Payment with payment type Cheque Information by Adding Payment Success
        */
        it('Retrieving Payment with payment type Cheque Information', (done) => {
            /*
            * Test the /POST route Adding Party Information Success
            */
            let partyData2 = {
                "name": "Party1",
                "contact": 9874563210,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
                "isEmail": true,
                "partyType":'Transporter'
            };
            PartyCollection.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/party/addParty')
                    .set(headerData)
                    .send(partyData2)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('message').eql([ 'Party Added Successfully' ]);
                        partyId = res.body.party._id;
                        /*
                        * Test the /POST route Adding Payment with Payment Type NEFT Information Success
                        */
                        let paymentData2 = {
                            "partyId": partyId,
                            "date": new Date(),
                            "amount": 120,
                            "paymentType": "Check",
                            "paymentRefNo": "abcd123456",
                        };
                        paymentsReceivedColl.remove({}, function (error, result) {
                            chai.request(server)
                                .post('/v1/payments/addPayments')
                                .send(paymentData2)
                                .set(headerData)
                                .end((err, res) => {
                                    expect(err).to.be.null;
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('messages').eql(['Successfully Added']);
                                    paymentId = res.body.payments._id;
                                    chai.request(server)
                                        .get('/v1/payments/getPayments')
                                        .set(headerData)
                                        .end((err, res) => {
                                            res.should.have.status(200);
                                            res.body.should.be.a('object');
                                            res.body.should.have.property('message').eql('Success');
                                            expect(res.body.paymentsCosts).to.be.a('array');
                                            expect(res.body.paymentsCosts).to.be.length(1);
                                            res.body.paymentsCosts[0].should.have.property('partyId').eql(partyId);
                                            res.body.paymentsCosts[0].should.have.property('amount').eql(120);
                                            done();
                                        });
                                });
                        });
                        
                    });
            });
        });
            /*
        * Test the /GET route Retrieving Payment with payment type Cash Information by Adding Payment Success
        */
        it('Retrieving Payment with payment type Cash Information', (done) => {
            /*
            * Test the /POST route Adding Party Information Success
            */
            let partyData3 = {
                "name": "Party1",
                "contact": 9874563210,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
                "isEmail": true,
                "partyType":'Transporter'
            };
            PartyCollection.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/party/addParty')
                    .set(headerData)
                    .send(partyData3)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('message').eql([ 'Party Added Successfully' ]);
                        partyId = res.body.party._id;
                        /*
                        * Test the /POST route Adding Payment with Payment Type NEFT Information Success
                        */
                        let paymentData3 = {
                            "partyId": partyId,
                            "date": new Date(),
                           "amount": 120,
                            "paymentType": "Cash",
                            "paymentRefNo": "abcd123456",
                        };
                        paymentsReceivedColl.remove({}, function (error, result) {
                            chai.request(server)
                                .post('/v1/payments/addPayments')
                                .send(paymentData3)
                                .set(headerData)
                                .end((err, res) => {
                                    expect(err).to.be.null;
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('messages').eql(['Successfully Added']);
                                    paymentId = res.body.payments._id;
                                    chai.request(server)
                                        .get('/v1/payments/getPayments')
                                        .set(headerData)
                                        .end((err, res) => {
                                            res.should.have.status(200);
                                            res.body.should.be.a('object');
                                            res.body.should.have.property('message').eql('Success');
                                            expect(res.body.paymentsCosts).to.be.a('array');
                                            expect(res.body.paymentsCosts).to.be.length(1);
                                            res.body.paymentsCosts[0].should.have.property('partyId').eql(partyId);
                                            res.body.paymentsCosts[0].should.have.property('amount').eql(120);
                                            done();
                                        });
                                });
                        });
                        
                    });
            });
        });
        /*
       * Test the /GET route Retrieving Payment Information by Party Name Success
       */
        it('Retrieving Payment Information by Party Name Success', (done) => {
            var partyName="Party1";
            chai.request(server)
                .get('/v1/payments/getPayments?partyName='+partyName)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    expect(res.body.paymentsCosts).to.be.a('array');
                    expect(res.body.paymentsCosts).to.be.length(1);
                    res.body.paymentsCosts[0].should.have.property('partyId').eql(partyId);
                    res.body.paymentsCosts[0].should.have.property('amount').eql(120);
                    done();
                });
        });
         /*
       * Test the /GET route Retrieving Payment Information by Party Name Failure Information
       */
      it('Retrieving Payment Information by Party Name Failure Information', (done) => {
        var partyName="Party1sdcss";
        chai.request(server)
            .get('/v1/payments/getPayments?partyName='+partyName)
            .set(headerData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Success');
                expect(res.body.paymentsCosts).to.be.a('array');
                expect(res.body.paymentsCosts).to.be.length(0);
               
                done();
            });
    });
        /*
        * Test the /PUT route Updating Payment Information Success
        */
        it('Updating Payment Information', (done) => {
            let paymentData = {
                "_id": paymentId,
                "partyId": partyId,
                "date": new Date(),
                "amount": 150
            }
            chai.request(server)
                .put('/v1/payments/updatePayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payment updated successfully']);
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Payment Information Success
        */
        it('Deleting Payment Information', (done) => {
            chai.request(server)
                .delete('/v1/payments/' + paymentId)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['payment successfully Deleted']);
                    done();
                });
        });
    });
});