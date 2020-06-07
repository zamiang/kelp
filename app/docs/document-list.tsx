import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { IProps } from '../dashboard';
import { IDoc } from '../store/doc-store';

const useRowStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    '& > *': {
      borderBottom: 'unset',
    },
  },
  secondary: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    backgroundColor: theme.palette.secondary.main,
  },
  avatarContainer: {
    width: 42,
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const Row = (props: { row: IDoc }) => {
  const classes = useRowStyles();
  return (
    <React.Fragment>
      <TableRow className={classes.root} hover>
        <TableCell style={{ width: '1%', paddingRight: '1px' }} align="right">
          <Typography variant="h6">{props.row.name}</Typography>
        </TableCell>
        <TableCell style={{ width: '1%', textTransform: 'uppercase', paddingTop: '7px' }}>
          <Typography variant="caption">{props.row.description}</Typography>
        </TableCell>
        <TableCell style={{ width: '168px' }}>{props.row.viewedByMe}</TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="h6">
            <Link color="textPrimary" target="_blank" href={props.row.link || ''}>
              {props.row.name}
            </Link>
          </Typography>
        </TableCell>
        <TableCell align="right" className={classes.avatarContainer}>
          <Avatar className={classes.secondary}>todo</Avatar>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const DocumentList = (props: IProps) => {
  const docs = props.docDataStore.getDocs();
  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Table size="small">
          <TableBody>
            {docs.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Grid>
    </React.Fragment>
  );
};

export default DocumentList;
