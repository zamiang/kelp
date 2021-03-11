import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  panel: {
    position: 'relative',
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
