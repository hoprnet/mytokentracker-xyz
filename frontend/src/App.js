import './App.css';
import './civic.css';
import React from "react";
import Portfolio from './Portfolio';
import Logs from './Logs'
import { CivicAuthProvider, UserButton } from "@civic/auth-web3/react";
import { useUser } from "@civic/auth-web3/react";

function App() {
  const clientId = process.env.REACT_APP_CIVIC_CLIENT_ID;

  return (
    <CivicAuthProvider
      clientId={clientId}
    >
      <div className="App">
        <UserButton
          className='civic-user-button'
        //  dropdownButtonClassName="civic-user-button-dropdown"
        />
        <Portfolio/>
        <Logs/>
      </div>
    </CivicAuthProvider>
  );
}

export default App;
