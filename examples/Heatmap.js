var wwd;
var canvas;
var heat;
requirejs(['../src/WorldWind',
        './LayerManager'],
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
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }


        //canvas = document.createElement("canvas");
        canvas = document.getElementById("canvasTwo");
        var c = document.getElementById("canvasOne");
        canvas.width = c.width;
        canvas.height = c.height;
        heat = simpleheat(canvas);


        var points = [[15.0877591, 37.5012762], [15.0877591, 37.5213762], [15.8877591, 37.9213762], [15, 39]];
        //var points = [[15.0877591, 37.5012762]];
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

            bufferLat = bufferLng = Math.max(bufferLat, bufferLng);
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
                var y = canvas.height - out[1];
                heat.add([x, y, 100]);
            });

            heat.add([0, 0, 100]);
            heat.add([canvas.height, canvas.height, 100]);
            heat.add([0, canvas.height, 100]);
            heat.add([canvas.height, 0, 100]);
        } else {
            var bbox = {
                minLat: points[0][0] - 1,
                minLng: points[0][1] - 1,
                maxLat: points[0][0] + 1,
                maxLng: points[0][1] + 1
            };


            heat.add([10, 10, 100]);
            //heat.radius(10, 20);
        }
        //heat._fixedOpacity = 255;
        heat.draw();
        wwd.navigator.lookAtLocation.latitude = points[0][1];
        wwd.navigator.lookAtLocation.longitude = points[0][0];


        function drawHeatmap(range) {
            /*
            try {
                var v = [];
                var res = wwd.pickTerrain(new WorldWind.Vec3(0, 0, 0)).objects[0].position;
                v.push([res.longitude, res.latitude]);
                res = wwd.pickTerrain(new WorldWind.Vec3(canvas.height, 0, 0)).objects[0].position;
                v.push([res.longitude, res.latitude]);
                res = wwd.pickTerrain(new WorldWind.Vec3(0, canvas.height, 0)).objects[0].position;
                v.push([res.longitude, res.latitude]);
                res = wwd.pickTerrain(new WorldWind.Vec3(canvas.height, canvas.height, 0)).objects[0].position;
                v.push([res.longitude, res.latitude]);
                var maxLng = Math.max.apply(Math, v.map(function (v) {
                    return v[0];
                }));
                var maxLat = Math.max.apply(Math, v.map(function (v) {
                    return v[1];
                }));
                var minLng = Math.min.apply(Math, v.map(function (v) {
                    return v[0];
                }));
                var minLat = Math.min.apply(Math, v.map(function (v) {
                    return v[1];
                }));


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

                surfaceImage2.sector.minLatitude=minLat;
                surfaceImage2.sector.minLongitude=minLng;
                surfaceImage2.sector.maxLatitude=maxLat;
                surfaceImage2.sector.maxLongitude=maxLng;

                var bbox = {
                    minLat: minLat,
                    minLng: minLng,
                    maxLat: maxLat,
                    maxLng: maxLng
                };
                var t = Transformation;
                t.setPoints([[0, canvas.height], [0, 0], [canvas.width, 0], [canvas.width, canvas.height]],
                    [[bbox.minLng, bbox.minLat], [bbox.minLng, bbox.maxLat], [bbox.maxLng, bbox.maxLat], [bbox.maxLng, bbox.minLat]]);
                heat.clear();
                points.forEach(function (p) {
                    var out = t.transform(p);
                    var x = out[0];
                    var y = canvas.height - out[1];
                    heat.add([x, y, 100]);
                });
                heat.resize();
            } catch (e) {
                console.log(e);
            }
*/


            if (range > 4000000) {
                radius = 95;
            } else {
                var addition = 20;
                if (range < bufferLng * 100000) {
                    addition = 10 - ((10000 / range )/ (bufferLng * 10));
                    heat._fixedOpacity = 100 + addition * 10;
                } else {
                    heat._fixedOpacity = null;
                }
                var radius = Math.abs((range / 20000) + addition) / (bufferLng * 5);
            }
            console.log(radius);
            heat.radius(radius, radius / 2)
            heat.draw(0);
            surfaceImage2.imageSourceWasUpdated = true;
            wwd.redraw();
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
            // Normalize the wheel delta based on the wheel delta mode. This produces a roughly consistent delta across
            // browsers and input devices.
            var normalizedDelta;
            if (event.deltaMode == WheelEvent.DOM_DELTA_PIXEL) {
                normalizedDelta = event.deltaY;
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                normalizedDelta = event.deltaY * 40;
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                normalizedDelta = event.deltaY * 400;
            }

            // Compute a zoom scale factor by adding a fraction of the normalized delta to 1. When multiplied by the
            // navigator's range, this has the effect of zooming out or zooming in depending on whether the delta is
            // positive or negative, respectfully.
            var scale = 1 + (normalizedDelta / 1000);

            // Apply the scale to this navigator's properties.
            this.range *= scale;
            this.applyLimits();
            this.worldWindow.redraw();

            drawHeatmap(this.range);
        }
    }
);