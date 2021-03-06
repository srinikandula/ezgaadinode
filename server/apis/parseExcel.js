var XLSX = require('xlsx');
var async = require('async');
var _ = require('underscore');
var Utils = require('./utils');
var PartyCollection = require('./../models/schemas').PartyCollection;


var workbook = XLSX.readFile('all tip top.xlsx');
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var headers = {};
    var data = [];
    var parties =[];
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
    for(var i=0;i<data.length;i++){
        var party ={};
      party.name = data[i]["NAME OF TRANSPORTER"];
      party.address = data[i]["ADDRESS"];
      party.contactPerson = data[i]["CONTACT PERSON"];
      party.contactNo = data[i]["CONTACT NO"];
      parties.push(party);
    }

    async.map(parties,function(party,ayncCallback){

        var contacts =[];
    if(party.contactNo != undefined){
        party.contactNo = party.contactNo.toString();
        contacts = party.contactNo.split(',');
    }
        var contact;
        var alternateContact = [];
        var alternateInfo = [];
        var contactStatus = 1;

        for(var i=0;i<contacts.length;i++){
            console.log("contacts...",contacts);
        var temp = contacts[i];
        contacts[i]=contacts[i].replace(/ /g,'');
        if(contacts[i].startsWith(0)){
            alternateInfo.push(contacts[i]);
        }else{
            contacts[i] = Number(contacts[i]);
            if(!isNaN(contacts[i])){
                if(Utils.isValidPhoneNumber(contacts[i])){
                    if(contactStatus >=2){
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
        party.contact = contact;
        party.partyType = 'Load Owner';
        party.accountId='5ad5cf744717256ff02b1d41';
        party.address =  party.address;
        party.contactPerson = party.contactPerson;
        party.alternateContact = alternateContact;
        party.alternateInfo = alternateInfo;
        var partyDoc = new PartyCollection(party);
        partyDoc.save(function (err,result) {

        });

},function(err){

});
