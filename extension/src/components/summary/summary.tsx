import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { addDays, format, isSameDay, startOfWeek, subDays } from 'date-fns';
import { last, times } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import { IWebsite } from '../store/data-types';
import { ITfidfTag } from '../store/models/enhanced-tfidf-store';
import { IStore } from '../store/use-store';

const numberWeeks = 4;
const daysInWeek = 7;
// const topNavHeight = 78;
// const margin = 200;
const fontMin = 12;
const fontMax = 22;

/**
 * titlerow    || day-title | day-title
 *  --------------
 * hourlabels  || day colummn   |  day column
 *                    hour row  |    hour row
 *                    hour row  |    hour row
 *                       event  |
 */

const DayTitle = (props: { day: Date }) => (
  <React.Fragment>
    <Typography variant="h3">{format(props.day, 'EEE')}</Typography>
  </React.Fragment>
);

const TitleRow = (props: { start: Date }) => (
  <div className="summary-title-container">
    <Typography variant="h3" className="summary-heading">
      <b>{format(props.start, 'LLLL')}</b> {format(props.start, 'uuuu')}
    </Typography>
    <Box display="flex" alignItems="flex-start">
      <Box className="summary-item">
        <DayTitle day={props.start} />
        <div className="summary-border"></div>
      </Box>
      <Box className="summary-item">
        <DayTitle day={addDays(props.start, 1)} />
        <div className="summary-border"></div>
      </Box>
      <Box className="summary-item">
        <DayTitle day={addDays(props.start, 2)} />
        <div className="summary-border"></div>
      </Box>
      <Box className="summary-item">
        <DayTitle day={addDays(props.start, 3)} />
        <div className="summary-border"></div>
      </Box>
      <Box className="summary-item">
        <DayTitle day={addDays(props.start, 4)} />
        <div className="summary-border"></div>
      </Box>
      <Box className="summary-item">
        <DayTitle day={addDays(props.start, 5)} />
        <div className="summary-border"></div>
      </Box>
      <Box className="summary-item">
        <DayTitle day={addDays(props.start, 6)} />
        <div className="summary-border"></div>
      </Box>
      <Box>
        <div className="summary-border-right"></div>
      </Box>
    </Box>
  </div>
);

/**
 *
 * This should manage intersections
 * Potentially, it could have an array of all items that each calendar item adds to
 * each item would then check if it is inside a prior box, and if so, add a class/move them
 */

const DayContent = (props: { store: IStore; day: Date }) => {
  const isToday = isSameDay(props.day, new Date());
  const [tfidfMin, setTfidfMin] = useState(0);
  const [tfidfMax, setTfidfMax] = useState(0);
  const [documents, setDocuments] = useState([] as ITfidfTag[]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const visitsResult = await props.store.websiteVisitStore.getAllForDay(
        props.store.domainBlocklistStore,
        props.store.websiteBlocklistStore,
        props.day,
      );

      if (!visitsResult.success) {
        console.error('Failed to get visits for day:', (visitsResult as any).error);
        setDocuments([]);
        return;
      }

      const visits = visitsResult.data.data;
      const websiteResults = await Promise.all(
        visits.map((v) => props.store.websiteStore.getById(v.websiteId)),
      );
      const websites = websiteResults
        .filter((result) => result.success && result.data)
        .map((result) => (result.success ? result.data! : null))
        .filter(
          (website): website is NonNullable<typeof website> => website !== null,
        ) as IWebsite[];

      // Get documents for websites
      const documentsResult = await props.store.tfidfStore.getDocumentsForWebsites(websites);
      if (!documentsResult.success) {
        console.error('Failed to get documents for websites:', (documentsResult as any).error);
        setDocuments([]);
        return;
      }

      // Get TF-IDF for documents
      const tfidfResult = await props.store.tfidfStore.getTfidfForDocuments(documentsResult.data);
      if (!tfidfResult.success) {
        console.error('Failed to get TF-IDF for documents:', (tfidfResult as any).error);
        setDocuments([]);
        return;
      }

      const tfidf = tfidfResult.data;
      const terms = (tfidf.listTermsWithValue() || []).filter((t: ITfidfTag) => t.term !== '__key');
      setTfidfMax(terms[0]?.tfidf || 0);
      setTfidfMin(last(terms)?.tfidf || 0);

      return setDocuments(terms);
    };
    void fetchData();
  }, [props.store.isLoading]);

  const terms = documents.map((document) => {
    // interpolation yay
    const result =
      fontMin + ((document.tfidf - tfidfMin) / (tfidfMax - tfidfMin)) * (fontMax - fontMin);

    const cleanResult = result > 1 && !Number.isNaN(result) ? result : 1;
    return (
      <Typography
        className="summary-term"
        key={document.term}
        style={{ fontSize: cleanResult }}
        onClick={() => navigate(`/search?query=${document.term}`)}
      >
        {document.term}
      </Typography>
    );
  });
  return (
    <Box className="summary-current-day-container">
      <Typography className={clsx('summary-day', isToday && 'summary-current-day')} variant="body2">
        {format(props.day, 'd')}
      </Typography>
      <div>{terms}</div>
    </Box>
  );
};

export const Summary = (props: { store: IStore }) => {
  const [start] = useState<Date>(
    subDays(
      startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }),
      (numberWeeks - 1) * daysInWeek,
    ),
  );
  const getDayColumn = (week: number) => {
    const days = times(daysInWeek).map((day) => addDays(start, day + week * daysInWeek));
    return days.map((day) => <DayContent store={props.store} day={day} key={day.toISOString()} />);
  };
  const dayRows = times(numberWeeks).map((week) => (
    <div key={week} className="summary-week">
      <Box display="flex" className="summary-days">
        {getDayColumn(week)}
      </Box>
    </div>
  ));
  return (
    <div className="summary-container">
      <TitleRow start={start} />
      <div className="summary-weeks">{dayRows}</div>
    </div>
  );
};
