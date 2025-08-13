import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { isSegmentTagSelected } from '../meeting/featured-meeting';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import '../../styles/components/website/add-tag-to-meeting-dialog.css';

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
    <Dialog
      maxWidth="md"
      open={props.isOpen}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          containerType: 'inline-size',
          containerName: 'add-tag-to-meeting-dialog',
        },
      }}
    >
      <div className="add-tag-to-meeting-dialog-content">
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h3">Add tags to {props.meeting.summary}</Typography>
            <br />
            <IconButton
              onClick={props.close}
              className="add-tag-to-meeting-dialog-close-button"
              size="large"
            >
              <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
            </IconButton>
          </Box>
        </Box>
        <List className="add-tag-to-meeting-dialog-column-list" disablePadding>
          {websiteTags.map((t) => (
            <ListItem
              key={t}
              onClick={() =>
                props.toggleMeetingTag(t, props.meeting.id, props.meeting.summary || '')
              }
              className={`add-tag-to-meeting-dialog-list-item ${
                isSegmentTagSelected(props.meeting.id, t, props.meetingTags)
                  ? 'add-tag-to-meeting-dialog-list-item-selected'
                  : ''
              }`}
            >
              <ListItemText primary={t} />
            </ListItem>
          ))}
        </List>
      </div>
    </Dialog>
  );
};
