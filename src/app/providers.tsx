"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme as antdTheme } from "antd";

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
      <AntdRegistry>
        <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
      </AntdRegistry>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { borderRadius: "12px" } }}
      />
    </SessionProvider>
  );
}
