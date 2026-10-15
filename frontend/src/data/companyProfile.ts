// Real company facts carried over from the previous site — edit here any time.
export const companyStats = {
  yearsExperience: 2,
  projectsDone: 15,
  sectors: 4,
  customerFocusPercent: 98,
};

export const companyVision =
  "To be Sri Lanka’s most trusted multi-industry group, shaping the nation’s technology, infrastructure, and tourism sectors to connect people, spaces, and opportunities with the world";

export const companyMission =
  "Driven by integrity and operational excellence, we empower possibilities and build tomorrow across Sri Lanka and beyond, delivering intelligent software, enduring construction, and seamless global travel experiences";

export const contactInfo = {
  address: "54, Andiambalama, Sri Lanka",
  phone: "+94 76 7171 938",
  whatsapp: "https://wa.me/94767171938",
  email: "balasuriyagroup.info@gmail.com",
};

export const testimonials = [
  {
    name: "Ranil Wickramasinghe",
    role: "CEO, Lanka Ventures",
    text: "Balasuriya Construction delivered our headquarters on time and beyond expectations. Their attention to detail is remarkable.",
  },
  {
    name: "Mohamed Rizwan",
    role: "Travel Enthusiast",
    text: "Best travel agency in Sri Lanka! They planned our entire family vacation perfectly.",
  },
  {
    name: "Samantha Perera",
    role: "Business Traveler",
    text: "Booking flights through Balasuriya is effortless. Great deals and excellent customer service every time.",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  departmentScope?: string;
  image: string;
  email?: string;
  linkedin?: string;
}

// Executive Leadership (Board / Shareholders / Top Executives)
export const directors: TeamMember[] = [
  {
    name: "Clemon Balasuriya",
    role: "CEO",
    departmentScope: "Software & Solutions & Construction",
    image: "clemon-balasuriya.jpg",
    email: "clemonbalasuriyagroup@gmail.com",
    linkedin: "https://www.linkedin.com/in/clemon-balasuriya-05518b256",
  },
  {
    name: "Damian Balasuriya",
    role: "MD",
    departmentScope: "Strategy, Marketing & Expansion",
    image: "damian-balasuriya.jpg",
    email: "damianbalasuriyagroup@gmail.com",
    linkedin: "https://www.linkedin.com/in/damian-balasuriya-578a72358",
  },
  {
    name: "Clavo Balasuriya",
    role: "ED & Company Secretary",
    departmentScope: "Finance, HR, Legal & Corporate Affairs",
    image: "clavo-balasuriya.jpg",
    email: "clavobalasuriyagroup@gmail.com",
  },
  {
    name: "Christina Balasuriya",
    role: "Director & Shareholder",
    departmentScope: "Governance & Shareholder Oversight",
    image: "christina-jayamaha.jpg",
    email: "christinabalasuriyagroup@gmail.com",
  },
];

// Division Heads & Operational Leaders (without email addresses, per specification)
export const operationalLeaders: TeamMember[] = [
  {
    name: "Kevin",
    role: "Software Leadership",
    departmentScope: "Software & Solutions",
    image: "kevin.jpg",
  },
  {
    name: "Shenal",
    role: "Software Operations & Marketing Execution",
    departmentScope: "Software & Solutions",
    image: "shenal.jpg",
  },
  {
    name: "Migara",
    role: "Construction Leadership",
    departmentScope: "Construction",
    image: "migara.jpg",
  },
  {
    name: "Pasindu",
    role: "Construction Logistics & Marketing Execution",
    departmentScope: "Construction",
    image: "pasindu.jpg",
  },
];

export interface Department {
  id: string;
  title: string;
  description: string;
  members: TeamMember[];
}

export const departments: Department[] = [
  {
    id: "software",
    title: "Software & Solutions Operational Leadership",
    description: "Enterprise software architecture, product engineering, scalable cloud operations, and marketing execution.",
    members: [
      {
        name: "Kevin",
        role: "Software Leadership",
        image: "kevin.jpg",
      },
      {
        name: "Shenal",
        role: "Software Operations & Marketing Execution",
        image: "shenal.jpg",
      },
    ],
  },
  {
    id: "construction",
    title: "Construction Operational Leadership",
    description: "Site execution, structural engineering, supply chain logistics, and marketing execution across Sri Lanka.",
    members: [
      {
        name: "Migara",
        role: "Construction Leadership",
        image: "migara.jpg",
      },
      {
        name: "Pasindu",
        role: "Construction Logistics & Marketing Execution",
        image: "pasindu.jpg",
      },
    ],
  },
];

export const companyValues = [
  "Innovation",
  "Leadership",
  "Integrity",
  "Customer Satisfaction",
  "Teamwork",
  "Excellence",
];
