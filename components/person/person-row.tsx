import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useButtonStyles from '../shared/button-styles';
import isTouchEnabled from '../shared/is-touch-enabled';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/data-types';

const useStyles = makeStyles((theme) => ({
  personAccepted: {},
  personTentative: {
    opacity: 0.8,
  },
  personDeclined: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  personNeedsAction: {
    opacity: 0.8,
  },
  person: {
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
}));

const PersonRow = (props: {
  selectedPersonId: string | null;
  person: IPerson;
  info?: string;
  responseStatus?: string;
  text?: string;
  noMargin?: boolean;
}) => {
  const classes = useStyles();
  const isSelected = props.selectedPersonId === props.person.id;
  const rowStyles = useRowStyles();
  const buttonStyles = useButtonStyles();
  const router = useHistory();
  const [isDetailsVisible, setDetailsVisible] = useState(isTouchEnabled());
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  const name = props.person.name || props.person.id;

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        router.push(`/people/${encodeURIComponent(props.person.id)}`);
        return false;
      }}
      onMouseEnter={() => !isTouchEnabled() && setDetailsVisible(true)}
      onMouseLeave={() => !isTouchEnabled() && setDetailsVisible(false)}
      ref={setReferenceElement as any}
      className={clsx(
        rowStyles.row,
        props.noMargin && rowStyles.rowSmall,
        classes.person,
        props.responseStatus === 'accepted' && classes.personAccepted,
        props.responseStatus === 'tentative' && classes.personTentative,
        props.responseStatus === 'declined' && classes.personDeclined,
        props.responseStatus === 'needsAction' && classes.personNeedsAction,
        isSelected && rowStyles.rowPrimaryMain,
      )}
    >
      <Grid container alignItems="center" wrap="nowrap">
        <Grid item className={rowStyles.rowLeft}>
          {props.person.imageUrl ? (
            <Avatar
              alt={`Profile photo for ${
                props.person.name || props.person.emailAddresses[0] || undefined
              }`}
              className={rowStyles.avatar}
              src={props.person.imageUrl}
            />
          ) : (
            <Avatar
              alt={props.person.name || props.person.emailAddresses[0] || undefined}
              className={rowStyles.avatar}
            >
              {(props.person.name || props.person.id)[0]}
            </Avatar>
          )}
        </Grid>
        <Grid item xs zeroMinWidth>
          <div className={rowStyles.rowTopPadding}>
            <Grid container>
              <Grid item xs={12} zeroMinWidth>
                <Typography noWrap className={rowStyles.hoverText}>
                  {name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" noWrap>
                  {props.person.notes}
                </Typography>
              </Grid>
              {props.info && (
                <Grid item xs={12}>
                  <Typography variant="body2" noWrap>
                    {props.info}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </div>
        </Grid>
        {isDetailsVisible && props.person.emailAddresses[0] && (
          <Grid item style={{ marginLeft: 'auto', paddingTop: 0, paddingBottom: 0 }}>
            <Button
              className={buttonStyles.button}
              variant="contained"
              color="primary"
              style={{ minHeight: 0 }}
              onClick={(event) => {
                event.stopPropagation();
                void navigator.clipboard.writeText(props.person.emailAddresses[0]);
                return false;
              }}
            >
              Copy Email
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default PersonRow;
