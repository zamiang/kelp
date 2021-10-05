import { styled } from '@mui/material/styles';
import { mediumFontFamily } from '../../constants/theme';

const PREFIX = 'Row';

export const classes = {
  border: `${PREFIX}-border`,
  heading: `${PREFIX}-heading`,
  borderSecondaryMain: `${PREFIX}-borderSecondaryMain`,
  borderSecondaryLight: `${PREFIX}-borderSecondaryLight`,
  borderInfoMain: `${PREFIX}-borderInfoMain`,
  rightIcon: `${PREFIX}-rightIcon`,
  row: `${PREFIX}-row`,
  rowTopPadding: `${PREFIX}-rowTopPadding`,
  hoverText: `${PREFIX}-hoverText`,
  rowNoHover: `${PREFIX}-rowNoHover`,
  rowExtraPadding: `${PREFIX}-rowExtraPadding`,
  rowSmall: `${PREFIX}-rowSmall`,
  rowHighlight: `${PREFIX}-rowHighlight`,
  rowHighlightPadding: `${PREFIX}-rowHighlightPadding`,
  rowDefault: `${PREFIX}-rowDefault`,
  rowText: `${PREFIX}-rowText`,
  rowHeading: `${PREFIX}-rowHeading`,
  rowHint: `${PREFIX}-rowHint`,
  avatar: `${PREFIX}-avatar`,
  rowLineThrough: `${PREFIX}-rowLineThrough`,
  rowLeft: `${PREFIX}-rowLeft`,
  rowPrimaryMain: `${PREFIX}-rowPrimaryMain`,

  button: `${PREFIX}-button`,
  circleButton: `${PREFIX}-circleButton`,
  iconButton: `${PREFIX}-iconButton`,
  greyButton: `${PREFIX}-greyButton`,
  selected: `${PREFIX}-selected`,
  unSelected: `${PREFIX}-unSelected`,

  topContainer: `${PREFIX}-topContainer`,
  container: `${PREFIX}-container`,
  headingContainer: `${PREFIX}-headingContainer`,
  relativeContainer: `${PREFIX}-relativeContainer`,
  section: `${PREFIX}-section`,
  edit: `${PREFIX}-edit`,
  title: `${PREFIX}-title`,
  titleCenter: `${PREFIX}-titleCenter`,
  overflowEllipsis: `${PREFIX}-overflowEllipsis`,
  smallCaption: `${PREFIX}-smallCaption`,
  inlineList: `${PREFIX}-inlineList`,
  content: `${PREFIX}-content`,
  // avatar: `${PREFIX}-avatar`,
  link: `${PREFIX}-link`,
  description: `${PREFIX}-description`,
  descriptionMicrosoft: `${PREFIX}-descriptionMicrosoft`,
  center: `${PREFIX}-center`,
  triGroup: `${PREFIX}-triGroup`,
  triGroupItem: `${PREFIX}-triGroupItem`,
  triGroupBorder: `${PREFIX}-triGroupBorder`,
  triGroupHeading: `${PREFIX}-triGroupHeading`,
  date: `${PREFIX}-date`,
  textPadding: `${PREFIX}-textPadding`,
  buttonSecton: `${PREFIX}-buttonSecton`,
  tag: `${PREFIX}-tag`,
  tagSelected: `${PREFIX}-tagSelected`,
};

export const Row = styled('div')(({ theme }) => ({
  '@keyframes fadeInAnimation': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  [`& .${classes.border}`]: {
    borderRadius: 4,
    background: theme.palette.secondary.main,
    padding: '0px !important',
    transition: 'background 0.3s',
    width: 9,
    height: 9,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(1),
    },
  },
  [`& .${classes.heading}`]: {
    fontWeight: 500,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    textTransform: 'uppercase',
    fontFamily: mediumFontFamily,
  },
  [`& .${classes.borderSecondaryMain}`]: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  [`& .${classes.borderSecondaryLight}`]: {
    background: theme.palette.secondary.light,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.light,
    },
  },
  [`& .${classes.borderInfoMain}`]: {
    background: theme.palette.info.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.info.main,
    },
  },
  [`& .${classes.rightIcon}`]: {
    float: 'right',
    marginTop: -theme.spacing(1),
    marginRight: -theme.spacing(1),
  },
  [`& .${classes.row}`]: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    animation: '$fadeInAnimation ease 0.4s',
    animationIterationCount: 1,
    animationFillMode: 'forwards',
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.rowTopPadding}`]: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  [`& .${classes.hoverText}`]: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  [`& .${classes.rowNoHover}`]: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    opacity: 1,
    padding: theme.spacing(2),
    width: '100%',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: `1px solid transparent`,
    },
  },
  [`& .${classes.rowExtraPadding}`]: {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  [`& .${classes.rowSmall}`]: {
    padding: 0,
  },
  [`& .${classes.rowHighlight}`]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.rowHighlightPadding}`]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  [`& .${classes.rowDefault}`]: {},
  [`& .${classes.rowText}`]: {
    color: '#9D9D99',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
  },
  [`& .${classes.rowHeading}`]: {
    color: '#9D9D99',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    marginLeft: theme.spacing(2),
  },
  [`& .${classes.rowHint}`]: {
    color: theme.palette.text.secondary,
  },
  [`& .${classes.avatar}`]: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  [`& .${classes.rowLineThrough}`]: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  [`& .${classes.rowLeft}`]: {
    textAlign: 'center',
    marginRight: theme.spacing(2),
  },
  [`& .${classes.rowPrimaryMain}`]: {
    background: theme.palette.divider,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.light,
      background: theme.palette.secondary.light,
    },
  },

  [`& .${classes.button}`]: {
    width: '100%',
    borderRadius: 30,
    paddingTop: 6,
    paddingBottom: 6,
    transition: 'opacity 0.3s',
    minHeight: 48,
    opacity: 1,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      opacity: 0.6,
    },
  },
  [`& .${classes.circleButton}`]: {
    marginLeft: 'auto',
    display: 'block',
    background: theme.palette.primary.main,
    color: theme.palette.background.paper,
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      opacity: 0.8,
    },
  },
  [`& .${classes.iconButton}`]: {
    border: `1px solid ${theme.palette.primary.main}`,
    padding: 10,
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      opacity: 0.8,
    },
  },
  [`& .${classes.greyButton}`]: {
    borderRadius: 21,
    background: theme.palette.background.paper,
    padding: 10,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  [`& .${classes.selected}`]: {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
    transition: 'borderBottom 0.3s',
    textDecoration: 'none',
    color: theme.palette.primary.main,
    background: theme.palette.background.paper,
    opacity: 1,
    '&.Mui-disabled': {
      background: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    '&:hover': {
      opacity: 0.6,
      color: theme.palette.primary.main,
      background: theme.palette.background.paper,
    },
  },
  [`& .${classes.unSelected}`]: {
    borderRadius: 0,
    transition: 'opacity 0.3s',
    borderBottom: `1px solid ${theme.palette.divider}`,
    textDecoration: 'none',
    background: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    '&:hover': {
      background: theme.palette.background.paper,
      color: theme.palette.text.secondary,
      opacity: 0.6,
    },
  },

  [`& .${classes.topContainer}`]: {
    paddingBottom: theme.spacing(4),
  },
  [`& .${classes.container}`]: {
    margin: 0,
    width: 'auto',
  },
  [`& .${classes.headingContainer}`]: {
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },
  [`& .${classes.relativeContainer}`]: {
    position: 'relative',
  },
  [`& .${classes.section}`]: {
    marginTop: 88,
  },
  [`& .${classes.edit}`]: {},
  [`& .${classes.title}`]: {
    wordBreak: 'break-word',
    width: '100%',
  },
  [`& .${classes.titleCenter}`]: {
    textAlign: 'center',
  },
  [`& .${classes.overflowEllipsis}`]: {
    textOverflow: 'ellipsis',
    width: '100%',
    display: 'block',
    overflow: 'hidden',
  },
  [`& .${classes.smallCaption}`]: {
    marginTop: theme.spacing(-1),
    color: theme.palette.text.secondary,
    display: 'block',
  },
  [`& .${classes.inlineList}`]: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    width: '100%',
  },
  [`& .${classes.content}`]: {
    marginTop: theme.spacing(1),
  },
  [`& .${classes.avatar}`]: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    height: 73,
    width: 73,
    fontSize: 50,
  },
  [`& .${classes.link}`]: {
    color: theme.palette.primary.dark,
  },
  [`& .${classes.description}`]: {
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
  [`& .${classes.descriptionMicrosoft}`]: {
    whiteSpace: 'normal',
  },
  [`& .${classes.center}`]: {
    textAlign: 'center',
  },
  [`& .${classes.triGroup}`]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    width: '100%',
  },
  [`& .${classes.triGroupItem}`]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  [`& .${classes.triGroupBorder}`]: {
    width: 1,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    background: theme.palette.divider,
    height: 'auto',
  },
  [`& .${classes.triGroupHeading}`]: {
    paddingBottom: theme.spacing(1),
  },
  [`& .${classes.date}`]: {
    textAlign: 'right',
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      textAlign: 'left',
      paddingRight: 0,
    },
  },
  [`& .${classes.textPadding}`]: {
    [theme.breakpoints.down('md')]: {
      paddingBottom: theme.spacing(0.5),
      paddingTop: theme.spacing(0.5),
    },
  },
  [`& .${classes.buttonSecton}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(4),
  },
  [`& .${classes.tag}`]: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  [`& .${classes.tagSelected}`]: {
    textDecoration: 'underline',
  },
}));
