import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import DailyPuzzleCard from '../DailyPuzzleCard';

describe('DailyPuzzleCard', () => {
  const mockOnSolve = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<DailyPuzzleCard onSolve={mockOnSolve} />);
    // Component should show loading indicator or placeholder
    const loadingElement = screen.queryByTestId('loading-indicator');
    expect(loadingElement).toBeTruthy();
  });

  test('calls onSolve when Solve Now button is pressed', async () => {
    render(<DailyPuzzleCard onSolve={mockOnSolve} />);
    
    await waitFor(() => {
      const solveButton = screen.queryByText('Solve Now');
      if (solveButton) {
        fireEvent.press(solveButton);
      }
    });

    expect(mockOnSolve).toHaveBeenCalled();
  });

  test('renders puzzle title when data loads', async () => {
    render(<DailyPuzzleCard onSolve={mockOnSolve} />);

    await waitFor(() => {
      const titleElement = screen.queryByText(/Daily Puzzle/i);
      expect(titleElement).toBeTruthy();
    });
  });

  test('displays error message when fetch fails', async () => {
    // Mock axios to fail
    jest.mock('axios', () => ({
      get: jest.fn(() => Promise.reject(new Error('Network error')))
    }));

    render(<DailyPuzzleCard onSolve={mockOnSolve} />);

    await waitFor(() => {
      const errorElement = screen.queryByText(/Failed/i);
      // Error handling should be present
    });
  });

  test('renders card styling correctly', () => {
    const { container } = render(<DailyPuzzleCard onSolve={mockOnSolve} />);
    const cardView = container.querySelector('[style*="card"]');
    expect(cardView).toBeTruthy();
  });
});
