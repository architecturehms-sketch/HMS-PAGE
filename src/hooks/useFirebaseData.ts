import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { carouselData } from '../app/data';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  img: string;
  order?: number;
  createdAt?: any;
  nameEn?: string;
  roleEn?: string;
  specializations?: string;
  educationKr?: string;
  educationEn?: string;
  careerKr?: string;
  careerEn?: string;
  recordKr?: string;
  recordEn?: string;
}

export interface Project {
  id: string | number;
  isLogo?: boolean;
  img: string;
  title: string;
  desc: string;
  year: string;
  createdAt?: any;
  order?: number;
  detailImages?: string[];
  content?: string;
  showInCarousel?: boolean;
  carouselOnly?: boolean;
  videoUrl?: string;
  videoUrl2?: string;
  location?: string;
  status?: string;
  client?: string;
  siteArea?: string;
  totalFloorArea?: string;
  scale?: string;
}

export interface PageData {
  about: string;
  contactEmail: string;
  address: string;
  clientLogos?: string[];
  customCategories?: string[];
  categoryProjectOrders?: { [category: string]: string[] };
}

const defaultPageData: PageData = {
  about: "HMS Architecture is a brutalist-inspired firm focusing on the dialogue between raw materials and human experience.",
  contactEmail: "hmsarch.com",
  address: "Seoul, KR",
  clientLogos: [],
  customCategories: [],
  categoryProjectOrders: {},
};

export interface MapLocation {
  id: string;
  name: string;
  subtitle?: string;
  category?: string;
  status?: string;
  coordinates: [number, number];
  createdAt?: any;
}

const defaultLocations: MapLocation[] = [
  { id: '1', name: 'SEOUL', coordinates: [126.9780, 37.5665] },
  { id: '2', name: 'TOKYO', coordinates: [139.6917, 35.6895] },
  { id: '3', name: 'NEW YORK', coordinates: [-74.0060, 40.7128] },
  { id: '4', name: 'LONDON', coordinates: [-0.1276, 51.5072] },
  { id: '5', name: 'PARIS', coordinates: [2.3522, 48.8566] },
  { id: '6', name: 'SINGAPORE', coordinates: [103.8198, 1.3521] },
];

export function useFirebaseData() {
  const [projects, setProjects] = useState<Project[]>([]); // 빈 배열로 초기화하여 로딩 중 더미 이미지가 뜨지 않도록 수정
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [pageData, setPageData] = useState<PageData>(defaultPageData);
  const [locations, setLocations] = useState<MapLocation[]>(defaultLocations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Projects (실시간)
    const q = collection(db, 'projects');
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        // Client-side sorting
        fetchedProjects.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999999;
          const orderB = b.order !== undefined ? b.order : 999999;
          if (orderA !== orderB) return orderA - orderB;
          
          // Fallback to createdAt desc
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setProjects(fetchedProjects);
      } else {
        setProjects([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      // 권한 없거나 DB 없을 땐 기본 데이터 유지
      setLoading(false);
    });

    // 2. Fetch Page Data (실시간)
    const unsubscribePageData = onSnapshot(doc(db, 'settings', 'pageData'), (docSnap) => {
      if (docSnap.exists()) {
        setPageData(docSnap.data() as PageData);
      }
    }, (error) => {
      console.error("Error fetching page data: ", error);
    });

    // 3. Fetch Team (실시간)
    const qTeam = collection(db, 'team');
    const unsubscribeTeam = onSnapshot(qTeam, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedTeam = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        
        fetchedTeam.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999999;
          const orderB = b.order !== undefined ? b.order : 999999;
          if (orderA !== orderB) return orderA - orderB;
          
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setTeam(fetchedTeam);
      } else {
        setTeam([]);
      }
    }, (error) => {
      console.error("Error fetching team: ", error);
    });

    // 4. Fetch Locations (실시간)
    const qLocations = collection(db, 'locations');
    const unsubscribeLocations = onSnapshot(qLocations, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedLocations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MapLocation[];
        setLocations(fetchedLocations);
      } else {
        setLocations(defaultLocations);
      }
    }, (error) => {
      console.error("Error fetching locations: ", error);
    });

    return () => {
      unsubscribeProjects();
      unsubscribePageData();
      unsubscribeTeam();
      unsubscribeLocations();
    };
  }, []);

  return { projects, pageData, team, locations, loading };
}
