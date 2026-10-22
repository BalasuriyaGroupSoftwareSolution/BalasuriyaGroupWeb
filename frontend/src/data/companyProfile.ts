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
    name: "Eng. Sanjeewa Wickramaratne",
    role: "Project Director, Apex Commercial Developments",
    text: "Balasuriya Construction delivered our multi-storey commercial facility on schedule and beyond expectations. Their engineering rigor and transparent progress tracking are exemplary.",
  },
  {
    name: "Dr. K. M. Rizwan",
    role: "Corporate Traveler & Delegate",
    text: "Our international conference travel and family leisure tours were coordinated flawlessly by Balasuriya Tourism. Punctual airport transfers, premium accommodations, and zero hassle.",
  },
  {
    name: "Samantha Perera",
    role: "Senior Operations Lead, Global Logistics Ltd",
    text: "Booking international flights and urgent visas through the Balasuriya Air Ticketing desk is effortless. Exceptional response times, verified itineraries, and 24/7 client support.",
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
    name: "Migara Fonseka",
    role: "Head of Construction & Engineering",
    departmentScope: "Construction & Engineering",
    image: "migara.jpg",
  },
  {
    name: "Pasindu Hansana",
    role: "Head of Software & Aviation Tech Lead",
    departmentScope: "Software Solutions & Aviation Technology",
    image: "pasindu.jpg",
  },
  {
    name: "Shenal Fernando",
    role: "Head of Air Ticketing & Global Desk",
    departmentScope: "Air Ticketing & Global Bureau",
    image: "shenal.jpg",
  },
  {
    name: "Kevin",
    role: "Software Leadership & Architecture",
    departmentScope: "Software Solutions",
    image: "kevin.jpg",
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
    id: "construction",
    title: "Construction & Engineering Operational Leadership",
    description: "Civil execution, structural engineering, supply chain logistics, and turnkey site development across Sri Lanka.",
    members: [
      {
        name: "Migara Fonseka",
        role: "Head of Construction & Engineering",
        image: "migara.jpg",
      },
    ],
  },
  {
    id: "software",
    title: "Software Solutions & Technology Leadership",
    description: "Enterprise cloud architecture, custom web platforms, mobile engineering, and corporate IT automation.",
    members: [
      {
        name: "Pasindu Hansana",
        role: "Head of Software & Aviation Tech Lead",
        image: "pasindu.jpg",
      },
      {
        name: "Kevin",
        role: "Software Leadership & Architecture",
        image: "kevin.jpg",
      },
    ],
  },
  {
    id: "air-ticketing",
    title: "Air Ticketing & Global Bureau Leadership",
    description: "IATA flight ticketing, tourist and business visa assistance, GDS routing, and dedicated pre-embassy revision desk.",
    members: [
      {
        name: "Shenal Fernando",
        role: "Head of Air Ticketing & Global Desk",
        image: "shenal.jpg",
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
