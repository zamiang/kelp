import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import PeopleIcon from '@material-ui/icons/People';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { person } from '../fetch/fetch-people';
import { IStore } from '../store/use-store';

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

const NavBar = (props: { store: IStore }) => {
  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [currentUser, setCurrentUser] = useState<person | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.personDataStore.getSelf();
      if (result) {
        setCurrentUser(result);
      }
      setIsLoading(false);
    };
    void fetchData();
  }, [props.store.lastUpdated]);

  const tab = useLocation().pathname;
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
        {!currentUser && (
          <Grid item>
            <IconButton>
              <LockOpenIcon className={classes.unSelected} />
            </IconButton>
          </Grid>
        )}
        <Grid item>
          <Link to="/home" component={RouterLink}>
            <IconButton>
              <HomeIcon className={isHomeSelected ? classes.selected : classes.unSelected} />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/meetings" component={RouterLink}>
            <IconButton>
              <CalendarViewDayIcon
                className={isMeetingsSelected ? classes.selected : classes.unSelected}
              />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/docs" component={RouterLink}>
            <IconButton>
              <InsertDriveFileIcon
                className={isDocsSelected ? classes.selected : classes.unSelected}
              />
            </IconButton>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/people" component={RouterLink}>
            <IconButton>
              <PeopleIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
            </IconButton>
          </Link>
        </Grid>
        {!isLoading && currentUser && (
          <Grid item>
            <IconButton onClick={() => history.push('/settings')}>
              <Avatar
                className={clsx(classes.unSelected, classes.icon)}
                src={currentUser.imageUrl || undefined}
                alt={currentUser.name || currentUser.emailAddresses[0] || undefined}
              />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Drawer>
  );
};

export default NavBar;
