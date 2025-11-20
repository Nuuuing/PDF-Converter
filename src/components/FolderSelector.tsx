'use client';

import { FileItem } from "@/types";
import { Dispatch, SetStateAction, useRef } from "react";

interface FolderSelectorProps {
    data: FileItem[];
    setData: Dispatch<SetStateAction<FileItem[]>>;
    folderName: string;
    setFolderName: Dispatch<SetStateAction<string>>;
}

export const FolderSelector = ({ data, setData, folderName, setFolderName }: FolderSelectorProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFolderSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const validFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));

        if (validFiles.length === 0) {
            alert("폴더 내에 이미지 파일이 없습니다.");
            return;
        }
        
        // 파일 이름순 정렬
        validFiles.sort((a, b) => {
            const pathA = a.webkitRelativePath || a.name;
            const pathB = b.webkitRelativePath || b.name;
            return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: 'base' });
        });

        // 폴더 이름 추출 및 저장
        // webkitRelativePath → 폴더명/파일명
        const firstPath = validFiles[0].webkitRelativePath;
        const extractedFolderName = firstPath ? firstPath.split('/')[0] : '선택된 폴더';
        setFolderName(extractedFolderName);

        const newFiles: FileItem[] = validFiles.map(file => ({
            id: self.crypto.randomUUID(),
            file: file
        }));

        setData(newFiles);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleReset = () => {
        setData([]);
        setFolderName("");
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-2">
            {data.length === 0 ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 mb-2 cursor-pointer transition-colors"
                >
                    폴더 선택
                </button>

            ) : (
                <div className="bg-gray-800 border border-gray-600 p-6 text-center relative">
                    <div className="text-xl mb-4">📂   {folderName}</div>
                    <p className="text-gray-400 font-medium mb-4">
                        총 {data.length}개 이미지
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-600 hover:bg-gray-400 px-4 py-2 text-sm cursor-pointer transition-colors"
                        >
                            다른 폴더 선택
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-400 px-4 py-2 text-sm cursor-pointer transition-colors"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                onChange={(e) => handleFolderSelect(e.target.files)}
                className="hidden"
            />
        </div>
    );
}