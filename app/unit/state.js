// @ts-check

import * as assertFunctions from './assert.js';
import { getResultMessage } from './output.js';

// -- Types --------------------------------------------------------------------

/** @typedef {import('./assert.js').Result} Result */

/** @typedef {(value: any) => Assertions} Assertion */

/**
 * @typedef {object} Assertions
 *
 * @prop {Assertion} equals
 * @prop {Assertion} equalsArray
 * @prop {Assertion} equalsObject
 * @prop {Assertion} excludesAttributes
 * @prop {Assertion} hasAttributes
 * @prop {Assertion} isArray
 * @prop {Assertion} isBoolean
 * @prop {Assertion} isElementTag
 * @prop {Assertion} isFalse
 * @prop {Assertion} isFunction
 * @prop {Assertion} isInArray
 * @prop {Assertion} isNull
 * @prop {Assertion} isNumber
 * @prop {Assertion} isObject
 * @prop {Assertion} isSet
 * @prop {Assertion} isString
 * @prop {Assertion} isTrue
 * @prop {Assertion} isUndefined
 * @prop {Assertion} stringExcludes
 * @prop {Assertion} stringIncludes
 * @prop {Assertion} throws
*/

/** @typedef {{ scope: Scope; msg: string }} CurrentScope */

/**
 * @typedef {object} Entry
 *
 * @prop {string} msg
 * @prop {boolean} isOk
 */

/** @typedef {"assert()" | "describe()" | "it()" | "default()"} Scope */

/**
 * @typedef {object} State
 *
 * @prop {() => Summary} getSummary
 * @prop {(error: string) => void} onError
 * @prop {(path: string, tests: Function) => void} runUnits
 */

/**
 * @typedef {object} Summary
 *
 * @prop {number} assertions
 * @prop {number} failures
 * @prop {Result[]} results
 * @prop {Result[]} errors
 */

/**
 * @typedef {object} Utility
 *
 * @prop {(value: any) => Assertions} assert
 * @prop {Function} describe
 * @prop {Function} it
 */

// -- Config -------------------------------------------------------------------

/** @type {{ [key: string]: Scope }} */
const scope = {
    assert  : 'assert()',
    describe: 'describe()',
    it      : 'it()',
    suite   : 'default()',
};

// -- Public Functions ---------------------------------------------------------

/**
 * Creates a closure containing unit test state: assertions, errors, and
 * failures. Returns an object of unit test operations.
 *
 * @returns {State}
 */
export function unitState() {

    /**
     * Assertions
     *
     * @type {number}
     */
    let assertions = 0;

    /**
     * Current
     *
     * @type {CurrentScope[]}
     */
    let current = [];

    /**
     * Errors
     *
     * @type {Result[]}
     */
    let errors = [];

    /**
     * Failures
     *
     * @type {number}
     */
    let failures = 0;

    /**
     * Results
     *
     * @type {Result[]}
     */
    let results = [];

    /**
     * Check scope
     *
     * @param {string} nextScope
     * @param {string[]} allowed
     *
     * @throws
     */
    const checkScope = (nextScope, allowed) => {
        let currentEntry = current[current.length - 1];
        let currentScope = currentEntry.scope;

        if (!allowed.includes(currentScope)) {
            throw new TypeError(`${nextScope} must be called inside of ${allowed.join(' or ')}`);
        }
    };

    /**
     * Describe
     *
     * @param {string} msg
     * @param {Function} callback
     */
    const describe = (msg, callback) => {
        checkScope(scope.describe, [ scope.suite, scope.describe ]);

        current.push({ scope: scope.describe, msg });
        callback();
        current.pop();
    };

    /**
     * It
     *
     * @param {string} msg
     * @param {Function} callback
     */
    const it = (msg, callback) => {
        checkScope(scope.it, [ scope.describe ]);

        current.push({ scope: scope.it, msg });
        callback();
        current.pop();
    };

    /**
     * Run assertion
     *
     * @param {*} actual
     * @param {*} expected
     * @param {Function} assertion
     *
     * @returns {{ [key: string]: Assertion }}
     */
    const runAssertion = (actual, expected, assertion) => {
        checkScope(scope.assert, [ scope.it ]);

        let result = assertion(actual, expected);
        let { msg, isOk } = result;

        assertions++;

        if (!isOk) {
            failures++;
        }

        current.push({
            scope: scope.assert,
            msg: `${isOk ? 'Pass:' : 'Failure:'} ${msg}`,
        });

        results.push({
            isOk,
            msg: getResultMessage(current),
        });

        current.pop();

        return assert(actual);
    };

    /**
     * Assert
     *
     * @param {any} value
     *
     * @returns {ReturnType<Assertions>}
     */
    const assert = (value) => Object.entries(assertFunctions).reduce((assertObj, [ key, assertion ]) => {
        assertObj[key] = (expected) => runAssertion(value, expected, assertion);
        return assertObj;
    }, {});

    /**
     * Utility
     *
     * @type {Utility}
     */
    const utility = {
        assert,
        describe,
        it,
    };

    /**
     * Run units
     *
     * @param {string} path
     * @param {function} tests
     */
    const runUnits = (path, tests) => {
        current.push({ scope: scope.suite, msg: path });
        tests(utility);
        current.pop();
    };

    /**
     * Get summary
     *
     * @returns {Summary}
     */
    const getSummary = () => {
        return {
            assertions,
            errors: [ ...errors ],
            failures,
            results: [ ...results ],
        };
    };

    /**
     * Get summary
     *
     * @param {string} error
     */
    const onError = (error) => {
        let result = { isOk: false, msg: error };

        results.push(result);
        errors.push(result);
    };

    return {
        getSummary,
        onError,
        runUnits,
    };
}
