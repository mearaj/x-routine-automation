import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from '@mui/material';
import {ArrowBack, Delete} from '@mui/icons-material';
import {NavLink} from 'react-router';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {type ChangeEvent, useState} from 'react';
import {AutomatedTaskStatusEnum, type ControllerToLikeAndRtInput, type SourceTweetURL} from "@/utils/automatedTasks.ts";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";
import {
  activeUsernameSelector,
  followingThresholdDurationSelector,
  likeRtQuoteReplyStatusSelector,
  likeRtThresholdDurationSelector,
  minWaitingTimeForFollowingSelector,
  minWaitingTimeForTweetSelector,
  sourceToTargetThresholdDurationSelector,
  sourceTweetURLsSelector,
  targetTweetURLsSelector,
  verifiedByRadioWaterMelonSelector
} from "@/store/selectors.ts";
import {defaultUserInput} from "@/utils/common.ts";
import {globalAppStateActions} from "@/store/slices/globalAppState.ts";

function ManageTweetsPage() {
  const dispatch = useAppDispatch();
  const verifiedByRadioWaterMelon = useAppSelector(verifiedByRadioWaterMelonSelector);
  const activeUsername = useAppSelector(activeUsernameSelector);
  const sourceUrls = useAppSelector(sourceTweetURLsSelector);
  const targetUrls = useAppSelector(targetTweetURLsSelector);
  const replyStatus = useAppSelector(likeRtQuoteReplyStatusSelector);
  const likeThreshold = useAppSelector(likeRtThresholdDurationSelector);
  const followingThreshold = useAppSelector(followingThresholdDurationSelector);
  const sourceToTargetThreshold = useAppSelector(sourceToTargetThresholdDurationSelector);
  const followingWaitTime = useAppSelector(minWaitingTimeForFollowingSelector);
  const tweetWaitTime = useAppSelector(minWaitingTimeForTweetSelector);
  const userInput = useAppSelector(state => state.automatedTasks.userInput);

  const [newSource, setNewSource] = useState<SourceTweetURL>({url: '', isGaza: true});
  const [newTargetUrl, setNewTargetUrl] = useState('');

  const handleAddSource = () => {
    const trimmed = newSource.url.trim();
    if (!trimmed) return;
    dispatch(automatedTasksActions.addSourceTweetURLs([{url: trimmed, isGaza: newSource.isGaza}]));
    setNewSource({url: '', isGaza: true});
  };

  const handleToggleIsGaza = (url: string) => {
    const entry = sourceUrls.find(e => e.url === url);
    if (!entry) return;
    dispatch(automatedTasksActions.updateSourceTweetIsGaza({url, isGaza: !entry.isGaza}));
  };

  const handleRemoveSource = (url: string) => {
    dispatch(automatedTasksActions.removeSourceTweetURLs([url]));
  };

  const handleAddTarget = () => {
    const trimmed = newTargetUrl.trim();
    if (!trimmed) return;
    dispatch(automatedTasksActions.addTargetTweetURLs([trimmed]));
    setNewTargetUrl('');
  };

  const handleRemoveTarget = (url: string) => {
    dispatch(automatedTasksActions.removeTargetTweetURLs([url]));
  };

  const handleStartLikeAndRt = () => {
    dispatch(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Running}));
  };

  const handleStopLikeAndRt = () => {
    dispatch(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Stopped}));
  };

  const handleUpdateLikeThreshold = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(automatedTasksActions.setLikeRtThresholdDuration(Number(e.target.value)));
  };

  const handleUpdateSourceToTargetThreshold = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(automatedTasksActions.setSourceToTargetThresholdDuration(Number(e.target.value)));
  };

  const handleUpdateFollowingThreshold = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(automatedTasksActions.setFollowingThresholdDuration(Number(e.target.value)));
  };

  const handleUpdateMinWaitFollowing = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(automatedTasksActions.setMinWaitingTimeForFollowing(Number(e.target.value)));
  };

  const handleUpdateMinWaitTweet = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(automatedTasksActions.setMinWaitingTimeForTweet(Number(e.target.value)));
  };

  const handleUpdateUserInput = <K extends keyof ControllerToLikeAndRtInput>(
    key: K,
    value: ControllerToLikeAndRtInput[K]
  ) => {
    dispatch(automatedTasksActions.setUserInput({
      ...userInput,
      [key]: value,
    }));
  };

  const handleResetUserInput = () => {
    dispatch(automatedTasksActions.setUserInput(defaultUserInput));
  };


  return (
    <Box p={2}>
      <NavLink to="../"><ArrowBack/></NavLink>

      {activeUsername && (
        <Typography gutterBottom>
          Active user: <strong>{activeUsername}</strong>
        </Typography>
      )}

      <Box mt={3}>
        <Typography variant="h6">Source URLs</Typography>
        <Box display="flex" gap={1} mt={1} alignItems="center">
          <TextField
            label="Add Source URL"
            value={newSource.url}
            onChange={(e) => setNewSource(prev => ({...prev, url: e.target.value}))}
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newSource.isGaza}
                onChange={(e) => setNewSource(prev => ({...prev, isGaza: e.target.checked}))}
              />
            }
            label="Is Gaza"
          />
          <Button variant="contained" onClick={handleAddSource} disabled={!newSource.url.trim()}>
            Add
          </Button>
        </Box>

        <List dense>
          {sourceUrls.map(({url, isGaza}) => (
            <ListItem
              key={url}
              secondaryAction={
                <>
                  <Checkbox
                    edge="end"
                    checked={isGaza}
                    onChange={() => handleToggleIsGaza(url)}
                  />
                  <IconButton edge="end" onClick={() => handleRemoveSource(url)}>
                    <Delete/>
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={url}/>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">Target URLs</Typography>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            label="Add Target URL"
            value={newTargetUrl}
            onChange={(e) => setNewTargetUrl(e.target.value)}
            fullWidth
            size="small"
          />
          <Button variant="contained" onClick={handleAddTarget} disabled={!newTargetUrl.trim()}>
            Add
          </Button>
        </Box>
        <List dense>
          {targetUrls.map(url => (
            <ListItem
              key={url}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveTarget(url)}>
                  <Delete/>
                </IconButton>
              }
            >
              <ListItemText primary={url}/>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">Threshold Durations (ms)</Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Like/RT Threshold"
            type="number"
            value={likeThreshold}
            onChange={handleUpdateLikeThreshold}
            fullWidth
            size="small"
          />
          <TextField
            label="Source to Target Reply Threshold"
            type="number"
            value={sourceToTargetThreshold}
            onChange={handleUpdateSourceToTargetThreshold}
            fullWidth
            size="small"
          />
          <TextField
            label="Following Threshold"
            type="number"
            value={followingThreshold}
            onChange={handleUpdateFollowingThreshold}
            fullWidth
            size="small"
          />
          <TextField
            label="Min Wait Time (Following)"
            type="number"
            value={followingWaitTime}
            onChange={handleUpdateMinWaitFollowing}
            fullWidth
            size="small"
          />

          <TextField
            label="Min Wait Time (Tweet)"
            type="number"
            value={tweetWaitTime}
            onChange={handleUpdateMinWaitTweet}
            fullWidth
            size="small"
          />

        </Box>
      </Box>

      <Box mt={4} display="flex" alignItems="center" gap={2}>
  <Button
    variant="contained"
    color={replyStatus === "Running" ? "error" : "primary"}
    size="large"
    onClick={replyStatus === "Running" ? handleStopLikeAndRt : handleStartLikeAndRt}
  >
    {replyStatus === "Running" ? "Stop Like And Retweet" : "Start Like and Retweet"}
  </Button>

  <Typography variant="subtitle1">
    Status: <strong>{replyStatus}</strong>
  </Typography>

  <Button
    variant="outlined"
    size="large"
    disabled={verifiedByRadioWaterMelon.state === "loading"}
    onClick={() => {
      dispatch(globalAppStateActions.setVerifiedByRadioWaterMelonState({
        data: new Set(verifiedByRadioWaterMelon.data),
        state: "loading"
      }));
    }}
  >
    Fetch Radio Watermelon Users
  </Button>

  <Typography variant="subtitle1">
    Watermelon: <strong>{verifiedByRadioWaterMelon.state}</strong>
  </Typography>

  <Button
    variant="outlined"
    size="large"
    onClick={() => {
      const sortedUsernames = Array.from(verifiedByRadioWaterMelon.data)
        .map(u => u.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      const blob = new Blob([sortedUsernames.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'verifiedUsers.txt';
      a.click();
      URL.revokeObjectURL(url);
    }}
  >
    Export Verified Users
  </Button>
</Box>


      <Box mt={4} display="flex" justifyContent="flex-start">
        <Button variant="outlined" onClick={handleResetUserInput}>
          Reset to Default
        </Button>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">User Input Config</Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>

          <TextField
            label="RT Text"
            multiline
            minRows={3}
            value={userInput.rtText}
            onChange={(e) => handleUpdateUserInput('rtText', e.target.value)}
            fullWidth
          />

          <TextField
            label="RT Image Search Text"
            multiline
            minRows={2}
            value={userInput.rtImageSearchText}
            onChange={(e) => handleUpdateUserInput('rtImageSearchText', e.target.value)}
            fullWidth
          />

          <TextField
            label="RT Image Search Position"
            type="number"
            value={userInput.rtImageSearchPosition}
            onChange={(e) => handleUpdateUserInput('rtImageSearchPosition', Number(e.target.value))}
            fullWidth
          />

          <TextField
            label="Quote Text"
            multiline
            minRows={3}
            value={userInput.quoteText}
            onChange={(e) => handleUpdateUserInput('quoteText', e.target.value)}
            fullWidth
          />

          <TextField
            label="Gaza RT Text"
            multiline
            minRows={3}
            value={userInput.gazaRtText}
            onChange={(e) => handleUpdateUserInput('gazaRtText', e.target.value)}
            fullWidth
          />

          <TextField
            label="Gaza RT Image Search Text"
            multiline
            minRows={2}
            value={userInput.gazaRtImageSearchText}
            onChange={(e) => handleUpdateUserInput('gazaRtImageSearchText', e.target.value)}
            fullWidth
          />

          <TextField
            label="Gaza RT Image Search Position"
            type="number"
            value={userInput.gazaRtImageSearchPosition}
            onChange={(e) => handleUpdateUserInput('gazaRtImageSearchPosition', Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Gaza Quote Text"
            multiline
            minRows={3}
            value={userInput.gazaQuoteText}
            onChange={(e) => handleUpdateUserInput('gazaQuoteText', e.target.value)}
            fullWidth
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ManageTweetsPage;
