"use client";
import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter, usePathname } from "next/navigation";

export function AppBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const setupListener = async () => {
      const handler = await App.addListener("backButton", ({ canGoBack }) => {
        // Eğer ana sayfadaysak uygulamadan çık
        if (pathname === "/" || !canGoBack) {
          App.exitApp();
        } else {
          // Değilsek bir önceki sayfaya git
          router.back();
        }
      });
      return handler;
    };

    const backHandler = setupListener();

    return () => {
      backHandler.then((h) => h.remove());
    };
  }, [pathname, router]); // Sayfa değiştikçe dinleyiciyi tazele

  return null;
}