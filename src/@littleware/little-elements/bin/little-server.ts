import { createLogger } from 'bunyan';
import express = require('express');
import fs = require('fs');
import http = require('http');
import https = require('https');

const log = createLogger({ name: 'little-server' });
const app = express();

// eslint-disable-next-line
log.info('serving /modules/ from ./node_modules/');
app.use('/modules/', express.static('./node_modules/'));

const moduleList = [];
const serverLogger = (req, res, next) => {
  const startMs = Date.now();
  res.on('finish', () => {
    log.info(
      {
        req: {
          path: req.path,
        },
        res: {
          statusCode: res.statusCode,
        },
        timeMs: (Date.now() - startMs),
      },
    );
  });
  next();
};

app.use(serverLogger);
{
  const args = process.argv.splice(2);
  if (args.length > 0 && args[0].match(/^-*h[elp]/i)) {
    // eslint-disable-next-line
    console.log(`
Use: npx little-server urlPath1 folderPath1 urlPath2 folderPath2 ...
        `);
    process.exit(0);
  }

  for (let i = 0; i + 1 < args.length; i += 2) {
    const urlPath = args[i];
    const folderPath = args[i + 1];
    if (folderPath.startsWith('module:')) {
      const modulePath = folderPath.substring('module:'.length).replace(/^\.\//, `${process.cwd()}/`);
      // eslint-disable-next-line
      log.info(`serving ${urlPath} with module ${modulePath}`);
      // eslint-disable-next-line
      const module = require(modulePath);
      moduleList.push(module.expressRouter().then((router) => ({ urlPath, router })));
    } else {
      // eslint-disable-next-line
      log.info(`serving ${urlPath} from ${folderPath}`);
      app.use(urlPath, express.static(folderPath));
    }
  }
}

Promise.all(moduleList).then(
  (routerList) => {
    routerList.forEach(
      (info) => {
        // eslint-disable-next-line
        log.info(`mounting ${info.urlPath}`);
        app.use(info.urlPath, info.router);
      },
    );
  },
).then(
  () => {
    const httpServer = http.createServer(app);
    httpServer.listen(3000, () => {
      log.info('Server listening at http://localhost:3000/');
    });
    if (process.env.LITTLE_LOCALHOST) {
      const sslFolder = process.env.LITTLE_LOCALHOST;
      const privateKey = fs.readFileSync(`${sslFolder}/localhost.key`, 'utf8');
      const certificate = fs.readFileSync(`${sslFolder}/localhost.cert`, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(3043, () => {
        log.info('Server listening at https://localhost:3043/');
      });
    } else {
      log.info('LITTLE_LOCALHOST environment variable not set - skipping https endpoint');
    }
  },
).catch(
  (err) => {
    // eslint-disable-next-line
    log.error(err, 'error - server failed to launch');
  },
);
