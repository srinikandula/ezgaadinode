//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../server/models/schemas').AccountsColl;
var ErpSettingsColl = require('./../server/models/schemas').ErpSettingsColl;

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
let expect = chai.expect;
let token = null;
let accountId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('ERPSettingsTests', () => {
    /*
    * Test the /GET route Getting User Profile Information
    */
    describe('/GET ERPSettings', () => {
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
                accountId = res.body._id;
                headerData = {"token": token};
            });
        /*
        * Test the /Get Retrieving User Default Settings Information Success
        */
        it('Retrieving User Default Settings Information', (done) => {
            chai.request(server)
                .get('/v1/admin/getErpSettings/')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.result.revenue.should.have.property('filterType').eql('month');
                    res.body.result.payment.should.have.property('filterType').eql('month');
                    res.body.result.expense.should.have.property('filterType').eql('month');
                    res.body.result.tollCard.should.have.property('filterType').eql('month');
                    res.body.result.fuelCard.should.have.property('filterType').eql('month');
                    res.body.result.expiry.should.have.property('filterType').eql('month');

                    done();
                });
        });
        /*
        * Test the /PUT Updating User Default Settings with filter type day Information Success
        */
        it('Updating User Default Settings with filter type day Information', (done) => {
            let userSettings = {
                settings: {
                    revenue: {
                        filterType: 'day',
                        fromDate: new Date(),
                        toDate: new Date()
                    },
                    payment: {
                        filterType: 'day',
                        fromDate: new Date(),
                        toDate: new Date()
                    },
                    expense: {
                        filterType: 'day',
                        fromDate: new Date(),
                        toDate: new Date()
                    },
                    tollCard: {
                        filterType: 'day',
                        fromDate: new Date(),
                        toDate: new Date()
                    },
                    fuelCard: {
                        filterType: 'day',
                        fromDate: new Date(),
                        toDate: new Date()
                    },
                    expiry: {
                        filterType: 'day',
                        fromDate: new Date(),
                        toDate: new Date()
                    }
                }
            }
            chai.request(server)
                .put('/v1/admin/updateErpSettings')
                .set(headerData)
                .send(userSettings)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Default Settings with filter type week Information Success
        */
        it('Updating User Default Settings with filter type week Information', (done) => {
            let userSettings = {
                settings: {
                    revenue: {
                        filterType: 'week',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    payment: {
                        filterType: 'week',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    expense: {
                        filterType: 'week',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    tollCard: {
                        filterType: 'week',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    fuelCard: {
                        filterType: 'week',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    expiry: {
                        filterType: 'week',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    }
                }
            }
            chai.request(server)
                .put('/v1/admin/updateErpSettings')
                .set(headerData)
                .send(userSettings)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Default Settings with filter type month Information Success
        */
        it('Updating User Default Settings with filter type month Information', (done) => {
            let userSettings = {
                settings: {
                    revenue: {
                        filterType: 'month',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -30)),
                        toDate: new Date()
                    },
                    payment: {
                        filterType: 'month',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -30)),
                        toDate: new Date()
                    },
                    expense: {
                        filterType: 'month',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -30)),
                        toDate: new Date()
                    },
                    tollCard: {
                        filterType: 'month',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -30)),
                        toDate: new Date()
                    },
                    fuelCard: {
                        filterType: 'month',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -30)),
                        toDate: new Date()
                    },
                    expiry: {
                        filterType: 'month',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -30)),
                        toDate: new Date()
                    }
                }
            }
            chai.request(server)
                .put('/v1/admin/updateErpSettings')
                .set(headerData)
                .send(userSettings)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Default Settings with filter type year Information Success
        */
        it('Updating User Default Settings with filter type year Information', (done) => {
            let userSettings = {
                settings: {
                    revenue: {
                        filterType: 'year',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -365)),
                        toDate: new Date()
                    },
                    payment: {
                        filterType: 'year',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -365)),
                        toDate: new Date()
                    },
                    expense: {
                        filterType: 'year',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -365)),
                        toDate: new Date()
                    },
                    tollCard: {
                        filterType: 'year',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -365)),
                        toDate: new Date()
                    },
                    fuelCard: {
                        filterType: 'year',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -365)),
                        toDate: new Date()
                    },
                    expiry: {
                        filterType: 'year',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -365)),
                        toDate: new Date()
                    }
                }
            }
            chai.request(server)
                .put('/v1/admin/updateErpSettings')
                .set(headerData)
                .send(userSettings)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT Updating User Default Settings with filter type custom Information Success
        */
        it('Updating User Default Settings with filter type custom Information', (done) => {
            let userSettings = {
                settings: {
                    revenue: {
                        filterType: 'custom',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    payment: {
                        filterType: 'custom',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    expense: {
                        filterType: 'custom',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    tollCard: {
                        filterType: 'custom',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    fuelCard: {
                        filterType: 'custom',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    },
                    expiry: {
                        filterType: 'custom',
                        fromDate: new Date(new Date().setDate(new Date().getDate() -7)),
                        toDate: new Date()
                    }
                }
            }
            chai.request(server)
                .put('/v1/admin/updateErpSettings')
                .set(headerData)
                .send(userSettings)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
    });
});