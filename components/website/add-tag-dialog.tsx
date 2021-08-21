import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import { isSegmentTagSelected } from '../meeting/featured-meeting';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(6),
    position: 'relative',
  },
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    borderRadius: 33,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    display: 'block',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    top: 42,
    right: 42,
  },
  tag: {
    display: 'inline-block',
    marginRight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    transition: 'opacity 0.3s',
    borderRadius: 5,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  tagSelected: {
    pointerEvents: 'all',
    cursor: 'pointer',
    background: theme.palette.primary.dark,
  },
}));

export const AddTagToMeetingDialog = (props: {
  meeting: ISegment;
  userTags: IWebsiteTag[];
  close: () => void;
  isOpen: boolean;
  meetingTags: ISegmentTag[];
  toggleMeetingTag: (tag: string, segmentId: string, segmentSummary: string) => void;
  store: IStore;
}) => {
  const classes = useStyles();
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.tfidfStore.getCalculatedDocuments();
      if (result) {
        const tags = result;
        setWebsiteTags(uniq(tags.concat(props.userTags.map((t) => t.tag))).sort() as any);
      }
    };
    void fetchData();
  }, [props.store.lastUpdated]);

  return (
    <Dialog
      maxWidth="md"
      open={props.isOpen}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
    >
      <div className={classes.dialogContent}>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography variant="h3">Add tags to {props.meeting.summary}</Typography>
            <br />
            <IconButton onClick={props.close} className={classes.closeButton}>
              <CloseIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container alignItems="center" justifyContent="space-between">
          {websiteTags.map((t) => (
            <Grid item xs={2} key={t} zeroMinWidth>
              <div
                onClick={() =>
                  props.toggleMeetingTag(t, props.meeting.id, props.meeting.summary || '')
                }
                className={clsx(
                  classes.tag,
                  isSegmentTagSelected(props.meeting.id, t, props.meetingTags) &&
                    classes.tagSelected,
                )}
              >
                <Typography>{t}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </Dialog>
  );
};
