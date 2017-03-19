import * as director from 'director';
import {RegisterRoutes} from '../_gen/routes/routes';
import {HttpRequest, HttpResponse, LambdaProxyEvent, LambdaProxyCallback} from './framework';

// reference for dynamic generation
import './controllers/companiesController';
import './controllers/usersController';

const router = new director.http.Router();

router.get('/swagger.json', function(this: DirectorThis) {
  this.res.json(require('../_gen/swagger/swagger.json'));
  this.res.status(200);
});

function methodHandler(method: string) {
  return function(route: string, exec: (request: HttpRequest, response: HttpResponse, next: any) => void) {
    router[method](route, function(this: DirectorThis) {
      exec(this.req, this.res, (err) => {
        this.res.json({message: 'There was an error procesing your request.', stack: err});
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
  router.dispatch(new HttpRequest(event), new HttpResponse(callback));
};

interface DirectorThis {
  req: HttpRequest;
  res: HttpResponse;
};
