/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/ElevationModel'

], function (ElevationModel) {
    "use strict";

    describe("ElevationModelTests", function () {

        describe("ElevationModel Constructor", function () {

            describe("Exceptions", function () {

                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 1,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 1,
                    tileHeight = 1;

                it("Should throw an error on missing coverageSector", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(null, levelZeroDelta, numLevels, retrievalImageFormat,
                            cachePath, tileWidth, tileHeight);
                    }).toThrow();
                });

                it("Should throw an error on missing levelZeroDelta", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, null, numLevels, retrievalImageFormat,
                            cachePath, tileWidth, tileHeight);
                    }).toThrow();
                });


                it("Should throw an error on missing retrievalImageFormat", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, null,
                            cachePath, tileWidth, tileHeight);
                    }).toThrow();
                });

                it("Should throw an error on missing cachePath", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, null, tileWidth, tileHeight);
                    }).toThrow();
                });

                it("Should throw an error on missing numLevels", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, null,
                            retrievalImageFormat, cachePath, tileWidth, tileHeight);
                    }).toThrow();
                });

                it("Should throw an error on missing tileWidth", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, null, tileHeight);
                    }).toThrow();
                });

                it("Should throw an error on missing tileHeight", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, tileWidth, null);
                    }).toThrow();
                });

            });

            it("Should create a ElevationModel and set all the properties", function () {
                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 1,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 1,
                    tileHeight = 1;

                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat, cachePath,
                    tileWidth, tileHeight);

                expect(elevationModel.coverageSector).toEqual(coverageSector);
                expect(elevationModel.retrievalImageFormat).toEqual(retrievalImageFormat);
                expect(elevationModel.cachePath).toEqual(cachePath);
                expect(elevationModel.displayName).toEqual("Elevations");
                expect(elevationModel.minElevation).toEqual(0);
                expect(elevationModel.maxElevation).toEqual(0);
                expect(elevationModel.pixelIsPoint).toBe(true);
                expect(elevationModel.currentTiles).toEqual([]);
                expect(elevationModel.currentRetrievals).toEqual([]);
                expect(elevationModel.id).toEqual(1);
                expect(elevationModel.stateKey).toEqual("elevationModel 1 ");
            });
        });

        describe("Returns the minimum and maximum elevations within a specified sector", function () {

            describe("Exceptions", function () {

                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 1,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 1,
                    tileHeight = 1;

                it("Should throw an error on missing coverageSector", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, tileWidth, tileHeight);
                        elevationModel.minAndMaxElevationsForSector(null);
                    }).toThrow();
                });

            });

            it("Should compute minAndMaxElevationsForSector correctly", function () {
                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 13,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 256,
                    tileHeight = 256;

                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat,
                    cachePath,
                    tileWidth, tileHeight);
                var sector = {};

                sector.deltaLatitude = jasmine.createSpy("deltaLatitude spy");
                spyOn(elevationModel, "assembleTiles");

                elevationModel.minAndMaxElevationsForSector(sector);

                expect(sector.deltaLatitude).toHaveBeenCalled();
                expect(elevationModel.assembleTiles).toHaveBeenCalled();

            });

            it("Should compute minAndMaxElevationsForSector correctly returning 0 on no images", function () {
                var coverageSector = {
                        minLatitude: 36,
                        maxLatitude: 38,
                        minLongitude: 14,
                        maxLongitude: 16
                    },
                    levelZeroDelta = {
                        latitude: 37,
                        longitude: 15
                    },
                    numLevels = 13,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 256,
                    tileHeight = 256;

                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat,
                    cachePath, tileWidth, tileHeight);

                var sector = {
                    minLatitude: 36,
                    maxLatitude: 38,
                    minLongitude: 14,
                    maxLongitude: 16,
                    deltaLatitude: function () {
                        return 2;
                    }
                };
                var result = elevationModel.minAndMaxElevationsForSector(sector);

                expect(result).toEqual([0, 0])
            });

        });

        describe("Returns the elevation at a specified location.", function () {

            it("The location is outside the coverage area of this elevation model.", function () {
                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 13,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 256,
                    tileHeight = 256;

                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat,
                    cachePath, tileWidth, tileHeight);
                var latitude = 37,
                    longitude = 15;

                coverageSector.containsLocation = jasmine.createSpy("containsLocation spy").and.returnValue(false);
                spyOn(elevationModel, "pointElevationForLocation");

                elevationModel.elevationAtLocation(latitude, longitude);

                expect(coverageSector.containsLocation).toHaveBeenCalled();

                //Not called because the location is outside
                expect(elevationModel.pointElevationForLocation).toHaveBeenCalledTimes(0);

            });

            it("Complete the test successfully", function () {
                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 13,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 256,
                    tileHeight = 256;

                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat,
                    cachePath, tileWidth, tileHeight);
                var latitude = 37,
                    longitude = 15;

                coverageSector.containsLocation = jasmine.createSpy("containsLocation spy").and.returnValue(true);
                spyOn(elevationModel, "pointElevationForLocation");

                elevationModel.elevationAtLocation(latitude, longitude);

                expect(coverageSector.containsLocation).toHaveBeenCalled();
                expect(elevationModel.pointElevationForLocation).toHaveBeenCalledTimes(1);

            });
        });

        describe("Returns the elevations at locations within a specified sector", function () {

            describe("Exceptions", function () {

                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 1,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 1,
                    tileHeight = 1;

                var sector = {},
                    numLat = 1,
                    numLon = 1,
                    targetResolution = 1,
                    result = [];

                it("Should throw an error on missing sector", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, tileWidth, tileHeight);

                        elevationModel.elevationsForGrid(null, numLat, numLon, targetResolution, result);
                    }).toThrow();
                });

                it("Should throw an error on missing result", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, tileWidth, tileHeight);

                        elevationModel.elevationsForGrid(sector, numLat, numLon, targetResolution, null);
                    }).toThrow();
                });

                it("Should throw an error on missing numLat", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, tileWidth, tileHeight);

                        elevationModel.elevationsForGrid(sector, null, numLon, targetResolution, result);
                    }).toThrow();
                });

                it("Should throw an error on numLon < 1", function () {
                    expect(function () {
                        var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels,
                            retrievalImageFormat, cachePath, tileWidth, tileHeight);

                        elevationModel.elevationsForGrid(sector, numLat, 0, targetResolution, result);
                    }).toThrow();
                });


            });

            it("Should compute elevationsForGrid correctly on point data", function () {
                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 13,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 256,
                    tileHeight = 256;

                var sector = {},
                    numLat = 1,
                    numLon = 1,
                    targetResolution = 1,
                    result = [];


                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat,
                    cachePath,
                    tileWidth, tileHeight);
                var sector = {};

                elevationModel.levels.levelForTexelSize = jasmine.createSpy("levelForTexelSize spy");
                spyOn(elevationModel, "pointElevationsForGrid");

                elevationModel.elevationsForGrid(sector, numLat, numLon, targetResolution, result);

                expect(elevationModel.levels.levelForTexelSize).toHaveBeenCalled();
                expect(elevationModel.pointElevationsForGrid).toHaveBeenCalled();

            });

            it("Should compute elevationsForGrid correctly on area data", function () {
                var coverageSector = {},
                    levelZeroDelta = {},
                    numLevels = 13,
                    retrievalImageFormat = "string",
                    cachePath = "path",
                    tileWidth = 256,
                    tileHeight = 256;

                var sector = {},
                    numLat = 1,
                    numLon = 1,
                    targetResolution = 1,
                    result = [];


                var elevationModel = new ElevationModel(coverageSector, levelZeroDelta, numLevels, retrievalImageFormat,
                    cachePath,
                    tileWidth, tileHeight);
                var sector = {};

                elevationModel.pixelIsPoint = false;
                elevationModel.levels.levelForTexelSize = jasmine.createSpy("levelForTexelSize spy");
                spyOn(elevationModel, "areaElevationsForGrid");

                elevationModel.elevationsForGrid(sector, numLat, numLon, targetResolution, result);

                expect(elevationModel.levels.levelForTexelSize).toHaveBeenCalled();
                expect(elevationModel.areaElevationsForGrid).toHaveBeenCalled();

            });
        });
    });
});