/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/Globe',
    'src/globe/ElevationModel',
    'src/geom/Location',
    'src/projections/ProjectionWgs84',
    'src/geom/Sector',
    'src/globe/Tessellator',
    'src/geom/Vec3'

], function (Globe, ElevationModel, Location, ProjectionWgs84, Sector, Tessellator, Vec3) {
    "use strict";

    describe("GlobeTest", function () {
        /*
         var coverageSector = new Sector(-90, 90, -180, 180),
         levelZeroDelta = new Location(45, 45),
         numLevels = 12,
         retrievalImageFormat = "application/bil16",
         cachePath = "EarthElevations256",
         tileHeight = 256,
         tileWidth = 256;


         var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat, cachePath,
         tileWidth, tileHeight);

         var projection = new ProjectionWgs84();
         */
        describe("Globe constructor", function () {

            it("Should create a globe and set all the properties", function () {
                var elevationModel = {};
                var projection = {};
                var globe = new Globe(elevationModel, projection);
                expect(globe.elevationModel).toEqual(elevationModel);
                expect(globe.equatorialRadius).toEqual(6378137.0);
                expect(globe.polarRadius).toEqual(6356752.3);
                expect(globe.eccentricitySquared).toEqual(0.00669437999013);
                expect(globe.tessellator).toEqual(new Tessellator());
                expect(globe._projection).toEqual(projection);
                expect(globe._offset).toEqual(0);
                expect(globe.offsetVector).toEqual(new Vec3(0, 0, 0));
                expect(globe.id).toEqual(Globe.idPool);
                expect(globe._stateKey).toEqual("globe " + globe.id.toString() + " ");
            });


            it("Should create a WGS84 projection if none provided", function () {
                var globe = new Globe({}, null);
                var projection = new ProjectionWgs84();
                expect(globe._projection).toEqual(projection);

            });

            it("Should throw an error on missing elevationModel", function () {
                expect(function () {
                    var globe = new Globe(null, {});
                }).toThrow();
            });
        });

        describe("Globe Properties definition", function () {
            var globe = new Globe({}, {});

            it("Returns the state key", function () {
                expect(globe.stateKey).toEqual(globe._stateKey + globe.elevationModel.stateKey + "offset " + globe.offset.toString() + " "
                    + globe.projection.stateKey);
            });

            it("Indicates if the globe is continous", function () {
                expect(globe.continuous).toEqual(globe.projection.continuous);
            });

            it("Get the projection used by the globe", function () {
                var projection = "mockProjection";
                globe.projection = projection;
                expect(globe.projection).toEqual(globe._projection);
                expect(globe.projection).toEqual(projection);
            });

            it("Get the projection limits of the associated projection", function () {
                expect(globe.projectionLimits).toEqual(globe._projection.projectionLimits);
            });

            it("Get the offset applied to this globe", function () {
                globe.offset = 3;
                expect(globe._offset).toEqual(3);
                expect(globe.offset).toEqual(3);
                expect(globe.offsetVector[0]).toEqual(120225050.05673546);
            });

        });

        describe("Check if the globe is 2D", function () {

            it("Returns a 2D globe", function () {
                var projection = {is2D: true};
                var globe = new Globe({}, projection);
                var is2D = globe.is2D();
                expect(is2D).toEqual(true);
            });

            it("Returns a 2D globe", function () {
                var projection = {is2D: false};
                var globe = new Globe({}, projection);
                var is2D = globe.is2D();
                expect(is2D).toEqual(false);
            });

        });

        describe("Computes a Cartesian point from a specified position", function () {

            it("Computes a Cartesian point successfully", function () {
                var projection = {
                    geographicToCartesian: function () {
                        return true;
                    }
                };
                var latitude,
                    longitude,
                    altitude,
                    result=true;

                var globe = new Globe({}, projection);

                var cartesianPoint = globe.computePointFromPosition(latitude, longitude, altitude, result);
                expect(cartesianPoint).toEqual(true);
            });

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var projection = {
                        geographicToCartesian: function () {
                            return true;
                        }
                    };
                    var latitude,
                        longitude,
                        altitude;

                    var globe = new Globe({}, projection);

                    var cartesianPoint = globe.computePointFromPosition(latitude, longitude, altitude, null);
                }).toThrow();
            });
        });

        describe("Computes a Cartesian point from a specified location", function () {

            it("Computes a Cartesian point successfully", function () {
                var projection = {
                    geographicToCartesian: function () {
                        return true;
                    }
                };
                var latitude,
                    longitude,
                    altitude,
                    result=true;

                var globe = new Globe({}, projection);

                var cartesianPoint = globe.computePointFromLocation(latitude, longitude, result);
                expect(cartesianPoint).toEqual(true);
            });

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var latitude,
                        longitude,
                        altitude;

                    var globe = new Globe({}, {});

                    var cartesianPoint = globe.computePointFromLocation(latitude, longitude, null);
                }).toThrow();
            });
        });

        describe("Computes a grid of Cartesian points", function () {
            var sector={},
                numLat=2,
                numLon=2,
                elevations=5,
                referencePoint=new Vec3(0,0,0),
                result= new Float32Array(9);

            it("Computes a Cartesian point successfully", function () {
                var projection = {
                    geographicToCartesianGrid: function () {
                        return true;
                    }
                };
                var globe = new Globe({}, projection);

                var cartesianPoint = globe.computePointsForGrid(sector, numLat, numLon, elevations, referencePoint, result);
                expect(cartesianPoint).toEqual(true);
            });

            it("Should throw an error on missing sector", function () {
                expect(function () {
                    var globe = new Globe({}, {});

                    var cartesianPoint = globe.computePointsForGrid(null, numLat, numLon, elevations, referencePoint, result);
                }).toThrow();
            });

            it("Should throw an error on numLat less than 1", function () {
                expect(function () {
                    var globe = new Globe({}, {});

                    var cartesianPoint = globe.computePointsForGrid(sector, 0, numLon, elevations, referencePoint, result);
                }).toThrow();
            });

            it("Should throw an error on numLon less than 1", function () {
                expect(function () {
                    var globe = new Globe({}, {});

                    var cartesianPoint = globe.computePointsForGrid(sector, numLat, 0, elevations, referencePoint, result);
                }).toThrow();
            });

            it("Should throw an error on null elevations", function () {
                expect(function () {
                    var globe = new Globe({}, {});

                    var cartesianPoint = globe.computePointsForGrid(sector, numLat, numLon, 0, referencePoint, result);
                }).toThrow();
            });

            it("Should throw an error on elevations length less than points", function () {
                expect(function () {
                    var globe = new Globe({}, {});

                    var cartesianPoint = globe.computePointsForGrid(sector, numLat, numLon, 100, referencePoint, result);
                }).toThrow();
            });

            it("Should throw an error on result length less than points", function () {
                expect(function () {
                    var globe = new Globe({}, {});
                    var smallResult=new Float32Array(4);

                    var cartesianPoint = globe.computePointsForGrid(sector, numLat, numLon, elevations, referencePoint, smallResult);
                }).toThrow();
            });


        });

    });//globe test
});//require def
