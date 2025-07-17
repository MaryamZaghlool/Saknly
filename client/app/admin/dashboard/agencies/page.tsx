"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  CircularProgress,
  TextField,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Paper,
  TableContainer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Delete,
  Business,
  Star,
  StarBorder,
  Edit,
  Close,
  Check
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { Agency } from '../../../../shared/types/index'; // Assuming you have types defined

const PAGE_SIZE = 10;

const AgencyTable = ({
  agencies,
  columns,
  onRowClick,
  onDelete,
  onToggleFeatured,
  isLoading
}: {
  agencies: Agency[];
  columns: any[];
  onRowClick: (agency: Agency) => void;
  onDelete: (agency: Agency) => void;
  onToggleFeatured: (agency: Agency) => Promise<void>;
  isLoading: boolean;
}) => {
  const theme = useTheme();

  return (
    <Paper elevation={3} sx={{ borderRadius: { xs: 2, md: 3 }, overflow: 'hidden', mb: 3 }}>
      <TableContainer sx={{ minWidth: { xs: 600, sm: 'auto' } }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.key} 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                    display: ['logo', 'description', 'isFeatured', 'createdAt'].includes(column.key) ? { xs: 'none', sm: 'table-cell' } : undefined
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 1.5 }
                }}
              >
                إجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : agencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  لا توجد وكالات
                </TableCell>
              </TableRow>
            ) : (
              agencies.map((agency) => (
                <TableRow
                  key={agency._id}
                  hover
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                  onClick={() => onRowClick(agency)}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        display: ['logo', 'description', 'isFeatured', 'createdAt'].includes(column.key) ? { xs: 'none', sm: 'table-cell' } : undefined
                      }}
                    >
                      {column.render ? column.render(agency) : agency[column.key as keyof Agency]}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 1.5 }
                    }}
                  >
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeatured(agency);
                        }}
                        color={agency.isFeatured ? 'warning' : 'default'}
                        size="small"
                      >
                        {agency.isFeatured ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(agency);
                        }}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const AgenciesPage = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAgencies = async (searchValue = '', pageValue = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchValue,
        page: String(pageValue),
        limit: String(PAGE_SIZE),
      });
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agencies/featured?${params.toString()}`
      );
      
      if (!res.ok) throw new Error('فشل في جلب الوكالات');
      
      const data = await res.json();
      setAgencies(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies(debouncedSearch, page);
  }, [debouncedSearch, page]);

  const handleToggleFeatured = async (agency: Agency) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agencies/${agency._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `${process.env.TOKEN_PREFIX}${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isFeatured: !agency.isFeatured }),
        }
      );

      if (!res.ok) throw new Error('فشل في تحديث حالة الوكالة');

      setAgencies((prev) =>
        prev.map((a) =>
          a._id === agency._id
            ? { ...a, isFeatured: !a.isFeatured }
            : a
        )
      );
    } catch (err) {
      console.error('Error toggling featured status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!selectedAgency) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agencies/${selectedAgency._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Saknly__${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('فشل حذف الوكالة');

      setAgencies((prev) =>
        prev.filter((a) => a._id !== selectedAgency._id)
      );
      setSelectedAgency(null);
      setDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting agency:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'logo',
      label: 'الشعار',
      render: (agency: Agency) => (
        <Avatar 
          src={agency.logo} 
          alt={agency.name}
          sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
        >
          {agency.name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      key: 'name',
      label: 'اسم الوكالة',
      render: (agency: Agency) => (
        <Typography 
          fontWeight={700}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {agency.name}
        </Typography>
      ),
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (agency: Agency) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
            maxWidth: { xs: 120, sm: 200 }
          }}
        >
          {agency.description || '-'}
        </Typography>
      ),
    },
    {
      key: 'isFeatured',
      label: 'الحالة',
      render: (agency: Agency) => (
        <Chip
          label={agency.isFeatured ? 'مميزة' : 'عادية'}
          color={agency.isFeatured ? 'warning' : 'default'}
          size="small"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (agency: Agency) => (
        <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
          {agency.createdAt
            ? new Date(agency.createdAt).toLocaleDateString()
            : '-'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      p: { xs: 1, sm: 2, md: 4 }
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }, mb: { xs: 0.5, md: 2 } }}
        >
          إدارة الوكالات
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
        >
          عرض وإدارة جميع الوكالات المسجلة
        </Typography>
      </Box>
      <Box sx={{ width: '100%', overflowX: { xs: 'auto', md: 'visible' } }}>
        {/* Search and Filters */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 2, md: 3 },
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            label="بحث باسم الوكالة"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              width: { xs: '100%', sm: 300 },
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
            size="small"
          />
        </Box>

        {/* Error Handling */}
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
            <Typography 
              color="error" 
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Mobile Cards */}
        {isMobile ? (
          <Box>
            {agencies.map((agency) => (
              <Paper key={agency._id} sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight={700}>{agency.name}</Typography>
                <Box>
                  <IconButton onClick={() => handleToggleFeatured(agency)} color={agency.isFeatured ? 'warning' : 'default'}>
                    {agency.isFeatured ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                  </IconButton>
                  <IconButton onClick={() => { setSelectedAgency(agency); setDeleteDialog(true); }} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <AgencyTable
            agencies={agencies}
            columns={columns}
            onRowClick={setSelectedAgency}
            onDelete={(agency) => {
              setSelectedAgency(agency);
              setDeleteDialog(true);
            }}
            onToggleFeatured={handleToggleFeatured}
            isLoading={loading}
          />
        )}

        {/* Pagination */}
        {agencies.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              disabled={loading}
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Agency Details Dialog */}
      <Dialog
        open={!!selectedAgency}
        onClose={() => setSelectedAgency(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: '90vh', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              تفاصيل الوكالة
            </Typography>
            <IconButton onClick={() => setSelectedAgency(null)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {selectedAgency && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                pt: 2,
              }}
            >
              <Avatar
                src={selectedAgency.logo}
                sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, fontSize: { xs: 24, sm: 32 } }}
              >
                {selectedAgency.name?.charAt(0)}
              </Avatar>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {selectedAgency.name}
              </Typography>
              <Chip
                label={selectedAgency.isFeatured ? 'مميزة' : 'عادية'}
                color={selectedAgency.isFeatured ? 'warning' : 'default'}
                sx={{ mb: 1 }}
                size="small"
              />
              <Typography
                variant="body1"
                textAlign="center"
                sx={{ 
                  maxWidth: 400,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {selectedAgency.description || 'لا يوجد وصف'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 2, sm: 4 },
                  mt: 2,
                  width: '100%',
                  justifyContent: 'space-around',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    تاريخ الإنشاء
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {selectedAgency.createdAt
                      ? new Date(selectedAgency.createdAt).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    آخر تحديث
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {selectedAgency.updatedAt
                      ? new Date(selectedAgency.updatedAt).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Button
            onClick={() => setSelectedAgency(null)}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            إغلاق
          </Button>
          <Button
            onClick={() => {
              setDeleteDialog(true);
            }}
            color="error"
            variant="contained"
            startIcon={<Delete />}
            size="small"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            حذف الوكالة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => !actionLoading && setDeleteDialog(false)}
        PaperProps={{
          sx: { m: { xs: 1, sm: 2 } }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            هل أنت متأكد أنك تريد حذف الوكالة "{selectedAgency?.name}"؟ لا يمكن
            التراجع عن هذا الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            color="primary"
            disabled={actionLoading}
            size="small"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDeleteAgency}
            color="error"
            variant="contained"
            startIcon={<Check />}
            disabled={actionLoading}
            size="small"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            {actionLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgenciesPage;