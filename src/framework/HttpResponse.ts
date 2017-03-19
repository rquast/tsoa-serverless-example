import {LambdaProxyCallback} from './LambdaProxyCallback';

export class HttpResponse {
    private data: any;
    private statusCode: number;

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

    public end() {
        if (this.callback) {
            this.callback(null, {
                body: JSON.stringify(this.data),
                statusCode: this.statusCode,
            });

            this.callback = null;
        }
    }
}
