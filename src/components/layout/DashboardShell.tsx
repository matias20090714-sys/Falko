"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  initialUser?: any;
}

export function DashboardShell({ children, initialUser }: DashboardShellProps) {
  const [user, setUser] = useState<any>(initialUser || null);

  useEffect(() => {
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      <DashboardSidebar user={user} />
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
