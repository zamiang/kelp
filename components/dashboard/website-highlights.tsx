import { Typography } from '@material-ui/core';
import { subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import panelStyles from '../shared/panel-styles';
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

  return (
    <div>
      <a href={props.item.websiteId}>
        {image && <img src={image?.image} />}
        {<Typography>{props.item.text}</Typography>}
      </a>
    </div>
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
    <div style={{ marginBottom: 14, marginTop: 14 }}>
      {shouldRenderLoading && <LoadingSpinner />}
      {topWebsites.map((item) => (
        <LargeWebsite key={item.websiteId} item={item} store={props.store} />
      ))}
    </div>
  );
};

const WebsitesHighlights = (props: { store: IStore }) => {
  const classes = panelStyles();

  return (
    <div className={classes.panel}>
      <AllWebsites store={props.store} />
    </div>
  );
};

export default WebsitesHighlights;
