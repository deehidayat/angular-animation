angular.module('DeeDirective',['Constructor'])
.controller('GameController',['$scope', '$modal', function($scope, $modal){
    // console.log('homectrl');
    $scope.prevState = null;
    $scope.currentState = null;
    $scope.isFullScreen = false;
    $scope.isMute = false;

    $scope.openAbout = function() {
        createjs.Ticker.setPaused(true);
        $modal.open({
            templateUrl : './pages/about.html',
            backdrop : 'static',
            controller : ['$scope', '$modalInstance', function($scope, $modalInstance){
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }],
        }).result.then(function(){
            createjs.Ticker.setPaused(false);
        }, function(){
            createjs.Ticker.setPaused(false);
        });
    };

    $scope.openFullScreen = function(id) {
        var elem = document.getElementById(id);
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
            $scope.isFullScreen = true;
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
            $scope.isFullScreen = true;
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
            $scope.isFullScreen = true;
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
            $scope.isFullScreen = true;
        } else if (elem.mozCancelFullScreen) {
            elem.mozCancelFullScreen();
            $scope.isFullScreen = false;
        } else if(elem.webkitCancelFullScreen){
            elem.webkitCancelFullScreen();
            $scope.isFullScreen = false;
        }
    };

    $scope.toogleMute = function() {
        createjs.Sound.setMute(!$scope.isMute);
        $scope.isMute = createjs.Sound.getMute();
    };

    $scope.setState = function(state) {
        $scope.$apply(function(){
            $scope.prevState = $scope.currentState;
            $scope.currentState = state;
        });
    };

}])
.directive('game', ['$stateParams', 'LoadingBar', 'BitmapButton', 'Player', 'RedBird', 'BlueBird', 'Bubble', function($stateParams, LoadingBar, BitmapButton, Player, RedBird, BlueBird, Bubble){
    return {
        templateUrl : 'pages/game-tpl.html',
        replace : true,
        controller : 'GameController',
        scope : {
            config : '=game'
        },
        link : function(scope, elem) {

            scope.openMenu = function() {
                showMainMenu();
            };
// console.log(scope);
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

            var canvas;         //Main canvas
            var stage;          //Main display stage
            var width, height;  // Canvas w - h
            var loadingInterval = 0;
            var bgMusic;

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


            var player, guru = new Array(), currentGuru = -1;
            var distance = 0;
            var sky, fog, fog2, ground, hill, hill2, grant, bird; // BAckground
            var mainContainer;
            var bubbleContainer, speechBubble, speechText;
            var materiContainer, materi;
            var hypnosis =  ["Belajar Biologi itu menyenangkan", "Belajar Biologi itu mudah", "Belajar Biologi itu tidak susah"];
            var hypnosisText;

            //register key functions
            document.onkeydown = handleKeyDown;
            document.onkeyup = handleKeyUp;

            function init(canvas) {

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
                // {
                    // id:"begin",
                    // src:"Game-Spawn.ogg"
                // },
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
                // {src:"mc___main_characters_sprites_by_ssb_fan4ever-d53kkhx.png", id:"player"},
                {src:"M-GameBG.ogg", id:"music2"},
                {src:"layerneg2_fog.png", id:"fog"},
                {src:"layerneg2_fog2.png", id:"fog2"},
                {src:"sky.png", id:"sky"},
                {src:"ground.png", id:"ground"},
                {src:"parallaxHill1.png", id:"hill"},
                {src:"parallaxHill2.png", id:"hill2"},
                // {src:"runningGrant.png", id:"grant"},
                // {src:"redBird.png", id:"redBird"},
                ];

                createjs.Sound.alternateExtensions = ["mp3"];
                preload = new createjs.LoadQueue(true, assetsPath);
                if(!$stateParams.dev)
                    preload.installPlugin(createjs.Sound);
                preload.addEventListener("complete", doneLoading);
                preload.addEventListener("progress", updateLoading);
                preload.loadManifest(manifest);
            }

            function createSplash() {
                scope.setState('loading');

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
                // restart();

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

            function handleClick(event) {
                // stage.removeChild(splashContainer);

                // indicate the player is now on screen
                // createjs.Sound.play("begin");

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

                mainContainer.addChild(menuContainer);

                scope.setState('menu');

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
//
            // function showHypnosis() {
                // mainContainer.removeAllChildren();
                // var rect = new createjs.Shape();
                // rect.x = width * 0.2 / 2;
                // rect.graphics.beginStroke("#FF0").setStrokeStyle(5).beginFill("#59554D").drawRoundRect(0, 0, width * 0.8, 300, 10).closePath();
                // bubbleContainer.scaleX = bubbleContainer.scaleY = 1;
                // var text = new
            // }
//
            function showBelajar() {
                mainContainer.removeAllChildren();
                player = Player.create({name:"Ismet", index:0});
                player.x = 300;
                player.y = height - (preload.getResult("ground").height*1) - 64;
                player.scaleX = player.scaleY = 2;

                // var dd = player.spriteSheet.getFrame(0);
                // console.log(dd);

                hypnosisText = new createjs.Text("--", "bold 30px Unkempt", "#59554D");
                // hypnosisText.text = "Belajar biologi itu gampang";
                // hypnosisText.x = 1000;
                hypnosisText.y = height * 0.5;
                hypnosisText.lineWidth = 300;
                hypnosisText.visible = false;
                mainContainer.addChild(hypnosisText);

                guru[0] = Player.create({name:"Dede", index:2});
                guru[0].x = 1500;
                guru[0].y = height - (preload.getResult("ground").height*1) - 64;
                guru[0].scaleX = guru[0].scaleY = 2;


                guru[1] = BlueBird.create();
                guru[1].x = 2500;
                guru[1].y = height - (preload.getResult("ground").height*1) - 64;
                guru[1].scaleX = guru[1].scaleY = 1;

                bubbleContainer = new createjs.Container();
                bubbleContainer.visible = false;
                speechBubble = Bubble.create();
                bubbleContainer.addChild(speechBubble);

                // var rect = new createjs.Shape();
                // rect.x = width * 0.2 / 2;
                // rect.y = 100;
                // rect.graphics.beginStroke("#FF0").setStrokeStyle(5).beginFill("#59554D").drawRoundRect(0, 0, width * 0.8, 300, 10).closePath();
//
//
                // mainContainer.addChild(rect, hypnosisText);

                speechBubble.y = player.y - 10 - 200;
                speechBubble.x = player.x + 32 - 200;
                speechBubble.scaleX = speechBubble.scaleY = 1;
                // speechBubble.handleText("hay " + player.name + ", mau tau arti pernapasan?");
                        // if(speechBubble.currentAnimation == "start") {
                            // bubbleContainer.visible = true;
                            // speechBubble.gotoAndPlay("birth");
                        // }


                var rect = new createjs.Shape();
                rect.x = width * 0.2 / 2;
                rect.y = 100;
                rect.graphics.beginStroke("#FF0").setStrokeStyle(5).beginFill("#59554D").drawRoundRect(0, 0, width * 0.8, 300, 10).closePath();
                materi = new createjs.Text("----", "12px Serif", "#FFFFFF");

                materiContainer = new createjs.Container();
                materiContainer.addChild(rect, materi);
                materiContainer.visible = false;

                mainContainer.addChild(materiContainer, bubbleContainer, guru[0], guru[1], player);

                scope.setState('belajar');

                // stage.addEventListener("click", function(e){
                    // // console.log(e);
                   // if(e.rawY >= width / 2) player.gotoAndPlay("walkRight");
                // });
            }

            function toggleMateri() {
                if(scope.currentState == "belajar") {
                    if (currentGuru==0) {
                        // player.gotoAndPlay("stand");
                        // speechBubble.scaleX = -1;
                        // speechBubble.y = player.y - 10 - 200;
                        // speechBubble.x = player.x + 32 + 200;
                        // speechBubble.handleText("Iya tentu saya ingin tahu");
                        scope.materi = 'Bernapas adalah proses memasukkan serta mengeluarkan udara ke dan dari dalam tubuh. Udara yang dimasukkan itu mengandung oksigen, sedangkan udara yang dikeluarkan mengandung karbon dioksida serta uap air. ';
                        guru[0].learned = true;
                        materiContainer.visible = true;
                        scope.setState('materi');
                    }
                } else if (scope.currentState == "materi") {
                    materiContainer.visible = false;
                    scope.setState('belajar');
                }
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
                ground.graphics.beginBitmapFill(groundImg).drawRect(-groundImg.width, 0, width + 2 * groundImg.width, groundImg.height);
                ground.scaleX = ground.scaleY = 1;
                ground.tileW = groundImg.width * 1;
                ground.y = height-groundImg.height * 1;
                ground.cache(-groundImg.width, 0, width + 2 * groundImg.width, height);

                hill = new createjs.Bitmap(preload.getResult("hill"));
                hill.scaleX = hill.scaleY = 2;
                hill.setTransform(Math.random() * width, height-hill.image.height*3-(groundImg.height*1), 3, 3);
                hill.cache(0, 0, width, height);

                hill2 = new createjs.Bitmap(preload.getResult("hill2"));
                hill2.setTransform(Math.random() * width, height-hill2.image.height*3-(groundImg.height*1), 3, 3);
                hill2.cache(0, 0, width, height);

                fog = new createjs.Bitmap(preload.getResult("fog"));
                fog.setTransform(Math.random() * width, height-fog.image.height*3-(groundImg.height*1), 3, 3);
                fog.cache(0, 0, width, height);

                fog2 = new createjs.Bitmap(preload.getResult("fog2"));
                fog2.setTransform(Math.random() * width, height-fog2.image.height*3-(groundImg.height*1), 3, 3);
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
                    createjs.Ticker.setFPS(20);
                    // createjs.Ticker.setInterval(50);        // in ms
                    createjs.Ticker.addEventListener("tick", tick);
                }

                // start the music
                bgMusic = createjs.Sound.play("music2", {xinterrupt:createjs.Sound.INTERRUPT_NONE, loop:-1, volume:0.4});
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
                bird.x = (bird.x + deltaS * 100);
                if (bird.x > width + 100) { bird.x = -100; bird.y = Math.random() * (height * 0.3); }
                // if (bird.x <  -100) { bird.x = width + 100; bird.y = Math.random() * (height * 0.3); }


                if(scope.currentState == "belajar") {
                    player.tick();
//
                    // if(distance > 0 && player.x < guru[0].x) {
                        // hypnosisText.text = hypnosis[Math.random()*3];
                        // hypnosisText.visible = true;
                    // }

                    // Guru 1
                    if(player.x < guru[0].x && player.x >= guru[0].x - 200) {
                        currentGuru = 0;
                        if(guru[0].currentAnimation != "standLeft")
                            guru[0].gotoAndPlay("standLeft");

                        // console.log(speechBubble.currentAnimation);
                        // if(speechBubble.currentAnimation == "idle") {
                            speechBubble.scaleX = 1;
                            speechBubble.y = guru[0].y - 10 - 200;
                            speechBubble.x = guru[0].x + 32 - 200;
                            speechBubble.handleText("hay " + player.name + ", mau tau arti pernapasan?");
                        // } else
                        if(speechBubble.currentAnimation == "start") {
                            bubbleContainer.visible = true;
                            speechBubble.gotoAndPlay("birth");
                        }

                        // speechBubble.scaleX = speechBubble.scaleY = 1;
                    } else if(player.x > guru[0].x && player.x <= guru[0].x + 200) {
                        currentGuru = 0;
                        if(guru[0].currentAnimation != "standRight")
                            guru[0].gotoAndPlay("standRight");

                        // if(speechBubble.currentAnimation == "idle") {
                            speechBubble.scaleX = -1;
                            speechBubble.x = guru[0].x + 32 + 200;
                            speechBubble.y = guru[0].y - 10 - 200;
                            speechBubble.handleText("hay " + player.name + ", mau tau arti pernapasan?");
                        // } else
                        if(speechBubble.currentAnimation == "start") {
                            bubbleContainer.visible = true;
                            speechBubble.gotoAndPlay("birth");
                        }
                    } else {
                        if(guru[0].currentAnimation != "stand")
                            guru[0].gotoAndPlay("stand");
                        // guru[1].gotoAndPlay("stand");

                        if(speechBubble.currentAnimation == "idle") {
                            speechBubble.gotoAndPlay("death");
                            speechBubble.removeText();
                            bubbleContainer.visible = false;
                        }
                        // speechBubble.scaleX = speechBubble.scaleY = 0;
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

                        bird.x -= player.velocity.x;
                        // // if(speechBubble.currentAnimation == "idle") {
                            // speechBubble.scaleX = -1;
                            // speechBubble.x = player.x + 32 + 200;
                            // speechBubble.y = player.y - 10 - 200;
                            // speechBubble.handleText("hay " + player.name + ", mau tau arti pernapasan?");
                        // // } else

                        player.velocity.x = player.velocity.x * 0.9;
                        distance += player.velocity.x;
                        // console.log(distance);
                        if(player.x > (width * 0.5) - 64 && player.currentAnimation=="walkRight") {
                            ground.x = (ground.x - player.velocity.x) % ground.tileW;
                            // console.log(ground.x);
                            hill.x = (hill.x - deltaS*30);
                            if (hill.x + hill.image.width*hill.scaleX <= 0) { hill.x = width; }
                            hill2.x = (hill2.x - deltaS*45);
                            if (hill2.x + hill2.image.width*hill2.scaleX <= 0) { hill2.x = width; }
                            guru[0].x -= player.velocity.x;
                            guru[1].x -= player.velocity.x;
                            hypnosisText.x -= player.velocity.x;
                        } else if (player && player.currentAnimation == "walkRight") {
                            //moving the player
                            player.x += player.velocity.x;
                            player.y += player.velocity.y;
                        }
                    } else if (lfHeld && distance>=0) {
                        if(player && player.currentAnimation=="stand")
                            player.gotoAndPlay("walkLeft");

                        bird.x -= player.velocity.x;
                        // // if(speechBubble.currentAnimation == "idle") {
                            // speechBubble.scaleX = -1;
                            // speechBubble.x = player.x + 32 + 200;
                            // speechBubble.y = player.y - 10 - 200;
                            // speechBubble.handleText("hay " + player.name + ", mau tau arti pernapasan?");
                        // // } else

                        player.velocity.x = player.velocity.x * 0.9;
                        distance += player.velocity.x;
                        // console.log(distance);
                        if(player.x < (width * 0.5) - 64 && player.currentAnimation=="walkLeft") {
                            ground.x = (ground.x  + player.velocity.x * -1) % ground.tileW ;
                            // console.log(ground.x);
                            hill.x = (hill.x + deltaS*30);
                            if (hill.x + hill.image.width*hill.scaleX <= 0) { hill.x = width; }
                            hill2.x = (hill2.x + deltaS*45);
                            if (hill2.x + hill2.image.width*hill2.scaleX <= 0) { hill2.x = width; }
                            guru[0].x -= player.velocity.x;
                            guru[1].x -= player.velocity.x;
                            hypnosisText.x -= player.velocity.x;
                        } else if (player && player.currentAnimation == "walkLeft") {
                            //moving the player
                            player.x += player.velocity.x;
                            player.y += player.velocity.y;
                        }
                    } else if(player.currentAnimation != "stand") {
                        player.gotoAndPlay("stand");
                        // if(speechBubble.currentAnimation == "start") {
                            // bubbleContainer.visible = true;
                            // speechBubble.gotoAndPlay("birth");
                        // }
                    }


                    // if (player.x > guru[0].x - 200 && player.currentAnimation=="walkRight") {
                        // player.gotoAndPlay("standRight");
                        // guru[0].gotoAndPlay("standLeft");
                    // }
                }

                stage.update();
            }

            //allow for WASD and arrow control scheme
            function handleKeyDown(e) {
                //cross browser issues exist
                if(!e){ var e = window.event; }
                switch(e.keyCode) {
                    case KEYCODE_SPACE: toggleMateri(); return false;
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

            elem.ready(function(){
                init(elem.find('canvas')[0]);
            });
        }
    };
}]);
