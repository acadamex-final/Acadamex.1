/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { supabase } from './services/supabase';
import { useState, useEffect, FormEvent, ChangeEvent, DragEvent, useRef } from "react";
import {
  Search,
  Users,
  ShoppingBag,
  MessageSquare,
  User as UserIcon,
  LayoutDashboard,
  Menu,
  PlusCircle,
  TrendingUp,
  LogOut,
  X,
  Plus,
  Loader2,
  LogIn,
  Shield,
  ShieldAlert,
  LifeBuoy,
  Check,
  AlertCircle,
  Clock,
  Heart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Trash2,
  Cpu,
  FileText,
  Upload,
  Briefcase,
  ExternalLink,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "./components/FirebaseProvider";
import { AcademicGigsView } from "./components/AcademicGigsView";
import { PrivateChatView } from "./components/PrivateChatView";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { OperationType, handleFirestoreError } from "./services/firebase";
import {
  Teacher,
  MarketItem,
  DiscussionPost,
  SupportTicket,
  Review,
  AcademicGig,
} from "./types";
import { UNIVERSITIES, COLLEGES, COURSES } from "./constants/academicData";
import {
  vipsTeachersList as _vipsTeachersList,
  msitTeachersList as _msitTeachersList,
  maitTeachersList as _maitTeachersList,
  adgitmTeachersList as _adgitmTeachersList,
  shivajiTeachersList as _shivajiTeachersList,
  andcTeachersList as _andcTeachersList,
  usictTeachersList as _usictTeachersList,
  usllsTeachersList as _usllsTeachersList,
  usmsTeachersList as _usmsTeachersList,
  maimsTeachersList as _maimsTeachersList,
  bpitTeachersList as _bpitTeachersList,
  gtbitTeachersList as _gtbitTeachersList,
  bvcoeTeachersList as _bvcoeTeachersList,
  hmritmTeachersList as _hmritmTeachersList,
  meriTeachersList as _meriTeachersList,
  tecniaTeachersList as _tecniaTeachersList,
  tiipsTeachersList as _tiipsTeachersList,
  bciitTeachersList as _bciitTeachersList,
  bsamcTeachersList as _bsamcTeachersList,
  cbpacsTeachersList as _cbpacsTeachersList,
  aieTeachersList as _aieTeachersList,
  motilalNehruEveTeachersList as _motilalNehruEveTeachersList,
} from "./constants/teachersSeed";

// --- Types ---
type View =
  | "dashboard"
  | "teachers"
  | "marketplace"
  | "community"
  | "profile"
  | "admin"
  | "support"
  | "chat"
  | "gigs";

// --- Components ---

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 border-r-2 transition-all duration-300 group ${
      active
        ? "bg-[#111111] text-white border-white"
        : "text-[#666] hover:bg-[#0A0A0A] border-transparent hover:text-white"
    }`}
  >
    <Icon
      size={18}
      className={active ? "text-white" : "text-[#444] group-hover:text-white"}
    />
    <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
  </button>
);

export default function App() {

  const exportTeachers = async () => {
    try {
      const teachersSnapshot = await getDocs(collection(db, "teachers"));

      const teachers = teachersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("TEACHERS EXPORT");
      console.log(JSON.stringify(teachers, null, 2));

      alert(`Exported ${teachers.length} teachers. Open Console (F12).`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };
  const { auth, db, user, loading, initialized } = useFirebase();
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [directChat, setDirectChat] = useState<{ code: string; title: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );

  const handleSelectTeacher = async (id: string, collegeId?: string) => {
    if (!user) return;
    const userCollege = globalUserColleges[user.uid];

    if (userCollege && user.email !== "237tanishaqverma@gmail.com") {
      let finalCollegeId = collegeId;
      if (!finalCollegeId && db) {
        try {
          const tSnap = await getDoc(doc(db, "teachers", id));
          if (tSnap.exists()) {
            finalCollegeId = tSnap.data().collegeId;
          }
        } catch (e) {
          console.error("Error verifying college lock:", e);
        }
      }
      if (finalCollegeId && userCollege !== finalCollegeId) {
        alert(`ACCESS RESTRICTED: As a student of ${COLLEGES[userCollege]?.name || userCollege.toUpperCase()}, you are not permitted to open profiles or submit review dossiers for teachers affiliated with other colleges.`);
        return;
      }
    }
    setSelectedTeacherId(id);
  };
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const [showRefinedSearch, setShowRefinedSearch] = useState(false);
  const [selectedCollegeDetail, setSelectedCollegeDetail] = useState<
    string | null
  >(null);
  const [globalSearch, setGlobalSearch] = useState("");

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");

  const handleSeedVipsData = async () => {
    if (!db || !user) return;
    setIsSeeding(true);
    setSeedStatus("Querying active index...");
    
    const vipsTeachersList = _vipsTeachersList;
    const msitTeachersList = _msitTeachersList;
    const maitTeachersList = _maitTeachersList;
    const adgitmTeachersList = _adgitmTeachersList;
    const shivajiTeachersList = _shivajiTeachersList;
    const andcTeachersList = _andcTeachersList;
    const usictTeachersList = _usictTeachersList;
    const usllsTeachersList = _usllsTeachersList;
    const usmsTeachersList = _usmsTeachersList;
    const maimsTeachersList = _maimsTeachersList;
    const bpitTeachersList = _bpitTeachersList;
    const gtbitTeachersList = _gtbitTeachersList;
    const bvcoeTeachersList = _bvcoeTeachersList;
    const hmritmTeachersList = _hmritmTeachersList;
    const meriTeachersList = _meriTeachersList;
    const tecniaTeachersList = _tecniaTeachersList;
    const tiipsTeachersList = _tiipsTeachersList;
    const bciitTeachersList = _bciitTeachersList;
    const bsamcTeachersList = _bsamcTeachersList;
    const cbpacsTeachersList = _cbpacsTeachersList;
    const aieTeachersList = _aieTeachersList;
    const motilalNehruEveTeachersList = _motilalNehruEveTeachersList;
 
    const datasets = [
      { collegeId: "vips", defaultCourseId: "btech", list: vipsTeachersList },
      { collegeId: "msit", defaultCourseId: "btech", list: msitTeachersList },
      { collegeId: "mait", defaultCourseId: "bcom_h", list: maitTeachersList },
      { collegeId: "adgitm", defaultCourseId: "btech", list: adgitmTeachersList },
      { collegeId: "shivaji", defaultCourseId: "ba_h", list: shivajiTeachersList },
      { collegeId: "andc", defaultCourseId: "bsc_h", list: andcTeachersList },
      { collegeId: "usict", defaultCourseId: "btech", list: usictTeachersList },
      { collegeId: "uslls", defaultCourseId: "llb", list: usllsTeachersList },
      { collegeId: "usms", defaultCourseId: "mba", list: usmsTeachersList },
      { collegeId: "maims", defaultCourseId: "bjmc", list: maimsTeachersList },
      { collegeId: "bpit", defaultCourseId: "btech", list: bpitTeachersList },
      { collegeId: "gtbit", defaultCourseId: "btech", list: gtbitTeachersList },
      { collegeId: "bvcoe", defaultCourseId: "btech", list: bvcoeTeachersList },
      { collegeId: "hmritm", defaultCourseId: "btech", list: hmritmTeachersList },
      { collegeId: "meri", defaultCourseId: "bba", list: meriTeachersList },
      { collegeId: "tecnia", defaultCourseId: "mba", list: tecniaTeachersList },
      { collegeId: "tiips", defaultCourseId: "btech", list: tiipsTeachersList },
      { collegeId: "bciit", defaultCourseId: "mca", list: bciitTeachersList },
      { collegeId: "bsamc", defaultCourseId: "mbbs", list: bsamcTeachersList },
      { collegeId: "cbpacs", defaultCourseId: "bams", list: cbpacsTeachersList },
      { collegeId: "aie", defaultCourseId: "ba_bed", list: aieTeachersList },
      { collegeId: "motilal_nehru", defaultCourseId: "ba_p", list: motilalNehruEveTeachersList }
    ];

    try {
      let created = 0;
      let skipped = 0;
      let clearedCount = 0;
      let deDuplicatedCount = 0;

      // Clean & map both incomplete/complete names for ADGITM
      const getCanonicalKey = (name: string, collegeId: string): string => {
        const norm = (name || "").trim().toLowerCase();
        if (collegeId === "adgitm") {
          if (norm === "mr. vikash" || norm === "vikash" || norm === "mr. vikash kumar" || norm === "vikash kumar") return "mr. vikash kumar";
          if (norm === "ms. megha" || norm === "megha" || norm === "ms. megha gupta" || norm === "megha gupta") return "ms. megha gupta";
          if (norm === "ms. sadhna" || norm === "sadhna" || norm === "dr. sadhna shastri" || norm === "sadhna shastri" || norm === "ms. sadhna shastri") return "dr. sadhna shastri";
          if (norm === "dr. ruby" || norm === "ruby" || norm === "dr. ruby singh kushwaha" || norm === "ruby singh kushwaha") return "dr. ruby singh kushwaha";
          if (norm === "ms. nikita" || norm === "nikita" || norm === "ms. nikita sharma" || norm === "nikita sharma") return "ms. nikita sharma";
          if (norm === "mr. naveen" || norm === "naveen" || norm === "mr. naveen bhardwaj" || norm === "naveen bhardwaj") return "mr. naveen bhardwaj";
          if (norm === "mr. naman" || norm === "naman" || norm === "mr. naman solanki" || norm === "naman solanki") return "mr. naman solanki";
          if (norm === "ms. shivangi" || norm === "shivangi" || norm === "ms. shivangi sharma" || norm === "shivangi sharma") return "ms. shivangi sharma";
          if (norm === "ms. swati" || norm === "swati" || norm === "ms. swati chaudhary" || norm === "swati chaudhary") return "ms. swati chaudhary";
          if (norm === "ms. meenu" || norm === "meenu" || norm === "ms. meenu chaudhary" || norm === "meenu chaudhary" || norm === "ms. meenu") return "ms. meenu chaudhary";
          if (norm === "ms. garima" || norm === "garima" || norm === "ms. garima gupta" || norm === "garima gupta" || norm === "ms. garima") return "ms. garima gupta";
          if (norm === "dr. archana" || norm === "archana" || norm === "dr. archana kumar" || norm === "archana kumar" || norm === "dr. archana" || norm === "dr. archanna" || norm === "archanna" || norm === "dr. archanna kumar" || norm === "archanna kumar" || norm === "dr. archanna kumar") return "dr. archana kumar";
          if (norm === "ms. shipra" || norm === "shipra" || norm === "ms. shipra varshney" || norm === "shipra varshney") return "ms. shipra varshney";
        }
        if (collegeId === "maims" || collegeId === "mait") {
          if (norm === "mr. praveen " || norm === "mr. praveen" || norm === "praveen" || norm === "mr. praveen singh" || norm === "mr. praveen kumar" || norm === "praveen singh" || norm === "praveen kumar") return "mr. praveen kumar";
        }
        return norm;
      };

      const getCanonicalTitle = (key: string, originalName?: string): string => {
        const titles: Record<string, string> = {
          "mr. vikash kumar": "Mr. Vikash Kumar",
          "ms. megha gupta": "Ms. Megha Gupta",
          "dr. sadhna shastri": "Dr. Sadhna Shastri",
          "dr. ruby singh kushwaha": "Dr. Ruby Singh Kushwaha",
          "ms. nikita sharma": "Ms. Nikita Sharma",
          "mr. naveen bhardwaj": "Mr. Naveen Bhardwaj",
          "mr. naman solanki": "Mr. Naman Solanki",
          "ms. shivangi sharma": "Ms. Shivangi Sharma",
          "ms. swati chaudhary": "Ms. Swati Chaudhary",
          "ms. meenu chaudhary": "Ms. Meenu Chaudhary",
          "ms. garima gupta": "Ms. Garima Gupta",
          "dr. archana kumar": "Dr. Archana Kumar",
          "ms. shipra varshney": "Ms. Shipra Varshney",
          "mr. praveen kumar": "Mr. Praveen Kumar"
        };
        return titles[key] || originalName || key;
      };

      const reviewsSnap = await getDocs(collection(db, "reviews"));
      const reviewedTeacherIds = new Set(reviewsSnap.docs.map(d => d.data().teacherId));

      for (const dataset of datasets) {
        const currentCollegeId = dataset.collegeId;
        const currentList = dataset.list;

        setSeedStatus(`Querying active index for ${currentCollegeId.toUpperCase()}...`);
        const teachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", currentCollegeId))
        );

        setSeedStatus(`Analyzing and cleaning existing entries for ${currentCollegeId.toUpperCase()}...`);
        for (const docSnap of teachersSnap.docs) {
          if (!reviewedTeacherIds.has(docSnap.id)) {
            const data = docSnap.data();
            if (data.averageRating > 0 || data.reviewCount > 0 || (data.tags && Object.keys(data.tags).length > 0)) {
              await updateDoc(doc(db, "teachers", docSnap.id), {
                averageRating: 0,
                reviewCount: 0,
                pedagogyScore: 0,
                strictnessScore: 0,
                gradingScore: 0,
                tags: {},
                updatedAt: serverTimestamp()
              });
              clearedCount++;
            }
          }
        }

        // --- ADVANCED DEDUPLICATION & MERGE ROUTINE ---
        setSeedStatus(`Scanning for duplicate teacher blocks in ${currentCollegeId.toUpperCase()}...`);
        const nameGroups = new Map<string, any[]>();
        teachersSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const name = (data.name || "").trim();
          if (name) {
            const canonicalKey = getCanonicalKey(name, currentCollegeId);
            if (!nameGroups.has(canonicalKey)) {
              nameGroups.set(canonicalKey, []);
            }
            nameGroups.get(canonicalKey)!.push({ id: docSnap.id, data });
          }
        });

        for (const [nameKey, docs] of nameGroups.entries()) {
          if (docs.length > 1) {
            // Sort docs: prioritize those with reviews (reviewCount > 0), then oldest
            docs.sort((a, b) => {
              const countA = a.data.reviewCount || 0;
              const countB = b.data.reviewCount || 0;
              if (countA !== countB) return countB - countA;
              const timeA = a.data.createdAt?.seconds || 0;
              const timeB = b.data.createdAt?.seconds || 0;
              return timeA - timeB;
            });

            const master = docs[0];
            const duplicates = docs.slice(1);
            
            const allSubjects = new Set<string>();
            docs.forEach(d => {
              const subStr = d.data.subject || "";
              subStr.split("/").forEach((s: string) => {
                if (s.trim()) allSubjects.add(s.trim());
              });
            });

            let masterSubjectString = Array.from(allSubjects).join(" / ").trim();
            if (!masterSubjectString) {
              masterSubjectString = "General Academic Subjects";
            }
            
            const canonTitle = getCanonicalTitle(nameKey, master.data.name);
            setSeedStatus(`Consolidating duplicate blocks for ${canonTitle}...`);
            
            let addedReviewCount = 0;
            let addedRatingTotal = 0;
            let addedPedagogyTotal = 0;
            let addedStrictnessTotal = 0;
            let addedGradingTotal = 0;

            for (const dup of duplicates) {
              const dupReviews = reviewsSnap.docs.filter(d => d.data().teacherId === dup.id);
              for (const revDoc of dupReviews) {
                await updateDoc(doc(db, "reviews", revDoc.id), {
                  teacherId: master.id,
                  updatedAt: Date.now()
                });
                
                const rData = revDoc.data();
                addedReviewCount++;
                addedRatingTotal += rData.rating || 0;
                addedPedagogyTotal += rData.pedagogy || 0;
                addedStrictnessTotal += rData.strictness || 0;
                addedGradingTotal += rData.grading || 0;
              }

              await deleteDoc(doc(db, "teachers", dup.id));
              deDuplicatedCount++;
            }

            const finalReviewCount = (master.data.reviewCount || 0) + addedReviewCount;
            let finalRating = master.data.averageRating || 0;
            let finalPedagogy = master.data.pedagogyScore || 0;
            let finalStrictness = master.data.strictnessScore || 0;
            let finalGrading = master.data.gradingScore || 0;

            if (finalReviewCount > 0) {
              const currentTotalRating = (master.data.averageRating || 0) * (master.data.reviewCount || 0);
              finalRating = (currentTotalRating + addedRatingTotal) / finalReviewCount;
              
              const currentTotalPed = (master.data.pedagogyScore || 0) * (master.data.reviewCount || 0);
              finalPedagogy = (currentTotalPed + addedPedagogyTotal) / finalReviewCount;

              const currentTotalStric = (master.data.strictnessScore || 0) * (master.data.reviewCount || 0);
              finalStrictness = (currentTotalStric + addedStrictnessTotal) / finalReviewCount;

              const currentTotalGrad = (master.data.gradingScore || 0) * (master.data.reviewCount || 0);
              finalGrading = (currentTotalGrad + addedGradingTotal) / finalReviewCount;
            }

            await updateDoc(doc(db, "teachers", master.id), {
              name: canonTitle,
              subject: masterSubjectString,
              reviewCount: finalReviewCount,
              averageRating: finalRating,
              pedagogyScore: finalPedagogy,
              strictnessScore: finalStrictness,
              gradingScore: finalGrading,
              updatedAt: serverTimestamp()
            });
          }
        }

        // --- RUNTIME DYNAMIC MERGE OF SEED LIST ---
        setSeedStatus(`Pruning and aggregating academic syllabus metadata for ${currentCollegeId.toUpperCase()}...`);
        const aggregatedMap = new Map<string, { name: string; subjects: Set<string>; courseId?: string }>();
        for (const item of currentList as any[]) {
          const rawName = (item.name || "").trim();
          if (!rawName) continue;
          
          const canonicalKey = getCanonicalKey(rawName, currentCollegeId);
          const canonicalTitle = getCanonicalTitle(canonicalKey, rawName);
          const rawSubject = (item.subject || "General Academic Subjects").trim();
          
          if (!aggregatedMap.has(canonicalKey)) {
            aggregatedMap.set(canonicalKey, { name: canonicalTitle, subjects: new Set<string>(), courseId: item.courseId });
          }
          aggregatedMap.get(canonicalKey)!.subjects.add(rawSubject);
          if (item.courseId) {
            aggregatedMap.get(canonicalKey)!.courseId = item.courseId;
          }
        }

        const aggregatedTeachers = Array.from(aggregatedMap.values()).map(item => {
          let mergedSub = Array.from(item.subjects).join(" / ");
          if (mergedSub.length > 950) {
            mergedSub = mergedSub.substring(0, 950) + "...";
          }
          return {
            name: item.name,
            subject: mergedSub,
            courseId: item.courseId
          };
        });

        // Refresh teacher snap after deduplication
        const refreshedTeachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", currentCollegeId))
        );
        
        const correctUniId = UNIVERSITIES.find(u => u.collegeIds.includes(currentCollegeId))?.id || "ipu";

        const existingTeachersByName = new Map<string, { id: string, subject: string, universityId: string }>();
        for (const docSnap of refreshedTeachersSnap.docs) {
          const nameData = docSnap.data().name || "";
          const canonicalKey = getCanonicalKey(nameData, currentCollegeId);
          existingTeachersByName.set(canonicalKey, {
            id: docSnap.id,
            subject: docSnap.data().subject || "",
            universityId: docSnap.data().universityId || ""
          });
        }

        // Sync aggregated seed list
        for (const item of aggregatedTeachers) {
          try {
            const normName = getCanonicalKey(item.name, currentCollegeId);
            
            if (existingTeachersByName.has(normName)) {
              const existing = existingTeachersByName.get(normName)!;
              const existingSubStr = (existing.subject || "").trim();
              const existingSubjects = new Set(existingSubStr.split("/").map(s => s.trim().toLowerCase()).filter(Boolean));
              const newSubjects = (item.subject || "").split("/").map(s => s.trim()).filter(Boolean);
              
              let needsUpdate = false;
              const mergedSubjects = [...existingSubStr.split("/").map(s => s.trim()).filter(Boolean)];
              
              for (const s of newSubjects) {
                if (!existingSubjects.has(s.toLowerCase())) {
                  mergedSubjects.push(s);
                  needsUpdate = true;
                }
              }

              const isUniIncorrect = existing.universityId !== correctUniId;
              
              if (needsUpdate || isUniIncorrect) {
                let finalSubjectString = mergedSubjects.join(" / ").trim();
                if (!finalSubjectString) {
                  finalSubjectString = "General Academic Subjects";
                }
                if (finalSubjectString.length > 950) {
                  finalSubjectString = finalSubjectString.substring(0, 950) + "...";
                }
                setSeedStatus(`Augmenting subjects for: ${item.name}...`);
                await updateDoc(doc(db, "teachers", existing.id), {
                  subject: finalSubjectString,
                  universityId: correctUniId,
                  updatedAt: serverTimestamp()
                });
                created++; 
              } else {
                skipped++;
              }
              continue;
            }

            setSeedStatus(`Transmitting: ${item.name}...`);
            
            let finalSubject = (item.subject || "").trim();
            if (!finalSubject) {
              finalSubject = "General Academic Subjects";
            }
            if (finalSubject.length > 950) {
              finalSubject = finalSubject.substring(0, 950) + "...";
            }

            const docRef = await addDoc(collection(db, "teachers"), {
              name: item.name,
              universityId: correctUniId,
              collegeId: currentCollegeId,
              courseId: item.courseId || dataset.defaultCourseId || "btech",
              subject: finalSubject,
              status: "pending",
              averageRating: 0,
              reviewCount: 0,
              pedagogyScore: 0,
              strictnessScore: 0,
              gradingScore: 0,
              tags: {},
              createdBy: user.uid,
              createdByName: user.displayName || user.email || "System Seeder",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            await updateDoc(doc(db, "teachers", docRef.id), {
              status: "active",
              averageRating: 0,
              reviewCount: 0,
              pedagogyScore: 0,
              strictnessScore: 0,
              gradingScore: 0,
              tags: {},
              updatedAt: serverTimestamp()
            });

            created++;
          } catch (teacherErr: any) {
            console.error(`Error syncing teacher profile for ${item.name}:`, teacherErr);
            // Non-blocking catch to allow remaining datasets to sync successfully
          }
        }
      }

      setSeedStatus(`SUCCESS: Consolidated ${deDuplicatedCount} duplicates! Resetted ${clearedCount} stats! Generated/Updated ${created} profiles.`);
      setTimeout(() => setSeedStatus(""), 4000);
    } catch (err: any) {
      console.error(err);
      setSeedStatus(`Failed: ${err.message || String(err)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const [isUserAdmin, setIsUserAdmin] = useState(
    user?.email === "237tanishaqverma@gmail.com",
  );
  const [globalUserRoles, setGlobalUserRoles] = useState<
    Record<string, string[]>
  >({});
  const [globalUserColleges, setGlobalUserColleges] = useState<
    Record<string, string>
  >({});
  const [isRolesLoaded, setIsRolesLoaded] = useState(false);

  const [quotaErrorOccurred, setQuotaErrorOccurred] = useState(false);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState("");

  useEffect(() => {
    const handleQuotaEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setQuotaErrorOccurred(true);
      setQuotaErrorMessage(customEvent.detail || "Quota limit exceeded.");
    };

    const handleWindowError = (e: ErrorEvent) => {
      const msg = e?.message || "";
      if (msg.toLowerCase().includes("quota")) {
        setQuotaErrorOccurred(true);
        setQuotaErrorMessage(msg);
      }
    };

    const handleWindowRejection = (e: PromiseRejectionEvent) => {
      const reason = e?.reason;
      const msg = reason?.message || String(reason);
      if (msg.toLowerCase().includes("quota")) {
        setQuotaErrorOccurred(true);
        setQuotaErrorMessage(msg);
      }
    };

    window.addEventListener("firestore-quota-exceeded", handleQuotaEvent);
    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleWindowRejection);

    return () => {
      window.removeEventListener("firestore-quota-exceeded", handleQuotaEvent);
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleWindowRejection);
    };
  }, []);

  useEffect(() => {
    if (!db) {
      setIsRolesLoaded(false);
      return;
    }
    if (!user) {
      setGlobalUserRoles({});
      setGlobalUserColleges({});
      setIsRolesLoaded(true);
      return;
    }

    setIsRolesLoaded(false);
    const unsubRoles = onSnapshot(
      collection(db, "user_roles"),
      (snap) => {
        const rolesMap: Record<string, string[]> = {};
        const collegesMap: Record<string, string> = {};
        snap.docs.forEach((doc) => {
          const data = doc.data();
          rolesMap[doc.id] = data.roles || [];
          if (data.collegeId) {
            collegesMap[doc.id] = data.collegeId;
          }
        });
        setGlobalUserRoles(rolesMap);
        setGlobalUserColleges(collegesMap);
        setIsRolesLoaded(true);
      },
      (error) => {
        console.error("Error loading user roles: ", error);
        const errMsg = error?.message || String(error);
        if (errMsg.toLowerCase().includes("quota")) {
          setQuotaErrorOccurred(true);
          setQuotaErrorMessage(errMsg);
        }
        setIsRolesLoaded(true);
      },
    );
    return () => unsubRoles();
  }, [db, user?.uid]);

  useEffect(() => {
    if (user?.email === "237tanishaqverma@gmail.com") {
      setIsUserAdmin(true);
      return;
    }
    if (!user || !db) {
      setIsUserAdmin(false);
      return;
    }
    const unsubAdminCheck = onSnapshot(
      doc(db, "admins", user.uid),
      (docSnap) => {
        setIsUserAdmin(docSnap.exists());
      },
      (error) => {
        console.error("Error loading admin status: ", error);
        const errMsg = error?.message || String(error);
        if (errMsg.toLowerCase().includes("quota")) {
          setQuotaErrorOccurred(true);
          setQuotaErrorMessage(errMsg);
        }
        setIsUserAdmin(false);
      },
    );
    return () => unsubAdminCheck();
  }, [user?.uid, db]);

  const isAdmin = isUserAdmin;

  // Seamless Firestore Database corrector for VIPS teacher entries
  useEffect(() => {
    if (!db || !user || !isAdmin) return;
    
    const runAutomaticDBCorrector = async () => {
      try {
        const reviewsSnap = await getDocs(collection(db, "reviews"));
        const reviewedTeacherIds = new Set(reviewsSnap.docs.map(d => {
          const tId = d.data().teacherId;
          return tId ? tId.trim() : "";
        }));

        const vipsTeachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", "vips"))
        );

        for (const docSnap of vipsTeachersSnap.docs) {
          if (!reviewedTeacherIds.has(docSnap.id)) {
            const data = docSnap.data();
            if (
              data.averageRating > 0 ||
              data.reviewCount > 0 ||
              (data.tags && Object.keys(data.tags).length > 0) ||
              data.pedagogyScore > 0 ||
              data.strictnessScore > 0 ||
              data.gradingScore > 0
            ) {
              console.log(`Auto-correcting rating/tags in Firestore for teacher: ${data.name}`);
              await updateDoc(doc(db, "teachers", docSnap.id), {
                averageRating: 0,
                reviewCount: 0,
                pedagogyScore: 0,
                strictnessScore: 0,
                gradingScore: 0,
                tags: {},
                updatedAt: serverTimestamp()
              });
            }
          }
        }

        // --- CUSTOM PRIYANKA CHILLAR & DR. ATIF DEDUPE & CORRECTOR ---
        let atifDoc: any = null;
        let atifWahidDoc: any = null;
        const priyankaDocs: any[] = [];

        for (const docSnap of vipsTeachersSnap.docs) {
          const data = docSnap.data();
          const nameLower = (data.name || "").trim().toLowerCase();
          
          if (nameLower === "dr. atif" || nameLower === "atif") {
            atifDoc = { id: docSnap.id, data };
          } else if (nameLower === "dr. mohd. atif wahid" || nameLower === "mohd. atif wahid") {
            atifWahidDoc = { id: docSnap.id, data };
          }
          
          if (nameLower.includes("priyanka") && nameLower.includes("chillar")) {
            priyankaDocs.push({ id: docSnap.id, data });
          }
        }

        // A. Process Atifs: merge "Dr. Atif" into "Dr. Mohd. Atif Wahid"
        if (atifDoc) {
          if (atifWahidDoc) {
            console.log(`Custom corrector: Merging duplicate "Dr. Atif" into "Dr. Mohd. Atif Wahid"`);
            const drAtifReviews = reviewsSnap.docs.filter(d => d.data().teacherId === atifDoc.id);
            let addedCount = 0;
            let addedRating = 0;
            let addedPedagogy = 0;
            let addedStrictness = 0;
            let addedGrading = 0;

            for (const rDoc of drAtifReviews) {
              await updateDoc(doc(db, "reviews", rDoc.id), {
                teacherId: atifWahidDoc.id,
                updatedAt: Date.now()
              });
              const rData = rDoc.data();
              addedCount++;
              addedRating += rData.rating || 0;
              addedPedagogy += rData.pedagogy || 0;
              addedStrictness += rData.strictness || 0;
              addedGrading += rData.grading || 0;
            }

            await deleteDoc(doc(db, "teachers", atifDoc.id));

            const mCount = atifWahidDoc.data.reviewCount || 0;
            const finalCount = mCount + addedCount;
            let finalRating = atifWahidDoc.data.averageRating || 0;
            let finalPedagogy = atifWahidDoc.data.pedagogyScore || 0;
            let finalStrictness = atifWahidDoc.data.strictnessScore || 0;
            let finalGrading = atifWahidDoc.data.gradingScore || 0;

            if (finalCount > 0) {
              finalRating = ((atifWahidDoc.data.averageRating || 0) * mCount + addedRating) / finalCount;
              finalPedagogy = ((atifWahidDoc.data.pedagogyScore || 0) * mCount + addedPedagogy) / finalCount;
              finalStrictness = ((atifWahidDoc.data.strictnessScore || 0) * mCount + addedStrictness) / finalCount;
              finalGrading = ((atifWahidDoc.data.gradingScore || 0) * mCount + addedGrading) / finalCount;
            }

            await updateDoc(doc(db, "teachers", atifWahidDoc.id), {
              averageRating: finalRating,
              reviewCount: finalCount,
              pedagogyScore: finalPedagogy,
              strictnessScore: finalStrictness,
              gradingScore: finalGrading,
              subject: "PRINCIPLES OF ENTREPRENEURSHIP MINDSET",
              updatedAt: serverTimestamp()
            });
          } else {
            console.log(`Custom corrector: Renaming "${atifDoc.data.name}" to "Dr. Mohd. Atif Wahid"`);
            await updateDoc(doc(db, "teachers", atifDoc.id), {
              name: "Dr. Mohd. Atif Wahid",
              updatedAt: serverTimestamp()
            });
          }
        }

        // B. Process Priyanka Chillar: ensure she has exactly "APPLIED PHYSICS - I / APPLIED PHYSICS - II"
        if (priyankaDocs.length > 0) {
          priyankaDocs.sort((a, b) => {
            const isDrA = a.data.name === "DR. PRIYANKA CHILLAR" || a.data.name === "Dr. Priyanka Chillar";
            const isDrB = b.data.name === "DR. PRIYANKA CHILLAR" || b.data.name === "Dr. Priyanka Chillar";
            if (isDrA && !isDrB) return -1;
            if (!isDrA && isDrB) return 1;
            const revA = a.data.reviewCount || 0;
            const revB = b.data.reviewCount || 0;
            return revB - revA;
          });

          const masterPriyanka = priyankaDocs[0];
          const duplicatePriyankas = priyankaDocs.slice(1);

          console.log(`Custom corrector: Consolidating Priyanka Chillar entries under master id: ${masterPriyanka.id}`);

          let addedCount = 0;
          let addedRating = 0;
          let addedPedagogy = 0;
          let addedStrictness = 0;
          let addedGrading = 0;

          for (const dup of duplicatePriyankas) {
            const dupReviews = reviewsSnap.docs.filter(d => d.data().teacherId === dup.id);
            for (const rDoc of dupReviews) {
              await updateDoc(doc(db, "reviews", rDoc.id), {
                teacherId: masterPriyanka.id,
                updatedAt: Date.now()
              });
              const rData = rDoc.data();
              addedCount++;
              addedRating += rData.rating || 0;
              addedPedagogy += rData.pedagogy || 0;
              addedStrictness += rData.strictness || 0;
              addedGrading += rData.grading || 0;
            }
            await deleteDoc(doc(db, "teachers", dup.id));
          }

          const mCount = masterPriyanka.data.reviewCount || 0;
          const finalCount = mCount + addedCount;
          let finalRating = masterPriyanka.data.averageRating || 0;
          let finalPedagogy = masterPriyanka.data.pedagogyScore || 0;
          let finalStrictness = masterPriyanka.data.strictnessScore || 0;
          let finalGrading = masterPriyanka.data.gradingScore || 0;

          if (finalCount > 0) {
            finalRating = ((masterPriyanka.data.averageRating || 0) * mCount + addedRating) / finalCount;
            finalPedagogy = ((masterPriyanka.data.pedagogyScore || 0) * mCount + addedPedagogy) / finalCount;
            finalStrictness = ((masterPriyanka.data.strictnessScore || 0) * mCount + addedStrictness) / finalCount;
            finalGrading = ((masterPriyanka.data.gradingScore || 0) * mCount + addedGrading) / finalCount;
          }

          const mergedSubjects = "APPLIED PHYSICS - I / APPLIED PHYSICS - II";

          await updateDoc(doc(db, "teachers", masterPriyanka.id), {
            name: "DR. PRIYANKA CHILLAR",
            subject: mergedSubjects,
            averageRating: finalRating,
            reviewCount: finalCount,
            pedagogyScore: finalPedagogy,
            strictnessScore: finalStrictness,
            gradingScore: finalGrading,
            updatedAt: serverTimestamp()
          });
        }

        // C. Clean up any seeded or incorrect "Ms. Rohini" entries under "adgitm" (Dr. Akhilesh Das)
        const adgitmTeachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", "adgitm"))
        );
        for (const docSnap of adgitmTeachersSnap.docs) {
          const nameLower = (docSnap.data().name || "").trim().toLowerCase();
          if (nameLower === "ms. rohini" || nameLower === "rohini") {
            console.log("Custom corrector: Removing incorrect teacher Ms. Rohini from adgitm");
            await deleteDoc(doc(db, "teachers", docSnap.id));
          }
        }

        // D. Migrate any "motilal_nehru_eve" Teachers/Roles to "motilal_nehru"
        const motilalEveTeachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", "motilal_nehru_eve"))
        );
        for (const docSnap of motilalEveTeachersSnap.docs) {
          console.log(`Custom corrector: Migrating teacher "${docSnap.data().name}" to motilal_nehru`);
          await updateDoc(doc(db, "teachers", docSnap.id), {
            collegeId: "motilal_nehru",
            updatedAt: serverTimestamp()
          });
        }

        const userRolesSnap = await getDocs(
          query(collection(db, "user_roles"), where("collegeId", "==", "motilal_nehru_eve"))
        );
        for (const docSnap of userRolesSnap.docs) {
          console.log(`Custom corrector: Migrating user role ${docSnap.id} to motilal_nehru`);
          await updateDoc(doc(db, "user_roles", docSnap.id), {
            collegeId: "motilal_nehru",
            updatedAt: serverTimestamp()
          });
        }

        // E. Merge "Mr. Praveen Singh" into "Mr. Praveen Kumar" for MAIMS & MAIT B.COM HONOURS duplicate entries
        const maimsTeachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", "maims"))
        );
        const maitTeachersSnap = await getDocs(
          query(collection(db, "teachers"), where("collegeId", "==", "mait"))
        );
        const allMaimsMaitDocs = [...maimsTeachersSnap.docs, ...maitTeachersSnap.docs];
        const collegesToProcess = ["maims", "mait"];

        for (const colId of collegesToProcess) {
          const colDocs = allMaimsMaitDocs.filter(d => d.data().collegeId === colId);
          const pkDocSnap = colDocs.find(d => {
            const name = (d.data().name || "").toLowerCase();
            return name.includes("praveen") && name.includes("kumar") && d.data().courseId === "bcom_h";
          });
          const psDocSnap = colDocs.find(d => {
            const name = (d.data().name || "").toLowerCase();
            return name.includes("praveen") && name.includes("singh") && d.data().courseId === "bcom_h";
          });

          if (pkDocSnap && psDocSnap) {
            console.log(`Custom corrector: Merging duplicate teacher "${psDocSnap.data().name}" into "${pkDocSnap.data().name}" in college ${colId}`);
            
            // Move reviews
            const dupReviews = reviewsSnap.docs.filter(d => d.data().teacherId === psDocSnap.id);
            let addedCount = 0;
            let addedRating = 0;
            let addedPedagogy = 0;
            let addedStrictness = 0;
            let addedGrading = 0;

            for (const rDoc of dupReviews) {
              await updateDoc(doc(db, "reviews", rDoc.id), {
                teacherId: pkDocSnap.id,
                updatedAt: Date.now()
              });
              const rData = rDoc.data();
              addedCount++;
              addedRating += rData.rating || 0;
              addedPedagogy += rData.pedagogy || 0;
              addedStrictness += rData.strictness || 0;
              addedGrading += rData.grading || 0;
            }

            // Delete the duplicate teacher doc
            await deleteDoc(doc(db, "teachers", psDocSnap.id));

            // Merge subjects
            const subSet = new Set<string>();
            const sub1 = pkDocSnap.data().subject || "";
            const sub2 = psDocSnap.data().subject || "";
            [sub1, sub2].forEach(s => {
              s.split("/").forEach((part: string) => {
                const trimmed = part.trim().toUpperCase();
                if (trimmed) subSet.add(trimmed);
              });
            });
            const mergedSubjects = Array.from(subSet).join(" / ");

            // Recalculate stats
            const mCount = pkDocSnap.data().reviewCount || 0;
            const finalCount = mCount + addedCount;
            let finalRating = pkDocSnap.data().averageRating || 0;
            let finalPedagogy = pkDocSnap.data().pedagogyScore || 0;
            let finalStrictness = pkDocSnap.data().strictnessScore || 0;
            let finalGrading = pkDocSnap.data().gradingScore || 0;

            if (finalCount > 0) {
              finalRating = ((pkDocSnap.data().averageRating || 0) * mCount + addedRating) / finalCount;
              finalPedagogy = ((pkDocSnap.data().pedagogyScore || 0) * mCount + addedPedagogy) / finalCount;
              finalStrictness = ((pkDocSnap.data().strictnessScore || 0) * mCount + addedStrictness) / finalCount;
              finalGrading = ((pkDocSnap.data().gradingScore || 0) * mCount + addedGrading) / finalCount;
            }

            // Update master
            await updateDoc(doc(db, "teachers", pkDocSnap.id), {
              name: "MR. PRAVEEN KUMAR",
              subject: mergedSubjects,
              averageRating: finalRating,
              reviewCount: finalCount,
              pedagogyScore: finalPedagogy,
              strictnessScore: finalStrictness,
              gradingScore: finalGrading,
              updatedAt: serverTimestamp()
            });
          } else if (psDocSnap && !pkDocSnap) {
            // If only Praveen Singh exists, rename him to MR. PRAVEEN KUMAR
            console.log(`Custom corrector: Renaming duplicate teacher "${psDocSnap.data().name}" to "MR. PRAVEEN KUMAR" in college ${colId}`);
            await updateDoc(doc(db, "teachers", psDocSnap.id), {
              name: "MR. PRAVEEN KUMAR",
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (e: any) {
        console.error("Firestore database corrector error:", e);
        const errMsg = e?.message || String(e);
        if (errMsg.toLowerCase().includes("quota")) {
          setQuotaErrorOccurred(true);
          setQuotaErrorMessage(errMsg);
        }
      }
    };

    runAutomaticDBCorrector();
  }, [db, user?.uid, isAdmin]);

  useEffect(() => {
    if (user && db) {
      const logRegistry = async () => {
        try {
          // Log only once as a 'SIGNUP' / Registration
          await addDoc(collection(db, "nodes"), {
            userId: user.uid,
            userName: user.displayName || "Anonymous Student",
            userEmail: user.email,
            registeredAt: Date.now(),
            action: "REGISTRATION",
          });
        } catch (e) {
          // It's fine if it's already logged or fails
        }
      };
      logRegistry();
    }
  }, [user?.uid, !!db]);

  const handleLogin = async () => {
    if (!auth || isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error?.code === "auth/cancelled-popup-request") {
        console.log("Login popup was cancelled or replaced by a new request.");
      } else if (error?.code === "auth/popup-blocked") {
        setLoginError(
          "Popups are blocked by your browser. Please enable them to sign in.",
        );
      } else if (error?.code === "auth/popup-closed-by-user") {
        setLoginError(
          "The login window was closed before completion. If you have ad-blockers active or are running inside an iframe, try disabling them or opening the app in a new browser tab.",
        );
      } else if (error?.code === "auth/internal-error") {
        setLoginError(
          "Firebase internal error. Please try refreshing the page.",
        );
      } else {
        console.error("Login failed:", error);
        setLoginError(error?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  if (quotaErrorOccurred) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
        <div className="w-full max-w-2xl z-10 text-center">
          <div className="w-16 h-16 bg-red-600/10 border border-red-600/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-red-500 mb-2">
            DATABASE ACCESS STATUS: INSUFFICIENT LIMITS
          </h1>
          <h2 className="font-sans font-black text-white text-3xl sm:text-4xl tracking-tight leading-none mb-6">
            FIRESTORE DAILY READ QUOTA EXCEEDED
          </h2>
          <div className="w-12 h-px bg-zinc-800 mx-auto mb-6" />
          
          <div className="bg-[#050505] border border-zinc-900 rounded-sm p-6 text-left mb-8">
            <p className="text-zinc-300 text-sm leading-relaxed mb-4">
              Your Firestore database has exceeded its free daily read units quota for today. 
              The quota will automatically reset tomorrow (at midnight Pacific Time).
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Detailed quota information can be found under the <strong className="text-zinc-200">Spark Plan</strong> column in the <strong className="text-zinc-200">Enterprise Edition</strong> section of the official Firebase pricing guide:
            </p>
            <div className="mb-6">
              <a 
                href="https://firebase.google.com/pricing#cloud-firestore" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8B5CF6] hover:text-[#A78BFA] border border-[#8B5CF6]/30 hover:border-[#8B5CF6] bg-[#8B5CF6]/5 px-4 py-2 hover:bg-[#8B5CF6]/10 transition-all rounded-sm"
              >
                <span>Read Official Pricing & Quotas</span>
                <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="w-full h-px bg-zinc-900 my-6" />
            
            <p className="text-zinc-300 text-sm font-semibold mb-3">
              Action Required to Unlock Immediately:
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              You can instantly upgrade your project's limits by opening your database inside the Firebase Console and upgrading the billing plan. Click the button below to directly open the database upgrade window:
            </p>
            <div>
              <a 
                href="https://console.firebase.google.com/project/gen-lang-client-0334840699/firestore/databases/ai-studio-271fbb4b-6aaa-45fd-b242-f8ee55156216/data?openUpgradeDialog=true" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-3 py-3 px-5 text-sm font-semibold text-black bg-white hover:bg-zinc-200 uppercase tracking-wider transition-all rounded-sm shadow-lg text-center font-sans hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Upgrade Database & Unlock App</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
          
          {quotaErrorMessage && (
            <div className="text-[10px] font-mono text-zinc-650 uppercase tracking-widest leading-relaxed mt-4 max-w-lg mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
              System Log: {quotaErrorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!initialized || loading || !isRolesLoaded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black relative">
        <div className="scanline" />
        <Loader2 className="animate-spin text-white mb-4" size={40} />
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
          Initializing Acadamex Student Hub...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden select-none">
        {/* Subtle futuristic grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        
        <div className="w-full max-w-3xl z-10 flex flex-col items-center">
          {/* Brand Presentation */}
          <div className="text-center mb-10 w-full">
            <h1 className="font-black leading-none tracking-[-0.07em] uppercase text-white text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[8rem] select-none">
              ACADAMEX.
            </h1>
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.3em] text-zinc-500 mt-4">
              Student Intelligence Network
            </p>
            <div className="w-16 h-px bg-zinc-800 mx-auto my-5" />
            <p className="text-xs sm:text-sm font-normal text-zinc-400 mt-2 leading-relaxed max-w-md mx-auto opacity-75">
              The decentralized student intelligence network. Access faculty intelligence, campus trade, and peer survival infrastructure.
            </p>
          </div>

          {/* Secure Login Card */}
          <div className="w-full max-w-md p-8 sm:p-10 border border-zinc-900 bg-[#050505]/90 backdrop-blur-md flex flex-col items-center shadow-2xl rounded-sm">
            <div className="mono-label mb-8 text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase">
              Secure Student Login
            </div>

            {loginError && (
              <div className="w-full p-4 mb-6 bg-red-600/10 border border-red-600/40 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-[11px] text-red-400 font-medium uppercase tracking-wider leading-relaxed">
                  {loginError}
                </p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`vantage-btn-primary w-full flex items-center justify-center gap-4 py-3.5 mb-4 text-sm font-semibold tracking-wider uppercase transition-all duration-150 active:scale-[0.98] ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoggingIn ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {isLoggingIn ? "Verifying..." : "Access // 01"}
            </button>

            <div className="mt-6 flex flex-col gap-2.5 items-center">
              <p className="mono-label text-[10px] text-center opacity-60 uppercase tracking-widest text-zinc-500">
                Authorized Student Access Only
              </p>
              {!isLoggingIn && (
                <p className="text-[9px] text-zinc-600 text-center uppercase tracking-[0.2em] font-medium max-w-[240px] leading-relaxed mt-1">
                  Trouble logging in? Disable ad-blockers or try browsing in a
                  new tab.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!globalUserColleges[user.uid]) {
    const handleSelectOnce = async (collegeId: string) => {
      if (!db || !user) return;
      await setDoc(
        doc(db, "user_roles", user.uid),
        {
          email: user.email,
          collegeId: collegeId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    };

    return (
      <CollegeAffiliationGate
        userId={user.uid}
        userEmail={user.email || "unknown@campus.edu"}
        onSelect={handleSelectOnce}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-black relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] radar-sweep opacity-[0.03]" />
        <div className="scanline" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col bg-transparent w-full">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              className="fixed inset-y-0 left-0 z-[100] w-72 flex flex-col bg-[#050505] border-r border-[#1A1A1A] shrink-0 shadow-2xl"
            >
               <div className="p-8 pb-12 flex items-center justify-between">
                <div
                  onClick={() => {
                    setActiveView("dashboard");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors">
                    A
                  </div>
                  <span className="text-lg font-black tracking-tighter text-white uppercase italic group-hover:text-[#8B5CF6] transition-colors">
                    Acadamex.
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                <SidebarItem
                  icon={LayoutDashboard}
                  label="Intelligence"
                  active={activeView === "dashboard" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("dashboard");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                <SidebarItem
                  icon={Users}
                  label="Teacher Ratings"
                  active={activeView === "teachers" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("teachers");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                <SidebarItem
                  icon={ShoppingBag}
                  label="Marketplace"
                  active={activeView === "marketplace" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("marketplace");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                <SidebarItem
                  icon={MessageSquare}
                  label="Peer Pulse"
                  active={activeView === "community" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("community");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                <SidebarItem
                  icon={Briefcase}
                  label="Work Board"
                  active={activeView === "gigs" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("gigs");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                <SidebarItem
                  icon={Lock}
                  label="Secure Chat"
                  active={activeView === "chat" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("chat");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                <SidebarItem
                  icon={UserIcon}
                  label="My Profile"
                  active={activeView === "profile" && !selectedCollegeDetail}
                  onClick={() => {
                    setActiveView("profile");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                />
                {isAdmin && (
                  <SidebarItem
                    icon={Shield}
                    label="Admin Command"
                    active={activeView === "admin" && !selectedCollegeDetail}
                    onClick={() => {
                      setActiveView("admin");
                      setSelectedTeacherId(null);
                      setSelectedCollegeDetail(null);
                    }}
                  />
                )}
              </nav>

              <div className="p-8 border-t border-[#1A1A1A] space-y-4">
                <button
                  onClick={() => {
                    setActiveView("support");
                    setSelectedTeacherId(null);
                    setSelectedCollegeDetail(null);
                  }}
                  className={`w-full flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase transition-colors ${activeView === "support" && !selectedCollegeDetail ? "text-white" : "text-[#555] hover:text-white"}`}
                >
                  <LifeBuoy size={16} />
                  Report Issue
                </button>
                <div className="flex flex-col gap-1">
                  <span className="mono-label text-[10px] text-white">
                    {isAdmin ? "Admin Hub" : "Student Hub"}
                  </span>
                  <span className="text-xs font-bold text-[#8B5CF6] truncate">
                    {user.displayName || user.email}
                  </span>
                  {globalUserColleges[user.uid] ? (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="inline-block px-1.5 py-0.5 text-[8px] font-black tracking-widest bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono uppercase w-fit leading-none">
                        Affiliated //{" "}
                        {COLLEGES[globalUserColleges[user.uid]]?.name.split(
                          " ",
                        )[0] || globalUserColleges[user.uid]}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider mt-1">
                      Sector Unassigned
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-[#555] hover:text-white transition-colors uppercase text-[11px] font-bold tracking-widest"
                >
                  <LogOut size={16} />
                  Terminate Session
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}
        >
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md border-b border-[#1A1A1A] shrink-0 z-20 sticky top-0">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`hover:text-[#8B5CF6] transition-colors p-2 -ml-2 ${isSidebarOpen ? "text-[#8B5CF6]" : "text-zinc-500"}`}
              >
                <Menu size={20} />
              </button>
              <div
                onClick={() => {
                  setActiveView("dashboard");
                  setSelectedTeacherId(null);
                }}
                className="mono-label text-[#8B5CF6] tracking-[0.3em] text-[9px] uppercase hidden sm:block cursor-pointer hover:text-white transition-colors select-none"
              >
                ACADAMEX_SECURE_LINK // {activeView}
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative group hidden md:block">
                <Search
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-white transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search Database..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-8 py-2 bg-transparent border-none text-white focus:outline-none transition-all text-xs uppercase tracking-widest placeholder:text-[#333] w-64"
                />
                <AnimatePresence>
                  {globalSearch.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-12 left-0 w-80 bg-[#0A0A0A] border border-zinc-900 shadow-2xl z-[150] max-h-[400px] overflow-y-auto"
                    >
                      <SearchProtocolResults
                        query={globalSearch}
                        userCollegeId={user ? globalUserColleges[user.uid] : undefined}
                        isRootAdmin={user ? (globalUserRoles[user.uid]?.includes("root_admin") || user.email === "237tanishaqverma@gmail.com") : false}
                        onSelect={(type, id, collegeId) => {
                          setGlobalSearch("");
                          if (type === "college") {
                            setSelectedCollegeDetail(id);
                            setActiveView("dashboard" as any); // Reset view so CollegeHub shows
                          } else if (type === "teacher") {
                            handleSelectTeacher(id, collegeId);
                          } else if (type === "uni") {
                            setActiveView("teachers");
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
  <button
    onClick={exportTeachers}
    className="bg-green-600 text-white px-3 py-2 text-xs"
  >
    EXPORT
  </button>

  <button
    onClick={() => setShowAddTeacherModal(true)}
    className="bg-white text-black p-2 hover:bg-zinc-200 transition-all rounded-none"
  >
    <Plus size={20} />
  </button>
</div>
            </div>
          </header>

          {/* Viewport */}
          <div className="flex-1 overflow-y-auto bg-black custom-scrollbar">
            <div className="p-4 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCollegeDetail ? "college-hub" : activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedCollegeDetail ? (
                    <CollegeHubView
                      collegeId={selectedCollegeDetail}
                      onClose={() => setSelectedCollegeDetail(null)}
                      onSelectTeacher={handleSelectTeacher}
                      userCollegeId={user ? globalUserColleges[user.uid] : undefined}
                      isRootAdmin={user ? (globalUserRoles[user.uid]?.includes("root_admin") || user.email === "237tanishaqverma@gmail.com") : false}
                    />
                  ) : (
                    <>
                      {activeView === "dashboard" && (
                        <DashboardView
                          onShowAddTeacher={() => setShowAddTeacherModal(true)}
                          onShowSearch={() => setShowRefinedSearch(true)}
                          onJoinThread={() => setActiveView("community")}
                          onSelectCollege={(id) => {
                            setSelectedCollegeDetail(id);
                            setActiveView("dashboard");
                          }}
                        />
                      )}
                      {activeView === "teachers" && (
                        <TeachersView
                          onShowAddTeacher={() => setShowAddTeacherModal(true)}
                          onSelectTeacher={handleSelectTeacher}
                          userCollegeId={user ? globalUserColleges[user.uid] : undefined}
                          isRootAdmin={user ? (globalUserRoles[user.uid]?.includes("root_admin") || user.email === "237tanishaqverma@gmail.com") : false}
                          onSeedVipsData={handleSeedVipsData}
                          isSeeding={isSeeding}
                          seedStatus={seedStatus}
                        />
                      )}
                      {activeView === "marketplace" && (
                        <MarketplaceView
                          onShowModal={() => setShowMarketModal(true)}
                          onOpenChat={(code, title) => {
                            setDirectChat({ code, title });
                            setActiveView("chat");
                          }}
                        />
                      )}
                      {activeView === "community" && (
                        <CommunityView
                          onShowModal={() => setShowPostModal(true)}
                          userRoles={globalUserRoles}
                          userColleges={globalUserColleges}
                        />
                      )}
                      {activeView === "admin" && isAdmin && (
                        <AdminPortal
                          userRoles={globalUserRoles}
                          userColleges={globalUserColleges}
                          isSeeding={isSeeding}
                          seedStatus={seedStatus}
                          handleSeedVipsData={handleSeedVipsData}
                        />
                      )}
                      {activeView === "support" && (
                        <SupportView
                          onShowModal={() => setShowIssueModal(true)}
                        />
                      )}
                      {activeView === "gigs" && (
                        <AcademicGigsView
                          userColleges={globalUserColleges}
                          onOpenChat={(code, title) => {
                            setDirectChat({ code, title });
                            setActiveView("chat");
                          }}
                        />
                      )}
                      {activeView === "profile" && (
                        <ProfileView userColleges={globalUserColleges} />
                      )}
                      {activeView === "chat" && (
                        <PrivateChatView
                          directChatCode={directChat?.code}
                          directChatTitle={directChat?.title}
                          onClearDirectChat={() => setDirectChat(null)}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Modals */}
        <AnimatePresence>
          {selectedTeacherId && (
            <TeacherDetailModal
              teacherId={selectedTeacherId}
              onClose={() => setSelectedTeacherId(null)}
              userCollegeId={user ? globalUserColleges[user.uid] : undefined}
              isRootAdmin={user ? (globalUserRoles[user.uid]?.includes("root_admin") || user.email === "237tanishaqverma@gmail.com") : false}
            />
          )}
          {showRefinedSearch && (
            <HierarchicalSearchModal
              onClose={() => setShowRefinedSearch(false)}
              onSelectTeacher={(tId) => {
                setShowRefinedSearch(false);
                setActiveView("teachers");
                // We could pass tId to focus, but for now just navigate
              }}
            />
          )}
          {showAddTeacherModal && (
            <AddTeacherModal
              onClose={() => setShowAddTeacherModal(false)}
              userCollegeId={user ? globalUserColleges[user.uid] : undefined}
            />
          )}
          {showMarketModal && (
            <AddMarketModal
              onClose={() => setShowMarketModal(false)}
              userCollegeId={user ? globalUserColleges[user.uid] : undefined}
            />
          )}
          {showIssueModal && (
            <RaiseIssueModal
              onClose={() => setShowIssueModal(false)}
              userCollegeId={user ? globalUserColleges[user.uid] : undefined}
            />
          )}
          {showPostModal && (
            <AddPostModal
              onClose={() => setShowPostModal(false)}
              userCollegeId={user ? globalUserColleges[user.uid] : undefined}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Local View Components ---

function DashboardView({
  onShowAddTeacher,
  onShowSearch,
  onJoinThread,
  onSelectCollege,
}: {
  onShowAddTeacher: () => void;
  onShowSearch: () => void;
  onJoinThread: () => void;
  onSelectCollege: (collegeId: string) => void;
}) {
  const { db, auth } = useFirebase();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pulsePost, setPulsePost] = useState<DiscussionPost | null>(null);
  const [counts, setCounts] = useState({ posts: 0, market: 0, reviews: 0 });

  const [showExploreDropdown, setShowExploreDropdown] = useState(false);
  const [exploreSearchTerm, setExploreSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExploreDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!db) return;

    // Teachers stream
    const unsubTeachers = onSnapshot(
      query(collection(db, "teachers"), where("status", "==", "active")),
      (snap) => {
        setTeachers(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Teacher),
        );
      },
    );

    // Recent Pulse
    const unsubPulse = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(1)),
      (snap) => {
        if (!snap.empty) {
          setPulsePost({
            id: snap.docs[0].id,
            ...snap.docs[0].data(),
          } as DiscussionPost);
        }
      },
    );

    // Counts for stats
    const unsubPostsCount = onSnapshot(collection(db, "posts"), (snap) => {
      setCounts((prev) => ({ ...prev, posts: snap.size }));
    });

    const unsubMarketCount = onSnapshot(
      collection(db, "marketplace"),
      (snap) => {
        setCounts((prev) => ({ ...prev, market: snap.size }));
      },
    );

    const unsubReviewsCount = onSnapshot(collection(db, "reviews"), (snap) => {
      setCounts((prev) => ({ ...prev, reviews: snap.size }));
    });

    return () => {
      unsubTeachers();
      unsubPulse();
      unsubPostsCount();
      unsubMarketCount();
      unsubReviewsCount();
    };
  }, [db]);

  const duTeachers = [...teachers]
    .filter((t) => t.universityId === "du")
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);

  const ipuTeachers = [...teachers]
    .filter((t) => t.universityId === "ipu")
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);

  // Group by college and average their teacher ratings
  const collegeRatings = teachers.reduce(
    (acc: Record<string, { total: number; count: number }>, t) => {
      const isRated = (t.averageRating && t.averageRating > 0) || (t.reviewCount && t.reviewCount > 0);
      if (isRated) {
        if (!acc[t.collegeId]) acc[t.collegeId] = { total: 0, count: 0 };
        acc[t.collegeId].total += t.averageRating;
        acc[t.collegeId].count += 1;
      }
      return acc;
    },
    {} as Record<string, { total: number; count: number }>,
  );

  const topColleges = Object.entries(collegeRatings)
    .map(([id, data]: [string, any]) => ({ id, avg: data.total / data.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-700 w-full px-6 lg:px-10">
      <div className="flex flex-col items-start gap-12 pb-12 border-b border-zinc-900 w-full">
        <div className="space-y-6 w-full">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-pulse" />
            <span className="mono-label tracking-[0.4em] text-[#8B5CF6] text-[9px]">
              REGISTRY // ACTIVE MEMBERS
            </span>
          </div>
          <div className="giant-display leading-[0.8] mix-blend-difference break-words text-5xl sm:text-7xl md:text-8xl lg:text-[10vw] xl:text-[120px] text-white">
            ACADAMEX
            <br />
            <span className="text-[#8B5CF6]">INTEL.</span>
          </div>
          <p className="max-w-2xl text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] leading-relaxed">
            Consensus-based academic student hub. Evaluating Faculty
            performance and campus asset circulation in real-time. Auth:{" "}
            <span className="text-[#8B5CF6]">
              L2 Operative // {auth?.currentUser?.displayName || "Unknown"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full relative z-20">
          <button
            onClick={onShowAddTeacher}
            className="group flex items-center justify-center gap-6 py-6 px-12 border border-zinc-800 text-white hover:bg-zinc-900 transition-all duration-500 whitespace-nowrap min-w-[250px]"
          >
            <Plus
              size={22}
              className="group-hover:rotate-90 transition-transform duration-500"
            />
            <span className="font-extrabold uppercase tracking-[0.4em] text-[12px]">
              Register Faculty
            </span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowExploreDropdown(!showExploreDropdown)}
              className="flex items-center justify-center gap-6 py-6 px-12 border border-zinc-800 text-white hover:bg-zinc-900 transition-all duration-500 whitespace-nowrap min-w-[250px] bg-zinc-950/20"
            >
              <Search size={22} className="text-[#8B5CF6]" />
              <span className="font-extrabold uppercase tracking-[0.4em] text-[12px]">
                Explore Colleges
              </span>
            </button>
            <AnimatePresence>
              {showExploreDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-[#0A0A0A] border border-zinc-900 shadow-2xl z-[100] custom-scrollbar"
                >
                  <div className="p-3 border-b border-zinc-900">
                    <input
                      type="text"
                      placeholder="SEARCH COLLEGE..."
                      value={exploreSearchTerm}
                      onChange={(e) => setExploreSearchTerm(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 text-white py-2 px-3 outline-none uppercase font-mono text-[10px] focus:border-[#8B5CF6] transition-all placeholder:text-zinc-700"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900/60 custom-scrollbar">
                    {UNIVERSITIES.map((uni) => {
                      const colleges = uni.collegeIds
                        .map((cId) => COLLEGES[cId])
                        .filter(Boolean)
                        .filter((c) =>
                          c.name.toLowerCase().includes(exploreSearchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(exploreSearchTerm.toLowerCase())
                        );

                      if (colleges.length === 0) return null;

                      return (
                        <div key={uni.id} className="p-3">
                          <div className="text-[8px] font-black tracking-widest text-[#8B5CF6] uppercase mb-2 font-mono">
                            {uni.name}
                          </div>
                          <div className="space-y-1">
                            {colleges.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  onSelectCollege(c.id);
                                  setShowExploreDropdown(false);
                                  setExploreSearchTerm("");
                                }}
                                className="w-full text-left p-2 hover:bg-zinc-900 font-mono transition-colors text-[10px] text-zinc-300 hover:text-white uppercase leading-tight flex items-center justify-between"
                              >
                                <span>{c.name}</span>
                                <ChevronRight size={10} className="text-zinc-700 flex-shrink-0 ml-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {UNIVERSITIES.every((uni) => {
                      const colleges = uni.collegeIds
                        .map((cId) => COLLEGES[cId])
                        .filter(Boolean)
                        .filter((c) =>
                          c.name.toLowerCase().includes(exploreSearchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(exploreSearchTerm.toLowerCase())
                        );
                      return colleges.length === 0;
                    }) && (
                      <div className="p-4 text-center text-[10px] font-mono text-zinc-600 uppercase italic">
                        No colleges match criteria.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-zinc-900 py-16">
        <StatCard
          label="Faculty Profiles"
          value={teachers.length.toLocaleString()}
          trend="+12"
          icon={Cpu}
          description="Real-time monitoring of academic teachers. Analysis covers delivery metrics, exam predictability, and syllabus compliance across all colleges."
        />
        <StatCard
          label="Campus Posts"
          value={counts.posts.toLocaleString()}
          trend="+45"
          icon={FileText}
          description="Peer-verified student shares. Insights on exam patterns, library hacks, and resource availability shared through general community posts."
        />
        <StatCard
          label="Resource trade"
          value={counts.market.toLocaleString()}
          trend="-2"
          icon={ShoppingBag}
          description="Secure liquidation of high-value academic assets. From limited edition research sets to hardware schematics, bypassing traditional institutional delays."
        />
      </div>

      {/* Leaderboards */}
      <div className="space-y-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <LeaderboardTable title="Top 10 DU Faculty Profiles" data={duTeachers} />
          <LeaderboardTable
            title="Top 10 IPU Faculty Profiles"
            data={ipuTeachers}
          />
        </div>

        <div className="vantage-card border-[#8B5CF6]/30">
          <h3 className="text-xl font-black uppercase tracking-tight italic mb-8 pb-4 border-b border-zinc-800 flex items-center gap-3">
            <TrendingUp size={20} className="text-[#8B5CF6]" />
            Global Elite: Top 5 Colleges
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {topColleges.map((c, i) => (
              <div
                key={c.id}
                className="bg-[#0A0A0A] p-6 border border-zinc-900 group hover:border-[#8B5CF6] transition-all"
              >
                <div className="text-[10px] mono-label text-zinc-500 mb-2">
                  Rank 0{i + 1}
                </div>
                <div className="text-sm font-black text-white uppercase mb-4 leading-tight min-h-[3em]">
                  {COLLEGES[c.id]?.name || c.id}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6]"
                      style={{ width: `${c.avg * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black">
                    {c.avg.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
            {topColleges.length === 0 && (
              <p className="col-span-last text-zinc-600 italic">
                Global consensus pending...
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="vantage-card bg-zinc-900 border-none">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">
              Campus Pulse
            </h3>
            <span className="text-[10px] text-emerald-500 font-black animate-pulse uppercase tracking-[0.2em]">
              LIVE // 0xAF
            </span>
          </div>
          <div className="space-y-8">
            <div className="italic font-serif opacity-90 text-lg border-l-4 border-[#8B5CF6] pl-6 py-2">
              {pulsePost
                ? `"${pulsePost.content}"`
                : '"Initializing student stream... loading community broadcast."'}
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
              <span className="mono-label">
                {pulsePost
                  ? `${pulsePost.userName} // Community Post`
                  : "Consensus pending..."}
              </span>
              <button
                type="button"
                onClick={() => {
                  console.log("Navigating to community view...");
                  onJoinThread();
                }}
                className="text-[#8B5CF6] text-xs font-black uppercase tracking-[0.2em] hover:underline cursor-pointer"
              >
                Join Thread
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchProtocolResults({
  query,
  onSelect,
  userCollegeId,
  isRootAdmin,
}: {
  query: string;
  onSelect: (type: string, id: string, collegeId?: string) => void;
  userCollegeId?: string;
  isRootAdmin?: boolean;
}) {
  const { db, user } = useFirebase();
  const q = query.toLowerCase();
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "teachers"), (snap) => {
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Teacher));
    });
    return unsub;
  }, [db]);

  const matchedUnis = UNIVERSITIES.filter((u) =>
    u.name.toLowerCase().includes(q),
  );
  const matchedColleges = Object.values(COLLEGES).filter((c) =>
    c.name.toLowerCase().includes(q),
  );
  const matchedTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q),
  );

  return (
    <div className="p-4 space-y-6">
      {matchedUnis.length > 0 && (
        <div>
          <div className="mono-label text-[8px] text-zinc-600 mb-2 uppercase">
            Universities
          </div>
          {matchedUnis.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelect("uni", u.id)}
              className="w-full text-left p-3 hover:bg-zinc-900 transition-colors border-b border-zinc-900 flex items-center justify-between group"
            >
              <span className="text-[10px] font-black text-white uppercase">
                {u.name}
              </span>
              <ChevronRight
                size={12}
                className="text-zinc-700 group-hover:text-[#8B5CF6]"
              />
            </button>
          ))}
        </div>
      )}
      {matchedColleges.length > 0 && (
        <div>
          <div className="mono-label text-[8px] text-zinc-600 mb-2 uppercase">
            Colleges
          </div>
          {matchedColleges.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect("college", c.id)}
              className="w-full text-left p-3 hover:bg-zinc-900 transition-colors border-b border-zinc-900 flex items-center justify-between group"
            >
              <span className="text-[10px] font-black text-white uppercase">
                {c.name}
              </span>
              <ChevronRight
                size={12}
                className="text-zinc-700 group-hover:text-[#8B5CF6]"
              />
            </button>
          ))}
        </div>
      )}
      {matchedTeachers.length > 0 && (
        <div>
          <div className="mono-label text-[8px] text-zinc-600 mb-2 uppercase">
            Faculty
          </div>
          {matchedTeachers.map((t) => {
            const isLocked = userCollegeId && userCollegeId !== t.collegeId && user?.email !== "237tanishaqverma@gmail.com";
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isLocked) {
                    alert(`ACCESS DENIED: As a student of ${COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()}, you are not permitted to open profiles or submit reviews for teachers from other colleges.`);
                    return;
                  }
                  onSelect("teacher", t.id, t.collegeId);
                }}
                className={`w-full text-left p-3 hover:bg-zinc-900 transition-colors border-b border-zinc-900 flex items-center justify-between group ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div>
                  <div className="text-[10px] font-black text-white uppercase flex items-center gap-1.5">
                    {t.name}
                    {isLocked && (
                      <span className="text-[7px] text-amber-500 font-bold bg-amber-950/20 px-1 border border-amber-900">🔒 LOCKED</span>
                    )}
                  </div>
                  <div className="text-[8px] mono-label text-zinc-500 uppercase flex flex-wrap gap-1 mt-1.5">
                    <span className="text-zinc-600 mr-1">{COLLEGES[t.collegeId]?.name.split(" ")[0]} //</span>
                    {t.subject.split("/").map((subj) => (
                      <span key={subj} className="bg-zinc-950 border border-zinc-900 text-zinc-400 text-[8px] px-1.5 py-0.2 uppercase font-mono tracking-wide rounded-sm group-hover:border-zinc-800 transition-colors">
                        {subj.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight
                  size={12}
                  className="text-zinc-700 group-hover:text-[#8B5CF6]"
                />
              </button>
            );
          })}
        </div>
      )}
      {matchedUnis.length === 0 &&
        matchedColleges.length === 0 &&
        matchedTeachers.length === 0 && (
          <div className="py-8 text-center mono-label text-[9px] text-zinc-700 uppercase italic">
            Null results // check query
          </div>
        )}
    </div>
  );
}

function CollegeHubView({
  collegeId,
  onClose,
  onSelectTeacher,
  userCollegeId,
  isRootAdmin,
}: {
  collegeId: string;
  onClose: () => void;
  onSelectTeacher: (id: string, collegeId?: string) => void;
  userCollegeId?: string;
  isRootAdmin?: boolean;
}) {
  const [tab, setTab] = useState<"teachers" | "curriculum" | "market">("teachers");
  const college = COLLEGES[collegeId];
  const { db, auth, user } = useFirebase();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  useEffect(() => {
    if (!db) return;
    const unsubT = onSnapshot(
      query(collection(db, "teachers"), where("collegeId", "==", collegeId)),
      (snap) => {
        setTeachers(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Teacher),
        );
      },
    );
    const unsubM = onSnapshot(
      query(collection(db, "marketplace"), where("collegeId", "==", collegeId)),
      (snap) => {
        setMarketItems(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MarketItem),
        );
      },
    );
    return () => {
      unsubT();
      unsubM();
    };
  }, [db, collegeId]);

  const markAsSold = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "marketplace", id), { status: "sold" });
      setSelectedItem(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "marketplace", auth);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-8 gap-6">
        <div>
          <button
            onClick={onClose}
            className="mono-label text-[#8B5CF6] hover:underline mb-4 flex items-center gap-2"
          >
            <ChevronRight size={12} className="rotate-180" /> Global Network
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
            {college?.name}
          </h1>
        </div>
        <div className="flex bg-[#0A0A0A] p-1 border border-zinc-900 self-start md:self-auto">
          <button
            id="tab-btn-teachers"
            onClick={() => setTab("teachers")}
            className={`px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${tab === "teachers" ? "bg-[#8B5CF6] text-white shadow-xl" : "text-zinc-600 hover:text-white"}`}
          >
            Teachers & Ratings
          </button>
          <button
            id="tab-btn-curriculum"
            onClick={() => setTab("curriculum")}
            className={`px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${tab === "curriculum" ? "bg-[#8B5CF6] text-white shadow-xl" : "text-zinc-600 hover:text-white"}`}
          >
            Curriculum Hub
          </button>
          <button
            id="tab-btn-market"
            onClick={() => setTab("market")}
            className={`px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${tab === "market" ? "bg-[#8B5CF6] text-white shadow-xl" : "text-zinc-600 hover:text-white"}`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {tab === "teachers" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((t) => {
            const isLocked = userCollegeId && userCollegeId !== t.collegeId && user?.email !== "237tanishaqverma@gmail.com";
            return (
              <div
                key={t.id}
                onClick={() => {
                  if (isLocked) {
                    alert(`ACCESS DENIED: As a student of ${COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()}, you are not permitted to open profiles or submit reviews for teachers from other colleges.`);
                    return;
                  }
                  onSelectTeacher(t.id, t.collegeId);
                }}
                className={`vantage-card group ${isLocked ? "cursor-not-allowed opacity-65 border-zinc-950" : "cursor-pointer hover:border-[#8B5CF6]"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-black text-white uppercase group-hover:text-[#8B5CF6] transition-colors flex flex-col gap-1">
                    <span>{t.name}</span>
                  </div>
                  {isLocked && (
                    <span className="text-[8px] font-mono text-amber-500 bg-amber-950/20 px-1 border border-amber-900 font-bold uppercase tracking-widest">
                      🔒 LOCKED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {t.subject.split("/").map((subj) => (
                    <span key={subj} className="bg-zinc-950 border border-zinc-900 text-[#a78bfa] group-hover:border-zinc-800 text-[9px] px-2 py-0.5 uppercase font-mono tracking-wide rounded-sm flex items-center gap-1">
                      <span>📚</span>
                      <span>{subj.trim()}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-between items-center">
                  <div className="text-2xl font-black italic">
                    {t.averageRating.toFixed(1)}
                  </div>
                  <div className="mono-label text-[9px] text-zinc-600">
                    {t.reviewCount} Reviews
                  </div>
                </div>
              </div>
            );
          })}
          {teachers.length === 0 && (
            <p className="col-span-full py-20 text-center mono-label opacity-40 italic">
              No faculty profiles registered for this college.
            </p>
          )}
        </div>
      )}

      {tab === "curriculum" && (
        <CollegeCurriculumView
          collegeId={collegeId}
          collegeName={college?.name || "This College"}
          courseIds={college?.courseIds || []}
          localTeachers={teachers}
          onSelectTeacher={onSelectTeacher}
          userCollegeId={userCollegeId}
          isRootAdmin={isRootAdmin}
        />
      )}

      {tab === "market" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketItems.map((item: MarketItem) => (
            <MarketItemCard
              key={item.id}
              data={item}
              onInspect={() => setSelectedItem(item)}
              viewerId={user?.uid}
            />
          ))}
          {marketItems.length === 0 && (
            <p className="col-span-full py-20 text-center mono-label opacity-40 italic">
              No assets detected in this college sector.
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <MarketInspectModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            isOwner={user?.uid === selectedItem.sellerId}
            onMarkSold={() => markAsSold(selectedItem.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Curriculum Explorer Helpers
 */
function getYearCountForCourse(courseId: string): number {
  if (["btech", "mbbs", "bams", "bhms", "bpt"].includes(courseId)) return 4;
  if (["llb", "ba_bed"].includes(courseId)) return 5;
  if (["mca", "mba", "mtech", "msc", "mcom", "llm", "ma"].includes(courseId)) return 2;
  return 3; // Standard 3 Year (BCA, BBA, B.Com Hons, Eco Hons, BA Hons, B.Sc Hons, B.Sc Prog, B.Com Prog, etc.)
}

function getSubjectsForYear(courseId: string, yearNum: number, allSubjects: string[]): string[] {
  const years = getYearCountForCourse(courseId);
  const itemsPerYear = Math.max(6, Math.ceil(allSubjects.length / years));
  const startIndex = (yearNum - 1) * itemsPerYear;
  const sliced = allSubjects.slice(startIndex, startIndex + itemsPerYear);
  if (sliced.length === 0) {
    return [
      `CORE RESEARCH PRACTICES - YEAR 0${yearNum}`,
      `INTERDISCIPLINARY ELECTIVE - TRACK 0${yearNum}`,
      `PRACTICAL PORTFOLIO SUBMISSION`
    ];
  }
  return sliced;
}

function generateSubjectCode(subject: string): string {
  const words = subject.split(" ").filter(w => w.length > 2 && w !== "AND" && w !== "FOR" && w !== "THE");
  const prefix = words.map(w => w[0]).join("").substring(0, 3).toUpperCase();
  let numHash = 100;
  for (let i = 0; i < subject.length; i++) {
    numHash = (numHash + subject.charCodeAt(i)) % 900;
  }
  return `${prefix || "AC"}-${100 + numHash}`;
}

function getSubjectDifficulty(subject: string): { rating: number; level: string; color: string; bgClass: string; label: string } {
  let score = 5.0;
  const s = subject.toLowerCase();
  if (s.includes("mathematics") || s.includes("physics") || s.includes("chemistry") || s.includes("quantum") || s.includes("algorithms") || s.includes("compiler") || s.includes("mbbs") || s.includes("anatomy") || s.includes("physio") || s.includes("microprocessors")) {
    score = 8.6 + (subject.length % 10) / 10;
  } else if (s.includes("programming") || s.includes("java") || s.includes("structure") || s.includes("net") || s.includes("dbms") || s.includes("accounting") || s.includes("economics") || s.includes("finance") || s.includes("law") || s.includes("surgery") || s.includes("pathology") || s.includes("viva") || s.includes("tax")) {
    score = 6.8 + (subject.length % 10) / 10;
  } else if (s.includes("english") || s.includes("communication") || s.includes("humanities") || s.includes("sociology") || s.includes("aspirant") || s.includes("creative") || s.includes("seminar") || s.includes("lab") || s.includes("practice")) {
    score = 3.5 + (subject.length % 10) / 10;
  } else {
    score = 5.5 + (subject.length % 10) / 10;
  }
  
  if (score >= 8.0) {
    return { rating: score, level: "CRITICAL", color: "text-red-500", bgClass: "bg-red-950/20 border-red-900/60 text-red-400", label: "Brutally Difficult - Requires continuous homework & active laboratory focus" };
  } else if (score >= 6.0) {
    return { rating: score, level: "MODERATE", color: "text-amber-500", bgClass: "bg-amber-950/20 border-amber-900/60 text-amber-400", label: "Standard Core - Thorough study, assignments, and MST prep needed to clear" };
  } else {
    return { rating: score, level: "LIGHT", color: "text-emerald-500", bgClass: "bg-emerald-950/20 border-emerald-900/60 text-emerald-400", label: "Cakewalk - Last-night crash guides and regular assignments guarantee solid internal score" };
  }
}

function getRecommendedBooks(subject: string): string[] {
  const s = subject.toLowerCase();
  if (s.includes("math")) {
    return ["Higher Engineering Mathematics by B.S. Grewal (Khanna Publishers)", "Advanced Engineering Mathematics by Erwin Kreyszig (Wiley Press)"];
  }
  if (s.includes("physics")) {
    return ["Concept of Physics by H.C. Verma (Bharati Bhawan)", "A Textbook of Engineering Physics by M.N. Avadhanulu & P.G. Kshirsagar"];
  }
  if (s.includes("chemistry")) {
    return ["Engineering Chemistry by Jain & Jain (Dhanpat Rai Publishing)", "Textbook of Engineering Chemistry by Shashi Chawla"];
  }
  if (s.includes("programming") || s.includes("java") || s.includes("c ") || s.includes("c++") || s.includes("python") || s.includes("code") || s.includes("structure") || s.includes("algorithms") || s.includes("compiler")) {
    return ["Object-Oriented Programming with C++ by E. Balagurusamy (McGraw Hill)", "Introduction to Algorithms by Cormen, Leiserson, Rivest & Stein", "Data Structures Using C by Reema Thareja (Oxford Press)"];
  }
  if (s.includes("dbms") || s.includes("database") || s.includes("sql")) {
    return ["Database System Concepts by Korth, Silberschatz & Sudarshan", "Fundamentals of Database Systems by Ramez Elmasri & Shamkant Navathe"];
  }
  if (s.includes("law") || s.includes("constitution") || s.includes("legal") || s.includes("court") || s.includes("tort")) {
    return ["Constitutional Law of India by Dr. J.N. Pandey (Central Law Agency)", "Indian Constitutional Law by M.P. Jain (LexisNexis)"];
  }
  if (s.includes("accounting") || s.includes("finance") || s.includes("audit") || s.includes("tax") || s.includes("cost")) {
    return ["Corporate Accounting by PC Tulsian (S. Chand)", "Financial Management Theory & Practice by Prasanna Chandra (McGraw Hill)"];
  }
  if (s.includes("marketing") || s.includes("management") || s.includes("business") || s.includes("behaviour")) {
    return ["Principles of Marketing by Philip Kotler & Gary Armstrong (Pearson)", "Organizational Behavior by Stephen P. Robbins (Pearson Education)"];
  }
  if (s.includes("economics") || s.includes("micro") || s.includes("macro") || s.includes("fiscal") || s.includes("policy")) {
    return ["Principles of Economics by N. Gregory Mankiw (Cengage)", "Macroeconomics by Richard T. Froyen (Pearson Asia)"];
  }
  if (s.includes("anatomy") || s.includes("physio") || s.includes("medicine") || s.includes("surgery") || s.includes("nursing") || s.includes("mbbs") || s.includes("parasit") || s.includes("pathology")) {
    return ["BD Chaurasia's Human Anatomy Vol 1-3", "Guyton and Hall Textbook of Medical Physiology (Elsevier)"];
  }
  return ["University Prescribed Syllabus Reference Guide (Official Edition)", "Local Delhi-NCR Student Co-Op Notes & Past papers compilation"];
}

function getCollegeSurvivalTip(collegeId: string, collegeName: string, subject: string): string {
  const isDu = collegeId === "andc" || collegeId === "aditi" || collegeId === "aryabhatta" || collegeId === "arsd" || 
               collegeId === "bnc" || collegeId === "bharati" || collegeId === "bcas" || collegeId === "cvs" || 
               collegeId === "daulat_ram" || collegeId === "ddu" || collegeId === "dcac" || collegeId === "deshbandhu" || 
               collegeId === "grs" || collegeId === "brambedkar" || collegeId === "dyal_singh" || collegeId === "dyal_singh_eve" || 
               collegeId === "gargi" || collegeId === "hansraj" || collegeId === "hindu" || collegeId === "indrapra_women" || 
               collegeId === "ihe" || collegeId === "jdm" || collegeId === "jesus_mary" || collegeId === "kalindi" || 
               collegeId === "kamala_nehru" || collegeId === "keshav_mv" || collegeId === "kmc" || collegeId === "lic" || 
               collegeId === "lsr" || collegeId === "lakshmibai" || collegeId === "mah_agrasen_du" || collegeId === "maitreyi" || 
               collegeId === "matasundri" || collegeId === "miranda" || collegeId === "motilal_nehru" || collegeId === "motilal_nehru_eve" || 
               collegeId === "pgdav" || collegeId === "pgdav_eve" || collegeId === "rajdhani" || collegeId === "rla" || 
               collegeId === "ramanujan" || collegeId === "ramjas" || collegeId === "satyawati" || collegeId === "satyawati_eve" || 
               collegeId === "sbs" || collegeId === "sbs_eve" || collegeId === "srcasw" || collegeId === "ssccbs" || 
               collegeId === "shivaji" || collegeId === "srcc" || collegeId === "shyamlal" || collegeId === "shyamlal_eve" || 
               collegeId === "spm" || collegeId === "aurobindo" || collegeId === "aurobindo_eve" || collegeId === "sggsc" || 
               collegeId === "sgnnd_khalsa" || collegeId === "sgtb_khalsa" || collegeId === "venkateswara" || 
               collegeId === "stephens" || collegeId === "shraddhanand" || collegeId === "vivekananda" || 
               collegeId === "zakir_husain" || collegeId === "zakir_husain_eve" || collegeId === "dsj" || collegeId === "igipess";

  const cleanName = collegeName.replace(/\(.*?\)/g, "").trim();

  if (isDu) {
    return `At Delhi University (${cleanName}), under the National Education Policy (NEP) curriculum UGCF, internal assessments constitute 25%-35% of the total semester grading. For "${subject}", tutorial writeups, class tests, and active seminar presentations are logged weekly. Faculty members at ${cleanName} track attendance rigorously; remaining above the tutorial criteria is instrumental in securing high internal marks and full marks in continuous appraisal scales.`;
  } else {
    return `At GGSIPU (${cleanName}), the internal assessment constitutes a critical 25% block comprising MSIT/MAIT level 'Minor Examinations' and lab assignment compliance. For "${subject}", minor written tests are highly detailed. Academic coordinators monitor mandatory biometric database logs closely. Submitting high-grade practical records from practical sessions on time will guarantee healthy internal scoring components.`;
  }
}

/**
 * CollegeCurriculumView Component
 */
function CollegeCurriculumView({
  collegeId,
  collegeName,
  courseIds,
  localTeachers,
  onSelectTeacher,
  userCollegeId,
  isRootAdmin,
}: {
  collegeId: string;
  collegeName: string;
  courseIds: string[];
  localTeachers: Teacher[];
  onSelectTeacher: (id: string, collegeId?: string) => void;
  userCollegeId?: string;
  isRootAdmin?: boolean;
}) {
  const { user } = useFirebase();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIds[0] || "");
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>("");
  const [activeDossier, setActiveDossier] = useState<{ name: string; courseId: string; year: number } | null>(null);

  // Fallback check
  useEffect(() => {
    if (courseIds.length > 0 && !courseIds.includes(selectedCourseId)) {
      setSelectedCourseId(courseIds[0]);
      setSelectedYear(1);
    }
  }, [courseIds, selectedCourseId]);

  const currentCourse = COURSES[selectedCourseId];
  const maxYear = getYearCountForCourse(selectedCourseId);

  // Cap selected year
  const resolvedYear = Math.min(selectedYear, maxYear);

  // Extract all unique subjects from local teachers mapped to the selected course id
  const localTeacherSubjectsForCourse = Array.from(
    new Set(
      localTeachers
        .filter((t) => t.courseId?.toLowerCase() === selectedCourseId.toLowerCase())
        .map((t) => t.subject)
    )
  );

  // Combine with static course subjects from academicData.ts, keeping uniqueness (case-insensitive)
  const combinedSubjectsMap = new Map<string, string>();

  (currentCourse?.subjects || []).forEach((s) => {
    combinedSubjectsMap.set(s.toUpperCase().trim(), s);
  });

  localTeacherSubjectsForCourse.forEach((s) => {
    const key = s.toUpperCase().trim();
    if (!combinedSubjectsMap.has(key)) {
      combinedSubjectsMap.set(key, s);
    }
  });

  const allSubjectsOfCourse = Array.from(combinedSubjectsMap.values());
  const yearSubjects = getSubjectsForYear(selectedCourseId, resolvedYear, allSubjectsOfCourse);

  const filteredSubjects = yearSubjects.filter(s =>
    s.toLowerCase().includes(subjectSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Cpu size={18} className="text-[#8B5CF6]" />
        <span className="mono-label text-[10px] text-zinc-400">CURRICULUM SPECIFICATIONS FOR {collegeName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Offered Programmes column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-[10px] mono-label text-zinc-500 uppercase tracking-widest pl-1">Offered Programmes</div>
          <div className="space-y-2 border-r border-zinc-900 pr-4">
            {courseIds.map((cId) => {
              const info = COURSES[cId];
              const isSelected = selectedCourseId === cId;
              return (
                <button
                  key={cId}
                  id={`program-btn-${cId}`}
                  onClick={() => {
                    setSelectedCourseId(cId);
                    setSelectedYear(1);
                    setSubjectSearchQuery("");
                  }}
                  className={`w-full text-left p-4 transition-all duration-300 border ${isSelected ? "bg-white border-white text-black font-black" : "bg-[#050505] border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-white"}`}
                >
                  <div className="text-[9px] font-bold tracking-wider uppercase mb-1">{cId.toUpperCase()}</div>
                  <div className="text-xs uppercase leading-tight truncate">{info?.name || cId}</div>
                  <div className="text-[8px] opacity-60 mt-1 uppercase font-mono">{info?.subjects.length || 0} TOTAL CORE COURSES</div>
                </button>
              );
            })}
            {courseIds.length === 0 && (
              <div className="text-xs italic text-zinc-700 p-4">No specific courses structured.</div>
            )}
          </div>
        </div>

        {/* Subjects & Years Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Year Selector Timeline */}
          <div className="bg-[#050505] border border-zinc-900 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <span className="text-[9px] mono-label text-zinc-500 uppercase">Academic Timeline Grid</span>
              <span className="text-[10px] font-black text-[#8B5CF6] uppercase">{currentCourse?.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: maxYear }, (_, i) => i + 1).map((yr) => {
                const isActive = resolvedYear === yr;
                return (
                  <button
                    key={yr}
                    id={`year-btn-${yr}`}
                    onClick={() => {
                      setSelectedYear(yr);
                      setSubjectSearchQuery("");
                    }}
                    className={`flex-1 min-w-[70px] text-center py-3 border text-[9px] font-mono transition-all font-bold ${isActive ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-black border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-white"}`}
                  >
                    YEAR {yr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Search on subjects */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
            <input
              type="text"
              id="curriculum-subject-search"
              placeholder={`SEARCH SUBJECTS REGISTERED UNDER YEAR 0${resolvedYear}...`}
              value={subjectSearchQuery}
              onChange={(e) => setSubjectSearchQuery(e.target.value)}
              className="w-full bg-[#030303] border border-zinc-900 py-3 pl-12 pr-6 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#8B5CF6] transition-all"
            />
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubjects.map((sub, idx) => {
              const code = generateSubjectCode(sub);
              const difficulty = getSubjectDifficulty(sub);
              
              // Faculty assigned to this subject at this specific college
              const mappedTeachers = localTeachers.filter(t => 
                t.subject.toLowerCase().includes(sub.toLowerCase()) || 
                sub.toLowerCase().includes(t.subject.toLowerCase())
              );

              return (
                <div
                  key={idx}
                  id={`subject-card-${idx}`}
                  onClick={() => setActiveDossier({ name: sub, courseId: selectedCourseId, year: resolvedYear })}
                  className="bg-[#050505] border border-zinc-900 p-6 flex flex-col justify-between hover:border-[#8B5CF6]/85 hover:bg-[#070707] transition-all duration-300 group relative overflow-hidden cursor-pointer active:scale-[0.995]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-600 font-bold group-hover:text-zinc-400 transition-colors uppercase">{code}</span>
                      <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 border ${difficulty.bgClass} uppercase`}>
                        {difficulty.level}
                      </span>
                    </div>
                    <div className="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#8B5CF6] transition-colors">
                      {sub}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-950 flex items-center justify-between text-[10px]">
                    <div className="mono-label text-[8px] text-zinc-500 uppercase">
                      {mappedTeachers.length > 0 ? `${mappedTeachers.length} Dedicated Instructors` : "General Syllabus Module"}
                    </div>
                    <span
                      id={`explore-matrix-btn-${idx}`}
                      className="text-[#8B5CF6] group-hover:text-white transition-colors uppercase font-black tracking-widest text-[8px] flex items-center gap-1"
                    >
                      EXPLORE DOSSIER <ChevronRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredSubjects.length === 0 && (
              <div className="col-span-2 py-16 bg-[#030303] border border-dashed border-zinc-900 text-center mono-label text-zinc-700 text-[10px] uppercase italic">
                Syllabus registers scanned: empty matching criteria
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Subject Dossier Overlays Overlay with Custom AnimatePresence */}
      {activeDossier && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-[#070707] border border-zinc-800 p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[92vh] custom-scrollbar"
          >
            {/* Close Button */}
            <button
              id="close-dossier-btn"
              onClick={() => setActiveDossier(null)}
              className="absolute right-8 top-8 text-[#555] hover:text-white transition-colors flex items-center gap-2 border border-zinc-900 px-3 py-1 text-[8px] font-bold uppercase tracking-widest hover:border-zinc-600 bg-black"
            >
              CLOSE <X size={14} />
            </button>

            {/* Dossier Header */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 text-[#A78BFA] text-[8px] font-black tracking-widest px-3 py-1 uppercase rounded-full">
                  SUBJECT INTELLIGENCE REPORT
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  CODE: {generateSubjectCode(activeDossier.name)}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight mr-16">
                {activeDossier.name}
              </h1>
              <div className="text-[10px] mono-label text-zinc-500 uppercase tracking-widest border-l-2 border-[#8B5CF6] pl-3">
                REGISTERED UNDER: {COURSES[activeDossier.courseId]?.name} // YEAR 0{activeDossier.year}
              </div>
            </div>

            {/* Content Dossier split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-zinc-900 pt-8">
              {/* Left columns */}
              <div className="lg:col-span-7 space-y-8">
                {/* Curriculum Syllabus Modules Core */}
                <div className="space-y-4 bg-black/40 border border-zinc-900/60 p-6 md:p-8 rounded-none">
                  <div className="text-[10px] mono-label text-zinc-400 uppercase tracking-widest mb-4 pb-2 border-b border-zinc-900">
                    Syllabus Chapters Blueprint
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#8B5CF6] font-black uppercase">UNIT I // CORE FOUNDATIONAL DISCOURSE</span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed capitalize">
                        Introduction to fundamental principles of {activeDossier.name.toLowerCase()} analysis, axiomatic definitions, core literature frameworks, and basic diagnostic methodologies.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#8B5CF6] font-black uppercase">UNIT II // APPLIED SYSTEMS & CASE MATRIX</span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed capitalize">
                        Detailed study of structural setups, laboratory experimentation guidelines, standard testing pipelines, and historical case studies corresponding to intermediate practices.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#8B5CF6] font-black uppercase">UNIT III // METHODOLOGY & SYSTEM ARCHITECTURE</span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed capitalize">
                        Applied procedures, system simulation modules, design heuristics, statistical significance metrics, and practical deployment evaluations.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#8B5CF6] font-black uppercase">UNIT IV // SPECIALIZED ADVANCEMENTS AND ELECTIVES</span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed capitalize">
                        Future innovations, state-of-the-art developments, industrial integration paradigms, global consensus frameworks, and final projects analysis.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommended books */}
                <div className="space-y-4 bg-black/40 border border-zinc-900/60 p-6 md:p-8 rounded-none">
                  <div className="text-[10px] mono-label text-zinc-400 uppercase tracking-widest pb-2 border-b border-zinc-900">
                    Recommended Core Textbooks
                  </div>
                  <div className="space-y-4">
                    {getRecommendedBooks(activeDossier.name).map((book, bIdx) => (
                      <div key={bIdx} className="flex gap-3 items-start">
                        <div className="bg-[#8B5CF6]/10 text-[#a78bfa] font-black font-mono text-[9px] px-2 py-0.5 tracking-tight mt-0.5">
                          BK/0{bIdx + 1}
                        </div>
                        <p className="text-xs text-white uppercase font-black tracking-tight">{book}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-5 space-y-8">
                {/* Difficulty appraisal */}
                <div className="space-y-4 bg-[#0a0a0a] border border-zinc-900 p-6">
                  <span className="text-[10px] mono-label text-zinc-500 uppercase tracking-widest block">Passing Difficulty Matrix</span>
                  {(() => {
                    const diff = getSubjectDifficulty(activeDossier.name);
                    return (
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className={`${diff.color} text-2xl font-black italic`}>{diff.rating.toFixed(1)}/10</span>
                          <span className="text-[9px] font-black tracking-widest text-[#a78bfa]">{diff.level} STATUS</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-2 border border-zinc-900 overflow-hidden">
                          <div className="bg-[#8B5CF6] h-full" style={{ width: `${diff.rating * 10}%` }}></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal uppercase">{diff.label}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Survival warning inside this college */}
                <div className="space-y-4 bg-[#0F0A1A]/30 border border-[#8B5CF6]/10 p-6 rounded-none relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-16 w-16 bg-[#8B5CF6]/5 rounded-bl-full pointer-events-none"></div>
                  <span className="text-[10px] mono-label text-zinc-400 uppercase tracking-widest block font-bold text-[#A78BFA]">
                    Classroom Insider: {collegeName}
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-tight text-justify">
                    {getCollegeSurvivalTip(collegeId, collegeName, activeDossier.name)}
                  </p>
                </div>

                {/* Local Faculty link registry */}
                <div className="space-y-4 bg-black/40 border border-zinc-900/60 p-6 rounded-none">
                  <span className="text-[10px] mono-label text-zinc-500 uppercase tracking-widest block">
                    Linked College Faculty
                  </span>
                  {(() => {
                    // Match teachers who register this subject
                    const matchedTeachers = localTeachers.filter(t => 
                      t.subject.toLowerCase().includes(activeDossier.name.toLowerCase()) || 
                      activeDossier.name.toLowerCase().includes(t.subject.toLowerCase())
                    );
                    
                    if (matchedTeachers.length > 0) {
                      return (
                        <div className="space-y-3">
                          <p className="text-[9px] text-zinc-500 uppercase">
                            The following active faculty profiles teach {activeDossier.name.toLowerCase()} or related blocks:
                          </p>
                          <div className="space-y-2">
                            {matchedTeachers.map((t) => {
                              const isLocked = userCollegeId && userCollegeId !== t.collegeId && user?.email !== "237tanishaqverma@gmail.com";
                              return (
                                <button
                                  key={t.id}
                                  id={`link-teacher-btn-${t.id}`}
                                  onClick={() => {
                                    if (isLocked) {
                                      alert(`ACCESS DENIED: As a student of ${COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()}, you are not permitted to open profiles or submit reviews for teachers from other colleges.`);
                                      return;
                                    }
                                    setActiveDossier(null);
                                    onSelectTeacher(t.id, t.collegeId);
                                  }}
                                  className={`w-full flex items-center justify-between p-3 border border-zinc-900 bg-black/80 transition-all group ${isLocked ? "cursor-not-allowed opacity-65" : "hover:border-[#8B5CF6]"}`}
                                >
                                  <span className="text-[10px] font-black text-white group-hover:text-[#a78bfa] uppercase truncate pr-2">
                                    {t.name} {isLocked && "🔒 (LOCKED)"}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-zinc-600 font-bold">
                                      RATING: {t.averageRating.toFixed(1)}
                                    </span>
                                    <ChevronRight size={10} className="text-[#8B5CF6]" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-3">
                          <p className="text-[10px] text-zinc-600 italic uppercase">
                            No active faculty profile has targeted this specific subject yet.
                          </p>
                          {localTeachers.length > 0 ? (
                            <div className="pt-2">
                              <p className="text-[9px] text-zinc-500 uppercase mb-2">General {collegeName} registry instructors:</p>
                              <div className="max-h-[120px] overflow-y-auto space-y-1 custom-scrollbar">
                                {localTeachers.slice(0, 3).map((t) => {
                                  const isLocked = userCollegeId && userCollegeId !== t.collegeId && user?.email !== "237tanishaqverma@gmail.com";
                                  return (
                                    <button
                                      key={t.id}
                                      id={`link-teacher-fallback-btn-${t.id}`}
                                      onClick={() => {
                                        if (isLocked) {
                                          alert(`ACCESS DENIED: As a student of ${COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()}, you are not permitted to open profiles or submit reviews for teachers from other colleges.`);
                                          return;
                                        }
                                        setActiveDossier(null);
                                        onSelectTeacher(t.id, t.collegeId);
                                      }}
                                      className={`w-full flex items-center justify-between py-1.5 px-3 text-[9px] text-zinc-500 hover:text-white hover:bg-zinc-950 transition-all uppercase ${isLocked ? "cursor-not-allowed opacity-65" : ""}`}
                                    >
                                      <span className="truncate">{t.name} ({t.subject}) {isLocked && "🔒"}</span>
                                      <ChevronRight size={10} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MarketItemCard({
  data,
  onInspect,
  viewerId,
}: {
  data: MarketItem;
  onInspect?: () => void;
  viewerId?: string;
  key?: string;
}) {
  const isExpiring =
    data.expiresAt && data.expiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000;
  const isSold = data.status === "sold";
  const isOwner = viewerId === data.sellerId;

  return (
    <div
      className={`vantage-card group relative ${isSold && !isOwner ? "opacity-40 grayscale pointer-events-none" : isSold ? "opacity-40 grayscale" : ""}`}
    >
      {isSold && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 z-20">
          <div className="bg-red-600 text-white font-black px-6 py-2 uppercase tracking-[0.3em] shadow-2xl border-4 border-white">
            SOLD
          </div>
        </div>
      )}
      <div className="flex justify-between mb-4">
        <span className="mono-label text-[9px] truncate max-w-[150px]">
          {COLLEGES[data.collegeId]?.name.split(" ")[0]} // {data.category}
        </span>
        {isExpiring && !isSold && (
          <span className="text-[8px] bg-red-600/20 text-red-500 px-2 py-1 font-black animate-pulse flex items-center gap-1">
            <Clock size={8} /> EXPIRING
          </span>
        )}
      </div>
      <h4 className="text-lg font-bold text-white uppercase tracking-tight line-clamp-1">
        {data.title}
      </h4>
      <p className="text-zinc-500 text-xs mt-2 line-clamp-2 font-light min-h-[3em]">
        "{data.description}"
      </p>

      <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-between items-end">
        <div>
          <div className="text-2xl font-black text-white italic">
            ₹{data.price}
          </div>
          <div className="text-[8px] mono-label text-zinc-600 uppercase mt-1">
            Listed: {new Date(data.createdAt).toLocaleDateString()}
          </div>
        </div>
        {!isSold && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect?.();
            }}
            className="text-[9px] bg-white text-black px-4 py-2 font-black uppercase tracking-widest hover:bg-[#8B5CF6] hover:text-white transition-all"
          >
            Inspect
          </button>
        )}
      </div>
    </div>
  );
}

function LeaderboardTable({
  title,
  data,
  onSelectTeacher,
}: {
  title: string;
  data: Teacher[];
  onSelectTeacher?: (id: string) => void;
}) {
  return (
    <div className="vantage-card">
      <h3 className="text-lg font-black uppercase tracking-tight italic mb-8 border-b border-zinc-800 pb-4">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-900">
              <th className="py-4 text-[10px] mono-label text-zinc-500 uppercase">
                Rank
              </th>
              <th className="py-4 text-[10px] mono-label text-zinc-500 uppercase">
                Teacher
              </th>
              <th className="py-4 text-[10px] mono-label text-zinc-500 uppercase">
                Subject Cluster
              </th>
              <th className="py-4 text-[10px] mono-label text-zinc-500 uppercase text-right">
                Rating
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {data.map((t, i) => (
              <tr
                key={t.id}
                className={`group hover:bg-zinc-950/50 transition-colors ${onSelectTeacher ? "cursor-pointer" : ""}`}
                onClick={() => onSelectTeacher?.(t.id)}
              >
                <td className="py-4 font-mono text-[10px] text-zinc-700">
                  0{i + 1}
                </td>
                <td className="py-4">
                  <div className="font-bold text-xs uppercase text-white group-hover:text-[#8B5CF6] transition-colors">
                    {t.name}
                  </div>
                  <div className="text-[9px] uppercase text-zinc-500">
                    {COLLEGES[t.collegeId]?.name?.split(" ")[0]}
                  </div>
                </td>
                <td className="py-4 text-[10px] text-zinc-400 font-mono italic">
                  {t.subject}
                </td>
                <td className="py-4 text-right">
                  <div className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full">
                    <Check size={10} className="text-emerald-500" />
                    <span className="text-white font-black text-[10px]">
                      {t.averageRating.toFixed(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-zinc-700 italic text-xs uppercase tracking-widest"
                >
                  Network scan incomplete...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HierarchicalSearchModal({
  onClose,
  onSelectTeacher,
}: {
  onClose: () => void;
  onSelectTeacher: (id: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    uni: "",
    college: "",
    course: "",
    subject: "",
  });

  const selectedUni = UNIVERSITIES.find((u) => u.id === selection.uni);
  const collegeOptions =
    selectedUni?.collegeIds.map((cId) => COLLEGES[cId]) || [];
  const selectedCollege = COLLEGES[selection.college];
  const courseOptions =
    selectedCollege?.courseIds.map((cId) => COURSES[cId]) || [];
  const selectedCourse = COURSES[selection.course];
  const subjectOptions = selectedCourse?.subjects || [];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-[#050505] border border-zinc-800 p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-8 text-[#444] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mono-label text-[#8B5CF6] mb-4">
          Step 0{step} // Intelligence Extraction
        </div>
        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-12">
          Search Protocol
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <StepIndicator
            active={step >= 1}
            label="University"
            value={
              selection.uni
                ? UNIVERSITIES.find((u) => u.id === selection.uni)?.name.split(
                    " ",
                  )[0]
                : "---"
            }
          />
          <StepIndicator
            active={step >= 2}
            label="College"
            value={
              selection.college
                ? COLLEGES[selection.college]?.name.split(" ")[0]
                : "---"
            }
          />
          <StepIndicator
            active={step >= 3}
            label="Course"
            value={
              selection.course
                ? COURSES[selection.course]?.name.split(" ")[1]
                : "---"
            }
          />
          <StepIndicator
            active={step >= 4}
            label="Subject"
            value={selection.subject || "---"}
          />
        </div>

        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              {UNIVERSITIES.map((u) => (
                <SelectionCard
                  key={u.id}
                  label={u.name}
                  onClick={() => {
                    setSelection({ ...selection, uni: u.id });
                    setStep(2);
                  }}
                />
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collegeOptions.map((c) => (
                <SelectionCard
                  key={c.id}
                  label={c.name}
                  onClick={() => {
                    setSelection({ ...selection, college: c.id });
                    setStep(3);
                  }}
                />
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="grid md:grid-cols-3 gap-4">
              {courseOptions.map((c) => (
                <SelectionCard
                  key={c.id}
                  label={c.name}
                  onClick={() => {
                    setSelection({ ...selection, course: c.id });
                    setStep(4);
                  }}
                />
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="grid md:grid-cols-3 gap-4">
              {subjectOptions.map((s) => (
                <SelectionCard
                  key={s}
                  label={s}
                  onClick={() => {
                    setSelection({ ...selection, subject: s });
                    onSelectTeacher(selection.course);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-12 text-[#444] hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
          >
            <ChevronRight size={14} className="rotate-180" />
            Previous Protocol
          </button>
        )}
      </motion.div>
    </div>
  );
}

function StepIndicator({
  active,
  label,
  value,
}: {
  active: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`p-4 border-l-2 transition-all duration-500 ${active ? "border-[#8B5CF6] translate-x-1" : "border-zinc-900 opacity-30"}`}
    >
      <div className="text-[10px] mono-label text-zinc-500 mb-1">{label}</div>
      <div className="text-xs font-black text-white uppercase truncate">
        {value}
      </div>
    </div>
  );
}

function SelectionCard({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-[#0A0A0A] border border-zinc-900 p-6 hover:border-[#8B5CF6] hover:bg-zinc-900 transition-all group"
    >
      <div className="text-xs font-black text-white group-hover:text-[#8B5CF6] transition-colors leading-tight uppercase">
        {label}
      </div>
      <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={16} className="text-[#8B5CF6]" />
      </div>
    </button>
  );
}

function TeachersView({
  onShowAddTeacher,
  onSelectTeacher,
  userCollegeId,
  isRootAdmin,
  onSeedVipsData,
  isSeeding,
  seedStatus,
}: {
  onShowAddTeacher: () => void;
  onSelectTeacher: (id: string, collegeId?: string) => void;
  userCollegeId?: string;
  isRootAdmin?: boolean;
  onSeedVipsData?: () => void;
  isSeeding?: boolean;
  seedStatus?: string;
}) {
  const { db, auth, user } = useFirebase();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUni, setSelectedUni] = useState<string>("");
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "rating-desc" | "rating-asc" | "nodes-desc" | "name-asc"
  >("rating-desc");
  const [showAll, setShowAll] = useState(false);

  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [isCollegeFocused, setIsCollegeFocused] = useState(false);

  // Sync search input with selected college when not focused
  useEffect(() => {
    if (!isCollegeFocused) {
      if (selectedCollege && COLLEGES[selectedCollege]) {
        setCollegeSearchTerm(COLLEGES[selectedCollege].name);
      } else {
        setCollegeSearchTerm("");
      }
    }
  }, [selectedCollege, isCollegeFocused]);

  // Initialize filters based on user's selected college affiliation if set
  useEffect(() => {
    if (userCollegeId) {
      const uni = UNIVERSITIES.find((u) => u.collegeIds.includes(userCollegeId));
      if (uni) {
        setSelectedUni(uni.id);
        setSelectedCollege(userCollegeId);
      }
    }
  }, [userCollegeId]);

  // Keep view clean by collapsing lists back to top 12 when filters or search changes
  useEffect(() => {
    setShowAll(false);
  }, [searchTerm, selectedUni, selectedCollege]);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, "teachers"),
      where("status", "==", "active"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTeachers(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Teacher,
          ),
        );
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "teachers", auth),
    );

    return unsubscribe;
  }, [db, auth]);

  const availableColleges = selectedUni
    ? (UNIVERSITIES.find((u) => u.id === selectedUni)?.collegeIds.map((cId) => COLLEGES[cId]).filter(Boolean) || [])
    : Object.values(COLLEGES);

  const searchedColleges = availableColleges.filter((c) => {
    const term = collegeSearchTerm.toLowerCase().trim();
    const isShowingFullCollegeName = selectedCollege && collegeSearchTerm === COLLEGES[selectedCollege]?.name;
    if (isShowingFullCollegeName || !term) {
      return true;
    }
    return (
      c.name.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  });

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUni = selectedUni ? t.universityId === selectedUni : true;
    const matchesCollege = selectedCollege
      ? t.collegeId === selectedCollege
      : true;
    return matchesSearch && matchesUni && matchesCollege;
  });

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (sortBy === "rating-desc") {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }
    if (sortBy === "rating-asc") {
      return (a.averageRating || 0) - (b.averageRating || 0);
    }
    if (sortBy === "nodes-desc") {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
    if (sortBy === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  const displayedTeachers = showAll ? sortedTeachers : sortedTeachers.slice(0, 12);

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div className="max-w-2xl">
          <div className="mono-label mb-4 text-[#8B5CF6]">
            Global Student Reviews
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Teacher Ratings.
          </h1>
          <p className="text-zinc-400 mt-6 text-base font-light leading-relaxed">
            The ultimate academic navigation radar. Leverage crowdsourced student intelligence, 
            class delivery ratings, and true grading indices to unlock optimal course choices 
            with complete certainty.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
          {isRootAdmin && onSeedVipsData && (
            <div className="flex flex-col items-stretch sm:items-end gap-1.5">
              <button
                onClick={onSeedVipsData}
                disabled={isSeeding}
                className="flex items-center justify-center gap-3 py-4 px-6 border border-[#8B5CF6]/55 bg-transparent text-[#8B5CF6] hover:bg-[#8B5CF6]/10 disabled:opacity-50 text-[10px] font-mono font-black uppercase tracking-widest transition-all select-none cursor-pointer"
              >
                {isSeeding ? "Syncing..." : "Sync Data"}
              </button>
              {seedStatus && (
                <span className="text-[8px] text-[#a78bfa] font-mono uppercase tracking-wider text-right animate-pulse break-all max-w-[240px]">
                  {seedStatus}
                </span>
              )}
            </div>
          )}
          <button
            onClick={onShowAddTeacher}
            className="group flex items-center justify-center gap-4 py-4 px-8 bg-[#8B5CF6] text-white hover:bg-white hover:text-black transition-all duration-500 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="font-black uppercase tracking-[0.2em] text-[9px]">
              Add Teacher
            </span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
        <div className="md:col-span-1">
          <label className="mono-label block mb-3 text-[10px]">
            Filter By University
          </label>
          <select
            value={selectedUni}
            onChange={(e) => {
              setSelectedUni(e.target.value);
              setSelectedCollege("");
            }}
            className="w-full bg-[#0A0A0A] border-b border-zinc-800 text-white py-3 px-2 outline-none uppercase font-black text-[11px] focus:border-[#8B5CF6] transition-all"
          >
            <option value="">All Universities</option>
            {UNIVERSITIES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 relative">
          <label className="mono-label block mb-3 text-[10px]">
            Filter By College
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH COLLEGE / SECTOR..."
              value={collegeSearchTerm}
              onFocus={() => setIsCollegeFocused(true)}
              onBlur={() => {
                // Ensure dropdown selection click can be processed
                setTimeout(() => setIsCollegeFocused(false), 200);
              }}
              onChange={(e) => {
                setCollegeSearchTerm(e.target.value);
                setIsCollegeFocused(true);
              }}
              className="w-full bg-[#0A0A0A] border-b border-zinc-800 text-white py-3 pl-2 pr-8 outline-none uppercase font-black text-[11px] focus:border-[#8B5CF6] transition-all placeholder:text-zinc-700"
            />
            {collegeSearchTerm ? (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedCollege("");
                  setCollegeSearchTerm("");
                }}
                onClick={() => {
                  setSelectedCollege("");
                  setCollegeSearchTerm("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-all p-1"
                title="Clear Selection"
              >
                <X size={12} />
              </button>
            ) : (
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
              />
            )}
          </div>

          {isCollegeFocused && (
            <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-[#0A0A0A] border border-zinc-900 z-50 rounded-none shadow-2xl divide-y divide-zinc-950 custom-scrollbar">
              {searchedColleges.length > 0 ? (
                searchedColleges.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => {
                      setSelectedCollege(c.id);
                      // Auto select university if none chosen!
                      if (!selectedUni) {
                        const parentUni = UNIVERSITIES.find((u) => u.collegeIds.includes(c.id));
                        if (parentUni) {
                          setSelectedUni(parentUni.id);
                        }
                      }
                      setCollegeSearchTerm(c.name);
                      setIsCollegeFocused(false);
                    }}
                    className={`w-full text-left p-3 text-[10px] font-mono uppercase transition-all tracking-tight leading-tight block ${
                      selectedCollege === c.id
                        ? "bg-[#8B5CF6] text-white font-bold"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))
              ) : (
                <div className="p-3 text-[9px] text-zinc-650 uppercase font-mono italic">
                  No matching colleges
                </div>
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-1">
          <label className="mono-label block mb-3 text-[10px]">
            Sort Teachers
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#0A0A0A] border-b border-[#8B5CF6] text-white py-3 px-2 outline-none uppercase font-black text-[11px] focus:border-[#8B5CF6] transition-all"
          >
            <option value="rating-desc">Rating: High to Low</option>
            <option value="rating-asc">Rating: Low to High</option>
            <option value="nodes-desc">Consensus (Most Reviews)</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>
        </div>
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
            size={18}
          />
          <input
            type="text"
            placeholder="SEARCH FACULTY OR SUBJECT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="w-full bg-[#0A0A0A] border border-zinc-900 rounded-none py-4 pl-12 pr-6 text-white font-black uppercase tracking-widest text-[11px] outline-none focus:border-[#8B5CF6] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedTeachers.map((t) => {
          const isLocked = userCollegeId && userCollegeId !== t.collegeId && user?.email !== "237tanishaqverma@gmail.com";
          return (
            <div
              key={t.id}
              onClick={() => {
                if (isLocked) {
                  alert(`ACCESS DENIED: As a student of ${COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()}, you are not permitted to open profiles or submit reviews for teachers from other colleges.`);
                  return;
                }
                onSelectTeacher(t.id, t.collegeId);
              }}
              className={`vantage-card group ${isLocked ? "cursor-not-allowed opacity-65 border-zinc-950" : "cursor-pointer hover:border-[#8B5CF6]"}`}
            >
              <div className="flex justify-between mb-8 items-start">
                <span className="mono-label uppercase tracking-widest text-[9px] text-zinc-500">
                  {
                    UNIVERSITIES.find((u) => u.id === t.universityId)?.name.split(
                      " ",
                    )[0]
                  }{" "}
                  // {COLLEGES[t.collegeId]?.name.split(" ")[0]}
                </span>
                {isLocked ? (
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-950/20 px-2 py-0.5 border border-amber-900 font-bold uppercase tracking-widest">
                    🔒 Locked
                  </span>
                ) : (
                  t.averageRating < 3 && t.averageRating > 0 && (
                    <span className="text-[10px] text-white bg-red-600 px-2 py-1 font-black uppercase tracking-tighter">
                      Conduct Advisory
                    </span>
                  )
                )}
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="text-4xl font-black italic tracking-tighter leading-none">
                  {t.averageRating > 0 ? t.averageRating.toFixed(1) : "0.0"}
                </div>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-tight group-hover:text-[#8B5CF6] transition-colors">
                    {t.name}
                  </h4>
                  <p className="mono-label text-[10px] lowercase text-zinc-500 mb-2">
                    {COURSES[t.courseId]?.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {t.subject.split("/").map((subj) => (
                      <span key={subj} className="bg-zinc-950 border border-zinc-900 text-zinc-400 text-[8px] px-1.5 py-0.2 uppercase font-mono tracking-wide rounded-sm group-hover:border-[#8B5CF6] transition-colors">
                        {subj.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {t.tags && Object.keys(t.tags).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 border-t border-zinc-900 pt-8">
                  {Object.keys(t.tags)
                    .slice(0, 3)
                    .map((tag) => (
                      <span key={tag} className="vantage-tag">
                        {tag}
                      </span>
                    ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-6 border-t border-zinc-900 pt-8">
                <div className="space-y-2">
                  <p className="mono-label text-[8px] uppercase">Pedagogy</p>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6] transition-all"
                      style={{ width: `${(t.pedagogyScore || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="mono-label text-[8px] uppercase">Politeness</p>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 transition-all"
                      style={{ width: `${(t.strictnessScore || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="mono-label text-[8px] uppercase">Grading</p>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(t.gradingScore || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {sortedTeachers.length === 0 && (
          <div className="col-span-full py-32 text-center border-t border-b border-zinc-900 bg-zinc-950/20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 text-zinc-700 mb-8">
              <Users size={32} />
            </div>
            <p className="text-white text-2xl font-black uppercase italic tracking-tighter mb-4">
              No Verified Profiles detected.
            </p>
            <p className="mono-label max-w-sm mx-auto mb-12">
              Be the first to create a student evaluation profile for this instructor.
            </p>
            <button
              onClick={onShowAddTeacher}
              className="vantage-btn-secondary"
            >
              Add Teacher
            </button>
          </div>
        )}
      </div>

      {!showAll && sortedTeachers.length > 12 && (
        <div className="flex flex-col items-center justify-center pt-12 border-t border-zinc-900 mt-12 bg-black/20 p-8 border border-zinc-900">
          <p className="mono-label text-[10px] text-zinc-500 mb-4 uppercase tracking-widest text-center">
            {selectedCollege ? (
              <span>Showing first 12 active faculty nodes from {COLLEGES[selectedCollege]?.name || selectedCollege.toUpperCase()}</span>
            ) : (
              <span>Showing top 12 active faculty nodes across university networks</span>
            )}
          </p>
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-3 px-8 py-4 border border-zinc-800 hover:border-[#8B5CF6] text-white hover:text-[#8B5CF6] bg-black hover:bg-zinc-950 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 text-[10px] font-bold uppercase tracking-widest cursor-pointer group"
          >
            <span>Reveal All {sortedTeachers.length} Registered Nodes</span>
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform text-[#8B5CF6]" />
          </button>
        </div>
      )}

      {showAll && sortedTeachers.length > 12 && (
        <div className="flex flex-col items-center justify-center pt-12 border-t border-zinc-900 mt-12 bg-black/20 p-8 border border-zinc-900">
          <p className="mono-label text-[10px] text-zinc-500 mb-4 uppercase tracking-widest text-center">
            Showing all {sortedTeachers.length} verified faculty evaluation records
          </p>
          <button
            onClick={() => setShowAll(false)}
            className="flex items-center gap-3 px-8 py-4 border border-zinc-800 hover:border-pink-500 text-white hover:text-pink-500 bg-black hover:bg-zinc-950 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] transition-all duration-300 text-[10px] font-bold uppercase tracking-widest cursor-pointer group"
          >
            <span>Collapse to Top 12 Records</span>
            <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform text-pink-500" />
          </button>
        </div>
      )}
    </div>
  );
}

function AddTeacherModal({
  onClose,
  userCollegeId,
}: {
  onClose: () => void;
  userCollegeId?: string;
}) {
  const { db, auth, user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [searchCollege, setSearchCollege] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");

  const userCollegeObj = userCollegeId ? COLLEGES[userCollegeId] : null;
  const userUniObj = userCollegeId
    ? UNIVERSITIES.find((u) => u.collegeIds.includes(userCollegeId))
    : null;

  const [formData, setFormData] = useState({
    name: "",
    universityId: userUniObj ? userUniObj.id : "",
    collegeId: userCollegeId || "",
    courseId: "",
    subject: "",
  });
  const [prefix, setPrefix] = useState("DR.");
  const [rawName, setRawName] = useState("");

  const handleCourseSelect = (cId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseId: cId,
      subject: "",
    }));
    setSelectedSubjects([]);
    setCustomSubjectInput("");
  };

  // Sync selected subjects to subject string
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subject: selectedSubjects.join(" / "),
    }));
  }, [selectedSubjects]);

  // Sync to formData.name whenever prefix or rawName changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: `${prefix} ${rawName.trim()}`.trim().toUpperCase(),
    }));
  }, [prefix, rawName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !auth || !user) return;

    if (
      !formData.universityId ||
      !formData.collegeId ||
      !formData.courseId ||
      !formData.subject ||
      !formData.name
    ) {
      alert("Please fill in all details before submitting.");
      return;
    }

    if (userCollegeId && formData.collegeId !== userCollegeId) {
      alert("SECURITY EXCEPTION: You can only register faculty members affiliated with your own college.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "teachers"), {
        ...formData,
        status: "pending",
        averageRating: 0,
        reviewCount: 0,
        pedagogyScore: 0,
        strictnessScore: 0,
        gradingScore: 0,
        tags: {},
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "teachers", auth);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUni = UNIVERSITIES.find((u) => u.id === formData.universityId);
  const selectedCollegeObjs = (
    selectedUni?.collegeIds.map((cId) => COLLEGES[cId]) || []
  ).filter((c) => c.name.toLowerCase().includes(searchCollege.toLowerCase()));

  const selectedCollege = COLLEGES[formData.collegeId];
  const selectedCourseObjs =
    selectedCollege?.courseIds.map((cId) => COURSES[cId]) || [];
  const selectedCourse = COURSES[formData.courseId];
  const filteredSubjects = (selectedCourse?.subjects || []).filter((s) =>
    s.toLowerCase().includes(searchSubject.toLowerCase()),
  );

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#080808] border border-zinc-800 p-0 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="h-1 bg-[#8B5CF6] w-full" />

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute right-8 top-8 text-zinc-600 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-[#8B5CF6] font-mono border border-zinc-800">
              0{step}
            </div>
            <div>
              <div className="mono-label text-[10px] text-zinc-650 uppercase">
                Step Progress
              </div>
              <div className="text-white font-black uppercase text-xs tracking-widest">
                {step === 1 && "Select College & Campus"}
                {step === 2 && "Course & Subject Selection"}
                {step === 3 && "Enter Teacher Name"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {userCollegeId && userCollegeObj ? (
                  <div className="space-y-6">
                    <div className="vantage-card border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-6 rounded-none space-y-4">
                      <div className="flex items-center gap-2 text-[#8B5CF6] font-mono text-[10px] uppercase tracking-widest">
                        <Shield className="text-[#8B5CF6]" size={14} />
                        College Lock Active
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        In accordance with community guidelines, your profile is locked to your affiliated campus. You can only create teacher dossiers for your own college.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="mono-label block text-[10px] uppercase">University Cluster</span>
                        <div className="p-4 bg-zinc-950 border border-zinc-900 text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]">
                          {userUniObj ? userUniObj.name : "UNIVERSITY CLUSTER"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="mono-label block text-[10px] uppercase">Affiliated College</span>
                        <div className="p-4 bg-zinc-950 border border-zinc-900 text-[10px] font-black uppercase tracking-widest text-white">
                          {userCollegeObj.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <label className="mono-label block text-[10px] uppercase">
                        University Cluster
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {UNIVERSITIES.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                universityId: u.id,
                                collegeId: "",
                                courseId: "",
                                subject: "",
                              })
                            }
                            className={`p-4 border text-[10px] font-black uppercase tracking-widest transition-all ${formData.universityId === u.id ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                          >
                            {u.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.universityId && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="mono-label block text-[10px] uppercase">
                            Select College
                          </label>
                          <input
                            type="text"
                            placeholder="SEARCH SECTOR"
                            value={searchCollege}
                            onChange={(e) => setSearchCollege(e.target.value)}
                            className="bg-transparent border-b border-zinc-800 text-[10px] outline-none text-[#8B5CF6] placeholder:text-zinc-800 uppercase font-mono"
                          />
                        </div>
                        <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedCollegeObjs.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  collegeId: c.id,
                                  courseId: "",
                                  subject: "",
                                })
                              }
                              className={`flex items-center justify-between p-4 border text-[10px] font-black uppercase tracking-widest transition-all ${formData.collegeId === c.id ? "bg-white border-white text-black" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                            >
                              <span>{c.name}</span>
                              {formData.collegeId === c.id && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4">
                  <button
                    disabled={!formData.collegeId}
                    onClick={nextStep}
                    type="button"
                    className="vantage-btn-primary w-full disabled:opacity-20 uppercase tracking-[0.3em] py-5"
                  >
                    Transition to Phase 02
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="mono-label block text-[10px] uppercase">
                    Select Course
                  </label>
                  <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCourseObjs.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCourseSelect(c.id)}
                        className={`flex items-center justify-between p-4 border text-[10px] font-black uppercase tracking-widest transition-all ${formData.courseId === c.id ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                      >
                        <span>{c.name}</span>
                        {formData.courseId === c.id && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.courseId && (
                  <div className="space-y-6">
                    <div className="space-y-4 border border-zinc-900 bg-zinc-950/30 p-4">
                      <label className="mono-label block text-[10px] text-[#8B5CF6] uppercase">Selected Subject Tags ({selectedSubjects.length})</label>
                      <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                        {selectedSubjects.length === 0 ? (
                          <span className="text-zinc-700 text-[10px] italic font-mono">No subjects selected yet. Click in the list below or add a custom tag.</span>
                        ) : (
                          selectedSubjects.map((s) => (
                            <span key={s} className="bg-zinc-900 border border-zinc-800 text-[#8B5CF6] font-mono text-[9px] px-2 py-1 flex items-center gap-1.5 uppercase rounded-xs">
                              {s}
                              <button
                                type="button"
                                onClick={() => setSelectedSubjects(prev => prev.filter(x => x !== s))}
                                className="text-zinc-600 hover:text-white transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="mono-label block text-[10px] uppercase">
                          Choose Subject Title(s)
                        </label>
                        <input
                          type="text"
                          placeholder="SEARCH KEY"
                          value={searchSubject}
                          onChange={(e) => setSearchSubject(e.target.value)}
                          className="bg-transparent border-b border-zinc-800 text-[10px] outline-none text-[#8B5CF6] placeholder:text-zinc-800 uppercase font-mono"
                        />
                      </div>
                      <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredSubjects.map((s) => {
                          const isSelected = selectedSubjects.includes(s.toUpperCase());
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                const capS = s.toUpperCase();
                                if (selectedSubjects.includes(capS)) {
                                  setSelectedSubjects(prev => prev.filter(x => x !== capS));
                                } else {
                                  setSelectedSubjects(prev => [...prev, capS]);
                                }
                              }}
                              className={`flex items-center justify-between p-4 border text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? "bg-white border-white text-black" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                            >
                              <span>{s}</span>
                              {isSelected && <Check size={12} className="text-emerald-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Input */}
                    <div className="space-y-2 pt-2 border-t border-zinc-90 w-full">
                      <label className="mono-label block text-[10px] uppercase">Or Add Custom Subject Tag</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="E.G. DATABASE THEORY AND CONCEPTS"
                          value={customSubjectInput}
                          onChange={(e) => setCustomSubjectInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (customSubjectInput.trim()) {
                                const val = customSubjectInput.trim().toUpperCase();
                                if (!selectedSubjects.includes(val)) {
                                  setSelectedSubjects(prev => [...prev, val]);
                                }
                                setCustomSubjectInput("");
                              }
                            }
                          }}
                          className="flex-1 bg-zinc-950 border border-zinc-900 text-xs px-3 py-3 text-white outline-none focus:border-[#8B5CF6] uppercase font-mono placeholder:text-zinc-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSubjectInput.trim()) {
                              const val = customSubjectInput.trim().toUpperCase();
                              if (!selectedSubjects.includes(val)) {
                                setSelectedSubjects(prev => [...prev, val]);
                              }
                              setCustomSubjectInput("");
                            }
                          }}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white font-mono uppercase text-[9px] tracking-widest px-4 border border-zinc-800"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={prevStep}
                    type="button"
                    className="py-5 border border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px] font-black hover:bg-zinc-900"
                  >
                    Back
                  </button>
                  <button
                    disabled={selectedSubjects.length === 0}
                    onClick={nextStep}
                    type="button"
                    className="vantage-btn-primary disabled:opacity-20 uppercase tracking-[0.3em] py-5"
                  >
                    Continue to Step 03
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <div>
                    <label className="mono-label block text-[10px] uppercase mb-3">
                      Honorific / Prefix Option
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {["DR.", "MR.", "MRS.", "MS."].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrefix(p)}
                          className={`py-3 border text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${prefix === p ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-black border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="mono-label block text-[10px] uppercase">
                      Teacher Name
                    </label>
                    <div className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-900 px-5 focus-within:border-[#8B5CF6] transition-all">
                      <span className="text-2xl font-black text-[#8B5CF6] tracking-tight">
                        {prefix}
                      </span>
                      <input
                        required
                        type="text"
                        autoFocus
                        placeholder="e.g. VIKRAM SINGH"
                        value={rawName}
                        onChange={(e) =>
                          setRawName(e.target.value.toUpperCase())
                        }
                        className="w-full bg-transparent py-4 text-2xl font-black text-white outline-none uppercase placeholder:text-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-950 border border-zinc-900 space-y-4">
                    <div className="mono-label text-[9px] text-[#8B5CF6]">
                      Teacher Overview
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 text-[10px] uppercase font-bold text-zinc-500">
                      <div>Faculty Name:</div>
                      <div className="text-white font-black">
                        {prefix} {rawName || "________"}
                      </div>
                      <div>Sector:</div>
                      <div className="text-white">
                        {COLLEGES[formData.collegeId]?.name.split(" ")[0]}
                      </div>
                      <div>Discipline:</div>
                      <div className="text-white">
                        {COURSES[formData.courseId]?.name.split(" ")[0]}
                      </div>
                      <div>Key:</div>
                      <div className="text-white line-clamp-1">
                        {formData.subject}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={prevStep}
                    type="button"
                    className="py-5 border border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px] font-black hover:bg-zinc-900"
                  >
                    Modify Data
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.name || isSubmitting}
                    className="vantage-btn-primary disabled:opacity-20 uppercase tracking-[0.3em] py-5 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Shield size={18} />
                    )}
                    Commit to Network
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function MarketplaceView({
  onShowModal,
  onOpenChat,
}: {
  onShowModal: () => void;
  onOpenChat?: (code: string, title: string) => void;
}) {
  const { db, auth, user } = useFirebase();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt-desc" | "price-asc" | "price-desc" | "title-asc"
  >("createdAt-desc");
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [isCollegeFocused, setIsCollegeFocused] = useState(false);

  // Sync search input with selected college when not focused
  useEffect(() => {
    if (!isCollegeFocused) {
      if (selectedCollege && COLLEGES[selectedCollege]) {
        setCollegeSearchTerm(COLLEGES[selectedCollege].name);
      } else {
        setCollegeSearchTerm("");
      }
    }
  }, [selectedCollege, isCollegeFocused]);

  const searchedColleges = Object.values(COLLEGES).filter((c) => {
    const term = collegeSearchTerm.toLowerCase().trim();
    const isShowingFullCollegeName = selectedCollege && collegeSearchTerm === COLLEGES[selectedCollege]?.name;
    if (isShowingFullCollegeName || !term) {
      return true;
    }
    return (
      c.name.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    if (!db) return;
    // We remove the status filter so we can see sold items too (but they are grayed out)
    const q = query(
      collection(db, "marketplace"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as MarketItem,
          ),
        );
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "marketplace", auth),
    );
    return unsubscribe;
  }, [db, auth]);

  const filteredItems = items.filter((item) => {
    const matchesCollege =
      !selectedCollege || item.collegeId === selectedCollege;
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCollege && matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price-asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === "price-desc") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === "title-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "createdAt-desc") {
      const tA =
        a.createdAt?.seconds !== undefined
          ? a.createdAt.seconds
          : a.createdAt instanceof Date
            ? a.createdAt.getTime() / 1000
            : typeof a.createdAt === "number"
              ? a.createdAt
              : 0;
      const tB =
        b.createdAt?.seconds !== undefined
          ? b.createdAt.seconds
          : b.createdAt instanceof Date
            ? b.createdAt.getTime() / 1000
            : typeof b.createdAt === "number"
              ? b.createdAt
              : 0;
      return tB - tA;
    }
    return 0;
  });

  const markAsSold = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "marketplace", id), { status: "sold" });
      setSelectedItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div className="max-w-2xl">
          <div className="mono-label mb-4 text-[#8B5CF6]">
            Peer-to-Peer Trade
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Market.
          </h1>
          <p className="text-zinc-400 mt-6 text-base font-light leading-relaxed">
            The offline campus trade matrix. Instantly acquire essential textbooks, master-level lab notes, 
            and premium study assets directly from your fellow peers, keeping resources circular and cutting costs.
          </p>
        </div>
        <div>
          <button
            onClick={onShowModal}
            className="vantage-btn-primary flex items-center gap-3 w-full justify-center lg:w-auto"
          >
            <Plus size={20} />
            List Asset
          </button>
        </div>
      </div>

      {/* Marketplace Search, Filters & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-end">
        <div className="lg:col-span-2 relative">
          <label className="mono-label block mb-3 text-[10px]">
            Search Marketplace
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
              size={18}
            />
            <input
              type="text"
              placeholder="SEARCH ASSETS BY NAME OR DETAILS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-zinc-900 rounded-none py-3.5 pl-12 pr-6 text-white font-black uppercase tracking-widest text-[11px] outline-none focus:border-[#8B5CF6] transition-all"
            />
          </div>
        </div>
        <div>
          <label className="mono-label block mb-3 text-[10px]">
            Asset Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#0A0A0A] border-b border-zinc-800 text-white py-3.5 px-2 outline-none uppercase font-black text-[11px] focus:border-[#8B5CF6] transition-all"
          >
            <option value="">All Categories</option>
            {[
              "electronics",
              "education",
              "gadgets",
              "books",
              "transport",
              "clothing_fashion",
              "other",
            ].map((cat) => (
              <option key={cat} value={cat}>
                {cat === "clothing_fashion" ? "CLOTHING/FASHION" : cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-2 relative">
          <label className="mono-label block mb-3 text-[10px]">
            College Sector
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH CAMPUS..."
              value={collegeSearchTerm}
              onFocus={() => setIsCollegeFocused(true)}
              onBlur={() => {
                // Ensure dropdown selection click can be processed
                setTimeout(() => setIsCollegeFocused(false), 200);
              }}
              onChange={(e) => {
                setCollegeSearchTerm(e.target.value);
                setIsCollegeFocused(true);
              }}
              className="w-full bg-[#0A0A0A] border-b border-zinc-800 text-white py-3 px-2 outline-none uppercase font-black text-[11px] focus:border-[#8B5CF6] transition-all placeholder:text-zinc-700"
            />
            {collegeSearchTerm ? (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedCollege("");
                  setCollegeSearchTerm("");
                }}
                onClick={() => {
                  setSelectedCollege("");
                  setCollegeSearchTerm("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-all p-1"
                title="Clear Selection"
              >
                <X size={12} />
              </button>
            ) : (
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-650 pointer-events-none"
              />
            )}
          </div>

          {isCollegeFocused && (
            <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-[#0A0A0A] border border-zinc-900 z-50 rounded-none shadow-2xl divide-y divide-zinc-950 custom-scrollbar">
              {searchedColleges.length > 0 ? (
                searchedColleges.map((c) => (
                   <button
                     key={c.id}
                     type="button"
                     onMouseDown={() => {
                       setSelectedCollege(c.id);
                       setCollegeSearchTerm(c.name);
                       setIsCollegeFocused(false);
                     }}
                     className={`w-full text-left p-3 text-[10px] font-mono uppercase transition-all tracking-tight leading-tight block ${
                       selectedCollege === c.id
                         ? "bg-[#8B5CF6] text-white font-bold"
                         : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                     }`}
                   >
                     {c.name}
                   </button>
                ))
              ) : (
                <div className="p-3 text-[9px] text-zinc-650 uppercase font-mono italic">
                  No matching colleges
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="mono-label block mb-3 text-[10px]">
            Sort Assets
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#0A0A0A] border-b border-[#8B5CF6] text-white py-3.5 px-2 outline-none uppercase font-black text-[11px] focus:border-[#8B5CF6] transition-all"
          >
            <option value="createdAt-desc">Newest Listings</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title-asc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={`vantage-card relative group flex flex-col justify-between ${item.status === "sold" && item.sellerId !== user?.uid ? "opacity-40 grayscale pointer-events-none" : item.status === "sold" ? "opacity-40 grayscale" : ""}`}
          >
            <div>
              <div className="flex justify-between mb-4">
                <span className="mono-label text-[9px] uppercase">
                  {COLLEGES[item.collegeId]?.name.split(" ")[0] || "Unknown"} //{" "}
                  {item.category === "clothing_fashion" ? "clothing/fashion" : item.category}
                </span>
                <span className="text-[10px] text-white opacity-50 uppercase">
                  {item.condition}
                </span>
              </div>
              <h4 className="text-xl font-bold uppercase tracking-tight text-white mb-2">
                {item.title}
              </h4>
              <p className="text-zinc-500 text-sm line-clamp-2 mb-6 font-light">
                {item.description}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
                <span className="text-2xl font-black text-white italic">
                  ₹{item.price}
                </span>
                {item.status !== "sold" && (
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="text-[10px] bg-zinc-900 px-4 py-2 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    Inspect
                  </button>
                )}
              </div>
              {item.sellerId === user?.uid && item.status === "available" && (
                <button
                  onClick={() => markAsSold(item.id)}
                  className="w-full py-2 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Check size={12} /> Mark as Sold
                </button>
              )}
            </div>
            {item.status === "sold" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-12">
                <div className="bg-red-600 text-white font-black px-6 py-2 border-4 border-white tracking-widest text-xs">
                  LIQUIDATED
                </div>
              </div>
            )}
          </div>
        ))}
        {sortedItems.length === 0 && (
          <div className="col-span-full py-32 text-center border-t border-b border-zinc-900 bg-zinc-950/20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 text-zinc-700 mb-8">
              <ShoppingBag size={32} />
            </div>
            <p className="text-white text-2xl font-black uppercase italic tracking-tighter mb-4">
              No Assets listed.
            </p>
            <p className="mono-label max-w-sm mx-auto">
              Market is currently empty. Post an item to begin exchanging resources.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <MarketInspectModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            isOwner={user?.uid === selectedItem.sellerId}
            onMarkSold={() => markAsSold(selectedItem.id)}
            onOpenChat={onOpenChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MarketInspectModal({
  item,
  onClose,
  isOwner,
  onMarkSold,
  onOpenChat,
}: {
  item: MarketItem;
  onClose: () => void;
  isOwner: boolean;
  onMarkSold: () => void;
  onOpenChat?: (code: string, title: string) => void;
}) {
  if (item.status === "sold" && !isOwner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-2xl bg-[#080808] border border-zinc-800 shadow-2xl p-0 overflow-hidden"
      >
        <div className="h-2 bg-[#8B5CF6] w-full" />
        <div className="p-10 md:p-16 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute right-8 top-8 text-zinc-650 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="mono-label text-[#8B5CF6] mb-4">
            Asset Item // {item.category === "clothing_fashion" ? "clothing/fashion" : item.category}
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
            {item.title}
          </h2>

          <div className="grid grid-cols-2 gap-8 mb-12 border-y border-zinc-900 py-8">
            <div>
              <div className="mono-label text-[10px] text-zinc-600 mb-1">
                Valuation
              </div>
              <div className="text-3xl font-black italic text-[#8B5CF6]">
                ₹{item.price}
              </div>
            </div>
            <div>
              <div className="mono-label text-[10px] text-zinc-650 mb-1">
                Seller College
              </div>
              <div className="text-sm font-bold text-white uppercase">
                {COLLEGES[item.collegeId]?.name.split(" ")[0]}
              </div>
            </div>
            <div>
              <div className="mono-label text-[10px] text-zinc-600 mb-1">
                State
              </div>
              <div className="text-sm font-bold text-white uppercase">
                {item.condition}
              </div>
            </div>
            <div>
              <div className="mono-label text-[10px] text-zinc-600 mb-1">
                Registry Date
              </div>
              <div className="text-sm font-bold text-white uppercase">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <div className="mono-label text-[10px] text-zinc-600">
              Protocol Details
            </div>
            <p className="text-zinc-400 leading-relaxed font-light text-lg">
              "{item.description}"
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-zinc-900 p-8 mb-12">
            <div className="mono-label text-[10px] text-zinc-650 mb-4 uppercase">
              Secure Communications & Contact Matrix
            </div>
            <div className="grid gap-6">
              {item.status === "sold" && !isOwner ? (
                <div className="text-zinc-500 py-2 border-l-2 border-red-500 pl-4 bg-red-950/10 font-mono text-[11px] uppercase">
                  <span className="mono-label text-[11px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                    ASSET SECURED
                  </span>
                  Asset has been liquidated. Seller communications are no
                  longer active.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Direct Contact Ledger */}
                  <div className="space-y-4 font-mono text-[11px] uppercase bg-zinc-950/60 p-4 border border-zinc-900/60">
                    <div className="mono-label text-[9px] text-[#8B5CF6] border-b border-zinc-900 pb-1.5 mb-2 flex items-center gap-1.5">
                      <Shield size={11} /> Verified Seller Information
                    </div>
                    
                    <div className="flex items-center justify-between text-zinc-450">
                      <span>Seller Peer Identity:</span>
                      <span className="font-bold text-white selection:bg-[#8B5CF6]">
                        {item.sellerEmail || "anonymous@campus.edu"}
                      </span>
                    </div>

                    {item.contactPhone ? (
                      <div className="flex items-center justify-between text-zinc-450 pt-1">
                        <span>Direct Connection / Handle:</span>
                        {item.contactPhone.match(/^[0-9+() -]{7,20}$/) ? (
                          <a
                            href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                          >
                            {item.contactPhone} <ExternalLink size={9} />
                          </a>
                        ) : (
                          <span className="font-bold text-white uppercase bg-zinc-900 px-1.5 py-0.5 border border-zinc-850">
                            {item.contactPhone}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {isOwner ? (
                    <div className="text-zinc-400 py-2 border-l-2 border-[#8B5CF6] pl-4 bg-[#8B5CF6]/5 font-mono text-[10px] uppercase">
                      <span className="mono-label text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest block mb-1">
                        OWN ASSET LISTING
                      </span>
                      Any initiated peer discussions will be routed straight to your Secure Chat inbox.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-mono text-[11px] text-zinc-400 leading-relaxed uppercase">
                        Or connect directly through the platform's zero-knowledge chat protocol to coordinate trade instantly and safely.
                      </p>
                      <button
                        onClick={() => {
                          if (onOpenChat) {
                            onClose();
                            const chatCode = `SEC-${item.id.substring(0, 8).toUpperCase()}`;
                            onOpenChat(chatCode, `Trade Discussion: ${item.title}`);
                          }
                        }}
                        className="w-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/40 px-4 py-3.5 hover:bg-[#8B5CF6]/25 transition-all font-mono text-[11px] font-black uppercase tracking-[0.15em] rounded-none flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare size={14} />
                        INITIATE SECURE PEER CHAT
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isOwner && item.status === "available" && (
            <button
              onClick={onMarkSold}
              className="w-full bg-red-600 text-white font-black py-4 uppercase tracking-[0.2em] shadow-xl hover:bg-red-500 transition-all flex items-center justify-center gap-3"
            >
              <Check size={20} /> Mark Asset as Liquidated (Sold)
            </button>
          )}

          {!isOwner && (
            <div className="text-center p-4 bg-zinc-900/50">
              <p className="mono-label text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
                All communications on this marketplace are cryptographically isolated and private
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const ROLE_BADGES: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  ADMIN: {
    label: "Admin",
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/25",
  },
  VERIFIED: {
    label: "Verified",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/25",
  },
  MODERATOR: {
    label: "Moderator",
    bg: "bg-teal-500/10",
    text: "text-teal-500",
    border: "border-teal-500/25",
  },
  FREQUENT_USER: {
    label: "Frequent User",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/25",
  },
  COORDINATOR: {
    label: "Coordinator",
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/25",
  },
  FACULTY: {
    label: "Faculty",
    bg: "bg-pink-500/10",
    text: "text-pink-500",
    border: "border-pink-500/25",
  },
  CONTRIBUTOR: {
    label: "Contributor",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/25",
  },
};

function CommunityView({
  onShowModal,
  userRoles = {},
  userColleges = {},
}: {
  onShowModal: () => void;
  userRoles?: Record<string, string[]>;
  userColleges?: Record<string, string>;
}) {
  const { db, auth, user } = useFirebase();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [filterType, setFilterType] = useState<
    "across" | "default" | "selector"
  >("across");
  const [selectedFilterCollege, setSelectedFilterCollege] =
    useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as DiscussionPost,
          ),
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "posts", auth),
    );
    return unsubscribe;
  }, [db, auth]);

  const handleLike = async (postId: string, likes: string[]) => {
    if (!db || !user) return;
    const hasLiked = likes.includes(user.uid);
    const newLikes = hasLiked
      ? likes.filter((id) => id !== user.uid)
      : [...likes, user.uid];

    try {
      await updateDoc(doc(db, "posts", postId), { likes: newLikes });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "posts", auth);
    }
  };

  const defaultCollegeId = user ? userColleges[user.uid] : undefined;
  const defaultCollegeName = defaultCollegeId
    ? COLLEGES[defaultCollegeId]?.name.split(" ")[0] || defaultCollegeId
    : "My Sector";

  const handleDropdownChange = (val: string) => {
    if (val === "across") {
      setFilterType("across");
      setSelectedFilterCollege("");
      setSearchQuery("");
    } else if (val === "default") {
      setFilterType("default");
      setSelectedFilterCollege("");
      setSearchQuery("");
    } else {
      setFilterType("selector");
      setSelectedFilterCollege("");
      setSearchQuery("");
    }
  };

  const currentSelectValue =
    filterType === "default"
      ? "default"
      : filterType === "selector"
        ? "selector"
        : "across";

  const filteredPosts = posts.filter((post) => {
    const postCollegeId =
      post.collegeId && post.collegeId !== "default_campus"
        ? post.collegeId
        : post.userId
          ? userColleges[post.userId]
          : undefined;

    if (filterType === "default") {
      return postCollegeId === defaultCollegeId;
    }
    if (filterType === "selector") {
      if (!selectedFilterCollege) return false;
      return postCollegeId === selectedFilterCollege;
    }
    return true;
  });

  const filteredColleges =
    searchQuery.trim() === ""
      ? []
      : Object.values(COLLEGES)
          .filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 5);

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div className="max-w-2xl">
          <div className="mono-label mb-4 text-[#8B5CF6]">
            Campus Survival Network
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Pulse.
          </h1>
          <p className="text-zinc-400 mt-6 text-base font-light leading-relaxed">
            The real-time social heartbeat of the peer network. Broadcast anonymous campus bulletins, 
            crowdsource answers to raw course queries, and stay fully synchronized with your sector's active student life.
          </p>
        </div>
        <button
          onClick={() => {
            if (defaultCollegeId === "just_out_of_school") {
              alert("ACCESS RESTRICTED: As an Aspirant or High School Graduate (Just Out of School), you are permitted to read peer broadcasts but are not permitted to submit pulse bulletins.");
              return;
            }
            onShowModal();
          }}
          className="vantage-btn-primary flex items-center gap-3"
        >
          <Plus size={20} />
          BroadcastPulse
        </button>
      </div>

      {/* College Sector Dropdown Filter Interface */}
      <div className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-[10px] mono-label text-zinc-500 uppercase tracking-widest">
            Active Selector Channel
          </h4>
          <p className="text-[11px] font-mono text-zinc-400 uppercase">
            {filterType === "across"
              ? "Displaying global peer broadcasts"
              : filterType === "default"
                ? `Displaying ${defaultCollegeName} local sector`
                : `Filtered by selected campus`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <label
              htmlFor="pulse-sector-select"
              className="text-[10px] text-zinc-400 font-mono uppercase shrink-0"
            >
              Filter Pulse:
            </label>
            <select
              id="pulse-sector-select"
              value={currentSelectValue}
              onChange={(e) => handleDropdownChange(e.target.value)}
              className="w-full sm:w-60 bg-black border border-zinc-800 text-[11px] font-mono p-3 text-white focus:outline-none focus:border-[#8B5CF6] uppercase cursor-pointer"
            >
              <option value="across">🌐 Across All Colleges</option>
              {defaultCollegeId && (
                <option value="default">
                  🏢 My College ({defaultCollegeName})
                </option>
              )}
              <option value="selector">🔍 Search Campus...</option>
            </select>
          </div>

          {filterType === "selector" && (
            <div className="relative w-full sm:w-96 md:w-[420px]">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search specific campus..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                  if (e.target.value === "") {
                    setSelectedFilterCollege("");
                  }
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-black border border-zinc-800 text-[11px] font-mono p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#8B5CF6] uppercase"
              />
              {showSearchDropdown && searchQuery.trim() !== "" && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-black border border-zinc-900 divide-y divide-zinc-900 shadow-2xl max-h-60 overflow-y-auto">
                  {filteredColleges.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedFilterCollege(c.id);
                        setSearchQuery(c.name);
                        setShowSearchDropdown(false);
                      }}
                      className="w-full text-left p-3 text-[10px] text-zinc-300 font-mono hover:bg-zinc-950 hover:text-white transition-colors uppercase"
                    >
                      📍 {c.name}
                    </button>
                  ))}
                  {filteredColleges.length === 0 && (
                    <div className="p-3 text-[10px] text-zinc-650 font-mono italic uppercase">
                      No matching colleges found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {filteredPosts.map((post) => {
          const hasLiked = user ? post.likes?.includes(user.uid) : false;
          const isAnonymous = post.userName === "Anonymous Student";
          return (
            <div
              key={post.id}
              className="vantage-card border-none bg-zinc-900 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8B5CF6] transition-transform origin-bottom scale-y-0 group-hover:scale-y-100"></div>
              <div className="flex justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black border border-zinc-800 text-[10px] font-black flex items-center justify-center text-zinc-500 italic">
                    {post.userName?.[0] || "U"}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="mono-label text-zinc-300 text-[10px]">
                      {post.userName}
                    </span>
                    {(() => {
                      const postCollegeId =
                        post.collegeId && post.collegeId !== "default_campus"
                          ? post.collegeId
                          : post.userId
                            ? userColleges[post.userId]
                            : undefined;
                      if (postCollegeId) {
                        return (
                          <span className="px-1.5 py-0.5 border bg-zinc-950 border-zinc-800 text-[#8B5CF6] text-[8px] font-black uppercase font-mono tracking-tighter">
                            {COLLEGES[postCollegeId]?.name.split(" ")[0] ||
                              postCollegeId}
                          </span>
                        );
                      }
                      return null;
                    })()}
                    {!isAnonymous &&
                      post.userId &&
                      userRoles[post.userId] &&
                      userRoles[post.userId].length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {userRoles[post.userId].map((roleKey) => {
                            const badge = ROLE_BADGES[roleKey];
                            if (!badge) return null;
                            return (
                              <span
                                key={roleKey}
                                className={`px-2 py-0.5 border ${badge.bg} ${badge.text} ${badge.border} text-[8px] font-black uppercase font-mono tracking-tighter`}
                              >
                                {badge.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>
                <span className="mono-label text-[10px] opacity-30">
                  Pulse // Post {post.id.slice(0, 4)}
                </span>
              </div>
              <p className="text-lg font-medium text-white mb-8 border-l-2 border-zinc-800 pl-6 leading-relaxed italic">
                "{post.content}"
              </p>
              <div className="flex gap-4">
                {post.tags?.map((tag) => (
                  <span key={tag} className="vantage-tag text-[9px]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800/30">
                <div className="flex gap-6">
                  <button
                    onClick={() => handleLike(post.id, post.likes || [])}
                    className={`flex items-center gap-2 transition-colors ${hasLiked ? "text-[#8B5CF6]" : "text-zinc-500 hover:text-white"}`}
                  >
                    <Heart
                      size={14}
                      fill={hasLiked ? "currentColor" : "none"}
                    />
                    <span className="mono-label text-[10px]">
                      {post.likes?.length || 0}
                    </span>
                  </button>
                </div>
                <span className="text-zinc-500 text-[8px] mono-label uppercase">
                  Verified Student Broadcast
                </span>
              </div>
            </div>
          );
        })}
        {filteredPosts.length === 0 && (
          <div className="text-center py-32 border border-dashed border-zinc-900 px-6">
            <p className="mono-label text-zinc-500 max-w-sm mx-auto uppercase tracking-wide leading-relaxed">
              {filterType === "selector" && !selectedFilterCollege
                ? "Please search and select a specific campus sector above."
                : "No community posts found in this sector."}
            </p>
            {!(filterType === "selector" && !selectedFilterCollege) && (
              <button
                onClick={onShowModal}
                className="mt-8 vantage-btn-secondary"
              >
                Create Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPortal({
  userRoles = {},
  userColleges = {},
  isSeeding = false,
  seedStatus = "",
  handleSeedVipsData,
}: {
  userRoles?: Record<string, string[]>;
  userColleges?: Record<string, string>;
  isSeeding?: boolean;
  seedStatus?: string;
  handleSeedVipsData?: () => void;
} = {}) {
  const { db, auth, user } = useFirebase();
  const isRootAdmin = user?.email === "237tanishaqverma@gmail.com";

  const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [gigsAudit, setGigsAudit] = useState<AcademicGig[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [pulseAudit, setPulseAudit] = useState<DiscussionPost[]>([]);
  const [reviewAudit, setReviewAudit] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [placementsAudit, setPlacementsAudit] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    | "approvals"
    | "issues"
    | "registry"
    | "intelligence"
    | "gigs"
    | "submissions"
    | "pulse"
    | "logs"
    | "college_requests"
    | "alumni"
  >("approvals");

  // Integrated Tactical Filters & Sorters States for each and every portal section
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("all");
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Dynamically reset filtering and sorting values on section transitions to maintain optimal UX
  useEffect(() => {
    setSearchTerm("");
    setFilterUniversity("all");
    setFilterCollege("all");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterType("all");

    if (activeTab === "issues") {
      setSortBy("priority_desc");
    } else if (activeTab === "registry") {
      setSortBy("name_asc");
    } else {
      setSortBy("newest");
    }
  }, [activeTab]);

  useEffect(() => {
    if (!db) return;

    const unsubChangeReqs = onSnapshot(
      query(
        collection(db, "college_change_requests"),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        setChangeRequests(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (error) => {
        console.error(
          "Error loading college change requests for admin: ",
          error,
        );
      },
    );

    const unsubTeachers = onSnapshot(
      query(collection(db, "teachers"), where("status", "==", "pending")),
      (snap) => {
        setPendingTeachers(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Teacher),
        );
      },
    );

    const unsubAdmins = onSnapshot(
      collection(db, "admins"),
      (snap) => {
        setAdminsList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "admins", auth),
    );

    const unsubAllTeachers = onSnapshot(
      query(
        collection(db, "teachers"),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        setAllTeachers(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Teacher),
        );
      },
    );

    const unsubPulse = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50)),
      (snap) => {
        setPulseAudit(
          snap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as DiscussionPost,
          ),
        );
      },
    );

    const unsubReviews = onSnapshot(
      query(
        collection(db, "reviews"),
        orderBy("createdAt", "desc"),
        limit(100),
      ),
      (snap) => {
        setReviewAudit(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
    );

    const unsubTickets = onSnapshot(
      query(collection(db, "tickets"), orderBy("createdAt", "desc")),
      (snap) => {
        setTickets(
          snap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as SupportTicket,
          ),
        );
      },
    );

    const unsubAudits = onSnapshot(
      query(collection(db, "nodes"), orderBy("registeredAt", "desc")),
      (snap) => {
        setAllNodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );

    const unsubGigs = onSnapshot(
      query(
        collection(db, "academic_gigs"),
        orderBy("createdAt", "desc"),
        limit(150),
      ),
      (snap) => {
        setGigsAudit(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AcademicGig),
        );
      },
    );

    const unsubLogs = onSnapshot(
      query(
        collection(db, "admin_logs"),
        orderBy("timestamp", "desc"),
        limit(150),
      ),
      (snap) => {
        setAdminLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.log(
          "Logged-in admin might be restricted from audit log reads:",
          error,
        );
      },
    );

    const unsubPlacements = onSnapshot(
      query(
        collection(db, "placements"),
        orderBy("createdAt", "desc"),
        limit(150),
      ),
      (snap) => {
        setPlacementsAudit(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (error) => {
        console.error("Error loading placements for admin: ", error);
      },
    );

    return () => {
      unsubChangeReqs();
      unsubTeachers();
      unsubTickets();
      unsubAudits();
      unsubGigs();
      unsubPulse();
      unsubReviews();
      unsubAdmins();
      unsubLogs();
      unsubPlacements();
    };
  }, [db]);

  const logAdminAction = async (
    actionType: string,
    targetId: string,
    targetName: string,
    description: string,
  ) => {
    if (!db || !user) return;
    try {
      await addDoc(collection(db, "admin_logs"), {
        adminId: user.uid,
        adminEmail: user.email || "unknown@campus.edu",
        adminName:
          user.displayName ||
          user.email?.split("@")[0].toUpperCase() ||
          "UNKNOWN OPERATOR",
        actionType,
        targetId,
        targetName,
        description,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error creating action log: ", e);
    }
  };

  const approveTeacher = async (id: string) => {
    if (!db) return;
    try {
      const matchTeacher = pendingTeachers.find((t) => t.id === id);
      const name = matchTeacher?.name || "Unknown Faculty";

      await updateDoc(doc(db, "teachers", id), {
        status: "active",
        updatedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
      });

      await logAdminAction(
        "APPROVE_TEACHER",
        id,
        name,
        `Approved teacher node "${name}"`,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const rejectTeacher = async (id: string) => {
    if (!db) return;
    try {
      const matchTeacher = pendingTeachers.find((t) => t.id === id);
      const name = matchTeacher?.name || "Unknown Faculty";

      await updateDoc(doc(db, "teachers", id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });

      await logAdminAction(
        "REJECT_TEACHER",
        id,
        name,
        `Rejected teacher node "${name}"`,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const approveCollegeRequest = async (
    reqId: string,
    reqUserId: string,
    targetCollegeId: string,
  ) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "college_change_requests", reqId), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      await setDoc(
        doc(db, "user_roles", reqUserId),
        {
          collegeId: targetCollegeId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await logAdminAction(
        "APPROVE_COLLEGE_SWITCH",
        reqId,
        reqUserId,
        `Approved college switch for user ${reqUserId} to ${targetCollegeId}`,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const rejectCollegeRequest = async (reqId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "college_change_requests", reqId), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      await logAdminAction(
        "REJECT_COLLEGE_SWITCH",
        reqId,
        "",
        "Rejected college switch request",
      );
    } catch (e) {
      console.error(e);
    }
  };

  const toggleUserRoleTag = async (
    userId: string,
    email: string,
    roleKey: string,
  ) => {
    if (!db) return;
    if (roleKey === "ADMIN" && !isRootAdmin) {
      console.error("Only root admin can grant/revoke ADMIN role");
      return;
    }
    const currentRoles = userRoles[userId] || [];
    const hasRole = currentRoles.includes(roleKey);
    const updatedRoles = hasRole
      ? currentRoles.filter((r) => r !== roleKey)
      : [...currentRoles, roleKey];

    try {
      await setDoc(
        doc(db, "user_roles", userId),
        {
          email: email,
          roles: updatedRoles,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      // Sync ADMIN permission status to admins/ collection
      if (roleKey === "ADMIN") {
        if (hasRole) {
          await deleteDoc(doc(db, "admins", userId));
        } else {
          await setDoc(doc(db, "admins", userId), {
            email: email,
            createdAt: serverTimestamp(),
          });
        }
      }

      await logAdminAction(
        hasRole ? "REVOKE_BADGE" : "GRANT_BADGE",
        userId,
        email,
        `${hasRole ? "Revoked" : "Granted"} badge "${roleKey}" for user "${email}"`,
      );
    } catch (e) {
      console.error("Error setting role in Firestore:", e);
    }
  };

  const toggleUserRole = async (userId: string, email: string) => {
    if (!db || !isRootAdmin) return;
    const isCurrentAdmin = adminsList.some((a) => a.id === userId);
    try {
      if (isCurrentAdmin) {
        await deleteDoc(doc(db, "admins", userId));
        await setDoc(
          doc(db, "user_roles", userId),
          {
            email: email,
            roles: (userRoles[userId] || []).filter(
              (r: string) => r !== "ADMIN",
            ),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        await logAdminAction(
          "REVOKE_ADMIN",
          userId,
          email,
          `Revoked Admin Privilege for operator "${email}"`,
        );
      } else {
        await setDoc(doc(db, "admins", userId), {
          email: email,
          createdAt: serverTimestamp(),
        });
        const currentRoles = userRoles[userId] || [];
        await setDoc(
          doc(db, "user_roles", userId),
          {
            email: email,
            roles: currentRoles.includes("ADMIN")
              ? currentRoles
              : [...currentRoles, "ADMIN"],
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        await logAdminAction(
          "GRANT_ADMIN",
          userId,
          email,
          `Granted Admin Privilege for operator "${email}"`,
        );
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "admins", auth);
    }
  };

  const toggleTicketResolution = async (
    id: string,
    currentResolved: boolean,
  ) => {
    if (!db) return;
    try {
      const matchTicket = tickets.find((t) => t.id === id);
      const subject = matchTicket?.subject || "Support Ticket";

      await updateDoc(doc(db, "tickets", id), {
        resolved: !currentResolved,
        status: !currentResolved ? "resolved" : "open",
        updatedAt: serverTimestamp(),
        resolvedAt: !currentResolved ? serverTimestamp() : null,
      });

      const action = !currentResolved ? "RESOLVE_ISSUE" : "REOPEN_ISSUE";
      await logAdminAction(
        action,
        id,
        subject,
        `Marked issue "${subject}" as ${!currentResolved ? "resolved" : "open"}`,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTicket = async (id: string) => {
    if (!db) return;
    try {
      const matchTicket = tickets.find((t) => t.id === id);
      const subject = matchTicket?.subject || "Support Ticket";

      await deleteDoc(doc(db, "tickets", id));

      await logAdminAction(
        "DELETE_ISSUE",
        id,
        subject,
        `Permanently deleted support ticket "${subject}"`,
      );
    } catch (e) {
      console.error("Error deleting ticket:", e);
      alert("Failed to delete the ticket due to Firestore response or permission constraints.");
    }
  };

  const getUnifiedNodes = () => {
    const list: Array<{ userId: string; userName: string; userEmail: string }> =
      [];

    const addNodeIfUnique = (
      userId: string,
      userName: string,
      userEmail: string,
    ) => {
      if (!userId || !userEmail) return;
      const cleanEmail = userEmail.trim().toLowerCase();
      const cleanUid = userId.trim();

      // Ensure absolutely zero duplicates based on UID or Email
      const exists = list.some(
        (item) =>
          item.userId.trim() === cleanUid ||
          item.userEmail.trim().toLowerCase() === cleanEmail,
      );

      if (!exists) {
        list.push({
          userId: cleanUid,
          userName: userName.trim() || cleanEmail.split("@")[0].toUpperCase(),
          userEmail: userEmail.trim(),
        });
      }
    };

    // 1. From nodes collection logs
    allNodes.forEach((n) => {
      if (n.userId && n.userEmail) {
        addNodeIfUnique(n.userId, n.userName || "", n.userEmail);
      }
    });

    // 2. From high-privilege adminsList
    adminsList.forEach((a) => {
      if (a.id && a.email) {
        addNodeIfUnique(a.id, a.email.split("@")[0].toUpperCase(), a.email);
      }
    });

    // 3. From posts/pulses
    pulseAudit.forEach((p) => {
      if (p.userId && p.userName && p.userName !== "Anonymous Node") {
        const email =
          p.userEmail ||
          `${p.userName.toLowerCase().replace(/\s+/g, "")}@campus.edu`;
        addNodeIfUnique(p.userId, p.userName, email);
      }
    });

    // 4. From reviews
    reviewAudit.forEach((r) => {
      if (r.userId && r.userEmail) {
        addNodeIfUnique(r.userId, r.userName || "", r.userEmail);
      }
    });

    return list;
  };

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: "gig" | "pulse" | "teacher" | "alumni";
    label: string;
  } | null>(null);

  const deleteAcademicGig = (id: string, label: string) => {
    setConfirmDelete({ id, type: "gig", label });
  };

  const deletePulsePost = (id: string, label: string) => {
    setConfirmDelete({ id, type: "pulse", label });
  };

  const deleteTeacher = (id: string, label: string) => {
    setConfirmDelete({ id, type: "teacher", label });
  };

  const deleteAlumniPlacement = (id: string, company: string, role: string) => {
    setConfirmDelete({ id, type: "alumni", label: `${company} (${role})` });
  };

  const executeDelete = async () => {
    if (!db || !confirmDelete) return;
    const { id, type, label } = confirmDelete;

    // Safety check for teacher delete permission
    if (type === "teacher" && !isRootAdmin) {
      console.warn("Unauthorized: only root admin can delete faculty profiles");
      setConfirmDelete(null);
      return;
    }

    try {
      if (type === "gig") {
        await deleteDoc(doc(db, "academic_gigs", id));
        await logAdminAction(
          "DELETE_ACADEMIC_GIG",
          id,
          label,
          `Deleted assignment/work board gig "${label}"`,
        );
      } else if (type === "pulse") {
        await deleteDoc(doc(db, "posts", id));
        await logAdminAction(
          "DELETE_PULSE_POST",
          id,
          label,
          `Deleted pulse post "${label}"`,
        );
      } else if (type === "teacher") {
        await deleteDoc(doc(db, "teachers", id));
        await logAdminAction(
          "DELETE_TEACHER",
          id,
          label,
          `Deleted faculty profile "${label}"`,
        );
      } else if (type === "alumni") {
        await deleteDoc(doc(db, "placements", id));
        await logAdminAction(
          "DELETE_ALUMNI_PLACEMENT",
          id,
          label,
          `Deleted alumni placement board record for "${label}"`,
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmDelete(null);
    }
  };

  const unifiedNodes = getUnifiedNodes();

  // Helper to extract timestamp numeric values from various Firestore representation formats
  const getTimestamp = (val: any): number => {
    if (!val) return 0;
    if (val.seconds) return val.seconds * 1000;
    if (val.toDate && typeof val.toDate === "function") return val.toDate().getTime();
    const parsed = Date.parse(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. approvals ("FACULTY APPROVALS")
  const filteredApprovals = pendingTeachers
    .filter((t) => {
      const searchStr = `${t.name || ""} ${t.subject || ""} ${COLLEGES[t.collegeId]?.name || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesUni = filterUniversity === "all" || t.universityId === filterUniversity;
      const matchesCol = filterCollege === "all" || t.collegeId === filterCollege;
      return matchesSearch && matchesUni && matchesCol;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest fallback
    });

  // 2. issues ("SUPPORT TICKETS")
  const filteredIssues = tickets
    .filter((ticket) => {
      const searchStr = `${ticket.subject || ""} ${ticket.description || ""} ${ticket.userName || ""} ${ticket.userEmail || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "resolved" && ticket.resolved) ||
        (filterStatus === "open" && !ticket.resolved);
      const matchesPriority =
        filterPriority === "all" ||
        ticket.priority?.toLowerCase() === filterPriority.toLowerCase();
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const getPriorityVal = (p: string) => {
        const lp = p?.toLowerCase() || "";
        if (lp === "high") return 3;
        if (lp === "medium") return 2;
        return 1;
      };
      if (sortBy === "priority_desc") {
        const valDiff = getPriorityVal(b.priority) - getPriorityVal(a.priority);
        if (valDiff !== 0) return valDiff;
      }
      if (sortBy === "priority_asc") {
        const valDiff = getPriorityVal(a.priority) - getPriorityVal(b.priority);
        if (valDiff !== 0) return valDiff;
      }
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  // 3. registry ("AMBASSADORS")
  const filteredRegistry = unifiedNodes
    .filter((node) => {
      const nodeRoles = userRoles[node.userId] || [];
      const collegeId = userColleges[node.userId] || "";
      const collegeName = COLLEGES[collegeId]?.name || "";
      const searchStr = `${node.userName || ""} ${node.userEmail || ""} ${node.userId} ${collegeName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || nodeRoles.includes(filterRole);
      const matchesCol = filterCollege === "all" || collegeId === filterCollege;
      return matchesSearch && matchesRole && matchesCol;
    })
    .sort((a, b) => {
      if (sortBy === "name_desc") return (b.userName || "").localeCompare(a.userName || "");
      if (sortBy === "badges_desc") {
        const diff = (userRoles[b.userId] || []).length - (userRoles[a.userId] || []).length;
        if (diff !== 0) return diff;
      }
      if (sortBy === "badges_asc") {
        const diff = (userRoles[a.userId] || []).length - (userRoles[b.userId] || []).length;
        if (diff !== 0) return diff;
      }
      return (a.userName || "").localeCompare(b.userName || ""); // name_asc default
    });

  // 4. logs ("SYSTEM LOGS")
  const filteredLogs = adminLogs
    .filter((log) => {
      const searchStr = `${log.adminName || ""} ${log.adminEmail || ""} ${log.description || ""} ${log.actionType || ""} ${log.targetId || ""} ${log.targetName || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || log.actionType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const tA = getTimestamp(a.timestamp);
      const tB = getTimestamp(b.timestamp);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  // 5. intelligence ("FACULTY REVIEWS")
  const filteredIntelligence = reviewAudit
    .filter((r) => {
      const targetTeacher = allTeachers.find((t) => t.id === r.teacherId);
      const teacherName = r.teacherName || targetTeacher?.name || "";
      const collegeName = COLLEGES[targetTeacher?.collegeId || ""]?.name || "";
      const courseName = COURSES[targetTeacher?.courseId || ""]?.name || "";
      const searchStr = `${r.userName || ""} ${r.userEmail || ""} ${teacherName} ${collegeName} ${courseName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      
      let matchesRating = true;
      if (filterStatus !== "all") {
        const parts = filterStatus.split("-");
        if (parts.length === 2) {
          const minVal = Number(parts[0]);
          const maxVal = Number(parts[1]);
          const rVal = Number(r.rating);
          matchesRating = rVal >= minVal && rVal <= maxVal;
        } else {
          matchesRating = Math.round(Number(r.rating)) === Number(filterStatus);
        }
      }
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "rating_desc") {
        const diff = Number(b.rating) - Number(a.rating);
        if (diff !== 0) return diff;
      }
      if (sortBy === "rating_asc") {
        const diff = Number(a.rating) - Number(b.rating);
        if (diff !== 0) return diff;
      }
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest
    });

  // 6. gigs ("WORK BOARD GIGS")
  const filteredGigs = gigsAudit
    .filter((g) => {
      const collegeName = COLLEGES[g.collegeId]?.name || "";
      const searchStr = `${g.title || ""} ${g.subject || ""} ${g.userName || ""} ${g.userEmail || ""} ${g.bountyInfo || ""} ${g.description || ""} ${collegeName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesCol = filterCollege === "all" || g.collegeId === filterCollege;
      const matchesStatus = filterStatus === "all" || g.status === filterStatus;
      return matchesSearch && matchesCol && matchesStatus;
    })
    .sort((a, b) => {
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  // 7. pulse ("COMMUNITY POSTS")
  const filteredPulse = pulseAudit
    .filter((post) => {
      const tagsStr = post.tags?.join(" ") || "";
      const authorColName = COLLEGES[userColleges[post.userId] || ""]?.name || "";
      const searchStr = `${post.content || ""} ${post.userName || ""} ${tagsStr} ${authorColName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      
      const authorCollege = userColleges[post.userId] || "";
      const matchesCol = filterCollege === "all" || authorCollege === filterCollege;
      return matchesSearch && matchesCol;
    })
    .sort((a, b) => {
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  // 8. submissions ("FACULTY REGISTRY / ID UPLOADS")
  const filteredSubmissions = allTeachers
    .filter((t) => {
      const collegeName = COLLEGES[t.collegeId]?.name || "";
      const searchStr = `${t.name || ""} ${t.subject || ""} ${t.createdByName || ""} ${collegeName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      const matchesCol = filterCollege === "all" || t.collegeId === filterCollege;
      return matchesSearch && matchesStatus && matchesCol;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  // 9. college_requests ("COLLEGE TRANSFERS")
  const filteredCollegeRequests = changeRequests
    .filter((req: any) => {
      const searchStr = `${req.userName || ""} ${req.userEmail || ""} ${COLLEGES[req.oldCollegeId]?.name || ""} ${COLLEGES[req.newCollegeId]?.name || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      const matchesCol = filterCollege === "all" || req.newCollegeId === filterCollege;
      return matchesSearch && matchesStatus && matchesCol;
    })
    .sort((a: any, b: any) => {
      const tA = getTimestamp(a.createdAt || a.updatedAt);
      const tB = getTimestamp(b.createdAt || b.updatedAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  // 10. alumni ("ALUMNI PLACEMENTS")
  const filteredAlumni = placementsAudit
    .filter((item) => {
      const colName = COLLEGES[item.collegeId]?.name || "";
      const searchStr = `${item.company || ""} ${item.role || ""} ${item.userName || ""} ${item.userEmail || ""} ${item.description || ""} ${colName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesCol = filterCollege === "all" || item.collegeId === filterCollege;
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesCol && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "company_asc") return (a.company || "").localeCompare(b.company || "");
      const tA = getTimestamp(a.createdAt);
      const tB = getTimestamp(b.createdAt);
      if (sortBy === "oldest") return tA - tB;
      return tB - tA; // newest default
    });

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div>
          <div className="mono-label mb-4 text-[#8B5CF6]">
            High-Privilege Access
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Command.
          </h1>
        </div>
        <div className="flex flex-wrap gap-4">
          {(isRootAdmin
            ? [
                "approvals",
                "issues",
                "registry",
                "logs",
                "intelligence",
                "gigs",
                "pulse",
                "submissions",
                "college_requests",
              ]
            : [
                "approvals",
                "issues",
                "registry",
                "gigs",
                "pulse",
                "college_requests",
              ]
          ).map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2 font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === t ? "bg-white text-black shadow-2xl" : "text-zinc-500 hover:text-white"}`}
            >
              {t === "intelligence"
                ? "FACULTY REVIEWS"
                : t === "gigs"
                  ? "WORK BOARD GIGS"
                  : t === "logs"
                    ? "SYSTEM LOGS"
                    : t === "college_requests"
                      ? "COLLEGE TRANSFERS"
                      : t === "approvals"
                        ? "FACULTY APPROVALS"
                        : t === "issues"
                          ? "SUPPORT TICKETS"
                          : t === "registry"
                            ? "AMBASSADORS"
                            : t === "pulse"
                              ? "COMMUNITY POSTS"
                              : t === "submissions"
                                ? "ID UPLOADS"
                                : t.toUpperCase()}{" "}
              {t === "approvals" && `(${pendingTeachers.length})`}{" "}
              {t === "issues" &&
                `(${tickets.filter((ty) => !ty.resolved).length})`}{" "}
              {t === "college_requests" &&
                `(${changeRequests.filter((cr: any) => cr.status === "pending").length})`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search faculty name, subject, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterUniversity}
                onChange={(e) => setFilterUniversity(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Universities</option>
                {UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
              >
                <option value="all">All Colleges</option>
                {Object.entries(COLLEGES).map(([id, col]: any) => (
                  <option key={id} value={id}>{col.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest Request</option>
                <option value="oldest">Oldest Request</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredApprovals.length} of {pendingTeachers.length} Pending Verifications</span>
            {searchTerm || filterUniversity !== "all" || filterCollege !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterUniversity("all");
                  setFilterCollege("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredApprovals.map((t) => (
              <div key={t.id} className="vantage-card">
                <div className="flex justify-between mb-8">
                  <span className="vantage-tag bg-amber-600 text-white border-amber-600">
                    Pending Verification
                  </span>
                  <span className="mono-label">Node {t.id.slice(0, 4)}</span>
                </div>
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                  {t.name}
                </h4>
                <div className="flex flex-col gap-1 mb-8">
                  <p className="mono-label text-zinc-500 text-[10px]">
                    {UNIVERSITIES.find((u) => u.id === t.universityId)?.name}
                  </p>
                  <p className="mono-label text-zinc-500 text-[10px]">
                    {COLLEGES[t.collegeId]?.name}
                  </p>
                  <p className="mono-label text-[#8B5CF6] text-[10px] uppercase font-bold">
                    {COURSES[t.courseId]?.name} // {t.subject}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => approveTeacher(t.id)}
                    className="flex-1 bg-white text-black py-3 font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => rejectTeacher(t.id)}
                    className="flex-1 border border-zinc-800 text-white py-3 font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 hover:border-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
            {filteredApprovals.length === 0 && (
              <div className="col-span-full py-32 text-center borderBorder border-zinc-900">
                <p className="mono-label">No matching teacher requests found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "issues" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search tickets by subject, description, user name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Active/Open</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="priority_desc">Priority: High ➔ Low</option>
                <option value="priority_asc">Priority: Low ➔ High</option>
                <option value="newest">Date: Newest</option>
                <option value="oldest">Date: Oldest</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredIssues.length} of {tickets.length} Integrity Support Tickets</span>
            {searchTerm || filterStatus !== "all" || filterPriority !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterPriority("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="space-y-6">
            {filteredIssues.map((ticket) => (
              <div
                key={ticket.id}
                className={`vantage-card border-none flex flex-col md:row justify-between gap-8 items-start transition-all ${ticket.resolved ? "bg-zinc-950 opacity-40" : "bg-zinc-900 border-l-2 border-red-500/50"}`}
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={ticket.resolved}
                        onChange={() =>
                          toggleTicketResolution(ticket.id, !!ticket.resolved)
                        }
                        className="w-5 h-5 bg-black border-2 border-zinc-700 checked:bg-emerald-500 cursor-pointer"
                      />
                      <span
                        className={`mono-label uppercase text-[10px] ${ticket.resolved ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {ticket.resolved ? "RESOLVED" : "ACTIVE_ISSUE"} //{" "}
                        {ticket.priority} prio
                      </span>
                    </div>
                    {ticket.issueType && (
                      <span className={`px-2 py-0.5 font-mono text-[8.5px] font-black tracking-widest uppercase rounded-sm border ${ticket.issueType === 'missing_subject' ? 'bg-red-950/40 text-red-400 border-red-900/60' : 'bg-purple-950/40 text-purple-400 border-[#8B5CF6]/60'}`}>
                        CATEGORY: {ticket.issueType.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-xl font-bold uppercase mb-2 tracking-tight ${ticket.resolved ? "text-zinc-600" : "text-white"}`}
                  >
                    {ticket.subject}
                  </h4>

                  {/* ADMIN INFO BOX FOR MISSING METHOD LOGS */}
                  {ticket.issueType === "missing_subject" && (
                    <div className="mb-4 mt-2 p-4 bg-zinc-950 border border-zinc-805 space-y-2">
                      <div className="text-[9px] font-mono tracking-widest text-[#8B5CF6] font-bold uppercase mb-2 underline">Missing Academic Subject Audit Details:</div>
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                        <div className="text-zinc-500 font-bold uppercase">COLLEGE:</div>
                        <div className="col-span-3 text-white uppercase">{ticket.collegeName || "N/A"}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                        <div className="text-zinc-500 font-bold uppercase">COURSE:</div>
                        <div className="col-span-3 text-white uppercase">{ticket.courseName || "N/A"}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                        <div className="text-zinc-500 font-bold uppercase">MISSING SUB:</div>
                        <div className="col-span-3 text-red-400 font-black uppercase">{ticket.missingSubject || "N/A"}</div>
                      </div>
                    </div>
                  )}

                  <p className="text-zinc-400 font-light mb-6 leading-relaxed whitespace-pre-wrap text-[13px] bg-black/20 p-3 border border-zinc-950">
                    "{ticket.description}"
                  </p>

                  {/* ADMIN PROOF SHOWCASE */}
                  {ticket.attachedPhoto && (
                     <div className="mb-6">
                       <div className="text-[10px] font-mono text-zinc-500 uppercase font-black mb-2 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span> Attached Screenshot Proof:
                       </div>
                       <div className="p-2 border border-zinc-800 bg-zinc-950/80 max-w-sm rounded-none">
                         <a
                           href={ticket.attachedPhoto}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="block relative group overflow-hidden cursor-zoom-in"
                         >
                           <img
                             src={ticket.attachedPhoto}
                             alt="Audit Discrepancy Attachment"
                             referrerPolicy="no-referrer"
                             className="max-h-40 object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150">
                             <span className="text-[9px] font-mono font-black uppercase text-white bg-black border border-white px-3 py-1.5 hover:bg-white hover:text-black transition-colors">
                               View Screenshot
                             </span>
                           </div>
                         </a>
                       </div>
                     </div>
                  )}

                  <div className="flex gap-4 items-center flex-wrap w-full">
                    <div className="w-8 h-8 bg-black flex items-center justify-center text-[10px] font-black text-white italic border border-zinc-800">
                      {ticket.userName?.[0]}
                    </div>
                    <span className="mono-label text-[10px] text-zinc-300">
                      {ticket.userName} ({ticket.userEmail})
                    </span>
                    {ticket.resolvedAt && (
                      <span className="text-[9px] text-zinc-600 italic shadow-sm">
                        Resolved nodes closed at{" "}
                        {new Date(
                          ticket.resolvedAt.seconds * 1000,
                        ).toLocaleDateString()}
                      </span>
                    )}
                    {confirmDeleteId === ticket.id ? (
                      <div className="ml-auto flex items-center gap-2 flex-wrap animate-in fade-in zoom-in duration-150">
                        <span className="text-[8.5px] font-mono font-black text-red-400 uppercase tracking-widest mr-1">
                          SURE? PERMANENT ACTION //
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            deleteTicket(ticket.id).catch(console.error);
                            setConfirmDeleteId(null);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer rounded-none font-bold"
                        >
                          CONFIRM PURGE
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 bg-zinc-950 border border-zinc-805 text-zinc-400 hover:text-white text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer rounded-none"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(ticket.id)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-900 border border-red-900 text-red-550 hover:text-white text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer rounded-none"
                      >
                        <Trash2 size={11} /> Purge Issue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredIssues.length === 0 && (
              <div className="text-center py-32 border border-dashed border-zinc-900">
                <p className="mono-label">Zero matching support tickets found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "registry" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search ambassador by name, email, UID, college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Badges</option>
                {Object.entries(ROLE_BADGES).map(([key, config]) => (
                  <option key={key} value={key}>Badge: {config.label}</option>
                ))}
              </select>

              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
              >
                <option value="all">All Colleges</option>
                {Object.entries(COLLEGES).map(([id, col]: any) => (
                  <option key={id} value={id}>{col.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="badges_desc">Most Badges</option>
                <option value="badges_asc">Least Badges</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredRegistry.length} of {unifiedNodes.length} Ambassador Profiles</span>
            {searchTerm || filterRole !== "all" || filterCollege !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("all");
                  setFilterCollege("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          {/* Nodes Registry */}
          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800 animate-in fade-in duration-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/20">
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase w-1/4">
                    Student User & UID
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase w-1/2">
                    Roles & Badges (Click to Toggle)
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase text-right w-1/4">
                    Administration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredRegistry.map((node) => {
                  const isRoot =
                    node.userEmail === "237tanishaqverma@gmail.com";
                  const nodeRoles = userRoles[node.userId] || [];
                  const hasAdminPrivilege =
                    isRoot ||
                    nodeRoles.includes("ADMIN") ||
                    adminsList.some((a) => a.id === node.userId);

                  return (
                    <tr
                      key={node.userId + "-" + node.userEmail}
                      className="hover:bg-zinc-950/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="text-[10px] font-bold text-white uppercase flex items-center gap-2">
                          {node.userName || "Unknown Student"}
                          {userColleges[node.userId] && (
                            <span className="px-1.5 py-0.5 text-[7px] font-black bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono tracking-widest uppercase rounded-none leading-none">
                              {COLLEGES[userColleges[node.userId]]?.name.split(
                                " ",
                              )[0] || userColleges[node.userId]}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8B5CF6] font-mono select-all truncate">
                          {node.userEmail}
                        </div>
                        <div className="text-[8px] text-zinc-650 font-mono mt-1 uppercase selection:bg-white selection:text-black">
                          UID: {node.userId}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(ROLE_BADGES).map(([key, config]) => {
                            const isActive = nodeRoles.includes(key);
                            if (key === "ADMIN" && (isRoot || !isRootAdmin))
                              return null;
                            return (
                              <button
                                key={key}
                                onClick={() =>
                                  toggleUserRoleTag(
                                    node.userId,
                                    node.userEmail,
                                    key,
                                  )
                                }
                                className={`px-2 py-1 text-[8px] font-black uppercase font-mono tracking-tighter border transition-all ${
                                  isActive
                                    ? `${config.bg} ${config.text} ${config.border} ring-1 ring-offset-1 ring-offset-black ring-zinc-800`
                                    : "bg-zinc-950 text-zinc-600 border-zinc-900/50 hover:border-zinc-700/50 hover:text-zinc-400"
                                }`}
                              >
                                {isActive ? "● " : ""}
                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {isRoot ? (
                          <span className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase bg-zinc-900 px-3 py-1.5 border border-zinc-800">
                            ROOT_AUTHORITY
                          </span>
                        ) : isRootAdmin ? (
                          <button
                            onClick={() =>
                              toggleUserRole(node.userId, node.userEmail)
                            }
                            className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider border transition-all ${
                              hasAdminPrivilege
                                ? "bg-red-600/15 border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white"
                                : "bg-white text-black border-white hover:bg-[#8B5CF6] hover:border-[#8B5CF6] hover:text-white"
                            }`}
                          >
                            {hasAdminPrivilege
                              ? "REVOKE_ADM_PRIV"
                              : "GRANT_ADM_PRIV"}
                          </button>
                        ) : (
                          <span className="text-[9px] text-zinc-650 font-mono tracking-wider uppercase bg-zinc-950 px-3 py-1.5 border border-zinc-900/50">
                            RESTRICTED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRegistry.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No matching student profiles found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "logs" && isRootAdmin && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search logs by operator name/email, target description, or action ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Action Categories</option>
                <option value="APPROVE_TEACHER">APPROVE_TEACHER</option>
                <option value="REJECT_TEACHER">REJECT_TEACHER</option>
                <option value="GRANT_ADMIN">GRANT_ADMIN</option>
                <option value="REVOKE_ADMIN">REVOKE_ADMIN</option>
                <option value="GRANT_BADGE">GRANT_BADGE</option>
                <option value="REVOKE_BADGE">REVOKE_BADGE</option>
                <option value="DELETE_MARKET_ITEM">DELETE_MARKET_ITEM</option>
                <option value="DELETE_PULSE_POST">DELETE_PULSE_POST</option>
                <option value="DELETE_TEACHER">DELETE_TEACHER</option>
                <option value="DELETE_ALUMNI_PLACEMENT">DELETE_ALUMNI_PLACEMENT</option>
                <option value="APPROVE_COLLEGE_SWITCH">APPROVE_COLLEGE_SWITCH</option>
                <option value="REJECT_COLLEGE_SWITCH">REJECT_COLLEGE_SWITCH</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredLogs.length} of {adminLogs.length} System Logs</span>
            {searchTerm || filterType !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/20">
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase w-1/4">
                    Operator
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase w-1/5">
                    Action Category
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase w-2/5">
                    Activity Description
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase text-right w-1/6">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredLogs.map((log) => {
                  let badgeClass = "bg-zinc-800 text-zinc-450 border-zinc-750";
                  if (
                    log.actionType?.includes("APPROVE") ||
                    log.actionType?.includes("RESOLVE")
                  ) {
                    badgeClass =
                      "bg-emerald-600/15 text-emerald-400 border-emerald-500/20";
                  } else if (
                    log.actionType?.includes("REJECT") ||
                    log.actionType?.includes("REVOKE") ||
                    log.actionType?.includes("DELETE")
                  ) {
                    badgeClass = "bg-red-650/15 text-red-500 border-red-505/20";
                  } else if (log.actionType?.includes("GRANT")) {
                    badgeClass =
                      "bg-indigo-600/15 text-[#8B5CF6] border-[#8B5CF6]/20";
                  }

                  const logTime = log.timestamp?.seconds
                    ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                    : log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "N/A";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-950/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="text-[10px] font-bold text-white uppercase">
                          {log.adminName || "OPERATOR"}
                        </div>
                        <div className="text-[10px] text-zinc-450 font-mono select-all truncate max-w-xs">
                          {log.adminEmail}
                        </div>
                        <div className="text-[8px] text-zinc-650 font-mono mt-1 selection:bg-white selection:text-black uppercase">
                          UID: {log.adminId}
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-2 py-1 text-[8px] font-black uppercase font-mono tracking-tighter border ${badgeClass}`}
                        >
                          {log.actionType || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="text-[11px] text-zinc-300 font-mono leading-relaxed">
                          {log.description}
                        </div>
                        <div className="text-[8px] text-zinc-600 font-mono mt-1 uppercase select-all">
                          TARGET ID: {log.targetId}
                        </div>
                      </td>
                      <td className="p-6 text-right font-mono text-[9px] text-zinc-500">
                        {logTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No matching admin activity logs found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "intelligence" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search reviews by student name/email, target faculty, or course name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="1-2">Rating: 1 - 2</option>
                <option value="2-3">Rating: 2 - 3</option>
                <option value="3-4">Rating: 3 - 4</option>
                <option value="4-5">Rating: 4 - 5</option>
                <option value="5-6">Rating: 5 - 6</option>
                <option value="6-7">Rating: 6 - 7</option>
                <option value="7-8">Rating: 7 - 8</option>
                <option value="8-9">Rating: 8 - 9</option>
                <option value="9-10">Rating: 9 - 10</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest Review</option>
                <option value="oldest">Oldest Review</option>
                <option value="rating_desc">Rating: High ➔ Low</option>
                <option value="rating_asc">Rating: Low ➔ High</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredIntelligence.length} of {reviewAudit.length} Faculty Reviews</span>
            {searchTerm || filterStatus !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800 animate-in fade-in duration-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900">
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Student Email
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Target Faculty
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Intelligence Matrix
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase text-right">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredIntelligence.map((r) => {
                  const targetTeacher = allTeachers.find(
                    (t) => t.id === r.teacherId,
                  );
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-zinc-950/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="text-[10px] font-bold text-white uppercase flex items-center gap-2">
                          {r.userName || "Anonymous"}
                          {r.userId && userColleges[r.userId] && (
                            <span className="px-1.5 py-0.5 text-[7px] font-black bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono tracking-widest uppercase rounded-none leading-none">
                              {COLLEGES[userColleges[r.userId]]?.name.split(
                                " ",
                              )[0] || userColleges[r.userId]}
                            </span>
                          )}
                        </div>
                        <div className="text-[8px] text-[#8B5CF6] font-mono">
                          {r.userEmail || "STUDENT_USER"}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-[10px] font-bold text-white uppercase">
                          {r.teacherName ||
                            targetTeacher?.name ||
                            "UNKNOWN_FACULTY"}
                        </div>
                        <div className="text-[8px] text-zinc-650 uppercase">
                          {COLLEGES[targetTeacher?.collegeId || ""]?.name ||
                            "CAMPUS_ANC"}{" "}
                          //{" "}
                          {COURSES[targetTeacher?.courseId || ""]?.name ||
                            "DISC_ANC"}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-3 items-center">
                          <span className="text-white font-black italic">
                            {r.rating}.0
                          </span>
                          <div className="flex gap-2 text-[8px] mono-label text-zinc-600">
                            <span>P:{r.pedagogy}</span>
                            <span>POL:{r.strictness}</span>
                            <span>G:{r.grading}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="text-[9px] text-zinc-500 font-mono">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "LEGACY"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredIntelligence.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No matching faculty reviews found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "gigs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search gigs by title, subject, poster name/email, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
              >
                <option value="all">All Colleges</option>
                {Object.entries(COLLEGES).map(([id, col]: any) => (
                  <option key={id} value={id}>{col.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Gigs</option>
                <option value="assigned">Assigned Gigs</option>
                <option value="completed">Completed Gigs</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredGigs.length} of {gigsAudit.length} Active Work Board Gigs</span>
            {searchTerm || filterCollege !== "all" || filterStatus !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCollege("all");
                  setFilterStatus("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/20">
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Work Board Listing Details
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Operative (Who Posted)
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Bounty & Type
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Attachments
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    State
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase text-right">
                    Sanctions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredGigs.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-zinc-950/50 transition-colors"
                  >
                    <td className="p-6 max-w-sm">
                      <div className="text-[10px] font-bold text-white uppercase tracking-wide">
                        {g.title}
                      </div>
                      <div className="text-[8px] text-[#8B5CF6] mt-0.5 uppercase font-mono tracking-wider font-extrabold">
                        {g.subject} // {g.workType}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-2 font-mono whitespace-normal leading-relaxed line-clamp-3">
                        {g.description}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] font-bold text-white uppercase">
                        {g.userName}
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        {g.userEmail}
                      </div>
                      <span className="mt-1.5 inline-block px-1.5 py-0.5 text-[7px] font-black bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono tracking-widest uppercase rounded-none leading-none">
                        {COLLEGES[g.collegeId]?.name || "UNKNOWN_CAMPUS"}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-black italic text-white leading-none">
                        ₹{g.payout}
                      </div>
                      <div className="text-[8px] text-zinc-500 font-mono mt-1 uppercase">
                        Payout Value
                      </div>
                    </td>
                    <td className="p-6 font-mono">
                      <div className="space-y-1.5">
                        {g.attachments && g.attachments.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {g.attachments.map((file, idx) => (
                              <div
                                key={idx}
                                className="group/file relative border border-zinc-800 bg-zinc-950/50 p-1 flex items-center gap-1.5 max-w-[120px] overflow-hidden"
                                title={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                              >
                                {file.type === "image" ? (
                                  <div className="w-8 h-8 shrink-0 bg-black overflow-hidden flex items-center justify-center">
                                    <img
                                      src={file.dataUrl}
                                      alt="Attachment preview"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 shrink-0 bg-zinc-900 border border-zinc-850 flex items-center justify-center text-[#8B5CF6]">
                                    <FileText size={14} />
                                  </div>
                                )}
                                <div className="text-[7px] font-mono leading-none truncate max-w-[65px]">
                                  <span className="block text-zinc-300 truncate lowercase">
                                    {file.name}
                                  </span>
                                  <span className="block text-zinc-500 mt-0.5">
                                    {(file.size / 1024).toFixed(0)} KB
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[8px] text-zinc-600 font-mono italic">
                            NO SOURCE ATTACHMENTS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-block px-2 py-1 text-[8px] font-black font-mono uppercase rounded-none tracking-widest ${
                        g.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : g.status === "assigned"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => deleteAcademicGig(g.id, g.title)}
                        className="text-red-500 hover:text-red-400 p-2 transition-colors hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        title="Decommission Academic Listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredGigs.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No academic postings found matching the filters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pulse" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search posts by content, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
              >
                <option value="all">All Colleges</option>
                {Object.entries(COLLEGES).map(([id, col]: any) => (
                  <option key={id} value={id}>{col.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredPulse.length} of {pulseAudit.length} Broadcast Posts</span>
            {searchTerm || filterCollege !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCollege("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800 animate-in fade-in duration-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900">
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Broadcast Author
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Origin
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase">
                    Timestamp
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-500 uppercase text-right">
                    Sanction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredPulse.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-zinc-950/50 transition-colors"
                  >
                    <td className="p-6">
                      <div className="text-[10px] font-medium text-white max-w-md line-clamp-2 italic">
                        "{post.content}"
                      </div>
                      <div className="flex gap-2 mt-2">
                        {post.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[7px] text-[#8B5CF6] uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] font-bold text-white uppercase flex items-center gap-2">
                        {post.userName}
                        {post.userId && userColleges[post.userId] && (
                          <span className="px-1.5 py-0.5 text-[7px] font-black bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono tracking-widest uppercase rounded-none leading-none">
                            {COLLEGES[userColleges[post.userId]]?.name.split(
                              " ",
                            )[0] || userColleges[post.userId]}
                          </span>
                        )}
                      </div>
                      <div className="text-[8px] text-zinc-650 font-mono">
                        USER_{post.userId.slice(0, 8)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[9px] text-zinc-500 font-mono">
                        {post.createdAt?.seconds
                          ? new Date(
                              post.createdAt.seconds * 1000,
                            ).toLocaleString()
                          : "LEGACY"}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => deletePulsePost(post.id, post.content)}
                        className="text-red-500 hover:text-red-400 p-2 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPulse.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No matching broadcast posts found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search faculty name, subject, or creator details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
              >
                <option value="all">All Colleges</option>
                {Object.entries(COLLEGES).map(([id, col]: any) => (
                  <option key={id} value={id}>{col.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest Profile</option>
                <option value="oldest">Oldest Profile</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
            </div>

            {isRootAdmin && (
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <button
                  onClick={handleSeedVipsData}
                  disabled={isSeeding}
                  className="bg-[#8B5CF6] text-black hover:bg-[#a78bfa] disabled:opacity-50 text-[10px] font-mono px-4 py-2 uppercase font-bold select-none cursor-pointer transition-all whitespace-nowrap"
                >
                  {isSeeding ? "Syncing..." : "Sync Data"}
                </button>
                {seedStatus && (
                  <span className="text-[9px] text-[#8B5CF6] font-mono animate-pulse uppercase tracking-wider text-right max-w-[200px] break-words">
                    {seedStatus}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredSubmissions.length} of {allTeachers.length} Faculty Directory Submissions</span>
            {searchTerm || filterStatus !== "all" || filterCollege !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterCollege("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800 animate-in fade-in duration-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/20">
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Faculty Name
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Origin
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Submitted On
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Approved On
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase text-right">
                    Status // Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredSubmissions.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-zinc-950/50 transition-colors"
                  >
                    <td className="p-6">
                      <div className="text-[10px] font-bold text-white uppercase">
                        {t.name}
                      </div>
                      <div className="text-[8px] text-[#8B5CF6] uppercase font-mono mt-0.5">
                        {COLLEGES[t.collegeId]?.name.split(" ")[0]} // {t.subject}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] font-bold text-white uppercase">
                        {t.createdByName || "ANC"}
                      </div>
                      <div className="text-[8px] text-zinc-650 uppercase font-mono">
                        {t.createdBy?.slice(0, 8)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[9px] text-zinc-500 font-mono">
                        {t.createdAt?.seconds
                          ? new Date(t.createdAt.seconds * 1000).toLocaleString()
                          : "LEGACY"}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[9px] text-emerald-500 font-mono italic">
                        {t.approvedAt?.seconds
                          ? new Date(t.approvedAt.seconds * 1000).toLocaleString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="p-6 text-right flex items-center justify-end gap-3">
                      <span
                        className={`px-2 py-1 text-[8px] font-black uppercase ${t.status === "active" ? "bg-emerald-600/10 text-emerald-500 border border-emerald-950/30" : t.status === "pending" ? "bg-amber-600/10 text-amber-500 border border-amber-950/30" : "bg-red-600/10 text-red-500 border border-red-950/30"}`}
                      >
                        {t.status}
                      </span>
                      {isRootAdmin && (
                        <button
                          onClick={() => deleteTeacher(t.id, t.name)}
                          className="text-red-500 hover:text-red-400 p-2 transition-colors"
                          title="Purge Faculty Profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No matching faculty profile submissions found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "college_requests" && (
        <div className="space-y-6">
          <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search requests by student name, email, or college names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer max-w-xs"
              >
                <option value="all">All Desired Colleges</option>
                {Object.entries(COLLEGES).map(([id, col]: any) => (
                  <option key={id} value={id}>{col.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white text-[11px] font-mono px-3 py-2 uppercase focus:outline-none focus:border-[#8B5CF6] rounded-none cursor-pointer"
              >
                <option value="newest">Newest Request</option>
                <option value="oldest">Oldest Request</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 italic uppercase flex justify-between items-center">
            <span>Showing {filteredCollegeRequests.length} of {changeRequests.length} Amendment Requests</span>
            {searchTerm || filterStatus !== "all" || filterCollege !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterCollege("all");
                }}
                className="text-[#8B5CF6] hover:underline text-[9px] font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="vantage-card overflow-x-auto bg-[#050505] p-0 border border-zinc-800 animate-in fade-in duration-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/20">
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    User Metadata
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Old Sector
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Desired Sector
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase">
                    Affiliation ID Card Proof
                  </th>
                  <th className="p-6 text-[9px] mono-label text-zinc-300 uppercase text-right">
                    Status // Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredCollegeRequests.map((req: any) => {
                  const oldName =
                    COLLEGES[req.oldCollegeId]?.name ||
                    req.oldCollegeId ||
                    "Unknown";
                  const newName =
                    COLLEGES[req.newCollegeId]?.name ||
                    req.newCollegeId ||
                    "Unknown";
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-zinc-950/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="text-[10px] font-bold text-white uppercase">
                          {req.userName}
                        </div>
                        <div className="text-[8px] text-[#8B5CF6] font-mono">
                          {req.userEmail}
                        </div>
                        <div className="text-[7px] text-zinc-650 font-mono mt-1">
                          UID: {req.userId}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase">
                          {oldName}
                        </div>
                        <div className="text-[8px] text-zinc-650 font-mono">
                          ID: {req.oldCollegeId}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-[9px] text-[#8B5CF6] font-bold uppercase">
                          {newName}
                        </div>
                        <div className="text-[8px] text-zinc-655 font-mono">
                          ID: {req.newCollegeId}
                        </div>
                      </td>
                      <td className="p-6">
                        {req.idCardPhoto ? (
                          <div className="border border-zinc-900 p-1 bg-black w-24 hover:border-zinc-700 transition-all">
                            <img
                              src={req.idCardPhoto}
                              alt="ID card proof"
                              className="max-h-12 w-full object-cover cursor-zoom-in"
                              onClick={() => {
                                const w = window.open();
                                w?.document.write(
                                  `<img src="${req.idCardPhoto}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`,
                                );
                              }}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <span className="text-[8px] mono-label text-zinc-650 uppercase">
                            No Card Found
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {req.status === "pending" ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() =>
                                  approveCollegeRequest(
                                    req.id,
                                    req.userId,
                                    req.newCollegeId,
                                  )
                                }
                                className="px-3 py-1.5 bg-emerald-500 text-black text-[8px] font-mono font-black uppercase tracking-widest hover:bg-emerald-400 transition-all rounded-none"
                              >
                                Approve Switch
                              </button>
                              <button
                                onClick={() => rejectCollegeRequest(req.id)}
                                className="px-3 py-1.5 bg-red-650/20 text-red-400 border border-red-950 text-[8px] font-mono uppercase hover:bg-red-650/40 rounded-none"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest ${
                                req.status === "approved"
                                  ? "bg-emerald-600/10 text-emerald-500 border border-emerald-950"
                                  : "bg-red-600/10 text-red-500 border border-red-950"
                              }`}
                            >
                              {req.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredCollegeRequests.length === 0 && (
              <div className="text-center py-20">
                <p className="mono-label opacity-40 italic">
                  No matching college transfer files logged.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Tactical Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#050505] border border-red-900/50 p-8 shadow-2xl text-center animate-in fade-in zoom-in duration-300"
            >
              <div className="mono-label text-red-500 mb-2">
                // IRREVERSIBLE ACTION SECURITY VERIFICATION
              </div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                Confirm Decommission
              </h3>
              <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-8 leading-relaxed">
                Are you absolutely sure you want to permanently delete the{" "}
                {confirmDelete.type} entry: <br />
                <span className="text-white font-bold mt-2 inline-block">
                  "{confirmDelete.label}"
                </span>
                ?
                <br />
                This will purge all relational data from the database.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={executeDelete}
                  className="flex-1 bg-red-600 text-white py-3 font-black uppercase text-xs tracking-[0.2em] hover:bg-red-500 transition-all border border-red-600 cursor-pointer"
                >
                  Confirm Purge
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 border border-zinc-800 text-white py-3 font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportView({ onShowModal }: { onShowModal: () => void }) {
  const { db, auth, user } = useFirebase();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!db || !user) return;
    const q = query(
      collection(db, "tickets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTickets(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as SupportTicket,
          ),
        );
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "tickets", auth),
    );
    return unsubscribe;
  }, [db, user, auth]);

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div>
          <div className="mono-label mb-4 text-[#8B5CF6]">
            Integrity & Support
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Support.
          </h1>
        </div>
        <button
          onClick={onShowModal}
          className="vantage-btn-primary flex items-center gap-3"
        >
          <Plus size={20} />
          Raise Issue
        </button>
      </div>

      <div className="space-y-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="vantage-card border-l-4 border-zinc-800 hover:border-[#8B5CF6] transition-all bg-zinc-950/20"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <span
                  className={`w-2 h-2 rounded-full ${ticket.status === "open" ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
                ></span>
                <span className="mono-label uppercase text-[10px]">
                  {ticket.status}
                </span>
                {ticket.issueType && (
                  <span className={`px-2 py-0.5 font-mono text-[8px] font-black tracking-widest uppercase ${ticket.issueType === 'missing_subject' ? 'bg-red-950/50 text-red-400 border border-red-900/35' : 'bg-purple-950/50 text-purple-400 border border-[#8B5CF6]/35'}`}>
                    {ticket.issueType.replace("_", " ")}
                  </span>
                )}
              </div>
              <span className="mono-label text-[9px] opacity-30">
                Ticket ID: {ticket.id.slice(0, 8)}
              </span>
            </div>
            
            <h4 className="text-xl font-bold text-white uppercase mb-4 tracking-tight">
              {ticket.subject}
            </h4>

            {/* RENDER SPECIFIC METADATA IN CLEAN LAYOUT TABLE IF MISSING SUBJECT */}
            {ticket.issueType === "missing_subject" && (
              <div className="mb-6 p-4 bg-black border border-zinc-900 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono leading-none">
                  <div className="text-zinc-600 uppercase">COLLEGE:</div>
                  <div className="col-span-2 text-zinc-300 uppercase font-bold">{ticket.collegeName}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono leading-none">
                  <div className="text-zinc-600 uppercase">COURSE:</div>
                  <div className="col-span-2 text-zinc-300 uppercase font-bold">{ticket.courseName}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono leading-none">
                  <div className="text-zinc-600 uppercase">MISSING TOPIC:</div>
                  <div className="col-span-2 text-red-400 uppercase font-black">{ticket.missingSubject}</div>
                </div>
              </div>
            )}

            <p className="text-zinc-500 font-light leading-relaxed mb-6 whitespace-pre-wrap">
              "{ticket.description}"
            </p>

            {/* SCREENSHOT ATTACHMENT DISPLAY */}
            {ticket.attachedPhoto && (
              <div className="mb-6 animate-in fade-in duration-200">
                <div className="text-[9px] font-mono text-zinc-500 uppercase mb-2">Attached screenshot proof:</div>
                <div className="w-full max-w-sm border border-zinc-900 bg-black p-2">
                  <a href={ticket.attachedPhoto} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden cursor-zoom-in">
                    <img
                      src={ticket.attachedPhoto}
                      alt="User Attachment"
                      referrerPolicy="no-referrer"
                      className="max-h-48 object-contain w-auto mx-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="font-mono text-[9px] font-black uppercase text-white border border-white px-3 py-1.5 bg-black">
                        Open Full Image
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-zinc-900/50">
              <div className="flex items-center gap-3 text-zinc-600 font-mono">
                <Clock size={12} />
                <span className="mono-label text-[9px]">
                  Opened {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : 'just now'}
                </span>
              </div>
              <span className="mono-label text-[9px] text-[#8B5CF6]">
                Protocol Status:{" "}
                {ticket.status === "open" ? "Awaiting Human Audit" : "Resolved"}
              </span>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-32 bg-zinc-950/20 border-2 border-dashed border-zinc-900 px-12">
            <p className="text-zinc-500 font-light mb-8">
              System integrity is optimal. If you encounter any protocol
              failures or faculty discrepancies, please initialize a support
              node.
            </p>
            <button onClick={onShowModal} className="vantage-btn-secondary">
              Raise First Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddPostModal({
  onClose,
  userCollegeId,
}: {
  onClose: () => void;
  userCollegeId?: string;
}) {
  const { db, auth, user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !auth || !user) return;
    if (userCollegeId === "just_out_of_school") {
      alert("ACCESS RESTRICTED: As an Aspirant or High School Graduate (Just Out of School), you are not permitted to broadcast pulse bulletins.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: isAnonymous
          ? "Anonymous Node"
          : user.displayName || user.email,
        content,
        tags: ["academic_intel"],
        replyCount: 0,
        likes: [],
        collegeId: userCollegeId || "default_campus",
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "posts", auth);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#050505] border border-zinc-800 p-12 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-8 text-[#444] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <div className="mono-label mb-4 text-[#8B5CF6]">
          Broadcast Protocol // Peer Pulse
        </div>
        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-12 leading-none">
          New Broadcast
        </h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="mono-label text-[10px] text-zinc-500 uppercase">
              Transmission Content
            </label>
            <textarea
              required
              placeholder="Share intel, survival tips, or campus pulse..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 bg-[#0A0A0A] border-2 border-zinc-800 focus:border-[#8B5CF6] p-6 text-lg font-medium text-white transition-all outline-none resize-none placeholder:text-zinc-800"
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-[#8B5CF6]">
                {isAnonymous ? <Shield size={20} /> : <UserIcon size={20} />}
              </div>
              <div>
                <div className="text-[10px] mono-label text-zinc-500 uppercase">
                  Identity Protocol
                </div>
                <div className="text-xs font-black text-white uppercase">
                  {isAnonymous
                    ? "Anonymous"
                    : user?.displayName || "Verified User"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${isAnonymous ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "border-zinc-800 text-zinc-500 hover:text-white"}`}
            >
              Toggle Stealth
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="vantage-btn-primary w-full disabled:opacity-20 flex items-center justify-center gap-4 py-6"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <TrendingUp size={20} />
            )}
            Transmit Pulse
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AddMarketModal({
  onClose,
  userCollegeId,
}: {
  onClose: () => void;
  userCollegeId?: string;
}) {
  const { db, auth, user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(userCollegeId ? 2 : 1);
  const [searchCollege, setSearchCollege] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "education" as const,
    condition: "used-good" as const,
    contactPhone: "",
    universityId: userCollegeId
      ? (UNIVERSITIES.find((u) => u.collegeIds.includes(userCollegeId))?.id || "")
      : "",
    collegeId: userCollegeId || "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !auth || !user) return;
    if (!formData.universityId || !formData.collegeId) {
      alert("Academic Sector Identification Required.");
      return;
    }
    if (!formData.title || !formData.price || !formData.description) {
      alert("Asset specifications incomplete.");
      return;
    }

    setIsSubmitting(true);
    try {
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      await addDoc(collection(db, "marketplace"), {
        ...formData,
        sellerId: user.uid,
        sellerName: user.displayName || user.email,
        sellerEmail: user.email,
        contactInfo: user.email, // Assigned directly to the authenticated user's email, can never be edited or hidden
        contactPhone: formData.contactPhone.trim(),
        price: parseFloat(formData.price),
        currency: "INR",
        images: [],
        status: "available",
        createdAt: Date.now(),
        expiresAt: Date.now() + oneMonth,
      });
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "marketplace", auth);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUni = UNIVERSITIES.find((u) => u.id === formData.universityId);
  const selectedCollegeObjs = (
    selectedUni?.collegeIds.map((cId) => COLLEGES[cId]) || []
  ).filter((c) => c.name.toLowerCase().includes(searchCollege.toLowerCase()));

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#080808] border border-zinc-800 p-0 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="h-1 bg-[#8B5CF6] w-full" />
        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute right-8 top-8 text-zinc-600 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-[#8B5CF6] font-mono border border-zinc-800">
              0{step}
            </div>
            <div>
              <div className="mono-label text-[10px] text-zinc-600 uppercase">
                Liquidation Protocol
              </div>
              <div className="text-white font-black uppercase text-xs tracking-widest">
                {step === 1 && "Structural Identification"}
                {step === 2 && "Discipline & Asset Metrics"}
                {step === 3 && "Access Keys & Identity"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="mono-label block text-[10px] uppercase">
                    University Cluster
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {UNIVERSITIES.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            universityId: u.id,
                            collegeId: "",
                          })
                        }
                        className={`p-4 border text-[10px] font-black uppercase tracking-widest transition-all ${formData.universityId === u.id ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.universityId && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="mono-label block text-[10px] uppercase">
                        College Sector
                      </label>
                      <input
                        type="text"
                        placeholder="SEARCH SECTOR"
                        value={searchCollege}
                        onChange={(e) => setSearchCollege(e.target.value)}
                        className="bg-transparent border-b border-zinc-800 text-[10px] outline-none text-[#8B5CF6] placeholder:text-zinc-800 uppercase font-mono"
                      />
                    </div>
                    <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCollegeObjs.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, collegeId: c.id })
                          }
                          className={`flex items-center justify-between p-4 border text-[10px] font-black uppercase tracking-widest transition-all ${formData.collegeId === c.id ? "bg-white border-white text-black" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                        >
                          <span>{c.name}</span>
                          {formData.collegeId === c.id && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    disabled={!formData.collegeId}
                    onClick={nextStep}
                    type="button"
                    className="vantage-btn-primary w-full disabled:opacity-20 uppercase tracking-[0.3em] py-5"
                  >
                    Transition to Phase 02
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="mono-label text-[10px] uppercase">
                      Asset Label
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., TI-84 CALCULATOR"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full bg-[#050505] border border-zinc-800 focus:border-[#8B5CF6] py-3 text-white outline-none px-4 font-bold placeholder:text-zinc-800 text-xs"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="mono-label text-[10px] uppercase">
                      Valuation (INR)
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="e.g., ₹2500"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-zinc-800 focus:border-[#8B5CF6] py-3 text-white outline-none px-4 font-bold placeholder:text-zinc-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="mono-label text-[10px] uppercase">
                      Category Cluster
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#050505] border border-zinc-800 focus:border-[#8B5CF6] py-3 text-white outline-none px-4 uppercase font-black text-xs"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="education">Education</option>
                      <option value="gadgets">Gadgets</option>
                      <option value="books">Books</option>
                      <option value="transport">Transport</option>
                      <option value="clothing_fashion">Clothing / Fashion</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="mono-label text-[10px] uppercase">
                      Asset Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#050505] border border-zinc-800 focus:border-[#8B5CF6] py-3 text-white outline-none px-4 uppercase font-black text-xs"
                    >
                      <option value="new">New / Unused</option>
                      <option value="used-excellent">Used - Mint</option>
                      <option value="used-good">Used - Good</option>
                      <option value="used-fair">Used - Fair</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="mono-label text-[10px] uppercase">
                    Information Stream (Description)
                  </label>
                  <textarea
                    required
                    placeholder="Provide specific notes regarding use, conditions, attachments..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full h-24 bg-[#050505] border border-zinc-800 focus:border-[#8B5CF6] p-4 text-white outline-none resize-none placeholder:text-zinc-800 text-xs"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-2 bg-zinc-950 p-4 border border-zinc-900/60">
                  <div className="space-y-3">
                    <label className="mono-label text-[10px] uppercase">
                      Seller Identity (Read-Only)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.email || ""}
                      className="w-full bg-[#050505] border border-zinc-800 text-zinc-500 py-3 outline-none px-4 font-mono text-xs cursor-not-allowed select-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="mono-label text-[10px] uppercase">
                      Contact Handle / Phone Node (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9999988888 or @USERNAME"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPhone: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-zinc-800 focus:border-[#8B5CF6] py-3 text-white outline-none px-4 font-bold placeholder:text-zinc-800 text-xs uppercase"
                    />
                  </div>
                </div>

                <div className={`grid ${userCollegeId ? "grid-cols-1" : "grid-cols-2"} gap-4 pt-4`}>
                  {!userCollegeId && (
                    <button
                      onClick={prevStep}
                      type="button"
                      className="py-5 border border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px] font-black hover:bg-zinc-900"
                    >
                      Back
                    </button>
                  )}
                  <button
                    disabled={
                      !formData.title ||
                      !formData.price ||
                      !formData.description
                    }
                    onClick={nextStep}
                    type="button"
                    className="vantage-btn-primary disabled:opacity-20 uppercase tracking-[0.3em] py-5"
                  >
                    Transition to Phase 03
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="p-6 bg-zinc-950/40 border border-zinc-900/60 font-mono text-[10px] space-y-2 uppercase leading-relaxed text-zinc-400">
                  <div className="font-bold text-[#8B5CF6] text-[11px] flex items-center gap-2">
                    <Shield size={14} /> Zero-Knowledge Trade Protocols Active
                  </div>
                  <p>
                    Your personal email ({user?.email}) and contact details are completely masked. Buyers will connect with you exclusively via the system's Secure Chat interface, keeping trade anonymous, circular, and private.
                  </p>
                </div>

                <div className="p-6 bg-zinc-950 border border-zinc-900 space-y-4">
                  <div className="mono-label text-[9px] text-[#8B5CF6]">
                    Protocol Summary
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 text-[10px] uppercase font-bold text-zinc-500">
                    <div>Asset Label:</div>
                    <div className="text-white line-clamp-1">
                      {formData.title}
                    </div>
                    <div>Valuation:</div>
                    <div className="text-white">₹{formData.price}</div>
                    <div>Sector:</div>
                    <div className="text-white">
                      {COLLEGES[formData.collegeId]?.name.split(" ")[0]}
                    </div>
                    <div>Cluster / Condition:</div>
                    <div className="text-white">
                      {formData.category === "clothing_fashion" ? "clothing/fashion" : formData.category} // {formData.condition}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={prevStep}
                    type="button"
                    className="py-5 border border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px] font-black hover:bg-zinc-900"
                  >
                    Modify Data
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="vantage-btn-primary disabled:opacity-20 uppercase tracking-[0.3em] py-5 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Shield size={18} />
                    )}
                    Commit to Network
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function RaiseIssueModal({ 
  onClose,
  userCollegeId
}: { 
  onClose: () => void;
  userCollegeId?: string;
}) {
  const { db, auth, user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueType, setIssueType] = useState<"missing_subject" | "common_issue" | string>("missing_subject");
  
  // Base fields
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Specific missing subject states
  const [selectedCollegeId, setSelectedCollegeId] = useState(userCollegeId || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [missingSubjectName, setMissingSubjectName] = useState("");

  useEffect(() => {
    if (userCollegeId) {
      setSelectedCollegeId(userCollegeId);
    }
  }, [userCollegeId]);

  // Common Issue type selection
  const [commonIssueType, setCommonIssueType] = useState<string>("incorrect_syllabus");

  // Attachment states (optional photo)
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Maximum attachment limit is 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Maximum attachment limit is 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentCollege = COLLEGES[selectedCollegeId];
  const collegeCourseIds = currentCollege ? currentCollege.courseIds : Object.keys(COURSES);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !auth || !user) return;

    if (issueType === "missing_subject") {
      if (!selectedCollegeId) {
        alert("Please select your affiliated college.");
        return;
      }
      if (!selectedCourseId) {
        alert("Please select your registered course.");
        return;
      }
      if (!missingSubjectName.trim()) {
        alert("Please specify the missing subject name.");
        return;
      }
    } else {
      if (!subject.trim()) {
        alert("Please specify an issue subject.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        issueType: issueType === "missing_subject" ? "missing_subject" : commonIssueType,
        description,
        priority,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        status: "open",
        resolved: false,
        attachedPhoto: attachedPhoto || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (issueType === "missing_subject") {
        payload.subject = `MISSING SUBJECT: ${missingSubjectName}`;
        payload.collegeId = selectedCollegeId;
        payload.collegeName = COLLEGES[selectedCollegeId]?.name || selectedCollegeId;
        payload.courseId = selectedCourseId;
        payload.courseName = COURSES[selectedCourseId]?.name || selectedCourseId;
        payload.missingSubject = missingSubjectName;
      } else {
        payload.subject = subject.toUpperCase();
        payload.collegeId = userCollegeId || "";
        payload.collegeName = userCollegeId ? (COLLEGES[userCollegeId]?.name || "") : "";
      }

      await addDoc(collection(db, "tickets"), payload);
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "tickets", auth);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-black border border-zinc-800 p-8 md:p-12 shadow-2xl z-10 my-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-8 top-8 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="mono-label mb-2 text-red-500 font-black tracking-widest text-[9px] uppercase">
          Emergency Alert // Integrity Submission
        </div>

        <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-8 leading-none">
          Report Issue
        </h3>

        {/* BRUTALIST TAB SWITCH FOR SPECIFIC ISSUE vs COMMON ISSUES */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setIssueType("missing_subject")}
            className={`p-4 border text-left uppercase font-mono transition-all duration-150 ${
              issueType === "missing_subject"
                ? "bg-red-950/20 text-white border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800"
            }`}
          >
            <div className="text-[11px] font-black tracking-wide">01 // MISSING SUBJECT</div>
            <div className="text-[8px] opacity-60 mt-1 lowercase">Request to list a paper or core course topic</div>
          </button>

          <button
            type="button"
            onClick={() => setIssueType("common_issue")}
            className={`p-4 border text-left uppercase font-mono transition-all duration-150 ${
              issueType === "common_issue"
                ? "bg-[#8B5CF6]/10 text-white border-[#8B5CF6]/70 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800"
            }`}
          >
            <div className="text-[11px] font-black tracking-wide">02 // COMMON ISSUES</div>
            <div className="text-[8px] opacity-60 mt-1 lowercase">Platform bugs, wrong profiles or spam reports</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RENDER DYNAMIC FIELDS BASED ON ISSUE TYPE */}
          {issueType === "missing_subject" ? (
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
              {/* College Label / Lock Input Option */}
              <div className="space-y-2">
                <label className="mono-label text-[10px] text-zinc-300">Affiliated College Name</label>
                {userCollegeId ? (
                  <div className="w-full bg-zinc-950/80 border border-zinc-900 py-3.5 px-4 text-zinc-400 font-mono text-xs uppercase tracking-wider font-extrabold select-none">
                    {COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()}
                  </div>
                ) : (
                  <select
                    required
                    value={selectedCollegeId}
                    onChange={(e) => {
                      setSelectedCollegeId(e.target.value);
                      setSelectedCourseId(""); // Reset course selection
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 py-3 px-4 text-white outline-none font-mono text-xs transition-colors rounded-none cursor-pointer"
                  >
                    <option value="">-- SELECT COLLEGE --</option>
                    {Object.entries(COLLEGES).map(([id, col]: any) => (
                      <option key={id} value={id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Course Dropdown */}
              <div className="space-y-2">
                <label className="mono-label text-[10px] text-zinc-300">Registered Course Pathway</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 py-3 px-4 text-white outline-none font-mono text-xs transition-colors rounded-none cursor-pointer"
                >
                  <option value="">-- SELECT COURSE PATH --</option>
                  {collegeCourseIds.map((cId) => {
                    const courseObj = COURSES[cId];
                    return (
                      <option key={cId} value={cId}>
                        {courseObj ? courseObj.name : cId.toUpperCase()}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label className="mono-label text-[10px] text-zinc-300">Missing Academic Subject Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. ADVANCED MACROECONOMICS, PYTHON FOR DATA SCIENCE..."
                  value={missingSubjectName}
                  onChange={(e) => setMissingSubjectName(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 p-3 text-white outline-none font-bold text-xs transition-colors placeholder:text-zinc-700 rounded-none uppercase"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Type selector of Common issues */}
              <div className="space-y-2">
                <label className="mono-label text-[10px] text-zinc-300">Select Common Issue Category</label>
                <select
                  value={commonIssueType}
                  onChange={(e) => setCommonIssueType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#8B5CF6] py-3 px-4 text-white outline-none font-mono text-xs transition-colors rounded-none cursor-pointer"
                >
                  <option value="incorrect_syllabus">INCORRECT CURRICULUM SYLLABUS DETAIL</option>
                  <option value="incorrect_faculty">INACCURATE TEACHER / FACULTY RECORD</option>
                  <option value="spam_listing">DUPLICATE OR SPAM MARKETPLACE ADVERTISEMENT</option>
                  <option value="technical_bug">APPLICATION TECHNICAL BUG OR SYSTEM EXCEPTION</option>
                  <option value="other_support">OTHER GENERAL SUPPORT OR TICKET</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="mono-label text-[10px] text-zinc-300">Brief Title / Topic Of Breach</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Incorrect subject list in LSR, Broken login sequence..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#8B5CF6] p-3 text-white outline-none font-bold text-xs transition-colors placeholder:text-zinc-700 rounded-none uppercase"
                />
              </div>
            </div>
          )}

          {/* Description details */}
          <div className="space-y-2">
            <label className="mono-label text-[10px] text-zinc-300">Incident Details & Observations</label>
            <textarea
              required
              placeholder="Enter comprehensive logs, description notes, or instructions regarding this issue discrepancy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 bg-zinc-950 border border-zinc-800 focus:border-red-500 p-4 text-white outline-none resize-none text-xs transition-colors placeholder:text-zinc-700 rounded-none animate-none"
            />
          </div>

          {/* DRAG AND DROP FILE UPLOADER FOR PHOTO ATTACHMENT */}
          <div className="space-y-2">
            <label className="mono-label text-[10px] text-zinc-300">
              Attach Screenshot Proof <span className="text-zinc-600 italic">(Optional)</span>
            </label>
            
            {!attachedPhoto ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                }`}
              >
                <Upload className="text-zinc-500" size={18} />
                <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                  Drag & Drop or click to browse photo
                </div>
                <div className="text-[8px] text-zinc-600 font-mono">
                  Supported formats: PNG, JPG, JPEG // Max 3MB
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="p-3 border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-black border border-zinc-800 flex-shrink-0">
                    <img
                      src={attachedPhoto}
                      alt="Attachment Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white uppercase font-mono">
                      Photo attached successfully
                    </div>
                    <div className="text-[8px] text-emerald-400 font-mono tracking-widest uppercase">
                      Ready to transmit
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedPhoto(null)}
                  className="text-red-500 hover:text-red-400 p-2 font-mono text-[9px] uppercase hover:underline"
                >
                  <Trash2 size={14} className="inline mr-1" /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-wider hover:bg-zinc-950 hover:text-white transition-all rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 text-white text-xs font-mono font-black uppercase tracking-wider transition-all rounded-none flex items-center gap-3 cursor-pointer ${
                issueType === "missing_subject"
                  ? "bg-red-650 hover:bg-red-500 disabled:bg-red-950/20"
                  : "bg-[#8B5CF6] hover:bg-[#7c4df2] disabled:bg-[#8B5CF6]/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Transmitting...
                </>
              ) : (
                <>
                  <AlertCircle size={14} /> Send Support Node
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// --- Small Helper Components ---

function TeacherDetailModal({
  teacherId,
  onClose,
  userCollegeId,
  isRootAdmin,
}: {
  teacherId: string;
  onClose: () => void;
  userCollegeId?: string;
  isRootAdmin?: boolean;
}) {
  const { db, auth, user } = useFirebase();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [lastSixMonthsCount, setLastSixMonthsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    pedagogy: 5,
    strictness: 5,
    grading: 5,
    content: "",
  });

  useEffect(() => {
    if (!db || !teacherId) return;
    const unsubTeacher = onSnapshot(
      doc(db, "teachers", teacherId),
      (docSnap) => {
        if (docSnap.exists())
          setTeacher({ id: docSnap.id, ...docSnap.data() } as Teacher);
      },
    );

    const qReviews = query(
      collection(db, "reviews"),
      where("teacherId", "==", teacherId),
      orderBy("createdAt", "desc"),
    );
    const unsubReviews = onSnapshot(qReviews, (snap) => {
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review));
    });

    if (user) {
      const qUserReview = query(
        collection(db, "reviews"),
        where("teacherId", "==", teacherId),
        where("userId", "==", user.uid),
        limit(1),
      );
      const unsubUserReview = onSnapshot(qUserReview, (snap) => {
        if (!snap.empty) {
          const r = { id: snap.docs[0].id, ...snap.docs[0].data() } as Review;
          setUserReview(r);
          setReviewForm({
            rating: r.rating,
            pedagogy: r.pedagogy,
            strictness: r.strictness,
            grading: r.grading,
            content: r.content,
          });
        } else {
          setUserReview(null);
        }
      });

      const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
      const qSixMonths = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid),
        where("createdAt", ">=", sixMonthsAgo),
      );
      const unsubSixMonths = onSnapshot(qSixMonths, (snap) => {
        // We need to count unique teachers
        const teacherIds = new Set(
          snap.docs.map((doc) => doc.data().teacherId),
        );
        setLastSixMonthsCount(teacherIds.size);
      });

      return () => {
        unsubTeacher();
        unsubReviews();
        unsubUserReview();
        unsubSixMonths();
      };
    }

    return () => {
      unsubTeacher();
      unsubReviews();
    };
  }, [db, teacherId, user]);

  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [editedSubjects, setEditedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [isSavingSubjects, setIsSavingSubjects] = useState(false);

  const handleStartEditSubjects = () => {
    if (user?.email !== "237tanishaqverma@gmail.com") return;
    if (teacher) {
      const currentSubjects = teacher.subject
        ? teacher.subject.split("/").map((s) => s.trim().toUpperCase()).filter(Boolean)
        : [];
      setEditedSubjects(currentSubjects);
      setCustomSubjectInput("");
      setIsEditingSubjects(true);
    }
  };

  const handleSaveSubjects = async () => {
    if (!db || !teacher) return;
    if (user?.email !== "237tanishaqverma@gmail.com") return;
    setIsSavingSubjects(true);
    try {
      const mergedSubjects = editedSubjects.map(s => s.trim().toUpperCase()).filter(Boolean);
      const subjectString = mergedSubjects.join(" / ");
      
      await updateDoc(doc(db, "teachers", teacher.id), {
        subject: subjectString,
        updatedAt: serverTimestamp(),
      });
      setIsEditingSubjects(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teachers/${teacher.id}`, auth);
    } finally {
      setIsSavingSubjects(false);
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !auth || !user || !teacher) return;

    const isLocked = userCollegeId && userCollegeId !== teacher.collegeId && user?.email !== "237tanishaqverma@gmail.com";
    if (isLocked) {
      alert("ACCESS DENIED: You cannot submit reviews for a teacher affiliated with another college.");
      return;
    }

    const now = Date.now();
    const oneAndHalfMonths = 45 * 24 * 60 * 60 * 1000;

    if (userReview) {
      const lastUpdate = userReview.updatedAt || userReview.createdAt;
      if (now - lastUpdate < oneAndHalfMonths) {
        const daysLeft = Math.ceil(
          (oneAndHalfMonths - (now - lastUpdate)) / (24 * 60 * 60 * 1000),
        );
        alert(
          `RATE LIMIT ACTIVE: You can only review this faculty once every 45 days. Please wait ${daysLeft} more days.`,
        );
        return;
      }
    } else {
      if (lastSixMonthsCount >= 7) {
        alert(
          "COOLDOWN ACTIVE: You have reached the maximum rating limit of 7 teachers for this semester. You are currently on a cooldown for 6 months till the next sem starts.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (userReview) {
        // Update existing review
        await updateDoc(doc(db, "reviews", userReview.id), {
          ...reviewForm,
          updatedAt: now,
        });

        // Recalculate teacher stats
        // To be precise we'd need to subtract old values and add new ones
        // But the current logic adds a new doc and updates avg.
        // Let's adjust teacher averages accordingly for the update.
        const dRating = reviewForm.rating - userReview.rating;
        const dPedagogy = reviewForm.pedagogy - userReview.pedagogy;
        const dStrictness = reviewForm.strictness - userReview.strictness;
        const dGrading = reviewForm.grading - userReview.grading;

        await updateDoc(doc(db, "teachers", teacherId), {
          averageRating: teacher.averageRating + dRating / teacher.reviewCount,
          pedagogyScore:
            teacher.pedagogyScore + dPedagogy / teacher.reviewCount,
          strictnessScore:
            teacher.strictnessScore + dStrictness / teacher.reviewCount,
          gradingScore: teacher.gradingScore + dGrading / teacher.reviewCount,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new review
        await addDoc(collection(db, "reviews"), {
          ...reviewForm,
          teacherId,
          userId: user.uid,
          userName: user.displayName || user.email,
          collegeId: teacher.collegeId,
          semester: "SPRING 2026",
          anonymous: false,
          tagsProvided: [],
          createdAt: now,
          updatedAt: now,
        });

        const newReviewCount = teacher.reviewCount + 1;
        const newAvg =
          (teacher.averageRating * teacher.reviewCount + reviewForm.rating) /
          newReviewCount;
        const newPedagogy =
          (teacher.pedagogyScore * teacher.reviewCount + reviewForm.pedagogy) /
          newReviewCount;
        const newStrictness =
          (teacher.strictnessScore * teacher.reviewCount +
            reviewForm.strictness) /
          newReviewCount;
        const newGrading =
          (teacher.gradingScore * teacher.reviewCount + reviewForm.grading) /
          newReviewCount;

        await updateDoc(doc(db, "teachers", teacherId), {
          averageRating: newAvg,
          pedagogyScore: newPedagogy,
          strictnessScore: newStrictness,
          gradingScore: newGrading,
          reviewCount: newReviewCount,
          updatedAt: serverTimestamp(),
        });
      }

      if (!userReview) {
        setReviewForm({
          rating: 5,
          pedagogy: 5,
          strictness: 5,
          grading: 5,
          content: "",
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "reviews", auth);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!teacher) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl bg-[#050505] border border-zinc-800 flex flex-col md:flex-row shadow-2xl h-[90vh] overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-8 z-10 text-[#444] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-96 bg-[#0A0A0A] p-12 border-r border-zinc-900 overflow-y-auto">
          <div className="mono-label text-[#8B5CF6] mb-4">
            Node Analysis // 0xAF
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            {teacher.name}
          </h2>
          <p className="mono-label text-[10px] text-zinc-500 mb-4">
            {COLLEGES[teacher.collegeId]?.name}
          </p>
          <div className="flex justify-between items-center mb-4">
            <span className="mono-label text-[10px] text-zinc-500 uppercase">Subject Tags</span>
            {user?.email === "237tanishaqverma@gmail.com" && (
              <button
                onClick={handleStartEditSubjects}
                className="text-[9px] uppercase font-mono tracking-widest text-[#8B5CF6] hover:text-white transition-all bg-zinc-950 border border-zinc-900 hover:border-zinc-800 px-2.5 py-1 flex items-center gap-1 shadow-sm"
              >
                <Plus size={10} /> ADD / EDIT
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-12">
            {teacher.subject ? teacher.subject.split("/").map((subj) => (
              <span key={subj} className="bg-zinc-900 border border-zinc-900 text-zinc-400 font-mono text-[9px] px-2 py-1 uppercase tracking-wide rounded-sm">
                📚 {subj.trim()}
              </span>
            )) : (
              <span className="text-zinc-650 text-[10px] italic">No active tags assigned</span>
            )}
          </div>

          <div className="space-y-10">
            <div className="bg-black p-8 border border-zinc-800">
              <div className="text-6xl font-black text-white italic leading-none mb-2">
                {teacher.averageRating.toFixed(1)}
              </div>
              <div className="mono-label text-[10px] text-zinc-500 uppercase tracking-widest">
                Network Consensus
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-900 mono-label text-[9px] text-[#8B5CF6]">
                VERIFIED REVIEWS: {teacher.reviewCount || 0}
              </div>
            </div>

            <div className="space-y-6">
              <MetricBar
                label="Pedagogy"
                value={teacher.pedagogyScore}
                color="#8B5CF6"
              />
              <MetricBar
                label="Politeness"
                value={teacher.strictnessScore}
                color="#EC4899"
              />
              <MetricBar
                label="Grading"
                value={teacher.gradingScore}
                color="#10B981"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-12 overflow-y-auto bg-black">
          <h3 className="text-2xl font-black text-white uppercase italic mb-12 border-b border-zinc-900 pb-4 flex items-center gap-4">
            <TrendingUp size={20} /> Field Intelligence
          </h3>

          <div className="space-y-12">
            {(() => {
              const isLocked = userCollegeId && teacher && userCollegeId !== teacher.collegeId && user?.email !== "237tanishaqverma@gmail.com";
              if (isLocked) {
                return (
                  <div className="bg-[#1A0F0A] p-8 border border-[#92400E] border-l-4 border-l-amber-500 space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="text-amber-500 animate-pulse" size={24} />
                      <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
                        COLLEGIATE RATING LOCK
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-normal">
                      You are viewing a faculty profile from another college (<strong>{COLLEGES[teacher.collegeId]?.name || teacher.collegeId.toUpperCase()}</strong>). As a student of <strong>{userCollegeId ? (COLLEGES[userCollegeId]?.name || userCollegeId.toUpperCase()) : "another college"}</strong>, you can inspect their evaluation coordinates, but you are not permitted to submit reviews or alter metrics.
                    </p>
                  </div>
                );
              }
              return (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-zinc-950 p-8 border border-zinc-900 border-l-4 border-l-[#8B5CF6] space-y-8"
                >
                  <h4 className="mono-label text-xs text-white">
                    Transmit New Intelligence
                  </h4>
                  <div className="grid grid-cols-2 gap-8">
                    <InputRange
                      label="General Rating"
                      value={reviewForm.rating}
                      onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
                    />
                    <InputRange
                      label="Pedagogy Flow"
                      value={reviewForm.pedagogy}
                      onChange={(v) =>
                        setReviewForm({ ...reviewForm, pedagogy: v })
                      }
                    />
                    <InputRange
                      label="Politeness & Empathy Matrix"
                      value={reviewForm.strictness}
                      onChange={(v) =>
                        setReviewForm({ ...reviewForm, strictness: v })
                      }
                    />
                    <InputRange
                      label="Grading Variance"
                      value={reviewForm.grading}
                      onChange={(v) => setReviewForm({ ...reviewForm, grading: v })}
                    />
                  </div>
                  {lastSixMonthsCount >= 7 && !userReview && (
                    <div className="p-4 bg-[#1A0F0A] border border-amber-800 border-l-4 border-l-amber-500 flex items-start gap-4">
                      <ShieldAlert className="text-amber-500 shrink-0" size={18} />
                      <div>
                        <p className="mono-label text-[10px] text-amber-500 mb-1">
                          SEMESTER RATING COOLDOWN
                        </p>
                        <p className="text-[9px] text-zinc-400 uppercase leading-relaxed tracking-wider">
                          You are currently on a cooldown for 6 months till the next sem starts because you have already rated 7 teachers this semester.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 flex items-start gap-4">
                    <ShieldAlert className="text-zinc-600 shrink-0" size={18} />
                    <div>
                      <p className="mono-label text-[10px] text-zinc-400 mb-1">
                        45-DAY RATING COOLDOWN
                      </p>
                      <p className="text-[9px] text-zinc-600 uppercase leading-relaxed tracking-wider">
                        Reviews can only be edited or updated once every 45 days. This maintains honest feedback and prevents rating spam.
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isSubmitting || (lastSixMonthsCount >= 7 && !userReview)}
                    type="submit"
                    className="vantage-btn-primary w-full py-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : lastSixMonthsCount >= 7 && !userReview ? (
                      "COOLDOWN ACTIVE"
                    ) : (
                      "Commit Intelligence"
                    )}
                  </button>
                </form>
              );
            })()}

            <div className="space-y-8">
              {reviews.map((r, idx) => (
                <div key={r.id} className="pb-8 border-b border-zinc-900">
                  <div className="flex justify-between items-center mb-4">
                    <span className="mono-label text-[10px] text-zinc-500">
                      INTELLIGENCE_REPORT_#{reviews.length - idx} //{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-white font-black text-xl italic">
                      {r.rating}.0
                    </span>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-[9px] mono-label text-zinc-600">
                      P: {r.pedagogy}
                    </div>
                    <div className="text-[9px] mono-label text-zinc-600">
                      POL: {r.strictness}
                    </div>
                    <div className="text-[9px] mono-label text-zinc-600">
                      G: {r.grading}
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-zinc-700 italic uppercase text-[10px] tracking-widest text-center py-20">
                  No intelligence found on this node.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {isEditingSubjects && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            onClick={() => setIsEditingSubjects(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-[#090909] border border-zinc-800 p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                📚 Manage Subject Tags
              </h4>
              <button
                onClick={() => setIsEditingSubjects(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed uppercase">
              Configure multiple subjects for <strong>{teacher.name}</strong>. Added tags will appear instantly in the system list and leaderboard nodes.
            </p>

            <div className="space-y-4">
              <label className="mono-label block text-[10px] uppercase">Active Tags</label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-950 border border-zinc-900 min-h-[60px] max-h-32 overflow-y-auto">
                {editedSubjects.length === 0 ? (
                  <span className="text-zinc-700 text-[10px] italic font-mono p-1">No tags selected</span>
                ) : (
                  editedSubjects.map(s => (
                    <span key={s} className="bg-zinc-900 border border-zinc-800 text-white font-mono text-[9px] px-2 py-1 flex items-center gap-1.5 uppercase rounded-xs">
                      {s}
                      <button
                        type="button"
                        onClick={() => setEditedSubjects(prev => prev.filter(x => x !== s))}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Predefined Course Subjects */}
            <div className="space-y-3">
              <label className="mono-label block text-[10px] uppercase">
                Choose from Predefined {COURSES[teacher.courseId]?.name || "Course"} Syllabus
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar text-[10px] font-mono">
                {(COURSES[teacher.courseId]?.subjects || []).map(s => {
                  const isSelected = editedSubjects.includes(s.toUpperCase());
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const capitalized = s.toUpperCase();
                        if (editedSubjects.includes(capitalized)) {
                          setEditedSubjects(prev => prev.filter(x => x !== capitalized));
                        } else {
                          setEditedSubjects(prev => [...prev, capitalized]);
                        }
                      }}
                      className={`text-left p-2.5 border transition-all text-[9.5px] uppercase flex items-center justify-between ${
                        isSelected 
                          ? "bg-[#8B5CF6]/10 border-[#8B5CF6] text-white" 
                          : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-white"
                      }`}
                    >
                      <span className="truncate mr-2">{s}</span>
                      {isSelected && <Check size={10} className="text-[#8B5CF6] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="mono-label block text-[10px] uppercase">Or Add Custom Subject Tag</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="E.G. DATA SHADOW LABS"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (customSubjectInput.trim()) {
                        const val = customSubjectInput.trim().toUpperCase();
                        if (!editedSubjects.includes(val)) {
                          setEditedSubjects(prev => [...prev, val]);
                        }
                        setCustomSubjectInput("");
                      }
                    }
                  }}
                  className="flex-1 bg-zinc-950 border border-zinc-900 text-xs px-3 py-2 text-white outline-none focus:border-[#8B5CF6] uppercase font-mono placeholder:text-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSubjectInput.trim()) {
                      const val = customSubjectInput.trim().toUpperCase();
                      if (!editedSubjects.includes(val)) {
                        setEditedSubjects(prev => [...prev, val]);
                      }
                      setCustomSubjectInput("");
                    }
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-mono uppercase text-[9px] tracking-widest px-4 border border-zinc-800"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingSubjects(false)}
                className="flex-1 py-3 border border-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] font-black hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubjects}
                disabled={isSavingSubjects}
                className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] min-w-[120px] text-white font-mono uppercase text-[9px] tracking-[0.2em] font-black flex items-center justify-center gap-1.5"
              >
                {isSavingSubjects ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  "Save Tags"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between mono-label text-[9px] uppercase">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}

function InputRange({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between mono-label text-[9px] uppercase text-zinc-500">
        <span>{label}</span>
        <span className="text-white font-black">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#8B5CF6]"
      />
    </div>
  );
}
function StatCard({ label, value, trend, icon: Icon, description }: any) {
  const isPositive = trend.startsWith("+");
  return (
    <div className="group relative bg-[#0a0a0a] border border-zinc-900 p-8 hover:border-[#8B5CF6]/50 transition-all duration-500 overflow-hidden h-full flex flex-col">
      {/* Background Pulse Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#8B5CF6]/10 transition-colors" />

      <div className="relative flex justify-between items-start mb-6">
        <div className="p-3 bg-zinc-950 border border-zinc-900 group-hover:border-[#8B5CF6]/30 transition-colors">
          <Icon
            size={20}
            className="text-zinc-400 group-hover:text-[#8B5CF6] transition-colors"
          />
        </div>
        <div
          className={`px-2 py-0.5 text-[10px] font-black tracking-tighter rounded ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
        >
          {trend}%
        </div>
      </div>

      <div className="relative space-y-1 mb-6">
        <div className="mono-label text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
          {label}
        </div>
        <div className="text-4xl font-black italic text-white tracking-tight leading-none">
          {value}
        </div>
      </div>

      {description && (
        <p className="relative z-10 text-[10px] text-zinc-500 font-mono uppercase leading-relaxed tracking-wider group-hover:text-zinc-400 transition-colors">
          {description}
        </p>
      )}

      <div className="flex-1" />

      {/* Mini Visualizer */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-950">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent"
        />
      </div>
    </div>
  );
}

function TeacherSmallRow({ name, detail, rating, reviews }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#050505] border border-zinc-900 group cursor-pointer hover:border-[#8B5CF6] transition-all">
      <div className="flex items-center gap-6">
        <div className="text-2xl font-black text-white italic group-hover:text-[#8B5CF6] transition-colors leading-none w-10">
          {rating > 0 ? rating.toFixed(1) : "0.0"}
        </div>
        <div>
          <p className="font-bold text-white uppercase text-sm tracking-tight">
            {name}
          </p>
          <p className="mono-label text-[9px] lowercase opacity-50">{detail}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="vantage-tag group-hover:bg-[#8B5CF6] group-hover:text-black group-hover:border-[#8B5CF6] transition-all">
          {reviews} REVIEWS
        </span>
      </div>
    </div>
  );
}

function MarketSmallCard({ title, price, category }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-50 transition-all group cursor-pointer">
      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1">
        {category}
      </p>
      <p className="font-bold text-slate-900 line-clamp-1 mb-2">{title}</p>
      <p className="text-indigo-600 font-bold tracking-tight">{price}</p>
    </div>
  );
}

function CollegeAffiliationGate({
  userId,
  userEmail,
  onSelect,
}: {
  userId: string;
  userEmail: string;
  onSelect: (collegeId: string) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search through all colleges in COLLEGES
  const matchingColleges = Object.values(COLLEGES).filter(
    (c) =>
      c.id !== "just_out_of_school" &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleConfirm = async () => {
    if (!selectedCol) return;
    setIsSubmitting(true);
    try {
      await onSelect(selectedCol);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] radar-sweep opacity-[0.03]" />
        <div className="scanline" />
      </div>

      <div className="w-full max-w-2xl bg-[#050505] border border-zinc-800 p-10 md:p-12 relative z-10 shadow-2xl">
        <div className="mono-label text-[#8B5CF6] mb-3">
          WELCOME // INITIAL CAMPUS SETTING
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
          Choose Your College.
        </h2>
        <p className="text-zinc-500 font-mono text-[10px] leading-relaxed mb-6 uppercase">
          Select your college to automatically customize your discussion feeds, marketplace boards, faculty ratings, and placements. You can request a college update later from your profile.
        </p>

        <div className="mb-6 p-4 border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-950/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="block text-[10px] font-bold text-white uppercase font-sans tracking-wide">
              No College, Aspirant, or Checking for a loved one?
            </span>
            <span className="block text-[8px] text-zinc-500 font-mono uppercase mt-1">
              Browse ratings, generic placement boards, and peer discussion directories.
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCol("just_out_of_school");
              setSearchTerm("");
            }}
            type="button"
            className={`px-4 py-2.5 shrink-0 text-[10px] font-black uppercase tracking-wider border transition-all ${
              selectedCol === "just_out_of_school"
                ? "bg-white text-black border-white"
                : "bg-transparent text-[#8B5CF6] border-[#8B5CF6]/30 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10"
            }`}
          >
            {selectedCol === "just_out_of_school" ? "Selected: Aspirant" : "Select Aspirant Option"}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
              Search DU and IP University Colleges
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedCol(null);
                }}
                placeholder="Type your college name (e.g. Stephens, SRCC, Hindu, MSIT, VIPS...)"
                className="w-full bg-black border border-zinc-900 text-[11px] font-mono pl-12 pr-4 py-3 text-white placeholder-zinc-700 focus:border-zinc-700 focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="border border-zinc-900 bg-black/50 p-2 max-h-60 overflow-y-auto space-y-1">
            {matchingColleges.map((c) => {
              const isSelected = selectedCol === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCol(c.id)}
                  type="button"
                  className={`w-full text-left p-3 flex items-center justify-between border transition-all ${
                    isSelected
                      ? "bg-white border-white text-black"
                      : "bg-zinc-950/40 border-transparent hover:border-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase font-sans tracking-wide">
                    {c.name}
                  </span>
                  {isSelected && (
                    <Check size={14} className="text-black shrink-0 ml-4" />
                  )}
                </button>
              );
            })}
            {matchingColleges.length === 0 && (
              <div className="text-center py-8 text-[10px] mono-label opacity-40 italic">
                No colleges matched your search criteria.
              </div>
            )}
          </div>

          {selectedCol ? (
            <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 px-4 py-2 text-[9px] font-mono text-center text-[#A78BFA] uppercase tracking-wider">
              Selected: <strong className="text-white">{selectedCol === "just_out_of_school" ? "JUST OUT OF SCHOOL / ASPIRANT" : COLLEGES[selectedCol]?.name}</strong> — Ready to proceed
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 px-4 py-2 text-[9px] font-mono text-center text-zinc-500 uppercase tracking-wider blink">
              ✕ Please select columns, search a college, or choose the Aspirant option above to proceed
            </div>
          )}

          <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left font-mono text-[9px] text-zinc-500 uppercase">
              Logged in as: <span className="text-zinc-400">{userEmail}</span>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedCol || isSubmitting}
              className={`vantage-btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-[#8B5CF6] hover:text-white border border-white flex items-center justify-center gap-2 ${
                !selectedCol || isSubmitting
                  ? "opacity-30 cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-650"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Confirm & Enter Hub"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({
  userColleges = {},
}: {
  userColleges?: Record<string, string>;
}) {
  const { db, auth, user } = useFirebase();
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // LinkedIn Link State
  const [linkedinInput, setLinkedinInput] = useState("");
  const [isSavingLinkedin, setIsSavingLinkedin] = useState(false);
  const [saveLinkedinMsg, setSaveLinkedinMsg] = useState("");

  // Form state
  const [selectedColId, setSelectedColId] = useState("");
  const [formSearchTerm, setFormSearchTerm] = useState("");
  const [imgBase64, setImgBase64] = useState<string | null>(null);

  // Derive matching colleges for search select
  const matchingColleges = Object.values(COLLEGES).filter(
    (c) =>
      c.id !== "just_out_of_school" &&
      (c.name.toLowerCase().includes(formSearchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(formSearchTerm.toLowerCase())),
  );
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!db || !user) return;
    const itemRef = doc(db, "user_roles", user.uid);
    const unsubscribe = onSnapshot(itemRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.linkedin) {
          setLinkedinInput(data.linkedin);
        }
      }
    }, (error) => {
      console.error("Error loading user roles info:", error);
    });
    return unsubscribe;
  }, [db, user]);

  const handleSaveLinkedin = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSavingLinkedin(true);
    setSaveLinkedinMsg("");
    try {
      await setDoc(doc(db, "user_roles", user.uid), {
        linkedin: linkedinInput.trim(),
        updatedAt: Date.now()
      }, { merge: true });
      setSaveLinkedinMsg("SUCCESS: LINKEDIN_COUPLED");
      setTimeout(() => setSaveLinkedinMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveLinkedinMsg("ERROR: SECURE_WRITE_FAILURE");
    } finally {
      setIsSavingLinkedin(false);
    }
  };

  useEffect(() => {
    if (!db || !user) return;
    const q = query(
      collection(db, "college_change_requests"),
      where("userId", "==", user.uid),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setRequests(list);
      },
      (error) => {
        console.error("Error loading college change requests:", error);
      },
    );
    return unsubscribe;
  }, [db, user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (PNG, JPG, WEBP).");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    if (!selectedColId) {
      setErrorMsg("Please select your actual college.");
      return;
    }
    if (!imgBase64) {
      setErrorMsg("Please upload a photo of your college ID Card.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const oldCol = userColleges[user.uid] || "default_campus";
      await addDoc(collection(db, "college_change_requests"), {
        userId: user.uid,
        userName:
          user.displayName ||
          user.email?.split("@")[0].toUpperCase() ||
          "UNKNOWN CLIENT",
        userEmail: user.email || "unknown@campus.edu",
        oldCollegeId: oldCol,
        newCollegeId: selectedColId,
        idCardPhoto: imgBase64,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setSuccessMsg(
        "Your sector affiliation amendment request was submitted successfully for review.",
      );
      setSelectedColId("");
      setFormSearchTerm("");
      setImgBase64(null);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Submission failed. Please check validation requirements.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCollegeName = user
    ? COLLEGES[userColleges[user.uid]]?.name ||
      userColleges[user.uid] ||
      "Not Set"
    : "Not Set";

  return (
    <div className="space-y-12 max-w-4xl mx-auto text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div>
          <div className="mono-label mb-4 text-[#8B5CF6]">
            ACCOUNT SETTINGS
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
            My Profile.
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border border-zinc-900 bg-zinc-950/30 p-8 space-y-6">
          <div className="text-center font-mono py-4">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg font-black text-[#8B5CF6] italic mx-auto mb-4">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="text-[12px] font-bold text-white uppercase tracking-wider">
              {user?.displayName || "Student User"}
            </div>
            <div className="text-[9px] text-zinc-500 mt-1 uppercase selection:bg-white selection:text-black">
              {user?.email}
            </div>
          </div>
          <hr className="border-zinc-900" />
          <div className="space-y-4">
            <div>
              <span className="block text-[8px] mono-label text-zinc-500 uppercase">
                College Affiliation
              </span>
              <span className="text-[11px] font-bold uppercase text-white font-sans">
                {currentCollegeName}
              </span>
            </div>
            <div>
              <span className="block text-[8px] mono-label text-zinc-500 uppercase">
                Account Type
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-black tracking-widest bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono uppercase">
                {user?.email === "237tanishaqverma@gmail.com"
                  ? "ADMINISTRATOR"
                  : "STANDARD MEMBER"}
              </span>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <span className="block text-[8px] mono-label text-zinc-500 uppercase mb-2">
                LinkedIn Profile Link
              </span>
              <form onSubmit={handleSaveLinkedin} className="space-y-2">
                <input
                  type="url"
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-black border border-zinc-900 text-[10px] font-mono p-2 text-white placeholder-zinc-700 focus:border-zinc-700 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSavingLinkedin}
                  className="w-full py-1.5 bg-zinc-900 border border-zinc-800 text-[8px] font-black text-zinc-300 font-mono hover:text-white hover:border-white tracking-widest uppercase transition-all whitespace-nowrap"
                >
                  {isSavingLinkedin ? "SAVING..." : "SAVE LINKEDIN LINK"}
                </button>
                {saveLinkedinMsg && (
                  <div className="text-[8px] font-mono text-[#8B5CF6] uppercase tracking-wide">
                    {saveLinkedinMsg === "SUCCESS: LINKEDIN_COUPLED" ? "SUCCESS: LINKEDIN SAVED" : saveLinkedinMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white select-none">
                  Need to Change Your College?
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase leading-relaxed">
                  Submit a request with your student ID card proof to update your default campus.
                </p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 border border-zinc-700 bg-transparent text-[9px] font-mono tracking-wider font-extrabold uppercase hover:border-white hover:bg-white hover:text-black transition-all"
                >
                  Request College Update
                </button>
              )}
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase leading-relaxed">
                SUCCESS: {successMsg}
              </div>
            )}

            {showForm && (
              <form
                onSubmit={handleSubmitRequest}
                className="space-y-6 pt-4 border-t border-zinc-900 animate-slide-down"
              >
                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase">
                    ERROR: {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                    Search and Choose Your Correct College / Campus
                  </label>
                  <div className="relative mb-3">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                      size={14}
                    />
                    <input
                      type="text"
                      value={formSearchTerm}
                      onChange={(e) => {
                        setFormSearchTerm(e.target.value);
                      }}
                      placeholder="Type college name (e.g. Stephens, SRCC, Hindu, MSIT, VIPS...)"
                      className="w-full bg-black border border-zinc-900 text-[10px] font-mono pl-10 pr-4 py-3 text-white placeholder-zinc-700 focus:border-zinc-700 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="border border-zinc-900 bg-black/60 p-2 max-h-48 overflow-y-auto space-y-1">
                    {matchingColleges.map((c) => {
                      const isSelected = selectedColId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedColId(c.id);
                          }}
                          type="button"
                          className={`w-full text-left p-2.5 flex items-center justify-between border transition-all ${
                            isSelected
                              ? "bg-white border-white text-black font-semibold"
                              : "bg-zinc-950/40 border-transparent hover:border-zinc-900 text-zinc-450 hover:text-white"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase font-sans tracking-wide">
                            {c.name}
                          </span>
                          {isSelected && (
                            <Check size={12} className="text-black shrink-0 ml-4" />
                          )}
                        </button>
                      );
                    })}
                    {matchingColleges.length === 0 && (
                      <div className="text-center py-6 text-[10px] mono-label opacity-40 italic">
                        No colleges matched. Try a different keyword.
                      </div>
                    )}
                  </div>

                  {selectedColId && (
                    <div className="mt-2 text-[10px] text-[#8B5CF6] font-mono uppercase tracking-wide">
                      Selected Campus: <strong className="text-white">{COLLEGES[selectedColId]?.name}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                    Upload Student ID Card Proof
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-8 text-center transition-all ${
                      dragActive
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                        : imgBase64
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-zinc-900 bg-black/60 hover:border-zinc-800"
                    }`}
                  >
                    {!imgBase64 ? (
                      <div className="space-y-3">
                        <Upload className="mx-auto text-zinc-500" size={24} />
                        <div className="text-[10px] text-zinc-300 font-mono uppercase">
                          Drag and drop card image, or{" "}
                          <label className="text-[#8B5CF6] cursor-pointer hover:underline">
                            browse files
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-[8px] text-zinc-650 font-mono uppercase">
                          PNG, JPG, or WEBP up to 5MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative mx-auto max-w-sm border border-zinc-800 bg-black">
                          <img
                            src={imgBase64}
                            alt="Captured ID Preview"
                            className="max-h-40 mx-auto object-contain p-2"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => setImgBase64(null)}
                            className="px-3 py-1 bg-red-650/20 text-red-400 border border-red-950 text-[9px] font-mono uppercase hover:bg-red-650/40"
                          >
                            Remove Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setImgBase64(null);
                      setSelectedColId("");
                      setErrorMsg("");
                    }}
                    className="px-4 py-2 text-[9px] font-mono tracking-wider font-extrabold uppercase text-zinc-500 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedColId || !imgBase64}
                    className={`px-8 py-3 bg-white text-black text-[9px] font-mono tracking-widest font-extrabold uppercase flex items-center gap-2 hover:bg-[#8B5CF6] hover:text-white transition-all ${
                      isSubmitting || !selectedColId || !imgBase64
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              College Update History
            </h4>
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col md:flex-row gap-6 justify-between items-start"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          req.status === "pending"
                            ? "bg-amber-500 animate-pulse"
                            : req.status === "approved"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider ${
                          req.status === "pending"
                            ? "text-amber-500"
                            : req.status === "approved"
                              ? "text-emerald-500"
                              : "text-red-500"
                        }`}
                      >
                        {req.status === "pending"
                          ? "Awaiting Admin Approval"
                          : req.status === "approved"
                            ? "UPDATE_APPROVED"
                            : "UPDATE_DENIED"}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-white uppercase font-sans">
                      Request to switch to{" "}
                      {COLLEGES[req.newCollegeId]?.name || req.newCollegeId}
                    </p>
                    <p className="text-[8px] text-zinc-500 font-mono uppercase">
                      From{" "}
                      {COLLEGES[req.oldCollegeId]?.name || req.oldCollegeId}
                    </p>
                  </div>
                  {req.idCardPhoto && (
                    <div className="border border-zinc-900 p-1 bg-black">
                      <img
                        src={req.idCardPhoto}
                        alt="ID Card Snapshot Proof"
                        className="max-h-16 max-w-[120px] object-cover hover:scale-105 transition-all cursor-zoom-in"
                        onClick={() => {
                          const w = window.open();
                          w?.document.write(
                            `<img src="${req.idCardPhoto}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`,
                          );
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              ))}

              {requests.length === 0 && (
                <div className="text-center py-12 border border-dashed border-zinc-900 text-[10px] font-mono text-zinc-600 uppercase">
                  No previous college update requests found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlumniView({
  userColleges = {},
}: {
  userColleges?: Record<string, string>;
}) {
  const { db, user } = useFirebase();
  const [placements, setPlacements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [retractConfirmId, setRetractConfirmId] = useState<string | null>(null);

  // Form Fields
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState<"placement" | "referral">("placement");
  const [statusText, setStatusText] = useState("Hired");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.email === "237tanishaqverma@gmail.com";

  useEffect(() => {
    if (!db || !user) return;
    const itemRef = doc(db, "user_roles", user.uid);
    const unsub = onSnapshot(itemRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.linkedin) {
          setLinkedinUrl(data.linkedin);
        }
      }
    });
    return unsub;
  }, [db, user]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "placements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlacements(list);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading placements:", error);
        setIsLoading(false);
      }
    );
    return unsub;
  }, [db]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (retractConfirmId !== id) {
      setRetractConfirmId(id);
      return;
    }
    try {
      await deleteDoc(doc(db, "placements", id));
      setRetractConfirmId(null);
    } catch (err) {
      console.error("Retraction failed:", err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    if (!company.trim() || !role.trim() || !description.trim()) {
      setErrorMsg("Please specify the Company, Role, and Detailed Information.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const userCol = userColleges[user.uid] || "just_out_of_school";
      await addDoc(collection(db, "placements"), {
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0].toUpperCase() || "ALUMNI_NODE",
        userEmail: user.email,
        collegeId: userCol,
        company: company.trim().toUpperCase(),
        role: role.trim().toUpperCase(),
        type: type,
        status: statusText.trim(),
        linkedin: linkedinUrl.trim(),
        description: description.trim(),
        createdAt: Date.now(),
      });

      setSuccessMsg("Opportunity successfully deployed onto live network nodes!");
      setCompany("");
      setRole("");
      setDescription("");
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Relational transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter list
  const filtered = placements.filter((p) => {
    const matchesType = filterType === "all" || p.type === filterType;
    const matchesCollege = filterCollege === "all" || p.collegeId === filterCollege;
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      p.company.toLowerCase().includes(queryLower) ||
      p.role.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower) ||
      p.userName.toLowerCase().includes(queryLower);
    return matchesType && matchesCollege && matchesSearch;
  });

  const hasPosted = placements.some((p) => p.userId === user?.uid);

  return (
    <div className="space-y-12 max-w-6xl mx-auto text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-zinc-900">
        <div className="max-w-2xl">
          <div className="mono-label mb-4 text-[#8B5CF6]">
            Alumni & Seniors Job Placement Board
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
            Placements & Referrals.
          </h1>
          <p className="text-zinc-400 mt-6 text-base font-light leading-relaxed">
            Fast-track your corporate entry. Navigate verified historical placement data and coordinate 
            direct job referrals posted by experienced seniors and alumni. Bypass the standard HR pipelines 
            and elevate your career path today.
          </p>
        </div>
        {!showForm && (
          hasPosted ? (
            <div className="bg-zinc-950 border border-amber-500/20 p-4 max-w-sm tracking-wider font-mono">
              <span className="block text-[10px] font-bold text-amber-500 uppercase">
                // ONE ACTIVE POST LIMIT
              </span>
              <span className="block text-[8px] text-zinc-500 uppercase mt-1 leading-relaxed">
                You already have an active placement or referral post. To create a new one, please retract or delete your previous post listed below first.
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="vantage-btn-primary px-8 py-4 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-[#8B5CF6] hover:text-white border border-white flex items-center justify-center gap-2 shrink-0"
            >
              Post Placement / Referral
            </button>
          )
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase">
          SUCCESS_PROTOCOL: {successMsg}
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-[#8B5CF6]/30 p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B5CF6]">
              // POST A PLACEMENT OR REFERRAL RECORD
            </h4>
            <button
              onClick={() => {
                setShowForm(false);
                setErrorMsg("");
              }}
              className="text-zinc-500 hover:text-white text-[10px] font-mono uppercase"
            >
              [Cancel]
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase">
                ERROR: {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google, Amazon, Microsoft, TCS"
                  className="w-full bg-black border border-zinc-900 text-[11px] font-mono p-3 text-white placeholder-zinc-700 uppercase focus:border-zinc-750 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                  Role Description / Designation
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Associate Consultant"
                  className="w-full bg-black border border-zinc-900 text-[11px] font-mono p-3 text-white placeholder-zinc-700 uppercase focus:border-zinc-750 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                  Post Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-black border border-zinc-900 text-[11px] font-mono p-3 text-white focus:outline-none animate-none"
                >
                  <option value="placement">ON-CAMPUS PLACEMENT</option>
                  <option value="referral">OFF-CAMPUS PLACEMENT</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                  Status / Key Details (e.g. Hired, Referral Active)
                </label>
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="e.g., Hired, Off-Campus, Active Referrer, Mentoring"
                  className="w-full bg-black border border-zinc-900 text-[11px] font-mono p-3 text-white placeholder-zinc-700 uppercase focus:border-zinc-750 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                LinkedIn Profile URL (for matches & connections)
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your_alumni_profile"
                className="w-full bg-black border border-zinc-900 text-[11px] font-mono p-3 text-white placeholder-zinc-700 focus:border-zinc-750 focus:outline-none"
              />
              <p className="text-[8px] text-zinc-600 font-mono uppercase mt-1">
                Tip: Save this to your Profile so it auto-fills in the future!
              </p>
            </div>

            <div>
              <label className="block text-[8px] mono-label text-zinc-400 uppercase mb-2">
                Guidance, Referral Steps, and Interview Experience
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Add helpful advice here. For example: interview rounds, eligibility, tech stack, or steps to ask for a referral."
                className="w-full bg-black border border-zinc-900 text-[11px] font-sans p-3 text-white placeholder-zinc-700 focus:border-zinc-750 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMsg("");
                }}
                className="px-6 py-3 text-[10px] font-mono uppercase text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-white text-black font-extrabold text-[10px] font-mono uppercase tracking-wider hover:bg-[#8B5CF6] hover:text-white disabled:opacity-40"
              >
                {isSubmitting ? "POSTING..." : "POST OPPORTUNITY"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter Terminal */}
      <div className="bg-zinc-950 border border-zinc-900 p-6 flex flex-col lg:flex-row items-center gap-6 justify-between select-none">
        <div className="w-full lg:w-1/3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-650" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Company, Designation, or Alumni..."
              className="w-full bg-black border border-zinc-900 text-[10px] font-mono pl-12 pr-4 py-3 text-white placeholder-zinc-700 uppercase focus:border-zinc-750 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0 font-mono">
          <div className="w-full sm:w-auto">
            <span className="block text-[8px] text-zinc-600 uppercase mb-1">
              Filter Category
            </span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-black border border-zinc-900 text-[10px] px-3 py-2 text-zinc-300 focus:outline-none uppercase"
            >
              <option value="all">ALL OPPORTUNITIES</option>
              <option value="placement">ON-CAMPUS PLACEMENT</option>
              <option value="referral">OFF-CAMPUS PLACEMENT</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <span className="block text-[8px] text-zinc-600 uppercase mb-1">
              Filter Sector Campus
            </span>
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full bg-black border border-zinc-900 text-[10px] px-3 py-2 text-zinc-300 focus:outline-none uppercase max-w-xs"
            >
              <option value="all">ALL CAMPUS SECTORS</option>
              {Object.values(COLLEGES).map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#8B5CF6]" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((item) => {
            const collegeName = COLLEGES[item.collegeId]?.name || "Guest Access / Aspirant";
            return (
              <div
                key={item.id}
                className="bg-[#050505] border border-zinc-900 hover:border-zinc-800 p-8 flex flex-col justify-between space-y-6 relative transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono block mb-1">
                        {item.company}
                      </span>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                        {item.role}
                      </h3>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 text-[8px] font-black tracking-wider uppercase font-mono border ${
                        item.type === "placement"
                          ? "bg-indigo-950/20 text-[#8B5CF6] border-[#8B5CF6]/30"
                          : "bg-emerald-950/20 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {item.type === "placement" ? "On-Campus" : "Off-Campus"}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 uppercase flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-zinc-950">
                    <div>
                      Sector: <span className="text-zinc-300">{collegeName}</span>
                    </div>
                    <div>
                      Source: <span className="text-zinc-300">{item.userName}</span>
                    </div>
                    {item.status && (
                      <div>
                        Status: <span className="text-zinc-300">{item.status}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-zinc-950" />

                  <p className="text-zinc-400 font-sans text-xs leading-relaxed whitespace-pre-wrap pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-950">
                  <div className="flex items-center gap-2">
                    {item.linkedin ? (
                      <a
                        href={item.linkedin}
                        target="_blank"
                        rel="referrer"
                        className="vantage-btn-secondary py-2 px-4 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 border border-zinc-800 text-[9px] font-mono uppercase flex items-center gap-1.5 tracking-wider transition-all"
                      >
                        LinkedIn Connect
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[8px] font-mono text-zinc-600 uppercase">
                        No LinkedIn Coupled
                      </span>
                    )}
                  </div>

                  {(user?.uid === item.userId || isAdmin) && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={`text-[9px] font-mono uppercase tracking-wider transition-all px-2.5 py-1 border ${
                        retractConfirmId === item.id
                          ? "bg-red-950/40 text-red-400 border-red-500 animate-pulse font-bold"
                          : "text-red-500 hover:text-red-400 border-transparent hover:border-red-950 hover:bg-red-950/10"
                      }`}
                    >
                      {retractConfirmId === item.id ? "[CONFIRM RETRACT]" : "[Retract]"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center border border-dashed border-zinc-900 select-none">
              <Briefcase className="mx-auto text-zinc-750 mb-4 animate-pulse" size={40} />
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                No placement records or active referrals found.
              </h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

