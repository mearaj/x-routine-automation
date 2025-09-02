import { useState, useMemo } from 'react'
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Drawer,
} from '@mui/material'
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import { NavLink, Outlet, useLocation } from 'react-router'
import {useSelector} from "react-redux";
import type {RootState} from "@/store";

export default function Controller() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
const activeUsername = useSelector((state: RootState) => state.user.activeUsername);
  const sidebarWidth = collapsed ? 72 : 240

  const navItems = useMemo(
    () => [
      { to: 'users', label: 'Manage Users', icon: <PeopleAltRoundedIcon /> },
      { to: 'follows', label: 'Manage Follows', icon: <Diversity3RoundedIcon /> },
      { to: 'urls', label: 'Manage URLs', icon: <LinkRoundedIcon /> },
      { to: 'tweets', label: 'Manage Tweets', icon: <ChatBubbleOutlineRoundedIcon /> },
    ],
    []
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            transition: theme => theme.transitions.create('width', { duration: 200 }),
          },
        }}
      >
        {/* Brand + collapse button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', px: 1.5, py: 1 }}>
          {!collapsed && (
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              X Routine Automation
            </Typography>
          )}
          <IconButton size="small" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
          </IconButton>
        </Box>
        <Divider />

        {/* Navigation */}
        <List sx={{ py: 1 }}>
          {navItems.map(item => (
            <ListItem key={item.to} disablePadding sx={{ display: 'block' }}>
              <NavLink to={item.to} end>
                {({ isActive }) => {
                  // Mark Manage Users active for both "/" and "/users"
                  const active = item.to === 'users' && location.pathname === '/' ? true : isActive
                  return (
                    <Tooltip title={collapsed ? item.label : ''} placement="right">
                      <ListItemButton
                        selected={active}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          mb: 0.5,
                          minHeight: 44,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          '&.Mui-selected': {
                            bgcolor: 'action.selected',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, justifyContent: 'center' }}>
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && <ListItemText primary={item.label} />}
                      </ListItemButton>
                    </Tooltip>
                  )
                }}
              </NavLink>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* Optional footer area in the sidebar */}
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {!collapsed && (
            <Typography variant="caption" color="text.secondary">
              v1.0.21
            </Typography>
          )}
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 2,
        }}
      >
        {/* Optional page header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2,flexDirection:"row" }}>
          <Typography variant="h6" fontWeight={700}>
            Welcome to X Routine Automation
          </Typography>
          <Typography gutterBottom>
            Active user: <strong>{activeUsername}</strong>
          </Typography>
        </Box>


        <Outlet />
      </Box>
    </Box>
  )
}
//https://x.com/mahdybarwad70
