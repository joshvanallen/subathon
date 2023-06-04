
import { handler } from './handler';
import { ExpressBuilder } from '@subathon/express-apigateway';

new ExpressBuilder().patchEndPoint('/manage/subathon/:subathonId/state', handler).start();