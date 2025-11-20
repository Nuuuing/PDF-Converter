"use client";

import { FileSelector, FolderSelector, ConvertContainer, PDFSettingsModal } from "@/components";
import { FileItem, PDFSettings } from "@/types";
import { useState } from "react";

export default function Home() {
  const [selectType, setSelectType] = useState<"file" | "folder">("file");

  const [fileImgs, setFileImgs] = useState<FileItem[]>([]);         //파일 선택시 사용
  const [folderImgs, setFolderImgs] = useState<FileItem[]>([]);     //폴더 선택시 사용
  const [folderName, setFolderName] = useState<string>("");

  // 설정
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    quality: 0.8
  });

  // 설정 모달
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeData = selectType === "file" ? fileImgs : folderImgs;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex border border-gray-300 justify-center items-center cursor-pointer mb-6">
        <div
          className={"hover:bg-gray-700 w-32 text-center p-2" + (selectType === "file" ? " bg-gray-700" : "")}
          onClick={() => setSelectType("file")}>파일선택</div>
        <div
          className={"hover:bg-gray-700 w-32 text-center p-2" + (selectType === "folder" ? " bg-gray-700" : "")}
          onClick={() => setSelectType("folder")}>폴더선택</div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="hover:bg-gray-700 px-4 py-2 text-center border-l border-gray-300 transition-colors cursor-pointer"
        >
          ⚙️
        </button>
      </div>
      <div className="w-full max-w-2xl flex flex-col items-center">
        {selectType === "file" &&
          <FileSelector
            data={fileImgs}
            setData={setFileImgs}
          />}

        {selectType === "folder" && (
          <FolderSelector
            data={folderImgs}
            setData={setFolderImgs}
            folderName={folderName}
            setFolderName={setFolderName}
          />
        )}
      </div>
      
      <ConvertContainer
        targetFiles={activeData}
        folderName={selectType === "folder" ? folderName : undefined}
        pdfSettings={pdfSettings}
      />

      <PDFSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={pdfSettings}
        onSettingsChange={setPdfSettings}
      />
    </div>
  );
}
