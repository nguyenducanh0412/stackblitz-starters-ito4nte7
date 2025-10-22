import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ScriptLoaderService {
  private loadedScripts: { [url: string]: boolean } = {};

  loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedScripts[url]) {
        console.log(`✅ Script already loaded: ${url}`);
        resolve();
        return;
      }

      console.log(`⏳ Loading script: ${url}`);
      const script = document.createElement("script");
      script.src = url;

      script.onload = () => {
        this.loadedScripts[url] = true;
        console.log(`✅ Script loaded successfully: ${url}`);
        resolve();
      };

      script.onerror = (error) => {
        console.error(`❌ Failed to load script: ${url}`, error);
        console.error(`Make sure the file exists at: ${url}`);
        reject(new Error(`Failed to load script: ${url}`));
      };

      document.body.appendChild(script);
    });
  }

  async loadPptxLibraries(): Promise<void> {
    console.log("🚀 Starting to load PPTX libraries from local assets...");

    const scripts = [
      "/assets/js/jquery-1.11.3.min.js",
      "/assets/js/jszip.min.js",
      "/assets/js/filereader.js",
      "/assets/js/d3.min.js",
      "/assets/js/nv.d3.min.js",
      "/assets/js/pptxjs.js",
      "/assets/js/divs2slides.js",
    ];

    try {
      for (const script of scripts) {
        await this.loadScript(script);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Kiểm tra xem các thư viện đã sẵn sàng chưa
      await this.verifyLibrariesLoaded();

      console.log("🎉 All PPTX libraries loaded successfully!");
    } catch (error) {
      console.error("❌ Error loading PPTX libraries:", error);
      console.error("📁 Please check that all files exist in src/assets/js/");
      throw error;
    }
  }

  private verifyLibrariesLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("🔍 Verifying libraries...");

      const maxAttempts = 50; // 5 giây
      let attempts = 0;

      const checkLibraries = () => {
        attempts++;

        const checks = {
          jQuery: typeof (window as any).jQuery !== "undefined",
          jQueryVersion: (window as any).jQuery?.fn?.jquery || "N/A",
          jQueryFn: typeof (window as any).jQuery?.fn !== "undefined",
          pptxToHtml:
            typeof (window as any).jQuery?.fn?.pptxToHtml === "function",
        };

        console.log(`🔄 Attempt ${attempts}/${maxAttempts}:`, checks);

        if (checks.jQuery && checks.jQueryFn && checks.pptxToHtml) {
          console.log("✅ All libraries verified and ready!");
          console.log("📦 jQuery version:", checks.jQueryVersion);
          console.log(
            "🔌 Available jQuery plugins:",
            Object.keys((window as any).jQuery.fn)
              .slice(0, 10)
              .join(", "),
            "..."
          );
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error(
            "❌ Library verification failed after",
            attempts,
            "attempts"
          );
          console.error("📊 Final check results:", checks);
          console.error("💡 Possible issues:");
          console.error("   - Scripts may not be in correct order");
          console.error(
            "   - pptxjs.js may not be compatible with this jQuery version"
          );
          console.error("   - Files may be corrupted or incomplete");
          reject(new Error("PPTX libraries failed to initialize properly"));
        } else {
          setTimeout(checkLibraries, 100);
        }
      };

      checkLibraries();
    });
  }

  // Thêm method để check status bất kỳ lúc nào
  checkLibraryStatus(): void {
    console.log("📊 ===== Library Status =====");
    console.log(
      "✓ jQuery loaded:",
      typeof (window as any).jQuery !== "undefined"
    );
    console.log(
      "✓ jQuery version:",
      (window as any).jQuery?.fn?.jquery || "Not found"
    );
    console.log(
      "✓ pptxToHtml available:",
      typeof (window as any).jQuery?.fn?.pptxToHtml === "function"
    );
    console.log(
      "✓ Loaded scripts count:",
      Object.keys(this.loadedScripts).length
    );
    console.log("✓ Loaded script paths:");
    Object.keys(this.loadedScripts).forEach((script) => {
      console.log("  -", script);
    });

    // Kiểm tra window globals
    console.log("🌐 Window globals:");
    console.log("  - jQuery:", typeof (window as any).jQuery);
    console.log("  - $:", typeof (window as any).$);
    console.log("  - JSZip:", typeof (window as any).JSZip);
    console.log("  - d3:", typeof (window as any).d3);
    console.log("===========================");
  }

  // Method để list tất cả các jQuery plugins đã load
  listJQueryPlugins(): void {
    if (typeof (window as any).jQuery !== "undefined") {
      console.log("🔌 Available jQuery plugins:");
      const plugins = Object.keys((window as any).jQuery.fn);
      plugins.forEach((plugin) => {
        console.log(`  - $.fn.${plugin}`);
      });
      console.log(`Total: ${plugins.length} plugins`);
    } else {
      console.log("❌ jQuery is not loaded");
    }
  }
}
