import express from 'express';
import { getEndPoint } from './endpoints/get';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export class ExpressBuilder {
  private app = express();
  private port: number;
  
  constructor(raw?: boolean){
    this.port = Number(process.env['PORT']);
    if(raw) {
      this.app.use(express.raw({
        type: 'application/json'
      }));
    }
  }

  getEndPoint(path: string, handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>, secured: boolean = false) {
    this.app.get(...getEndPoint(path, handler));
    return this;
  }

  postEndPoint(path: string, handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>,) {
    this.app.post(...getEndPoint(path, handler));
    return this; 
  }

  patchEndPoint(path: string, handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>,) {
    this.app.patch(...getEndPoint(path, handler));
    return this; 
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}`);
    })
  }

}