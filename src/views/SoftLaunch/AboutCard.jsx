import { Paper, CardHeader, Tabs, Box, Typography, FormControl, OutlinedInput, InputAdornment } from "@material-ui/core";
export function AboutCard() {
  return (
    <Paper className="ohm-card">
      <Box display="flex">
        <CardHeader title="About Soft Launch Event (SLE)" />
      </Box>
      <Typography variant="h6">
        ● For whitelisters only
      </Typography>
      <Typography variant="h6">
        ● Time: from 15th April 2022 08:00:00 UTC to 17th April 2022 23:59:00 UTC
      </Typography>
      <Typography variant="h6">
        ● Token: CST
      </Typography>
      <Typography variant="h6">
        ● Soft launch price: 1 CST = 3.75 BUSD
      </Typography>
      <Typography variant="h6">
        ● Each whitelisted address can buy 400 BUSD
      </Typography>
      <Typography variant="h6">
        ● Vesting period: within 14 days after Soft Launch
      </Typography>
    </Paper>
  );
}