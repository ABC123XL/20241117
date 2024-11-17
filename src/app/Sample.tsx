"use client";

import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import enlargeIcon from "./assets/enlarge.svg";
import shrinkIcon from "./assets/shrink.svg";
import rotateIcon from "./assets/rotate.svg";
import Image from "next/image";

import "./Sample.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

export default function Sample({
  file,
  onRemoveFile,
}: {
  file?: File;
  onRemoveFile: () => void;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [pageRotations, setPageRotations] = useState<number[]>([]);
  // 存储初始时每一页PDF的宽和高
  const [pageSizes, setPageSizes] = useState<
    { width: number; height: number }[]
  >([]);
  // 缩放比
  const [scale, setScale] = useState<number>(1);
  const [canZoomIn, setCanZoomIn] = useState<boolean>(true);
  const [canZoomOut, setCanZoomOut] = useState<boolean>(true);

  function onDocumentLoadSuccess(sucRes: PDFDocumentProxy): void {
    setNumPages(sucRes.numPages);
    const sizes: { width: number; height: number }[] = [];

    // 获取每一页的宽度和高度
    for (let i = 1; i <= sucRes.numPages; i++) {
      sucRes.getPage(i).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        sizes.push({
          width: viewport.width / 5,
          height: viewport.height / 5,
        });

        // 当所有页面都加载完成后，更新状态
        if (sizes.length === sucRes.numPages) {
          setPageSizes(sizes);
        }
      });
    }
  }

  async function downloadRotatedPDF() {
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        page.setRotation(
          degrees(page.getRotation().angle + pageRotations[index] || 0)
        );
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.log("file error");
    }
  }

  function rotateAll() {
    setPageRotations((prevRotations) => {
      const newRotations = Array(numPages)
        .fill(0)
        .map((rotation, index) => {
          return (prevRotations[index] || 0) + 90;
        });
      return newRotations;
    });
  }

  function rotatePage(index: number) {
    setPageRotations((prevRotations) => {
      const newRotations = [...prevRotations];
      const _rotate = (newRotations[index] || 0) + 90;
      newRotations[index] = _rotate;
      console.log(newRotations[index]);
      return newRotations;
    });
  }

  function removePDF() {
    onRemoveFile();
  }

  function enlargePDF() {
    setScale((prevScale) => {
      const newScale = prevScale + 0.5;
      // 更新缩放状态
      setCanZoomOut(true); // 允许缩小
      // 检查是否达到最大缩放限制
      if (newScale >= 3) {
        setCanZoomIn(false); // 不允许继续放大
      }
      return newScale; // 返回新的缩放值
    });
  }

  function shrinkPDF() {
    setScale((prevScale) => {
      const newScale = prevScale - 0.5;
      // 更新缩放状态
      setCanZoomIn(true); // 允许放大
      // 检查是否达到最小缩放限制
      if (newScale <= 0.5) {
        setCanZoomOut(false); // 不允许继续缩小
      }
      return newScale; // 返回新的缩放值
    });
  }

  return (
    <div className="Example">
      <div className="Example__container">
        <div className="operate-btn-box">
          <button
            className="rotate-all rotate-all-color  operate-btn-cursor"
            onClick={rotateAll}
          >
            Rotate all
          </button>
          <button
            className="remove-pdf remove-pdf-color operate-btn-cursor"
            onClick={removePDF}
          >
            Remove PDF
          </button>
          <div
            className="operate-btn-cursor scale-icon"
            title="Zoom in"
            onClick={canZoomIn ? enlargePDF : undefined} // 只有在可以放大的时候才允许点击
            style={{ opacity: canZoomIn ? 1 : 0.5 }} // 根据状态设置透明度
          >
            <Image
              src={enlargeIcon}
              alt="enlarge Icon"
              width={20}
              height={20}
              style={{ filter: canZoomIn ? "none" : "grayscale(100%)" }} // 根据状态设置颜色
            />
          </div>
          <div
            className="operate-btn-cursor scale-icon"
            title="Zoom out"
            onClick={canZoomOut ? shrinkPDF : undefined} // 只有在可以缩小的时候才允许点击
            style={{ opacity: canZoomOut ? 1 : 0.5 }} // 根据状态设置透明度
          >
            <Image
              src={shrinkIcon}
              alt="shrink Icon"
              width={20}
              height={20}
              style={{ filter: canZoomOut ? "none" : "grayscale(100%)" }} // 根据状态设置颜色
            />
          </div>
        </div>
        <div className="Example__container__document">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (_el, index) => (
              <div
                className="page-item"
                style={{
                  width: pageSizes[index]?.width * scale, // 使用获取的宽度，默认值为200
                  height: pageSizes[index]?.height * scale + 10, // 使用获取的高度，默认值为290
                  transition: "transform 0.2s ease",
                }}
                key={`page_${index + 1}`}
              >
                <div className="page-rotate" onClick={() => rotatePage(index)}>
                  <Image
                    src={rotateIcon}
                    alt="rotate Icon"
                    width={10}
                    height={10}
                  />
                </div>
                <div
                  style={{
                    transform: `rotate(${pageRotations[index] || 0}deg)`, // 设置旋转角度
                    transition: "transform 0.2s ease",
                  }}
                >
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={pageSizes[index]?.width * scale} // 使用获取的宽度
                    height={pageSizes[index]?.height * scale} // 使用获取的高度
                    renderMode="canvas"
                    onClick={() => rotatePage(index)}
                  />
                </div>
                <div className="page-index">{index + 1}</div>
              </div>
            ))}
          </Document>
        </div>
        <div className="download-btn-box">
          <button
            className="rotate-all rotate-all-color  operate-btn-cursor"
            onClick={downloadRotatedPDF}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
