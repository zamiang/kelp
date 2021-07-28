import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  topContainer: {
    paddingBottom: theme.spacing(4),
  },
  container: {
    margin: 0,
    width: 'auto',
  },
  headingContainer: {
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },
  relativeContainer: {
    position: 'relative',
  },
  section: {
    marginTop: 88,
  },
  edit: {},
  title: {
    wordBreak: 'break-word',
    width: '100%',
  },
  titleCenter: {
    textAlign: 'center',
  },
  overflowEllipsis: {
    textOverflow: 'ellipsis',
    width: '100%',
    display: 'block',
    overflow: 'hidden',
  },
  smallCaption: {
    marginTop: theme.spacing(-1),
    color: theme.palette.text.hint,
    display: 'block',
  },
  inlineList: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    width: '100%',
  },
  content: {
    marginTop: theme.spacing(1),
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    height: 73,
    width: 73,
    fontSize: 50,
  },
  link: {
    color: theme.palette.primary.dark,
  },
  description: {
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    '& a': {
      color: theme.palette.primary.dark,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  descriptionMicrosoft: {
    whiteSpace: 'normal',
  },
  center: {
    textAlign: 'center',
  },
  triGroup: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    width: '100%',
  },
  triGroupItem: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  triGroupBorder: {
    width: 1,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    background: theme.palette.divider,
    height: 'auto',
  },
  triGroupHeading: {
    paddingBottom: theme.spacing(1),
  },
  date: {
    textAlign: 'right',
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      textAlign: 'left',
      paddingRight: 0,
    },
  },
  textPadding: {
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(0.5),
      paddingTop: theme.spacing(0.5),
    },
  },
  showMoreButton: {
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  buttonSecton: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(4),
  },
}));

export default useStyles;
