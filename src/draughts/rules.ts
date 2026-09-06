export const RULES: { title: string; body: string }[] = [
  {
    title: "The board",
    body: "Eight by eight, same as chess. Play only on the dark squares. Each side begins with twelve men. Pink moves first. Blue answers.",
  },
  {
    title: "How men move",
    body: "A man steps one dark square diagonally forward. Pink walks toward the far row. Blue walks toward the near row. Men do not step backward.",
  },
  {
    title: "Captures",
    body: "If an enemy sits on the next dark square and the square beyond is empty, you jump that enemy and take the piece. You may keep jumping with the same man if another take is open. If any take is possible, you must take. You choose which take if more than one exists.",
  },
  {
    title: "Kings",
    body: "When a man reaches the far row it is crowned and becomes a king. A king steps one dark square diagonally in any direction and may take forward or back. A man that crowns on a jump ends its turn.",
  },
  {
    title: "How a game ends",
    body: "You win when the other side has no pieces left, or has pieces but no legal move. A draw is rare here and only if the board is empty of both sides.",
  },
  {
    title: "How we play here",
    body: "Sit as pink against a computer, or open a board with a friend. The host is always pink. Easy plays almost at random. Normal looks a short way ahead. Hard looks further and prefers takes and kings. Score holds until you leave.",
  },
];
