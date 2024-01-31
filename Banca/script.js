'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Luka Kljecanin',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov} £</div>
  </div> `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
// funzione fatta per creare l' username in base al proprietario del accaount e mi prende la prima lettera del suo nome e del cognome e questo sara il mio username es. luka kljecanin => lk;
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const calcPrintBalance = function (acca) {
  acca.balance = acca.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = acca.balance + ' EUR';
};

// calcolo del bilancio del accaount in uso in basso che trovo e viene costantemente aggiornato
const calcDisplaySummary = function (acca) {
  const incomes = acca.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = incomes + ' £';

  const out = acca.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = Math.abs(out) + ' £';

  const interest = acca.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acca.interestRate) / 100)
    .filter(function (int, i, arr) {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = interest + ' £';
};

// LOGIN per entrare nel mio portale devo scrivere il nome del user e il pin, questo viene controlato
// e se e tutto ok mi entra nel mio account e mi da il benvenuto

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent forms from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log('LOGIN');
    //DISPLAY UI AND MESSAGE
    labelWelcome.textContent =
      'Welcome back, ' + currentAccount.owner.split(' ')[0];
    containerApp.style.opacity = 100;
    console.log(containerApp);
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

// pulsante per trasferire i soldi da un conto al altro..
// controllo se l' account esiste, se la somma da trasferire non e superiore di quella che ho disponibile
// deve essere maggiore di 0 poi devo aggiornare i dati cioe cambiare al account in uso il saldo e
// aggiungere i soldi trasferiti. la stessa cosa la faccio per l' account che riceve i soldi

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  console.log(amount, receiverAcc);
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    receiverAcc &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    console.log('Transfer valid');
    // durante il trasferimento
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // faccio un aggiornamento del account in uso
    updateUI(currentAccount);
  }
});

const updateUI = function (acc) {
  //DISPLAY MOVEMENTS
  displayMovements(acc.movements);
  //DISPLAY BALANCE
  calcPrintBalance(acc);
  //DISPLAY SUMMARY
  calcDisplaySummary(acc);
};

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

// pulsante per eliminare un account => inserendo le credenziali del account e se voglio eliminare questo account questa funzione mi controlla se il account attualmente in uso (username e password) sono uguale al account che voglio eliminare. se sono uguali allora l account viene eliminato
// come viene eliminato ? creo una variabile come qua sotto.. entro nel array di accounts e vado a cercare l' account. username che sia = al account in uso
// poi dal accounts array vado ad eliminare con split l' index

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    //delete account
    accounts.splice(index, 1);
    console.log(accounts);
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

// cliccando il btnsort mi ordina i miei movimenti, creo una variabile fuori e la dichiaro booleana in modo tale che se clicco di nuovo sul bottone questa mi ritorna com'era prima..
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

/////////////////////////////////////////////////
let arr = ['a', 'b', 'c', 'd', 'e'];

console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(1, -2));

arr.splice(2, 0, 'lemon');
console.log(arr.reverse());
console.log(arr);

const arrOfStr = ['1', '2', '3'];

const arrOfNum = arrOfStr.map(str => {
  return parseInt(str);
});

// console.log(arrOfNum);

const owners = ['jonas', 'zach', 'adam', 'marta'];
console.log(owners.sort());

//1
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(acc => acc > 0)
  .reduce((sum, cur) => sum + cur, 0);
console.log(bankDepositSum);

//2
const findIndex = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 1000).length;
console.log(findIndex);

//3
const sums = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      cur > 0 ? (sums.deposits += cur) : (sums.withdrawls += cur);
      return sums;
    },
    { deposits: 0, withdrawls: 0 }
  );

//4
const word = 'this is a nice title';

const conversion = function (title) {
  const expections = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with'];
  const x = title
    .toLowerCase()
    .split(' ')
    .map(mov => mov[0].toUppercase() + mov.slice(1));
};
