import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { account, userBalance, deposit, withdraw } = useBlockchain();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDeposit = async () => {
    try {
      setLoading(true);
      setError('');
      await deposit(depositAmount);
      setSuccess('Deposit successful!');
      setDepositAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      setError('');
      await withdraw(withdrawAmount);
      setSuccess('Withdrawal successful!');
      setWithdrawAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    // In a real app, you would handle wallet disconnection here
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
            Crypto Debit Card
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
              <AccountBalanceWalletIcon fontSize="small" />
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

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

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
                  <Typography variant="h6">Fiat Balance</Typography>
                </Box>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  ${userBalance.fiat}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Available for withdrawal
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
                  <Typography variant="h6">Crypto Balance</Typography>
                </Box>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {userBalance.crypto} ETH
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Available in wallet
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Transaction Forms */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SwapHorizIcon color="primary" />
                <Typography variant="h6">Deposit ETH</Typography>
              </Box>
              <TextField
                fullWidth
                label="Amount (ETH)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
              <Button
                variant="contained"
                onClick={handleDeposit}
                disabled={loading || !depositAmount}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Deposit'}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SwapHorizIcon color="secondary" />
                <Typography variant="h6">Withdraw Fiat</Typography>
              </Box>
              <TextField
                fullWidth
                label="Amount (USD)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
              <Button
                variant="contained"
                onClick={handleWithdraw}
                disabled={loading || !withdrawAmount}
                fullWidth
                sx={{ py: 1.5 }}
                color="secondary"
              >
                {loading ? <CircularProgress size={24} /> : 'Withdraw'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 