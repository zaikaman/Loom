const fs = require('fs');

try {
    const data = fs.readFileSync('d:\\Loom\\forumsdocs.json', 'utf8');
    const schema = JSON.parse(data);
    const paths = Object.keys(schema.paths);

    console.log("Searching for 'search' in paths...");
    const searchPaths = paths.filter(p => p.toLowerCase().includes('search'));

    if (searchPaths.length > 0) {
        console.log("Found paths:", searchPaths);
        searchPaths.forEach(p => {
            console.log(`\n--- ${p} ---`);
            console.log(JSON.stringify(schema.paths[p], null, 2));
        });
    } else {
        console.log("No paths containing 'search' found.");

        // Check for any GET endpoints that accept 'q' or 'query'
        console.log("\nSearching for GET endpoints with 'q' or 'query' params...");
        paths.forEach(p => {
            const get = schema.paths[p].get;
            if (get && get.parameters) {
                const params = get.parameters.map(param => param.name);
                if (params.includes('q') || params.includes('query') || params.includes('search')) {
                    console.log(`Found candidate: ${p} (Params: ${params.join(', ')})`);
                }
            }
        });
    }

} catch (e) {
    console.error("Error:", e.message);
}
