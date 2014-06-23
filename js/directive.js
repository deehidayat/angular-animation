angular.module('DeeDirective',['Constructor'])
.directive('treeview', [function(){
    return {
        link : function(scope, elem) {
            angular.element(elem).tree();
        }
    };
}])
.directive('center', [function(){
    return {
        link : function(scope, elem) {
            angular.element(elem).center();
        }
    };
}])
.directive('game', ['LoadingBar', 'BitmapButton', 'Player', 'Grant', 'RedBird', 'BlueBird', function(LoadingBar, BitmapButton, Player, Grant, RedBird, BlueBird){
    return {
        link : function(scope, elem) {

            // var DIFFICULTY = 2;         //how fast the game gets mor difficult
            // var ROCK_TIME = 110;        //aprox tick count untill a new asteroid gets introduced
            // var SUB_ROCK_COUNT = 4;     //how many small rocks to make on rock death
            // var BULLET_TIME = 5;        //ticks between bullets
            // var BULLET_ENTROPY = 100;   //how much energy a bullet has before it runs out.
//
            // var TURN_FACTOR = 7;        //how far the ship turns per frame
            // var BULLET_SPEED = 17;      //how fast the bullets move

            var KEYCODE_ENTER = 13;     //usefull keycode
            var KEYCODE_SPACE = 32;     //usefull keycode
            var KEYCODE_UP = 38;        //usefull keycode
            var KEYCODE_LEFT = 37;      //usefull keycode
            var KEYCODE_RIGHT = 39;     //usefull keycode
            var KEYCODE_W = 87;         //usefull keycode
            var KEYCODE_A = 65;         //usefull keycode
            var KEYCODE_D = 68;         //usefull keycode

            var manifest;           // used to register sounds for preloading

            var shootHeld;          //is the user holding a shoot command
            var lfHeld;             //is the user holding a turn left command
            var rtHeld;             //is the user holding a turn right command
            var fwdHeld;            //is the user holding a forward command

            // var timeToRock;         //difficulty adjusted version of ROCK_TIME
            // var nextRock;           //ticks left untill a new space rock arrives
            // var nextBullet;         //ticks left untill the next shot is fired
//
            // var rockBelt;           //space rock array
            // var bulletStream;       //bullet array

            var canvas;         //Main canvas
            var stage;          //Main display stage
            var width, height;  // Canvas w - h
            var loadingInterval = 0;
            var bgMusic;

            // var ship;           //the actual ship
            // var alive;          //wheter the player is alive

            var splashContainer;
            var bgImage;
            var messageField;       //Message display field
            // var scoreField;         //score Field

            var progressBar = {
              instance : null,
              width : 600,
              height : 40,
              padding : 5,
              baseColor : '#59554D',
              loadColor : '#57B86A',
            };


            var player, guru = new Array();
            var sky, fog, fog2, ground, hill, hill2, grant, bird; // BAckground
            var mainContainer;
            var currentState; // menu | belajar | quiz

            //register key functions
            document.onkeydown = handleKeyDown;
            document.onkeyup = handleKeyUp;

            function init() {

                canvas = elem[0];
                stage = new createjs.Stage(canvas);

                width = stage.canvas.width;
                height = stage.canvas.height;

                // enable touch interactions if supported on the current device:
                createjs.Touch.enable(stage);

                // enable mouse over / out events, required for button rollovers
                stage.enableMouseOver(10);

                createSplash();


                // begin loading content (only sounds to load)
                var assetsPath = "assets/";
                manifest = [
                // {
                    // id:'soraki',
                    // src:'Soraki.png'
                // },
                {
                    id:'buttonBelajar',
                    src:'belajarButton.png'
                },
                {
                    id:'buttonQuiz',
                    src:'quizButton.png'
                },
                {
                    id:"begin",
                    src:"Game-Spawn.ogg"
                },
                // {
                    // id:"break",
                    // src:"Game-Break.ogg",
                    // data:6
                // },
                // {
                    // id:"death",
                    // src:"Game-Death.ogg"
                // },
                // {
                    // id:"laser",
                    // src:"Game-Shot.ogg",
                    // data:6
                // },
                // {
                    // id:"music",
                    // src:"18-machinae_supremacy-lord_krutors_dominion.ogg"
                // },
                // {
                    // id:"music2",
                    // src:"M-GameBG.ogg"
                // },
                {src:"mc___main_characters_sprites_by_ssb_fan4ever-d53kkhx.png", id:"player"},
                {src:"layerneg2_fog.png", id:"fog"},
                {src:"layerneg2_fog2.png", id:"fog2"},
                {src:"sky.png", id:"sky"},
                {src:"ground.png", id:"ground"},
                {src:"parallaxHill1.png", id:"hill"},
                {src:"parallaxHill2.png", id:"hill2"},
                // {src:"runningGrant.png", id:"grant"},
                {src:"redBird.png", id:"redBird"},
                ];

                createjs.Sound.alternateExtensions = ["mp3"];
                preload = new createjs.LoadQueue(true, assetsPath);
                preload.installPlugin(createjs.Sound);
                preload.addEventListener("complete", doneLoading);
                preload.addEventListener("progress", updateLoading);
                preload.loadManifest(manifest);
            }

            function createSplash() {
                // Coainter untuk loading dan awal
                splashContainer = new createjs.Container();
                stage.addChild(splashContainer);

                var square = new createjs.Shape();
                square.graphics.beginFill("black").drawRect(0, 0, width, height);
                square.x = 0;
                square.y = 0;
                square.addEventListener("click", handleClick);

                // Loading message
                messageField = new createjs.Text("Loading...", "bold italic 30px Serif", "#FFFFFF");
                messageField.maxWidth = 1000;
                messageField.textAlign = "center";
                messageField.x = width / 2;
                messageField.y = height / 2 + 40;

                progressBar.instance = new LoadingBar(progressBar.width, progressBar.height, progressBar.padding, progressBar.loadColor, progressBar.baseColor);//new createjs.Container();
                progressBar.instance.x = width / 2 - (progressBar.width/2);
                progressBar.instance.y = height / 2 - (progressBar.height/2);

                splashContainer.addChild(square, messageField, progressBar.instance);
            }

            function updateLoading(event) {
                if(progressBar.instance)
                    progressBar.instance.loadingBar.scaleX = event.progress * progressBar.width;
                stage.update();
            }


            function doneLoading() {
                clearInterval(loadingInterval);
                messageField.text = "Click untuk memulai";
                stage.update();
                watchRestart();

                // scoreField = new createjs.Text("0", "bold 12px Arial", "#FFFFFF");
                // scoreField.textAlign = "right";
                // scoreField.x = canvas.width - 10;
                // scoreField.y = 22;
                // scoreField.maxWidth = 1000;


                // createjs.Ticker.addEventListener("tick", stage);

                // if (createjs.Sound.isReady()) {
                    // console.log(createjs.Sound.activePlugin.toString());
                // }


            }

            function watchRestart() {
                //watch for clicks
                // stage.addChild(messageField);
                // stage.update();     //update the stage to show text
                // splashContainer.onclick = handleClick;
                // splashContainer.addEventListener("click", handleClick);
            }

            function handleClick(event) {
                // stage.removeChild(splashContainer);

                // indicate the player is now on screen
                createjs.Sound.play("begin");

                restart();
            }

            function showMainMenu() {

                mainContainer.removeAllChildren();

                var judul = new createjs.Text("Pengenalan Sistem Pernapasan", "bold italic 60px Serif", "#59554D");
                judul.maxWidth = 1000;
                judul.textAlign = "center";
                judul.x = width / 2;
                judul.y = height / 2 - 250;
                mainContainer.addChild(judul);

                judul = new createjs.Text("Biologi Kelas XI", "bold italic 30px Serif", "#c9baba");
                judul.maxWidth = 1000;
                judul.textAlign = "right";
                judul.x = width - 150;
                judul.y = height / 2 - 175;
                mainContainer.addChild(judul);

                var menuContainer  = new createjs.Container();
                menuContainer.x = width / 2;
                menuContainer.y = height / 2 ;

                var btnBelajar = BitmapButton.create([preload.getResult('buttonBelajar')]);
                btnBelajar.scaleX = 0.5;
                btnBelajar.scaleY = 0.5;
                btnBelajar.x = -200;
                btnBelajar.y = 0;
                btnBelajar.addEventListener("click", function() {
                    showBelajar();
                });

                var btnQuiz = BitmapButton.create([preload.getResult('buttonQuiz')]);
                btnQuiz.scaleX = 0.5;
                btnQuiz.scaleY = 0.5;
                btnQuiz.x = 100;
                btnQuiz.y = 0;
                btnQuiz.addEventListener("click", function() {
                    showQuiz();
                });

                menuContainer.addChild(btnBelajar, btnQuiz);

                currentState = 'menu';
                mainContainer.addChild(menuContainer);


                // var star = new createjs.Shape();
                // star.x = width/2;
                // star.y = height/2 + 200;
                // star.graphics.beginFill('#FF0').beginStroke("#FF0").setStrokeStyle(5).drawPolyStar(0, 0, 75, 5, 0.6, -90).closePath();

                // grant = Grant.create(preload.getResult("grant"));
                // grant.setTransform(-200, height - groundImg.height - grant.height, 1, 1);
                // grant.framerate = 5;

                // player = new Player.create(preload.getResult("player"));
                // player.setTransform(100,100);
                // player.scaleX = player.scaleY = 4;


            }

            function showBelajar() {
                mainContainer.removeAllChildren();
                player = new Player.create(preload.getResult("player"), {name:"Dede", index:0});
                player.x = 0;
                player.y = height - (preload.getResult("ground").height*2) - 64;
                player.scaleX = player.scaleY = 2;

                guru[0] = new Player.create(preload.getResult("player"), {name:"Dede", index:2});
                guru[0].x = 300;
                guru[0].y = height - (preload.getResult("ground").height*2) - 64;
                guru[0].scaleX = guru[0].scaleY = 2;

                guru[1] = BlueBird.create();
                guru[1].x = 800;
                guru[1].y = height - (preload.getResult("ground").height*2) - 64;
                guru[1].scaleX = guru[1].scaleY = 1;

                currentState = 'belajar';
                mainContainer.addChild(guru[0], guru[1], player);

                stage.addEventListener("click", function(e){
                    // console.log(e);
                   if(e.rawY >= width / 2) player.gotoAndPlay("walkRight");
                });
            }

            function showQuiz() {
                mainContainer.removeAllChildren();
            }

            //reset all game logic
            function restart() {
                stage.removeAllChildren();
                stage.clear();

                // Create Background
                var skyImg = preload.getResult("sky");
                sky = new createjs.Shape();
                sky.scaleY = 2;
                sky.graphics.beginBitmapFill(skyImg).drawRect(0,0,width,skyImg.height);
                sky.cache(0, 0, width, height);

                var groundImg = preload.getResult("ground");
                ground = new createjs.Shape();
                ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, width+groundImg.width, groundImg.height);
                ground.scaleX = ground.scaleY = 2;
                ground.tileW = groundImg.width * 2;
                ground.y = height-groundImg.height * 2;

                hill = new createjs.Bitmap(preload.getResult("hill"));
                hill.scaleX = hill.scaleY = 2;
                hill.setTransform(Math.random() * width, height-hill.image.height*3-(groundImg.height*2), 3, 3);

                hill2 = new createjs.Bitmap(preload.getResult("hill2"));
                hill2.setTransform(Math.random() * width, height-hill2.image.height*3-(groundImg.height*2), 3, 3);

                fog = new createjs.Bitmap(preload.getResult("fog"));
                fog.setTransform(Math.random() * width, height-fog.image.height*3-(groundImg.height*2), 3, 3);
                fog.cache(0, 0, width, height);

                fog2 = new createjs.Bitmap(preload.getResult("fog2"));
                fog2.setTransform(Math.random() * width, height-fog2.image.height*3-(groundImg.height*2), 3, 3);
                fog2.cache(0, 0, width, height);

                bird = RedBird.create();
                bird.x = Math.random() * width;
                bird.y = Math.random() * (height * 0.3);
                bird.scaleX = bird.scaleY = 0.5;

                stage.addChild(sky, fog, fog2, hill, hill2, ground, bird);
                // End Background

                mainContainer = new createjs.Container();
                stage.addChild(mainContainer);

                showMainMenu();

                //start game timer
                if (!createjs.Ticker.hasEventListener("tick")) {
                    createjs.Ticker.timingMode = createjs.Ticker.RAF;
                    // createjs.Ticker.setFPS(20);
                    createjs.Ticker.setInterval(50);        // in ms, so 50 fps
                    createjs.Ticker.addEventListener("tick", tick);
                }

                // start the music
                // bgMusic = createjs.Sound.play("music2", {interrupt:createjs.Sound.INTERRUPT_NONE, loop:-1, volume:0.4});
            }

            function tick(event) {
                var deltaS = event.delta/1000;

                // if (grant) {
                    // var position = grant.x+150*deltaS;
                    // var grantW = grant.getBounds().width*grant.scaleX;
                    // grant.x = (position >= width) ? -grantW : position;
                // }

                // player.direction = null;
                // // player.currentAnimation = 'stand';

                fog.x = (fog.x - deltaS * 30);
                if (fog.x + fog.image.width* fog.scaleX <= 0) { fog.x = width; }
                fog2.x = (fog2.x - deltaS * 45);
                if (fog2.x + fog2.image.width*fog2.scaleX <= 0) { fog2.x = width; }
                bird.x = (bird.x + deltaS * 50);
                if (bird.x > width + 100) { bird.x = -100; bird.y = Math.random() * (height * 0.3); }


                if(currentState == "belajar") {
                    player.tick();

                    // Guru 1
                    if(player.x < guru[0].x && player.x >= guru[0].x - 200) {
                        if(guru[0].currentAnimation != "standLeft")
                            guru[0].gotoAndPlay("standLeft");
                    } else if(player.x > guru[0].x && player.x <= guru[0].x + 200) {
                        if(guru[0].currentAnimation != "standRight")
                            guru[0].gotoAndPlay("standRight");
                    } else {
                        if(guru[0].currentAnimation != "stand")
                            guru[0].gotoAndPlay("stand");
                        // guru[1].gotoAndPlay("stand");
                    }

                    // Guru 2
                    if(player.x >= guru[1].x - 200 && player.x <= guru[1].x + 200) {
                        if(guru[1].currentAnimation != "standFly")
                            guru[1].gotoAndPlay("standFly");
                    } else {
                        if(guru[1].currentAnimation != "stand")
                            guru[1].gotoAndPlay("stand");
                    }

                    if(rtHeld) {
                        if(player && player.currentAnimation == "stand")
                            player.gotoAndPlay("walkRight");

                        player.velocity.x = player.velocity.x * 0.9;
                        if(player.x > (width * 0.5) - 64 && player.currentAnimation=="walkRight") {
                            ground.x = (ground.x - player.velocity.x) % ground.tileW;
                            hill.x = (hill.x - deltaS*30);
                            if (hill.x + hill.image.width*hill.scaleX <= 0) { hill.x = width; }
                            hill2.x = (hill2.x - deltaS*45);
                            if (hill2.x + hill2.image.width*hill2.scaleX <= 0) { hill2.x = width; }
                            guru[0].x -= player.velocity.x;
                            guru[1].x -= player.velocity.x;
                        } else if (player && player.currentAnimation == "walkRight") {
                            //moving the player
                            player.x += player.velocity.x;
                            player.y += player.velocity.y;
                        }
                    } else if (lfHeld) {
                        if(player && player.currentAnimation=="stand")
                            player.gotoAndPlay("walkLeft");

                        player.velocity.x = player.velocity.x * 0.9;
                        if(player.x < 0 && player.currentAnimation=="walkLeft") {
                            ground.x = (ground.x + player.velocity.x * -1) % ground.tileW ;
                            // console.log(ground.x, player.velocity.x, ground.tileW);
                            hill.x = (hill.x + deltaS*30);
                            if (hill.x + hill.image.width*hill.scaleX <= 0) { hill.x = width; }
                            hill2.x = (hill2.x + deltaS*45);
                            if (hill2.x + hill2.image.width*hill2.scaleX <= 0) { hill2.x = width; }
                            guru[0].x += player.velocity.x * -1;
                            guru[1].x += player.velocity.x * -1;
                        } else if (player && player.currentAnimation == "walkLeft") {
                            //moving the player
                            player.x += player.velocity.x;
                            player.y += player.velocity.y;
                        }
                    } else if(player.currentAnimation != "stand") {
                        player.gotoAndPlay("stand");
                    }

                    // if (player.x > guru[0].x - 200 && player.currentAnimation=="walkRight") {
                        // player.gotoAndPlay("standRight");
                        // guru[0].gotoAndPlay("standLeft");
                    // }
                }

                stage.update();
            }
//
            // function tick2() {
                // //handle firing
                // if(nextBullet <= 0) {
                    // if(alive && shootHeld){
                        // nextBullet = BULLET_TIME;
                        // fireBullet();
                    // }
                // } else {
                    // nextBullet--;
                // }
//
                // //handle turning
                // if(alive && lfHeld){
                    // ship.rotation -= TURN_FACTOR;
                // } else if(alive && rtHeld) {
                    // ship.rotation += TURN_FACTOR;
                // }
//
                // //handle thrust
                // if(alive && fwdHeld){
                    // ship.accelerate();
                // }
//
                // //handle new spaceRocks
                // if(nextRock <= 0) {
                    // if(alive){
                        // timeToRock -= DIFFICULTY;   //reduce spaceRock spacing slowly to increase difficulty with time
                        // var index = getSpaceRock(SpaceRock.LRG_ROCK);
                        // rockBelt[index].floatOnScreen(canvas.width, canvas.height);
                        // nextRock = timeToRock + timeToRock*Math.random();
                    // }
                // } else {
                    // nextRock--;
                // }
//
                // //handle ship looping
                // if(alive && outOfBounds(ship, ship.bounds)) {
                    // placeInBounds(ship, ship.bounds);
                // }
//
                // //handle bullet movement and looping
                // for(bullet in bulletStream) {
                    // var o = bulletStream[bullet];
                    // if(!o || !o.active) { continue; }
                    // if(outOfBounds(o, ship.bounds)) {
                        // placeInBounds(o, ship.bounds);
                    // }
                    // o.x += Math.sin(o.rotation*(Math.PI/-180))*BULLET_SPEED;
                    // o.y += Math.cos(o.rotation*(Math.PI/-180))*BULLET_SPEED;
//
                    // if(--o.entropy <= 0) {
                        // stage.removeChild(o);
                        // o.active = false;
                    // }
                // }
//
                // //handle spaceRocks (nested in one loop to prevent excess loops)
                // for(spaceRock in rockBelt) {
                    // var o = rockBelt[spaceRock];
                    // if(!o || !o.active) { continue; }
//
                    // //handle spaceRock movement and looping
                    // if(outOfBounds(o, o.bounds)) {
                        // placeInBounds(o, o.bounds);
                    // }
                    // o.tick();
//
//
                    // //handle spaceRock ship collisions
                    // if(alive && o.hitRadius(ship.x, ship.y, ship.hit)) {
                        // alive = false;
//
                        // stage.removeChild(ship);
                        // messageField.text = "You're dead:  Click or hit enter to play again";
                        // stage.addChild(messageField);
                        // watchRestart();
//
                        // //play death sound
                        // createjs.Sound.play("death", createjs.Sound.INTERRUPT_ANY);
                        // continue;
                    // }
//
                    // //handle spaceRock bullet collisions
                    // for(bullet in bulletStream) {
                        // var p = bulletStream[bullet];
                        // if(!p || !p.active) { continue; }
//
                        // if(o.hitPoint(p.x, p.y)) {
                            // var newSize;
                            // switch(o.size) {
                                // case SpaceRock.LRG_ROCK: newSize = SpaceRock.MED_ROCK;
                                    // break;
                                // case SpaceRock.MED_ROCK: newSize = SpaceRock.SML_ROCK;
                                    // break;
                                // case SpaceRock.SML_ROCK: newSize = 0;
                                    // break;
                            // }
//
                            // //score
                            // if(alive) {
                                // addScore(o.score);
                            // }
//
                            // //create more
                            // if(newSize > 0) {
                                // var i;
                                // var index;
                                // var offSet;
//
                                // for(i=0; i < SUB_ROCK_COUNT; i++){
                                    // index = getSpaceRock(newSize);
                                    // offSet = (Math.random() * o.size*2) - o.size;
                                    // rockBelt[index].x = o.x + offSet;
                                    // rockBelt[index].y = o.y + offSet;
                                // }
                            // }
//
                            // //remove
                            // stage.removeChild(o);
                            // rockBelt[spaceRock].active = false;
//
                            // stage.removeChild(p);
                            // bulletStream[bullet].active = false;
//
                            // // play sound
                            // createjs.Sound.play("break", {interrupt: createjs.Sound.INTERUPT_LATE, offset:0.8});
                        // }
                    // }
                // }
//
                // //call sub ticks
                // ship.tick();
                // stage.update();
            // }
//
            // function outOfBounds(o, bounds) {
                // //is it visibly off screen
                // return o.x < bounds*-2 || o.y < bounds*-2 || o.x > canvas.width+bounds*2 || o.y > canvas.height+bounds*2;
            // }
//
            // function placeInBounds(o, bounds) {
                // //if its visual bounds are entirely off screen place it off screen on the other side
                // if(o.x > canvas.width+bounds*2) {
                    // o.x = bounds*-2;
                // } else if(o.x < bounds*-2) {
                    // o.x = canvas.width+bounds*2;
                // }
//
                // //if its visual bounds are entirely off screen place it off screen on the other side
                // if(o.y > canvas.height+bounds*2) {
                    // o.y = bounds*-2;
                // } else if(o.y < bounds*-2) {
                    // o.y = canvas.height+bounds*2;
                // }
            // }
//
            // function fireBullet() {
                // //create the bullet
                // var o = bulletStream[getBullet()];
                // o.x = ship.x;
                // o.y = ship.y;
                // o.rotation = ship.rotation;
                // o.entropy = BULLET_ENTROPY;
                // o.active = true;
//
                // //draw the bullet
                // o.graphics.beginStroke("#FFFFFF").moveTo(-1, 0).lineTo(1, 0);
//
                // // play the shot sound
                // createjs.Sound.play("laser", createjs.Sound.INTERUPT_LATE);
            // }
//
            // function getSpaceRock(size) {
                // var i = 0;
                // var len = rockBelt.length;
//
                // //pooling approach
                // while(i <= len){
                    // if(!rockBelt[i]) {
                        // rockBelt[i] = new SpaceRock(size);
                        // break;
                    // } else if(!rockBelt[i].active) {
                        // rockBelt[i].activate(size);
                        // break;
                    // } else {
                        // i++;
                    // }
                // }
//
                // if(len == 0) {
                    // rockBelt[0] = new SpaceRock(size);
                // }
//
                // stage.addChild(rockBelt[i]);
                // return i;
            // }
//
            // function getBullet() {
                // var i = 0;
                // var len = bulletStream.length;
//
                // //pooling approach
                // while(i <= len){
                    // if(!bulletStream[i]) {
                        // bulletStream[i] = new createjs.Shape();
                        // break;
                    // } else if(!bulletStream[i].active) {
                        // bulletStream[i].active = true;
                        // break;
                    // } else {
                        // i++;
                    // }
                // }
//
                // if(len == 0) {
                    // bulletStream[0] = new createjs.Shape();
                // }
//
                // stage.addChild(bulletStream[i]);
                // return i;
            // }

            //allow for WASD and arrow control scheme
            function handleKeyDown(e) {
                //cross browser issues exist
                if(!e){ var e = window.event; }
                switch(e.keyCode) {
                    case KEYCODE_SPACE: shootHeld = true; return false;
                    case KEYCODE_A:
                    case KEYCODE_LEFT:  lfHeld = true; return false;
                    case KEYCODE_D:
                    case KEYCODE_RIGHT: rtHeld = true; return false;
                    case KEYCODE_W:
                    case KEYCODE_UP:    fwdHeld = true; return false;
                    case KEYCODE_ENTER:  if(canvas.onclick == handleClick){ handleClick(); }return false;
                }
            }

            function handleKeyUp(e) {
                //cross browser issues exist
                if(!e){ var e = window.event; }
                switch(e.keyCode) {
                    case KEYCODE_SPACE: shootHeld = false; break;
                    case KEYCODE_A:
                    case KEYCODE_LEFT:  lfHeld = false; break;
                    case KEYCODE_D:
                    case KEYCODE_RIGHT: rtHeld = false; break;
                    case KEYCODE_W:
                    case KEYCODE_UP:    fwdHeld = false; break;
                }
            }

            function addScore(value) {
                //trust the field will have a number and add the score
                scoreField.text = (Number(scoreField.text) + Number(value)).toString();
            }
            elem.ready(function(){
                init();
            });
        }
    };
}]);
