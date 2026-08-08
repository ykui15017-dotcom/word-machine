import { objects } from './objects.js'; import { containers } from './containers.js';
import { spaces } from './spaces.js'; import { living } from './living.js';
import { organic } from './organic.js'; import { materials } from './materials.js';
import { actions } from './actions.js'; import { states } from './states.js';
import { relations } from './relations.js'; import { scale } from './scale.js';
import { visual } from './visual.js'; import { concepts } from './concepts.js';
import { details } from './details.js'; import { observations } from './observations.js';
export const BASE_WORDS=[...objects,...containers,...spaces,...living,...organic,...materials,...actions,...states,...relations,...scale,...visual,...concepts,...details,...observations];
export const CATEGORIES=['object','container','space','living','organic','material','action','state','relation','scale','visual','concept','detail','observation'];
