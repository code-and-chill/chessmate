import axios from 'axios';

class PuzzleApi {
  /**
   * Fetches puzzle details by ID.
   * @param puzzleId - The ID of the puzzle to fetch.
   * @returns The puzzle data.
   */
  async fetchPuzzle(puzzleId: string) {
    const response = await axios.get(`/api/v1/puzzles/${puzzleId}`);
    return response.data;
  }

  /**
   * Submits a puzzle attempt.
   * @param puzzleId - The ID of the puzzle being attempted.
   * @param attemptData - The data for the attempt.
   * @returns The result of the attempt submission.
   */
  async submitPuzzleAttempt(
    puzzleId: string,
    attemptData: {
      is_daily: boolean;
      moves_played: string[];
      status: string;
      time_spent_ms: number;
      hints_used: number;
    }
  ) {
    const response = await axios.post(`/api/v1/puzzles/${puzzleId}/attempt`, attemptData);
    return response.data;
  }
}

const puzzleApi = new PuzzleApi();
export default puzzleApi;