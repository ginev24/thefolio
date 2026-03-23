// src/data/quizData.js
// All 10 quiz questions for the About page chess quiz.
// Keeping data separate from the component (Step 6 pattern).

const quizData = [
  { question: "Which piece cannot move backwards?",                                                                      options: ["Knight",        "Pawn",            "Bishop",       "Rook"         ], answer: 1 },
  { question: "What is the most powerful piece on the board?",                                                           options: ["King",          "Queen",           "Knight",       "Rook"         ], answer: 1 },
  { question: "How many squares are on a standard chessboard?",                                                          options: ["32",            "48",              "64",           "81"           ], answer: 2 },
  { question: "What is it called when a King is under attack?",                                                          options: ["Checkmate",     "Stalemate",       "Check",        "En Passant"   ], answer: 2 },
  { question: "What is the name of the special pawn capture immediately after a pawn moves two squares?",                options: ["Castling",      "Promotion",       "En Passant",   "Gambito"      ], answer: 2 },
  { question: "What is the name of a move where the King and Rook move simultaneously?",                                 options: ["Promotion",     "Castling",        "En Passant",   "Fianchetto"   ], answer: 1 },
  { question: "Which of these is considered a 'Minor Piece'?",                                                           options: ["Queen",         "Rook",            "Knight",       "King"         ], answer: 2 },
  { question: "What is a 'Stalemate'?",                                                                                  options: ["A win for white","A win for black", "A draw",       "A forced move"], answer: 2 },
  { question: "Who was the first official World Chess Champion?",                                                        options: ["Bobby Fischer", "Garry Kasparov",  "Magnus Carlsen","Wilhelm Steinitz"], answer: 3 },
  { question: "What is it called when you develop a Bishop to the long diagonal (g2 or b2)?",                            options: ["Fianchetto",    "Castling",        "Fork",         "Pin"          ], answer: 0 },
];

export default quizData;
