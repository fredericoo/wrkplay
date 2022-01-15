import { sortAlphabetically } from '@/lib/arrays';
import { ArrayElement } from '@/lib/types/utils';
import { OpponentsAPIResponse } from '@/pages/api/games/[id]/opponents';
import { Box, Button, HStack, Input, InputGroup, InputLeftAddon, Stack, Text } from '@chakra-ui/react';
import { IoSearchCircle } from 'react-icons/io5';
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion';
import { groupBy } from 'ramda';
import { useMemo, useState } from 'react';
import PlayerItem from './PlayerItem';

export type Player = ArrayElement<OpponentsAPIResponse['opponents']>;

type PlayerPickerProps = {
  players?: Player[];
  onSelect: (id: Player['id']) => void;
  selectedIds?: Player['id'][];
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
};

const groupByFirstLetter = groupBy<Player>(user => user.name?.toLowerCase()[0] || 'other');
const MotionBox = motion(Box);

const PlayerPicker: React.VFC<PlayerPickerProps> = ({
  players,
  onSelect,
  selectedIds,
  isLoading,
  isError,
  refetch,
}) => {
  const [search, setSearch] = useState<string>('');

  const playersList: [string, Player[]][] = useMemo(
    () =>
      search
        ? [['results', players?.filter(player => player.name?.match(new RegExp(search, 'i'))) || []]]
        : Object.entries(groupByFirstLetter(sortAlphabetically(players || [], player => player.name || ''))),
    [players, search]
  );

  if (isError)
    return (
      <Box p={4} textAlign="center" bg="red.100" borderRadius="xl" color="red.600">
        <Text mb={2}>Error loading players :(</Text>
        {refetch && (
          <Button isLoading={isLoading} onClick={() => refetch()}>
            Retry
          </Button>
        )}
      </Box>
    );

  return (
    <Stack>
      <HStack spacing={2} bg="gray.100" _hover={{ bg: 'gray.200' }} borderRadius="full" transition=".3s ease-out">
        <Box as="label" htmlFor="search" color="gray.400">
          <IoSearchCircle size="32" />
        </Box>
        <Input
          id="search"
          type="text"
          onChange={e => setSearch(e.target.value)}
          placeholder="Type to search players"
          isDisabled={isLoading}
          size="sm"
          variant="unstyled"
        />
      </HStack>
      <Stack spacing={4} py={1} h="256px" overflow="auto" bg="gray.100" borderRadius="xl">
        <AnimateSharedLayout>
          {playersList.map(([divider, opponents]) => {
            return (
              <Stack spacing={1} key={divider} px={1}>
                <AnimatePresence initial={false}>
                  <MotionBox
                    layout
                    key={divider}
                    layoutId={divider}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    pl={16}
                    py={1}
                    bg="gray.50"
                    color="gray.400"
                    letterSpacing="wider"
                    fontSize="sm"
                    borderRadius="12"
                  >
                    {divider.toUpperCase()}
                  </MotionBox>
                  {opponents.map(user => (
                    <PlayerItem
                      isSelected={selectedIds?.includes(user.id)}
                      player={user}
                      key={user.id}
                      onSelect={onSelect}
                    />
                  ))}
                </AnimatePresence>
              </Stack>
            );
          })}
        </AnimateSharedLayout>
      </Stack>
    </Stack>
  );
};

export default PlayerPicker;
