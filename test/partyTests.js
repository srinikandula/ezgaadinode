//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var PartyCollection = require('./../server/models/schemas').PartyCollection;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let partyId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = { "token": token };

chai.use(chaiHttp);

describe('PartyTest', () => {
    /*
    * Test the /GET route Getting Party Information
    */
    describe('/GET Party', () => {
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
                token = res.body.token;
                headerData = { "token": token };
                done();
            });
        });
        /*
        * Test the /GET route Retrieving Empty Party Information Success
        */
        it('Retrieving Empty Party Information', (done) => {
            PartyCollection.remove({}, function (error, result) {
                chai.request(server)
                    .get('/v1/party/get/all')
                    .set(headerData)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('messages').eql(['Success']);
                        expect(res.body.parties).to.be.a('array');
                        expect(res.body.parties).to.be.length(0);
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Party Information by Adding Party Success
        */
        it('Retrieving Party Information', (done) => {
            /*
            * Test the /POST route Adding Party Information Success
            */
            let partyData = {
                "name": "Party1",
                "contact": 9874563210,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
                "partyType":'Transporter',
                "isSms": false,
                "isEmail": true
            };
            chai.request(server)
                .post('/v1/party/addParty')
                .set(headerData)
                .send(partyData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.body.should.have.property('message').eql([ 'Party Added Successfully' ]);
                    partyId = res.body.party._id;
                    chai.request(server)
                        .get('/v1/party/get/accountParties')
                        .set(headerData)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('messages').eql(['Success']);
                            expect(res.body.parties).to.be.a('array');
                            expect(res.body.parties).to.be.length(1);
                            res.body.parties[0].should.have.property('name').eql('Party1');
                            res.body.parties[0].should.have.property('contact').eql(9874563210);
                            res.body.parties[0].should.have.property('email').eql('party1@gmail.com');
                            res.body.parties[0].should.have.property('city').eql('WRL');
                            res.body.parties[0].should.have.property('tripLanes');
                            res.body.parties[0].should.have.property('partyType').eql('Transporter');
                            res.body.parties[0].should.have.property('isSms').eql(false);
                            res.body.parties[0].should.have.property('isEmail').eql(true);
                            expect(res.body.parties[0].tripLanes).to.be.a('array');
                            expect(res.body.parties[0].tripLanes).to.be.length(1);
                            res.body.parties[0].tripLanes[0].should.have.property('name').eql('WRL-HYD');
                            res.body.parties[0].tripLanes[0].should.have.property('from').eql('WRL');
                            res.body.parties[0].tripLanes[0].should.have.property('to').eql('Hyd');
                            done();
                        });
                });
        });
        /*
       * Test the /GET route Retrieving Party Information by Party Name Success
       */
        it(' Retrieving Party Information by Party Name Success', (done) => {
            var partyName = "Party1";
            chai.request(server)
                .get('/v1/party/get/accountParties?partyName='+partyName)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    expect(res.body.parties).to.be.a('array');
                    expect(res.body.parties).to.be.length(1);
                    res.body.parties[0].should.have.property('name').eql('Party1');
                    res.body.parties[0].should.have.property('contact').eql(9874563210);
                    res.body.parties[0].should.have.property('email').eql('party1@gmail.com');
                    res.body.parties[0].should.have.property('city').eql('WRL');
                    res.body.parties[0].should.have.property('tripLanes');
                    res.body.parties[0].should.have.property('partyType').eql('Transporter');
                    res.body.parties[0].should.have.property('isSms').eql(false);
                    res.body.parties[0].should.have.property('isEmail').eql(true);
                    expect(res.body.parties[0].tripLanes).to.be.a('array');
                    expect(res.body.parties[0].tripLanes).to.be.length(1);
                    res.body.parties[0].tripLanes[0].should.have.property('name').eql('WRL-HYD');
                    res.body.parties[0].tripLanes[0].should.have.property('from').eql('WRL');
                    res.body.parties[0].tripLanes[0].should.have.property('to').eql('Hyd');
                    done();
                });
        });
         /*
       * Test the /GET route Retrieving Party Information by Party Name Failue Information
       */
      it(' Retrieving Party Information by Party Name Failue Information', (done) => {
        var partyName = "aPassrty1eesd";
        chai.request(server)
            .get('/v1/party/get/accountParties?partyName='+partyName)
            .set(headerData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('messages').eql(['Success']);
                expect(res.body.parties).to.be.a('array');
                expect(res.body.parties).to.be.length(0);
                done();
            });
    });
        /*
        * Test the /PUT route Updating Party Information Success
        */
        it('Updating Party Information', (done) => {
            let partyData = {
                "_id": partyId,
                "name": "Party2",
                "contact": 9874563210,
                "email": "party2@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ],
               "partyType":"Transporter",
                "isSms": false,
                "isEmail": true
            };
            chai.request(server)
                .put('/v1/party/updateParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql([ 'Party updated successfully' ]);
                    res.body.party.should.have.property('name').eql('Party2');
                    res.body.party.should.have.property('contact').eql(9874563210);
                    res.body.party.should.have.property('email').eql('party2@gmail.com');
                    res.body.party.should.have.property('city').eql('WRL');
                    res.body.party.should.have.property('tripLanes');
                    res.body.party.should.have.property('partyType').eql('Transporter');
                    res.body.party.should.have.property('isSms').eql(false);
                    res.body.party.should.have.property('isEmail').eql(true);
                    expect(res.body.party.tripLanes).to.be.a('array');
                    expect(res.body.party.tripLanes).to.be.length(1);
                    res.body.party.tripLanes[0].should.have.property('name').eql('WRL-HYD');
                    res.body.party.tripLanes[0].should.have.property('from').eql('WRL');
                    res.body.party.tripLanes[0].should.have.property('to').eql('Hyd');
                    done();
                });
        });
        /*
        * Test the /PUT route Deleting Party Information Success
        */
        it('Deleting Party Information', (done) => {
            chai.request(server)
                .delete('/v1/party/' + partyId)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    done();
                });
        });
    });
});