// ManageURLsPage.tsx
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
  ListItemText
} from "@mui/material";
import { NavLink } from "react-router";
import { ArrowBack, Delete } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store.ts";
import { userActions } from "@/store/slices/userSlice.ts";
import { useState } from "react";

interface UrlManagerSectionProps {
  label: string;
  excluded: boolean;
  urls: string[];
}

const UrlManagerSection = ({ label, excluded, urls }: UrlManagerSectionProps) => {
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
      dispatch(userActions.addFundraiserUrlForActiveUser({ url, excluded }));
    });

    setNewURL('');
  };

  const handleRemove = (url: string) => {
    if (activeUsername) {
      dispatch(userActions.removeUrlForActiveUser({ url, excluded }));
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">{label}</Typography>

      <Box mt={2} display="flex" gap={1}>
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
      </Box>

      <List dense sx={{ mt: 2 }}>
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
      <NavLink to="../"><ArrowBack /></NavLink>

      {activeUsername && (
        <Typography gutterBottom>
          Active user: <strong>{activeUsername}</strong>
        </Typography>
      )}

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
