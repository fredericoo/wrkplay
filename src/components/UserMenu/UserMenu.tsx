import { canViewDashboard } from '@/lib/roles';
import { Button, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { VscChevronDown } from 'react-icons/vsc';
import PlayerAvatar from '../PlayerAvatar';
import DevUserMenu from './DevUserMenu';

type UserMenuProps = {
  showUserName?: boolean;
};

const UserMenu: React.VFC<UserMenuProps> = ({ showUserName }) => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isDev = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true';

  if (!isLoading && !session) {
    return isDev ? (
      <DevUserMenu />
    ) : (
      <Link href="/api/auth/signin" passHref>
        <Button as="a" size="sm" variant="subtle" colorScheme="grey">
          Sign in
        </Button>
      </Link>
    );
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="subtle"
        textAlign="left"
        bg="transparent"
        isLoading={isLoading}
        rightIcon={showUserName ? <VscChevronDown /> : undefined}
        sx={{ aspectRatio: { base: '1', md: 'initial' } }}
      >
        <HStack>
          {session?.user && <PlayerAvatar size={showUserName ? 4 : 5} user={session?.user} />}
          {showUserName && (
            <Text isTruncated maxW="128px">
              {session?.user?.name?.split(' ')[0] || session?.user?.email}
            </Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList>
        <Link href={`/player/${session?.user.id}`} passHref>
          <MenuItem as="a">My Profile</MenuItem>
        </Link>
        {canViewDashboard(session?.user.roleId) && (
          <Link href={`/admin`} passHref>
            <MenuItem as="a">Admin Panel</MenuItem>
          </Link>
        )}
        <Link href="/api/auth/signout" passHref>
          <MenuItem as="a">Log out</MenuItem>
        </Link>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
