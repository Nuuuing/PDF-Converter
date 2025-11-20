"use client";

import { FileItem, PDFSettings } from "@/types";
import { useState } from "react";
import { PDFDocument } from 'pdf-lib';

interface ConvertContainerProps {
    targetFiles: FileItem[];
    folderName?: string;
    pdfSettings: PDFSettings;
}
export const ConvertContainer = ({ targetFiles, folderName, pdfSettings }: ConvertContainerProps) => {

    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);

    const [statusMessage, setStatusMessage] = useState("");
    const [isDone, setIsDone] = useState(false);

    const canConvert = targetFiles.length > 0;

    const processImageFile = async (fileItem: FileItem, pdfDoc: any) => {
        // 파일 → ArrayBuffer (메모리 저장 binary data buffer)
        const arrayBuffer = await fileItem.file.arrayBuffer();
        
        let image;
        const fileType = fileItem.file.type;

        if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
            image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (fileType === 'image/png') {
            image = await pdfDoc.embedPng(arrayBuffer);
        } else {
            // pdf-lib → jpg, png 타입만 가능, jpeg로 변환
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = URL.createObjectURL(fileItem.file);
            });

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const jpegDataUrl = canvas.toDataURL('image/jpeg', pdfSettings.quality);
            const jpegBase64 = jpegDataUrl.split(',')[1];
            const jpegArrayBuffer = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0));
            
            image = await pdfDoc.embedJpg(jpegArrayBuffer);
            
            URL.revokeObjectURL(img.src); // 메모리 정리            
        }

        return image;
    };

    const getPageDimensions = () => {
        const pageSizes = {
            'A4': { width: 595.28, height: 841.89 },
            'A3': { width: 841.89, height: 1190.55 },
            'A5': { width: 419.53, height: 595.28 },
            'Letter': { width: 612, height: 792 },
            'Legal': { width: 612, height: 1008 },
        };

        const baseSize = pageSizes[pdfSettings.pageSize];
        
        if (pdfSettings.orientation === 'landscape') {
            return { width: baseSize.height, height: baseSize.width };
        }
        return baseSize;
    };

    const addImageToPage = (pdfDoc: any, image: any) => {
        const { width, height } = image.size();
        
        const { width: pageWidth, height: pageHeight } = getPageDimensions();
        
        const scaleWidth = pageWidth / width;
        const scaleHeight = pageHeight / height;
        const scale = Math.min(scaleWidth, scaleHeight);
        
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);  // 페이지 추가
        
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        page.drawImage(image, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
        });
    };

    const downloadPDF = async (pdfDoc: any) => {
        const pdfBytes = await pdfDoc.save();
        
        // 다운로드 실행
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = folderName ? `${folderName}.pdf` : `images_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleConvert = async () => {
        if (!canConvert) return;

        setIsConverting(true);
        setIsDone(false);
        setProgress(0);
        setStatusMessage("변환 준비 중...");

        try {
            const pdfDoc = await PDFDocument.create();

            const totalFiles = targetFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const fileItem = targetFiles[i];
                setStatusMessage(`${i + 1} / ${totalFiles} 장 처리 중... (${fileItem.file.name})`);

                try {
                    const image = await processImageFile(fileItem, pdfDoc);
                    addImageToPage(pdfDoc, image);
                } catch (error) {
                    console.error(`이미지 처리 실패: ${fileItem.file.name}`, error);
                    setStatusMessage(`${fileItem.file.name} 처리 중 오류 발생, 계속 진행...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const currentProgress = Math.round(((i + 1) / totalFiles) * 100);
                setProgress(currentProgress);
                
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            setStatusMessage("PDF 생성 중...");
            await downloadPDF(pdfDoc);

            setStatusMessage("변환 완료! 다운로드가 시작됩니다.");
            setIsDone(true);

            // 완료 후 3초 뒤에 버튼 상태 초기화
            setTimeout(() => {
                setIsConverting(false);
                setIsDone(false);
                setProgress(0);
                setStatusMessage("");
            }, 3000);

        } catch (error) {
            console.error("PDF 변환 오류:", error);
            setStatusMessage("변환 중 오류가 발생했습니다.");
            setIsConverting(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed bottom-10 left-0 right-0 flex justify-center px-4 z-50">
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 p-4 shadow-2xl w-full max-w-xl transition-all">

                {isConverting ? (
                    <div className="space-y-3">
                        <div className="flex justify-between text-white font-medium text-sm">
                            <span>{statusMessage}</span>
                            <span>{progress}%</span>
                        </div>

                        {/* 진행률 */}
                        <div className="w-full bg-gray-700  h-2.5 overflow-hidden">
                            <div
                                className="bg-blue-500 h-2.5 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        {isDone && (
                            <div className="text-green-400 text-center text-sm font-bold mt-2 animate-pulse">
                                변환 완료
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-white text-sm">
                            <span className="text-gray-400">대상 파일:</span>
                            <span className="ml-2 font-bold text-gray-400">{targetFiles.length}개</span>
                            {folderName && <span className="text-gray-500 ml-2">({folderName})</span>}
                        </div>

                        <button
                            onClick={handleConvert}
                            disabled={!canConvert}
                            className={`px-6 py-3 font-bold transition-all duration-200 shadow-lg ${canConvert
                                    ? "bg-gray-600 hover:bg-gray-400 text-white hover:scale-105 cursor-pointer active:scale-95"
                                : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                        >
                            {canConvert ? "PDF로 변환" : "파일을 선택해주세요"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};