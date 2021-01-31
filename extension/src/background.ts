import db from '../../components/store/db';
import useGapi from '../../components/store/use-gapi';
import getStore from '../../components/store/use-homepage-store';

const init = async () => {
  console.log('starting');
  useGapi();
  const store = await getStore(await db('extension-test'));
  console.log(store);
};

(chrome as any).scripting.executeScript({
  function: init,
});
