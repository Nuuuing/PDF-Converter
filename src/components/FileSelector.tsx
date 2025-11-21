'use client';

import { FileItem } from '@/types';
import { useRef, useState, DragEvent, SetStateAction, Dispatch, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FileSelectorProps {
    data: FileItem[];
    setData: Dispatch<SetStateAction<FileItem[]>>;
}

export const FileSelector = ({ data, setData }: FileSelectorProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragOver, setIsDragOver] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        setIsLoading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // UI 업데이트를 위한 짧은 지연
            
            const validFiles = Array.from(selectedFiles).filter(file => {
                return file.type.startsWith('image/');
            });

            const newFiles: FileItem[] = validFiles.map(file => ({
                id: self.crypto.randomUUID(), //파일 uuid로 부여
                file: file
            }));

            setData(prev => [...prev, ...newFiles]);

            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setIsLoading(false);
        }
    };

    const removeFile = (index: number) => {
        setData(prev => prev.filter((_, i) => i !== index));
    };

    const handleReset = () => {
        setData([]);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ---------------------------------------- 드래그 앤 드롭
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleFileDragStart = (e: DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleFileDragOver = (e: DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFiles = [...data];
        const draggedItem = newFiles[draggedIndex];

        newFiles.splice(draggedIndex, 1);
        newFiles.splice(index, 0, draggedItem);

        setData(newFiles);
        setDraggedIndex(index);
    };

    const handleFileDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-2 items-center ">
            {isLoading && (
                <div className="mb-4">
                    <Suspense fallback={<LoadingSpinner />}>
                        <LoadingSpinner />
                    </Suspense>
                </div>
            )}
            <div className="mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-gray-500 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-white px-4 py-2 cursor-pointer transition-colors"
                    >
                        파일 선택
                    </button>
                    {data.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-500 dark:hover:bg-red-500 text-white px-4 py-2 cursor-pointer transition-colors"
                        >
                            초기화
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* 드래그 앤 드롭*/}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed p-8 text-center transition-colors mb-4 ${isDragOver
                        ? 'border-blue-400 bg-blue-50 dark:bg-gray-800'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
            >
                <p className="text-gray-600 dark:text-gray-300">
                    이미지 파일을 여기로 드래그해주세요.
                </p>
            </div>

            {/* 파일 리스트 */}
            {data.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">목록 ({data.length}개)</h3>
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 450px)' }}>
                        {data.map((data, index) => (
                            <div
                                key={data.id}
                                draggable
                                onDragStart={(e) => handleFileDragStart(e, index)}
                                onDragOver={(e) => handleFileDragOver(e, index)}
                                onDragEnd={handleFileDragEnd}
                                className={`flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-move transition-all ${draggedIndex === index ? 'opacity-50 bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <span className="text-gray-500 dark:text-gray-400 cursor-grab active:cursor-grabbing">⋮⋮</span>
                                    <span className="font-medium w-6 text-center text-gray-900 dark:text-white">{index + 1}.</span>
                                    <span className="truncate text-gray-700 dark:text-gray-200">{data.file.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                        ({(data.file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>

                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 font-bold px-2 py-1 transition-colors"
                                    title="제거"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}