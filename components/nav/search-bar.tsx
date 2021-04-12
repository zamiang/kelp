import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '../../public/icons/search.svg';

const useStyles = makeStyles((theme) => ({
  input: {
    width: 282,
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      width: 240,
    },
  },
}));

const SearchBar = () => {
  const classes = useStyles();
  const router = useHistory();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    void router.push(`/search?query=${e.target.value}`);
  };

  return (
    <Grid container alignItems="center">
      <Grid item>
        <IconButton disabled>
          <SearchIcon width="24" height="24" />
        </IconButton>
      </Grid>
      <Grid item>
        <TextField
          type="text"
          placeholder="Search…"
          fullWidth
          autoComplete="off"
          autoFocus={true}
          onChange={handleChange}
          name="query"
          margin="dense"
          className={classes.input}
        />
      </Grid>
    </Grid>
  );
};

export default SearchBar;
