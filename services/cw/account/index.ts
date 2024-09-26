import { storage } from "@/services/storage";
import { Wallet } from "ethers";
import { Signer, randomBytes, Interface, hexlify } from "ethers";
import { useEffect, useState } from "react";
import accountFactoryContractAbi from "@/abi/AccountFactory.json";
import { Contract } from "ethers";
import { JsonRpcProvider } from "ethers";
const accountFactoryInterface = new Interface(accountFactoryContractAbi.abi);

const ACCOUNT_STORAGE_KEY = "v_account";

export interface Account {
  signer: Signer;
  address: string;
}

export const useAccount = (
  rpcUrl: string,
  accountFactory: string
): Account | null => {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let rawPrivateKey = storage.getItem(ACCOUNT_STORAGE_KEY);
    if (!rawPrivateKey) {
      const privateKey = randomBytes(32);

      rawPrivateKey = hexlify(privateKey);

      storage.setItem(ACCOUNT_STORAGE_KEY, rawPrivateKey);
    }

    const wallet = new Wallet(rawPrivateKey);

    const provider = new JsonRpcProvider(rpcUrl);

    wallet.connect(provider);

    (async () => {
      const address = await wallet.getAddress();

      const accountFactoryContract = new Contract(
        accountFactory,
        accountFactoryInterface,
        provider
      );

      console.log("address", address);
      console.log(accountFactoryContract.getFunction("getAddress"));

      const accountAddress = await accountFactoryContract.getFunction(
        "getAddress"
      )(address, BigInt(0));

      setAccount({
        signer: wallet,
        address: accountAddress,
      });
    })();
  }, [rpcUrl, accountFactory]);

  return account;
};
