import DrawCanvas from './components/DrawCanvas';
import Gallery from './components/Gallery';
import './App.css';

function App() {
  return (
    <div>
      <h1>Doodle Gallery</h1>
      <DrawCanvas />
      <h2>Gallery</h2>
      <Gallery />
    </div>
  );
}

export default App;