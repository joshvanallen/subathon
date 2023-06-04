
import { handler } from './handler';
import { ExpressBuilder } from '@subathon/express-apigateway';

new ExpressBuilder().getEndPoint('/auth/oauth/validate', handler).start();