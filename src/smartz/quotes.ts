export const QUOTES: { text: string; by: string }[] = [
  { text: "Be yourself; everyone else is already taken.", by: "Oscar Wilde" },
  { text: "The only way to do great work is to love what you do.", by: "Steve Jobs" },
  { text: "It always seems impossible until it is done.", by: "Nelson Mandela" },
  { text: "You miss 100% of the shots you don't take.", by: "Wayne Gretzky" },
  { text: "In the middle of difficulty lies opportunity.", by: "Albert Einstein" },
  { text: "Happiness depends upon ourselves.", by: "Aristotle" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", by: "Eleanor Roosevelt" },
  { text: "What we think, we become.", by: "Buddha" },
  { text: "Courage is not the absence of fear, but the triumph over it.", by: "Nelson Mandela" },
  { text: "Do what you can, with what you have, where you are.", by: "Theodore Roosevelt" },
  { text: "A journey of a thousand miles begins with a single step.", by: "Lao Tzu" },
  { text: "Not all those who wander are lost.", by: "J.R.R. Tolkien" },
  { text: "It is never too late to be what you might have been.", by: "George Eliot" },
  { text: "The best way to predict the future is to invent it.", by: "Alan Kay" },
  { text: "Kindness is a language which the deaf can hear and the blind can see.", by: "Mark Twain" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", by: "Will Durant" },
  { text: "If you can dream it, you can do it.", by: "Walt Disney" },
  { text: "No one can make you feel inferior without your consent.", by: "Eleanor Roosevelt" },
  { text: "The secret of getting ahead is getting started.", by: "Mark Twain" },
  { text: "Strive not to be a success, but rather to be of value.", by: "Albert Einstein" },
  { text: "Turn your wounds into wisdom.", by: "Oprah Winfrey" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", by: "Thomas Edison" },
  { text: "Life is either a daring adventure or nothing at all.", by: "Helen Keller" },
  { text: "Everything you can imagine is real.", by: "Pablo Picasso" },
  { text: "Fall seven times and stand up eight.", by: "Japanese proverb" },
  { text: "The only impossible journey is the one you never begin.", by: "Tony Robbins" },
  { text: "Believe you can and you're halfway there.", by: "Theodore Roosevelt" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", by: "Ralph Waldo Emerson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", by: "Winston Churchill" },
  { text: "Don't count the days, make the days count.", by: "Muhammad Ali" },
  { text: "You must be the change you wish to see in the world.", by: "Mahatma Gandhi" },
  { text: "Imagination is more important than knowledge.", by: "Albert Einstein" },
  { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", by: "Walt Whitman" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", by: "B.B. King" },
  { text: "It does not matter how slowly you go as long as you do not stop.", by: "Confucius" },
  { text: "Nothing will work unless you do.", by: "Maya Angelou" },
  { text: "The only true wisdom is in knowing you know nothing.", by: "Socrates" },
  { text: "A person who never made a mistake never tried anything new.", by: "Albert Einstein" },
  { text: "Shoot for the moon. Even if you miss, you'll land among the stars.", by: "Norman Vincent Peale" },
  { text: "We may encounter many defeats, but we must not be defeated.", by: "Maya Angelou" },
];

export function quoteOfDay(d = new Date()) {
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let n = 0;
  for (let i = 0; i < key.length; i++) n += key.charCodeAt(i) * (i + 3);
  return QUOTES[n % QUOTES.length];
}
