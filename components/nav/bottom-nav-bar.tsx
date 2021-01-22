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
import { useRouter } from 'next/router';
import React from 'react';

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

interface IProps {
  tab: 'meetings' | 'docs' | 'people' | 'week' | 'settings' | 'summary' | 'search' | 'home';
}

const NavBar = (props: IProps) => {
  const classes = useStyles();
  const [session, isLoading] = useSession();
  const router = useRouter();
  const user = session && session.user;
  const isMeetingsSelected = props.tab === 'meetings';
  const isDocsSelected = props.tab === 'docs';
  const isPeopleSelected = props.tab === 'people';
  const isHomeSelected = props.tab === 'home';
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
            <LoopIcon className={classes.unSelected} />
          </Grid>
        )}
        {!session && (
          <Grid item>
            <LockOpenIcon className={classes.unSelected} />
          </Grid>
        )}
        <Grid item>
          <Link href="?tab=home">
            <IconButton>
              <HomeIcon className={isHomeSelected ? classes.selected : classes.unSelected} />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link href="?tab=meetings">
            <IconButton>
              <CalendarViewDayIcon
                className={isMeetingsSelected ? classes.selected : classes.unSelected}
              />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link href="?tab=docs">
            <IconButton>
              <InsertDriveFileIcon
                className={isDocsSelected ? classes.selected : classes.unSelected}
              />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link href="?tab=people">
            <IconButton>
              <PeopleIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
            </IconButton>
          </Link>
        </Grid>
        {!isLoading && user && (
          <Grid item>
            <IconButton onClick={() => router.push('?tab=settings')}>
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
