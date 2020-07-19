import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { uniqBy } from 'lodash';
import React from 'react';
import EmailDataStore, { IEmail } from '../store/email-store';
import PersonDataStore from '../store/person-store';

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
  email: IEmail;
  personStore: PersonDataStore;
  classes: classesType;
  handlePersonClick: (email?: string) => void;
}) => {
  const emailLink = `https://mail.google.com/mail/u/0/#inbox/${props.email.id}`;
  const person = props.personStore.getPersonById(props.email.fromPersonId);
  return (
    <Grid container wrap="nowrap" spacing={2} alignItems="center">
      <Grid item onClick={() => props.handlePersonClick(person && person.emailAddress)}>
        <Avatar style={{ height: 32, width: 32 }} src={(person && person.imageUrl) || ''}>
          {person && props.personStore.getPersonDisplayName(person)[0]}
        </Avatar>
      </Grid>
      <Grid item zeroMinWidth>
        <Typography variant="body2" noWrap>
          <Link color="textPrimary" target="_blank" href={emailLink}>
            <b>{props.email.subject}</b> {props.email.snippet}
          </Link>
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          onClick={() => props.handlePersonClick(person && person.emailAddress)}
        >
          {person && props.personStore.getPersonDisplayName(person)}
        </Typography>
      </Grid>
    </Grid>
  );
};

const EmailsList = (props: {
  emailIds: string[];
  emailStore: EmailDataStore;
  personStore: PersonDataStore;
  handlePersonClick: (email?: string) => void;
}) => {
  const classes = useRowStyles();
  const emails = props.emailIds.map((emailId) => props.emailStore.getById(emailId));
  const threads = uniqBy(emails, 'threadId');
  if (threads.length < 1) {
    return null;
  }
  return (
    <div className={classes.root}>
      <div className={classes.paper}>
        {threads.map(
          (email) =>
            email && (
              <Email
                key={email.id}
                email={email}
                personStore={props.personStore}
                classes={classes}
                handlePersonClick={props.handlePersonClick}
              />
            ),
        )}
      </div>
    </div>
  );
};

export default EmailsList;
