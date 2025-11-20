import { create } from "zustand";

interface FileItem {
    id: string;
    file: File;
    name: string;
    type: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface FileState {
    fileList: FileItem[];

    outputFileName: string;
    quality: 'low' | 'medium' | 'high'; // 출력 품질 설정
    pageOrientation: 'portrait' | 'landscape'; // 페이지 방향 설정
    
    isConverting: boolean;      // 컨버팅 여부
    conversionProgress: number; // 컨버팅 진행률 (0-100)

    addFile: (file: File) => void;
    removeFile: (id: string) => void;
    resetFiles: () => void;

    setOutputFileName: (name: string) => void;
    setQuality: (quality: 'low' | 'medium' | 'high') => void;
    setPageOrientation: (orientation: 'portrait' | 'landscape') => void;

    startConversion: () => void;
    updateConversionProgress: (progress: number) => void;
    completeConversion: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
    fileList: [], 
    outputFileName: 'output.pdf',
    quality: 'medium',
    pageOrientation: 'portrait',
    isConverting: false,
    conversionProgress: 0,

    //-----------------------파일-----------------------
    // 새 파일을 파일 리스트에 추가
    addFile: (file: File) => {
        const newFileItem: FileItem = {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            type: file.type,
            status: 'pending'
        };
        
        set(state => ({
            fileList: [...state.fileList, newFileItem]
        }));
    },

    // 특정 ID의 파일을 리스트에서 삭제
    removeFile: (id: string) => {
        set(state => ({
            fileList: state.fileList.filter(file => file.id !== id)
        }));
    },

    // 모든 파일을 리스트에서 제거
    resetFiles: () => {
        set({ fileList: [] });
    },

    //-----------------------설정-----------------------
    // 출력 파일명 설정
    setOutputFileName: (name: string) => {
        set({ outputFileName: name });
    },

    // 출력 품질 설정
    setQuality: (quality: 'low' | 'medium' | 'high') => {
        set({ quality });
    },

    // 페이지 방향 설정
    setPageOrientation: (orientation: 'portrait' | 'landscape') => {
        set({ pageOrientation: orientation });
    },

    //-----------------------변환-----------------------
    // 변환 프로세스 시작
    startConversion: () => {
        set({ 
            isConverting: true,
            conversionProgress: 0
        });
    },

    // 변환 진행률 업데이트
    updateConversionProgress: (progress: number) => {
        set({ conversionProgress: Math.max(0, Math.min(100, progress)) });
    },

    // 변환 완료 처리
    completeConversion: () => {
        set({ 
            isConverting: false,
            conversionProgress: 100
        });
    }
})
);