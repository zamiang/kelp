import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Documents from '../dashboard/documents';
import Meetings from '../dashboard/meetings';
import People from '../dashboard/people';
import Search from '../dashboard/search';
import ExpandedDocument from '../documents/expand-document';
import ExpandedMeeting from '../meeting/expand-meeting';
import ExpandPerson from '../person/expand-person';
import { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import Handle404 from './handle-404';
import PopupHeader from './popup-header';

const useInfoStyles = makeStyles((theme) => ({
  homeRow: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    width: '100%',
    fontWeight: 500,
    display: 'block',
    '&:first-child': {
      marginTop: 0,
    },
  },
  container: {
    position: 'relative',
    maxHeight: 'calc(100vh - 92px)',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    zIndex: 15,
  },
}));

const MobileDashboard = (props: { store: IStore }) => {
  const store = props.store;
  const classes = useInfoStyles();
  const history = useHistory();

  const [user, setUser] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const user = await store.personDataStore.getSelf();
      if (user) {
        setUser(user);
      }
    };
    void fetchData();
  }, [store.isLoading]);

  return (
    <div>
      <PopupHeader user={user} store={store} />
      <div className={classes.container}>
        <Switch>
          <Route path="/search/docs/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/search/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/search/people/:slug">
            <ExpandPerson store={store} />
          </Route>
          <Route path="/search">
            <Search store={store} />
          </Route>
          <Route path="/people/:slug">
            <ExpandPerson store={store} />
          </Route>
          <Route path="/docs/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/meetings">
            <Meetings hideHeading store={store} />
          </Route>
          <Route path="/people">
            <People hideHeading store={store} />
          </Route>
          <Route path="/documents">
            <Documents hideHeading store={store} />
          </Route>
          <Route path="/settings">
            <Settings shouldRenderHeader={false} />
          </Route>
          <Route>
            <Handle404 />
          </Route>
        </Switch>
      </div>
      <footer className={classes.footer}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={4}>
            <IconButton
              onClick={() => {
                history.push('/meetings');
              }}
            >
              <HomeIcon />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <IconButton
              onClick={() => {
                history.push('/people');
              }}
            >
              <GroupIcon />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <IconButton
              onClick={() => {
                history.push('/documents');
              }}
            >
              <InsertDriveFileIcon />
            </IconButton>
          </Grid>
        </Grid>
      </footer>
    </div>
  );
};
export default MobileDashboard;
