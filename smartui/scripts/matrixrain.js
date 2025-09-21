// ✅ Active version: matrixrain.js (Updated 4 May 2025 14:00)
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// Set canvas full screen
canvas.width = 1410;
canvas.height = 1200;

// Characters
const letters = 'アァイィウヴエェオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);

// Drops - one per column
const drops = Array(columns).fill(1);

// Draw function
function drawMatrixRain() {
  // Black background with translucent effect for trailing
  ctx.fillStyle = 'rgba(236, 236, 236, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Green text
  ctx.fillStyle = '#568c34';
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    const x = i * fontSize;

    ctx.fillText(text, x, y * fontSize);

    if (y * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  });
}

// Animate
setInterval(drawMatrixRain, 33);

