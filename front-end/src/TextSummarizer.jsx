import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import * as mammoth from "mammoth";
import { saveAs } from "file-saver";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { Document, Packer, Paragraph, TextRun } from "docx";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { jsPDF } from "jspdf";

const TextSummarizer = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) {
      alert("Please enter some text to summarize.");
      return;
    }

    setLoading(true); 

    try {
      const response = await axios.post("http://127.0.0.1:5000/summarize", {
        text: text
      });

      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error calling summarization API:", error);
      alert("Failed to summarize the text. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const reader = new FileReader();
      reader.onload = (event) => {
        mammoth.extractRawText({ arrayBuffer: event.target.result })
          .then((result) => {
            setText(result.value); 
          })
          .catch((err) => {
            console.error("Error parsing DOCX file", err);
          });
      };
      reader.readAsArrayBuffer(file); 
    } else {
      alert("Please upload a valid DOCX file.");
    }
  };

    
  const handleExportPDF = () => {
    if (!summary.trim()) {
      alert("No summary available to export.");
        return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFont("Times", "Normal");
    doc.setFontSize(14);

    const marginLeft = 20;
    const lineHeight = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - marginLeft * 2;

    // Title
    doc.setFontSize(18);
    doc.text("Summary of the Document", marginLeft, 20);

    // Reset font size
    doc.setFontSize(14);

    // Break text into lines that fit the page
    const lines = doc.splitTextToSize(summary, textWidth);
    doc.text(lines, marginLeft, 30); // Start writing from y=30

    doc.save("summary.pdf");
  };
  const handleExportDOCX = async () => {
    if (!summary.trim()) {
      alert("No summary available to export.");
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Summary of the Document",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 300 },
            }),
            ...summary.split("\n").map((line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                  }),
                ],
                spacing: { after: 200 },
              })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "summary.docx");
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSummarize}
            >
              Summarize
            </Button>
          )}
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
          onChange={(e) => setSummary(e.target.value)} 
        />
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            {summary.length >0 ? summary.split(".").filter((s) => s.trim().length > 0).length : 0} sentences • {summary.length> 0 ? summary.split(" ").filter((w) => w.trim().length > 0).length: 0} words
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setOpenDialog(true)}
          >
            Export
          </Button>
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Choose export format</DialogTitle>
          <DialogContent>
            <Typography>Would you like to export as DOCX or PDF?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { handleExportDOCX(); setOpenDialog(false); }}>DOCX</Button>
            <Button onClick={() => { handleExportPDF(); setOpenDialog(false); }}>PDF</Button>
            <Button onClick={() => setOpenDialog(false)} color="error">Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TextSummarizer;