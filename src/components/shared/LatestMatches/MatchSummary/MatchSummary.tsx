import PlayerAvatar from '@/components/shared/PlayerAvatar';
import PlayerName from '@/components/shared/PlayerName';
import canDeleteMatch from '@/lib/canDeleteMatch';
import { getPlayerPointsToMove, getPointsToMove } from '@/lib/points';
import { formatDateTime } from '@/lib/utils';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import type { Match, Season, User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import DeleteMatchButton from './DeleteButton';
import ScoreTrend from './ScoreTrend';

type MatchSummaryProps = Pick<Match, 'createdAt' | 'rightscore' | 'leftscore' | 'id'> & {
  seasonId: Season['id'];
  left: Pick<User, 'name' | 'id' | 'image' | 'roleId'>[];
  right: Pick<User, 'name' | 'id' | 'image' | 'roleId'>[];
  gameName?: string;
  officeName?: string;
  points?: number;
  onDelete?: () => void;
};

const WinnerIcon: React.FC = () => (
  <Box fontSize="md" as="span">
    🏆
  </Box>
);

const MatchSummary: React.FC<MatchSummaryProps> = ({
  id,
  seasonId,
  createdAt,
  leftscore,
  rightscore,
  left,
  right,
  gameName,
  officeName,
  onDelete,
  points,
}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const canDelete = onDelete && canDeleteMatch({ user: session?.user, createdAt, players: [...left, ...right] });
  const pointsToMove = points
    ? getPointsToMove({ leftLength: left.length, rightLength: right.length, matchPoints: points })
    : undefined;

  return (
    <VStack
      role="group"
      opacity={isLoading ? 0.2 : 1}
      transition="opacity .2s ease-out"
      spacing="0"
      bg="grey.1"
      borderRadius={16}
      px={2}
      position="relative"
      boxShadow="0px 0px 0 1px var(--wrkplay-colors-grey-4)"
      _hover={{ boxShadow: '0px 0px 0 1px var(--wrkplay-colors-grey-6)' }}
    >
      {canDelete && (
        <DeleteMatchButton
          zIndex={2}
          id={id}
          seasonId={seasonId}
          onDeleteStart={() => setIsLoading(true)}
          onDeleteError={() => setIsLoading(false)}
          onDeleteSuccess={() => onDelete()}
        />
      )}
      {createdAt && (
        <Box
          color="grey.11"
          textAlign="center"
          bg="grey.1"
          border="1px"
          borderColor="grey.4"
          px={4}
          py={1}
          borderRadius="full"
          position="absolute"
          top="0"
          transform="translateY(-50%)"
          fontSize="xs"
          letterSpacing="wide"
          noOfLines={1}
          maxW="80%"
          fontWeight="medium"
          _groupHover={{ borderColor: 'grey.6' }}
        >
          {formatDateTime(new Date(createdAt))} {officeName && `at ${officeName}`}
        </Box>
      )}
      <HStack px={4} py={6} w="100%" justifyContent="center" gap={4}>
        <VStack flex={1} lineHeight={1.2} spacing={8}>
          {left.map(player => (
            <VStack key={player.id} spacing={1.5}>
              <PlayerAvatar user={player} isLink />
              <PlayerName
                lineHeight={1.2}
                textAlign="center"
                fontSize="sm"
                user={player}
                maxW="30ch"
                noOfLines={2}
                surnameType="initial"
                isLink
              />
              {!!pointsToMove && (
                <ScoreTrend
                  isPositive={leftscore > rightscore}
                  score={getPlayerPointsToMove({ pointsToMove, teamLength: left.length })}
                />
              )}
            </VStack>
          ))}
        </VStack>
        <Box flex={1}>
          <HStack justify="center" fontSize="xl">
            <HStack flex={1} justify="flex-end">
              {leftscore > rightscore && <WinnerIcon />}
              <Text>{leftscore}</Text>
            </HStack>
            <Text fontSize="sm" color="grey.9">
              ✕
            </Text>
            <HStack flex={1}>
              <Text>{rightscore}</Text>
              {rightscore > leftscore && <WinnerIcon />}
            </HStack>
          </HStack>
          {gameName && (
            <Text textAlign="center" textTransform="uppercase" fontSize="xs" color="grey.9" letterSpacing="wider">
              {gameName}
            </Text>
          )}
        </Box>
        <VStack flex={1} lineHeight={1.2} spacing={8}>
          {right.map(player => (
            <VStack spacing={1.5} key={player.id}>
              <PlayerAvatar user={player} isLink />
              <PlayerName
                lineHeight={1.2}
                textAlign="center"
                fontSize="sm"
                user={player}
                maxW="30ch"
                noOfLines={2}
                surnameType="initial"
                isLink
              />
              {!!pointsToMove && (
                <ScoreTrend
                  isPositive={leftscore < rightscore}
                  score={getPlayerPointsToMove({ pointsToMove, teamLength: right.length })}
                />
              )}
            </VStack>
          ))}
        </VStack>
      </HStack>
    </VStack>
  );
};

export default MatchSummary;
