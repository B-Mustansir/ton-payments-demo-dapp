import React, {useCallback, useState} from 'react';
import ReactJson, {InteractionProps} from 'react-json-view';
import './style.scss';
import {SendTransactionRequest, useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";


const defaultTx: SendTransactionRequest = {

  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      address: 'UQAEGw4T5tWMaLAdr7_gF3pnggwiKRRIaSJGUu6l_iPamn6A',
      amount: '5000000', //0.005 TON is 5000000 nanoTON.
      payload: 'te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g=='
    }
  ],
};

export function TxForm2() {

  const [tx, setTx] = useState(defaultTx);

  const wallet = useTonWallet();

  const [tonConnectUi] = useTonConnectUI();

  const onChange = useCallback((value: InteractionProps) => {
    setTx(value.updated_src as SendTransactionRequest)
  }, []);

  return (
    <div className="send-tx-form">
      <h3>Configure and send transaction</h3>

      <ReactJson theme="ocean" src={defaultTx} onEdit={onChange} onAdd={onChange} onDelete={onChange}/>

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

