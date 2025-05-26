import './App.css';
import React from "react";
import Portfolio from './Portfolio';
import Logs from './Logs'
const Fingerprint = React.lazy(() => import('./Fingerprint'));

function App() {
  return (
    <div className="App">
      <Portfolio/>
      <Logs/>
      <Fingerprint/>
    </div>
  );
}

export default App;
