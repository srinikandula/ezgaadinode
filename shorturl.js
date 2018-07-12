var GoogleUrl = require( 'google-url' );


var googleUrl = new GoogleUrl( { key: 'AIzaSyDH0GANlN3CYQdl-lSNq8TXLrdN_Z65NfE' });

googleUrl.shorten( 'http://erp.localhost.com:3000/gps/listView', function( err, shortUrl ) {
    // shortUrl should be http://goo.gl/BzpZ54
    console.log("shortUrl",shortUrl);
} );