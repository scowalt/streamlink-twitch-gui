var FS = require( "fs" );


/**
 * @param {Object} options
 * @param {Object} packageJSON
 * @returns {Promise<String>}
 */
function getReleaseChangelog( options, packageJSON ) {
	var version  = packageJSON.version;
	var reSplit  = /\n## /g;
	var reFormat = new RegExp([
		// 1: version match
		"^\\[v?(\\d+\\.\\d+\\.\\d+(?:-\\S+)?)]",
		// 2: release link match
		"\\((\\S+)\\)\\s",
		// 3: release date match
		"\\((\\d{4}-\\d{2}-\\d{2})\\)",
		// 4: spacing match
		"(\\r\\n|\\n){2}",
		// 5: release notes match
		"([\\s\\S]+)$"
	].join( "" ) );

	return new Promise(function( resolve, reject ) {
		FS.readFile( options.changelogFile, function( err, content ) {
			if ( err ) {
				reject( err );
			} else {
				resolve( content.toString() );
			}
		});
	})
		.then(function( content ) {
			var release = content
				.split( reSplit )
				.slice( 1 )
				.map(function( release ) {
					return reFormat.exec( release );
				})
				.find(function( release ) {
					return release !== null
					    && release[1] === version;
				});

			if ( !release || !release[5] ){
				throw new Error( "Release notes for '" + version + "' not found." );
			}

			return release[5].trim();
		});
}


module.exports = getReleaseChangelog;
