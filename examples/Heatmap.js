var wwd;
var canvas;
var heat;
var cooordinateController;
requirejs(['../src/WorldWind',
        './LayerManager'
    ],
    function (ww,
              LayerManager) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        wwd = new WorldWind.WorldWindow("canvasOne");

        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialLayer(null), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
            {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true}
        ];

        cooordinateController = new WorldWind.ViewControlsLayer(wwd);
        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }
        wwd.addLayer(cooordinateController);


        canvas = document.createElement("canvas");
        var c = document.getElementById("canvasOne");
        canvas.width = c.width;
        canvas.height = c.height;
        heat = simpleheat(canvas);


        var points = [[15.0877591, 37.5012762], [15.0877591, 37.5213762], [15.8877591, 36]];

        if (points.length > 1) {
            var maxLng = Math.max.apply(Math, points.map(function (v) {
                return v[0];
            }));
            var maxLat = Math.max.apply(Math, points.map(function (v) {
                return v[1];
            }));
            var minLng = Math.min.apply(Math, points.map(function (v) {
                return v[0];
            }));
            var minLat = Math.min.apply(Math, points.map(function (v) {
                return v[1];
            }));

            var bufferLng = (maxLng - minLng) / 5;
            var bufferLat = (maxLat - minLat) / 5;

            var minLat = minLat - bufferLat,
                minLng = minLng - bufferLng,
                maxLat = maxLat + bufferLat,
                maxLng = maxLng + bufferLng;

            if (maxLng - minLng < maxLat - minLat) {
                while (maxLng - minLng < maxLat - minLat) {
                    maxLng = maxLng + 0.01;
                    minLng = minLng - 0.01;
                }
            } else {
                while (maxLng - minLng > maxLat - minLat) {
                    minLat = minLat - 0.01;
                    maxLat = maxLat + 0.01;
                }
            }

            var bbox = {
                minLat: minLat,
                minLng: minLng,
                maxLat: maxLat,
                maxLng: maxLng
            };

            var t = Transformation;
            t.setPoints([[0, canvas.height], [0, 0], [canvas.width, 0], [canvas.width, canvas.height]],
                [[bbox.minLng, bbox.minLat], [bbox.minLng, bbox.maxLat], [bbox.maxLng, bbox.maxLat], [bbox.maxLng, bbox.minLat]]);

            points.forEach(function (p) {
                var out = t.transform(p);
                var x = out[0];
                var y = out[1];
                heat.add([x, y, 100]);
            });

        } else {
            var bbox = {
                minLat: points[0][0] - 1,
                minLng: points[0][1] - 1,
                maxLat: points[0][0] + 1,
                maxLng: points[0][1] + 1
            };
        }

        heat.draw();
        wwd.navigator.lookAtLocation.latitude = points[0][1];
        wwd.navigator.lookAtLocation.longitude = points[0][0];


        function drawHeatmap(range) {

            var center = wwd.pickTerrain(new WorldWind.Vec2(canvas.height / 2, canvas.height / 2));

            center = center.objects[0].position;

            var l = range / Math.cos(Math.PI / 8);
            var base = Math.sqrt(Math.pow(l, 2) - Math.pow(range, 2));

            base = base / 100000;
            var minLat = center.latitude - base;
            var maxLat = center.latitude + base;
            var minLng = center.longitude - base;
            var maxLng = center.longitude + base;

            var bufferLng = (maxLng - minLng) / 5;
            var bufferLat = (maxLat - minLat) / 5;

            var minLat = minLat - bufferLat,
                minLng = minLng - bufferLng,
                maxLat = maxLat + bufferLat,
                maxLng = maxLng + bufferLng;

            var bbox = {
                minLat: minLat,
                minLng: minLng,
                maxLat: maxLat,
                maxLng: maxLng
            };


            surfaceImage2.sector.minLatitude = minLat;
            surfaceImage2.sector.minLongitude = minLng;
            surfaceImage2.sector.maxLatitude = maxLat;
            surfaceImage2.sector.maxLongitude = maxLng;

            var t = Transformation;
            t.setPoints([[0, canvas.height], [0, 0], [canvas.width, 0], [canvas.width, canvas.height]],
                [[bbox.minLng, bbox.minLat], [bbox.minLng, bbox.maxLat], [bbox.maxLng, bbox.maxLat], [bbox.maxLng, bbox.minLat]]);
            heat.clear();
            points.forEach(function (p) {
                if (bbox.minLat <= p[1] && p[1] <= bbox.maxLat && bbox.minLng <= p[0] && p[0] <= bbox.maxLng) {
                    var out = t.transform(p);
                    var x = out[0];
                    var y = out[1];
                    heat.add([x, y, 100]);
                }

            });

            heat.draw(0);
            surfaceImage2.imageSourceWasUpdated = true;

        }

        var surfaceImage2 = new WorldWind.SurfaceImage(new WorldWind.Sector(bbox.minLat, bbox.maxLat, bbox.minLng, bbox.maxLng),
            new WorldWind.ImageSource(canvas));

        var surfaceImageLayer = new WorldWind.RenderableLayer();
        surfaceImageLayer.displayName = "Surface Images";
        surfaceImageLayer.addRenderable(surfaceImage2);
        wwd.addLayer(surfaceImageLayer);
        var layerManger = new LayerManager(wwd);

        var navigator = wwd.navigator;




        navigator.handleWheelEvent = function (event) {
            var normalizedDelta;
            if (event.deltaMode == WheelEvent.DOM_DELTA_PIXEL) {
                normalizedDelta = event.deltaY;
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                normalizedDelta = event.deltaY * 40;
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                normalizedDelta = event.deltaY * 400;
            }
            var scale = 1 + (normalizedDelta / 1000);

            // Apply the scale to this navigator's properties.
            this.range *= scale;
            this.applyLimits();
            this.worldWindow.redraw();

            drawHeatmap(this.range);
        };
        cooordinateController.handleZoom = function (e, control) {
            if ((e.type === "mousedown" && e.which === 1) || (e.type === "touchstart")) {
                this.activeControl = control;
                this.activeOperation = this.handleZoom;
                e.preventDefault();

                if (e.type === "touchstart") {
                    this.currentTouchId = e.changedTouches.item(0).identifier; // capture the touch identifier
                }

                // This function is called by the timer to perform the operation.
                var thisLayer = this; // capture 'this' for use in the function
                var setRange = function () {
                    if (thisLayer.activeControl) {
                        if (thisLayer.activeControl === thisLayer.zoomInControl) {
                            thisLayer.wwd.navigator.range *= (1 - thisLayer.zoomIncrement);
                        } else if (thisLayer.activeControl === thisLayer.zoomOutControl) {
                            thisLayer.wwd.navigator.range *= (1 + thisLayer.zoomIncrement);
                        }
                        thisLayer.wwd.redraw();
                        setTimeout(setRange, 50);
                    }
                };
                setTimeout(setRange, 50);
                var range = thisLayer.wwd.navigator.range;
                drawHeatmap(range);

            }


        }
    })
;