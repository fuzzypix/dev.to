/**
 * Problem statement
 * Building a Rate Limit
 * Requirements:
 * - X requests for Y seconds (window)
 * - function: returns true/false whether request is allowed or not
 * - the customer is id-ed by an string
 *
 * Non-functional:
 * - small number of customers for now
 *  * talk about scaling later
 *
 * Design:
 *  - Bucket algo
 *
 *            Pod1
 * request               Redis - integer key
 *            Pod2
 *
 * customers have X + N if they haven't had requests in a while
 * if they exceed rate limit for a window -> no burstBonus
 * if they didn't exceed  -> bonus
 *
 */

interface UserRecord {
  tokens: number;
  expiresAt: number; //
}

class RateLimiter {
  private records: Map<string, UserRecord> = new Map<string, UserRecord>();

  constructor(
    private maxTokensPerInterval: number,
    private intervalInSeconds: number,
    private burstBonusTokensPerInterval: number = 0,
  ) {}

  public checkIfAllowed(userId: string, now: number = Date.now()): boolean {
    // TODO: clean up records

    let record = this.records.get(userId);
    if (!record || record.expiresAt < now) {
      const shouldHaveBonus = !!record && record.tokens > 0;

      record = {
        tokens: this.maxTokensPerInterval + (shouldHaveBonus ? this.burstBonusTokensPerInterval : 0),
        expiresAt: now + this.intervalInSeconds * 1000,
      };
      this.records.set(userId, record);
    }

    if (record.tokens > 0) {
      record.tokens--;
      return true;
    }

    return false;
  }
}

describe('interview test', () => {
  it('created successfully', () => {
    const testedLimiter = new RateLimiter(10, 1);
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();
  });
  it('rejects if bucket is empty', () => {
    const testedLimiter = new RateLimiter(1, 10);
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one')).toBeFalsy();
  });
  it('rejects if bucket is empty but allows when refilled', () => {
    const testedLimiter = new RateLimiter(1, 10);
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one')).toBeFalsy();

    const now = Date.now() + 11 * 1000;
    expect(testedLimiter.checkIfAllowed('one', now)).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one')).toBeFalsy();
  });
  it('works for different users', () => {
    const testedLimiter = new RateLimiter(1, 10);
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('two')).toBeTruthy();

    const now = Date.now() + 11 * 1000;
    expect(testedLimiter.checkIfAllowed('one', now)).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one')).toBeFalsy();

    expect(testedLimiter.checkIfAllowed('two', now)).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('two')).toBeFalsy();
  });

  it('burst bonus is not given on first request', () => {
    const testedLimiter = new RateLimiter(2, 5, 1);
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one')).toBeFalsy();
  });

  it('burst bonus works', () => {
    const testedLimiter = new RateLimiter(2, 5, 1);
    expect(testedLimiter.checkIfAllowed('one')).toBeTruthy();

    const nextTurn = Date.now() + 6 * 1000;
    expect(testedLimiter.checkIfAllowed('one', nextTurn)).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one', nextTurn + 1)).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one', nextTurn + 2)).toBeTruthy();
    expect(testedLimiter.checkIfAllowed('one', nextTurn + 3)).toBeFalsy();
  });
});
