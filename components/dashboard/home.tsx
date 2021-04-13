import { IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ArrowIcon from '../../public/icons/chevron-right.svg';
import PlusIcon from '../../public/icons/plus-orange.svg';
import { FeaturedMeeting } from '../dashboard/meetings';
import DocumentRow from '../documents/document-row';
import PersonRow from '../person/person-row';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedDocument, getFeaturedDocuments } from './documents';
import { IFeaturedPerson, getFeaturedPeople } from './people';

const Home = (props: { store: IStore }) => {
  const classes = panelStyles();
  const rowClasses = useRowStyles();
  const buttonClasses = useButtonStyles();
  const router = useHistory();

  const currentTime = new Date();
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);
  const [topDocuments, setTopDocuments] = useState<IFeaturedDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay(
        subDays(setMinutes(setHours(new Date(), 0), 0), 0),
      );
      setMeetingsByDay(result);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  let featuredMeeting: ISegment | undefined;
  // Assumes meetings are already sorted
  flatten(Object.values(meetingsByDay)).forEach((meeting) => {
    if (!featuredMeeting && currentTime < meeting.end) {
      featuredMeeting = meeting;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const fp = await getFeaturedPeople(props.store);
      setFeaturedPeople(fp);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredDocuments = await getFeaturedDocuments(props.store);
      setTopDocuments(featuredDocuments.filter(Boolean));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <div className={classes.panel}>
      <div className={rowClasses.row} style={{ background: 'none', cursor: 'default' }}>
        <Grid container spacing={2} justify="space-between">
          <Grid item>
            <Button
              className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              variant="outlined"
              startIcon={<PlusIcon width="24" height="24" />}
            >
              Meeting
            </Button>
          </Grid>
          <Grid item>
            <Button
              className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              variant="outlined"
              startIcon={<PlusIcon width="24" height="24" />}
            >
              Task
            </Button>
          </Grid>
          <Grid item>
            <Button
              className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              variant="outlined"
              startIcon={<PlusIcon width="24" height="24" />}
            >
              Smart Notes
            </Button>
          </Grid>
        </Grid>
      </div>
      {featuredMeeting && <FeaturedMeeting meeting={featuredMeeting} store={props.store} />}
      {topDocuments.length > 0 && (
        <div className={rowClasses.rowHighlight}>
          <Typography className={rowClasses.rowText} variant="h6">
            Recent documents
            <IconButton onClick={() => router.push('/documents')} className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          {topDocuments.map((document) => (
            <DocumentRow
              key={document.document.id}
              document={document.document}
              store={props.store}
              selectedDocumentId={null}
              text={document.text}
            />
          ))}
        </div>
      )}
      {featuredPeople.length > 0 && (
        <div className={rowClasses.rowHighlight}>
          <Typography variant="h6" className={rowClasses.rowText}>
            People you are meeting with next
            <IconButton onClick={() => router.push('/people')} className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          {featuredPeople.map((featuredPerson) => (
            <PersonRow
              key={featuredPerson.person.id}
              person={featuredPerson.person}
              selectedPersonId={null}
              text={featuredPerson.text}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
