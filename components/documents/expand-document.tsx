import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { addDays, differenceInCalendarDays, format, subDays } from 'date-fns';
import { times } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../constants/config';
import EditIcon from '../../public/icons/edit.svg';
import ShareIcon from '../../public/icons/person-add.svg';
import { Row, classes } from '../shared/row-styles';
import SegmentMeetingList from '../shared/segment-meeting-list';
import { IDocument, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache } from '../website/get-featured-websites';

const dateFormat = 'MM/dd/yyyy';

const ExpandedDocument = (props: {
  store: IStore;
  documentId?: string;
  close?: () => void;
  websiteCache: IWebsiteCache;
}) => {
  const { slug }: any = useParams();
  const documentId = props.documentId || slug;
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);

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
        const result = await props.store.segmentDocumentStore.getAllForDocumentId(documentId);
        setSegmentDocuments(result.filter((r) => !!r.segmentId));
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

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
    <Row>
      <div className={classes.topContainer}>
        <div className={classes.headingContainer}>
          <Typography variant="h3" color="textPrimary" gutterBottom>
            {document.name || '(no title)'}
          </Typography>
          {document.updatedAt && (
            <Typography variant="body2">
              Modified: {format(document.updatedAt, "EEEE, MMMM d yyyy 'at' p")}
            </Typography>
          )}
        </div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          href={`${document.link}?${shareParams.toString()}`}
          startIcon={
            <ShareIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              className={classes.iconPrimary}
            />
          }
          target="_blank"
        >
          Share Document
        </Button>
        <div style={{ margin: '10px auto 0 ' }}>
          <Button
            className={classes.button}
            variant="contained"
            disableElevation
            color="primary"
            startIcon={
              <EditIcon
                width={config.ICON_SIZE}
                height={config.ICON_SIZE}
                className={classes.iconPrimary}
              />
            }
            href={document.link!}
            target="_blank"
          >
            Edit Document
          </Button>
        </div>
      </div>
      <Divider />
      <div className={classes.container}>
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h3">Meetings</Typography>
            <SegmentMeetingList
              segmentDocuments={segmentDocuments}
              timeStore={props.store.timeDataStore}
              personStore={props.store.personDataStore}
              websiteCache={props.websiteCache}
            />
          </div>
        )}
      </div>
    </Row>
  );
};

export default ExpandedDocument;
