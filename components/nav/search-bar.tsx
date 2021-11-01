import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import config from '../../constants/config';
import CloseIconOrange from '../../public/icons/close-orange.svg';
import CloseIcon from '../../public/icons/close.svg';
import SearchIconOrange from '../../public/icons/search-orange.svg';
import SearchIconWhite from '../../public/icons/search-white.svg';
import SearchIcon from '../../public/icons/search.svg';

const PREFIX = 'SearchBar';

const classes = {
  input: `${PREFIX}-input`,
  container: `${PREFIX}-container`,
  icon: `${PREFIX}-icon`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.input}`]: {
    marginTop: 0,
    [theme.breakpoints.down('md')]: {},
  },
  [`&.${classes.container}`]: {
    background: theme.palette.background.paper,
    borderRadius: 20,
    height: 39,
  },
  [`& .${classes.icon}`]: {
    padding: theme.spacing(1),
  },
}));

const searchInputId = 'searchInput';

const SearchBar = (props: { isDarkMode: boolean; searchQuery: string }) => {
  const router = useHistory();
  const location = useLocation();
  const search = location.search;
  const [value, setValue] = useState(props.searchQuery);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (e.target.value.length > 0) {
      void router.push(`/search?query=${e.target.value}`);
    } else {
      void router.push(`/home`);
    }
  };

  return (
    <StyledGrid
      container
      alignItems="flex-start"
      justifyContent="space-between"
      className={classes.container}
    >
      <Grid item>
        <IconButton className={classes.icon}>
          {location.pathname.indexOf('search') > -1 ? (
            <SearchIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
          ) : props.isDarkMode ? (
            <SearchIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
          ) : (
            <SearchIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
          )}
        </IconButton>
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
          variant="standard"
          value={value.length < 1 && props.searchQuery ? props.searchQuery : value}
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
            size="large"
          >
            {props.isDarkMode ? (
              <CloseIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
            ) : (
              <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
            )}
          </IconButton>
        </Grid>
      )}
    </StyledGrid>
  );
};

export default SearchBar;
