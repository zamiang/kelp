import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { mediumFontFamily } from '../../constants/theme';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getWebsitesForMeeting } from '../website/get-featured-websites';
import { FeaturedWebsiteRow } from '../website/website-row';

const maxNumberOfWebsites = 5;

const useBelowStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  heading: {
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    marginBottom: theme.spacing(0.5),
    textAlign: 'left',
    marginLeft: theme.spacing(2),
  },
}));

const MeetingRowBelow = (props: { meeting: ISegment; store: IStore; shouldPadLeft: boolean }) => {
  const classes = useBelowStyles();
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getWebsitesForMeeting(props.meeting, props.store);
      setWebsites(result.slice(0, maxNumberOfWebsites));
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting.id]);

  const hasWebsites = websites.length > 0;
  return (
    <React.Fragment>
      {hasWebsites && (
        <React.Fragment>
          <Typography variant="h6" className={classes.heading}>
            Websites you may need
          </Typography>
          {websites.map((item) => (
            <FeaturedWebsiteRow key={item.websiteId} featuredWebsite={item} store={props.store} />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default MeetingRowBelow;
