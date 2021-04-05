import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import useComponentSize from '@rehooks/component-size';
import clsx from 'clsx';
import { addDays, differenceInCalendarDays, format, subDays } from 'date-fns';
import { times, uniqBy } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../constants/config';
import EditIcon from '../../public/icons/edit-white.svg';
import ShareIcon from '../../public/icons/person-add-orange.svg';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import PersonRow from '../person/person-row';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import SegmentMeetingList from '../shared/segment-meeting-list';
import { getPeopleSortedByCount } from '../store/helpers';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ITaskDocument } from '../store/models/task-document-model';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';
import TaskRow from '../tasks/task-row';
import { D3Component } from '../timeline/bar-chart';

const dateFormat = 'MM/dd/yyyy';

const TaskDocumentRow = (props: { store: IStore; taskDocument: ITaskDocument }) => {
  const [task, setTask] = useState<ITask | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.taskDocument.documentId) {
        const result = await props.store.taskStore.getById(props.taskDocument.taskId);
        if (result) {
          setTask(result);
        }
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.taskDocument.id]);

  if (!task) {
    return null;
  }

  return <TaskRow task={task} store={props.store} selectedTaskId={null} />;
};

const ExpandedDocument = (props: { store: IStore; documentId?: string; close?: () => void }) => {
  const ref = useRef(null);
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const size = useComponentSize(ref);
  const { slug }: any = useParams();
  const documentId = props.documentId || slug;
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  const [driveActivity, setDriveActivity] = useState<IFormattedDriveActivity[]>([]);
  const [people, setPeople] = useState<IPerson[]>([]);
  const [peopleStats, setPeopleStats] = useState<any>({});
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);
  const [taskDocuments, setTaskDocuments] = useState<ITaskDocument[]>([]);

  const minDate = new Date(subDays(new Date(), 12));
  const maxDate = new Date(addDays(new Date(), 2));

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.documentDataStore.getByLink(documentId);
        setDocument(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.driveActivityStore.getDriveActivityForDocument(documentId);
        setDriveActivity(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.segmentDocumentStore.getAllForDocumentId(documentId);
        setSegmentDocuments(result.filter((r) => !!r.segmentId));
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.taskDocumentStore.getAllForDocumentId(documentId);
        setTaskDocuments(uniqBy(result, 'taskId'));
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (driveActivity.length > 0) {
        const people = await getPeopleSortedByCount(
          driveActivity.map((a) => a.actorPersonId).filter(Boolean) as any,
          props.store.personDataStore,
        );
        setPeople(people.sortedPeople.slice(0, 5));
        setPeopleStats(people.peopleStats);
      } else {
        setPeople([]);
        setPeopleStats({});
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId, driveActivity.length]);

  if (!document) {
    return null;
  }

  // chart data
  const chartData = {} as any;
  times(differenceInCalendarDays(maxDate, minDate), (interval: number) => {
    const date = addDays(minDate, interval);
    const dateFormatted = format(date, dateFormat);
    chartData[dateFormatted] = {
      rate: 0,
      date,
      type: 'document',
    };
  });

  segmentDocuments.map((activity) => {
    const date = format(activity.date, dateFormat);
    if (chartData[date]) {
      chartData[date].rate++;
    }
  });

  // share button
  const shareParams = new URLSearchParams({
    actionButton: '1',
    userstoinvite: '',
  });

  return (
    <React.Fragment>
      <div className={classes.topContainer}>
        <div className={classes.headingContainer}>
          <Typography variant="h3" color="textPrimary" gutterBottom>
            {document.name || '(no title)'}
          </Typography>
          {document.updatedAt && (
            <Typography variant="h5">
              Modified: {format(document.updatedAt, "EEEE, MMMM d yyyy 'at' p")}
            </Typography>
          )}
        </div>
        <Button
          className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
          variant="outlined"
          href={`${document.link}?${shareParams.toString()}`}
          startIcon={<ShareIcon width="24" height="24" />}
          target="_blank"
        >
          Share Document
        </Button>
        <div style={{ margin: '10px auto 0 ' }}>
          <Button
            className={buttonClasses.button}
            variant="contained"
            disableElevation
            color="primary"
            startIcon={<EditIcon width="24" height="24" />}
            href={document.link!}
            target="_blank"
          >
            Edit Document
          </Button>
        </div>
      </div>
      <Divider />
      <div className={classes.container}>
        {people.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Key Contributors
            </Typography>
            <div>
              {people.map(
                (person: IPerson) =>
                  person &&
                  peopleStats[person.id] && (
                    <PersonRow
                      key={person.id}
                      selectedPersonId={null}
                      person={person}
                      info={`${peopleStats[person.id][person.id]} events`}
                    />
                  ),
              )}
            </div>
          </div>
        )}
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6">Meetings</Typography>
            <SegmentMeetingList
              segmentDocuments={segmentDocuments}
              timeStore={props.store.timeDataStore}
              personStore={props.store.personDataStore}
            />
          </div>
        )}
        {taskDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Related Tasks
            </Typography>
            <div>
              {taskDocuments.map(
                (taskDocument) =>
                  taskDocument && (
                    <TaskDocumentRow
                      key={taskDocument.taskId}
                      store={props.store}
                      taskDocument={taskDocument}
                    />
                  ),
              )}
            </div>
          </div>
        )}
        <div className={classes.section} ref={ref}>
          <D3Component
            data={Object.values(chartData)}
            width={size.width < 300 ? 300 : size.width}
            height={300}
            minDate={minDate}
            maxDate={maxDate}
            startGradient={config.BLUE_BACKGROUND}
            endGradient={config.BLUE_BACKGROUND}
            label={'Activity Graph'}
            smallLabel={'for this document'}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
