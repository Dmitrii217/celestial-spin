import { init, getBalanceForUser, getNextSpinTimeForUser } from './services/dataService.js';

async function test() {
  await init();

  const userId = '806916617';

  const balance = await getBalanceForUser(userId);
  const nextSpinTime = await getNextSpinTimeForUser(userId);

  console.log('User Balance:', balance);
  console.log('User Next Spin Time:', nextSpinTime);
}

test();


