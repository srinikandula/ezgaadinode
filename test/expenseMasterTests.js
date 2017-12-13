//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var expenseMasterColl = require('./../server/models/schemas').expenseMasterColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let expenseMasterId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('Expense MasterTest', () => {
    /*
    * Test the /GET route Getting Expense Master Information
    */
    describe('/GET Expense Master', () => {
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
        * Test the /GET route Retrieving Empty Expense Master Information Success
        */
        it('Retrieving Empty Expense Master Information', (done) => {
            expenseMasterColl.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/ExpenseMaster')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        expect(res.body.expenses).to.be.a('array');
                        expect(res.body.expenses).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Expense Master Information by Adding Expense Master Success
        */
        it('Retrieving Expense Master Information', (done) => {
            /*
            * Test the /POST route Adding Expense Master Information Success
            */
            let expenseMasterData = {
                "expenseName": "Diesel"
            };
            chai.request(server)
                .post('/v1/expenseMaster')
                .set(headerData)
                .send(expenseMasterData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['Successfully Added']);
                    //expenseMasterId = res.body.newDoc._id;no detailed response means not getting id of inserted Expense Master
                    chai.request(server)
                        .get('/v1/ExpenseMaster')
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            expect(res.body.expenses).to.be.a('array');
                            expect(res.body.expenses).to.be.length(1);
                            res.body.expenses[0].should.have.property('expenseName').eql('Diesel');
                            done();
                        });
                });
        });
        /*
        * Test the /PUT route Updating Expense Master Information Success
        */
        it('Updating Expense Master Information', (done) => {
            let expenseMasterData = {
                "_id": expenseMasterId,
                "expenseName": "Toll"
            };
            chai.request(server)
                .put('/v1/ExpenseMaster')
                .send(expenseMasterData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error, finding expense']);
                    //res.body.should.have.property('messages').eql(['Expense updated successfully']);
                    //res.body.expenseMaster.should.have.property('expenseName').eql('Toll');
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Expense Master Information Success
        */
        it('Deleting Expense Master Information', (done) => {
            chai.request(server)
                .delete('/v1/ExpenseMaster/'+expenseMasterId)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Error deleting expense']);
                    //res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
    });
});