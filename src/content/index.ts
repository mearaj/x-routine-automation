import { registerFollowingScraper } from './followings.ts';
import {registerLikeAndRtProcessor} from "./likeAndRt";
import {registerReplyWithURL} from "./replyWithURL.ts";
import {registerRwScreenshot} from "./rwScreenshot.ts";
import {registerClipboardCapture} from "./clipboard.ts";

registerFollowingScraper();
registerLikeAndRtProcessor();
registerReplyWithURL();
registerRwScreenshot();
registerClipboardCapture();
