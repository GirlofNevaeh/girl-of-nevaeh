import type { CharacterId, SceneDef, SceneId } from "./types";

const INTRO: SceneDef = {
  id: "intro",
  title: "A love that crosses worlds",
  location: "Between Earth and Nevaeh",
  background: "/art/title.jpg",
  ambient: "title",
  skipExplore: true,
  hotspots: [],
  startNode: "open",
  nodes: {
    open: {
      id: "open",
      speaker: "Memory",
      portrait: "player",
      text: {
        nancy:
          "The kitchen clock ticked too loud after Mom died. Dad kept saying we would talk when the time was right. Tonight he sat at the table with two tickets and a look I knew. We were going to the desert she loved.",
        ronnie:
          "Sarah used to say the desert remembers what cities forget. I booked the flight because the apartment had become a shrine I was failing to keep. Nancy was fourteen and already older than I was at grief. If I could give her one true thing, it would be the land her mother studied.",
        veronika:
          "In Elysium the rivers of light stuttered. Adamus felt it too. A girl on a small blue world had closed her hands around the Grail's portable heart. The Shadow was already walking toward her in a man's shape. I braided a path between sister worlds, and I stepped.",
        sananda:
          "I left a spark in a cave so a later child would not need an army. Love first. The rest follows. Tonight the Orb is waking in a Brooklyn kitchen, and I remember why I walked Terra at all.",
        sarah:
          "I studied dust that still held a Teacher's kindness. If my daughter ever stood in that cave, I wanted the stone to know her name before the Shadow did.",
        adamus:
          "I built a universe so love would have time. A child of Earth has closed her hands around the portable heart. I will not make a cage of that gift.",
        all: "The story is already walking. You step into a heart that belongs to this house, this desert, this sky.",
      },
      next: "vow",
    },
    vow: {
      id: "vow",
      speaker: "Memory",
      portrait: "player",
      text: {
        nancy:
          "I packed her photograph. I did not pack the silence. Sass is a good coat when the weather inside you is winter. If something in that cave wanted a heart, it would have to deal with mine.",
        ronnie:
          "I cannot command wonders. I can stand between my daughter and whatever thinks it can take her. That has always been the whole of my magic.",
        veronika:
          "The Grail of Desire is not a throne. It is a wound that learned how to shine. Large acts cost emotional fire. I would spend mine on a child I had not yet held.",
        sananda:
          "Teaching is not a crown. It is sitting with a frightened heart until it remembers it can choose love. I will walk that path again if the girl needs a witness.",
        all: "The Orb will ask for intent. Protection is a kind of prayer. Control is a kind of hunger.",
      },
      next: "go",
    },
    go: {
      id: "go",
      speaker: "Memory",
      text: {
        all: "Love can cross dimensions, time, and the gap between Earth and Nevaeh. The Orb will ask for intent. The true answer is always the same.",
      },
      choices: [
        {
          text: "Begin in Brooklyn.",
          intent: "healing",
          next: "toKitchen",
        },
      ],
    },
    toKitchen: {
      id: "toKitchen",
      text: { all: "" },
      goScene: "kitchen",
    },
  },
};

const KITCHEN: SceneDef = {
  id: "kitchen",
  title: "The quiet table",
  location: "Brooklyn",
  background: "/art/kitchen.jpg",
  ambient: "earth",
  hotspots: [
    {
      id: "photo",
      label: "Family photograph",
      x: 18,
      y: 42,
      required: true,
      grantItem: "photo",
      journal: {
        id: "sarah",
        title: "Sarah",
        text: {
          all: "A photograph of Sarah, Ronnie, and Nancy in this kitchen. Grief sits in the empty chair. Love sits in the picture.",
        },
      },
      text: {
        nancy:
          "Mom's laugh is stuck in this picture like honey in a jar. I take it. If we are going to the desert she loved, she is coming too.",
        ronnie:
          "Sarah hated being photographed and loved this one. I slip it into my coat. Nancy should not have to carry every memory alone.",
        veronika:
          "Through the Orb I see a kitchen that has learned the shape of absence. The photograph is a small, stubborn light. I gather it as a key.",
      },
    },
    {
      id: "chair",
      label: "Empty chair",
      x: 62,
      y: 68,
      text: {
        nancy:
          "Her chair. Nobody sits there, not even by accident. Dad moves around it like it is a sleeping animal.",
        ronnie:
          "I almost sat in it last week. My body refused. The house has rules I did not write.",
        veronika:
          "In Nevaeh, chairs do not keep ghosts. On Earth they do. I rest a hand on the wood and feel a kindness that has nowhere to go.",
      },
    },
    {
      id: "kettle",
      label: "Kettle",
      x: 78,
      y: 48,
      text: {
        nancy:
          "The kettle still knows how she made tea. Two bags, too much honey, a joke about doctors. I leave it. Some rituals you do not pack.",
        ronnie:
          "I boiled water for no one this morning. Habit is a kind of prayer if you let it be.",
        veronika:
          "Steam. Ordinary miracle. The sister world is loud with wonders and still poorer than this.",
      },
    },
    {
      id: "backpack",
      label: "Pack by the door",
      x: 88,
      y: 72,
      text: {
        nancy:
          "Tickets. Guidebook. Too many socks. Dad packed as if the desert might steal me.",
        ronnie:
          "I packed the guidebook Sarah annotated in the margins. If the caves still listen, they will hear her handwriting.",
        veronika:
          "A bag of Earth-things: paper, cloth, fear folded small. I will need none of it, and I honour all of it.",
      },
    },
    {
      id: "window",
      label: "Kitchen window",
      x: 48,
      y: 28,
      text: {
        nancy:
          "Brooklyn does not look like a place where worlds touch. That is probably why they do.",
        ronnie:
          "The street is the same. We are not. Tomorrow we are doing nothing. I said it last week and then I booked the flight anyway.",
        veronika:
          "I hear a sentence that does not belong to me, spoken once in this room: tomorrow we are doing nothing. A vow of rest that grief could not keep.",
      },
    },
  ],
  startNode: "afterLook",
  nodes: {
    afterLook: {
      id: "afterLook",
      speaker: "Memory",
      portrait: "player",
      text: {
        nancy:
          "Dad is waiting with the kind of smile that is trying. I can be kind without putting the armour down. I can also be sharp. Both are true.",
        ronnie:
          "Nancy stands in the doorway like Sarah used to, already halfway gone into the next true thing. I have one night to be her father in this kitchen.",
        veronika:
          "The vision steadies. The girl will find the Orb. The father will bleed for her. I must arrive not as a goddess, but as a witness who can open a door.",
      },
      choices: [
        {
          text: {
            nancy: "Tell him it is okay to be scared too.",
            ronnie: "Tell her tomorrow we are doing nothing. Then tell the truth.",
            veronika: "Hold the vision gently, without taking their grief.",
          },
          intent: "healing",
          next: "kind",
          journal: {
            id: "kitchen-vow",
            title: "The kitchen vow",
            text: {
              nancy:
                "I let Dad be a person, not a project. We will go to Israel. We will not pretend we are fine.",
              ronnie:
                "I told her tomorrow we are doing nothing, and then I admitted we were going anyway. Honesty is the last furniture in this house.",
              veronika:
                "I did not steal their sorrow to make a prettier light. Guidance is not possession.",
            },
          },
        },
        {
          text: {
            nancy: "Joke until the room feels less like a funeral.",
            ronnie: "Talk about the itinerary. Facts are safer than feelings.",
            veronika: "Search the vision for the Shadow before it reaches them.",
          },
          intent: "fear",
          next: "armour",
        },
        {
          text: {
            nancy: "Promise you will fix what death broke.",
            ronnie: "Promise her you will never let anything take her.",
            veronika: "Decide you will steer their path, for their own good.",
          },
          intent: "control",
          next: "grip",
        },
      ],
    },
    kind: {
      id: "kind",
      speaker: "Memory",
      text: {
        nancy:
          "He laughs, a real one. It sounds like a plate being put back on the shelf. We turn off the light. The empty chair keeps the room.",
        ronnie:
          "She rolls her eyes, which is how she says thank you. I tell her tomorrow we are doing nothing, and she says, 'Liar. Pack the photo.' We go.",
        veronika:
          "The kitchen dims. A gold thread remains, thin as a hair, running from a photograph toward a cave I have seen in older dreams.",
      },
      next: "toCave",
    },
    armour: {
      id: "armour",
      speaker: "Memory",
      text: {
        all: "The room accepts the armour. It has worn worse. Still, something in the photograph looks away, as if love would rather be spoken than managed.",
      },
      next: "toCave",
    },
    grip: {
      id: "grip",
      speaker: "Memory",
      text: {
        all: "Promises that sound like locks click shut in the air. The kettle cools. The street keeps being a street. You lock the door anyway.",
      },
      next: "toCave",
    },
    toCave: {
      id: "toCave",
      text: { all: "" },
      goScene: "cave",
    },
  },
};

const CAVE: SceneDef = {
  id: "cave",
  title: "The cave that remembers",
  location: "Qumran",
  background: "/art/cave.jpg",
  ambient: "cave",
  hotspots: [
    {
      id: "alcove",
      label: "Golden alcove",
      x: 52,
      y: 58,
      required: true,
      text: {
        nancy:
          "It is not treasure. It is a heartbeat you can see. The Orb sits in the stone as if the cave grew it. When I step closer, the gold leans toward me.",
        ronnie:
          "Nancy has already seen it. I see a sphere of gold no catalogue would dare list. My training wants provenance. My hands want to put her behind me.",
        veronika:
          "There. The portable heart of the Grail of Desire. It has waited in limestone like a seed. It will not open for hunger. It will open for intent.",
      },
    },
    {
      id: "inscription",
      label: "Carved wall",
      x: 22,
      y: 46,
      grantItem: "guidebook",
      journal: {
        id: "sisters",
        title: "Sister worlds",
        text: {
          all: "A line in the stone, older than the ink in Sarah's guidebook: two worlds, one wound, one wish that must not be a throne.",
        },
      },
      text: {
        nancy:
          "Dad's guidebook matches the marks. Mom starred this page. She wrote: not a weapon. a well.",
        ronnie:
          "Sarah's margin in the guidebook: 'If the Grail had a portable heart, it would hide where scholarship looks past wonder.' She was here first, in a way.",
        veronika:
          "The inscription is a courtesy from an older age. Earth and Nevaeh were never enemies. They were a split song.",
      },
    },
    {
      id: "mouth",
      label: "Cave mouth",
      x: 84,
      y: 38,
      text: {
        nancy:
          "Sun like a blade. Three figures on the scree, too still to be tourists. I do not like how they look at the cave as if it owes them rent.",
        ronnie:
          "Men in dark coats, moving with the patience of a claim. Not archaeologists. I have seen grant committees. This is something else.",
        veronika:
          "Samael's agents. They do not yet see the Orb. They smell the change in the air, which is almost the same thing.",
      },
    },
    {
      id: "dust",
      label: "Sunlit dust",
      x: 70,
      y: 70,
      text: {
        all: "Dust floats in the shaft of sun. Ordinary, until you remember it is the desert of a people who kept words in jars so the future could drink.",
      },
    },
  ],
  startNode: "agents",
  nodes: {
    agents: {
      id: "agents",
      speaker: "The cave",
      text: {
        nancy:
          "Voices at the mouth. Not Hebrew. Not tourists. Someone says my name like they already own it. The Orb is still in the alcove. I have seconds.",
        ronnie:
          "They are coming. Nancy is too close to the gold. I can hide her, walk out first, or make a mistake that looks like courage.",
        veronika:
          "The agents enter as a weather. I can bend light, hide the child, or command the dark as if I were its queen. Only one of those is the Grail's way.",
      },
      stealth: {
        prompt: {
          nancy: "They have not seen you clearly. Move with intent, not panic.",
          ronnie: "Nancy is behind you. Choose how you keep her from their eyes.",
          veronika: "The air can be taught to forget. Or you can teach the men to obey.",
        },
        caughtNext: "caught",
        spots: [
          {
            id: "hide",
            label: {
              nancy: "Slip into the side niche",
              ronnie: "Draw Nancy into the niche and cover her",
              veronika: "Fold light until the niche is a silence",
            },
            safe: true,
            x: 28,
            y: 62,
          },
          {
            id: "talk",
            label: {
              nancy: "Walk out and talk like you belong here",
              ronnie: "Meet them at the mouth and keep Nancy unseen",
              veronika: "Calm their pulse until they pass as if in a dream",
            },
            safe: true,
            x: 82,
            y: 40,
          },
          {
            id: "force",
            label: {
              nancy: "Grab the Orb and run the scree",
              ronnie: "Order them off the site",
              veronika: "Command the dark to yield",
            },
            safe: false,
            intent: "control",
            x: 52,
            y: 56,
          },
        ],
      },
      next: "safe",
    },
    safe: {
      id: "safe",
      speaker: "Memory",
      text: {
        nancy:
          "They pass. One of them says, 'The girl is not here,' as if that were a schedule. My hands are shaking in a useful way. The Orb waits.",
        ronnie:
          "They leave with the irritation of men who almost had a story. Nancy's fingers are hooked in my sleeve. I do not mind.",
        veronika:
          "The agents go, carrying a hunger they cannot name. The Orb brightens, pleased by restraint.",
      },
      next: "orbAsk",
    },
    caught: {
      id: "caught",
      speaker: "Agent",
      portrait: "samael",
      text: {
        nancy:
          "A hand catches my sleeve. The man is polite, which is worse. 'We only want the light, little scholar.' I talk. I talk until the words are a door, and we slip through it. They will remember my face.",
        ronnie:
          "They see us. I put Nancy behind my shoulder and speak the language of permits and professors until boredom does the work of a shield. We are not safe. We are postponed.",
        veronika:
          "They see the gold in me. I soothe their fear until it sleeps. It is not kindness. It is a delay. Samael will feel the tug.",
      },
      next: "orbAsk",
    },
    orbAsk: {
      id: "orbAsk",
      speaker: "The Orb",
      text: {
        nancy:
          "The Orb lifts as if the cave exhaled. It does not speak in words. It speaks in a question that lands in the ribs: why do you reach?",
        ronnie:
          "I cannot hold it the way Nancy can. It still turns toward me, because I am standing in the shape of a father. Why do you reach?",
        veronika:
          "I know this voice. It is the Grail asking the only question it trusts. Why do you reach?",
      },
      puzzle: {
        prompt: {
          all: "The Orb will not open for hunger. Choose a selfless intent.",
        },
        hint: {
          nancy: "It leans toward you. Do not grab. Offer.",
          ronnie: "You cannot command it. You can mean well in front of it.",
          veronika: "You already know the rule. Prove you still believe it.",
        },
        refuse: {
          all: "The Orb is still. Intent is not a key you can force. Let it heal, or it will not move.",
        },
        options: [
          {
            id: "heal",
            text: {
              nancy: "Protect the people I love, even if I stay afraid.",
              ronnie: "Keep her safe. Not own her. Keep her.",
              veronika: "Open a path so they may choose healing.",
            },
            selfless: true,
            intent: "healing",
          },
          {
            id: "fear",
            text: {
              all: "Hide it so no one else can ever be hurt by it.",
            },
            selfless: false,
            intent: "fear",
          },
          {
            id: "ctrl",
            text: {
              all: "Take it so the world will finally obey.",
            },
            selfless: false,
            intent: "control",
          },
        ],
      },
      next: "orbYes",
    },
    orbYes: {
      id: "orbYes",
      speaker: "The Orb",
      text: {
        nancy:
          "Gold fills my palms without burning. It is heavy the way a secret is heavy. I hear, not in English, a command that feels like a kindness: Let it heal.",
        ronnie:
          "Nancy holds it. I put a hand under hers so she will not drop a sun. I hear it too, faintly, as if through a wall: Let it heal.",
        veronika:
          "It remembers me. It does not belong to me. Together we carry the sentence that built Nevaeh: Let it heal.",
      },
      choices: [
        {
          text: "Take the Orb and leave the cave.",
          grantItem: "orb",
          intent: "healing",
          next: "toHospital",
          journal: {
            id: "orb",
            title: "The Orb",
            text: {
              all: "The portable heart of the Grail of Desire. It answers only pure selfless intent. Large acts cost emotional fire.",
            },
          },
        },
      ],
    },
    toHospital: {
      id: "toHospital",
      text: { all: "" },
      goScene: "hospital",
    },
  },
};

const HOSPITAL: SceneDef = {
  id: "hospital",
  title: "A night of fluorescent quiet",
  location: "Hospital",
  background: "/art/hospital.jpg",
  ambient: "hospital",
  hotspots: [
    {
      id: "room",
      label: "Lit doorway",
      x: 38,
      y: 52,
      required: true,
      text: {
        nancy:
          "Dad is in there. Not dying. Not fine. A dark coat on the road, a shove that was meant for me, a fall that found him instead. I am so angry I could drink it.",
        ronnie:
          "The ceiling is a map of tiles. I counted them so Nancy would not see me frightened. She is in the doorway. That is the whole of my geography.",
        veronika:
          "Ronnie took a blow meant for his daughter. The body is an Earth-thing, stubborn and breakable. The Orb can mend it. The cost will be fire.",
      },
    },
    {
      id: "window",
      label: "Rain window",
      x: 78,
      y: 36,
      text: {
        nancy:
          "Agents in the parking lot, pretending to smoke. If I go out there with the Orb as a spear, I could scatter them. I could also become them.",
        ronnie:
          "I cannot stand yet. I can still see the lot. Men waiting for a child to make a mistake. I will not let her hunt.",
        veronika:
          "Revenge would be easy. The Orb would even glow for it, for a moment, before it went cold. That is how Samael prefers his tools: bright, then empty.",
      },
    },
    {
      id: "desk",
      label: "Night desk",
      x: 14,
      y: 58,
      text: {
        all: "A paper cup. A radio turned low. The ordinary courage of people who stay awake so others can sleep. No one here knows a grail is in a backpack.",
      },
    },
    {
      id: "shimmer",
      label: "Gold shimmer",
      x: 56,
      y: 48,
      text: {
        nancy:
          "The Orb is dimmer than in the cave. Large acts cost emotional fire. I can feel the bill waiting.",
        ronnie:
          "I cannot make it blaze. Nancy can. My part is to ask her not to spend herself like money.",
        veronika:
          "Fire is not rage. Fire is the part of love that agrees to be used up. I will spend some of mine so the girl does not have to spend all of hers.",
      },
    },
  ],
  startNode: "choiceNight",
  nodes: {
    choiceNight: {
      id: "choiceNight",
      speaker: "Memory",
      portrait: "player",
      text: {
        nancy:
          "I could take the Orb to the parking lot and make those men sorry. I could sit here and be fourteen and useless. Or I could put my hands on Dad and ask the gold to be a well, not a weapon.",
        ronnie:
          "If she goes after them, I lose her twice. If she heals me, she will be tired in a way sleep cannot fix. I still know which one I want.",
        veronika:
          "The hospital is a thin place. I can weave light into bone, or I can scour the lot clean. The Grail is listening for which kind of creator I am.",
      },
      choices: [
        {
          text: {
            nancy: "Stay. Heal him.",
            ronnie: "Ask her to heal, and to stay.",
            veronika: "Spend fire on the wound, not the hunt.",
          },
          intent: "healing",
          next: "healAsk",
        },
        {
          text: {
            nancy: "Go outside and scare them off first.",
            ronnie: "Tell her to run while you stall them.",
            veronika: "Drive the agents away with a storm of light.",
          },
          intent: "fear",
          next: "almostHunt",
        },
        {
          text: {
            nancy: "Make the Orb punish whoever did this.",
            ronnie: "Demand the Orb bind you so you cannot be taken from her.",
            veronika: "Rewrite the night until it never happened.",
          },
          intent: "control",
          next: "almostHunt",
        },
      ],
    },
    almostHunt: {
      id: "almostHunt",
      speaker: "The Orb",
      text: {
        all: "The gold goes dull, like a mouth closed on a bitter word. Hunting is a kind of hunger. The Orb will not be a spear tonight. It will be a well, or it will be nothing.",
      },
      next: "healAsk",
    },
    healAsk: {
      id: "healAsk",
      speaker: "The Orb",
      text: {
        nancy:
          "Dad's breathing is a crooked fence. The Orb warms when I stop aiming it at the window. It asks what I will spend the fire on.",
        ronnie:
          "I cannot use it as she can. I put the photograph on my chest and let her see I am not asking to be invincible. I am asking to remain.",
        veronika:
          "I lay light along the break the way one lays a song along a cracked instrument. The Orb asks me to say the purpose aloud.",
      },
      puzzle: {
        prompt: {
          all: "Healing costs fire. Name the intent.",
        },
        hint: {
          all: "The recurring command of the artefact is simple.",
        },
        refuse: {
          all: "The Orb cools. Revenge is a closed fist. Binding is a cage. It wants an open hand.",
        },
        options: [
          {
            id: "let",
            text: { all: "Let it heal." },
            selfless: true,
            intent: "healing",
          },
          {
            id: "rev",
            text: { all: "Take the ones who hurt him instead." },
            selfless: false,
            intent: "fear",
          },
          {
            id: "bind",
            text: { all: "Bind him so he can never be lost." },
            selfless: false,
            intent: "control",
          },
        ],
      },
      next: "healed",
    },
    healed: {
      id: "healed",
      speaker: {
        nancy: "Ronnie",
        ronnie: "Nancy",
        veronika: "Ronnie",
      },
      portrait: {
        nancy: "ronnie",
        ronnie: "nancy",
        veronika: "ronnie",
      },
      text: {
        nancy:
          "Color comes back into his face like dawn cheating. He says my name as if it were a place. The Orb is almost dark. I feel scooped out, and glad.",
        ronnie:
          "Nancy sways. I catch her the way she has been catching me for a year. 'You are not allowed to spend all of yourself,' I tell her. She says, 'You first.'",
        veronika:
          "The bone remembers itself. Ronnie sleeps without fear for one honest hour. I am dimmer. That is the fee, and I pay it without theatre.",
      },
      choices: [
        {
          text: "Leave before the agents return.",
          intent: "healing",
          setFlag: "healedRonnie",
          next: "toChapter",
          journal: {
            id: "fire",
            title: "Emotional fire",
            text: {
              all: "Large acts cost fire. Healing spent some of it. The photograph can rekindle what rage cannot.",
            },
          },
        },
      ],
    },
    toChapter: {
      id: "toChapter",
      text: { all: "" },
      goScene: "chapter",
    },
  },
};

const CHAPTER: SceneDef = {
  id: "chapter",
  title: "True faces",
  location: "Catskills Chapter House",
  background: "/art/chapter.jpg",
  ambient: "stone",
  hotspots: [
    {
      id: "glass",
      label: "Stained glass",
      x: 48,
      y: 28,
      text: {
        all: "Gold and dusty violet in the glass: a girl, a father, a woman of light, and a dark figure who smiles as if he invented the window.",
      },
    },
    {
      id: "lectern",
      label: "Obsidian glasses",
      x: 70,
      y: 58,
      required: true,
      grantItem: "glasses",
      journal: {
        id: "glasses",
        title: "Obsidian glasses",
        text: {
          all: "Volcanic glass. They do not make the Shadow uglier. They make him exact.",
        },
      },
      text: {
        nancy:
          "Black glasses on the lectern, cold as a well. When I lift them, the candle flames look honest.",
        ronnie:
          "A note in a scholar's hand: wear these when the charming man arrives. I know that handwriting. It is a cousin of Sarah's care.",
        veronika:
          "Obsidian from a Nevaeh peak that no longer stands. They show the true face, which is not horns. It is patience.",
      },
    },
    {
      id: "books",
      label: "Old books",
      x: 22,
      y: 62,
      text: {
        nancy:
          "Someone underlined a sentence until the paper bruised: the Orb answers only pure intent.",
        ronnie:
          "Histories of a cup that was never only a cup. I find Sarah cited in a footnote. Of course I do.",
        veronika:
          "The Chapter kept the rule even when they forgot the world it came from. Good. Rules can be a kindness.",
      },
    },
    {
      id: "door",
      label: "Shadowed door",
      x: 88,
      y: 48,
      text: {
        all: "A draft like a person thinking. He is already in the house. He is too polite to knock.",
      },
    },
  ],
  startNode: "samaelIn",
  nodes: {
    samaelIn: {
      id: "samaelIn",
      speaker: "Samael",
      portrait: "samael",
      text: {
        all: "He enters as if invited. Black hair, brown eyes, a coat that cost more than mercy. He looks at the Orb the way some men look at a map of a country they intend to rename.",
      },
      next: "offer",
    },
    offer: {
      id: "offer",
      speaker: "Samael",
      portrait: "samael",
      text: {
        all: "You think the Orb is a lamp. It is a throne. I have spent ages teaching your kind to want little knives instead of one another. Division is a craft. I am very good at my craft. Give it to me, and I will make both worlds simple.",
      },
      choices: [
        {
          text: {
            nancy: "Put on the glasses and look at him.",
            ronnie: "Put the glasses on Nancy, then look yourself.",
            veronika: "Wear the glasses. Show her what patience looks like when it hunts.",
          },
          intent: "healing",
          next: "trueFace",
        },
        {
          text: "Ask what simple means.",
          intent: "fear",
          next: "simple",
        },
        {
          text: "Offer a bargain. You will share, not surrender.",
          intent: "control",
          next: "bargain",
        },
      ],
    },
    simple: {
      id: "simple",
      speaker: "Samael",
      portrait: "samael",
      text: {
        all: "Simple means no more grief with nowhere to go. No more kitchens with empty chairs. I can edit the ache out of you. You will be very easy to keep.",
      },
      next: "trueFace",
    },
    bargain: {
      id: "bargain",
      speaker: "Samael",
      portrait: "samael",
      text: {
        all: "Share? I invented the feeling that sharing is the same as owning. Sit. We will write a treaty that only I can read.",
      },
      next: "trueFace",
    },
    trueFace: {
      id: "trueFace",
      speaker: "Samael",
      portrait: "samael",
      text: {
        nancy:
          "The glasses make him exact. Not uglier. Clearer. Behind the smile is a long corridor of rooms where people learned to mistrust their own tenderness. He is not a cartoon. He is a profession.",
        ronnie:
          "I have debated clever men. This is not debate. This is a hunter explaining the weather. The glasses keep me from liking his voice more than I should.",
        veronika:
          "I have known him since the split of the song. He believes creation is a kind of capture. He is wrong, and he is old enough that being wrong feels like a philosophy.",
      },
      choices: [
        {
          text: {
            nancy: "Tell him the Orb is not a throne.",
            ronnie: "Stand between him and Nancy and say no.",
            veronika: "Name his craft without preaching, then refuse.",
          },
          intent: "healing",
          next: "refuseS",
          journal: {
            id: "rule",
            title: "The rule",
            text: {
              all: "The Orb answers only pure intent. Samael wants it as a throne over sister worlds. He is patient. He is not owed a yes.",
            },
          },
        },
        {
          text: "Keep him talking while you back toward the door.",
          intent: "fear",
          next: "refuseS",
        },
        {
          text: "Let him think you might agree.",
          intent: "control",
          next: "refuseS",
        },
      ],
    },
    refuseS: {
      id: "refuseS",
      speaker: "Samael",
      portrait: "samael",
      text: {
        all: "He is not angry. Anger would be a gift. He looks almost fond. 'Then take your little well to the bridge,' he says. 'I built tools that will be waiting in your pockets when you arrive. You already know their names.' He leaves the way weather leaves.",
      },
      next: "rekindle",
    },
    rekindle: {
      id: "rekindle",
      speaker: "Memory",
      portrait: "player",
      text: {
        nancy:
          "The Orb is a coal. I hold the photograph to it, which is a stupid idea except that it works. Mom's kitchen light gets into the gold. Fire comes back as memory, not as rage.",
        ronnie:
          "I cannot stoke it. I can hold the photograph while Nancy does. That is a kind of scholarship too.",
        veronika:
          "I teach the Orb the kitchen. It drinks the ordinary lamp and brightens. Emotional fire prefers truth to spectacle.",
      },
      choices: [
        {
          text: "Go to the bridge between worlds.",
          intent: "healing",
          next: "toBridge",
        },
      ],
    },
    toBridge: {
      id: "toBridge",
      text: { all: "" },
      goScene: "bridge",
    },
  },
};

const BRIDGE: SceneDef = {
  id: "bridge",
  title: "A door made of light",
  location: "The bridge",
  background: "/art/bridge.jpg",
  ambient: "bridge",
  hotspots: [
    {
      id: "orbspan",
      label: "The Orb at center",
      x: 50,
      y: 46,
      required: true,
      text: {
        nancy:
          "If I push, the span shakes. If I ask, it steadies. I am beginning to understand the difference, which is annoying, because it means Dad was right about something.",
        ronnie:
          "The inscriptions along the rail match Sarah's notes and the cave wall. Two worlds, one wound. I read them aloud so Nancy does not have to hold every meaning.",
        veronika:
          "This is my craft. Light-weaving. Not a storm. A sentence you can walk on. The Orb will finish what I start if the intent stays clean.",
      },
    },
    {
      id: "earthside",
      label: "Earth night",
      x: 16,
      y: 58,
      text: {
        all: "Behind you, Brooklyn is a handful of windows. The empty chair is still empty. That does not make the bridge a betrayal of it.",
      },
    },
    {
      id: "nevaehside",
      label: "Violet sky",
      x: 84,
      y: 40,
      text: {
        all: "Ahead, purple clouds and a silver horizon. Nevaeh is not heaven as a prize. It is a sister who learned how to grow light.",
      },
    },
    {
      id: "storm",
      label: "The shake",
      x: 62,
      y: 22,
      text: {
        nancy:
          "The span complains when I think of locking it behind us. It likes open hands.",
        ronnie:
          "A historical door that refuses to be a checkpoint. I can respect that.",
        veronika:
          "Samael is leaning on the far weather. I can calm it if I do not try to own the sky.",
      },
    },
  ],
  startNode: "weave",
  nodes: {
    weave: {
      id: "weave",
      speaker: "The Orb",
      text: {
        nancy:
          "The bridge wants a reason to exist. I could open it just for us. I could declare myself its keeper. Or I could open it the way you open a window in a stuffy kitchen.",
        ronnie:
          "I cannot weave light. I can name the inscription correctly, which is a father's version of a spell: sister worlds, not spoils.",
        veronika:
          "I set the warp. Nancy's intent will be the weft, even if I am the one walking. The Orb asks how the door should be born.",
      },
      puzzle: {
        prompt: {
          all: "Sister worlds remember a door. How do you open it?",
        },
        hint: {
          all: "Empty hands. A wish for both. Not a lock, and not a deed of ownership.",
        },
        refuse: {
          all: "The span thins to a thread. Fear makes a lock. Control makes a leash. The door wants neither.",
        },
        options: [
          {
            id: "both",
            text: { all: "Open it for both worlds, with empty hands." },
            selfless: true,
            intent: "healing",
          },
          {
            id: "lock",
            text: { all: "Open it only for us, then lock it forever." },
            selfless: false,
            intent: "fear",
          },
          {
            id: "own",
            text: { all: "Open it as owner and name the rules." },
            selfless: false,
            intent: "control",
          },
        ],
      },
      next: "openBridge",
    },
    openBridge: {
      id: "openBridge",
      speaker: "Memory",
      text: {
        nancy:
          "The light thickens into a path you could skip on. I do not skip. I walk, because Dad is beside me and some joys should be adult-sized.",
        ronnie:
          "We cross. I keep a hand near her backpack strap, a habit from subway platforms. The stars do not mind.",
        veronika:
          "The path holds. I feel Adamus on the far side like a warm room. I feel Samael like a draft under a door. Both can be true.",
      },
      choices: [
        {
          text: "Enter Lumora Valley.",
          intent: "healing",
          next: "toValley",
          journal: {
            id: "bridge",
            title: "The bridge",
            text: {
              all: "A door of light between Earth and Nevaeh. It opened for empty hands.",
            },
          },
        },
      ],
    },
    toValley: {
      id: "toValley",
      text: { all: "" },
      goScene: "valley",
    },
  },
};

const VALLEY: SceneDef = {
  id: "valley",
  title: "Lumora Valley",
  location: "Nevaeh",
  background: "/art/valley.jpg",
  ambient: "nevaeh",
  hotspots: [
    {
      id: "gardens",
      label: "Bioluminescent gardens",
      x: 28,
      y: 70,
      text: {
        all: "Plants that learned to keep their own dusk. Gold and teal, never shouting. Healing looks like this when it has somewhere to live.",
      },
    },
    {
      id: "river",
      label: "River of light",
      x: 70,
      y: 62,
      required: true,
      text: {
        nancy:
          "If Mom could see this she would make a joke about Brooklyn water quality and then she would cry, and I would let her.",
        ronnie:
          "Sarah should have stood here. I do not try to haul her out of death. I let the river be a place I can remember her without drowning.",
        veronika:
          "This river is older than my marriage and younger than the first kindness. It will carry whatever you pour into it. Be careful what you call a gift.",
      },
    },
    {
      id: "peaks",
      label: "Crystalline peaks",
      x: 78,
      y: 28,
      text: {
        all: "Peaks like frozen music. Purple clouds move as if they have somewhere gentle to be.",
      },
    },
    {
      id: "figures",
      label: "Waiting figures",
      x: 48,
      y: 52,
      text: {
        nancy:
          "A woman who looks like she already knows my name without stealing it. A man of silver-gold quiet. And, farther back, a dark coat that did not learn how to rest.",
        ronnie:
          "I put myself where a father belongs: not in front of wonder, beside it.",
        veronika:
          "Adamus. And the child. And the man who taught Earth to prefer noise to reunion. The valley is wide enough for a choice.",
      },
    },
  ],
  startNode: "reunion",
  nodes: {
    reunion: {
      id: "reunion",
      speaker: "Veronika",
      portrait: "veronika",
      text: {
        nancy:
          "She does not bow, which I like. 'You carried it without making it a leash,' she says. 'That is rarer than gold.' I tell her my mother died, because it is the true news. She does not try to fix the sentence.",
        ronnie:
          "The woman of Nevaeh looks at Nancy the way Sarah looked at a new book: respect first, wonder second. I decide I can live with miracles if they have manners.",
        veronika:
          "The girl is smaller than the story, which is how you know the story is true. Adamus waits. I do not rush the Earth-people into our light. They must still choose.",
      },
      next: "adamus",
    },
    adamus: {
      id: "adamus",
      speaker: "Adamus",
      portrait: "adamus",
      text: {
        all: "He does not take the Orb. He looks at it the way one looks at a sleeping child. 'The Grail's purpose was never to perfect you against your will,' he says. 'It was to make a place where love could recover.'",
      },
      next: "samaelLast",
    },
    samaelLast: {
      id: "samaelLast",
      speaker: "Samael",
      portrait: "samael",
      text: {
        all: "He stands at the edge of the gardens, almost courteous. 'You can hide it. You can rule with it. Or you can waste it on healing, which never stays finished. I am patient. Worlds get tired. I do not.'",
      },
      next: "final",
    },
    final: {
      id: "final",
      speaker: "The Orb",
      portrait: "player",
      text: {
        nancy:
          "The Orb is warm enough to be a small animal. Dad's hand is on my shoulder. Veronika does not reach. This is mine to say, and that is not the same as mine to own.",
        ronnie:
          "I cannot choose for her. I can be the kind of man who makes room for the right choice. My power was never the gold.",
        veronika:
          "I could take it and be a very beautiful tyrant. I remember the cost of creation. I leave the last word to the ones who still have kitchens to return to.",
      },
      choices: [
        {
          text: "Let it heal. Light for both worlds, owned by no one.",
          intent: "healing",
          next: "endHeal",
        },
        {
          text: "Hide the Orb. Safety is a closed door.",
          intent: "fear",
          next: "endFear",
        },
        {
          text: "Command the Orb. Worlds will finally obey.",
          intent: "control",
          next: "endControl",
        },
      ],
    },
    endHeal: {
      id: "endHeal",
      text: { all: "" },
      ending: "healing",
    },
    endFear: {
      id: "endFear",
      text: { all: "" },
      ending: "fear",
    },
    endControl: {
      id: "endControl",
      text: { all: "" },
      ending: "control",
    },
  },
};

const EPILOGUE: SceneDef = {
  id: "epilogue",
  title: "A quieter Earth",
  location: "Brooklyn",
  background: "/art/epilogue.jpg",
  ambient: "earth",
  skipExplore: true,
  hotspots: [],
  startNode: "close",
  nodes: {
    close: {
      id: "close",
      speaker: "Epilogue",
      portrait: "player",
      text: {
        all: "",
      },
      next: "last",
    },
    last: {
      id: "last",
      speaker: "Memory",
      text: {
        all: "",
      },
      choices: [
        {
          text: "See the credits.",
          next: "credits",
        },
      ],
    },
    credits: {
      id: "credits",
      text: { all: "" },
    },
  },
};

export const SCENES: Record<SceneId, SceneDef> = {
  intro: INTRO,
  kitchen: KITCHEN,
  cave: CAVE,
  hospital: HOSPITAL,
  chapter: CHAPTER,
  bridge: BRIDGE,
  valley: VALLEY,
  epilogue: EPILOGUE,
};

export const SCENE_ORDER: SceneId[] = [
  "intro",
  "kitchen",
  "cave",
  "hospital",
  "chapter",
  "bridge",
  "valley",
  "epilogue",
];

export const ENDINGS: Record<
  "healing" | "fear" | "control",
  { title: string; lines: Partial<Record<CharacterId | "all", string>> }
> = {
  healing: {
    title: "Let it heal",
    lines: {
      nancy:
        "Brooklyn is still Brooklyn. The chair is still empty. The sky, though, keeps a thin bridge of gold-violet that does not close. I put the photograph back on the fridge. Dad makes tea the wrong way, on purpose, so I can correct him. Somewhere above the water towers, Nevaeh is not a prize. It is a sister. I am fourteen, and I am not in charge of worlds. I am in charge of being kind when it would be easier to be sharp. That turns out to be enough.",
      ronnie:
        "I did not bring Sarah back. I brought Nancy home with a sky that remembers we were brave without becoming kings. The Chapter House sent a letter I will never publish. The Orb sleeps in no one's pocket. Some nights I look at the bridge of light and feel the old fear, and then I set another place at the table anyway.",
      veronika:
        "Adamus takes my dim hands and does not ask me to be a monument. The Grail remains a well. Earth keeps its kitchens. Nevaeh keeps its river. The Shadow is not gone. He is simply unmatched by a girl who chose healing when a throne was free. I visit the bridge when the purple clouds run south. Love, it turns out, can commute.",
      sananda:
        "The Spark did not need an army. A child chose healing. That is the whole lesson I ever wanted to leave in a cave.",
      all: "The bridge stays thin and kind. No one owns the sky.",
    },
  },
  fear: {
    title: "A closed door",
    lines: {
      nancy:
        "We hid it. The kitchen is locked. The sky is only sky. No agents come. No gold either. Dad is alive. I am safe in the way a drawer is safe. I keep the photograph face down for a while, because looking at it feels like a door I refused. Safety is not nothing. It is also not the whole of love.",
      ronnie:
        "I chose the lock. A father is allowed to want walls. Nancy sleeps. The window shows no bridge. I tell myself this is protection, and some days I believe it. On others I hear Sarah in the kettle and wonder what we put in the ground besides danger.",
      veronika:
        "They hid the heart. I do not blame them. Fear is a kind of love that has nowhere to go. The river in Lumora runs quieter. The Shadow smiles with the patience of weather. I keep a path open anyway, in case they ever want a window more than a wall.",
    },
  },
  control: {
    title: "A shining table, empty",
    lines: {
      nancy:
        "Both worlds shine on command. People are very polite. The Orb is a sun I have to keep feeding with my own fire. Dad sits at a table that looks perfect and sounds like nobody. I wanted never to lose anyone again. I learned that a leash can look like gold from far away.",
      ronnie:
        "I asked the Orb to make loss illegal. It obliged, in the way a clever machine obliges. Nancy is near me always, and somehow farther. Nevaeh's clouds move when I tell them. I do not tell them often. Command is lonely even when it works.",
      veronika:
        "I knew the cost of creation and I paid it as a ruler pays: with other people's ease. The gardens are obedient. Adamus looks at me as one looks at a beautiful mistake. Samael, from a distance, nods, as if a student has understood the lecture. I did not want to be his student.",
    },
  },
};
