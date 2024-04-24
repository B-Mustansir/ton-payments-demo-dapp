import React, { useCallback, useState } from 'react';
import ReactJson, { InteractionProps } from 'react-json-view';
import './style.scss';
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { beginCell, toNano, Address } from '@ton/ton';

// transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
// response_destination:MsgAddress custom_payload:(Maybe ^Cell)
// forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
// = InternalMsgBody;

const destinationAddress = Address.parse('EQD...'); // put the destination wallet address

const forwardPayload = beginCell()
  .storeUint(0, 32) // 0 opcode means we have a comment
  .storeStringTail('Hello, TON!')
  .endCell();

const body = beginCell()
  .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
  .storeUint(0, 64) // query id
  .storeCoins(toNano(5)) // jetton amount, amount * 10^9
  .storeAddress(destinationAddress) // TON wallet destination address
  .storeAddress(destinationAddress) // response excess destination
  .storeBit(0) // no custom payload
  .storeCoins(toNano('0.02')) // forward amount (if >0, will send notification message)
  .storeBit(1) // we store forwardPayload as a reference
  .storeRef(forwardPayload)
  .endCell();

const jettonWalletContract = Address.parse('UQAEGw4T5tWMaLAdr7_gF3pnggwiKRRIaSJGUu6l_iPamn6A'); // put your jetton wallet address

const defaultTx: SendTransactionRequest = {
  validUntil: Math.floor(Date.now() / 1000) + 360,
  messages: [
    {
      address: jettonWalletContract.toString(), // sender jetton wallet
      amount: toNano("0.05").toString(), // for commission fees, excess will be returned
      payload: body.toBoc().toString("base64") // payload with jetton transfer and comment body
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