import assert from 'assert';
import { getExactMatchStrs, getNotExactMatchStr } from './utils';

test1();
test2();

function test1() {
    const str = `show me the "exact1" money "exact2" `;
    const strs = getExactMatchStrs(str);
    assert(strs[0] === 'exact1');
    assert(strs[1] === 'exact2');
    assert(getNotExactMatchStr(str) === `show me the  money`);
}

function test2() {
    const str = ` show me `;
    const strs = getExactMatchStrs(str);
    assert(strs.length === 0);
    assert(getNotExactMatchStr(str) === `show me`);
}

console.log('passed');
