import {Box, Button, Typography} from '@mui/material';
import {openOrFocusControllerTab} from "@/utils/tabs.ts";

function App() {
  return (
    <Box width="100%" p={2}>
      <Typography textAlign="center" variant="h6" gutterBottom>
        Welcome to X-Routine-Automation
      </Typography>
      <Box height="36px"/>
      <Box display="flex" flexDirection="column" gap={3}>
        <Button onClick={openOrFocusControllerTab}>
          Open Controller
        </Button>
      </Box>
    </Box>
  );
}

export default App;
