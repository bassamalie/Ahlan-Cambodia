import React, { useRef, useEffect, useState } from "react";
import { uploadToFirebaseStorage } from "../firebase";
import { 
  Bold, Italic, Underline, Quote, 
  List, ListOrdered, Link, Image, Code, Eye, RemoveFormatting,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Write your story here..." }: RichTextEditorProps) {
  const [isVisual, setIsVisual] = useState(true);
  const [photoAlignment, setPhotoAlignment] = useState<"left" | "float-left" | "center" | "right">("left");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal editor HTML with external value when tab switches or on mount
  useEffect(() => {
    if (editorRef.current && isVisual) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || `<p><br></p>`;
      }
    }
  }, [isVisual, value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html !== value) {
        onChange(html);
      }
    }
  };

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    if (!isVisual) return;
    focusEditor();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleFormatBlock = (tag: string) => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  const handleInsertLink = () => {
    const url = window.prompt("Enter the absolute hyperlink URL (e.g., https://...):");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleInsertImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        try {
          const url = await uploadToFirebaseStorage(file);
          
          let imgStyle = "";
          let imgClass = "rounded-2xl border border-slate-200/80 shadow-md max-h-[420px] w-auto hover:scale-[1.01] transition-transform duration-300 ";

          if (photoAlignment === "left") {
            imgClass += "img-align-left block my-4 ml-0 mr-auto";
            imgStyle = "display: block; margin-left: 0; margin-right: auto; float: none; clear: both;";
          } else if (photoAlignment === "float-left") {
            imgClass += "img-float-left float-left mr-6 mb-4 my-2 max-w-[50%]";
            imgStyle = "float: left; margin-right: 1.5rem; margin-bottom: 1rem; margin-left: 0;";
          } else if (photoAlignment === "center") {
            imgClass += "img-align-center block my-6 mx-auto";
            imgStyle = "display: block; margin-left: auto; margin-right: auto; float: none; clear: both;";
          } else if (photoAlignment === "right") {
            imgClass += "img-align-right block my-4 ml-auto mr-0";
            imgStyle = "display: block; margin-left: auto; margin-right: 0; float: none; clear: both;";
          }

          const imgHtml = `<img src="${url}" alt="Article Graphic" class="${imgClass}" style="${imgStyle}" /><p><br></p>`;
          executeCommand("insertHTML", imgHtml);
        } catch (err: any) {
          console.error("Firebase rich text editor upload failed", err);
          alert("Failed to upload image. Please try again.");
        }
      }
    }
    e.target.value = "";
  };

  return (
    <div className="w-full border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col focus-within:border-brand-blue-accent transition-colors">
      
      {/* Editor Toolbar */}
      <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          {/* Format Blocks */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFormatBlock("h2")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors font-mono text-[10px] font-bold uppercase cursor-pointer"
            title="Heading 2 (H2)"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFormatBlock("h3")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors font-mono text-[10px] font-bold uppercase cursor-pointer"
            title="Heading 3 (H3)"
          >
            H3
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFormatBlock("p")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors font-mono text-[10px] font-bold uppercase cursor-pointer"
            title="Paragraph"
          >
            Para
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          {/* Bold, Italic, Underline */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("bold")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("italic")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("underline")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("justifyLeft")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Align Text Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("justifyCenter")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Align Text Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("justifyRight")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Align Text Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("insertUnorderedList")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer bg-slate-100 border border-slate-200/70"
            title="Bulleted List (Bulletin)"
          >
            <List className="w-4 h-4 text-brand-blue-accent" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("insertOrderedList")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer bg-slate-100 border border-slate-200/70"
            title="Numbered List (Number One)"
          >
            <ListOrdered className="w-4 h-4 text-brand-blue-accent" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFormatBlock("blockquote")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          {/* Inserts */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertLink}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer"
            title="Insert Hyperlink"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertImage}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-brand-blue-accent hover:bg-brand-blue-accent/10 transition-colors cursor-pointer font-semibold flex items-center gap-1"
            title="Upload Photo to Content"
          >
            <Image className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold uppercase">Upload Photo</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("removeFormat")}
            disabled={!isVisual}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer ml-1"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* View Toggle (Visual vs Code) */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-100 shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsVisual(true)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isVisual 
                ? "bg-white text-[#0F1626] shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visual
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsVisual(false)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              !isVisual 
                ? "bg-white text-[#0F1626] shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            HTML Code
          </button>
        </div>
      </div>

      {/* Photo Alignment Preset Toolbar Bar */}
      {isVisual && (
        <div className="bg-slate-100/80 border-b border-slate-200/60 px-3 py-1.5 flex items-center justify-between text-xs gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Image className="w-3.5 h-3.5 text-brand-blue-accent" />
            Photo Alignment for New Uploads:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPhotoAlignment("left")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                photoAlignment === "left"
                  ? "bg-brand-blue-accent text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              ⬅️ Utmost Left
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPhotoAlignment("float-left")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                photoAlignment === "float-left"
                  ? "bg-brand-blue-accent text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              ↖️ Float Left (Text Wraps)
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPhotoAlignment("center")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                photoAlignment === "center"
                  ? "bg-brand-blue-accent text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              ↔️ Center
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPhotoAlignment("right")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                photoAlignment === "right"
                  ? "bg-brand-blue-accent text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              ➡️ Right
            </button>
          </div>
        </div>
      )}

      {/* Editor Content Box */}
      <div className="flex-1 min-h-[300px] flex flex-col relative">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden" 
        />
        {isVisual ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="flex-1 w-full p-4 text-slate-800 outline-none overflow-y-auto max-h-[500px] text-sm font-sans leading-relaxed text-left prose max-w-none focus:outline-none blog-content-body"
            style={{ minHeight: "300px" }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write raw HTML content..."
            className="flex-1 w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 outline-none border-none resize-none min-h-[300px] leading-relaxed"
          />
        )}
        
        {/* Placeholder helper for visual editor */}
        {isVisual && (!value || value === "<p><br></p>") && (
          <div className="absolute top-4 left-4 text-slate-400 text-sm pointer-events-none italic">
            {placeholder}
          </div>
        )}
      </div>

    </div>
  );
}

