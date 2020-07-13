import { makeStyles } from '@material-ui/core/styles';
import { drawerWidth } from '../dashboard';

// TODO: Pull from theme?
const TOP_BAR_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  panel: {
    overflowX: 'auto',
    minHeight: '100vh',
    padding: theme.spacing(5),
    paddingRight: 0,
    position: 'relative',
    width: `calc((100vw - ${drawerWidth}px) * 0.382)`,
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
    // top: TOP_BAR_HEIGHT,
  },
  title: {
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(2),
    marginLeft: -theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
  },
  row: {
    marginBottom: theme.spacing(4),
  },
}));

export default useStyles;
