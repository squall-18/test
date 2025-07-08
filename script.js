const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const puzzleModal = document.getElementById('puzzle-modal');
const puzzleContent = document.getElementById('puzzle-content');
const submitPuzzle = document.getElementById('submit-puzzle');
const playerPoints = document.getElementById('player-points');
const leaderboardList = document.getElementById('leaderboard-list');

const gridSize = 5;
const cellSize = 100;
let eggs = [];
let points = parseInt(localStorage.getItem('points') || '0');
let currentEgg = null;

playerPoints.textContent = points;

// Egg types
const eggTypes = [
  { type: 'transparent', img: new Image(), src: 'assets/egg1.png', puzzle: 'math' },
  { type: 'zk', img: new Image(), src: 'assets/egg2.png', puzzle: 'trivia', hidden: true },
  { type: 'multi-sig', img: new Image(), src: 'assets/egg3.png', puzzle: 'circuit' },
  { type: 'mystery', img: new Image(), src: 'assets/egg4.png', puzzle: 'random' }
];

// Load egg images
eggTypes.forEach(egg => {
  egg.img.src = egg.src;
});

// Draw grid and eggs
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      const egg = eggs.find(e => e.x === i && e.y === j && !e.hidden);
      if (egg) {
        ctx.drawImage(egg.img, i * cellSize + 10, j * cellSize + 10, 80, 80);
      }
    }
  }
  // Draw characters
  const char1 = new Image();
  char1.src = 'assets/character1.png';
  char1.onload = () => ctx.drawImage(char1, 0, canvas.height - 50, 50, 50);
  const char2 = new Image();
  char2.src = 'assets/character2.png';
  char2.onload = () => ctx.drawImage(char2, canvas.width - 50, canvas.height - 50, 50, 50);
}

// Spawn eggs every 30 seconds (simulated)
function spawnEggs() {
  eggs = [];
  for (let i = 0; i < 1; i++) { // Reduce to 1 egg per spawn
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const type = eggTypes[Math.floor(Math.random() * eggTypes.length)];
    eggs.push({ x, y, ...type });
  }
  drawGrid();
}

spawnEggs();
setInterval(spawnEggs, 3 * 60 * 60 * 1000); // 3 hours

// Handle egg click
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  currentEgg = eggs.find(egg => egg.x === x && egg.y === y);
  if (currentEgg) {
    showPuzzle(currentEgg);
  }
});

// Show puzzle
function showPuzzle(egg) {
  puzzleModal.classList.remove('hidden');
  switch (egg.puzzle) {
    case 'math':
      puzzleContent.innerHTML = `
        <p>Solve: 5 + 3 = ?</p>
        <input type="number" id="puzzle-input">
      `;
      submitPuzzle.onclick = () => checkAnswer(egg, 8);
      break;
    case 'trivia':
      puzzleContent.innerHTML = `
        <p>What does ZK stand for?</p>
        <input type="text" id="puzzle-input">
      `;
      submitPuzzle.onclick = () => checkAnswer(egg, 'zero knowledge');
      break;
    case 'circuit':
      puzzleContent.innerHTML = `
        <p>Drag the circuit piece to complete.</p>
        <div id="circuit-drop">Drop here</div>
      `;
      submitPuzzle.onclick = () => checkAnswer(egg, true); // Simulated
      break;
    case 'random':
      puzzleContent.innerHTML = `<p>Luck-based egg!</p>`;
      submitPuzzle.onclick = () => rewardRandom(egg);
      break;
  }
}

// Check puzzle answer
function checkAnswer(egg, correct) {
  const input = document.getElementById('puzzle-input')?.value.toLowerCase() || true;
  if (input == correct) {
    points += 10;
    localStorage.setItem('points', points);
    playerPoints.textContent = points;
    eggs = eggs.filter(e => e !== currentEgg);
    puzzleModal.classList.add('hidden');
    drawGrid();
    if (Math.random() < 0.2) {
      showMeme();
    }
  } else {
    alert('Wrong answer!');
  }
}

// Random mystery egg reward
function rewardRandom(egg) {
  const outcomes = [
    () => (points += 20, alert('Gained 20 points!')),
    () => (points -= 10, alert('Lost 10 points!')),
    () => showMeme()
  ];
  outcomes[Math.floor(Math.random() * outcomes.length)]();
  eggs = eggs.filter(e => e !== currentEgg);
  puzzleModal.classList.add('hidden');
  drawGrid();
  localStorage.setItem('points', points);
  playerPoints.textContent = points;
}

// Show meme
function showMeme() {
  const memes = ['assets/meme1.jpg', 'assets/meme2.jpg'];
  puzzleContent.innerHTML = `<img src="${memes[Math.floor(Math.random() * memes.length)]}" width="200">`;
  setTimeout(() => puzzleModal.classList.add('hidden'), 3000);
}

// Update leaderboard (mock)
function updateLeaderboard() {
  leaderboardList.innerHTML = `
    <li>Player1: 100</li>
    <li>Player2: 80</li>
    <li>Player3: 60</li>
    <li>Player4: 40</li>
    <li>Player5: 20</li>
  `;
}
updateLeaderboard();

// Reveal ZK-egg with hint
function revealZKEgg(x, y) {
  const egg = eggs.find(e => e.x === x && e.y === y && e.hidden);
  if (egg) {
    egg.hidden = false;
    drawGrid();
  }
}
// Example: revealZKEgg(3, 2); // Call via console or UI button