//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
var async = require('async');
var mongoose = require("mongoose");
var User = require('./../../server/models/schemas').AccountsColl;
var adminRoleColl = require('./../../server/models/schemas').adminRoleColl;
var franchiseColl = require('./../../server/models/schemas').franchiseColl;
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');

var should = chai.should();
let expect = chai.expect;
let token = null;
let accountId = null;
let franchiseId = null;
let roleId = null;
let employeeId = null;
let userData = new User({
    "userName": "ramarao",
    "password": "9999999999",
    "contactPhone": 9999999999,
    "type": "employee"
});
let headerData = {"token": token};

chai.use(chaiHttp);

describe('UserTests', () => {
    /*
    * Test the /GET route Getting Employee Information
    */
    describe('/GET Employee', () => {
        User.remove({}, function (err, result) {
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
                    token = res.body.token;
                    accountId = res.body._id;
                    headerData = {"token": token};
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Empty Franchise Information Success
        */
        it('Retrieving Empty Franchise Information', (done) => {
            chai.request(server)
                .get('/v1/cpanel/employees/getFranchise')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Franchise Information Success
        */
        it('Adding Franchise Information', (done) => {
            franchiseColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/cpanel/employees/addFranchise?account=kvsr&address=RJY&bankDetails=&city=RJY&company=KVSR&doj=2018-02-18T18:30:00.000Z&email=svprasadk@mtwlabs.com&fullName=kvsr&gst=&landLine=9948333962&mobile=9948333962&newProfilePic={"$ngfName":"2.jpg","$ngfOrigSize":38536}&panCard=&profilePic=&state=AP&status=true')
                    .set(headerData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('fullName').eql('kvsr');
                        res.body.data.should.have.property('account').eql('kvsr');
                        res.body.data.should.have.property('mobile').eql(9948333962);
                        franchiseId = res.body.data._id;
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Franchise Information Success
        */
        it('Retrieving Franchise Information', (done) => {
            chai.request(server)
                .get('/v1/cpanel/employees/getFranchise')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Franchise with same credentials Information Success
        */
        it('Adding Franchise with same credentials Information', (done) => {
            chai.request(server)
                .post('/v1/cpanel/employees/addFranchise?account=kvsr&address=RJY&bankDetails=&city=RJY&company=KVSR&doj=2018-02-18T18:30:00.000Z&email=svprasadk@mtwlabs.com&fullName=kvsr&gst=&landLine=9948333962&mobile=9948333962&newProfilePic={"$ngfName":"2.jpg","$ngfOrigSize":38536}&panCard=&profilePic=&state=AP&status=true')
                .set(headerData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['Franchise already exists']);
                    done();
                });

        });
        /*
        * Test the /PUT route Updating Franchise Information Success
        */
        it('Updating Franchise Information Success', (done) => {
            chai.request(server)
                .post('/v1/cpanel/employees/updateFranchise?_id=5a8acd09a8da7948ea667e46&account=kvsr&accountId=5a7d443bd98f005af311e2fa&address=RJY&bankDetails=&city=RJY&company=KVSR&createdAt=2018-02-19T13:11:37.335Z&createdBy=5a7d443bd98f005af311e2fa&doj=2018-02-18T18:30:00.000Z&email=svprasadk@mtwlabs.com&fullName=kvsr&gst=&landLine=9948333962&mobile=9948333962&panCard=&profilePic=images/profile-pics/1519045897327_2.jpg&state=AP&status=true&updatedAt=2018-02-19T13:11:37.335Z')
                .set(headerData)
                .end((err, res) => {
                    console.log('we534',res.body);
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Franchise Information Failure
        */
        it('Updating Franchise Information Failure', (done) => {
            chai.request(server)
                .post('/v1/cpanel/employees/updateFranchise?_id=&account=kvsr&accountId=5a7d443bd98f005af311e2fa&address=RJY&bankDetails=&city=RJY&company=KVSR&createdAt=2018-02-19T13:11:37.335Z&createdBy=5a7d443bd98f005af311e2fa&doj=2018-02-18T18:30:00.000Z&email=svprasadk@mtwlabs.com&fullName=kvsr&gst=&landLine=9948333962&mobile=9948333962&panCard=&profilePic=images/profile-pics/1519045897327_2.jpg&state=AP&status=true&updatedAt=2018-02-19T13:11:37.335Z')
                .set(headerData)
                .end((err, res) => {
                    console.log('we534',res.body);
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Franchise with Id doesn\'t exist']);
                    done();
                });
        });
        /*
        * Test the /PUT route Delete Franchise Information
        */
        it('Delete Franchise Information', (done) => {
            let FranchiseData = {
                "franchiseId": franchiseId
            };
            chai.request(server)
                .delete('/v1/cpanel/employees/deleteFranchise')
                .send(FranchiseData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Empty Role Information Success
        */
        it('Retrieving Empty Role Information', (done) => {
            chai.request(server)
                .get('/v1/cpanel/employees/getRole')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Role Information Success
        */
        it('Adding Role Information', (done) => {
            /*
            * Test the /POST roue Adding Franchise Information Success
            */
            let FranchiseData = {
                "fullName": "Easygaadi",
                "account": "Easygaadi",
                "mobile": 9874563210,
                "landLine": "040225588",
                "email": "easygaadi@easyggadi.com",
                "city": "Hyd",
                "state": "Telangana",
                "address": "HYD",
                "company": "EASYGAADI",
                "bankDetails": "HDFC",
                "panCard": "asdfg1234h",
                "gst": "qwerty123456",
                "doj": new Date(),
                "status": true
            };
            franchiseColl.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/cpanel/employees/addFranchise')
                    .set(headerData)
                    .send(FranchiseData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Success']);
                        franchiseId = res.body.data._id;
                        let RoleData = {
                            "franchiseId": franchiseId,
                            "role": 'Admin',
                            "status": true,
                        };
                        adminRoleColl.remove({}, function (error, result) {
                            chai.request(server)
                                .post('/v1/cpanel/employees/addRole')
                                .set(headerData)
                                .send(RoleData)
                                .end((err, res) => {
                                    expect(err).to.be.null;
                                    res.body.should.have.property('messages').eql(['Success']);
                                    res.body.should.have.property('data');
                                    res.body.data.should.have.property('role').eql('Admin');
                                    roleId = res.body.data._id;
                                    done();
                                });
                        });
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Role Information Success
        */
        it('Retrieving Role Information', (done) => {
            chai.request(server)
                .get('/v1/cpanel/employees/getRole')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    RoleId = res.body.data[0]._id;
                    done();
                });
        });
        /*
        * Test the /POST route Adding Role with same credentials Information Success
        */
        it('Adding Role with same credentials Information', (done) => {
            let RoleData = {
                "franchiseId": franchiseId,
                "role": 'Admin',
                "status": true,
            };
            chai.request(server)
                .post('/v1/cpanel/employees/addRole')
                .set(headerData)
                .send(RoleData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['Role already exists']);
                    done();
                });

        });
        /*
        * Test the /PUT route Updating Role Information Success
        */
        it('Updating Role Information Success', (done) => {
            let RoleData = {
                "franchiseId": franchiseId,
                "role": 'Adminn',
                "status": true,
                "roleId": roleId
            };
            chai.request(server)
                .put('/v1/cpanel/employees/updateRole')
                .send(RoleData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Role Information Failure
        */
        it('Updating Role Information Failure', (done) => {
            let RoleData = {
                "franchiseId": franchiseId,
                "role": 'Adminn',
                "status": true,
                "roleId": ""
            };
            chai.request(server)
                .put('/v1/cpanel/employees/updateRole')
                .send(RoleData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid role Id']);
                    done();
                });
        });
        /*
        * Test the /GET route Retrieving Empty Employee Information Success
        */
        it('Retrieving Empty Employee Information', (done) => {
            chai.request(server)
                .get('/v1/cpanel/employees/getEmployee')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /POST route Adding Employee Information Success
        */
        it('Adding Employee Information', (done) => {
            let EmployeeData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "contactPhone": 7989544980,
                "adminRoleId": roleId,
                "franchiseId": franchiseId
            };
            User.remove({}, function (error, result) {
                chai.request(server)
                    .post('/v1/cpanel/employees/addEmployee')
                //http://cpanel.localhost.com/v1/cpanel/employees/addEmployee?adminRoleId=5a8ac7e9e70896447987df63&city=hyd&confirmPassword=123&contactAddress=hyd&contactPhone=9876543210&email=test@gmail.com&firstName=test&franchiseId=5a8ac7dfe70896447987df59&isActive=true&lastName=t&newProfilePic={"$ngfName":"3.png","$ngfOrigSize":161321}&password=123&profilePic=&state=tel
                    .set(headerData)
                    .send(EmployeeData)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.body.should.have.property('messages').eql(['Success']);
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('password').eql('123');
                        res.body.data.should.have.property('email').eql('svprasadk@mtwlabs.com');
                        res.body.data.should.have.property('contactPhone').eql(7989544980);
                        employeeId = res.body.data._id;
                        done();
                    });
            });
        });
        /*
        * Test the /GET route Retrieving Employee Information Success
        */
        it('Retrieving Employee Information', (done) => {
            chai.request(server)
                .get('/v1/cpanel/employees/getEmployee')
                .set(headerData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    EmployeeId = res.body.data[0]._id;
                    done();
                });
        });
        /*
        * Test the /POST route Adding Employee with same credentials Information Success
        */
        it('Adding Employee with same credentials Information', (done) => {
            let EmployeeData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "contactPhone": 7989544980,
                "adminRoleId": roleId,
                "franchiseId": franchiseId
            };
            chai.request(server)
                .post('/v1/cpanel/employees/addEmployee')
                .set(headerData)
                .send(EmployeeData)
                .end((err, res) => {
                    res.body.should.have.property('messages').eql(['Employee already exists']);
                    done();
                });

        });
        /*
        * Test the /PUT route Updating Employee Information Success
        */
        it('Updating Employee Information Success', (done) => {
            let EmployeeData = {
                "firstName": 'SVPrasad',
                "lastName": 'Kasturi',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "contactPhone": 7989544980,
                "adminRoleId": roleId,
                "franchiseId": franchiseId,
                "employeeId": employeeId
            };
            chai.request(server)
                .put('/v1/cpanel/employees/updateEmployee')
                .send(EmployeeData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Success']);
                    done();
                });
        });
        /*
        * Test the /PUT route Updating Employee Information Failure
        */
        it('Updating Employee Information Failure', (done) => {
            let EmployeeData = {
                "firstName": 'SVPrasad',
                "lastName": 'K',
                "password": '123',
                "confirmPassword": '123',
                "email": 'svprasadk@mtwlabs.com',
                "contactPhone": 7989544980,
                "adminRoleId": roleId,
                "franchiseId": franchiseId,
                "employeeId": ""
            };
            chai.request(server)
                .put('/v1/cpanel/employees/updateEmployee')
                .send(EmployeeData)
                .set(headerData)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('messages').eql(['Invalid employee Id']);
                    done();
                });
        });
        /*
        * Test the /PUT route Delete Employee Information
        */
        it('Delete Employee Information', (done) => {
            let EmployeeData = {
                "employeeId": employeeId
            };
            chai.request(server)
                .delete('/v1/cpanel/employees/deleteEmployee')
                .send(EmployeeData)
                .set(headerData)
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