import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { ScriptLoaderService } from "../script-loader.service";
import { PptxViewer } from "../types/pptx-viewer.wrapper";

@Component({
  selector: "app-document-viewer",
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: "./document-viewer.component.html",
  styleUrls: ["./document-viewer.component.scss"],
})
export class DocumentViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() documentBase64: string = "";
  @Input() documentType: "pdf" | "pptx" = "pdf";

  @ViewChild("pptxContainer", { static: false }) pptxContainer!: ElementRef;

  pdfSrc: string | Uint8Array | null = null;
  currentPage: number = 1;
  totalPages: number = 0;
  pptxViewer: PptxViewer | null = null;

  private scriptsLoaded = false;

  constructor(private scriptLoader: ScriptLoaderService) {}

  async ngOnInit() {
    console.log("🔄 Component initialized");
    try {
      await this.initializePptxLibraries();
    } catch (error) {
      console.error("Failed to initialize PPTX libraries:", error);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["documentBase64"] || changes["documentType"]) {
      this.loadDocument();
    }
  }

  loadDocument(): void {
    if (!this.documentBase64) {
      return;
    }

    if (this.documentType === "pdf") {
      // For PDF, we can pass the base64 directly after adding the data URL prefix
      this.pdfSrc = "data:application/pdf;base64," + this.documentBase64;
    } else if (this.documentType === "pptx") {
      // For PPTX, we need to convert base64 to ArrayBuffer
      setTimeout(() => {
        this.loadPptx(this.base64ToArrayBuffer(this.documentBase64));
      }, 100);
    }
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async initializePptxLibraries(): Promise<void> {
    if (this.scriptsLoaded) {
      console.log("Libraries already loaded");
      return;
    }

    try {
      console.log("Starting library initialization...");
      await this.scriptLoader.loadPptxLibraries();
      this.scriptsLoaded = true;
      console.log("✅ Libraries initialized successfully");

      // Check status
      this.scriptLoader.checkLibraryStatus();
    } catch (error) {
      console.error("❌ Failed to initialize libraries:", error);
      throw error;
    }
  }

  async loadPptx(arrayBuffer: ArrayBuffer) {
    try {
      // Create a blob from the array buffer
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });

      // Create a File object from the Blob
      const file = new File([blob], "presentation.pptx", {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });

      if (!this.scriptsLoaded) {
        await this.scriptLoader.loadPptxLibraries();
        this.scriptsLoaded = true;
      }

      const container = this.pptxContainer.nativeElement;

      // Create a PptxViewer instance
      if (!this.pptxViewer) {
        this.pptxViewer = new PptxViewer();
      }

      // Load the PPTX file
      this.pptxViewer?.renderPptx({
        container: container,
        file: file,
        onRender: () => {
          this.updatePptxPageInfo();
          console.log("PPTX rendered successfully");
        },
      });
    } catch (error) {
      console.error("Error loading PPTX file:", error);
    }
  }

  updatePptxPageInfo(): void {
    if (this.pptxViewer) {
      this.currentPage = this.pptxViewer?.currentSlide || 1;
      this.totalPages = this.pptxViewer?.totalSlides || 1;
    }
  }

  // PDF viewer events
  onPdfPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  onPdfLoaded(pdf: any): void {
    this.totalPages = pdf.numPages;
  }

  // Navigation methods
  nextPage(): void {
    if (this.documentType === "pdf") {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    } else if (this.documentType === "pptx" && this.pptxViewer) {
      this.pptxViewer.nextSlide();
      this.updatePptxPageInfo();
    }
  }

  previousPage(): void {
    if (this.documentType === "pdf") {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    } else if (this.documentType === "pptx" && this.pptxViewer) {
      this.pptxViewer.prevSlide();
      this.updatePptxPageInfo();
    }
  }

  goToPage(pageNumber: number): void {
    if (this.documentType === "pdf") {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
      }
    } else if (this.documentType === "pptx" && this.pptxViewer) {
      this.pptxViewer.goToSlide(pageNumber);
      this.updatePptxPageInfo();
    }
  }

  ngOnDestroy() {
    if (this.pptxViewer) {
      this.pptxViewer.destroy();
      this.pptxViewer = null;
    }
  }
}
