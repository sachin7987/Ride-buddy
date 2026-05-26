"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme as antdTheme } from "antd";
import NextTopLoader from "nextjs-toploader";
import { PwaInstall } from "@/components/pwa-install";

const antdThemeConfig = {
  token: {
    colorPrimary: "#16a97a",
    colorInfo: "#16a97a",
    colorBgBase: "#ffffff",
    colorTextBase: "#0f1f1a",
    fontFamily:
      "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    borderRadius: 10,
    controlHeight: 44,
    controlHeightLG: 48,
    fontSize: 14,
  },
  components: {
    DatePicker: {
      activeBorderColor: "#16a97a",
      hoverBorderColor: "#34c896",
      cellActiveWithRangeBg: "#d1fae9",
    },
    Select: {
      optionSelectedBg: "#d1fae9",
    },
    Button: {
      borderRadius: 10,
    },
  },
  algorithm: antdTheme.defaultAlgorithm,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Top progress bar — instant feedback on every Next.js navigation */}
      <NextTopLoader
        color="#16a97a"
        height={3}
        showSpinner={false}
        crawlSpeed={200}
        speed={250}
        easing="ease"
        shadow="0 0 10px #16a97a, 0 0 5px #16a97a"
      />
      <AntdRegistry>
        <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
      </AntdRegistry>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { borderRadius: "12px" } }}
      />
      <PwaInstall />
    </SessionProvider>
  );
}
