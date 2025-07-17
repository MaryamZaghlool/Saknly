"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Badge,
  Button,
} from "@mui/material";
import {
  RateReview as RateReviewIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  CalendarMonth as CalendarIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  text: string;
  image?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/testimonial`;

const TestimonialPage = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [actionDialog, setActionDialog] = useState({
    open: false,
    testimonial: null as Testimonial | null,
    action: "" as "approve" | "reject" | "delete",
    reason: "",
  });

  // Fetch testimonials
  const {
    data: testimonials = [],
    isLoading,
    error,
  } = useQuery<Testimonial[]>({
    queryKey: ["pending-testimonials"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}?status=pending`); // حذف type
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch testimonials");
      return data.data || [];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${process.env.TOKEN_PREFIX} ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!res.ok) throw new Error("Failed to approve testimonial");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-testimonials"] });
      showSnackbar("تم قبول الرأي بنجاح", "success");
      closeActionDialog();
    },
    onError: () => showSnackbar("فشل في قبول الرأي", "error"),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Saknly__${token}`,
        },
        body: JSON.stringify({ status: "rejected", reason }),
      });
      if (!res.ok) throw new Error("Failed to reject testimonial");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-testimonials"] });
      showSnackbar("تم رفض الرأي بنجاح", "success");
      closeActionDialog();
    },
    onError: () => showSnackbar("فشل في رفض الرأي", "error"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Saknly__${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-testimonials"] });
      showSnackbar("تم حذف الرأي بنجاح", "success");
      closeActionDialog();
    },
    onError: () => showSnackbar("فشل في حذف الرأي", "error"),
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const openActionDialog = (
    testimonial: Testimonial,
    action: "approve" | "reject" | "delete"
  ) => {
    setActionDialog({
      open: true,
      testimonial,
      action,
      reason: "",
    });
  };

  const closeActionDialog = () => {
    setActionDialog({
      open: false,
      testimonial: null,
      action: "approve",
      reason: "",
    });
  };

  const handleAction = () => {
    if (!actionDialog.testimonial) return;

    switch (actionDialog.action) {
      case "approve":
        approveMutation.mutate(actionDialog.testimonial._id);
        break;
      case "reject":
        rejectMutation.mutate({
          id: actionDialog.testimonial._id,
          reason: actionDialog.reason,
        });
        break;
      case "delete":
        deleteMutation.mutate(actionDialog.testimonial._id);
        break;
    }
  };

  const isLoadingAction =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending;

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
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, mb: { xs: 1, md: 2 } }}
        >
          إدارة الآراء
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          مراجعة وقبول أو رفض الآراء الجديدة
        </Typography>
      </Box>
      <Box sx={{ width: '100%', overflowX: { xs: 'auto', md: 'visible' } }}>
        {/* Testimonials Table */}
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: theme.shadows[3],
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.primary.light, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge
                badgeContent={testimonials.length}
                color="primary"
                overlap="circular"
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <RateReviewIcon />
                </Avatar>
              </Badge>
              <Typography variant="h6" fontWeight="bold">
                آراء في انتظار المراجعة
              </Typography>
            </Stack>
          </Box>

          <TableContainer sx={{ maxWidth: '100vw', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }}>العميل</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 }, display: { xs: 'none', sm: 'table-cell' } }}>الدور</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }}>الرأي</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 }, display: { xs: 'none', sm: 'table-cell' } }}>التاريخ</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }} align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "error.main", py: 4, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      فشل في تحميل الآراء
                    </TableCell>
                  </TableRow>
                ) : testimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", py: 4, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      لا توجد آراء في انتظار المراجعة
                    </TableCell>
                  </TableRow>
                ) : (
                  testimonials.map((testimonial) => (
                    <TableRow key={testimonial._id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }}>
                        <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                          {testimonial.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }}>{testimonial.role}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }}>
                        <Tooltip title={testimonial.text}>
                          <Typography
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 200,
                              fontSize: { xs: '0.8rem', sm: '1rem' }
                            }}
                          >
                            {testimonial.text}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 2 }, py: { xs: 0.5, sm: 1.5 } }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon
                            fontSize="small"
                            color="action"
                            sx={{ opacity: 0.7 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            {format(new Date(testimonial.createdAt), "dd/MM/yyyy", { locale: ar })}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, px: { xs: 0.2, sm: 2 }, py: { xs: 0.2, sm: 1.5 } }}>
                        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} justifyContent="center">
                          <Tooltip title="قبول">
                            <IconButton color="success" size="small" onClick={() => openActionDialog(testimonial, "approve") }>
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="رفض">
                            <IconButton color="warning" size="small" onClick={() => openActionDialog(testimonial, "reject") }>
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton color="error" size="small" onClick={() => openActionDialog(testimonial, "delete") }>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={closeActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight="bold">
              {actionDialog.action === "approve"
                ? "تأكيد قبول الرأي"
                : actionDialog.action === "reject"
                ? "تأكيد رفض الرأي"
                : "تأكيد حذف الرأي"}
            </Typography>
            <IconButton
              onClick={closeActionDialog}
              disabled={isLoadingAction}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {actionDialog.testimonial && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert
                severity={
                  actionDialog.action === "approve"
                    ? "success"
                    : actionDialog.action === "reject"
                    ? "warning"
                    : "error"
                }
                sx={{ borderRadius: 2 }}
              >
                {actionDialog.action === "approve"
                  ? "هل أنت متأكد من قبول هذا الرأي؟"
                  : actionDialog.action === "reject"
                  ? "هل أنت متأكد من رفض هذا الرأي؟"
                  : "هل أنت متأكد من حذف هذا الرأي نهائياً؟"}
              </Alert>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  {actionDialog.testimonial.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {actionDialog.testimonial.text}
                </Typography>
              </Box>

              {actionDialog.action === "reject" && (
                <TextField
                  label="سبب الرفض"
                  multiline
                  rows={3}
                  fullWidth
                  value={actionDialog.reason}
                  onChange={(e) =>
                    setActionDialog({
                      ...actionDialog,
                      reason: e.target.value,
                    })
                  }
                  sx={{ mt: 2 }}
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={closeActionDialog}
            disabled={isLoadingAction}
            variant="outlined"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleAction}
            disabled={
              isLoadingAction ||
              (actionDialog.action === "reject" && !actionDialog.reason.trim())
            }
            color={
              actionDialog.action === "approve"
                ? "success"
                : actionDialog.action === "reject"
                ? "warning"
                : "error"
            }
            variant="contained"
          >
            {isLoadingAction
              ? "جاري المعالجة..."
              : actionDialog.action === "approve"
              ? "تأكيد القبول"
              : actionDialog.action === "reject"
              ? "تأكيد الرفض"
              : "تأكيد الحذف"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestimonialPage;