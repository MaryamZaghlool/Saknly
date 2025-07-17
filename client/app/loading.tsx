import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const Loading: React.FC = () => {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress color="primary" />
        </Box>
    );
};

export default Loading;
