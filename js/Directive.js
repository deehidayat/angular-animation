angular.module('DeeDirective',['ngSanitize', 'Constructor'])
.directive('game', ['$stateParams', '$modal', '$document', '$http', 'LoadingBar', 'BitmapButton', 'Player', 'RedBird', 'BlueBird', 'Bubble', function($stateParams, $modal, $document, $http, LoadingBar, BitmapButton, Player, RedBird, BlueBird, Bubble){
    return {
        templateUrl : 'pages/game-tpl.html',
        replace : true,
        scope : {
            urlConfig : '@game'
        },
        // controller : ['$scope', function($scope){
            // $scope.rating = 4;
            // $scope.max = 10;
        // }],
        link : function(scope, elem, attrs, ctrl) {
            var KEYCODE_ENTER = 13,
                KEYCODE_SPACE = 32,
                KEYCODE_UP = 38,
                KEYCODE_LEFT = 37,
                KEYCODE_RIGHT = 39,
                KEYCODE_W = 87,
                KEYCODE_A = 65,
                KEYCODE_D = 68;
            var preload, manifest;
            var lfHeld = false, rtHeld = false;
            var stage, width, height, bgMusic;  // Canvas w - h

            // Halaman Loading
            var loadingInterval = 0;
            var splashContainer, messageField;
            var progressBar = {
              instance : null,
              width : 600,
              height : 40,
              padding : 5,
              baseColor : '#59554D',
              loadColor : '#57B86A',
            };

            // Background Utama
            var mainContainer, sky, fog, fog2, ground, hill, hill2, bird;
            var config; // Untuk menampung konfigurasi file
            scope.prevState = null;
            scope.currentState = null;
            scope.isFullScreen = false;
            scope.isMute = false;

            // Halaman Belajar
            var player, teacher = new Array(), currentTeacher = -1, countTeacher;
            var distance = 0;
            var bubbleContainer, speechBubble, speechText;
            var idxMateri = 0;
            scope.currentMateri = null;
            // var hypnosis =  ['Belajar Biologi itu menyenangkan', 'Belajar Biologi itu mudah', 'Belajar Biologi itu tidak susah'];
            // var hypnosisText;

            // Halaman Quiz
            var idxQuiz = 0;
            scope.currentQuiz = {
                trueAnswer : 0,
                falseAnswer : 0,
                startTime : null,
                finishTime : null,
                rating : 0,
                maxRating : 10
            };
            scope.currentQest = null;
            scope.quizState = 'quest';

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
                var assetsPath = 'assets/';
                manifest = [
                    {src:'belajarButton.png', id:'buttonBelajar'},
                    {src:'quizButton.png', id:'buttonQuiz'},
                    {src:'M-GameBG.ogg', id:'music2'},
                    {src:'layerneg2_fog.png', id:'fog'},
                    {src:'layerneg2_fog2.png', id:'fog2'},
                    {src:'sky.png', id:'sky'},
                    {src:'ground.png', id:'ground'},
                    {src:'parallaxHill1.png', id:'hill'},
                    {src:'parallaxHill2.png', id:'hill2'},
                ];

                createjs.Sound.alternateExtensions = ['mp3'];
                preload = new createjs.LoadQueue(true, assetsPath);
                if(!$stateParams.dev)
                    preload.installPlugin(createjs.Sound);
                preload.addEventListener('complete', doneLoading);
                preload.addEventListener('progress', updateLoading);
                preload.loadManifest(manifest);
            }

            //allow for WASD and arrow control scheme
            function handleKeyDown(e) {
                //cross browser issues exist
                if(!e){ var e = window.event; }
                switch(e.keyCode) {
                    case KEYCODE_SPACE: toggleMateri(true); return false;
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

            /**
             * Halaman Loading
             */
            function createSplash() {
                // Coainter untuk loading dan awal
                splashContainer = new createjs.Container();
                stage.addChild(splashContainer);

                var square = new createjs.Shape();
                square.graphics.beginFill('black').drawRect(0, 0, width, height);
                square.x = 0;
                square.y = 0;
                square.addEventListener('click', handleClick);

                // Loading message
                messageField = new createjs.Text('Loading...', 'bold italic 30px Serif', '#FFFFFF');
                messageField.maxWidth = 1000;
                messageField.textAlign = 'center';
                messageField.x = width / 2;
                messageField.y = height / 2 + 40;

                progressBar.instance = new LoadingBar(progressBar.width, progressBar.height, progressBar.padding, progressBar.loadColor, progressBar.baseColor);//new createjs.Container();
                progressBar.instance.x = width / 2 - (progressBar.width/2);
                progressBar.instance.y = height / 2 - (progressBar.height/2);

                splashContainer.addChild(square, messageField, progressBar.instance);
                setState('loading');
            }

            function updateLoading(event) {
                if(progressBar.instance)
                    progressBar.instance.loadingBar.scaleX = event.progress * progressBar.width;
                stage.update();
            }

            function doneLoading() {
                clearInterval(loadingInterval);
                messageField.text = 'Click untuk memulai';
                stage.update();
            }

            function handleClick(event) {
                restart();
            }

            function restart() {
                stage.removeAllChildren();
                stage.clear();

                // Create Background
                var skyImg = preload.getResult('sky');
                sky = new createjs.Shape();
                sky.scaleY = 2;
                sky.graphics.beginBitmapFill(skyImg).drawRect(0,0,width,skyImg.height);
                sky.cache(0, 0, width, height);

                var groundImg = preload.getResult('ground');
                ground = new createjs.Shape();
                ground.graphics.beginBitmapFill(groundImg).drawRect(-groundImg.width, 0, width + 2 * groundImg.width, groundImg.height);
                ground.scaleX = ground.scaleY = 1;
                ground.tileW = groundImg.width * 1;
                ground.y = height-groundImg.height * 1;
                ground.cache(-groundImg.width, 0, width + 2 * groundImg.width, height);

                hill = new createjs.Bitmap(preload.getResult('hill'));
                hill.scaleX = hill.scaleY = 2;
                hill.setTransform(Math.random() * width, height-hill.image.height*3-(groundImg.height*1), 3, 3);
                hill.cache(0, 0, width, height);

                hill2 = new createjs.Bitmap(preload.getResult('hill2'));
                hill2.setTransform(Math.random() * width, height-hill2.image.height*3-(groundImg.height*1), 3, 3);
                hill2.cache(0, 0, width, height);

                fog = new createjs.Bitmap(preload.getResult('fog'));
                fog.setTransform(Math.random() * width, height-fog.image.height*3-(groundImg.height*1), 3, 3);
                fog.cache(0, 0, width, height);

                fog2 = new createjs.Bitmap(preload.getResult('fog2'));
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

                // Keyboard Event
                $document.bind('keydown', handleKeyDown);
                $document.bind('keyup', handleKeyUp);

                //start game timer
                if (!createjs.Ticker.hasEventListener('tick')) {
                    createjs.Ticker.timingMode = createjs.Ticker.RAF;
                    createjs.Ticker.setFPS(20);
                    // createjs.Ticker.setInterval(50);        // in ms
                    createjs.Ticker.addEventListener('tick', tick);
                }

                scope.showMenu(true);
                // start the music
                bgMusic = createjs.Sound.play('music2', {xinterrupt:createjs.Sound.INTERRUPT_NONE, loop:-1, volume:0.4});
            }

            scope.openAbout = function() {
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
            scope.openFullScreen = function(id) {
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

            scope.toogleMute = function() {
                createjs.Sound.setMute(!scope.isMute);
                scope.isMute = createjs.Sound.getMute();
            };

            function setState(state, apply) {
                if (state=='quiz') {
                   scope.quizState = 'quest';
                }
                if (!apply) {
                    scope.prevState = scope.currentState;
                    scope.currentState = state;
                } else {
                    scope.$apply(function(){
                        scope.prevState = scope.currentState;
                        scope.currentState = state;
                    });
                }
            };

            /**
             * Halaman Menu
             */
            scope.showMenu = function(apply) {
                mainContainer.removeAllChildren();
                setState('menu', apply);
            };


            /**
             * Halaman Belajar
             */
            scope.showBelajar = function() {
                mainContainer.removeAllChildren();

                /**
                 * Membuat player
                 */
                var playerScale = 2, playerY = height - (preload.getResult('ground').height*1) - 64;
                if (!player) {
                    player = Player.create({name: config.playerName, index:parseInt(config.playerIndex)});
                    player.scaleX = player.scaleY = playerScale;
                }
                player.x = 300;
                player.y = playerY;
                mainContainer.addChild(player);

                /**
                 * Untuk menampilkan Message dari teacher
                 */
                if (!bubbleContainer) {
                    bubbleContainer = new createjs.Container();
                    speechBubble = Bubble.create();
                    speechBubble.scaleX = speechBubble.scaleY = 1;
                    speechBubble.addEventListener('animationend', function(e){
                        if(e.name=='death')
                            bubbleContainer.visible = false;
                    });
                }
                bubbleContainer.visible = false;
                speechBubble.y = player.y - 10 - 200;
                speechBubble.x = player.x + 32 - 200;
                bubbleContainer.addChild(speechBubble);
                mainContainer.addChild(bubbleContainer);

                /**
                 * Untuk menampilkan materi dari teacher
                 */
                // var rect = new createjs.Shape();
                // rect.x = width * 0.1 / 2;
                // rect.y = 70;
                // rect.graphics.beginStroke('#FF0').setStrokeStyle(5).beginFill('#59554D').drawRoundRect(0, 0, width * 0.9, 400, 10).closePath();
//
                // if (!materiContainer) {
                    // materiContainer = new createjs.Container();
                // }
                // materiContainer.addChild(rect);
                // materiContainer.visible = false;
                // mainContainer.addChild(materiContainer);


                // hypnosisText = new createjs.Text('--', 'bold 30px Unkempt', '#59554D');
                // // hypnosisText.text = 'Belajar biologi itu gampang';
                // // hypnosisText.x = 1000;
                // hypnosisText.y = height * 0.5;
                // hypnosisText.lineWidth = 300;
                // hypnosisText.visible = false;
                // mainContainer.addChild(hypnosisText);

                /**
                 * Membuat Guru
                 */
                countTeacher = 0;
                for (var i=0, l=config.teacher.length; i<l; i++) {
                    var g = config.teacher[i];
                    if(!teacher[i]) {
                        teacher[i] = Player.create({name:g.name, index:g.index, type:'teacher'});
                        teacher[i].addEventListener('click',function(){
                           toggleMateri(true);
                        });
                        teacher[i].message = g.message.toString().toString().replace('%playerName%', config.playerName);
                        teacher[i].materi = g.materi;
                        teacher[i].scaleX = teacher[i].scaleY = playerScale;
                    }
                    teacher[i].learned = false;
                    teacher[i].x = 700 * (i + 1);
                    teacher[i].y = playerY;
                    mainContainer.addChild(teacher[i]);
                    countTeacher++;
                };


                // teacher[1] = BlueBird.create();
                // teacher[1].x = 2500;
                // teacher[1].y = height - (preload.getResult('ground').height*1) - 64;
                // teacher[1].scaleX = teacher[1].scaleY = 1;


                setState('belajar');
            };

            scope.showPrevNext = function() {
                return teacher && currentTeacher>-1 ? teacher[currentTeacher].materi.length > 1 : false;
            };

            scope.selectMateri = function (index) {
                if(!index)
                    idxMateri = 0;
                else
                    idxMateri += index;
                if(idxMateri >= teacher[currentTeacher].materi.length)
                    idxMateri = 0;
                else if(idxMateri<0)
                    idxMateri = teacher[currentTeacher].materi.length -1;
                scope.currentMateri = teacher[currentTeacher].materi[idxMateri];
                teacher[currentTeacher].learned = true;
            };

            scope.toggleMateri = toggleMateri = function (apply) {
                if(scope.currentState == 'belajar') {
                    removeSpeech();
                    scope.selectMateri();
                    // materiContainer.visible = true;
                    setState('materi', apply);
                } else if (scope.currentState == 'materi') {
                    // materiContainer.visible = false;
                    setState('belajar', apply);
                }
            };

            function removeSpeech() {
                speechBubble.removeText();
                speechBubble.gotoAndPlay('death');
            };

            function showSpeech(scaleX) {
                speechBubble.scaleX = scaleX;
                speechBubble.y = teacher[currentTeacher].y - 10 - 200;
                speechBubble.x = teacher[currentTeacher].x + 32 - 200 * scaleX;
                speechBubble.handleText(teacher[currentTeacher].message);

                if(speechBubble.currentAnimation == 'start' && !teacher[currentTeacher].learned) {
                    bubbleContainer.visible = true;
                    speechBubble.gotoAndPlay('birth');
                }
            }

            function moveAllTeacher(value) {
                for (var i=0; i<countTeacher; i++) {
                    teacher[i].x -= value;
                }
            };

            function watchTeacherPosition() {
                for (var i=0; i<countTeacher; i++) {
                    if(player.x < teacher[i].x && player.x >= teacher[i].x - 200) {
                        currentTeacher = i;
                        if(teacher[currentTeacher].currentAnimation != 'standLeft')
                            teacher[currentTeacher].gotoAndPlay('standLeft');

                        showSpeech(1);
                        break;
                    } else if(player.x > teacher[i].x && player.x <= teacher[i].x + 200) {
                        currentTeacher = i;
                        if(teacher[currentTeacher].currentAnimation != 'standRight')
                            teacher[currentTeacher].gotoAndPlay('standRight');

                        showSpeech(-1);
                        break;
                    } else {
                        if(teacher[i].currentAnimation != 'stand') {
                            teacher[i].gotoAndPlay('stand');
                            currentTeacher = -1;
                        }

                        if(speechBubble.currentAnimation == 'idle' && currentTeacher == -1) {
                            removeSpeech();
                        }
                    }
                }
            }

            scope.moveRight = function() {
                rtHeld = true;
            };

            scope.moveLeft = function() {
                lfHeld = true;
            };

            scope.moveStop = function() {
                rtHeld = lfHeld = false;
            };

            /**
             * Halaman Quiz
             */
            scope.showQuiz = function() {
                mainContainer.removeAllChildren();

                scope.currentQuiz['trueAnswer'] = 0;
                scope.currentQuiz['falseAnswer'] = 0;
                scope.currentQuiz['rating'] = 0;
                scope.currentQuiz['startTime'] = new Date().getMilliseconds();
                scope.currentQuiz['finishTime'] = new Date().getMilliseconds();

                selectQuiz();
                setState('quiz');
            };

            /**
             * Randomize array element order in-place.
             * Using Fisher-Yates shuffle algorithm.
             */
            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            }

            function selectQuiz(index) {
                if(!index)
                    idxQuiz = 0;
                else
                    idxQuiz += index;
                if(idxQuiz >= config.quiz.length) {
                    idxQuiz = 0;
                    return calculateRating();
                }
                scope.currentQest = config.quiz[idxQuiz];
                // scope.currentQest.chooises = shuffleArray(scope.currentQest.chooises);
            };

            scope.answerQuiz = function(id) {
                if(scope.currentQest.answer == id) {
                    $modal.open({
                        template : '<div class="modal-body bg-primary"><i class="glyphicon glyphicon-ok"></i> Ok</div>',
                        backdrop : 'static',
                        controller : ['$timeout', '$modalInstance', function($timeout, $modalInstance){
                            $timeout(function(){
                                $modalInstance.close(true);
                            }, 1000);
                        }],
                    }).result.then(function(result){
                        if(result) {
                            scope.currentQuiz.trueAnswer++;
                            selectQuiz(1);
                            console.log(scope.currentQuiz);
                        }
                    });
                } else {
                    scope.currentQuiz.falseAnswer++;
                    selectQuiz(1);
                    console.log(scope.currentQuiz);
                }
            };

            function calculateRating() {
                scope.currentQuiz.rating = Math.ceil(scope.currentQuiz.trueAnswer / config.quiz.length * scope.currentQuiz.maxRating);
                return scope.quizState = 'result';
            }


            function tick(event) {
                var deltaS = event.delta/1000;

                /**
                 * Gerakan awan
                 */
                fog.x = (fog.x - deltaS * 30);
                if (fog.x + fog.image.width* fog.scaleX <= 0) { fog.x = width; }
                fog2.x = (fog2.x - deltaS * 45);
                if (fog2.x + fog2.image.width*fog2.scaleX <= 0) { fog2.x = width; }
                bird.x = (bird.x + deltaS * 100);
                if (bird.x > width + 100) { bird.x = -100; bird.y = Math.random() * (height * 0.3); }
                // if (bird.x <  -100) { bird.x = width + 100; bird.y = Math.random() * (height * 0.3); }


                if(scope.currentState == 'belajar') {
                    player.tick();

                    /**
                     * Maju - Mundur
                     */
                    if(rtHeld) {
                        if(player && player.currentAnimation == 'stand')
                            player.gotoAndPlay('walkRight');

                        bird.x -= player.velocity.x;

                        player.velocity.x = player.velocity.x * 0.9;
                        distance += player.velocity.x;

                        if(player.x > (width * 0.5) - 64 && player.currentAnimation=='walkRight') {
                            ground.x = (ground.x - player.velocity.x) % ground.tileW;
                            hill.x = (hill.x - deltaS*30);
                            if (hill.x + hill.image.width*hill.scaleX <= 0) { hill.x = width; }
                            hill2.x = (hill2.x - deltaS*45);
                            if (hill2.x + hill2.image.width*hill2.scaleX <= 0) { hill2.x = width; }
                            moveAllTeacher(player.velocity.x);
                            // teacher[1].x -= player.velocity.x;
                            // hypnosisText.x -= player.velocity.x;
                        } else if (player && player.currentAnimation == 'walkRight') {
                            //moving the player
                            player.x += player.velocity.x;
                            player.y += player.velocity.y;
                        }
                    } else if (lfHeld && distance>=0) {
                        if(player && player.currentAnimation=='stand')
                            player.gotoAndPlay('walkLeft');

                        bird.x -= player.velocity.x;

                        player.velocity.x = player.velocity.x * 0.9;
                        distance += player.velocity.x;

                        if(player.x < (width * 0.5) - 64 && player.currentAnimation=='walkLeft') {
                            ground.x = (ground.x  + player.velocity.x * -1) % ground.tileW ;

                            hill.x = (hill.x + deltaS*30);
                            if (hill.x + hill.image.width*hill.scaleX <= 0) { hill.x = width; }
                            hill2.x = (hill2.x + deltaS*45);
                            if (hill2.x + hill2.image.width*hill2.scaleX <= 0) { hill2.x = width; }
                            moveAllTeacher(player.velocity.x);
                            // teacher[1].x -= player.velocity.x;
                            // hypnosisText.x -= player.velocity.x;
                        } else if (player && player.currentAnimation == 'walkLeft') {
                            //moving the player
                            player.x += player.velocity.x;
                            player.y += player.velocity.y;
                        }
                    } else if(player.currentAnimation != 'stand') {
                        player.gotoAndPlay('stand');
                    }

                    /**
                     * Munculkan Popup
                     */
                    watchTeacherPosition();
//
                    // // Guru 2
                    // if(player.x >= teacher[1].x - 200 && player.x <= teacher[1].x + 200) {
                        // if(teacher[1].currentAnimation != 'standFly')
                            // teacher[1].gotoAndPlay('standFly');
                    // } else {
                        // if(teacher[1].currentAnimation != 'stand')
                            // teacher[1].gotoAndPlay('stand');
                    // }
//

                };

                stage.update();
            }

            elem.ready(function(){
                $http.get(scope.urlConfig).success(function(data){
                    config = data;
                    init(elem.find('canvas')[0]);
                });
            });
        }
    };
}]);
