import { postOfficeSchema } from '@/lib/api/schemas';
import prisma from '@/lib/prisma';
import { canViewDashboard } from '@/lib/roles';
import { APIResponse } from '@/lib/types/api';
import { nextAuthOptions } from '@/pages/api/auth/[...nextauth]';
import { NextApiHandler } from 'next';
import { getServerSession } from 'next-auth';
import { InferType, ValidationError } from 'yup';

type PostOfficeBody = InferType<typeof postOfficeSchema>;
export type ValidGamePostResponse = Awaited<ReturnType<typeof createOffice>>;
export type OfficePOSTAPIResponse = APIResponse<ValidGamePostResponse>;

const createOffice = (body: PostOfficeBody) =>
  prisma.office.create({
    data: body,
  });

const postOfficeHandler: NextApiHandler<OfficePOSTAPIResponse> = async (req, res) => {
  await postOfficeSchema
    .validate(req.body, { abortEarly: false })
    .then(async body => {
      const session = await getServerSession({ req, res }, nextAuthOptions);
      const canEdit = canViewDashboard(session?.user.roleId);
      if (!session || !canEdit) return res.status(401).json({ status: 'error', message: 'Unauthorised' });

      try {
        const office = await createOffice(body);

        res.status(200).json({ status: 'ok', data: office });
      } catch {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
    })
    .catch((err: ValidationError) => {
      console.error(err);
      const stack = err.inner.map(err => ({
        type: err.type,
        path: err.path as keyof ValidGamePostResponse,
        message: err.errors.join('; '),
      }));
      return res.status(400).json({ status: 'error', stack });
    });
};

export default postOfficeHandler;