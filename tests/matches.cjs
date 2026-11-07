const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
  new vm.Script(script);
}
const start = html.indexOf('function findMatches(g){');
const end = html.indexOf('function swapIn(', start);
assert.ok(start >= 0 && end > start, 'Game matching function must exist');
const findMatches = new Function('ROWS', 'COLS', html.slice(start, end) + '\nreturn findMatches;')(8, 7);

function check(name, animals, expected) {
  const board = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => ({ t: 100 + r * 7 + c })));
  for (const [r, c] of animals) board[r][c] = { t: 0 };
  assert.deepEqual([...findMatches(board)].sort((a, b) => a - b), expected, name);
  console.log('PASS ' + name);
}

check('four horizontal animals stay', [[0,0],[0,1],[0,2],[0,3]], []);
check('four vertical animals stay', [[0,0],[1,0],[2,0],[3,0]], []);
check('long horizontal line stays', [[0,0],[0,1],[0,2],[0,3],[0,4]], []);
check('L shape stays', [[0,0],[1,0],[2,0],[2,1]], []);
check('2x2 clears four cells', [[0,0],[0,1],[1,0],[1,1]], [0,1,7,8]);
check('overlapping squares clear six cells once', [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]], [0,1,2,7,8,9]);
check('square at bottom right clears', [[6,5],[6,6],[7,5],[7,6]], [47,48,54,55]);
assert.equal(findMatches(Array.from({ length: 8 }, () => Array(7).fill(null))).size, 0);
console.log('PASS empty cells stay; inline JavaScript parses');
