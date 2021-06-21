import { Router } from 'express';

/**
 * Generate an express router that calls through
 * to a given lambda handler function.
 */
export function expressWrap(lambdaHandler: (ev, ctx) => Promise<any>): Promise<Router> {
  const router = Router();

  router.all('*', (req, res) => lambdaHandler(
    {
      body: req.body,
      headers: req.headers,
      path: req.path,
      queryStringParameters: req.query,
    }, {},
  ).then(
    (response) => {
      res.status(response.statusCode);
      res.set(response.headers);
      res.send(response.body);
    },
  ));
  return Promise.resolve(router);
}
