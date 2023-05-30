import { extendTheme } from "native-base";

export const THEME = extendTheme({
  colors: {
    white: "#FFFFFF",
    green: {
      600: "#0D8C3E",
      500: "#0DA63E",
    },
    gray: {
      300: "#636363",
      200: "#F5F5F5",
    },
  },
  fonts: {
    body: "Montserrat_400Regular",
    medium: "Montserrat_500Medium",
    semibold: "Montserrat_600SemiBold",
    bold: "Montserrat_700Bold",
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
