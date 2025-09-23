// ManageURLsPage.tsx
import {Box, Button, IconButton, List, ListItem, ListItemText, TextField, Typography} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "../../../store/store.ts";
import {userActions} from "../../../store/slices/userSlice.ts";
import {useState} from "react";

interface UrlManagerSectionProps {
  label: string;
  excluded: boolean;
  urls: string[];
}

const defaultFundraiserURLs = [
  "https://zeffy.com",
  "https://gofundme.com",
  "https://paypal.com",
  "https://gogetfunding.com",
  "https://gofund.me",
  "https://paypal.me",
  "https://social.fund",
  "https://ko-fi.com",
  "https://yemenstarving.org",
  "https://chuffed.org",
  "https://donorbox.org",
  "https://spot.fund",
  "https://remitly.com",
  "https://www.remitly.com/",
]

const UrlManagerSection = ({label, excluded, urls}: UrlManagerSectionProps) => {
  const dispatch = useDispatch();
  const activeUsername = useSelector((state: RootState) => state.user.activeUsername);
  const [newURL, setNewURL] = useState('');

  const handleAdd = () => {
    if (!activeUsername) return;

    const parts = newURL
      .split(/[\s,;]+/)
      .map(p => p.trim())
      .filter(Boolean);

    const normalized = parts.map(p =>
      p.startsWith('http') ? p : `https://${p}`
    );

    normalized.forEach(url => {
      dispatch(userActions.addFundraiserUrlForActiveUser({url, excluded}));
    });

    setNewURL('');
  };

  const handleAddDefaults = () => {
    if (!activeUsername) return;

    const currentSet = new Set(urls);
    defaultFundraiserURLs.forEach((url) => {
      const normalized = url.trim();
      if (!currentSet.has(normalized)) {
        dispatch(userActions.addFundraiserUrlForActiveUser({url: normalized, excluded}));
      }
    });
  };

  const handleRemove = (url: string) => {
    if (activeUsername) {
      dispatch(userActions.removeUrlForActiveUser({url, excluded}));
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">{label}</Typography>

      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <TextField
          label="Enter URL(s)"
          size="small"
          fullWidth
          value={newURL}
          onChange={(e) => setNewURL(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd} disabled={!newURL.trim()}>
          Add
        </Button>

        {!excluded && (
          <Button variant="outlined" onClick={handleAddDefaults}>
            Add Default Fundraisers
          </Button>
        )}
      </Box>

      <List dense sx={{mt: 2}}>
        {urls.map((url) => (
          <ListItem
            key={url}
            disableGutters
            secondaryAction={
              <IconButton onClick={() => handleRemove(url)} edge="end">
                <Delete />
              </IconButton>
            }
          >
            <ListItemText primary={url} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const ManageURLsPage = () => {
  const activeUsername = useSelector((state: RootState) => state.user.activeUsername);
  const fundraiserURLs = useSelector((state: RootState) =>
    activeUsername ? state.user.fundraiserURLs ?? [] : []
  );
  const fundraiserExcludedURLs = useSelector((state: RootState) =>
    activeUsername ? state.user.fundraiserExcludedURLs ?? [] : []
  );

  return (
    <Box p={2}>
      <UrlManagerSection
        label="Fundraiser URLs"
        excluded={false}
        urls={fundraiserURLs}
      />
      <UrlManagerSection
        label="Excluded Fundraiser URLs"
        excluded={true}
        urls={fundraiserExcludedURLs}
      />
    </Box>
  );
};

export default ManageURLsPage;
