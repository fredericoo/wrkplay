import PlayerScores from '@/components/admin/PlayerScores/PlayerScores';
import SettingsGroup from '@/components/admin/SettingsGroup';
import DeleteButton from '@/components/DeleteButton';
import Settings from '@/components/Settings';
import { SESSION_MAX_AGE } from '@/constants';
import Admin from '@/layouts/Admin';
import { PageWithLayout } from '@/layouts/types';
import { EditableField, withDashboardAuth } from '@/lib/admin';
import { SessionDELETEAPIResponse } from '@/lib/api/handlers/session/deleteSessionHandler';
import { patchUserSchema } from '@/lib/api/schemas';
import useNavigationState from '@/lib/navigationHistory/useNavigationState';
import prisma from '@/lib/prisma';
import { Badge, Button, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip } from '@chakra-ui/react';
import { Session, User } from '@prisma/client';
import axios from 'axios';
import { formatRelative, subSeconds } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';

type AdminPageProps = {
  user: Awaited<ReturnType<typeof getUser>>;
  roles: Awaited<ReturnType<typeof getRoles>>;
  games: Awaited<ReturnType<typeof getGames>>;
};

const getUser = (id: string) =>
  prisma.user
    .findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        sessions: { select: { id: true, expires: true } },
        scores: { select: { id: true, points: true, gameid: true, game: { select: { name: true, icon: true } } } },
      },
    })
    .then(user => ({
      ...user,
      sessions: user?.sessions.map(session => ({ ...session, expires: session.expires.toISOString() })),
    }));

const getRoles = () => prisma.role.findMany({ select: { name: true, id: true } });
const getGames = () => prisma.game.findMany({ select: { name: true, id: true } });

const AdminPage: PageWithLayout<AdminPageProps> = ({ user, roles, games }) => {
  const { data: userSession } = useSession();
  const [deletedSessions, setDeletedSessions] = useState<Session['id'][]>([]);

  const { push } = useRouter();
  useNavigationState(user?.name || 'User');

  if (!user) return null;

  const editableFields: EditableField<User>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    {
      id: 'roleId',
      label: 'Role',
      readOnly: userSession?.user.id === user.id,
      type: 'select',
      options: roles.map(role => ({ label: role.name, value: role.id })),
    },
  ];

  const handleDeleteUser = async () => {
    await axios.delete(`/api/users/${user?.id}`);
    push('/admin');
  };

  const handleDeleteSession = async (sessionId: string) => {
    const deleteSession = await axios
      .delete<SessionDELETEAPIResponse>(`/api/sessions/${sessionId}`)
      .then(res => res.data);
    if (deleteSession.status === 'ok') {
      const deletedSessionId = deleteSession.data?.id;
      if (deletedSessionId) {
        setDeletedSessions(sessions => [...sessions, deletedSessionId]);
      }
    }
  };

  return (
    <Tabs>
      <TabList>
        <Tab>Info</Tab>
        <Tab>Sessions</Tab>
        <Tab>Scores</Tab>
      </TabList>
      <TabPanels pt={4}>
        <TabPanel as={Stack} spacing={8}>
          <SettingsGroup<User>
            fieldSchema={patchUserSchema}
            fields={editableFields}
            data={user}
            saveEndpoint={`/api/users/${user?.id}`}
          />

          <Settings.List>
            <Settings.Item label="Danger zone">
              <DeleteButton
                keyword={`I want to delete ${user?.name || 'this user'} with all scores and matches they played`}
                onDelete={handleDeleteUser}
              >
                Delete User
              </DeleteButton>
            </Settings.Item>
          </Settings.List>
        </TabPanel>
        <TabPanel>
          <Settings.List>
            {user?.sessions
              ?.filter(session => !deletedSessions.includes(session.id))
              .map(session => {
                const isThisSession = user.id === userSession?.user.id && session.expires === userSession?.expires;
                return (
                  <Settings.Item
                    key={session.id}
                    label={
                      <Stack spacing={0}>
                        <Text fontWeight="bold">
                          {session.id}{' '}
                          {isThisSession && (
                            <Badge colorScheme="primary" variant="solid">
                              current session
                            </Badge>
                          )}
                        </Text>
                        <Text fontSize="xs">
                          created{' '}
                          {formatRelative(subSeconds(new Date(session.expires), SESSION_MAX_AGE), new Date(), {
                            locale: enGB,
                          })}
                        </Text>
                      </Stack>
                    }
                  >
                    <Tooltip label="clear session" placement="top">
                      <Button
                        variant="solid"
                        colorScheme="danger"
                        css={{ aspectRatio: '1' }}
                        isDisabled={isThisSession}
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <IoTrashOutline />
                      </Button>
                    </Tooltip>
                  </Settings.Item>
                );
              })}
          </Settings.List>
        </TabPanel>
        <TabPanel>{user.scores && <PlayerScores games={games} scores={user.scores} />}</TabPanel>
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
      user: await getUser(params.id),
      games: await getGames(),
      roles: await getRoles(),
    },
  };
});