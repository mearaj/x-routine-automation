import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { openOrFocusControllerTab } from "@/utils/tabs.ts";
import { fetchVerifiedByRadioWaterMelonUsers } from "@/utils/globalState";
import { extractUsername, extractUsernameFromUrl } from "@/utils/common.ts";

function App() {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [verifiedSet, setVerifiedSet] = useState<Set<string>>(new Set());
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isCurrentUserVerified, setIsCurrentUserVerified] = useState<boolean | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [isInputUserVerified, setIsInputUserVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const url = tabs?.[0]?.url || "";
          const username = extractUsernameFromUrl(url);
          setCurrentUsername(username);

          const set = await fetchVerifiedByRadioWaterMelonUsers();
          setVerifiedSet(set);
          setCount(set.size);

          if (username) {
            setIsCurrentUserVerified(set.has(username.toLowerCase()));
          }

          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to load Radio Watermelon users", err);
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const extracted = extractUsername(inputValue);
    if (extracted && verifiedSet.size > 0) {
      setIsInputUserVerified(verifiedSet.has(extracted.toLowerCase()));
    } else {
      setIsInputUserVerified(null);
    }
  }, [inputValue, verifiedSet]);

  return (
    <Box width="100%" p={2}>
      <Typography textAlign="center" variant="h6" gutterBottom>
        Welcome to X-Routine-Automation
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Typography textAlign="center" variant="body2" color="text.secondary">
          Radio Watermelon Users Loaded: <strong>{count}</strong>
        </Typography>
      )}

      {currentUsername && isCurrentUserVerified !== null && (
        <Typography
          textAlign="center"
          variant="body2"
          mt={1}
          color={isCurrentUserVerified ? "green" : "red"}
        >
          {isCurrentUserVerified
            ? `✅ Current page user (${currentUsername}) is Verified`
            : `❌ Current page user (${currentUsername}) is NOT Verified`}
        </Typography>
      )}

      <Box mt={4}>
        <TextField
          label="Check Username"
          size="small"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue.trim() !== '' && isInputUserVerified !== null && (
          <Typography mt={1} color={isInputUserVerified ? 'green' : 'red'}>
            {isInputUserVerified ? '✅ Input User is Verified' : '❌ Input User is NOT Verified'}
          </Typography>
        )}
      </Box>

      <Box height="36px" />

      <Box display="flex" flexDirection="column" gap={3}>
        <Button onClick={openOrFocusControllerTab}>
          Open Controller
        </Button>
      </Box>
    </Box>
  );
}

export default App;
