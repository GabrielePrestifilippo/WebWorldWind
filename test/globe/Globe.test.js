/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/Globe',
    'src/geom/Location',
    'src/geom/Plane',
    'src/projections/ProjectionWgs84',
    'src/globe/Tessellator',
    'src/geom/Vec3',


], function (Globe, Location, Plane, ProjectionWgs84, Tessellator, Vec3) {
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
                var projection = null;
                var globe = new Globe({}, projection);
                var newProjection = new ProjectionWgs84();
                expect(globe._projection).toEqual(newProjection);

            });

            it("Should throw an error on missing elevationModel", function () {
                expect(function () {
                    var elevationModel = null;
                    var globe = new Globe(elevationModel, {});
                }).toThrow();
            });
        });

        describe("Globe Properties definition", function () {
            var globe = new Globe({}, {});

            it("Returns the state key", function () {
                expect(globe.stateKey).toEqual(globe._stateKey + globe.elevationModel.stateKey + "offset " +
                    globe.offset.toString() + " " + globe.projection.stateKey);
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
                        altitude = 1e5,
                        result = null;

                    var globe = new Globe({}, {});
                    globe.computePointFromPosition(latitude, longitude, altitude, result);
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
                        longitude = 15,
                        result = null;

                    var globe = new Globe({}, {});
                    globe.computePointFromLocation(latitude, longitude, result);
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
                numLat = 2,
                numLon = 2,
                elevations = 5,
                referencePoint = new Vec3(0, 0, 0),
                result = new Float32Array(9);


            describe("Exceptions", function () {

                it("Should throw an error on missing sector", function () {
                    expect(function () {
                        var globe = new Globe({}, {});

                        globe.computePointsForGrid(mull, numLat, numLon, elevations, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on numLat less than 1", function () {
                    expect(function () {
                        var globe = new Globe({}, {});

                        globe.computePointsForGrid(sector, 0, numLon, elevations, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on numLon less than 1", function () {
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

                it("Should throw an error on elevations length less than points", function () {
                    expect(function () {
                        var globe = new Globe({}, {});

                        globe.computePointsForGrid(sector, numLat, numLon, 100, referencePoint, result);
                    }).toThrow();
                });

                it("Should throw an error on result length less than points", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        var smallResult = new Float32Array(4);

                        globe.computePointsForGrid(sector, numLat, numLon, elevations, referencePoint, smallResult);
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

        describe("Computes a geographic position from a specified Cartesian point", function () {

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var globe = new Globe({}, {});
                    var x = 37,
                        y = 15,
                        z = 1e6,
                        result = null;

                    globe.computePositionFromPoint(x, y, z, result);
                }).toThrow();
            });

            it("Should request all the dependencies", function () {
                var projection = {};
                var x = 37,
                    y = 15,
                    z = 1e6,
                    result = {};

                projection.cartesianToGeographic = jasmine.createSpy("cartesianToGeographic spy");
                var globe = new Globe({}, projection);

                globe.computePositionFromPoint(x, y, z, result);
                expect(projection.cartesianToGeographic).toHaveBeenCalledWith(globe, x, y, z,
                    globe.offsetVector, result);
            });

            it("Computes the position warpping the globe", function () {
                var projection = {continuous: true};
                var x = 37,
                    y = 15,
                    z = 1e6,
                    result = {longitude: 200};

                projection.cartesianToGeographic = jasmine.createSpy("cartesianToGeographic spy");

                var globe = new Globe({}, projection);

                var computedPosition = globe.computePositionFromPoint(x, y, z, result);
                expect(computedPosition).toEqual({longitude: -160});
            });
        });

        describe("Computes the radius of this globe at a specified location", function () {

            it("Computes the radius at the equator", function () {
                var latitude = 0,
                    longitude = 0;
                var globe = new Globe({}, {});

                var radius = globe.radiusAt(latitude, longitude);
                expect(radius).toEqual(6378137);
            });


            it("Computes the radius at the North Pole", function () {
                var latitude = 90,
                    longitude = 0;
                var globe = new Globe({}, {});

                var radius = globe.radiusAt(latitude, longitude);
                expect(radius).toBeCloseTo(6356752.31, 2);
            });

            it("Computes the radius at the South Pole", function () {
                var latitude = -90,
                    longitude = 0;
                var globe = new Globe({}, {});

                var radius = globe.radiusAt(latitude, longitude);
                expect(radius).toBeCloseTo(6356752.31, 2);
            });

            it("Computes the radius at the Greenwhich", function () {
                var latitude = 51.47,
                    longitude = 0;
                var globe = new Globe({}, {});

                var radius = globe.radiusAt(latitude, longitude);
                expect(radius).toBeCloseTo(6365092.99, 2);
            });

        });

        describe("Computes the normal vector to this at a specified location", function () {

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var latitude = 0,
                        longitude = 0;

                    var globe = new Globe({}, {});
                    globe.surfaceNormalAtLocation(latitude, longitude, null);
                }).toThrow();
            });

            it("Computes the normal at 0,0", function () {
                var latitude = 0,
                    longitude = 0,
                    result = new Vec3(0, 0, 0);
                var globe = new Globe({}, {});

                var normal = globe.surfaceNormalAtLocation(latitude, longitude, result);
                var expected = new Vec3(0, 0, 1);
                expect(normal).toEqual(expected);
            });

            it("Computes the normal at the North Pole", function () {
                var latitude = 90,
                    longitude = 0,
                    result = new Vec3(0, 0, 0);
                var globe = new Globe({}, {});

                var normal = globe.surfaceNormalAtLocation(latitude, longitude, result);
                var expected = new Vec3(0, 1, 0);

                expect(normal[0]).toBeCloseTo(expected[0]);
                expect(normal[1]).toBeCloseTo(expected[1]);
                expect(normal[2]).toBeCloseTo(expected[2]);
            });

            it("Computes the normal at the South Pole", function () {
                var latitude = -90,
                    longitude = 0,
                    result = new Vec3(0, 0, 0);
                var globe = new Globe({}, {});

                var normal = globe.surfaceNormalAtLocation(latitude, longitude, result);
                var expected = new Vec3(0, -1, 0);

                expect(normal[0]).toBeCloseTo(expected[0]);
                expect(normal[1]).toBeCloseTo(expected[1]);
                expect(normal[2]).toBeCloseTo(expected[2]);
            });

            it("Computes the normal at 45,45", function () {
                var latitude = 45,
                    longitude = 45,
                    result = new Vec3(0, 0, 0);
                var globe = new Globe({}, {});

                var normal = globe.surfaceNormalAtLocation(latitude, longitude, result);
                var expected = new Vec3(0.5, 0.707, 0.5);

                expect(normal[0]).toBeCloseTo(expected[0]);
                expect(normal[1]).toBeCloseTo(expected[1]);
                expect(normal[2]).toBeCloseTo(expected[2]);
            });

        });

        describe("Computes the normal vector at a specified Cartesian point", function () {

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var x = 0,
                        y = 0,
                        x = 0;

                    var globe = new Globe({}, {});
                    globe.surfaceNormalAtPoint(x, y, z, null);
                }).toThrow();
            });

            it("Check whether the projection defines a surfaceNormalAtPoint function", function () {
                var x = 0,
                    y = 0,
                    z = 0,
                    result = new Vec3(0, 0, 0);
                var projection = {};

                projection.surfaceNormalAtPoint = jasmine.createSpy("surfaceNormalAtPoint spy");
                var globe = new Globe({}, projection);

                globe.surfaceNormalAtPoint(x, y, z, result);
                expect(projection.surfaceNormalAtPoint).toHaveBeenCalledWith(globe, x, y, z, result);
            });

            it("Computes the normal with a 2D projection", function () {
                var x = 0,
                    y = 0,
                    z = 0,
                    result = new Vec3(0, 0, 0);

                var projection = {is2D: true};
                var globe = new Globe({}, projection);

                var normal = globe.surfaceNormalAtPoint(x, y, z, result);
                var expected = new Vec3(0, 0, 1);
                expect(normal).toEqual(expected);
            });

            it("Computes the normal", function () {
                var x = 1000,
                    y = 1000,
                    z = 1000,
                    result = new Vec3(0, 0, 0);

                var globe = new Globe({}, {});

                var normal = globe.surfaceNormalAtPoint(x, y, z, result);
                var expected = new Vec3(0.576, 0.579, 0.576);
                expect(normal[0]).toBeCloseTo(expected[0]);
                expect(normal[1]).toBeCloseTo(expected[1]);
                expect(normal[2]).toBeCloseTo(expected[2]);
            });

        });

        describe("Computes the north-pointing tangent vector at a specified location", function () {

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var latitude = 0,
                        longitude = 0;

                    var globe = new Globe({}, {});
                    globe.northTangentAtLocation(latitude, longitude, null);
                }).toThrow();
            });

            it("Check if northTangentAtLocation is being called", function () {
                var latitude = 0,
                    longitude = 0,
                    result = new Vec3(0, 0, 0);
                var projection = {};

                projection.northTangentAtLocation = jasmine.createSpy("northTangentAtLocation spy");
                var globe = new Globe({}, projection);

                globe.northTangentAtLocation(latitude, longitude, result);
                expect(projection.northTangentAtLocation).toHaveBeenCalledWith(globe, latitude, longitude, result);
            });


        });

        describe("Computes the north-pointing tangent vector at a specified Cartesian point", function () {

            it("Should throw an error on missing result", function () {
                expect(function () {
                    var x = 0,
                        y = 0;

                    var globe = new Globe({}, {});
                    globe.northTangentAtPoint(x, y, null);
                }).toThrow();
            });

            it("Check if northTangentAtPoint is being called", function () {
                var x = 0,
                    y = 0,
                    z = 0,
                    result = new Vec3(0, 0, 0);
                var projection = {};

                projection.northTangentAtPoint = jasmine.createSpy("northTangentAtPoint spy");
                var globe = new Globe({}, projection);

                globe.northTangentAtPoint(x, y, z, result);
                expect(projection.northTangentAtPoint).toHaveBeenCalledWith(globe, x, y, z, globe.offsetVector, result);
            });


        });

        describe("Indicates whether this globe intersects a specified frustum", function () {

            it("Should throw an error on missing frustum", function () {
                expect(function () {
                    var globe = new Globe({}, {});
                    globe.intersectsFrustum(null);
                }).toThrow();
            });

            it("Globe intersects the frustum on a 3D globe", function () {
                var frustumDistance = {distance: 1e10};
                var frustum = {
                    near: frustumDistance, far: frustumDistance, top: frustumDistance,
                    left: frustumDistance, right: frustumDistance, bottom: frustumDistance
                };

                var globe = new Globe({}, {});

                var result = globe.intersectsFrustum(frustum);
                expect(result).toBe(true);
            });

            it("Globe does not intersect the frustum on a 3D globe", function () {
                var frustumDistance = {distance: 1e6};
                var frustum = {
                    near: frustumDistance, far: frustumDistance, top: frustumDistance,
                    left: frustumDistance, right: frustumDistance, bottom: frustumDistance
                };

                var globe = new Globe({}, {});

                var result = globe.intersectsFrustum(frustum);
                expect(result).toBe(false);
            });
        });

        describe("Computes the first intersection of this globe with a specified line", function () {

            describe("Exceptions", function () {
                it("Should throw an error on missing line", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        var result = new Vec3(0, 0, 0);
                        globe.intersectsLine(null, result);
                    }).toThrow();
                });

                it("Should throw an error on missing result", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        var line = {};
                        globe.intersectsLine(line, null);
                    }).toThrow();
                });

            });

            it("Line (ray) is parallel to and not coincident with the XY plane", function () {
                var globe = new Globe({}, {is2D: true});
                var result = new Vec3(0, 0, 0);
                var line = {
                    direction: new Vec3(0, 0, 0),
                    origin: new Vec3(0, 0, 1)
                };
                var intersection = globe.intersectsLine(line, result);
                expect(intersection).toBe(false);
            });

            it("Intersection is behind the ray's origin", function () {
                var globe = new Globe({}, {is2D: true});
                var result = new Vec3(0, 0, 0);
                var line = {
                    direction: new Vec3(0, 0, 1),
                    origin: new Vec3(0, 0, 1)
                };
                var intersection = globe.intersectsLine(line, result);
                expect(intersection).toBe(false);
            });

            it("Computes the intersection correctly on a 2D globe", function () {
                var globe = new Globe({}, {is2D: true});
                var result = new Vec3(0, 0, 0);
                var line = {
                    direction: new Vec3(2, 3, 1),
                    origin: new Vec3(2, 3, -1)
                };
                var intersection = globe.intersectsLine(line, result);
                expect(intersection).toBe(true);
                expect(result[0]).toBeCloseTo(4);
                expect(result[1]).toBeCloseTo(6);
                expect(result[2]).toBeCloseTo(0);
            });

            it("Computes the intersection correctly on a 3D globe", function () {
                var globe = new Globe({}, {});
                var result = new Vec3(0, 0, 0);
                var line = {
                    direction: new Vec3(2, 3, 1),
                    origin: new Vec3(2, 3, -1)
                };
                var intersection = globe.intersectsLine(line, result);
                expect(intersection).toBe(true);
                expect(result[0]).toBeCloseTo(3401896.46);
                expect(result[1]).toBeCloseTo(5102844.69);
                expect(result[2]).toBeCloseTo(1700946.23);
            });

            it("No intersection on the 3D globe", function () {
                var globe = new Globe({}, {});
                var result = new Vec3(0, 0, 0);
                var line = {
                    direction: new Vec3(2, 3, 1),
                    origin: new Vec3(-1e10, 3, -1)
                };
                var intersection = globe.intersectsLine(line, result);
                expect(intersection).toBe(false);
            });
        });

        it("Returns the timestamp of the elevation model", function () {
            var elevationModel = {timestamp: Date.now()};
            var globe = new Globe(elevationModel, {});
            var result = globe.elevationTimestamp();

            expect(result).toBe(elevationModel.timestamp);
        });

        it("Returns the minElevation of the elevation model", function () {
            var elevationModel = {minElevation: 1};
            var globe = new Globe(elevationModel, {});
            var result = globe.minElevation();

            expect(result).toBe(elevationModel.minElevation);
        });

        it("Returns the maxElevation of the elevation model", function () {
            var elevationModel = {maxElevation: 1};
            var globe = new Globe(elevationModel, {});
            var result = globe.maxElevation();

            expect(result).toBe(elevationModel.maxElevation);
        });

        describe("Returns the minimum and maximum elevations within a specified sector of this globe", function () {

            it("Should throw an error on missing sector", function () {
                expect(function () {
                    var globe = new Globe({}, {});
                    globe.minAndMaxElevationsForSector(null);
                }).toThrow();
            });

            it("Should call the minAndMaxElevationsForSector method of the elevation", function () {
                var sector = {};
                var elevationModel = {};
                elevationModel.minAndMaxElevationsForSector = jasmine.createSpy("minAndMaxElevationsForSector spy");

                var globe = new Globe(elevationModel, {});
                globe.minAndMaxElevationsForSector(sector);
                expect(elevationModel.minAndMaxElevationsForSector).toHaveBeenCalledWith(sector);
            });
        });

        it("Should call elevationAtLocation method from the elevation model", function () {
            var latitude = 37,
                longitude = 15;
            var elevationModel = {};
            elevationModel.elevationAtLocation = jasmine.createSpy("elevationAtLocation spy");

            var globe = new Globe(elevationModel, {});
            globe.elevationAtLocation(latitude, longitude);
            expect(elevationModel.elevationAtLocation).toHaveBeenCalledWith(latitude, longitude);
        });

        describe("Returns the elevations at locations within a specified sector", function () {

            describe("Exceptions", function () {
                var sector = {},
                    numLat = 2,
                    numLon = 2,
                    targetResolution = 5,
                    result = new Float32Array(9);

                it("Should throw an exception on missing sector", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.elevationsForGrid(null, numLat, numLon, targetResolution, result);
                    }).toThrow();
                });

                it("Should throw an exception on numLat less or equal to 0", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.elevationsForGrid(sector, 0, numLon, targetResolution, result);
                    }).toThrow();
                });

                it("Should throw an exception on numLon less or equal to 0", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.elevationsForGrid(sector, numLat, 0, targetResolution, result);
                    }).toThrow();
                });

                it("Should throw an exception on missing result", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.elevationsForGrid(sector, numLat, numLon, targetResolution, null);
                    }).toThrow();
                });

                it("Should throw an exception on result length less than numLat*numLon", function () {
                    expect(function () {
                        var globe = new Globe({}, {});
                        globe.elevationsForGrid(sector, numLat, numLon, targetResolution, []);
                    }).toThrow();
                });
            });

            it("Should call the elevationsForGrid method of the elevation model", function () {
                var sector = {},
                    numLat = 2,
                    numLon = 2,
                    targetResolution = 5,
                    result = new Float32Array(9);
                var elevationModel = {};
                elevationModel.elevationsForGrid = jasmine.createSpy("elevationsForGrid spy");

                var globe = new Globe(elevationModel, {});
                globe.elevationsForGrid(sector, numLat, numLon, targetResolution, result);
                expect(elevationModel.elevationsForGrid).toHaveBeenCalledWith(sector, numLat, numLon,
                    targetResolution, result);
            });
        });

    });
});
