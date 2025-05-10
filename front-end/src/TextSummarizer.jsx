import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import * as mammoth from "mammoth"; // Import mammoth to handle DOCX parsing
import PizZip from "pizzip"; // For manipulating DOCX files
import Docxtemplater from "docxtemplater"; // For creating DOCX files
import { saveAs } from "file-saver"; // To save the generated DOCX file

const TextSummarizer = () => {
  const [text, setText] = useState(""); // State for input text
  const [summary, setSummary] = useState(""); // State for the summary text

  const handleSummarize = () => {
    // Hardcoded summary text for demo
    const hardcodedSummary = "Initialize Google Maps matrix data with 100 vertices and edges in Ho Chi Minh City. Implement Dijkstra, Bellman-Ford, and Floyd-Warshall algorithms, randomly select vertex pairs, output 3 shortest paths, visualize, and compare results with actual Google data.";
    setSummary(hardcodedSummary); // Set the hardcoded summary
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Parse the DOCX file using Mammoth
        mammoth.extractRawText({ arrayBuffer: event.target.result })
          .then((result) => {
            setText(result.value); // Set the extracted text
          })
          .catch((err) => {
            console.error("Error parsing DOCX file", err);
          });
      };
      reader.readAsArrayBuffer(file); // Read file as ArrayBuffer to be processed by Mammoth
    } else {
      alert("Please upload a valid DOCX file.");
    }
  };

  const handleExport = () => {
    const doc = new Docxtemplater();
    const zip = new PizZip();

    // Hardcoded summary text for DOCX export
    const hardcodedSummary = "Initialize Google Maps matrix data with 100 vertices and edges in Ho Chi Minh City. Implement Dijkstra, Bellman-Ford, and Floyd-Warshall algorithms, randomly select vertex pairs, output 3 shortest paths, visualize, and compare results with actual Google data.";

    // Add a basic DOCX structure to the document with the hardcoded summary
    const template = `
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r>
              <w:t>Summary of the Document</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:r>
              <w:t>${hardcodedSummary}</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>
    `;
    zip.file("word/document.xml", template);

    // Generate the DOCX file
    const docBuffer = zip.generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    saveAs(docBuffer, "summary.docx");
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#e3f2fd', minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 1200 }}>
        <Paper elevation={3} sx={{ p: 2, width: "48%", display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h3" align="center" gutterBottom>
            BK Text Summarizer
          </Typography>

          <TextField
            label="Enter or paste your text and press 'Summarize.'"
            multiline
            rows={10}
            variant="outlined"
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Upload
            <input type="file" hidden onChange={handleUpload} />
          </Button>

          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSummarize}
          >
            Summarize
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: "48%", ml: 2, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Summary</Typography>
          <TextField
          label="Editable Summary"
          multiline
          rows={6}
          variant="outlined"
          fullWidth
          value={summary}
          onChange={(e) => setSummary(e.target.value)} // Update summary state
        />
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            {text.split(".").filter((s) => s.trim().length > 0).length} sentences • {text.split(" ").filter((w) => w.trim().length > 0).length} words
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleExport}
          >
            Export
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default TextSummarizer;