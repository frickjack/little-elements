import express = require("express");

const app = express();

// tslint:disable-next-line
console.log(`serving /modules/ from ./node_modules/`);
app.use("/modules/", express.static("./node_modules/"));

const moduleList = [];

{
    const args = process.argv.splice(2);
    if (args.length > 0 && args[0].match(/^-*h[elp]/i)) {
        // tslint:disable-next-line
        console.log( `
Use: npx little-server urlPath1 folderPath1 urlPath2 folderPath2 ...
        `);
        process.exit(0);
    }

    for (let i = 0; i + 1 < args.length; i += 2) {
        const urlPath = args[i];
        const folderPath = args[i + 1];
        if (folderPath.startsWith("module:")) {
            const modulePath = folderPath.substring("module:".length).replace(/^\.\//, process.cwd() + "/");
            // tslint:disable-next-line
            console.log(`serving ${urlPath} with module ${modulePath}`);
            // tslint:disable-next-line
            const module = require(modulePath);
            moduleList.push(module.expressRouter().then((router) => ({ urlPath, router })));
        } else {
            // tslint:disable-next-line
            console.log(`serving ${urlPath} from ${folderPath}`);
            app.use(urlPath, express.static(folderPath));
        }
    }
}

Promise.all(moduleList).then(
    (routerList) => {
        routerList.forEach(
            (info) => {
                // tslint:disable-next-line
                console.log(`mounting ${info.urlPath}`);
                app.use(info.urlPath, info.router);
            },
        );
    },
).then(
    () => {
        app.listen(3000, () => {
            // tslint:disable-next-line
            console.log("Server listening at http://localhost:3000/");
        });
    },
).catch(
    (err) => {
        // tslint:disable-next-line
        console.log(err);
    },
);
