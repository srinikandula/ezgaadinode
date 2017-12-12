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

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {
    User.collection.drop();
    beforeEach((done) => { //Before each test we empty the database
        let userData = new User({
            "userName": "ramarao",
            "password": "9908126699",
            "contactPhone": 9908126699
        });
        userData.save(function (err, data) {
            done();
        });
    });
});