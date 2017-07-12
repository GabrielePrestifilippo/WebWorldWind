/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/EarthElevationModel',

], function (EarthElevationModel) {
    "use strict";

    describe("EarthElevationModelTests", function () {


        it("Should create a EarthElevationModel and set all the properties", function () {
            var earthElevationModel = new EarthElevationModel();

            expect(earthElevationModel.displayName).toEqual("Earth Elevation Model");
            expect(earthElevationModel.minElevation).toEqual(-11000);
            expect(earthElevationModel.maxElevation).toEqual(8850);
            expect(earthElevationModel.pixelIsPoint).toBe(false);
            expect(earthElevationModel.urlBuilder).toBeTruthy();
        });

    });
});
