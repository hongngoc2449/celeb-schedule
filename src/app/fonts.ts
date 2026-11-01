import localFont from "next/font/local";

export const cocogoose = localFont({
  src: [
    {
      path: "../../public/fonts/Cocogoose-Pro-Light-trial.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cocogoose-Pro-Semilight-trial.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cocogoose-Pro-Regular-trial.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cocogoose-Pro-Bold-trial.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-cocogoose",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
});

export const cocogooseLight = localFont({
  src: [
    {
      path: "../../public/fonts/Cocogoose-Pro-Light-trial.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Cocogoose-Pro-Semilight-trial.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-cocogoose-light",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});
