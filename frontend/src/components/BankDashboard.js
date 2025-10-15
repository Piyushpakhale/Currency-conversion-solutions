import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  Button,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';

const BankDashboard = () => {
  const { account, bankBalance } = useBlockchain();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDisconnect = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.secondary.dark,
            }}
          >
            Bank Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.secondary.main,
                backgroundColor: theme.palette.grey[100],
                padding: '8px 16px',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <SecurityIcon fontSize="small" />
              {account.slice(0, 6)}...{account.slice(-4)}
            </Typography>
            <Tooltip title="Disconnect">
              <IconButton
                onClick={handleDisconnect}
                sx={{ color: theme.palette.secondary.main }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Balance Cards */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AccountBalanceIcon fontSize="large" />
                  <Typography variant="h6">Fiat Reserve</Typography>
                </Box>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  ${bankBalance.fiat}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total fiat currency in reserve
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AccountBalanceWalletIcon fontSize="large" />
                  <Typography variant="h6">Crypto Reserve</Typography>
                </Box>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {bankBalance.crypto} ETH
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total ETH in reserve
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* System Controls */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">System Controls</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Pause System
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ py: 1.5 }}
                    color="secondary"
                  >
                    Unpause System
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ py: 1.5 }}
                    color="primary"
                  >
                    Add Fiat Reserve
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BankDashboard; 