var XLSX = require('xlsx');
var async = require('async');
var _ = require('underscore');
var Utils = require('./utils');

var PartyCollection = require('./../models/schemas').PartyCollection;

var workbook = XLSX.readFile('all tip top.xlsx');
var worksheet = workbook.Sheets[workbook.SheetNames[0]];
var headers = {};
var data = [];
for(z in worksheet) {

    if(z[0] === '!') continue;
    //parse out the column, row, and value
    var tt = 0;
    for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
            tt = i;
            break;
        }
    };
    var col = z.substring(0,tt);
    var row = parseInt(z.substring(tt));
    var value = worksheet[z].v;

    //store header names
    if(row == 1 && value) {
        headers[col] = value;
        continue;
    }

    if(!data[row]) data[row]={};
    data[row][headers[col]] = value;
}
//drop those first two rows which are empty
data.shift();
data.shift();

var parties=[];

for(var i=0;i<data.length;i++){
    var email_Id='';
    var party={};

    if(data[i]["E-mail id"]){
        email_Id = data[i]["E-mail id"];
        party.emailId=email_Id;
    }
    party.nameOfTransporter =data[i]["NAME OF TRANSPORTER"];
    party.address=data[i]["ADDRESS"];
    party.contactNo=data[i]["CONTACT NO"];
    party.contactPerson=data[i]["CONTACT PERSON"];
    parties.push(party);
}

async.map(parties,function(party,asyncCallback){
    var contact;
    var contacts;
    var alternateContact =[];
    var alternateInfo =[];
    if(party.contactNo) {
        var x = party.contactNo.toString();
        contacts = x.split(',');
     }
     var contactStatus=1;
    if(contacts){
        for(var i=0;i<contacts.length;i++){
            contacts[i]=contacts[i].replace(/ /g,'');
            var temp =contacts[i];
            if(contacts[i].startsWith(0)){
               alternateInfo.push(contacts[i]);
            }else{
                contacts[i]=Number(contacts[i]);
                if(!isNaN(contacts[i])){
                    if (Utils.isValidPhoneNumber(contacts[i])) {
                        if (contactStatus >= 2) {
                            alternateContact.push(contacts[i]);
                        }else{
                            contact = contacts[i];
                        }
                        contactStatus++;
                    }else{
                        alternateInfo.push(contacts[i]);
                    }
                }else{
                    alternateInfo.push(temp);
                }
            }
        }
        party.contact=contact;
        party.alternateContact =alternateContact;
        party.alternateInfo =alternateInfo;
        var partyDoc = new PartyCollection(party);
        partyDoc.save(function (err, result) {

        });
    }
},function(err){

});


