// components/AppInit.tsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "@libs/src/features/auth/auth.slice";
import type { AppDispatch } from "@libs/src/store/index";

export default function AppInit() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return null; // ❗ không render gì cả
}
