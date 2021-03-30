const runBackgroundSync = () => {
  var props = PropertiesService.getUserProperties();
  props.setProperty('syncTime', new Date().toString());

  // no return value tells the UI to keep showing the current card.
};

const onCalendarEventOpen = () => {
  console.log('hello');

  var peekHeader = CardService.newCardHeader()
    .setTitle('Contextual Cat')
    .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/pets_black_48dp.png')
    .setSubtitle('!!!!!!!!');

  var card = CardService.newCardBuilder()
    .setDisplayStyle(CardService.DisplayStyle.PEEK)
    .setPeekCardHeader(peekHeader);

  return card;
};
