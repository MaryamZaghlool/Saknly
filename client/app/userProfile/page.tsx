"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableContainer,
  useMediaQuery,
  Theme,
} from "@mui/material";
import {
  Email,
  Bookmark,
  CheckCircle,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const authContext = useContext(AuthContext);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  
  if (!authContext) {
    return <Typography>Loading...</Typography>;
  }

  const { user, logout } = authContext;
  const { wishlist, removeFromWishlist, removeAllFromWishlist } = useWishlist();
  const router = useRouter();

  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchUserProperties = async () => {
      setLoadingProperties(true);
      try {
        const token = localStorage.getItem("token");
        const tokenPrefix = process.env.NEXT_PUBLIC_TOKEN_PREFIX || 'Bearer';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/allProperties`, {
          headers: {
            Authorization: `${tokenPrefix} ${token}`,
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUserProperties(data.data);
        }
      } catch (err) {
        setUserProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchUserProperties();
  }, []);

  // Calculate stats
  const savedCount = wishlist.length;
  const pendingCount = userProperties.filter(p => !p.isApproved).length;
  const acceptedCount = userProperties.filter(p => p.isApproved).length;

  const performanceStats = [
    { title: "Saved Properties", value: savedCount, icon: <Bookmark color="primary" /> },
    { title: "Inquiries Sent", value: pendingCount, icon: <Email color="primary" /> },
    { title: "Accepted Properties", value: acceptedCount, icon: <CheckCircle color="success" /> },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userProperties.length) : 0;

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        my: "10px",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f0f2f5",
        fontFamily: "Cairo, sans-serif",
        direction: "rtl",
        py: 4,
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, 
        gap: 2 
      }}>
        {/* Profile Section */}
        <Box sx={{ 
          flex: 1, 
          width: "100%", 
          maxWidth: { md: "33%" } 
        }}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 3,
            height: "100%"
          }}>
            <CardContent sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              p: { xs: 2, sm: 3 } 
            }}>
              <Avatar
                src={user?.avatar?.url}
                alt={user?.firstName}
                sx={{ 
                  width: { xs: 80, sm: 120 }, 
                  height: { xs: 80, sm: 120 }, 
                  mb: 2, 
                  bgcolor: "primary.main", 
                  fontSize: { xs: 36, sm: 48 } 
                }}
              >
                {user?.firstName?.[0]}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, textAlign: "center" }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Chip 
                label={user?.userName} 
                color="primary" 
                sx={{ mb: 2 }} 
                size={isMobile ? "small" : "medium"}
              />
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 1, textAlign: "center", fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                {user?.email}
              </Typography>
              {user?.phone && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {user.phone}
                </Typography>
              )}
              {/* Logout Button */}
              <Button
                variant="contained"
                color="error"
                sx={{ 
                  mt: 2, 
                  borderRadius: 2, 
                  width: "100%",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  py: { xs: 0.5, sm: 1 }
                }}
                onClick={handleLogout}
              >
                تسجيل الخروج
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Dashboard Section */}
        <Box sx={{ flex: 2 }}>
          {/* Performance Stats */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                أدائك
              </Typography>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: { 
                  xs: "1fr", 
                  sm: "repeat(2, 1fr)", 
                  md: "repeat(3, 1fr)" 
                }, 
                gap: 2 
              }}>
                {performanceStats.map((stat, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 2,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                      minWidth: 120,
                    }}
                  >
                    {stat.icon}
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ textAlign: "center", fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* User Properties Table */}
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                عقاراتي
              </Typography>
              {loadingProperties ? (
                <Typography>جاري التحميل...</Typography>
              ) : userProperties.length === 0 ? (
                <Typography>لا يوجد عقارات مضافة بعد.</Typography>
              ) : (
                <>
                  <TableContainer 
                    sx={{ 
                      width: "100%", 
                      overflowX: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      maxHeight: 400,
                    }}
                  >
                    <Table 
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        minWidth: isMobile ? 600 : "100%", // Ensure table has min-width on mobile
                        "& .MuiTableCell-root": {
                          textAlign: "right",
                          padding: isMobile ? "8px 4px" : "16px",
                        }
                      }}
                    >
                      <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                          <TableCell sx={{ minWidth: 150, fontWeight: "bold" }}>العنوان</TableCell>
                          <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>الحالة</TableCell>
                          <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>التاريخ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userProperties
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((property, idx) => {
                            let status = "Pending";
                            let date = property.createdAt;
                            if (property.isApproved) {
                              status = "Accepted";
                              date = property.approvedAt || property.createdAt;
                            }
                            return (
                              <TableRow 
                                key={property._id || idx}
                                sx={{ 
                                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                  '&:hover': { backgroundColor: '#f0f0f0' }
                                }}
                              >
                                <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {property.title}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={status}
                                    color={status === "Accepted" ? "success" : "warning"}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{ 
                                      minWidth: 80,
                                      fontWeight: "bold",
                                      fontSize: isMobile ? "0.7rem" : "0.8rem"
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {date ? new Date(date).toLocaleDateString() : "-"}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={3} />
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Custom Arabic Pagination */}
                  <Box 
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      mt: 2,
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 2 : 0
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        صفوف لكل صفحة:
                      </Typography>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setPage(0);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                          backgroundColor: "white"
                        }}
                      >
                        {[5, 10, 25].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Box>
                    <Typography variant="body2">
                      {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, userProperties.length)} من {userProperties.length}
                    </Typography>
                    <Box>
                      <Button
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        sx={{ 
                          minWidth: 40, 
                          mx: 0.5,
                          fontSize: isMobile ? "0.7rem" : "0.8rem"
                        }}
                      >
                        السابق
                      </Button>
                      <Button
                        disabled={(page + 1) * rowsPerPage >= userProperties.length}
                        onClick={() => setPage(page + 1)}
                        sx={{ 
                          minWidth: 40, 
                          mx: 0.5,
                          fontSize: isMobile ? "0.7rem" : "0.8rem"
                        }}
                      >
                        التالي
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}