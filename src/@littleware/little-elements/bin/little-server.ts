var express = require('express');
var app = express();

app.use('/modules/', express.static('./node_modules/'));
{
    const args = process.argv.splice(2);
    if (args.length > 0 && args[0].match(/^-*h[elp]/i)) {
        console.log( `
Use: npx little-server urlPath1 folderPath1 urlPath2 folderPath2 ...
        `);
        process.exit(0);
    }
    for(let i=0; i+1 < args.length; i+=2) {
        let urlPath = args[i];
        let folderPath = args[i+1];
        console.log(`serving ${urlPath} from ${folderPath}`);
        app.use(urlPath, folderPath);
    }
}

app.listen( 3000, function() {
    console.log( 'Server listening at http://localhost:3000/' );
});
