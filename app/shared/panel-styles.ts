import { makeStyles } from '@material-ui/core/styles';

// TODO: Pull from theme?
const TOP_BAR_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  panel: {
    minHeight: '80vh',
    overflowX: 'auto',
    maxHeight: `calc(100vh - ${TOP_BAR_HEIGHT})px`,
    padding: theme.spacing(5),
    background: theme.palette.secondary.light,
    position: 'relative',
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
    width: '49vw',
    top: TOP_BAR_HEIGHT,
  },
}));

export default useStyles;
