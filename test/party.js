//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require("./userLogin");
let mongoose = require("mongoose");

let Party = require('./../server/models/schemas').PartyCollection;

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('EasyGaadi', () => {    
    Party.collection.drop();    
    /*
    * Test the /POST route Adding Party Information
    */
    describe('/POST Adding Party', () => {
        /*
        * Test the /POST route Adding Party Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "name": "Party2",
                "contactt": 9874563210,
                "email": "party2@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ]
            };

            chai.request(server)
                .post('/v1/party/addParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql(' Please provide valid contact number for party type');
                    done();
                });
        });
        /*
        * Test the /POST route Adding Party Information Success
        */
        it('It Should Add Party To Party Schema', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
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
                ]
            };
            chai.request(server)
                .post('/v1/party/addParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Party Added Successfully');
                    res.body.party.should.have.property('name');
                    res.body.party.should.have.property('contact');
                    partyId = res.body.party._id;
                    done();
                });
        });
    });
    /*
    * Test the /GET route Retrieving Party Information
    */
    describe('/GET Retrieving Party', () => {
        /*
        * Test the /GET route Retrieving Party Information Success
        */
        it('It Should Retrive Party Details From Party Schema', (done) => {
            let headerData = {
                "token": token
            };

            chai.request(server)
                .get('/v1/party/get/all')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    res.body.parties[0].should.have.property(['name']);
                    res.body.parties[0].should.have.property(['contact']);
                    done();
                });
        });
    });
    /*
    * Test the /PUT route Updating Party Information
    */
    describe('/PUT Updating Party', () => {
        /*
        * Test the /PUT route Updating Party Information Failure
        */
        it('It Throws Error', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "_id": partyId,
                "name": "Party1",
                "contactt": 9512376408,
                "email": "party1@gmail.com",
                "city": "WRL",
                "tripLanes": [
                    {
                        "to": "Hyd",
                        "from": "WRL",
                        "name": "WRL-HYD",
                        "index": 0
                    }
                ]
            };

            chai.request(server)
                .put('/v1/party/updateParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Error while updating party, try Again');
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Party Information Success
        */
        it('It Should Update Party', (done) => {
            let headerData = {
                "token": token
            };
            let partyData = {
                "_id": partyId,
                "name": "Party1",
                "contact": 9512376408,
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
                "updatedBy": ""
            };
            chai.request(server)
                .put('/v1/party/updateParty')
                .send(partyData)
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Party updated successfully');
                    res.body.party.should.have.property('name');
                    res.body.party.should.have.property('contact');
                    done();
                });
        });
    });    
});