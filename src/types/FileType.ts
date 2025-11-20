export interface FileItem {
    id: string; // 파일  uuid
    file: File;
}

export interface PDFSettings {
    pageSize: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    quality: number; // 0.1 ~ 1.0
}