import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { IProps } from '../dashboard';
import DocsForPerson from './docs-for-person';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    background: theme.palette.primary.main,
  },
  title: {
    paddingTop: 5,
    paddingLeft: theme.spacing(2),
  },
  avatar: {
    height: 77,
    width: 77,
  },
}));

interface IPersonProps extends IProps {
  routeId: string | null;
}

const Person = (props: IPersonProps) => {
  const classes = useStyles();
  const person = props.personDataStore.getPersonByEmail(props.routeId!);
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box flexDirection="row" alignItems="flex-start" display="flex">
        {person.imageUrl ? (
          <Avatar className={classes.avatar} src={person.imageUrl} />
        ) : (
          <Avatar className={classes.avatar}>{(person.name || person.id)[0]}</Avatar>
        )}
        <Typography className={classes.title} variant="h2" color="textPrimary" gutterBottom>
          {person.name || person.emailAddress}
        </Typography>
      </Box>
      <DocsForPerson {...props} person={person} />
    </Container>
  );
};

export default Person;
