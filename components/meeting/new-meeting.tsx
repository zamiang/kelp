import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { addMinutes, format, setMinutes, subMinutes } from 'date-fns';
import React, { useState } from 'react';
import useExpandStyles from '../shared/expand-styles';

const useStyles = makeStyles((theme) => ({
  container: {},
  form: { width: '100%', marginBottom: theme.spacing(2) },
  textField: {},
  button: {},
}));

function formatTimezone(date: Date): Date {
  const offset = date.getTimezoneOffset();

  return Math.sign(offset) !== -1 ? addMinutes(date, offset) : subMinutes(date, Math.abs(offset));
}

export const NewMeeting = () => {
  const classes = useStyles();
  const expandClasses = useExpandStyles();

  const defaultValue = format(setMinutes(new Date(), 0), "yyyy-MM-dd'T'HH:mm");
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [start, setStart] = useState<string>(defaultValue);
  const [end, setEnd] = useState<string>(defaultValue);

  const createParams = new URLSearchParams({
    text: title,
    details: description,
    action: 'TEMPLATE',
    location,
    dates: `${format(formatTimezone(new Date(start)), "yyyymmdd'T'HHmmss")}Z/${format(
      formatTimezone(new Date(end)),
      "yyyymmdd'T'HHmmss",
    )}Z`,
  });

  const googleCalendarLink = `https://www.google.com/calendar/render?${createParams.toString()}`;

  return (
    <div className={classes.container}>
      <div className={expandClasses.topContainer}>
        <div className={expandClasses.headingContainer}>
          <Typography variant="h3" gutterBottom style={{ textAlign: 'center' }}>
            Create a meeting
          </Typography>
        </div>
      </div>
      <Divider />
      <div className={expandClasses.container}>
        <FormControl className={classes.form}>
          <InputLabel htmlFor="event-title">Title</InputLabel>
          <Input
            id="event-title"
            aria-describedby="calendar event title"
            onChange={(e) => setTitle(e.target.value)}
          ></Input>
        </FormControl>
        <FormControl className={classes.form}>
          <InputLabel htmlFor="event-description">Description</InputLabel>
          <Input
            id="event-description"
            aria-describedby="calendar event description"
            onChange={(e) => setDescription(e.target.value)}
          ></Input>
        </FormControl>
        <FormControl className={classes.form}>
          <InputLabel htmlFor="event-location">Location</InputLabel>
          <Input
            id="event-location"
            aria-describedby="calendar event location"
            onChange={(e) => setLocation(e.target.value)}
          ></Input>
        </FormControl>
        <FormControl className={classes.form}>
          <TextField
            id="event-start"
            label="Start Time"
            type="datetime-local"
            defaultValue={defaultValue}
            className={classes.textField}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
        <FormControl className={classes.form}>
          <TextField
            id="event-end"
            label="End Time"
            type="datetime-local"
            defaultValue={defaultValue}
            className={classes.textField}
            onChange={(e) => setEnd(e.target.value)}
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
          Create a meeting
        </Button>
      </div>
    </div>
  );
};
