//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var TrucksColl = require('./../server/models/schemas').TrucksColl;
var expenseMasterColl = require('./../server/models/schemas').expenseMasterColl;
let ExpenseCostColl = require('./../server/models/schemas').ExpenseCostColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let userId = null;
let token = null;
let accountType = null;
let truckId = null;
let expenseMasterId = null;
let expenseId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "account"
});
let headerData = { "token": token };

chai.use(chaiHttp);

describe('ExpenseTest', () => {
    /*
    * Test the /GET route Getting Expense Information
    */
    describe('/GET Expense', () => {
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
                    userId = res.body._id;
                    token = res.body.token;
                    accountType = res.body.type;
                    headerData = { "token": token };
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Empty Expense Information Success
        */
        it('Retrieving Empty Expense Information', (done) => {
            ExpenseCostColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/expense/getAllExpenses')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Success');
                        expect(res.body.expenses).to.be.a('array');
                        expect(res.body.expenses).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Expense Information by Adding Truck,Expense Master Success
        */
        it('Retrieving Expense Information', (done) => {
            /*
            * Before Adding Expense to Vehicle need to add Truck Information to schema
            */
            let truckData = {
                "registrationNo": "AP36AA9876",
                "truckType": "20 Tyre",
                "fitnessExpiry": new Date(),
                "permitExpiry": new Date(),
                "insuranceExpiry": new Date(),
                "pollutionExpiry": new Date(),
                "taxDueDate": new Date(),
            };
            /*
            * Before Adding Expense to Vehicle need to add Expense Master Information to schema
            */


            TrucksColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/trucks')
                    .send(truckData)
                    .set(headerData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Truck Added Successfully']);
                        res.body.should.have.property('truck');
                        res.body.truck.should.have.property('registrationNo');
                        res.body.truck.should.have.property('registrationNo').eql('AP36AA9876');
                        res.body.truck.should.have.property('truckType');
                        res.body.truck.should.have.property('truckType').eql('20 Tyre');
                        truckId = res.body.truck._id;
                        /*
        * Adding Expense Information to schema
        */
                        expenseMasterColl.remove({}, function (error, res) {
                            ExpenseCostColl.remove({}, function (error, result) {
                                let expenseData = {
                                    "vehicleNumber": truckId,
                                    "expenseType": "others",
                                    "expenseName": "Toll",
                                    "date": new Date(),
                                    "paidAmount": 0,
                                    "totalAmount": 0,
                                    "cost": 100,
                                    "mode": "Cash",
                                };

                                chai.request(server)
                                    .post('/v1/expense/addExpense')
                                    .send(expenseData)
                                    .set(headerData)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.a('object');
                                        res.body.should.have.property('message').eql('expenses Cost Added Successfully');
                                        expenseId = res.body.expenses._id;
                                        done();
                                    });
                            });

                        })
                    });
            });

        });
        /*
        * Test the /GET route Retrieving  Expense Information Success
        */
        it('Retrieving  Expense Information', (done) => {
            chai.request(server)
                .get('/v1/expense/getAllExpenses')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    expect(res.body.expenses).to.be.a('array');
                    expect(res.body.expenses).to.be.length(1);
                    expenseMasterId = res.body.expenses[0].expenseType;
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving  Expense by truck Number Information Success
        */
        it('Retrieving  Expense Information', (done) => {
            var truckNumber = "AP36AA9876";
            chai.request(server)
                .get('/v1/expense/getAllExpenses?truckNumber=' + truckNumber)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    expect(res.body.expenses).to.be.a('array');
                    expect(res.body.expenses).to.be.length(1);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Expense Information Success
        */
        it('Updating Expense Information', (done) => {
            let expenseData = {
                "_id": expenseId,
                "vehicleNumber": truckId,
                "expenseType": expenseMasterId,
                "date": new Date(),
                "totalAmount": 1300,
                "paidAmount": 1000,
                "cost": 0,
                "mode": "Credit",
                "accountId": userId,
            };
            chai.request(server)
                .put('/v1/expense/updateExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('expenses Cost updated successfully');
                    res.body.expense.should.have.property('totalAmount').eql(1300);
                    res.body.expense.should.have.property('paidAmount').eql(1000);
                    res.body.expense.should.have.property('cost').eql(0);
                    done();
                });
        });
        /**
         * Adding Expense with mode cash Information to schema
         */
        it('Adding Expense with mode cash Information', (done) => {
            let expenseData = {
                "vehicleNumber": truckId,
                "expenseType": expenseMasterId,
                "date": new Date(),
                "totalAmount": 0,
                "paidAmount": 0,
                "cost": 100,
                "mode": "Cash"
            };

            chai.request(server)
                .post('/v1/expense/addExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('expenses Cost Added Successfully');
                    expenseId = res.body.expenses._id;
                    done();
                });
        });
 

    /*
    * Test the /PUT route Deleting Expense Information Success
    */
    it('Deleting Expense Information', (done) => {
        chai.request(server)
            .delete('/v1/expense/' + expenseId)
            .set(headerData)
            .end((err, res) => {
                console.log('deleting', res.body)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('messages').eql([ 'Success' ]);
                done();
            });
    });
});
});