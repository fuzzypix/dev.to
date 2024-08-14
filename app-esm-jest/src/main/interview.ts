import {PriorityQueue} from '@datastructures-js/priority-queue';
import moment from 'moment';

interface Client {
  expiresAtMs: number;
  tokens: number;
}

class RateLimiter1 {
  private readonly clients = new Map<string, Client>();

  constructor(private readonly windowMs: number, private readonly tokensPerWindow: number) {}

  checkIfAllowed(key: string, timestamp: number = Date.now()) {
    // TODO: clean expired client records

    let client = this.clients.get(key);
    if (!client || client.expiresAtMs < timestamp) {
      client = {expiresAtMs: timestamp + this.windowMs, tokens: this.tokensPerWindow};
      this.clients.set(key, client);
    }
    if (client.tokens > 0) {
      client.tokens--;
      return true;
    }
    return false;
  }
}

class RateLimiter {
  constructor(
    private ratePerSecond: number,
    private burstLimit: number,
    private tokens: number = 0,
    private lastUpdateTsMs = Date.now(),
  ) {
    // adjusts tokens if needed (to be less than burstLimit)
    this.update(lastUpdateTsMs);
  }

  update(currentTsMs = Date.now()) {
    const delta = currentTsMs - this.lastUpdateTsMs;
    if (delta < 0) {
      return;
    }
    const tokensPerSecond = 60000 / this.ratePerSecond;
    const grant = Math.floor(delta / tokensPerSecond);
    const surplus = delta % tokensPerSecond;
    this.lastUpdateTsMs = currentTsMs - surplus;
    this.tokens = Math.min(this.burstLimit, this.tokens + grant);
  }

  public allow(currentTsMs = Date.now()): boolean {
    this.update(currentTsMs);
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
}

function doStuffs({a = <number>1, b = <string>'what', c = <boolean>true} = {}) {}

export function doTheThing(param: string) {
  const timer = setTimeout(() => {}, 100);
  clearTimeout(timer);

  doStuffs({a: 2});
  type ReadonlyUserInfo = readonly [string, number];
  const stuff: ReadonlyUserInfo = ['asd', 11];
  // stuff[0] = 1;
  type UUU = {
    a: string;
    stuff: () => string; // { return '';};
  };
  let bb: UUU = {
    a: 'asdf',
    stuff() {
      return '';
    },
  };

  const q = new PriorityQueue((a: string, b: string) => (a > b ? 1 : a < b ? -1 : 0));
  q.push('asdf');
  const f = moment().utcOffset();
  const mom = moment();
  const day = mom.dayOfYear();
  return 'hello ' + param + day;
}
