import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import PeopleIcon from '@material-ui/icons/People';
import clsx from 'clsx';
import { useSession } from 'next-auth/client';
import Link from 'next/link';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    whiteSpace: 'nowrap',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: 'flex',
    justifyContent: 'space-between',
    width: '100vw',
    height: 48,
    position: 'fixed',
    bottom: 0,
    left: 0,
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  selected: {
    color: theme.palette.text.primary,
  },
  unSelected: { color: theme.palette.text.hint },
  logo: {
    width: 20,
    height: 20,
  },
  icon: {
    width: 22,
    height: 22,
  },
}));

const NavBar = () => {
  const classes = useStyles();
  const [session, isLoading] = useSession();
  const history = useHistory();
  const tab = useLocation().pathname;
  const user = session && session.user;
  const isMeetingsSelected = tab.includes('meetings');
  const isDocsSelected = tab.includes('docs');
  const isPeopleSelected = tab.includes('people');
  const isHomeSelected = tab.includes('home');
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="bottom"
      open={true}
    >
      <Grid container justify="space-between" alignItems="center">
        {isLoading && (
          <Grid item>
            <IconButton>
              <LoopIcon className={classes.unSelected} />
            </IconButton>
          </Grid>
        )}
        {!session && (
          <Grid item>
            <IconButton>
              <LockOpenIcon className={classes.unSelected} />
            </IconButton>
          </Grid>
        )}
        <Grid item>
          <Link href="/home">
            <IconButton>
              <HomeIcon className={isHomeSelected ? classes.selected : classes.unSelected} />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link href="/meetings">
            <IconButton>
              <CalendarViewDayIcon
                className={isMeetingsSelected ? classes.selected : classes.unSelected}
              />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link href="/docs">
            <IconButton>
              <InsertDriveFileIcon
                className={isDocsSelected ? classes.selected : classes.unSelected}
              />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link href="/people">
            <IconButton>
              <PeopleIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
            </IconButton>
          </Link>
        </Grid>
        {!isLoading && user && (
          <Grid item>
            <IconButton onClick={() => history.push('/settings')}>
              <Avatar
                className={clsx(classes.unSelected, classes.icon)}
                src={user.image || undefined}
                alt={user.name || user.email || undefined}
              />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Drawer>
  );
};

export default NavBar;
