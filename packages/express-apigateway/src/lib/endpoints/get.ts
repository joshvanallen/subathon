import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { RequestHandler } from 'express';
import { Request, Response } from 'express';
import { convertRequest } from '../convert';

export function getEndPoint(path: string, handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>): [string, RequestHandler] {
    return [
        path,
        async (request: Request, response: Response) => {

            const handlerResponse = await handler(convertRequest(request));
            
            if (handlerResponse.cookies && handlerResponse.cookies.length > 0) {
                response.setHeader('Set-Cookie', handlerResponse.cookies);
            }

            if (handlerResponse.headers?.['location']) {
                response.setHeader('Location', handlerResponse.headers['location'] as string);
            }

            if(handlerResponse.headers?.['content-type']){
                response.setHeader('content-type', handlerResponse.headers['content-type'] as string);
            }

            response.statusCode = handlerResponse.statusCode!;
            response.send(handlerResponse.body);
        }
    ]
}