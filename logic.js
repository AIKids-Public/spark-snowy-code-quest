/* Spark's Snowy Code Quest — game data + pure logic (no DOM).
   Map key:  S start   G sleigh (goal)   P present   T tree   M snowman   I ice   . snow */

const TIERS = {
  young: {
    id: 'young', name: 'Snowflake Explorers', ages: '4–8', emoji: '❄️',
    editor: 'arrows', speed: 380, simple: true,
    blurb: 'Tap the arrows. Help Spark move!',
    missions: [
      {
        title: 'Snowy Presents',
        story: 'The wind blew the presents away! 🌬️🎁 Help Spark find them. Then go to the sleigh. 🛷',
        map: [
          '.......',
          '.T...T.',
          '.......',
          'S.P.P.G',
          '.......',
          '.T...T.',
          '.......',
        ],
        par: 6,
        hint: 'Go right ➡️. Count the squares!',
        prompt: {
          kind: 'fog',
          question: 'It is too snowy to see! What should Spark say?',
          options: [
            { text: 'Frosty, please stop the snow so I can see.', emoji: '🙏', good: true,
              feedback: 'Yes! You said please. You said what you need. Great job! 🌟' },
            { text: 'Snow!', emoji: '❄️', good: false,
              feedback: 'Hmm. What do you want me to do? Tell me the job.' },
            { text: 'Do it now!', emoji: '😠', good: false,
              feedback: 'Do what? Say what you need. Say please too!' },
          ],
        },
      },
      {
        title: 'Lights Out!',
        story: 'The lights went out! 💡 Two presents are hiding. Go round the tree to get them. 🎄',
        map: [
          '.......',
          '.S..P..',
          '....T..',
          '.....P.',
          '.M.....',
          '.....G.',
          '.......',
        ],
        par: 8,
        hint: 'Go right ➡️ to the gift. Then go down ⬇️. Miss the tree!',
        prompt: {
          kind: 'dark',
          question: 'It is too dark! What should Spark say?',
          options: [
            { text: 'Frosty, please turn on the lights so I can see.', emoji: '💡', good: true,
              feedback: 'Yes! Kind and clear. Super! 🌟' },
            { text: 'Make it better.', emoji: '🤷', good: false,
              feedback: 'Better how? Tell me what you need.' },
            { text: 'Lights lights lights!', emoji: '🔦', good: false,
              feedback: 'Saying it lots does not help. Say it once, nicely.' },
          ],
        },
      },
      {
        title: 'The Ice Wall',
        story: 'A big ice wall is in the way! 🧊 Spark needs a magic power to get past.',
        map: [
          '.......',
          '.S.P...',
          'TTTTITT',
          '....P..',
          '....G..',
          '..M....',
          '.......',
        ],
        par: 7,
        hint: 'Go right ➡️. Stop on top of the ice. Tap ✨ Melt. Then go down ⬇️.',
        prompt: {
          kind: 'melt',
          question: 'Ice is in the way! What should Spark say?',
          options: [
            { text: 'Frosty, please help me melt the ice.', emoji: '🔥', good: true,
              feedback: 'Yes! You said what you need. Well done! 🌟' },
            { text: 'Ice.', emoji: '🧊', good: false,
              feedback: 'Ice? What should I do? Tell me the job.' },
            { text: 'Smash it all!', emoji: '💥', good: false,
              feedback: 'Oh no! That could break the toys. Ask for just what you need.' },
          ],
        },
      },
      {
        title: 'The Reindeer Barn',
        story: 'It is night at the reindeer barn! 🦌🌙 A row of trees is in the way. Go round them.',
        map: [
          '.......',
          '.S.T.G.',
          '...T...',
          '.P.T...',
          '...T.P.',
          '.M.....',
          '.......',
        ],
        par: 12,
        hint: 'Go down ⬇️ under the trees. Go right ➡️. Then go up ⬆️.',
        prompt: {
          kind: 'dark',
          question: 'It is too dark! What should Spark say?',
          options: [
            { text: 'Frosty, please light up the barn so I can find the gifts.', emoji: '🏮', good: true,
              feedback: 'Yes! Clear and kind. You are a star! 🌟' },
            { text: 'I can\'t see.', emoji: '😟', good: false,
              feedback: 'Oh dear! But what should I do? Ask me for the job.' },
            { text: 'Make it day forever!', emoji: '☀️', good: false,
              feedback: 'Forever? The reindeer need to sleep! Ask for just what you need.' },
          ],
        },
      },
      {
        title: 'The Icy River',
        story: 'The presents are on the icy river! 🧊🎁 Melt the ice to get them.',
        map: [
          '.......',
          '.M...M.',
          'TTTTTTT',
          'S.PIP.I',
          'TTTTTT.',
          '.M....G',
          '.......',
        ],
        par: 10,
        hint: 'Walk to the ice. Tap ✨ Melt. Do it again! Then go down ⬇️ to the sleigh.',
        prompt: {
          kind: 'melt',
          question: 'Ice is in the way! What should Spark say?',
          options: [
            { text: 'Frosty, please help me melt the ice.', emoji: '🔥', good: true,
              feedback: 'Yes! Clear and kind. Great job! 🌟' },
            { text: 'Melt the whole river!', emoji: '🌊', good: false,
              feedback: 'Splash! The gifts would sink! Ask for just a little.' },
            { text: 'Ummm…', emoji: '🤔', good: false,
              feedback: 'I am listening! Tell me what you need.' },
          ],
        },
      },
    ],
  },

  middle: {
    id: 'middle', name: 'Reindeer Coders', ages: '9–12', emoji: '🦌',
    editor: 'blocks', speed: 240,
    blurb: 'Build programs with steps and 🔁 Repeat blocks.',
    missions: [
      {
        title: 'The Present Staircase',
        story: 'Rudolph dropped presents down the snowy hill in a perfect staircase. Collect every one — can you spot the pattern?',
        map: [
          'S.....M.',
          '.P......',
          'T.P.....',
          '...P..T.',
          '....P...',
          '.T...P..',
          '......P.',
          'M......G',
        ],
        par: 3,
        hint: 'Right 1, down 1, right 1, down 1… that\'s a pattern! Put it inside a 🔁 Repeat.',
        prompt: {
          kind: 'fog',
          question: 'A blizzard covers the hill. Build a prompt to ask me for help.',
          rows: [
            { label: 'Who are you asking?', chips: [
              { text: 'Frosty,', good: true },
              { text: 'Hey you,', good: false, feedback: 'Name who you\'re asking. Being clear starts with WHO.' },
              { text: 'Computer thing,', good: false, feedback: 'Use the helper\'s name — it\'s clearer (and friendlier).' },
            ]},
            { label: 'What do you need?', chips: [
              { text: 'please clear the blizzard', good: true },
              { text: 'do something', good: false, feedback: '"Do something" is too vague. What exactly should happen?' },
              { text: 'fix it', good: false, feedback: 'Fix what? AI helpers can\'t guess — say the exact job.' },
            ]},
            { label: 'Why? (context)', chips: [
              { text: 'so I can see where every present is.', good: true },
              { text: 'now or else!', good: false, feedback: 'That\'s bossy and gives me no useful information.' },
              { text: 'whatever.', good: false, feedback: 'Giving a reason helps me give a better answer.' },
            ]},
          ],
        },
      },
      {
        title: 'Snake Lanes',
        story: 'The toy factory conveyor belts zig-zag across the floor. Three presents fell off! Follow the lanes to the sleigh.',
        map: [
          'S......P',
          'TTTTTT..',
          'P.......',
          '..TTTTTT',
          '.......P',
          'TTTTTT..',
          'G.......',
          '...M....',
        ],
        par: 5,
        hint: 'Across, down, back, down… One 🔁 Repeat can do two lanes at a time!',
        prompt: {
          kind: 'dark',
          question: 'The northern lights faded and the factory is dark. Build a prompt for me.',
          rows: [
            { label: 'Who are you asking?', chips: [
              { text: 'Frosty,', good: true },
              { text: 'Oi,', good: false, feedback: 'A bit rude! Start by naming who you\'re asking.' },
              { text: 'Robot,', good: false, feedback: 'Close — but use my name so it\'s clear who should help.' },
            ]},
            { label: 'What do you need?', chips: [
              { text: 'please light up the factory lanes', good: true },
              { text: 'make it nice', good: false, feedback: '"Nice" means different things to different people. Be specific!' },
              { text: 'turn on everything in the world', good: false, feedback: 'Way too big! Ask only for what you need.' },
            ]},
            { label: 'Why? (context)', chips: [
              { text: 'so I can plan my route to the sleigh.', good: true },
              { text: 'because.', good: false, feedback: '"Because" isn\'t a reason! Tell me your goal.' },
              { text: 'hurry up!', good: false, feedback: 'Rushing me doesn\'t help. Share your goal instead.' },
            ]},
          ],
        },
      },
      {
        title: 'The Frozen Chimney',
        story: 'Santa\'s chimney path is frozen solid, with presents stuck between the ice. Spark needs a new command to get down!',
        map: [
          '...S....',
          'TTTITTTT',
          '...P....',
          'TTTITTTT',
          '...P....',
          'TTTITTTT',
          '...P....',
          'M..G..M.',
        ],
        par: 4,
        hint: 'Melt, then down 2. Then do it again… and again! (Repeat helps.)',
        prompt: {
          kind: 'melt',
          question: 'The chimney is full of ice. Build a prompt asking me for a new command.',
          rows: [
            { label: 'Who are you asking?', chips: [
              { text: 'Frosty,', good: true },
              { text: 'Hey,', good: false, feedback: 'Who are you talking to? Start with my name.' },
              { text: 'Whoever,', good: false, feedback: 'If you don\'t say who, nobody knows it\'s their job!' },
            ]},
            { label: 'What do you need?', chips: [
              { text: 'please give me a melt command', good: true },
              { text: 'destroy the ice and the trees', good: false, feedback: 'Careful! The trees are fine. Ask only for what\'s needed.' },
              { text: 'help', good: false, feedback: 'Help with what? Name the exact thing you need.' },
            ]},
            { label: 'Any limits? (keep it safe)', chips: [
              { text: 'that melts only the ice next to me.', good: true },
              { text: 'so it looks cool.', good: false, feedback: 'Looking cool isn\'t a goal! Limits keep AI tools safe.' },
              { text: 'lol.', good: false, feedback: 'That doesn\'t tell me anything useful.' },
            ]},
          ],
        },
      },
      {
        title: 'Bell Tower Bounce',
        story: 'The jingle bells are stuck on top of the bell towers, and two more presents are on the ground! Bounce up and down the towers to collect them all.',
        map: [
          '.........',
          '..M...M..',
          '.........',
          '.P.T.P.T.',
          '.T.T.T.T.',
          '.T.T.T.T.',
          'ST.P.T.PG',
          '.........',
          '...M.....',
        ],
        par: 5,
        hint: 'Up 3, right 2, down 3, right 2… then the same again! Put those 4 blocks inside a 🔁 Repeat.',
        prompt: {
          kind: 'dark',
          question: 'A snow cloud is covering the moon and the towers are dark. Build a prompt to ask me for help.',
          rows: [
            { label: 'Who are you asking?', chips: [
              { text: 'Frosty,', good: true },
              { text: 'Somebody,', good: false, feedback: 'If you ask "somebody", nobody knows it\'s their job! Name who you\'re asking.' },
              { text: 'Yo,', good: false, feedback: 'Start by naming who you\'re talking to.' },
            ]},
            { label: 'What do you need?', chips: [
              { text: 'please light up the bell towers', good: true },
              { text: 'make it less dark or something', good: false, feedback: '"Or something" means you\'re not sure. Be specific about what you need!' },
              { text: 'ring all the bells really loud', good: false, feedback: 'That would be noisy — and it won\'t help you see! Ask for what solves the problem.' },
            ]},
            { label: 'Why? (context)', chips: [
              { text: 'so I can find all the presents.', good: true },
              { text: 'just because.', good: false, feedback: 'Telling me your goal helps me give you the best help.' },
              { text: 'I\'m bored.', good: false, feedback: 'That doesn\'t tell me what you\'re trying to do!' },
            ]},
          ],
        },
      },
      {
        title: 'The Gingerbread Steps',
        story: 'The path to the gingerbread house is a staircase blocked by icy steps. Four presents are waiting along the way!',
        map: [
          'SIP.T...',
          'TTTIT.M.',
          '...PT...',
          '.T..IP.T',
          '.T.TTTI.',
          '.M...TP.',
          '.....TG.',
          '........',
        ],
        par: 5,
        hint: 'Melt, right 3, melt, down 3… and that happens twice. What block makes things happen twice?',
        prompt: {
          kind: 'melt',
          question: 'The gingerbread steps are frozen. Build a prompt to ask me for a melt command.',
          rows: [
            { label: 'Who are you asking?', chips: [
              { text: 'Frosty,', good: true },
              { text: 'Hey thing,', good: false, feedback: 'Use the helper\'s name — it\'s clearer and kinder.' },
              { text: 'Anyone,', good: false, feedback: 'Name who you\'re asking so they know it\'s their job.' },
            ]},
            { label: 'What do you need?', chips: [
              { text: 'please give me a melt command', good: true },
              { text: 'melt the gingerbread house', good: false, feedback: 'Oh no — that would ruin the house! Ask for exactly what you need.' },
              { text: 'stuff', good: false, feedback: '"Stuff" could mean anything. What exact thing do you need?' },
            ]},
            { label: 'Any limits? (keep it safe)', chips: [
              { text: 'that only melts ice right next to me.', good: true },
              { text: 'that melts as much as possible.', good: false, feedback: 'Too much! Good prompts set limits so nothing goes wrong.' },
              { text: 'whatever you want.', good: false, feedback: 'Giving no limits means I might do something you didn\'t expect.' },
            ]},
          ],
        },
      },
    ],
  },

  teen: {
    id: 'teen', name: 'North Star Engineers', ages: '13–16', emoji: '⭐',
    editor: 'text', speed: 160,
    blurb: 'Write real code with nested loops, and engineer your own prompts.',
    missions: [
      {
        title: 'Fog over the Hills',
        story: 'Dense fog rolled over the reindeer training hills. Three presents are hidden in the valleys and on a peak. Write the shortest program you can.',
        map: [
          'T...T...T',
          '.........',
          '..M......',
          '.........',
          'S.TTP.TTG',
          '.........',
          '..P.TTP..',
          '.........',
          'T..T..T.T',
        ],
        par: 7,
        hint: 'The hills go down-down, then up-up. Try a repeat INSIDE a repeat (nested loops).',
        prompt: {
          kind: 'fog',
          question: 'Thick fog hides the map. Write a prompt asking Frosty to help you see it.',
          taskWords: ['fog', 'clear', 'reveal', 'show', 'see', 'visib', 'lift', 'remove', 'map'],
        },
      },
      {
        title: 'The Ice Palace Gates',
        story: 'The Snow Queen\'s palace has four frozen gates, and presents tucked into alcoves above the hallway. You\'ll need to engineer a new command.',
        map: [
          '.........',
          '.M.....M.',
          '.........',
          'TTPTPTPTT',
          'SI.I.I.IG',
          'TTTTTTTTT',
          '.........',
          '..M...M..',
          '.........',
        ],
        par: 5,
        hint: 'Each gate: melt, move 2, pop up for the present, come back down. Then… repeat!',
        prompt: {
          kind: 'melt',
          question: 'The gates are frozen shut. Write a prompt asking Frosty for a "melt" command. Strong prompts explain the goal AND set limits.',
          taskWords: ['melt', 'ice', 'thaw', 'unfreeze', 'defrost', 'frozen'],
        },
      },
      {
        title: 'The Big Delivery',
        story: 'Four presents are stuck on the workshop delivery lanes, and every lane is sealed with ice. Santa leaves in 5 minutes…',
        map: [
          'S.......P',
          'TTTTTTTTI',
          'P........',
          'ITTTTTTTT',
          '........P',
          'TTTTTTTTI',
          'P........',
          'ITTTTTTTT',
          'G...M....',
        ],
        par: 7,
        hint: 'Across, melt, down, back, melt, down… then do the whole thing again.',
        prompt: {
          kind: 'melt',
          question: 'Ask Frosty for melt power — but the workshop is full of toys, so make sure your request is SAFE and specific.',
          taskWords: ['melt', 'ice', 'thaw', 'unfreeze', 'defrost', 'frozen'],
        },
      },
      {
        title: 'Northern Lights Ridge',
        story: 'The northern lights have faded over the jagged ridge. Presents are on every slope and every peak, and you can\'t see a thing.',
        map: [
          '..M...M...',
          'TTTPTTPTTP',
          '..........',
          '.P..P..P..',
          'S........G',
          '.M...M...T',
        ],
        par: 5,
        hint: 'Each slope is "right, up" three times, then a drop of down 3. That makes three mountains — so you need a loop inside a loop.',
        prompt: {
          kind: 'dark',
          question: 'The ridge is pitch black. Write a prompt asking Frosty to help you see it. Give the task, your goal, the details and some limits.',
          taskWords: ['light', 'dark', 'bright', 'illuminat', 'lamp', 'see', 'visib', 'show', 'reveal', 'glow'],
        },
      },
      {
        title: 'The Snow Queen\'s Vault',
        story: 'Final mission! The Snow Queen locked Santa\'s last presents in her ice vault: four floors of frozen gates. Engineer the most elegant program you can — Christmas depends on it!',
        map: [
          'SI.IPI.I.',
          'TTTTTTTTI',
          '.IPI.I.I.',
          'ITTTTTTTT',
          '.I.I.I.IP',
          'TTTTTTTTI',
          '.I.I.IPI.',
          'ITTTTTTTT',
          'G..M...M.',
        ],
        par: 11,
        hint: 'One floor is "melt, move 2" four times. Go right, melt down 2, go left, melt down 2 — then repeat ALL of that.',
        prompt: {
          kind: 'melt',
          question: 'The vault is solid ice — and it\'s full of precious presents. Write a SAFE, specific prompt asking Frosty for a melt command.',
          taskWords: ['melt', 'ice', 'thaw', 'unfreeze', 'defrost', 'frozen'],
        },
      },
    ],
  },
};

const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const N4 = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const key = (x, y) => x + ',' + y;

function parseMap(rows) {
  const lv = { w: rows[0].length, h: rows.length, presents: [], obst: new Map(), ice: [], start: null, goal: null };
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    const k = key(x, y);
    if (c === 'S') lv.start = { x, y };
    else if (c === 'G') { lv.goal = { x, y }; lv.goalKey = k; }
    else if (c === 'P') lv.presents.push(k);
    else if (c === 'T' || c === 'M') lv.obst.set(k, c);
    else if (c === 'I') lv.ice.push(k);
  }));
  return lv;
}

/* ---------- Program representation ----------
   tokens: {t:'move',dir,n} | {t:'melt'} | {t:'repeat',n} | {t:'end'}   (+ src index / line) */

class CodeError extends Error {
  /* key/params let the UI show the message in the player's language; msg is the English fallback */
  constructor(msg, line, key, params) { super(msg); this.line = line; this.key = key; this.params = params; }
}

function parseText(src) {
  const toks = [];
  src.split('\n').forEach((raw, i) => {
    const line = raw.replace(/(#|\/\/).*$/, '').replace(/[(),;:]/g, ' ').replace(/([{}])/g, ' $1 ');
    line.split(/\s+/).filter(Boolean).forEach(w => toks.push({ w: w.toLowerCase(), line: i + 1 }));
  });
  const out = [];
  let i = 0, depth = 0, lastLine = 1;
  const isNum = t => t && /^\d+$/.test(t.w);
  while (i < toks.length) {
    const { w, line } = toks[i];
    lastLine = line;
    if (DIRV[w]) {
      let n = 1;
      if (isNum(toks[i + 1])) { n = +toks[i + 1].w; i++; }
      if (n < 1 || n > 20) throw new CodeError(`"${w} ${n}" — use a number from 1 to 20.`, line, 'e.range', { w, n });
      out.push({ t: 'move', dir: w, n, src: line });
      i++;
    } else if (w === 'melt') {
      out.push({ t: 'melt', src: line }); i++;
    } else if (w === 'repeat') {
      if (!isNum(toks[i + 1])) throw new CodeError('repeat needs a number, like:  repeat 3 { right 1 }', line, 'e.repeatNum');
      const n = +toks[i + 1].w;
      if (n < 1 || n > 20) throw new CodeError('repeat needs a number from 1 to 20.', line, 'e.repeatRange');
      i += 2;
      if (toks[i] && toks[i].w === 'times') i++;
      if (!toks[i] || toks[i].w !== '{') throw new CodeError(`After "repeat ${n}" you need a {`, line, 'e.brace', { n });
      i++; depth++;
      out.push({ t: 'repeat', n, src: line });
    } else if (w === '}') {
      if (depth === 0) throw new CodeError('There\'s an extra } with no repeat to close.', line, 'e.extra');
      depth--; out.push({ t: 'end', src: line }); i++;
    } else if (w === '{') {
      throw new CodeError('A { must come right after "repeat N".', line, 'e.braceAfter');
    } else {
      throw new CodeError(`I don't know "${w}". Use: up, down, left, right, melt, repeat.`, line, 'e.unknown', { w });
    }
  }
  if (depth > 0) throw new CodeError('A repeat is missing its closing }', lastLine, 'e.missingClose');
  return out;
}

const MAX_ACTIONS = 600;

/* tokens -> flat list of single actions: {t:'step',dir,src} | {t:'melt',src} */
function compile(tokens) {
  let pos = 0;
  function block() {
    const acts = [];
    while (pos < tokens.length) {
      const tk = tokens[pos];
      if (tk.t === 'end') return acts;
      pos++;
      if (tk.t === 'repeat') {
        const body = block();
        if (pos >= tokens.length) throw new CodeError('A Repeat is missing its End.', tk.src, 'e.noEnd');
        pos++; // consume end
        for (let k = 0; k < tk.n; k++) {
          acts.push(...body);
          if (acts.length > MAX_ACTIONS) throw new CodeError('That program is way too long — Spark would be walking until next Christmas!', undefined, 'e.toolong');
        }
      } else if (tk.t === 'move') {
        for (let k = 0; k < tk.n; k++) acts.push({ t: 'step', dir: tk.dir, src: tk.src });
      } else if (tk.t === 'melt') {
        acts.push({ t: 'melt', src: tk.src });
      }
      if (acts.length > MAX_ACTIONS) throw new CodeError('That program is way too long!', undefined, 'e.toolong2');
    }
    return acts;
  }
  const acts = block();
  if (pos < tokens.length) throw new CodeError('There\'s an End without a Repeat.', tokens[pos].src, 'e.endNoRepeat');
  return acts;
}

const statementCount = tokens => tokens.filter(t => t.t !== 'end').length;

/* Runs actions on a level; returns the event list for the UI to animate. */
function simulate(lv, actions) {
  let { x, y } = lv.start;
  const ice = new Set(lv.ice), got = new Set(), ev = [];
  for (const a of actions) {
    if (a.t === 'melt') {
      const cells = [];
      for (const [dx, dy] of N4) {
        const k = key(x + dx, y + dy);
        if (ice.has(k)) { ice.delete(k); cells.push(k); }
      }
      ev.push({ t: 'melt', cells, a });
      continue;
    }
    const [dx, dy] = DIRV[a.dir];
    const nx = x + dx, ny = y + dy, k = key(nx, ny);
    let why = null;
    if (nx < 0 || ny < 0 || nx >= lv.w || ny >= lv.h) why = 'edge';
    else if (lv.obst.has(k)) why = lv.obst.get(k) === 'T' ? 'tree' : 'snowman';
    else if (ice.has(k)) why = 'ice';
    if (why) { ev.push({ t: 'bonk', why, x, y, dir: a.dir, a }); return { ev, result: 'bonk', why }; }
    x = nx; y = ny;
    let collected = false;
    if (lv.presents.includes(k) && !got.has(k)) { got.add(k); collected = true; }
    ev.push({ t: 'step', x, y, collected, a });
    if (k === lv.goalKey && got.size === lv.presents.length) {
      ev.push({ t: 'win' });
      return { ev, result: 'win' };
    }
  }
  const left = lv.presents.length - got.size;
  return { ev, result: left ? 'missing' : 'notgoal', left };
}

/* ---------- Prompt-engineering rubric (13–16) ---------- */
/* rubric (optional) = translated word lists for one language:
   { context:[], detail:[], limits:[], polite:[], unkind:[], cjk:true } — matched as substrings, plus English always works.
   For languages written without spaces (cjk), "enough detail" counts characters instead of words. */
function scorePrompt(text, taskWords, rubric) {
  const t = ' ' + text.toLowerCase() + ' ';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const R = rubric || null;
  const inList = list => !!(R && list && list.some(w => t.includes(String(w).toLowerCase())));
  const has = (re, list) => re.test(t) || inList(list);
  const longEnough = words >= 10 || (R && R.cjk && text.replace(/\s/g, '').length >= 18);
  const checks = [
    { id: 'task', icon: '🎯', label: 'Clear task — say exactly what you want', ok: taskWords.some(w => t.includes(w)), required: true },
    { id: 'context', icon: '🧭', label: 'Context — explain your goal (so / because / so that…)', ok: has(/\b(so|because|so that|in order|to help|need|goal|trying to)\b/, R && R.context) },
    { id: 'detail', icon: '🔍', label: 'Specific details — presents, path, gates, squares…', ok: has(/(present|gift|map|path|route|spark|sleigh|grid|gate|lane|hill|toy|square|tile|block|next to|adjacent|ahead|beside|valley)/, R && R.detail) },
    { id: 'limits', icon: '🚧', label: 'Limits — keep it safe (only / don\'t / without…)', ok: has(/\b(only|without|don'?t|do not|must|exactly|just|safe|safely|careful|not|avoid|limit|keep|never)\b/, R && R.limits) },
    { id: 'length', icon: '✍️', label: 'Enough detail — at least 10 words', ok: !!longEnough },
  ];
  const passedOthers = checks.filter(c => !c.required && c.ok).length;
  const pass = checks[0].ok && passedOthers >= 3;
  const polite = has(/\b(please|thanks|thank you|cheers)\b/, R && R.polite);
  const unkind = has(/\b(stupid|idiot|dumb|shut up|useless|hate you)\b/, R && R.unkind);
  return { checks, pass, polite, unkind, score: checks.filter(c => c.ok).length };
}

function starsFor(count, par) {
  if (count <= par) return 3;
  if (count <= par + 3) return 2;
  return 1;
}

if (typeof module !== 'undefined') {
  module.exports = { TIERS, parseMap, parseText, compile, simulate, statementCount, scorePrompt, starsFor, CodeError, key, DIRV };
}
