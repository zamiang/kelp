import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import MeetingIcon from '../../public/icons/calendar.svg';
import CloseIcon from '../../public/icons/close.svg';
import DocumentIcon from '../../public/icons/file.svg';
import SearchIcon from '../../public/icons/search.svg';

const useStyles = makeStyles((theme) => ({
  input: {
    fontSize: 22,
    [theme.breakpoints.down('sm')]: {},
  },
  container: {
    paddingTop: 5,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
}));

const SearchBar = (props: { onClose?: () => void }) => {
  const classes = useStyles();
  const router = useHistory();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    void router.push(`/search?query=${e.target.value}`);
  };

  return (
    <Grid container alignItems="flex-start" justify="space-between">
      <Grid item>
        <IconButton>
          <SearchIcon width="24" height="24" />
        </IconButton>
      </Grid>
      <Grid item xs>
        <TextField
          type="text"
          placeholder="Search…"
          fullWidth
          autoComplete="off"
          autoFocus={true}
          onChange={handleChange}
          name="query"
          margin="dense"
          InputProps={{
            className: classes.input,
            disableUnderline: true,
          }}
          style={{ marginTop: 3 }}
        />
      </Grid>
      <Grid item>
        <IconButton href="https://docs.new" target="_blank">
          <DocumentIcon width="24" height="24" />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton target="_blank" href="https://www.google.com/calendar/render?action=TEMPLATE">
          <MeetingIcon width="24" height="24" />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          onClick={() => {
            router.push('/home');
            if (props.onClose) {
              props.onClose();
            }
          }}
        >
          <CloseIcon width="24" height="24" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default SearchBar;
