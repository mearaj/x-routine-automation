import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {SelectChangeEvent} from '@mui/material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import type {RootState} from '../../../store';
import {userActions} from '../../../store/slices/userSlice.ts';

const ManageUsersPage = () => {
  const dispatch = useDispatch();
  const usernames = useSelector((state: RootState) => state.user.usernames);
  const activeUsername = useSelector((state: RootState) => state.user.activeUsername);

  const [newUsername, setNewUsername] = useState('');

  const handleAdd = () => {
    dispatch(userActions.addUsername(newUsername.trim()));
    setNewUsername('');
  };

  const handleSelect = (e: SelectChangeEvent) => {
    dispatch(userActions.setActiveUsername(e.target.value));
  };

  const handleDelete = (username: string) => {
    dispatch(userActions.removeUsername(username));
  };

  const handleSetActive = (username: string) => {
    dispatch(userActions.setActiveUsername(username));
  };

  const trimmed = newUsername.trim();
  const isDuplicate = usernames.includes(trimmed);
  const isInvalid = !trimmed || isDuplicate;

  return (
    <Box p={2}>
      {usernames.length > 1 && (
        <FormControl size="small" fullWidth sx={{ mt: 2 }}>
          <InputLabel id="switch-user-label">Switch User</InputLabel>
          <Select
            labelId="switch-user-label"
            value={activeUsername || ''}
            label="Switch User"
            onChange={handleSelect}
          >
            {usernames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Add New User */}
      <Box mt={3}>
        <Typography gutterBottom>Add a new user:</Typography>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            label="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            error={isDuplicate}
            helperText={isDuplicate ? 'Username already exists' : ''}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={isInvalid}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* List Users with Actions */}
      {usernames.length > 0 && (
        <Box mt={3}>
          <Typography gutterBottom>User List:</Typography>
          <List dense disablePadding>
            {usernames.map((name) => (
              <ListItem key={name} disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText
                  primary={
                    <Typography fontWeight={name === activeUsername ? 'bold' : 'normal'}>
                      {name}
                    </Typography>
                  }
                />
                {name !== activeUsername && (
                  <Button
                    size="small"
                    onClick={() => handleSetActive(name)}
                    sx={{ minWidth: 80, mr: 1 }}
                  >
                    Set Active
                  </Button>
                )}
                {name === activeUsername && (
                  <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(name)}
                  disabled={usernames.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ManageUsersPage;
