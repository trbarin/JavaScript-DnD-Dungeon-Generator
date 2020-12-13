
import { list as roomTypes } from './type.js';
import { roll } from '../utility/roll.js';
import size, { list as sizes } from '../attributes/size.js';
import type from './type.js';

let {
    tiny,
    small,
    medium,
    large,
    massive,
} = size;

// TODO rename to not confuse "width" with x-axis
export const _hallLengthMin = 3;
export const _hallWidthMin  = 1;
export const _hallWidthMax  = 1;

/**
 * @typedef {[number, number]} RoomDimensions
 */

/**
 * Dimension ranges
 *
 * @type {Object.<string, RoomDimensions>}
 */
export const dimensionRanges = {
    [tiny]   : [ 2, 3  ],
    [small]  : [ 2, 4  ],
    [medium] : [ 2, 5  ],
    [large]  : [ 3, 10 ],
    [massive]: [ 5, 15 ],
};

/**
 * Room sizes
 *
 * @type {Object.<string, string[]>}
 */
const roomSizes = {
    [type.ballroom] : [ medium, large, massive ],
    [type.bathhouse]: [ small, medium, large, massive ],
    [type.dining]   : [ small, medium, large, massive ],
    [type.dormitory]: [ medium, large, massive ],
    [type.greatHall]: [ large, massive ],
    [type.pantry]   : [ tiny, small, medium ],
    [type.parlour]  : [ tiny, small, medium ],
    [type.study]    : [ tiny, small, medium ],
    [type.throne]   : [ medium, large, massive ],
    [type.torture]  : [ tiny, small, medium ],
};

/**
 * Custom room dimensions
 *
 * @type {{
 *     hallway: (roomSize: string, { isHorizontal: number }) => RoomDimensions
 * }}
 */
export const customDimensions = {
    hallway: (roomSize, { isHorizontal = roll() } = {}) => {
        let [ min, max ] = dimensionRanges[roomSize];

        let length = roll(Math.max(_hallLengthMin, min), max);
        let width  = roll(_hallWidthMin, _hallWidthMax);

        let roomWidth  = isHorizontal ? length : width;
        let roomHeight = isHorizontal ? width  : length;

        // TODO should return an array
        return { roomWidth, roomHeight };
    },
};

/**
 *
 */
export const roomTypeSizes = roomTypes.reduce((obj, type) => {
    let validSizes = roomSizes[type] || sizes;

    obj[type] = validSizes;

    return obj;
}, {});
