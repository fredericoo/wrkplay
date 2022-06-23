import SettingsGroup from '@/components/admin/SettingsGroup';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmButton from '@/components/ConfirmButton';
import FloatingActionButton from '@/components/FloatingActionButton';
import SEO from '@/components/SEO';
import Settings from '@/components/Settings';
import { WEBSITE_URL } from '@/constants';
import Admin from '@/layouts/Admin';
import { PageWithLayout } from '@/layouts/types';
import { EditableField, withDashboardAuth } from '@/lib/admin';
import { patchGameSchema } from '@/lib/api/schemas';
import useNavigationState from '@/lib/navigationHistory/useNavigationState';
import prisma from '@/lib/prisma';
import { toSlug } from '@/lib/slug';
import { Stack } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { IoEyeOutline } from 'react-icons/io5';
import { object, string } from 'yup';

const getSeason = async (id: string) => {
  const response = await prisma.season.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      endDate: true,
      startDate: true,
      gameid: true,
      game: {
        select: {
          id: true,
          slug: true,
          name: true,
          office: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
  if (!response) return null;

  const responseWithoutDates = {
    ...response,
    startDate: response.startDate.toISOString(),
    endDate: response?.endDate?.toISOString() || null,
  };

  return responseWithoutDates;
};

type Season = NonNullable<Awaited<ReturnType<typeof getSeason>>>;

type AdminPageProps = {
  season: Season;
};

const AdminPage: PageWithLayout<AdminPageProps> = ({ season }) => {
  const { push } = useRouter();
  useNavigationState(season.name);

  const editableFields: EditableField<Season>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    {
      id: 'slug',
      label: 'Slug',
      type: 'text',
      prefix: WEBSITE_URL + `/[office]/[game]/`,
      format: toSlug,
    },
    {
      id: 'startDate',
      label: 'Start Date',
      type: 'datetime',
    },
    {
      id: 'endDate',
      label: 'End Date',
      type: 'datetime',
    },
  ];

  const handleDeleteGame = async () => {
    await axios.delete(`/api/seasons/${season.id}`);
    push(`/admin/games/${season.game.id}`);
  };

  return (
    <Stack spacing={8}>
      <SEO title={season.name} />
      <FloatingActionButton
        buttons={[
          {
            label: 'view',
            icon: <IoEyeOutline />,
            colorScheme: 'success',
            href: `/${season.game.office.slug}/${season.game.slug}/${season.slug}`,
          },
        ]}
      />
      <Breadcrumbs
        px={2}
        levels={[
          { label: 'Admin', href: '/admin' },
          { label: 'Offices', href: '/admin/offices' },
          { label: season.game.office.name, href: `/admin/offices/${season.game.office.id}` },
          { label: season.game.name, href: `/admin/games/${season.game.id}` },
          { label: season.name, href: `/admin/seasons/${season.id}` },
        ]}
      />
      <SettingsGroup<Season>
        fieldSchema={patchGameSchema}
        fields={editableFields}
        saveEndpoint={`/api/seasons/${season.id}`}
        data={season}
      />

      <Settings.List>
        <Settings.Item label="Danger zone">
          <ConfirmButton keyword={season.name} onConfirm={handleDeleteGame}>
            Delete Season
          </ConfirmButton>
        </Settings.Item>
      </Settings.List>
    </Stack>
  );
};

AdminPage.Layout = Admin;

export default AdminPage;

const querySchema = object({
  id: string().required(),
});

export const getServerSideProps = withDashboardAuth(async ({ params }) => {
  try {
    const { id } = await querySchema.validate(params, { abortEarly: false, stripUnknown: true });

    const season = await getSeason(id);
    if (!season) return { notFound: true };

    return {
      props: {
        season,
      },
    };
  } catch (e) {
    console.error(e);
    return { notFound: true };
  }
});