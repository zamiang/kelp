import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { fade, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { drawerWidth } from '../dashboard';
import { IDoc } from '../store/doc-store';
import { IPerson } from '../store/person-store';
import { ISegment } from '../store/time-store';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  title: {
    flexGrow: 1,
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.secondary.main, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.secondary.main, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    width: '35ch',
  },
  date: {
    paddingLeft: 10,
    color: theme.palette.text.hint,
  },
}));

interface IProps {
  isOpen: boolean;
  handleDrawerOpen: () => void;
  lastUpdated: Date;
  people: IPerson[];
  documents: IDoc[];
  meetings: ISegment[];
  handlePersonClick: (id: string) => void;
}

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
      id: person.emailAddress,
      title: person.name || person.emailAddress,
      type: 'person',
    }),
  );
  return results;
};

const onAutocompleteSelect = (props: IProps, result?: IResult) => {
  if (!result) {
    return;
  }
  switch (result.type) {
    case 'person':
      props.handlePersonClick(result.id);
      break;
    case 'document':
      alert(`clicked ${result.id} document`);
      break;
    case 'meeting':
      alert(`clicked ${result.id} meeting`);
      break;
  }
};

const TopBar = (props: IProps) => {
  const classes = useStyles();
  const options = getAutocompleteResults(props);

  const handleAutocompleteSelect = (event: React.ChangeEvent<unknown>, result: IResult) =>
    onAutocompleteSelect(props, result);
  return (
    <AppBar
      elevation={1}
      position="absolute"
      className={clsx(classes.appBar, props.isOpen && classes.appBarShift)}
    >
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={props.handleDrawerOpen}
          className={clsx(classes.menuButton, props.isOpen && classes.menuButtonHidden)}
        >
          <MenuIcon />
        </IconButton>
        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
          Time
        </Typography>
        <Typography variant="body2" color="inherit" noWrap className={classes.date}>
          Last updated on {format(props.lastUpdated, "MMMM do, yyyy 'at' hh:mm a")}
        </Typography>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <Autocomplete
            options={options.sort((a, b) => -(b.type + b.title).localeCompare(a.type + a.title))}
            groupBy={(option: IResult) => option.type}
            getOptionLabel={(option: IResult) => option.title}
            className={classes.inputRoot}
            clearOnEscape
            blurOnSelect
            autoHighlight
            renderInput={(params) => (
              <TextField placeholder="Search…" className={classes.inputInput} {...params} />
            )}
            // Typings are wrong for this library
            onChange={handleAutocompleteSelect as any}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
