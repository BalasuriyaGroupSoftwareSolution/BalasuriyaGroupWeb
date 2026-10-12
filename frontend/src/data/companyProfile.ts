// Real company facts carried over from the previous site — edit here any time.
export const companyStats = {
  yearsExperience: 2,
  projectsDone: 15,
  sectors: 4,
  customerFocusPercent: 98,
};

export const companyVision =
  "To be Sri Lanka’s most trusted multi-industry group—shaping the nation’s technology, infrastructure, and tourism sectors to connect people, spaces, and opportunities with the world";

export const companyMission =
  "Driven by integrity and operational excellence, we empower possibilities and build tomorrow across Sri Lanka and beyond—delivering intelligent software, enduring construction, and seamless global travel experiences";

export const contactInfo = {
  address: "54, Andiambalama, Sri Lanka",
  phone: "+94 76 7171 938",
  whatsapp: "https://wa.me/94767171938",
  email: "info@balasuriyagroup.lk",
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
  image: string;
  email?: string;
  linkedin?: string;
}

export const directors: TeamMember[] = [
  {
    name: "Mr. Clemon Balasuriya",
    role: "Chief Executive Officer (CEO)",
    image: "clemon-balasuriya.jpg",
    email: "avishkaclemon@gmail.com",
    linkedin:
      "https://www.linkedin.com/in/clemon-balasuriya-05518b256",
  },
  {
    name: "Mr. Damian Balasuriya",
    role: "Managing Director (MD)",
    image: "damian-balasuriya.jpg",
    email: "damianbalasuriyagroup@gmail.com",
    linkedin:
      "https://www.linkedin.com/in/damian-balasuriya-578a72358",
  },
  {
    name: "Mr. Clavo Balasuriya",
    role: "Executive Director",
    image: "clavo-balasuriya.jpg",
    email: "clavobalasuriyagroup@gmail.com",
  },
  {
    name: "Dr. Christina Jayamaha",
    role: "Director",
    image: "christina-jayamaha.jpg",
    email: "christinabalasuriyagroup@gmail.com",
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
    title: "Construction Division",
    description: "End-to-end construction projects with planning precision and trusted delivery standards.",
    members: [
      {
        name: "Mr. Migara Fonseka",
        role: "Division Leader",
        image: "migara-fonseka.jpg",
        email: "Malindamfonseka@gmail.com",
        linkedin: "https://www.linkedin.com/in/migara-fonseka-b12134236",
      },
      {
        name: "Mr. Pasindu Manjitha",
        role: "Logistics & Workforce Management",
        image: "pasindu-manjitha.jpg",
        email: "radm.pasindu@gmail.com",
        linkedin: "https://www.linkedin.com/in/pasindu-manjitha-9b1072237",
      },
    ],
  },
  {
    id: "tourism",
    title: "Tourism & Air Ticketing Division",
    description: "Personalized travel consulting, tour planning, visa assistance, and air ticket booking.",
    members: [
      {
        name: "Mr. Damian Balasuriya",
        role: "Division Leader",
        image: "damian-balasuriya.jpg",
        email: "damianbalasuriyagroup@gmail.com",
        linkedin: "https://www.linkedin.com/in/damian-balasuriya-578a72358",
      },
      {
        name: "Mr. Clavo Balasuriya",
        role: "Air Ticketing Lead",
        image: "clavo-balasuriya.jpg",
        email: "clavobalasuriyagroup@gmail.com",
      },
    ],
  },
  {
    id: "software",
    title: "Software Engineering Division",
    description: "Modern software engineering, scalable architecture, and agile product execution — coming soon.",
    members: [
      {
        name: "Mr. Clemon Balasuriya",
        role: "Division Leader",
        image: "clemon-balasuriya.jpg",
        email: "avishkaclemon@gmail.com",
        linkedin: "https://www.linkedin.com/in/clemon-balasuriya-05518b256",
      },
      {
        name: "Mr. Shenal Fonseka",
        role: "Software Engineer",
        image: "shenal-fonseka.jpg",
        email: "hianthony218@gmail.com",
        linkedin: "https://www.linkedin.com/in/shenal-fonseka-15a353263",
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
