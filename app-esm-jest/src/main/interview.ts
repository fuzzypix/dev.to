import moment from 'moment';

interface Client {
  expiredAtMs: number;
  tokens: number;
}

class RateLimiter1 {
  private clients = new Map<string, Client>();
  constructor(private readonly windowMs: number, private readonly tokensPerWindow: number) {}

  checkIfAllowed(key: string, timestamp: number = Date.now()) {
    let client = this.clients.get(key);
    if (!client || client.expiredAtMs < timestamp) {
      client = {expiredAtMs: timestamp + this.windowMs, tokens: this.tokensPerWindow};
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
  constructor(private ratePerSecond: number, private tokens: number = 0, private lastUpdateTsMs = Date.now()) {
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
    this.tokens += grant;
  }

  public allow(requestedCount: number) {}
}

export function doTheThing(param: string) {
  const mom = moment();
  const day = mom.dayOfYear();
  return 'hello ' + param + day;
}
