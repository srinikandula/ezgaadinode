//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('./../server/models/schemas').AccountsColl;
let Driver = require('./../server/models/schemas').DriversColl;

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let userData = "";
let token = "";
let headerData = "";
let driverData = "";

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            userData = new User({
                "userName": "ramarao",
                "password": "9908126699",
                "contactPhone": 9908126699
            });
            userData.save();
            done();
        });
        Driver.remove({}, (err) => {            
            
        });
    });
    /*
    * Test the /POST route User Login Failure
    */
    describe('/POST User Login Failure', () => {
        it('It Should Return User Doesn\'t Exist', (done) => {
            userData = {
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
    });

    /*
    * Test the /POST route User Login Success
    */
    describe('/POST UserLogin', () => {
        it('Logging to EasyGaadi', (done) => {
            userData = {
                "userName": "ramarao",
                "password": "9908126699",
                "contactPhone": 9908126699
            };

            chai.request(server)
                .post('/v1/group/login')
                .send(userData)
                .end((err, res) => {                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userName').eql('ramarao');
                    res.body.should.have.property('token');
                    token = res.body.token;
                    done();
                });
        });
    });
    /*
    * Test the /POST route Add Driver Failure
    */
    describe('/POST Adding Driver', () => {
        it('It Throws Error', (done) => {            
            headerData = {
                "token": token
            };
            driverData = {
                "fullname": "Kumar",
                "mobile": "9618489859",                
            };

            chai.request(server)
                .post('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Invalid full name' ]);                                        
                    done();
                });
        });
    });
    /*
    * Test the /POST route Add Driver Success
    */
    describe('/POST Adding Driver', () => {
        it('It Should Add Driver To Driver Schema', (done) => {            
            headerData = {
                "token": token
            };
            driverData = {
                "fullName": "Kumar",
                "mobile": "9618489859",                
            };

            chai.request(server)
                .post('/v1/drivers')
                .send(driverData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ "Success" ]);
                    res.body.driver.should.have.property('fullName').eql('Kumar');
                    res.body.driver.should.have.property('mobile').eql(9618489859);                    
                    done();
                });
        });
    });
});