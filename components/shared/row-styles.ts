import { makeStyles } from '@material-ui/core/styles';
import config from '../../constants/config';

const useStyles = makeStyles((theme) => ({
  border: {
    borderRadius: 4,
    background: theme.palette.secondary.main,
    padding: '0px !important',
    transition: 'background 0.3s',
    width: 4,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  borderSecondaryMain: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  borderSecondaryLight: {
    background: theme.palette.secondary.light,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.light,
    },
  },
  borderInfoMain: {
    background: theme.palette.info.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.info.main,
    },
  },
  row: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    opacity: 1,
    marginBottom: theme.spacing(0.5),
    borderRadius: `${theme.spacing(4)}px 0 0 ${theme.spacing(4)}px`,
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
      borderColor: theme.palette.secondary.main,
    },
  },
  rowDefault: {},
  rowHint: {
    color: theme.palette.text.hint,
  },
  rowLineThrough: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  rowPrimaryMain: {
    background: theme.palette.primary.main,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.info.main,
      background: theme.palette.primary.main,
    },
  },
  yellowBackground: {
    backgroundColor: config.YELLOW_BACKGROUND,
    '&.MuiListItem-button:hover': {
      borderColor: config.YELLOW_BACKGROUND,
      backgroundColor: config.YELLOW_BACKGROUND,
    },
  },
  orangeBackground: {
    backgroundColor: config.ORANGE_BACKGROUND,
    '&.MuiListItem-button:hover': {
      borderColor: config.ORANGE_BACKGROUND,
      backgroundColor: config.ORANGE_BACKGROUND,
    },
  },
  purpleBackground: {
    backgroundColor: config.PURPLE_BACKGROUND,
    '&.MuiListItem-button:hover': {
      borderColor: config.PURPLE_BACKGROUND,
      backgroundColor: config.PURPLE_BACKGROUND,
    },
  },
  pinkBackground: {
    backgroundColor: config.PINK_BACKGROUND,
    '&.MuiListItem-button:hover': {
      borderColor: config.PINK_BACKGROUND,
      backgroundColor: config.PINK_BACKGROUND,
    },
  },
}));

export default useStyles;
