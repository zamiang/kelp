import Avatar from '@material-ui/core/Avatar';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';
import ExpandedPerson from './expand-person';

const useStyles = makeStyles(() => ({
  name: { minWidth: 300 },
  email: { minWidth: 200 },
}));

const PersonRow = (props: { selectedPersonId: string | null; person: IPerson; store: IStore }) => {
  const isSelected = props.selectedPersonId === props.person.id;
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const router = useRouter();
  const anchorRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isSelected && anchorRef.current) {
      anchorRef.current.scrollIntoView();
    }
  }, []);

  const [anchorEl, setAnchorEl] = React.useState(isSelected ? anchorRef : null);
  const handleClick = (event: any) => {
    if (!anchorEl) {
      setAnchorEl(anchorEl ? null : event?.currentTarget);
      return router.push(`?tab=people&slug=${props.person.id}`);
    }
  };
  const isOpen = Boolean(anchorRef.current) && Boolean(anchorEl);
  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <ListItem
        button={true}
        onClick={handleClick}
        ref={anchorRef}
        className={clsx(
          'ignore-react-onclickoutside',
          rowStyles.row,
          isSelected && rowStyles.orangeBackground,
        )}
      >
        <Grid container spacing={2} alignItems="center">
          <PopperContainer anchorEl={anchorEl} isOpen={isOpen}>
            <ExpandedPerson personId={props.person.id} {...props.store} />
          </PopperContainer>
          <Grid item>
            {props.person.imageUrl ? (
              <Avatar className={rowStyles.avatar} src={props.person.imageUrl} />
            ) : (
              <Avatar className={rowStyles.avatar}>
                {(props.person.name || props.person.id)[0]}
              </Avatar>
            )}
          </Grid>
          <Grid item className={classes.name} zeroMinWidth>
            <Typography variant="body2" noWrap>
              <b>{props.person.name || props.person.id}</b>
            </Typography>
          </Grid>
          <Grid item className={classes.email}>
            <Typography variant="body2" noWrap>
              {props.person.emailAddress}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" noWrap>
              {props.person.notes}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </ClickAwayListener>
  );
};

export default PersonRow;
