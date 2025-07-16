import {takeEvery} from 'redux-saga/effects';
import {automatedTasksActions} from '@/store/slices/automatedTasks.ts';
import {collectFollowingsSaga} from "@/store/sagas/collectFollowings.ts";
import {likeRtQuoteReplySage} from "@/store/sagas/likeRtQuoteReply.ts";
import {handleAppStateChange} from "@/store/sagas/appState.ts";

export function* watchAutomatedTasksSaga(): Generator {
  yield takeEvery(automatedTasksActions.setCollectingFollowingsStatus.type, collectFollowingsSaga);
  yield takeEvery(automatedTasksActions.setlikeRtQuoteReplyStatus.type, likeRtQuoteReplySage);
  yield takeEvery(automatedTasksActions.mergeSourceReplies.type, handleAppStateChange);
  yield takeEvery(automatedTasksActions.mergeSourceToTargetReplies.type, handleAppStateChange);
  yield takeEvery(automatedTasksActions.setFollowingThresholdDuration.type, handleAppStateChange);
  yield takeEvery(automatedTasksActions.setLikeRtThresholdDuration.type, handleAppStateChange);
  yield takeEvery(automatedTasksActions.setSourceToTargetThresholdDuration.type, handleAppStateChange);
  yield takeEvery(automatedTasksActions.setUserInput.type, handleAppStateChange);
}
