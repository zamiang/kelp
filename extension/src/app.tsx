import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { DocumentsForToday } from '../../components/dashboard/documents';
import { PeopleToday } from '../../components/dashboard/people';
import MeetingRow from '../../components/meeting/meeting-row';
import db from '../../components/store/db';
import { ISegment } from '../../components/store/models/segment-model';
import { googleAPIRefs } from '../../components/store/use-gapi';
import getStore from '../../components/store/use-store';
import theme from '../../constants/theme';
import { Loading } from '../../pages/dashboard/index';

const API_KEY = 'AIzaSyCEe5HmzHPg8mjJ_bfQmjEUncaqWlRXGx0';

const useStyles = makeStyles((theme) => ({
  app: {
    minWidth: 300,
    minHeight: 300,
    padding: 10,
  },
  header: {
    backgroundColor: theme.palette.background.paper,
  },
}));

const onGAPILoad = (setToken: (token: string) => void) => {
  const loadLibraries = async () => {
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: googleAPIRefs,
      });
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        gapi.auth.setToken({
          access_token: token,
        } as any);

        setToken(token);
      });
    } catch (e) {
      console.error(e);
    }
  };
  gapi.load('client', loadLibraries as any);
};

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
}));

const Info = (props: { database: any }) => {
  const store = getStore(props.database);
  const classes = useInfoStyles();
  const currentTime = new Date();
  const [segments, setSegments] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await store.timeDataStore.getSegmentsForDay(currentTime);
      setSegments(result.sort((a, b) => (a.start < b.start ? -1 : 1)));
    };
    void fetchData();
  }, [store]);

  return (
    <Grid container className={classes.homeRow} spacing={4}>
      <Grid item xs={12} sm={4}>
        <Typography variant="h6" className={classes.smallHeading}>
          Today&apos;s schedule
        </Typography>
        <Divider />
        {segments.map((meeting) => (
          <MeetingRow
            isSmall={true}
            key={meeting.id}
            meeting={meeting}
            selectedMeetingId={null}
            store={store}
            shouldRenderCurrentTime={false}
          />
        ))}
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant="h6" className={classes.smallHeading}>
          People you are meeting with today
        </Typography>
        <Divider />
        <PeopleToday {...store} selectedPersonId={null} noLeftMargin={true} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant="h6" className={classes.smallHeading}>
          Documents you may need today
        </Typography>
        <Divider />
        <DocumentsForToday {...store} selectedDocumentId={null} isSmall={true} />
      </Grid>
    </Grid>
  );
};

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [database, setDatabase] = useState<any>(undefined);
  const classes = useStyles();

  useEffect(() => {
    onGAPILoad(setToken);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setDatabase(await db('production'));
    };
    void fetchData();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.app}>
        <header className={classes.header}>
          <Loading isOpen={!token || !database} message="Loading" />
        </header>
        {token && database && <Info database={database} />}
      </div>
    </ThemeProvider>
  );
};

export default App;
