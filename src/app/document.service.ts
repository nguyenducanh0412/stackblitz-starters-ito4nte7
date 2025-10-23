import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  constructor(private http: HttpClient) {}

  /**
   * Load a document file and convert it to base64
   * @param url URL of the document file
   * @returns Observable of the base64 encoded document
   */
  loadDocumentAsBase64(url: string): Observable<string> {
    return this.http
      .get(url, { responseType: "arraybuffer" })
      .pipe(map((buffer) => this.arrayBufferToBase64(buffer)));
  }

  /**
   * Convert an ArrayBuffer to a base64 string
   * @param buffer ArrayBuffer to convert
   * @returns Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Determine document type from file extension
   * @param fileName File name with extension
   * @returns Document type ('pdf' or 'pptx')
   */
  getDocumentType(fileName: string): "pdf" | null {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      return "pdf";
    }
    return null;
  }
}
