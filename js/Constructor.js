var Constructor = angular.module('Constructor', [])
.factory('LoadingBar', [
function() {

    var LoadingBar = function(width, height, padding, color, frameColor) {

        //setting default values for our arguments if no value is given
        width = typeof width !== 'undefined' ? width : 300;
        height = typeof height !== 'undefined' ? height : 20;
        padding = typeof padding !== 'undefined' ? padding : 3;
        color = typeof color !== 'undefined' ? color : 'black';
        frameColor = typeof frameColor !== 'undefined' ? frameColor : 'black';

        //calling the initialize function we will write
        this.initialize(width, height, padding, color, frameColor);
    };

    //LoadingBar will inherit from the Container class
    LoadingBar.prototype = new createjs.Container();

    //saving the old initialize function of the container class cause we are
    // overwriting it
    //we will call the container initialize function in our own initialize
    LoadingBar.prototype.Container_initialize = LoadingBar.prototype.initialize;

    //the initialize function for our LoadingBar class
    LoadingBar.prototype.initialize = function(width, height, padding, color, frameColor) {

        //calling tha saved initialize function of the Container class
        this.Container_initialize();

        //the height, width, padding, color and frame color of the loading bar
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.color = color;
        this.frameColor = frameColor;

        //creating the loading bar
        this.loadingBar = new createjs.Shape();
        this.loadingBar.graphics.beginFill(this.color).drawRect(0, 0, 1, this.height).endFill();

        //creating the frame around the loading bar
        this.frame = new createjs.Shape();
        this.frame.graphics.setStrokeStyle(1).beginStroke(this.frameColor).drawRect(-this.padding / 2, -this.padding / 2, this.width + this.padding, this.height + this.padding).endStroke();

        //adding the loading bar and the frame to our container
        this.addChild(this.loadingBar, this.frame);
    };
    return LoadingBar;
}])
.service('BitmapButton',[function(){
    return {
        create : function(image) {
            // spritesheet 'bitmap' button:
            var spriteSheet = new createjs.SpriteSheet({
                images: image,
                frames: {width:300, height:100},
                animations: { out: 0, over: 1, down: 2 }
            });
            var bitmapButton = new createjs.Sprite(spriteSheet, 'up');
            var bitmapHelper = new createjs.ButtonHelper(bitmapButton);
            return bitmapButton;
        }
    };
}])
.service('Player', [function(){
    return {
        create: function(options) {
            function Player() {
                this.initialize();
            }
            var index = {x:options.index <= 3 ? options.index * 96 : (options.index-4) * 96, y: options.index > 3 ? parseInt(options.index / 4) * 127 : 0};
            var data = new createjs.SpriteSheet({
                images: ['assets/player.png'], // 384 x 508 -> 96 x 127
                // frames: {'regX': 0, 'height': 292, 'count': 64, 'regY': 0, 'width': 165},
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
                    run: [0, 25, 'run', 1.5],
                    jump: [26, 63, 'run'],
                    front : {
                        frames: [5,6,4],
                        // next: 'walk',
                        // speed: 0.1
                    },
                    walkLeft : {
                        frames: [8,9,7],
                        // next: 'walk',
                        speed: 0.1
                    },
                    walkRight : {
                        frames: [11,12,10],
                        // next: 'walk',
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
            Player.prototype.velocity = {
                x : 0,
                y : 0
            };
            Player.prototype.initialize = function() {
                this.name = options.name || 'Name';
                this.velocity = {
                    x : 0,
                    y : 0
                };
                if (options.type == 'teacher') {
                    this.learned = false;
                    this.message = this.name;
                    this.materi = [];
                };
                this.gotoAndPlay('stand');
            };

            Player.prototype.tick = function(event) {
                if (this.currentAnimation === 'stand') {
                    this.velocity.x = 0;
                }
                if (this.currentAnimation === 'walkRight' || this.currentAnimation === 'walkLeft') {
                    if (this.currentAnimation === 'walkRight') {
                        if (this.velocity.x < 11) {
                            this.velocity.x++;
                        }
                    }

                    if (this.currentAnimation === 'walkLeft') {
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
                'animations': {
                              'start': [0],
                              'death': {'frames': [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], next: 'start' },
                              'birth': {'frames': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], next: 'idle'},
                              'idle': {'frames': [12], xnext: 'death', xfrequency: 5}},
                'images': ['assets/bubble.png'],
                'frames': [
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
                this.gotoAndPlay('start');
                this.bubbleText = new createjs.Text('','bold 15px Unkempt','black');
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
                images: ['assets/redBird.png'], // 918 x 506 -> 96 x 127
                frames: {'regX': 10, 'regY': 0, 'height': 506 / 3, 'width': 915 / 5, 'count': 14},
                // frames: []
                animations : {
                    fly : [0,13,'fly',0.5]
                }
            });

            RedBird.prototype = new createjs.Sprite(data);

            RedBird.prototype.Animation_initialize = RedBird.prototype.initialize;
            RedBird.prototype.initialize = function() {
                this.velocity = {
                  x : 0,
                  y : 0,
                };
                this.gotoAndPlay('fly');
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
                images: ['assets/blueBird.png'], // 918 x 506 -> 96 x 127
                frames: {'regX': 0, 'regY': 0, 'height': 256 / 4, 'width': 256 / 4},
                // frames: []
                animations : {
                    flyLeft : [0,3,'flyLeft',0.6],
                    flyRight : [4,7,'flyRight',0.6],
                    stand : [15],
                    standFly : {
                        frames : [15,14,13,12],
                        next : 'standFly',
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
                this.gotoAndPlay('stand');
            };

            return new BlueBird();
        }
    };
}]);
// .factory('',[function(){}]);
