import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Activity, ArrowUpRight, Bike, CalendarDays, CircleHelp, Dumbbell, Eye, EyeOff, ExternalLink, Flame, Footprints, Languages, LogOut, MapPin, Pencil, Plus, Ruler, Scale, Timer, Trash2, UserRound, UsersRound, X } from "lucide-react";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "body-compass-bmi-records";
const activityTypes = [
  { value: "walk", icon: Footprints },
  { value: "run", icon: Activity },
  { value: "cycle", icon: Bike },
  { value: "strength", icon: Dumbbell },
  { value: "other", icon: CircleHelp },
];
const emptyActivityStats = { totalSessions: 0, totalMinutes: 0, totalDistanceKm: 0, streak: 0 };
const activityValidationMessages = {
  th: { invalidDistance: "ระยะทางต้องเป็นศูนย์หรือมากกว่า" },
  en: { invalidDistance: "Distance must be zero or greater" },
};
function newActivityForm() {
  return { type: "walk", durationMin: "", distanceKm: "", date: new Date().toISOString().slice(0, 10), note: "" };
}
const categories = [
  { label: { th: "น้ำหนักน้อย", en: "Underweight" }, min: 0, max: 18.5, color: "#835400", text: { th: "ลองเพิ่มพลังงานและโปรตีนอย่างค่อยเป็นค่อยไป", en: "Gradually add more energy and protein to your meals." } },
  { label: { th: "น้ำหนักปกติ", en: "Healthy range" }, min: 18.5, max: 23, color: "#386c3f", text: { th: "อยู่ในช่วงสมดุล ดูแลการเคลื่อนไหวให้สม่ำเสมอ", en: "You are in a balanced range. Keep moving regularly." } },
  { label: { th: "น้ำหนักเกิน", en: "Overweight" }, min: 23, max: 25, color: "#8a4b23", text: { th: "ใส่ใจมื้ออาหารและเพิ่มกิจกรรมที่ทำได้ทุกวัน", en: "Pay attention to meals and add daily activity." } },
  { label: { th: "โรคอ้วน", en: "Obesity" }, min: 25, max: 60, color: "#963d35", text: { th: "ค่อย ๆ ปรับพฤติกรรม และปรึกษาผู้เชี่ยวชาญได้", en: "Make gradual changes and consider speaking with a professional." } },
];
const contentCopy = {
  th: { bodyFat: "ไขมันในร่างกาย", muscleMass: "มวลกล้ามเนื้อ", viewDetails: "ดูรายละเอียด", hideDetails: "ซ่อนรายละเอียด", unrecorded: "ไม่ได้บันทึก", weight: "น้ำหนัก", height: "ส่วนสูง", waist: "รอบเอว", chest: "รอบอก", hip: "รอบสะโพก" },
  en: { bodyFat: "Body fat", muscleMass: "Muscle mass", viewDetails: "View details", hideDetails: "Hide details", unrecorded: "Not recorded", weight: "Weight", height: "Height", waist: "Waist", chest: "Chest", hip: "Hip" },
};
const activityMessages = {
  th: {
    title: "กิจกรรม", eyebrow: "ACTIVE DAYS", log: "บันทึกกิจกรรม", edit: "แก้ไขกิจกรรม", thisWeek: "สัปดาห์นี้", sessions: "ครั้ง", minutes: "นาที", distance: "ระยะทาง", streak: "วันต่อเนื่อง", weeklyGoal: "เป้าหมายประจำสัปดาห์", today: "วันนี้", yesterday: "เมื่อวาน", walk: "เดิน", run: "วิ่ง", cycle: "ปั่นจักรยาน", strength: "ฝึกความแข็งแรง", other: "อื่น ๆ", duration: "ระยะเวลา", distanceKm: "ระยะทาง (กม.)", optional: "ไม่บังคับ", date: "วันที่", note: "บันทึกเพิ่มเติม", notePlaceholder: "วันนี้คุณทำอะไรบ้าง", save: "บันทึกกิจกรรม", update: "บันทึกการแก้ไข", cancel: "ยกเลิก", delete: "ลบ", confirmDelete: "ลบกิจกรรมนี้?", confirmDeleteMessage: "กิจกรรมนี้จะถูกนำออกจากประวัติของคุณ", close: "ปิด", noActivitiesTitle: "ทุกการเริ่มต้นมีความหมาย", noActivitiesMessage: "บันทึกการเคลื่อนไหวของคุณ แล้วค่อย ๆ สร้างจังหวะที่เหมาะกับตัวเอง", firstActivity: "บันทึกกิจกรรมแรก", minutesShort: "นาที", km: "กม.", minutesOfGoal: "จากเป้าหมาย 150 นาที", goalReached: "ถึงเป้าหมายประจำสัปดาห์แล้ว", loadError: "โหลดกิจกรรมไม่สำเร็จ", saveError: "บันทึกกิจกรรมไม่สำเร็จ", deleteError: "ลบกิจกรรมไม่สำเร็จ", activitySaved: "บันทึกกิจกรรมแล้ว", activityUpdated: "อัปเดตกิจกรรมแล้ว", activityDeleted: "ลบกิจกรรมแล้ว", authRequired: "กรุณาเข้าสู่ระบบเพื่อบันทึกกิจกรรม", invalidDuration: "ระยะเวลาต้องอย่างน้อย 1 นาที", chartMinutes: "นาที", weeklyActivity: "นาทีต่อวัน · 7 วันล่าสุด", more: "เพิ่มเติม"
  },
  en: {
    title: "Activities", eyebrow: "ACTIVE DAYS", log: "Log activity", edit: "Edit activity", thisWeek: "This week", sessions: "sessions", minutes: "minutes", distance: "distance", streak: "day streak", weeklyGoal: "Weekly goal", today: "Today", yesterday: "Yesterday", walk: "Walk", run: "Run", cycle: "Cycle", strength: "Strength", other: "Other", duration: "Duration", distanceKm: "Distance (km)", optional: "Optional", date: "Date", note: "Note", notePlaceholder: "Add a note about your activity", save: "Save activity", update: "Save changes", cancel: "Cancel", delete: "Delete", confirmDelete: "Delete this activity?", confirmDeleteMessage: "This activity will be removed from your history.", close: "Close", noActivitiesTitle: "Every start counts", noActivitiesMessage: "Log your movement and build a rhythm that works for you, one activity at a time.", firstActivity: "Log your first activity", minutesShort: "min", km: "km", minutesOfGoal: "of 150 minutes", goalReached: "Weekly goal reached", loadError: "Could not load activities", saveError: "Could not save activity", deleteError: "Could not delete activity", activitySaved: "Activity saved", activityUpdated: "Activity updated", activityDeleted: "Activity deleted", authRequired: "Sign in to save activities", invalidDuration: "Duration must be at least 1 minute", chartMinutes: "Minutes", weeklyActivity: "Minutes per day · last 7 days", more: "More"
  },
};
const activityUiMessages = {
  th: { type: "ประเภทกิจกรรม", streak: "สถิติต่อเนื่อง", streakUnit: "วัน", invalidDistance: "ระยะทางต้องเป็นศูนย์หรือมากกว่า" },
  en: { type: "Activity type", streak: "Streak", streakUnit: "days", invalidDistance: "Distance must be zero or greater" },
};
const workoutNameCopy = {
  "Full-body strength": { th: "ฝึกความแข็งแรงทั่วร่างกาย", en: "Full-body strength" },
  "Low-impact cardio": { th: "คาร์ดิโอแรงกระแทกต่ำ", en: "Low-impact cardio" },
  Cardio: { th: "คาร์ดิโอ", en: "Cardio" },
  "Strength & mobility": { th: "ฝึกความแข็งแรงและการเคลื่อนไหว", en: "Strength & mobility" },
  "Strength circuit": { th: "ฝึกความแข็งแรงแบบวงจร", en: "Strength circuit" },
  "Gentle cardio": { th: "คาร์ดิโอแบบเบา", en: "Gentle cardio" },
  "Supported strength": { th: "ฝึกความแข็งแรงแบบมีอุปกรณ์ช่วย", en: "Supported strength" },
};

function translateWorkoutName(name, language) {
  return workoutNameCopy[name]?.[language] || name;
}

function getCategory(bmi) {
  return categories.find((item) => bmi < item.max) || categories.at(-1);
}
function formatDate(value, language) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? (language === "th" ? "ไม่ระบุวันที่" : "Unknown date") : new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
function formatChange(value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const amount = Number(value);
  if (amount === 0) return `0${suffix}`;
  return `${amount > 0 ? "+" : ""}${amount.toFixed(1)}${suffix}`;
}

function sectionRevealProps(reducedMotion) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: reducedMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };
}

function RevealSection({ children, reducedMotion }) {
  return <motion.div className="flow-root" {...sectionRevealProps(reducedMotion)}>{children}</motion.div>;
}

export default function App() {
  const reducedMotion = useReducedMotion() ?? false;
  const [form, setForm] = useState({ weight: "", height: "", waist: "", chest: "", hip: "" });
  const [records, setRecords] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  const [notice, setNotice] = useState("");
  const [showExtraMeasurements, setShowExtraMeasurements] = useState(true);
  const [userForm, setUserForm] = useState({ username: "", email: "", password: "" });
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem("body-compass-user") || "null"));
  const [userNotice, setUserNotice] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [calculatedBmi, setCalculatedBmi] = useState(0);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState(emptyActivityStats);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityEditing, setActivityEditing] = useState(null);
  const [activityDeleteTarget, setActivityDeleteTarget] = useState(null);
  const [activityForm, setActivityForm] = useState(newActivityForm);
  const [language, setLanguage] = useState(() => localStorage.getItem("body-compass-language") || "th");
  const activityCopy = { ...activityMessages[language], ...activityUiMessages[language] };
  const copy = language === "th" ? {
    navHistory: "ประวัติของฉัน", about: "BMI คืออะไร", eyebrow: "สุขภาพในแบบของคุณ", titleA: "รู้จักร่างกาย", titleB: "ให้มากขึ้น", intro: "คำนวณดัชนีมวลกายของคุณ และใช้ข้อมูลเล็ก ๆ นี้เป็นเข็มทิศสำหรับการดูแลตัวเองในทุกวัน", start: "เริ่มต้นตรงนี้", today: "ข้อมูลร่างกายวันนี้", metric: "หน่วยเมตริก", extra: "สัดส่วนเพิ่มเติม", optional: "(ถ้ามี)", noMeasurements: "ข้ามการกรอกสัดส่วน", measurementHelp: "BMI ใช้เพียงน้ำหนักและส่วนสูงในการคำนวณ", weight: "น้ำหนัก", height: "ส่วนสูง", waist: "รอบเอว", chest: "รอบอก", hip: "รอบสะโพก", kg: "กก.", cm: "ซม.", calculate: "คำนวณ BMI", result: "ผลลัพธ์ของคุณ", bmi: "ดัชนีมวลกาย", scale: "BMI scale", waiting: "รอข้อมูล", prompt: "กรอกข้อมูลทางด้านซ้ายเพื่อดูผลลัพธ์ที่เหมาะกับคุณ", latest: "รายการล่าสุด", advice: "คำแนะนำ", keepGoing: "ดูแลต่อเนื่อง", first: "เริ่มบันทึกครั้งแรก", noData: "ยังไม่มีข้อมูล", records: "บันทึกของคุณ", history: "ประวัติ BMI", items: "รายการ", date: "วันที่", measurements: "น้ำหนัก / ส่วนสูง", result: "ผลลัพธ์", empty: "ยังไม่มีประวัติ ลองคำนวณ BMI ครั้งแรกของคุณ", invalid: "กรุณากรอกน้ำหนักและส่วนสูงให้ถูกต้อง", saved: "บันทึกผลเรียบร้อยแล้ว", disclaimer: "BMI เป็นเครื่องมือประเมินเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์", consult: "หากมีข้อกังวลเกี่ยวกับสุขภาพ ควรปรึกษาบุคลากรทางการแพทย์", languageLabel: "เปลี่ยนภาษาเป็น English"
  } : {
    navHistory: "My history", about: "What is BMI?", eyebrow: "YOUR HEALTH, YOUR WAY", titleA: "Know your body", titleB: "a little better", intro: "Calculate your body mass index and use this small insight as a compass for everyday wellbeing.", start: "GET STARTED", today: "Today's body data", metric: "Metric units", extra: "Additional measurements", optional: "(if available)", noMeasurements: "Skip measurements", measurementHelp: "BMI only needs your weight and height", weight: "Weight", height: "Height", waist: "Waist", chest: "Chest", hip: "Hip", kg: "kg", cm: "cm", calculate: "Calculate BMI", result: "YOUR RESULT", bmi: "Body mass index", scale: "BMI scale", waiting: "Awaiting data", prompt: "Enter your details on the left to see your personal result.", latest: "Latest entry", advice: "Guidance", keepGoing: "Keep it up", first: "Make your first entry", noData: "No data yet", records: "YOUR RECORDS", history: "BMI history", items: "entries", date: "Date", measurements: "Weight / Height", result: "Result", empty: "No history yet. Calculate your first BMI to get started.", invalid: "Please enter a valid weight and height.", saved: "Result saved successfully", disclaimer: "BMI is a screening tool, not a medical diagnosis.", consult: "If you have health concerns, please consult a healthcare professional.", languageLabel: "เปลี่ยนภาษาเป็น Thai"
  };
  const feedbackCopy = language === "th"
    ? { improvedTitle: "เยี่ยมมาก!", improvedMessage: "BMI ลดลง {delta} จากครั้งก่อน", neutralTitle: "บันทึกแล้ว", neutralMessage: "ความสม่ำเสมอคือสิ่งสำคัญ", close: "ปิด" }
    : { improvedTitle: "Great job!", improvedMessage: "Down {delta} from last time", neutralTitle: "Recorded!", neutralMessage: "Consistency is what counts.", close: "Close" };

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem("body-compass-language", language); }, [language]);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    if (!isResultModalOpen && !deleteTarget && !saveFeedback && !activityModalOpen && !activityDeleteTarget) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsResultModalOpen(false);
        setDeleteTarget(null);
        setSaveFeedback(null);
        setActivityModalOpen(false);
        setActivityDeleteTarget(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isResultModalOpen, deleteTarget, saveFeedback, activityModalOpen, activityDeleteTarget]);
  useEffect(() => {
    if (!user?._id) return;
    fetch(`${API_URL}/bmi-records?user=${user._id}`)
      .then((response) => response.ok ? response.json() : [])
      .then((remoteRecords) => {
        if (remoteRecords.length) setRecords(remoteRecords.map((record) => ({ ...record, createdAt: record.createdAt || record.updatedAt })));
      })
      .catch(() => {});
  }, [user]);
  useEffect(() => {
    if (!user?._id) {
      setActivities([]);
      setActivityStats(emptyActivityStats);
      return;
    }
    let current = true;
    const headers = { "x-user-id": user._id };
    Promise.all([
      fetch(`${API_URL}/activities`, { headers }),
      fetch(`${API_URL}/activities/stats`, { headers }),
    ])
      .then(async ([activitiesResponse, statsResponse]) => {
        const [activityData, statsData] = await Promise.all([activitiesResponse.json(), statsResponse.json()]);
        if (!activitiesResponse.ok || !statsResponse.ok) throw new Error(activityData.message || statsData.message || activityCopy.loadError);
        return [activityData, statsData];
      })
      .then(([activityData, statsData]) => {
        if (!current) return;
        setActivities(activityData);
        setActivityStats(statsData);
      })
      .catch(() => { if (current) toast.error(activityCopy.loadError); });
    return () => { current = false; };
  }, [user]);
  const bmi = calculatedBmi;
  const category = getCategory(bmi || 0);
  const latest = records[0];
  const statsRows = records.map((record, index) => {
    const previous = records[index + 1];
    return {
      ...record,
      weightChange: previous ? Number(record.weight) - Number(previous.weight) : null,
      bmiChange: previous ? Number(record.bmi) - Number(previous.bmi) : null,
      waistChange: previous && record.waist !== undefined && record.waist !== "" && previous.waist !== undefined && previous.waist !== "" ? Number(record.waist) - Number(previous.waist) : null,
    };
  });

  useEffect(() => {
    if (!bmi) { setRecommendation(null); return; }
    fetch(`${API_URL}/bmi-recommendations?bmi=${bmi.toFixed(1)}`)
      .then((response) => response.ok ? response.json() : null)
      .then(setRecommendation)
      .catch(() => setRecommendation(null));
  }, [bmi]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setCalculatedBmi(0);
    setRecommendation(null);
    setNotice("");
  }
  function signOut() {
    sessionStorage.removeItem("body-compass-user");
    setUser(null);
  }
  function updateUserField(event) { setUserForm({ ...userForm, [event.target.name]: event.target.value }); }
  async function createAccount(event) {
    event.preventDefault();
    setUserNotice("");
    try {
      const response = await fetch(`${API_URL}/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userForm) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || (language === "th" ? "สร้างบัญชีไม่สำเร็จ" : "Could not create account"));
      setUser(data);
        sessionStorage.setItem("body-compass-user", JSON.stringify(data));
      setUserForm({ username: "", email: "", password: "" });
      setUserNotice(language === "th" ? "สร้างบัญชีเรียบร้อยแล้ว" : "Account created successfully");
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        const localUser = { username: userForm.username, email: userForm.email };
        setUser(localUser);
          sessionStorage.setItem("body-compass-user", JSON.stringify(localUser));
        setUserNotice(language === "th" ? "บันทึกบัญชีไว้ในเครื่องแล้ว (รอเชื่อมต่อ server)" : "Saved locally while the server is offline");
      } else setUserNotice(error.message);
    }
  }
  function saveRecord(event) {
    event.preventDefault();
    const weight = Number(form.weight);
    const height = Number(form.height);
    if (!weight || !height || weight <= 0 || height <= 0) { setNotice(copy.invalid); toast.error(copy.invalid); return; }
    const nextBmi = Number((weight / ((height / 100) ** 2)).toFixed(1));
    setCalculatedBmi(nextBmi);
    setNotice("");
    setIsResultModalOpen(true);
  }
  async function confirmSaveRecord() {
    const weight = Number(form.weight);
    const height = Number(form.height);
    const nextCategory = getCategory(calculatedBmi);
    const previousBmi = records.length ? Number(records[0].bmi) : null;
    const improved = Number.isFinite(previousBmi) && calculatedBmi < previousBmi;
    const record = { ...form, weight, height, bmi: calculatedBmi, category: nextCategory.label.th, ...(user?._id ? { user: user._id } : {}), createdAt: new Date().toISOString() };
    setRecords((current) => [record, ...current]);
    setNotice(copy.saved);
    setIsResultModalOpen(false);
    setSaveFeedback({ improved, delta: improved ? Number((previousBmi - calculatedBmi).toFixed(1)) : 0 });
    if (improved && !reducedMotion) {
      const { default: confetti } = await import("canvas-confetti");
      confetti({
        particleCount: 42,
        spread: 58,
        startVelocity: 24,
        gravity: 0.9,
        ticks: 110,
        scalar: 0.78,
        origin: { x: 0.5, y: 0.48 },
        colors: ["#cbe78b", "#a8c989", "#f4b183", "#f7d6b8"],
        disableForReducedMotion: true,
      });
    }
    if (user?._id) {
      try {
        const response = await fetch(`${API_URL}/bmi-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
        if (!response.ok) throw new Error(language === "th" ? "บันทึกข้อมูลไปยัง server ไม่สำเร็จ" : "Could not save the record to the server");
        toast.success(copy.saved);
      } catch (error) {
        const errorMessage = error.message.includes("Failed to fetch")
          ? (language === "th" ? "บันทึกในเครื่องแล้ว แต่เชื่อมต่อ server ไม่ได้" : "Saved locally, but could not connect to the server")
          : error.message;
        toast.error(errorMessage || (language === "th" ? "บันทึกผลไม่สำเร็จ" : "Could not save the result"));
      }
    } else toast.success(copy.saved);
  }
  async function reloadActivities() {
    if (!user?._id) return;
    const headers = { "x-user-id": user._id };
    const [activitiesResponse, statsResponse] = await Promise.all([
      fetch(`${API_URL}/activities`, { headers }),
      fetch(`${API_URL}/activities/stats`, { headers }),
    ]);
    const [activityData, statsData] = await Promise.all([activitiesResponse.json(), statsResponse.json()]);
    if (!activitiesResponse.ok || !statsResponse.ok) throw new Error(activityCopy.loadError);
    setActivities(activityData);
    setActivityStats(statsData);
  }
  function openNewActivity() {
    setActivityEditing(null);
    setActivityForm(newActivityForm());
    setActivityModalOpen(true);
  }
  function openEditActivity(activity) {
    const activityDate = new Date(activity.date);
    const localDate = new Date(activityDate.getTime() - activityDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    setActivityEditing(activity);
    setActivityForm({
      type: activity.type,
      durationMin: String(activity.durationMin),
      distanceKm: activity.distanceKm == null ? "" : String(activity.distanceKm),
      date: localDate,
      note: activity.note || "",
    });
    setActivityModalOpen(true);
  }
  async function saveActivity(event) {
    event.preventDefault();
    if (!user?._id) { toast.error(activityCopy.authRequired); return; }
    const durationMin = Number(activityForm.durationMin);
    const distanceKm = activityForm.distanceKm === "" ? null : Number(activityForm.distanceKm);
    if (!Number.isFinite(durationMin) || durationMin < 1) { toast.error(activityCopy.invalidDuration); return; }
    if (distanceKm !== null && (!Number.isFinite(distanceKm) || distanceKm < 0)) { toast.error(activityCopy.invalidDistance); return; }
    const payload = {
      type: activityForm.type,
      durationMin,
      distanceKm,
      date: new Date(`${activityForm.date}T12:00:00`).toISOString(),
      note: activityForm.note,
    };
    const isEditing = Boolean(activityEditing?._id);
    try {
      const response = await fetch(`${API_URL}/activities${isEditing ? `/${activityEditing._id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user._id },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(activityCopy.saveError);
      setActivityModalOpen(false);
      setActivityEditing(null);
      setActivityForm(newActivityForm());
      toast.success(isEditing ? activityCopy.activityUpdated : activityCopy.activitySaved);
      reloadActivities().catch(() => toast.error(activityCopy.loadError));
    } catch {
      toast.error(activityCopy.saveError);
    }
  }
  async function confirmDeleteActivity() {
    if (!activityDeleteTarget || !user?._id) return;
    try {
      const response = await fetch(`${API_URL}/activities/${activityDeleteTarget._id}`, {
        method: "DELETE",
        headers: { "x-user-id": user._id },
      });
      if (!response.ok) throw new Error(activityCopy.deleteError);
      setActivityDeleteTarget(null);
      toast.success(activityCopy.activityDeleted);
      reloadActivities().catch(() => toast.error(activityCopy.loadError));
    } catch {
      toast.error(activityCopy.deleteError);
    }
  }
  if (!user) return <AccountAuthScreen language={language} setLanguage={setLanguage} onAuthenticated={(account) => { setUser(account); sessionStorage.setItem("body-compass-user", JSON.stringify(account)); }} />;
  function deleteRecord(index) { setDeleteTarget({ index, record: records[index] }); }
  function confirmDeleteRecord() {
    if (!deleteTarget) return;
    setRecords((current) => current.filter((_, itemIndex) => itemIndex !== deleteTarget.index));
    setDeleteTarget(null);
    toast.success(language === "th" ? "ลบรายการเรียบร้อยแล้ว" : "Entry deleted successfully");
  }

  return (
    <main className="fitness-shell min-h-screen overflow-hidden bg-[#f7f5ef]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#d9ddd2] pb-5">
          <a className="flex items-center gap-3" href="#top"><span className="grid size-10 place-items-center rounded-full bg-[#193c2d] text-[#d9f18b]"><Activity size={20} /></span><span className="text-lg font-bold tracking-tight">body<span className="text-[#769b46]">/</span>compass</span></a>
          <div className="flex items-center gap-2 text-sm text-[#697169]"><div className="hidden items-center gap-7 sm:flex"><a href="#history">{copy.navHistory}</a><a href="#about" className="flex items-center gap-1"><CircleHelp size={16} /> {copy.about}</a></div><button type="button" onClick={() => setLanguage(language === "th" ? "en" : "th")} aria-label={copy.languageLabel} title={copy.languageLabel} className="flex items-center gap-2 rounded-full border border-[#cdd7c7] bg-[#fffefa] px-3 py-2 font-bold text-[#193c2d] transition hover:border-[#799d4c] hover:bg-[#f0f5e9]"><Languages size={17} /><span>{language === "th" ? "EN" : "TH"}</span></button><button type="button" onClick={signOut} aria-label={language === "th" ? "สลับบัญชี" : "Switch account"} title={language === "th" ? "สลับบัญชี" : "Switch account"} className="grid size-10 place-items-center rounded-full border border-[#cdd7c7] bg-[#fffefa] text-[#193c2d] transition hover:border-[#799d4c] hover:bg-[#f0f5e9]"><UsersRound size={17} /></button><button type="button" onClick={signOut} aria-label={language === "th" ? "ออกจากระบบ" : "Log out"} title={language === "th" ? "ออกจากระบบ" : "Log out"} className="grid size-10 place-items-center rounded-full border border-[#e0c8c2] bg-[#fffefa] text-[#a45d51] transition hover:bg-[#fff0ec]"><LogOut size={17} /></button></div>
        </header>

        <motion.section id="top" className="fitness-hero grid items-end gap-10 pb-12 pt-14 lg:grid-cols-[1.15fr_.85fr] lg:pt-20" {...sectionRevealProps(reducedMotion)}>
          <div className="min-w-0"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#739443]"><span className="h-px w-8 bg-[#739443]" /> {copy.eyebrow}</p><h1 className="max-w-3xl font-[Playfair_Display] text-3xl leading-[1.3] tracking-[.02em] text-[#193c2d] sm:text-6xl">{copy.titleA}<br /><em className="font-semibold text-[#799d4c]">{copy.titleB}</em></h1><p className="mt-6 max-w-lg text-base leading-7 text-[#667069]">{copy.intro}</p></div>
          <div aria-hidden="true" className="pointer-events-none relative hidden h-40 lg:block"><motion.div className="absolute bottom-0 right-0 h-32 w-64 rounded-t-[120px] border-2 border-b-0 border-[#b8c7ad]" animate={reducedMotion ? undefined : { y: [0, -9, 0] }} transition={reducedMotion ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="absolute bottom-0 right-24 h-48 w-40 rounded-t-[120px] border-2 border-b-0 border-[#d7dfcd]" animate={reducedMotion ? undefined : { y: [0, -13, 0] }} transition={reducedMotion ? { duration: 0 } : { duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} /><span className="absolute right-8 top-5 text-6xl font-[Playfair_Display] text-[#d5dec9]">01</span></div>
        </motion.section>

        <DashboardPulse language={language} records={records} bmi={bmi} reducedMotion={reducedMotion} />

        <motion.section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]" {...sectionRevealProps(reducedMotion)}>
          <form onSubmit={saveRecord} className="rounded-[28px] bg-[#193c2d] p-6 text-white shadow-[0_18px_50px_rgba(25,60,45,.12)] sm:p-8"><div className="mb-8 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b9d77b]">{copy.start}</p><h2 className="mt-2 text-2xl font-semibold">{copy.today}</h2></div><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#d8e3d1]">{copy.metric}</span></div><div className="grid gap-4 sm:grid-cols-2"><Field icon={<Scale size={18} />} label={copy.weight} name="weight" value={form.weight} onChange={updateField} suffix={copy.kg} required /><Field icon={<Ruler size={18} />} label={copy.height} name="height" value={form.height} onChange={updateField} suffix={copy.cm} required /></div><div className="mt-7 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-[#d5e2d3]">{copy.extra} <span className="font-normal text-[#9db0a0]">{copy.optional}</span></p><button type="button" onClick={() => setShowExtraMeasurements(!showExtraMeasurements)} className={`max-w-full rounded-full px-3 py-1.5 text-center text-xs font-bold leading-4 transition sm:whitespace-nowrap ${showExtraMeasurements ? "bg-white/10 text-[#d5e2d3]" : "bg-[#cbe78b] text-[#193c2d]"}`}>{showExtraMeasurements ? copy.noMeasurements : (language === "th" ? "แสดงช่องสัดส่วน" : "Show measurements")}</button></div>{showExtraMeasurements ? <div className="mt-3 grid gap-4 sm:grid-cols-3"><Field label={copy.waist} name="waist" value={form.waist} onChange={updateField} suffix={copy.cm} /><Field label={copy.chest} name="chest" value={form.chest} onChange={updateField} suffix={copy.cm} /><Field label={copy.hip} name="hip" value={form.hip} onChange={updateField} suffix={copy.cm} /></div> : <p className="mt-3 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-[#b9d77b]">{copy.measurementHelp}</p>}<button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#cbe78b] py-4 font-bold text-[#193c2d] transition hover:bg-[#d9f19b]" type="submit">{copy.calculate} <ArrowUpRight size={18} /></button>{notice && <p className="mt-3 text-center text-sm text-[#d9f19b]">{notice}</p>}</form>

          <div className="rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 sm:p-8">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8a948a]">{copy.result}</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{copy.bmi}</h2></div><div className="rounded-full bg-[#f0f5e9] px-3 py-1.5 text-xs font-semibold text-[#5d7940]">{copy.scale}</div></div>
            <div className="mt-8 flex flex-wrap items-end gap-5"><p className="font-[Playfair_Display] text-8xl leading-none text-[#193c2d]">{bmi ? bmi.toFixed(1) : "—"}</p><div className="pb-2"><span className="mb-2 inline-flex rounded-full px-3 py-1 text-sm font-bold" style={{ backgroundColor: `${category.color}20`, color: category.color }}>{bmi ? category.label[language] : copy.waiting}</span><p className="max-w-xs text-sm leading-6 text-[#69736a]">{bmi ? category.text[language] : copy.prompt}</p></div></div>
            <BmiScale bmi={bmi} reducedMotion={reducedMotion} />
            <div className="mt-9 grid grid-cols-2 gap-3 border-t border-[#e8ebe4] pt-5 text-sm"><Metric label={copy.latest} value={latest ? formatDate(latest.createdAt, language) : copy.noData} /><Metric label={copy.advice} value={bmi ? copy.keepGoing : copy.first} /></div>
          </div>
        </motion.section>

        <AnimatePresence>
          {isResultModalOpen && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#193c2d]/35 px-4 py-6 backdrop-blur-md" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.2 } }} exit={reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.15 } }} onClick={() => setIsResultModalOpen(false)}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="bmi-result-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(25,60,45,.24)] sm:p-8" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.92 }} animate={reducedMotion ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } } : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }} exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#799d4c]">{language === "th" ? "ผลลัพธ์ของคุณ" : "YOUR RESULT"}</p>
              <h2 id="bmi-result-title" className="mt-2 text-2xl font-semibold text-[#193c2d]">{language === "th" ? "ดัชนีมวลกาย" : "Body mass index"}</h2>
              <p className="mt-7 font-[Playfair_Display] text-7xl leading-none text-[#193c2d]"><AnimatedBmi value={calculatedBmi} reducedMotion={reducedMotion} /></p>
              <span className="mt-5 inline-flex rounded-full px-3 py-1.5 text-sm font-bold" style={{ backgroundColor: `${getCategory(calculatedBmi).color}20`, color: getCategory(calculatedBmi).color }}>{getCategory(calculatedBmi).label[language]}</span>
              <p className="mt-4 text-sm leading-6 text-[#69736a]">{language === "th" ? "ขอบคุณที่ใส่ใจสุขภาพของตัวเอง ผลนี้เป็นเพียงข้อมูลหนึ่งจุด คุณค่อย ๆ ดูแลตัวเองในจังหวะที่เหมาะกับคุณได้" : "Thank you for checking in with yourself. This is just one data point, and you can care for yourself at a pace that feels right."}</p>
              <p className="mt-3 text-xs leading-5 text-[#8a948a]">{language === "th" ? "BMI เป็นการประเมินเบื้องต้น ไม่ใช่คำตัดสินคุณค่าหรือสุขภาพทั้งหมดของคุณ" : "BMI is a screening measure, not a judgment of your worth or your whole health."}</p>
              <div className="mt-7 grid grid-cols-2 gap-3"><button type="button" onClick={confirmSaveRecord} className="min-h-12 rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640]">{language === "th" ? "บันทึกผล" : "Save result"}</button><button type="button" onClick={() => setIsResultModalOpen(false)} className="min-h-12 rounded-xl border border-[#cdd7c7] bg-[#f5f8f2] px-4 py-3 text-sm font-bold text-[#193c2d] transition hover:bg-[#edf4e7]">{language === "th" ? "ปิด" : "Close"}</button></div>
            </motion.section>
          </motion.div>}
          {deleteTarget && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#193c2d]/35 px-4 py-6 backdrop-blur-md" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.2 } }} exit={reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.15 } }} onClick={() => setDeleteTarget(null)}>
            <motion.section role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" className="w-full max-w-sm rounded-[24px] border border-[#dfe4d8] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(25,60,45,.24)] sm:p-7" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.92 }} animate={reducedMotion ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } } : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }} exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
              <h2 id="delete-confirm-title" className="text-xl font-semibold text-[#193c2d]">{language === "th" ? "ยืนยันการลบรายการนี้?" : "Delete this entry?"}</h2>
              <p className="mt-3 text-sm leading-6 text-[#69736a]">{language === "th" ? "รายการนี้จะถูกนำออกจากประวัติของคุณ" : "This entry will be removed from your history."}</p>
              <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={confirmDeleteRecord} className="min-h-12 rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640]">{language === "th" ? "ยืนยันลบ" : "Delete"}</button><button type="button" onClick={() => setDeleteTarget(null)} className="min-h-12 rounded-xl border border-[#cdd7c7] bg-[#f5f8f2] px-4 py-3 text-sm font-bold text-[#193c2d] transition hover:bg-[#edf4e7]">{language === "th" ? "ยกเลิก" : "Cancel"}</button></div>
            </motion.section>
          </motion.div>}
          {saveFeedback && <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#193c2d]/35 px-4 py-6 backdrop-blur-md" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.2 } }} exit={reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.15 } }} onClick={() => setSaveFeedback(null)}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="save-feedback-title" className="w-full max-w-md rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(25,60,45,.24)] sm:p-8" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.92 }} animate={reducedMotion ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } } : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }} exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
              <span className={`grid size-12 place-items-center rounded-full ${saveFeedback.improved ? "bg-[#fff1e5] text-[#c77b48]" : "bg-[#eef5e8] text-[#5d8a52]"}`}><Activity size={22} /></span>
              <h2 id="save-feedback-title" className="mt-5 text-2xl font-semibold text-[#193c2d]">{saveFeedback.improved ? feedbackCopy.improvedTitle : feedbackCopy.neutralTitle}</h2>
              <p className="mt-3 text-base leading-7 text-[#69736a]">{saveFeedback.improved ? feedbackCopy.improvedMessage.replace("{delta}", saveFeedback.delta.toFixed(1)) : feedbackCopy.neutralMessage}</p>
              <button type="button" onClick={() => setSaveFeedback(null)} className="mt-7 min-h-12 w-full rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640]">{feedbackCopy.close}</button>
            </motion.section>
          </motion.div>}
        </AnimatePresence>

        {recommendation && <RevealSection reducedMotion={reducedMotion}><ExerciseGallery recommendation={recommendation} language={language} /></RevealSection>}
        {recommendation && <RevealSection reducedMotion={reducedMotion}><NutritionAndWorkout recommendation={recommendation} language={language} /></RevealSection>}
        {recommendation && <RevealSection reducedMotion={reducedMotion}><BodyCompositionGuide language={language} bmi={bmi} /></RevealSection>}

        {user.role === "admin" && <RevealSection reducedMotion={reducedMotion}><AdminPanel admin={user} language={language} /></RevealSection>}

        <RevealSection reducedMotion={reducedMotion}><BmiTrendSection rows={statsRows} language={language} reducedMotion={reducedMotion} /></RevealSection>
        <RevealSection reducedMotion={reducedMotion}><StatsTable rows={statsRows} language={language} copy={copy} /></RevealSection>
        <HistorySection rows={statsRows} language={language} copy={copy} onDelete={deleteRecord} />
        <ActivitiesDashboard activities={activities} stats={activityStats} language={language} copy={activityCopy} reducedMotion={reducedMotion} onCreate={openNewActivity} onEdit={openEditActivity} onDelete={setActivityDeleteTarget} modalOpen={activityModalOpen} editing={activityEditing} form={activityForm} setForm={setActivityForm} onSubmit={saveActivity} onClose={() => setActivityModalOpen(false)} deleteTarget={activityDeleteTarget} onConfirmDelete={confirmDeleteActivity} onCancelDelete={() => setActivityDeleteTarget(null)} />
        <motion.section className="mt-14 grid gap-5 rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr]" id="account" {...sectionRevealProps(reducedMotion)}><div><div className="mb-4 grid size-11 place-items-center rounded-full bg-[#e8f0df] text-[#557d43]"><UserRound size={21} /></div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8a948a]">{language === "th" ? "บัญชีของฉัน" : "MY ACCOUNT"}</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{user ? user.username : (language === "th" ? "สร้างบัญชีเพื่อเริ่มต้น" : "Create your account")}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#69736a]">{user ? user.email : (language === "th" ? "บันทึกข้อมูลของคุณไว้เพื่อใช้งานต่อได้สะดวก" : "Save your details for a smoother experience.")}</p></div>{user ? <div className="flex items-center rounded-2xl bg-[#f0f5e9] px-5 py-4 text-sm text-[#557d43]">{language === "th" ? "บัญชีพร้อมใช้งานแล้ว" : "Your account is ready"}</div> : <form onSubmit={createAccount} className="grid gap-3 sm:grid-cols-3"><input className="rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 text-sm outline-none focus:border-[#799d4c]" name="username" value={userForm.username} onChange={updateUserField} placeholder={language === "th" ? "ชื่อผู้ใช้" : "Username"} required /><input className="rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 text-sm outline-none focus:border-[#799d4c]" name="email" type="email" value={userForm.email} onChange={updateUserField} placeholder={language === "th" ? "อีเมล" : "Email"} required /><input className="rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 text-sm outline-none focus:border-[#799d4c]" name="password" type="password" minLength="6" value={userForm.password} onChange={updateUserField} placeholder={language === "th" ? "รหัสผ่าน 6 ตัวขึ้นไป" : "Password (6+ characters)"} required /><button className="rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640] sm:col-span-3" type="submit">{language === "th" ? "สร้างบัญชี" : "Create account"}</button>{userNotice && <p className="text-sm text-[#557d43] sm:col-span-3">{userNotice}</p>}</form>}</motion.section>
        <motion.p id="about" className="mt-12 text-center text-xs leading-6 text-[#8b938a]" {...sectionRevealProps(reducedMotion)}>{copy.disclaimer}<br />{copy.consult}</motion.p>
      </div>
    </main>
  );
}

function AuthScreen({ language, setLanguage, onAuthenticated }) {
  const isThai = language === "th";
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotNotice, setForgotNotice] = useState("");
  const text = isThai ? { login: "เข้าสู่ระบบ", register: "สร้างบัญชี", welcome: "ยินดีต้อนรับกลับมา", subtitle: "เข้าสู่ระบบเพื่อดูแลสุขภาพของคุณต่อ", username: "ชื่อผู้ใช้", email: "อีเมล", password: "รหัสผ่าน", submitLogin: "เข้าสู่ระบบ", submitRegister: "สร้างบัญชี", switchLogin: "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ", switchRegister: "ยังไม่มีบัญชี? สร้างบัญชี", language: "เปลี่ยนภาษาเป็น English", invalid: "กรุณากรอกข้อมูลให้ครบ" } : { login: "Sign in", register: "Create account", welcome: "Welcome back", subtitle: "Sign in to continue your health journey", username: "Username", email: "Email", password: "Password", submitLogin: "Sign in", submitRegister: "Create account", switchLogin: "Already have an account? Sign in", switchRegister: "New here? Create an account", language: "เปลี่ยนภาษาเป็น Thai", invalid: "Please complete all fields" };
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    if ((!form.username && mode === "login") || !form.password || (mode === "register" && !form.email)) { setError(text.invalid); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/users/${mode === "login" ? "login" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      onAuthenticated(data);
    } catch (requestError) {
      setError(requestError.message.includes("Failed to fetch") ? (isThai ? "เชื่อมต่อ server ไม่ได้" : "Cannot connect to the server") : requestError.message);
    } finally { setLoading(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-5 py-8"><section className="w-full max-w-md rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 shadow-[0_18px_50px_rgba(25,60,45,.08)] sm:p-9"><div className="mb-8 flex items-center justify-between"><span className="flex items-center gap-3 text-lg font-bold tracking-tight text-[#193c2d]"><span className="grid size-10 place-items-center rounded-full bg-[#193c2d] text-[#d9f18b]"><Activity size={20} /></span>body<span className="text-[#769b46]">/</span>compass</span><button type="button" onClick={() => setLanguage(isThai ? "en" : "th")} title={text.language} aria-label={text.language} className="rounded-full border border-[#cdd7c7] px-3 py-2 text-xs font-bold text-[#193c2d]">{isThai ? "EN" : "TH"}</button></div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#799d4c]">{mode === "login" ? text.login : text.register}</p><h1 className="mt-3 font-[Playfair_Display] text-4xl leading-tight text-[#193c2d]">{mode === "login" ? text.welcome : text.register}</h1><p className="mt-3 text-sm leading-6 text-[#69736a]">{mode === "login" ? text.subtitle : (isThai ? "สร้างบัญชีเพื่อบันทึกผล BMI ของคุณ" : "Create an account to save your BMI records")}</p><form onSubmit={submit} className="mt-8 space-y-4">{mode === "register" && <input className="w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 outline-none focus:border-[#799d4c]" name="username" value={form.username} onChange={update} placeholder={text.username} required />}<input className="w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 outline-none focus:border-[#799d4c]" name="email" type="email" value={form.email} onChange={update} placeholder={text.email} required /><div className="flex items-center rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 focus-within:border-[#799d4c]"><input className="w-full bg-transparent py-3 outline-none" name="password" type={showPassword ? "text" : "password"} minLength="6" value={form.password} onChange={update} placeholder={text.password} required /><button type="button" onClick={() => setShowPassword(!showPassword)} title={showPassword ? (isThai ? "ซ่อนรหัสผ่าน" : "Hide password") : (isThai ? "แสดงรหัสผ่าน" : "Show password")} aria-label={showPassword ? (isThai ? "ซ่อนรหัสผ่าน" : "Hide password") : (isThai ? "แสดงรหัสผ่าน" : "Show password")} className="ml-2 shrink-0 text-[#718071]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><button className="w-full rounded-xl bg-[#193c2d] py-3.5 font-bold text-white transition hover:bg-[#285640] disabled:opacity-60" disabled={loading} type="submit">{loading ? "..." : (mode === "login" ? text.submitLogin : text.submitRegister)}</button>{mode === "login" && <button type="button" onClick={() => setForgotNotice(isThai ? "ระบบกู้คืนรหัสผ่านจะเพิ่มในขั้นถัดไป" : "Password recovery will be available in a future update")} className="w-full text-sm font-semibold text-[#799d4c]">{isThai ? "ลืมรหัสผ่าน?" : "Forgot password?"}</button>}{error && <p className="text-sm text-[#c75b51]">{error}</p>}{forgotNotice && <p className="text-center text-sm text-[#799d4c]">{forgotNotice}</p>}</form><button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setForgotNotice(""); }} className="mt-6 w-full text-sm font-semibold text-[#557d43]">{mode === "login" ? text.switchRegister : text.switchLogin}</button></section></main>;
}

function AccountAuthScreen({ language, setLanguage, onAuthenticated }) {
  const thai = language === "th";
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    if (!form.username || !form.password || (mode === "register" && !form.email)) { setMessage(thai ? "กรุณากรอกข้อมูลให้ครบ" : "Please complete all fields"); return; }
    try {
      const response = await fetch(`${API_URL}/users/${mode === "login" ? "login" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      onAuthenticated(data);
      toast.success(mode === "login" ? (thai ? "เข้าสู่ระบบสำเร็จ" : "Signed in successfully") : (thai ? "สร้างบัญชีสำเร็จ" : "Account created successfully"));
    } catch (error) {
      const errorMessage = error.message.includes("Failed to fetch") ? (thai ? "เชื่อมต่อ server ไม่ได้" : "Cannot connect to the server") : error.message;
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  }
  return <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-5 py-8"><section className="w-full max-w-md rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 shadow-[0_18px_50px_rgba(25,60,45,.08)] sm:p-9"><div className="mb-8 flex items-center justify-between"><span className="flex items-center gap-3 text-lg font-bold tracking-tight text-[#193c2d]"><span className="grid size-10 place-items-center rounded-full bg-[#193c2d] text-[#d9f18b]"><Activity size={20} /></span>body<span className="text-[#769b46]">/</span>compass</span><button type="button" onClick={() => setLanguage(thai ? "en" : "th")} title={thai ? "เปลี่ยนเป็น English" : "Switch to Thai"} className="rounded-full border border-[#cdd7c7] px-3 py-2 text-xs font-bold text-[#193c2d]">{thai ? "EN" : "TH"}</button></div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#799d4c]">{mode === "login" ? (thai ? "เข้าสู่ระบบ" : "SIGN IN") : (thai ? "สร้างบัญชี" : "CREATE ACCOUNT")}</p><h1 className="mt-3 font-[Playfair_Display] text-4xl leading-tight text-[#193c2d]">{mode === "login" ? (thai ? "ยินดีต้อนรับกลับมา" : "Welcome back") : (thai ? "สร้างบัญชีของคุณ" : "Create your account")}</h1><p className="mt-3 text-sm leading-6 text-[#69736a]">{mode === "login" ? (thai ? "ใช้ username และรหัสผ่านเพื่อเข้าสู่ระบบ" : "Use your username and password to sign in") : (thai ? "อีเมลจะใช้สำหรับยืนยันตัวตนหรือกู้คืนรหัสผ่านในอนาคต" : "Your email can be used for verification or password recovery later")}</p><form onSubmit={submit} className="mt-8 space-y-4"><input className="w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 outline-none focus:border-[#799d4c]" name="username" value={form.username} onChange={update} placeholder={thai ? "ชื่อผู้ใช้" : "Username"} required />{mode === "register" && <input className="w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 outline-none focus:border-[#799d4c]" name="email" type="email" value={form.email} onChange={update} placeholder={thai ? "อีเมล" : "Email for recovery"} required />}<div className="flex items-center rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 focus-within:border-[#799d4c]"><input className="w-full bg-transparent py-3 outline-none" name="password" type={showPassword ? "text" : "password"} minLength="6" value={form.password} onChange={update} placeholder={thai ? "รหัสผ่าน" : "Password"} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} className="ml-2 shrink-0 text-[#718071]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><button className="w-full rounded-xl bg-[#193c2d] py-3.5 font-bold text-white" type="submit">{mode === "login" ? (thai ? "เข้าสู่ระบบ" : "Sign in") : (thai ? "สร้างบัญชี" : "Create account")}</button>{message && <p className="text-sm text-[#c75b51]">{message}</p>}</form><button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }} className="mt-6 w-full text-sm font-semibold text-[#557d43]">{mode === "login" ? (thai ? "ยังไม่มีบัญชี? สร้างบัญชี" : "New here? Create an account") : (thai ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ" : "Already have an account? Sign in")}</button></section></main>;
}

function AnimatedBmi({ value, reducedMotion }) {
  const count = useMotionValue(0);
  const displayedCount = useTransform(count, (latest) => latest.toFixed(1));
  useEffect(() => {
    if (reducedMotion) {
      count.set(value);
      return;
    }
    count.set(0);
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [count, value, reducedMotion]);
  return <motion.span>{displayedCount}</motion.span>;
}

function BmiScale({ bmi, reducedMotion }) {
  const thresholds = [18.5, 23, 25];
  const markerPosition = bmi ? Math.min(Math.max((bmi / 40) * 100, 2), 98) : 0;

  return <div className="mt-10">
    <div className="relative h-3 overflow-visible rounded-full bg-gradient-to-r from-[#e2a446] via-[#5d9b64] via-[55%] via-[#d77d45] via-[70%] to-[#c75b51]">
      {thresholds.map((value) => <span key={value} aria-hidden="true" className="absolute -top-2 h-7 w-0.5 -translate-x-1/2 rounded-full bg-white shadow-sm" style={{ left: `${(value / 40) * 100}%` }} />)}
      <motion.div aria-hidden="true" className="absolute -top-2.5 size-8 -translate-x-1/2 rounded-full border-[5px] border-white bg-[#193c2d] shadow-md" animate={{ left: `${markerPosition}%` }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 22 }} />
    </div>
    <div className="relative mt-3 h-5 text-xs font-semibold text-[#526453]">
      {thresholds.map((value) => <span key={value} className="absolute -translate-x-1/2" style={{ left: `${(value / 40) * 100}%` }}>{value}</span>)}
    </div>
  </div>;
}

function BmiTrendSection({ rows, language, reducedMotion }) {
  const chartRef = useRef(null);
  const chartInView = useInView(chartRef, { once: true, amount: 0.25 });
  const chartData = rows
    .map((record) => ({
      ...record,
      bmi: Number(record.bmi),
      weight: Number(record.weight),
      timestamp: new Date(record.createdAt).getTime(),
      dateLabel: formatDate(record.createdAt, language),
    }))
    .filter((record) => Number.isFinite(record.timestamp) && Number.isFinite(record.bmi) && Number.isFinite(record.weight))
    .sort((left, right) => left.timestamp - right.timestamp);
  const bmiValues = chartData.map((record) => record.bmi);
  const yDomain = chartData.length
    ? [Math.max(0, Math.min(18, Math.floor(Math.min(...bmiValues)) - 2)), Math.max(30, Math.ceil(Math.max(...bmiValues)) + 2)]
    : [0, 30];
  const title = language === "th" ? "แนวโน้มของคุณ" : "Your Trend";

  return <section className="scroll-section mt-14 rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-6 sm:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#799d4c]">{language === "th" ? "แนวโน้มสุขภาพ" : "YOUR HISTORY"}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{title}</h2>
      </div>
      {chartData.length > 1 && <span className="text-sm text-[#7a847b]">{chartData.length} {language === "th" ? "รายการ" : "records"}</span>}
    </div>
    {chartData.length === 1 ? <p className="rounded-2xl border border-dashed border-[#cfd8ca] bg-[#fbfcf8] px-5 py-10 text-center text-sm leading-6 text-[#69736a]">Add another record to see your trend</p>
      : chartData.length === 0 ? <p className="rounded-2xl border border-dashed border-[#cfd8ca] bg-[#fbfcf8] px-5 py-10 text-center text-sm leading-6 text-[#69736a]">{language === "th" ? "ยังไม่มีข้อมูล BMI สำหรับแสดงแนวโน้ม" : "No BMI records to show yet."}</p>
        : <div ref={chartRef} className="h-72 min-w-0 w-full sm:h-80" role="img" aria-label={title}>
          {chartInView && <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 10, left: -12, bottom: 4 }}>
              <CartesianGrid stroke="#e5ece2" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="dateLabel" interval="preserveStartEnd" tick={{ fill: "#526453", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#dfe7dc" }} />
              <YAxis domain={yDomain} tickFormatter={(value) => Number(value).toFixed(0)} tick={{ fill: "#526453", fontSize: 11 }} tickLine={false} axisLine={false} width={38} />
              <Tooltip content={<BmiTrendTooltip language={language} />} />
              <ReferenceLine y={23} stroke="#92a98b" strokeDasharray="4 5" strokeOpacity={0.55} label={{ value: "23", position: "insideTopRight", fill: "#526453", fontSize: 11 }} />
              <ReferenceLine y={25} stroke="#92a98b" strokeDasharray="4 5" strokeOpacity={0.55} label={{ value: "25", position: "insideTopRight", fill: "#526453", fontSize: 11 }} />
              <Line type="monotone" dataKey="bmi" stroke="#193c2d" strokeWidth={3} dot={{ r: 5, fill: "#193c2d", stroke: "#fffefa", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#193c2d", stroke: "#d9f18b", strokeWidth: 3 }} isAnimationActive={!reducedMotion} animationBegin={0} animationDuration={1300} animationEasing="ease-in-out" />
            </LineChart>
          </ResponsiveContainer>}
        </div>}
  </section>;
}

function BmiTrendTooltip({ active, payload, language }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const isThai = language === "th";

  return <div className="min-w-40 rounded-xl border border-[#dfe4d8] bg-[#fffefa] px-4 py-3 shadow-[0_12px_30px_rgba(25,60,45,.14)]">
    <p className="mb-2 text-xs font-semibold text-[#839184]">{formatDate(point.createdAt, language)}</p>
    <div className="flex items-center justify-between gap-5 text-sm"><span className="text-[#69736a]">{isThai ? "น้ำหนัก" : "Weight"}</span><strong className="text-[#314237]">{point.weight.toFixed(1)} {isThai ? "กก." : "kg"}</strong></div>
    <div className="mt-1 flex items-center justify-between gap-5 text-sm"><span className="text-[#69736a]">BMI</span><strong className="text-[#193c2d]">{point.bmi.toFixed(1)}</strong></div>
  </div>;
}

function Field({ icon, label, name, value, onChange, suffix, required }) { return <label className="block"><span className="mb-2 flex items-center gap-2 text-sm text-[#d5e2d3]">{icon}{label}</span><span className="flex items-center rounded-xl border border-white/15 bg-white/10 px-3 transition focus-within:border-[#cbe78b]"><input className="w-full bg-transparent py-3 text-lg font-semibold text-white outline-none placeholder:text-white/25" type="number" min="0" step="0.1" name={name} value={value} onChange={onChange} placeholder="0" required={required} /><span className="text-xs text-[#9db0a0]">{suffix}</span></span></label>; }
function Metric({ label, value }) { return <div><p className="text-xs text-[#8a948a]">{label}</p><p className="mt-1 text-sm font-semibold text-[#314237]">{value}</p></div>; }

function HistorySection({ rows, language, copy, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const labels = contentCopy[language];

  return <section id="history" className="scroll-section mt-14">
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className={`text-xs font-bold uppercase tracking-[.18em] text-[#526453] ${language === "en" ? "english-label" : ""}`}>{copy.records}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{copy.history}</h2>
      </div>
      <span className="text-sm text-[#526453]">{rows.length} {copy.items}</span>
    </div>
    {rows.length ? <div className="overflow-hidden rounded-2xl border border-[#dfe4d8] bg-[#fffefa]">
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-4 border-b border-[#e8ebe4] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#526453] sm:grid">
        <span>{copy.date}</span><span>{copy.measurements}</span><span>{copy.result}</span><span />
      </div>
      {rows.map((row, index) => {
        const rowId = row._id || `${row.createdAt}-${index}`;
        const expanded = expandedId === rowId;
        const category = getCategory(row.bmi);
        return <div className="border-b border-[#edf0e9] last:border-0" key={rowId}>
          <div className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] sm:gap-4 sm:px-5">
            <button type="button" className="grid min-w-0 gap-2 text-left text-sm text-[#314237] sm:col-span-3 sm:grid-cols-3 sm:gap-4" aria-expanded={expanded} aria-controls={`history-detail-${index}`} onClick={() => setExpandedId(expanded ? null : rowId)}>
              <span className="flex min-w-0 items-center gap-2 font-semibold"><CalendarDays size={15} className="shrink-0 text-[#557d43]" />{formatDate(row.createdAt, language)}</span>
              <span>{row.weight} {copy.kg} <span className="text-[#526453]">/</span> {row.height} {copy.cm}</span>
              <span><strong className="mr-2 text-lg text-[#193c2d]">{Number(row.bmi).toFixed(1)}</strong><span className="text-xs font-semibold" style={{ color: category.color }}>{category.label[language]}</span></span>
            </button>
            <button type="button" onClick={() => onDelete(index)} aria-label={language === "th" ? "ลบรายการ" : "Delete entry"} className="grid size-10 place-items-center rounded-lg text-[#526453] transition hover:bg-[#fff0ec] hover:text-[#963d35]"><Trash2 size={17} /></button>
          </div>
          {expanded && <div id={`history-detail-${index}`} className="detail-grid border-t border-[#e5eee1] bg-[#fbfdf9] px-4 py-4 sm:px-5">
            <DetailItem label={labels.weight} value={`${Number(row.weight).toFixed(1)} ${copy.kg}`} change={formatChange(row.weightChange, ` ${copy.kg}`)} />
            <DetailItem label={labels.height} value={`${Number(row.height).toFixed(1)} ${copy.cm}`} />
            <DetailItem label="BMI" value={Number(row.bmi).toFixed(1)} change={formatChange(row.bmiChange)} />
            <DetailItem label={labels.waist} value={row.waist !== undefined && row.waist !== "" ? `${row.waist} ${copy.cm}` : labels.unrecorded} change={formatChange(row.waistChange, ` ${copy.cm}`)} />
            <DetailItem label={labels.chest} value={row.chest ? `${row.chest} ${copy.cm}` : labels.unrecorded} />
            <DetailItem label={labels.hip} value={row.hip ? `${row.hip} ${copy.cm}` : labels.unrecorded} />
          </div>}
        </div>;
      })}
    </div> : <div className="rounded-2xl border border-dashed border-[#cfd8ca] bg-[#fbfcf8] px-6 py-10 text-center text-sm text-[#526453]">{copy.empty}</div>}
  </section>;
}

function activityDateKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatRelativeActivityDate(value, language, copy) {
  const date = new Date(value);
  const today = new Date();
  const activityDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayDifference = Math.round((todayStart.getTime() - activityDay.getTime()) / (24 * 60 * 60 * 1000));
  if (dayDifference === 0) return copy.today;
  if (dayDifference === 1) return copy.yesterday;
  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", { day: "numeric", month: "short" }).format(date);
}

function ActivitiesDashboard({ activities, stats, language, copy, reducedMotion, onCreate, onEdit, onDelete, modalOpen, editing, form, setForm, onSubmit, onClose, deleteTarget, onConfirmDelete, onCancelDelete }) {
  const chartRef = useRef(null);
  const [chartVisible, setChartVisible] = useState(false);
  useEffect(() => {
    if (reducedMotion) { setChartVisible(true); return; }
    const target = chartRef.current;
    if (!target) return;
    let revealed = false;
    const observer = new IntersectionObserver(checkVisibility, { threshold: 0.05 });
    function checkVisibility() {
      if (revealed) return;
      const bounds = target.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) {
        revealed = true;
        setChartVisible(true);
        observer.disconnect();
        window.removeEventListener("scroll", checkVisibility);
        window.removeEventListener("resize", checkVisibility);
      }
    }
    observer.observe(target);
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);
    checkVisibility();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [reducedMotion]);
  const today = new Date();
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
    const key = activityDateKey(date);
    return {
      key,
      day: new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", { weekday: "short" }).format(date),
      minutes: activities.reduce((total, activity) => total + (activityDateKey(activity.date) === key ? Number(activity.durationMin) : 0), 0),
    };
  });
  const goalProgress = Math.min(Number(stats.totalMinutes || 0) / 150, 1);
  const goalRingCircumference = 2 * Math.PI * 42;

  return <>
    <section id="activities" className="scroll-section mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="english-label text-xs font-bold uppercase tracking-[.18em] text-[#526453]">{copy.eyebrow}</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{copy.title}</h2></div>
        <button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640]"><Plus size={17} />{copy.log}</button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-4">
          {activities.length ? activities.map((activity) => <ActivityFeedCard key={activity._id} activity={activity} language={language} copy={copy} onEdit={() => onEdit(activity)} onDelete={() => onDelete(activity)} />) : <div className="grid min-h-72 place-items-center rounded-[24px] border border-dashed border-[#cfd8ca] bg-[#fbfcf8] px-6 py-8 text-center">
            <div className="max-w-sm"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8f0df] text-[#557d43]"><Footprints size={30} /></span><h3 className="mt-5 text-xl font-semibold text-[#193c2d]">{copy.noActivitiesTitle}</h3><p className="mt-2 text-sm leading-6 text-[#526453]">{copy.noActivitiesMessage}</p><button type="button" onClick={onCreate} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640]"><Plus size={17} />{copy.firstActivity}</button></div>
          </div>}
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-[#dfe4d8] bg-[#fffefa] p-5 sm:p-6">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-[#193c2d]">{copy.thisWeek}</h3><CalendarDays size={18} className="text-[#557d43]" /></div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div><p className="activity-stat-number text-2xl font-bold">{stats.totalSessions || 0}</p><p className="mt-1 text-xs text-[#526453]">{copy.sessions}</p></div>
              <div><p className="activity-stat-number text-2xl font-bold">{stats.totalMinutes || 0}</p><p className="mt-1 text-xs text-[#526453]">{copy.minutes}</p></div>
              <div><p className="activity-stat-number text-2xl font-bold">{Number(stats.totalDistanceKm || 0).toFixed(1)}</p><p className="mt-1 text-xs text-[#526453]">{copy.distance} ({copy.km})</p></div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dfe4d8] bg-[#fffefa] p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#193c2d]">{copy.weeklyActivity}</h3>
            <div ref={chartRef} className="h-48 min-w-0 w-full">
              {chartVisible && <ResponsiveContainer width="100%" height="100%"><BarChart data={chartDays} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#e5ece2" strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#526453", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#dfe7dc" }} />
                <YAxis allowDecimals={false} width={34} tick={{ fill: "#526453", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ActivityChartTooltip copy={copy} />} />
                <Bar dataKey="minutes" name={copy.chartMinutes} fill="#b35b32" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={!reducedMotion} animationDuration={850} />
              </BarChart></ResponsiveContainer>}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <section className="flex min-h-36 flex-col justify-between rounded-2xl border border-[#dfe4d8] bg-[#fffefa] p-4 sm:p-5">
              <div className="flex items-center gap-2"><Flame size={18} className="activity-stat-number" /><h3 className="text-sm font-semibold text-[#193c2d]">{copy.streak}</h3></div>
              <p className="activity-stat-number mt-4 text-2xl font-bold">{stats.streak || 0}<span className="ml-1 text-sm font-semibold">{copy.streakUnit}</span></p>
            </section>
            <section className="flex min-h-36 items-center gap-3 rounded-2xl border border-[#dfe4d8] bg-[#fffefa] p-4 sm:p-5">
              <svg viewBox="0 0 100 100" className="size-16 shrink-0 -rotate-90" role="img" aria-label={`${copy.weeklyGoal}: ${stats.totalMinutes || 0} ${copy.minutes}`}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5eee0" strokeWidth="9" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#b35b32" strokeWidth="9" strokeLinecap="round" style={{ strokeDasharray: `${goalRingCircumference} ${goalRingCircumference}`, strokeDashoffset: goalRingCircumference * (1 - (chartVisible ? goalProgress : 0)), transition: reducedMotion ? "none" : "stroke-dashoffset 900ms ease-out" }} />
              </svg>
              <div className="min-w-0"><h3 className="text-sm font-semibold text-[#193c2d]">{copy.weeklyGoal}</h3><p className="mt-1 text-sm text-[#526453]">{stats.totalMinutes || 0} / 150 {copy.minutesShort}</p><p className="mt-1 text-xs leading-5 text-[#526453]">{goalProgress >= 1 ? copy.goalReached : copy.minutesOfGoal}</p></div>
            </section>
          </div>
        </div>
      </div>
    </section>

      {modalOpen && <motion.div key="activity-editor" className="fixed inset-0 z-[120] flex items-center justify-center bg-[#193c2d]/35 px-4 py-6 backdrop-blur-md" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.2 } }} onClick={onClose}>
        <motion.section role="dialog" aria-modal="true" aria-labelledby="activity-modal-title" className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[#dfe4d8] bg-[#fffefa] p-5 shadow-[0_24px_80px_rgba(25,60,45,.24)] sm:p-7" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.94 }} animate={reducedMotion ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } } : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }} exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
          <div className="mb-6 flex items-start justify-between gap-4"><div><p className="english-label text-xs font-bold uppercase tracking-[.18em] text-[#526453]">{copy.eyebrow}</p><h2 id="activity-modal-title" className="mt-2 text-2xl font-semibold text-[#193c2d]">{editing ? copy.edit : copy.log}</h2></div><button type="button" onClick={onClose} aria-label={copy.close} className="grid size-10 shrink-0 place-items-center rounded-lg text-[#526453] transition hover:bg-[#eef5e8]"><X size={19} /></button></div>
          <form onSubmit={onSubmit} className="space-y-5">
            <fieldset><legend className="mb-2 text-sm font-semibold text-[#314237]">{copy.type}</legend><div className="grid grid-cols-5 gap-2" role="group" aria-label={copy.type}>{activityTypes.map(({ value, icon: TypeIcon }) => { const selected = form.type === value; return <button key={value} type="button" aria-pressed={selected} onClick={() => setForm((current) => ({ ...current, type: value }))} className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border px-1.5 py-3 text-xs font-semibold transition ${selected ? "border-[#c96e3f] bg-[#fff3ea] text-[#a8532d]" : "border-[#dfe7dc] bg-[#fbfcf8] text-[#526453] hover:bg-[#f3f7ef]"}`}><TypeIcon size={20} /><span className="text-center leading-4">{copy[value]}</span></button>; })}</div></fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#314237]"><span>{copy.duration} ({copy.minutesShort})</span><input name="durationMin" type="number" min="1" step="1" required value={form.durationMin} onChange={(event) => setForm((current) => ({ ...current, durationMin: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 text-base text-[#193c2d] outline-none focus:border-[#799d4c]" /></label>
              <label className="grid gap-2 text-sm font-semibold text-[#314237]"><span>{copy.distanceKm} <span className="font-normal text-[#526453]">({copy.optional})</span></span><input name="distanceKm" type="number" min="0" step="0.1" value={form.distanceKm} onChange={(event) => setForm((current) => ({ ...current, distanceKm: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 text-base text-[#193c2d] outline-none focus:border-[#799d4c]" /></label>
              <label className="grid gap-2 text-sm font-semibold text-[#314237] sm:col-span-2"><span>{copy.date}</span><input name="date" type="date" required value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 text-base text-[#193c2d] outline-none focus:border-[#799d4c]" /></label>
              <label className="grid gap-2 text-sm font-semibold text-[#314237] sm:col-span-2"><span>{copy.note} <span className="font-normal text-[#526453]">({copy.optional})</span></span><textarea name="note" rows="3" maxLength="200" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder={copy.notePlaceholder} className="w-full resize-y rounded-xl border border-[#d5ddd0] bg-[#fbfcf8] px-4 py-3 text-base text-[#193c2d] outline-none placeholder:text-[#667668] focus:border-[#799d4c]" /></label>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1"><button type="button" onClick={onClose} className="min-h-12 rounded-xl border border-[#cdd7c7] bg-[#f5f8f2] px-4 py-3 text-sm font-bold text-[#193c2d] transition hover:bg-[#edf4e7]">{copy.cancel}</button><button type="submit" className="min-h-12 rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#285640]">{editing ? copy.update : copy.save}</button></div>
          </form>
        </motion.section>
      </motion.div>}
      {deleteTarget && <motion.div key="activity-delete-confirm" className="fixed inset-0 z-[130] flex items-center justify-center bg-[#193c2d]/35 px-4 py-6 backdrop-blur-md" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.2 } }} onClick={onCancelDelete}>
        <motion.section role="alertdialog" aria-modal="true" aria-labelledby="activity-delete-title" className="w-full max-w-sm rounded-[24px] border border-[#dfe4d8] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(25,60,45,.24)]" initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.94 }} animate={reducedMotion ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } } : { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }} exit={reducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
          <h2 id="activity-delete-title" className="text-xl font-semibold text-[#193c2d]">{copy.confirmDelete}</h2><p className="mt-3 text-sm leading-6 text-[#526453]">{copy.confirmDeleteMessage}</p>
          <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={onCancelDelete} className="min-h-12 rounded-xl border border-[#cdd7c7] bg-[#f5f8f2] px-4 py-3 text-sm font-bold text-[#193c2d]">{copy.cancel}</button><button type="button" onClick={onConfirmDelete} className="min-h-12 rounded-xl bg-[#193c2d] px-4 py-3 text-sm font-bold text-white">{copy.delete}</button></div>
        </motion.section>
      </motion.div>}
  </>;
}

function ActivityChartTooltip({ active, payload, copy }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl border border-[#dfe4d8] bg-[#fffefa] px-3 py-2 shadow-[0_8px_24px_rgba(25,60,45,.12)]"><p className="text-sm font-semibold text-[#193c2d]">{payload[0].payload.day}</p><p className="activity-stat-number mt-1 text-sm font-bold">{payload[0].value} {copy.minutesShort}</p></div>;
}

function ActivityFeedCard({ activity, language, copy, onEdit, onDelete }) {
  const ActivityIcon = activityTypes.find((item) => item.value === activity.type)?.icon || Activity;
  const distance = activity.distanceKm == null ? "—" : Number(activity.distanceKm).toFixed(1);
  return <article className="rounded-2xl border border-[#dfe4d8] bg-[#fffefa] p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8f0df] text-[#557d43]"><ActivityIcon size={20} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="font-semibold text-[#193c2d]">{copy[activity.type]}</h3><span className="text-sm text-[#526453]">· {formatRelativeActivityDate(activity.date, language, copy)}</span></div>
        {activity.note && <p className="mt-1 break-words text-sm leading-6 text-[#526453]">{activity.note}</p>}
      </div>
      <div className="flex shrink-0 gap-1"><button type="button" onClick={onEdit} title={copy.edit} aria-label={copy.edit} className="grid size-9 place-items-center rounded-lg text-[#526453] transition hover:bg-[#eef5e8] hover:text-[#193c2d]"><Pencil size={16} /></button><button type="button" onClick={onDelete} title={copy.delete} aria-label={copy.delete} className="grid size-9 place-items-center rounded-lg text-[#526453] transition hover:bg-[#fff0ec] hover:text-[#963d35]"><Trash2 size={16} /></button></div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#edf0e9] pt-3"><div><p className="activity-stat-number text-2xl font-bold">{activity.durationMin}<span className="ml-1 text-sm font-semibold">{copy.minutesShort}</span></p><p className="mt-1 text-xs text-[#526453]">{copy.duration}</p></div><div><p className="activity-stat-number text-2xl font-bold">{distance}<span className="ml-1 text-sm font-semibold">{copy.km}</span></p><p className="mt-1 text-xs text-[#526453]">{copy.distance}</p></div></div>
  </article>;
}

function StatsTable({ rows, language, copy }) {
  const thai = language === "th";
  const changeClass = (value) => value === null ? "text-[#526453]" : value < 0 ? "text-[#386c3f]" : value > 0 ? "text-[#8a4b23]" : "text-[#526453]";
  const weightSuffix = ` ${copy.kg}`;
  const lengthSuffix = ` ${copy.cm}`;
  return <section className="stats-table scroll-section mt-14">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><p className="english-label text-xs font-bold uppercase tracking-[.18em] text-[#526453]">PROGRESS LOG</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{thai ? "การเปลี่ยนแปลงของคุณ" : "Your progress"}</h2></div>
      <p className="text-sm text-[#526453]">{thai ? "เทียบกับรายการก่อนหน้า" : "Compared with previous entry"}</p>
    </div>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#dce7d8] bg-white/90 shadow-[0_10px_28px_rgba(52,91,58,.05)]">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead className="bg-[#f0f6ed] text-xs uppercase tracking-[.12em] text-[#526453]"><tr><th className="px-5 py-4 font-bold">{thai ? "วันที่" : "Date"}</th><th className="px-5 py-4 font-bold">{thai ? "น้ำหนัก" : "Weight"}</th><th className="px-5 py-4 font-bold">BMI</th><th className="px-5 py-4 font-bold">{thai ? "รอบเอว" : "Waist"}</th><th className="px-5 py-4 font-bold">{thai ? "แนวโน้ม" : "Trend"}</th></tr></thead>
        <tbody>{rows.map((row) => <tr className="border-t border-[#e7eee4] text-sm text-[#4b5b4d]" key={`${row._id || row.createdAt}-stats`}>
          <td className="px-5 py-4 font-semibold text-[#344b38]">{formatDate(row.createdAt, language)}</td>
          <td className="px-5 py-4"><strong>{row.weight}{weightSuffix}</strong><span className={`ml-3 text-xs font-bold ${changeClass(row.weightChange)}`}>{formatChange(row.weightChange, weightSuffix)}</span></td>
          <td className="px-5 py-4"><strong>{row.bmi}</strong><span className={`ml-3 text-xs font-bold ${changeClass(row.bmiChange)}`}>{formatChange(row.bmiChange)}</span></td>
          <td className="px-5 py-4">{row.waist ? <><strong>{row.waist}{lengthSuffix}</strong><span className={`ml-3 text-xs font-bold ${changeClass(row.waistChange)}`}>{formatChange(row.waistChange, lengthSuffix)}</span></> : "—"}</td>
          <td className={`px-5 py-4 text-xs font-bold ${changeClass(row.bmiChange)}`}>{row.bmiChange === null ? (thai ? "รายการแรก" : "First entry") : row.bmiChange < 0 ? (thai ? "แนวโน้มลดลง" : "Moving down") : row.bmiChange > 0 ? (thai ? "แนวโน้มเพิ่มขึ้น" : "Moving up") : (thai ? "คงที่" : "Stable")}</td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="rounded-2xl border border-dashed border-[#cfdcc9] bg-white/65 px-6 py-10 text-center text-sm text-[#526453]">{thai ? "คำนวณ BMI อย่างน้อยหนึ่งครั้งเพื่อเริ่มดูสถิติ" : "Calculate BMI once to start tracking progress."}</div>}
    <p className="mt-3 text-xs leading-5 text-[#526453]">{thai ? "ค่า + และ - เป็นการเปลี่ยนแปลงจากรายการก่อนหน้า ไม่ใช่เป้าหมายทางการแพทย์" : "+ and - show change from the previous entry, not a medical target."}</p>
  </section>;
}

function DetailItem({ label, value, change }) {
  return <div className="rounded-xl border border-[#e1eadf] bg-white px-4 py-3"><p className="text-xs text-[#839184]">{label}</p><p className="mt-1 font-bold text-[#344b38]">{value}</p>{change && change !== "—" && <p className="mt-1 text-xs font-semibold text-[#71935a]">{change}</p>}</div>;
}

function DashboardPulse({ language, records, bmi, reducedMotion }) {
  const thai = language === "th";
  const cards = [
    { icon: Activity, label: thai ? "สถานะวันนี้" : "Today", value: bmi ? bmi.toFixed(1) : "--", note: "BMI", color: "#7d9f4e" },
    { icon: CalendarDays, label: thai ? "บันทึกทั้งหมด" : "Entries", value: records.length, note: thai ? "ครั้งที่บันทึก" : "saved records", color: "#d38b51" },
    { icon: Dumbbell, label: thai ? "เป้าหมายถัดไป" : "Next focus", value: thai ? "ขยับทุกวัน" : "MOVE DAILY", note: thai ? "สร้างนิสัยการเคลื่อนไหว" : "Build a daily movement habit", color: "#5f8f95" },
  ];
  return <motion.section className="dashboard-pulse grid gap-3 sm:grid-cols-3" {...sectionRevealProps(reducedMotion)}>{cards.map((card) => <motion.article className="pulse-card flex items-center justify-between rounded-2xl border border-[#dce7d8] bg-white/80 px-5 py-4" key={card.label} whileHover={reducedMotion ? undefined : { y: -4, boxShadow: "0 14px 32px rgba(52, 91, 58, .12)", transition: { duration: 0.2, ease: "easeOut" } }}><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#839184]">{card.label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-[#193c2d]">{card.value}</p><p className="mt-1 text-xs text-[#849084]">{card.note}</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full" aria-hidden="true" style={{ backgroundColor: `${card.color}20`, color: card.color }}><card.icon size={18} strokeWidth={2} /></span></motion.article>)}</motion.section>;
}

function ExerciseGallery({ recommendation, language }) {
  const thai = language === "th";
  const activities = [
    { title: thai ? "คาร์ดิโอ" : "Cardio", tag: thai ? "ขยับ" : "MOVE", image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=80", text: thai ? "เดินเร็ว วิ่งเบา หรือปั่นจักรยานตามความพร้อม" : "Walk, jog, or cycle at a comfortable pace." },
    { title: thai ? "ฝึกแรงต้าน" : "Strength", tag: thai ? "เสริมแรง" : "BUILD", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80", text: thai ? "สร้างความแข็งแรงด้วยน้ำหนักตัวหรือเวทเบา" : "Build strength with bodyweight or light weights." },
    { title: thai ? "ยืดและฟื้นตัว" : "Recovery", tag: thai ? "พักฟื้น" : "RESET", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80", text: thai ? "ยืดกล้ามเนื้อและพักให้เพียงพอระหว่างวัน" : "Stretch and give your body enough recovery time." },
  ];
  return <section className="scroll-section mt-8 rounded-[28px] border border-[#dfe8d9] bg-white/85 p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#74924e]">{thai ? "MOVE WITH PURPOSE" : "MOVE WITH PURPOSE"}</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{thai ? `แนวทางสำหรับ${recommendation.category}` : `${recommendation.category} movement plan`}</h2></div><span className="rounded-full bg-[#edf5e7] px-3 py-1.5 text-xs font-bold text-[#557d43]">{thai ? "ปรับตามความพร้อม" : "ADAPT TO YOUR PACE"}</span></div><div className="mt-6 grid gap-4 md:grid-cols-3">{activities.map((activity) => <article className="image-card overflow-hidden rounded-2xl border border-[#e1e9dc] bg-[#fbfdf9]" key={activity.title}><img src={activity.image} alt={activity.title} loading="lazy" /><div className="p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-[#193c2d]">{activity.title}</h3><span className="text-[10px] font-bold tracking-[.15em] text-[#83a75b]">{activity.tag}</span></div><p className="mt-2 text-sm leading-6 text-[#69786b]">{activity.text}</p></div></article>)}</div><ul className="mt-6 grid gap-3 text-sm leading-6 text-[#405744] sm:grid-cols-3">{recommendation.exercise.map((item) => <li className="rounded-xl border border-[#d5e2cf] bg-[#f5f9f2] p-4" key={item}>{item}</li>)}</ul><div className="mt-6 border-t border-[#e1e9dc] pt-5"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#6b8b4d]">{thai ? "แหล่งอ้างอิง" : "SOURCES"}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{recommendation.references.map((reference) => <a className="inline-flex items-center gap-1 text-sm font-semibold text-[#416d46] underline decoration-[#a9c498] underline-offset-4 hover:text-[#193c2d]" href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.title}<ExternalLink size={14} /></a>)}</div><p className="mt-4 text-xs leading-5 text-[#718072]">{recommendation.disclaimer}</p></div></section>;
}

function NutritionAndWorkout({ recommendation, language }) {
  const thai = language === "th";
  const nutrition = recommendation.nutrition;
  const workout = {
    ...recommendation.workoutPlan,
    options: recommendation.workoutPlan.options.map((option) => ({ ...option, name: translateWorkoutName(option.name, language) })),
  };
  if (!nutrition || !workout) return null;
  return <section className="nutrition-workout scroll-section mt-8 grid gap-5 lg:grid-cols-2"><article className="rounded-[28px] border border-[#e7dfcf] bg-[#fffdf7] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b17c3f]">{thai ? "EAT WITH INTENTION" : "EAT WITH INTENTION"}</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{thai ? "อาหารที่ควรกิน" : "What to eat"}</h2></div><span className="rounded-full bg-[#f5ead6] px-3 py-1.5 text-xs font-bold text-[#9b6a35]">{thai ? "ทางเลือก" : "OPTIONS"}</span></div><p className="mt-4 rounded-xl bg-[#f8f0e2] p-4 text-sm font-semibold leading-6 text-[#755b3e]">{nutrition.focus}</p><div className="mt-5"><h3 className="text-sm font-bold text-[#4e694e]">{thai ? "เลือกบ่อยขึ้น" : "Choose more often"}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#687568]">{nutrition.eat.map((item) => <li className="flex gap-2" key={item}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7da34d]" />{item}</li>)}</ul></div><div className="mt-5 border-t border-[#eadfcd] pt-5"><h3 className="text-sm font-bold text-[#a36243]">{thai ? "ควรจำกัด" : "Limit"}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#887468]">{nutrition.limit.map((item) => <li className="flex gap-2" key={item}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#d4865e]" />{item}</li>)}</ul></div></article><article className="rounded-[28px] border border-[#dce7d8] bg-white p-6 shadow-[0_12px_30px_rgba(52,91,58,.05)] sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9250]">{thai ? "TRAIN SMART" : "TRAIN SMART"}</p><h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{thai ? "แผนออกกำลังกายแบบละเอียด" : "Detailed workout plan"}</h2></div><span className="rounded-full bg-[#edf5e7] px-3 py-1.5 text-xs font-bold text-[#557d43]">{workout.frequency}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f3f8ef] p-3"><p className="text-xs text-[#819080]">{thai ? "ความถี่" : "Frequency"}</p><strong className="mt-1 block text-sm text-[#38523b]">{workout.frequency}</strong></div><div className="rounded-xl bg-[#f3f8ef] p-3"><p className="text-xs text-[#819080]">{thai ? "ระยะเวลา" : "Duration"}</p><strong className="mt-1 block text-sm text-[#38523b]">{workout.duration}</strong></div></div><div className="mt-5 space-y-3">{workout.options.map((option) => <div className="rounded-2xl border border-[#e0eadc] p-4" key={option.name}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-[#38523b]">{option.name}</h3><span className="rounded-full bg-[#f5f8f2] px-2.5 py-1 text-xs font-semibold text-[#6e866c]">{option.sets}</span></div><p className="mt-2 text-sm leading-6 text-[#687568]">{option.details}</p></div>)}</div><p className="mt-5 rounded-xl border border-[#e5ddc8] bg-[#fffaf0] p-4 text-xs leading-5 text-[#806c50]"><strong>{thai ? "ความปลอดภัย: " : "Safety: "}</strong>{workout.safety}</p></article></section>;
}

function BodyCompositionGuide({ language, bmi }) {
  const thai = language === "th";
  return <section className="scroll-section mt-8 grid gap-5 rounded-[28px] border border-[#dfe8d9] bg-[#fffdf7] p-6 sm:p-8 lg:grid-cols-[.9fr_1.1fr]">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c08c43]">{thai ? "เข้าใจร่างกายมากขึ้น" : "READ YOUR BODY"}</p>
      <h2 className="mt-2 text-2xl font-semibold text-[#193c2d]">{thai ? "น้ำหนักเท่ากัน ไม่ได้แปลว่าองค์ประกอบเหมือนกัน" : "Same weight, different body composition"}</h2>
      <p className="mt-4 text-sm leading-7 text-[#69786b]">{thai ? "BMI ใช้น้ำหนักและส่วนสูง จึงแยกกล้ามเนื้อออกจากไขมันไม่ได้ ลองดูโมเดลตัวอย่างนี้เพื่อเข้าใจว่าควรดูข้อมูลหลายด้านร่วมกัน" : "BMI uses weight and height, so it cannot separate muscle from fat. Use this example to understand why several measures matter."}</p>
      <div className="mt-5 rounded-2xl bg-[#f5f0e5] p-4 text-sm text-[#665b4c]">{thai ? `ผลของคุณตอนนี้ BMI ${bmi.toFixed(1)} เป็นจุดเริ่มต้นสำหรับการดูแนวโน้ม ไม่ใช่คำตัดสินรูปร่าง` : `Your current BMI is ${bmi.toFixed(1)}. Use it as a trend marker, not a verdict.`}</div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <CompositionModel title={thai ? "โมเดล A · กล้ามเนื้อมาก" : "Model A · More muscle"} weight="75 kg" fat="14%" muscle="48%" color="#719d55" language={language} />
      <CompositionModel title={thai ? "โมเดล B · ไขมันมากกว่า" : "Model B · More fat"} weight="75 kg" fat="28%" muscle="34%" color="#d08a52" language={language} />
    </div>
    <p className="text-xs leading-5 text-[#665b4c] lg:col-span-2">{thai ? "ตัวเลขและภาพเป็นตัวอย่างเพื่อการศึกษา ไม่ใช่การวัดร่างกายจริง หากต้องการความแม่นยำควรประเมินโดยผู้เชี่ยวชาญ" : "Figures and visuals are educational examples, not your actual measurements. Consult a professional for accurate assessment."}</p>
  </section>;
}

function CompositionModel({ title, weight, fat, muscle, color, language }) {
  const reducedMotion = useReducedMotion() ?? false;
  const barTransition = reducedMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut" };
  const labels = contentCopy[language];
  return <article className="rounded-2xl border border-[#e8e2d4] bg-white p-4"><div className="flex items-center gap-3"><div className="grid size-14 shrink-0 place-items-center rounded-full text-3xl" style={{ backgroundColor: `${color}20` }}>◉</div><div><h3 className="text-sm font-bold text-[#354b38]">{title}</h3><p className="mt-1 text-lg font-semibold text-[#193c2d]">{weight}</p></div></div><div className="mt-4 space-y-3 text-xs text-[#6d776c]"><div><div className="mb-1 flex justify-between"><span>{labels.bodyFat}</span><strong>{fat}</strong></div><div className="model-bar"><motion.span initial={reducedMotion ? { width: fat } : { width: 0 }} whileInView={{ width: fat }} viewport={{ once: true }} transition={barTransition} style={{ backgroundColor: color }} /></div></div><div><div className="mb-1 flex justify-between"><span>{labels.muscleMass}</span><strong>{muscle}</strong></div><div className="model-bar"><motion.span initial={reducedMotion ? { width: muscle } : { width: 0 }} whileInView={{ width: muscle }} viewport={{ once: true }} transition={barTransition} style={{ backgroundColor: "#91b86a" }} /></div></div></div></article>;
}

function AdminPanel({ admin, language }) {
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState("");
  const thai = language === "th";

  useEffect(() => {
    fetch(`${API_URL}/users`, { headers: { "x-user-id": admin._id } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ")))
      .then(setUsers)
      .catch((error) => setNotice(error.message));
  }, [admin._id]);

  function changeUser(id, field, value) {
    setUsers((current) => current.map((user) => user._id === id ? { ...user, [field]: value } : user));
  }

  async function saveUser(user) {
    try {
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": admin._id },
        body: JSON.stringify({ username: user.username, email: user.email, role: user.role }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.message || (thai ? "บันทึกไม่สำเร็จ" : "Could not save changes");
        setNotice(errorMessage);
        toast.error(errorMessage);
        return;
      }
      setUsers((current) => current.map((item) => item._id === data._id ? data : item));
      setNotice(thai ? "บันทึกข้อมูลผู้ใช้แล้ว" : "User updated");
      toast.success(thai ? "บันทึกข้อมูลผู้ใช้แล้ว" : "User updated");
    } catch (error) {
      const errorMessage = error.message.includes("Failed to fetch")
        ? (thai ? "เชื่อมต่อ server ไม่ได้" : "Could not connect to the server")
        : error.message;
      setNotice(errorMessage);
      toast.error(errorMessage);
    }
  }

  return <section className="mt-14 rounded-[28px] border border-[#8cae55] bg-[#17251e] p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,.2)] sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#cbe78b]">ADMIN CONTROL</p><h2 className="mt-2 text-2xl font-semibold">{thai ? "จัดการบัญชีผู้ใช้" : "User management"}</h2></div><span className="rounded-full bg-[#cbe78b] px-3 py-1.5 text-xs font-bold text-[#193c2d]">{users.length} users</span></div>{notice && <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm text-[#d9f18b]">{notice}</p>}<div className="mt-6 grid gap-3">{users.map((user) => <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_1.2fr_140px_110px_80px] lg:items-center" key={user._id}><input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#cbe78b]" value={user.username} onChange={(event) => changeUser(user._id, "username", event.target.value)} aria-label="Username" /><input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#cbe78b]" value={user.email} onChange={(event) => changeUser(user._id, "email", event.target.value)} aria-label="Email" /><select className="rounded-lg border border-white/10 bg-[#263c30] px-3 py-2 text-sm text-white outline-none focus:border-[#cbe78b]" value={user.role} onChange={(event) => changeUser(user._id, "role", event.target.value)} aria-label="Role"><option value="user">user</option><option value="admin">admin</option></select><span className="text-xs text-[#a9baa9]">{new Date(user.createdAt).toLocaleDateString()}</span><button type="button" onClick={() => saveUser(user)} className="rounded-lg bg-[#cbe78b] px-3 py-2 text-sm font-bold text-[#193c2d] transition hover:bg-white">{thai ? "บันทึก" : "Save"}</button></div>)}</div></section>;
}
