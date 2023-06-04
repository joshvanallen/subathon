
import { handler } from './handler';
import { ExpressBuilder } from '@subathon/express-apigateway';

new ExpressBuilder().postEndPoint('/manage/subathon', handler).start();