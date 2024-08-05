/**
 * function
 * @parm ballots
 * @returns list of all candidates (names) sorted in descending order by the number of votes
 * first one is the winner, and so on
 *
 * >> each ballot up to 3 candidates
 * >>
 * order:
 * all are optional
 * can vote for more than once
 *  - 3 point
 *  - 2
 *  - 1
 * Ballot { names[3] }
 *
 * Fits in memory.
 *
 *
 * List<String> getResults(List<Ballot> ballots)
 *
 * input:
 * not legal
 *  [dima, dima, dima]
 *  [dima, dima, bill]
 *  [dima, bill, john, dill] <<<
 *
 * legal
 *  [dima, , ]
 *  [, , ]
 *  [dima, john, bill]
 *
 *
 *  [dima dima dima]
 *
 * tie break:
 *  - whoever gets more higher value votes wins
 *
 *  dima 3 - 1
 *  john 1 - 3
 *  [dima, , ] > wins
 *  [, , john]
 *  [, , john]
 *  [, , john]
 *
 *
 */

type Ballot = {
  votes: [string, string, string];
};

function getResults(ballots: Ballot[]): string[] {
  const allVotes = new Map<string, number>();
  const voteBreakdown = new Map<string, [number, number, number]>(); // number of votes of each level

  for (const ballot of ballots) {
    const voted = new Set();
    let points = 3;
    for (const name of ballot.votes) {
      if (name && !voted.has(name)) {
        voted.add(name);

        const votes = allVotes.get(name) ?? 0;
        allVotes.set(name, votes + points);

        const breakDown = voteBreakdown.get(name) ?? [0, 0, 0];
        breakDown[points - 1]++; // [1,2,3]
        voteBreakdown.set(name, breakDown);
      }

      points--;
    }
  }

  const scores = Array.from(allVotes.entries())
    .sort((a, b) => {
      const diff = b[1] - a[1];
      if (diff !== 0) {
        return diff;
      }
      const bA = voteBreakdown.get(a[0])!;
      const bB = voteBreakdown.get(b[0])!;

      // [3, 1, 0] vs [1, 3, 3]

      if (bA[2] !== bB[2]) {
        return bB[2] - bA[2];
      }
      if (bA[1] !== bB[1]) {
        return bB[1] - bA[1];
      }
      if (bA[0] !== bB[0]) {
        return bB[0] - bA[0];
      }
      return -1;
    })
    .map(value => value[0]);
  return scores;
}

describe('interview test', () => {
  it('empty return empty', () => {
    expect(getResults([])).toEqual([]);
  });

  it('tie break 1', () => {
    expect(getResults([{votes: ['dima', '', '']}, {votes: ['', 'john', '']}, {votes: ['', '', 'john']}])).toEqual([
      'dima',
      'john',
    ]);
  });

  it('tie break 2', () => {
    expect(
      getResults([
        {votes: ['dima', '', '']},
        {votes: ['', '', 'john']},
        {votes: ['', '', 'john']},
        {votes: ['', '', 'john']},
      ]),
    ).toEqual(['dima', 'john']);
  });

  it('valid input', () => {
    expect(getResults([{votes: ['dima', '', '']}, {votes: ['', 'john', '']}])).toEqual(['dima', 'john']);
    expect(getResults([{votes: ['dima', 'john', '']}, {votes: ['', 'john', '']}])).toEqual(['john', 'dima']);
    expect(
      getResults([{votes: ['dima', 'dima', 'dima']}, {votes: ['john', '', '']}, {votes: ['', '', 'john']}]),
    ).toEqual(['john', 'dima']);
  });
});
