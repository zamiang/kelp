import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useHistory, useLocation } from 'react-router-dom';
import LeftArrow from '../../public/icons/right-arrow.svg';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTaggDialog } from './add-tag-dialog';

const PREFIX = 'TopTags';

const classes = {
  container: `${PREFIX}-container`,
  tag: `${PREFIX}-tag`,
  tagContainer: `${PREFIX}-tagContainer`,
  removeButton: `${PREFIX}-removeButton`,
  dot: `${PREFIX}-dot`,
  dotContainer: `${PREFIX}-dotContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {},
  [`& .${classes.tag}`]: {
    cursor: 'pointer',
    height: 24,
    opacity: 0.5,
    transition: 'opacity 0.6s ease-out',
    '&:hover': {
      opacity: 1,
    },
  },
  [`& .${classes.tagContainer}`]: {
    [`&:hover .${classes.dot}`]: {
      width: 10,
      height: 10,
      background: theme.palette.text.primary,
    },
  },
  [`& .${classes.dot}`]: {
    height: 6,
    width: 6,
    borderRadius: 5,
    transition: 'all 0.6s ease-out',
    marginRight: 'auto',
    marginLeft: 'auto',
    background: theme.palette.divider,
  },
  [`& .${classes.dotContainer}`]: {
    width: theme.spacing(3),
  },
}));

const getItemStyle = (draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = () => ({
  // width: itemsLength * 68.44 + 16,
});

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const TopTags = (props: {
  websiteTags: IWebsiteTag[];
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  setWebsiteTags: (t: IWebsiteTag[]) => void;
}) => {
  const location = useLocation();
  const router = useHistory();
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const shouldShowBack = location.pathname !== '/home';

  const onClickTag = (tag: string) => {
    const isHomeSelected = location.pathname === '/home';
    if (isHomeSelected) {
      const elem = document.getElementById(`tag-${tag}`);
      elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      router.push('/home');
      setTimeout(() => {
        const elem = document.getElementById(`tag-${tag}`);
        elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  };

  const onDragEnd = (result: any) => {
    // TODO
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const tt = reorder(props.websiteTags, result.source.index, result.destination.index);

    props.setWebsiteTags(tt);
  };

  return (
    <Root>
      <AddTaggDialog
        userTags={props.websiteTags}
        isOpen={isDialogOpen}
        store={props.store}
        close={() => setDialogOpen(false)}
        toggleWebsiteTag={props.toggleWebsiteTag}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="top-tags" direction="vertical">
          {(provided) => (
            <Grid
              container
              className={classes.container}
              alignItems="center"
              spacing={1}
              ref={provided.innerRef}
              style={getListStyle()}
              {...provided.droppableProps}
            >
              {shouldShowBack && (
                <Grid item>
                  <IconButton onClick={() => router.push('/home')} size="small">
                    <LeftArrow width="24" height="24" style={{ transform: 'rotate(180deg)' }} />
                  </IconButton>
                </Grid>
              )}
              {props.websiteTags.map((t, index) => (
                <Draggable draggableId={t.tag} index={index} key={t.tag}>
                  {(provided) => (
                    <Grid
                      item
                      xs={12}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(provided.draggableProps.style)}
                    >
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        className={classes.tagContainer}
                      >
                        <Grid item zeroMinWidth xs>
                          <Grid container alignItems="center">
                            <Grid item>
                              <div className={classes.dotContainer}>
                                <div className={classes.dot}></div>
                              </div>
                            </Grid>
                            <Grid item zeroMinWidth xs>
                              <Typography
                                noWrap
                                className={classes.tag}
                                onClick={() => onClickTag(t.tag)}
                              >
                                {t.tag}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
      <br />
      <Grid container className={classes.container} alignItems="center" spacing={1}>
        <Grid item xs={12}>
          <Grid container alignItems="center" className={classes.tagContainer}>
            <Grid item>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Grid>
            <Grid item>
              <Typography className={classes.tag} onClick={() => onClickTag('all')}>
                Recent
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" className={classes.tagContainer}>
            <Grid item>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Grid>
            <Grid item>
              <Typography
                color="primary"
                className={classes.tag}
                onClick={() => setDialogOpen(true)}
              >
                Add a tag
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};

export const WebsiteTags = (props: { tags: string[]; store: IStore }) => {
  const router = useHistory();

  const onClickTag = (tag: string) => {
    const elem = document.getElementById(`tag-${tag}`);
    elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Root>
      <Grid container className={classes.container} alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={() => router.push('/home')} size="small">
            <LeftArrow width="24" height="24" style={{ transform: 'rotate(180deg)' }} />
          </IconButton>
        </Grid>
        {props.tags.map((t) => (
          <Grid item xs={12} key={t}>
            <Grid container alignItems="center" className={classes.tagContainer}>
              <Grid item>
                <div className={classes.dotContainer}>
                  <div className={classes.dot}></div>
                </div>
              </Grid>
              <Grid item zeroMinWidth xs>
                <Typography noWrap className={classes.tag} onClick={() => onClickTag(t)}>
                  {t}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Root>
  );
};
