import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { formattedEmail } from '../fetch/fetch-second';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

const useRowStyles = makeStyles(() => ({
  table: {
    width: '100%',
  },
  from: {
    width: '20%',
  },
}));

type classesType = ReturnType<typeof useRowStyles>;

const Email = (props: {
  email: formattedEmail;
  personStore: PersonDataStore;
  classes: classesType;
  handlePersonClick: (email: string) => void;
}) => {
  const emailLink = `https://mail.google.com/mail/u/0/#inbox/${props.email.id}`;
  const from = props.personStore.getPersonByEmail(props.email.from || '') || 'unknown';
  return (
    <TableRow>
      <TableCell className={props.classes.from}>
        <Typography variant="caption">
          <Link color="textPrimary" onClick={() => props.handlePersonClick(props.email.from || '')}>
            {from.name || from.emailAddress}
          </Link>
        </Typography>
      </TableCell>
      <TableCell component="th" scope="row">
        <Typography variant="caption">
          <Link color="textPrimary" target="_blank" href={emailLink}>
            <b>{props.email.subject}</b>
          </Link>
        </Typography>
      </TableCell>
      <TableCell component="th" scope="row">
        <Typography variant="caption">{format(props.email.date, 'MM/dd')}</Typography>
      </TableCell>
    </TableRow>
  );
};

const EmailsForSegment = (props: {
  segment: ISegment;
  emailStore: EmailDataStore;
  personStore: PersonDataStore;
  handlePersonClick: (email: string) => void;
}) => {
  const classes = useRowStyles();
  const emails = props.segment.emailIds.map((emailId) => props.emailStore.getById(emailId));
  const threads = uniqBy(emails, 'threadId');
  if (threads.length < 1) {
    return null;
  }
  return (
    <Table size="small" className={classes.table}>
      <TableBody>
        {threads.map((email) => (
          <Email
            key={email.id}
            email={email}
            personStore={props.personStore}
            classes={classes}
            handlePersonClick={props.handlePersonClick}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default EmailsForSegment;
