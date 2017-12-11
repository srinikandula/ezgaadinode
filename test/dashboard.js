//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require('./trip');
require('./expense');
require('./payment');

let mongoose = require("mongoose");

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {
    /*
    * Test the /GET route Getting Dashboard Information
    */
    describe('/GET Dashboard', () => {
        /*
        * Test the /Get route Trucks Expiry Count Information Success
        */
        it('Retrieving Dashboard Data', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/findExpiryCount')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');                    
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.expiryCount.should.have.property('fitnessExpiryCount');
                    res.body.expiryCount.should.have.property('permitExpiryCount');
                    res.body.expiryCount.should.have.property('insuranceExpiryCount');
                    res.body.expiryCount.should.have.property('pollutionExpiryCount');
                    res.body.expiryCount.should.have.property('taxExpiryCount');
                    done();
                });
        });
        /*
        * Test the /Get route Fitness Expiry Trucks Information Success
        */
        it('Retrieving Fitness Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/fitnessExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('fitnessExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Permit Expiry Trucks Information Success
        */
        it('Retrieving Permit Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/permitExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('permitExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Insurance Expiry Trucks Information Success
        */
        it('Retrieving Insurance Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/insuranceExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('insuranceExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Pollution Expiry Trucks Information Success
        */
        it('Retrieving Pollution Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/pollutionExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('pollutionExpiry');
                    done();
                });
        });
        /*
        * Test the /Get route Tax Expiry Trucks Information Success
        */
        it('Retrieving Tax Expiry Trucks Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trucks/taxExpiryTrucks')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trucks[0].should.have.property('registrationNo');
                    res.body.trucks[0].should.have.property('taxDueDate');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue Information Success
        */
        it('Retrieving Total Revenue Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trips/find/totalRevenue')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('totalRevenue');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Vehicles Information Success
        */
        it('Retrieving Total Revenue by Vehicles Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/trips/find/revenueByVehicle')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.revenue[0].should.have.property('registrationNo');
                    res.body.revenue[0].should.have.property('totalFreight');
                    res.body.revenue[0].should.have.property('totalExpense');
                    res.body.revenue[0].should.have.property('totalRevenue');
                    res.body.revenue[0].attrs.should.have.property('truckName');
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight');
                    res.body.grossAmounts.should.have.property('grossExpenses');
                    res.body.grossAmounts.should.have.property('grossRevenue');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Individual Vehicle Information Success
        */
        it('Retrieving Total Revenue by Individual Vehicle Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/party/vehiclePayments/' + truckId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.trips[0].should.have.property('vehicleNumber');
                    res.body.trips[0].should.have.property('expenseType');
                    res.body.trips[0].should.have.property('cost');
                    res.body.should.have.property('totalRevenue');
                    res.body.totalRevenue.should.have.property('totalFreight');
                    res.body.totalRevenue.should.have.property('totalExpenses');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue Information Success
        */
        it('Retrieving Total Revenue Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/expense/total')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('totalExpenses');
                    done();
                });
        });
        /*
        * Test the /Get route Total Expenses by Vehicles Information Success
        */
        it('Retrieving Total Expenses by Vehicles Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/expense/groupByVehicle')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.expenses[0].should.have.property('regNumber');
                    res.body.expenses[0].exps[0].should.have.property('dieselExpense');
                    res.body.expenses[0].exps[0].should.have.property('tollExpense');
                    res.body.expenses[0].exps[0].should.have.property('mExpense');
                    res.body.expenses[0].exps[0].should.have.property('misc');
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense');
                    res.body.totalExpenses.should.have.property('totaltollExpense');
                    res.body.totalExpenses.should.have.property('totalmExpense');
                    res.body.totalExpenses.should.have.property('totalmisc');
                    done();
                });
        });
        /*
        * Test the /Get route Total Revenue by Individual Vehicle Information Success
        */
        it('Retrieving Total Expenses by Individual Vehicle Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/expense/vehicleExpense/' + truckId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.expenses[0].should.have.property('vehicleNumber');
                    res.body.expenses[0].should.have.property('expenseType');
                    res.body.expenses[0].should.have.property('cost');
                    res.body.should.have.property('totalExpenses');
                    res.body.totalExpenses.should.have.property('totalDieselExpense');
                    res.body.totalExpenses.should.have.property('totaltollExpense');
                    res.body.totalExpenses.should.have.property('totalmExpense');
                    res.body.totalExpenses.should.have.property('totalmisc');
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment Information Success
        */
        it('Retrieving Total Payment Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/payments/getTotalAmount/')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('amounts');
                    res.body.amounts[0].should.have.property('total');
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment by party Information Success
        */
        it('Retrieving Total Payment by Party Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/payments/getDuesByParty/')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('parties');
                    res.body.parties[0].should.have.property('totalPayment');
                    res.body.parties[0].should.have.property('totalFright');
                    res.body.parties[0].should.have.property('totalDue');
                    res.body.should.have.property('grossAmounts');
                    res.body.grossAmounts.should.have.property('grossFreight');
                    res.body.grossAmounts.should.have.property('grossExpenses');
                    res.body.grossAmounts.should.have.property('grossDue');
                    done();
                });
        });
        /*
        * Test the /Get route Total Payment by Individual Party Information Success
        */
        it('Retrieving Total Payment by Individual Party Information', (done) => {
            let headerData = {
                "token": token
            };
            chai.request(server)
                .get('/v1/party/tripsPayments/' + partyId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.should.have.property('results');
                    res.body.results[0].should.have.property('partyId');
                    res.body.should.have.property('totalPendingPayments');
                    res.body.totalPendingPayments.should.have.property('totalFreight');
                    res.body.totalPendingPayments.should.have.property('totalPaid');
                    done();
                });
        });
    });
});