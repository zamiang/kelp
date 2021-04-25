import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Documents from '../dashboard/documents';
import Meetings from '../dashboard/meetings';
import People from '../dashboard/people';
import Search from '../dashboard/search';
import Tasks from '../dashboard/tasks';
import { TopWebsites } from '../dashboard/top-websites';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import ExpandedMeeting from '../meeting/expand-meeting';
import { LineCalendar } from '../meeting/line-calendar';
import NavBar from '../nav/nav-bar';
import ExpandPerson from '../person/expand-person';
import { HomepageButtons } from '../shared/homepage-buttons';
import { IStore } from '../store/use-store';
import ExpandTask from '../tasks/expand-task';
import Settings from '../user-profile/settings';

export const drawerWidth = 240;
export const MOBILE_WIDTH = 700;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    overscrollBehavior: 'contain',
    overscrollBehaviorY: 'none',
    overscrollBehaviorX: 'none',
    background: 'linear-gradient(90deg, hsla(150, 60%, 98%, 1) 0%, hsla(40, 60%, 95%, 1) 100%)',
    minHeight: '100vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    overflow: 'hidden',
  },
  center: {
    margin: '0px auto',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(1),
    background: theme.palette.background.paper,
    maxWidth: 530,
    position: 'relative',
    maxHeight: 'calc(100vh - 66px)',
    overflow: 'auto',
    width: '100%',
  },
  fullWidth: {
    maxWidth: '90%',
  },
  rightIcon: {
    float: 'right',
    marginTop: -theme.spacing(1),
    marginRight: -theme.spacing(1),
    opacity: 0.8,
  },
  lineContainer: {
    borderBottom: `2px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  heading: {
    display: 'block',
    marginBottom: theme.spacing(2),
  },
}));

const is500Error = (error: Error) => (error as any).status === 500;

export const DesktopDashboard = (props: { store: IStore }) => {
  const classes = useStyles();
  const store = props.store;
  const router = useHistory();

  const hash = window.location.hash;
  if (hash.includes('meetings')) {
    window.location.hash = '';
    router.push(hash.replace('#', ''));
  }

  const onDialogClose = () => {
    router.push('/home');
  };

  const shouldRenderTopSites = window['chrome'] && window['chrome']['topSites'];

  return (
    <ErrorBoundaryComponent>
      <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>Please reload the page
          <Typography>{store.error}</Typography>
        </Alert>
      </Dialog>
      <div className={classes.content}>
        <Container maxWidth="xl">
          <NavBar store={store} />
          <Container maxWidth="sm">
            <HomepageButtons />
          </Container>
          <Grid container spacing={4} style={{ marginTop: 5 }}>
            <Grid item xs={3}>
              <Typography variant="h4" className={classes.heading}>
                Meetings
              </Typography>
              <Box
                boxShadow={3}
                borderRadius={8}
                maxHeight={'calc(100vh - 230px)'}
                overflow="auto"
                style={{ background: '#fff' }}
              >
                <div className={classes.lineContainer}>
                  <LineCalendar store={store} />
                </div>
                <Meetings store={store} />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h4" className={classes.heading}>
                Tasks
              </Typography>
              <Box
                boxShadow={3}
                borderRadius={8}
                maxHeight={'calc(100vh - 230px)'}
                overflow="auto"
                style={{ background: '#fff' }}
              >
                <Tasks store={store} />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h4" className={classes.heading}>
                Documents
              </Typography>
              <Box
                boxShadow={3}
                borderRadius={8}
                maxHeight={'calc(100vh - 230px)'}
                overflow="auto"
                style={{ background: '#fff' }}
              >
                <Documents store={store} />
              </Box>
            </Grid>
            {!shouldRenderTopSites && (
              <Grid item xs={3}>
                <Typography variant="h4" className={classes.heading}>
                  People
                </Typography>
                <Box
                  boxShadow={3}
                  borderRadius={8}
                  maxHeight={'calc(100vh - 230px)'}
                  overflow="auto"
                  style={{ background: '#fff' }}
                >
                  <People store={store} />
                </Box>
              </Grid>
            )}
            {shouldRenderTopSites && (
              <Grid item xs={3}>
                <Typography variant="h4" className={classes.heading}>
                  Top Sites
                </Typography>
                <Box
                  boxShadow={3}
                  borderRadius={8}
                  maxHeight={'calc(100vh - 230px)'}
                  overflow="auto"
                  style={{ background: '#fff' }}
                >
                  <TopWebsites store={store} />
                </Box>
              </Grid>
            )}
          </Grid>
          <div>
            <Switch>
              <Route path="/search">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <Search store={store} />
                </Dialog>
              </Route>
              <Route path="/meetings/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandedMeeting store={store} />
                </Dialog>
              </Route>
              <Route path="/documents/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandedDocument store={store} />
                </Dialog>
              </Route>
              <Route path="/people/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandPerson store={store} />
                </Dialog>
              </Route>
              <Route path="/tasks/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandTask store={store} />
                </Dialog>
              </Route>
              <Route path="/settings">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <Settings />
                </Dialog>
              </Route>
            </Switch>
          </div>
        </Container>
      </div>
    </ErrorBoundaryComponent>
  );
};
