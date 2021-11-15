import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../constants/config';
import MoveIcon from '../../public/icons/move.svg';
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
  icon: `${PREFIX}-icon`,
  iconVisible: `${PREFIX}-iconVisible`,
  dotContainer: `${PREFIX}-dotContainer`,
  iconImage: `${PREFIX}-iconImage`,
  iconSelected: `${PREFIX}-iconSelected`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: { maxHeight: '80vh', overflow: 'auto' },
  [`& .${classes.tag}`]: {
    cursor: 'pointer',
    height: 24,
    opacity: 0.5,
    transition: 'opacity 0.6s ease-out',
    '&:hover': {
      opacity: 1,
    },
  },
  [`& .${classes.icon}`]: {
    opacity: 0,
    transition: 'opacity 0.6s ease-out',
  },
  [`& .${classes.iconVisible}`]: {
    opacity: 1,
  },
  [`& .${classes.tagContainer}`]: {
    [`&:hover .${classes.dot}`]: {
      width: 10,
      height: 10,
      background: theme.palette.text.primary,
    },
    [`&:hover .${classes.icon}`]: {
      opacity: 0.5,
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
  [`& .${classes.iconImage}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
}));

const getItemStyle = (draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'rgba(0,0,0, 0.15)' : 'transparent',
});

export const TopTags = (props: {
  websiteTags: IWebsiteTag[];
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  setWebsiteTags: (t: IWebsiteTag[]) => void;
  dragDropSource?: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const shouldShowBack = location.pathname !== '/home';

  const onClickTag = (tag: string) => {
    const isHomeSelected = location.pathname === '/home';
    if (isHomeSelected) {
      const elem = document.getElementById(`tag-${tag}`);
      elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      navigate('/home');
      setTimeout(() => {
        const elem = document.getElementById(`tag-${tag}`);
        elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
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
      <Droppable
        droppableId="top-tags"
        direction="vertical"
        isDropDisabled={props.dragDropSource?.includes('-websites')}
      >
        {(provided, snapshot) => (
          <Grid
            container
            className={classes.container}
            alignItems="center"
            spacing={1}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {shouldShowBack && (
              <Grid item>
                <IconButton onClick={() => navigate('/home')} size="small">
                  <LeftArrow
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    style={{ transform: 'rotate(180deg)' }}
                    className={classes.iconImage}
                  />
                </IconButton>
              </Grid>
            )}
            {props.websiteTags.map((t, index) => (
              <Draggable draggableId={t.tag} index={index} key={t.tag}>
                {(provided, snapshot) => (
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
                              variant="body2"
                            >
                              {t.tag}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            className={clsx(
                              classes.icon,
                              snapshot.isDragging && classes.iconVisible,
                            )}
                          >
                            {snapshot.isDragging ? (
                              <MoveIcon
                                width={config.ICON_SIZE}
                                height={config.ICON_SIZE}
                                className={classes.iconSelected}
                              />
                            ) : (
                              <MoveIcon
                                width={config.ICON_SIZE}
                                height={config.ICON_SIZE}
                                className={classes.iconImage}
                              />
                            )}
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
              <Typography variant="body2" className={classes.tag} onClick={() => onClickTag('all')}>
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
                variant="body2"
                className={classes.tag}
                color="primary"
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
  const navigate = useNavigate();

  const onClickTag = (tag: string) => {
    const elem = document.getElementById(`tag-${tag}`);
    elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Root>
      <Grid container className={classes.container} alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={() => navigate('/home')} size="small">
            <LeftArrow
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ transform: 'rotate(180deg)' }}
              className={classes.iconImage}
            />
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
                <Typography
                  noWrap
                  variant="body2"
                  className={classes.tag}
                  onClick={() => onClickTag(t)}
                >
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

export const ExpandMeetingNav = () => {
  const navigate = useNavigate();
  return (
    <Root>
      <Grid container className={classes.container} alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={() => navigate('/home')} size="small">
            <LeftArrow
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ transform: 'rotate(180deg)' }}
              className={classes.iconImage}
            />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" className={classes.tagContainer}>
            <Grid item>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Grid>
            <Grid item zeroMinWidth xs>
              <Typography
                noWrap
                variant="body2"
                className={classes.tag}
                onClick={() =>
                  document.getElementById('websites')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Websites
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
            <Grid item zeroMinWidth xs>
              <Typography
                noWrap
                variant="body2"
                className={classes.tag}
                onClick={() =>
                  document.getElementById('people')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Guests
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};

export const ExpandPersonNav = () => {
  const navigate = useNavigate();
  return (
    <Root>
      <Grid container className={classes.container} alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={() => navigate('/home')} size="small">
            <LeftArrow
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ transform: 'rotate(180deg)' }}
              className={classes.iconImage}
            />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" className={classes.tagContainer}>
            <Grid item>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Grid>
            <Grid item zeroMinWidth xs>
              <Typography
                noWrap
                variant="body2"
                className={classes.tag}
                onClick={() =>
                  document.getElementById('websites')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Websites
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
            <Grid item zeroMinWidth xs>
              <Typography
                noWrap
                variant="body2"
                className={classes.tag}
                onClick={() =>
                  document.getElementById('people')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                People
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
            <Grid item zeroMinWidth xs>
              <Typography
                noWrap
                variant="body2"
                className={classes.tag}
                onClick={() =>
                  document.getElementById('meetings')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Meetings
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};
