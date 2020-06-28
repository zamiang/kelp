import { Avatar, Grid, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { uniqBy } from 'lodash';
import React from 'react';
import { formattedEmail } from '../fetch/fetch-second';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

const useRowStyles = makeStyles(() => ({
  from: {
    minWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  paper: {
    maxWidth: '45vw',
  },
  root: {
    flexGrow: 1,
    overflow: 'hidden',
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
  const person = props.personStore.getPersonByEmail(props.email.from || '');
  return (
    <Grid container wrap="nowrap" spacing={3} alignItems="center">
      <Grid item onClick={() => props.handlePersonClick(person && person.emailAddress)}>
        <Avatar style={{ height: 32, width: 32 }} src={person.imageUrl || ''}>
          {props.personStore.getPersonDisplayName(person)[0]}
        </Avatar>
      </Grid>
      <Grid item xs={3} onClick={() => props.handlePersonClick(person && person.emailAddress)}>
        <Typography variant="body2">{props.personStore.getPersonDisplayName(person)}</Typography>
      </Grid>
      <Grid item xs={8} zeroMinWidth>
        <Typography variant="body2" noWrap>
          <Link color="textPrimary" target="_blank" href={emailLink}>
            <b>{props.email.subject}</b> {props.email.snippet}
          </Link>
        </Typography>
      </Grid>
    </Grid>
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
    <div className={classes.root}>
      <div className={classes.paper}>
        {threads.map((email) => (
          <Email
            key={email.id}
            email={email}
            personStore={props.personStore}
            classes={classes}
            handlePersonClick={props.handlePersonClick}
          />
        ))}
      </div>
    </div>
  );
};

export default EmailsForSegment;
