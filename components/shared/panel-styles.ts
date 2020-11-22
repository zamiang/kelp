import { makeStyles } from '@material-ui/core/styles';
import { drawerWidth } from '../../pages/dashboard';

// TODO: Pull from theme?
const TOP_BAR_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  panel: {
    minHeight: '100vh',
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
    width: `calc((100vw - ${drawerWidth}px) * 0.618)`,
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
    fontWeight: theme.typography.fontWeightBold,
  },
  row: {
    marginBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderbottom: '0px solid',
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  rowNoBorder: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  selected: {
    borderRadius: '0.375rem',
    border: `1px solid ${theme.palette.primary.main}`,
    textTransform: 'none',
    background: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    fontWeight: 600,
    fontSize: 14,
  },
  unSelected: {
    borderRadius: '0.375rem',
    border: `1px solid ${theme.palette.divider}`,
    textTransform: 'none',
    background: theme.palette.background.paper,
    color: theme.palette.text.hint,
    fontWeight: 600,
    fontSize: 14,
  },
}));

export default useStyles;
