"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FixedSizeList as List } from "react-window";
import { useDebounce } from "use-debounce";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../../../context/AuthContext";

interface User {
  _id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  isConfirmed: boolean;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

const fetchUsers = async (page = 1, limit = 20, search = "", token: string): Promise<UsersResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `${process.env.TOKEN_PREFIX}${token}`;
  }

  const res = await fetch(`/api/users?page=${page}&limit=${limit}&search=${search}`, {
    headers
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
};

const UsersPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["users", page, debouncedSearch],
    queryFn: () => fetchUsers(page, 20, debouncedSearch, token || ""),
    placeholderData: (previousData) => previousData,
    enabled: !!token, // Only run query if token exists
  });

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = data?.users[index];
    if (!user) return null;

    return (
      <Paper style={style} sx={{ 
        p: { xs: 1.5, md: 2 }, 
        mb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, md: 2 },
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-1px)'
        }
      }}>
        <Avatar sx={{ 
          bgcolor: 'primary.main',
          width: { xs: 32, md: 40 },
          height: { xs: 32, md: 40 },
          fontSize: { xs: '0.875rem', md: '1rem' }
        }}>
          {user.firstName ? user.firstName[0] : user.userName[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '0.875rem', md: '1rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.userName
            }
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user.email}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, md: 1 },
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <Chip 
            label={user.role} 
            color={user.role === 'admin' ? 'error' : 'default'}
            size="small"
            sx={{ fontSize: { xs: '0.625rem', md: '0.75rem' } }}
          />
          <Chip 
            label={user.status} 
            color={user.status === 'active' ? 'success' : 'warning'}
            size="small"
            sx={{ fontSize: { xs: '0.625rem', md: '0.75rem' } }}
          />
          {user.isConfirmed && (
            <Chip 
              label="مؤكد" 
              color="success" 
              size="small"
              sx={{ fontSize: { xs: '0.625rem', md: '0.75rem' } }}
            />
          )}
        </Box>
      </Paper>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          غير مصرح لك بالوصول لهذه الصفحة
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: "auto", 
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: { xs: 2, md: 3 }, 
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        إدارة المستخدمين
      </Typography>
      
      <TextField
        fullWidth
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث عن المستخدمين..."
        sx={{ 
          mb: { xs: 2, md: 3 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2
          }
        }}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.875rem', md: '1rem' } }}>
          حدث خطأ في تحميل البيانات
        </Typography>
      )}

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
          <CircularProgress size={32} />
          <Typography sx={{ mt: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            جاري التحميل...
          </Typography>
        </Box>
      ) : data?.users.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
          <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            لا توجد مستخدمين
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            height: { xs: 400, sm: 500, md: 600 }, 
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <List
              height={500}
              itemCount={data?.users.length || 0}
              itemSize={80}
              width="100%"
            >
              {Row}
            </List>
          </Box>

          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: "space-between", 
            alignItems: "center", 
            mt: 3,
            gap: { xs: 2, sm: 0 }
          }}>
            <Button 
              onClick={() => setPage(p => p - 1)} 
              disabled={page === 1} 
              variant="outlined"
              size="small"
            >
              السابق
            </Button>
            
            <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              صفحة {data?.pagination.currentPage} من {data?.pagination.totalPages}
            </Typography>
            
            <Button 
              onClick={() => setPage(p => p + 1)} 
              disabled={!data?.pagination.hasMore} 
              variant="contained"
              size="small"
            >
              التالي
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UsersPage; 