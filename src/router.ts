import { Router } from 'express';
// @ts-ignore
import { RegisterRoutes } from '../_gen/routes/routes';
import { ErrorResponse, HttpRequest, HttpResponse, HttpResponseError, LambdaProxyEvent, LambdaProxyCallback } from './framework';
import * as winston from 'winston';

// reference for dynamic generation
import './controllers/companiesController';
import './controllers/usersController';
import * as express from 'express';
import {buildProviderModule} from 'inversify-binding-decorators';
import {iocContainer} from './ioc';
const path = require('path');
const options = {root: path.join(__dirname, '../_gen')};

winston.configure({
  exitOnError: false,
  // handleExceptions: true,
  transports: [
    new winston.transports.Console()
  ]
});

const router = Router();

router.get('/v1/swagger.json', (req, res) => {
    res.sendFile('./swagger/swagger.json', options);
});

type middlewareExec = ((request: HttpRequest, response: HttpResponse, next: any) => void);

function methodHandler(method: string) {
  return function (route: string, ...routeExecs: middlewareExec[]) {
    router[method](route, (req, res) => {
      winston.info(`Found route ${route}`);

      const runNext = (runExecs: middlewareExec[]) => {
        const curExec: middlewareExec = runExecs[0];

        curExec(req, res, (err) => {
          if (err) {
            if (err instanceof HttpResponseError) {
              res.status(err.statusCode).json(new ErrorResponse(err.message));
              return;
            }

            winston.error(`Unhandled Exception: ${JSON.stringify(err.stack || err)}`);


            res.status(500).json(new ErrorResponse('There was an error processing your request.'));
          } else if (runExecs.length > 1) {
            runNext(runExecs.slice(1));
          }
        });
      };

      runNext(routeExecs);
    });
  };
}

const mockApp = {
    delete: methodHandler('delete'),
    get: methodHandler('get'),
    patch: methodHandler('patch'),
    post: methodHandler('post'),
    put: methodHandler('put')
};

RegisterRoutes(<express.Express><unknown>mockApp);
iocContainer.load(buildProviderModule());

export function handler(event: LambdaProxyEvent, context, callback: LambdaProxyCallback) {
  winston.info(`handling ${event.httpMethod} ${event.path}`);

  const response = new HttpResponse(callback);

  if (event.httpMethod.toLowerCase() === 'options') {
    response.status(200).end();
  } else {
    (router as any).handle(new HttpRequest(event), response, err => {
      winston.info(`404 for ${event.httpMethod} ${event.path}`);
      response.status(404).json(new ErrorResponse('Not Found'));
    });
  }
}

