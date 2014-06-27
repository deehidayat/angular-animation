var Constructor = angular.module('Constructor', [])
.factory('LoadingBar', [
function() {

    var LoadingBar = function(width, height, padding, color, frameColor) {

        //setting default values for our arguments if no value is given
        width = typeof width !== 'undefined' ? width : 300;
        height = typeof height !== 'undefined' ? height : 20;
        padding = typeof padding !== 'undefined' ? padding : 3;
        color = typeof color !== 'undefined' ? color : "black";
        frameColor = typeof frameColor !== 'undefined' ? frameColor : "black";

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
            // spritesheet "bitmap" button:
            var spriteSheet = new createjs.SpriteSheet({
                images: image,
                frames: {width:300, height:100},
                animations: { out: 0, over: 1, down: 2 }
            });
            var bitmapButton = new createjs.Sprite(spriteSheet, "up");
            var bitmapHelper = new createjs.ButtonHelper(bitmapButton);
            return bitmapButton;
        }
    };
}]);
// .factory('',[function(){}]);
