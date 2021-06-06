import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IDocument, ISegment, IWebsiteImage } from '../store/data-types';
import { IStore } from '../store/use-store';

interface IFeaturedWebsite {
  documentId?: string;
  websiteId: string;
  document?: IDocument;
  meetings: ISegment[];
  text?: string;
  date: Date;
}

/**
 * Gets documents in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next
 */
const maxResult = 25;
const daysToLookBack = 7;
const getFeaturedWebsites = async (props: IStore) => {
  const currentDate = new Date();

  // For documents edited by the current user that may not be associated with a meeting
  const driveActivity = await props.driveActivityStore.getCurrentUserDriveActivity();
  const websites = await props.websitesStore.getAll();

  const filterTime = subDays(currentDate, daysToLookBack);
  const filteredWebsites = websites.filter((item) => item.visitedTime > filterTime);
  const filteredDriveActivity = driveActivity.filter((item) => item.time > filterTime);

  const urlCount: { [url: string]: number } = {};

  const currentUserDocuments = filteredDriveActivity
    .map((item) => {
      if (!item.documentId) {
        return null;
      }
      if (urlCount[item.link]) {
        urlCount[item.link] = urlCount[item.link] + 1;
      } else {
        urlCount[item.link] = 1;
      }
      return {
        documentId: item.id,
        meetings: [] as any,
        nextMeetingStartsAt: undefined,
        websiteId: item.link,
        text: item.title,
        date: item.time,
      } as IFeaturedWebsite;
    })
    .filter(Boolean) as IFeaturedWebsite[];

  const websiteVisits = filteredWebsites.map((item) => {
    if (urlCount[item.url]) {
      urlCount[item.url] = urlCount[item.url] + 1;
    } else {
      urlCount[item.url] = 1;
    }
    return {
      documentId: item.documentId,
      meetings: item.meetingId ? [item.meetingId] : ([] as any),
      nextMeetingStartsAt: undefined,
      websiteId: item.url,
      text: item.title,
      date: item.visitedTime,
    } as IFeaturedWebsite;
  });

  const concattedWebsitesAndDocuments = uniqBy(
    currentUserDocuments.concat(websiteVisits).sort((a, b) => (a.date > b.date ? -1 : 1)),
    'websiteId',
  );

  return concattedWebsitesAndDocuments
    .sort((a, b) => (urlCount[a.websiteId] > urlCount[b.websiteId] ? -1 : 1))
    .slice(0, maxResult);
};

const LargeWebsite = (props: { store: IStore; item: IFeaturedWebsite }) => {
  const [image, setImage] = useState<IWebsiteImage>();

  useEffect(() => {
    const fetchData = async () => {
      const i = await props.store.websiteImageStore.getById(props.item.websiteId);
      console.log(i, '<<<<image<', props.item.websiteId);
      setImage(i);
    };
    void fetchData();
  }, []);

  if (!image) {
    return null;
  }

  return (
    <Grid item xs={3}>
      <a
        href={props.item.websiteId}
        style={{
          display: 'block',
          paddingBottom: '66%',
          overflow: 'hidden',
          height: 0,
          background: '/dots.png',
          position: 'relative',
          marginBottom: 8,
        }}
      >
        {image && (
          <img
            src={image?.image}
            style={{
              maxWidth: '100%',
            }}
          />
        )}
        <div
          style={{
            backgroundImage:
              'radial-gradient(rgba(250, 250, 250, 0.5) 20%, transparent 20%), radial-gradient(rgba(250, 250, 250, 0.5) 20%, transparent 20%)',
            backgroundPosition: '0 0, 5px 5px',
            backgroundSize: '3px 3px',
            backgroundRepeat: 'repeat',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        ></div>
      </a>
      <Link href={props.item.websiteId}>
        <Typography variant="h4" noWrap>
          {props.item.text}
        </Typography>
      </Link>
    </Grid>
  );
};

const AllWebsites = (props: { store: IStore }) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredWebsite = await getFeaturedWebsites(props.store);
      setTopWebsites(featuredWebsite.filter(Boolean));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <div>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid container spacing={4}>
        {topWebsites.map((item) => (
          <LargeWebsite key={item.websiteId} item={item} store={props.store} />
        ))}
      </Grid>
    </div>
  );
};

const WebsitesHighlights = (props: { store: IStore }) => (
  <div>
    <AllWebsites store={props.store} />
  </div>
);

export default WebsitesHighlights;
