import './App.css';
import Portfolio from './Portfolio';
import Logs from './Logs'
import Fingerprint from './Fingerprint';


const serverurl = 'tokentracker.hoprnet.workers.dev' //'http://127.0.0.1:8787'

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
