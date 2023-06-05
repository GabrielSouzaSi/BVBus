import { extendTheme } from "native-base";

export const THEME = extendTheme({
  fontConfig: {
    Montserrat: {
      100: {
        normal: "Montserrat_400Regular",
      },
      200: {
        normal: "Montserrat_500Medium",
      },
      300: {
        normal: "Montserrat_600SemiBold",
      },
      400: {
        normal: "Montserrat_700Bold",
      },
    },
  },
  colors: {
    white: "#FFFFFF",
    green: {
      600: "#0D8C3E",
      500: "#0DA63E",
      100: "#90D8A7"
    },
    gray: {
      300: "#636363",
      200: "#707070",
      100: "#F5F5F5",
      50: "#DCDCDC"
    },
  },
  fonts: {
    body: "Montserrat",
    medium: "Montserrat",
    semibold: "Montserrat",
    bold: "Montserrat",
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 30,
  },
  sizes: {
    14: 56,
    33: 148,
  },
});
