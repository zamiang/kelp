import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import clsx from 'clsx';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';
import { IProps } from './left-drawer';

const useStyles = makeStyles((theme) => ({
  inputInput: {
    width: '22ch',
  },
  listItem: {
    // don't want the height to change with or w/o the input
    height: 48,
  },
  iconContainer: {
    minWidth: theme.spacing(5),
  },
}));

type IResult = {
  id: string;
  title: string;
  type: 'document' | 'meeting' | 'person';
};

const getAutocompleteResults = (props: IProps) => {
  const results: IResult[] = [];

  props.meetings
    .filter((meeting) => meeting.summary)
    .map((meeting) => results.push({ id: meeting.id, title: meeting.summary!, type: 'meeting' }));

  props.documents
    .filter((doc) => doc.name)
    .map((doc) => results.push({ id: doc.id, title: doc.name!, type: 'document' }));

  props.people.map((person) =>
    results.push({
      id: person.id,
      title: person.name,
      type: 'person',
    }),
  );
  return results;
};

const onAutocompleteSelect = (result: IResult, router: NextRouter) => {
  switch (result.type) {
    case 'person':
      return router.push(`?tab=people&slug=${result.id}`);
    case 'document':
      return router.push(`?tab=docs&slug=${result.id}`);
    case 'meeting':
      return router.push(`?tab=meetings&slug=${result.id}`);
  }
};

const Search = (props: IProps) => {
  const classes = useStyles();
  const options = getAutocompleteResults(props);
  const router = useRouter();

  const handleAutocompleteSelect = (_: React.ChangeEvent<unknown>, result: IResult | null) =>
    result && onAutocompleteSelect(result, router);
  return (
    <ListItem button className={clsx(classes.listItem, 'ignore-react-onclickoutside')}>
      <ListItemIcon className={classes.iconContainer}>
        <SearchIcon />
      </ListItemIcon>
      <Autocomplete
        options={options.sort((a, b) => -(b.type + b.title).localeCompare(a.type + a.title))}
        groupBy={(option: IResult) => option.type}
        getOptionLabel={(option: IResult) => option.title}
        clearOnEscape
        blurOnSelect
        autoHighlight
        renderInput={(params) => (
          <TextField placeholder="Search…" className={classes.inputInput} {...params} />
        )}
        onChange={handleAutocompleteSelect}
      />
    </ListItem>
  );
};

export default Search;
