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
import {useAppDispatch, useAppSelector} from '../../../store';
import * as React from 'react';
import {type ChangeEvent, useEffect, useRef, useState} from 'react';
import {
  AutomatedTaskStatusEnum,
  type ControllerToLikeAndRtInput,
  type RtImage,
  type SourceTweetURL
} from "../../../utils/automatedTasks.ts";
import {automatedTasksActions} from "../../../store/slices/automatedTasks.ts";
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
} from "../../../store/selectors.ts";
import {emptyUserInput, extractUsername} from "../../../utils/common.ts";
import {globalAppStateActions} from "../../../store/slices/globalAppState.ts";
import {userActions} from "../../../store/slices/userSlice.ts";
import {ON_CLIPBOARD_COPY} from "../../../utils";

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
  const [autoAddFromClipboard, setAutoAddFromClipboard] = useState(true);

  // preserve original intent: watermelonUsernames may be iterable of [username,...] or strings
  const normalizedVerifiedSet = new Set(
    Array.from(watermelonUsernames).map(u => (Array.isArray(u) ? String(u[0]).toLowerCase() : String(u).toLowerCase()))
  );
  const isVerified = resolvedUsername
    ? normalizedVerifiedSet.has(resolvedUsername.toLowerCase())
    : null;
  const [removeHistoryInput, setRemoveHistoryInput] = useState('');

  const handleAddSource = () => {
    const trimmed = newSource.url.trim();
    if (!trimmed) return;
    dispatch(automatedTasksActions.addSourceTweetURLs([{url: trimmed, isGaza: newSource.isGaza}]));
    setNewSource({url: '', isGaza: newSource.isGaza});
  };

  const handleToggleIsGaza = (url: string) => {
    const entry = sourceUrls.find(e => e && e.url === url);
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
      username: u,
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

  // ---------------------------
  // Drag & Drop Handlers (robust)
  // ---------------------------
  const onDragStartSource = (e: React.DragEvent, index: number) => {
    // primary source of truth: ref
    draggingIndexRef.current = index;
    // backup for browsers that require dataTransfer
    try {
      e.dataTransfer?.setData('text/plain', String(index));
    } catch (err) {
      console.error('Error setting dataTransfer:', err);
    }
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOverSource = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // allow drop
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const onDropSource = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    // prefer ref (most reliable), fallback to dataTransfer index
    const raw = draggingIndexRef.current ?? Number(e.dataTransfer?.getData('text/plain'));
    const fromIndex = Number.isFinite(raw) ? Number(raw) : null;
    const toIndex = index;

    // reset drag state
    draggingIndexRef.current = null;
    setDragOverIndex(null);

    // validations to avoid creating undefined/null entries
    if (fromIndex === null || fromIndex === undefined) return;
    if (fromIndex === toIndex) return;
    if (!Array.isArray(sourceUrls)) return;

    const newOrder = Array.from(sourceUrls);
    if (fromIndex < 0 || fromIndex >= newOrder.length) return;
    if (toIndex < 0 || toIndex > newOrder.length) return;

    const [moved] = newOrder.splice(fromIndex, 1);
    if (!moved) return; // nothing to move (defensive)

    newOrder.splice(toIndex, 0, moved);

    // ensure we never persist falsy items
    dispatch(automatedTasksActions.replaceSourceTweetURL({
      sourceTweetURLs: newOrder.filter(Boolean),
    }));
  };

  const onDragEndSource = () => {
    draggingIndexRef.current = null;
    setDragOverIndex(null);
  };

  useEffect(() => {
    function onRuntimeMessage(message: { type: string; text: string }) {
      const asyncCall = async (message: { type: string; text: string }) => {
        try {
          if (!message || message.type !== ON_CLIPBOARD_COPY) {
            return;
          }
          const text = message.text.trim();
          if (!autoAddFromClipboard) {
            return;
          }
          const isX = text.startsWith('https://x.com') || text.startsWith('https://www.x.com');
          if (!isX) {
            return;
          }
          dispatch(automatedTasksActions.addSourceTweetURLs([{url: text, isGaza: newSource.isGaza}]));
        } catch (err) {
          console.error('ManageTweets clipboard handler error', err);
        }
      }
      asyncCall(message);
      return true;
    }

    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(onRuntimeMessage);
      } catch {
        console.error('ManageTweets cleanup error');
      }
    };
  }, [autoAddFromClipboard, dispatch, newSource.isGaza]);


  return (
    <Box p={2}>
      <Box mt={3}>
        <Typography variant="h6">
          Source URLs
          <FormControlLabel
            sx={{ml: 4}}
            control={
              <Checkbox
                checked={autoAddFromClipboard}
                onChange={(e) => setAutoAddFromClipboard(e.target.checked)}
                size="small"
              />
            }
            label="Auto-add from clipboard"
          />
        </Typography>
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
            {/* defensive: filter out falsy entries; use safe key fallback */}
            {(Array.isArray(sourceUrls) ? sourceUrls : []).filter(Boolean).map((item, index) => {
              const url = item?.url ?? '';
              const isGaza = !!item?.isGaza;
              return (
                <ListItem
                  key={url || index}
                  component="div"
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
                    backgroundColor: dragOverIndex === index ? 'rgba(0,0,0,0.04)' : 'transparent',
                    transition: 'background-color 120ms',
                  }}
                >
                  <ListItemText primary={url}/>
                </ListItem>
              );
            })}
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
          {Array.isArray(targetUrls) ? targetUrls.map(url => (
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
          )) : null}
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
              data: verifiedByRadioWaterMelon.data,
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
            const usernames = Array.from(verifiedByRadioWaterMelon.data)
            .map(u => String(u).trim())
            .filter(Boolean);

            const jsonBlob = new Blob([JSON.stringify(usernames, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(jsonBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'verifiedUsers.json';
            document.body.appendChild(a);
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
                {userInput.rtImage.type?.startsWith('video/') ? (
                  <video
                    src={userInput.rtImage.base64}
                    controls
                    style={{maxHeight: 120, borderRadius: 4, border: '1px solid #ccc'}}
                  />
                ) : (
                  <img
                    src={userInput.rtImage.base64}
                    alt="RT"
                    style={{maxHeight: 100, borderRadius: 4, border: '1px solid #ccc'}}
                  />
                )}
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
                    onClick={() => handleUpdateUserInput('rtImage', emptyUserInput.rtImage)}
                  >
                    Reset to Default
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Button variant="outlined" component="label">
              Upload RT Media
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={async (e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];
                  if (file) {
                    const image = await fileToRtImage(file);
                    console.log('📤 Uploaded RT media:', image);
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
                {userInput.gazaRtImage.type?.startsWith('video/') ? (
                  <video
                    src={userInput.gazaRtImage.base64}
                    controls
                    style={{maxHeight: 120, borderRadius: 4, border: '1px solid #ccc'}}
                  />
                ) : (
                  <img
                    src={userInput.gazaRtImage.base64}
                    alt="Gaza RT"
                    style={{maxHeight: 100, borderRadius: 4, border: '1px solid #ccc'}}
                  />
                )}
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
                    onClick={() => handleUpdateUserInput('gazaRtImage', emptyUserInput.gazaRtImage)}
                  >
                    Reset to Default
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Button variant="outlined" component="label">
              Upload Gaza RT Media
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={async (e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];
                  if (file) {
                    const image = await fileToRtImage(file);
                    console.log('📤 Uploaded Gaza RT media:', image);
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
