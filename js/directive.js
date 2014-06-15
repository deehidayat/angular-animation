angular.module('DeeDirective',[])
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
.directive('game', [function(){
    return {
        link : function(scope, elem) {

            var DIFFICULTY = 2;         //how fast the game gets mor difficult
            var ROCK_TIME = 110;        //aprox tick count untill a new asteroid gets introduced
            var SUB_ROCK_COUNT = 4;     //how many small rocks to make on rock death
            var BULLET_TIME = 5;        //ticks between bullets
            var BULLET_ENTROPY = 100;   //how much energy a bullet has before it runs out.

            var TURN_FACTOR = 7;        //how far the ship turns per frame
            var BULLET_SPEED = 17;      //how fast the bullets move

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

            var timeToRock;         //difficulty adjusted version of ROCK_TIME
            var nextRock;           //ticks left untill a new space rock arrives
            var nextBullet;         //ticks left untill the next shot is fired

            var rockBelt;           //space rock array
            var bulletStream;       //bullet array

            var canvas;         //Main canvas
            var stage;          //Main display stage
            var width, height;

            var ship;           //the actual ship
            var alive;          //wheter the player is alive

            var bgImage;
            var messageField;       //Message display field
            var scoreField;         //score Field

            var loadingInterval = 0;

            var bgMusic;

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

                // Loading message
                messageField = new createjs.Text("Loading", "bold 24px Arial", "#FFFFFF");
                messageField.maxWidth = 1000;
                messageField.textAlign = "center";
                messageField.x = canvas.width / 2;
                messageField.y = canvas.height / 2;

                var img = new createjs.Bitmap("assets/sky.png");

                bgImage = new createjs.Shape();
                bgImage.graphics.beginBitmapFill(img.image).drawRect(0,0,width,height);

                stage.addChild(bgImage, messageField);
                stage.update();
                //update the stage to show text

                // begin loading content (only sounds to load)
                var assetsPath = "assets/";
                manifest = [{
                    id:"begin",
                    src:"Game-Spawn.ogg"
                }, {
                    id:"break",
                    src:"Game-Break.ogg",
                    data:6
                }, {
                    id:"death",
                    src:"Game-Death.ogg"
                }, {
                    id:"laser",
                    src:"Game-Shot.ogg",
                    data:6
                }, {
                    id:"music",
                    src:"18-machinae_supremacy-lord_krutors_dominion.ogg"
                }, {
                    id:"music2",
                    src:"M-GameBG.ogg"
                }];

                createjs.Sound.alternateExtensions = ["mp3"];
                preload = new createjs.LoadQueue(true, assetsPath);
                preload.installPlugin(createjs.Sound);
                preload.addEventListener("complete", doneLoading);
                preload.addEventListener("progress", updateLoading);
                preload.loadManifest(manifest);
            }

            function updateLoading(event) {
                var progress = event ? event.progress+0.5|0 : 0;
                messageField.text = "Loading " + progress + "%";
                stage.update();
            }


            function doneLoading() {
                clearInterval(loadingInterval);
                scoreField = new createjs.Text("0", "bold 12px Arial", "#FFFFFF");
                scoreField.textAlign = "right";
                scoreField.x = canvas.width - 10;
                scoreField.y = 22;
                scoreField.maxWidth = 1000;

                messageField.text = "Welcome:  Click to play";

                // if (createjs.Sound.isReady()) {
                    // console.log(createjs.Sound.activePlugin.toString());
                // }


                // start the music
                // bgMusic = createjs.Sound.play("music2", {interrupt:createjs.Sound.INTERRUPT_NONE, loop:-1, volume:0.4});

                watchRestart();
            }

            function watchRestart() {
                //watch for clicks
                stage.addChild(messageField);
                stage.update();     //update the stage to show text
                canvas.onclick = handleClick;
            }

            function handleClick() {
                //prevent extra clicks and hide text
                // canvas.onclick = null;
                stage.removeChild(messageField);

                // indicate the player is now on screen
                createjs.Sound.play("begin");

                restart();
            }

            //reset all game logic
            function restart() {
                //hide anything on stage and show the score
                stage.removeAllChildren();
                scoreField.text = (0).toString();
                stage.addChild(scoreField);

                //new arrays to dump old data
                rockBelt = new Array();
                bulletStream = new Array();

                //create the player
                alive = true;
                ship = new Ship();
                ship.x = canvas.width / 2;
                ship.y = canvas.height / 2;

                //log time untill values
                timeToRock = ROCK_TIME;
                nextRock = nextBullet = 0;

                //reset key presses
                shootHeld = lfHeld = rtHeld = fwdHeld = dnHeld = false;

                //ensure stage is blank and add the ship
                stage.clear();
                stage.addChild(ship);

                //start game timer
                if (!createjs.Ticker.hasEventListener("tick")) {
                  createjs.Ticker.addEventListener("tick", tick);
                }
                // stage.update();
            }

            function tick() {
                //handle firing
                if(nextBullet <= 0) {
                    if(alive && shootHeld){
                        nextBullet = BULLET_TIME;
                        fireBullet();
                    }
                } else {
                    nextBullet--;
                }

                //handle turning
                if(alive && lfHeld){
                    ship.rotation -= TURN_FACTOR;
                } else if(alive && rtHeld) {
                    ship.rotation += TURN_FACTOR;
                }

                //handle thrust
                if(alive && fwdHeld){
                    ship.accelerate();
                }

                //handle new spaceRocks
                if(nextRock <= 0) {
                    if(alive){
                        timeToRock -= DIFFICULTY;   //reduce spaceRock spacing slowly to increase difficulty with time
                        var index = getSpaceRock(SpaceRock.LRG_ROCK);
                        rockBelt[index].floatOnScreen(canvas.width, canvas.height);
                        nextRock = timeToRock + timeToRock*Math.random();
                    }
                } else {
                    nextRock--;
                }

                //handle ship looping
                if(alive && outOfBounds(ship, ship.bounds)) {
                    placeInBounds(ship, ship.bounds);
                }

                //handle bullet movement and looping
                for(bullet in bulletStream) {
                    var o = bulletStream[bullet];
                    if(!o || !o.active) { continue; }
                    if(outOfBounds(o, ship.bounds)) {
                        placeInBounds(o, ship.bounds);
                    }
                    o.x += Math.sin(o.rotation*(Math.PI/-180))*BULLET_SPEED;
                    o.y += Math.cos(o.rotation*(Math.PI/-180))*BULLET_SPEED;

                    if(--o.entropy <= 0) {
                        stage.removeChild(o);
                        o.active = false;
                    }
                }

                //handle spaceRocks (nested in one loop to prevent excess loops)
                for(spaceRock in rockBelt) {
                    var o = rockBelt[spaceRock];
                    if(!o || !o.active) { continue; }

                    //handle spaceRock movement and looping
                    if(outOfBounds(o, o.bounds)) {
                        placeInBounds(o, o.bounds);
                    }
                    o.tick();


                    //handle spaceRock ship collisions
                    if(alive && o.hitRadius(ship.x, ship.y, ship.hit)) {
                        alive = false;

                        stage.removeChild(ship);
                        messageField.text = "You're dead:  Click or hit enter to play again";
                        stage.addChild(messageField);
                        watchRestart();

                        //play death sound
                        createjs.Sound.play("death", createjs.Sound.INTERRUPT_ANY);
                        continue;
                    }

                    //handle spaceRock bullet collisions
                    for(bullet in bulletStream) {
                        var p = bulletStream[bullet];
                        if(!p || !p.active) { continue; }

                        if(o.hitPoint(p.x, p.y)) {
                            var newSize;
                            switch(o.size) {
                                case SpaceRock.LRG_ROCK: newSize = SpaceRock.MED_ROCK;
                                    break;
                                case SpaceRock.MED_ROCK: newSize = SpaceRock.SML_ROCK;
                                    break;
                                case SpaceRock.SML_ROCK: newSize = 0;
                                    break;
                            }

                            //score
                            if(alive) {
                                addScore(o.score);
                            }

                            //create more
                            if(newSize > 0) {
                                var i;
                                var index;
                                var offSet;

                                for(i=0; i < SUB_ROCK_COUNT; i++){
                                    index = getSpaceRock(newSize);
                                    offSet = (Math.random() * o.size*2) - o.size;
                                    rockBelt[index].x = o.x + offSet;
                                    rockBelt[index].y = o.y + offSet;
                                }
                            }

                            //remove
                            stage.removeChild(o);
                            rockBelt[spaceRock].active = false;

                            stage.removeChild(p);
                            bulletStream[bullet].active = false;

                            // play sound
                            createjs.Sound.play("break", {interrupt: createjs.Sound.INTERUPT_LATE, offset:0.8});
                        }
                    }
                }

                //call sub ticks
                ship.tick();
                stage.update();
            }

            function outOfBounds(o, bounds) {
                //is it visibly off screen
                return o.x < bounds*-2 || o.y < bounds*-2 || o.x > canvas.width+bounds*2 || o.y > canvas.height+bounds*2;
            }

            function placeInBounds(o, bounds) {
                //if its visual bounds are entirely off screen place it off screen on the other side
                if(o.x > canvas.width+bounds*2) {
                    o.x = bounds*-2;
                } else if(o.x < bounds*-2) {
                    o.x = canvas.width+bounds*2;
                }

                //if its visual bounds are entirely off screen place it off screen on the other side
                if(o.y > canvas.height+bounds*2) {
                    o.y = bounds*-2;
                } else if(o.y < bounds*-2) {
                    o.y = canvas.height+bounds*2;
                }
            }

            function fireBullet() {
                //create the bullet
                var o = bulletStream[getBullet()];
                o.x = ship.x;
                o.y = ship.y;
                o.rotation = ship.rotation;
                o.entropy = BULLET_ENTROPY;
                o.active = true;

                //draw the bullet
                o.graphics.beginStroke("#FFFFFF").moveTo(-1, 0).lineTo(1, 0);

                // play the shot sound
                createjs.Sound.play("laser", createjs.Sound.INTERUPT_LATE);
            }

            function getSpaceRock(size) {
                var i = 0;
                var len = rockBelt.length;

                //pooling approach
                while(i <= len){
                    if(!rockBelt[i]) {
                        rockBelt[i] = new SpaceRock(size);
                        break;
                    } else if(!rockBelt[i].active) {
                        rockBelt[i].activate(size);
                        break;
                    } else {
                        i++;
                    }
                }

                if(len == 0) {
                    rockBelt[0] = new SpaceRock(size);
                }

                stage.addChild(rockBelt[i]);
                return i;
            }

            function getBullet() {
                var i = 0;
                var len = bulletStream.length;

                //pooling approach
                while(i <= len){
                    if(!bulletStream[i]) {
                        bulletStream[i] = new createjs.Shape();
                        break;
                    } else if(!bulletStream[i].active) {
                        bulletStream[i].active = true;
                        break;
                    } else {
                        i++;
                    }
                }

                if(len == 0) {
                    bulletStream[0] = new createjs.Shape();
                }

                stage.addChild(bulletStream[i]);
                return i;
            }

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
