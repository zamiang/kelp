const iconStyle = `
  color: #5f6368;
  padding-left: 28px;
  width: 20px;
  padding-right: 19px;
  opacity: 0.8;
`;

const textStyle = `
  font-family: Roboto,Arial,sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: .2px;
  line-height: 20px;
  color: #3c4043;
`;

const rowStyle = `
  min-height: 32px;
  width: 100%;
  position: relative;
  display: flex;
  padding-right: 16px;
  box-sizing: border-box;
  align-items: center;
  outline: none;
  cursor: pointer;
`;

const kelpCopy = 'View documents on Kelp';

const findNode = () => {
  setTimeout(() => {
    const elements = [...(document.querySelectorAll('span') as any)];

    const nodes = elements.filter((a: any) => a.textContent === 'Going?');
    if (nodes && nodes[0]) {
      const parent = nodes[0].parentElement.parentElement.parentElement;
      const container = nodes[0].parentElement.parentElement.children[2];
      const eventId = atob(parent.getAttribute('data-eventid')).split(' ')[0];

      const existingNode = document.getElementById('kelp-link-text');
      if (existingNode) {
        return;
      }

      const rowElement = document.createElement('div');
      rowElement.setAttribute('style', rowStyle);
      rowElement.onclick = () => {
        chrome.runtime.sendMessage({
          meetingId: eventId,
        });
      };

      const iconElement = document.createElement('img');
      iconElement.src = 'https://www.kelp.nyc/kelp.svg';
      iconElement.setAttribute('style', iconStyle);

      const textElement = document.createElement('div');
      textElement.setAttribute('id', 'kelp-link-text');
      textElement.innerText = kelpCopy;
      textElement.setAttribute('style', textStyle);

      rowElement.append(iconElement);
      rowElement.append(textElement);

      container.append(rowElement);
    }
  }, 400);
};

document.addEventListener('click', findNode);
