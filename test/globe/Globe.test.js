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

        describe("Globe constructor", function () {

            it("Should create a globe and set all the properties", function () {
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
                var globe = new Globe(elevationModel, null);
                expect(globe._projection).toEqual(projection);

            });

            it("Should throw an error on missing elevationModel", function () {
                expect(function () {
                    var globe = new Globe(null, projection);
                }).toThrow();
            });
        });

        describe("Globe Properties definition", function () {
            var globe = new Globe(elevationModel, projection);

            describe("Globe Properties definition", function () {

                it("Returns the state key", function () {
                    expect(globe.stateKey).toEqual(globe._stateKey + globe.elevationModel.stateKey + "offset " + globe.offset.toString() + " "
                        + globe.projection.stateKey);
                });

                it("Indicates if the globe is continous", function () {
                    expect(globe.continuous).toEqual(globe.projection.continuous);
                });

            });
        });


    });//globe test
});//require def
