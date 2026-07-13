import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { carouselData } from '../app/data';

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
}

export interface PageData {
  about: string;
  contactEmail: string;
  address: string;
}

const defaultPageData: PageData = {
  about: "HMS Architecture is a brutalist-inspired firm focusing on the dialogue between raw materials and human experience.",
  contactEmail: "hello@hms-architecture.com",
  address: "Seoul, KR",
};

export function useFirebaseData() {
  const [projects, setProjects] = useState<Project[]>(carouselData); // 기본값은 mock data (안전망)
  const [pageData, setPageData] = useState<PageData>(defaultPageData);
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

    return () => {
      unsubscribeProjects();
      unsubscribePageData();
    };
  }, []);

  return { projects, pageData, loading };
}
