export type Cat =
  | "Geography"
  | "Entertainment"
  | "History"
  | "Art & Literature"
  | "Science & Nature"
  | "Sports & Leisure"
  | "Bible Quiz"
  | "Maths";

export type Q = { cat: Cat; q: string; a: string; opts: [string, string, string, string] };

export const CATS: Cat[] = [
  "Geography",
  "Entertainment",
  "History",
  "Art & Literature",
  "Science & Nature",
  "Sports & Leisure",
  "Bible Quiz",
  "Maths",
];

const CORE: Q[] = [
  { cat: "Geography", q: "Which river runs through Egypt?", a: "Nile", opts: ["Amazon", "Nile", "Thames", "Danube"] },
  { cat: "Geography", q: "What is the capital of Japan?", a: "Tokyo", opts: ["Kyoto", "Osaka", "Tokyo", "Seoul"] },
  { cat: "Geography", q: "Which continent is Brazil on?", a: "South America", opts: ["Africa", "Europe", "South America", "Asia"] },
  { cat: "Geography", q: "The Pleiades are a cluster of what?", a: "Stars", opts: ["Islands", "Stars", "Volcanoes", "Cities"] },
  { cat: "Geography", q: "Qumran caves sit near which sea?", a: "Dead Sea", opts: ["Red Sea", "Dead Sea", "Black Sea", "Caspian Sea"] },
  { cat: "Geography", q: "Brooklyn is a borough of which city?", a: "New York", opts: ["Boston", "Chicago", "New York", "Philadelphia"] },
  { cat: "Geography", q: "Mount Everest is in which range?", a: "Himalayas", opts: ["Alps", "Andes", "Himalayas", "Rockies"] },
  { cat: "Geography", q: "Which ocean is the largest?", a: "Pacific", opts: ["Atlantic", "Indian", "Pacific", "Arctic"] },
  { cat: "Entertainment", q: "How many strings does a standard guitar have?", a: "6", opts: ["4", "5", "6", "8"] },
  { cat: "Entertainment", q: "Which of these is a stop-motion studio famous for Wallace and Gromit?", a: "Aardman", opts: ["Pixar", "Aardman", "Ghibli", "Illumination"] },
  { cat: "Entertainment", q: "A haiku traditionally has how many syllables in total?", a: "17", opts: ["10", "12", "17", "21"] },
  { cat: "Entertainment", q: "Which instrument has black and white keys?", a: "Piano", opts: ["Flute", "Piano", "Drum", "Violin"] },
  { cat: "Entertainment", q: "Who wrote the Harry Potter books?", a: "J.K. Rowling", opts: ["J.K. Rowling", "Roald Dahl", "Philip Pullman", "C.S. Lewis"] },
  { cat: "Entertainment", q: "What do you call a film that continues a story?", a: "Sequel", opts: ["Prequel", "Sequel", "Pilot", "Trailer"] },
  { cat: "Entertainment", q: "Which of these is a dance style?", a: "Salsa", opts: ["Salsa", "Sonnet", "Sonata", "Stanza"] },
  { cat: "Entertainment", q: "A director shouts what word to start filming?", a: "Action", opts: ["Cut", "Action", "Print", "Quiet"] },
  { cat: "History", q: "The Great Wall is in which country?", a: "China", opts: ["Japan", "China", "Mongolia", "Korea"] },
  { cat: "History", q: "Who was the first President of the United States?", a: "George Washington", opts: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"] },
  { cat: "History", q: "Ancient Rome spoke which language?", a: "Latin", opts: ["Greek", "Latin", "Italian", "French"] },
  { cat: "History", q: "The year 33 AD is in which century?", a: "1st century", opts: ["1st century", "3rd century", "33rd century", "2nd century"] },
  { cat: "History", q: "Tutankhamun was a ruler of which land?", a: "Egypt", opts: ["Greece", "Egypt", "Persia", "Rome"] },
  { cat: "History", q: "The printing press is linked to which inventor?", a: "Gutenberg", opts: ["Newton", "Gutenberg", "Tesla", "Bell"] },
  { cat: "History", q: "Suffragettes campaigned for what?", a: "Women's votes", opts: ["Cheaper bread", "Women's votes", "New ships", "School holidays"] },
  { cat: "History", q: "The Silk Road connected China with which region?", a: "The West", opts: ["Antarctica", "The West", "Australia", "The Arctic"] },
  { cat: "Art & Literature", q: "Who wrote Romeo and Juliet?", a: "Shakespeare", opts: ["Dickens", "Shakespeare", "Austen", "Homer"] },
  { cat: "Art & Literature", q: "A sonnet usually has how many lines?", a: "14", opts: ["8", "10", "12", "14"] },
  { cat: "Art & Literature", q: "The Mona Lisa hangs in which city?", a: "Paris", opts: ["Rome", "Paris", "Madrid", "London"] },
  { cat: "Art & Literature", q: "A narrator who says I is using which person?", a: "First person", opts: ["First person", "Second person", "Third person", "No person"] },
  { cat: "Art & Literature", q: "Which of these is a primary colour?", a: "Blue", opts: ["Green", "Blue", "Purple", "Orange"] },
  { cat: "Art & Literature", q: "A myth is a story that often explains what?", a: "How the world works", opts: ["A recipe", "How the world works", "A sports score", "A bus timetable"] },
  { cat: "Art & Literature", q: "Haiku comes from which country?", a: "Japan", opts: ["China", "Japan", "Korea", "India"] },
  { cat: "Art & Literature", q: "A landscape painting usually shows what?", a: "Outdoor scenery", opts: ["A bowl of fruit", "Outdoor scenery", "A close-up face", "A city map"] },
  { cat: "Science & Nature", q: "Water boils at what temperature in Celsius at sea level?", a: "100", opts: ["0", "32", "100", "212"] },
  { cat: "Science & Nature", q: "What gas do plants take in for photosynthesis?", a: "Carbon dioxide", opts: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"] },
  { cat: "Science & Nature", q: "How many planets are in our solar system?", a: "8", opts: ["7", "8", "9", "12"] },
  { cat: "Science & Nature", q: "The human heart pumps what?", a: "Blood", opts: ["Air", "Blood", "Water", "Lymph only"] },
  { cat: "Science & Nature", q: "A light-year measures what?", a: "Distance", opts: ["Time", "Distance", "Weight", "Heat"] },
  { cat: "Science & Nature", q: "Bees help plants by doing what?", a: "Pollinating", opts: ["Digging", "Pollinating", "Hunting", "Hibernating flowers"] },
  { cat: "Science & Nature", q: "What is H2O?", a: "Water", opts: ["Salt", "Water", "Air", "Sugar"] },
  { cat: "Science & Nature", q: "Earth's natural satellite is the what?", a: "Moon", opts: ["Sun", "Moon", "Mars", "Venus"] },
  { cat: "Sports & Leisure", q: "How many players are on a football (soccer) team on the pitch?", a: "11", opts: ["7", "9", "11", "15"] },
  { cat: "Sports & Leisure", q: "A marathon is about how many miles?", a: "26", opts: ["10", "13", "26", "50"] },
  { cat: "Sports & Leisure", q: "In tennis, zero is called what?", a: "Love", opts: ["Nil", "Love", "Blank", "Duck"] },
  { cat: "Sports & Leisure", q: "Olympic Games happen every how many years?", a: "4", opts: ["2", "3", "4", "5"] },
  { cat: "Sports & Leisure", q: "A chess board has how many squares?", a: "64", opts: ["36", "49", "64", "81"] },
  { cat: "Sports & Leisure", q: "Yoga is mainly a practice of what?", a: "Breath and movement", opts: ["Sprinting", "Breath and movement", "Tackle drills", "High diving"] },
  { cat: "Sports & Leisure", q: "Bowling knocks down how many pins at the start of a frame?", a: "10", opts: ["6", "8", "10", "12"] },
  { cat: "Sports & Leisure", q: "A standard deck of cards has how many suits?", a: "4", opts: ["2", "3", "4", "5"] },
  { cat: "Bible Quiz", q: "How many days did God take to create the world in Genesis?", a: "Six", opts: ["Three", "Six", "Ten", "Forty"] },
  { cat: "Bible Quiz", q: "Who built an ark?", a: "Noah", opts: ["Moses", "Noah", "David", "Jonah"] },
  { cat: "Bible Quiz", q: "Moses received the Ten Commandments on which mountain?", a: "Sinai", opts: ["Zion", "Olives", "Sinai", "Carmel"] },
  { cat: "Bible Quiz", q: "Who was swallowed by a great fish?", a: "Jonah", opts: ["Peter", "Jonah", "Paul", "Daniel"] },
  { cat: "Bible Quiz", q: "David faced which giant?", a: "Goliath", opts: ["Samson", "Goliath", "Nebuchadnezzar", "Pharaoh"] },
  { cat: "Bible Quiz", q: "Jesus was born in which town?", a: "Bethlehem", opts: ["Nazareth", "Jericho", "Bethlehem", "Rome"] },
  { cat: "Bible Quiz", q: "How many disciples did Jesus choose?", a: "12", opts: ["7", "10", "12", "40"] },
  { cat: "Bible Quiz", q: "Which book comes first in the Bible?", a: "Genesis", opts: ["Exodus", "Psalms", "Genesis", "Matthew"] },
  { cat: "Bible Quiz", q: "Who was thrown into a den of lions?", a: "Daniel", opts: ["Joseph", "Daniel", "Elijah", "Job"] },
  { cat: "Bible Quiz", q: "The Christmas star is said to have led visitors to whom?", a: "Jesus", opts: ["Moses", "Abraham", "Jesus", "Solomon"] },
];

function pack(cat: Cat, q: string, a: string, wrong: [string, string, string]): Q {
  return { cat, q, a, opts: [a, ...wrong] };
}

function extraBank(): Q[] {
  const g: Q[] = [];
  const add = (cat: Cat, rows: Array<[string, string, string, string, string]>) => {
    for (const [q, a, w1, w2, w3] of rows) g.push(pack(cat, q, a, [w1, w2, w3]));
  };

  add("Geography", [
    ["What is the capital of France?", "Paris", "Lyon", "Nice", "Marseille"],
    ["What is the capital of Italy?", "Rome", "Milan", "Venice", "Naples"],
    ["What is the capital of Spain?", "Madrid", "Barcelona", "Seville", "Valencia"],
    ["What is the capital of Canada?", "Ottawa", "Toronto", "Vancouver", "Montreal"],
    ["What is the capital of Australia?", "Canberra", "Sydney", "Melbourne", "Perth"],
    ["What is the capital of Kenya?", "Nairobi", "Mombasa", "Lagos", "Accra"],
    ["What is the capital of Brazil?", "Brasilia", "Rio de Janeiro", "Sao Paulo", "Lima"],
    ["What is the capital of Egypt?", "Cairo", "Alexandria", "Giza", "Luxor"],
    ["What is the capital of India?", "New Delhi", "Mumbai", "Kolkata", "Chennai"],
    ["What is the capital of Germany?", "Berlin", "Munich", "Hamburg", "Frankfurt"],
    ["Which country is both a continent and a country?", "Australia", "Greenland", "Iceland", "Madagascar"],
    ["The Amazon rainforest is mostly in which country?", "Brazil", "Chile", "Mexico", "Spain"],
    ["The Sahara is a desert on which continent?", "Africa", "Asia", "Australia", "South America"],
    ["Which country is shaped like a boot?", "Italy", "Greece", "Portugal", "Norway"],
    ["Stonehenge is in which country?", "England", "Ireland", "France", "Scotland"],
    ["The Grand Canyon is in which country?", "United States", "Mexico", "Canada", "Peru"],
    ["Which is the smallest ocean?", "Arctic", "Indian", "Atlantic", "Pacific"],
    ["The Nile flows into which sea?", "Mediterranean", "Red Sea", "Black Sea", "Arabian Sea"],
    ["Fjord landscapes are famous in which country?", "Norway", "Spain", "Kenya", "India"],
    ["The Andes run along which continent?", "South America", "Africa", "Europe", "Australia"],
    ["Iceland sits on which kind of plate boundary?", "Divergent", "Only transform", "A single frozen plate", "No plates"],
    ["The equator crosses which ocean besides the Atlantic and Pacific?", "Indian", "Arctic", "Southern only", "Caspian"],
    ["What is the capital of Ireland?", "Dublin", "Cork", "Belfast", "Galway"],
    ["What is the capital of Scotland's country, the UK, for government?", "London", "Edinburgh", "Cardiff", "Belfast"],
    ["Machu Picchu is in which country?", "Peru", "Chile", "Bolivia", "Argentina"],
    ["The Great Barrier Reef is off which country?", "Australia", "New Zealand", "Indonesia", "Japan"],
    ["Which US state is an archipelago in the Pacific?", "Hawaii", "Alaska", "Florida", "California"],
    ["The Ganges river is sacred in which country?", "India", "Egypt", "Italy", "Peru"],
    ["Kilimanjaro is on which continent?", "Africa", "Asia", "Europe", "South America"],
    ["The Thames flows through which city?", "London", "Paris", "Rome", "Dublin"],
    ["Patagonia is shared by Argentina and which neighbour?", "Chile", "Brazil", "Peru", "Uruguay"],
    ["The Dead Sea is so salty you can easily do what?", "Float", "Boil", "Freeze solid", "Drink it safely"],
    ["Which line divides Earth into north and south?", "Equator", "Prime meridian", "Tropic only", "Date line"],
    ["Greenland is politically linked to which country?", "Denmark", "Canada", "Norway", "Iceland"],
    ["The Atacama Desert is in which continent?", "South America", "Africa", "Australia", "Asia"],
    ["Mount Fuji is in which country?", "Japan", "China", "Korea", "Nepal"],
    ["The Serengeti is mainly in which country?", "Tanzania", "Egypt", "Morocco", "South Africa"],
    ["What is the capital of Mexico?", "Mexico City", "Cancun", "Guadalajara", "Tijuana"],
    ["Which sea sits between Europe and Africa?", "Mediterranean", "Caribbean", "Caspian", "Baltic"],
    ["Antarctica is best described as a what?", "Continent", "Country", "Ocean", "Island nation"],
  ]);

  add("Entertainment", [
    ["Who created Mickey Mouse?", "Walt Disney", "Jim Henson", "Hayao Miyazaki", "Stan Lee"],
    ["A trilogy is a set of how many stories?", "3", "2", "4", "5"],
    ["Which instrument uses a bow?", "Violin", "Flute", "Trumpet", "Drum"],
    ["A comedian mainly tries to make people what?", "Laugh", "Sleep", "Race", "Paint"],
    ["The Oscars celebrate achievement in what?", "Film", "Football", "Cooking", "Chess"],
    ["A soundtrack is music made for a what?", "Film or show", "Cookbook", "Map", "Weather report"],
    ["Which of these is a brass instrument?", "Trumpet", "Clarinet", "Harp", "Cello"],
    ["A rehearsal happens when?", "Before the show", "After the credits", "Instead of learning lines", "Only in silence"],
    ["Stop-motion animation moves what between frames?", "Physical models", "Only live actors", "Weather", "Subtitles"],
    ["A duet is performed by how many people?", "Two", "One", "Four", "Ten"],
    ["Which of these is a woodwind?", "Flute", "Trombone", "Timpani", "Banjo"],
    ["A credits sequence usually appears when?", "At the end", "Only in trailers", "Before cameras exist", "Never"],
    ["Who wrote The Lion, the Witch and the Wardrobe?", "C.S. Lewis", "Tolkien", "Rowling", "Dahl"],
    ["A playlist is a collection of what?", "Songs", "Recipes", "Maps", "Laws"],
    ["Beatboxing imitates instruments using what?", "The voice", "A piano only", "A drum kit only", "A violin"],
    ["A cameo is a brief what?", "Guest appearance", "Interval", "Costume change", "Camera lens"],
    ["Which of these is a string quartet instrument?", "Cello", "Tuba", "Oboe", "Xylophone"],
    ["Karaoke is singing along to what?", "Recorded music", "Silence", "Live orchestra only", "A whistle"],
    ["A storyboard is used to plan what?", "Shots in a film", "A bus route", "A garden fence", "Tax forms"],
    ["Mime artists usually perform without what?", "Spoken words", "Movement", "Costume", "An audience"],
    ["A musical combines story with what?", "Songs and dance", "Only silence", "Only sports", "Only painting"],
    ["Who painted sunflowers in famous still lifes?", "Van Gogh", "Warhol", "Banksy", "Monet's cat"],
    ["A podcast is mainly a what?", "Audio show", "Silent film", "Board game", "Recipe card"],
    ["An encore is an extra what?", "Performance", "Interval snack", "Ticket price", "Camera"],
    ["Which of these is percussion?", "Drums", "Flute", "Violin", "Harp"],
    ["A soprano voice is typically what?", "High", "The lowest possible", "Spoken only", "Silent"],
    ["Pixar is known for what kind of films?", "Animated", "Silent newsreels", "Live sports only", "Weather maps"],
    ["A libretto is the words of a what?", "Opera or musical", "Cookbook", "Atlas", "Train ticket"],
    ["Improvisation means making it up when?", "On the spot", "A year later", "Never", "Only in writing"],
    ["A close-up shot shows what?", "A face or detail", "The whole city only", "Outer space only", "A map key"],
    ["Which of these is a famous ballet?", "Swan Lake", "Hamlet the quiz", "Chess Openings", "The Periodic Table"],
    ["A jingle is a short what?", "Catchy tune", "Novel", "Sculpture", "Recipe"],
    ["Who wrote Charlie and the Chocolate Factory?", "Roald Dahl", "Dr Seuss", "Austen", "Homer"],
    ["A sitcom is a comedy made for what?", "TV or streaming", "Only radio static", "Only oil paint", "Only sport"],
    ["Harmony is when notes sound what?", "Together", "One at a time only", "Never", "Out of tune on purpose always"],
    ["A monologue is spoken by how many people?", "One", "Two", "A crowd", "Nobody"],
    ["Which of these is a camera move?", "Pan", "Boil", "Fold", "Knit"],
    ["A graphic novel tells a story using what?", "Pictures and words", "Only numbers", "Only dance", "Only silence"],
    ["The Grammys mainly honour what?", "Music", "Architecture", "Gardening", "Sailing"],
    ["A motif in music is a short what?", "Repeating idea", "Interval snack", "Lighting rig", "Ticket stub"],
  ]);

  add("History", [
    ["The pyramids at Giza were built in which land?", "Egypt", "Greece", "Rome", "Persia"],
    ["Julius Caesar was a leader in which city?", "Rome", "Athens", "Babylon", "Troy"],
    ["The Magna Carta was signed in which country?", "England", "France", "Spain", "Italy"],
    ["Who is credited with discovering penicillin?", "Alexander Fleming", "Einstein", "Newton", "Darwin"],
    ["The Renaissance began in which region?", "Italy", "Canada", "Japan", "Egypt"],
    ["Nelson Mandela became president of which country?", "South Africa", "Kenya", "Nigeria", "Ghana"],
    ["The Berlin Wall fell in which year?", "1989", "1961", "1945", "2001"],
    ["Who flew the first powered aeroplane with his brother?", "Wright", "Ford", "Bell", "Edison"],
    ["Ancient Athens is remembered as a cradle of what?", "Democracy", "Ice hockey", "Printing", "Steam trains"],
    ["The Industrial Revolution began in which country?", "Britain", "Brazil", "Egypt", "Peru"],
    ["Who was known as the Maid of Orleans?", "Joan of Arc", "Cleopatra", "Elizabeth I", "Marie Curie"],
    ["The Titanic sank in which ocean?", "Atlantic", "Pacific", "Indian", "Arctic"],
    ["Martin Luther King Jr. is remembered for what?", "Civil rights", "Inventing radio", "Painting caves", "Sailing west"],
    ["The Rosetta Stone helped scholars read what?", "Egyptian hieroglyphs", "Morse code", "Braille only", "Binary"],
    ["Who painted the ceiling of the Sistine Chapel?", "Michelangelo", "Raphael", "Donatello", "Leonardo only"],
    ["The first man on the Moon was?", "Neil Armstrong", "Buzz only", "Yuri Gagarin", "John Glenn"],
    ["World War II ended in Europe in which year?", "1945", "1918", "1939", "1969"],
    ["The ancient library of Alexandria was in which country?", "Egypt", "Italy", "Greece only", "India"],
    ["Who wrote a famous diary while hiding in Amsterdam?", "Anne Frank", "Jane Austen", "Emily Dickinson", "Maya Angelou"],
    ["The Vikings came mainly from which region?", "Scandinavia", "Sahara", "Amazon", "Outback"],
    ["Mahatma Gandhi led a movement in which country?", "India", "China", "Japan", "Egypt"],
    ["The Colosseum stands in which city?", "Rome", "Athens", "Paris", "Cairo"],
    ["Who developed the theory of gravity after an apple story?", "Newton", "Galileo", "Kepler", "Faraday"],
    ["The first Olympic Games of ancient times were in?", "Greece", "Rome", "Egypt", "China"],
    ["The Declaration of Independence was signed in which year?", "1776", "1492", "1812", "1914"],
    ["Who was the French scientist who studied radioactivity with Pierre?", "Marie Curie", "Ada Lovelace", "Nightingale", "Hypatia"],
    ["The Great Fire of London was in which century?", "17th", "12th", "19th", "21st"],
    ["Samurai were warriors in which country?", "Japan", "Mongolia", "Korea only", "China only"],
    ["The Panama Canal links which two oceans?", "Atlantic and Pacific", "Indian and Arctic", "Atlantic and Indian", "Pacific and Arctic"],
    ["Who invented a practical light bulb among others?", "Edison", "Mozart", "Homer", "Caesar"],
    ["The Black Death was a what?", "Plague", "Flood only", "Volcano", "Warship"],
    ["Cleopatra ruled which kingdom?", "Egypt", "Rome", "Persia", "Gaul"],
    ["The Wright Flyer first flew in which country?", "United States", "France", "Britain", "Germany"],
    ["Apartheid was a system of segregation in which country?", "South Africa", "Canada", "Sweden", "Japan"],
    ["Who charted a southern route around Africa to India for Portugal?", "Vasco da Gama", "Columbus", "Magellan only", "Cook"],
    ["The Parthenon honours which goddess?", "Athena", "Hera", "Isis", "Venus"],
    ["The Cold War was mainly a standoff between the USA and?", "The Soviet Union", "Brazil", "Australia", "Spain"],
    ["Florence Nightingale is remembered for work in what?", "Nursing", "Painting", "Ship design", "Astronomy"],
    ["The Inca empire was centred in which mountains?", "Andes", "Alps", "Himalayas", "Rockies"],
    ["Who is said to have united much of Europe in 800 AD as emperor?", "Charlemagne", "Napoleon", "Alexander", "Augustus"],
  ]);

  add("Art & Literature", [
    ["Who wrote Pride and Prejudice?", "Jane Austen", "Bronte", "Eliot", "Woolf"],
    ["A metaphor compares things without using which words?", "Like or as", "And or but", "The or a", "Yes or no"],
    ["Impressionism is a style of what?", "Painting", "Bricklaying", "Coding", "Sailing"],
    ["Who wrote The Odyssey?", "Homer", "Virgil", "Ovid", "Sophocles"],
    ["A biography tells the story of a life written by whom?", "Someone else", "Only the subject", "A choir", "A statue"],
    ["Watercolour paint is thinned with what?", "Water", "Oil", "Sand", "Ink only"],
    ["A haiku's middle line traditionally has how many syllables?", "7", "5", "3", "9"],
    ["Who wrote A Christmas Carol?", "Charles Dickens", "Twain", "Poe", "Wilde"],
    ["A still life usually shows what?", "Objects", "A storm at sea", "A running race", "A map"],
    ["Alliteration repeats what?", "Starting sounds", "Page numbers", "Chapter titles only", "Dates"],
    ["Who wrote To Kill a Mockingbird?", "Harper Lee", "Morrison", "Walker", "Hurston"],
    ["A fresco is painted on what?", "Wet plaster", "Glass only", "Silk only", "Metal only"],
    ["A fable often ends with a what?", "Moral", "Recipe", "Map", "Score"],
    ["Who wrote The Hobbit?", "J.R.R. Tolkien", "Lewis", "Rowling", "Pullman"],
    ["Perspective in drawing helps show what?", "Depth", "Only colour", "Only sound", "Only taste"],
    ["A limerick is a comic poem with how many lines?", "5", "3", "14", "20"],
    ["Who painted Water Lilies series?", "Monet", "Picasso", "Rembrandt", "Warhol"],
    ["A protagonist is the story's what?", "Main character", "Publisher", "Typeface", "Index"],
    ["Collage is art made by doing what?", "Sticking pieces together", "Only carving stone", "Only blowing glass", "Only welding"],
    ["Who wrote Little Women?", "Louisa May Alcott", "Montgomery", "Wilder", "Burnett"],
    ["Iambic pentameter is a pattern of what?", "Rhythm in poetry", "Brush strokes", "Camera lenses", "Clay coils"],
    ["A palette is used to hold what?", "Paint colours", "Sheet music", "Clay tools only", "Needles"],
    ["Who wrote 1984?", "George Orwell", "Huxley", "Bradbury", "Asimov"],
    ["A silhouette shows a shape as a what?", "Outline", "Full colour portrait", "3D statue", "Map key"],
    ["Onomatopoeia is a word that what?", "Sounds like its meaning", "Rhymes only", "Is always Latin", "Has no vowels"],
    ["Who wrote The Secret Garden?", "Frances Hodgson Burnett", "Potter", "Nesbit", "Montgomery"],
    ["Cubism is linked to which artist?", "Picasso", "Turner", "Constable", "Vermeer"],
    ["A stanza is a group of what?", "Lines in a poem", "Pages in an atlas", "Scenes in a play only", "Chords only"],
    ["Who wrote Anne of Green Gables?", "L.M. Montgomery", "Alcott", "Wilder", "Montgomery's editor"],
    ["Chiaroscuro is strong contrast of what?", "Light and dark", "Warm and cold rooms", "High and low notes only", "Near and far maps"],
    ["A memoir is based on what?", "Memory of real life", "Only myths", "Only maths proofs", "Only recipes"],
    ["Who wrote The Tale of Peter Rabbit?", "Beatrix Potter", "Potter's cousin", "Dahl", "Milne"],
    ["A couplet is how many rhyming lines?", "Two", "Four", "Eight", "Twelve"],
    ["Who sculpted David in Florence?", "Michelangelo", "Bernini", "Rodin", "Donatello only"],
    ["Personification gives human traits to what?", "Non-human things", "Only kings", "Only numbers", "Only maps"],
    ["Who wrote Winnie-the-Pooh?", "A.A. Milne", "Potter", "Grahame", "Carroll"],
    ["A triptych is art in how many panels?", "Three", "Two", "Five", "Ten"],
    ["Who wrote Alice's Adventures in Wonderland?", "Lewis Carroll", "Barrie", "Milne", "Grahame"],
    ["A sonnet is a form of what?", "Poem", "Oil sketch", "Symphony", "Novel chapter only"],
    ["Who wrote The Wind in the Willows?", "Kenneth Grahame", "Milne", "Potter", "Carroll"],
  ]);

  add("Science & Nature", [
    ["What force pulls objects toward Earth?", "Gravity", "Magnetism only", "Friction only", "Light"],
    ["Photosynthesis mainly happens in which part of a plant?", "Leaves", "Roots only", "Seeds only", "Bark only"],
    ["What is the centre of an atom called?", "Nucleus", "Orbit", "Spark", "Shell"],
    ["Sound travels fastest through which of these?", "Steel", "Air", "Outer space vacuum", "Feathers"],
    ["The smallest unit of life is the what?", "Cell", "Organ", "Tissue", "Atom only"],
    ["Which planet is known as the Red Planet?", "Mars", "Venus", "Jupiter", "Mercury"],
    ["What do we call animals that eat only plants?", "Herbivores", "Carnivores", "Omnivores", "Producers only"],
    ["DNA carries what?", "Genetic information", "Only water", "Only heat", "Only sound"],
    ["A prism can split white light into what?", "A spectrum", "Steam", "Magnets", "Gravity"],
    ["Which blood cells help fight infection?", "White", "Red only", "Platelets only", "Plasma only"],
    ["The process of a liquid becoming a gas is?", "Evaporation", "Freezing", "Condensation", "Melting"],
    ["What is the hardest natural mineral?", "Diamond", "Quartz", "Talc", "Gold"],
    ["Which gas do humans need to breathe?", "Oxygen", "Nitrogen only", "Helium", "Neon"],
    ["A food chain starts with a what?", "Producer", "Predator", "Fossil", "Cloud"],
    ["Earth spins on its what?", "Axis", "Equator line only", "Orbit rope", "Core string"],
    ["Metamorphosis in butterflies includes a what stage?", "Chrysalis", "Seed", "Tadpole only", "Spore"],
    ["Which organ filters blood and makes urine?", "Kidney", "Lung", "Skin", "Ear"],
    ["Static electricity is a build-up of what?", "Charge", "Heat only", "Mass only", "Colour"],
    ["The Moon's phases are caused by what?", "Sunlight and position", "Earth's weather", "Ocean salt", "Wind"],
    ["A conductor of electricity is often made of what?", "Metal", "Rubber", "Wood", "Glass"],
    ["Chlorophyll makes plants look what colour?", "Green", "Blue", "Red", "White"],
    ["Which planet has prominent rings?", "Saturn", "Mars", "Venus", "Mercury"],
    ["A hypothesis is a what?", "Testable idea", "Final law", "Random guess with no test", "Poem"],
    ["Bones meet at a what?", "Joint", "Vein", "Neuron", "Gland"],
    ["The water cycle includes rain which is a form of what?", "Precipitation", "Orbit", "Fusion", "Erosion only"],
    ["An ecosystem is living things plus their what?", "Environment", "Alphabet", "Calendar", "Price list"],
    ["Which simple machine is a ramp?", "Inclined plane", "Pulley only", "Wheel only", "Screwdriver only"],
    ["The brain sends signals along what?", "Nerves", "Bones only", "Hair", "Nails"],
    ["Renewable energy includes which of these?", "Wind", "Coal only", "Oil only", "Peat only"],
    ["A seed needs water, space and what to germinate?", "Warmth", "Salt", "Darkness only always", "Metal"],
    ["Which planet is closest to the Sun?", "Mercury", "Venus", "Earth", "Mars"],
    ["Friction usually does what to motion?", "Slows it", "Creates planets", "Stops gravity", "Makes light years"],
    ["Birds are the only animals alive today with what?", "Feathers", "Scales only", "Gills only", "Six legs"],
    ["The chemical symbol for gold is?", "Au", "Go", "Gd", "Ag"],
    ["A year is the time Earth takes to what?", "Orbit the Sun", "Spin once", "Freeze", "Stop"],
    ["Mammals feed their young with what?", "Milk", "Pollen", "Nectar only", "Chlorophyll"],
    ["Which layer of Earth do we live on?", "Crust", "Outer core", "Inner core", "Mantle only"],
    ["A vaccine helps the body recognise a what?", "Germ", "Star", "Rock", "Colour"],
    ["Tides are caused mainly by the gravity of the what?", "Moon", "Mars", "Polaris", "Jupiter only"],
    ["Ice is water in which state?", "Solid", "Gas", "Plasma", "Liquid"],
  ]);

  add("Sports & Leisure", [
    ["How many points is a basketball free throw worth?", "1", "2", "3", "4"],
    ["A hat-trick means scoring how many times?", "3", "2", "4", "5"],
    ["In baseball, how many strikes make an out?", "3", "2", "4", "1"],
    ["A standard football (soccer) match has how many halves?", "2", "3", "4", "1"],
    ["The Tour de France is a race in what sport?", "Cycling", "Sailing", "Skiing", "Rowing"],
    ["A try is scored in which sport?", "Rugby", "Tennis", "Golf", "Chess"],
    ["Wimbledon is a famous tournament in what?", "Tennis", "Boxing", "Swimming", "Archery"],
    ["A knockout happens in which sport?", "Boxing", "Golf", "Curling", "Darts only"],
    ["How many players are on court for one basketball team?", "5", "6", "7", "11"],
    ["A birdie in golf is one under what?", "Par", "Bogey", "Eagle", "Albatross"],
    ["The Super Bowl is the final of which sport?", "American football", "Cricket", "Hockey", "Baseball"],
    ["A wicket is used in which sport?", "Cricket", "Tennis", "Golf", "Ski jump"],
    ["Yoga's downward dog is a what?", "Pose", "Score", "Penalty", "Stadium"],
    ["A slalom course is used in which sport?", "Skiing", "Boxing", "Archery only", "Diving only"],
    ["How many rings are on the Olympic flag?", "5", "4", "6", "7"],
    ["A checkmate ends a game of what?", "Chess", "Draughts only", "Go-karting", "Darts"],
    ["The length of an Olympic swimming pool is how many metres?", "50", "25 only always", "100", "15"],
    ["A pinch hitter appears in which sport?", "Baseball", "Tennis", "Golf", "Fencing"],
    ["Netball teams usually have how many players on court?", "7", "5", "11", "15"],
    ["A scrum is a contest in which sport?", "Rugby", "Golf", "Swimming", "Table tennis"],
    ["Table tennis is also called what?", "Ping-pong", "Squash", "Badminton", "Lacrosse"],
    ["A marathon winner is first to do what?", "Finish the course", "Jump highest", "Lift most", "Dive deepest"],
    ["Ice hockey is played with a what instead of a ball?", "Puck", "Shuttle", "Beanbag", "Quoit"],
    ["A vault is an event in which sport?", "Gymnastics", "Archery", "Sailing", "Bowls"],
    ["The Ashes is a series between England and which country?", "Australia", "India", "South Africa", "New Zealand"],
    ["A spare in bowling knocks down remaining pins in how many rolls after the first?", "One", "Two", "Three", "Zero"],
    ["Fencing uses which kind of equipment?", "Swords", "Bats", "Clubs", "Oars"],
    ["A yellow card in football is a what?", "Caution", "Goal", "Substitution only", "Offside flag only"],
    ["The pentathlon includes how many events?", "5", "3", "7", "10"],
    ["A rally in tennis is a series of what?", "Shots", "Serves only", "Lets only", "Aces only"],
    ["Rowing boats are moved with what?", "Oars", "Paddles only always", "Sails only", "Poles only"],
    ["A bullseye is the centre of a what?", "Dartboard", "Goalpost", "Net", "Tee"],
    ["Skateboarding tricks are often done on a what?", "Ramp", "Ice rink only", "Pool lane", "Running track only"],
    ["A hat-trick of wickets is taken in which sport?", "Cricket", "Golf", "Swimming", "Showjumping"],
    ["The Tour de France lasts about how many weeks?", "Three", "One day only", "A year", "Six months"],
    ["A slam dunk is a spectacular score in what?", "Basketball", "Tennis", "Golf", "Bowling"],
    ["Orienteering combines running with what?", "Map reading", "Weightlifting", "Diving", "Juggling"],
    ["A touchdown is worth how many points before extras?", "6", "3", "1", "7 always"],
    ["Badminton is played with a what?", "Shuttlecock", "Puck", "Quoit", "Beanbag"],
    ["A personal best is your own top what?", "Record", "Foul", "Kit", "Coach"],
  ]);

  add("Bible Quiz", [
    ["Who was the first man named in Genesis?", "Adam", "Noah", "Abel", "Seth"],
    ["Who was the first woman named in Genesis?", "Eve", "Sarah", "Ruth", "Mary"],
    ["Cain and Abel were sons of whom?", "Adam and Eve", "Noah", "Abraham", "Jacob"],
    ["God promised Abraham as many descendants as what?", "Stars", "Rivers", "Cities", "Ships"],
    ["Isaac's sons were Esau and whom?", "Jacob", "Joseph", "Judah", "Levi"],
    ["Joseph's brothers sold him into what?", "Slavery", "A choir", "A ship crew only", "A palace guard only"],
    ["Moses' sister who watched the basket was?", "Miriam", "Rachel", "Leah", "Deborah"],
    ["The Israelites crossed which sea when leaving Egypt?", "Red Sea", "Dead Sea", "Galilee", "Mediterranean"],
    ["Manna was food that appeared when?", "In the wilderness", "In Eden only", "On the ark only", "In Babylon only"],
    ["Joshua led the people into which land?", "Canaan", "Egypt", "Rome", "Greece"],
    ["Ruth stayed with which mother-in-law?", "Naomi", "Sarah", "Rebekah", "Hannah"],
    ["Samuel heard God call him as a what?", "Boy", "King already", "Soldier only", "Sailor"],
    ["Solomon was known for asking God for what?", "Wisdom", "Gold only", "Horses only", "A taller palace only"],
    ["Elijah was taken up in a what?", "Whirlwind", "Boat", "Chariot of stone", "Tower"],
    ["Esther became a queen in which empire?", "Persia", "Rome", "Egypt", "Greece"],
    ["Job is remembered for staying faithful through what?", "Suffering", "A short nap", "A feast only", "A parade"],
    ["The Psalms are mainly a book of what?", "Songs and prayers", "Laws only", "Maps", "Recipes"],
    ["Isaiah is a book of which kind of writer?", "Prophet", "Fisherman only", "Tax collector only", "Soldier only"],
    ["Daniel read writing on a what?", "Wall", "Cloud", "Leaf", "Coin only"],
    ["Jonah was sent to which city?", "Nineveh", "Jericho", "Bethlehem", "Rome"],
    ["Mary was the mother of whom?", "Jesus", "John only", "Peter", "Paul"],
    ["Joseph the carpenter lived in which town?", "Nazareth", "Rome", "Babylon", "Athens"],
    ["John the Baptist preached near which river?", "Jordan", "Nile", "Tigris", "Thames"],
    ["Jesus told a story about a good whom?", "Samaritan", "Pharaoh", "Caesar", "Giant"],
    ["The prodigal son was welcomed home by his what?", "Father", "Judge", "Soldier", "Merchant"],
    ["Jesus fed a crowd with loaves and what?", "Fish", "Olives", "Figs only", "Honey only"],
    ["Lazarus was raised in which town?", "Bethany", "Jericho", "Rome", "Tyre"],
    ["Palm Sunday remembers Jesus entering which city?", "Jerusalem", "Nazareth", "Bethlehem", "Capernaum"],
    ["Peter was a what before he followed Jesus?", "Fisherman", "Soldier", "Tax chief only", "Shepherd king"],
    ["Paul wrote many what in the New Testament?", "Letters", "Psalms only", "Maps", "Songs of Moses"],
    ["The shortest verse is often remembered as what?", "Jesus wept", "In the beginning", "Be still", "Rejoice always"],
    ["The fruit of the Spirit includes love, joy and what?", "Peace", "Gold", "Speed", "Thunder"],
    ["A parable is a story that teaches a what?", "Lesson", "Recipe", "Tax rate", "Battle plan"],
    ["Bethlehem means house of what?", "Bread", "Stone", "Kings only", "Water"],
    ["The first miracle at Cana turned water into what?", "Wine", "Oil", "Milk", "Honey"],
    ["Thomas is remembered for needing to what?", "See to believe", "Run first", "Build an ark", "Count stars"],
    ["The armour of God includes the belt of what?", "Truth", "Gold", "Silence", "Speed"],
    ["Pentecost remembers the coming of whom?", "The Holy Spirit", "Caesar", "Pharaoh", "Goliath"],
    ["Revelation is the last book of which testament?", "New", "Old only", "Neither", "A third one"],
    ["Love your neighbour as yourself is called a great what?", "Commandment", "Riddle", "Tax", "Song title only"],
  ]);

  return g;
}

function mathsBank(): Q[] {
  const out: Q[] = [];
  const push = (q: string, ans: number, extraWrong: number[] = []) => {
    const a = String(ans);
    const raw = new Set<string>([...extraWrong.map(String), String(ans + 1), String(ans - 1), String(ans + 10), String(Math.abs(ans * 2)), String(Math.max(0, ans - 10))]);
    raw.delete(a);
    const wrong = [...raw].slice(0, 3);
    while (wrong.length < 3) wrong.push(String(ans + 3 + wrong.length));
    out.push({ cat: "Maths", q, a, opts: [a, wrong[0]!, wrong[1]!, wrong[2]!] });
  };

  for (let n = 12; n <= 48; n += 2) {
    const b = 9 + (n % 13);
    push(`What is ${n} + ${b}?`, n + b);
  }
  for (let n = 20; n <= 90; n += 5) {
    const b = 8 + (n % 11);
    push(`What is ${n} − ${b}?`, n - b);
  }
  for (let n = 6; n <= 12; n++) {
    for (const m of [7, 8, 9, 12]) {
      push(`What is ${n} × ${m}?`, n * m);
    }
  }
  for (const [a, b] of [
    [84, 7],
    [96, 8],
    [72, 9],
    [144, 12],
    [81, 9],
    [56, 7],
    [63, 7],
    [108, 9],
    [132, 12],
    [45, 5],
  ] as const) {
    push(`What is ${a} ÷ ${b}?`, a / b);
  }
  for (const p of [10, 20, 25, 50, 5, 15, 40, 75]) {
    push(`What is ${p}% of 80?`, (p * 80) / 100);
    push(`What is ${p}% of 200?`, (p * 200) / 100);
  }
  push("What is 3²?", 9, [6, 8, 12]);
  push("What is 5²?", 25, [10, 20, 15]);
  push("What is 8²?", 64, [16, 32, 72]);
  push("What is 10²?", 100, [20, 110, 90]);
  push("What is 12²?", 144, [24, 120, 132]);
  push("What is √81?", 9, [8, 7, 18]);
  push("What is √49?", 7, [6, 8, 14]);
  push("What is √64?", 8, [6, 16, 32]);
  push("What is √100?", 10, [20, 50, 25]);
  push("What is 2³?", 8, [6, 9, 4]);
  push("What is 3³?", 27, [9, 18, 24]);
  push("A triangle's angles add up to how many degrees?", 180, [90, 270, 360]);
  push("A straight line is how many degrees?", 180, [90, 100, 360]);
  push("A right angle is how many degrees?", 90, [45, 60, 180]);
  push("How many sides does a hexagon have?", 6, [5, 7, 8]);
  push("How many sides does an octagon have?", 8, [6, 7, 10]);
  push("How many degrees in a full turn?", 360, [180, 90, 270]);
  push("The mean of 4, 6 and 8 is?", 6, [4, 8, 18]);
  push("The mean of 10, 20 and 30 is?", 20, [15, 30, 60]);
  push("What is 1/2 of 96?", 48, [24, 36, 72]);
  push("What is 1/4 of 80?", 20, [16, 40, 10]);
  push("What is 3/4 of 40?", 30, [20, 10, 34]);
  push("What is 2/5 of 50?", 20, [10, 25, 15]);
  push("Simplify 12/18. What is the numerator if written as a/3?", 2, [3, 4, 6]);
  push("If 3x = 21, what is x?", 7, [6, 8, 18]);
  push("If 5x = 45, what is x?", 9, [8, 7, 40]);
  push("If x + 8 = 19, what is x?", 11, [10, 12, 27]);
  push("If x − 7 = 15, what is x?", 22, [8, 21, 14]);
  push("Area of a rectangle 8 by 5?", 40, [13, 26, 35]);
  push("Area of a square with side 9?", 81, [18, 36, 72]);
  push("Perimeter of a square with side 6?", 24, [12, 18, 36]);
  push("Perimeter of a rectangle 10 by 4?", 28, [14, 40, 24]);
  push("How many minutes in 3 hours?", 180, [120, 90, 60]);
  push("How many seconds in 2 minutes?", 120, [60, 90, 180]);
  push("How many centimetres in 2.5 metres?", 250, [25, 2500, 125]);
  push("How many millimetres in 4 centimetres?", 40, [4, 400, 14]);
  push("Round 47 to the nearest ten.", 50, [40, 45, 60]);
  push("Round 142 to the nearest hundred.", 100, [140, 150, 200]);
  push("What is 15 × 11?", 165, [150, 155, 170]);
  push("What is 25 × 4?", 100, [50, 75, 80]);
  push("What is 0.5 × 18?", 9, [8, 10, 36]);
  push("What is 1.5 × 8?", 12, [9.5, 10, 16]);
  return out;
}

export const QUESTIONS: Q[] = [...CORE, ...extraBank(), ...mathsBank()];
