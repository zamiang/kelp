const setBgColor = () => {
  if (localStorage.getItem('DARK_MODE') === 'true') {
    document.body.style.backgroundColor = '#262736';
  } else if (localStorage.getItem('DARK_MODE') === 'false') {
    document.body.style.backgroundColor = '#fbf2dd';
  }
};
setBgColor();
