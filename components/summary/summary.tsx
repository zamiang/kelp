import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { addDays, format, isSameDay, startOfWeek, subDays } from 'date-fns';
import { last, times } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../constants/config';
import { mediumFontFamily } from '../../constants/theme';
import { IWebsite } from '../store/data-types';
import { ITfidfTag } from '../store/models/tfidf-model';
import { IStore } from '../store/use-store';

const numberWeeks = 4;
const daysInWeek = 7;
const topNavHeight = 78;
const margin = 200;
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

const SUMMARY_PREFIX = 'summary';

const summaryClasses = {
  container: `${SUMMARY_PREFIX}-container`,
  weeks: `${SUMMARY_PREFIX}-weeks`,
  days: `${SUMMARY_PREFIX}-days`,
  week: `${SUMMARY_PREFIX}-week`,
  titleContainer: `${SUMMARY_PREFIX}-title-container`,
  border: `${SUMMARY_PREFIX}-border`,
  borderRight: `${SUMMARY_PREFIX}-border-right`,
  item: `${SUMMARY_PREFIX}-item`,
  heading: `${SUMMARY_PREFIX}-heading`,
  currentDay: `${SUMMARY_PREFIX}-currentDay`,
  day: `${SUMMARY_PREFIX}-day`,
  currentDayContainer: `${SUMMARY_PREFIX}-current-day-container`,
  term: `${SUMMARY_PREFIX}-term`,
};

const SummaryContainer = styled('div')(({ theme }) => ({
  [`& .${summaryClasses.container}`]: {
    marginTop: theme.spacing(4),
  },
  [`& .${summaryClasses.weeks}`]: {},
  [`& .${summaryClasses.days}`]: {
    width: '100%',
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  [`& .${summaryClasses.week}`]: {
    flex: 1,
    position: 'relative',
  },
  [`& .${summaryClasses.titleContainer}`]: {
    height: topNavHeight,
  },
  [`& .${summaryClasses.border}`]: {
    width: 1,
    height: 19,
    background: theme.palette.divider,
    marginTop: -15,
  },
  [`& .${summaryClasses.borderRight}`]: {
    width: 1,
    height: 19,
    background: theme.palette.divider,
    marginTop: 20,
  },
  [`& .${summaryClasses.item}`]: {
    flex: 1,
    textAlign: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  [`& .${summaryClasses.heading}`]: { marginBottom: theme.spacing(2) },
  [`& .${summaryClasses.currentDay}`]: {
    borderRadius: '50%',
    background: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  [`& .${summaryClasses.day}`]: {
    width: 24,
    height: 24,
    display: 'inline-block',
    marginTop: 4,
    paddingTop: 3,
    marginBottom: 0,
    fontWeight: 500,
    fontFamily: mediumFontFamily,
  },
  [`& .${summaryClasses.currentDayContainer}`]: {
    flex: 1,
    textAlign: 'center',
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: `calc((100vh - ${topNavHeight + margin}px) / ${numberWeeks})`,
    overflow: 'hidden',
    '&:last-child': {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  },
  [`& .${summaryClasses.term}`]: {
    display: 'inline-block',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const DayTitle = (props: { day: Date }) => (
  <React.Fragment>
    <Typography variant="h3">{format(props.day, 'EEE')}</Typography>
  </React.Fragment>
);

const TitleRow = (props: { start: Date }) => (
  <div className={summaryClasses.titleContainer}>
    <Typography variant="h3" className={summaryClasses.heading}>
      <b>{format(props.start, 'LLLL')}</b> {format(props.start, 'uuuu')}
    </Typography>
    <Box display="flex" alignItems="flex-start">
      <Box className={summaryClasses.item}>
        <DayTitle day={props.start} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box className={summaryClasses.item}>
        <DayTitle day={addDays(props.start, 1)} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box className={summaryClasses.item}>
        <DayTitle day={addDays(props.start, 2)} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box className={summaryClasses.item}>
        <DayTitle day={addDays(props.start, 3)} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box className={summaryClasses.item}>
        <DayTitle day={addDays(props.start, 4)} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box className={summaryClasses.item}>
        <DayTitle day={addDays(props.start, 5)} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box className={summaryClasses.item}>
        <DayTitle day={addDays(props.start, 6)} />
        <div className={summaryClasses.border}></div>
      </Box>
      <Box>
        <div className={summaryClasses.borderRight}></div>
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
      const visits = await props.store.websiteVisitStore.getAllForDay(
        props.store.domainBlocklistStore,
        props.store.websiteBlocklistStore,
        props.day,
      );
      const websiteResults = await Promise.all(
        visits.map((v) => props.store.websiteStore.getById(v.websiteId)),
      );
      const websites = websiteResults
        .filter((result) => result.success && result.data)
        .map((result) => (result.success ? result.data! : null))
        .filter(
          (website): website is NonNullable<typeof website> => website !== null,
        ) as IWebsite[];
      const documents = props.store.tfidfStore.getDocumentsForWebsites(websites);
      const tfidf = props.store.tfidfStore.getTfidfForDocuments(documents);
      const terms = (tfidf.listTermsWithValue() || []).filter((t) => t.term !== '__key');
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
        className={summaryClasses.term}
        key={document.term}
        style={{ fontSize: cleanResult }}
        onClick={() => navigate(`/search?query=${document.term}`)}
      >
        {document.term}
      </Typography>
    );
  });
  return (
    <Box className={summaryClasses.currentDayContainer}>
      <Typography
        className={clsx(summaryClasses.day, isToday && summaryClasses.currentDay)}
        variant="body2"
      >
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
    <div key={week} className={summaryClasses.week}>
      <Box display="flex" className={summaryClasses.days}>
        {getDayColumn(week)}
      </Box>
    </div>
  ));
  return (
    <SummaryContainer>
      <div className={summaryClasses.container}>
        <TitleRow start={start} />
        <div className={summaryClasses.weeks}>{dayRows}</div>
      </div>
    </SummaryContainer>
  );
};
