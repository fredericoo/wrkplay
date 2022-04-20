import SettingsGroup from '@/components/admin/SettingsGroup';
import DeleteButton from '@/components/DeleteButton';
import FlagsSwitch from '@/components/FlagsSwitch';
import SEO from '@/components/SEO';
import Settings from '@/components/Settings';
import { GAME_FLAGS, WEBSITE_URL } from '@/constants';
import Admin from '@/layouts/Admin';
import { PageWithLayout } from '@/layouts/types';
import { EditableField, withDashboardAuth } from '@/lib/admin';
import { GamePATCHAPIResponse, ValidGamePatchResponse } from '@/lib/api/handlers/game/patchGameHandler';
import { patchGameSchema } from '@/lib/api/schemas';
import useNavigationState from '@/lib/navigationHistory/useNavigationState';
import prisma from '@/lib/prisma';
import { toSlug, validateSlug } from '@/lib/slug';
import { Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { Game } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';

type AdminPageProps = {
  game: Awaited<ReturnType<typeof getGame>>;
  offices: Awaited<ReturnType<typeof getOffices>>;
};

export const getGame = (id: string) =>
  prisma.game.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      icon: true,
      slug: true,
      flags: true,
      maxPlayersPerTeam: true,
      officeid: true,
      office: { select: { slug: true } },
    },
  });

const getOffices = () =>
  prisma.office.findMany({
    select: { id: true, name: true },
  });

const AdminPage: PageWithLayout<AdminPageProps> = ({ game, offices }) => {
  const [response, setResponse] = useState<ValidGamePatchResponse | undefined>();
  const { push } = useRouter();
  useNavigationState(response?.name || game?.name);

  const editableFields: EditableField<typeof game>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    {
      id: 'officeid',
      label: 'Office',
      type: 'select',
      options: offices.map(office => ({ label: office.name, value: office.id })),
    },
    { id: 'icon', label: 'Icon', type: 'emoji' },
    {
      id: 'slug',
      label: 'Slug',
      type: 'text',
      preText: WEBSITE_URL + `/${game?.office.slug}/`,
      validate: validateSlug,
      format: toSlug,
    },
    { id: 'maxPlayersPerTeam', type: 'number', min: 1, max: 10, label: 'Max Players Per Team' },
  ];

  const handleSaveField = async ({
    id,
    value,
  }: {
    id: EditableField<Game>['id'];
    value: string | number | boolean;
  }) => {
    try {
      const res = await axios
        .patch<GamePATCHAPIResponse>(`/api/games/${game?.id}`, { [id]: value })
        .then(res => res.data);
      if (res.status === 'ok') {
        setResponse(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOffice = async () => {
    await axios.delete(`/api/games/${game?.id}`);
    push('/admin');
  };

  return (
    <Tabs>
      <TabList>
        <Tab>Info</Tab>
      </TabList>
      <TabPanels>
        <TabPanel as={Stack} spacing={8}>
          <SEO title={response?.name || game?.name} />
          <SettingsGroup<Game>
            fieldSchema={patchGameSchema}
            fields={editableFields}
            saveEndpoint={`/api/games/${game?.id}`}
            data={game}
          />

          <FlagsSwitch
            onChange={async value => await handleSaveField({ id: 'flags', value })}
            label="Game features"
            flags={GAME_FLAGS}
            defaultValue={game?.flags ?? undefined}
          />

          <Settings.List>
            <Settings.Item label="Danger zone">
              <DeleteButton
                keyword={`I want to delete all matches for ${response?.name || game?.name || 'this game'}`}
                onDelete={handleDeleteOffice}
              >
                Delete Game
              </DeleteButton>
            </Settings.Item>
          </Settings.List>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

AdminPage.Layout = Admin;

export default AdminPage;

export const getServerSideProps = withDashboardAuth(async ({ params }) => {
  if (typeof params?.id !== 'string') {
    return { notFound: true };
  }
  return {
    props: {
      game: await getGame(params.id),
      offices: await getOffices(),
    },
  };
});