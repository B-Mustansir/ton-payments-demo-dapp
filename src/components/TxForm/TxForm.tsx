require("buffer");
import React, { useCallback, useState } from 'react';
import ReactJson, { InteractionProps } from 'react-json-view';
import './style.scss';
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { beginCell, toNano, Address } from '@ton/ton';

const destinationAddress = Address.parse('UQAEGw4T5tWMaLAdr7_gF3pnggwiKRRIaSJGUu6l_iPamn6A');

const forwardPayload = beginCell()
  .storeUint(0, 32)
  .storeStringTail('Hello, TON!')
  .endCell();

const body = beginCell()
  .storeUint(0x0f8a7ea5, 32)
  .storeUint(0, 64)
  .storeCoins(toNano(5))
  .storeAddress(destinationAddress)
  .storeAddress(destinationAddress)
  .storeBit(0)
  .storeCoins(toNano('0.02'))
  .storeBit(1)
  .storeRef(forwardPayload)
  .endCell();

const jettonWalletContract = Address.parse('UQAEGw4T5tWMaLAdr7_gF3pnggwiKRRIaSJGUu6l_iPamn6A');
const defaultTx: SendTransactionRequest = {
  validUntil: Math.floor(Date.now() / 1000) + 360,
  messages: [
    {
      address: jettonWalletContract.toString(),
      amount: toNano("0.05").toString(),
      payload: body.toBoc().toString("base64")
    }
  ]
};

export function TxForm() {
  const [tx, setTx] = useState(defaultTx);
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  const onChange = useCallback((value: InteractionProps) => {
    setTx(value.updated_src as SendTransactionRequest)
  }, []);

  return (
    <div className="send-tx-form">
      <h3>Configure and send transaction</h3>
      <ReactJson theme="ocean" src={defaultTx} onEdit={onChange} onAdd={onChange} onDelete={onChange} />
      {wallet ? (
        <button onClick={() => tonConnectUi.sendTransaction(tx)}>
          Send transaction
        </button>
      ) : (
        <button onClick={() => tonConnectUi.openModal()}>
          Connect wallet to send the transaction
        </button>
      )}
    </div>
  );
}