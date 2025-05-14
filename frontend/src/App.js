import './App.css';
import React from "react";
import Portfolio from './Portfolio';
import Logs from './Logs'
const Fingerprint = React.lazy(() => import('./Fingerprint'));


const serverurl = process.env.REACT_APP_BACKEND_URL;

function App() {
  return (
    <div className="App">
      <Portfolio
        serverurl={serverurl}
      />
      <Logs
        serverurl={serverurl}
      />
      <Fingerprint/>
    </div>
  );
}

export default App;
