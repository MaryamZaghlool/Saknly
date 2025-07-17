"use client";

import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    Button,
    Modal,
    TextField,
    Snackbar,
    Alert,
    IconButton,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


const Testimonials = () => {
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState(false);
    const [form, setForm] = useState({ name: '', text: '', image: '' });
    const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
    const [current, setCurrent] = useState(0);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/testimonial`;

    // جلب الآراء من الباكند
    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}?status=approved&type=general`);
                const data = await res.json();
                if (data.success) {
                    setTestimonials(data.data);
                } else {
                    setError('حدث خطأ أثناء جلب الآراء');
                }
            } catch (err) {
                setError('تعذر الاتصال بالخادم');
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setForm({ name: '', text: '', image: '' });
        setErrors({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const errs: { name?: string; text?: string } = {};
        if (!form.name.trim()) errs.name = 'الاسم مطلوب';
        if (!form.text.trim()) errs.text = 'الرأي مطلوب';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    text: form.text,
                    image: form.image,
                    role: 'زائر',
                    type: 'general',
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSnackbar(true);
                handleClose();
                // لا تضف الرأي مباشرة، انتظر موافقة الأدمن
            } else {
                setError(data.message || 'حدث خطأ أثناء الإرسال');
            }
        } catch (err) {
            setError('تعذر الاتصال بالخادم');
        }
    };

    // سلايدر
    const goTo = (idx: number) => {
        if (!testimonials.length) return;
        const total = testimonials.length;
        // دائري
        if (idx < 0) setCurrent((Math.floor((total - 1) / 3)) * 3);
        else if (idx >= total) setCurrent(0);
        else setCurrent(idx);
    };

    // حساب الآراء المعروضة حاليًا
    const getVisibleTestimonials = () => {
        if (testimonials.length <= 3) return testimonials;
        return testimonials.slice(current, current + 3).length === 3
            ? testimonials.slice(current, current + 3)
            : [...testimonials.slice(current), ...testimonials.slice(0, 3 - (testimonials.length - current))];
    };

    return (
        <Box sx={{
            py: { xs: 8, sm: 10, md: 12, lg: 16 },
            px: { xs: 2, sm: 3, md: 4 },
            bgcolor: {
                xs: 'linear-gradient(135deg, #fafdff 0%, #f3f6fa 100%)',
                md: 'linear-gradient(120deg, #fafdff 0%, #f3f6fa 100%)',
            },
            borderTop: '1px solid',
            borderColor: 'grey.100',
        }}>
            <Container maxWidth="md">
                <Typography
                    variant="h2"
                    component="h2"
                    textAlign="center"
                    sx={{
                        mb: { xs: 4, sm: 5, md: 7 },
                        color: '#2563eb',
                        fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.3rem', lg: '2.5rem' },
                        fontWeight: 900,
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 12px rgba(59,130,246,0.07)',
                        fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
                        lineHeight: 1.2
                    }}
                >
                    ماذا يقول عملاؤنا
                </Typography>
                <Box textAlign="center" mb={{ xs: 4, sm: 5, md: 6 }}>
                    <Button variant="contained" color="primary" size="large" sx={{
                        fontWeight: 700,
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1.2, sm: 1.5 },
                        borderRadius: 3,
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.08rem' },
                        boxShadow: '0 2px 8px rgba(59,130,246,0.07)',
                        textTransform: 'none',
                        letterSpacing: '0.5px',
                        bgcolor: '#2563eb',
                        '&:hover': { bgcolor: '#174ea6' },
                    }} onClick={handleOpen}>
                        أضف رأيك في سكنلي
                    </Button>
                </Box>
                {/* Carousel */}
                <Box position="relative" display="flex" alignItems="center" justifyContent="center" minHeight={{ xs: 300, sm: 350, md: 370 }}>
                    {/* Left Arrow */}
                    <IconButton
                        aria-label="السابق"
                        onClick={() => goTo(current - 3)}
                        sx={{
                            position: 'absolute',
                            left: { xs: -12, sm: -18, md: -32 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.7)',
                            boxShadow: 1,
                            borderRadius: '50%',
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid',
                            borderColor: '#e3eaf6',
                            transition: 'all 0.18s',
                            backdropFilter: 'blur(2px)',
                            color: '#2563eb',
                            '&:hover': {
                                bgcolor: '#e3eaf6',
                                color: '#174ea6',
                                borderColor: '#b6c6e3',
                                boxShadow: 2,
                            },
                        }}
                        disabled={loading || !testimonials.length}
                    >
                        <ArrowBackIosNewIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </IconButton>
                    <Box width="100%" display="flex" justifyContent="center" gap={{ xs: 1.5, sm: 2, md: 4 }} flexWrap={{ xs: 'wrap', md: 'nowrap' }}>
                        {loading ? (
                            <Typography>جاري التحميل...</Typography>
                        ) : error ? (
                            <Alert severity="error">{error}</Alert>
                        ) : testimonials.length ? (
                            getVisibleTestimonials().map((t, idx) => (
                                <Box key={current + idx} sx={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', mb: { xs: 2, md: 0 } }}>
                                    {/* Glassmorphism Card */}
                                    <Card
                                        sx={{
                                            width: { xs: '100%', sm: 280, md: 300 },
                                            maxWidth: { xs: 320, sm: 340, md: 320 },
                                            mx: 'auto',
                                            p: { xs: 1.5, sm: 2, md: 2.5 },
                                            transition: 'all 0.3s cubic-bezier(.4,1.3,.6,1)',
                                            boxShadow: '0 4px 24px 0 rgba(59,130,246,0.07)',
                                            borderRadius: 6,
                                            minHeight: { xs: 200, sm: 220, md: 220 },
                                            bgcolor: 'rgba(255,255,255,0.82)',
                                            border: '1.5px solid',
                                            borderColor: '#e3eaf6',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            overflow: 'visible',
                                        }}
                                    >
                                        {/* Quote Icon */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            opacity: 0.08,
                                            fontSize: 32,
                                            zIndex: 0,
                                            color: '#2563eb',
                                            pointerEvents: 'none',
                                            display: { xs: 'none', sm: 'block' },
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 22C19.5 16.201 24.201 11.5 30 11.5V15.5C26.962 15.5 24.5 17.962 24.5 21V22C24.5 25.038 26.962 27.5 30 27.5V31.5C24.201 31.5 19.5 26.799 19.5 22ZM6.5 22C6.5 16.201 11.201 11.5 17 11.5V15.5C13.962 15.5 11.5 17.962 11.5 21V22C11.5 25.038 13.962 27.5 17 27.5V31.5C11.201 31.5 6.5 26.799 6.5 22Z" fill="currentColor"/></svg>
                                        </Box>
                                        <CardContent sx={{ p: 0, width: '100%', zIndex: 1 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 1, sm: 1.5 } }}>
                                                <Avatar
                                                    src={t.image}
                                                    alt={t.name}
                                                    sx={{
                                                        width: { xs: 48, sm: 56, md: 64 },
                                                        height: { xs: 48, sm: 56, md: 64 },
                                                        mb: { xs: 1, sm: 1.5 },
                                                        border: '3px solid',
                                                        borderColor: '#e3eaf6',
                                                        boxShadow: '0 2px 8px rgba(59,130,246,0.1)',
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#3a4668',
                                                        textAlign: 'center',
                                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {t.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#6b7a90',
                                                        textAlign: 'center',
                                                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                                        mb: { xs: 1, sm: 1.5 },
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    {t.role || 'عميل'}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#4a5568',
                                                    textAlign: 'center',
                                                    lineHeight: 1.6,
                                                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                                                    px: { xs: 0.5, sm: 1 },
                                                    fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
                                                }}
                                            >
                                                "{t.text}"
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))
                        ) : (
                            <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                                لا توجد آراء متاحة حالياً
                            </Typography>
                        )}
                    </Box>
                    {/* Right Arrow */}
                    <IconButton
                        aria-label="التالي"
                        onClick={() => goTo(current + 3)}
                        sx={{
                            position: 'absolute',
                            right: { xs: -12, sm: -18, md: -32 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.7)',
                            boxShadow: 1,
                            borderRadius: '50%',
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid',
                            borderColor: '#e3eaf6',
                            transition: 'all 0.18s',
                            backdropFilter: 'blur(2px)',
                            color: '#2563eb',
                            '&:hover': {
                                bgcolor: '#e3eaf6',
                                color: '#174ea6',
                                borderColor: '#b6c6e3',
                                boxShadow: 2,
                            },
                        }}
                        disabled={loading || !testimonials.length}
                    >
                        <ArrowForwardIosIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </IconButton>
                </Box>
            </Container>
        </Box>
    );
};

export default Testimonials;