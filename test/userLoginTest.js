//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('./../server/models/schemas').AccountsColl;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let token = "";

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            let userData = new User({
                "userName": "ramarao",
                "password": "9908126699",
                "contactPhone": 9908126699
            });
            userData.save();
            done();
        });        
    });
    /*
    * Test the /POST route User Login
    */
    describe('/POST User Login Failure', () => {
        /*
        * Test the /POST route User Login Failure
        */
        it('It Should Return User Doesn\'t Exist', (done) => {
            let userData = {
                "userName": "ramarao1",
                "password": "99081266991",
                "contactPhone": 99081266991
            };

            chai.request(server)
                .post('/v1/group/login')
                .send(userData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['User doesn\'t exist']);
                    done();
                });
        });
        /*
        * Test the /POST route User Login Success
        */
        it('Logging to EasyGaadi', (done) => {
            let userData = {
                "userName": "ramarao",
                "password": "9908126699",
                "contactPhone": 9908126699
            };

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
                    done();
                });
        });
    });
});