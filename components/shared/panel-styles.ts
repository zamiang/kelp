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
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
  greeting: {
    textAlign: 'center',
    margin: theme.spacing(2),
  },
  panelTextButton: {
    textAlign: 'center',
    width: '100%',
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.3s',
    background: 'rgba(0,0,0,0.04)',
    padding: theme.spacing(1),
    color: 'rgba(0,0,0,0.87)',
    '&:hover': {
      opacity: 0.6,
      textDecoration: 'underline',
    },
  },
}));

export default useStyles;
