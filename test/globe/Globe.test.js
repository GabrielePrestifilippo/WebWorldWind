/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/Globe',
    'src/geom/Location',
    'src/projections/ProjectionWgs84',
    'src/globe/Tessellator',
    'src/geom/Vec3'

], function (Globe, Location, ProjectionWgs84, Tessellator, Vec3) {
    "use strict";

    describe("GlobeTest", function () {

        describe("Globe constructor", function () {
            it("Should create a globe and set all the properties", function () {
                var elevationModel = "elevationMock";
                var projection = "projectionMock";
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

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var latitude = 37,
                        longitude = 15,
                        altitude = 1e5;

                    var globe = new Globe({}, {});
                    globe.computePointFromPosition(latitude, longitude, altitude, null);
                }).toThrow();
            });

            it("Computes a Cartesian point successfully from a Position", function () {
                var latitude = 37,
                    longitude = 15,
                    altitude = 1e5,
                    result = true;

                var projection = {};

                projection.geographicToCartesian = jasmine.createSpy("geographicToCartesian spy");
                var globe = new Globe({}, projection);

                globe.computePointFromPosition(latitude, longitude, altitude, result);

                expect(projection.geographicToCartesian).toHaveBeenCalledWith(globe, latitude, longitude, altitude,
                    globe.offsetVector, result);
            });
        });

        describe("Computes a Cartesian point from a specified location", function () {

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var latitude = 37,
                        longitude = 15;

                    var globe = new Globe({}, {});
                    globe.computePointFromLocation(latitude, longitude, null);
                }).toThrow();
            });

            it("Computes a Cartesian point successfully from a location", function () {
                var latitude = 37,
                    longitude = 15,
                    result = true;

                var globe = new Globe({}, {});

                spyOn(globe, "computePointFromPosition");

                globe.computePointFromLocation(latitude, longitude, result);
                expect(globe.computePointFromPosition).toHaveBeenCalledWith(latitude, longitude, 0, result);
            });
        });

        describe("Computes a grid of Cartesian points", function () {
            var sector = {},
                numLat = 1,
                numLon = 1, elevations = [1],
                referencePoint,
                result = [1];

            describe("Exceptions on wrong inputs", function () {

                it("Should throw an error on missing result", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(null, numLat, numLon, elevations, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on null numlat", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(sector, 0, numLon, elevations, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on null numlon", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(sector, numLat, 0, elevations, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on null elevations", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(sector, numLat, numLon, null, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on elevations less than the number of points", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(sector, numLat, numLon, [], referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on null result", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(sector, numLat, numLon, elevations, referencePoint, null);
                    }).toThrow();
                });

                it("Should throw an error on results less than the number of points", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.computePointsForGrid(sector, numLat, numLon, elevations, referencePoint, []);
                    }).toThrow();
                });
            });

            it("Computes the grid of Cartesian points correctly", function () {
                var projection = {};
                projection.geographicToCartesianGrid = jasmine.createSpy("geographicToCartesianGrid spy");
                var globe = new Globe({}, projection);
                globe.computePointsForGrid(sector, numLat, numLon, elevations, referencePoint, result);
                expect(projection.geographicToCartesianGrid).toHaveBeenCalledWith(globe, sector, numLat, numLon,
                    elevations, referencePoint, globe.offsetVector, result);
            });
        });

    });//globe test
});//require def
