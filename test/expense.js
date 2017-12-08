//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require('./truck');
require('./expensemaster');
let mongoose = require("mongoose");

let Expense = require('./../server/models/schemas').ExpenseCostColl;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {    
    Expense.collection.drop();    
    /*
    * Test the /POST route Adding Expense Information
    */
    describe('/POST Adding Expense', () => {
        /*
        * Test the /POST route Adding Expense Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "vehiclenumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 100
            };

            chai.request(server)
                .post('/v1/expense/addExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Please provide valid vehicle number');
                    done();
                });
        });
        /*
        * Test the /POST route Adding Expense Information Success
        */
        it('It Should Add Expense To Expense Schema', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "vehicleNumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 100
            };
            chai.request(server)
                .post('/v1/expense/addExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('expenses Cost Added Successfully');
                    expenseId = res.body._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Expense Information
    */
    describe('/GET Retrieving Expense', () => {
        /*
        * Test the /GET route Retrieving Expense Information Success
        */
        it('It Should Retrive Expense Details From Expense Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/expense/getAllExpenses')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    res.body.expenses[0].should.have.property(['cost']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Expense Information
    */
    describe('/PUT Updating Expense', () => {
        /*
        * Test the /PUT route Updating Expense Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "_id": expenseId,
                "vehiclenumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 120
            };

            chai.request(server)
                .put('/v1/expense/updateExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Error, finding expenses Record');
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Expense Information Success
        */
        it('It Should Update Expense', (done) => {
            let headerData = {
                "token": token
            };
            let expenseData = {
                "_id": expenseId,
                "vehicleNumber": truckId,
                "expenseType": expensemasterId,
                "date": new Date(),
                "cost": 120
            };
            chai.request(server)
                .put('/v1/expense/updateExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql(['expenses Cost updated successfully']);
                    done();
                });
        });
    });    
});