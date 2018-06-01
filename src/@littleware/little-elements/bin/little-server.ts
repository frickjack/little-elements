var express = require( 'express' );
var app = express();

app.use( '/modules/', express.static( './node_modules/' ) );
app.use( '/modules/@littleware/little-elements/lib/', express.static( './lib/' ));


app.listen( 3000, function() {
    console.log( 'Server listening at http://localhost:3000/' );
});
