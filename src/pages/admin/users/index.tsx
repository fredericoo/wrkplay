import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';
import Settings from '@/components/shared/Settings';
import { BANNED_ROLE_ID } from '@/constants';
import Admin from '@/layouts/Admin';
import type { PageWithLayout } from '@/layouts/types';
import { withDashboardAuth } from '@/lib/admin';
import useNavigationState from '@/lib/navigationHistory/useNavigationState';
import prisma from '@/lib/prisma';
import { roleIcons } from '@/lib/roles';
import { Stack } from '@chakra-ui/react';

type AdminPageProps = {
  users: Awaited<ReturnType<typeof getUsers>>;
};

const getUsers = () =>
  prisma.user.findMany({
    orderBy: [{ roleId: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, image: true, roleId: true },
  });

const AdminPage: PageWithLayout<AdminPageProps> = ({ users }) => {
  useNavigationState('Users');
  return (
    <Stack spacing={8}>
      <Breadcrumbs
        px={2}
        levels={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
        ]}
      />
      <Settings.List>
        <SEO title="Users" />
        {users.map(user => (
          <Settings.Link
            icon={roleIcons[user.roleId]}
            href={`/admin/users/${user.id}`}
            key={user.id}
            css={user.roleId === BANNED_ROLE_ID ? { textDecoration: 'line-through' } : undefined}
          >
            {user.name}
          </Settings.Link>
        ))}
      </Settings.List>
    </Stack>
  );
};

AdminPage.Layout = Admin;

export default AdminPage;

export const getServerSideProps = withDashboardAuth(async () => {
  return {
    props: {
      users: await getUsers(),
    },
  };
});
