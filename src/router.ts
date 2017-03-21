import * as director from 'director';
import * as Route from 'route-parser';
import {RegisterRoutes} from '../_gen/routes/routes';
import {HttpRequest, HttpResponse, LambdaProxyEvent, LambdaProxyCallback} from './framework';

// reference for dynamic generation
import './controllers/companiesController';
import './controllers/usersController';

const router = new director.http.Router();

router.get('/v1/swagger.json', function(this: DirectorThis) {
  this.res.json(require('../_gen/swagger/swagger.json'));
  this.res.status(200);
});

function methodHandler(method: string) {
  return function(route: string, exec: (request: HttpRequest, response: HttpResponse, next: any) => void) {
    const routeData = new Route(route);
    router[method](route, function(this: DirectorThis) {
      Object.assign(this.req.params, routeData.match('/' + this.req.params.proxy));
      exec(this.req, this.res, (err) => {
        this.res.json({message: 'There was an error procesing your request.', error: err});
        this.res.status(500);
      });
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
  const response = new HttpResponse(callback);
  router.dispatch(new HttpRequest(event), response, err => {
    response.json({message: 'Not Found.'});
    response.status(404);
  });
};

interface DirectorThis {
  req: HttpRequest;
  res: HttpResponse;
};
