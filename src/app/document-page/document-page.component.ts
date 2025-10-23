import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DocumentViewerComponent } from "../document-viewer/document-viewer.component";
import { DocumentService } from "../document.service";
import { HttpClientModule } from "@angular/common/http";

@Component({
  selector: "app-document-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DocumentViewerComponent,
    HttpClientModule,
  ],
  templateUrl: "./document-page.component.html",
  styleUrls: ["./document-page.component.scss"],
})
export class DocumentPageComponent implements OnInit {
  documentBase64: string = "";
  documentType: "pdf" = "pdf";
  isLoading: boolean = false;
  selectedFile: File | null = null;
  currentPage: number = 1;
  totalPages: number = 0;

  // Sample documents for testing
  sampleDocuments: Array<{ name: string; url: string; type: "pdf" }> = [
    { name: "Sample PDF", url: "/CV_Dinh-Cong-Truong.pdf", type: "pdf" },
  ];

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    // You can preload a sample document if needed
  }

  loadSampleDocument(doc: { url: string; type: "pdf" }): void {
    this.isLoading = true;
    this.documentType = doc.type;

    this.documentService.loadDocumentAsBase64(doc.url).subscribe({
      next: (base64) => {
        this.documentBase64 = base64;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading document", error);
        this.isLoading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const fileName = this.selectedFile.name;
      const documentType = this.documentService.getDocumentType(fileName);

      if (documentType) {
        this.documentType = documentType;
        this.readFileAsBase64();
      } else {
        alert("Unsupported file format. Please select a PDF or PPTX file.");
      }
    }
  }

  readFileAsBase64(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isLoading = true;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract the base64 part (remove data:application/pdf;base64, prefix)
      this.documentBase64 = result.substring(result.indexOf(",") + 1);
      this.isLoading = false;
    };
    reader.onerror = () => {
      console.error("Error reading file");
      this.isLoading = false;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
