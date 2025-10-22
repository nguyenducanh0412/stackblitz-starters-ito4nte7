export class PptxViewer {
  currentSlide = 1;
  totalSlides = 0;
  container: any = null;
  $container: any = null;

  constructor() {
    if (typeof (window as any).jQuery === "undefined") {
      throw new Error("jQuery is not loaded");
    }
    if (typeof (window as any).jQuery.fn.pptxToHtml !== "function") {
      throw new Error("pptxToHtml plugin is not loaded");
    }
  }

  renderPptx(options: {
    container: HTMLElement;
    file: File;
    onRender?: () => void;
    onError?: (error: any) => void;
  }): void {
    const { container, file, onRender, onError } = options;

    // Validate file
    console.log("🔍 Validating file...");
    console.log("File name:", file.name);
    console.log("File size:", file.size, "bytes");
    console.log("File type:", file.type);
    debugger;
    if (file.size === 0) {
      const error = "File is empty (0 bytes)";
      console.error("❌", error);
      if (onError) onError(error);
      return;
    }

    if (file.size < 100) {
      console.warn("⚠️ File seems too small for a PPTX");
    }

    this.container = container;
    const $ = (window as any).jQuery;
    this.$container = $(container);

    console.log("📄 Creating Object URL...");
    const fileUrl = URL.createObjectURL(file);
    console.log("🔗 Object URL:", fileUrl);

    // Test: Có thể fetch URL không
    fetch(fileUrl)
      .then((response) => {
        console.log("✅ File URL is accessible");
        console.log("Response status:", response.status);
        console.log("Content-Type:", response.headers.get("content-type"));
        return response.blob();
      })
      .then((testBlob) => {
        console.log("✅ Blob size from URL:", testBlob.size);
      })
      .catch((err) => {
        console.error("❌ Cannot access file URL:", err);
      });

    console.log("🎨 Initializing pptxToHtml...");

    try {
      this.$container.pptxToHtml({
        pptxFileUrl: fileUrl,
        slideMode: true,
        keyBoardShortCut: false,
        slideModeConfig: {
          first: 1,
          nav: false,
          navTxtColor: "#000",
          navCurrentTxtColor: "#fff",
          showSlideNum: true,
          showTotalSlideNum: true,
          autoSlide: false,
          loop: false,
          background: "#f5f5f5",
          transition: "fade",
          transitionTime: 0.3,
        },
      });

      console.log("✅ pptxToHtml initialized");

      // Kiểm tra sau nhiều khoảng thời gian
      const checkIntervals = [500, 1000, 2000, 3000, 5000];

      checkIntervals.forEach((interval) => {
        setTimeout(() => {
          const slides = this.$container.find(".slide");
          console.log(`⏱️ After ${interval}ms: Found ${slides.length} slides`);

          // Log HTML để xem có gì được render không
          if (slides.length === 0) {
            console.log(
              "📝 Container HTML:",
              this.$container.html().substring(0, 500)
            );
          }

          if (slides.length > 0 && this.totalSlides === 0) {
            this.totalSlides = slides.length;
            console.log("✅ PPTX rendered successfully!");
            console.log("📊 Total slides:", this.totalSlides);

            // Cleanup URL
            URL.revokeObjectURL(fileUrl);

            if (onRender) {
              onRender();
            }
          }
        }, interval);
      });

      // Timeout cuối cùng - nếu vẫn không có slides
      setTimeout(() => {
        if (this.totalSlides === 0) {
          const error = "No slides rendered after 5 seconds";
          console.error("❌", error);
          console.log("🔍 Final container content:", this.$container.html());

          // Revoke URL để tránh memory leak
          URL.revokeObjectURL(fileUrl);

          if (onError) {
            onError(error);
          }
        }
      }, 5000);
    } catch (error) {
      console.error("❌ Error in pptxToHtml:", error);
      URL.revokeObjectURL(fileUrl);
      if (onError) {
        onError(error);
      }
    }
  }

  // ... rest of the methods
  nextSlide(): boolean {
    if (this.$container && this.currentSlide < this.totalSlides) {
      this.$container.trigger("nextSlide");
      this.currentSlide++;
      console.log(
        "➡️ Current slide:",
        this.currentSlide,
        "/",
        this.totalSlides
      );
      return true;
    }
    console.warn("⚠️ Cannot go to next slide");
    return false;
  }

  prevSlide(): boolean {
    if (this.$container && this.currentSlide > 1) {
      this.$container.trigger("prevSlide");
      this.currentSlide--;
      console.log(
        "⬅️ Current slide:",
        this.currentSlide,
        "/",
        this.totalSlides
      );
      return true;
    }
    console.warn("⚠️ Cannot go to previous slide");
    return false;
  }

  goToSlide(slideNumber: number): boolean {
    if (
      this.$container &&
      slideNumber >= 1 &&
      slideNumber <= this.totalSlides
    ) {
      this.$container.trigger("gotoSlide", [slideNumber]);
      this.currentSlide = slideNumber;
      console.log("🎯 Jumped to slide:", slideNumber, "/", this.totalSlides);
      return true;
    }
    console.warn("⚠️ Cannot go to slide", slideNumber);
    return false;
  }

  getCurrentSlide(): number {
    return this.currentSlide;
  }

  getTotalSlides(): number {
    return this.totalSlides;
  }

  destroy(): void {
    if (this.$container) {
      this.$container.empty();
      this.$container = null;
      this.container = null;
      this.currentSlide = 1;
      this.totalSlides = 0;
      console.log("🗑️ PptxViewer destroyed");
    }
  }
}
