/**
 * Centralized order-status state machine.
 *
 * TRANSITIONS[currentStatus][newStatus] = role allowed to make that change.
 * Absence of a key means the transition is not allowed from that status,
 * for any role - this is the single source of truth the backend checks
 * before ever writing a new status, so a forged frontend request can never
 * skip or reverse a step.
 */
const TRANSITIONS = {
  Placed: {
    Processing: 'restaurant_owner',
    Canceled: 'regular_user',
  },
  Processing: {
    'In Route': 'restaurant_owner',
  },
  'In Route': {
    Delivered: 'restaurant_owner',
  },
  Delivered: {
    Received: 'regular_user',
  },
  Canceled: {},
  Received: {},
};

/**
 * Returns the role allowed to move currentStatus -> newStatus, or null if
 * that transition is not permitted at all (regardless of role).
 */
function getAllowedRole(currentStatus, newStatus) {
  return TRANSITIONS[currentStatus]?.[newStatus] || null;
}

function getValidNextStatuses(currentStatus) {
  return Object.keys(TRANSITIONS[currentStatus] || {});
}

module.exports = { TRANSITIONS, getAllowedRole, getValidNextStatuses };
