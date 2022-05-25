import { useColorMode } from '@chakra-ui/react';
import { Global } from '@emotion/react';

const ColorMode: React.VFC = () => {
  const { colorMode } = useColorMode();

  return (
    <Global
      styles={`
        :root {
          color-scheme: ${colorMode}
        }
        `}
    />
  );
};

export default ColorMode;