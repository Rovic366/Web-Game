/* ==========================================================================
   STARDEW VALLEY COZY FRAUD DETECTIVE - GAME LOGIC
   ========================================================================== */

// ─── Game State ──────────────────────────────────────────────────────────
const STATE = {
  playerName: "Farmer",
  selectedAvatarIndex: 0,
  score: 0,
  levelScore: 0,
  currentLevelIndex: 0,
  completedLevels: new Set(), // Set of completed level indices
};

// ─── Levels (Scams) Data ──────────────────────────────────────────────────
const LEVELS = [
  {
    id: 'phishing',
    name: 'Phishing Alert',
    caseTitle: 'The Suspect Email',
    description: 'A suspicious email claims your bank account is locked! Check the red flags.',
    badge: 'SMS/Email',
    tip: 'Always look closely at the sender\'s email address. misspellings like "bankk" or ".ru" subdomains are clear indicators of scams. Real companies do not demand passwords or social security numbers via email!'
  },
  {
    id: 'sorting',
    name: 'Scam Filter',
    caseTitle: 'Real or Fake?',
    description: 'Read the incoming messages and determine if they are legitimate or fraudulent requests.',
    badge: 'Sorting',
    tip: 'Scammers create high urgency to make you panic. If someone calls or texts demanding fast payments via gift cards or crypto, it is always a scam.'
  },
  {
    id: 'memory',
    name: 'Security Match',
    caseTitle: 'Security Concepts',
    description: 'Flip and match the security terms to master different types of cyber threats.',
    badge: 'Memory',
    tip: 'Knowing terms like Skimming, Phishing, and Ransomware helps you spot them in the real world. Awareness is your shield!'
  },
  {
    id: 'unscramble',
    name: 'Decode Security',
    caseTitle: 'Crack the Password',
    description: 'Unscramble key security keywords to unlock advanced town protection protocols.',
    badge: 'Word Game',
    tip: 'Strong passwords, multi-factor authentication, and safe browsing habits protect your personal identity online.'
  },
  {
    id: 'quiz',
    name: 'Town Patrol',
    caseTitle: 'Patrol Decisions',
    description: 'Go out into the village and make decisions to protect townfolks from tricksters.',
    badge: 'Quiz',
    tip: 'When faced with threats: freeze accounts, alert trusted institutions, change passwords, and report scam details to authorities immediately!'
  }
];

// Phishing Game Configuration
const PHISHING_EMAIL = {
  from: 'alert@secur-bank-america.fraudcheck-portal.ru',
  isFromFlag: true,
  fromExp: 'Misspelled "secur" and hosted on an unofficial Russian (.ru) domain instead of bankofamerica.com!',
  
  subject: '⚠️ ACCOUNT CRITICAL BLOCK!!! VERIFY IN 1 HOUR',
  isSubjectFlag: true,
  subjectExp: 'Scammers use urgent, alarming language to make you act in fear without thinking.',
  
  greeting: 'Dear Beloved Bank Account Holder,',
  isGreetingFlag: true,
  greetingExp: 'Generic greetings like "Beloved Account Holder" indicate a bulk spam campaign. Real banks address you by name.',
  
  link: 'http://secure-login.bank-america.support-verify.com/reset',
  isLinkFlag: true,
  linkExp: 'A suspicious unencrypted HTTP link leading to a complex web portal. Always navigate directly to official bank apps!',
  
  errorText: 'Pleas login immediatly to fix this block and safe your gold.',
  isErrorTextFlag: true,
  errorTextExp: 'Spelling mistakes ("Pleas", "immediatly", "safe") are highly common in scam emails.'
};

// Sorting scenarios
const SORTING_SCENARIOS = [
  { text: 'A text message claims you won a free tractor! "Click this link to pay shipping fees."', isFraud: true, exp: 'Unsolicited prize messages asking for fee payments are classic advance-fee scams.' },
  { text: 'Your bank texts you: "A charge of $45.00 was authorized at Town Shop. Reply YES or NO."', isFraud: false, exp: 'Legitimate fraud alerts verify single transactions without asking for sensitive info.' },
  { text: 'A caller claiming to be tax officers says you owe taxes and will be jailed unless you pay via Apple Gift Cards.', isFraud: true, exp: 'Government agencies never threaten arrest by phone or accept retail gift cards as tax payment.' },
  { text: 'A security system warns you of a login attempt from a new device on your verified social media profile.', isFraud: false, exp: 'Automated notification emails keep you informed of account changes and are standard procedure.' },
  { text: 'A stranger emails claiming to be a rich prince wanting to transfer millions of gold coins into your vault.', isFraud: true, exp: 'The classic "advance-fee" scam. No stranger offers millions of coins in exchange for bank fees.' }
];

// Memory match
const MEMORY_PAIRS = [
  { term: 'Phishing', desc: 'Deceptive emails that bait your login credentials.' },
  { term: 'Skimming', desc: 'Hidden devices placed on ATMs to capture cards.' },
  { term: 'Vishing', desc: 'Scam phone calls attempting to extract passwords.' },
  { term: 'Spoofing', desc: 'Disguising email sender details to look official.' }
];

// Word Unscramble
const UNSCRAMBLE_WORDS = [
  { word: 'FIREWALL', hint: 'A screen blocking malicious internet traffic.', fact: 'Firewalls act as a protective gatekeeper for your home network!' },
  { word: 'PASSPHRASE', hint: 'A long secure combination of words.', fact: 'A multi-word passphrase is far harder for computers to crack than a simple word!' },
  { word: 'ENCRYPT', hint: 'Turning messages into scrambled, unreadable codes.', fact: 'Encryption keeps your messages private from prying hackers!' }
];

// Decision quiz
const QUIZ_QUESTIONS = [
  {
    question: 'You find a glowing USB drive near the town square with a label "Evelyn\'s Secret Recipes". What do you do?',
    options: [
      'Plug it in! Evelyn makes amazing chocolate cakes.',
      'Plug it in only on a public town computer.',
      'Leave it alone or take it to a security team — it might contain dangerous malware.',
      'Give it to a friend to test it on their system.'
    ],
    correct: 2,
    explanation: 'Plugging in unknown USB drives is a high-risk action called "baiting." It can instantly infect your computer with spyware.'
  },
  {
    question: 'An elderly neighbor asks you to help. They got a call from their "grandchild" saying they are in trouble and need $2,000 wired immediately. What is your advice?',
    options: [
      'Help them send the money as quickly as possible.',
      'Tell them to call the grandchild directly on their normal number to verify the story.',
      'Ignore it. It is probably fine.',
      'Suggest calling the bank to borrow money.'
    ],
    correct: 1,
    explanation: 'This is the "grandparent scam." Scammers impersonate family members in trouble. Always double-check via direct, trusted channels first!'
  }
];


// ─── Initialization & Event Handlers ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupCharacterSelection();
  setupGlobalEvents();
  renderPhoneCases();
});

// Setup Avatar Selector
function setupCharacterSelection() {
  const options = document.querySelectorAll('.avatar-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      STATE.selectedAvatarIndex = parseInt(opt.dataset.avatar);
    });
  });

  document.getElementById('confirm-char-btn').addEventListener('click', () => {
    const inputVal = document.getElementById('player-name').value.trim();
    if (inputVal) {
      STATE.playerName = inputVal;
    }
    
    // Apply name & avatar to HUD and Dialogue panels
    updatePlayerAvatarElements();
    
    // Go to Cozy House Screen
    showScreen('house-hub-screen');
  });
}

function updatePlayerAvatarElements() {
  // Update names
  document.getElementById('speech-name').textContent = STATE.playerName;
  document.getElementById('game-speech-name').textContent = STATE.playerName;

  // Update backgrounds to crop the chosen character
  const offset = getAvatarBackgroundOffset(STATE.selectedAvatarIndex);
  document.getElementById('speech-avatar').style.backgroundPosition = offset;
  document.getElementById('game-speech-avatar').style.backgroundPosition = offset;
}

function getAvatarBackgroundOffset(index) {
  switch (index) {
    case 0: return '0% 0%';
    case 1: return '100% 0%';
    case 2: return '0% 100%';
    case 3: return '100% 100%';
    default: return '0% 0%';
  }
}

// Global Navigation Actions
function setupGlobalEvents() {
  // Click desk phone to open phone simulator menu
  document.getElementById('desk-phone').addEventListener('click', () => {
    document.getElementById('phone-modal').classList.add('active');
    setHouseDialogue("Tap on any incoming alert message on the screen to analyze its safety. All cases are unlocked and ready for inspection!");
  });

  // Close phone
  document.getElementById('close-phone-btn').addEventListener('click', () => {
    document.getElementById('phone-modal').classList.remove('active');
    setHouseDialogue("Alright, keeping the phone safe. Whenever a suspicious message comes in, I can interact with the device on my desk.");
  });

  // Quit active gameplay
  document.getElementById('hud-quit-btn').addEventListener('click', () => {
    showScreen('house-hub-screen');
    setHouseDialogue("Returned to safety. I can check the smartphone again to review the cases.");
  });

  // Return to desk from completion view
  document.getElementById('next-case-btn').addEventListener('click', () => {
    // Record level completion
    STATE.completedLevels.add(STATE.currentLevelIndex);
    renderPhoneCases();
    
    // Check if all levels are solved
    if (STATE.completedLevels.size === LEVELS.length) {
      document.getElementById('final-score').textContent = STATE.score;
      showScreen('game-complete');
    } else {
      showScreen('house-hub-screen');
      setHouseDialogue(`Splendid work! Case #${STATE.currentLevelIndex + 1} solved. I have earned points. Let's see what other alert messages are on the phone!`);
    }
  });

  // Reset/Restart cozy town
  document.getElementById('play-again-btn').addEventListener('click', () => {
    STATE.score = 0;
    STATE.completedLevels.clear();
    renderPhoneCases();
    showScreen('char-select-screen');
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function setHouseDialogue(text) {
  document.getElementById('speech-text').innerHTML = text;
}

function setGameDialogue(text) {
  document.getElementById('game-speech-text').innerHTML = text;
}


// ─── Render All Scam Choices (Phone Screen) ──────────────────────────────
function renderPhoneCases() {
  const container = document.getElementById('phone-cases-list');
  container.innerHTML = '';

  LEVELS.forEach((level, index) => {
    const isCompleted = STATE.completedLevels.has(index);
    const item = document.createElement('div');
    item.className = `phone-case-item ${isCompleted ? 'completed' : ''}`;
    
    item.innerHTML = `
      <div class="phone-case-header">
        <span class="phone-case-title">${level.name.toUpperCase()}</span>
        <span class="phone-case-badge">${level.badge}</span>
      </div>
      <div class="phone-case-desc">${level.description}</div>
      <div class="phone-case-complete-stamp">SOLVED</div>
    `;

    // Click case starts immediately (removed locked mechanics, play anything)
    item.addEventListener('click', () => {
      document.getElementById('phone-modal').classList.remove('active');
      startPuzzleCase(index);
    });

    container.appendChild(item);
  });
}


// ─── Start Active Case Puzzle ────────────────────────────────────────────
function startPuzzleCase(index) {
  STATE.currentLevelIndex = index;
  STATE.levelScore = 0;
  
  const level = LEVELS[index];
  document.getElementById('hud-level-name').textContent = level.name.toUpperCase();
  document.getElementById('hud-score').textContent = STATE.score;

  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = '';
  
  showScreen('game-screen');
  setGameDialogue(`Starting Case: <span style="color:var(--gold-accent); font-weight:bold;">${level.caseTitle}</span>. Let's inspect the indicators closely.`);

  // Load appropriate engine
  switch (level.id) {
    case 'phishing':
      loadPhishingPuzzle(gameArea);
      break;
    case 'sorting':
      loadSortingPuzzle(gameArea);
      break;
    case 'memory':
      loadMemoryPuzzle(gameArea);
      break;
    case 'unscramble':
      loadUnscramblePuzzle(gameArea);
      break;
    case 'quiz':
      loadQuizPuzzle(gameArea);
      break;
  }
}


// ══════════════════════════════════════════════════════════════════════════
// CASE 1: PHISHING EMAIL RED FLAGS
// ══════════════════════════════════════════════════════════════════════════
function loadPhishingPuzzle(container) {
  let foundCount = 0;
  const targetFlagsCount = 5;

  container.innerHTML = `
    <div style="font-family: var(--font-pixel); font-size: 0.6rem; color: var(--text-dark); margin-bottom: 12px; text-align: center;">
      Identify <span style="color: #c0392b; font-weight: bold;">5 RED FLAGS</span> inside this email.
    </div>

    <div class="email-container">
      <div class="email-toolbar">
        <span>📧 Alert InBox</span>
        <span>🕒 urgent_delivery</span>
      </div>
      
      <div class="email-header">
        <div class="email-field">
          <span class="email-field-label">From:</span>
          <span class="red-flag" id="flag-from" data-exp="${PHISHING_EMAIL.fromExp}">${PHISHING_EMAIL.from}</span>
        </div>
        <div class="email-field">
          <span class="email-field-label">Subject:</span>
          <span class="red-flag" id="flag-subject" data-exp="${PHISHING_EMAIL.subjectExp}">${PHISHING_EMAIL.subject}</span>
        </div>
      </div>

      <div class="email-body">
        <p class="red-flag" id="flag-greet" data-exp="${PHISHING_EMAIL.greetingExp}" style="margin-bottom: 12px;">${PHISHING_EMAIL.greeting}</p>
        <p style="margin-bottom: 12px;">Our security system detected login failures. Your access code is suspended.</p>
        
        <div style="margin: 16px 0; text-align: center;">
          <span class="red-flag" id="flag-link" data-exp="${PHISHING_EMAIL.linkExp}" style="display:inline-block; padding: 6px 12px; background: #e0e0e0; font-family: monospace; font-size: 0.8rem;">
            ${PHISHING_EMAIL.link}
          </span>
        </div>

        <p class="red-flag" id="flag-error" data-exp="${PHISHING_EMAIL.errorTextExp}">${PHISHING_EMAIL.errorText}</p>
      </div>
    </div>
  `;

  // Attach click handlers to all flags
  container.querySelectorAll('.red-flag').forEach(flag => {
    flag.addEventListener('click', () => {
      if (flag.classList.contains('found')) return;
      
      flag.classList.add('found');
      foundCount++;
      
      // Update score
      STATE.score += 20;
      document.getElementById('hud-score').textContent = STATE.score;

      setGameDialogue(`🚩 <span style="color: #c0392b; font-weight: bold;">Red Flag Found!</span> ${flag.dataset.exp}`);

      if (foundCount >= targetFlagsCount) {
        setTimeout(() => {
          showCaseCompleteScreen("⭐⭐⭐ Excellent!", LEVELS[STATE.currentLevelIndex].tip);
        }, 3000);
      }
    });
  });
}


// ══════════════════════════════════════════════════════════════════════════
// CASE 2: FRAUD / SORT SCAMS
// ══════════════════════════════════════════════════════════════════════════
function loadSortingPuzzle(container) {
  let index = 0;

  function renderNext() {
    if (index >= SORTING_SCENARIOS.length) {
      showCaseCompleteScreen("🏆 Perfect Filter!", LEVELS[STATE.currentLevelIndex].tip);
      return;
    }

    const current = SORTING_SCENARIOS[index];

    container.innerHTML = `
      <div class="sorting-container">
        <div style="font-family: var(--font-pixel); font-size: 0.55rem; color: var(--text-dark);">
          MESSAGE FILTER: ALERT ${index + 1} OF ${SORTING_SCENARIOS.length}
        </div>
        
        <div class="sorting-card">
          <p style="font-size: 1.1rem; line-height: 1.4;">"${current.text}"</p>
        </div>

        <div class="sorting-bins">
          <div class="sorting-bin" id="bin-legit">✓ LEGITIMATE</div>
          <div class="sorting-bin" id="bin-fraud">✗ FRAUDULENT</div>
        </div>
      </div>
    `;

    document.getElementById('bin-legit').addEventListener('click', () => handleChoice(false));
    document.getElementById('bin-fraud').addEventListener('click', () => handleChoice(true));
  }

  function handleChoice(choseFraud) {
    const current = SORTING_SCENARIOS[index];
    const isCorrect = choseFraud === current.isFraud;

    if (isCorrect) {
      STATE.score += 15;
      document.getElementById('hud-score').textContent = STATE.score;
      setGameDialogue(`✓ <span style="color:#00aa00; font-weight:bold;">Correct!</span> ${current.exp}`);
    } else {
      setGameDialogue(`✗ <span style="color:#cc0000; font-weight:bold;">Mistake.</span> ${current.exp}`);
    }

    index++;
    setTimeout(renderNext, 3000);
  }

  renderNext();
}


// ══════════════════════════════════════════════════════════════════════════
// CASE 3: SECURITY MATCH (MEMORY MATCH)
// ══════════════════════════════════════════════════════════════════════════
function loadMemoryPuzzle(container) {
  let items = [];
  
  // Prepare pairs
  MEMORY_PAIRS.forEach((p, idx) => {
    items.push({ id: idx, type: 'term', text: p.term });
    items.push({ id: idx, type: 'desc', text: p.desc });
  });

  // Shuffle items
  items.sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div style="font-family: var(--font-pixel); font-size: 0.55rem; color: var(--text-dark); margin-bottom: 12px; text-align: center;">
      Match the Security terms with their correct definitions!
    </div>
    <div class="memory-grid" id="mem-grid"></div>
  `;

  const grid = document.getElementById('mem-grid');
  let selected = [];
  let matchedPairs = 0;

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.textContent = '?';
    card.dataset.index = index;

    card.addEventListener('click', () => {
      if (card.classList.contains('flipped') || card.classList.contains('matched') || selected.length >= 2) {
        return;
      }

      card.classList.add('flipped');
      card.textContent = item.text;
      selected.push({ card, item });

      if (selected.length === 2) {
        const [a, b] = selected;
        
        if (a.item.id === b.item.id && a.item.type !== b.item.type) {
          // Match!
          matchedPairs++;
          STATE.score += 20;
          document.getElementById('hud-score').textContent = STATE.score;
          
          a.card.className = 'memory-card flipped matched';
          b.card.className = 'memory-card flipped matched';
          
          const fullInfo = MEMORY_PAIRS[a.item.id];
          setGameDialogue(`★ <span style="color:#00aa00; font-weight:bold;">Match!</span> ${fullInfo.term}: ${fullInfo.desc}`);
          
          selected = [];

          if (matchedPairs >= MEMORY_PAIRS.length) {
            setTimeout(() => {
              showCaseCompleteScreen("⭐⭐ Perfect Recall!", LEVELS[STATE.currentLevelIndex].tip);
            }, 3000);
          }
        } else {
          // No match, turn back
          setGameDialogue(`✗ Not a match. Remember their positions!`);
          setTimeout(() => {
            a.card.classList.remove('flipped');
            b.card.classList.remove('flipped');
            a.card.textContent = '?';
            b.card.textContent = '?';
            selected = [];
          }, 2000);
        }
      }
    });

    grid.appendChild(card);
  });
}


// ══════════════════════════════════════════════════════════════════════════
// CASE 4: DECODE SECURITY (WORD UNSCRAMBLE)
// ══════════════════════════════════════════════════════════════════════════
function loadUnscramblePuzzle(container) {
  let wordIndex = 0;

  function renderWord() {
    if (wordIndex >= UNSCRAMBLE_WORDS.length) {
      showCaseCompleteScreen("🔐 Towns Cryptographer!", LEVELS[STATE.currentLevelIndex].tip);
      return;
    }

    const item = UNSCRAMBLE_WORDS[wordIndex];
    
    // Scramble logic
    let scrambled = item.word.split('').sort(() => Math.random() - 0.5).join('');
    while (scrambled === item.word) {
      scrambled = item.word.split('').sort(() => Math.random() - 0.5).join('');
    }

    let inputLetters = [];

    container.innerHTML = `
      <div class="unscramble-container">
        <div style="font-family: var(--font-pixel); font-size: 0.55rem; color: var(--text-dark);">
          DECODE CIPHER: ${wordIndex + 1} OF ${UNSCRAMBLE_WORDS.length}
        </div>
        
        <div style="font-size: 0.95rem; font-style: italic; text-align: center; color: var(--wood-medium);">
          Hint: ${item.hint}
        </div>

        <div class="answer-slots" id="ans-slots">
          ${item.word.split('').map(() => `<div class="answer-slot"></div>`).join('')}
        </div>

        <div class="scrambled-letters" id="letters-container">
          ${scrambled.split('').map((char, i) => `<div class="letter-tile" data-char="${char}" data-idx="${i}">${char}</div>`).join('')}
        </div>

        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <button id="unscramble-clear" class="stardew-btn" style="padding: 6px 12px; font-size: 0.65rem;">CLEAR</button>
          <button id="unscramble-check" class="stardew-btn" style="padding: 6px 12px; font-size: 0.65rem;">CHECK</button>
        </div>
      </div>
    `;

    const tiles = container.querySelectorAll('.letter-tile');
    const slots = container.querySelectorAll('.answer-slot');

    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (tile.classList.contains('used') || inputLetters.length >= item.word.length) return;

        tile.classList.add('used');
        const pos = inputLetters.length;
        inputLetters.push({ char: tile.dataset.char, idx: tile.dataset.idx });
        
        slots[pos].textContent = tile.dataset.char;
      });
    });

    document.getElementById('unscramble-clear').addEventListener('click', () => {
      inputLetters = [];
      tiles.forEach(t => t.classList.remove('used'));
      slots.forEach(s => s.textContent = '');
    });

    document.getElementById('unscramble-check').addEventListener('click', () => {
      const attempt = inputLetters.map(l => l.char).join('');
      
      if (attempt === item.word) {
        STATE.score += 25;
        document.getElementById('hud-score').textContent = STATE.score;
        setGameDialogue(`✓ <span style="color:#00aa00; font-weight:bold;">Excellent!</span> ${item.word}: ${item.fact}`);
        
        wordIndex++;
        setTimeout(renderWord, 3500);
      } else {
        setGameDialogue(`✗ That does not match the encryption index. Try again!`);
        // Reset slots
        inputLetters = [];
        tiles.forEach(t => t.classList.remove('used'));
        slots.forEach(s => s.textContent = '');
      }
    });
  }

  renderWord();
}


// ══════════════════════════════════════════════════════════════════════════
// CASE 5: TOWN PATROL (QUIZ SCENARIOS)
// ══════════════════════════════════════════════════════════════════════════
function loadQuizPuzzle(container) {
  let index = 0;

  function renderNext() {
    if (index >= QUIZ_QUESTIONS.length) {
      showCaseCompleteScreen("🛡️ Town Savior!", LEVELS[STATE.currentLevelIndex].tip);
      return;
    }

    const current = QUIZ_QUESTIONS[index];
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div style="font-family: var(--font-pixel); font-size: 0.55rem; color: var(--text-dark); margin-bottom: 12px; text-align: center;">
        DECISION MAKER: PATHWAY ${index + 1} OF ${QUIZ_QUESTIONS.length}
      </div>

      <p style="font-size: 1rem; line-height: 1.4; color: var(--text-dark); margin-bottom: 16px; font-weight: bold;">
        ${current.question}
      </p>

      <div class="quiz-options">
        ${current.options.map((opt, i) => `
          <div class="quiz-option" data-idx="${i}">
            <div class="quiz-option-letter">${letters[i]}</div>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const chosen = parseInt(opt.dataset.idx);
        
        // Highlight answers
        container.querySelectorAll('.quiz-option').forEach((el, elIdx) => {
          if (elIdx === current.correct) {
            el.className = 'quiz-option correct';
          } else if (elIdx === chosen) {
            el.className = 'quiz-option wrong';
          }
        });

        if (chosen === current.correct) {
          STATE.score += 30;
          document.getElementById('hud-score').textContent = STATE.score;
          setGameDialogue(`✓ <span style="color:#00aa00; font-weight:bold;">Safe Choice!</span> ${current.explanation}`);
        } else {
          setGameDialogue(`✗ <span style="color:#cc0000; font-weight:bold;">Dangerous Route.</span> ${current.explanation}`);
        }

        index++;
        setTimeout(renderNext, 4000);
      });
    });
  }

  renderNext();
}


// ─── Case Complete Display Screen ─────────────────────────────────────────
function showCaseCompleteScreen(titleText, tipText) {
  document.getElementById('level-complete-title').textContent = titleText;
  document.getElementById('fraud-tip-text').textContent = tipText;
  
  showScreen('level-complete');
}
