import { BASE_MATCH_POINTS, calculateMatchPoints, STARTING_POINTS } from './leaderboard';

describe('Given players 1 and 2 TOTAL POINTS and the difference in MATCH SCORE between 1 and 2', () => {
  test('when both players have the same score, the match is worth the base points', () => {
    const p1Score = 100;
    const p2Score = 100;
    const pointsDifference = 1;

    const matchPoints = calculateMatchPoints(p1Score, p2Score, pointsDifference);
    expect(matchPoints).toBe(BASE_MATCH_POINTS);
  });

  test('player 1 with starting score would take 10 matches to overtake player 2 with 10 times points total', () => {
    let p1Score = STARTING_POINTS;
    let p2Score = STARTING_POINTS * 10;
    let matchesWon = 0;

    const p1WinGame = () => {
      const matchPoints = calculateMatchPoints(p1Score, p2Score, 1);

      p1Score += matchPoints;

      p2Score -= matchPoints;
      matchesWon++;
      console.log(p1Score, p2Score);
    };

    while (p1Score < p2Score) p1WinGame();

    expect(matchesWon).toBe(10);
  });

  test('when players have the opposite total points, match is worth base points', () => {
    const p1Score = -100;
    const p2Score = 100;

    const matchPoints = calculateMatchPoints(p1Score, p2Score, 1);
    expect(matchPoints).toBe(BASE_MATCH_POINTS);
  });

  test('when either p1 or p2 have 0 points, should not throw an error', () => {
    let p1Score = 0;
    let p2Score = 100;

    const match1Points = calculateMatchPoints(p1Score, p2Score, 1);
    expect(match1Points).toBeGreaterThan(0);

    p1Score = 100;
    p2Score = 0;

    const match2Points = calculateMatchPoints(p1Score, p2Score, 1);
    expect(typeof match2Points).toBe('number');
  });

  test('when both players have 0 points, match is worth base points', () => {
    const p1Score = 0;
    const p2Score = 0;

    const matchPoints = calculateMatchPoints(p1Score, p2Score, 1);
    expect(matchPoints).toBe(BASE_MATCH_POINTS);
  });

  test('on 1000 random game iterations with 10 players, total number of points is equal to base times the number of players', () => {
    const players = new Array(10).fill(100);

    const randomMatch = () => {
      const p1Index = Math.floor(Math.random() * players.length);
      const p2Index = Math.floor(Math.random() * players.length);
      const p1Score = players[p1Index];
      const p2Score = players[p2Index];
      const pointsDifference = Math.floor(Math.random() * 10 - 5);

      const matchPoints = calculateMatchPoints(p1Score, p2Score, pointsDifference);
      players[p1Index] += matchPoints;
      players[p2Index] -= matchPoints;
    };

    for (let i = 0; i < 1000; i++) {
      randomMatch();
    }

    const totalPoints = players.reduce((acc, curr) => acc + curr, 0);
    expect(totalPoints).toBe(STARTING_POINTS * players.length);
  });
});