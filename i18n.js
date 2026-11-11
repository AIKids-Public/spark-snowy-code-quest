/* Spark's Snowy Code Quest — translations.
   English is built in here. Other languages register themselves from lang/<code>.js via I18N.register(pack).
   Placeholders look like {name}. Strings may contain simple HTML (<b>, <i>, <br>, <code>). */
(() => {
  const EN = {
    /* app chrome */
    'app.title': 'Spark\'s Snowy Code Quest',
    'btn.sound': '🔊 Sound', 'btn.muted': '🔇 Muted', 'btn.home': '🏠 Home',
    'music.on': '🎵 Music on', 'music.off': '🎵 Music off', 'music.title': 'Play a calm holiday song',
    'lang.label': 'Language',
    'alt.spark': 'Spark, a friendly blue robot reading a book',
    'voice.none': 'Spoken help isn\'t available in this language on this device.',

    /* tiers */
    'tier.ages': 'Ages {ages}',
    'tier.young.name': 'Snowflake Explorers', 'tier.young.blurb': 'Tap the arrows. Help Spark move!',
    'tier.middle.name': 'Reindeer Coders', 'tier.middle.blurb': 'Build programs with steps and 🔁 Repeat blocks.',
    'tier.teen.name': 'North Star Engineers', 'tier.teen.blurb': 'Write real code with nested loops, and engineer your own prompts.',

    /* home */
    'home.intro': 'A Christmas Eve blizzard has scattered Santa\'s presents across the North Pole! Help <b>Spark</b> rescue them by <b>asking Frosty the AI helper</b> clearly and kindly, then <b>coding</b> Spark\'s path to the sleigh.',
    'home.steps': '🗣️ Ask well &nbsp;→&nbsp; 🧩 Code a path &nbsp;→&nbsp; 🎁 Save the presents',
    'home.grownup': '👨‍👩‍👧 Little ones may like a grown-up to help!',
    'bonus.tag': '⭐ BONUS', 'bonus.title': 'Holiday Card Maker',
    'bonus.desc': 'Answer 5 fun questions to design your own Christmas card — then save it as a picture!',
    'bonus.go': 'Make a card ➜',
    'cardpick.title': '🎨 Who is making the card?',

    /* mission list */
    'list.simple': '🗣️ Ask Frosty for help.<br>➡️ Tap arrows to move Spark.<br>🎁 Get all the gifts. Then go to the sleigh 🛷!',
    'list.parent': '<b>Grown-ups:</b> younger children may enjoy playing this with you. Read the words together, or tap <b>🔈 Read to me</b> to hear them out loud.',
    'list.full': '{blurb} Each mission has two parts: first <b>ask Frosty the AI</b> for help, then <b>code Spark\'s path</b>. Collect every 🎁 and finish on the 🛷. Use fewer {unit} to earn more ⭐!',
    'unit.lines': 'lines', 'unit.blocks': 'blocks', 'unit.commands': 'commands',
    'list.done': 'Quest complete!', 'list.done.s': 'You did them all!',
    'list.cert': '📜 Get certificate', 'list.cert.s': '📜 My certificate',
    'list.finale': '🛷 Watch finale', 'list.finale.s': '🛷 See the ending',
    'list.locked': 'Finish the mission before to unlock', 'list.locked.s': 'Win the one before first! 🔒',

    /* mission HUD + board */
    'hud.back': '⬅ Missions', 'hud.back.s': '⬅ Back',
    'hud.mission': 'Mission {n}: {title}',
    'hud.par': '⭐⭐⭐ in {par} {unit} or fewer', 'hud.par.s': '⭐⭐⭐ = {par} taps',
    'veil.fog': 'The blizzard is hiding the map…<br>Ask Frosty for help!', 'veil.fog.s': 'Too much snow!<br>Ask Frosty for help!',
    'veil.dark': 'It\'s too dark to see…<br>Ask Frosty for help!', 'veil.dark.s': 'Too dark!<br>Ask Frosty for help!',

    /* story step */
    'story.goal': 'Your goal: collect <b>every 🎁</b>, then finish on <b>Santa\'s sleigh 🛷</b>.<br>Watch out for 🎄 trees, ⛄ snowmen and 🧊 ice!',
    'story.gifts.s': 'Get all the gifts', 'story.sleigh.s': 'Go to the sleigh',
    'story.avoid.s': 'Do not bump into 🎄 ⛄ 🧊',
    'story.read.s': '👨‍👩‍👧 You can ask a grown-up to help you read.',
    'speak.story': 'Get all the gifts. Then go to the sleigh. Do not bump into trees, snowmen or ice.',
    'btn.go': 'Let\'s go! ✨', 'btn.read': '🔈 Read to me',

    /* prompt step */
    'p.h': '🗣️ Step 1: Ask Frosty the AI', 'p.h.s': '🗣️ Step 1: Ask Frosty',
    'p.hi': 'Hi, I\'m <b>Frosty</b>, the North Pole\'s AI helper!', 'p.hi.s': 'Hi! I am <b>Frosty</b>. I am a helper robot. 🤖',
    'p.tap.s': '<b>Tap the best one:</b> 👇',
    'speak.number': 'Number {n}: {text}',
    'p.build': '<b>Build your prompt — pick one piece from each row.</b> Good prompts say <i>who</i>, <i>what</i> and <i>why</i>.',
    'p.asm': 'Your prompt will appear here…',
    'p.joiner': ' ', 'p.q1': '“', 'p.q2': '”',
    'p.send': '📨 Send to Frosty',
    'p.great': 'That\'s a great prompt! You told me <b>who</b> you\'re asking, <b>exactly what</b> you need, and <b>why</b>. Clear prompts get clear answers.',
    'p.unsure': 'Hmm, I\'m not quite sure what you need.',
    'p.pieces': '<b>{n} pieces</b> could be better. Here\'s one:',
    'p.write': 'Write your own prompt. Frosty checks it against a <b>prompt-engineering checklist</b>: you need the <b>🎯 clear task</b> plus at least <b>3</b> of the others.',
    'p.placeholder': 'e.g. Frosty, please…', 'p.aria': 'Your prompt', 'p.required': '(required)',
    'p.unkind': 'Ouch! I\'ll always try my best, but kind words make for a better team. Could you rephrase that?',
    'p.excellent': 'Excellent prompt engineering — {score}/5 on the checklist!',
    'p.polite': ' And thanks for being polite 😊.',
    'p.yours': 'Your prompt:',
    'p.notask': 'I can\'t tell what you want me to <b>do</b>. Name the task clearly (what should happen to the {thing}?).',
    'thing.fog': 'fog', 'thing.dark': 'darkness', 'thing.melt': 'ice',
    'p.tryadd': 'Getting there! Try adding: {list}.', 'p.sep': ', ',
    'chk.task': 'Clear task — say exactly what you want', 'chk.task.short': 'clear task',
    'chk.context': 'Context — explain your goal (so / because / so that…)', 'chk.context.short': 'context',
    'chk.detail': 'Specific details — presents, path, gates, squares…', 'chk.detail.short': 'specific details',
    'chk.limits': 'Limits — keep it safe (only / don\'t / without…)', 'chk.limits.short': 'limits',
    'chk.length': 'Enough detail — at least 10 words', 'chk.length.short': 'enough detail',
    'r.fog': 'Whoooosh! 🌬️ I\'ve blown the blizzard away — now you can see the whole map!', 'r.fog.s': 'Whoosh! 🌬️ The snow is gone!',
    'r.dark': 'Ta-da! 💡 I\'ve switched on the northern lights — now you can see the whole map!', 'r.dark.s': 'Ta-da! 💡 The lights are on!',
    'r.melt': 'I\'ve given Spark a new command: <b>✨ Melt</b>. It melts any 🧊 ice right next to Spark (up, down, left or right).',
    'r.melt.s': 'Here is a magic power! ✨ Tap <b>✨ Melt</b> next to the ice. It will melt!',
    'btn.code': 'Start coding! 🧩', 'btn.code.s': 'Next! ➡️',

    /* code step */
    'c.h': '🧩 Step 2: Code Spark\'s path', 'c.h.s': '🧩 Step 2: Move Spark',
    'c.arrows': 'Tap the arrows to plan Spark\'s path, then press <b>Go!</b>', 'c.arrows.s': 'Tap the arrows. 👆<br>Then tap <b>▶ Go!</b>',
    'c.blocks': 'Add blocks to build a program. Click a {number} to change it. Put steps between <b>🔁 Repeat</b> and <b>End</b> to loop them!',
    'c.number': 'number',
    'c.ref': '<b>Commands:</b>',
    'c.ref2': 'Repeats can go inside repeats! Each command or repeat counts as 1. Press <b>Ctrl/⌘ + Enter</b> to run.',
    'c.aria': 'Code editor',
    'code.comment': '# Mission {n}: {title}\n# Write your program below. Try using repeat!\n\n',
    'key.melt': '✨ Melt', 'key.repeat': '🔁 Repeat', 'key.end': '⏹ End',
    'dir.up': 'Up', 'dir.down': 'Down', 'dir.left': 'Left', 'dir.right': 'Right',
    'btn.run': '▶ Go!', 'btn.stop': '⏹ Stop', 'btn.undo': '↩ Undo', 'btn.clear': '🗑 Clear', 'btn.hint': '💡 Hint',
    'c.toomany': 'That\'s a lot of blocks! Try using fewer.',
    'c.empty.s': 'Your arrows go here 👣', 'c.empty.a': 'Your path will appear here… 👣', 'c.empty.b': 'Your program is empty. Add some blocks!',
    'b.repeat': '🔁 Repeat {n} times', 'b.end': '⏹ End repeat', 'b.melt': '✨ Melt',
    'b.move1': '{arrow} {dir} {n} step', 'b.moveN': '{arrow} {dir} {n} steps',
    'aria.repeatN': 'change repeat count', 'aria.stepsN': 'change steps', 'aria.remove': 'remove block',
    'cnt.s': 'Taps: {n}   •   ⭐⭐⭐ = {par} taps',
    'cnt.blocks': 'Blocks used: {n}   •   ⭐⭐⭐ target: {par}',
    'cnt.commands': 'Commands used: {n}   •   ⭐⭐⭐ target: {par}',
    'stop': 'Stopped. Change your program and try again!', 'stop.s': 'Stopped. Try again!',
    'fail.hint': '<br>Stuck? Press <b>💡 Hint</b>.', 'fail.hint.s': '<br>Need help? Tap <b>💡 Hint</b>. Or ask a grown-up! 👨‍👩‍👧',
    'fail.fix': ' Fix your program and try again!',
    'run.empty.s': 'Tap some arrows first! 👆', 'run.empty.t': 'Write some commands first, like <code>right 2</code>.', 'run.empty.b': 'Add some blocks first!',
    'err.line': '🐞 Bug on line {line}: {msg}', 'err.plain': '🐞 {msg}',
    'run.go': 'Running… 🏃', 'run.go.s': 'Go, Spark, go! 🏃',
    "reset.msg": "Oops! Resetting the board in {n}…", "reset.msg.s": "Oops! Let's try again… {n}", "reset.done": "Board reset — fix your program and try again!", "reset.done.s": "Ready! Try again 👆",
    'yay': '+1 🎁', 'yay.s': 'Yay! 🎁',
    'melt.none': '✨ Melt! …but there was no ice next to Spark.', 'melt.none.s': '✨ Melt! But no ice is here.',
    'win.msg': '🎉 Spark made it to the sleigh with every present!', 'win.msg.s': '🎉 Hooray! You did it!',
    'bonk.edge': 'Whoops! Spark nearly walked off the edge of the map.', 'bonk.edge.s': 'Oops! That is the edge. Try a new way.',
    'bonk.tree': 'Bonk! Spark bumped into a Christmas tree 🎄.', 'bonk.tree.s': 'Bonk! A tree 🎄 is in the way. Try again!',
    'bonk.snowman': 'Oof! Spark walked into a snowman ⛄. Sorry, snowman!', 'bonk.snowman.s': 'Oof! A snowman ⛄ is in the way. Try again!',
    'bonk.ice': 'Clunk! That\'s solid ice 🧊. Stand next to it and melt it first.', 'bonk.ice.s': 'Clunk! Ice 🧊! Tap ✨ Melt first.',
    'miss.one': 'Spark still needs to collect <b>{n}</b> more present 🎁 before going to the sleigh.',
    'miss.many': 'Spark still needs to collect <b>{n}</b> more presents 🎁 before going to the sleigh.',
    'miss.s': 'Get all the gifts first! 🎁 {n} more to go.',
    'notgoal': 'All the presents are collected! 🎉 Now finish on Santa\'s sleigh 🛷.', 'notgoal.s': 'You got all the gifts! 🎉 Now go to the sleigh 🛷.',

    /* code errors (from the interpreter) */
    'e.range': '"{w} {n}" — use a number from 1 to 20.',
    'e.repeatNum': 'repeat needs a number, like:  repeat 3 { right 1 }',
    'e.repeatRange': 'repeat needs a number from 1 to 20.',
    'e.brace': 'After "repeat {n}" you need a {',
    'e.extra': 'There\'s an extra } with no repeat to close.',
    'e.braceAfter': 'A { must come right after "repeat N".',
    'e.unknown': 'I don\'t know "{w}". Use: up, down, left, right, melt, repeat.',
    'e.missingClose': 'A repeat is missing its closing }',
    'e.toolong': 'That program is way too long — Spark would be walking until next Christmas!',
    'e.toolong2': 'That program is way too long!',
    'e.noEnd': 'A Repeat is missing its End.',
    'e.endNoRepeat': 'There\'s an End without a Repeat.',
    'e.nomelt': 'Spark doesn\'t have melt power in this mission.',

    /* win popup */
    'w.saved': '🎄 Christmas is saved! 🎄', 'w.complete': 'Mission complete!', 'w.complete.s': 'You did it!',
    'w.retry': 'You used {count} {unit}. Can you do it in <b>{par}</b> for ⭐⭐⭐?', 'w.pattern': ' (Look for patterns you can repeat!)',
    'w.retry.s': 'You did it! 🎉<br>Can you do it in <b>{par}</b> taps? Try again for ⭐⭐⭐!',
    'w.best.arrows': 'Perfect path — the shortest way!', 'w.best.code': 'Super-efficient code — that\'s how real engineers think!', 'w.best.s': 'Wow! The best way! 🌟',
    'w.lesson.young': 'You asked nicely. You gave clear steps. That is what coders do! 💙',
    'w.lesson.middle': 'You used <b>loops</b> to repeat patterns, and wrote a prompt with <b>who, what and why</b>.',
    'w.lesson.teen': 'You engineered a prompt with <b>task, context and limits</b>, and wrote code with <b>loops</b>.',
    'w.all.s': 'You did ALL of them! 🏆',
    'w.all': 'You finished every <b>{tier}</b> mission!',
    'w.nexttier': 'Ready for a bigger challenge? Try the next age group!',
    'w.true': 'You\'re a true North Star Engineer! ⭐',
    'w.finale': '🛷 Watch the finale!', 'w.finale.s': '🛷 See the ending!',
    'w.next': 'Next mission ➡', 'w.next.s': 'Next ➡️',
    'w.again': '🔁 Try again', 'w.again.s': '🔁 Again',
    'speak.done': 'You did it! Hooray!', 'speak.alldone': 'You did all of them! Hooray!',

    /* card maker — shared */
    'card.hud': '🎨 Holiday Card Maker', 'card.back': '⬅ Back', 'card.ready': '🎉 Ready!',
    'card.next': 'Next ➡', 'card.prev': '⬅ Back', 'card.aria': 'Your holiday card preview',
    'card.saved': '✅ Saved! Look for <b>{file}</b> in your Downloads.',
    'card.blocked': 'Sorry — this browser blocked the download. Try right-clicking the card and choosing “Save image as…”.',
    'card.made': 'Made with Spark ✨',

    /* card maker — kids (ages 4–8) */
    'card.k.step': 'Step {n} of 5', 'card.k.shuffle': '🔀 Mix up',
    'card.k.q1': 'Where is your card?', 'card.k.q1s': 'Tap a picture.',
    'card.k.q2': 'Who is on your card?', 'card.k.q2s': 'Tap one.',
    'card.k.q3': 'Add some sparkle!', 'card.k.q3s': 'Tap as many as you like!',
    'card.k.q4': 'What should it say?', 'card.k.q4s': 'Tap a message.',
    'card.k.q5': 'Who is it for?', 'card.k.q5s': 'Type their name. A grown-up can help! (You can skip this.)',
    'card.k.letters': 'Pick your letters:',
    'card.k.to': 'To:', 'card.k.from': 'From:', 'card.k.toPh': 'Grandma', 'card.k.fromPh': 'Your name',
    'card.k.safe': '🛡️ Only use first names.',
    'card.k.finish': 'Make my card! 🎉',
    'card.k.done': 'Wow! Your card is ready! 🎉', 'card.k.doneSub': 'Tap the big button to save it.',
    'card.k.dl': '⬇️ Save my card', 'card.k.edit': '✏️ Change it', 'card.k.new': '🆕 New card',
    'card.k.share': '👨‍👩‍👧 Ask a grown-up before you send it to anyone.',
    'card.k.toLine': 'To: {name}', 'card.k.fromLine': 'From: {name}',
    'card.k.scene.night': 'Snowy night', 'card.k.scene.aurora': 'Magic lights', 'card.k.scene.fireside': 'Cosy fire', 'card.k.scene.candy': 'Candy land',
    'card.k.star.tree': 'Christmas tree', 'card.k.star.snowman': 'Snowman', 'card.k.star.reindeer': 'Reindeer',
    'card.k.star.santa': 'Santa', 'card.k.star.gift': 'Big present', 'card.k.star.spark': 'Spark',
    'card.k.extra.snow': 'Snowflakes', 'card.k.extra.stars': 'Stars', 'card.k.extra.lights': 'Fairy lights',
    'card.k.extra.gifts': 'Presents', 'card.k.extra.baubles': 'Baubles', 'card.k.extra.holly': 'Holly',
    'card.k.style.classic': 'Classic', 'card.k.style.bubbly': 'Bubbly', 'card.k.style.gold': 'Golden', 'card.k.style.candy': 'Candy',
    'card.k.g0': 'Merry Christmas!', 'card.k.g1': 'Happy Holidays!', 'card.k.g2': 'Season\'s Greetings!',
    'card.k.g3': 'Let It Snow!', 'card.k.g4': 'Ho Ho Ho!', 'card.k.g5': 'Joy to the World!',

    /* card maker — designer mode (ages 9–16) */
    'card.m.step': 'Question {n} of 5', 'card.m.shuffle': '🔀 Shuffle details',
    'card.m.q1': 'Question 1: Choose a setting', 'card.m.q1s': 'Pick the backdrop for your card.',
    'card.m.q2': 'Question 2: Choose the centrepiece', 'card.m.q2s': 'What should take centre stage?',
    'card.m.q3': 'Question 3: Add finishing touches', 'card.m.q3s': 'Pick as many as you like.',
    'card.m.q4': 'Question 4: Write your message', 'card.m.q4s': 'Pick a greeting, or write your own — then choose a lettering style.',
    'card.m.q5': 'Question 5: Who is it for?', 'card.m.q5s': 'Add who it\'s to and from. Use first names only — it\'s safer online!',
    'card.m.own': '…or write your own (max 40 characters):', 'card.m.ownPh': 'e.g. Wishing you a cosy Christmas',
    'card.m.lettering': 'Lettering style:',
    'card.m.to': 'To (who is it for?)', 'card.m.from': 'From (your first name)', 'card.m.toPh': 'e.g. Grandma', 'card.m.fromPh': 'e.g. Sam',
    'card.m.safe': '🛡️ Tip: use first names only — never put your address or school on things you share.',
    'card.m.finish': 'Finish my card! 🎉',
    'card.m.done': 'Your card is ready! 🎉', 'card.m.doneSub': 'Download it as a picture to print, or to send to family (ask a grown-up first!).',
    'card.m.dl': '⬇️ Download PNG', 'card.m.edit': '✏️ Edit card', 'card.m.new': '🆕 Start a new card',
    'card.m.share': '👨‍👩‍👧 Always check with a grown-up before sharing pictures online.',
    'card.m.noteBoth': 'For {to}  ·  From {from}', 'card.m.noteTo': 'For {to}', 'card.m.noteFrom': 'From {from}',
    'card.m.scene.midnight': 'Midnight forest', 'card.m.scene.aurora': 'Northern lights', 'card.m.scene.velvet': 'Gold & velvet', 'card.m.scene.nordic': 'Nordic minimal',
    'card.m.hero.pine': 'Geometric tree', 'card.m.hero.flake': 'Snow crystal', 'card.m.hero.ornament': 'Glass bauble',
    'card.m.hero.wreath': 'Winter wreath', 'card.m.hero.cabin': 'Snowy cabin', 'card.m.hero.spark': 'Spark',
    'card.m.extra.snow': 'Soft snowfall', 'card.m.extra.bokeh': 'Bokeh glow', 'card.m.extra.garland': 'Pine garland',
    'card.m.extra.stars': 'Gold sparkles', 'card.m.extra.frame': 'Gold frame', 'card.m.extra.confetti': 'Gold confetti',
    'card.m.style.serif': 'Elegant serif', 'card.m.style.script': 'Handwritten', 'card.m.style.modern': 'Modern', 'card.m.style.foil': 'Gold foil',
    'card.m.g0': 'Merry Christmas', 'card.m.g1': 'Season\'s Greetings', 'card.m.g2': 'Happy Holidays',
    'card.m.g3': 'Peace & Joy', 'card.m.g4': 'Warmest Wishes', 'card.m.g5': 'Joy to the World',

    /* finale */
    'rank.young': 'Snowflake Explorer', 'rank.middle': 'Reindeer Coder', 'rank.teen': 'North Star Engineer',
    'skill.young': 'asking kindly and giving clear, step-by-step instructions',
    'skill.middle': 'building clear prompts and coding with loops',
    'skill.teen': 'prompt engineering and writing nested-loop code',
    'f.aria': 'Quest complete', 'f.alt': 'Spark driving Santa\'s sleigh',
    'f.skip': 'Skip animation ⏭', 'f.skip.s': 'Skip ⏭',
    'f.h': 'Quest complete — you saved Christmas!', 'f.h.s': 'You saved Christmas!',
    'f.rank': 'You are a <b>{rank}</b>!',
    'f.body': 'Thanks to you, Spark delivered every present on time. You earned <b>{stars} / {max} ⭐</b>.',
    'f.body.s': 'Spark flew the sleigh. All the gifts got home! 🎁',
    'f.cert': '📜 Get my certificate', 'f.replay': '🔁 Watch again', 'f.home': '🏠 Home',
    'f.say': 'You saved Christmas! You are a {rank}!',

    /* certificate */
    'cert.title': 'Certificate of Achievement',
    'cert.presented': 'This certificate is proudly presented to',
    'cert.default': 'A Super Coder',
    'cert.for': 'for saving Christmas in Spark\'s Snowy Code Quest',
    'cert.becoming': 'and becoming a',
    'cert.skill': 'for {skill}',
    'cert.stars': '{stars} of {max} stars earned',
    'cert.date': 'Date', 'cert.guide': 'Quest guide', 'cert.sign': 'Spark ✨',
    'ce.aria': 'Your certificate',
    'ce.back': '⬅ Home', 'ce.back.s': '⬅ Back',
    'ce.hud': '📜 Your certificate', 'ce.hud.s': '📜 My certificate',
    'ce.well': 'Congratulations! 🎉', 'ce.well.s': 'Well done! 🎉',
    'ce.sub': 'Add your name, then download your certificate to print or keep.', 'ce.sub.s': 'Type your name. Then save your certificate!',
    'ce.name': 'Your first name', 'ce.name.s': 'Your name:',
    'ce.ph': 'e.g. Sam', 'ce.ph.s': 'Your name',
    'ce.tip': '🛡️ Use your first name only — it\'s safer if the certificate gets shared.', 'ce.tip.s': '🛡️ Just your first name. A grown-up can help!',
    'ce.dl': '⬇️ Download certificate (PNG)', 'ce.dl.s': '⬇️ Save my certificate',
    'ce.card': '🎨 Make a Christmas card', 'ce.card.s': '🎨 Make a card',
    'ce.blocked': 'Sorry — the download was blocked. Right-click the certificate and choose “Save image as…”.',
  };

  const ORDER = ['en', 'zh', 'hi', 'es', 'fr', 'ar'];
  const packs = { en: { meta: { code: 'en', name: 'English', dir: 'ltr', locale: 'en-GB' }, ui: EN } };
  const missing = new Set();
  let lang = 'en', enMissions = null;
  const KEY = 'sparkLang';

  const fmt = (s, p) => (p ? String(s).replace(/\{(\w+)\}/g, (m, k) => (k in p ? p[k] : m)) : s);

  const I18N = {
    EN, missing,
    get lang() { return lang; },
    get dir() { return (packs[lang].meta && packs[lang].meta.dir) || 'ltr'; },
    get locale() { return (packs[lang].meta && packs[lang].meta.locale) || lang; },
    langs() { return ORDER.filter(c => packs[c]).map(c => packs[c].meta); },
    register(pack) { if (pack && pack.meta && pack.meta.code) packs[pack.meta.code] = pack; },
    t(key, p) {
      const ui = packs[lang].ui || {};
      let s = ui[key];
      if (s == null) { s = EN[key]; if (lang !== 'en' && s != null) missing.add(lang + ':' + key); }   // '' is a valid value (e.g. no joiner in Chinese)
      if (s == null) { missing.add('en:' + key); return key; }
      return fmt(s, p);
    },
    rubric() { return lang === 'en' ? null : (packs[lang].rubric || null); },
    set(code) {
      if (!packs[code]) code = 'en';
      lang = code;
      try { localStorage.setItem(KEY, code); } catch (e) { /* private mode */ }
      const h = document.documentElement;
      h.lang = this.locale; h.dir = this.dir;
    },
    init() {
      let code = null;
      try { code = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
      if (!code || !packs[code]) {
        const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
        for (const p of prefs) { const c = String(p).toLowerCase().split('-')[0]; if (packs[c]) { code = c; break; } }
      }
      this.set(code || 'en');
    },
    /* Copy translated mission text into the TIERS objects (maps, targets and right/wrong flags never change). */
    applyMissions(T) {
      if (!enMissions) enMissions = I18N.snapshot(T);
      const src = lang === 'en' ? null : (packs[lang].missions || null);
      for (const tid of Object.keys(T)) T[tid].missions.forEach((m, i) => {
        const e = enMissions[tid][i], x = (src && src[tid] && src[tid][i]) || {};
        m.title = x.title || e.title; m.story = x.story || e.story; m.hint = x.hint || e.hint;
        m.prompt.question = x.question || e.question;
        if (m.prompt.options) m.prompt.options.forEach((o, k) => {
          const xo = (x.options || [])[k] || {};
          o.text = xo.text || e.options[k].text; o.feedback = xo.feedback || e.options[k].feedback;
        });
        if (m.prompt.rows) m.prompt.rows.forEach((r, ri) => {
          const xr = (x.rows || [])[ri] || {}, er = e.rows[ri];
          r.label = xr.label || er.label;
          r.chips.forEach((c, ci) => {
            const xc = (xr.chips || [])[ci] || {}, ec = er.chips[ci];
            c.text = xc.text || ec.text;
            if (ec.feedback) c.feedback = xc.feedback || ec.feedback;
          });
        });
        if (m.prompt.taskWords) m.prompt.taskWords = lang === 'en' ? e.taskWords.slice() : [...new Set([...(x.taskWords || []), ...e.taskWords])];
      });
    },
    snapshot(T) {
      const out = {};
      for (const tid of Object.keys(T)) out[tid] = T[tid].missions.map(m => JSON.parse(JSON.stringify({
        title: m.title, story: m.story, hint: m.hint, question: m.prompt.question,
        options: m.prompt.options && m.prompt.options.map(o => ({ text: o.text, feedback: o.feedback })),
        rows: m.prompt.rows && m.prompt.rows.map(r => ({ label: r.label, chips: r.chips.map(c => (c.feedback ? { text: c.text, feedback: c.feedback } : { text: c.text })) })),
        taskWords: m.prompt.taskWords,
      })));
      return out;
    },
  };
  window.I18N = I18N;
})();
