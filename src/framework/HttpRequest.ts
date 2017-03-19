import { LambdaProxyEvent } from './LambdaProxyEvent';

export class HttpRequest {
    public headers: any;
    public method: string;
    public params: any;
    public query: any;
    public url: string;

    constructor(event: LambdaProxyEvent) {
        this.headers = event.headers;
        this.method = event.httpMethod;
        this.params = event.pathParameters;
        this.query = event.queryStringParameters;
        this.url = event.path;
    }
}
