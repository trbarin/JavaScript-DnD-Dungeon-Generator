
import getUnit from '../../unit/unit.js';
import runSuite from '../../unit/run.js';
import suite from '../../unit/suite.js';

import { element } from './../utility/html.js';
import { plural } from './../utility/tools.js';

// -- Config -------------------------------------------------------------------

const unitUrl = './unit.html';

// -- Private Functions --------------------------------------------------------

/**
 * Get output
 *
 * @param {import('../../unit/unit.js').Summary} summary
 *
 * @returns {string}
 */
export const _getOutput = ({ assertions, errors, failures }) => {
    let koboldsText = `mischievous ${plural(assertions, 'kobold')}`;

    if (failures || errors.length) {
        let failureText = ` ${failures} ${plural(failures, 'ogre')}`;
        let errorText   = ` ${errors.length} ${plural(errors.length, 'dragon')}`;

        let encounterText = 'Encountered';
        encounterText += failures ? failureText : '';
        encounterText += failures && errors.length ? ' and' : '';
        encounterText += errors.length ? errorText : '';
        encounterText += errors.length ? '!' : '.';

        let linkAttrs = { 'href': unitUrl, 'data-error': true };

        let report = element('p', `Checked for ${assertions} ${koboldsText}. `) +
                     element('p', element('a', encounterText, linkAttrs));

        return report;
    }

    return element('p', `Checked for ${assertions} ${element('a', koboldsText, { href: unitUrl })}`);
};

// -- Public Functions ---------------------------------------------------------

/**
 * Run tests and return the test summary UI
 *
 * @returns {string}
 */
export default () => _getOutput(runSuite(getUnit(), suite));
