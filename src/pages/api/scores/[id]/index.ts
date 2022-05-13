import deletePlayerScoreHandler from '@/lib/api/handlers/playerScore/deletePlayerScoreHandler';
import patchPlayerScoreHandler from '@/lib/api/handlers/playerScore/patchPlayerScoreHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).end('Internal server error');
  },
})
  .patch(patchPlayerScoreHandler)
  .delete(deletePlayerScoreHandler);

export default handler;