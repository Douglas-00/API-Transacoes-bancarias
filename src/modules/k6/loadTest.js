import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '15s', target: 100 },
    { duration: '15s', target: 100 },
    { duration: '5s', target: 0 },
  ],
};

export default function () {
  let payload = JSON.stringify({
    //accountId = number da conta.
    accounts: [],
    transactions: [
      // Initial transactions
      { accountId: 1, type: 'DEPOSIT', amount: 100 },
      { accountId: 1, type: 'WITHDRAW', amount: 50 },
      { accountId: 1, type: 'TRANSFER', amount: 30, destinyId: 2 },

      // Concorrência 1
      { accountId: 1, type: 'DEPOSIT', amount: 50 },
      { accountId: 1, type: 'WITHDRAW', amount: 30 },

      // Concorrência 2
      { accountId: 1, type: 'DEPOSIT', amount: 100 },
      { accountId: 1, type: 'TRANSFER', amount: 50, destinyId: 2 },
      // Concorrência 3
      { accountId: 1, type: 'TRANSFER', amount: 20, destinyId: 2 },
      { accountId: 2, type: 'TRANSFER', amount: 10, destinyId: 3 },
    ],
  });

  let res = http.post('http://localhost:3000/account', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
