import postOfficeHandler from '@/lib/api/handlers/office/postOfficeHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).end('Internal server error');
  },
}).post(postOfficeHandler);

export default handler;