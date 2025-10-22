# Document Viewer Component

This is an Angular component for viewing PDF and PPTX documents with base64 encoding. It provides navigation controls for moving between pages and tracking the current page.

## Features

- View PDF documents with ng2-pdf-viewer
- View PPTX documents with pptx‑preview.js
- Navigate through pages (next page, previous page)
- Track current page number
- Support for base64 encoded documents

## Usage

### 1. Include the component in your module

Make sure to import the DocumentViewerComponent:

```typescript
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [DocumentViewerComponent],
  // ...
})
export class YourComponent {
  // ...
}
```

### 2. Use the component in your template

```html
<app-document-viewer 
  [documentBase64]="yourBase64Document" 
  [documentType]="'pdf'">
</app-document-viewer>
```

### 3. Properties

- `documentBase64`: string - The base64 encoded document
- `documentType`: 'pdf' | 'pptx' - The type of document (pdf or pptx)

### 4. Methods

You can access the document viewer component methods using a ViewChild reference:

```typescript
@ViewChild(DocumentViewerComponent) documentViewer!: DocumentViewerComponent;

// Navigate to next page
goToNextPage() {
  this.documentViewer.nextPage();
}

// Navigate to previous page
goToPreviousPage() {
  this.documentViewer.previousPage();
}

// Go to a specific page
goToPage(pageNumber: number) {
  this.documentViewer.goToPage(pageNumber);
}
```

### 5. Current Page and Total Pages

The component exposes `currentPage` and `totalPages` properties that you can use to display the current page information.

## Dependencies

- ng2-pdf-viewer: For PDF document viewing
- pptx-preview.js: For PPTX document viewing

## Notes

- The PDF viewer uses ng2-pdf-viewer
- The PPTX viewer uses a custom wrapper around pptx‑preview.js
- Both viewers support navigation between pages and tracking the current page