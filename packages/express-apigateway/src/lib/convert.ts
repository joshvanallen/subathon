
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Request } from 'express';
export const convertRequest = (request: Request) => {
    const rawCookies: undefined | string[] | string = request.headers.cookie && request.headers.cookie.split(';');
    const cookies = Array.isArray(rawCookies) && rawCookies.length > 0 ? rawCookies.map((rawCookie) => rawCookie.trim()) : [];
    const event: APIGatewayProxyEventV2 = {
        headers: request.headers as any,
        version: "2.0",
        routeKey: "$default",
        rawPath: request.url,
        rawQueryString: '',
        cookies,
        isBase64Encoded: false,
        body: request.body,
        pathParameters: request.params,
        requestContext: {
            accountId: '',
            requestId: '',
            routeKey: '',
            stage: '$default',
            time: '',
            timeEpoch: 0,
            apiId: '',
            domainPrefix: '',
            http: {
                method: request.method,
                path: request.path,
                protocol: request.protocol,
                sourceIp: request.headers.from || '',
                userAgent: request.headers['user-agent'] || ''
            },
            domainName: 'localhost:4200'
        },
        queryStringParameters: request.query as any,

    };

    return event;
}