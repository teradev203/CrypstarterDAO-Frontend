import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as PresaleAbi } from "../abi/Presale.json";
import { abi as SoftlaunchAbi } from "../abi/SoftLaunch.json";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./AccountSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { error } from "./MessagesSlice";
import { IPurchaseCSTPAsyncThunk, IPurchaseCSTAsyncThunk, IBaseAddressAsyncThunk, IJsonRPCError } from "./interfaces";
import { loadAccountDetails } from "./AccountSlice";


export const changeApprovalSF = createAsyncThunk(
  "softlaunch/changeApprovalSF",
  async ({ provider, address, networkID }: IBaseAddressAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const daiContract = new ethers.Contract(addresses[networkID].BUSD_ADDRESS as string, ierc20Abi, signer);
    let approveTx;

    try {
      approveTx = await daiContract.approve(
        addresses[networkID].SOFTLAUNCH_ADDRESS,
        ethers.utils.parseUnits("1000000000", "ether").toString(),
      );
      const text = "Approve Presale";
      const pendingTxnType = "approve_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    const daiFaiLaunchAllowance = await daiContract.allowance(address, addresses[networkID].FAIRLAUNCH_ADDRESS);
    console.log('daiFaiLaunchAllowance+2', daiFaiLaunchAllowance);
    return dispatch(
      fetchAccountSuccess({
        presale: {
          daiFaiLaunchAllowance: +daiFaiLaunchAllowance,
        },
      }),
    );
  },
);


export const purchaseCSTSF = createAsyncThunk(
  "softlaunch/purchaseCSTSF",
  async ({ amount, provider, address, networkID }: IPurchaseCSTAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const softLaunchContract = new ethers.Contract(addresses[networkID].SOFTLAUNCH_ADDRESS as string, SoftlaunchAbi, signer);
    let approveTx;
    try {
      approveTx = await softLaunchContract.deposit(ethers.utils.parseUnits(amount.toString(), "ether")
      );

      const text = "Approve Presale";
      const pendingTxnType = "buy_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));

      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      if (errMsg.includes("only whitelisted"))
        dispatch(error("Your account has not been whitelisted. Please contact Manager."));
      else if (errMsg.includes("exceed limit"))
        dispatch(error("Sorry. You exceed limit"));
      else
        dispatch(error("Purchase failed."));
      console.log(errMsg);
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

  },
);


export const redeemSF = createAsyncThunk(
  "softlaunch/redeemSF",
  async ({ provider, address, networkID }: IPurchaseCSTAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    console.log("redeem");

    const signer = provider.getSigner();
    const softLaunchContract = new ethers.Contract(addresses[networkID].SOFTLAUNCH_ADDRESS as string, SoftlaunchAbi, signer);
    let approveTx;
    try {
      approveTx = await softLaunchContract.redeem();

      const text = "Redeem Presale";
      const pendingTxnType = "redeem_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));

      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      if (errMsg.includes("not finalized yet"))
        dispatch(error("Fair Launch not finalized yet. Please wait."));
      else if (errMsg.includes("exceed limit"))
        dispatch(error("Sorry. You exceed limit"));
      else
        dispatch(error("Claim failed. Network has a troble. Please again"));
      console.log(errMsg);
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

  },
);
