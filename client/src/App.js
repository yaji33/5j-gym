import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { GiHamburgerMenu } from "react-icons/gi";
import './App.css';

import Customer from './pages/customer';


function App() {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <Router>
        <header>
          <GiHamburgerMenu onClick={() => setShowNav(!showNav)} />
          <h1><span className="highlight">5J</span> Fitness Gym</h1>
        </header>
        <Navbar show={showNav} />
        <div className={`main ${showNav ? 'with-sidenav' : 'collapsed-sidenav'}`}>
          <Routes>
            
            <Route path="/customer" element={<Customer />} />
          
          </Routes>
        </div>
      </Router>
      <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
  />
    </>
  );
}

export default App;
