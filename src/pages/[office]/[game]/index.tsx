import LatestMatches from '@/components/LatestMatches/LatestMatches';
import Leaderboard from '@/components/Leaderboard';
import NewMatchButton from '@/components/NewMatchButton';
import { PageHeader } from '@/components/PageHeader/types';
import { Sidebar } from '@/components/Sidebar/types';
import prisma from '@/lib/prisma';
import { Box, Grid, Heading } from '@chakra-ui/react';
import { Game } from '@prisma/client';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';

export const getOfficeWithGames = async (officeSlug: string) =>
  await prisma.office.findUnique({
    where: { slug: officeSlug },
    select: {
      name: true,
      slug: true,
      games: {
        select: {
          name: true,
          slug: true,
          icon: true,
          id: true,
        },
      },
    },
  });

type GamePageProps = {
  game?: Pick<Game, 'name' | 'slug' | 'id' | 'icon'>;
};

const GamePage: NextPage<GamePageProps> = ({ game }) => {
  if (!game) {
    return <div>404</div>;
  }

  return (
    <Grid w="100%" gap={8} templateColumns={{ base: '1fr', xl: '2fr 1fr' }}>
      <Box as="section">
        <Heading as="h2" size="sm" pb={4}>
          Leaderboard
        </Heading>
        <Leaderboard gameId={game.id} />
      </Box>
      <Box as="section">
        <Heading as="h2" size="sm" pb={4}>
          Latest matches
        </Heading>
        <Box pb={6}>
          <NewMatchButton gameId={game.id} />
        </Box>
        <LatestMatches gameId={game.id} />
      </Box>
    </Grid>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const offices = await prisma.office.findMany({
    include: { games: true },
  });
  return {
    paths: offices
      .map(office => office.games.map(game => ({ params: { office: office.slug, game: game.slug } })))
      .flat(),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (typeof params?.office !== 'string' || typeof params?.game !== 'string') {
    return {
      props: {},
    };
  }

  const office = await getOfficeWithGames(params.office);

  if (!office) {
    return {
      props: {},
    };
  }

  const game = office.games.find(game => game.slug === params.game);

  const sidebar: Sidebar = {
    items: office.games.map(game => ({
      title: game.name,
      href: `/${office.slug}/${game.slug}`,
      icon: game.icon || null,
    })),
  };

  const header: PageHeader = {
    title: game?.name || null,
    subtitle: `at the ${office.name} office`,
    icon: game?.icon || null,
  };

  return {
    props: {
      game,
      sidebar,
      header,
    },
    revalidate: 60 * 60 * 24,
  };
};

export default GamePage;
