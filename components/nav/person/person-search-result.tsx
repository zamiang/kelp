import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import PopperContainer from '../../shared/popper';
import useRowStyles from '../../shared/row-styles';
import { IPerson } from '../../store/person-store';
import { IStore } from '../../store/use-store';
import ExpandedPerson from './expand-person';

const useStyles = makeStyles((theme) => ({
  name: { minWidth: 300 },
  email: { minWidth: 200 },
  avatar: { marginLeft: -5 },
  row: {
    margin: 0,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.divider,
    },
  },
}));

const PersonSearchResult = (props: { person: IPerson; store: IStore }) => {
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event?.currentTarget);
  };
  const isOpen = Boolean(anchorEl);
  return (
    <ListItem
      onClick={handleClick}
      className={clsx('ignore-react-onclickoutside', rowStyles.row, classes.row)}
    >
      <Link href={`?tab=people&slug=${props.person.id}`}>
        <Grid container spacing={1} alignItems="center">
          <PopperContainer anchorEl={anchorEl} isOpen={isOpen} setIsOpen={() => setAnchorEl(null)}>
            <ExpandedPerson
              close={() => setAnchorEl(null)}
              personId={props.person.id}
              {...props.store}
            />
          </PopperContainer>
          <Grid item className={classes.avatar}>
            {props.person.imageUrl ? (
              <Avatar style={{ height: 24, width: 24 }} src={props.person.imageUrl} />
            ) : (
              <Avatar style={{ height: 24, width: 24 }}>
                {(props.person.name || props.person.id)[0]}
              </Avatar>
            )}
          </Grid>
          <Grid item className={classes.name} zeroMinWidth>
            <Typography variant="body2" noWrap>
              <b>{props.person.name || props.person.id}</b>
            </Typography>
          </Grid>
        </Grid>
      </Link>
    </ListItem>
  );
};

export default PersonSearchResult;
