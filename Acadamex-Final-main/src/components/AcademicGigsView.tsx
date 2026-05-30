import React, { useState, useEffect, FormEvent, useRef } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Briefcase, 
  Phone, 
  Mail, 
  DollarSign, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  User as UserIcon, 
  ExternalLink,
  Info,
  Camera,
  FileText,
  Eye,
  Lock,
  Download,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "./FirebaseProvider";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { COLLEGES } from "../constants/academicData";
import { AcademicGig, AcademicGigAttachment } from "../types";

export function AcademicGigsView({
  userColleges = {},
  onOpenChat,
}: {
  userColleges?: Record<string, string>;
  onOpenChat?: (code: string, title: string) => void;
}) {
  const { db, user } = useFirebase();
  const [gigs, setGigs] = useState<AcademicGig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [retractConfirmId, setRetractConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [workType, setWorkType] = useState<AcademicGig["workType"] | "">("");
  const [description, setDescription] = useState("");
  const [payout, setPayout] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Attachments State
  const [photos, setPhotos] = useState<{ name: string; dataUrl: string; size: number }[]>([]);
  const [pdfs, setPdfs] = useState<{ name: string; dataUrl: string; size: number }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Active Preview State for Dialogs
  const [previewAttachment, setPreviewAttachment] = useState<AcademicGigAttachment | null>(null);

  // Filters
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'available', 'assigned', 'completed'
  const [filterWorkType, setFilterWorkType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'payout_desc'

  const isAdmin = user?.email === "237tanishaqverma@gmail.com";

  // Load Gigs
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "academic_gigs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AcademicGig[];
        setGigs(list);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading academic gigs:", error);
        setIsLoading(false);
      }
    );
    return unsub;
  }, [db]);

  // Set default college on mount & enforce user's college (fixed)
  useEffect(() => {
    if (user && userColleges[user.uid]) {
      setCollegeId(userColleges[user.uid]);
    } else {
      setCollegeId("mait"); // Fallback default
    }
  }, [user, userColleges, showForm]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (retractConfirmId !== id) {
      setRetractConfirmId(id);
      return;
    }
    try {
      await deleteDoc(doc(db, "academic_gigs", id));
      setRetractConfirmId(null);
    } catch (err) {
      console.error("Failed to delete gig:", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "available" | "assigned" | "completed") => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "academic_gigs", id), {
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update gig status:", err);
    }
  };

  // Compress image client-side to keep under Firestore's 1MB limit
  const compressImage = (file: File): Promise<{ dataUrl: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is unavailable"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export with high compression (0.5 quality jpeg) for ultimate database lightness
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          
          // Estimate base64 size back to approximate raw bytes
          const approximateSize = Math.round((dataUrl.length - 22) * 3 / 4);
          
          resolve({ dataUrl, size: approximateSize });
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Convert File object helper to Base64 (used for PDFs)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files) as File[];

    if (photos.length + filesArray.length > 5) {
      setErrorMsg("Security threshold breached: Maximum of 5 photos is permitted.");
      return;
    }

    setErrorMsg("");

    for (const file of filesArray) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Attachment rejection: Only image files are permitted in the photo bay.");
        return;
      }
      try {
        const compressed = await compressImage(file);
        setPhotos((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl: compressed.dataUrl,
            size: compressed.size,
          }
        ]);
      } catch (err) {
        console.error("Error reading content:", err);
        setErrorMsg("Error parsing and compressing attachment files.");
      }
    }
  };

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files) as File[];

    if (pdfs.length + filesArray.length > 5) {
      setErrorMsg("Security threshold breached: Maximum of 5 PDF files is permitted.");
      return;
    }

    setErrorMsg("");

    const MAX_PDF_SIZE = 150 * 1024; // Strict limit to prevent Firestore 1MB breaches

    for (const file of filesArray) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMsg("Attachment rejection: Only valid PDF documents are allowed in the doc bay.");
        return;
      }

      if (file.size > MAX_PDF_SIZE) {
        setErrorMsg(`Rejection: PDF file "${file.name}" is too large (${Math.round(file.size / 1024)} KB). To comply with storage space budgets, each PDF file must be smaller than 150 KB. Please compress your PDF file online or take high-quality compressed pictures instead!`);
        return;
      }

      try {
        const base64Str = await fileToBase64(file);
        setPdfs((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl: base64Str,
            size: file.size,
          }
        ]);
      } catch (err) {
        console.error("Error reading content:", err);
        setErrorMsg("Error parsing attachment files.");
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removePdf = (index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    // 1. Mandatory Field checks
    if (!title.trim() || !subject.trim() || !description.trim() || !payout.trim()) {
      setErrorMsg("Mandatory fields are missing: Title, Subject, Description & Compensation are compulsory.");
      return;
    }

    if (!workType) {
      setErrorMsg("Mandatory input missing: Please select a valid task category type (Assignment, EG Sheet, etc.)");
      return;
    }

    const payoutNum = parseFloat(payout);
    if (isNaN(payoutNum) || payoutNum < 0) {
      setErrorMsg("Invalid compensation value: Please state a valid numerical layout payout.");
      return;
    }

    // 2. Dual-track Attachment Rules Constraint
    // Must have matching options:
    // EITHER: minimum 2 photos AND up to 5 photos
    // OR: minimum 1 PDF document AND up to 5 PDFs
    const meetsPhotosRule = photos.length >= 2 && photos.length <= 5;
    const meetsPdfsRule = pdfs.length >= 1 && pdfs.length <= 5;

    if (!meetsPhotosRule && !meetsPdfsRule) {
      setErrorMsg(
        `Form validation rejected: You must attach EITHER a minimum of 2 photos (upto 5 photos max) OR at least 1 PDF document (upto 5 files max) to make a live post.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Package attachments
    const packagedAttachments: AcademicGigAttachment[] = [
      ...photos.map(p => ({
        name: p.name,
        type: "image" as const,
        size: p.size,
        dataUrl: p.dataUrl,
      })),
      ...pdfs.map(docFile => ({
        name: docFile.name,
        type: "pdf" as const,
        size: docFile.size,
        dataUrl: docFile.dataUrl,
      }))
    ];

    try {
      await addDoc(collection(db, "academic_gigs"), {
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0].toUpperCase() || "STUDENT_NODE",
        userEmail: user.email,
        title: title.trim(),
        subject: subject.trim().toUpperCase(),
        description: description.trim(),
        payout: payoutNum,
        collegeId: collegeId, // Locked college ID computed from user profile state
        status: "available",
        workType: workType,
        contactInfo: contactInfo.trim(),
        contactPhone: contactPhone.trim(),
        attachments: packagedAttachments,
        createdAt: Date.now(),
      });

      setSuccessMsg("Academic Gig has been successfully certified and listed on the Work Board!");
      setTitle("");
      setSubject("");
      setDescription("");
      setPayout("");
      setWorkType("");
      setContactInfo("");
      setContactPhone("");
      setPhotos([]);
      setPdfs([]);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to publish assignment gig.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Gigs
  const filteredGigs = gigs.filter((g) => {
    const matchesStatus = filterStatus === "all" || g.status === filterStatus;
    const matchesCollege = filterCollege === "all" || g.collegeId === filterCollege;
    const matchesWorkType = filterWorkType === "all" || g.workType === filterWorkType;
    
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      g.title.toLowerCase().includes(queryLower) ||
      g.subject.toLowerCase().includes(queryLower) ||
      g.description.toLowerCase().includes(queryLower) ||
      g.userName.toLowerCase().includes(queryLower) ||
      (g.workType && g.workType.toLowerCase().includes(queryLower));

    return matchesStatus && matchesCollege && matchesWorkType && matchesSearch;
  });

  // Sort Gigs
  const sortedGigs = [...filteredGigs].sort((a, b) => {
    if (sortBy === "payout_desc") {
      return b.payout - a.payout;
    }
    return b.createdAt - a.createdAt; // default newest
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider font-mono bg-emerald-950/30 text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        );
      case "assigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider font-mono bg-amber-950/30 text-amber-500 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Assigned
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider font-mono bg-zinc-900 text-zinc-500 border border-zinc-800">
            <Check size={10} />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case "assignment":
        return "Assignment";
      case "eg_sheet":
        return "Engineering Graphics (EG) Sheet";
      case "cad_layout":
        return "CAD Layout Drawing";
      case "written_files":
        return "Written File/Lab Journals";
      case "others":
        return "Other Study Task";
      default:
        return "Academic Work";
    }
  };

  const activeUserCollegeId = user ? userColleges[user.uid] : null;
  const activeUserCollegeName = activeUserCollegeId ? COLLEGES[activeUserCollegeId]?.name : null;

  return (
    <div className="space-y-12 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div className="max-w-2xl">
          <div className="mono-label mb-4 text-[#8B5CF6]">
            ACADAMEX SYNDICATE WORK BOARD
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none flex flex-wrap items-center gap-3">
            Assignment <span className="text-[#8B5CF6]">Gigs.</span>
          </h1>
          <p className="text-zinc-400 mt-6 text-base font-light leading-relaxed">
            Stuck on complex physics drawing sheets, chemistry lab files, or lengthy business math assignments?
            Post a assignment commission, state your total payout offer, attach source questions or drawings, and get solved papers in return. Use peer syndicates to get written papers!
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              // Force reset attachment errors when opening
              setErrorMsg("");
              setPhotos([]);
              setPdfs([]);
            }}
            className="vantage-btn-primary px-8 py-4 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-[#8B5CF6] hover:text-white border border-white flex items-center justify-center gap-2 shrink-0 self-start md:self-end transition-all duration-300"
          >
            <Plus size={14} /> Create Assignment Gig
          </button>
        )}
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#050505] border border-zinc-800 p-5 font-mono">
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest">// ACTIVE COMMISSION GIGS</div>
          <div className="text-2xl font-black text-white mt-1">
            {gigs.filter(g => g.status === "available").length}
          </div>
        </div>
        <div className="bg-[#050505] border border-zinc-800 p-5 font-mono">
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest">// ALREADY ASSIGNED OUT</div>
          <div className="text-2xl font-black text-[#8B5CF6] mt-1">
            {gigs.filter(g => g.status === "assigned").length}
          </div>
        </div>
        <div className="bg-[#050505] border border-zinc-800 p-5 font-mono">
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest">// COMPLETED SYSTEM VERIFIED</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {gigs.filter(g => g.status === "completed").length}
          </div>
        </div>
        <div className="bg-[#050505] border border-zinc-800 p-5 font-mono">
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest">// MAX TOTAL PAYOUT OFFER</div>
          <div className="text-2xl font-black text-white mt-1">
            ₹{gigs.length > 0 ? Math.max(...gigs.map(g => g.payout)) : 0}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase">
          SUCCESS_PROTOCOL: {successMsg}
        </div>
      )}

      {/* Post Gig Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-950 border border-[#8B5CF6]/30 p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B5CF6] flex items-center gap-2">
                <Lock size={12} /> // CONFIGURE SECURE ASSIGNMENT HELP GIG
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMsg("");
                }}
                className="text-zinc-500 hover:text-white text-[10px] font-mono uppercase border border-zinc-800 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                [Cancel]
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono whitespace-pre-line uppercase select-none">
                  VALIDATION_ERROR: {errorMsg}
                </div>
              )}

              {/* Step Info Banner */}
              <div className="p-4 bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-[11px] font-sans flex items-start gap-2.5">
                <Info size={14} className="text-[#8B5CF6] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block mb-0.5 uppercase tracking-wide">Dynamic Security Regulations & Data File Limits:</span>
                  To ensure complete accountability, college network listings are locked to your home college. Furthermore, it is compulsory to attach files within standard storage budgets:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-350">
                    <li>
                      <strong className="text-white">Photos Bay (Data limit: compressed under 1MB per image):</strong> Attach a <strong className="text-white">minimum of 2 photos and up to 5</strong> (e.g. question papers, drafts). Images will be automatically optimized to prevent storage overload.
                    </li>
                    <li>
                      <strong className="text-white">PDF Document Bay (Data limit: strictly under 150 KB per file):</strong> Upload a <strong className="text-white">minimum of 1 PDF file and up to 5 max</strong> (e.g. assignment PDFs, references).
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                    Task/Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Engineering Graphics Sheet 4 (CAD Layout)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3 uppercase font-mono focus:outline-none focus:border-[#8B5CF6] rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Chemistry Lab Journal or Engineering Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3 uppercase font-mono focus:outline-none focus:border-[#8B5CF6] rounded-none"
                  />
                </div>

                {/* TASK TYPE / CATEGORY - Now compulsory */}
                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                    Assignment Category Category Type * (Compulsory)
                  </label>
                  <select
                    required
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3 uppercase font-mono focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
                  >
                    <option value="">-- SELECT REQUIRED TASK TYPE --</option>
                    <option value="assignment">Assignment Completion</option>
                    <option value="eg_sheet">Engineering Graphics (EG) Sheet</option>
                    <option value="cad_layout">CAD Layout Drawing</option>
                    <option value="written_files">Lab Files & Written Work</option>
                    <option value="others">Other Academic Task</option>
                  </select>
                </div>

                {/* TARGET COLLEGE - Locked, user cannot select or change other colleges */}
                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2 flex items-center gap-1.5">
                    Locked Target College <Lock size={10} className="text-zinc-500" />
                  </label>
                  <div className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-4 py-3 font-mono font-bold uppercase tracking-wider flex items-center justify-between select-none">
                    <span>{activeUserCollegeName || COLLEGES[collegeId]?.name || "GUEST ACADEMIC DIVISION"}</span>
                    <span className="text-[9px] bg-zinc-950 px-2 py-0.5 border border-zinc-800 text-[#8B5CF6] font-black italic">CLOSED</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 italic mt-1 block uppercase">
                    🔒 Campus system protection: You can only publish within your verified network.
                  </span>
                </div>

                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                    Total Payout Offer (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 500"
                    value={payout}
                    onChange={(e) => setPayout(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3 uppercase font-mono focus:outline-none focus:border-[#8B5CF6] rounded-none"
                  />
                  <span className="text-[9px] font-mono text-zinc-500 mt-1 block uppercase">
                    Provide the final, guaranteed total payout offer for this complete mission.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                  Detailed Mission Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify exactly what needs to be solved / drawn. e.g. 'I need sheet 4 completed. All projections must be drawn on standard cartridge sheets. Will hand over empty sheet on campus. Deadline is Tuesday morning.'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-4 font-sans focus:outline-none focus:border-[#8B5CF6] rounded-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950 p-6 border border-zinc-900/60">
                <div>
                  <label className="block text-[8px] mono-label text-zinc-450 uppercase mb-2">
                    Contact Handle / Social Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., INSTAGRAM: @STUDENT or DISCORD: USER#1337"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3 font-mono focus:outline-none focus:border-[#8B5CF6] rounded-none uppercase"
                  />
                  <span className="text-[8px] font-mono text-zinc-500 mt-1 block uppercase">
                    Provide a Telegram, Instagram, Discord, or campus alias for direct messaging.
                  </span>
                </div>

                <div>
                  <label className="block text-[8px] mono-label text-zinc-450 uppercase mb-2">
                    Contact Phone/WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 9999988888"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3 font-mono focus:outline-none focus:border-[#8B5CF6] rounded-none uppercase"
                  />
                  <span className="text-[8px] font-mono text-zinc-500 mt-1 block uppercase">
                    Enter numbers only (with country code if outside India) for a click-to-WhatsApp link.
                  </span>
                </div>
              </div>

              {/* COMPULSORY ATTACHMENTS PORTAL */}
              <div className="border border-zinc-800 bg-[#050505] p-6 space-y-6">
                <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-[#8B5CF6] uppercase font-black tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> COMPULSORY SOURCE ATTACHMENT TRACKER
                  </div>
                  <span className="text-[8px] text-zinc-500 font-mono uppercase">
                    EITHER 2-5 PHOTOS OR 1-5 PDF FILES
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo attachment bay */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Camera size={13} className="text-indigo-400" /> Photo Bay ({photos.length} / 5)
                    </span>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase">
                      Rule checklist: Min 2, max 5 pictures. Limit: Auto-compressed under 1MB total.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative group w-16 h-16 border border-zinc-800 bg-zinc-950">
                          <img 
                            src={p.dataUrl} 
                            alt={`Preview ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-1 -right-1 bg-red-650 hover:bg-red-650 text-white p-0.5 rounded-none"
                            title="Remove Photo"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}

                      {photos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-16 h-16 border border-dashed border-zinc-800 hover:border-[#8B5CF6] bg-zinc-950/40 flex flex-col items-center justify-center text-zinc-500 hover:text-white transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                          <span className="text-[8px] font-mono uppercase mt-1">ADD PIC</span>
                        </button>
                      )}
                    </div>

                    <input 
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>

                  {/* PDF Document bay */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={13} className="text-emerald-400" /> PDF Document Bay ({pdfs.length} / 5)
                    </span>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase">
                      Rule checklist: Min 1, max 5 PDFs. Limit: Strictly under 150 KB per file.
                    </p>

                    <div className="space-y-2">
                      {pdfs.map((docFile, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-zinc-950 px-3 py-2 border border-zinc-800 text-[10px] font-mono">
                          <span className="truncate max-w-[180px] text-zinc-300 uppercase shrink-0">
                            📄 {docFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePdf(idx)}
                            className="text-red-500 hover:text-red-400 p-0.5 cursor-pointer ml-2"
                            title="Remove Document"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {pdfs.length < 5 && (
                        <button
                          type="button"
                          onClick={() => pdfInputRef.current?.click()}
                          className="w-full border border-dashed border-zinc-800 hover:border-[#8B5CF6] bg-zinc-950/40 py-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all cursor-pointer text-[10px] font-mono uppercase font-black"
                        >
                          <Plus size={12} /> Upload PDF Documentation
                        </button>
                      )}
                    </div>

                    <input 
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfSelect}
                      accept="application/pdf"
                      multiple
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Reactive Verification indicator */}
                <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono">
                  <span>Photo check: {photos.length >= 2 && photos.length <= 5 ? "✅ COMPLIANT (2-5)" : "❌ NON-COMPLIANT"}</span>
                  <span>PDF check: {pdfs.length >= 1 && pdfs.length <= 5 ? "✅ COMPLIANT (1-5)" : "❌ NON-COMPLIANT"}</span>
                  <span className={`px-2 py-0.5 border font-black ${
                    (photos.length >= 2 && photos.length <= 5) || (pdfs.length >= 1 && pdfs.length <= 5)
                      ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20"
                      : "bg-red-950/20 text-red-400 border-red-500/20"
                  }`}>
                    {(photos.length >= 2 && photos.length <= 5) || (pdfs.length >= 1 && pdfs.length <= 5) 
                      ? "STATUS: MEETS ATTACHMENT MANDATE" 
                      : "STATUS: ATTACHMENTS REJECTED"
                    }
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-zinc-800 text-zinc-400 text-[10px] font-mono uppercase hover:text-white hover:border-zinc-700 rounded-none cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="vantage-btn-primary px-8 py-3 bg-[#8B5CF6] text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black border border-[#8B5CF6] transition-all rounded-none cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? "Deploying..." : "Launch Gig"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog Search & Filters */}
      <div className="bg-[#050505] border border-zinc-800 p-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search assignments, CAD sheets, files, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* WorkType/Category Selector */}
          <select
            value={filterWorkType}
            onChange={(e) => setFilterWorkType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2.5 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
          >
            <option value="all">All Category Types</option>
            <option value="assignment">Assignment Completion</option>
            <option value="eg_sheet">EG Drawing Sheets</option>
            <option value="cad_layout">CAD Layout Drawings</option>
            <option value="written_files">Lab Files / Written Work</option>
            <option value="others">Other Studies</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2.5 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterCollege}
            onChange={(e) => setFilterCollege(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2.5 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
          >
            <option value="all">All Colleges</option>
            {Object.entries(COLLEGES).map(([id, col]: any) => (
              <option key={id} value={id}>{col.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2.5 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="payout_desc">Highest Payout</option>
          </select>
        </div>
      </div>

      {/* Listings Count & Clear option */}
      <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center bg-zinc-950/20 px-2 py-1 leading-none">
        <span>Showing {sortedGigs.length} of {gigs.length} listed gigs</span>
        {searchQuery || filterStatus !== "all" || filterCollege !== "all" || filterWorkType !== "all" ? (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
              setFilterCollege("all");
              setFilterWorkType("all");
            }}
            className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider cursor-pointer"
          >
            Clear Active Filters
          </button>
        ) : null}
      </div>

      {/* Empty State */}
      {isLoading ? (
        <div className="text-center py-20 font-mono text-zinc-500 uppercase tracking-widest text-xs">
          Loading synchronized syndicates help board...
        </div>
      ) : sortedGigs.length === 0 ? (
        <div className="border border-zinc-800 bg-[#050505] text-center py-20">
          <BookOpen className="mx-auto text-zinc-600 mb-4" size={32} />
          <p className="mono-label opacity-40 italic text-zinc-400">
            No matching academic gig tasks found.
          </p>
          <p className="text-zinc-600 text-[10px] uppercase font-mono mt-2">
            Perfect! Go ahead and be the first to post an assignment gig task on the board.
          </p>
        </div>
      ) : (
        /* Gigs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedGigs.map((item) => {
            const isOwner = user?.uid === item.userId;
            const colName = COLLEGES[item.collegeId]?.name.split(" ")[0] || item.collegeId || "GUEST";
            const attachmentList = item.attachments || [];
            const photoAttachs = attachmentList.filter(a => a.type === "image");
            const pdfAttachs = attachmentList.filter(a => a.type === "pdf");

            return (
              <div 
                key={item.id}
                className="bg-[#050505] border border-zinc-800 hover:border-zinc-700 p-6 flex flex-col justify-between space-y-6 transition-all duration-350 hover:-translate-y-1"
              >
                {/* Badge Row & Price */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(item.status)}
                      <span className="px-2 py-0.5 text-[9px] font-bold font-mono bg-zinc-950 text-[#8B5CF6] border border-[#8B5CF6]/20 uppercase">
                        {colName}
                      </span>
                    </div>
                    {/* Task type status badge */}
                    <div className="mt-1 text-[9px] text-[#8B5CF6] font-mono tracking-widest uppercase font-black">
                      ❖ {getWorkTypeLabel(item.workType)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase font-black tracking-widest">TOTAL PAYOUT OFFER</div>
                    <div className="text-2xl font-black text-white italic tracking-tighter">
                      ₹{item.payout}
                    </div>
                  </div>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs text-zinc-500 font-mono uppercase mt-1">
                    Subject // <span className="text-zinc-300 font-bold">{item.subject}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-zinc-300 text-xs font-sans leading-relaxed select-text bg-zinc-950/40 p-3 border border-zinc-900 whitespace-pre-line max-h-36 overflow-y-auto">
                  {item.description}
                </div>

                {/* Attached sources (Interactive previews) */}
                {attachmentList.length > 0 && (
                  <div className="p-3 border border-zinc-900 bg-zinc-950/40 space-y-3">
                    <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                      // GIG SOURCE ATTACHMENTS ({attachmentList.length})
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {photoAttachs.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setPreviewAttachment(img)}
                          className="relative group w-12 h-12 border border-zinc-850 cursor-zoom-in bg-black overflow-hidden hover:border-[#8B5CF6] transition-all"
                          title="Preview full verification photo"
                        >
                          <img 
                            src={img.dataUrl} 
                            alt={img.name} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <Eye size={12} className="text-white" />
                          </div>
                        </div>
                      ))}

                      {pdfAttachs.map((pdf, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setPreviewAttachment(pdf)}
                          className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 hover:bg-[#8B5CF6]/10 border border-zinc-800 hover:border-[#8B5CF6]/30 text-emerald-400 text-[9px] font-mono uppercase cursor-pointer transition-all"
                          title="Click to view PDF description details"
                        >
                          <FileText size={11} /> 
                          <span className="truncate max-w-[100px]">{pdf.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info and Contact row */}
                <div className="border-t border-zinc-900 pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">PROJECT LEAD</div>
                      <div className="text-[10px] text-zinc-350 font-mono font-bold uppercase truncate max-w-[200px]">
                        {item.userName}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 text-right">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Contact options with direct info and Secure Chat option */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-900/60 flex flex-col gap-3 rounded-none">
                    <div className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1.5 justify-between">
                      <div className="flex items-center gap-1">
                        <Phone size={10} className="text-[#8B5CF6]" /> Contact Details Matrix
                      </div>
                      <span className="text-[7px] text-zinc-500 font-bold">SECURE CHANNEL STATUS: DETECTED</span>
                    </div>

                    <div className="space-y-2 font-mono text-[10px]">
                      {item.contactInfo ? (
                        <div className="flex items-center justify-between text-zinc-350">
                          <span className="text-zinc-500 uppercase text-[9px]">Handle/Social ID:</span>
                          <span className="font-bold uppercase tracking-wide select-all text-white bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                            {item.contactInfo}
                          </span>
                        </div>
                      ) : null}

                      {item.contactPhone ? (
                        <div className="flex items-center justify-between text-zinc-350">
                          <span className="text-zinc-500 uppercase text-[9px]">WhatsApp Direct:</span>
                          <a 
                            href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, "")}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="font-bold underline text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            {item.contactPhone} <ExternalLink size={8} />
                          </a>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between text-zinc-350">
                        <span className="text-zinc-500 uppercase text-[9px]">Lead operator Email:</span>
                        <a 
                          href={`mailto:${item.userEmail}`} 
                          className="font-bold text-[#8B5CF6] hover:underline uppercase"
                        >
                          {item.userEmail}
                        </a>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-2.5">
                      {isOwner ? (
                        <div className="text-[8px] font-mono text-[#8B5CF6] uppercase font-bold tracking-wider text-center">
                          ⚡ OWN GIG PROTOCOL: DISCUSSIONS WILL STREAM TO SECURE CHAT
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (onOpenChat) {
                              const chatCode = `SEC-${item.id.substring(0, 8).toUpperCase()}`;
                              onOpenChat(chatCode, `Discussion: ${item.title}`);
                            }
                          }}
                          className="w-full bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] border border-[#8B5CF6]/40 px-3 py-2.5 transition-all font-mono text-[9px] font-black uppercase tracking-widest rounded-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <MessageSquare size={12} />
                          CONNECT VIA SECURE CHAT SUITE
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Actions OR Admin Actions */}
                {(isOwner || isAdmin) && (
                  <div className="border-t border-zinc-900 pt-4 flex flex-wrap gap-2 items-center justify-between">
                    {isOwner ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Status Control //</span>
                        
                        {item.status !== "available" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "available")}
                            className="bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono uppercase px-2 py-1 transition-all cursor-pointer"
                            title="Mark as Available"
                          >
                            Set Available
                          </button>
                        )}
                        {item.status !== "assigned" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "assigned")}
                            className="bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/20 text-amber-500 text-[9px] font-mono uppercase px-2 py-1 transition-all cursor-pointer"
                            title="Mark as Assigned"
                          >
                            Set Assigned
                          </button>
                        )}
                        {item.status !== "completed" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "completed")}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] font-mono uppercase px-2 py-1 transition-all cursor-pointer"
                            title="Mark as Completed"
                          >
                            Set Completed
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-[8px] font-mono text-red-400 uppercase tracking-widest">
                        // ADMINISTRATIVE PRIVILEGE DEPLOYED
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className={`text-red-500 hover:text-red-400 p-2 transition-colors cursor-pointer ml-auto flex items-center gap-1 text-[10px] font-mono uppercase border ${
                        retractConfirmId === item.id ? "bg-red-950/40 border-red-500 text-red-300" : "bg-transparent border-transparent"
                      }`}
                    >
                      <Trash2 size={12} />
                      {retractConfirmId === item.id ? "Confirm Delete?" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Attachment Inspection Modal Dialog (Highly Polished) */}
      <AnimatePresence>
        {previewAttachment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-855 overflow-hidden flex flex-col text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950/80">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black truncate max-w-[400px]">
                  📄 Inspection Bay // {previewAttachment.name}
                </span>
                <button
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1 px-2 border border-zinc-800 hover:bg-white hover:text-black hover:border-white text-zinc-400 text-xs font-mono uppercase transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 flex flex-col items-center justify-center max-h-[80vh] overflow-y-auto">
                {previewAttachment.type === "image" ? (
                  <img 
                    src={previewAttachment.dataUrl} 
                    alt={previewAttachment.name} 
                    className="max-h-[60vh] max-w-full object-contain border border-zinc-900" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="py-12 text-center space-y-4 max-w-md">
                    <FileText size={64} className="mx-auto text-emerald-400 animate-bounce" />
                    <h5 className="text-sm font-mono font-black uppercase text-white tracking-widest">
                      Assignment Guidelines PDF File Document
                    </h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      This assignment PDF file ({Math.round(previewAttachment.size / 1024)} KB) is securely mounted within the Acadamex sync framework.
                    </p>
                    <a
                      href={previewAttachment.dataUrl}
                      download={previewAttachment.name}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 text-[10px] font-mono font-bold tracking-widest uppercase transition-all"
                    >
                      <Download size={14} /> Download PDF Source Document
                    </a>
                  </div>
                )}
              </div>

              {/* Footer details */}
              <div className="p-3 bg-zinc-950/90 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-500 font-mono uppercase">
                <span>FILE_SIZE: {Math.round(previewAttachment.size / 1024)} KB</span>
                <span>STATE: VERIFIED PEER ASSET</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
