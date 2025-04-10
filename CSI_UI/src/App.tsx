// App.tsx
import React from 'react';
import GlobalStatusBar from './components/Navbar';
import './App.css';
import '@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css';


const App: React.FC = () => {
  return (
    <div className="App">
      <GlobalStatusBar />
    </div>
  );
};

export default App;
