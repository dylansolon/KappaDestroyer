// Player object containing player-related properties and functions
const playerKappa = document.getElementById("kappa");
const boss1Img = document.getElementById("boss1");

// Check the score periodically
const checkScoreInterval = setInterval(function () {
    // Get the current score
    const currentScore = player.getCodaPoint();

    // Check if the score is greater than or equal to 100,000
    if (currentScore >= 100000) {
        // Redirect to win.html if the condition is met
        window.location.href = "win.html";

        // Clear the interval to stop further checks
        clearInterval(checkScoreInterval);
    }
}, 200); // Check every 0.5 seconds (200 milliseconds)

let player = {
    speed: 7,
    codaPoint: 0,
    level: {
        current: 0,
        damage: {
            1: 250, 2: 400, 3: 500,
            4: 500, 5: 500, 6: 500,
            7: null
        },
        heightScore: {
            0: 1000, 1: 5000, 2: 15000,
            3: 30000, 4: 50000, 5: 75000,
            6: 1000000
        }
    },
    weapon: {
        damage: 100,
    },
    levelUp: function () {
        this.level.current += 1;
        this.weapon.damage = this.level.damage[this.level.current];
        document.getElementById("level").innerHTML = player.getLevel();
    },
    scoreUp: function () {
        this.codaPoint += this.weapon.damage;
        document.getElementById("score").innerHTML = player.getCodaPoint();
    },
    dead: function () {
        this.codaPoint = 0;
        this.level.current = 0;
        this.weapon.damage = 100;
        opponent.setOpponent();
    },
    getCodaPoint: function () {
        return this.codaPoint;
    },
    setKappa: function (playerKappa) {
        this.src = `assets/img/kappa_level${this.level.current}.png`;
        playerKappa.removeAttribute("src");
        playerKappa.setAttribute("src", this.src);
    },
    setSpeed: function () {
        this.speed += 1;
    },
    getLevel: function () {
        return this.level.current;
    }
};

// Set initial kappa and opponent images
player.setKappa(playerKappa);
let opponent = {
    vitesse: 5,
    src: "",
    setOpponent: function () {
        this.src = `assets/img/code_level${player.level.current}.png`;
        boss1Img.removeAttribute("src");
        boss1Img.setAttribute("src", this.src);
    },
    getSrc: function () {
        return this.src;
    },
    setVitesse: function () {
        this.vitesse += 1;
    }
};

opponent.setOpponent();

// Set initial score and level on the HTML page
document.getElementById("score").innerHTML = player.getCodaPoint();
document.getElementById("level").innerHTML = player.getLevel();

// Get necessary HTML elements
const kappa = document.getElementById("kappa");
const myBg = document.getElementById("myBg");
const boss1 = document.getElementById("boss1");

// Initialize player and game state variables
let speed = player.speed;
let positionX = 5;
let positionY = 5;
let direction = 1;
let isMoving = false;
let animationId;
let spaceKeyPressed = false;
let isGameActive = true;

// Function to reset various values after game events
function resetValue() {
    cancelAnimationFrame(animationId);
    isAnimationRunning = false;
    isMoving = false;
    speed = 7;
    direction = 1;
    positionX = 5;
    positionY = 5;
    kappa.style.left = positionX + "px";
    kappa.style.top = positionY + "px";
    boss1Img.style.right = "0px";
    boss1Img.style.top = "0px";
}

// Initialize boss hit effect animation variables
let bossHitAnimationId; // Animation ID for the blinking effect
let bossHitDuration = 500; // Duration of the blinking effect in milliseconds.


// Function to create a hit effect on the boss
function bossHitEffect() {
    let startTime = null;

    // Function for blinking effect
    function blinkBoss(timestamp) {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;

        // Apply blinking effect
        if (elapsed < bossHitDuration) {
            boss1Img.style.opacity = (elapsed % 100 < 50) ? 0 : 1; // Change opacity to create a blinking effect
            bossHitAnimationId = requestAnimationFrame(blinkBoss);
        } else {
            boss1Img.style.opacity = 1; // Restore opacity to its normal value
        }
    }

    // Cancel any existing hit effect animation
    cancelAnimationFrame(bossHitAnimationId);

    // Start the blinking animation
    bossHitAnimationId = requestAnimationFrame(blinkBoss);
}

// Function to reset the boss hit effect
function resetBossHitEffect() {
    // Cancel the current blinking animation
    cancelAnimationFrame(bossHitAnimationId);

    // Restore the boss's opacity to its normal value
    boss1Img.style.opacity = 1;
}

// Function to reset a bullet after hitting the boss
function resetBullet(bullet) {
    // Remove the bullet from the DOM
    bullet.remove();

    // Cancel the bullet's animation frame
    cancelAnimationFrame(bullet.animationId);
}

// Function to check for collisions between kappa, boss, and bullets
function checkCollision() {
    if (isGameActive) {
        // Calculate the position and size of the kappa and the boss
        const kappaRect = kappa.getBoundingClientRect();
        const boss1Rect = boss1.getBoundingClientRect();

        // Check for collision between kappa and boss
        if (
            kappaRect.left < boss1Rect.right &&
            kappaRect.right > boss1Rect.left &&
            kappaRect.top < boss1Rect.bottom &&
            kappaRect.bottom > boss1Rect.top
        ) {
            // Collision detected with the boss
            isGameActive = false;
            resetValue();

            // Stop the movement
            direction = 0;

            // Play death sound
            const deathSound = document.getElementById('deathSound');
            deathSound.currentTime = 0; // Reset the sound to the beginning if it's already playing
            deathSound.play();

            // Display death modal
            const deathModal = document.getElementById('deathModal');
            deathModal.style.display = 'block';

            // Add click event listener to restart button
            const restartButton = document.getElementById('restartButton');
            restartButton.addEventListener('click', function () {
                window.location.reload();
            });

			// Add keydown event listener to document for Enter key
			document.addEventListener('keydown', function (event) {
    			// Check if the Enter key is pressed
    			if (event.key === 'Enter') {
        			// Check if the death modal is currently displayed
        			const deathModal = document.getElementById('deathModal');
        		if (deathModal.style.display === 'block') {
            		// Reload the window if the death modal is displayed and Enter key is pressed
            		window.location.reload();
        			}
				}
});
        }

        // Check for collision with the boss and trigger hit effect
        const bullets = document.getElementsByClassName('bullet');
        for (let bullet of bullets) {
            const bulletRect = bullet.getBoundingClientRect();

            // Check for collision between bullet and boss
            if (
                bulletRect.left < boss1Rect.right &&
                bulletRect.right > boss1Rect.left &&
                bulletRect.top < boss1Rect.bottom &&
                bulletRect.bottom > boss1Rect.top
            ) {
                // Boss hit by a bullet
                bossHitEffect();

                // Increase the player's score
                player.scoreUp();

                // Reset the bullet after hitting the boss
                resetBullet(bullet);
            }
        }
    }
}

// Function to initiate continuous collision detection
function startCollisionDetection() {
    checkCollision();
    requestAnimationFrame(startCollisionDetection);
}

// Start the collision detection loop
startCollisionDetection();

// Function to check and handle horizontal boundaries
function checkHorizontal() {
    if (positionX + speed > window.innerWidth - kappa.offsetWidth || positionX + speed < 0) {
        // Reverse the direction if hitting horizontal boundaries
        direction /= -1;
    }
}

// Function to check and handle vertical boundaries
function checkVertical() {
    if (positionY + speed > window.innerHeight - kappa.offsetHeight || positionY + speed < 0) {
        // Reverse the direction if hitting vertical boundaries
        direction /= -1;
    }
}

// Function to animate kappa moving to the left
function animateKappaLeft() {
    if (isGameActive) {
        // Update the horizontal position to move left
        positionX -= direction * speed;
        
        // Set the new left position for kappa
        kappa.style.left = positionX + "px";
        
        // Check for collision with obstacles
        checkCollision();

        // Check for horizontal boundaries
        checkHorizontal();

        // Request the next animation frame
        animationId = requestAnimationFrame(animateKappaLeft);
    }
}

// Function to animate kappa moving to the right
function animateKappaRight() {
    if (isGameActive) {
        // Update the horizontal position to move right
        positionX += direction * speed;
        
        // Set the new left position for kappa
        kappa.style.left = positionX + "px";
        
        // Check for collision with obstacles
        checkCollision();

        // Check for horizontal boundaries
        checkHorizontal();

        // Request the next animation frame
        animationId = requestAnimationFrame(animateKappaRight);
    }
}

// Function to animate kappa moving upwards
function animateKappaTop() {
    if (isGameActive) {
        // Update the vertical position to move up
        positionY -= direction * speed;
        
        // Set the new top position for kappa
        kappa.style.top = positionY + "px";
        
        // Check for collision with obstacles
        checkCollision();

        // Check for vertical boundaries
        checkVertical();

        // Request the next animation frame
        animationId = requestAnimationFrame(animateKappaTop);
    }
}

// Function to animate kappa moving downwards
function animateKappaBottom() {
    if (isGameActive) {
        // Update the vertical position to move down
        positionY += direction * speed;
        
        // Set the new top position for kappa
        kappa.style.top = positionY + "px";
        
        // Check for collision with obstacles
        checkCollision();

        // Check for vertical boundaries
        checkVertical();

        // Request the next animation frame
        animationId = requestAnimationFrame(animateKappaBottom);
    }
}

// Event listener for keydown events
document.addEventListener("keydown", function (event) {
    // Set the default direction to 1
    direction = 1;

    // Cancel any ongoing animation frame to avoid conflicts
    cancelAnimationFrame(animationId);

    // Switch statement to determine the action based on the pressed arrow key
    switch (event.key) {
        case "ArrowLeft": // Left arrow key
            animateKappaLeft();
            break;
        case "ArrowRight": // Right arrow key
            animateKappaRight();
            break;
        case "ArrowUp": // Up arrow key
            animateKappaTop();
            break;
        case "ArrowDown": // Down arrow key
            animateKappaBottom();
            break;
    }
});


function shootBullet() {
    // Check if the game is active before shooting
    if (isGameActive) {

        // Create a new bullet element
        const bullet = document.createElement('div');
        bullet.className = 'bullet';

        // Get the position of the kappa player
        const kappa = document.getElementById('kappa');
        const kappaRect = kappa.getBoundingClientRect();

        // Set the initial position of the bullet
        bullet.style.left = kappaRect.right + 'px';
        bullet.style.top = kappaRect.top + kappaRect.height / 2 + 'px';

        // Append the bullet to the document body
        document.body.appendChild(bullet);

        // Set a timeout to remove the bullet after a certain duration (1.5 seconds)
        setTimeout(() => {
            bullet.remove();
            checkCollision(); // Re-check collision after removing the projectile
        }, 1500);

        // Play the shoot sound
        const shootSound = document.getElementById('shootSound');
        if (shootSound.paused) {
            shootSound.currentTime = 0;
            shootSound.play();
        }
    }
}

// Set up binding for shooting when the Space key is pressed
document.addEventListener('keydown', (event) => {
    // Check if the pressed key is the Space key
    if (event.code === 'Space') {
        // Check if the game is active
        if (isGameActive) {
            // Check if the Space key is not already pressed to avoid rapid shooting
            if (!spaceKeyPressed) {
                // Mark the Space key as pressed
                spaceKeyPressed = true;

                // Call the function to shoot a bullet
                shootBullet();

                // Reset the shooting sound time and play the shooting sound
                shootSound.currentTime = 0;
                shootSound.play();
            }
        }
    }
});

// Set up binding for releasing the Space key
document.addEventListener('keyup', (event) => {
    // Check if the released key is the Space key
    if (event.code === 'Space') {
        // Mark the Space key as not pressed
        spaceKeyPressed = false;
    }
});


// Get the element with id 'level0' from the DOM
const level0 = document.getElementById('level0');

// Initial directions for movement
let directionX = 1;
let directionY = 1;

// Function to handle random speed and movement of an opponent
function Randomspeed1() {
    // Get opponent speed
    const vitesse = opponent.vitesse;

    // Get the current position of the opponent
    const positionXActuelle = parseInt(level0.style.right) || 0;
    const positionYActuelle = parseInt(level0.style.top) || 0;

    // Check player's level to determine movement
    if (player.level.current >= 2) {
        // If at level 2 or higher, handle movement in both X and Y directions
        if (positionXActuelle + vitesse > window.innerWidth - level0.offsetWidth || positionXActuelle + vitesse < 0) {
            directionX /= -1;
        }

        if (positionYActuelle + vitesse > window.innerHeight - level0.offsetHeight || positionYActuelle + vitesse < 0) {
            directionY /= -1;
        }

        level0.style.right = positionXActuelle + vitesse * directionX + 'px';
        level0.style.top = positionYActuelle + vitesse * directionY + 'px';

    } else if (player.level.current == 1) {
        // If at level 1, handle movement only in X direction
        if (positionXActuelle + vitesse > window.innerWidth - level0.offsetWidth || positionXActuelle + vitesse < 0) {
            directionX /= -1;
        }

        level0.style.right = positionXActuelle + vitesse * directionX + 'px';

    } else if (player.level.current == 0) {
        // If at level 0, handle movement only in Y direction
        if (positionYActuelle + vitesse > window.innerHeight - level0.offsetHeight || positionYActuelle + vitesse < 0) {
            directionY /= -1;
        }

        level0.style.top = positionYActuelle + vitesse * directionY + 'px';

    }

    // Check if player reached the height score to level up
    if (player.getCodaPoint() == player.level.heightScore[player.level.current]) {
        // Update opponent speed and player speed
        opponent.setVitesse();
        if (player.level.current > 1) {
            player.setSpeed();
        }

        // Cancel the animation frame and level up the player
        cancelAnimationFrame(idAnimBoss);
        player.levelUp();

        // Update opponent and player images
        opponent.setOpponent();
        player.setKappa(playerKappa);
    }

    // Request the next animation frame
    requestAnimationFrame(Randomspeed1);
}

// Start the animation loop by requesting the first animation frame
let idAnimBoss = requestAnimationFrame(Randomspeed1);
