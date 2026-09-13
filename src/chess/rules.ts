export const RULES: { title: string; body: string }[] = [
  {
    title: "The board",
    body: "Eight files and eight ranks. Pink moves first. Blue answers. Each side has a king, a queen, two rooks, two bishops, two knights, and eight pawns.",
  },
  {
    title: "How pieces move",
    body: "The king steps one square in any direction. The queen runs any number of squares in a line or on a diagonal. The rook runs along ranks and files. The bishop stays on its color, running on diagonals. The knight jumps in an L, two and then one, and may pass over other pieces. The pawn steps one square forward, or two from its starting rank, and captures one square diagonally ahead.",
  },
  {
    title: "Check and mate",
    body: "If a king is attacked, that side is in check and must get out of check. If no legal move can do that, it is checkmate, and the other side wins. If a side has no legal move and is not in check, the game is a draw by stalemate.",
  },
  {
    title: "Castling",
    body: "Once per side, if the king and a rook have not moved, the squares between them are empty, and the king is not in check and does not pass through check, the king may step two squares toward that rook. The rook then finishes on the square the king crossed.",
  },
  {
    title: "En passant and promotion",
    body: "If a pawn uses its first two-square step and lands beside an enemy pawn, that enemy pawn may capture it on the next move as if it had stepped only one square. When a pawn reaches the far rank it becomes a queen, rook, bishop, or knight.",
  },
  {
    title: "Draws",
    body: "The game is also a draw if neither side can force mate, if the same position appears three times, or if fifty moves pass with no pawn move and no capture.",
  },
  {
    title: "How we play here",
    body: "You may sit as pink against a computer, or open a board with a friend. The host is always pink. Easy plays almost at random. Normal looks a short way ahead. Hard looks further and prefers strong captures. Score holds until you leave.",
  },
];
