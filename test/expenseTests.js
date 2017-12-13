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
let token = null;
let truckId = null;
let expenseMasterId = null;
let expenseId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('ExpenseTest', () => {
    /*
    * Test the /GET route Getting Expense Information
    */
    describe('/GET Expense', () => {
        userData.save(function (err, account) {

        });
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
                headerData = {"token": token};
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
            let expenseMasterData = {
                "expenseName": "Diesel"
            };

            async.parallel({
                truckId: function (truckCallback) {
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
                                truckCallback(error, truckId);
                            });
                    });
                },

                expenseMasterId: function (expenseMasterCallback) {
                    expenseMasterColl.remove({}, function (error, result) {
                        chai.request(server)
                            .post('/v1/expenseMaster')
                            .send(expenseMasterData)
                            .set(headerData)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('messages').eql(['Successfully Added']);
                                expenseMasterId = res.body.newDoc._id;
                                expenseMasterCallback(error, expenseMasterId);
                            });
                    });
                },
            }, function (err, results) {
                /*
                * Adding Expense Information to schema
                */
                let expenseData = {
                    "vehicleNumber": truckId,
                    "expenseType": expenseMasterId,
                    "date": new Date(),
                    "cost": 100
                };
                ExpenseCostColl.remove({}, function (error, result) {
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
                "cost": 1300
            };
            chai.request(server)
                .put('/v1/expense/updateExpense')
                .send(expenseData)
                .set(headerData)
                .end((err, res) => {
                    console.log('res : ',res.body)
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('expenses Cost updated successfully');
                    res.body.expense.should.have.property('cost').eql(1300);
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Expense Information Success
        */
        it('Deleting Expense Information', (done) => {
            chai.request(server)
                .delete('/v1/expense/'+expenseId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    done();
                });
        });
    });
});