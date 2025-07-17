'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import PropertyCard from '../../shared/components/homeCard'; // Assuming PropertyCard exists and works

// Define tab types to match backend categories
const tabTypes = ['all', 'rent', 'sale']; // 'sale' instead of 'sell' to match backend category

const FeaturedProperties = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedTab = useRef(-1); // Track the last fetched tab

  const fetchProperties = async (type: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setError('Error: API URL not defined.');
        setLoading(false);
        return;
      }

      let url: string;
      if (type === 'all') {
        // For 'الكل' tab, fetch most viewed properties
        url = `${apiUrl}/properties/featured`; // Using the /properties/featured endpoint
      } else {
        // For 'ايجار' and 'بيع', use the search endpoint with category filter
        url = `${apiUrl}/properties/search?category=${type}`; // Using /properties/search?category=...
      }

      const res = await axios.get(url);
      // Backend returns data in res.data.data, handle cases where it might be null or not an array
      setProperties(Array.isArray(res.data.data) ? res.data.data : []); 
    } catch (err) {
      console.error('فشل في تحميل العقارات:', err);
      setError('فشل في تحميل العقارات'); // Generic error message for display
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't fetched for this tab yet
    if (lastFetchedTab.current !== activeTab) {
      lastFetchedTab.current = activeTab;
      fetchProperties(tabTypes[activeTab]);
    }
  }, [activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      py: { xs: 6, sm: 8, md: 10 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          textAlign="center"
          sx={{
            mb: { xs: 4, sm: 5, md: 6 },
            color: 'text.primary',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            fontWeight: 600,
            lineHeight: 1.2
          }}
        >
          وحداتنا المميزة
        </Typography>

        <Box sx={{ 
          mb: { xs: 4, sm: 5, md: 6 }, 
          display: 'flex', 
          justifyContent: 'center',
          px: { xs: 1, sm: 2 }
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 80, sm: 100, md: 120 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
              },
            }}
          >
            <Tab label="الكل" />
            <Tab label="ايجار" />
            <Tab label="بيع" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 6, sm: 8, md: 10 } }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center" sx={{ py: { xs: 4, sm: 6 } }}>
            {error}
          </Typography>
        ) : properties.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
            لا توجد عقارات لعرضها حالياً
          </Typography>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {properties.map((property: any) => (
              <Grid 
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }} 
                key={property._id || property.id}
                sx={{ display: 'flex' }}
              >
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedProperties;
