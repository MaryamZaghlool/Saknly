'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar, CircularProgress, Stack } from '@mui/material';

const AgencyProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', logo: null as File | null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/agencies/me');
        if (!res.ok) throw new Error('Failed to fetch agency profile');
        const data = await res.json();
        setProfile(data.data);
        setForm({ name: data.data.name, description: data.data.description || '', logo: null });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, logo: e.target.files[0] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (form.logo) formData.append('logo', form.logo);
      const res = await fetch('/api/agencies/me', {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update agency profile');
      const data = await res.json();
      setProfile(data.data);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Box p={4} color="error.main">{error}</Box>;
  if (!profile) return null;

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={3}>ملف الوكالة</Typography>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center" mb={3}>
            <Avatar src={profile.logo?.url} alt={profile.name} sx={{ width: 80, height: 80 }} />
            <Box>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography color="text.secondary">{profile.description}</Typography>
            </Box>
          </Stack>
          {editMode ? (
            <Box component="form" noValidate autoComplete="off">
              <TextField
                label="اسم الوكالة"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="وصف الوكالة"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <Button variant="contained" component="label" sx={{ mt: 2 }}>
                تحميل شعار جديد
                <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
              </Button>
              {form.logo && <Typography variant="body2" mt={1}>{form.logo.name}</Typography>}
              <Stack direction="row" spacing={2} mt={3}>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
                  حفظ
                </Button>
                <Button variant="outlined" onClick={() => setEditMode(false)} disabled={saving}>
                  إلغاء
                </Button>
              </Stack>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => setEditMode(true)}>
              تعديل البيانات
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgencyProfilePage; 