
import { handler } from './handler';
import { ExpressBuilder } from '@subathon/express-apigateway';

new ExpressBuilder().getEndPoint('/manage/subathon', handler).start();