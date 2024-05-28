import './App.css';
import Portfolio from './Portfolio';
import Logs from './Logs'
import Fingerprint from './Fingerprint';


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
