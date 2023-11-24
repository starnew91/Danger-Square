
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 370,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var player;
var platforms;
var cursors;
var score = 0;
var scoreText;
var bars;
var leftButton;
var rightButton;
var roof;
var isGameOver = false;
var woods;
var restartButton;
var barSpeed = -150;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('roof', 'assets/roof.png');
    this.load.image('bar', 'assets/bar-image.png');
    this.load.image('player', 'assets/player-image.png');
    this.load.image('sadplayer', 'assets/sadplayer.png');
    this.load.image('leftButton', 'assets/leftbutton.png');
    this.load.image('rightButton', 'assets/rightbutton.png');
    this.load.image('wood', 'assets/wood.png');
    this.load.image('restartButton', 'assets/restartbutton.png');
    this.load.audio('backgroundMusic', 'assets/backgroundMusic.mp3');
    this.load.audio('collectWood', 'assets/collectWood.mp3');
    this.load.audio('gameOverSound', 'assets/gameOver.mp3');
}

function create() {
    this.add.image(400, 185, 'background');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 340, 'ground').setScale(2).refreshBody();

    player = this.physics.add.sprite(400, 250, 'player');
    player.setOrigin(0.5, 0.5).setDisplaySize(80, 80);
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    var backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
    backgroundMusic.play();

    scoreText = this.add.text(16, 40, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    bars = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    generateBars.call(this);

    this.physics.add.collider(player, bars, playerHitBar, null, this);

    roof = this.physics.add.staticGroup();
    roof.create(400, 0, 'roof').setScale(2).refreshBody();
    this.physics.add.collider(player, roof, gameOver, null, this);

    woods = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    generateWoods.call(this);

    leftButton = this.add.image(65, 305, 'leftButton').setInteractive();
    leftButton.setOrigin(0.5, 0.5).setDisplaySize(75, 75);
    leftButton.on('pointerdown', function () {
        player.setVelocityX(-450);
    });
    leftButton.on('pointerup', function () {
        player.setVelocityX(0);
    });

    rightButton = this.add.image(700, 305, 'rightButton').setInteractive();
    rightButton.setOrigin(0.5, 0.5).setDisplaySize(75, 75);
    rightButton.on('pointerdown', function () {
        player.setVelocityX(450);
    });
    rightButton.on('pointerup', function () {
        player.setVelocityX(0);
    });

    restartButton = this.add.image(750, 70, 'restartButton').setInteractive();
    restartButton.setOrigin(0.5, 0.5).setDisplaySize(60, 60);
    restartButton.on('pointerdown', function () {
        restartGame.call(this);
    }.bind(this));

    this.physics.world.setBoundsCollision(true, true, true, true);
}

function update() {
    if (!isGameOver) {
        player.x = Phaser.Math.Clamp(player.x, 0, game.config.width - player.width / 2);

        scoreText.setText('Score: ' + score);

        bars.children.iterate(function (bar) {
            if (bar.y < -50) {
                bar.setY(game.config.height + 50);
                bar.setX(Phaser.Math.Between(0, game.config.width));                
                bar.setVelocityY(barSpeed);
            }
        });
    }
}

function playerHitBar(player, bar) {
    if (!isGameOver) {
    }
}

function gameOver() {
    if (!isGameOver) {
        isGameOver = true;
        player.setTexture('sadplayer');
        this.physics.pause();

        var gameOverSound = this.sound.add('gameOverSound');
        gameOverSound.play();
    }
}

function generateBars() {
    bars.clear(true, true);

    for (var i = 0; i < 3; i++) {
        var x = Phaser.Math.Between(0, game.config.width);
        var y = game.config.height + 50 + i * 120;
        var bar = bars.create(x, y, 'bar');
        bar.setOrigin(0.5, 0.5);        
        bar.setScale(0.5);

        bar.setVelocityY(barSpeed); 
        
    }
}

function generateWoods() {
    woods.clear(true, true);

    for (var i = 0; i < 6; i++) {
        var x = i * 130 + 50;
        var y = 250;
        var wood = woods.create(x, y, 'wood');
        wood.setScale(0.65);
        wood.setImmovable(true);
    }

    this.physics.add.collider(woods, platforms);
    this.physics.add.overlap(woods, player, playerHitWood, null, this);
}

function playerHitWood(player, wood) {
    if (!isGameOver) {
        wood.setAlpha(0);
        wood.disableBody(true, true);
        score += 10;

        var hitSound = this.sound.add('collectWood');
        hitSound.play();

        if (woods.countActive() === 0) {
            generateWoods.call(this);
            bars.setVelocityY(-110);
        }
    }
}

function restartGame() {
    isGameOver = false;
    player.setTexture('player');
    this.physics.resume();
    score = 0;
    scoreText.setText('Score: 0');    
    generateWoods.call(this);
    generateBars.call(this);    
}
