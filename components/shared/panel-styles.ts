import { makeStyles } from '@material-ui/core/styles';
import { drawerWidth } from '../../pages/dashboard';

// TODO: Pull from theme?
const TOP_BAR_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  panel: {
    overflowX: 'auto',
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
    width: `calc((100vw - ${drawerWidth}px) * 0.618)`,
    borderRadius: `${theme.spacing(2)}px 0 0 ${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      width: `calc(100vw - ${theme.spacing(7)}px)`,
    },
  },
  title: {
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.text.secondary}`,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
  row: {
    marginBottom: theme.spacing(4),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderbottom: '0px solid',
    },
  },
}));

export default useStyles;
