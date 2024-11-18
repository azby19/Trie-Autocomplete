// src/App.js
import React from 'react';
import Autocomplete from './components/Autocomplete';
import './App.css';
import { Container } from 'react-bootstrap';  // Import Container from Bootstrap

function App() {
  return (
    <div className="App">
      <Container fluid className="bg-light p-5"> {/* Adding container with padding */}
        <h1 className="text-center text-primary mb-4">TrieMaster</h1> {/* Title with Bootstrap classes */}
        <Autocomplete />
      </Container>
    </div>
  );
}

export default App;
