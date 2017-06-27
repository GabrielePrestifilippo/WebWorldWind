var wwd;
requirejs(['../src/WorldWind',
        './LayerManager'],
    function (ww,
              LayerManager) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        wwd = new WorldWind.WorldWindow("canvasOne");

        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        wwd.navigator.lookAtLocation.latitude = 37;
        wwd.navigator.lookAtLocation.longitude = 15;


        var canvas = document.createElement("canvas");
        var ctx2d = canvas.getContext("2d");
        var c = document.getElementById("canvasOne");
        canvas.width = c.width;
        canvas.height = c.height;
        var heatmap = new HeatCanvas(canvas);

        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        var t = Transformation;
        t.setPoints([[0, 1000], [0, 0], [1000, 0], [1000, 1000]], [[15, 38], [15, 37], [15.5, 37], [15.5, 38]]);

        var out = t.transform([15.0877591, 37.5012762]);

        var x = Math.round(out[0]);
        var y = Math.round(1000 - out[1]);

        heatmap.push(x, y, 100);


        var colorscheme = function (value) {
            var h = (1 - value);
            var l = value * 0.6;
            var s = 0.8;
            var a = value * 0.98;
            return [h, s, l, a];
        };
        heatmap.render(null, null, colorscheme, callback);

        function callback() {
            ctx2d.fill();
            var surfaceImage2 = new WorldWind.SurfaceImage(new WorldWind.Sector(37, 38, 15, 15.5),
                new WorldWind.ImageSource(canvas));

            var surfaceImageLayer = new WorldWind.RenderableLayer();
            surfaceImageLayer.displayName = "Surface Images";
            surfaceImageLayer.addRenderable(surfaceImage2);
            wwd.addLayer(surfaceImageLayer);
            var layerManger = new LayerManager(wwd);
        }


    });