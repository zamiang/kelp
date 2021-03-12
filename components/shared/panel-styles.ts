import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  panel: {
    position: 'relative',
    overscrollBehavior: 'contain',
    overscrollBehaviorY: 'none',
    overscrollBehaviorX: 'none',
  },
  section: {
    marginTop: theme.spacing(2),
  },
  headingPadding: {
    paddingLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
}));

export default useStyles;
