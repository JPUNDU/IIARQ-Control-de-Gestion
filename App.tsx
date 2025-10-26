
import React, { useState, useEffect } from 'react';
import { Project, BankStatement, Allocations, Client, UploadedFile } from './types';
import TransactionAllocator from './components/TransactionAllocator';
import ProjectManager from './components/ProjectManager';
import FileManager from './components/FileManager';
import ClientManager from './components/ClientManager';
import UserManagement from './components/UserManagement';
import { AllocationIcon, ClientIcon, FileUploadIcon, ProjectIcon, UserAdminIcon, LogoutIcon } from './components/icons';
import { useAuth } from './hooks/useAuth';
import { useFirestoreCollection } from './hooks/useFirestoreCollection';
import { db } from './firebase';
import { collection, doc, writeBatch, setDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';


type View = 'allocations' | 'projects' | 'files' | 'clients' | 'users';

const initialProjects: Omit<Project, 'id'>[] = [
    { displayId: '115', name: 'Casa Palma Irarrázaval', location: 'Paseo Alcalá, Lo Barnechea', status: 'Propuesta' },
    { displayId: '131', name: 'Casa Pirque IO', location: 'Virginia Subercaseaux 3400', status: 'Propuesta' },
    { displayId: '008', name: 'Casa Mujica Perez Canto', location: 'Lo Arcaya, Pirque', status: 'Propuesta' },
    { displayId: '009', name: 'Patio Toro Labbe', location: 'Las Nevadas, Providencia', status: 'Propuesta' },
    { displayId: '010', name: 'Quincho Radrigan Seisdedos', location: 'Puente de Piedra, Lo Barnechea', status: 'Propuesta' },
    { displayId: '011', name: 'Casa Sofia Labra', location: 'Las Lavandulas, Las Condes', status: 'Propuesta' },
    { displayId: '012', name: 'Casa del Solar Schaap', location: 'Puerta de Hierro, Lo Barnechea', status: 'Propuesta' },
    { displayId: '013', name: 'Casa Javiera Ketterer', location: 'Quinta Hamburgo, Ñuñoa', status: 'Propuesta' },
    { displayId: '014', name: 'Condominio CFV', location: 'Contralmirante Fernández Vial, Lo Barnechea', status: 'Propuesta' },
    { displayId: '015', name: 'Casa Carmen Bilbeny', location: 'Camino a Farellones', status: 'Propuesta' },
    { displayId: '016', name: 'Proyecto Mujica Perez Canto', location: 'Lo Arcaya, Pirque', status: 'Propuesta' },
    { displayId: '017', name: 'Padre Ariztía', location: 'Padre Ariztía, Vitacura', status: 'Propuesta' },
    { displayId: '018', name: 'Casa IFS', location: 'Walker Martinez, La Florida', status: 'Propuesta' },
    { displayId: '019', name: 'SUITE Isidora', location: 'Fundo lo Aguirre, Talagante', status: 'Propuesta' },
    { displayId: '020', name: 'Quincho TS (Torretti Sepulveda)', location: 'Campanario 341, Las Condes', status: 'Propuesta' },
    { displayId: '021', name: 'Quincho GV (García Villagra)', location: 'Camino El Alba, Las Condes', status: 'Propuesta' },
];


const App: React.FC = () => {
  const { user, loading, role, login, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('projects');
  
  // Replace useLocalStorage with Firestore hooks
  const { data: projects } = useFirestoreCollection<Project>('projects');
  const { data: clients } = useFirestoreCollection<Client>('clients');
  const { data: allocationsData } = useFirestoreCollection<any>('allocations');
  const { data: statements } = useFirestoreCollection<BankStatement>('bankStatements');
  const { data: files } = useFirestoreCollection<UploadedFile>('uploads');

  const allocations: Allocations = React.useMemo(() => {
    return allocationsData.reduce((acc, curr) => {
        acc[curr.id] = curr.allocation;
        return acc;
    }, {} as Allocations)
  }, [allocationsData]);


  // Data seeding for initial setup
  useEffect(() => {
    const seedInitialProjects = async () => {
        const projectsCol = collection(db, 'projects');
        const snapshot = await getDocs(projectsCol);
        if (snapshot.empty && role) { // Only seed if collection is empty and user is logged in
            console.log('Seeding initial projects...');
            const batch = writeBatch(db);
            initialProjects.forEach(projectData => {
                const docRef = doc(projectsCol); // Firestore generates ID
                batch.set(docRef, projectData);
            });
            await batch.commit();
            console.log('Initial projects seeded.');
        }
    };
    seedInitialProjects();
  }, [role]); // Run once when user role is determined

  // CRUD functions for Firestore
  const setProjects = {
    add: (project: Omit<Project, 'id'>) => addDoc(collection(db, 'projects'), project),
    update: (project: Project) => {
        const { id, ...data } = project;
        return setDoc(doc(db, 'projects', id), data);
    },
    delete: (id: string) => deleteDoc(doc(db, 'projects', id)),
  };

  const setClients = {
    add: (client: Omit<Client, 'id'>) => addDoc(collection(db, 'clients'), client),
    update: (client: Client) => {
        const { id, ...data } = client;
        return setDoc(doc(db, 'clients', id), data);
    },
    delete: (id: string) => deleteDoc(doc(db, 'clients', id)),
  };

  const NavButton = ({ view, label, icon }: { view: View, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeView === view
          ? 'bg-brand-highlight text-white'
          : 'text-gray-300 hover:bg-brand-accent hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
  
  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-brand-primary text-white">Cargando...</div>;
  }

  if (!user) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-primary">
            <h1 className="text-3xl font-bold text-white mb-2">
                <span className="text-brand-highlight">IIArq</span> Control de Gestión
            </h1>
            <p className="text-gray-400 mb-8">Por favor, inicie sesión para continuar.</p>
            <button onClick={login} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                Sign in with Google
            </button>
        </div>
    );
  }

  if (!role) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center bg-brand-primary p-4">
              <h1 className="text-2xl font-bold text-white mb-2">Acceso Pendiente</h1>
              <p className="text-gray-400 max-w-md mb-8">
                  Tu cuenta ({user.email}) está esperando aprobación de un administrador. Por favor, contacta a Isidora para obtener acceso.
              </p>
              <button onClick={logout} className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 font-semibold">
                  Logout
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <header className="bg-brand-secondary shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-white">
                        <span className="text-brand-highlight">IIArq</span> Control de Gestión
                    </h1>
                </div>
                <nav className="flex items-center space-x-2">
                    <NavButton view="allocations" label="Asignaciones" icon={<AllocationIcon />} />
                    <NavButton view="projects" label="Proyectos" icon={<ProjectIcon />} />
                    <NavButton view="clients" label="Clientes" icon={<ClientIcon />} />
                    <NavButton view="files" label="Archivos" icon={<FileUploadIcon />} />
                    {role === 'admin' && <NavButton view="users" label="Usuarios" icon={<UserAdminIcon />} />}
                    <button onClick={logout} title="Logout" className="p-2 text-gray-400 hover:text-white"><LogoutIcon /></button>
                </nav>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'allocations' && <TransactionAllocator statements={statements.sort((a, b) => new Date(a.period.from.split('-').reverse().join('-')).getTime() - new Date(b.period.from.split('-').reverse().join('-')).getTime())} projects={projects} allocations={allocations} />}
        {activeView === 'projects' && <ProjectManager projects={projects} setProjects={setProjects} clients={clients} />}
        {activeView === 'clients' && <ClientManager clients={clients} setClients={setClients} />}
        {activeView === 'files' && <FileManager uploadedFiles={files} />}
        {activeView === 'users' && role === 'admin' && <UserManagement />}
      </main>
      
      <footer className="bg-brand-secondary mt-8 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Isidora Irarrázaval Arquitectura. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
