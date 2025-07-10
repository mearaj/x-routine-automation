import { registerFollowingScraper } from './followings.ts';
import {registerLikeAndRtProcessor} from "./likeAndRt";
import {registerReplyWithURL} from "./replyWithURL.ts";

registerFollowingScraper();
registerLikeAndRtProcessor();
registerReplyWithURL();
