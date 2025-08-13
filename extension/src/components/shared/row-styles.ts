// Row Styles - CSS Class Names Export
// This file exports CSS class names for use with the modern CSS architecture
import './../../styles/components/shared/row-styles.css';

// Export CSS class names that match the BEM naming convention
export const classes = {
  border: 'row__border',
  heading: 'row__heading',
  borderSecondaryMain: 'row__border-secondary-main',
  borderSecondaryLight: 'row__border-secondary-light',
  borderInfoMain: 'row__border-info-main',
  rightIcon: 'row__right-icon',
  row: 'row',
  rowTopPadding: 'row__top-padding',
  hoverText: 'row__hover-text',
  rowNoHover: 'row__no-hover',
  rowExtraPadding: 'row__extra-padding',
  rowSmall: 'row__small',
  rowHighlight: 'row__highlight',
  rowHighlightPadding: 'row__highlight-padding',
  rowDefault: 'row__default',
  rowText: 'row__text',
  rowHeading: 'row__heading-text',
  rowHint: 'row__hint',
  avatar: 'row__avatar',
  rowLineThrough: 'row__line-through',
  rowLeft: 'row__left',
  rowPrimaryMain: 'row__primary-main',

  button: 'row__button',
  circleButton: 'row__circle-button',
  iconButton: 'row__icon-button',
  greyButton: 'row__grey-button',
  selected: 'row__selected',
  unSelected: 'row__unselected',

  topContainer: 'row__top-container',
  container: 'row__container',
  headingContainer: 'row__heading-container',
  relativeContainer: 'row__relative-container',
  section: 'row__section',
  edit: 'row__edit',
  title: 'row__title',
  titleCenter: 'row__title-center',
  overflowEllipsis: 'row__overflow-ellipsis',
  smallCaption: 'row__small-caption',
  inlineList: 'row__inline-list',
  content: 'row__content',
  link: 'row__link',
  description: 'row__description',
  descriptionMicrosoft: 'row__description-microsoft',
  center: 'row__center',
  triGroup: 'row__tri-group',
  triGroupItem: 'row__tri-group-item',
  triGroupBorder: 'row__tri-group-border',
  triGroupHeading: 'row__tri-group-heading',
  date: 'row__date',
  textPadding: 'row__text-padding',
  buttonSecton: 'row__button-section',
  tag: 'row__tag',
  tagSelected: 'row__tag-selected',
  iconText: 'row__icon-text',
  iconPrimary: 'row__icon-primary',
};

// For backward compatibility, export a div element that can be used as a container
// Components can now use regular divs with the CSS classes instead of the styled Row component
export const Row = 'div';
