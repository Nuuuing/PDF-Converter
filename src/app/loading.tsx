export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    로딩 중...
                </p>
            </div>
        </div>
    );
}
