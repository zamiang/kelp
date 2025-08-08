import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import SearchIcon from '../../public/icons/search.svg';

const PREFIX = 'SearchBar';

const classes = {
  input: `${PREFIX}-input`,
  container: `${PREFIX}-container`,
  icon: `${PREFIX}-icon`,
  iconImage: `${PREFIX}-iconImage`,
  iconSelected: `${PREFIX}-iconSelected`,
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
  [`& .${classes.iconImage}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
}));

const searchInputId = 'searchInput';

const SearchBar = (props: { searchQuery: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search;
  const [value, setValue] = useState(props.searchQuery);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (e.target.value.length > 0) {
      void navigate(`/search?query=${e.target.value}`);
    } else {
      void navigate(`/home`);
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
            <SearchIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              className={classes.iconSelected}
            />
          ) : (
            <SearchIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              className={classes.iconImage}
            />
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
              navigate('/home');
              setValue('');
            }}
            size="large"
          >
            <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
          </IconButton>
        </Grid>
      )}
    </StyledGrid>
  );
};

export default SearchBar;
