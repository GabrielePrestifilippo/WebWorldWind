/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    'src/globe/EarthRestElevationModel',

], function (EarthRestElevationModel) {
    "use strict";

    describe("EarthRestElevationModel", function () {


        it("Should create a EarthRestElevationModel and set all the properties", function () {
            var serverAddress,
                pathToData,
                displayName="Earth Rest Elevation Model";

            var earthRestElevationModel = new EarthRestElevationModel(serverAddress, pathToData, displayName);

            expect(earthRestElevationModel.displayName).toEqual(displayName);
            expect(earthRestElevationModel.minElevation).toEqual(-11000);
            expect(earthRestElevationModel.maxElevation).toEqual(8850);
            expect(earthRestElevationModel.urlBuilder).toBeTruthy();
        });

    });
});
