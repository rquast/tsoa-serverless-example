import * as director from 'director';
import * as Route from 'route-parser';
import {RegisterRoutes} from '../_gen/routes/routes';
import {ErrorResponse, HttpRequest, HttpResponse, HttpResponseError, LambdaProxyEvent, LambdaProxyCallback} from './framework';
import * as winston from 'winston';

// reference for dynamic generation
import './controllers/companiesController';
import './controllers/usersController';

winston.configure({
  exitOnError: false,
  handleExceptions: true,
  transports: [
    new winston.transports.Console()
  ]
});

const router = new director.http.Router().configure({
  strict: false
});

router.get('/v1/swagger.json', function(this: DirectorThis) {
  this.res.json(require('../_gen/swagger/swagger.json'));
  this.res.status(200);
});

type middlewareExec = ((request: HttpRequest, response: HttpResponse, next: any) => void);

function methodHandler(method: string) {
  return function(route: string, ...routeExecs: middlewareExec[]) {
    const routeData = new Route(route);
    router[method](route, function(this: DirectorThis) {
      winston.info(`Found route ${route}`);
      Object.assign(this.req.params, routeData.match('/' + this.req.params.proxy));

      const runNext = (runExecs: middlewareExec[]) => {
        const curExec: middlewareExec = runExecs[0];

        curExec(this.req, this.res, (err) => {
          if (err) {
            if (err instanceof HttpResponseError) {
              this.res.json(new ErrorResponse(err.message));
              this.res.status(err.statusCode);
              return;
            }

            winston.error(`Unhandled Exception: ${JSON.stringify(err.stack || err)}`);

            this.res.json(new ErrorResponse('There was an error procesing your request.'));
            this.res.status(500);
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
};

RegisterRoutes(mockApp);

export function handler(event: LambdaProxyEvent, context, callback: LambdaProxyCallback) {
  winston.info(`handling ${event.httpMethod} ${event.path}`);

  if (event.httpMethod.toLowerCase() === 'options') {
    return callback(null, {
      statusCode: 200
    });
  }

  const response = new HttpResponse(callback);
  router.dispatch(new HttpRequest(event), response, err => {
    winston.info(`404 for ${event.httpMethod} ${event.path}`);
    response.json(new ErrorResponse('Not Found'));
    response.status(404);
  });
};

interface DirectorThis {
  req: HttpRequest;
  res: HttpResponse;
};
