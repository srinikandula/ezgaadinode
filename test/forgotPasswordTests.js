//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var OtpColl = require('./../server/models/schemas').OtpColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let otp = null;
let userData = new User({
    "userName": "naresh",
    "password": "7382042321",
    "contactPhone": 7382042321
});

chai.use(chaiHttp);

describe('Forgot Password Test', () => {
    describe('/GET Forgot Password', () => {
        userData.save(function (err, account) {

        });
        /*
        * Test the /POST route Retrieving Forgot Password Information Failure
        */
        it('Retrieving Retrieving Forgot Password Information Failure', (done) => {
            let contactPhone = {"contactPhone":9874563210}
            chai.request(server)
                .post('/v1/group/forgot-password')
                .send(contactPhone)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql('Phone number not found');
                    done();
                });
        });
        /*
        * Test the /POST route Retrieving Forgot Password Information Success
        */
        it('Retrieving Retrieving Forgot Password Information Success', (done) => {
            let contactPhone = {"contactPhone":7382042321}
            chai.request(server)
                .post('/v1/group/forgot-password')
                .send(contactPhone)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['OTP sent successfully']);
                    otp = res.body.otp;                    
                    done();
                });
        });
        /*
        * Test the /POST route Sending OTP Information Failure
        */
        it('Retrieving Sending OTP Information Failure', (done) => {
            let contactPhone = {"contactPhone":7382042321,otp:"12345"}
            chai.request(server)
                .post('/v1/group/verify-otp')
                .send(contactPhone)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter valid OTP']);
                    done();
                });
        });
        /*
        * Test the /POST route Sending OTP Information Success
        */
        it('Retrieving Sending OTP Information Success', (done) => {
            let contactPhone = {"contactPhone":7382042321,otp:otp,}
            chai.request(server)
                .post('/v1/group/verify-otp')
                .send(contactPhone)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['OTP verified successfully']);

                    done();
                });
        });
        /*
       * Test the /POST route Reset password Information failure
       */
        it('Retrieving Reset password Information failure', (done) => {
            let contactPhone = {"contactPhone":7382042321,"password":""}
            chai.request(server)
                .post('/v1/group/reset-password')
                .send(contactPhone)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please enter password']);

                    done();
                });
        });


        /*
     * Test the /POST route Reset password Information success
     */
        it('Retrieving Reset password Information success', (done) => {
            let contactPhone = {"contactPhone":7382042321,"password":"mtw12345"}
            chai.request(server)
                .post('/v1/group/reset-password')
                .send(contactPhone)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Your Password reseted sucessfully']);

                    done();
                });
        });
    });
});