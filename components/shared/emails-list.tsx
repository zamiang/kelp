import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { uniqBy } from 'lodash';
import Link from 'next/link';
import React from 'react';
import EmailDataStore, { IEmail } from '../store/email-store';
import PersonDataStore from '../store/person-store';

const useRowStyles = makeStyles((theme) => ({
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
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

type classesType = ReturnType<typeof useRowStyles>;

const Email = (props: { email: IEmail; personStore: PersonDataStore; classes: classesType }) => {
  const classes = useRowStyles();
  const emailLink = `https://mail.google.com/mail/u/0/#inbox/${props.email.id}`;
  const person = props.personStore.getPersonById(props.email.fromPersonId);
  if (!person) {
    return null;
  }
  return (
    <Grid container wrap="nowrap" spacing={2} alignItems="center">
      <Grid item>
        <Link href={`?tab=people&slug=${person.id}`}>
          <Avatar
            style={{ height: 32, width: 32 }}
            src={(person && person.imageUrl) || ''}
            className={classes.avatar}
          >
            {person && props.personStore.getPersonDisplayName(person)[0]}
          </Avatar>
        </Link>
      </Grid>
      <Grid item zeroMinWidth>
        <Typography variant="body2" noWrap>
          <MuiLink color="textPrimary" target="_blank" rel="noreferrer" href={emailLink}>
            <b>{props.email.subject}</b> {props.email.snippet}
          </MuiLink>
        </Typography>
        <Link href={`?tab=people&slug=${person.id}`} passHref>
          <Typography variant="caption" color="textSecondary" component="a">
            {person && props.personStore.getPersonDisplayName(person)}
          </Typography>
        </Link>
      </Grid>
    </Grid>
  );
};

const EmailsList = (props: {
  emailIds: string[];
  emailStore: EmailDataStore;
  personStore: PersonDataStore;
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
              />
            ),
        )}
      </div>
    </div>
  );
};

export default EmailsList;
