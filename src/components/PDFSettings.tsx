'use client';

import { PDFSettings } from '@/types';

interface PDFSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: PDFSettings;
    onSettingsChange: (settings: PDFSettings) => void;
}

export const PDFSettingsModal = ({ isOpen, onClose, settings, onSettingsChange }: PDFSettingsModalProps) => {
    const pageSizes = [
        { value: 'A4', label: 'A4 (210 × 297mm)' },
        { value: 'A3', label: 'A3 (297 × 420mm)' },
        { value: 'A5', label: 'A5 (148 × 210mm)' },
        { value: 'Letter', label: 'Letter (8.5 × 11")' },
        { value: 'Legal', label: 'Legal (8.5 × 14")' },
    ] as const;

    const qualityOptions = [
        { value: 0.5, label: '낮음', isDefault: false },
        { value: 0.8, label: '보통', isDefault: true },
        { value: 0.9, label: '높음', isDefault: false },
        { value: 1.0, label: '최고', isDefault: false },
    ];

    const handleSettingChange = (key: keyof PDFSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        onSettingsChange(newSettings);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">옵션</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 text-2xl font-bold px-2 py-1 cursor-pointer transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-white text-sm font-medium mb-3">
                            용지 크기
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {pageSizes.map((size) => (
                                <button
                                    key={size.value}
                                    onClick={() => handleSettingChange('pageSize', size.value)}
                                    className={`text-left px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                                        settings.pageSize === size.value
                                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {size.label} {size.value === 'A4' && '(기본)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-900 dark:text-white text-sm font-medium mb-3">
                            용지 방향
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleSettingChange('orientation', 'portrait')}
                                className={`px-4 py-2 cursor-pointer transition-colors ${
                                    settings.orientation === 'portrait'
                                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                세로 (기본)
                            </button>
                            <button
                                onClick={() => handleSettingChange('orientation', 'landscape')}
                                className={`px-4 py-2 cursor-pointer transition-colors ${
                                    settings.orientation === 'landscape'
                                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                가로
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-900 dark:text-white text-sm font-medium mb-3">
                            이미지 품질
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {qualityOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSettingChange('quality', option.value)}
                                    className={`px-4 py-2 cursor-pointer transition-colors ${
                                        settings.quality === option.value
                                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {option.label} {option.isDefault && '(기본)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white px-4 py-2 cursor-pointer transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};