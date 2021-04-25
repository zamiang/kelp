import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  container: { padding: theme.spacing(2) },
  form: { width: '100%', marginBottom: theme.spacing(2) },
  textField: {},
  button: {},
}));

export const NewMeeting = () => {
  const classes = useStyles();

  const googleCalendarLink = 'foo'; // `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${startAt.valueOf()}z%2F${endAt.valueOf()}`;

  return (
    <div className={classes.container}>
      <Typography variant="h3" gutterBottom>
        Create a meeting
      </Typography>
      <FormControl className={classes.form}>
        <InputLabel htmlFor="event-title">Title</InputLabel>
        <Input id="event-title" aria-describedby="calendar event title"></Input>
      </FormControl>
      <FormControl className={classes.form}>
        <InputLabel htmlFor="event-description">Description</InputLabel>
        <Input id="event-description" aria-describedby="calendar event description"></Input>
      </FormControl>
      <FormControl className={classes.form}>
        <InputLabel htmlFor="event-location">Location</InputLabel>
        <Input id="event-location" aria-describedby="calendar event location"></Input>
      </FormControl>
      <FormControl className={classes.form}>
        <InputLabel htmlFor="event-start">Start</InputLabel>
        <TextField
          id="event-start"
          label="Start Time"
          type="datetime-local"
          defaultValue="2020-05-24T10:30"
          className={classes.textField}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>
      <FormControl className={classes.form}>
        <InputLabel htmlFor="event-end">End</InputLabel>
        <TextField
          id="event-end"
          label="End Time"
          type="datetime-local"
          defaultValue="2020-05-24T10:30"
          className={classes.textField}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>
      <Button
        disableElevation={false}
        className={classes.button}
        href={googleCalendarLink}
        target="_blank"
        variant="contained"
        color="primary"
      >
        Create
      </Button>
    </div>
  );
};
