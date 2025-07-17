"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  Home as HomeIcon,
  Apartment as RentIcon,
  School as StudentIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Types
interface Property {
  _id: string;
  title: string;
  description?: string;
  location?: { address?: string };
  area?: number;
  price?: number;
  createdAt: string;
  category: 'sale' | 'rent' | 'student';
}

interface PropertyTypeConfig {
  key: 'sale' | 'rent' | 'student';
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const propertyTypes: PropertyTypeConfig[] = [
  { key: 'sale', label: "عقارات للبيع", icon: <HomeIcon />, color: 'primary' },
  { key: 'rent', label: "عقارات للإيجار", icon: <RentIcon />, color: 'success' },
  { key: 'student', label: "سكن طلابي", icon: <StudentIcon />, color: 'warning' },
];

// Components
const PropertyCard = ({ 
  property,
  onApprove,
  onDeny,
  loading
}: {
  property: Property;
  onApprove: () => void;
  onDeny: () => void;
  loading: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ 
      borderRadius: { xs: 2, md: 3 }, 
      boxShadow: 1, 
      mb: { xs: 1.5, md: 2 },
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: 3,
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar 
            sx={{ 
              bgcolor: 'grey.100', 
              color: 'text.primary',
              width: { xs: 48, md: 56 }, 
              height: { xs: 48, md: 56 },
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            {propertyTypes.find(t => t.key === property.category)?.icon}
          </Avatar>
          
          <Box flex={1} minWidth={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography 
                variant="subtitle1" 
                fontWeight={600}
                sx={{ 
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  mr: 1
                }}
              >
                {property.title}
              </Typography>
              <Tooltip title="معلومات إضافية">
                <IconButton 
                  size="small" 
                  onClick={() => setExpanded(!expanded)}
                  sx={{ flexShrink: 0 }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 0.5,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {property.location?.address || 'لا يوجد عنوان'}
            </Typography>

            {expanded && (
              <>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                >
                  {property.description || 'لا يوجد وصف'}
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 0.5, sm: 2 }} 
                  sx={{ mt: 1 }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    المساحة: <strong>{property.area || '--'} م²</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    السعر: <strong>{property.price ? `${property.price} ج.م` : '--'}</strong>
                  </Typography>
                </Stack>
                <Typography 
                  variant="caption" 
                  display="block" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.625rem', md: '0.75rem' }
                  }}
                >
                  تاريخ الإضافة: {format(new Date(property.createdAt), 'dd/MM/yyyy', { locale: ar })}
                </Typography>
              </>
            )}

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1} 
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<ApproveIcon />}
                onClick={onApprove}
                disabled={loading}
                sx={{ 
                  borderRadius: 2,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}
              >
                موافقة
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DenyIcon />}
                onClick={onDeny}
                disabled={loading}
                sx={{ 
                  borderRadius: 2,
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}
              >
                رفض
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const PropertyTypeSection = ({
  typeConfig,
  properties,
  onApprove,
  onDeny,
  isLoading
}: {
  typeConfig: PropertyTypeConfig;
  properties: Property[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  isLoading: boolean;
}) => (
  <Card sx={{ 
    borderRadius: { xs: 2, md: 3 }, 
    boxShadow: 3, 
    height: '100%',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: 6
    }
  }}>
    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Avatar sx={{ 
          bgcolor: `${typeConfig.color}.light`, 
          color: `${typeConfig.color}.dark`,
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          fontSize: { xs: '1rem', md: '1.25rem' }
        }}>
          {typeConfig.icon}
        </Avatar>
        <Typography 
          variant="h6" 
          fontWeight={700}
          sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
        >
          {typeConfig.label}
        </Typography>
        <Chip 
          label={properties.length} 
          color={typeConfig.color}
          sx={{ fontSize: { xs: '0.625rem', md: '0.75rem' } }}
        />
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : properties.length === 0 ? (
        <Typography 
          color="text.secondary" 
          align="center" 
          py={2}
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
        >
          لا توجد عقارات معلقة
        </Typography>
      ) : (
        <Stack spacing={{ xs: 1.5, md: 2 }}>
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onApprove={() => onApprove(property._id)}
              onDeny={() => onDeny(property._id)}
              loading={isLoading}
            />
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

const PropertiesAdminPage = () => {
  const queryClient = useQueryClient();
  const [denyDialog, setDenyDialog] = useState<{ open: boolean; id: string | null }>({ 
    open: false, 
    id: null 
  });
  const [denyReason, setDenyReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Fetch pending properties
  const { data: pendingProperties, isLoading } = useQuery({
    queryKey: ['pending-properties'],
    queryFn: async () => {
      const token = localStorage.getItem('token') || '';
      const responses = await Promise.all(
        propertyTypes.map(type => 
          fetch(`${API_URL}/properties/pending?category=${type.key}`, {
            headers: { Authorization: `${process.env.TOKEN_PREFIX}${token}` },
          }).then(res => res.json())
        )
      );
      
      return propertyTypes.reduce((acc, type, index) => {
        acc[type.key] = responses[index].data || [];
        return acc;
      }, {} as Record<'sale' | 'rent' | 'student', Property[]>);
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/properties/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Saknly__${token}` 
        },
        body: JSON.stringify({ 
          status: 'available', 
          isActive: true, 
          isApproved: true 
        })
      });
      if (!res.ok) throw new Error('Failed to approve property');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-properties'] });
      setSnackbar({ 
        open: true, 
        message: 'تمت الموافقة على العقار بنجاح', 
        severity: 'success' 
      });
    },
    onError: () => {
      setSnackbar({ 
        open: true, 
        message: 'فشل الموافقة على العقار', 
        severity: 'error' 
      });
    }
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/properties/${id}/deny?reason=${encodeURIComponent(reason)}`, {
        method: 'DELETE',
        headers: { Authorization: `Saknly__${token}` },
      });
      if (!res.ok) throw new Error('Failed to deny property');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-properties'] });
      setSnackbar({ 
        open: true, 
        message: 'تم رفض العقار بنجاح', 
        severity: 'success' 
      });
      setDenyDialog({ open: false, id: null });
      setDenyReason('');
    },
    onError: () => {
      setSnackbar({ 
        open: true, 
        message: 'فشل رفض العقار', 
        severity: 'error' 
      });
    }
  });

  const handleOpenDenyDialog = (id: string) => {
    setDenyDialog({ open: true, id });
  };

  const handleCloseDenyDialog = () => {
    if (!denyMutation.isPending) {
      setDenyDialog({ open: false, id: null });
      setDenyReason('');
    }
  };

  const handleDeny = () => {
    if (denyDialog.id && denyReason.trim()) {
      denyMutation.mutate({ id: denyDialog.id, reason: denyReason });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      p: { xs: 1, sm: 2, md: 4 } 
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            mb: { xs: 1, md: 2 }
          }}
        >
          إدارة العقارات المعلقة
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          مراجعة واعتماد العقارات الجديدة
        </Typography>
      </Box>

      {/* Property Sections */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' }, 
        gap: { xs: 2, md: 3 } 
      }}>
        {propertyTypes.map((type) => (
          <Box key={type.key} sx={{ flex: 1, minWidth: 0 }}>
            <PropertyTypeSection
              typeConfig={type}
              properties={pendingProperties?.[type.key] || []}
              onApprove={approveMutation.mutate}
              onDeny={handleOpenDenyDialog}
              isLoading={isLoading}
            />
          </Box>
        ))}
      </Box>

      {/* Deny Dialog */}
      <Dialog
        open={denyDialog.open}
        onClose={handleCloseDenyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span>سبب رفض العقار</span>
            <IconButton 
              onClick={handleCloseDenyDialog}
              disabled={denyMutation.isPending}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="السبب (مطلوب)"
            fullWidth
            variant="outlined"
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            multiline
            rows={4}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDenyDialog}
            disabled={denyMutation.isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDeny}
            color="error"
            variant="contained"
            disabled={denyMutation.isPending || !denyReason.trim()}
            startIcon={<DenyIcon />}
          >
            {denyMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PropertiesAdminPage;