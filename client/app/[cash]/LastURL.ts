"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export function useLastURL() {
  const router = useRouter();
  const lastURL = useRef("service");

  const changeURL = (value: string) => {
    lastURL.current = value;
  };

  const goToLastURL = () => {
    router.replace(`/${lastURL.current}`);
  };

  return { changeURL, goToLastURL };
}