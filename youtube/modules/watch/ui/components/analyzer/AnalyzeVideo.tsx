"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { jsPDF } from "jspdf";

export const AnalyzeVideo = ({ videoUrl }: { videoUrl: string }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE; 

  const analyzer = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");

    try {

      const encodedUrl = encodeURIComponent(videoUrl);
      const transcriptRes = await fetch(`${API_BASE}/transcript?url=${encodedUrl}`);

      if (!transcriptRes.ok) {
        throw new Error("Failed to fetch transcript. Check if video has captions.");
      }

      const transcriptData = await transcriptRes.json();
      const rawTranscript = transcriptData.transcript; 

      const analyzeRes = await fetch(`${API_BASE}/v1/analyzer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: rawTranscript, 
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error("Failed to generate analysis.");
      }
      

      const analysisData = await analyzeRes.json();

      if (analysisData.success) {
        setAnalysis(analysisData.analysis);
      } else {
        throw new Error(analysisData.error || "Unknown error during analysis");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.setFont("helvetica", "bold");
    doc.text("Video Analysis Report", 10, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const splitText = doc.splitTextToSize(analysis, 190);

    let cursorY = 20;
    const lineHeight = 5;
    const pageHeight = 290;

    splitText.forEach((line: string) => {
      if (cursorY > pageHeight) {
        doc.addPage();
        cursorY = 10;
      }
      doc.text(line, 10, cursorY);
      cursorY += lineHeight;
    });

    doc.save("analysis_report.pdf");
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">

      <div className="flex gap-2">
        <button
          onClick={analyzer}
          disabled={loading}
          className="bg-black text-blue-50 cursor-pointer px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition-all flex-1"
        >
          {loading ? "Analyzing Video..." : "Analyze Video"}
        </button>

        {analysis && !loading && (
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white cursor-pointer px-4 py-2 rounded hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download PDF
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {analysis && (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex-1 overflow-y-auto max-h-[600px]">
          <div className="flex justify-between items-center border-b pb-2 mb-3">
             <h3 className="font-bold text-lg">AI Analysis</h3>
          </div>

          <div className="prose prose-sm max-w-none text-gray-800">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}

    </div>
  );
};