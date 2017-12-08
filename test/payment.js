//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require('./party');
let mongoose = require("mongoose");

let Payment = require('./../server/models/schemas').paymentsReceivedColl;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {    
    Payment.collection.drop();
    /*
    * Test the /POST route Adding Payment Information
    */
    describe('/POST Adding Payment', () => {
        /*
        * Test the /POST route Adding Payment Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "partyid": partyId,
                "date": new Date(),
                "amount": 120
            };

            chai.request(server)
                .post('/v1/payments/addPayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please provide Party']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Payment Information Success
        */
        it('It Should Add Payment To Payment Schema', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "partyId": partyId,
                "date": new Date(),
                "amount": 120
            };
            chai.request(server)
                .post('/v1/payments/addPayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Successfully Added']);
                    paymentId = res.body._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Payment Information
    */
    describe('/GET Retrieving Payment', () => {
        /*
        * Test the /GET route Retrieving Payment Information Success
        */
        it('It Should Retrive Payment Details From Payment Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/payments')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.payments[0].should.have.property(['amount']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Payment Information
    */
    describe('/PUT Updating Payment', () => {
        /*
        * Test the /PUT route Updating Payment Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let paymentData = {
                "_id": paymentId,
                "partyid": partyId,
                "date": new Date(),
                "amount": 150
            }

            chai.request(server)
                .put('/v1/payments/updatePayments')
                .send(paymentData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error, finding payment']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Payment Information Success
        */
        it('It Should Update Payment', (done) => {
            let headerData = {
                "token": token
            };
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
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Payment updated successfully']);
                    done();
                });
        });
    });    
});