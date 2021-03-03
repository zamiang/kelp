import { makeStyles } from '@material-ui/core/styles';

const TOP_BAR_HEIGHT = 104;

const useStyles = makeStyles((theme) => ({
  panel: {
    paddingRight: 0,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  topRightButton: {
    marginLeft: 'auto',
    marginBottom: theme.spacing(4),
  },
  panelMaxHeight: {
    maxHeight: `calc(100vh - ${TOP_BAR_HEIGHT})`,
    overflow: 'auto',
  },
  dockedPanel: {
    maxWidth: 600,
    width: '100vw',
    [theme.breakpoints.down('sm')]: {
      width: `calc(100vw - ${theme.spacing(7)}px)`,
    },
  },
  section: {
    marginTop: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    textTransform: 'uppercase',
    fontWeight: theme.typography.fontWeightMedium,
  },
  headingPadding: {
    paddingLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
}));

export default useStyles;
