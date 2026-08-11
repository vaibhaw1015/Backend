import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders landing page when unauthenticated', () => {
    // Clear localStorage to ensure unauthenticated state
    localStorage.clear();
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/Get Started in 3 Simple Steps/i)).toBeInTheDocument();
  });
});
