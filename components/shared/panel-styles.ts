import makeStyles from '@mui/styles/makeStyles';

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
    [theme.breakpoints.down('md')]: {
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
    background: theme.palette.divider,
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    '&:hover': {
      opacity: 0.6,
      textDecoration: 'underline',
    },
  },
}));

export default useStyles;
