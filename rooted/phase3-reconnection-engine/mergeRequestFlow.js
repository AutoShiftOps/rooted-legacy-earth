export const MATCH_STATUS = {
  SUGGESTED: "suggested",
  CONFIRMED_BY_A: "confirmed_by_a",
  CONFIRMED_BY_B: "confirmed_by_b",
  MUTUALLY_CONFIRMED: "mutually_confirmed",
  REJECTED: "rejected",
};

export function confirmMatch(matchRecord, confirmingUserId) {
  const isA = matchRecord.userAId === confirmingUserId;
  if (isA && matchRecord.status === MATCH_STATUS.SUGGESTED) {
    matchRecord.status = MATCH_STATUS.CONFIRMED_BY_A;
  } else if (!isA && matchRecord.status === MATCH_STATUS.SUGGESTED) {
    matchRecord.status = MATCH_STATUS.CONFIRMED_BY_B;
  } else if (
    (isA && matchRecord.status === MATCH_STATUS.CONFIRMED_BY_B) ||
    (!isA && matchRecord.status === MATCH_STATUS.CONFIRMED_BY_A)
  ) {
    matchRecord.status = MATCH_STATUS.MUTUALLY_CONFIRMED;
  }
  return matchRecord;
}

export function rejectMatch(matchRecord) {
  matchRecord.status = MATCH_STATUS.REJECTED;
  return matchRecord;
}
