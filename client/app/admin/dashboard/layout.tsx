"use client"
import React from "react";
import AdminSideNav from "@/shared/components/AdminSideNav";
import { Box, useTheme } from "@mui/material";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
      role="main"
    >
      <AdminSideNav aria-label="Admin navigation" />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 3, md: 5 },
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.grey[300] },
          '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.grey[100] },
        }}
        aria-label="Main content"
      >
        {children}
      </Box>
    </Box>
  );
} 