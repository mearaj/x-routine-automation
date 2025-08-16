import { registerFollowingScraper } from './followings.ts';
import {registerLikeAndRtProcessor} from "./likeAndRt";
import {registerReplyWithURL} from "./replyWithURL.ts";
import {registerRwScreenshot} from "./rwScreenshot.ts";

registerFollowingScraper();
registerLikeAndRtProcessor();
registerReplyWithURL();
registerRwScreenshot();
