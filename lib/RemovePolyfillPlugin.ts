type Compilation = {
  assets: {
    [key: string]: {
      source: () => string | Buffer;
      size: () => number;
      sourceAndMap?: (options?: { columns?: boolean }) => {
        source: string | Buffer;
        map: unknown;
      };
    };
  };
  hooks: {
    processAssets: {
      tap: (
        options: { name: string; stage: number },
        callback: (assets: Compilation["assets"]) => void
      ) => void;
    };
  };
  updateAsset: (
    filename: string,
    newSource: {
      source: () => string | Buffer;
      size: () => number;
      sourceAndMap?: (options?: { columns?: boolean }) => {
        source: string | Buffer;
        map: unknown;
      };
    }
  ) => void;
  PROCESS_ASSETS_STAGE_OPTIMIZE: number;
};

type Compiler = {
  webpack: {
    sources: {
      RawSource: new (source: string | Buffer) => {
        source: () => string | Buffer;
        size: () => number;
        sourceAndMap: (options?: { columns?: boolean }) => {
          source: string | Buffer;
          map: unknown;
        };
      };
    };
  };
  hooks: {
    compilation: {
      tap: (name: string, callback: (compilation: Compilation) => void) => void;
    };
  };
};

// Custom webpack plugin to remove polyfill strings from compiled output
export class RemovePolyfillPlugin {
  // Regex patterns to match and remove polyfills
  private polyfillRegexes = [
    // Pattern 1: Array.prototype.at||(Array.prototype.at=function(...){...}),
    /(Array\.prototype\.at|Array\.prototype\.flat|Array\.prototype\.flatMap|Object\.fromEntries|Object\.hasOwn|String\.prototype\.trimEnd|String\.prototype\.trimStart)\|\|\(\1=function\(.*?\)\{.*?\}\),/g,
    // Pattern 2: "trimEnd"in String.prototype||(String.prototype.trimEnd=String.prototype.trimRight),
    /"trimEnd"in String\.prototype\|\|\(String\.prototype\.trimEnd=String\.prototype\.trimRight\),/g,
    // Pattern 3: "trimStart"in String.prototype||(String.prototype.trimStart=String.prototype.trimLeft),
    /"trimStart"in String\.prototype\|\|\(String\.prototype\.trimStart=String\.prototype\.trimLeft\),/g,
  ];

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap("RemovePolyfillPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "RemovePolyfillPlugin",
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets) => {
          // Iterate over all compiled assets
          for (const filename in assets) {
            // Only check JavaScript files
            if (!filename.endsWith(".js")) continue;

            const asset = assets[filename];
            const source = asset.source();
            const originalContent =
              typeof source === "string" ? source : source.toString();
            let content = originalContent;

            // Remove polyfills using all regex patterns
            for (const regex of this.polyfillRegexes) {
              content = content.replace(regex, "");
            }

            // Only update if content changed
            if (content !== originalContent) {
              // Use webpack's RawSource to create a proper source object
              const newSource = new compiler.webpack.sources.RawSource(content);
              compilation.updateAsset(filename, newSource);
            }
          }
        }
      );
    });
  }
}
