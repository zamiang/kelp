import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { IProps } from './dashboard';
import { ISegment } from './store/time-store';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

const Row = (props: { row: ISegment }) => {
  const [isOpen, setOpen] = useState(false);
  const classes = useRowStyles();
  return (
    <React.Fragment>
      <TableRow className={classes.root} hover onClick={() => setOpen(!isOpen)}>
        <TableCell style={{ width: '1%', paddingRight: '1px' }} align="right">
          <Typography variant="h6">{format(props.row.start, 'd')}</Typography>
        </TableCell>
        <TableCell style={{ width: '1%', textTransform: 'uppercase', paddingTop: '7px' }}>
          <Typography variant="caption">{format(props.row.start, 'MMM')}</Typography>
        </TableCell>
        <TableCell style={{ width: '168px' }}>
          {format(props.row.start, 'p')}–{format(props.row.end, 'p')}
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="h6">
            <Link color="textPrimary" target="_blank" href={props.row.link || ''}>
              {props.row.summary}
            </Link>
          </Typography>
        </TableCell>
        <TableCell align="right">
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              {JSON.stringify(props.row)}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Meetings = (props: IProps) => {
  const meetings = props.timeDataStore.getSegments();
  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Table size="small">
          <TableBody>
            {meetings.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Grid>
    </React.Fragment>
  );
};

export default Meetings;
