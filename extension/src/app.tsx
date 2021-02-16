import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { DocumentsForToday } from '../../components/dashboard/documents';
import { PeopleToday } from '../../components/dashboard/people';
import MeetingRow from '../../components/meeting/meeting-row';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import { ISegment } from '../../components/store/models/segment-model';
import getStore from '../../components/store/use-store';
import theme from '../../constants/theme';

// NOTE: Copied from manifest.json - remember to update both
const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.activity.readonly',
].join(' ');

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

const Info = (props: { database: any; accessToken: string; scope: string }) => {
  const store = getStore(props.database, props.accessToken, props.scope);
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
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      setToken(token);
    });
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
        {token && database && <Info database={database} accessToken={token} scope={scopes} />}
      </div>
    </ThemeProvider>
  );
};

export default App;
