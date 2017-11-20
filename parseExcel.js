var XLSX = require('xlsx')
var workbook = XLSX.readFile(__dirname + '/statement.xls');
var sheet_name_list = workbook.SheetNames;
var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
var first_sheet_name = workbook.SheetNames[0];
var address_of_cell = 'A23';

/* Get worksheet */
var worksheet = workbook.Sheets[first_sheet_name];

/* Find desired cell */
var desired_cell = worksheet[address_of_cell];

console.log(desired_cell);