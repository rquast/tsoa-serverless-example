import { Router } from 'express';
import * as winston from 'winston';
// @ts-ignore
import { RegisterRoutes } from '../_gen/routes/routes';
import {
    ErrorResponse,
    HttpRequest,
    HttpResponse,
    HttpResponseError,
    LambdaProxyCallback,
    LambdaProxyEvent
} from './framework';

// reference for dynamic generation
import { buildProviderModule } from 'inversify-binding-decorators';
import './controllers/companiesController';
import './controllers/usersController';
import { iocContainer } from './ioc';
// must run buildProviderModule after all imports that use binding decorators have been imported
iocContainer.load(buildProviderModule());

const swaggerJson = require('../_gen/swagger/swagger.json');

winston.configure({
    exitOnError: false,
    transports: [
        new winston.transports.Console()
    ]
});

const router = Router();

router.get('/v1/swagger.json', (req, res) => {
    res.json(swaggerJson);
});

type middlewareExec = ((request: HttpRequest, response: HttpResponse, next: any) => void);

function methodHandler(method: string) {
    return (route: string, ...routeExecs: middlewareExec[]) => {
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

RegisterRoutes(<any>mockApp);

export function handler(event: LambdaProxyEvent, context, callback: LambdaProxyCallback) {
    winston.info(`handling ${event.httpMethod} ${event.path}`);

    const response = new HttpResponse(callback);

    if (event.httpMethod.toLowerCase() === 'options') {
        response.status(200).end();
    } else {
        (router as any).handle(new HttpRequest(event), response, (err) => {
            winston.info(`404 for ${event.httpMethod} ${event.path}`);
            response.status(404).json(new ErrorResponse('Not Found'));
        });
    }
}
