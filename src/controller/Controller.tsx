import {Box, Button, Typography} from '@mui/material';
import {NavLink} from 'react-router';

function Controller() {
  return (
    <Box height="100%" width="100%" p={2}>
      <Typography textAlign="center" variant="h6" gutterBottom>
        Welcome to My X Extension
      </Typography>
      <Box height="36px"/>
      <Box display="flex" flexDirection="column" gap={3}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={NavLink} to="users">
          Manage Users
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          component={NavLink} to="follows">
          Manage Follows
        </Button>

        <Button
          variant="contained"
          color="warning"
          size="large"
          component={NavLink} to="urls">
          Manage URLs
        </Button>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={NavLink} to="tweets">
          Manage Tweets
        </Button>
      </Box>
    </Box>
  );
}

export default Controller;
