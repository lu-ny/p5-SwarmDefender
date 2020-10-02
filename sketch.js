// I originally wanted to create a 'DEFENDER' inspired dogfighting game, 
// but it turned out very similar to the game 'LUFTRAUSERS'
// utilizes p5.play
// next steps: add real sprites/png
            // add variety of enemies & powerups
// sugr7650@colorado.edu

var player;
var enemy;
var enemyInterval;
var enemies;
var bullets;
var shipImage; 
var bulletImage;
var MARGIN = 40;
var SCENE_W = 4000;
var SCENE_H = 1660;
var gravity;
var gameOver;
var points;
var score=0;
var highscore=0;
var enemyBullet;
var enemyBullets;

//function preload() {
  // load in PNG sprites here instead of drawing squares
//}

function setup() {
  c=createCanvas(windowWidth, windowHeight);
  c.position(0, 0);

  angleMode(DEGREES);

//create player 
  playerImage = createImage(32,32);
  playerImage.loadPixels();
    for (let i = 0; i < playerImage.width; i++) {
      for (let j = 0; j < playerImage.height; j++) {
        playerImage.set(i, j, color(255));
      }
    }
  playerImage.updatePixels();
  player = createSprite(width/2, height/2);
  player.setCollider('circle', 0, 0, 28);
  player.addImage(playerImage);
  player.maxSpeed = 10;
  player.friction=0.05
  
//create ground image & sprite
  groundImage = createImage(100,100)
  groundImage.loadPixels();
    for (let i = 30; i < width - 15; i++) {
      for (let j = 20; j < height - 25; j++) {
        let c = color(204 - j, 153 - i, 0);
        set(i, j, c);
      }
    }
  ground = createSprite(SCENE_W/2, SCENE_H+10, SCENE_W*2,100); 

//create bullet images
  bulletImage = createImage(12,12);
  bulletImage.loadPixels();
  for (let i=0; i<bulletImage.width; i++) {
    for (let j=0; j<bulletImage.height/3;j++) {
      bulletImage.set(i, j, color(0,255,0));
    }
  }
  bullets = new Group();  
  enemyBullets = new Group();
  
//create enemy image
  enemyImage = createImage(32,32);
  enemyImage.loadPixels();
    for (let i = 0; i < enemyImage.width; i++) {
      for (let j = 0; j < enemyImage.height; j++) {
        enemyImage.set(i, j, color(100, 50, 92));
      }
    }
  enemyImage.updatePixels();
  enemies = new Group();
  
// set starting condition 
  gameOver=true;
  updateSprites(false);
}

function draw() {
  background(50);
  
// tree placement  
  for (let i=1; i<20; i++){
    rect(map(i,1,20,1,SCENE_W),SCENE_H-50,25,50);
  }
  
// if game is over and click x then start new game  
  if (gameOver) {
    camera.position.x=width/2;
    camera.position.y=height/2;
    fill(255);
    text('Left & Right arrows to rotate; up arrow to accelerate, Z to shoot; Press X to begin', windowWidth/2-45, windowHeight/2+32,150);
    text('Your Score:'+score, windowWidth/2-32, windowHeight/2-32,150)
    text('Highscore:'+ highscore, windowWidth/2-32, windowHeight/2-64,150)
  }
  
  if(gameOver && keyWentDown('x')) {
    newGame();
  }

  if(!gameOver) {
//kill if player hits the ground
    if (player.position.y >= SCENE_H) {
      player.position.y=SCENE_H;
      die();
    }
// in case of player flying too high, change y velocity to bounce back   
    if (player.position.y <= 0) {
      player.velocity.y+=15;
    }    

//wrapping screen
    for(var i=0; i<allSprites.length; i++) {
      var s = allSprites[i];
      if(s.position.x<-MARGIN) {
        s.position.x = SCENE_W+MARGIN;
      }
      if(s.position.x>SCENE_W+MARGIN) {
        s.position.x = -MARGIN; 
      }
    }

// camera controls    
    if (camera.position.y<=SCENE_H-(windowHeight/2) && camera.position.y>=0+(windowHeight/2)) {
      camera.position.x=player.position.x-(3*player.velocity.x);
      camera.position.y=player.position.y-(3*player.velocity.y);
    }
    if (camera.position.y>SCENE_H-(windowHeight/2) || camera.position.y<0+(windowHeight/2)) {
      camera.position.x=player.position.x-(3*player.velocity.x);
      if (player.position.y<=SCENE_H-(windowHeight/2) && player.position.y>=0+(windowHeight/2)) {
        camera.position.x=player.position.x-(3*player.velocity.x);
        camera.position.y=player.position.y-(3*player.velocity.y);
      }
    }    

// movement control  
    if(keyDown(LEFT_ARROW)) {
      player.rotation -= 4;
    }
    if(keyDown(RIGHT_ARROW)) {
      player.rotation += 4;
    }
    if(keyDown(UP_ARROW)) {
        player.addSpeed(5,player.rotation)
    }
    
//apply gravity
    if (player.velocity.y>-2){
      player.velocity.y+=gravity
    }
  
//shooting
    if(keyWentDown('z')) {
      var bullet = createSprite(player.position.x, player.position.y);
      bullet.addImage(bulletImage);
      bullet.setSpeed(10+player.getSpeed(), player.rotation);
      bullet.life = 30;
      bullet.rotateToDirection = true;
      bullets.add(bullet);
      bulletImage.updatePixels();
    } 

// set enemy behavior    
    for (let i=0; i<enemies.length;i++) {
      en = enemies[i];
      en.bounce(enemies)
      en.maxSpeed = 3;
      en.life = 3;
      if (abs(en.position.x-player.position.x)<1000) {
        en.attractionPoint(0.08, player.position.x+random(10,100), player.position.y+random(10,100))
      }
      else {
        en.attractionPoint(0.5, player.position.x+random(10,100), player.position.y+random(10,100))
      }
      
    }
    enemies.overlap(bullets, enemyHit)
    enemies.overlap(player, die)
    enemyBullets.overlap(player,die)
    
  }//end of !gameover if loop
    
  print(score);
  drawSprites(); 
  
} //end of draw loop


function drawEnemy() {
  if (enemies.length<=50) {
    var ax = random(50, SCENE_W-50);
    var ay = random(50, SCENE_H-50);
    enemy = createSprite(ax,ay);
    enemy.setCollider('circle', 0, 0, 28);
    enemy.addImage(enemyImage);
    enemy.attractionPoint(2, player.position.x, player.position.y);
    enemy.rotateToDirection=true;
    enemy.maxSpeed = 6;
    enemies.add(enemy); 
  } 
}

function enemyShoot() {
  enemybulletImage = createImage(12,12); //create image for enemy bullets
  enemybulletImage.loadPixels();
  for (let i=0; i<enemybulletImage.width; i++) {
    for (let j=0; j<enemybulletImage.height/3;j++) {
      enemybulletImage.set(i, j, color(255,0,0));
    }
  }
  for (let i=0; i<enemies.length;i++) {
    en = enemies[i];
    if (abs(en.position.x-player.position.x)<100) { //only shoot when a certain distance from the player
      var enemyBullet = createSprite(en.position.x, en.position.y);
      enemyBullet.addImage(enemybulletImage);
      enemyBullet.setSpeed(10+en.getSpeed(), en.rotation);
      enemyBullet.life = 30;
      enemyBullet.rotateToDirection = true;
      enemyBullets.add(enemyBullet);
    }
  }
  enemybulletImage.updatePixels();
}

function enemyHit(enemy, bullet) {
  enemy.remove();
  bullet.remove();
  score++
  if (score>highscore) {
    highscore = score;
  }
}

function die() {
  enemies.removeSprites();
  bullets.removeSprites();
  updateSprites(false);
  //animation for ship exploding here
  gameOver = true;
  gravity=0;
  player.velocity.x=0;
  player.velocity.y=0;
  clearInterval(enemyInterval);
  clearInterval(shootingInterval)
  //camera.off();
}

function newGame() {
  gameOver = false;
  enemies.removeSprites();
  bullets.removeSprites();
  updateSprites(true);
  camera.on();
  player.position.x = windowWidth/2;
  player.position.y = windowHeight/2;
  player.rotation=0;
  gravity=0.3;
  enemyInterval = setInterval(drawEnemy, 1000); //call function to draw enemy every 1s
  shootingInterval = setInterval(enemyShoot, 1000); //call function to draw enemy every 1s
  score=0;
}
