export interface LambdaProxyEvent {
  httpMethod: string;
  headers: any;
  body: string;
  path: string;
  pathParameters: any;
  queryStringParameters: any;
}
