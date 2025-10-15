import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Login = () => {
  const { connectWallet, account, isBank, error } = useBlockchain();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // If account is already connected, redirect to appropriate dashboard
    if (account) {
      console.log("Account detected, redirecting...", { account, isBank });
      if (isBank) {
        navigate('/bank');
      } else {
        navigate('/dashboard');
      }
    }
  }, [account, isBank, navigate]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 1,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Crypto Debit Card
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              color: theme.palette.text.secondary,
            }}
          >
            Connect your wallet to access your digital banking experience
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                width: '100%',
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={!!account}
            sx={{
              width: '100%',
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {account ? (
              <>
                <CircularProgress size={24} color="inherit" />
                <span>
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </>
            ) : (
              <>
                <AccountBalanceWalletIcon />
                <span>Connect Wallet</span>
              </>
            )}
          </Button>

          {!window.ethereum && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3, 
                width: '100%',
                borderRadius: 2,
              }}
            >
              Please install MetaMask to use this application.{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Download here
              </a>
            </Alert>
          )}

          {account && (
            <Alert 
              severity="success" 
              sx={{ 
                mt: 3, 
                width: '100%',
                borderRadius: 2,
              }}
            >
              Wallet connected! Redirecting to dashboard...
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 