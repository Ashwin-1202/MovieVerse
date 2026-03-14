// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import MovieDetails from './components/MovieDetails';
import PersonDetails from './components/PersonDetails';
import CategoryPage from './components/CategoryPage';
import SearchResults from './components/SearchResults';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<MovieDetails />} />
        <Route path="/person/:id" element={<PersonDetails />} />
        <Route path="/:category/:type" element={<CategoryPage />} />
        <Route path="/search/multi" element={<SearchResults />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);