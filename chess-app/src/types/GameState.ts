// Definition of the GameState type

export interface GameState {
    board: string[][]; // 2D array representing the chessboard
    turn: 'white' | 'black';
    status: 'ongoing' | 'checkmate' | 'stalemate' | 'draw';
}