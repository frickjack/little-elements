import { Router } from 'express';

/**
 * Factory builds an express router for the `hello` service -
 * result should usually be treated as a singleton.
 *
 * @return promise that resolves to a router
 */
export function expressRouter(): Promise<Router> {
  const router = Router();
  router.get('/hello', (req, res) => {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({ message: 'hello there!' }));
  });
  return Promise.resolve(router);
}
