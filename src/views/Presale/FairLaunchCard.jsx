import { Paper, Button, Box, Grid, FormControl, OutlinedInput, InputAdornment, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import CardHeader from "../../components/CardHeader/CardHeader";

export function FairLaunchCard({ cstPurchaseBalance, pendingPayoutPresale, vestingPeriodPresale, claimButton }) {
  return (
    <Paper className="ohm-card">
      <Box display="flex">
        <CardHeader title="Presale" />
      </Box>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4} md={4} lg={4} />
            <Grid item xs={12} sm={4} md={4} lg={4}>
              <Typography variant="h5">
                <Skeleton type="text" />
              </Typography>
              <Typography variant="h6" color="textSecondary" align="center">
                Claimable Rewards
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} md={4} lg={4} />
          </Grid>
        </Grid>
        <Grid item>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4} md={4} lg={4} />
            <Grid item xs={12} sm={4} md={4} lg={4}>
              {address ? modalButton[1] : modalButton[0]}
            </Grid>
            <Grid item xs={12} sm={4} md={4} lg={4} />
          </Grid>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4} md={4} lg={4} />
            <Grid item xs={12} sm={4} md={4} lg={4}>
              {address ? modalButton[2] : modalButton[0]}
            </Grid>
            <Grid item xs={12} sm={4} md={4} lg={4} />
          </Grid>
        </Grid>
        <Grid item>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={10} md={10} lg={10} >
              <Typography variant="h7">Pending Rewards</Typography>
            </Grid>
            <Grid item xs={12} sm={2} md={2} lg={2} >
              <Typography variant="h7" align="right">
                {pendingPayoutPresale ? pendingPayoutPresale : <Skeleton type="text" />}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={10} md={10} lg={10} >
              <Typography variant="h7">Claimable Rewards</Typography>
            </Grid>
            <Grid item xs={12} sm={2} md={2} lg={2} >
              <Typography variant="h7" align="right">
                {cstPurchaseBalance ? cstPurchaseBalance : <Skeleton type="text" />}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={8} md={8} lg={8} >
              <Typography variant="h7">Time until fully vested</Typography>
            </Grid>
            <Grid item xs={12} sm={4} md={4} lg={4} >
              <Typography variant="h7" align="right">
                {vestingPeriodPresale ? new Date(vestingPeriodPresale).toLocaleDateString() : <Skeleton type="text" />}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}