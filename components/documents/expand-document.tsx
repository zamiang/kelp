import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import useComponentSize from '@rehooks/component-size';
import { addDays, differenceInCalendarDays, format, subDays } from 'date-fns';
import { times } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import EditIcon from '../../public/icons/edit-white.svg';
import ShareIcon from '../../public/icons/person-add-orange.svg';
import { D3Component } from '../shared/bar-chart/bar-chart';
import { Row, classes } from '../shared/row-styles';
import SegmentMeetingList from '../shared/segment-meeting-list';
import { IDocument, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';

const dateFormat = 'MM/dd/yyyy';

const ExpandedDocument = (props: { store: IStore; documentId?: string; close?: () => void }) => {
  const ref = useRef(null);
  const size = useComponentSize(ref);
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
            <Typography variant="h5">
              Modified: {format(document.updatedAt, "EEEE, MMMM d yyyy 'at' p")}
            </Typography>
          )}
        </div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          href={`${document.link}?${shareParams.toString()}`}
          startIcon={<ShareIcon width="24" height="24" />}
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
        <div className={classes.section} ref={ref}>
          <D3Component
            data={Object.values(chartData)}
            width={size.width < 300 ? 300 : size.width}
            height={300}
            minDate={minDate}
            maxDate={maxDate}
            label={'Activity Graph'}
            smallLabel={'for this document'}
          />
        </div>
      </div>
    </Row>
  );
};

export default ExpandedDocument;
