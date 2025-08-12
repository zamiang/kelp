import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import SearchIcon from '../../../../public/icons/search.svg';
import '../../styles/components/nav/search-bar.css';

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
    <Box
      display="flex"
      alignItems="flex-start"
      justifyContent="space-between"
      className="search-bar"
    >
      <Box>
        <IconButton className="search-bar__icon">
          {location.pathname.indexOf('search') > -1 ? (
            <SearchIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              className="search-bar__icon--selected"
            />
          ) : (
            <SearchIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              className="search-bar__icon-image"
            />
          )}
        </IconButton>
      </Box>
      <Box flex="1">
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
            className: 'search-bar__input',
            disableUnderline: true,
          }}
        />
      </Box>
      {search && (
        <Box>
          <IconButton
            onClick={() => {
              navigate('/home');
              setValue('');
            }}
            size="large"
            className="search-bar__close-button"
          >
            <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
