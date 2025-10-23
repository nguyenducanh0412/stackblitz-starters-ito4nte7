import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { PdfViewerModule } from "ng2-pdf-viewer";

@Component({
  selector: "app-document-viewer",
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: "./document-viewer.component.html",
  styleUrls: ["./document-viewer.component.scss"],
})
export class DocumentViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() documentBase64: string = "";
  @Input() documentType: "pdf" = "pdf";

  pdfSrc: string | Uint8Array | null = null;
  currentPage: number = 1;
  totalPages: number = 0;

  constructor() {}

  ngOnInit() {}

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
    }
  }

  previousPage(): void {
    if (this.documentType === "pdf") {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }

  goToPage(pageNumber: number): void {
    if (this.documentType === "pdf") {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
      }
    }
  }

  ngOnDestroy() {}
}
