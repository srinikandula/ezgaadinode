var XLSX = require('xlsx');
var async = require('async');
var _ = require('underscore');


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
    // console.log("parties....",data);
/*
async.map(data,function(party,ayncCallback){
     console.log("party...async...contact",party["CONTACT NO"]);
     if(_.isNumber())
        var numbers = party["CONTACT NO"].split(',');
        console.log("number...",numbers);

    if(numbers.length>1){
        console.log("numbers...",numbers);
    }

    var output =[];

},function(err){

});*/
