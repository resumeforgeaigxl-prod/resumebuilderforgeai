
export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  approach: string[];
  code: string;
  explanation: string[];
  variations: string[];
}

export interface PrepForgeQuestion {
    id: string;
    type: 'aptitude' | 'reasoning' | 'coding';
    topic: string;
    title: string;
    slug: string;
    problem: string;
    input_output?: string;
    approach: string[];
    code: string;
    line_explanation: string[];
    variations: string[];
    created_at?: string;
}

export const PREP_FORGE_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'palindrome',
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    difficulty: 'Easy',
    question: 'Write a program to check if a given number or string is a palindrome. A palindrome reads the same forwards and backwards.',
    approach: [
      'Take the input and store it in a temporary variable.',
      'Reverse the input using a loop (for numbers) or built-in methods (for strings).',
      'Compare the original input with the reversed version.',
      'If they match, it is a palindrome; otherwise, it is not.'
    ],
    code: `
function isPalindrome(n) {
  let original = n.toString();
  let reversed = original.split('').reverse().join('');
  return original === reversed;
}

// For numbers without using string conversion
function isNumberPalindrome(num) {
  if (num < 0) return false;
  let original = num;
  let reversed = 0;
  while (num > 0) {
    let digit = num % 10;
    reversed = reversed * 10 + digit;
    num = Math.floor(num / 10);
  }
  return original === reversed;
}`,
    explanation: [
      'Line 2: Convert the number to a string to easily manipulate characters.',
      'Line 3: Split string into array, reverse array, and join back to string.',
      'Line 4: Strict comparison between original and reversed strings.',
      'Line 8: Optimized version using mathematical operations to avoid string overhead.',
      'Line 11-15: Reverse a number by extracting digits one by one using modulo (%) and building the reversed number.'
    ],
    variations: [
      'Check if a string (with spaces and punctuation) is a palindrome.',
      'Find the longest palindromic substring in a given string.',
      'Check if a number can be converted to a palindrome by changing exactly one digit.'
    ]
  },
  {
    id: 'prime',
    title: 'Prime Number',
    slug: 'prime-number',
    difficulty: 'Easy',
    question: 'Given an integer n, determine if it is a prime number. A prime number is a natural number greater than 1 that is not a product of two smaller natural numbers.',
    approach: [
      'Handle edge cases: numbers < 2 are not prime.',
      'Loop from 2 up to the square root of n.',
      'Check if n is divisible by any number in the loop.',
      'If divisible, it is not prime. If the loop completes, it is prime.'
    ],
    code: `
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  
  if (n % 2 === 0 || n % 3 === 0) return false;
  
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}`,
    explanation: [
      'Line 2-3: Handle 0, 1, 2, and 3 specifically as they are basic cases.',
      'Line 5: Optimization: All primes except 2 and 3 are of the form 6k ± 1.',
      'Line 7: Loop up to sqrt(n) for efficiency (O(sqrt(n))).',
      'Line 8: Check divisibility for both 6k-1 and 6k+1 cases.'
    ],
    variations: [
      'Print all prime numbers up to N (Sieve of Eratosthenes).',
      'Find the Kth prime number.',
      'Find prime factors of a given number.'
    ]
  },
  {
    id: 'factorial',
    title: 'Factorial',
    slug: 'factorial',
    difficulty: 'Easy',
    question: 'Write a program to calculate the factorial of a non-negative integer n. Factorial of n (n!) is the product of all positive integers less than or equal to n.',
    approach: [
      'Interactive approach: Use a loop to multiply numbers from 1 to n.',
      'Recursive approach: Base case is if n is 0 or 1, return 1. Otherwise, return n * factorial(n-1).'
    ],
    code: `
// Iterative Approach
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Recursive Approach
function factorialRecursive(n) {
  if (n <= 1) return 1;
  return n * factorialRecursive(n - 1);
}`,
    explanation: [
      'Line 4-7: Iterative loop starting from 2 up to n, multiplying into the result.',
      'Line 13: Base case to stop recursion when n reaches 0 or 1.',
      'Line 14: Recursive call multiplying current n with factorial of (n-1).'
    ],
    variations: [
      'Find trailing zeros in n! (factorial).',
      'Calculate factorial for large numbers (using BigInt).',
      'Factorial of a floating point number (Gamma function concept).'
    ]
  },
  {
    id: 'armstrong',
    title: 'Armstrong Number',
    slug: 'armstrong-number',
    difficulty: 'Easy',
    question: 'Check if a number is an Armstrong number. An Armstrong number (for n digits) is a number that is equal to the sum of its own digits each raised to the power of n.',
    approach: [
      'Count the number of digits (n).',
      'Extract each digit of the number.',
      'Raise each digit to power n and add to total.',
      'If total equals the original number, it is an Armstrong number.'
    ],
    code: `
function isArmstrong(num) {
  let original = num;
  let digits = num.toString().split('');
  let power = digits.length;
  let sum = 0;
  
  for (let d of digits) {
    sum += Math.pow(parseInt(d), power);
  }
  
  return sum === original;
}`,
    explanation: [
      'Line 3: Convert the number to a string and split into individual digits.',
      'Line 4: The power is the total number of digits in the input.',
      'Line 8: Raise each digit to the power of the digit count.',
      'Line 11: Compare the final sum with the original input.'
    ],
    variations: [
      'Find all Armstrong numbers in a given range.',
      'Check for narcissistic numbers of a specific fixed power.'
    ]
  },
  {
    id: 'reverse_number',
    title: 'Reverse Number',
    slug: 'reverse-number',
    difficulty: 'Easy',
    question: 'Given an integer, reverse its digits.',
    approach: [
      'Initialize reversed_num = 0.',
      'While input num is not 0:',
      '  - Get last digit using num % 10.',
      '  - Multiply reversed_num by 10 and add the digit.',
      '  - Remove last digit from num using floor division by 10.'
    ],
    code: `
function reverseNumber(num) {
  let reversed = 0;
  let sign = num < 0 ? -1 : 1;
  num = Math.abs(num);
  
  while (num > 0) {
    reversed = (reversed * 10) + (num % 10);
    num = Math.floor(num / 10);
  }
  
  return reversed * sign;
}`,
    explanation: [
      'Line 3-4: Handle negative numbers by storing the sign and using absolute values.',
      'Line 7: Shift existing reversed digits left by multiplying by 10 and add the new digit.',
      'Line 8: Update input number by removing the unit place digit.',
      'Line 11: Restore the original sign to the reversed result.'
    ],
    variations: [
      'Reverse a number and handle 32-bit integer overflow (LeetCode variant).',
      'Check if reversing a number results in the same number (another way for palindrome).'
    ]
  },
  {
    id: 'array_max',
    title: 'Array Maximum',
    slug: 'array-maximum',
    difficulty: 'Easy',
    question: 'Find the largest element in an array of numbers.',
    approach: [
      'Assume the first element as current max.',
      'Iterate through the array starting from the second element.',
      'If current element is greater than current max, update current max.',
      'Return the final max value.'
    ],
    code: `
function findMax(arr) {
  if (arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

// Modern ES6 approach
const getMax = (arr) => Math.max(...arr);`,
    explanation: [
      'Line 3: Initialize max with the first element of the array.',
      'Line 4-8: Standard loop through remaining elements with comparison.',
      'Line 13: Using spread operator (...) with Math.max for a concise solution.'
    ],
    variations: [
      'Find the second largest element.',
      'Find both min and max in a single pass.',
      'Find max element in a 2D array.'
    ]
  },
  {
    id: 'string_reverse',
    title: 'Reverse String',
    slug: 'reverse-string',
    difficulty: 'Easy',
    question: 'Write a function that reverses a string.',
    approach: [
      'Interactive approach: Loop backwards from end of string to beginning.',
      'Built-in: split(), reverse(), join().',
      'Two-pointer approach: Swap characters at start and end, move towards middle.'
    ],
    code: `
// Method 1: Built-in
function reverseStr(str) {
  return str.split('').reverse().join('');
}

// Method 2: Two-pointer (In-place if it were an array)
function reverseStrTwoPointer(str) {
  let arr = str.split('');
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr.join('');
}`,
    explanation: [
      'Line 3: Uses string splitting to array, array reversal, and joining.',
      'Line 11-16: Swaps characters from both ends using destructuring assignment.',
      'Line 13: The loop continues until the pointers meet in the middle.'
    ],
    variations: [
      'Reverse each word in a sentence but keep the sentence order.',
      'Reverse only the vowels in a string.',
      'Reverse a string in-place without using extra space (when input is a char array).'
    ]
  },
  {
    id: 'bank_transaction',
    title: 'Bank Transaction (Real-world)',
    slug: 'bank-transaction',
    difficulty: 'Medium',
    question: 'Implement a basic banking system logic where you process a list of transactions (deposit or withdrawal) and return the final balance. Ensure no withdrawal proceeds if balance is insufficient.',
    approach: [
      'Initialize an initial balance.',
      'Loop through a list of transaction objects { type, amount }.',
      'For "deposit", add amount to balance.',
      'For "withdraw", check if balance >= amount. If yes, subtract. If no, log an error.',
      'Return the final state.'
    ],
    code: `
function processTransactions(initialBalance, transactions) {
  let currentBalance = initialBalance;
  let history = [];

  for (let tx of transactions) {
    if (tx.type === 'deposit') {
      currentBalance += tx.amount;
      history.push(\`Deposited: \${tx.amount}. New balance: \${currentBalance}\`);
    } else if (tx.type === 'withdraw') {
      if (currentBalance >= tx.amount) {
        currentBalance -= tx.amount;
        history.push(\`Withdrew: \${tx.amount}. New balance: \${currentBalance}\`);
      } else {
        history.push(\`Failed Withdraw: \${tx.amount}. Insufficient funds (Bal: \${currentBalance})\`);
      }
    }
  }
  return { finalBalance: currentBalance, history };
}`,
    explanation: [
      'Line 3: Maintain a log of all attempted transactions.',
      'Line 6-9: Handle deposits by increasing the balance.',
      'Line 10-15: Basic validation for withdrawals to prevent negative balance.',
      'Line 18: Return both the final balance and the detailed processing history.'
    ],
    variations: [
      'Add a transaction fee for every withdrawal.',
      'Calculate interest on the balance after all transactions.',
      'Sort transactions by timestamp before processing.'
    ]
  }
];
