import prisma from '@/lib/prisma';
import { NextApiHandler } from 'next';
import { PromiseElement } from '@/lib/types/utils';
import { Match } from '@prisma/client';
import { APIResponse } from '@/lib/types/api';

export type LeaderboardAPIResponse = APIResponse<{
  positions: PromiseElement<ReturnType<typeof getLeaderboardPositions>>;
  nextCursor?: Match['id'];
}>;

const getLeaderboardPositions = (gameid: string, take: number, cursor?: Pick<Match, 'id'>) =>
  prisma.playerScore.findMany({
    where: { game: { id: gameid } },
    orderBy: { points: 'desc' },
    cursor,
    skip: cursor ? 1 : 0,
    take,
    select: {
      id: true,
      points: true,
      player: {
        select: {
          p1matches: { where: { gameid }, select: { p1score: true, p2score: true } },
          p2matches: { where: { gameid }, select: { p1score: true, p2score: true } },
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

const leaderboardHandler: NextApiHandler<LeaderboardAPIResponse> = async (req, res) => {
  const gameId = req.query.id;

  if (req.method !== 'GET') return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  if (typeof gameId !== 'string') return res.status(400).json({ status: 'error', message: 'Invalid game id' });

  const cursor = typeof req.query.cursor === 'string' ? { id: +req.query.cursor } : undefined;
  const take = Math.min(+req.query.count, 20) || 10;
  const positions = await getLeaderboardPositions(gameId, take, cursor);
  const nextCursor = positions.length >= take ? positions[positions.length - 1].id : undefined;

  // res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600');
  res.status(200).json({ status: 'ok', positions, nextCursor });
};

export default leaderboardHandler;