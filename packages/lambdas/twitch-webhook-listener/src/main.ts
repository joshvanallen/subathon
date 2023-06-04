
import { handler } from './handler';
import { ExpressBuilder } from '@subathon/express-apigateway';

new ExpressBuilder(true).postEndPoint('/twitch/webhooks/callback/:subathonId', handler).start();