Constructor
.service('Player', [function(){
    return {
        create: function(options) {
            function Player() {
                this.initialize();
            }
            var index = {x:options.index <= 3 ? options.index * 96 : (options.index-4) * 96, y: options.index > 3 ? parseInt(options.index / 4) * 127 : 0};
            var data = new createjs.SpriteSheet({
                images: ["assets/mc___main_characters_sprites_by_ssb_fan4ever-d53kkhx.png"], // 384 x 508 -> 96 x 127
                // frames: {"regX": 0, "height": 292, "count": 64, "regY": 0, "width": 165},
                frames: [
                    // x, y, width, height, imageIndex, regX, regY
                    [0,0,96,127,0,96,0],
                    [96,0,96,127,0,96,0],
                    [192,0,96,127,0,96,0],
                    [288,0,96,127,0,96,0],

                    // [0,127,96,127,0,96,0], Object 1
                    // Front
                    [0 + index.x, 126 + index.y, 32, 32, 0, 0, 0],
                    [32 + index.x, 126 + index.y, 32, 32, 0, 0, 0],
                    [64 + index.x, 126 + index.y, 32, 32, 0, 0, 0],

                    // Left
                    [0 + index.x, 126 + 32 + index.y, 32, 32, 0, 0, 0],
                    [32 + index.x, 126 + 32 + index.y, 32, 32, 0, 0, 0],
                    [64 + index.x, 126 + 32 + index.y, 32, 32, 0, 0, 0],

                    // Right
                    [0 + index.x, 126 + 64 + index.y, 32, 32, 0, 0, 0],
                    [32 + index.x, 126 + 64 + index.y, 32, 32, 0, 0, 0],
                    [64 + index.x, 126 + 64 + index.y, 32, 32, 0, 0, 0],

                    // Back
                    [0 + index.x, 126 + 96 + index.y, 32, 32, 0, 0, 0],
                    [32 + index.x, 126 + 96 + index.y, 32, 32, 0, 0, 0],
                    [64 + index.x, 126 + 96 + index.y, 32, 32, 0, 0, 0],

                    // [96,127,96,127,0,96,0],
                    // [192,127,96,127,0,96,0],
                    // [288,127,96,127,0,96,0],


                ],
                // define two animations, run (loops, 1.5x speed) and jump (returns to run):
                animations: {
                    // start, end, next, speed
                    run: [0, 25, "run", 1.5],
                    jump: [26, 63, "run"],
                    front : {
                        frames: [5,6,4],
                        // next: "walk",
                        // speed: 0.1
                    },
                    walkLeft : {
                        frames: [8,9,7],
                        // next: "walk",
                        speed: 0.1
                    },
                    walkRight : {
                        frames: [11,12,10],
                        // next: "walk",
                        speed: 0.1
                    },
                    stand : {
                        frames: [5]
                    },
                    standLeft : {
                        frames: [8]
                    },
                    standRight : {
                        frames: [11]
                    },
                }
            });
            Player.prototype = new createjs.Sprite(data);

            Player.prototype.Animation_initialize = Player.prototype.initialize;
            Player.prototype.initialize = function() {
                this.velocity = {
                  x : 0,
                  y : 0,
                };
                this.name = options.name || "Efis";
                this.gotoAndPlay("stand");
            };
            Player.prototype.tick = function(event) {
                if (this.currentAnimation === "stand") {
                    this.velocity.x = 0;
                }
                if (this.currentAnimation === "walkRight" || this.currentAnimation === "walkLeft") {
                    if (this.currentAnimation === "walkRight") {
                        if (this.velocity.x < 11) {
                            this.velocity.x++;
                        }
                    }

                    if (this.currentAnimation === "walkLeft") {
                        if (this.velocity.x > -10) {
                            this.velocity.x--;
                        }
                    }
                }
            };
            return new Player();
        }
    };
}])
.service('Bubble', [function(){
    return {
        create : function() {
            function Bubble() {
                this.initialize();
            }
            var bubbleAnimation = {
                "animations": {
                              "start": [0],
                              "death": {"frames": [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], next: "start" },
                              "birth": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], next: "idle"},
                              "idle": {"frames": [12], xnext: "death", xfrequency: 5}},
                "images": ["assets/bubble.png"],
                "frames": [
                   [0, 0, 214, 172, 0, 0, 0],
                    [214, 0, 214, 172, 0, 0, 0],
                    [428, 0, 214, 172, 0, 0, 0],
                    [642, 0, 214, 172, 0, 0, 0],
                    [856, 0, 214, 172, 0, 0, 0],
                    [1070, 0, 214, 172, 0, 0, 0],
                    [1284, 0, 214, 172, 0, 0, 0],
                    [1498, 0, 214, 172, 0, 0, 0],
                    [1712, 0, 214, 172, 0, 0, 0],
                    [0, 172, 214, 172, 0, 0, 0],
                    [214, 172, 214, 172, 0, 0, 0],
                    [428, 172, 214, 172, 0, 0, 0],
                    [642, 172, 214, 172, 0, 0, 0],
                    [856, 172, 214, 172, 0, 0, 0],
                    [1070, 172, 214, 172, 0, 0, 0],
                    [1284, 172, 214, 172, 0, 0, 0],
                    [1498, 172, 214, 172, 0, 0, 0],
                    [1712, 172, 214, 172, 0, 0, 0],
                    [0, 344, 214, 172, 0, 0, 0],
                    [214, 344, 214, 172, 0, 0, 0],
                    [428, 344, 214, 172, 0, 0, 0],
                    [642, 344, 214, 172, 0, 0, 0],
                    [856, 344, 214, 172, 0, 0, 0],
                    [1070, 344, 214, 172, 0, 0, 0],
                    [1284, 344, 214, 172, 0, 0, 0],
                    [1498, 344, 214, 172, 0, 0, 0],
                    [1712, 344, 214, 172, 0, 0, 0],
                    [0, 516, 214, 172, 0, 0, 0],
                    [214, 516, 214, 172, 0, 0, 0]
                ]
            };

            var ss3 = new createjs.SpriteSheet(bubbleAnimation);
            Bubble.prototype = new createjs.Sprite(ss3);

            Bubble.prototype.Animation_initialize = Bubble.prototype.initialize;

            Bubble.prototype.initialize = function (){
                // this.x = hero.x - 125;
                // this.y = hero.y - 160;
                this.alpha = 0.8;
                this.gotoAndPlay("start");
                this.bubbleText = new createjs.Text("","bold 15px Unkempt","black");
                this.bubbleText.lineWidth = 100;
                // console.log(this)
            };

            Bubble.prototype.tick = function() {

            };

            Bubble.prototype.handleText = function(text) {
                this.bubbleText.text = text;
                this.bubbleText.x = this.x + (this.scaleX == 1 ? 70 : -150);
                this.bubbleText.y = this.y + 30;
                this.parent.addChild(this.bubbleText);
            };

            Bubble.prototype.removeText = function() {
                this.parent.removeChild(this.bubbleText);
            };

            return new Bubble();
        }
    };
}])
.service('RedBird', [function(){
    return {
        create: function() {
            function RedBird() {
                this.initialize();
            }
            var data = new createjs.SpriteSheet({
                images: ["assets/redBird.png"], // 918 x 506 -> 96 x 127
                frames: {"regX": 10, "regY": 0, "height": 506 / 3, "width": 915 / 5, "count": 14},
                // frames: []
                animations : {
                    fly : [0,13,"fly",0.5]
                }
            });

            RedBird.prototype = new createjs.Sprite(data);

            RedBird.prototype.Animation_initialize = RedBird.prototype.initialize;
            RedBird.prototype.initialize = function() {
                this.velocity = {
                  x : 0,
                  y : 0,
                };
                this.gotoAndPlay("fly");
            };

            return new RedBird();
        }
    };
}])
.service('BlueBird', [function(){
    return {
        create: function() {
            function BlueBird() {
                this.initialize();
            }
            var data = new createjs.SpriteSheet({
                images: ["assets/blueBird.png"], // 918 x 506 -> 96 x 127
                frames: {"regX": 0, "regY": 0, "height": 256 / 4, "width": 256 / 4},
                // frames: []
                animations : {
                    flyLeft : [0,3,"flyLeft",0.6],
                    flyRight : [4,7,"flyRight",0.6],
                    stand : [15],
                    standFly : {
                        frames : [15,14,13,12],
                        next : "standFly",
                        speed : 0.3
                    },
                    standLeft : [9],
                    standRight : [11],
                }
            });

            BlueBird.prototype = new createjs.Sprite(data);

            BlueBird.prototype.Animation_initialize = BlueBird.prototype.initialize;
            BlueBird.prototype.initialize = function() {
                this.velocity = {
                  x : 0,
                  y : 0,
                };
                this.gotoAndPlay("stand");
            };

            return new BlueBird();
        }
    };
}]);

/**
.service('Grant', [function(){
    return {
        create: function(image) {
            function Grant() {

            }
            var data = new createjs.SpriteSheet({
                "images": [image],
                "frames": {"regX": 0, "height": 292, "count": 64, "regY": 0, "width": 165},
                // define two animations, run (loops, 1.5x speed) and jump (returns to run):
                "animations": {"run": [0, 25, "run", 1.5], "jump": [26, 63, "run"]}
            });
            Grant.prototype = new createjs.Sprite(data, "run");

            Grant.prototype.Animation_initialize = Grant.prototype.initialize;
            Grant.prototype.initialize = function() {
                // this.velocity = {
                    // x:0,
                    // y:0
                // };
            };
            Grant.prototype.tick = function(event) {
                var deltaS = event.delta/1000;
                var position = this.x +150 * deltaS;
                var grantW = this.getBounds().width* this.scaleX;
                this.x = (position >= width) ? -grantW : position;
            };
            return new Grant();
        }
    };
}])
.factory('Soraki', [function() {
        var animacija = {
            "frames": [
                [0, 0, 144, 117, 0, 144, 0],
                [144, 0, 144, 117, 0, 144, 0],
                [288, 0, 144, 117, 0, 144, 0],
                [432, 0, 144, 117, 0, 144, 0],
                [576, 0, 144, 117, 0, 144, 0],
                [720, 0, 144, 117, 0, 144, 0],
                [864, 0, 144, 117, 0, 144, 0],
                [1008, 0, 144, 117, 0, 144, 0],
                [1152, 0, 144, 117, 0, 144, 0],
                [1296, 0, 144, 117, 0, 144, 0],
                [1440, 0, 144, 117, 0, 144, 0],
                [1584, 0, 144, 117, 0, 144, 0],
                [1728, 0, 144, 117, 0, 144, 0],
                [1872, 0, 144, 117, 0, 144, 0],
                [0, 117, 144, 117, 0, 144, 0],
                [144, 117, 144, 117, 0, 144, 0],
                [288, 117, 144, 117, 0, 144, 0],
                [432, 117, 144, 117, 0, 144, 0],
                [576, 117, 144, 117, 0, 144, 0],
                [720, 117, 144, 117, 0, 144, 0],
                [864, 117, 144, 117, 0, 144, 0],
                [1008, 117, 144, 117, 0, 144, 0],
                [1152, 117, 144, 117, 0, 144, 0],
                [1296, 117, 144, 117, 0, 144, 0],
                [1440, 117, 144, 117, 0, 144, 0],
                [1584, 117, 144, 117, 0, 144, 0],
                [1728, 117, 144, 117, 0, 144, 0],
                [1872, 117, 144, 117, 0, 144, 0],
                [0, 234, 144, 117, 0, 144, 0],
                [144, 234, 144, 117, 0, 144, 0],
                [288, 234, 144, 117, 0, 144, 0],
                [432, 234, 144, 117, 0, 144, 0],
                [576, 234, 144, 117, 0, 144, 0],
                [720, 234, 144, 117, 0, 144, 0],
                [864, 234, 144, 117, 0, 144, 0],
                [1008, 234, 144, 117, 0, 144, 0],
                [1152, 234, 144, 117, 0, 144, 0],
                [1296, 234, 144, 117, 0, 144, 0],
                [1440, 234, 144, 117, 0, 144, 0],
                [1584, 234, 144, 117, 0, 144, 0],
                [1728, 234, 144, 117, 0, 144, 0],
                [1872, 234, 144, 117, 0, 144, 0],
                [0, 351, 144, 117, 0, 144, 0],
                [144, 351, 144, 117, 0, 144, 0],
                [288, 351, 144, 117, 0, 144, 0],
                [432, 351, 144, 117, 0, 144, 0],
                [576, 351, 144, 117, 0, 144, 0],
                [720, 351, 144, 117, 0, 144, 0],
                [864, 351, 144, 117, 0, 144, 0],
                [1008, 351, 144, 117, 0, 144, 0],
                [1152, 351, 144, 117, 0, 144, 0],
                [1296, 351, 144, 117, 0, 144, 0],
                [1440, 351, 144, 117, 0, 144, 0],
                [1584, 351, 144, 117, 0, 144, 0],
                [1728, 351, 144, 117, 0, 144, 0],
                [1872, 351, 144, 117, 0, 144, 0],
                [0, 468, 144, 117, 0, 144, 0],
                [144, 468, 144, 117, 0, 144, 0],
                [288, 468, 144, 117, 0, 144, 0],
                [432, 468, 144, 117, 0, 144, 0],
                [576, 468, 144, 117, 0, 144, 0],
                [720, 468, 144, 117, 0, 144, 0],
                [864, 468, 144, 117, 0, 144, 0],
                [1008, 468, 144, 117, 0, 144, 0],
                [1152, 468, 144, 117, 0, 144, 0],
                [1296, 468, 144, 117, 0, 144, 0],
                [1440, 468, 144, 117, 0, 144, 0],
                [1584, 468, 144, 117, 0, 144, 0],
                [1728, 468, 144, 117, 0, 144, 0],
                [1872, 468, 144, 117, 0, 144, 0],
                [0, 585, 144, 117, 0, 144, 0],
                [144, 585, 144, 117, 0, 144, 0],
                [288, 585, 144, 117, 0, 144, 0],
                [432, 585, 144, 117, 0, 144, 0],
                [576, 585, 144, 117, 0, 144, 0],
                [720, 585, 144, 117, 0, 144, 0],
                [864, 585, 144, 117, 0, 144, 0],
                [1008, 585, 144, 117, 0, 144, 0],
                [1152, 585, 144, 117, 0, 144, 0],
                [1296, 585, 144, 117, 0, 144, 0],
                [1440, 585, 144, 117, 0, 144, 0],
                [1584, 585, 144, 117, 0, 144, 0],
                [1728, 585, 144, 117, 0, 144, 0],
                [1872, 585, 144, 117, 0, 144, 0],
                [0, 702, 144, 117, 0, 144, 0],
                [144, 702, 144, 117, 0, 144, 0],
                [288, 702, 144, 117, 0, 144, 0],
                [432, 702, 144, 117, 0, 144, 0],
                [576, 702, 144, 117, 0, 144, 0],
                [720, 702, 144, 117, 0, 144, 0],
                [864, 702, 144, 117, 0, 144, 0],
                [1008, 702, 144, 117, 0, 144, 0],
                [1152, 702, 144, 117, 0, 144, 0],
                [1296, 702, 144, 117, 0, 144, 0],
                [1440, 702, 144, 117, 0, 144, 0],
                [1584, 702, 144, 117, 0, 144, 0],
                [1728, 702, 144, 117, 0, 144, 0],
                [1872, 702, 144, 117, 0, 144, 0],
                [0, 819, 144, 117, 0, 144, 0],
                [144, 819, 144, 117, 0, 144, 0],
                [288, 819, 144, 117, 0, 144, 0],
                [432, 819, 144, 117, 0, 144, 0],
                [576, 819, 144, 117, 0, 144, 0],
                [720, 819, 144, 117, 0, 144, 0],
                [864, 819, 144, 117, 0, 144, 0],
                [1008, 819, 144, 117, 0, 144, 0],
                [1152, 819, 144, 117, 0, 144, 0],
                [1296, 819, 144, 117, 0, 144, 0],
                [1440, 819, 144, 117, 0, 144, 0],
                [1584, 819, 144, 117, 0, 144, 0],
                [1728, 819, 144, 117, 0, 144, 0],
                [1872, 819, 144, 117, 0, 144, 0],
                [0, 936, 144, 117, 0, 144, 0],
                [144, 936, 144, 117, 0, 144, 0],
                [288, 936, 144, 117, 0, 144, 0]
            ],
            "images": ["assets/Soraki.png"],
            "animations": {
                "birth": {"frames": [92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114], next: "stand"},
                "disperse": {"frames": [71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91], next: "after"},
                "after": {"frames": [91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91], next: "birth"},
                "stop": {"frames": [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37], next: "stand"},
                "run1": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], next: "run2"},
                "run2": {"frames": [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], next: "run1"},
                "stand": {"frames": [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54]},
                "start": {"frames": [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68], next: "run1"}
            }
        };
    var Player = function(imagePlayer) {
        animacija.images = imagePlayer;
        this.initialize();
        this.direction = null;
    };
    ss = new createjs.SpriteSheet(animacija);
    Player.prototype = new createjs.Sprite(ss);

    Player.prototype.Animation_initialize = Player.prototype.initialize;

    //initializing object
    Player.prototype.initialize = function() {
        //initiating the velocity of the player
        this.velocity = {
            x:0,
            y:0
        };

        //loading character with spritesheet and data from variable animacija in
        // animacija.js
        this.name = "Player";
        this.gotoAndPlay("run2");
    };

    Player.prototype.tick = function() {
        // if (this.x < 100 && lfHeld === true) {
            // this.velocity.x = 0;
            // this.gotoAndPlay("stand");
        // }
        // //coming to the end without the lights on
        // else if ((lights1 === false || lights2 === false) && hero.x > 17400 && rtHeld === true) {
            // bubble.handleBubble(darkEndText[Math.random()*3 | 0]);
            // this.velocity.x = 0;
            // this.gotoAndPlay("stand");
        // }
        // else if (rtHeld && lfHeld === false) {
            // this.velocity.x = 10;
        // }
        // else if (lfHeld && rtHeld === false) {
            // this.velocity.x = -10;
        // }

        if ( (this.currentAnimation === "start" && this.currentAnimationFrame > 5) || this.currentAnimation === "run1" || this.currentAnimation === "run2" || this.currentAnimation === "stop") {
            //moving the player
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.velocity.x = this.velocity.x*0.9;
        }

        //checking witch animation is playing to start her with a delay
        if ( (this.currentAnimation === "start" && this.currentAnimationFrame > 5) || this.currentAnimation === "run1" || this.currentAnimation === "run2" || this.currentAnimation === "stop") {
            //moving the player
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.velocity.x = this.velocity.x*0.9;
        }

        //function to handle the stoping and stoping animation
        Player.prototype.handleStop = function() {
            var s = this.currentAnimation;
            this.onAnimationEnd = function () {
                if ( (this.currentAnimation === "run1" || this.currentAnimation === "run2" || this.currentAnimation === "start") && keyDn === false) {
                    this.gotoAndPlay("stop");
                    if (this.currentAnimation != "stand") {
                        if (direction === "right") {
                            this.velocity.x = 5;
                        }
                        if (direction === "left") {
                            this.velocity.x = -5;
                        }
                        this.x += this.velocity.x;
                        this.velocity.x = this.velocity.x*0.9;
                    }
                }
            };
        };
        if (this.currentAnimation === "stand") {
            this.velocity.x = 0;
        }

        if (this.currentAnimation === "run1" || this.currentAnimation === "run2") {
            if (this.direction === "right") {
                if (this.velocity.x < 11) {
                    this.velocity.x++;
                }
            }

            if (this.direction === "left") {
                if (this.velocity.x > -10) {
                    this.velocity.x--;
                }
            }
        }
    };
    return Player;

}]); **/