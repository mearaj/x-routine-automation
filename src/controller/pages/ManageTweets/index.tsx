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
import {Delete} from '@mui/icons-material';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {type ChangeEvent, useRef, useState} from 'react';
import {
  AutomatedTaskStatusEnum,
  type ControllerToLikeAndRtInput,
  type RtImage,
  type SourceTweetURL
} from "@/utils/automatedTasks.ts";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";
import {
  followingsSelector,
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
import {emptyUserInput, extractUsername} from "@/utils/common.ts";
import {globalAppStateActions} from "@/store/slices/globalAppState.ts";
import {userActions} from "@/store/slices/userSlice.ts";


function ManageTweetsPage() {
  const dispatch = useAppDispatch();
  const verifiedByRadioWaterMelon = useAppSelector(verifiedByRadioWaterMelonSelector);
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
  const [checkUsernameInput, setCheckUsernameInput] = useState('');
  const watermelonUsernames = verifiedByRadioWaterMelon.data;
  const resolvedUsername = extractUsername(checkUsernameInput);
  const followings = useAppSelector(followingsSelector);
  const draggingIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


  const normalizedVerifiedSet = new Set(
    Array.from(watermelonUsernames).map(u => u[0].toLowerCase())
  );
  const isVerified = resolvedUsername
    ? normalizedVerifiedSet.has(resolvedUsername.toLowerCase())
    : null;
  const [removeHistoryInput, setRemoveHistoryInput] = useState('');


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
    const minutes = Number(e.target.value);
    if (!isNaN(minutes)) {
      dispatch(automatedTasksActions.setLikeRtThresholdDuration(minutes * 60000));
    }
  };

  const handleUpdateSourceToTargetThreshold = (e: ChangeEvent<HTMLInputElement>) => {
    const minutes = Number(e.target.value);
    if (!isNaN(minutes)) {
      dispatch(automatedTasksActions.setSourceToTargetThresholdDuration(minutes * 60000));
    }
  };

  const handleUpdateFollowingThreshold = (e: ChangeEvent<HTMLInputElement>) => {
    const minutes = Number(e.target.value);
    if (!isNaN(minutes)) {
      dispatch(automatedTasksActions.setFollowingThresholdDuration(minutes * 60000));
    }
  };
  const handleUpdateMinWaitFollowing = (e: ChangeEvent<HTMLInputElement>) => {
    const seconds = Number(e.target.value);
    if (!isNaN(seconds)) {
      dispatch(automatedTasksActions.setMinWaitingTimeForFollowing(seconds * 1000));
    }
  };

  const handleUpdateMinWaitTweet = (e: ChangeEvent<HTMLInputElement>) => {
    const seconds = Number(e.target.value);
    if (!isNaN(seconds)) {
      dispatch(automatedTasksActions.setMinWaitingTimeForTweet(seconds * 1000));
    }
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
    dispatch(automatedTasksActions.setUserInput(emptyUserInput));
  };

  const handleMergeVerifiedWithFollowings = () => {
    const existingUsernames = new Set(followings.map(f => f.username.replace(/^@/, '').toLowerCase()));

    const verifiedToAdd = Array.from(verifiedByRadioWaterMelon.data)
    .map(u => String(u).replace(/^@/, '').toLowerCase())
    .filter(u => u && !existingUsernames.has(u))
    .map(u => ({
      username: u,     // store normalized handle; add "@" later if your UI expects it
      mutual: false,
      timestamp: 0,
    }));

    if (verifiedToAdd.length > 0) {
      dispatch(userActions.addOrUpdateFollowings({followings: verifiedToAdd}));
    }
  };


  const fileToRtImage = (file: File): Promise<RtImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({base64: reader.result as string, type: file.type, name: file.name});
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
// Add these handlers (place them with the other handlers)
  const onDragStartSource = (e: React.DragEvent, index: number) => {
    draggingIndexRef.current = index;
    // some browsers require data to be set for drag to start
    try {
      e.dataTransfer?.setData('text/plain', String(index));
    } catch (err) {
      console.error('Error setting data for drag start:', err);
    }
    e.dataTransfer!.effectAllowed = 'move';
  };

  const onDragOverSource = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // necessary to allow drop
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const onDropSource = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const fromIndex = draggingIndexRef.current ?? Number(e.dataTransfer?.getData('text/plain'));
    const toIndex = index;

    draggingIndexRef.current = null;
    setDragOverIndex(null);

    if (fromIndex === toIndex) return;

    const newOrder = Array.from(sourceUrls);
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    dispatch(automatedTasksActions.replaceSourceTweetURL({sourceTweetURLs: newOrder}));
  };

  const onDragEndSource = () => {
    draggingIndexRef.current = null;
    setDragOverIndex(null);
  };

  return (
    <Box p={2}>
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

        <Box mt={1} sx={{maxHeight: '50vh', overflow: 'auto'}}>
          <List dense>
            {sourceUrls.map(({url, isGaza}, index) => (
              <ListItem
                key={url}
                component="div"            // make sure draggable is applied to a div-like element
                draggable
                onDragStart={(e) => onDragStartSource(e, index)}
                onDragOver={(e) => onDragOverSource(e, index)}
                onDrop={(e) => onDropSource(e, index)}
                onDragEnd={onDragEndSource}
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
                sx={{
                  cursor: 'grab',
                  userSelect: 'none',
                  // visual cue for drop target:
                  backgroundColor: dragOverIndex === index ? 'rgba(0,0,0,0.04)' : 'transparent',
                  transition: 'background-color 120ms',
                }}
              >
                <ListItemText primary={url}/>
              </ListItem>
            ))}
          </List>
        </Box>
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
        <Typography variant="h6">Remove Source URL from History</Typography>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            label="Source URL to Remove"
            value={removeHistoryInput}
            onChange={(e) => setRemoveHistoryInput(e.target.value)}
            fullWidth
            size="small"
          />
          <Button
            variant="outlined"
            onClick={() => {
              const trimmed = removeHistoryInput.trim();
              if (trimmed) {
                dispatch(automatedTasksActions.removeSourceReplies([trimmed]));
                setRemoveHistoryInput('');
              }
            }}
            disabled={!removeHistoryInput.trim()}
          >
            Remove
          </Button>
        </Box>
      </Box>


      <Box mt={4}>
        <Typography variant="h6">Threshold Durations</Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Like/RT Threshold (minutes)"
            type="number"
            value={likeThreshold / 60000}
            onChange={handleUpdateLikeThreshold}
            fullWidth
            size="small"
          />
          <TextField
            label="Source to Target Reply Threshold (minutes)"
            type="number"
            value={sourceToTargetThreshold / 60000}
            onChange={handleUpdateSourceToTargetThreshold}
            fullWidth
            size="small"
          />
          <TextField
            label="Following Threshold (minutes)"
            type="number"
            value={followingThreshold / 60000}
            onChange={handleUpdateFollowingThreshold}
            fullWidth
            size="small"
          />
          <TextField
            label="Min Wait Time (Following) (seconds)"
            type="number"
            value={followingWaitTime / 1000}
            onChange={handleUpdateMinWaitFollowing}
            fullWidth
            size="small"
          />

          <TextField
            label="Min Wait Time (Tweet) (seconds)"
            type="number"
            value={tweetWaitTime / 1000}
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
      </Box>
      <Box mt={4} display="flex" alignItems="center" gap={2}>
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
            // Set<string> of already-normalized handles (no "@")
            const usernames = Array.from(verifiedByRadioWaterMelon.data)
            .map(u => String(u).trim())
            .filter(Boolean);

            const jsonBlob = new Blob([JSON.stringify(usernames, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(jsonBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'verifiedUsers.json';
            document.body.appendChild(a); // improves Safari/Firefox reliability
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Export Verified Users
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={handleMergeVerifiedWithFollowings}
        >
          Merge Verified Users With Followings
        </Button>
      </Box>

      <Box mt={4} display="flex" alignItems="center" gap={2}>
        <TextField
          label="Check Watermelon User"
          size="small"
          value={checkUsernameInput}
          onChange={(e) => setCheckUsernameInput(e.target.value)}
          fullWidth
        />
        {checkUsernameInput.trim() !== '' && (
          <Typography color={isVerified ? 'green' : 'red'}>
            {isVerified ? '✅ Found' : '❌ Not Found'}
          </Typography>
        )}
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
            label="Quote Text"
            multiline
            minRows={3}
            value={userInput.quoteText}
            onChange={(e) => handleUpdateUserInput('quoteText', e.target.value)}
            fullWidth
          />

          {userInput.rtImage ? (
            <Box>
              <Box display="flex" gap={2} alignItems="center">
                <img
                  src={userInput.rtImage.base64}
                  alt="RT"
                  style={{maxHeight: 100, borderRadius: 4, border: '1px solid #ccc'}}
                />
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleUpdateUserInput('rtImage', null)}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      handleUpdateUserInput('rtImage', {
                        base64: emptyUserInput.rtImage!.base64,
                        name: emptyUserInput.rtImage!.name,
                        type: emptyUserInput.rtImage!.type,
                      })
                    }
                  >
                    Reset to Default
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Button variant="outlined" component="label">
              Upload RT Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];
                  if (file) {
                    const image = await fileToRtImage(file);
                    console.log('📤 Uploaded RT image:', image);
                    handleUpdateUserInput('rtImage', image);
                  }
                }}
              />
            </Button>
          )}

          <TextField
            label="Gaza RT Text"
            multiline
            minRows={3}
            value={userInput.gazaRtText}
            onChange={(e) => handleUpdateUserInput('gazaRtText', e.target.value)}
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

          {userInput.gazaRtImage ? (
            <Box>
              <Box display="flex" gap={2} alignItems="center">
                <img
                  src={userInput.gazaRtImage.base64}
                  alt="Gaza RT"
                  style={{maxHeight: 100, borderRadius: 4, border: '1px solid #ccc'}}
                />
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleUpdateUserInput('gazaRtImage', null)}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      handleUpdateUserInput('gazaRtImage', {
                        base64: emptyUserInput.gazaRtImage!.base64,
                        name: emptyUserInput.gazaRtImage!.name,
                        type: emptyUserInput.gazaRtImage!.type,
                      })
                    }
                  >
                    Reset to Default
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Button variant="outlined" component="label">
              Upload Gaza RT Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];
                  if (file) {
                    const image = await fileToRtImage(file);
                    console.log('📤 Uploaded Gaza RT image:', image);
                    handleUpdateUserInput('gazaRtImage', image);
                  }
                }}
              />
            </Button>
          )}
        </Box>
      </Box>


    </Box>
  );
}

export default ManageTweetsPage;
