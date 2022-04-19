import prisma from '@/lib/prisma';
import { APIResponse } from '@/lib/types/api';
import { NextApiHandler } from 'next';

const getUsers = () =>
  prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });

export type DevUsersAPIResponse = APIResponse<{
  users: Awaited<ReturnType<typeof getUsers>>;
}>;

const devUsersHandler: NextApiHandler<DevUsersAPIResponse> = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== 'true')
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  const users = await getUsers();

  res.status(200).json({
    status: 'ok',
    data: { users },
  });
};

export default devUsersHandler;
