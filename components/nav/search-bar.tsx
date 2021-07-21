import { IconButton } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CloseIconOrange from '../../public/icons/close-orange.svg';
import CloseIcon from '../../public/icons/close.svg';
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

const searchInputId = 'searchInput';

const SearchBar = (props: { isDarkMode: boolean }) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();
  const search = location.search;
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
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
          id={searchInputId}
          autoComplete="off"
          autoFocus={true}
          onChange={handleChange}
          name="query"
          margin="dense"
          value={value}
          InputProps={{
            className: classes.input,
            disableUnderline: true,
          }}
        />
      </Grid>
      {search && (
        <Grid item>
          <IconButton
            onClick={() => {
              router.push('/home');
              setValue('');
            }}
          >
            {props.isDarkMode ? (
              <CloseIconOrange width="24" height="24" />
            ) : (
              <CloseIcon width="24" height="24" />
            )}
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
};

export default SearchBar;
