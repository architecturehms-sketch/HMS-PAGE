import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Edit2, Trash2, Save, Image as ImageIcon, LayoutDashboard, FileText, Settings, Database, LogOut, GripVertical } from 'lucide-react';
import { auth, db, storage } from '../../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Project, PageData, TeamMember, MapLocation } from '../../hooks/useFirebaseData';
import { carouselData } from '../data';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  PROJECT: 'project',
  TEAM: 'team',
  CATEGORY: 'category',
};

interface DraggableProjectRowProps {
  project: Project;
  index: number;
  moveProject: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string | number) => void;
}

function DraggableProjectRow({ project, index, moveProject, onEdit, onDelete }: DraggableProjectRowProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.PROJECT,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) {
        return;
      }
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      moveProject(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PROJECT,
    item: () => {
      return { id: project.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      data-handler-id={handlerId} 
      className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f4f4f0]/5 transition-colors text-sm ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="col-span-1 flex items-center gap-2 text-[#f4f4f0]/40 text-xs">
        <GripVertical size={14} className="cursor-move text-[#f4f4f0]/20 hover:text-white shrink-0" />
        <span className="truncate w-full block">{project.id}</span>
      </div>
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#111] border border-[#f4f4f0]/20 shrink-0 overflow-hidden flex items-center justify-center">
          {project.img && !project.isLogo ? (
            <img src={project.img} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[8px] opacity-50">LOGO</span>
          )}
        </div>
        <span className="font-sans font-medium truncate">{project.title}</span>
      </div>
      <div className="col-span-3 text-[#f4f4f0]/60 text-xs uppercase tracking-wider truncate">{project.desc}</div>
      <div className="col-span-2 text-[#f4f4f0]/60 text-xs truncate">{project.year}</div>
      <div className="col-span-2 flex justify-end gap-2">
        <button onClick={() => onEdit(project)} className="p-2 hover:bg-[#f4f4f0]/20 transition-colors rounded text-[#f4f4f0]/80 hover:text-white">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(project.id)} className="p-2 hover:bg-red-500/20 transition-colors rounded text-[#f4f4f0]/80 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface DraggableTeamRowProps {
  member: TeamMember;
  index: number;
  moveMember: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

function DraggableTeamRow({ member, index, moveMember, onEdit, onDelete }: DraggableTeamRowProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.TEAM,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      moveMember(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TEAM,
    item: () => ({ id: member.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      data-handler-id={handlerId} 
      className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f4f4f0]/5 transition-colors text-sm ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="col-span-1 flex items-center gap-2 text-[#f4f4f0]/40 text-xs">
        <GripVertical size={14} className="cursor-move text-[#f4f4f0]/20 hover:text-white shrink-0" />
      </div>
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#111] border border-[#f4f4f0]/20 shrink-0 overflow-hidden flex items-center justify-center">
          {member.img ? (
            <img src={member.img} alt="" className="w-full h-full object-cover grayscale mix-blend-luminosity" />
          ) : (
            <span className="text-[8px] opacity-50">IMG</span>
          )}
        </div>
        <span className="font-sans font-medium truncate">{member.name}</span>
      </div>
      <div className="col-span-5 text-[#f4f4f0]/60 text-xs uppercase tracking-wider truncate">{member.role}</div>
      <div className="col-span-2 flex justify-end gap-2">
        <button onClick={() => onEdit(member)} className="p-2 hover:bg-[#f4f4f0]/20 transition-colors rounded text-[#f4f4f0]/80 hover:text-white">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(member.id)} className="p-2 hover:bg-red-500/20 transition-colors rounded text-[#f4f4f0]/80 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface DraggableCategoryRowProps {
  category: string;
  index: number;
  moveCategory: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (category: string) => void;
}

function DraggableCategoryRow({ category, index, moveCategory, onDelete }: DraggableCategoryRowProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CATEGORY,
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveCategory(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CATEGORY,
    item: () => ({ id: category, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));
  return (
    <div ref={ref} data-handler-id={handlerId} className={`flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border border-[#f4f4f0]/20 rounded-sm text-xs ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="cursor-move text-[#f4f4f0]/40 hover:text-white shrink-0" />
        <span className="uppercase tracking-widest">{category}</span>
      </div>
      <button onClick={() => onDelete(category)} type="button" className="text-red-400 hover:text-red-300 ml-2">
        <X size={12} />
      </button>
    </div>
  );
}

interface AdminDashboardProps {
  onClose: () => void;
  initialProjects: Project[];
  initialPageData: PageData;
  initialTeam: TeamMember[];
  initialLocations: MapLocation[];
}

const compressImage = (file: File, maxWidth = 1440): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/webp', 0.8);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    
    img.src = url;
  });
};

export function AdminDashboard({ onClose, initialProjects, initialPageData, initialTeam, initialLocations }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'team' | 'locations' | 'pages'>('dashboard');
  
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [locations, setLocations] = useState<MapLocation[]>(initialLocations || []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [currentTeamMember, setCurrentTeamMember] = useState<Partial<TeamMember>>({});
  const [currentLocation, setCurrentLocation] = useState<Partial<MapLocation>>({});
  
  const [pageData, setPageData] = useState<PageData>(initialPageData);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const projectCategories = Array.from(new Set(projects.flatMap(p => typeof p.desc === 'string' ? p.desc.split(',').map(c => c.trim()) : []))).filter(Boolean) as string[];
  const existingCategories = Array.from(new Set([...(pageData?.customCategories || []), ...projectCategories]));

  useEffect(() => {
    if (!hasUnsavedChanges) {
      setProjects(initialProjects);
    }
  }, [initialProjects, hasUnsavedChanges]);

  useEffect(() => {
    setPageData(initialPageData);
  }, [initialPageData]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number | 'video' | 'team' | 'clientLogo') => {
    let file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      file = await compressImage(file);
      const prefix = index === 'team' ? 'team' : index === 'clientLogo' ? 'logos' : 'projects';
      const storageRef = ref(storage, `${prefix}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      if (index === 'team') {
        setCurrentTeamMember({...currentTeamMember, img: url});
      } else if (index === 'video') {
        setEditingProject({...editingProject, videoUrl: url});
      } else if (index === 'clientLogo') {
        setPageData({...pageData, clientLogos: [...(pageData.clientLogos || []), url]});
      } else if (index !== undefined) {
        const newDetailImages = [...(editingProject.detailImages || ['', '', '', '', '', '', '', ''])];
        newDetailImages[index as number] = url;
        setEditingProject({...editingProject, detailImages: newDetailImages});
      } else {
        setEditingProject({...editingProject, img: url});
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Ensure Firebase Storage is enabled and rules allow write.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject.id) {
      setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
    } else {
      const newProject = {
        ...editingProject,
        id: `temp_${Date.now()}`
      };
      setProjects([newProject, ...projects]);
    }
    setEditingProject(null);
    setHasUnsavedChanges(true);
  };

  const handleDeleteProject = (id: string | number) => {
    setProjects(projects.filter(p => p.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTeamMember.id) {
      setTeam(team.map(t => t.id === currentTeamMember.id ? currentTeamMember as TeamMember : t));
    } else {
      const newMember = {
        ...currentTeamMember,
        id: `temp_${Date.now()}`
      } as TeamMember;
      setTeam([newMember, ...team]);
    }
    setIsEditingTeam(false);
    setCurrentTeamMember({});
    setHasUnsavedChanges(true);
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeam(team.filter(t => t.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation.name || currentLocation.coordinates?.[0] === undefined || currentLocation.coordinates?.[1] === undefined) return;
    
    if (currentLocation.id) {
      setLocations(locations.map(loc => loc.id === currentLocation.id ? currentLocation as MapLocation : loc));
    } else {
      setLocations([...locations, { ...currentLocation, id: Date.now().toString() } as MapLocation]);
    }
    
    setIsEditingLocation(false);
    setCurrentLocation({});
    setHasUnsavedChanges(true);
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(false);
    } catch (err) {
      setError(true);
      setPassword('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreDemoData = async () => {
    if (confirm("정말로 기본 데모 데이터를 복구하시겠습니까? (현재 파이어베이스에 추가됩니다)")) {
      setUploading(true);
      try {
        for (const item of carouselData) {
          await addDoc(collection(db, 'projects'), {
            isLogo: item.isLogo || false,
            img: item.img || "",
            title: item.title || "",
            desc: item.desc || "",
            year: item.year || "",
            createdAt: new Date().toISOString(),
            showInCarousel: true
          });
        }
        alert("데모 데이터가 성공적으로 복구되었습니다!");
      } catch (e) {
        console.error(e);
        alert("데이터 복구에 실패했습니다.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSavePageData = async () => {
    try {
      await setDoc(doc(db, 'settings', 'pageData'), pageData);
      alert('Page contents saved globally!');
    } catch (err) {
      console.error(err);
      alert('Failed to save page contents.');
    }
  };

  const moveProject = useCallback((dragIndex: number, hoverIndex: number) => {
    setProjects((prevProjects) => {
      const newProjects = [...prevProjects];
      const draggedProject = newProjects[dragIndex];
      newProjects.splice(dragIndex, 1);
      newProjects.splice(hoverIndex, 0, draggedProject);
      return newProjects;
    });
    setHasUnsavedChanges(true);
  }, []);

  const moveTeamMember = useCallback((dragIndex: number, hoverIndex: number) => {
    setTeam((prevTeam) => {
      const newTeam = [...prevTeam];
      const draggedMember = newTeam[dragIndex];
      newTeam.splice(dragIndex, 1);
      newTeam.splice(hoverIndex, 0, draggedMember);
      return newTeam;
    });
    setHasUnsavedChanges(true);
  }, []);

  const moveCategory = useCallback((dragIndex: number, hoverIndex: number) => {
    setPageData((prevPageData) => {
      const currentCats = [...existingCategories];
      const draggedCat = currentCats[dragIndex];
      currentCats.splice(dragIndex, 1);
      currentCats.splice(hoverIndex, 0, draggedCat);
      return { ...prevPageData, customCategories: currentCats };
    });
    setHasUnsavedChanges(true);
  }, [existingCategories]);

  const handleSaveChanges = async () => {
    setIsSavingChanges(true);
    try {
      const batch = writeBatch(db);
      
      const snapshot = await getDocs(collection(db, 'projects'));
      const dbIds = snapshot.docs.map(doc => doc.id);
      const localStringIds = projects
        .filter(p => typeof p.id === 'string' && !p.id.toString().startsWith('temp_'))
        .map(p => p.id as string);
      
      const toDelete = dbIds.filter(id => !localStringIds.includes(id));
      toDelete.forEach(id => {
        batch.delete(doc(db, 'projects', id));
      });

      projects.forEach((proj, index) => {
        const { id, ...projectData } = proj;
        if (typeof proj.id === 'string' && !proj.id.toString().startsWith('temp_')) {
          const docRef = doc(db, 'projects', proj.id);
          batch.set(docRef, { ...projectData, order: index }, { merge: true });
        } else {
          const newDocRef = doc(collection(db, 'projects'));
          batch.set(newDocRef, {
            ...projectData,
            createdAt: proj.createdAt || new Date().toISOString(),
            order: index
          });
        }
      });
      
      // Save Team changes
      const teamSnapshot = await getDocs(collection(db, 'team'));
      const dbTeamIds = teamSnapshot.docs.map(doc => doc.id);
      const localTeamIds = team
        .filter(t => typeof t.id === 'string' && !t.id.toString().startsWith('temp_'))
        .map(t => t.id);
      
      const toDeleteTeam = dbTeamIds.filter(id => !localTeamIds.includes(id));
      toDeleteTeam.forEach(id => {
        batch.delete(doc(db, 'team', id));
      });

      team.forEach((member, index) => {
        const { id, ...teamData } = member;
        if (typeof member.id === 'string' && !member.id.toString().startsWith('temp_')) {
          const docRef = doc(db, 'team', member.id);
          batch.set(docRef, { ...teamData, order: index }, { merge: true });
        } else {
          const newDocRef = doc(collection(db, 'team'));
          batch.set(newDocRef, {
            ...teamData,
            createdAt: member.createdAt || new Date().toISOString(),
            order: index
          });
        }
      });
      
      // Save Locations changes
      const locSnapshot = await getDocs(collection(db, 'locations'));
      const dbLocIds = locSnapshot.docs.map(doc => doc.id);
      const localLocIds = locations
        .filter(l => typeof l.id === 'string' && !l.id.toString().startsWith('temp_'))
        .map(l => l.id);
      
      const toDeleteLoc = dbLocIds.filter(id => !localLocIds.includes(id));
      toDeleteLoc.forEach(id => {
        batch.delete(doc(db, 'locations', id));
      });

      locations.forEach((loc) => {
        const { id, ...locData } = loc;
        if (typeof loc.id === 'string' && !loc.id.toString().startsWith('temp_')) {
          const docRef = doc(db, 'locations', loc.id);
          batch.set(docRef, locData, { merge: true });
        } else {
          const newDocRef = doc(collection(db, 'locations'));
          batch.set(newDocRef, {
            ...locData,
            createdAt: loc.createdAt || new Date().toISOString()
          });
        }
      });
      
      await batch.commit();
      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save changes.');
    } finally {
      setIsSavingChanges(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#1a1a1a] text-[#f4f4f0] flex flex-col items-center justify-center font-mono"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 hover:opacity-50 transition-opacity"
        >
          <X size={24} />
        </button>
        
        <div className="w-full max-w-sm p-8 border border-[#f4f4f0]/20 bg-[#111]">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2">Restricted Area</h2>
            <p className="text-xs text-[#f4f4f0]/50 tracking-widest uppercase">Authentication Required</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false); }}
                className={`w-full bg-transparent border ${error ? 'border-red-500' : 'border-[#f4f4f0]/30'} px-4 py-3 text-sm focus:outline-none focus:border-[#f4f4f0] tracking-widest`}
                placeholder="admin@example.com"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-transparent border ${error ? 'border-red-500' : 'border-[#f4f4f0]/30'} px-4 py-3 text-sm focus:outline-none focus:border-[#f4f4f0] tracking-[0.3em]`}
                placeholder="••••••••"
              />
              {error && <p className="text-xs text-red-500 text-center mt-2 uppercase tracking-widest">Authentication Failed</p>}
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-[#f4f4f0] text-[#1a1a1a] text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
            >
              Verify Identity
            </button>
          </form>
          <div className="mt-6 text-center text-[10px] text-[#f4f4f0]/30 uppercase tracking-widest">
            Firebase Auth is active
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#1a1a1a] text-[#f4f4f0] flex font-mono"
    >
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#f4f4f0]/20 flex flex-col h-full bg-[#111]">
        <div className="p-6 border-b border-[#f4f4f0]/20 flex justify-between items-center">
          <span className="text-xs uppercase tracking-[0.2em] font-bold">HMS Admin</span>
          <button onClick={onClose} className="hover:opacity-50 transition-opacity">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'dashboard' ? 'bg-[#f4f4f0] text-[#1a1a1a]' : 'hover:bg-[#f4f4f0]/10'}`}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'services' ? 'bg-[#f4f4f0] text-[#1a1a1a]' : 'hover:bg-[#f4f4f0]/10'}`}
          >
            <Database size={14} /> Projects & Services
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'team' ? 'bg-[#f4f4f0] text-[#1a1a1a]' : 'hover:bg-[#f4f4f0]/10'}`}
          >
            <Database size={14} /> Team (People)
          </button>
          <button 
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'locations' ? 'bg-[#f4f4f0] text-[#1a1a1a]' : 'hover:bg-[#f4f4f0]/10'}`}
          >
            <Database size={14} /> Map Locations
          </button>
          <button 
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'pages' ? 'bg-[#f4f4f0] text-[#1a1a1a]' : 'hover:bg-[#f4f4f0]/10'}`}
          >
            <FileText size={14} /> Page Contents
          </button>
        </nav>

        <div className="p-4 border-t border-[#f4f4f0]/20 flex justify-between items-center text-[10px] text-[#f4f4f0]/40 uppercase tracking-widest text-center">
          <span className="text-green-400">DB Connected</span>
          <button onClick={handleLogout} className="hover:text-white flex items-center gap-1 transition-colors">
            <LogOut size={12} /> EXIT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-[#1a1a1a]">
        <div className="p-8 md:p-12 max-w-5xl mx-auto">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Overview</h1>
                <p className="text-[#f4f4f0]/60 text-sm">Welcome to the HMS Architecture admin panel.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111]">
                  <div className="text-xs uppercase tracking-widest text-[#f4f4f0]/60 mb-4">Total Projects</div>
                  <div className="text-4xl font-sans font-light">{projects.length}</div>
                </div>
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111]">
                  <div className="text-xs uppercase tracking-widest text-[#f4f4f0]/60 mb-4">Active Pages</div>
                  <div className="text-4xl font-sans font-light">4</div>
                </div>
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111]">
                  <div className="text-xs uppercase tracking-widest text-[#f4f4f0]/60 mb-4">System Status</div>
                  <div className="text-sm font-sans text-green-400 mt-2">Frontend Mode Active</div>
                </div>
              </div>

              <div className="p-6 border border-[#f4f4f0]/20 bg-[#111] border-dashed">
                <h3 className="text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Database size={14} /> Database Integration Active
                </h3>
                <p className="text-xs text-[#f4f4f0]/60 leading-relaxed max-w-2xl mb-4 font-sans">
                  The backend database (Firebase Firestore) is now connected. Changes made to Projects and Page Contents are synchronized globally in real-time. Authentication is secured via Firebase Auth.
                </p>
              </div>
            </motion.div>
          )}

          {/* Services / Projects Tab */}
          {activeTab === 'services' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Projects & Services</h1>
                  <p className="text-[#f4f4f0]/60 text-sm">Manage portfolio items, images, and typologies.</p>
                </div>
                <div className="flex gap-4">
                  {hasUnsavedChanges && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSavingChanges}
                      className="border border-green-500 text-green-400 bg-green-500/10 px-6 py-2 text-xs uppercase tracking-widest hover:bg-green-500/20 transition-colors disabled:opacity-50 animate-pulse font-bold"
                    >
                      {isSavingChanges ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  )}
                  <button 
                    onClick={handleRestoreDemoData}
                    disabled={uploading}
                    className="border border-[#f4f4f0]/30 px-6 py-2 text-xs uppercase tracking-widest hover:bg-[#f4f4f0]/10 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'RESTORING...' : 'RESTORE DEMO DATA'}
                  </button>
                  <button 
                    onClick={() => {
                      setEditingProject({ img: '', title: '', desc: '', year: new Date().getFullYear().toString(), location: '', detailImages: ['', '', '', '', '', '', '', ''], showInCarousel: false });
                      setIsNewCategory(false);
                    }}
                    className="bg-[#f4f4f0] text-[#1a1a1a] px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>
              </div>

              {editingProject ? (
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111]">
                  <div className="flex justify-between items-center mb-6 border-b border-[#f4f4f0]/20 pb-4">
                    <h2 className="text-sm uppercase tracking-widest">{editingProject.id ? 'Edit Project' : 'New Project'}</h2>
                    <button onClick={() => setEditingProject(null)} className="text-[#f4f4f0]/60 hover:text-white"><X size={16}/></button>
                  </div>
                  
                  <form onSubmit={handleSaveProject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Project Title</label>
                        <input 
                          type="text" 
                          required
                          value={editingProject.title}
                          onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. ART PAVILION"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Typologies (Comma separated)</label>
                        <input 
                          type="text" 
                          required
                          value={editingProject.desc || ''}
                          onChange={e => setEditingProject({...editingProject, desc: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. COMMERCIAL, TOWER"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {existingCategories.map((cat: string) => {
                            const currentCats = editingProject.desc ? editingProject.desc.split(',').map(c => c.trim()).filter(Boolean) : [];
                            const isSelected = currentCats.includes(cat);
                            return (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => {
                                  if (isSelected) {
                                    setEditingProject({...editingProject, desc: currentCats.filter(c => c !== cat).join(', ')});
                                  } else {
                                    setEditingProject({...editingProject, desc: [...currentCats, cat].join(', ')});
                                  }
                                }}
                                className={`px-2 py-1 text-[10px] border transition-colors ${isSelected ? 'bg-[#f4f4f0] text-black border-[#f4f4f0]' : 'border-[#f4f4f0]/30 text-[#f4f4f0]/60 hover:border-[#f4f4f0]'}`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Year</label>
                        <input 
                          type="text" 
                          required
                          value={editingProject.year}
                          onChange={e => setEditingProject({...editingProject, year: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. 2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Location</label>
                        <input 
                          type="text" 
                          value={editingProject.location || ''}
                          onChange={e => setEditingProject({...editingProject, location: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. SEOUL, KR"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Status</label>
                        <input 
                          type="text" 
                          value={editingProject.status || ''}
                          onChange={e => setEditingProject({...editingProject, status: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. COMPLETED"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Client</label>
                        <input 
                          type="text" 
                          value={editingProject.client || ''}
                          onChange={e => setEditingProject({...editingProject, client: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. PRIVATE CLIENT"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Site Area</label>
                        <input 
                          type="text" 
                          value={editingProject.siteArea || ''}
                          onChange={e => setEditingProject({...editingProject, siteArea: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. 5,000 SQM"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Total Floor Area</label>
                        <input 
                          type="text" 
                          value={editingProject.totalFloorArea || ''}
                          onChange={e => setEditingProject({...editingProject, totalFloorArea: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. 12,000 SQM"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Scale (Floors)</label>
                        <input 
                          type="text" 
                          value={editingProject.scale || ''}
                          onChange={e => setEditingProject({...editingProject, scale: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. B2 / 5F"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-end gap-2 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingProject.isLogo || false}
                            onChange={e => setEditingProject({...editingProject, isLogo: e.target.checked})}
                            className="bg-transparent border-[#f4f4f0]/30"
                          />
                          <span className="text-xs uppercase tracking-widest">Is Logo / No Image?</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingProject.showInCarousel !== false}
                            onChange={e => setEditingProject({...editingProject, showInCarousel: e.target.checked})}
                            className="bg-transparent border-[#f4f4f0]/30"
                          />
                          <span className="text-xs uppercase tracking-widest">Show in 3D Carousel</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[#f4f4f0]/60 hover:text-white transition-colors">
                          <input 
                            type="checkbox" 
                            checked={editingProject.carouselOnly || false}
                            onChange={e => setEditingProject({...editingProject, carouselOnly: e.target.checked})}
                            className="bg-transparent border-[#f4f4f0]/30"
                          />
                          <span className="text-[10px] uppercase tracking-widest">Hide from Selected Works (Carousel Only)</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Project Body Content</label>
                      <textarea 
                        rows={5}
                        value={editingProject.content || ''}
                        onChange={e => setEditingProject({...editingProject, content: e.target.value})}
                        className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                        placeholder="Write the main description of the project here..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Hero Image URL</label>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={editingProject.img}
                            disabled={editingProject.isLogo}
                            onChange={e => setEditingProject({...editingProject, img: e.target.value})}
                            className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0] disabled:opacity-50"
                            placeholder="https://..."
                          />
                          <div className="mt-2 flex items-center">
                            <label className={`text-[10px] uppercase tracking-widest text-[#f4f4f0] mr-3 border border-[#f4f4f0]/30 px-3 py-1 cursor-pointer transition-colors ${editingProject.isLogo || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4f4f0] hover:text-[#1a1a1a]'}`}>
                              {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                              <input type="file" className="hidden" accept="image/*" disabled={editingProject.isLogo || uploading} onChange={(e) => handleFileUpload(e)} />
                            </label>
                            <span className="text-[10px] text-[#f4f4f0]/40">Or paste URL</span>
                          </div>
                        </div>
                        <div className="w-24 h-24 border border-[#f4f4f0]/30 flex items-center justify-center bg-[#1a1a1a] overflow-hidden shrink-0">
                          {editingProject.img && !editingProject.isLogo ? (
                            <img src={editingProject.img} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-[#f4f4f0]/20" />
                          )}
                        </div>
                      </div>
                    </div>

                    {!editingProject.isLogo && (
                      <div className="space-y-4 pt-4 border-t border-[#f4f4f0]/20">
                        <h3 className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Detail Page Images (Up to 8)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[0, 1, 2, 3, 4, 5, 6, 7].map(index => {
                            const detailImgs = editingProject.detailImages || ['', '', '', '', '', '', '', ''];
                            const url = detailImgs[index];
                            return (
                              <div key={index} className="flex gap-4 items-start border border-[#f4f4f0]/10 p-4">
                                <div className="flex-1">
                                  <input 
                                    type="text" 
                                    value={url}
                                    onChange={e => {
                                      const newImgs = [...detailImgs];
                                      newImgs[index] = e.target.value;
                                      setEditingProject({...editingProject, detailImages: newImgs});
                                    }}
                                    className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-xs focus:outline-none focus:border-[#f4f4f0]"
                                    placeholder={`Image URL ${index + 1}`}
                                  />
                                  <div className="mt-2 flex items-center">
                                    <label className={`text-[10px] uppercase tracking-widest text-[#f4f4f0] mr-3 border border-[#f4f4f0]/30 px-3 py-1 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4f4f0] hover:text-[#1a1a1a]'}`}>
                                      {uploading ? 'UPLOADING...' : 'UPLOAD'}
                                      <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={(e) => handleFileUpload(e, index)} />
                                    </label>
                                  </div>
                                </div>
                                <div className="w-16 h-16 border border-[#f4f4f0]/30 flex items-center justify-center bg-[#1a1a1a] overflow-hidden shrink-0">
                                  {url ? (
                                    <img src={url} alt={`Detail ${index + 1}`} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="text-[#f4f4f0]/20" size={14} />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!editingProject.isLogo && (
                      <div className="space-y-2 pt-4 border-t border-[#f4f4f0]/20">
                        <h3 className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60 mb-2">Project Video (Optional)</h3>
                        <div className="flex gap-4 items-start">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={editingProject.videoUrl || ''}
                              onChange={e => setEditingProject({...editingProject, videoUrl: e.target.value})}
                              className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                              placeholder="Video URL (e.g. mp4)"
                            />
                            <div className="mt-2 flex items-center">
                              <label className={`text-[10px] uppercase tracking-widest text-[#f4f4f0] mr-3 border border-[#f4f4f0]/30 px-3 py-1 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4f4f0] hover:text-[#1a1a1a]'}`}>
                                {uploading ? 'UPLOADING...' : 'UPLOAD VIDEO'}
                                <input type="file" className="hidden" accept="video/*" disabled={uploading} onChange={(e) => handleFileUpload(e, 'video')} />
                              </label>
                              {editingProject.videoUrl && (
                                <button 
                                  type="button" 
                                  onClick={() => setEditingProject({...editingProject, videoUrl: ''})}
                                  className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-3 py-1 transition-colors"
                                >
                                  REMOVE VIDEO
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="w-24 h-16 border border-[#f4f4f0]/30 flex items-center justify-center bg-[#1a1a1a] overflow-hidden shrink-0">
                            {editingProject.videoUrl ? (
                              <video src={editingProject.videoUrl} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[#f4f4f0]/20 text-[10px] uppercase">No Video</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end gap-4 border-t border-[#f4f4f0]/20">
                      <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#f4f4f0]/10 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#f4f4f0] text-[#1a1a1a] text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors">
                        <Save size={14} /> Save Project
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border border-[#f4f4f0]/20">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#f4f4f0]/20 text-[10px] uppercase tracking-widest text-[#f4f4f0]/60 bg-[#111]">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-4">Project</div>
                    <div className="col-span-3">Typology</div>
                    <div className="col-span-2">Year</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-[#f4f4f0]/10">
                    {projects.map((project, index) => (
                      <DraggableProjectRow 
                        key={project.id}
                        project={project}
                        index={index}
                        moveProject={moveProject}
                        onEdit={(project) => {
                          setEditingProject(project);
                          setIsNewCategory(false);
                        }}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Team & People</h1>
                  <p className="text-[#f4f4f0]/60 text-sm">Manage team members displayed on the People page.</p>
                </div>
                <div className="flex gap-4">
                  {hasUnsavedChanges && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSavingChanges}
                      className="border border-green-500 text-green-400 bg-green-500/10 px-6 py-2 text-xs uppercase tracking-widest hover:bg-green-500/20 transition-colors disabled:opacity-50 animate-pulse font-bold"
                    >
                      {isSavingChanges ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsEditingTeam(true);
                      setCurrentTeamMember({ name: '', role: '', img: '' });
                    }}
                    className="bg-[#f4f4f0] text-[#1a1a1a] px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                </div>
              </div>

              {isEditingTeam ? (
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111]">
                  <div className="flex justify-between items-center mb-6 border-b border-[#f4f4f0]/20 pb-4">
                    <h2 className="text-sm uppercase tracking-widest">{currentTeamMember.id ? 'Edit Member' : 'New Member'}</h2>
                    <button onClick={() => setIsEditingTeam(false)} className="text-[#f4f4f0]/60 hover:text-white"><X size={16}/></button>
                  </div>
                  
                  <form onSubmit={handleSaveTeamMember} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Name</label>
                        <input 
                          type="text" 
                          required
                          value={currentTeamMember.name || ''}
                          onChange={e => setCurrentTeamMember({...currentTeamMember, name: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. H.M. SON"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Role / Position</label>
                        <input 
                          type="text" 
                          required
                          value={currentTeamMember.role || ''}
                          onChange={e => setCurrentTeamMember({...currentTeamMember, role: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. Principal Architect"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Profile Image</label>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={currentTeamMember.img || ''}
                            onChange={e => setCurrentTeamMember({...currentTeamMember, img: e.target.value})}
                            className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                            placeholder="https://..."
                          />
                          <div className="mt-2 flex items-center">
                            <label className={`text-[10px] uppercase tracking-widest text-[#f4f4f0] mr-3 border border-[#f4f4f0]/30 px-3 py-1 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f4f4f0] hover:text-[#1a1a1a]'}`}>
                              {uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                              <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={(e) => handleFileUpload(e, 'team')} />
                            </label>
                          </div>
                        </div>
                        <div className="w-24 h-32 border border-[#f4f4f0]/30 flex items-center justify-center bg-[#1a1a1a] overflow-hidden shrink-0">
                          {currentTeamMember.img ? (
                            <img src={currentTeamMember.img} alt="Preview" className="w-full h-full object-cover grayscale mix-blend-luminosity" />
                          ) : (
                            <ImageIcon className="text-[#f4f4f0]/20" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4 border-t border-[#f4f4f0]/20">
                      <button type="button" onClick={() => setIsEditingTeam(false)} className="px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#f4f4f0]/10 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#f4f4f0] text-[#1a1a1a] text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors">
                        <Save size={14} /> Save Member
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border border-[#f4f4f0]/20">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#f4f4f0]/20 text-[10px] uppercase tracking-widest text-[#f4f4f0]/60 bg-[#111]">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-4">Name</div>
                    <div className="col-span-5">Role</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y divide-[#f4f4f0]/10">
                    {team.map((member, index) => (
                      <DraggableTeamRow 
                        key={member.id}
                        member={member}
                        index={index}
                        moveMember={moveTeamMember}
                        onEdit={(m) => {
                          setCurrentTeamMember(m);
                          setIsEditingTeam(true);
                        }}
                        onDelete={handleDeleteTeamMember}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Map Locations Tab */}
          {activeTab === 'locations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Map Locations</h1>
                  <p className="text-[#f4f4f0]/60 text-sm">Manage the pinned coordinates on the minimal map.</p>
                </div>
                <div className="flex gap-4">
                  {hasUnsavedChanges && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSavingChanges}
                      className="border border-green-500 text-green-400 bg-green-500/10 px-6 py-2 text-xs uppercase tracking-widest hover:bg-green-500/20 transition-colors disabled:opacity-50 animate-pulse font-bold"
                    >
                      {isSavingChanges ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  )}
                  <p className="text-[#f4f4f0]/60 text-sm">Manage pinned coordinates for the GLOBAL SITES section.</p>
                </div>
                <div className="flex gap-4">
                  {hasUnsavedChanges && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSavingChanges}
                      className="border border-green-500 text-green-400 bg-green-500/10 px-6 py-2 text-xs uppercase tracking-widest hover:bg-green-500/20 transition-colors disabled:opacity-50 animate-pulse font-bold"
                    >
                      {isSavingChanges ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsEditingLocation(true);
                      setCurrentLocation({ id: '', name: '', subtitle: '', category: '', coordinates: [126.9780, 37.5665], status: 'ACTIVE' });
                    }}
                    className="bg-[#f4f4f0] text-[#1a1a1a] px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Location
                  </button>
                </div>
              </div>

              {isEditingLocation ? (
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111]">
                  <div className="flex justify-between items-center mb-6 border-b border-[#f4f4f0]/20 pb-4">
                    <h2 className="text-sm uppercase tracking-widest">{currentLocation.id ? 'Edit Location' : 'New Location'}</h2>
                    <button onClick={() => setIsEditingLocation(false)} className="text-[#f4f4f0]/60 hover:text-white"><X size={16}/></button>
                  </div>
                  
                  <form onSubmit={handleSaveLocation} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Title (City)</label>
                        <input 
                          type="text" 
                          required
                          value={currentLocation.name || ''}
                          onChange={e => setCurrentLocation({...currentLocation, name: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. SEOUL"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Subtitle (Country)</label>
                        <input 
                          type="text" 
                          required
                          value={currentLocation.subtitle || ''}
                          onChange={e => setCurrentLocation({...currentLocation, subtitle: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. SOUTH KOREA"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Category</label>
                        <input 
                          type="text" 
                          value={currentLocation.category || ''}
                          onChange={e => setCurrentLocation({...currentLocation, category: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. HQ"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Status</label>
                        <input 
                          type="text" 
                          value={currentLocation.status || ''}
                          onChange={e => setCurrentLocation({...currentLocation, status: e.target.value})}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. ACTIVE"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Latitude (위도)</label>
                        <input 
                          type="number" 
                          step="any"
                          required
                          value={currentLocation.coordinates ? currentLocation.coordinates[1] : 37.5665}
                          onChange={e => setCurrentLocation({
                            ...currentLocation, 
                            coordinates: [currentLocation.coordinates ? currentLocation.coordinates[0] : 126.9780, parseFloat(e.target.value)]
                          })}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. 37.5665"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Longitude (경도)</label>
                        <input 
                          type="number" 
                          step="any"
                          required
                          value={currentLocation.coordinates ? currentLocation.coordinates[0] : 126.9780}
                          onChange={e => setCurrentLocation({
                            ...currentLocation, 
                            coordinates: [parseFloat(e.target.value), currentLocation.coordinates ? currentLocation.coordinates[1] : 37.5665]
                          })}
                          className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                          placeholder="e.g. 126.9780"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4 border-t border-[#f4f4f0]/20">
                      <button type="button" onClick={() => setIsEditingLocation(false)} className="px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#f4f4f0]/10 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#f4f4f0] text-[#1a1a1a] text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors">
                        <Save size={14} /> Save Location
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border border-[#f4f4f0]/20">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#f4f4f0]/20 text-[10px] uppercase tracking-widest text-[#f4f4f0]/60 bg-[#111]">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">Title</div>
                    <div className="col-span-2">Subtitle</div>
                    <div className="col-span-2">Coordinates</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y divide-[#f4f4f0]/10">
                    {locations.map((loc) => (
                      <div key={loc.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f4f4f0]/5 transition-colors text-sm">
                        <div className="col-span-1 text-[#f4f4f0]/40 text-xs truncate block">{loc.id}</div>
                        <div className="col-span-3 font-sans font-medium truncate">{loc.name}</div>
                        <div className="col-span-2 text-[#f4f4f0]/60 text-xs uppercase tracking-wider truncate">{loc.subtitle}</div>
                        <div className="col-span-2 text-[#f4f4f0]/60 text-xs truncate">[{loc.coordinates?.[1]?.toFixed(2)}, {loc.coordinates?.[0]?.toFixed(2)}]</div>
                        <div className="col-span-2 text-[#f4f4f0]/60 text-xs truncate">{loc.status || 'ACTIVE'}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setIsEditingLocation(true);
                              setCurrentLocation(loc);
                            }} 
                            className="p-2 hover:bg-[#f4f4f0]/20 transition-colors rounded text-[#f4f4f0]/80 hover:text-white"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 hover:bg-red-500/20 transition-colors rounded text-[#f4f4f0]/80 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {locations.length === 0 && (
                      <div className="p-8 text-center text-[#f4f4f0]/40 text-sm">
                        No locations added yet. Click "Add Location" to start.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Page Contents</h1>
                <p className="text-[#f4f4f0]/60 text-sm">Manage global text, descriptions, and contact information.</p>
              </div>

              <div className="space-y-6 max-w-3xl">
                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111] space-y-4">
                  <h3 className="text-sm uppercase tracking-widest border-b border-[#f4f4f0]/20 pb-3 mb-4">About Us Section</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Description Text</label>
                    <textarea 
                      rows={4}
                      value={pageData.about}
                      onChange={e => setPageData({...pageData, about: e.target.value})}
                      className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm font-sans focus:outline-none focus:border-[#f4f4f0] resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111] space-y-4">
                  <h3 className="text-sm uppercase tracking-widest border-b border-[#f4f4f0]/20 pb-3 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Email Address</label>
                      <input 
                        type="text" 
                        value={pageData.contactEmail}
                        onChange={e => setPageData({...pageData, contactEmail: e.target.value})}
                        className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60">Physical Address</label>
                      <input 
                        type="text" 
                        value={pageData.address}
                        onChange={e => setPageData({...pageData, address: e.target.value})}
                        className="w-full bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111] space-y-4">
                  <h3 className="text-sm uppercase tracking-widest border-b border-[#f4f4f0]/20 pb-3 mb-4">Category Management & Order</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#f4f4f0]/60 mb-4">Drag to reorder categories. The order here determines the display order on the homepage. Deleting a category here will not remove it from existing projects.</p>
                  
                  <div className="flex flex-col gap-1 mb-4">
                    {existingCategories.map((cat, index) => (
                      <DraggableCategoryRow 
                        key={cat} 
                        category={cat} 
                        index={index} 
                        moveCategory={moveCategory} 
                        onDelete={(category) => {
                          const newCats = existingCategories.filter(c => c !== category);
                          setPageData({...pageData, customCategories: newCats});
                          setHasUnsavedChanges(true);
                        }} 
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="newCustomCategory"
                      className="flex-1 bg-transparent border border-[#f4f4f0]/30 px-3 py-2 text-sm focus:outline-none focus:border-[#f4f4f0]"
                      placeholder="e.g. EXHIBITION"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const val = input.value.trim().toUpperCase();
                          if (val && !existingCategories.includes(val)) {
                            setPageData({...pageData, customCategories: [...existingCategories, val]});
                            setHasUnsavedChanges(true);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newCustomCategory') as HTMLInputElement;
                        const val = input.value.trim().toUpperCase();
                        if (val && !existingCategories.includes(val)) {
                          setPageData({...pageData, customCategories: [...existingCategories, val]});
                          setHasUnsavedChanges(true);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 border border-[#f4f4f0]/30 text-xs hover:bg-[#f4f4f0]/10 transition-colors uppercase"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-[#f4f4f0]/20 bg-[#111] space-y-4">
                  <h3 className="text-sm uppercase tracking-widest border-b border-[#f4f4f0]/20 pb-3 mb-4">Client Logos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(pageData.clientLogos || []).map((logoUrl, index) => (
                      <div key={index} className="relative w-full aspect-[3/2] border border-[#f4f4f0]/20 bg-[#1a1a1a] flex items-center justify-center p-2 group">
                        <img src={logoUrl} alt={`Client Logo ${index + 1}`} className="w-full h-full object-contain filter invert" />
                        <button 
                          onClick={() => {
                            const newLogos = [...(pageData.clientLogos || [])];
                            newLogos.splice(index, 1);
                            setPageData({...pageData, clientLogos: newLogos});
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <div className="w-full aspect-[3/2] border border-dashed border-[#f4f4f0]/30 flex flex-col items-center justify-center gap-2 hover:bg-[#f4f4f0]/5 transition-colors cursor-pointer">
                      <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                        <Plus size={20} className="text-[#f4f4f0]/40" />
                        <span className="text-[9px] uppercase tracking-widest text-[#f4f4f0]/40 mt-1">
                          {uploading ? 'UPLOADING...' : 'ADD LOGO'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={(e) => handleFileUpload(e, 'clientLogo')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSavePageData} className="flex items-center gap-2 px-6 py-3 bg-[#f4f4f0] text-[#1a1a1a] text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors">
                    <Save size={14} /> Save Page Contents
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </motion.div>
  );
}