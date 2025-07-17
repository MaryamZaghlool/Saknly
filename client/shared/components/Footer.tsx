"use client";
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import Link from "next/link";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: "var(--primary-800)",
        color: "var(--neutral-300)",
        borderTop: "1px solid var(--neutral-700)",
        boxShadow: "inset 0 1px 4px 0 rgba(0,0,0,0.15)",
        pt: { xs: 6, sm: 8, md: 12 },
        pb: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
          {/* Saknly Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: "var(--text-white)",
                fontWeight: 700,
                mb: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
              }}
            >
              سكنلي
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "var(--neutral-400)",
                mb: 1,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                lineHeight: 1.6
              }}
            >
              رحلتك نحو المنزل المثالي تبدأ من هنا.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "var(--neutral-400)",
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                lineHeight: 1.6
              }}
            >
              اعثر على العقارات للإيجار والبيع بسهولة.
            </Typography>
          </Grid>

          {/* Quick Links Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "var(--text-white)",
                fontWeight: 600,
                mb: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }
              }}
            >
              روابط سريعة
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
              {[
                { href: "/properties?listingType=rent", label: "إيجار" },
                { href: "/properties?listingType=sale", label: "شراء" },
                { href: "/uploadProperty", label: "بيع" },
                { href: "/about", label: "من نحن" },
                { href: "/contact", label: "اتصل بنا" },
                { href: "/faq", label: "الأسئلة الشائعة" },
              ].map((link) => (
                <MuiLink
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: "var(--neutral-300)",
                    textDecoration: "none",
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    transition: "color 0.2s",
                    textAlign: "right",
                    display: "block",
                    "&:hover": {
                      color: "var(--primary-400)",
                    },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Follow Us Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "var(--text-white)",
                fontWeight: 600,
                mb: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }
              }}
            >
              تابعنا
            </Typography>
            <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              {[
                { icon: <FacebookIcon />, href: "#" },
                { icon: <TwitterIcon />, href: "#" },
                { icon: <InstagramIcon />, href: "#" },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  sx={{
                    color: "var(--primary-400)",
                    transition: "color 0.2s",
                    "&:hover": {
                      color: "var(--primary-300)",
                    },
                  }}
                >
                  {React.cloneElement(social.icon, {
                    sx: { fontSize: { xs: 24, sm: 28 } }
                  })}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Contact Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "var(--text-white)",
                fontWeight: 600,
                mb: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }
              }}
            >
              تواصل معنا
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "var(--neutral-400)",
                mb: 1,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                lineHeight: 1.6
              }}
            >
              ١٢٣ شارع النيل، القاهرة، مصر
            </Typography>
            <MuiLink
              href="mailto:contact@saknly.com"
              sx={{
                color: "var(--primary-300)",
                textDecoration: "none",
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                transition: "color 0.2s",
                display: "block",
                textAlign: "right",
                "&:hover": {
                  color: "var(--primary-400)",
                },
              }}
            >
              contact@saknly.com
            </MuiLink>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: "1px solid var(--neutral-700)",
            color: "var(--neutral-500)",
            mt: { xs: 6, sm: 8, md: 10 },
            pt: { xs: 3, sm: 4, md: 6 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              color: "var(--neutral-500)",
            }}
          >
            © 2025 سكنلي. جميع الحقوق محفوظة.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
