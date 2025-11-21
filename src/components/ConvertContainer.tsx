"use client";

import { FileItem, PDFSettings } from "@/types";
import { useState, useEffect } from "react";
import { PDFDocument } from 'pdf-lib';

// 캔버스 재사용
const sharedCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const sharedCtx = sharedCanvas?.getContext('2d');

const MAX_WIDTH = 2000;  // 해상도 제한

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
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const canConvert = targetFiles.length > 0 && !isConverting;

    useEffect(() => {
        if (isDone) {
            resetState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetFiles, pdfSettings]);

    // 메모리 정리
    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const resetState = () => {
        setIsConverting(false);
        setIsDone(false);
        setProgress(0);
        setStatusMessage("");
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const processImageFile = async (fileItem: FileItem, pdfDoc: any) => {
        let bitmap: ImageBitmap | null = null;
        
        try {
            // EXIF 방향 정보를 적용한 비트맵 생성
            bitmap = await createImageBitmap(fileItem.file, {
                imageOrientation: 'from-image',
            } as any);

            // 리사이즈 계산 (긴 변 기준)
            let targetWidth = bitmap.width;
            let targetHeight = bitmap.height;

            if (targetWidth > MAX_WIDTH) {
                const scale = MAX_WIDTH / targetWidth;
                targetWidth = Math.round(bitmap.width * scale);
                targetHeight = Math.round(bitmap.height * scale);
            }

            // 공용 캔버스 재사용
            if (!sharedCanvas || !sharedCtx) {
                throw new Error("Canvas를 사용할 수 없습니다.");
            }

            sharedCanvas.width = targetWidth;
            sharedCanvas.height = targetHeight;
            sharedCtx.clearRect(0, 0, targetWidth, targetHeight);

            sharedCtx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

            const blob: Blob | null = await new Promise((resolve) => {
                sharedCanvas!.toBlob(
                    (b) => resolve(b),
                    'image/jpeg',
                    pdfSettings.quality
                );
            });

            if (!blob) {
                throw new Error("canvas.toBlob 실패");
            }

            const jpegArrayBuffer = await blob.arrayBuffer();

            // 이미지 PDF에 삽입
            return await pdfDoc.embedJpg(jpegArrayBuffer);

        } catch (error) {
            console.error("이미지 처리 중 오류(Fallback 시도):", error);
            const arrayBuffer = await fileItem.file.arrayBuffer();
            return await pdfDoc.embedJpg(arrayBuffer);
        } finally {
            // 메모리 누수 방지
            if (bitmap) bitmap.close();
        }
    };

    const getPageDimensions = () => {
        const pageSizes: Record<string, { width: number, height: number }> = {
            'A4': { width: 595.28, height: 841.89 },
            'A3': { width: 841.89, height: 1190.55 },
            'A5': { width: 419.53, height: 595.28 },
            'Letter': { width: 612, height: 792 },
            'Legal': { width: 612, height: 1008 },
        };

        const baseSize = pageSizes[pdfSettings.pageSize] || pageSizes['A4'];
        
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

        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        page.drawImage(image, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight
        });
    };

    const triggerDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = folderName ? `${folderName}.pdf` : `images_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConvert = async () => {
        if (isConverting) return;

        resetState();
        setIsConverting(true);
        setStatusMessage("변환 준비 중...");

        try {
            const pdfDoc = await PDFDocument.create();
            const totalFiles = targetFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const fileItem = targetFiles[i];
                setStatusMessage(`${i + 1} / ${totalFiles} 장 처리 중... (${fileItem.file.name})`);

                try {
                    // 모든 이미지 캔버스 처리
                    const image = await processImageFile(fileItem, pdfDoc);
                    addImageToPage(pdfDoc, image);
                } catch (error) {
                    console.error(`이미지 실패: ${fileItem.file.name}`, error);
                }

                // 진행률 업데이트
                setProgress(Math.round(((i + 1) / totalFiles) * 100));
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            setStatusMessage("PDF 생성 중...");
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setPdfUrl(url);
            triggerDownload(url); 

            setIsConverting(false);
            setIsDone(true);

        } catch (error) {
            console.error("변환 에러:", error);
            setStatusMessage("오류가 발생했습니다.");
            setIsConverting(false);
        }
    };

    const renderContent = () => {
        if (isConverting) {
            return (
                <div className="space-y-3 animate-in fade-in">
                    <div className="flex justify-between font-medium text-sm text-gray-900 dark:text-white">
                        <span>{statusMessage}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 overflow-hidden">
                        <div
                            className="h-2.5 bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            );
        }

        if (isDone && pdfUrl) {
            return (
                <div className="flex items-center justify-between gap-4 animate-in fade-in">
                    <div className="text-sm">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓ 변환이 완료되었습니다</span>
                    </div>

                    <button
                        onClick={() => triggerDownload(pdfUrl)}
                        className="bg-green-700 hover:bg-green-800 dark:hover:bg-green-800 text-white px-6 py-3 cursor-pointer transition-colors font-bold"
                    >
                        다운로드
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between gap-4 animate-in fade-in">
                <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">대상 파일:</span>
                    <span className="ml-2 font-bold text-gray-900 dark:text-gray-200">{targetFiles.length}개</span>
                    {folderName && <span className="text-gray-500 dark:text-gray-500 ml-2">({folderName})</span>}
                </div>

                <button
                    onClick={handleConvert}
                    disabled={!canConvert}
                    className={`px-6 py-3 font-bold transition-all duration-200 ${canConvert
                        ? "bg-gray-900 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 text-white cursor-pointer"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {canConvert ? "PDF로 변환" : "파일을 선택해주세요"}
                </button>
            </div>
        );
    };

    return (
        <div className="fixed bottom-10 left-0 right-0 flex justify-center px-4 z-50">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-600 p-4 shadow-2xl w-full max-w-xl transition-all">
                {renderContent()}
            </div>
        </div>
    );
};