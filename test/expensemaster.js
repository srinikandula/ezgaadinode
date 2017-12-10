//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require('./userLogin');
let mongoose = require("mongoose");

let ExpenseMaster = require('./../server/models/schemas').expenseMasterColl;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {    
    ExpenseMaster.collection.drop();    
    /*
    * Test the /POST route Adding Expense Master Information
    */
    describe('/POST Adding Expense Master', () => {
        /*
        * Test the /POST route Adding Expense Master Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "expensename": "Breaks"
            };

            chai.request(server)
                .post('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Please provide valid expense name']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Expense Master Information Success
        */
        it('It Should Add Expense Master To Expense Master Schema', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "expenseName": "Breaks"
            };
            chai.request(server)
                .post('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Successfully Added']);
                    res.body.newDoc.should.have.property('expenseName');
                    expensemasterId = res.body.newDoc._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Expense Master Information
    */
    describe('/GET Retrieving Expense Master', () => {
        /*
        * Test the /GET route Retrieving Expense Master Information Success
        */
        it('It Should Retrive Expense Master Details From Expense Master Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/ExpenseMaster')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.expenses[0].should.have.property(['expenseName']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Expense Master Information
    */
    describe('/PUT Updating Expense Master', () => {
        /*
        * Test the /PUT route Updating Expense Master Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "id": expensemasterId,
                "expensename": "Greese"
            };

            chai.request(server)
                .put('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error, finding expense']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Expense Master Information Success
        */
        it('It Should Update Expense Master', (done) => {
            let headerData = {
                "token": token
            };
            let expensemasterData = {
                "_id": expensemasterId,
                "expenseName": "Grease"
            };
            chai.request(server)
                .put('/v1/ExpenseMaster')
                .send(expensemasterData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Expense updated successfully']);
                    done();
                });
        });
    });    
});