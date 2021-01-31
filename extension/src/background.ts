import db from '../../components/store/db';
import getStore from '../../components/store/use-homepage-store';

const init = async () => {
  console.log('starting');
  const store = await getStore(await db('extension-test'));
  console.log(store);
};

(chrome as any).scripting.executeScript({
  function: init,
});
