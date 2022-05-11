import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Paper, Tab, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment } from "@material-ui/core";
import InfoTooltipMulti from "../../components/InfoTooltip/InfoTooltipMulti";

import TabPanel from "../../components/TabPanel";
import CardHeader from "../../components/CardHeader/CardHeader";
import "./softlaunch.scss";
import { addresses, POOL_GRAPH_URLS } from "../../constants";
import { useWeb3Context } from "../../hooks";
import { apolloExt } from "../../lib/apolloClient";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { calculateOdds } from "../../helpers/33Together";
import { getPoolValues, getRNGStatus } from "../../slices/PoolThunk";
import { purchaseCSTSF, changeApprovalSF, redeemSF } from "../../slices/SoftLaunch";
import { trim } from "../../helpers/index";
import { Typography, Button, Zoom } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { error, info } from "../../slices/MessagesSlice";
import { AboutCard } from "./AboutCard";
import { DepositCard } from "./DepositCard";
import { RedeemCard } from "./RedeemCard";

function a11yProps(index) {
  return {
    id: `pool-tab-${index}`,
    "aria-controls": `pool-tabpanel-${index}`,
  };
}

const MAX_DAI_AMOUNT = 100;

const SoftLaunch = () => {
  const [view, setView] = useState(0);

  const changeView = (event, newView) => {
    setView(newView);
  };

  // NOTE (appleseed): these calcs were previously in PoolInfo, however would be need in PoolPrize, too, if...
  // ... we ever were to implement other types of awards
  const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
  const dispatch = useDispatch();
  let history = useHistory();
  const [graphUrl, setGraphUrl] = useState(POOL_GRAPH_URLS[chainID]);
  const [poolData, setPoolData] = useState(null);
  const [poolDataError, setPoolDataError] = useState(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [walletChecked, setWalletChecked] = useState(false);
  const [winners, setWinners] = useState("--");
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalSponsorship, setTotalSponsorship] = useState(0);
  const [yourOdds, setYourOdds] = useState(0);
  const [yourTotalAwards, setYourTotalAwards] = useState(0);
  const [cstpBalanceSL, setCSTPBalance] = useState(125);
  const [inputBUSDAmount, setBUSDBalance] = useState(400);

  // TODO (appleseed-33T): create a table for AwardHistory
  const [yourAwardHistory, setYourAwardHistory] = useState([]);
  const [infoTooltipMessage, setInfoTooltipMessage] = useState([
    "Deposit sPID to win! Once deposited, you will receive a corresponding amount of 3,3 π and be entered to win until your sPID is withdrawn.",
  ]);
  const isAccountLoading = useSelector(state => state.account.loading ?? true);

  const daiBalance = useSelector(state => {
    return state.account.balances && state.account.balances.dai;
  });

  const busdAllowanceSL = useSelector(state => {
    return state.account.presale && state.account.presale.busdAllowanceSL;
  });

  const cstInCirculationSL = useSelector(state => {
    return state.account.balances && state.account.balances.cstInCirculationSL;
  });

  const cstpTotalSupplySL = useSelector(state => {
    return state.account.balances && state.account.balances.cstpTotalSupplySL;
  });

  const poolBalance = useSelector(state => {
    return state.account.balances && state.account.balances.pool;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const cstPurchaseBalanceSL = useSelector(state => {
    return state.account.presale && state.account.presale.cstPurchaseBalanceSL;
  });

  const isSoftLaunchFinished = useSelector(state => {
    return state.account.presale && state.account.presale.isSoftLaunchFinished;
  });

  const pendingPayoutPresaleSL = useSelector(state => {
    return state.account.presale && state.account.presale.pendingPayoutPresaleSL;
  });

  const vestingPeriodPresaleSL = useSelector(state => {
    return state.account.presale && state.account.presale.vestingPeriodPresaleSL;
  });

  const cstpPrice = 3.2;

  const setCSTPBalanceCallback = (value) => {
    if ((value * cstpPrice) > MAX_DAI_AMOUNT && (value * cstpPrice) > (MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice)) {
      setBUSDBalance(MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice);
      setCSTPBalance((MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice) / cstpPrice);
    }
    else {
      setCSTPBalance(value);
      setBUSDBalance(value * cstpPrice);
    }
  }

  const setBUSDBalanceCallback = (value) => {
    if (value > MAX_DAI_AMOUNT && value > (MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice)) {
      setBUSDBalance(MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice);
      setCSTPBalance((MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice) / cstpPrice);
    }
    else {
      setBUSDBalance(value);
      setCSTPBalance(value / cstpPrice);
    }
  }


  const setMax = () => {
    if (daiBalance > MAX_DAI_AMOUNT && daiBalance > (MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice))
      setBUSDBalanceCallback(MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice);
    else
      setBUSDBalanceCallback(daiBalance);
  };


  const hasAllowance = useCallback(
    () => {
      return busdAllowanceSL > 0;
      return 0;
    },
    [busdAllowanceSL],
  )

  const onpurchaseCSTSF = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(inputBUSDAmount) || inputBUSDAmount === 0 || inputBUSDAmount === "" || !inputBUSDAmount) {
      // eslint-disable-next-line no-alert
      return dispatch(info("Please enter a value!"));
    }

    if (inputBUSDAmount > MAX_DAI_AMOUNT) {
      setBUSDBalanceCallback(MAX_DAI_AMOUNT);
      return dispatch(info("Sorry, You can only make 1 purchase with maximum 100 BUSD"));
    }

    if (inputBUSDAmount > (MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice)) {
      setBUSDBalanceCallback(MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice);
      return dispatch(info("Sorry, You can only make purchase with maximum 100 BUSD"));
    }

    if (inputBUSDAmount > daiBalance) {
      setBUSDBalanceCallback(daiBalance);
      return dispatch(info("Sorry, your BUSD balance is not sufficient to make the purchase"));
    }

    // 1st catch if quantity > balance
    // let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    // if (gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
    //   return dispatch(error("You cannot stake more than your BUSD balance."));
    // }
    console.log("inputBUSDAmount", inputBUSDAmount);
    await dispatch(purchaseCSTSF({ amount: inputBUSDAmount, provider, address, networkID: chainID }));
    setCSTPBalanceCallback(0);
  };

  console.log('MAX_DAI_AMOUNT - cstPurchaseBalanceSL * cstpPrice', cstPurchaseBalanceSL);

  const onClaim = async action => {
    // eslint-disable-next-line no-restricted-globals
    await dispatch(redeemSF({ provider, address, networkID: chainID }));
  };


  const onSeekApproval = async token => {
    await dispatch(changeApprovalSF({ address, provider, networkID: chainID }));
  };

  // query correct pool subgraph depending on current chain
  useEffect(() => {
    setGraphUrl(POOL_GRAPH_URLS[chainID]);
  }, [chainID]);

  useEffect(() => {
    let userOdds = calculateOdds(poolBalance, totalDeposits, winners);
    setYourOdds(userOdds);
  }, [winners, totalDeposits, poolBalance]);

  useEffect(() => {
    if (hasCachedProvider()) {
      // then user DOES have a wallet
      connect().then(() => {
        setWalletChecked(true);
      });
    } else {
      // then user DOES NOT have a wallet
      setWalletChecked(true);
    }
  }, []);

  // this useEffect fires on state change from above. It will ALWAYS fire AFTER
  useEffect(() => {
    // don't load ANY details until wallet is Checked
    if (walletChecked) {
      dispatch(getPoolValues({ networkID: chainID, provider: provider }));
      dispatch(getRNGStatus({ networkID: chainID, provider: provider }));
    }
  }, [walletChecked]);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  )

  modalButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "buy_presale")}
      onClick={() => {
        onpurchaseCSTSF();
      }}
    >
      {txnButtonText(pendingTransactions, "buy_presale", "Buy")}
    </Button>
  )

  modalButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "approve_presale")}
      onClick={() => {
        onSeekApproval();
      }}
    >
      {txnButtonText(pendingTransactions, "approve_presale", "Approve")}
    </Button>
  )


  let claimButton = [];

  claimButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  )

  claimButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "redeem_presale")}
      onClick={() => {
        onClaim();
      }}
    >
      {txnButtonText(pendingTransactions, "redeem_presale", "Claim")}
    </Button>
  )


  claimButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={true}
      onClick={() => {
        onClaim();
      }}
    >
      {/*txnButtonText(pendingTransactions, "redeem_presale", "Claim and Stake")*/ "Claim and Stake"}
    </Button>
  )

  return (
    <Zoom in={true}>
      <div id="pool-together-view">
        {
          !isSoftLaunchFinished ?
            <DepositCard
              address={address}
              cstPurchaseBalanceSL={cstPurchaseBalanceSL}
              cstpPrice={cstpPrice}
              cstpTotalSupplySL={cstpTotalSupplySL}
              cstInCirculationSL={cstInCirculationSL}
              cstpBalanceSL={cstpBalanceSL}
              inputBUSDAmount={inputBUSDAmount}
              modalButton={modalButton}
              setMax={setMax}
              hasAllowance={hasAllowance}
              setCSTPBalanceCallback={setCSTPBalanceCallback}
              setBUSDBalanceCallback={setBUSDBalanceCallback}
            /> :
            <RedeemCard
              address={address}
              cstPurchaseBalanceSL={cstPurchaseBalanceSL}
              pendingPayoutPresaleSL={pendingPayoutPresaleSL}
              vestingPeriodPresaleSL={vestingPeriodPresaleSL}
              claimButton={claimButton}
            />
        }
        <AboutCard />
      </div >
    </Zoom>
  );
};

export default SoftLaunch;
