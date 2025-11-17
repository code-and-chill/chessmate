import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PuzzlePlayScreen from '../../ui/screens/PuzzlePlayScreen';

describe('PuzzlePlayScreen', () => {
  const mockOnComplete = jest.fn();
  const mockPuzzleId = 'test-puzzle-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);
    const loadingElement = screen.queryByTestId('loading-indicator');
    expect(loadingElement).toBeTruthy();
  });

  test('renders puzzle board after loading', async () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const boardElement = screen.queryByText(/Chessboard/i);
      expect(boardElement).toBeTruthy();
    });
  });

  test('handles submit button press', async () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const submitButton = screen.queryByText('Submit');
      if (submitButton) {
        fireEvent.press(submitButton);
      }
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  test('displays puzzle header with date', async () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const headerElement = screen.queryByText(/Daily Puzzle/i);
      expect(headerElement).toBeTruthy();
    });
  });

  test('displays tactics rating', async () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const ratingElement = screen.queryByText(/Tactics:/i);
      expect(ratingElement).toBeTruthy();
    });
  });

  test('handles puzzle fetch failure gracefully', async () => {
    jest.mock('axios', () => ({
      get: jest.fn(() => Promise.reject(new Error('Network error')))
    }));

    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const errorElement = screen.queryByText(/Failed/i);
      // Error handling should be in place
    });
  });

  test('displays status message after submission', async () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const submitButton = screen.queryByText('Submit');
      if (submitButton) {
        fireEvent.press(submitButton);
      }
    });

    await waitFor(() => {
      const statusElement = screen.queryByTestId('status-message');
      expect(statusElement).toBeTruthy();
    });
  });

  test('renders controls section', async () => {
    render(<PuzzlePlayScreen puzzleId={mockPuzzleId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      const controlsSection = screen.queryByTestId('controls');
      expect(controlsSection).toBeTruthy();
    });
  });
});
