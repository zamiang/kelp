import Box from '@mui/material/Box';
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
    height: 20,
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
          <Box
            className={classes.container}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {shouldShowBack && (
              <Box>
                <IconButton onClick={() => navigate('/home')} size="small">
                  <LeftArrow
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    style={{ transform: 'rotate(180deg)' }}
                    className={classes.iconImage}
                  />
                </IconButton>
              </Box>
            )}
            {props.websiteTags.map((t, index) => (
              <Draggable draggableId={t.tag} index={index} key={t.tag}>
                {(provided, snapshot) => (
                  <Box
                    width="100%"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(provided.draggableProps.style)}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      className={classes.tagContainer}
                    >
                      <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center">
                          <Box>
                            <div className={classes.dotContainer}>
                              <div className={classes.dot}></div>
                            </div>
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              noWrap
                              className={classes.tag}
                              onClick={() => onClickTag(t.tag)}
                              variant="body2"
                            >
                              {t.tag}
                            </Typography>
                          </Box>
                          <Box
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
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
      <br />
      <Box
        className={classes.container}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box>
              <Typography variant="body2" className={classes.tag} onClick={() => onClickTag('all')}>
                Recent
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box>
              <Typography
                variant="body2"
                className={classes.tag}
                color="primary"
                style={{ fontWeight: 600 }}
                onClick={() => setDialogOpen(true)}
              >
                Add a tag
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
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
      <Box
        className={classes.container}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <Box>
          <IconButton onClick={() => navigate('/home')} size="small">
            <LeftArrow
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ transform: 'rotate(180deg)' }}
              className={classes.iconImage}
            />
          </IconButton>
        </Box>
        {props.tags.map((t) => (
          <Box width="100%" key={t}>
            <Box display="flex" alignItems="center" className={classes.tagContainer}>
              <Box>
                <div className={classes.dotContainer}>
                  <div className={classes.dot}></div>
                </div>
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography
                  noWrap
                  variant="body2"
                  className={classes.tag}
                  onClick={() => onClickTag(t)}
                >
                  {t}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Root>
  );
};

export const ExpandMeetingNav = () => {
  const navigate = useNavigate();
  return (
    <Root>
      <Box
        className={classes.container}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <Box>
          <IconButton onClick={() => navigate('/home')} size="small">
            <LeftArrow
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ transform: 'rotate(180deg)' }}
              className={classes.iconImage}
            />
          </IconButton>
        </Box>
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box flex={1} minWidth={0}>
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
            </Box>
          </Box>
        </Box>
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box flex={1} minWidth={0}>
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Root>
  );
};

export const ExpandPersonNav = () => {
  const navigate = useNavigate();
  return (
    <Root>
      <Box
        className={classes.container}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <Box>
          <IconButton onClick={() => navigate('/home')} size="small">
            <LeftArrow
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ transform: 'rotate(180deg)' }}
              className={classes.iconImage}
            />
          </IconButton>
        </Box>
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box flex={1} minWidth={0}>
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
            </Box>
          </Box>
        </Box>
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box flex={1} minWidth={0}>
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
            </Box>
          </Box>
        </Box>
        <Box width="100%">
          <Box display="flex" alignItems="center" className={classes.tagContainer}>
            <Box>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Box>
            <Box flex={1} minWidth={0}>
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Root>
  );
};
