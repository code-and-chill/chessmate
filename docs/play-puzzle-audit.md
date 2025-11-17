# Play and Puzzle Audit

## /play (PlayScreen)

### Backend Integration
- Uses `useGame` hook to fetch game data, including moves, status, and participants.
- Relies on `useAuth` for authentication and user context.

### Components
- `GameBoardSection`: Displays the chessboard and player panels.
- `MoveListSidebar`: Shows the move history.
- `ErrorScreen` and `LoadingScreen`: Handle error and loading states.

### Tech Debt
- No clear separation between API calls and hooks.
- Game state management is tightly coupled with the screen component.
- Error handling is basic and could be improved with more detailed messages.

### Loading/Error States
- Loading and error states are handled but could be more user-friendly.

---

## /puzzle (PuzzlePlayScreen)

### Backend Integration
- Directly calls `fetchPuzzle` and `submitPuzzleAttempt` from `puzzleApi`.

### Components
- Displays puzzle metadata (e.g., date, rating) and a placeholder for the chessboard.
- Includes a submit button for puzzle attempts.

### Tech Debt
- API calls are embedded in the component, making it less reusable.
- Error handling is minimal, with a generic error message.
- No caching or retry logic for API calls.

### Loading/Error States
- Loading and error states are present but lack customization.

---

## Recommendations

1. Refactor `/play` and `/puzzle` to align with the target architecture:
   - Separate API layer, hooks, and presentational components.
   - Improve error handling and user experience.
2. Implement caching and retry logic for API calls using React Query or equivalent.
3. Enhance loading and error states with better UX design.