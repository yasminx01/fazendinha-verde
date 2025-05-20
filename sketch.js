let caminhao;
let imgCaminhao;
let alimentos = [];
let obstaculos = [];
let pontuacao = 0;
let vidas = 3;
let velocidade = 2;
let jogoAtivo = false;
let jogoIniciado = false;
let timerItens = 0;
let timerObstaculos = 0;

let contagemMaça = 0;
let contagemMilho = 0;
let contagemCenoura = 0;
let recorde = 0;

let somColeta, somColisao, musica;

function preload() {
  imgCaminhao = loadImage("caminhao.png");
  somColeta = loadSound("somColeta.mp3");
  somColisao = loadSound("somColisao.mp3");
  musica = loadSound("musica.mp3");
}

function setup() {
  createCanvas(800, 400);
  caminhao = {
    x: 50,
    y: height / 2,
    largura: 120,
    altura: 70
  };
  textAlign(CENTER, CENTER);
  textSize(32);

  if (getItem("recorde")) {
    recorde = int(getItem("recorde"));
  }
}

function draw() {
  background(135, 206, 235);

  if (!jogoIniciado) {
    telaInicial();
  } else if (jogoAtivo) {
    jogar();
  } else {
    telaGameOver();
  }
}

function telaInicial() {
  fill(0, 100);
  rect(0, 0, width, height);
  fill(255);
  textSize(36);
  text("🚛 Corrida da Colheita 🐄", width / 2, height / 2 - 60);
  textSize(20);
  text("Use as setas ↑ e ↓ para mover o caminhão", width / 2, height / 2 - 10);
  text("Colete os alimentos e evite os obstáculos!", width / 2, height / 2 + 20);
  text("Pressione ENTER para começar", width / 2, height / 2 + 60);
  text("🏆 Recorde atual: " + recorde, width / 2, height / 2 + 100);
}

function jogar() {
  fill(34, 139, 34);
  rect(0, height - 50, width, 50);

  image(imgCaminhao, caminhao.x, caminhao.y, caminhao.largura, caminhao.altura);

  if (keyIsDown(UP_ARROW)) caminhao.y -= 5;
  if (keyIsDown(DOWN_ARROW)) caminhao.y += 5;
  caminhao.y = constrain(caminhao.y, 0, height - caminhao.altura - 50);

  timerItens++;
  timerObstaculos++;

  const intervaloBase = 60;
  const fatorVelocidade = min(5, velocidade);

  if (timerItens > (intervaloBase / fatorVelocidade)) {
    alimentos.push({
      x: width + random(50, 150),
      y: random(50, height - 100),
      emoji: random(["🍎", "🌽", "🥕"])
    });
    timerItens = 0;
  }

  if (timerObstaculos > (intervaloBase * 1.5 / fatorVelocidade)) {
    obstaculos.push({
      x: width + random(50, 150),
      y: random(50, height - 100),
      emoji: random(["🕳️", "🐄"])
    });
    timerObstaculos = 0;
  }

  for (let i = alimentos.length - 1; i >= 0; i--) {
    alimentos[i].x -= velocidade;
    textSize(32);
    text(alimentos[i].emoji, alimentos[i].x, alimentos[i].y);

    if (colidiuComCaminhao(alimentos[i])) {
      pontuacao++;
      switch (alimentos[i].emoji) {
        case "🍎": contagemMaça++; break;
        case "🌽": contagemMilho++; break;
        case "🥕": contagemCenoura++; break;
      }
      somColeta.play();
      alimentos.splice(i, 1);
      if (pontuacao % 5 === 0) velocidade += 0.5;
    } else if (alimentos[i].x < -50) {
      alimentos.splice(i, 1);
    }
  }

  for (let i = obstaculos.length - 1; i >= 0; i--) {
    obstaculos[i].x -= velocidade;
    textSize(32);
    text(obstaculos[i].emoji, obstaculos[i].x, obstaculos[i].y);

    if (colidiuComCaminhao(obstaculos[i])) {
      vidas--;
      somColisao.play();
      obstaculos.splice(i, 1);
      if (vidas <= 0) {
        jogoAtivo = false;
        if (pontuacao > recorde) {
          recorde = pontuacao;
          storeItem("recorde", recorde);
        }
        musica.stop();
      }
    } else if (obstaculos[i].x < -50) {
      obstaculos.splice(i, 1);
    }
  }

  fill(0);
  textSize(18);
  textAlign(LEFT);
  text("🍎: " + contagemMaça, 10, 20);
  text("🌽: " + contagemMilho, 10, 45);
  text("🥕: " + contagemCenoura, 10, 70);
  textAlign(RIGHT);
  text("Pontos: " + pontuacao, width - 10, 30);
  text("Vidas: " + vidas, width - 10, 60);
}

function colidiuComCaminhao(item) {
  return item.x > caminhao.x &&
         item.x < caminhao.x + caminhao.largura &&
         item.y > caminhao.y &&
         item.y < caminhao.y + caminhao.altura;
}

function telaGameOver() {
  background(0, 0, 0, 200);
  fill(255);
  textSize(36);
  textAlign(CENTER, CENTER);
  text("Fim de jogo!", width / 2, height / 2 - 150);
  textSize(24);
  text("Pontuação: " + pontuacao, width / 2, height / 2 - 50);
  text("🍎 Maçãs: " + contagemMaça, width / 2, height / 2 - 20);
  text("🌽 Milhos: " + contagemMilho, width / 2, height / 2 + 10);
  text("🥕 Cenouras: " + contagemCenoura, width / 2, height / 2 + 40);
  text("🏆 Recorde: " + recorde, width / 2, height / 2 + 80);
  text("Pressione 'R' para reiniciar", width / 2, height / 2 + 120);
}

function keyPressed() {
  if (!jogoIniciado && keyCode === ENTER) {
    jogoIniciado = true;
    jogoAtivo = true;
    musica.loop();
  }

  if (!jogoAtivo && key === 'r') {
    reiniciarJogo();
  }
}

function reiniciarJogo() {
  pontuacao = 0;
  vidas = 3;
  velocidade = 2;
  alimentos = [];
  obstaculos = [];
  timerItens = 0;
  timerObstaculos = 0;
  contagemMaça = 0;
  contagemMilho = 0;
  contagemCenoura = 0;
  caminhao.y = height / 2;
  jogoAtivo = true;
  musica.loop();
}
