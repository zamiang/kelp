import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/styled-engine';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IPerson } from '../store/data-types';

const PREFIX = 'PersonRow';

const classes = {
  personAccepted: `${PREFIX}-personAccepted`,
  personTentative: `${PREFIX}-personTentative`,
  personDeclined: `${PREFIX}-personDeclined`,
  personNeedsAction: `${PREFIX}-personNeedsAction`,
  person: `${PREFIX}-person`,
  avatar: `${PREFIX}-avatar`,
  row: `${PREFIX}-row`,
  rowSmall: `${PREFIX}-rowSmall`,
  rowLeft: `${PREFIX}-rowLeft`,
  rowPrimaryMain: `${PREFIX}-rowPrimaryMain`,
  rowTopPadding: `${PREFIX}-rowTopPadding`,
  hoverText: `${PREFIX}-hoverText`,
  button: `${PREFIX}-button`,
};

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.personAccepted}`]: {},
  [`& .${classes.personTentative}`]: {
    opacity: 0.8,
  },
  [`& .${classes.avatar}`]: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  [`& .${classes.personDeclined}`]: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  [`& .${classes.hoverText}`]: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  [`& .${classes.row}`]: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    animation: `${fadeInAnimation} ease 0.4s`,
    animationIterationCount: 1,
    animationFillMode: 'forwards',
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.rowSmall}`]: {
    padding: 0,
  },
  [`& .${classes.rowPrimaryMain}`]: {
    background: theme.palette.divider,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.light,
      background: theme.palette.secondary.light,
    },
  },
  [`& .${classes.personNeedsAction}`]: {
    opacity: 0.8,
  },
  [`& .${classes.rowTopPadding}`]: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  [`& .${classes.rowLeft}`]: {
    textAlign: 'center',
    marginRight: theme.spacing(2),
  },
  [`&.${classes.person}`]: {
    transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
    opacity: 1,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.button}`]: {
    width: '100%',
    borderRadius: 30,
    paddingTop: 6,
    paddingBottom: 6,
    transition: 'opacity 0.3s',
    minHeight: 48,
    opacity: 1,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      opacity: 0.6,
    },
  },
}));

const PersonRow = (props: {
  selectedPersonId: string | null;
  person: IPerson;
  info?: string;
  responseStatus?: string;
  text?: string;
  noMargin?: boolean;
}) => {
  const isSelected = props.selectedPersonId === props.person.id;
  const navigate = useNavigate();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  const name = props.person.name || props.person.id;

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <Root
      onClick={(event) => {
        event.stopPropagation();
        navigate(`/people/${encodeURIComponent(props.person.id)}`);
        return false;
      }}
      ref={setReferenceElement as any}
      className={clsx(
        classes.row,
        props.noMargin && classes.rowSmall,
        classes.person,
        props.responseStatus === 'accepted' && classes.personAccepted,
        props.responseStatus === 'tentative' && classes.personTentative,
        props.responseStatus === 'declined' && classes.personDeclined,
        props.responseStatus === 'needsAction' && classes.personNeedsAction,
        isSelected && classes.rowPrimaryMain,
      )}
    >
      <Box display="flex" alignItems="center" flexWrap="nowrap">
        <Box className={classes.rowLeft}>
          {props.person.imageUrl ? (
            <Avatar
              alt={`Profile photo for ${
                props.person.name || props.person.emailAddresses[0] || undefined
              }`}
              className={classes.avatar}
              src={props.person.imageUrl}
            />
          ) : (
            <Avatar
              alt={props.person.name || props.person.emailAddresses[0] || undefined}
              className={classes.avatar}
            >
              {(props.person.name || props.person.id)[0]}
            </Avatar>
          )}
        </Box>
        <Box flex="1" minWidth={0}>
          <div className={classes.rowTopPadding}>
            <Box>
              <Box minWidth={0}>
                <Typography noWrap className={classes.hoverText}>
                  {name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" noWrap>
                  {props.person.notes}
                </Typography>
              </Box>
              {props.info && (
                <Box>
                  <Typography variant="body2" noWrap>
                    {props.info}
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
        </Box>
      </Box>
    </Root>
  );
};

export default PersonRow;
