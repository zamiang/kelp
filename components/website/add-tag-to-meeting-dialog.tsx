import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { isSegmentTagSelected } from '../meeting/featured-meeting';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';

const PREFIX = 'AddTagToMeetingDialog';

const classes = {
  dialogContent: `${PREFIX}-dialogContent`,
  button: `${PREFIX}-button`,
  columnList: `${PREFIX}-columnList`,
  closeButton: `${PREFIX}-closeButton`,
  tag: `${PREFIX}-tag`,
  tagSelected: `${PREFIX}-tagSelected`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.dialogContent}`]: {
    padding: theme.spacing(6),
    position: 'relative',
    width: 480,
  },

  [`& .${classes.button}`]: {
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

  [`& .${classes.columnList}`]: {
    maxHeight: 300,
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
  [`& .${classes.closeButton}`]: {
    position: 'absolute',
    top: 42,
    right: 42,
  },
  [`& .${classes.tag}`]: {
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
  [`& .${classes.tagSelected}`]: {
    pointerEvents: 'all',
    cursor: 'pointer',
    background: theme.palette.primary.main,
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
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.tfidfStore.getCalculatedDocuments();
      if (result.success) {
        const tags = result.data;
        setWebsiteTags(uniq(tags.concat(props.userTags.map((t) => t.tag))).sort() as any);
      }
    };
    void fetchData();
  }, [props.store.isLoading]);

  return (
    <StyledDialog
      maxWidth="md"
      open={props.isOpen}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
    >
      <div className={classes.dialogContent}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h3">Add tags to {props.meeting.summary}</Typography>
            <br />
            <IconButton onClick={props.close} className={classes.closeButton} size="large">
              <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
            </IconButton>
          </Box>
        </Box>
        <List className={classes.columnList} disablePadding>
          {websiteTags.map((t) => (
            <ListItem
              key={t}
              onClick={() =>
                props.toggleMeetingTag(t, props.meeting.id, props.meeting.summary || '')
              }
              sx={{
                cursor: 'pointer',
                backgroundColor: isSegmentTagSelected(props.meeting.id, t, props.meetingTags)
                  ? 'action.selected'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText primary={t} />
            </ListItem>
          ))}
        </List>
      </div>
    </StyledDialog>
  );
};
