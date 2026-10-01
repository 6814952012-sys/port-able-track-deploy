const BMI_CATEGORIES = [
  {
    key: "underweight",
    label: "น้ำหนักน้อย",
    min: 0,
    max: 18.5,
    exercise: [
      "ฝึกแรงต้าน 2-3 วันต่อสัปดาห์ โดยเพิ่มความหนักทีละน้อย",
      "เดินเร็วหรือปั่นจักรยานเบา ๆ 150 นาทีต่อสัปดาห์ตามความพร้อม",
      "รับประทานอาหารให้เพียงพอ และหยุดพักเมื่อมีอาการเวียนศีรษะหรืออ่อนแรง",
    ],
    nutrition: { focus: "เพิ่มพลังงานและโปรตีนอย่างมีคุณภาพ", eat: ["ข้าวกล้อง มันหวาน ขนมปังโฮลวีต", "ไข่ ปลา ไก่ไม่ติดหนัง เต้าหู้ และถั่ว", "นม โยเกิร์ตไม่หวาน และผลไม้เพิ่มในมื้อว่าง"], limit: ["อาหารเสริมเพิ่มน้ำหนักที่ไม่ทราบส่วนผสม", "เครื่องดื่มหวานและอาหารทอดเป็นแหล่งพลังงานหลัก"] },
    workoutPlan: { frequency: "2-3 วัน/สัปดาห์", duration: "30-45 นาที/ครั้ง", options: [{ name: "Full-body strength", details: "Squat, wall push-up, row ด้วยยางยืด, glute bridge", sets: "2 เซ็ต x 8-12 ครั้ง" }, { name: "Low-impact cardio", details: "เดินเร็วหรือปั่นจักรยานระดับพูดเป็นประโยคได้", sets: "15-25 นาที" }], safety: "เพิ่มความหนักช้า ๆ และหยุดทันทีเมื่อเวียนศีรษะ เจ็บหน้าอก หรือหายใจผิดปกติ" },
  },
  {
    key: "healthy",
    label: "น้ำหนักปกติ",
    min: 18.5,
    max: 23,
    exercise: [
      "ทำกิจกรรมแอโรบิกระดับปานกลางอย่างน้อย 150 นาทีต่อสัปดาห์",
      "ฝึกกล้ามเนื้อทุกส่วนอย่างน้อย 2 วันต่อสัปดาห์",
      "สลับกิจกรรม เช่น เดินเร็ว ว่ายน้ำ ปั่นจักรยาน และฝึกการทรงตัว",
    ],
    nutrition: { focus: "กินให้หลากหลายและรักษาสมดุล", eat: ["ผักและผลไม้หลากสีให้ได้ประมาณครึ่งจาน", "โปรตีนไม่ติดมัน เช่น ปลา ไข่ ถั่ว และเต้าหู้", "ธัญพืชไม่ขัดสีและน้ำเปล่าเป็นหลัก"], limit: ["อาหารที่มีน้ำตาล เกลือ หรือไขมันอิ่มตัวสูง", "การกินมื้อใหญ่เกินความหิวและเครื่องดื่มแคลอรีสูง"] },
    workoutPlan: { frequency: "อย่างน้อย 5 วัน/สัปดาห์", duration: "แอโรบิก 150 นาที/สัปดาห์ + แรงต้าน 2 วัน", options: [{ name: "Cardio", details: "เดินเร็ว วิ่งเบา ว่ายน้ำ หรือปั่นจักรยาน", sets: "30 นาที x 5 วัน" }, { name: "Strength & mobility", details: "Squat, push-up, row, plank และยืดสะโพก", sets: "2-3 เซ็ต x 8-12 ครั้ง" }], safety: "เริ่มจากระดับที่ทำได้ต่อเนื่อง และเว้นวันพักเมื่อกล้ามเนื้อล้า" },
  },
  {
    key: "overweight",
    label: "น้ำหนักเกิน",
    min: 23,
    max: 25,
    exercise: [
      "เริ่มจากเดินเร็วหรือกิจกรรมแรงกระแทกต่ำ 30 นาทีต่อวัน",
      "เพิ่มการฝึกแรงต้าน 2 วันต่อสัปดาห์เพื่อรักษามวลกล้ามเนื้อ",
      "เพิ่มระยะเวลาและความหนักทีละน้อย โดยเลือกกิจกรรมที่ทำต่อเนื่องได้",
    ],
    nutrition: { focus: "ลดพลังงานส่วนเกินโดยไม่ตัดอาหารจนเกินไป", eat: ["ผักครึ่งจาน โปรตีนไม่ติดมันหนึ่งส่วน และข้าวไม่ขัดสีในปริมาณพอดี", "ผลไม้ทั้งผลแทนน้ำผลไม้หรือขนมหวาน", "น้ำเปล่าและอาหารทำเองที่ควบคุมซอสได้"], limit: ["น้ำหวาน ชานม ขนม และแอลกอฮอล์", "อาหารทอด อาหารแปรรูป และการเติมซอสเค็ม/หวานมาก"] },
    workoutPlan: { frequency: "4-5 วัน/สัปดาห์", duration: "30-45 นาที/ครั้ง", options: [{ name: "Low-impact cardio", details: "เดินเร็ว ปั่นจักรยาน หรือ elliptical", sets: "30 นาที x 3-5 วัน" }, { name: "Strength circuit", details: "Sit-to-stand, wall push-up, band row, step-up", sets: "2-3 รอบ x 8-12 ครั้ง" }], safety: "ใช้รองเท้าที่เหมาะสมและเพิ่มเวลาครั้งละไม่เกิน 5-10 นาที หากปวดข้อให้เปลี่ยนเป็นกิจกรรมในน้ำ" },
  },
  {
    key: "obesity",
    label: "โรคอ้วน",
    min: 25,
    max: Number.POSITIVE_INFINITY,
    exercise: [
      "เริ่มจากกิจกรรมแรงกระแทกต่ำ เช่น เดินในน้ำ ปั่นจักรยานอยู่กับที่ หรือเดินสั้น ๆ",
      "แบ่งกิจกรรมเป็นช่วงละ 5-10 นาที แล้วค่อยสะสมให้มากขึ้นในแต่ละสัปดาห์",
      "ปรึกษาแพทย์หรือนักกายภาพก่อนเริ่มโปรแกรมหนัก โดยเฉพาะเมื่อมีโรคประจำตัว",
    ],
    nutrition: { focus: "สร้างพฤติกรรมที่ทำต่อเนื่องได้และดูแลโรคร่วม", eat: ["ผัก โปรตีนไม่ติดมัน ถั่ว และธัญพืชไม่ขัดสี", "แบ่งมื้อให้พอดี ใช้จานขนาดเหมาะสม และดื่มน้ำเปล่า", "จดอาหารและความหิวเพื่อเห็นรูปแบบการกินของตัวเอง"], limit: ["เครื่องดื่มหวาน อาหารทอด และอาหารแปรรูปเค็มจัด", "การอดอาหารรุนแรงหรือยาลดน้ำหนักที่ไม่ได้รับคำแนะนำ"] },
    workoutPlan: { frequency: "เริ่ม 3-5 วัน/สัปดาห์", duration: "เริ่ม 5-10 นาที สะสมไป 30 นาที/วัน", options: [{ name: "Gentle cardio", details: "เดินสั้น ๆ หลายช่วง ปั่นจักรยานอยู่กับที่ หรือเดินในน้ำ", sets: "5-10 นาที x 2-3 ช่วง" }, { name: "Supported strength", details: "ลุกนั่งจากเก้าอี้ wall push-up, heel raise, band row", sets: "1-2 เซ็ต x 8-10 ครั้ง" }], safety: "ควรปรึกษาแพทย์ก่อนเริ่ม หากมีโรคหัวใจ เบาหวาน ปวดข้อ หรือหายใจลำบาก และหยุดเมื่อมีอาการผิดปกติ" },
  },
];

const REFERENCES = [
  {
    title: "WHO: Physical activity",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
  },
  {
    title: "CDC: Adult BMI categories",
    url: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
  },
  {
    title: "WHO: BMI in Asian populations",
    url: "https://iris.who.int/handle/10665/206936",
  },
];

function calculateBmi(weight, height) {
  const numericWeight = Number(weight);
  const numericHeight = Number(height);
  if (!Number.isFinite(numericWeight) || !Number.isFinite(numericHeight) || numericWeight <= 0 || numericHeight <= 0) {
    throw new Error("Weight and height must be positive numbers");
  }
  return Number((numericWeight / ((numericHeight / 100) ** 2)).toFixed(1));
}

function getBmiCategory(bmi) {
  const category = BMI_CATEGORIES.find((item) => bmi >= item.min && bmi < item.max);
  if (!category) throw new Error("BMI must be a valid number");
  return category;
}

function getRecommendation(bmi) {
  const category = getBmiCategory(Number(bmi));
  return {
    category: category.label,
    categoryKey: category.key,
    exercise: category.exercise,
    nutrition: category.nutrition,
    workoutPlan: category.workoutPlan,
    references: REFERENCES,
    disclaimer: "คำแนะนำนี้เป็นข้อมูลทั่วไป ไม่ใช่การวินิจฉัยหรือแผนการรักษาเฉพาะบุคคล",
  };
}

module.exports = { BMI_CATEGORIES, REFERENCES, calculateBmi, getBmiCategory, getRecommendation };