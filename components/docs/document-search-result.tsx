import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { IDoc } from '../store/doc-store';
import { IStore } from '../store/use-store';
import ExpandedDocument from './expand-document';

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  image: {
    display: 'block',
    width: '100%',
  },
  time: { minWidth: 160, maxWidth: 180, textAlign: 'right' },
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

const DocumentSearchResult = (props: { doc: IDoc; store: IStore }) => {
  const rowStyles = useRowStyles();
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event: any) => {
    if (!anchorEl) {
      setAnchorEl(anchorEl ? null : event?.currentTarget);
    }
  };
  const isOpen = Boolean(anchorEl);
  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <ListItem
        onClick={handleClick}
        className={clsx(
          'ignore-react-onclickoutside',
          rowStyles.row,
          rowStyles.rowDefault,
          classes.row,
        )}
      >
        <Grid container spacing={1} alignItems="center">
          <PopperContainer anchorEl={anchorEl} isOpen={isOpen}>
            <ExpandedDocument
              documentId={props.doc.id}
              close={() => setAnchorEl(null)}
              {...props.store}
            />
          </PopperContainer>
          <Grid item className={classes.imageContainer}>
            <img src={props.doc.iconLink} className={classes.image} />
          </Grid>
          <Grid item zeroMinWidth xs>
            <Typography noWrap variant="body2">
              <b>{props.doc.name}</b>
            </Typography>
          </Grid>
          <Grid item className={classes.time}>
            <Typography variant="caption" color="textSecondary">
              {format(new Date(props.doc.updatedAt!), "MMM do, yyyy 'at' hh:mm a")}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </ClickAwayListener>
  );
};

export default DocumentSearchResult;
