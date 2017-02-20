/**
 * Created by BEZ on 15/02/2017.
 */
import path from "path";
import fs from "fs";
import report from "./create-static";

function reduceTestObject( accumulator, currentValue ) {
    accumulator.tests = accumulator.tests.concat( currentValue.tests );
    let stats = accumulator.stats;
    let currentStats = currentValue.stats;

    stats.suites += currentStats.suites;
    stats.tests += currentStats.tests;
    stats.passes += currentStats.passes;
    stats.pending += currentStats.pending;
    stats.failures += currentStats.failures;
    stats.duration += currentStats.duration;
    stats.start = stats.start < currentStats.start ? stats.start : currentStats.start;
    stats.end = stats.end < currentStats.end ? currentStats.end : stats.end;

    return accumulator;
}

export default function aggregateReports( reportName, artifactsPath ) {

    let files = fs.readdirSync( artifactsPath );

    let allTests = files.filter( name => path.extname( name ) === ".json" )
        .map( name => path.resolve( artifactsPath, name ) )
        .map( filepath => JSON.parse( fs.readFileSync( filepath, "utf8" ) ) );

    if ( allTests.length === 0 ) {
        return undefined;
    }

    let sumTests = allTests.reduce( reduceTestObject );

    if ( sumTests ) {
        let fileName = path.resolve( artifactsPath, reportName + ".json" );

        return new Promise( function ( resolve, reject ) {
            fs.writeFile( fileName, JSON.stringify( sumTests, null, "\t" ), err => {
                if ( err ) {
                    reject( err );
                } else {
                    resolve();
                }
            } );
        } ).then( () => report.generate( fileName ) );
    }
    return undefined;
}
