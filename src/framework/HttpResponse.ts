import {LambdaProxyCallback} from './LambdaProxyCallback';

export class HttpResponse {
    private data: any;
    private statusCode: number;
    private headers = {
        'Access-Control-Allow-Origin' : '*'
    };

    constructor(private callback: LambdaProxyCallback) {
    }

    public json(data: any) {
        this.data = data;
    }

    public status(code: number) {
        this.statusCode = code;
        if (this.data) {
            this.end();
        }
    }

    public addHeader(name: string, value: string) {
        this.headers[name] = value;
    }

    public end() {
        if (this.callback) {
            this.callback(null, {
                body: JSON.stringify(this.data),
                headers: this.headers,
                statusCode: this.statusCode,
            });

            this.callback = null;
        }
    }
}
