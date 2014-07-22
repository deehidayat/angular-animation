angular.module('DeeDirective',['ngSanitize', 'Constructor', 'ngAnimate', ])
.directive('gameSlide',['$http', '$interval', '$timeout', '$store', function($http, $interval, $timeout, $store){
    return {
        templateUrl:'pages/game-slide-tpl.html',
        replace:true,
        scope : {
            urlConfig : '@gameSlide'
        },
        controller : ['$scope',function($scope){
            var preload;
            $scope.completeLoading = false;
            $scope.loadingProgress = 0;

            $scope.config = {};
            $scope.slides = [];

            $scope.homeSlide = {
                label:'Home',
                templateUrl:'pages/slide-menu.html',
                click:function(){
                    $scope.selectSlide(this);
                },
                // animate:'slide-animate slide-animate-down'
            };

            $scope.quizSlide = {
                label:'Quiz',
                templateUrl:'pages/slide-quiz.html',
                click:function(){
                    $scope.selectSlide(this);
                },
                animate:'slide-animate slide-animate-left'
            };

            $scope.aboutSlide = {
                label:'About',
                templateUrl:'pages/slide-about.html',
                click:function(){
                    $scope.selectSlide(this);
                },
                // animate:'slide-animate slide-animate-down'
            };

            $scope.initialize = function(config) {
                $scope.config = config;
                $scope.slides = $scope.config['slides'];
                var assetsPath = 'assets/';
                var manifest = [
                    {src:'funk.ogg', id:'quizMusic'},
                    {src:'Just-Bee.ogg', id:'belajarMusic'},
                    {src:'beep-ok.ogg', id:'beepOk'},
                    {src:'beep-error.ogg', id:'beepError'},
                    {src:'click.ogg', id:'click'},
                    {src:'Chill.ogg', id:'chill'},
                    {src:'Chillvolution.ogg', id:'chillvolution'},
                    {src:'futuristic.ogg', id:'futuristic'},
                ];
                createjs.Sound.alternateExtensions = ['mp3'];
                preload = new createjs.LoadQueue(true, assetsPath);
                preload.installPlugin(createjs.Sound);
                preload.addEventListener('complete', doneLoading);
                preload.addEventListener('progress', updateLoading);
                preload.loadManifest(manifest);
            };

            $scope.loadingProgress = 0;
            function updateLoading(event) {
                $scope.$apply(function() {
                    $scope.loadingProgress = event.progress;
                });
            }

            function doneLoading() {
            }

            $scope.isMute = $store.get('muted') ? $store.get('muted') : false;
            $scope.toogleMute = function(apply) {
                createjs.Sound.setMute(!$scope.isMute);
                if(!apply==true)
                    $scope.isMute = !$scope.isMute;
                else
                    $scope.$apply(function(){
                        $scope.isMute = !$scope.isMute;
                    });
                $store.set('muted', $scope.isMute);
            };

            $scope.playSound = function(id,vol) {
                id = id ? id : 'click';
                vol = vol ? vol : 0.1;
                createjs.Sound.play(id, {interrupt:createjs.Sound.INTERRUPT_ANY, volume:vol});
            };

            $scope.restart = function() {
                if ($scope.loadingProgress == 1) {
                    $scope.completeLoading = true;
                    $scope.selectSlide($scope.homeSlide);

                    createjs.Sound.setMute($scope.isMute);
                }
            };

            // Quiz Ctrl
            var quizInterval;
            $scope.quizState = 'quest';
            $scope.currentQuiz = {
                trueAnswer:0,
                falseAnswer:0,
                time:0,
                startTime:null,
                finishTime:null,
                rating:0,
                maxRating:10
            };
            $scope.currentQest = null;
            $scope.elapedTime = '0:0:0';

            function resetQuiz() {
                $scope.quizState = 'quest';
                $scope.currentQuiz['trueAnswer'] = 0;
                $scope.currentQuiz['falseAnswer'] = 0;
                $scope.currentQuiz['rating'] = 0;
                $scope.currentQuiz['time'] = 0;
                $scope.currentQuiz['startTime'] = new Date();
                // scope.currentQuiz['finishTime'] =
                // angular.copy(scope.currentQuiz['startTime']);

                // Start Timer
                $scope.elapedTime = '0:0:0';
                if (quizInterval)
                    clearInterval(quizInterval);
                quizInterval = $interval(function() {
                    quizTimer();
                }, 1000);

                selectQuiz();
            };

            function quizTimer() {
                $scope.currentQuiz['time']++;
                var endTime = new Date();
                // time difference in ms
                var timeDiff = endTime - $scope.currentQuiz['startTime'];
                // strip the miliseconds
                timeDiff /= 1000;
                // get seconds
                var seconds = Math.round(timeDiff % 60);
                // remove seconds from the date
                timeDiff = Math.floor(timeDiff / 60);
                // get minutes
                var minutes = Math.round(timeDiff % 60);
                // remove minutes from the date
                timeDiff = Math.floor(timeDiff / 60);
                // get hours
                var hours = Math.round(timeDiff % 24);
                // remove hours from the date
                timeDiff = Math.floor(timeDiff / 24);
                // the rest of timeDiff is number of days
                var days = timeDiff;
                $scope.elapedTime = hours + ":" + minutes + ":" + seconds;
                // scope.elapedTime =
                // moment.duration(timeDiff*-1).humanize();
            }

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
                $scope.showAnswer = false;
                if (!index)
                    idxQuiz = 0;
                else
                    idxQuiz += index;
                if (idxQuiz >= $scope.config.quiz.length) {
                    idxQuiz = 0;
                    if (quizInterval)
                        clearInterval(quizInterval);
                    return calculateRating();
                }
                $scope.currentQest = $scope.config.quiz[idxQuiz];
                // scope.currentQest.chooises =
                // shuffleArray(scope.currentQest.chooises);
            };

            $scope.showAnswer = false;
            var aTimer = null;
            $scope.answerQuiz = function(id) {
                if(aTimer) return false;
                if ($scope.currentQest.answer == id) {
                    $scope.playSound('beepOk', 0.05);
                    $scope.currentQuiz.trueAnswer++;
                    selectQuiz(1);
                } else {
                    $scope.playSound('beepError', 0.05);
                    $scope.currentQuiz.falseAnswer++;
                    $scope.showAnswer = true;
                    aTimer = $timeout(function(){
                        selectQuiz(1);
                        aTimer = null;
                    },2000);
                }
            };

            $store.bind($scope, 'scores', 0);
            $scope.bestScore = 0;
            function calculateRating() {
                $scope.playSound('futuristic', 0.5);
                $scope.currentQuiz.rating = Math.ceil($scope.currentQuiz.trueAnswer / $scope.config.quiz.length * $scope.currentQuiz.maxRating);
                $scope.bestScore=$store.get('scores');
                if(!$scope.bestScore || $scope.bestScore<$scope.currentQuiz.rating)
                    $store.set('scores', $scope.currentQuiz.rating);
                return $scope.quizState = 'result';
            }
            //--> End Quiz Ctrl

            // Materi / Belajar
            $scope.currentMateri;
            var idxMateri = 0;
            $scope.showPrevNext = function() {
                return $scope.currentSlide && $scope.currentSlide.materi && $scope.currentSlide.materi.length > 1;
            };

            $scope.selectMateri = function (index) {
                if(!index)
                    idxMateri = 0;
                else
                    idxMateri += index;
                if(idxMateri >= $scope.currentSlide.materi.length)
                    idxMateri = 0;
                else if(idxMateri<0)
                    idxMateri = $scope.currentSlide.materi.length - 1;

                $scope.currentMateri = $scope.currentSlide.materi[idxMateri];
            };
            //--> End Materi


            // Global
            var currentMusic, currentSound;
            function changeMusic(id) {
                if (currentMusic==id) return;
                function reset() {
                    if(currentSound) {
                        currentSound.stop();
                        currentSound = null;
                    }
                }
                reset();
                currentMusic = id;
                currentSound = createjs.Sound.play(id, {interrupt:createjs.Sound.INTERRUPT_ANY, loop:-1, volume:0.7});
            };

            $scope.selectSlide = function(slide) {
                if (slide != $scope.quizSlide) {
                    if (quizInterval)
                        clearInterval(quizInterval);
                }
                if (slide == $scope.homeSlide) {
                    changeMusic('belajarMusic');
                } else
                if (slide == $scope.aboutSlide) {
                    changeMusic('chillvolution');
                } else
                if (slide == $scope.quizSlide) {
                    changeMusic('quizMusic');
                    resetQuiz();
                }
                $scope.currentSlide = slide;
                if ($scope.slides.indexOf(slide) != -1) {
                    $scope.selectMateri(0);
                }
            };

        }],
        link : function(scope, elem, attrs, ctrl) {

            elem.ready(function() {
                $http.get(scope.urlConfig).success(function(data) {
                    scope.initialize(data);
                });
            });

        }
    };
}])
.directive('game', ['$stateParams', '$modal', '$document', '$http', '$interval', 'LoadingBar', 'BitmapButton', 'Player', 'RedBird', 'BlueBird', 'Bubble', function($stateParams, $modal, $document, $http, $interval, LoadingBar, BitmapButton, Player, RedBird, BlueBird, Bubble){
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
                KEYCODE_D = 68,
                KEYCODE_I = 73,
                KEYCODE_M = 77;
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
            scope.isMute = false;

            // Halaman Belajar
            var player, belajarMusic;
            var teacher = new Array(), currentTeacher = -1, countTeacher, idxMateri = 0;
            var landmark, distance = 0;
            var bubbleContainer, speechBubble, speechText;
            scope.currentMateri = null;
            scope.showMateri = false;
            // var hypnosis =  ['Belajar Biologi itu menyenangkan', 'Belajar Biologi itu mudah', 'Belajar Biologi itu tidak susah'];

            // Hypnosis
            var hypnosisText;
            var idxHypnosis = 0;

            // Halaman Quiz
            var idxQuiz = 0, quizMusic;
            scope.currentQuiz = {
                trueAnswer : 0,
                falseAnswer : 0,
                time : 0,
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
                // createjs.Touch.enable(stage);

                // enable mouse over / out events, required for button rollovers
                // stage.enableMouseOver(10);

                createSplash();

                // begin loading content (only sounds to load)
                var assetsPath = 'assets/';
                manifest = [
                    {src:'funk.ogg', id:'quizMusic'},
                    {src:'Just-Bee.ogg', id:'belajarMusic'},
                    {src:'Game-Spawn.ogg', id:'gameSpawn'},
                    {src:'beep-ok.ogg', id:'beepOk'},
                    {src:'beep-error.ogg', id:'beepError'},
                    {src:'click.ogg', id:'click'},
                    {src:'futuristic.ogg', id:'futuristic'},
                    {src:'wind.ogg', id:'wind'},
                    {src:'landmark5.png', id:'landmark'},
                    {src:'layerneg2_fog.png', id:'fog'},
                    {src:'layerneg2_fog2.png', id:'fog2'},
                    {src:'sky.png', id:'sky'},
                    {src:'ground.png', id:'ground'},
                    {src:'parallaxHill1.png', id:'hill'},
                    {src:'parallaxHill2.png', id:'hill2'},
                ];

                createjs.Sound.alternateExtensions = ['mp3'];
                preload = new createjs.LoadQueue(true, assetsPath);
                if($stateParams.dev != true)
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
                    case KEYCODE_I: scope.openAbout(); break;
                    case KEYCODE_M: scope.toogleMute(true); break;
                    case KEYCODE_SPACE: toggleMateri(true); break;
                    case KEYCODE_LEFT:  scope.moveLeft(); break;
                    case KEYCODE_RIGHT: scope.moveRight(); break;
                }
            }

            function handleKeyUp(e) {
                //cross browser issues exist
                if(!e){ var e = window.event; }
                switch(e.keyCode) {
                    case KEYCODE_LEFT:  scope.moveStop(); break;
                    case KEYCODE_RIGHT: scope.moveStop(); break;
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

                createjs.Sound.play('wind', {interrupt:createjs.Sound.INTERRUPT_NONE, loop:-1, volume:0.2});

                selectHypnosis();
                scope.showMenu(true);
            }

            scope.openAbout = function() {
                createjs.Sound.play('click', {xinterrupt:createjs.Sound.INTERRUPT_ANY, volume:0.4});
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
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.mozCancelFullScreen) {
                    elem.mozCancelFullScreen();
                } else if(elem.webkitCancelFullScreen){
                    elem.webkitCancelFullScreen();
                }
            };

            scope.isFullScreen = function() {
                return ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard methods
      document.mozFullScreen || document.webkitIsFullScreen);
            };

            scope.toogleMute = function(apply) {
                createjs.Sound.play('click', {xinterrupt:createjs.Sound.INTERRUPT_ANY, volume:0.4});
                createjs.Sound.setMute(!scope.isMute);
                if(!apply==true)
                    scope.isMute = !scope.isMute;
                else
                    scope.$apply(function(){
                        scope.isMute = !scope.isMute;
                    });
            };

            function setState(state, apply) {
                createjs.Sound.play('click', {interrupt:createjs.Sound.INTERRUPT_ANY, volume:0.4});
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
                if (state=='materi')
                    createjs.Sound.play('gameSpawn', {interrupt:createjs.Sound.INTERRUPT_ANY, volume:0.8});

                if (state=='belajar') {
                    if(quizMusic)
                        quizMusic.stop();
                    if(!belajarMusic)
                        belajarMusic = createjs.Sound.play('belajarMusic', {interrupt:createjs.Sound.INTERRUPT_ANY, loop:-1, volume:0.7});
                    else
                        belajarMusic.play();
                } else if (state=='quiz') {
                    if(belajarMusic)
                        belajarMusic.stop();
                    if(!quizMusic)
                        quizMusic = createjs.Sound.play('quizMusic', {interrupt:createjs.Sound.INTERRUPT_ANY, loop:-1, volume:0.7});
                    else
                        quizMusic.play();
                } else if (state=='menu') {
                    if(!belajarMusic)
                        belajarMusic = createjs.Sound.play('belajarMusic', {interrupt:createjs.Sound.INTERRUPT_ANY, loop:-1, volume:0.7});
                    else
                        belajarMusic.play();
                    // if(belajarMusic)
                        // belajarMusic.stop();
                    // if(quizMusic)
                        // quizMusic.stop();
                }
            };

            scope.currentHypnosis = null;
            function selectHypnosis(index) {
                if(!index)
                    idxHypnosis = 0;
                else
                    idxHypnosis += index;
                if(idxHypnosis >= config.hypnosis.length)
                    idxHypnosis = 0;
                else if(idxHypnosis<0)
                    idxHypnosis = config.hypnosis.length-1;

                // if(!hypnosisText) {
                    hypnosisText = new createjs.Container();

                    var bg = new createjs.Shape();
                    bg.graphics.beginStroke("#F00").beginFill("#00F").drawRect(0, 0, 300, 100);
                    bg.x = width/2-150;
                    bg.y = height/8;

                    var text = new createjs.Text("---", "22px Arial", "#FF0");
                    text.x = bg.x + 5;
                    text.y = bg.y + 5;
                    text.lineWidth = 290;
                    hypnosisText.addChild(bg, text);
                    mainContainer.addChild(hypnosisText);
                    hypnosisText.scaleX = hypnosisText.scaleY = 0;
                // }

                createjs.Tween.get(hypnosisText,{loop:true})
                    .wait(1000)
                    .call(function(){
                        idxHypnosis += 1;
                        if(idxHypnosis >= config.hypnosis.length)
                            idxHypnosis = 0;
                        else if(idxHypnosis<0)
                            idxHypnosis = config.hypnosis.length-1;
                        text.text = config.hypnosis[idxHypnosis];
                    })
                    // .set({y:200}, circle)
                    .to({scaleX:1,scaleY:1, x:0, y:0},1000,createjs.Ease.bounceOut)
                    .wait(5000) // wait for 1 second
                    .to({scaleX:0.0,scaleY:0.0, x:0, y:0}, 500); // jump to the new scale properties (default duration of 0)
                    // .set({x:100}, hypnosisText)
            }

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
                distance = 0;

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


                /**
                 * Membuat Guru
                 */
                countTeacher = 0;
                var jarak = 0;
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
                    jarak += teacher[i].x;
                };

                if (!landmark) {
                    landmark = new createjs.Bitmap(preload.getResult('landmark'));
                }
                landmark.setTransform(jarak, playerY-10, 0.5, 0.5);
                landmark.cache(0, 0, width, height);
                mainContainer.addChild(landmark);

                selectHypnosis();


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
                var http  = $http.get(teacher[currentTeacher].materi[idxMateri],{cache:true});
                http.success(function(data){
                    scope.currentMateri = data;
                    teacher[currentTeacher].learned = true;
                });
                return http;
            };

            scope.toggleMateri = toggleMateri = function (apply) {
                if(scope.currentState == 'belajar' && currentTeacher>-1 && !scope.showMateri) {
                    removeSpeech();
                    scope.selectMateri().success(function(){
                        scope.showMateri = true;
                    });
                } else if (scope.showMateri) {
                    if(!apply)
                        scope.showMateri = false;
                    else
                        scope.$apply(function(){
                            scope.showMateri = false;
                        });
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
                landmark.x -= value;
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
                if(!scope.showMateri)
                    rtHeld = true;
                else
                    scope.selectMateri(1);
            };

            scope.moveLeft = function() {
                if(!scope.showMateri)
                    lfHeld = true;
                else
                    scope.selectMateri(-1);
            };

            scope.moveStop = function() {
                rtHeld = lfHeld = false;
            };


    /**
     * Halaman Quiz
     */
    var quizInterval;
    scope.elapedTime = '0:0:0';
    scope.showQuiz = function(apply) {
        mainContainer.removeAllChildren();

        scope.currentQuiz['trueAnswer'] = 0;
        scope.currentQuiz['falseAnswer'] = 0;
        scope.currentQuiz['rating'] = 0;
        scope.currentQuiz['time'] = 0;
        scope.currentQuiz['startTime'] = new Date();
        // scope.currentQuiz['finishTime'] =
        // angular.copy(scope.currentQuiz['startTime']);

        // Start Timer
        scope.elapedTime = '0:0:0';
        quizInterval = $interval(function() {
            quizTimer();
        }, 1000);

        selectQuiz();
        setState('quiz', apply);
    };

    function quizTimer() {
        scope.currentQuiz['time']++;
        var endTime = new Date();
        // time difference in ms
        var timeDiff = endTime - scope.currentQuiz['startTime'];
        // strip the miliseconds
        timeDiff /= 1000;
        // get seconds
        var seconds = Math.round(timeDiff % 60);
        // remove seconds from the date
        timeDiff = Math.floor(timeDiff / 60);
        // get minutes
        var minutes = Math.round(timeDiff % 60);
        // remove minutes from the date
        timeDiff = Math.floor(timeDiff / 60);
        // get hours
        var hours = Math.round(timeDiff % 24);
        // remove hours from the date
        timeDiff = Math.floor(timeDiff / 24);
        // the rest of timeDiff is number of days
        var days = timeDiff;
        scope.elapedTime = hours + ":" + minutes + ":" + seconds;
        // scope.elapedTime = moment.duration(timeDiff*-1).humanize();
    }

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
        if (!index)
            idxQuiz = 0;
        else
            idxQuiz += index;
        if (idxQuiz >= config.quiz.length) {
            idxQuiz = 0;
            return calculateRating();
        }
        scope.currentQest = config.quiz[idxQuiz];
        // scope.currentQest.chooises = shuffleArray(scope.currentQest.chooises);
    };

    scope.answerQuiz = function(id) {
        if (scope.currentQest.answer == id) {
            createjs.Sound.play('beepOk', {
                interrupt:createjs.Sound.INTERRUPT_ANY,
                volume:1
            });
            // $modal.open({
            // template : '<div class="modal-body bg-primary"><i class="glyphicon
            // glyphicon-ok"></i> Ok</div>',
            // backdrop : 'static',
            // controller : ['$timeout', '$modalInstance', function($timeout,
            // $modalInstance){
            // $timeout(function(){
            // $modalInstance.close(true);
            // }, 1000);
            // }],
            // }).result.then(function(result){
            // if(result) {
            scope.currentQuiz.trueAnswer++;
            selectQuiz(1);
            // console.log(scope.currentQuiz);
            // }
            // });
        } else {
            createjs.Sound.play('beepError', {
                interrupt:createjs.Sound.INTERRUPT_ANY,
                volume:1
            });
            scope.currentQuiz.falseAnswer++;
            selectQuiz(1);
            // console.log(scope.currentQuiz);
        }
    };

    function calculateRating() {
        createjs.Sound.play('futuristic', {
            interrupt:createjs.Sound.INTERRUPT_ANY,
            volume:0.8
        });
        if (quizInterval)
            clearInterval(quizInterval);
        // console.log(scope.currentQuiz['time']);
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

                    if (player.x >= landmark.x + 100) {
                        rtHeld = lfHeld = false;
                        return scope.showQuiz(true);
                    }
                    player.tick();

                    /**
                     * Maju - Mundur
                     */
                    if(rtHeld && !scope.showMateri) {
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
                    } else if (lfHeld && !scope.showMateri && distance>=0) {
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
            elem.on('$destroy', function() {
                stage.clear();
            });
        }
    };
}]).directive('customScroll',[function(){
    return {
        link : function(scope, elem, attrs, ctrl) {
            var opt = {
                theme : 'yellow',
                autoHideScrollbar : false,
                scrollInertia : 0,
                autoDraggerLength : false,
                mouseWheel : true,
                mouseWheelPixels : 20,
                // scrollButtons:{
                // enable : false,
                // scrollType : 'continuous',
                // scrollSpeed : 0,
                // scrollAmount : 0,
                // },
                // callbacks : {
                // onTotalScroll : function() {
                // console.log("scrolled to end of content.", elem);
                // }
                // }
              };
            elem.ready(function(){
            console.log(elem);
               jQuery(elem).mCustomScrollbar(opt);
            });
        }
    };
}]);
