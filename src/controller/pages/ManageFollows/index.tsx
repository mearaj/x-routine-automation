import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from '@mui/material';
import {Delete, ExpandMore} from '@mui/icons-material';
import {useAppDispatch, useAppSelector} from '@/store/store.ts';
import {userActions} from '@/store/slices/userSlice.ts';
import {useState} from "react";
import type {Following} from "@/utils/following.ts";
import {collectFollowingsTaskSelector, userStateSelector} from "@/store/selectors.ts";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";
import {AutomatedTaskStatusEnum} from "@/utils/automatedTasks.ts";

function ManageFollowsPage() {
  const dispatch = useAppDispatch();
  const {activeUsername, followings} = useAppSelector(userStateSelector);
  const collectFollowingsTask = useAppSelector(collectFollowingsTaskSelector);
  const [newFollowing, setNewFollowing] = useState('');
  const [sortOrderAsc, setSortOrderAsc] = useState(true);

  const handleCollect = () => {
    if (!activeUsername) return;
    dispatch(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Running));
  };

  const handleAddFollowing = () => {
    if (!newFollowing.trim()) return;
    const newEntry: Following = {username: newFollowing.trim(), timestamp: 0};
    dispatch(userActions.addOrUpdateFollowings({followings: [newEntry]}));
    setNewFollowing('');
  };

  const handleRemoveFollowing = (username: string) => {
    const updated = followings.filter(f => f.username !== username);
    dispatch(userActions.setFollowingsForActiveUser({followings: updated}));
  };

  const handleResetProperties = () => {
    const reset = followings.map(f => ({username: f.username, timestamp: 0}));
    dispatch(userActions.setFollowingsForActiveUser({followings: reset}));
  };

  const handleRemoveDuplicates = () => {
    const uniqueMap = new Map<string, Following>();
    followings.forEach(f => {
      if (!uniqueMap.has(f.username)) {
        uniqueMap.set(f.username, f);
      }
    });
    dispatch(userActions.setFollowingsForActiveUser({followings: Array.from(uniqueMap.values())}));
  };

  const handleDeleteAll = () => {
    dispatch(userActions.setFollowingsForActiveUser({followings: []}));
  };

  const handleSortByTimestamp = (asc: boolean) => {
    const sorted = [...followings].sort((a, b) =>
      asc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );
    setSortOrderAsc(asc);
    dispatch(userActions.setFollowingsForActiveUser({followings: sorted}));
  };

  const nonMutualFollowings = followings.filter(f => !f.mutual);

  return (
    <Box p={2}>
      <Box display="flex" gap={1} mt={2}>
        <TextField
          size="small"
          label="Add username"
          value={newFollowing}
          onChange={(e) => setNewFollowing(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAddFollowing}>Add</Button>
      </Box>

      <Box mt={2} display="flex" flexDirection="column" gap={2}>
        <Box display="flex" gap={1}>
          <Button
            variant={sortOrderAsc ? "contained" : "outlined"}
            onClick={() => handleSortByTimestamp(true)}
          >
            Sort by Last Visit ↑
          </Button>
          <Button
            variant={!sortOrderAsc ? "contained" : "outlined"}
            onClick={() => handleSortByTimestamp(false)}
          >
            Sort by Last Visit ↓
          </Button>
        </Box>

        <Button
          variant="contained"
          color={collectFollowingsTask === AutomatedTaskStatusEnum.Running ? "error" : "primary"}
          onClick={() => {
            if (collectFollowingsTask === AutomatedTaskStatusEnum.Running) {
              dispatch(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Stopped));
            } else {
              handleCollect();
            }
          }}
          disabled={!activeUsername}
        >
          {collectFollowingsTask === AutomatedTaskStatusEnum.Running ? "Stop Collecting" : "Collect Followings"}
        </Button>
        <Box>{collectFollowingsTask}</Box>

        <Button
          variant="outlined"
          color="warning"
          disabled={followings.length === 0}
        >
          Shuffle Followings
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleResetProperties}
          disabled={followings.length === 0}
        >
          Reset All Followings (Keep only username)
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={handleRemoveDuplicates}
          disabled={followings.length === 0}
        >
          Remove Duplicates
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteAll}
          disabled={followings.length === 0}
        >
          Delete All Followings
        </Button>
      </Box>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore/>}>
          <Typography variant="subtitle1">Followings ({followings.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mt={3} width="100%">
            <List dense>
              {followings.map(f => (
                <ListItem
                  key={f.username}
                  disableGutters
                  secondaryAction={
                    <IconButton onClick={() => handleRemoveFollowing(f.username)} edge="end">
                      <Delete/>
                    </IconButton>
                  }
                >
                  <ListItemText primary={`${f.username} (${f.timestamp})`}/>
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore/>}>
          <Typography variant="subtitle1">
            Non Followers (Non Mutual) ({nonMutualFollowings.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mt={3} width="100%">
            <List dense>
              {nonMutualFollowings.map(f => (
                <ListItem
                  key={f.username}
                  disableGutters
                  secondaryAction={
                    <Box display="flex" gap={1}>
                      <Button onClick={() => chrome.tabs.update({url: `https://x.com/${f.username}`})}>
                        View
                      </Button>
                      <IconButton onClick={() => handleRemoveFollowing(f.username)} edge="end">
                        <Delete/>
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText primary={`${f.username} (${f.timestamp})`}/>
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default ManageFollowsPage;
