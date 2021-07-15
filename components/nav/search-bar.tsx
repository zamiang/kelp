import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import SearchIconOrange from '../../public/icons/search-orange.svg';
import SearchIconWhite from '../../public/icons/search-white.svg';
import SearchIcon from '../../public/icons/search.svg';

const useStyles = makeStyles((theme) => ({
  input: {
    marginTop: 0,
    [theme.breakpoints.down('sm')]: {},
  },
  container: {
    marginTop: -theme.spacing(1),
    background: theme.palette.background.paper,
    borderRadius: 16,
    height: 40,
  },
  icon: {
    padding: theme.spacing(1),
  },
}));

const SearchBar = (props: { isDarkMode: boolean }) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    void router.push(`/search?query=${e.target.value}`);
  };

  return (
    <Grid
      container
      alignItems="flex-start"
      justifyContent="space-between"
      className={classes.container}
    >
      <Grid item>
        <div className={classes.icon}>
          {location.pathname.indexOf('search') > -1 ? (
            <SearchIconOrange width="24" height="24" />
          ) : props.isDarkMode ? (
            <SearchIconWhite width="24" height="24" />
          ) : (
            <SearchIcon width="24" height="24" />
          )}
        </div>
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
        />
      </Grid>
    </Grid>
  );
};

export default SearchBar;
