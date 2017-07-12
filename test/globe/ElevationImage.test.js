/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/ElevationImage',

], function (ElevationImage) {
    "use strict";

    describe("ElevationImageTests", function () {

        describe("ElevationImage Constructor", function () {

            describe("Exceptions", function () {

                var imagePath = "pathToImage",
                    sector = "sector",
                    imageWidth = 512,
                    imageHeight = 512;

                it("Should throw an error on missing imagePath", function () {
                    expect(function () {
                        var elevationImage = new ElevationImage(null, sector, imageWidth, imageHeight);
                    }).toThrow();
                });

                it("Should throw an error on missing sector", function () {
                    expect(function () {
                        var elevationImage = new ElevationImage(imagePath, null, imageWidth, imageHeight);
                    }).toThrow();
                });
            });

            it("Should create a ElevationImage and set all the properties", function () {
                var imagePath = "pathToImage",
                    sector = "sector",
                    imageWidth = 512,
                    imageHeight = 512;

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);
                expect(elevationImage.imagePath).toEqual(imagePath);
                expect(elevationImage.sector).toEqual(sector);
                expect(elevationImage.imageWidth).toEqual(imageWidth);
                expect(elevationImage.imageHeight).toEqual(imageHeight);
                expect(elevationImage.size).toEqual(imageWidth * imageWidth);
            });
        });

        describe("Returns the pixel value at a specified coordinate in this elevation image", function () {

            it("The x coordinate indicates a pixel outside of this elevation image", function () {
                var imagePath = "pathToImage",
                    sector = "sector",
                    imageWidth = 512,
                    imageHeight = 512;

                var x = -1,
                    y = 100;

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);
                var pixel = elevationImage.pixel(x, y);
                expect(pixel).toEqual(0);
            });

            it("The y coordinate indicates a pixel outside of this elevation image", function () {
                var imagePath = "pathToImage",
                    sector = "sector",
                    imageWidth = 512,
                    imageHeight = 512;

                var x = 100,
                    y = 600;

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);
                var pixel = elevationImage.pixel(x, y);
                expect(pixel).toEqual(0);
            });

            it("Returns the pixel correctly", function () {
                var imagePath = "pathToImage",
                    sector = "sector",
                    imageWidth = 512,
                    imageHeight = 512;

                var x = 128,
                    y = 128;

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);
                elevationImage.imageData = new Int16Array(imageWidth * imageHeight);
                var pixel = elevationImage.pixel(x, y);
                expect(pixel).toEqual(0);
            });
        });

        it("Returns the elevation at a specified geographic location", function () {
            var imagePath = "pathToImage",
                mockSector = {
                    maxLatitude: 38, minLongitude: 14,
                    deltaLatitude: function () {
                        return 2
                    },
                    deltaLongitude: function () {
                        return 2
                    }
                },
                imageWidth = 4,
                imageHeight = 4;

            var latitude = 37,
                longitude = 15;

            var elevationImage = new ElevationImage(imagePath, mockSector, imageWidth, imageHeight);
            var mockImageData = new Int16Array(16);
            for (var i = 1; i <= 16; i++) {
                mockImageData[i] = i;
            }
            elevationImage.imageData = mockImageData;

            var elevation = elevationImage.elevationAtLocation(latitude, longitude);
            expect(elevation).toEqual(7.5);
        });

        describe("Returns elevations for a specified sector", function () {

            describe("Exceptions", function () {

                var imagePath = "pathToImage",
                    sector = "sector",
                    imageWidth = 512,
                    imageHeight = 512;
                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);

                var sector = {},
                    numLat = 2,
                    numLon = 2,
                    result = [];

                it("Should throw an error on missing sector", function () {
                    expect(function () {
                        elevationImage.elevationsForGrid(null, numLat, numLon, result);
                    }).toThrow();
                });

                it("Should throw an error on number of sample points less than 1", function () {
                    expect(function () {
                        elevationImage.elevationsForGrid(sector, 0, 0, result);
                    }).toThrow();
                });

                it("Should throw an error on missing result", function () {
                    expect(function () {
                        elevationImage.elevationsForGrid(sector, numLat, numLon, null);
                    }).toThrow();
                });

            });

            it("Returns the elevation", function () {
                var imagePath = "pathToImage",
                    sector = {
                        minLatitude: 36,
                        maxLatitude: 38,
                        minLongitude: 14,
                        maxLongitude: 16
                    },
                    imageWidth = 4,
                    imageHeight = 4;

                var numLat = 2,
                    numLon = 2,
                    result = [];

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);
                var mockImageData = new Int16Array(16);
                for (var i = 1; i <= 16; i++) {
                    mockImageData[i] = i;
                }
                elevationImage.imageData = mockImageData;

                elevationImage.elevationsForGrid(sector, numLat, numLon, result);
                expect(result).toEqual([12, 15, 0, 3]);
            });
        });

        it("Returns the minimum and maximum elevations within a specified sector", function () {
            var imagePath = "pathToImage",
                sector = {},
                imageWidth = 4,
                imageHeight = 4;

            var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);

            elevationImage.minElevation = -1000;
            elevationImage.maxElevation = 1e6;

            var result = elevationImage.minAndMaxElevationsForSector();
            expect(result).toEqual([-1000, 1000000]);
        });

        describe("Determines the minimum and maximum elevations within this elevation image", function () {

            it("Returns 0 on no image provided", function () {
                var imagePath = "pathToImage",
                    sector = {},
                    imageWidth = 4,
                    imageHeight = 4;

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);

                elevationImage.findMinAndMaxElevation();
                expect(elevationImage.minElevation).toEqual(0);
                expect(elevationImage.maxElevation).toEqual(0);
            });

            it("Determines the elevation correctly", function () {
                var imagePath = "pathToImage",
                    sector = {},
                    imageWidth = 4,
                    imageHeight = 4;

                var elevationImage = new ElevationImage(imagePath, sector, imageWidth, imageHeight);
                var mockImageData = new Int16Array(16);
                for (var i = 1; i <= 16; i++) {
                    mockImageData[i] = i;
                }
                elevationImage.imageData = mockImageData;

                elevationImage.findMinAndMaxElevation();
                expect(elevationImage.minElevation).toEqual(0);
                expect(elevationImage.maxElevation).toEqual(15);
            });
        });
    });
});